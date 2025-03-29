"""
Simple script to test if the Flask server can run.
This is just for debugging purposes.
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Print environment variables for debugging
print("Environment variables:")
print(f"DB_HOST: {os.environ.get('DB_HOST')}")
print(f"DB_USER: {os.environ.get('DB_USER')}")
print(f"DB_NAME: {os.environ.get('DB_NAME')}")
print(f"STRIPE_SECRET_KEY exists: {'Yes' if os.environ.get('STRIPE_SECRET_KEY') else 'No'}")
print(f"JWT_SECRET_KEY exists: {'Yes' if os.environ.get('JWT_SECRET_KEY') else 'No'}")

# Try to import Flask app
try:
    print("\nTrying to import the Flask app...")
    from app import create_app
    
    # Create the Flask application instance
    app = create_app()
    print("Successfully created Flask app!")
    
    # Just print routes for debugging
    print("\nRegistered routes:")
    for rule in app.url_map.iter_rules():
        print(f"{rule.endpoint}: {rule.rule} [{', '.join(rule.methods)}]")
        
except Exception as e:
    print(f"\nError creating Flask app: {str(e)}")
    
print("\nTest completed.")