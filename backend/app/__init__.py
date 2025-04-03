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
            """Redirect payment success to the Express server - with improved handling"""
            try:
                # Get all query parameters to preserve them in redirect
                query_params = request.args.to_dict()
                
                # Check for session_id which is crucial for verifying payment
                session_id = query_params.get('session_id')
                if not session_id:
                    app.logger.error("Payment success redirect without session_id")
                
                # Get host information from headers
                host = request.headers.get('Host')
                app.logger.info(f"Payment redirect received with host: {host}")
                
                # Determine if we're on Replit deployment
                replit_match = re.match(r'(.*?)\.replit\.dev', host)
                
                # Build the redirect URL without port specification
                if replit_match:
                    # Use HTTPS protocol without port for Replit
                    base_url = f"https://{host}"
                else:
                    # For local development, use HTTP with port 3000
                    base_url = f"http://{host}:3000"
                
                # Prevent redirect loops by checking for loop indicators
                loop_count = int(query_params.get('_redirect_count', 0))
                
                # If we detect a potential loop (3+ redirects), send to Express directly
                if loop_count >= 2:
                    app.logger.warning(f"Detected potential redirect loop (count: {loop_count}), redirecting to Express")
                    # Maintain the session_id for payment verification
                    if session_id:
                        redirect_url = f"{base_url}/payment-success?session_id={session_id}"
                    else:
                        redirect_url = f"{base_url}/dashboard"
                    
                    app.logger.info(f"Emergency redirect to Express: {redirect_url}")
                    return redirect(redirect_url, code=302)
                
                # Increment the redirect counter for loop detection
                query_params['_redirect_count'] = str(loop_count + 1)
                
                # Construct base redirect URL
                redirect_url = f"{base_url}/payment-success"
                
                # Add all query parameters
                if query_params:
                    query_string = "&".join([f"{k}={v}" for k, v in query_params.items()])
                    redirect_url += f"?{query_string}"
                
                # Log the redirect info
                app.logger.info(f"Redirecting payment success: {redirect_url}")
                app.logger.info(f"Redirect count: {loop_count + 1}")
                
                return redirect(redirect_url, code=302)
            except Exception as e:
                app.logger.error(f"Error in payment success redirect: {str(e)}")
                # Log the exception for debugging
                app.logger.error(f"Payment redirect error: {str(e)}")
                
                # Emergency fallback - redirect to root instead of dashboard to avoid 404
                host = request.headers.get('Host')
                return redirect(f"https://{host}/", code=302)
            
        # Add a similar redirect for other frontend routes commonly accessed directly
        # Dashboard routes are now handled by Express directly
        # No need for Flask to redirect, removing this route to prevent redirect loops
            
        @app.route('/pricing')
        def handle_pricing_redirect():
            """Redirect pricing to the Express server"""
            host = request.headers.get('Host')
            replit_match = re.match(r'(.*?)\.replit\.dev', host)
            
            if replit_match:
                redirect_url = f"https://{host}/pricing"
                print(f"Redirecting pricing to: {redirect_url}")
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
                
                # Special case for dashboard - always redirect to Express
                if path == '/dashboard' or path.startswith('/dashboard/'):
                    host = request.headers.get('Host')
                    replit_match = re.match(r'(.*?)\.replit\.dev', host)
                    
                    if replit_match:
                        redirect_url = f"https://{host}/dashboard"
                    else:
                        redirect_url = f"http://{host}:3000/dashboard"
                    
                    app.logger.info(f"404 dashboard redirect to Express: {redirect_url}")
                    return redirect(redirect_url, code=302)
                
                # If this looks like a frontend route, redirect to Express server
                elif path.startswith('/payment') or path == '/pricing' or path == '/login':
                    host = request.headers.get('Host')
                    replit_match = re.match(r'(.*?)\.replit\.dev', host)
                    
                    if replit_match:
                        redirect_url = f"https://{host}{path}"
                        print(f"404 handler redirecting to: {redirect_url}")
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