from flask import Blueprint, jsonify, current_app
import os
import stripe
import time

# Create a blueprint for diagnostic routes
diag_bp = Blueprint('payment_diagnostics', __name__)

@diag_bp.route('/stripe-key-status', methods=['GET'])
def check_stripe_key():
    """Check if Stripe key is configured and accessible"""
    try:
        # Check if environment variable exists
        stripe_key = os.environ.get('STRIPE_SECRET_KEY')
        
        key_status = {
            'exists': stripe_key is not None,
            'length': len(stripe_key) if stripe_key else 0,
            'prefix': stripe_key[:7] + '...' if stripe_key else None,
            'configured_in_app': hasattr(stripe, 'api_key') and stripe.api_key is not None and len(stripe.api_key) > 0
        }
        
        return jsonify({
            'status': 'success',
            'timestamp': time.time(),
            'key_status': key_status
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@diag_bp.route('/stripe-connect-test', methods=['GET'])
def test_stripe_connection():
    """Test connection to Stripe API with a simple request"""
    try:
        print("Testing Stripe API connection...")
        start_time = time.time()
        
        # The simplest API request to test connectivity
        result = stripe.Customer.list(limit=1)
        
        end_time = time.time()
        duration_ms = (end_time - start_time) * 1000
        
        return jsonify({
            'status': 'success',
            'message': 'Successfully connected to Stripe API',
            'response_time_ms': duration_ms,
            'has_data': len(result.data) > 0
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500