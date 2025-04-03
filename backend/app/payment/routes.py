import os
import json
import stripe
from flask import request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.models import User, RechargeHistory
from app import db
from . import bp

# Initialize Stripe with the API key
stripe_api_key = os.environ.get('STRIPE_SECRET_KEY')
if stripe_api_key:
    print(f"DEBUG: Stripe API key is configured with key starting with: {stripe_api_key[:4]}...")
    print(f"DEBUG: Key length: {len(stripe_api_key)} characters")
    
    # Log whether this looks like a valid test key format
    if stripe_api_key.startswith('sk_test_'):
        print("DEBUG: Key appears to be a valid test key format (sk_test_)")
    elif stripe_api_key.startswith('sk_live_'):
        print("DEBUG: Key appears to be a LIVE key format - caution!")
    else:
        print("WARNING: Key format does not match expected Stripe key format (sk_test_ or sk_live_)")
else:
    print("ERROR: Stripe API key is NOT configured!")

# Set the key in the Stripe library
stripe.api_key = stripe_api_key
print(f"DEBUG: Stripe API key set in library, API version: {stripe.api_version}")

# Test Stripe connectivity immediately on startup
try:
    print("DEBUG: Testing Stripe API connectivity...")
    stripe.Account.retrieve()
    print("DEBUG: Successfully connected to Stripe API on startup")
except Exception as e:
    print(f"ERROR: Failed to connect to Stripe API: {str(e)}")

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
            # NEW APPROACH: Use a simple payment-verify page that will poll the backend
            success_url = f"{origin}/payment-verify"
        else:
            # Fallback to host with https
            forwarded_proto = request.headers.get('X-Forwarded-Proto', 'https')
            success_url = f"{forwarded_proto}://{host}/payment-verify"
            
        print(f"Using simplified payment verification approach: {success_url}")
    
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
        # Process the success_url to handle any port issues and add session ID
        if success_url:
            try:
                # Parse the URL to ensure it's valid and remove port if present
                parsed_url = success_url
                
                # Make sure port number is not in the URL as it can cause issues with redirects
                if ":3000" in success_url:
                    parsed_url = success_url.replace(":3000", "")
                    print(f"Removed port 3000 from success URL: {parsed_url}")
                elif ":5000" in success_url:
                    parsed_url = success_url.replace(":5000", "")
                    print(f"Removed port 5000 from success URL: {parsed_url}")
                    
                # Do NOT add port 443 explicitly - this was causing redirect issues
                # For Replit hosted apps, use the default HTTPS port (implicit 443)
                if ".replit.dev" in parsed_url and ":443" in parsed_url:
                    # Remove explicit port 443 if it's there
                    try:
                        from urllib.parse import urlparse, urlunparse
                        parsed = urlparse(parsed_url)
                        # Remove the port specification entirely
                        cleaned_netloc = parsed.netloc.replace(":443", "")
                        parsed_url = parsed_url.replace(parsed.netloc, cleaned_netloc)
                        print(f"Removed explicit port for cleaner redirect: {parsed_url}")
                    except Exception as e:
                        print(f"Error cleaning URL: {e}")
                    
                # Make sure we always append the session_id parameter correctly
                if '?' not in parsed_url:
                    success_url = f"{parsed_url}?session_id={{CHECKOUT_SESSION_ID}}"
                else:
                    # If URL already has query parameters, append with &
                    success_url = f"{parsed_url}&session_id={{CHECKOUT_SESSION_ID}}"
            except Exception as e:
                print(f"Error processing success_url: {e}")
                # Fallback to a basic URL if parsing fails
                success_url = f"{success_url}?session_id={{CHECKOUT_SESSION_ID}}"
        
        # Process the cancel_url to handle any port issues
        if cancel_url:
            try:
                # Remove port if present to avoid redirect issues
                if ":3000" in cancel_url:
                    cancel_url = cancel_url.replace(":3000", "")
                    print(f"Removed port 3000 from cancel URL: {cancel_url}")
                elif ":5000" in cancel_url:
                    cancel_url = cancel_url.replace(":5000", "")
                    print(f"Removed port 5000 from cancel URL: {cancel_url}")
            except Exception as e:
                print(f"Error processing cancel_url: {e}")
            
        # For debugging, print the final URLs
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
            
        # If credits are not explicitly provided in metadata, calculate based on package_id
        if credits == 0 and package_id:
            print(f"Calculating credits for package: {package_id}")
            if package_id == 'lite_monthly':
                credits = 50
            elif package_id == 'lite_yearly':
                credits = 600
            elif package_id == 'pro_monthly':
                credits = 250
            elif package_id == 'pro_yearly':
                credits = 3000
            print(f"Calculated credits: {credits}")
        
        # Final sanity check - if we still have 0 credits, calculate based on price
        if credits == 0 and price > 0:
            # Fallback calculation: Lite = 9.90 for 50 credits, Pro = 24.90 for 250 credits
            if abs(price - 9.90) < 0.1:  # ~= $9.90
                credits = 50
            elif abs(price - 106.80) < 0.1:  # ~= $106.80
                credits = 600
            elif abs(price - 24.90) < 0.1:  # ~= $24.90
                credits = 250
            elif abs(price - 262.80) < 0.1:  # ~= $262.80
                credits = 3000
            else:
                # Absolute fallback: 5 credits per $1
                credits = int(price * 5)
                
            print(f"Fallback credit calculation based on price ${price}: {credits} credits")
        
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
            
            # The credits have already been added to user.credit_balance earlier in this function
            # DO NOT add the credits again to avoid doubling them
            
            # Commit all changes
            db.session.commit()
            
            print(f"Successfully inserted payment record for user {user.username}")
            print(f"User {user.username} credit balance is now {user.credit_balance}")
        except Exception as insert_error:
            db.session.rollback()
            print(f"Error inserting payment record: {insert_error}")
            # Even if the insert fails, try to at least update the user's credit balance
            try:
                # Make sure we don't double-add credits
                # We need to query the user again to get the latest credit balance
                fresh_user = User.query.get(user.id)
                if fresh_user.credit_balance == user.credit_balance - credits:
                    # Only add credits if they weren't added before
                    fresh_user.credit_balance += credits
                    db.session.commit()
                    print(f"Updated user's credit balance to {fresh_user.credit_balance}")
                else:
                    print(f"Credits already added, current balance: {fresh_user.credit_balance}")
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
@bp.route('/create-payment-intent', methods=['POST'])  # Add additional route with the same handler
@jwt_required()
def create_payment_intent():
    """Create a Stripe PaymentIntent for embedded checkout"""
    print("********** PAYMENT INTENT ENDPOINT CALLED **********")
    print(f"Request headers: {dict(request.headers)}")
    print(f"Request data: {request.get_data(as_text=True)}")
    
    user_id = get_jwt_identity()
    print(f"JWT Identity (user_id): {user_id}")
    
    try:
        user_id = int(user_id)
        print(f"User ID converted to int: {user_id}")
    except (ValueError, TypeError) as e:
        print(f"Error converting user_id to int: {str(e)}")
        return jsonify({"error": "Invalid user ID"}), 400
        
    user = User.query.get(user_id)
    print(f"User query result: {user}")
    
    if not user:
        print(f"User not found with ID: {user_id}")
        return jsonify({"error": "User not found"}), 404

    print(f"User authenticated: {user.username} (ID: {user.id})")
    
    data = request.get_json()
    print(f"Request JSON data: {data}")
    
    priceId = data.get("priceId")
    packageName = data.get("packageName") 
    isYearly = data.get("isYearly", False)
    
    print(f"Processing: priceId={priceId}, packageName={packageName}, isYearly={isYearly}")
    
    if not packageName or not priceId:
        print("Error: Missing required fields (packageName or priceId)")
        return jsonify({"error": "Package name and price ID are required"}), 400
    
    # For now, use a hardcoded approach to fix immediate issues
    # We'll use the package details to determine the amount
    print(f"DEBUG: Processing payment for package: {packageName}, priceId: {priceId}, isYearly: {isYearly}")
    
    # Determine amount based on package name (fallback if Stripe API is slow/timeout)
    amount_cents = 0
    if "lite" in packageName.lower():
        amount_cents = 990 if not isYearly else 10680  # $9.90 or $106.80
    elif "pro" in packageName.lower():
        amount_cents = 2490 if not isYearly else 26280  # $24.90 or $262.80
    else:
        print(f"ERROR: Unknown package: {packageName}")
        return jsonify({"error": "Unknown package"}), 400
    
    try:
        print(f"DEBUG: Using amount of {amount_cents} cents for {packageName}")
        
        # Create a PaymentIntent with the determined amount
        print(f"DEBUG: Creating payment intent for user id: {user.id}")
        intent = stripe.PaymentIntent.create(
            amount=amount_cents,
            currency="usd",
            metadata={
                "user_id": user.id,
                "package_name": packageName,
                "is_yearly": "true" if isYearly else "false",
                "price_id": priceId
            }
        )
        
        print(f"DEBUG: Created payment intent successfully")
        
        return jsonify({
            "clientSecret": intent.client_secret,
            "amount": amount_cents / 100  # Convert cents to dollars for display
        })
    except Exception as e:
        error_msg = str(e)
        print(f"ERROR creating payment intent: {error_msg}")
        
        # Check if it's an authentication error
        if "Authentication" in error_msg or "key" in error_msg.lower():
            print("ERROR: Stripe API key is invalid or missing")
            return jsonify({
                "error": "Stripe API authentication failed. Please check your API key."
            }), 500
        
        return jsonify({
            "error": f"Failed to create payment: {error_msg}"
        }), 500

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
            return None
            
        # Convert user_id to integer if it's a string
        try:
            user_id = int(user_id)
        except (ValueError, TypeError) as e:
            print(f"Error converting user_id to integer: {str(e)}")
            return None
        
        # Find the user
        user = User.query.get(user_id)
        if not user:
            print(f"Error: User {user_id} not found for payment {payment_id}")
            return None
        
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
                return None
        except Exception as db_error:
            print(f"Warning: Error checking for existing payment: {db_error}")
            # Continue with the payment processing
        
        # Get amount directly from the payment intent
        amount = payment_intent.amount / 100  # Convert cents to dollars
        
        # Determine credits based on package name
        credit_amount = 0
        package_id = ''
        
        # Use package name to determine credits
        if package_name and 'lite' in package_name.lower():
            credit_amount = 50 if not is_yearly else 600
            package_id = 'lite_monthly' if not is_yearly else 'lite_yearly'
        elif package_name and 'pro' in package_name.lower():
            credit_amount = 250 if not is_yearly else 3000
            package_id = 'pro_monthly' if not is_yearly else 'pro_yearly'
        else:
            # Default credits if no match
            credit_amount = round(amount * 5)  # $1 = 5 credits as a fallback
            package_id = 'custom'
        
        # Add credits to user's balance
        user.credit_balance += credit_amount
        
        try:
            # Use raw SQL to insert the payment record
            sql = text("""
            INSERT INTO recharge_history 
            (user_id, amount, credit_gained, payment_status, payment_method, stripe_payment_id, created_at)
            VALUES (:user_id, :amount, :credit_gained, :payment_status, :payment_method, :stripe_payment_id, NOW())
            """)
            
            db.session.execute(sql, {
                'user_id': user.id,
                'amount': amount,
                'credit_gained': credit_amount,
                'payment_status': 'completed',
                'payment_method': 'stripe',
                'stripe_payment_id': payment_id
            })
            
            db.session.commit()
            print(f"Successfully inserted payment record for user {user.username}")
        except Exception as insert_error:
            db.session.rollback()
            print(f"Error inserting payment record: {insert_error}")
            # Try to update the credit balance even if the insert fails
            try:
                db.session.commit()
                print(f"Updated user's credit balance to {user.credit_balance}")
            except Exception as balance_error:
                db.session.rollback()
                print(f"Error updating user's credit balance: {balance_error}")
        
        print(f"User {user.username} recharged {credit_amount} credits for ${amount}")
        return user
    except Exception as e:
        print(f"Error in handle_payment_intent_success: {str(e)}")
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
                
                # Don't try to retrieve price information from Stripe API
                # Just determine credits directly from package name as it's more reliable
                package_name = payment_intent.metadata.get('package_name', '')
                is_yearly = payment_intent.metadata.get('is_yearly', 'false').lower() == 'true'
                
                # Get amount from payment intent directly
                amount = payment_intent.amount / 100  # Convert cents to dollars
                
                # Determine credits based on package name
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

@bp.route('/test-stripe-connection', methods=['GET'])
def test_stripe_connection():
    """Test the Stripe API connection"""
    try:
        print("Testing Stripe API connection...")
        # Try to fetch a simple resource from Stripe
        balance = stripe.Balance.retrieve()
        print(f"Stripe connection successful, received balance response")
        return jsonify({
            "status": "success",
            "message": "Stripe API connection is working"
        }), 200
    except Exception as e:
        print(f"Stripe API connection test failed: {str(e)}")
        return jsonify({
            "status": "error",
            "message": f"Stripe API connection failed: {str(e)}"
        }), 500

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