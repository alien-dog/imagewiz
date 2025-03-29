import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from app import create_app

# Create the Flask application instance
app = create_app()

if __name__ == '__main__':
    # Get port from environment or use default
    port = int(os.environ.get('PORT', 5001))
    
    # Run the application
    app.run(
        host='0.0.0.0',
        port=port,
        debug=bool(int(os.environ.get('FLASK_DEBUG', 0)))
    )