from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.models import User, RechargeHistory, db
import time

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
        user.credit_balance += credit_amount
        
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