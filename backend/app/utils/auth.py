from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt_identity
from app.models.models import User

def admin_required(fn):
    """Decorator to require admin access for a route"""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        # In this example, we don't have an admin flag in the User model
        # For a real application, you might want to add an is_admin field
        # For now, we'll just use a simple check (e.g., admin is user with ID 1)
        if not user or user.id != 1:
            return jsonify({'error': 'Admin access required'}), 403
        
        return fn(*args, **kwargs)
    
    return wrapper