from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token,
    get_jwt_identity,
    jwt_required
)
from app.models.models import User, db

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Validate input
    if not data or 'username' not in data or 'password' not in data:
        return jsonify({'success': False, 'message': 'Missing username or password'}), 400
        
    # Check if username already exists
    existing_user = User.query.filter_by(username=data['username']).first()
    if existing_user:
        return jsonify({'success': False, 'message': 'Username already exists'}), 400
        
    # Create new user
    new_user = User(username=data['username'])
    new_user.set_password(data['password'])
    
    # Save user to database
    db.session.add(new_user)
    db.session.commit()
    
    # Generate JWT token
    access_token = create_access_token(identity=new_user.id)
    
    return jsonify({
        'success': True,
        'user': new_user.to_dict(),
        'access_token': access_token,
        'expires_in': 3600
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    # Validate input
    if not data or 'username' not in data or 'password' not in data:
        return jsonify({'success': False, 'message': 'Missing username or password'}), 400
        
    # Check credentials
    user = User.query.filter_by(username=data['username']).first()
    if not user or not user.check_password(data['password']):
        return jsonify({'success': False, 'message': 'Invalid username or password'}), 401
        
    # Generate JWT token
    access_token = create_access_token(identity=user.id)
    
    return jsonify({
        'success': True,
        'user': user.to_dict(),
        'access_token': access_token,
        'expires_in': 3600
    }), 200

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'success': False, 'message': 'User not found'}), 404
        
    return jsonify({
        'success': True,
        'user': user.to_dict()
    }), 200