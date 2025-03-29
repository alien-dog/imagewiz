import os
import stripe
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.models import User, RechargeHistory, db
from app.utils.auth import admin_required

payment_bp = Blueprint('payment', __name__)

# Initialize Stripe with API key
stripe.api_key = os.environ.get('STRIPE_SECRET_KEY')

# Credit package prices
CREDIT_PACKAGES = {
    'basic': {'credits': 10, 'price': 10.00},
    'standard': {'credits': 50, 'price': 40.00},
    'premium': {'credits': 100, 'price': 70.00},
    'enterprise': {'credits': 500, 'price': 300.00},
}

@payment_bp.route('/packages', methods=['GET'])
def get_packages():
    """Get all available credit packages"""
    return jsonify({
        'success': True,
        'packages': CREDIT_PACKAGES
    }), 200

@payment_bp.route('/create-checkout-session', methods=['POST'])
@jwt_required()
def create_checkout_session():
    """Create a Stripe checkout session for credit purchase"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'success': False, 'message': 'User not found'}), 404
    
    data = request.get_json()
    
    # Validate input
    if not data or 'package_id' not in data:
        return jsonify({'success': False, 'message': 'Missing package ID'}), 400
    
    package_id = data['package_id']
    
    # Check if package exists
    if package_id not in CREDIT_PACKAGES:
        return jsonify({'success': False, 'message': 'Invalid package ID'}), 400
    
    package = CREDIT_PACKAGES[package_id]
    
    try:
        # Create Stripe checkout session
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[
                {
                    'price_data': {
                        'currency': 'usd',
                        'product_data': {
                            'name': f'{package_id.capitalize()} Credit Package - {package["credits"]} Credits',
                        },
                        'unit_amount': int(package['price'] * 100),  # Stripe uses cents
                    },
                    'quantity': 1,
                },
            ],
            mode='payment',
            success_url=request.headers.get('Origin', '') + f'/payment/success?session_id={{CHECKOUT_SESSION_ID}}',
            cancel_url=request.headers.get('Origin', '') + '/payment/cancel',
            client_reference_id=str(user.id),
            metadata={
                'user_id': user.id,
                'package_id': package_id,
                'credits': package['credits'],
            },
        )
        
        # Return checkout URL to client
        return jsonify({
            'success': True,
            'checkout_url': checkout_session.url,
            'session_id': checkout_session.id
        }), 200
    
    except Exception as e:
        print(f"Error creating checkout session: {e}")
        return jsonify({'success': False, 'message': 'Failed to create checkout session'}), 500

@payment_bp.route('/webhook', methods=['POST'])
def webhook():
    """Handle Stripe webhook events"""
    payload = request.get_data(as_text=True)
    sig_header = request.headers.get('Stripe-Signature')
    
    try:
        # Verify webhook signature
        event = stripe.Webhook.construct_event(
            payload, sig_header, os.environ.get('STRIPE_WEBHOOK_SECRET', '')
        )
    except ValueError as e:
        # Invalid payload
        return jsonify({'success': False, 'message': 'Invalid payload'}), 400
    except stripe.error.SignatureVerificationError as e:
        # Invalid signature
        return jsonify({'success': False, 'message': 'Invalid signature'}), 400
    
    # Handle the event
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        
        # Process the payment
        handle_successful_payment(session)
    
    return jsonify({'success': True}), 200

def handle_successful_payment(session):
    """Process a successful payment and add credits to user"""
    user_id = session.get('metadata', {}).get('user_id')
    package_id = session.get('metadata', {}).get('package_id')
    credits = int(session.get('metadata', {}).get('credits', 0))
    
    if not user_id or not package_id or not credits:
        print("Missing metadata in session")
        return
    
    # Get user
    user = User.query.get(user_id)
    if not user:
        print(f"User {user_id} not found")
        return
    
    # Add credits to user
    user.credit_balance += credits
    
    # Create recharge record
    recharge = RechargeHistory(
        user_id=user.id,
        amount=CREDIT_PACKAGES[package_id]['price'],
        credit_gained=credits,
        payment_status='completed',
        payment_method='stripe',
        stripe_payment_id=session.get('id')
    )
    
    # Save to database
    db.session.add(recharge)
    db.session.commit()
    
    print(f"Added {credits} credits to user {user.username}")

@payment_bp.route('/verify-payment/<session_id>', methods=['GET'])
@jwt_required()
def verify_payment(session_id):
    """Verify a payment and return updated user data"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'success': False, 'message': 'User not found'}), 404
    
    try:
        # Retrieve the session from Stripe
        session = stripe.checkout.Session.retrieve(session_id)
        
        # Check if payment was successful
        if session.payment_status == 'paid':
            # Verify that this session belongs to the current user
            if str(user.id) != session.client_reference_id:
                return jsonify({'success': False, 'message': 'Access denied'}), 403
            
            # Return updated user data
            return jsonify({
                'success': True,
                'user': user.to_dict(),
                'payment_status': 'paid'
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': 'Payment not completed',
                'payment_status': session.payment_status
            }), 200
    
    except Exception as e:
        print(f"Error verifying payment: {e}")
        return jsonify({'success': False, 'message': 'Failed to verify payment'}), 500

@payment_bp.route('/history', methods=['GET'])
@jwt_required()
def get_history():
    """Get user's payment history"""
    user_id = get_jwt_identity()
    
    # Get user's payment history
    history = RechargeHistory.query.filter_by(user_id=user_id).order_by(RechargeHistory.created_at.desc()).all()
    
    return jsonify({
        'success': True,
        'history': [item.to_dict() for item in history]
    }), 200