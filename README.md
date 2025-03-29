# iMagenWiz - AI Image Background Removal

iMagenWiz is an advanced AI-powered image processing platform that provides intelligent background removal, manipulation, and enhancement tools for designers, marketers, and businesses.

## Features

- **AI-Powered Background Removal**: Remove backgrounds from images with precision using our advanced algorithms
- **User Authentication**: Secure user accounts with JWT-based authentication
- **Credit System**: Purchase credits to process images using Stripe payment integration
- **History Tracking**: View your processing history and download previous work
- **Responsive Design**: Fully responsive interface that works on desktop and mobile devices

## Tech Stack

### Backend
- **Python Flask**: RESTful API backend
- **PostgreSQL**: Database for storing user data and processing history
- **SQLAlchemy**: ORM for database interactions
- **Flask-JWT-Extended**: User authentication with JWT tokens
- **Stripe**: Payment processing integration

### Frontend
- **React**: Frontend UI library
- **Tailwind CSS**: Utility-first CSS framework
- **Axios**: HTTP client for API requests

## Project Structure

```
.
├── backend/              # Flask backend
│   ├── app/              # Main application code
│   │   ├── auth/         # Authentication routes and logic
│   │   ├── matting/      # Image processing routes and logic
│   │   ├── models/       # Database models
│   │   ├── payment/      # Payment processing with Stripe
│   │   ├── static/       # Static files (uploads, processed images)
│   │   └── utils/        # Utility functions
│   └── run.py            # Application entry point
├── frontend/             # React frontend
│   ├── public/           # Static assets
│   └── src/              # React components and logic
├── server/               # Node.js proxy server
└── run_both.js           # Script to run both backend and frontend
```

## Getting Started

### Prerequisites

- Python 3.7+
- Node.js 14+
- PostgreSQL database

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/imagenwiz.git
   cd imagenwiz
   ```

2. Set up the backend:
   ```
   pip install -r backend/requirements.txt
   ```

3. Configure the environment variables in `backend/.env`:
   ```
   DATABASE_URL=postgresql://username:password@localhost/imagenwiz
   SESSION_SECRET=your-secret-key
   STRIPE_SECRET_KEY=your-stripe-secret-key
   STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
   ```

4. Create a database and run the Flask application:
   ```
   cd backend
   python run.py
   ```

5. Set up the frontend proxy:
   ```
   cd server
   node index.js
   ```

### Creating an Admin User

To create an admin user with extra privileges:

```
cd backend
python -m app.create-admin
```

Follow the prompts to set up the admin username and password.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Special thanks to the Replit team for hosting and development support
- All open-source libraries and frameworks that made this project possible