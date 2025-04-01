from flask import Blueprint

bp = Blueprint('payment', __name__, url_prefix='/payment')

# Import the routes
from . import routes

# Import and register the mock routes
try:
    from .mock_routes import mock_bp
    
    # The URLs will be under /payment/mock/...
    mock_bp.url_prefix = '/mock'
    bp.register_blueprint(mock_bp)
    
    print("DEBUG: Mock payment routes registered")
except ImportError as e:
    print(f"DEBUG: Mock payment routes not available: {e}")

# Import and register the diagnostic routes
try:
    from .diagnostic import diag_bp
    
    # The URLs will be under /payment/diag/...
    diag_bp.url_prefix = '/diag'
    bp.register_blueprint(diag_bp)
    
    print("DEBUG: Payment diagnostic routes registered")
except ImportError as e:
    print(f"DEBUG: Payment diagnostic routes not available: {e}")