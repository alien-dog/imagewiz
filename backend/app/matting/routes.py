import os
import json
from flask import request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from app.models.models import User, MattingHistory
from app import db
from . import bp
from .service import process_image, generate_unique_filename

# Helper function to check if a file has an allowed extension
def allowed_file(filename):
    """Check if the file has an allowed extension"""
    allowed_extensions = current_app.config.get('ALLOWED_EXTENSIONS', 'png,jpg,jpeg,webp').split(',')
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_extensions

@bp.route('/process', methods=['POST'])
@jwt_required()
def process_matting():
    """Process an image to remove background"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    # Check if user has enough credits
    if user.credit_balance < 1:
        return jsonify({"error": "Insufficient credits. Please recharge your account."}), 402
    
    # Check if file part exists in request
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400
    
    file = request.files['file']
    
    # Check if a file was selected
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400
    
    # Check if file is allowed
    if not allowed_file(file.filename):
        return jsonify({"error": "File type not allowed"}), 400
    
    # Create secure filenames
    original_filename = secure_filename(file.filename)
    unique_original = generate_unique_filename(original_filename)
    unique_processed = f"processed_{unique_original}"
    
    # Save original file
    original_path = os.path.join(current_app.config['UPLOAD_FOLDER'], unique_original)
    file.save(original_path)
    
    # Process image
    processed_path = os.path.join(current_app.config['PROCESSED_FOLDER'], unique_processed)
    success = process_image(original_path, processed_path)
    
    if not success:
        return jsonify({"error": "Failed to process image"}), 500
    
    # Generate URLs for the images
    host = request.host_url.rstrip('/')
    original_url = f"{host}/uploads/{unique_original}"
    processed_url = f"{host}/processed/{unique_processed}"
    
    # Deduct credit from user
    user.credit_balance -= 1
    
    # Record the matting history
    history = MattingHistory(
        user_id=user.id,
        original_image_url=original_url,
        processed_image_url=processed_url,
        credit_spent=1
    )
    
    db.session.add(history)
    db.session.commit()
    
    return jsonify({
        "message": "Image processed successfully",
        "original_image": original_url,
        "processed_image": processed_url,
        "credits_remaining": user.credit_balance,
        "history_id": history.id
    }), 200

@bp.route('/history', methods=['GET'])
@jwt_required()
def get_history():
    """Get user's matting history"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    # Get history entries for the user
    history = MattingHistory.query.filter_by(user_id=user.id).order_by(MattingHistory.created_at.desc()).all()
    
    return jsonify({
        "history": [entry.to_dict() for entry in history]
    }), 200

@bp.route('/history/<int:id>', methods=['GET'])
@jwt_required()
def get_matting_detail(id):
    """Get a specific matting detail"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    # Get the specific history entry
    history = MattingHistory.query.filter_by(id=id, user_id=user.id).first()
    
    if not history:
        return jsonify({"error": "Matting history not found or not authorized"}), 404
    
    return jsonify(history.to_dict()), 200