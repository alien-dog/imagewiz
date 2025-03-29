# iMagenWiz Backend

This is the Flask backend for the iMagenWiz application.

## Setup

1. Install dependencies:
```
pip install flask flask-cors flask-sqlalchemy flask-jwt-extended flask-bcrypt python-dotenv pymysql pillow stripe
```

2. Run the application:
```
python run.py
```

The server will start on port 5000.

## API Endpoints

- `/` - Test endpoint
- `/api/auth/register` - Register a new user
- `/api/auth/login` - Login a user
- `/api/auth/user` - Get current user details
- `/api/auth/update` - Update user details
- `/api/matting/process` - Process an image to remove background
- `/api/matting/history` - Get user's matting history
- `/api/matting/:id` - Get specific matting details
- `/api/payment/packages` - Get all credit packages
- `/api/payment/create-checkout` - Create a Stripe checkout session
- `/api/payment/webhook` - Handle Stripe webhook events
- `/api/payment/verify/:session_id` - Verify a payment
- `/api/payment/history` - Get user's payment history