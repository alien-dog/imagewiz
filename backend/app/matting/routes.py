import os
import uuid
from flask import request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from app.models.models import User, MattingHistory
from app import db
from app.matting import matting_bp
from app.matting.service import process_image, generate_unique_filename

# Allowed file extensions
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    """Check if the file has an allowed extension"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@matting_bp.route('/process', methods=['POST'])
@jwt_required()
def process_matting():
    """Process an image to remove background"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Check if user has enough credits
    if user.credit_balance < 1:
        return jsonify({'error': 'Insufficient credits'}), 400
    
    # Check if request has the file part
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    
    # Check if file is selected
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file and allowed_file(file.filename):
        # Generate secure and unique filenames
        secure_name = secure_filename(file.filename)
        original_filename = generate_unique_filename(secure_name)
        processed_filename = f"processed_{original_filename}"
        
        # Create absolute paths
        original_path = os.path.join(current_app.config['UPLOAD_FOLDER'], original_filename)
        processed_path = os.path.join(current_app.config['UPLOAD_FOLDER'], processed_filename)
        
        # Save the original file
        file.save(original_path)
        
        # Process the image
        success = process_image(original_path, processed_path)
        
        if not success:
            return jsonify({'error': 'Failed to process image'}), 500
        
        # Calculate relative URLs
        static_url_path = '/static/uploads/'
        original_url = static_url_path + original_filename
        processed_url = static_url_path + processed_filename
        
        # Create a matting history record
        matting = MattingHistory(
            user_id=user.id,
            original_image_url=original_url,
            processed_image_url=processed_url,
            credit_spent=1
        )
        
        # Deduct credits
        user.credit_balance -= 1
        
        # Save to database
        db.session.add(matting)
        db.session.commit()
        
        return jsonify({
            'message': 'Image processed successfully',
            'original_url': original_url,
            'processed_url': processed_url,
            'credits_remaining': user.credit_balance,
            'matting_id': matting.id
        }), 200
    
    return jsonify({'error': 'File type not allowed'}), 400


@matting_bp.route('/history', methods=['GET'])
@jwt_required()
def get_history():
    """Get user's matting history"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Get matting history
    mattings = MattingHistory.query.filter_by(user_id=user.id).order_by(MattingHistory.created_at.desc()).all()
    
    history = [matting.to_dict() for matting in mattings]
    
    return jsonify({
        'history': history,
        'count': len(history)
    }), 200


@matting_bp.route('/history/<int:id>', methods=['GET'])
@jwt_required()
def get_matting_detail(id):
    """Get a specific matting detail"""
    user_id = get_jwt_identity()
    
    # Get matting record
    matting = MattingHistory.query.get(id)
    
    if not matting:
        return jsonify({'error': 'Matting record not found'}), 404
    
    # Security check: ensure user can only access their own records
    if matting.user_id != user_id:
        return jsonify({'error': 'Unauthorized access'}), 403
    
    return jsonify({
        'matting': matting.to_dict()
    }), 200