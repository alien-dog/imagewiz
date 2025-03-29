"""
Script to create an admin user in the database.
Run this script manually after setting up the application.

Usage:
python -m app.create-admin
"""

import os
import sys
import getpass
from flask import Flask
from dotenv import load_dotenv
from app import db, bcrypt
from app.models.models import User

# Load environment variables
load_dotenv()

def create_admin_user():
    """Create an admin user if it doesn't already exist"""
    
    # Check if admin user already exists
    admin = User.query.filter_by(is_admin=True).first()
    if admin:
        print(f"Admin user already exists: {admin.username}")
        while True:
            response = input("Do you want to create another admin user? (y/n): ").lower()
            if response in ["y", "yes"]:
                break
            elif response in ["n", "no"]:
                return
            else:
                print("Please enter 'y' or 'n'")
    
    # Get admin username
    username = input("Enter admin username: ")
    
    # Check if username already exists
    existing_user = User.query.filter_by(username=username).first()
    if existing_user:
        print(f"User '{username}' already exists.")
        return
    
    # Get password (hidden input)
    password = getpass.getpass("Enter admin password: ")
    password_confirm = getpass.getpass("Confirm admin password: ")
    
    if password != password_confirm:
        print("Passwords do not match.")
        return
    
    # Create the admin user
    admin_user = User(username=username, is_admin=True, credit_balance=999)
    admin_user.set_password(password)
    
    db.session.add(admin_user)
    db.session.commit()
    
    print(f"Admin user '{username}' created successfully!")

if __name__ == "__main__":
    # Create a minimal Flask app
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Initialize database
    db.init_app(app)
    bcrypt.init_app(app)
    
    with app.app_context():
        create_admin_user()