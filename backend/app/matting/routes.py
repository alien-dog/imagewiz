import os
import uuid
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from app.models.models import User, MattingHistory, db
from app.matting.service import process_image
from app.utils.auth import admin_required

matting_bp = Blueprint('matting', __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@matting_bp.route('/process', methods=['POST'])
@jwt_required()
def process_matting():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'success': False, 'message': 'User not found'}), 404
        
    # Check if user has enough credits
    if user.credit_balance < 1:
        return jsonify({'success': False, 'message': 'Insufficient credits'}), 403
    
    # Check if file is in the request
    if 'image' not in request.files:
        return jsonify({'success': False, 'message': 'No image file provided'}), 400
        
    file = request.files['image']
    
    # Check if file is valid
    if file.filename == '':
        return jsonify({'success': False, 'message': 'No image selected'}), 400
        
    if not allowed_file(file.filename):
        return jsonify({'success': False, 'message': 'File type not allowed'}), 400
    
    # Save the original image
    filename = secure_filename(file.filename)
    unique_filename = f"{uuid.uuid4()}_{filename}"
    original_path = os.path.join(current_app.config['UPLOAD_FOLDER'], unique_filename)
    file.save(original_path)
    
    # Process the image (background removal, etc.)
    processed_filename = f"processed_{unique_filename}"
    processed_path = os.path.join(current_app.config['UPLOAD_FOLDER'], processed_filename)
    
    # This function would implement the actual image processing
    process_success = process_image(original_path, processed_path)
    
    if not process_success:
        return jsonify({'success': False, 'message': 'Failed to process image'}), 500
    
    # Create relative URLs for the images
    original_url = f"/static/uploads/{unique_filename}"
    processed_url = f"/static/uploads/{processed_filename}"
    
    # Create matting record
    matting = MattingHistory(
        user_id=user.id,
        original_image_url=original_url,
        processed_image_url=processed_url,
        credit_spent=1
    )
    
    # Deduct credits from user
    user.credit_balance -= 1
    
    # Save to database
    db.session.add(matting)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Image processed successfully',
        'matting': matting.to_dict(),
        'remaining_credits': user.credit_balance
    }), 200

@matting_bp.route('/history', methods=['GET'])
@jwt_required()
def get_history():
    user_id = get_jwt_identity()
    
    # Get user's matting history
    history = MattingHistory.query.filter_by(user_id=user_id).order_by(MattingHistory.created_at.desc()).all()
    
    return jsonify({
        'success': True,
        'history': [item.to_dict() for item in history]
    }), 200

@matting_bp.route('/history/<int:id>', methods=['GET'])
@jwt_required()
def get_matting_detail(id):
    user_id = get_jwt_identity()
    
    # Get the matting record
    matting = MattingHistory.query.filter_by(id=id, user_id=user_id).first()
    
    if not matting:
        return jsonify({'success': False, 'message': 'Record not found or access denied'}), 404
    
    return jsonify({
        'success': True,
        'matting': matting.to_dict()
    }), 200