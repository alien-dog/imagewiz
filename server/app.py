from flask import Flask, request, redirect, session, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, logout_user, current_user
from flask_cors import CORS
import os
import requests
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, supports_credentials=True)

# Validate required environment variables
required_env_vars = ['SESSION_SECRET', 'DATABASE_URL']
missing_vars = [var for var in required_env_vars if not os.environ.get(var)]
if missing_vars:
    logger.error(f"Missing required environment variables: {', '.join(missing_vars)}")
    raise RuntimeError(f"Missing required environment variables: {', '.join(missing_vars)}")

# Configure app
app.config['SECRET_KEY'] = os.environ.get('SESSION_SECRET')
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
login_manager = LoginManager()
login_manager.init_app(app)

# User model
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    credits = db.Column(db.Integer, default=3)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Google OAuth callback route
@app.route('/callback.html')
def google_callback():
    access_token = request.args.get('access_token')
    if not access_token:
        logger.error("No access token provided")
        return redirect('/auth?error=no_token')

    try:
        # Get user info from Google
        userinfo_response = requests.get(
            'https://www.googleapis.com/oauth2/v2/userinfo',
            headers={'Authorization': f'Bearer {access_token}'}
        )
        userinfo_response.raise_for_status()
        userinfo = userinfo_response.json()

        email = userinfo.get('email')
        if not email:
            logger.error("No email in Google response")
            return redirect('/auth?error=no_email')

        # Use email as username
        username = email.split('@')[0]

        # Check if user exists
        user = User.query.filter_by(username=username).first()
        if not user:
            # Create new user
            user = User(
                username=username,
                password=f"google_{datetime.utcnow().timestamp()}"  # Secure random password
            )
            db.session.add(user)
            db.session.commit()
            logger.info(f"Created new user: {username}")

        # Log user in
        login_user(user)
        logger.info(f"Logged in user: {username}")
        return redirect('/dashboard')

    except requests.exceptions.RequestException as e:
        logger.error(f"Google API error: {str(e)}")
        return redirect('/auth?error=auth_failed')
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return redirect('/auth?error=auth_failed')

@app.route('/api/user')
def get_user():
    if not current_user.is_authenticated:
        return jsonify({"message": "Not authenticated"}), 401

    return jsonify({
        "id": current_user.id,
        "username": current_user.username,
        "credits": current_user.credits
    })

@app.route('/api/logout', methods=['POST'])
def logout():
    logout_user()
    return '', 200

@app.route('/health')
def health_check():
    try:
        # Test database connection
        db.session.execute(db.select(User).limit(1))
        return jsonify({"status": "healthy"}), 200
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return jsonify({"status": "unhealthy", "error": str(e)}), 500

@app.errorhandler(500)
def internal_error(error):
    logger.error(f"Internal server error: {str(error)}")
    return jsonify({"error": "Internal server error"}), 500

@app.errorhandler(404)
def not_found_error(error):
    return jsonify({"error": "Not found"}), 404

if __name__ == '__main__':
    with app.app_context():
        try:
            db.create_all()
            logger.info("Database tables created successfully")
        except Exception as e:
            logger.error(f"Database initialization error: {str(e)}")

    app.run(host='0.0.0.0', port=5000)