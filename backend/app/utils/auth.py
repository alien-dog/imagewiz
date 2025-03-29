from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt_identity
from app.models.models import User

def admin_required(fn):
    """Decorator to require admin access for a route"""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        # Get user identity from JWT
        current_user_id = get_jwt_identity()
        
        # Get user from database
        user = User.query.get(current_user_id)
        
        # Check if user exists and is an admin
        if not user or not user.is_admin:
            return jsonify({"error": "Admin access required"}), 403
            
        # User is admin, proceed with the route function
        return fn(*args, **kwargs)
        
    return wrapper