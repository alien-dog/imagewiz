"""
Script to create an admin user in the database.
Run this script manually after setting up the application.

Usage:
python -m app.create-admin
"""

from app import create_app, db
from app.models.models import User

def create_admin_user():
    app = create_app()
    
    with app.app_context():
        # Check if admin already exists
        admin = User.query.filter_by(username='admin').first()
        
        if admin:
            print("Admin user already exists!")
            return
        
        # Create admin user
        admin = User(username='admin')
        admin.set_password('admin123')  # Change this to a secure password
        admin.credit_balance = 9999  # Give admin plenty of credits
        
        db.session.add(admin)
        db.session.commit()
        
        print("Admin user created successfully!")

if __name__ == '__main__':
    create_admin_user()