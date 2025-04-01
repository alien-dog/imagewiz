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
        "description": "3 credits for removing background from images"
    },
    {
        "id": "lite_monthly",
        "name": "Lite Monthly",
        "credits": 50,
        "price": 9.9,
        "currency": "usd",
        "description": "50 credits for removing background from images",
        "is_yearly": False
    },
    {
        "id": "lite_yearly",
        "name": "Lite Yearly",
        "credits": 600,
        "price": 106.8,
        "currency": "usd",
        "description": "600 credits for removing background from images (50 per month)",
        "is_yearly": True
    },
    {
        "id": "pro_monthly",
        "name": "Pro Monthly",
        "credits": 250,
        "price": 24.9,
        "currency": "usd",
        "description": "250 credits for removing background from images",
        "is_yearly": False
    },
    {
        "id": "pro_yearly",
        "name": "Pro Yearly",
        "credits": 3000,
        "price": 262.8,
        "currency": "usd",
        "description": "3000 credits for removing background from images (250 per month)",
        "is_yearly": True
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
    
    # Get optional parameters
    custom_price = data.get('price')
    custom_credits = data.get('credits')
    is_yearly = data.get('is_yearly', False)
    
    print(f"Creating checkout session for user {user.id}, package {package_id}")
    print(f"Is yearly: {is_yearly}, Credits: {custom_credits}, Price: {custom_price}")
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
    package = None
    
    # Handle packages with yearly/monthly options
    if is_yearly is not None:
        package = next((p for p in CREDIT_PACKAGES if p['id'] == package_id and p.get('is_yearly', False) == is_yearly), None)
    
    # If not found or no is_yearly provided, try the default
    if not package:
        package = next((p for p in CREDIT_PACKAGES if p['id'] == package_id), None)
    
    if not package:
        return jsonify({"error": "Invalid package selected"}), 400
        
    # Override package properties with custom values if provided
    price = custom_price if custom_price is not None else package['price']
    credits = custom_credits if custom_credits is not None else package['credits']
    
    # Create Stripe session
    try:
        # Ensure success_url has the checkout session ID parameter
        if success_url and '?' not in success_url:
            success_url = f"{success_url}?session_id={{CHECKOUT_SESSION_ID}}"
            
        # For debugging, print the URLs
        print(f"Success URL: {success_url}")
        print(f"Cancel URL: {cancel_url}")
        
        # Create a customized description if we're using custom values
        product_name = package['name']
        product_description = package['description']
        
        # If custom values were provided, update the description
        if custom_credits is not None or custom_price is not None:
            # Extract the base package name (before _monthly or _yearly)
            base_name = package_id.split('_')[0].capitalize()
            billing_period = "Yearly" if is_yearly else "Monthly"
            product_name = f"{base_name} Plan ({billing_period})"
            product_description = f"{credits} credits for removing background from images"
            if is_yearly:
                product_description += f" ({int(credits/12)} per month)"
        
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[
                {
                    'price_data': {
                        'currency': package['currency'],
                        'product_data': {
                            'name': product_name,
                            'description': product_description,
                        },
                        'unit_amount': int(price * 100),  # Convert to cents
                    },
                    'quantity': 1,
                },
            ],
            mode='payment',
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={
                'user_id': user.id,
                'package_id': package_id,
                'credits': credits,
                'price': price,
                'is_yearly': 'true' if is_yearly else 'false'
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
    # Handle the payment_intent.succeeded event for direct payments
    elif event['type'] == 'payment_intent.succeeded':
        payment_intent = event['data']['object']
        # Process the payment intent
        handle_payment_intent_success(payment_intent)
    
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
            is_yearly = metadata.get('is_yearly', 'false').lower() == 'true'
            session_id = session.id
        else:
            # If session is a dict
            metadata = session.get('metadata', {})
            user_id = metadata.get('user_id')
            package_id = metadata.get('package_id')
            credits = int(metadata.get('credits', 0))
            price = float(metadata.get('price', 0))
            is_yearly = metadata.get('is_yearly', 'false').lower() == 'true'
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
        
        # Check if this payment has already been processed - using raw SQL to avoid ORM issues
        from sqlalchemy import text
        
        try:
            # Query with just the basic columns that should always be present
            sql = text("""
            SELECT id 
            FROM recharge_history
            WHERE stripe_payment_id = :session_id
            LIMIT 1
            """)
            
            result = db.session.execute(sql, {"session_id": session_id})
            row = result.fetchone()
            
            if row:
                print(f"Payment {session_id} already processed, skipping")
                return
        except Exception as db_error:
            print(f"Warning: Error checking for existing payment: {db_error}")
            # Continue with the payment processing
        
        # Add credits to user's balance
        user.credit_balance += credits
        
        # Instead of using the ORM, let's directly execute SQL to insert only the columns we know exist
        from sqlalchemy import text
        
        try:
            # Use raw SQL with only the basic columns we know exist
            sql = text("""
            INSERT INTO recharge_history 
            (user_id, amount, credit_gained, payment_status, payment_method, stripe_payment_id, created_at)
            VALUES (:user_id, :amount, :credit_gained, :payment_status, :payment_method, :stripe_payment_id, NOW())
            """)
            
            # Execute the insert
            db.session.execute(sql, {
                'user_id': user.id,
                'amount': price,
                'credit_gained': credits,
                'payment_status': 'completed',
                'payment_method': 'stripe',
                'stripe_payment_id': session_id
            })
            
            # Update user's credit balance
            user.credit_balance += credits
            
            # Commit all changes
            db.session.commit()
            
            print(f"Successfully inserted payment record for user {user.username}")
        except Exception as insert_error:
            db.session.rollback()
            print(f"Error inserting payment record: {insert_error}")
            # Even if the insert fails, try to at least update the user's credit balance
            try:
                user.credit_balance += credits
                db.session.commit()
                print(f"Updated user's credit balance to {user.credit_balance}")
            except Exception as balance_error:
                db.session.rollback()
                print(f"Error updating user's credit balance: {balance_error}")
                raise
        
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
    # Use raw SQL to avoid ORM issues with missing columns
    from sqlalchemy import text
    
    recharge = None
    try:
        # Query with just the basic columns that should always be present
        sql = text("""
        SELECT id, user_id, amount, credit_gained, payment_status, payment_method, stripe_payment_id, created_at
        FROM recharge_history
        WHERE user_id = :user_id AND stripe_payment_id = :session_id
        LIMIT 1
        """)
        
        result = db.session.execute(sql, {"user_id": user.id, "session_id": session_id})
        row = result.fetchone()
        
        if row:
            # Convert row to a dict-like object
            recharge = {
                'id': row.id,
                'user_id': row.user_id,
                'amount': float(row.amount),
                'credit_gained': row.credit_gained,
                'payment_status': row.payment_status,
                'payment_method': row.payment_method,
                'stripe_payment_id': row.stripe_payment_id,
                'created_at': row.created_at.isoformat()
            }
    except Exception as db_error:
        print(f"Database error when checking for existing payment: {db_error}")
        # Continue as if the recharge doesn't exist, we'll try to create it from Stripe data
        recharge = None
    
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
                
                is_yearly = session.metadata.get('is_yearly', 'false').lower() == 'true'
                return jsonify({
                    "status": "success", 
                    "message": "Payment verified and credits added",
                    "user": user.to_dict(),
                    "package_name": package['name'] if package else "Credit Package",
                    "amount_paid": float(session.metadata.get('price', 0)),
                    "credits_added": int(session.metadata.get('credits', 0)),
                    "is_yearly": is_yearly,
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
        if pkg['credits'] == recharge['credit_gained']:
            package_id = pkg['id']
            package_name = pkg['name']
            break
    
    # is_yearly is already set to False by default above
    is_yearly = False

    return jsonify({
        "status": "success",
        "message": "Payment already verified",
        "user": user.to_dict(),
        "package_name": package_name,
        "amount_paid": float(recharge['amount']),
        "credits_added": recharge['credit_gained'],
        "is_yearly": is_yearly,
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
    
    # Check if payment exists in user's history - using raw SQL to avoid ORM issues
    from sqlalchemy import text
    
    recharge = None
    try:
        # Query with just the basic columns that should always be present
        sql = text("""
        SELECT id, user_id, amount, credit_gained, payment_status, payment_method, stripe_payment_id, created_at
        FROM recharge_history
        WHERE user_id = :user_id AND stripe_payment_id = :session_id
        LIMIT 1
        """)
        
        result = db.session.execute(sql, {"user_id": user.id, "session_id": session_id})
        row = result.fetchone()
        
        if row:
            # Convert row to a dict-like object
            recharge = {
                'id': row.id,
                'user_id': row.user_id,
                'amount': float(row.amount),
                'credit_gained': row.credit_gained,
                'payment_status': row.payment_status,
                'payment_method': row.payment_method,
                'stripe_payment_id': row.stripe_payment_id,
                'created_at': row.created_at.isoformat()
            }
    except Exception as db_error:
        print(f"Database error when checking for existing payment: {db_error}")
        # Continue as if the recharge doesn't exist, we'll try to create it from Stripe data
    
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

@bp.route('/checkout-intent', methods=['POST'])
@jwt_required()
def create_payment_intent():
    """Create a Stripe PaymentIntent for embedded checkout"""
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
    
    # Get the price from Stripe to determine the amount
    try:
        price = stripe.Price.retrieve(priceId)
        amount = price.unit_amount  # Amount in cents
        
        # Create a PaymentIntent
        intent = stripe.PaymentIntent.create(
            amount=amount,
            currency="usd",
            metadata={
                "user_id": user.id,
                "package_name": packageName,
                "is_yearly": "true" if isYearly else "false",
                "price_id": priceId
            }
        )
        
        return jsonify({
            "clientSecret": intent.client_secret,
            "amount": amount / 100  # Convert cents to dollars for display
        })
    except Exception as e:
        print(f"Error creating payment intent: {str(e)}")
        return jsonify({"error": str(e)}), 500

def handle_payment_intent_success(payment_intent):
    """Process a successful payment intent and add credits to user"""
    try:
        metadata = payment_intent.metadata
        user_id = metadata.get('user_id')
        package_name = metadata.get('package_name')
        price_id = metadata.get('price_id')
        is_yearly = metadata.get('is_yearly', 'false').lower() == 'true'
        payment_id = payment_intent.id
        
        print(f"Processing payment intent for user_id: {user_id}, package: {package_name}, price_id: {price_id}")
        
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
            print(f"Error: User {user_id} not found for payment {payment_id}")
            return
        
        # Check if this payment has already been processed - using raw SQL to avoid ORM issues
        from sqlalchemy import text
        
        try:
            # Query with just the basic columns that should always be present
            sql = text("""
            SELECT id 
            FROM recharge_history
            WHERE stripe_payment_id = :payment_id
            LIMIT 1
            """)
            
            result = db.session.execute(sql, {"payment_id": payment_id})
            row = result.fetchone()
            
            if row:
                print(f"Payment intent {payment_id} already processed, skipping")
                return
        except Exception as db_error:
            print(f"Warning: Error checking for existing payment: {db_error}")
            # Continue with the payment processing
        
        # Get price information from Stripe
        try:
            price = stripe.Price.retrieve(price_id)
            amount = price.unit_amount / 100  # Convert cents to dollars
            
            # Determine credits based on price
            credit_amount = 0
            package_id = ''
            
            # Find matching package by price and yearly status
            for pkg in CREDIT_PACKAGES:
                # Match by price and yearly status
                if pkg.get('price') == amount and pkg.get('is_yearly', False) == is_yearly:
                    credit_amount = pkg.get('credits', 0)
                    package_id = pkg.get('id', '')
                    break
            
            # If no exact match found, use a fallback calculation based on plan name
            if credit_amount == 0:
                if 'lite' in package_name.lower():
                    credit_amount = 50 if not is_yearly else 600
                    package_id = 'lite_monthly' if not is_yearly else 'lite_yearly'
                elif 'pro' in package_name.lower():
                    credit_amount = 250 if not is_yearly else 3000
                    package_id = 'pro_monthly' if not is_yearly else 'pro_yearly'
                else:
                    # Default credits if still no match
                    credit_amount = round(amount * 5)  # $1 = 5 credits as a fallback
                    package_id = 'custom'
            
            # Add credits to user's balance
            user.credit_balance += credit_amount
            
            # Instead of using the ORM, directly execute SQL to insert only the columns we know exist
            from sqlalchemy import text
            
            try:
                # Use raw SQL with only the basic columns we know exist
                sql = text("""
                INSERT INTO recharge_history 
                (user_id, amount, credit_gained, payment_status, payment_method, stripe_payment_id, created_at)
                VALUES (:user_id, :amount, :credit_gained, :payment_status, :payment_method, :stripe_payment_id, NOW())
                """)
                
                # Execute the insert
                db.session.execute(sql, {
                    'user_id': user.id,
                    'amount': amount,
                    'credit_gained': credit_amount,
                    'payment_status': 'completed',
                    'payment_method': 'stripe',
                    'stripe_payment_id': payment_id
                })
                
                # Commit all changes
                db.session.commit()
                
                print(f"Successfully inserted payment record for user {user.username}")
            except Exception as insert_error:
                db.session.rollback()
                print(f"Error inserting payment record: {insert_error}")
                # Even if the insert fails, try to at least update the user's credit balance
                try:
                    user.credit_balance += credit_amount
                    db.session.commit()
                    print(f"Updated user's credit balance to {user.credit_balance}")
                except Exception as balance_error:
                    db.session.rollback()
                    print(f"Error updating user's credit balance: {balance_error}")
                    raise
            
            print(f"User {user.username} recharged {credit_amount} credits for ${amount}")
            return user
            
        except Exception as e:
            print(f"Error retrieving price info: {str(e)}")
            return None
            
    except Exception as e:
        print(f"Error in handle_payment_intent_success: {str(e)}")
        # Don't raise exception, just log it
        return None

@bp.route('/verify-intent/<payment_intent_id>', methods=['GET'])
@jwt_required()
def verify_payment_intent(payment_intent_id):
    """Verify a payment intent status and return updated user data"""
    user_id = get_jwt_identity()
    try:
        user_id = int(user_id)
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid user ID"}), 400
        
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    # Check if payment exists in user's history - using raw SQL to avoid ORM issues
    from sqlalchemy import text
    
    recharge = None
    try:
        # Query with just the basic columns that should always be present
        sql = text("""
        SELECT id, user_id, amount, credit_gained, payment_status, payment_method, stripe_payment_id, created_at
        FROM recharge_history
        WHERE user_id = :user_id AND stripe_payment_id = :payment_id
        LIMIT 1
        """)
        
        result = db.session.execute(sql, {"user_id": user.id, "payment_id": payment_intent_id})
        row = result.fetchone()
        
        if row:
            # Convert row to a dict-like object
            recharge = {
                'id': row.id,
                'user_id': row.user_id,
                'amount': float(row.amount),
                'credit_gained': row.credit_gained,
                'payment_status': row.payment_status,
                'payment_method': row.payment_method,
                'stripe_payment_id': row.stripe_payment_id,
                'created_at': row.created_at.isoformat()
            }
    except Exception as db_error:
        print(f"Database error when checking for existing payment intent: {db_error}")
        # Continue as if the recharge doesn't exist, we'll try to create it from Stripe data
    
    if not recharge:
        # Try to retrieve payment intent from Stripe
        try:
            payment_intent = stripe.PaymentIntent.retrieve(payment_intent_id)
            if payment_intent.status == 'succeeded' and str(payment_intent.metadata.get('user_id')) == str(user.id):
                # Payment successful but not recorded yet, process it
                handle_payment_intent_success(payment_intent)
                
                # Get price info to determine credits and package details
                try:
                    price = stripe.Price.retrieve(payment_intent.metadata.get('price_id'))
                    amount = price.unit_amount / 100  # Convert cents to dollars
                except Exception as price_error:
                    print(f"Error retrieving price: {price_error}")
                    # Use a fallback amount if price retrieval fails
                    amount = payment_intent.amount / 100  # Convert cents to dollars
                
                # Determine credits based on package name
                package_name = payment_intent.metadata.get('package_name', '')
                is_yearly = payment_intent.metadata.get('is_yearly', 'false').lower() == 'true'
                
                credits = 0
                if 'lite' in package_name.lower():
                    credits = 50 if not is_yearly else 600
                elif 'pro' in package_name.lower():
                    credits = 250 if not is_yearly else 3000
                else:
                    # Default credits if no match
                    credits = round(amount * 5)  # $1 = 5 credits as a fallback
                
                return jsonify({
                    "status": "success", 
                    "message": "Payment verified and credits added",
                    "user": user.to_dict(),
                    "package_name": package_name,
                    "amount_paid": amount,
                    "credits_added": credits,
                    "is_yearly": is_yearly,
                    "new_balance": user.credit_balance
                }), 200
            else:
                return jsonify({"error": "Payment not completed or unauthorized"}), 400
        except Exception as e:
            print(f"Error verifying payment intent: {str(e)}")
            return jsonify({"error": str(e)}), 500
    
    # For dictionary-based recharge, we don't need to handle fields that might be missing
    # We already set defaults when building the recharge dict
    
    # Get package name based on credits for display
    package_name = "Custom Package"
    for pkg in CREDIT_PACKAGES:
        if pkg['credits'] == recharge['credit_gained']:
            package_name = pkg['name']
            break
    
    return jsonify({
        "status": "success",
        "message": "Payment already verified",
        "user": user.to_dict(),
        "package_name": package_name,
        "amount_paid": float(recharge['amount']),
        "credits_added": recharge['credit_gained'],
        "is_yearly": False,  # Default since column might not exist
        "new_balance": user.credit_balance
    }), 200

@bp.route('/history', methods=['GET'])
@jwt_required()
def get_history():
    """Get user's payment history"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    try:
        # Use a more targeted query to avoid selecting missing columns
        # Instead of using the ORM directly, use a custom SQL query 
        # that only selects the columns we know exist in the database
        from sqlalchemy import text
        from app import db
        
        # Query with just the basic columns that should always be present
        sql = text("""
        SELECT id, user_id, amount, credit_gained, payment_status, payment_method, stripe_payment_id, created_at
        FROM recharge_history
        WHERE user_id = :user_id
        ORDER BY created_at DESC
        """)
        
        result = db.session.execute(sql, {"user_id": user.id})
        
        # Convert the rows to dicts manually
        history = []
        for row in result:
            entry = {
                'id': row.id,
                'user_id': row.user_id,
                'amount': float(row.amount),
                'credit_gained': row.credit_gained,
                'payment_status': row.payment_status,
                'payment_method': row.payment_method,
                'stripe_payment_id': row.stripe_payment_id,
                'created_at': row.created_at.isoformat(),
                'is_yearly': False,  # Default value since column might not exist
                'package_id': None   # Default value since column might not exist
            }
            history.append(entry)
        
        return jsonify({
            "history": history
        }), 200
        
    except Exception as e:
        print(f"Error fetching payment history: {str(e)}")
        return jsonify({
            "error": "Failed to load payment history",
            "details": str(e)
        }), 500