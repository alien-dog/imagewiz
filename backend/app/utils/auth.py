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
        
        # For now, we can add a simple check
        # In a real application, you would have an 'is_admin' field on the user model
        if not user or user.id != 1:  # Assume user ID 1 is the admin
            return jsonify({'success': False, 'message': 'Admin access required'}), 403
        
        return fn(*args, **kwargs)
    
    return wrapper