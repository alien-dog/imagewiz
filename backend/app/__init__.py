import os
from flask import Flask, send_from_directory, jsonify, redirect, request
from datetime import timedelta
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
from werkzeug.exceptions import HTTPException
from flask_cors import CORS
import stripe
import re

# Initialize extensions
db = SQLAlchemy()
jwt = JWTManager()
bcrypt = Bcrypt()

# Initialize Stripe API key
stripe.api_key = os.environ.get('STRIPE_SECRET_KEY')

def create_app():
    """Initialize the core application."""
    app = Flask(__name__, static_folder='static')
    
    # Configure the application
    # Use MySQL database with credentials from .env using quote_plus for password
    from urllib.parse import quote_plus
    mysql_user = os.environ.get('DB_USER')
    mysql_password = quote_plus(os.environ.get('DB_PASSWORD', ''))
    mysql_host = os.environ.get('DB_HOST')
    mysql_db = os.environ.get('DB_NAME')
    app.config['SQLALCHEMY_DATABASE_URI'] = f'mysql+pymysql://{mysql_user}:{mysql_password}@{mysql_host}/{mysql_db}'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(
        seconds=int(os.environ.get('JWT_ACCESS_TOKEN_EXPIRES', 86400))
    )
    
    # Set up upload folders
    app.config['UPLOAD_FOLDER'] = os.environ.get('UPLOAD_FOLDER', 'app/static/uploads')
    app.config['PROCESSED_FOLDER'] = os.environ.get('PROCESSED_FOLDER', 'app/static/processed')
    
    # Check for upload directories and create if they don't exist
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    os.makedirs(app.config['PROCESSED_FOLDER'], exist_ok=True)
    
    # Initialize extensions with app
    db.init_app(app)
    jwt.init_app(app)
    bcrypt.init_app(app)
    
    # Enable CORS for all routes
    CORS(app, resources={r"/*": {"origins": "*"}})
    
    with app.app_context():
        # Import models
        from .models.models import User, RechargeHistory, MattingHistory
        
        # Create tables
        db.create_all()
        
        # Register blueprints
        from .auth import bp as auth_bp
        app.register_blueprint(auth_bp)
        
        from .matting import bp as matting_bp
        app.register_blueprint(matting_bp)
        
        from .payment import bp as payment_bp
        app.register_blueprint(payment_bp)
        
        # Static file routes
        @app.route('/api/uploads/<filename>')
        def serve_upload(filename):
            """Serve uploaded files"""
            return send_from_directory(os.path.abspath(app.config['UPLOAD_FOLDER']), filename)
            
        @app.route('/api/processed/<filename>')
        def serve_processed(filename):
            """Serve processed files"""
            return send_from_directory(os.path.abspath(app.config['PROCESSED_FOLDER']), filename)
            
        # API root route only - no more root route in Flask
        @app.route('/api')
        def api_index():
            """Return API root route response"""
            return jsonify({"status": "ok", "message": "iMagenWiz API is running"})
            
        # Just serve API info on root route instead of redirecting
        @app.route('/')
        def root_route():
            """Return API info at root"""
            return jsonify({
                "status": "ok", 
                "message": "iMagenWiz API is running. Please use the web interface at port 3000 to access the application.",
                "api_version": "1.0",
                "endpoints": [
                    "/api/auth/login", 
                    "/api/auth/register",
                    "/api/auth/user",
                    "/api/payment/packages",
                    "/api/matting/process",
                    "/api/matting/history"
                ]
            })
            
        # Health check route
        @app.route('/api/health')
        def health_check():
            """Return a simple health check response"""
            return jsonify({"status": "ok", "message": "iMagenWiz API is running"})
            
        # Error handler for all exceptions
        # Payment-success is no longer handled by Flask at all
        # We now use /payment-success-direct in Stripe which goes directly to Express
        # Instead of having a Flask route, we'll just ensure the 404 handler catches these URLs
            
        # Add a similar redirect for other frontend routes commonly accessed directly
        # Dashboard routes are now handled by Express directly
        # No need for Flask to redirect, removing this route to prevent redirect loops
            
        @app.route('/pricing')
        def handle_pricing_redirect():
            """Return JSON response for pricing route"""
            app.logger.info("Pricing page request received at Flask - should be handled by Express")
            return jsonify({
                "error": "Not Found",
                "message": "The pricing page should be accessed via the Express server at port 3000, not directly through the Flask API",
                "status": 404
            }), 404
            
        @app.errorhandler(Exception)
        def handle_exception(e):
            """Return JSON instead of HTML for HTTP errors."""
            # Check if this is a 404 for a frontend route
            if isinstance(e, HTTPException) and e.code == 404:
                path = request.path
                
                # Instead of redirecting dashboard routes, return a JSON response indicating 
                # this is a frontend route that should be handled by Express
                if path == '/dashboard' or path.startswith('/dashboard/'):
                    app.logger.info(f"404 for dashboard route: {path}")
                    return jsonify({
                        "error": "Not Found",
                        "message": "This route should be accessed via the Express server, not directly through the Flask API",
                        "status": 404
                    }), 404
                
                # For other frontend routes, also return a JSON response instead of redirecting
                elif (not path.startswith('/payment') and not path.startswith('/api/payment')
                      and (path == '/pricing' or path == '/login')):
                    app.logger.info(f"404 for frontend route: {path}")
                    return jsonify({
                        "error": "Not Found",
                        "message": "This route should be accessed via the Express server, not directly through the Flask API",
                        "status": 404
                    }), 404
            
            if isinstance(e, HTTPException):
                response = {
                    "code": e.code,
                    "name": e.name,
                    "description": e.description,
                }
                status_code = e.code
            else:
                # Handle non-HTTP exceptions
                response = {
                    "code": 500,
                    "name": "Internal Server Error",
                    "description": str(e),
                }
                status_code = 500
                
            app.logger.error(f"Error: {e}")
            return jsonify(response), status_code
            
        return app