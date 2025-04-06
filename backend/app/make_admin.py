"""
Script to make a user an admin in the database.
Run this script manually after setting up the application.

Usage:
python -m app.make_admin <username>
"""

import sys
from app import create_app, db
from app.models.models import User

def make_user_admin(username):
    """Make a user an admin if they exist"""
    app = create_app()
    with app.app_context():
        user = User.query.filter_by(username=username).first()
        if not user:
            print(f"User {username} not found")
            return False
        
        user.is_admin = True
        db.session.commit()
        print(f"User {username} is now an admin")
        return True

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python -m app.make_admin <username>")
        sys.exit(1)
    
    username = sys.argv[1]
    success = make_user_admin(username)
    sys.exit(0 if success else 1)