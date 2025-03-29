import os
import json
import stripe
from flask import request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.models import User, RechargeHistory
from app import db
from app.payment import payment_bp

# Configure Stripe
stripe.api_key = os.getenv('STRIPE_SECRET_KEY')
stripe_publishable_key = os.getenv('STRIPE_PUBLISHABLE_KEY')

# Credit package options
CREDIT_PACKAGES = [
    {
        'id': 'basic',
        'name': 'Basic',
        'credits': 50,
        'price': 4.99,
        'description': 'Basic credit package with 50 credits'
    },
    {
        'id': 'standard',
        'name': 'Standard',
        'credits': 150,
        'price': 9.99,
        'description': 'Standard credit package with 150 credits'
    },
    {
        'id': 'premium',
        'name': 'Premium',
        'credits': 500,
        'price': 24.99,
        'description': 'Premium credit package with 500 credits'
    }
]


@payment_bp.route('/packages', methods=['GET'])
def get_packages():
    """Get all available credit packages"""
    return jsonify({
        'packages': CREDIT_PACKAGES,
        'stripe_key': stripe_publishable_key
    }), 200


@payment_bp.route('/create-checkout-session', methods=['POST'])
@jwt_required()
def create_checkout_session():
    """Create a Stripe checkout session for credit purchase"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    data = request.get_json()
    
    if not data or not data.get('package_id'):
        return jsonify({'error': 'Package ID is required'}), 400
    
    # Find the selected package
    selected_package = None
    for package in CREDIT_PACKAGES:
        if package['id'] == data['package_id']:
            selected_package = package
            break
    
    if not selected_package:
        return jsonify({'error': 'Invalid package ID'}), 400
    
    try:
        # Create a checkout session
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[
                {
                    'price_data': {
                        'currency': 'usd',
                        'product_data': {
                            'name': f"{selected_package['name']} Credit Package",
                            'description': f"{selected_package['credits']} Credits for iMagenWiz",
                        },
                        'unit_amount': int(selected_package['price'] * 100),  # Stripe uses cents
                    },
                    'quantity': 1,
                }
            ],
            mode='payment',
            success_url=request.host_url + 'payment/success?session_id={CHECKOUT_SESSION_ID}',
            cancel_url=request.host_url + 'payment/cancel',
            metadata={
                'user_id': user.id,
                'package_id': selected_package['id'],
                'credits': selected_package['credits']
            }
        )
        
        return jsonify({
            'session_id': checkout_session.id,
            'checkout_url': checkout_session.url
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@payment_bp.route('/webhook', methods=['POST'])
def webhook():
    """Handle Stripe webhook events"""
    payload = request.get_data()
    sig_header = request.headers.get('Stripe-Signature')
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, os.getenv('STRIPE_WEBHOOK_SECRET')
        )
        
    except ValueError:
        return jsonify({'error': 'Invalid payload'}), 400
    except stripe.error.SignatureVerificationError:
        return jsonify({'error': 'Invalid signature'}), 400
    
    # Handle the event
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        handle_successful_payment(session)
    
    return jsonify({'status': 'success'}), 200


def handle_successful_payment(session):
    """Process a successful payment and add credits to user"""
    user_id = session.get('metadata', {}).get('user_id')
    package_id = session.get('metadata', {}).get('package_id')
    credits = session.get('metadata', {}).get('credits')
    
    if not user_id or not package_id or not credits:
        print("Missing metadata in Stripe session")
        return
    
    # Get the user
    user = User.query.get(int(user_id))
    if not user:
        print(f"User {user_id} not found")
        return
    
    # Find the package details
    selected_package = None
    for package in CREDIT_PACKAGES:
        if package['id'] == package_id:
            selected_package = package
            break
    
    if not selected_package:
        print(f"Package {package_id} not found")
        return
    
    # Add credits to user's balance
    user.credit_balance += int(credits)
    
    # Record the transaction
    recharge = RechargeHistory(
        user_id=user.id,
        amount=selected_package['price'],
        credit_gained=selected_package['credits'],
        payment_status='completed',
        payment_method='stripe',
        stripe_payment_id=session.get('id')
    )
    
    db.session.add(recharge)
    db.session.commit()
    
    print(f"Successfully added {credits} credits to user {user_id}")


@payment_bp.route('/verify-payment/<session_id>', methods=['GET'])
@jwt_required()
def verify_payment(session_id):
    """Verify a payment and return updated user data"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    try:
        # Retrieve the session from Stripe
        session = stripe.checkout.Session.retrieve(session_id)
        
        # Verify that this session is for this user
        if session.get('metadata', {}).get('user_id') != str(user_id):
            return jsonify({'error': 'Unauthorized access'}), 403
        
        # Check if payment was successful
        if session.get('payment_status') == 'paid':
            return jsonify({
                'status': 'success',
                'user': user.to_dict()
            }), 200
        else:
            return jsonify({
                'status': 'pending',
                'message': 'Payment is still being processed'
            }), 202
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@payment_bp.route('/history', methods=['GET'])
@jwt_required()
def get_history():
    """Get user's payment history"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Get payment history
    payments = RechargeHistory.query.filter_by(user_id=user.id).order_by(RechargeHistory.created_at.desc()).all()
    
    history = [payment.to_dict() for payment in payments]
    
    return jsonify({
        'history': history,
        'count': len(history)
    }), 200