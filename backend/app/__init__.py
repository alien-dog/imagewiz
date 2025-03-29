from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Initialize extensions
db = SQLAlchemy()
jwt = JWTManager()
bcrypt = Bcrypt()

def create_app():
    app = Flask(__name__, static_folder='static')
    
    # Configure the app
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'mysql+pymysql://root:Ir%86241992@8.130.113.102/mat_db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your-secret-key-for-jwt')
    app.config['UPLOAD_FOLDER'] = os.path.join(app.static_folder, 'uploads')
    
    # Initialize extensions with app
    CORS(app)
    db.init_app(app)
    jwt.init_app(app)
    bcrypt.init_app(app)
    
    # Ensure upload directory exists
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    # Register blueprints
    from app.auth.routes import auth_bp
    from app.matting.routes import matting_bp
    from app.payment.routes import payment_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(matting_bp, url_prefix='/api/matting')
    app.register_blueprint(payment_bp, url_prefix='/api/payment')
    
    # Simple route for testing
    @app.route('/')
    def index():
        return {'message': 'Welcome to iMagenWiz API!'}
    
    return app