# iMagenWiz - AI Image Background Removal

iMagenWiz is an advanced AI-powered image processing platform that provides intelligent background removal, manipulation, and enhancement tools for designers, marketers, and businesses.

## Project Structure
This project consists of two main parts:
- **Backend**: A Python Flask API with MySQL database
- **Frontend**: A React.js application with modern responsive design

## Key Technologies
- **Backend**: Python, Flask, JWT, MySQL
- **Frontend**: React.js, Tailwind CSS, Axios
- **Database**: MySQL
- **Authentication**: JWT-based
- **Payment**: Stripe Integration
- **Image Processing**: Python-based AI algorithms

## Local Setup

### Prerequisites
- Python 3.8 or higher
- Node.js 16.x or higher
- MySQL database

### Backend Setup

1. Install Python dependencies:
```bash
cd backend
pip install flask flask-cors flask-sqlalchemy flask-jwt-extended flask-bcrypt python-dotenv pymysql pillow stripe
```

2. Configure database in `.env` file or directly in `app/__init__.py`:
```
DATABASE_URL=mysql+pymysql://username:password@hostname/database
JWT_SECRET_KEY=your_jwt_secret_key
```

3. Run the Flask server:
```bash
cd backend
python run.py
```

The backend server will start on port 5000.

### Frontend Setup

1. Install Node.js dependencies:
```bash
cd frontend
npm install
```

2. Configure frontend environment variables in `.env` file:
```
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

3. Run the development server:
```bash
cd frontend
npm run dev
```

The frontend development server will start on port 3000.

## Environment Variables

### Backend
```
# Database Configuration
DATABASE_URL=mysql+pymysql://username:password@hostname/database

# Authentication
JWT_SECRET_KEY=your_jwt_secret_key

# File Upload
UPLOAD_FOLDER=app/static/uploads

# Payment Processing
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

### Frontend
```
# API Configuration
VITE_API_URL=http://localhost:5000/api

# Payment Processing
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

## Production Deployment Steps

### 1. Server Requirements
- Minimum 1GB RAM
- 2GB storage space
- Python 3.8+ and Node.js 16+
- MySQL database
- HTTPS support for secure connections
- Static file serving capability

### 2. Server Setup
1. Clone the repository
2. Set up all required environment variables in `.env` files
3. Install dependencies:

Backend:
```bash
cd backend
pip install -r requirements.txt
```

Frontend:
```bash
cd frontend
npm install --production
npm run build
```

### 3. Running in Production

#### Backend
For the Flask backend in production, use Gunicorn:
```bash
pip install gunicorn
cd backend
gunicorn -w 4 -b 0.0.0.0:5000 'run:app'
```

For long-running service, use Supervisor or systemd:
```ini
# Example supervisor config
[program:imagenwiz-backend]
directory=/path/to/imagenwiz/backend
command=gunicorn -w 4 -b 0.0.0.0:5000 'run:app'
autostart=true
autorestart=true
stderr_logfile=/var/log/imagenwiz/backend.err.log
stdout_logfile=/var/log/imagenwiz/backend.out.log
```

#### Frontend
For the React frontend, serve the built files:
```bash
npm install -g serve
cd frontend
serve -s dist -l 3000
```

### 4. Nginx Configuration (Recommended)
Use Nginx as a reverse proxy:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name yourdomain.com;

    # SSL configuration
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Frontend - Static files
    location / {
        root /path/to/imagenwiz/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files from Flask
    location /static {
        alias /path/to/imagenwiz/backend/app/static;
        expires 30d;
    }
}
```

### 5. Health Checks
Add a simple health check endpoint to the Flask backend:

```python
@app.route('/api/health')
def health_check():
    return {'status': 'ok'}, 200
```

### 6. Monitoring
For production monitoring:
- Use a service like Sentry for error tracking
- Set up server monitoring with tools like Datadog or Prometheus
- Configure log rotation for application logs
- Set up alerts for error rates and server health

### 7. Backup Strategy
Ensure regular backups of:
- MySQL database (daily dumps)
- Uploaded images in the static folder
- Environment configurations
- Application code

## Troubleshooting
Common issues and solutions:

1. Database Connection Issues:
   - Verify MySQL connection details are correct in the DATABASE_URL
   - Check database user permissions and ensure the user has access to the required tables
   - Test the database connection directly using a MySQL client

2. Static Files Not Loading:
   - Check permissions on the uploads directory
   - Verify path configurations in the Flask app
   - Ensure proper MIME types are set in Nginx configuration

3. Backend API Issues:
   - Check Flask error logs for detailed information
   - Ensure all required Python packages are installed
   - Verify JWT configuration and secret keys

4. Frontend Issues:
   - Check browser console for JavaScript errors
   - Verify API base URL is correctly set in the frontend environment
   - Ensure React build completed successfully with no errors

5. CORS Issues:
   - Verify proper CORS configuration in Flask application
   - Check that the frontend is accessing the API with the expected origin
   - Ensure all preflight requests are handled correctly

For additional support or issues, please refer to our documentation or create an issue in the repository.

## Updating Your Deployed Application

### 1. Preparation
Before updating your production application:
1. Back up your MySQL database: `mysqldump -u root -p mat_db > backup.sql`
2. Back up your uploaded images and environment files
3. Test the updates in a staging environment first

### 2. Update Process
Follow these steps to update your application:

1. On your local development environment:
   ```bash
   # Pull latest changes
   git pull origin main

   # Update backend dependencies
   cd backend
   pip install -r requirements.txt

   # Update frontend dependencies and build
   cd ../frontend
   npm install
   npm run build
   ```

2. On your production server:
   ```bash
   # Stop the current services
   sudo systemctl stop imagenwiz-backend
   # or if using Supervisor
   sudo supervisorctl stop imagenwiz-backend

   # Back up current deployment
   cp -r /path/to/deployment /path/to/backup

   # Deploy the new code
   # Update the backend Python files
   # Replace the frontend build files

   # Apply any database schema changes (if needed)
   # Use Flask-Migrate or manual SQL updates

   # Restart the services
   sudo systemctl start imagenwiz-backend
   # or if using Supervisor
   sudo supervisorctl start imagenwiz-backend
   ```

### 3. Rollback Process
If issues occur after deployment:

1. Stop the services:
   ```bash
   sudo systemctl stop imagenwiz-backend
   # or if using Supervisor
   sudo supervisorctl stop imagenwiz-backend
   ```

2. Restore from backup:
   ```bash
   # Restore the code
   rm -rf /path/to/deployment
   cp -r /path/to/backup /path/to/deployment

   # Restore the database if needed
   mysql -u root -p mat_db < backup.sql

   # Restart the services
   sudo systemctl start imagenwiz-backend
   # or if using Supervisor
   sudo supervisorctl start imagenwiz-backend
   ```

### 4. Post-Update Checks
After updating:
1. Verify the backend API is responding correctly
2. Test key functionality including user authentication and image processing
3. Check the frontend for any UI or functional issues
4. Monitor error logs for at least 24 hours
5. Perform load testing if significant changes were made

### 5. Update Best Practices
- Schedule updates during low-traffic periods
- Use feature flags for major changes to enable gradual rollout
- Document all changes in a changelog
- Keep database schema migrations versioned
- Perform thorough testing on all user flows after updates
- Monitor application metrics before and after updates to ensure performance is maintained