"""
Script to create an admin user in the database.
Run this script manually after setting up the application.

Usage:
python -m app.create-admin
"""

import os
import sys
import getpass
from datetime import datetime

from flask import Flask
from dotenv import load_dotenv
from app import db, bcrypt
from app.models.models import User

def create_admin_user():
    """Create an admin user if it doesn't already exist"""
    # Check if an admin already exists
    admin = User.query.filter_by(is_admin=True).first()
    
    if admin:
        print(f"Admin user already exists: {admin.username}")
        create_another = input("Do you want to create another admin user? (y/n): ").lower()
        if create_another != 'y':
            return
    
    # Get admin details
    username = input("Enter admin username: ")
    
    # Check if username already exists
    existing_user = User.query.filter_by(username=username).first()
    if existing_user:
        print(f"User '{username}' already exists.")
        return
    
    # Get password securely (not echoed to terminal)
    password = getpass.getpass("Enter admin password: ")
    confirm_password = getpass.getpass("Confirm password: ")
    
    if password != confirm_password:
        print("Passwords do not match.")
        return
    
    if len(password) < 8:
        print("Password must be at least 8 characters long.")
        return
    
    # Create admin user
    try:
        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
        admin = User(
            username=username,
            password=hashed_password,
            is_admin=True,
            credits=1000,  # Give admin a starting balance
            created_at=datetime.utcnow()
        )
        
        db.session.add(admin)
        db.session.commit()
        
        print(f"Admin user '{username}' created successfully!")
    except Exception as e:
        db.session.rollback()
        print(f"Error creating admin user: {str(e)}")

if __name__ == "__main__":
    app = Flask(__name__)
    
    # Load environment variables
    load_dotenv()
    
    # Configure the application
    from urllib.parse import quote_plus
    password = quote_plus(os.environ.get('DB_PASSWORD', ''))
    app.config['SQLALCHEMY_DATABASE_URI'] = f"mysql+pymysql://{os.environ.get('DB_USER')}:{password}@{os.environ.get('DB_HOST')}/{os.environ.get('DB_NAME')}"
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    with app.app_context():
        create_admin_user()