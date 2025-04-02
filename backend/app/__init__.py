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
        # Special route to handle the payment-success redirect from Stripe
        @app.route('/payment-success')
        def handle_payment_success():
            """Redirect payment success to the Express server"""
            # Get the query parameters
            session_id = request.args.get('session_id')
            
            # In production environments, determine the proper frontend host
            host = request.headers.get('Host')
            
            # Extract the base domain - pattern matching for replit.dev domains
            base_domain = host
            replit_match = re.match(r'(.*?)\.replit\.dev', host)
            
            if replit_match:
                # For replit domain, redirect to port 443 (HTTPS)
                redirect_url = f"https://{host}:443/payment-success"
            else:
                # For other environments, redirect to port 3000
                redirect_url = f"http://{host}:3000/payment-success"
                
            # Include any query parameters in the redirect
            if session_id:
                redirect_url += f"?session_id={session_id}"
                
            app.logger.info(f"Redirecting payment success from Flask to Express: {redirect_url}")
            return redirect(redirect_url, code=302)
            
        # Add a similar redirect for other frontend routes commonly accessed directly
        @app.route('/dashboard')
        def handle_dashboard_redirect():
            """Redirect dashboard to the Express server"""
            host = request.headers.get('Host')
            replit_match = re.match(r'(.*?)\.replit\.dev', host)
            
            if replit_match:
                redirect_url = f"https://{host}:443/dashboard"
            else:
                redirect_url = f"http://{host}:3000/dashboard"
                
            app.logger.info(f"Redirecting dashboard from Flask to Express: {redirect_url}")
            return redirect(redirect_url, code=302)
            
        @app.route('/pricing')
        def handle_pricing_redirect():
            """Redirect pricing to the Express server"""
            host = request.headers.get('Host')
            replit_match = re.match(r'(.*?)\.replit\.dev', host)
            
            if replit_match:
                redirect_url = f"https://{host}:443/pricing"
            else:
                redirect_url = f"http://{host}:3000/pricing"
                
            app.logger.info(f"Redirecting pricing from Flask to Express: {redirect_url}")
            return redirect(redirect_url, code=302)
            
        @app.errorhandler(Exception)
        def handle_exception(e):
            """Return JSON instead of HTML for HTTP errors."""
            # Check if this is a 404 for a frontend route that should be redirected
            if isinstance(e, HTTPException) and e.code == 404:
                path = request.path
                # If this looks like a frontend route, redirect to Express server
                if path.startswith('/payment') or path == '/dashboard' or path == '/pricing' or path == '/login':
                    host = request.headers.get('Host')
                    replit_match = re.match(r'(.*?)\.replit\.dev', host)
                    
                    if replit_match:
                        redirect_url = f"https://{host}:443{path}"
                    else:
                        redirect_url = f"http://{host}:3000{path}"
                        
                    # Include query string if any
                    if request.query_string:
                        redirect_url += f"?{request.query_string.decode('utf-8')}"
                        
                    app.logger.info(f"404 redirect from Flask to Express: {redirect_url}")
                    return redirect(redirect_url, code=302)
            
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