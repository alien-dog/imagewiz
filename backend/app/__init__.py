import os
from flask import Flask, send_from_directory, jsonify, redirect, request, Response
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
    # Use PostgreSQL database from DATABASE_URL
    from urllib.parse import quote_plus
    
    # Get the DATABASE_URL from environment variables
    database_url = os.environ.get('DATABASE_URL')
    
    if database_url:
        print(f"Using DATABASE_URL for PostgreSQL connection")
        app.config['SQLALCHEMY_DATABASE_URI'] = database_url
    else:
        # Fallback to direct PostgreSQL configuration
        pg_user = os.environ.get('PGUSER', 'postgres')
        pg_password = quote_plus(os.environ.get('PGPASSWORD', ''))
        pg_host = os.environ.get('PGHOST', 'localhost')
        pg_db = os.environ.get('PGDATABASE', 'postgres')
        pg_port = os.environ.get('PGPORT', '5432')
        
        print(f"Connecting to PostgreSQL: {pg_user}@{pg_host}:{pg_port}/{pg_db}")
        
        # Configure connection with SSL mode
        app.config['SQLALCHEMY_DATABASE_URI'] = f'postgresql://{pg_user}:{pg_password}@{pg_host}:{pg_port}/{pg_db}'
    
    # Add connection pool settings separately
    app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
        'pool_recycle': 3600,
        'pool_pre_ping': True
    }
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
    
    # Set server's external URL for image processing responses
    replit_domain = os.environ.get('REPLIT_DOMAIN')
    if replit_domain:
        app.config['SERVER_EXTERNAL_URL'] = f"https://{replit_domain}"
    else:
        # Get the hostname from the app config
        app.config['SERVER_EXTERNAL_URL'] = os.environ.get('SERVER_EXTERNAL_URL')
        
    if app.config['SERVER_EXTERNAL_URL']:
        app.logger.info(f"Using external URL for image links: {app.config['SERVER_EXTERNAL_URL']}")
    
    # Initialize extensions with app
    db.init_app(app)
    jwt.init_app(app)
    bcrypt.init_app(app)
    
    # Enable CORS for all routes
    CORS(app, resources={r"/*": {"origins": "*"}})
    
    with app.app_context():
        # Import models
        from .models.models import User, RechargeHistory, MattingHistory
        # Import CMS models
        from .models.cms import Post, PostTranslation, PostMedia, Tag, Language
        
        # Create tables
        db.create_all()
        
        # Initialize default language (English) if no languages exist
        default_language = Language.query.first()
        if not default_language:
            try:
                english = Language(code='en', name='English', is_default=True, is_active=True)
                db.session.add(english)
                db.session.commit()
                app.logger.info("Added default English language")
            except Exception as e:
                app.logger.error(f"Error adding default language: {e}")
        
        # Run database migrations for new columns
        try:
            # Migrate recharge_history table first
            from .utils.migrate_recharge_history import run_migration as migrate_recharge_history
            
            # Execute the migration to add required columns
            recharge_migration_result = migrate_recharge_history()
            if recharge_migration_result:
                app.logger.info("Database migration for recharge_history columns completed successfully")
            else:
                app.logger.warning("Database migration for recharge_history failed, payments may have limited functionality")
                
            # Run user credits migration
            from .utils.migrate_user_credits import run_migration as migrate_user_credits
            
            # Execute the migration to add credits column to users table
            user_migration_result = migrate_user_credits()
            if user_migration_result:
                app.logger.info("Database migration for users table credits column completed successfully")
            else:
                app.logger.warning("Database migration for users table credits column failed, payment verification may fail")
            
            # Run auto-translation fields migration for CMS
            from .utils.migrate_auto_translation import run_migration as migrate_auto_translation
            
            # Execute the migration to add auto-translation fields
            auto_translation_result = migrate_auto_translation()
            if auto_translation_result:
                app.logger.info("Database migration for CMS auto-translation fields completed successfully")
            else:
                app.logger.warning("Database migration for CMS auto-translation fields failed, auto-translation may not work properly")
                
        except Exception as e:
            app.logger.error(f"Error running database migrations: {e}")
            # Log error details for troubleshooting
            import traceback
            app.logger.error(traceback.format_exc())
        
        # Register blueprints
        from .auth import bp as auth_bp
        app.register_blueprint(auth_bp)
        
        from .matting import bp as matting_bp
        app.register_blueprint(matting_bp)
        
        from .payment import bp as payment_bp
        app.register_blueprint(payment_bp)
        
        # Register order confirmation blueprint
        from .payment.order_confirmation import order_bp as order_confirmation_bp
        from .payment.order_confirmation import api_bp as api_order_confirmation_bp
        app.register_blueprint(order_confirmation_bp)
        app.register_blueprint(api_order_confirmation_bp)
        
        # Register CMS blueprint
        from .cms import bp as cms_bp
        app.register_blueprint(cms_bp)
        
        # Static file routes
        @app.route('/api/uploads/<filename>')
        def serve_upload(filename):
            """Serve uploaded files"""
            return send_from_directory(os.path.abspath(app.config['UPLOAD_FOLDER']), filename)
            
        @app.route('/api/uploads/cms/<filename>')
        def serve_cms_upload(filename):
            """Serve CMS uploaded files"""
            cms_folder = os.path.join(app.config['UPLOAD_FOLDER'], 'cms')
            return send_from_directory(os.path.abspath(cms_folder), filename)
            
        @app.route('/static/uploads/blog/<path:filename>')
        def serve_blog_upload(filename):
            """Serve blog uploaded files from static folder"""
            app.logger.info(f"Serving blog image: {filename}")
            blog_folder = os.path.join(app.static_folder, 'uploads', 'blog')
            app.logger.info(f"Blog folder path: {blog_folder}")
            return send_from_directory(os.path.abspath(blog_folder), filename)
            
        @app.route('/api/processed/<filename>')
        def serve_processed(filename):
            """Serve processed files"""
            return send_from_directory(os.path.abspath(app.config['PROCESSED_FOLDER']), filename)
            
        @app.route('/images/placeholder-image.svg')
        @app.route('/api/images/placeholder-image.svg')
        def serve_placeholder_image():
            """Serve placeholder image SVG for missing images"""
            app.logger.info("Serving placeholder SVG image")
            placeholder_svg = '''<?xml version="1.0" encoding="UTF-8"?>
<svg width="400" height="300" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="300" fill="#f0f0f0"/>
  <text x="200" y="150" font-family="Arial, sans-serif" font-size="20" text-anchor="middle" fill="#888888">Image Not Found</text>
  <path d="M200,100 L175,150 L225,150 Z" fill="#888888"/>
  <rect x="175" y="150" width="50" height="50" fill="#888888"/>
</svg>'''
            return Response(placeholder_svg, mimetype='image/svg+xml')
            
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
                    "/api/order-confirmation",
                    "/api/matting/process",
                    "/api/matting/history",
                    "/api/cms/blog",
                    "/api/cms/posts",
                    "/api/cms/tags",
                    "/api/cms/languages"
                ]
            })
            
        # Health check routes
        @app.route('/api/health')
        def health_check():
            """Return a simple health check response"""
            return jsonify({"status": "ok", "message": "iMagenWiz API is running"})
            
        # Additional health check route without /api prefix - for proxy compatibility
        @app.route('/health')
        def health_check_no_prefix():
            """Return the same health check response for a non-prefixed route"""
            app.logger.info("Health check called without /api prefix")
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