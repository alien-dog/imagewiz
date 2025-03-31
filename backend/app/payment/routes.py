import os
import json
import stripe
from flask import request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.models import User, RechargeHistory
from app import db
from . import bp

# Initialize Stripe with the API key
stripe.api_key = os.environ.get('STRIPE_SECRET_KEY')

# Credit package options
CREDIT_PACKAGES = [
    {
        "id": "free",
        "name": "Free",
        "credits": 3,
        "price": 0,
        "currency": "usd",
        "description": "3 credits for removing background from images",
        "is_subscription": False
    },
    {
        "id": "lite_monthly",
        "name": "Lite (Monthly)",
        "credits": 50,
        "price": 9.90,
        "currency": "usd",
        "description": "50 credits per month for removing background from images",
        "is_subscription": True,
        "interval": "month"
    },
    {
        "id": "lite_yearly",
        "name": "Lite (Yearly)",
        "credits": 600,
        "price": 106.80,
        "currency": "usd",
        "description": "600 credits per year for removing background from images",
        "is_subscription": True,
        "interval": "year"
    },
    {
        "id": "pro_monthly",
        "name": "Pro (Monthly)",
        "credits": 250,
        "price": 24.90,
        "currency": "usd",
        "description": "250 credits per month for removing background from images",
        "is_subscription": True,
        "interval": "month",
        "popular": True
    },
    {
        "id": "pro_yearly",
        "name": "Pro (Yearly)",
        "credits": 3000,
        "price": 262.80,
        "currency": "usd",
        "description": "3000 credits per year for removing background from images",
        "is_subscription": True,
        "interval": "year",
        "popular": True
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
    try:
        user_id = int(user_id)
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid user ID"}), 400
        
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    data = request.get_json()
    package_id = data.get('package_id')
    success_url = data.get('success_url')
    cancel_url = data.get('cancel_url')
    
    print(f"Creating checkout session for user {user.id}, package {package_id}")
    print(f"Success URL: {success_url}, Cancel URL: {cancel_url}")
    
    # If success_url or cancel_url are not provided, use default URLs based on request origin
    if not success_url:
        # Get the origin from request headers or use the host directly
        # We need to ensure we're using the frontend URL, not the backend URL
        host = request.headers.get('Host', 'localhost')
        origin = request.headers.get('Origin')
        
        # Use origin if available (which should include the protocol)
        if origin:
            success_url = f"{origin}/payment-success"
        else:
            # Fallback to host with https
            forwarded_proto = request.headers.get('X-Forwarded-Proto', 'https')
            success_url = f"{forwarded_proto}://{host}/payment-success"
            
        print(f"No success_url provided, using default: {success_url}")
    
    if not cancel_url:
        # Get the origin from request headers or use the host directly
        host = request.headers.get('Host', 'localhost')
        origin = request.headers.get('Origin')
        
        # Use origin if available (which should include the protocol)
        if origin:
            cancel_url = f"{origin}/pricing"
        else:
            # Fallback to host with https
            forwarded_proto = request.headers.get('X-Forwarded-Proto', 'https')
            cancel_url = f"{forwarded_proto}://{host}/pricing"
            
        print(f"No cancel_url provided, using default: {cancel_url}")
    
    # Find the selected package
    package = next((p for p in CREDIT_PACKAGES if p['id'] == package_id), None)
    if not package:
        return jsonify({"error": "Invalid package selected"}), 400
    
    # Create Stripe session
    try:
        # Ensure success_url has the checkout session ID parameter
        if success_url and '?' not in success_url:
            success_url = f"{success_url}?session_id={{CHECKOUT_SESSION_ID}}"
            
        # For debugging, print the URLs
        print(f"Success URL: {success_url}")
        print(f"Cancel URL: {cancel_url}")
        
        # Set up payment details
        line_items = [
            {
                'price_data': {
                    'currency': package['currency'],
                    'product_data': {
                        'name': package['name'],
                        'description': package['description'],
                    },
                    'unit_amount': int(package['price'] * 100),  # Convert to cents
                    # Add recurring price data if it's a subscription
                    **({"recurring": {"interval": package["interval"]}} if package.get("is_subscription", False) else {})
                },
                'quantity': 1,
            }
        ]
        
        # Determine payment mode based on package type
        payment_mode = 'subscription' if package.get('is_subscription', False) else 'payment'
        
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=line_items,
            mode=payment_mode,
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={
                'user_id': user.id,
                'package_id': package_id,
                'credits': package['credits'],
                'price': package['price'],
                'is_subscription': "true" if package.get('is_subscription', False) else "false",
                'interval': package.get('interval', '')
            }
        )
        
        print(f"Checkout session created: {checkout_session.id}")
        
        return jsonify({
            'id': checkout_session.id,
            'url': checkout_session.url
        }), 200
        
    except Exception as e:
        print(f"Error creating checkout session: {str(e)}")
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
    except Exception as e:
        # Invalid signature or other error
        return jsonify({"error": f"Error processing webhook: {str(e)}"}), 400
    
    # Handle the checkout.session.completed event
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        handle_successful_payment(session)
    
    return jsonify({"status": "success"}), 200

def handle_successful_payment(session):
    """Process a successful payment and add credits to user"""
    # Get metadata from the session
    try:
        # Handle both dict-like access and attribute access for different session object types
        if hasattr(session, 'metadata') and session.metadata:
            # If session is a Stripe object with attributes
            metadata = session.metadata
            user_id = metadata.get('user_id')
            package_id = metadata.get('package_id')
            credits = int(metadata.get('credits', 0))
            price = float(metadata.get('price', 0))
            session_id = session.id
        else:
            # If session is a dict
            metadata = session.get('metadata', {})
            user_id = metadata.get('user_id')
            package_id = metadata.get('package_id')
            credits = int(metadata.get('credits', 0))
            price = float(metadata.get('price', 0))
            session_id = session.get('id')
        
        print(f"Processing payment for user_id: {user_id}, credits: {credits}, price: {price}")
        
        if not user_id:
            print("Error: No user_id in payment metadata")
            return
            
        # Convert user_id to integer if it's a string
        try:
            user_id = int(user_id)
        except (ValueError, TypeError) as e:
            print(f"Error converting user_id to integer: {str(e)}")
            return
        
        # Find the user
        user = User.query.get(user_id)
        if not user:
            print(f"Error: User {user_id} not found for payment {session_id}")
            return
        
        # Check if this payment has already been processed
        existing_recharge = RechargeHistory.query.filter_by(
            stripe_payment_id=session_id
        ).first()
        
        if existing_recharge:
            print(f"Payment {session_id} already processed, skipping")
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
            stripe_payment_id=session_id
        )
        
        db.session.add(recharge)
        db.session.commit()
        
        print(f"User {user.username} recharged {credits} credits for ${price}")
        return user
        
    except Exception as e:
        print(f"Error in handle_successful_payment: {str(e)}")
        # Don't raise exception, just log it
        return None

@bp.route('/verify', methods=['GET'])
@jwt_required()
def verify_payment_query():
    """Verify a payment using query parameter and return updated user data"""
    session_id = request.args.get('session_id')
    if not session_id:
        return jsonify({"error": "Missing session_id parameter"}), 400
    
    user_id = get_jwt_identity()
    try:
        user_id = int(user_id)
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid user ID"}), 400
        
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
            if session.payment_status == 'paid' and str(session.metadata.get('user_id')) == str(user.id):
                # Payment successful but not recorded yet, process it
                handle_successful_payment(session)
                
                # Get the package information for the response
                package_id = session.metadata.get('package_id')
                package = next((p for p in CREDIT_PACKAGES if p['id'] == package_id), None)
                
                return jsonify({
                    "status": "success", 
                    "message": "Payment verified and credits added",
                    "user": user.to_dict(),
                    "package_name": package['name'] if package else "Credit Package",
                    "amount_paid": float(session.metadata.get('price', 0)),
                    "credits_added": int(session.metadata.get('credits', 0)),
                    "new_balance": user.credit_balance
                }), 200
            else:
                return jsonify({"error": "Payment not completed or unauthorized"}), 400
        except Exception as e:
            print(f"Error verifying payment: {str(e)}")
            return jsonify({"error": str(e)}), 500
    
    # If payment was already verified, get package info from the recharge record
    package_id = None
    package_name = "Credit Package"  # Default value
    for pkg in CREDIT_PACKAGES:
        if pkg['credits'] == recharge.credit_gained:
            package_id = pkg['id']
            package_name = pkg['name']
            break
    
    return jsonify({
        "status": "success",
        "message": "Payment already verified",
        "user": user.to_dict(),
        "package_name": package_name,
        "amount_paid": float(recharge.amount),
        "credits_added": recharge.credit_gained,
        "new_balance": user.credit_balance
    }), 200


@bp.route('/verify-payment/<session_id>', methods=['GET'])
@jwt_required()
def verify_payment(session_id):
    """Verify a payment and return updated user data"""
    user_id = get_jwt_identity()
    try:
        user_id = int(user_id)
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid user ID"}), 400
        
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
            if session.payment_status == 'paid' and str(session.metadata.get('user_id')) == str(user.id):
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