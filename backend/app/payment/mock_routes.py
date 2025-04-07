from flask import Blueprint, jsonify, request, current_app, url_for
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.models import User, RechargeHistory, db
import time
import uuid

# Creating a separate blueprint for mock routes to keep the original routes intact
mock_bp = Blueprint('mock_payment', __name__)

@mock_bp.route('/mock-payment-intent', methods=['POST'])
@jwt_required()
def mock_create_payment_intent():
    """Create a mock payment intent for testing without Stripe API"""
    user_id = get_jwt_identity()
    try:
        user_id = int(user_id)
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid user ID"}), 400
        
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json()
    priceId = data.get("priceId")
    packageName = data.get("packageName") 
    isYearly = data.get("isYearly", False)
    
    if not packageName or not priceId:
        return jsonify({"error": "Package name and price ID are required"}), 400
    
    # Generate a deterministic client secret based on user info and timestamp
    # This is just for testing and is NOT secure for production
    timestamp = int(time.time())
    mock_client_secret = f"mock_pi_{user.id}_{timestamp}_secret"
    
    # Determine amount based on package
    amount_cents = 0
    if "lite" in packageName.lower():
        amount_cents = 990 if not isYearly else 10680  # $9.90 or $106.80
    elif "pro" in packageName.lower():
        amount_cents = 2490 if not isYearly else 26280  # $24.90 or $262.80
    else:
        print(f"ERROR: Unknown package: {packageName}")
        return jsonify({"error": "Unknown package"}), 400
    
    print(f"Creating MOCK payment intent for {user.username}, package: {packageName}, amount: ${amount_cents/100}")
    
    # Add mock credits to user's account for testing
    credit_amount = 0
    if "lite" in packageName.lower():
        credit_amount = 50 if not isYearly else 600
    elif "pro" in packageName.lower():
        credit_amount = 250 if not isYearly else 3000
        
    # Record the mock payment
    try:
        # Add credits
        user.credits += credit_amount
        
        # Create payment record
        payment = RechargeHistory(
            user_id=user.id,
            amount=amount_cents/100,
            credit_gained=credit_amount,
            payment_status="completed",
            payment_method="mock_stripe",
            stripe_payment_id=f"mock_pi_{timestamp}"
        )
        db.session.add(payment)
        db.session.commit()
        
        print(f"Added {credit_amount} credits to {user.username} for mock payment")
    except Exception as e:
        db.session.rollback()
        print(f"Error recording mock payment: {e}")
    
    return jsonify({
        "clientSecret": mock_client_secret,
        "amount": amount_cents / 100,
        "mockPayment": True,
        "creditAmount": credit_amount
    })

@mock_bp.route('/mock-create-checkout-session', methods=['POST'])
@jwt_required()
def mock_create_checkout_session():
    """Create a mock checkout session for testing without Stripe API"""
    user_id = get_jwt_identity()
    try:
        user_id = int(user_id)
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid user ID"}), 400
        
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    data = request.get_json()
    package_id = data.get('package_id')
    is_yearly = data.get('is_yearly', False)
    price = data.get('price', 0)
    
    if not package_id:
        return jsonify({"error": "Package ID is required"}), 400
    
    # Generate a unique session ID for testing
    session_id = f"cs_test_{uuid.uuid4().hex}"
    
    # Create a mock success URL with the session ID
    # Extract base URL from current request
    host = request.headers.get('Host', 'localhost:3000')
    protocol = 'https' if request.is_secure else 'http'
    base_url = f"{protocol}://{host}"
    
    # Construct success URL for redirection
    success_url = f"{base_url}/payment-success?session_id={session_id}"
    
    # Determine credit amount based on package
    credit_amount = 0
    if "lite" in package_id.lower():
        credit_amount = 50 if not is_yearly else 600
    elif "pro" in package_id.lower():
        credit_amount = 250 if not is_yearly else 3000
    
    # Record mock payment
    try:
        # Add credits to user account
        user.credits += credit_amount
        
        # Create payment record
        payment = RechargeHistory(
            user_id=user.id,
            amount=price,
            credit_gained=credit_amount,
            payment_status="completed",
            payment_method="mock_stripe",
            stripe_payment_id=session_id,
            is_yearly=is_yearly,
            package_id=package_id
        )
        db.session.add(payment)
        db.session.commit()
        
        print(f"Added {credit_amount} credits to {user.username} for mock checkout session")
    except Exception as e:
        db.session.rollback()
        print(f"Error recording mock checkout: {e}")
    
    # Return a mock session URL that redirects to our success page
    return jsonify({
        "url": success_url,
        "mockPayment": True,
        "session_id": session_id
    })
    
@mock_bp.route('/verify-mock-session', methods=['GET'])
@jwt_required()
def verify_mock_session():
    """Verify a mock checkout session for testing"""
    user_id = get_jwt_identity()
    try:
        user_id = int(user_id)
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid user ID"}), 400
        
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
        
    # Get session ID from query parameters
    session_id = request.args.get('session_id')
    if not session_id:
        return jsonify({"error": "No session_id provided"}), 400
        
    # Check if this is a mock session ID
    if not session_id.startswith('cs_test_'):
        return jsonify({"error": "Invalid mock session ID format"}), 400
        
    # Find a payment record with this session ID
    payment = RechargeHistory.query.filter_by(
        user_id=user.id, 
        stripe_payment_id=session_id,
        payment_status="completed"
    ).first()
    
    if payment:
        # Payment record found, return success
        return jsonify({
            "status": "success", 
            "message": "Mock payment verified",
            "user": user.to_dict(),
            "payment": {
                "id": payment.id,
                "amount": float(payment.amount),
                "credit_gained": payment.credit_gained,
                "created_at": payment.created_at.isoformat()
            },
            "mockPayment": True
        }), 200
    
    # No payment record found with this session ID
    return jsonify({
        "status": "error",
        "message": "No payment found with this session ID"
    }), 404

@mock_bp.route('/verify-mock-intent/<payment_intent_id>', methods=['GET'])
@jwt_required()
def verify_mock_payment(payment_intent_id):
    """Verify a mock payment for testing"""
    user_id = get_jwt_identity()
    try:
        user_id = int(user_id)
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid user ID"}), 400
        
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    # Extract information from the mock payment ID
    parts = payment_intent_id.split('_')
    if len(parts) >= 3 and parts[0] == 'mock' and parts[1] == 'pi':
        timestamp = parts[2]
        
        # For mock payments, we've already processed the payment when creating the intent
        # So we just return success info
        return jsonify({
            "status": "success", 
            "message": "Mock payment verified",
            "user": user.to_dict(),
            "mockPayment": True
        }), 200
    
    return jsonify({"error": "Invalid mock payment ID"}), 400