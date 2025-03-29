import os
import json
import stripe
from flask import request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.models import User, RechargeHistory
from app import db
from . import bp

# Credit package options
CREDIT_PACKAGES = [
    {
        "id": "basic",
        "name": "Basic",
        "credits": 50,
        "price": 5.99,
        "currency": "usd",
        "description": "50 credits for removing background from images"
    },
    {
        "id": "standard",
        "name": "Standard",
        "credits": 125,
        "price": 12.99,
        "currency": "usd",
        "description": "125 credits for removing background from images"
    },
    {
        "id": "premium",
        "name": "Premium",
        "credits": 300,
        "price": 24.99,
        "currency": "usd",
        "description": "300 credits for removing background from images"
    },
    {
        "id": "professional",
        "name": "Professional",
        "credits": 700,
        "price": 49.99,
        "currency": "usd",
        "description": "700 credits for removing background from images"
    }
]

@bp.route('/packages', methods=['GET'])
def get_packages():
    """Get all available credit packages"""
    return jsonify({
        "packages": CREDIT_PACKAGES
    }), 200

@bp.route('/create-checkout-session', methods=['POST'])
@jwt_required()
def create_checkout_session():
    """Create a Stripe checkout session for credit purchase"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    data = request.get_json()
    package_id = data.get('package_id')
    
    # Find the selected package
    package = next((p for p in CREDIT_PACKAGES if p['id'] == package_id), None)
    if not package:
        return jsonify({"error": "Invalid package selected"}), 400
    
    # Create Stripe session
    try:
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[
                {
                    'price_data': {
                        'currency': package['currency'],
                        'product_data': {
                            'name': package['name'],
                            'description': package['description'],
                        },
                        'unit_amount': int(package['price'] * 100),  # Convert to cents
                    },
                    'quantity': 1,
                },
            ],
            mode='payment',
            success_url=request.json.get('success_url', request.host_url),
            cancel_url=request.json.get('cancel_url', request.host_url),
            metadata={
                'user_id': user.id,
                'package_id': package_id,
                'credits': package['credits'],
                'price': package['price']
            }
        )
        
        return jsonify({
            'id': checkout_session.id,
            'url': checkout_session.url
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.route('/webhook', methods=['POST'])
def webhook():
    """Handle Stripe webhook events"""
    payload = request.get_data(as_text=True)
    sig_header = request.headers.get('Stripe-Signature')
    
    try:
        # Verify webhook signature and extract event
        # In production, use a webhook secret for verification
        # event = stripe.Webhook.construct_event(payload, sig_header, webhook_secret)
        event = stripe.Event.construct_from(
            json.loads(payload), stripe.api_key
        )
    except ValueError as e:
        # Invalid payload
        return jsonify({"error": "Invalid payload"}), 400
    except stripe.error.SignatureVerificationError as e:
        # Invalid signature
        return jsonify({"error": "Invalid signature"}), 400
    
    # Handle the checkout.session.completed event
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        handle_successful_payment(session)
    
    return jsonify({"status": "success"}), 200

def handle_successful_payment(session):
    """Process a successful payment and add credits to user"""
    # Get metadata from the session
    user_id = session.get('metadata', {}).get('user_id')
    package_id = session.get('metadata', {}).get('package_id')
    credits = int(session.get('metadata', {}).get('credits', 0))
    price = float(session.get('metadata', {}).get('price', 0))
    
    # Find the user
    user = User.query.get(user_id)
    if not user:
        print(f"Error: User {user_id} not found for payment {session.id}")
        return
    
    # Add credits to user's balance
    user.credit_balance += credits
    
    # Record the recharge history
    recharge = RechargeHistory(
        user_id=user.id,
        amount=price,
        credit_gained=credits,
        payment_status='completed',
        payment_method='stripe',
        stripe_payment_id=session.id
    )
    
    db.session.add(recharge)
    db.session.commit()
    
    print(f"User {user.username} recharged {credits} credits for ${price}")

@bp.route('/verify-payment/<session_id>', methods=['GET'])
@jwt_required()
def verify_payment(session_id):
    """Verify a payment and return updated user data"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    # Check if payment exists in user's history
    recharge = RechargeHistory.query.filter_by(
        user_id=user.id,
        stripe_payment_id=session_id
    ).first()
    
    if not recharge:
        # Try to retrieve session from Stripe
        try:
            session = stripe.checkout.Session.retrieve(session_id)
            if session.payment_status == 'paid' and str(session.metadata.user_id) == str(user.id):
                # Payment successful but not recorded yet, process it
                handle_successful_payment(session)
                return jsonify({
                    "status": "success", 
                    "message": "Payment verified and credits added",
                    "user": user.to_dict()
                }), 200
            else:
                return jsonify({"error": "Payment not completed or unauthorized"}), 400
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    
    return jsonify({
        "status": "success",
        "message": "Payment already verified",
        "user": user.to_dict()
    }), 200

@bp.route('/history', methods=['GET'])
@jwt_required()
def get_history():
    """Get user's payment history"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    # Get history entries for the user
    history = RechargeHistory.query.filter_by(user_id=user.id).order_by(RechargeHistory.created_at.desc()).all()
    
    return jsonify({
        "history": [entry.to_dict() for entry in history]
    }), 200