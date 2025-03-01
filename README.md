# iMagenWiz Deployment Guide

## Prerequisites
- Node.js 20.x or later
- PostgreSQL database
- Environment variables setup
- SSL certificate for HTTPS (recommended for production)

## Environment Variables Required
```
# Database Configuration
DATABASE_URL=postgresql://user:password@host:port/database

# Server Configuration
PORT=5000 # Optional, defaults to 5000
HOST=0.0.0.0 # Optional, defaults to 0.0.0.0
NODE_ENV=production
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Authentication
SESSION_SECRET=your_secure_session_secret

# Payment Processing
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

## Build Process
1. Install dependencies:
```bash
npm install
```

2. Build the application:
```bash
npm run build
```

This will:
- Build the frontend assets (in `dist/public`)
- Compile the server code (in `dist/index.js`)

## Database Setup
The application uses Drizzle ORM for database management. To set up your database:

1. Make sure your PostgreSQL database is running and accessible
2. Set the `DATABASE_URL` environment variable
3. Run migrations:
```bash
npm run db:push
```

## Production Deployment Steps

### 1. Server Requirements
- Minimum 512MB RAM
- 1GB storage space
- Node.js runtime environment
- PostgreSQL database (version 12 or higher)
- HTTPS support for secure sessions
- Static file serving capability

### 2. Server Setup
1. Clone the repository or upload the built files
2. Set up all required environment variables
3. Install production dependencies:
```bash
npm install --production
```

### 3. Running in Production
Start the production server:
```bash
NODE_ENV=production node dist/index.js
```

For production deployment, we recommend using a process manager like PM2:
```bash
npm install -g pm2
pm2 start dist/index.js --name imagenwiz
```

### 4. Nginx Configuration (Recommended)
If using Nginx as a reverse proxy:

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

    location / {
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
}
```

### 5. Health Checks
The application provides a health check endpoint at `/api/health` that returns HTTP 200 when the application is ready to accept requests.

### 6. Monitoring
For production monitoring, consider:
- Setting up application monitoring (e.g., New Relic, Datadog)
- Configuring log aggregation
- Setting up alerts for error rates and response times

### 7. Backup Strategy
Ensure regular backups of:
- PostgreSQL database
- User uploaded content
- Environment configuration

## Troubleshooting
Common issues and solutions:

1. Database Connection Issues:
   - Verify DATABASE_URL is correct
   - Check database user permissions
   - Ensure database is accessible from the application server

2. Static Files Not Loading:
   - Verify the build process completed successfully
   - Check Nginx configuration for static file serving
   - Ensure proper file permissions

3. Session Issues:
   - Verify SESSION_SECRET is set
   - Check cookie settings and domain configuration
   - Ensure HTTPS is properly configured

For additional support or issues, please refer to our documentation or create an issue in the repository.

## Updating Your Deployed Application

### 1. Preparation
Before updating your production application:
1. Back up your database
2. Back up your environment configuration
3. Test the updates locally first

### 2. Update Process
Follow these steps to update your application:

1. On your local development environment:
   ```bash
   # Pull latest changes
   git pull origin main

   # Install any new dependencies
   npm install

   # Build the application
   npm run build
   ```

2. On your production server:
   ```bash
   # Stop the application (if using PM2)
   pm2 stop imagenwiz

   # Back up your current deployment
   cp -r dist dist_backup

   # Deploy the new build
   # Replace the contents of your deployment directory with the new build

   # Install any new dependencies
   npm install --production

   # Apply any database migrations
   npm run db:push

   # Restart the application
   pm2 restart imagenwiz
   ```

### 3. Rollback Process
If issues occur after deployment:

1. Stop the new deployment:
   ```bash
   pm2 stop imagenwiz
   ```

2. Restore the backup:
   ```bash
   # Restore the previous version
   rm -rf dist
   mv dist_backup dist

   # Restart the application
   pm2 restart imagenwiz
   ```

### 4. Post-Update Checks
After updating:
1. Monitor the application logs for any errors
2. Check the health check endpoint
3. Verify critical functionality
4. Monitor performance metrics

### 5. Update Best Practices
- Schedule updates during low-traffic periods
- Always maintain a backup of the previous working version
- Test all updates in a staging environment first
- Keep track of all environment variables and configuration changes
- Monitor the application closely for 24 hours after updates
- Document all updates and any special procedures required