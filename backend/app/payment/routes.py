import os
import json
import stripe
from flask import request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.models import User, RechargeHistory
from app import db
from app.payment import payment_bp
from app.utils.auth import admin_required

# Initialize Stripe
stripe.api_key = os.environ.get('STRIPE_SECRET_KEY')

# Define credit packages
CREDIT_PACKAGES = [
    {
        'id': 'basic',
        'name': 'Basic Package',
        'credits': 10,
        'price': 5.99,
        'description': 'Good for occasional use'
    },
    {
        'id': 'standard',
        'name': 'Standard Package',
        'credits': 50,
        'price': 19.99,
        'description': 'Perfect for regular users',
        'popular': True
    },
    {
        'id': 'premium',
        'name': 'Premium Package',
        'credits': 150,
        'price': 49.99,
        'description': 'Best value for power users'
    }
]

@payment_bp.route('/packages', methods=['GET'])
def get_packages():
    """Get all available credit packages"""
    return jsonify(CREDIT_PACKAGES), 200

@payment_bp.route('/create-checkout-session', methods=['POST'])
@jwt_required()
def create_checkout_session():
    """Create a Stripe checkout session for credit purchase"""
    data = request.get_json()
    
    if not data or not data.get('package_id'):
        return jsonify({'error': 'Package ID is required'}), 400
    
    # Find the package
    package = next((p for p in CREDIT_PACKAGES if p['id'] == data['package_id']), None)
    
    if not package:
        return jsonify({'error': 'Invalid package ID'}), 400
    
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    try:
        # Create Stripe checkout session
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'usd',
                    'product_data': {
                        'name': package['name'],
                        'description': f"{package['credits']} credits for iMagenWiz"
                    },
                    'unit_amount': int(package['price'] * 100)  # amount in cents
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url=request.headers.get('Origin', '') + f'/payment/success?session_id={{CHECKOUT_SESSION_ID}}',
            cancel_url=request.headers.get('Origin', '') + '/payment/cancel',
            client_reference_id=str(current_user_id),
            metadata={
                'package_id': package['id'],
                'credits': str(package['credits']),
                'user_id': str(current_user_id)
            }
        )
        
        return jsonify({
            'session_id': session.id,
            'checkout_url': session.url
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@payment_bp.route('/webhook', methods=['POST'])
def webhook():
    """Handle Stripe webhook events"""
    payload = request.data
    sig_header = request.headers.get('Stripe-Signature')
    
    try:
        # Verify webhook signature
        event = stripe.Webhook.construct_event(
            payload, sig_header, os.environ.get('STRIPE_WEBHOOK_SECRET', '')
        )
        
    except (ValueError, stripe.error.SignatureVerificationError):
        return jsonify({'error': 'Invalid payload or signature'}), 400
    
    # Handle the checkout.session.completed event
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        handle_successful_payment(session)
    
    return jsonify({'status': 'success'}), 200

def handle_successful_payment(session):
    """Process a successful payment and add credits to user"""
    user_id = int(session.get('client_reference_id', 0))
    package_id = session.get('metadata', {}).get('package_id')
    credits = int(session.get('metadata', {}).get('credits', 0))
    
    # Find the user
    user = User.query.get(user_id)
    
    if not user or not package_id or not credits:
        return
    
    # Find the package
    package = next((p for p in CREDIT_PACKAGES if p['id'] == package_id), None)
    
    if not package:
        return
    
    # Update user credits
    user.credit_balance += credits
    
    # Create payment history record
    history = RechargeHistory(
        user_id=user_id,
        amount=package['price'],
        credit_gained=credits,
        payment_status='completed',
        payment_method='credit_card',
        stripe_payment_id=session.get('id')
    )
    
    db.session.add(history)
    db.session.commit()

@payment_bp.route('/verify-payment/<session_id>', methods=['GET'])
@jwt_required()
def verify_payment(session_id):
    """Verify a payment and return updated user data"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    try:
        # Retrieve the session from Stripe
        session = stripe.checkout.Session.retrieve(session_id)
        
        # Check if the session is completed and belongs to this user
        if session.payment_status == 'paid' and str(session.client_reference_id) == str(current_user_id):
            # Return the updated user data
            return jsonify({
                'message': 'Payment verified successfully',
                'user': user.to_dict()
            }), 200
        else:
            return jsonify({'error': 'Payment verification failed'}), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@payment_bp.route('/history', methods=['GET'])
@jwt_required()
def get_history():
    """Get user's payment history"""
    current_user_id = get_jwt_identity()
    
    # Get all payment history entries for the user
    histories = RechargeHistory.query.filter_by(user_id=current_user_id).order_by(RechargeHistory.created_at.desc()).all()
    
    # Format the response
    history_list = [history.to_dict() for history in histories]
    
    return jsonify(history_list), 200