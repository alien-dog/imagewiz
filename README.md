# iMagenWiz Deployment Guide

## Splitting Frontend and Backend Deployment

### Frontend Deployment
1. Environment Setup:
```bash
# Frontend environment variables
VITE_API_URL=https://your-backend-domain.com  # Backend API URL
```

2. Build the frontend:
```bash
cd client
npm install
npm run build
```

3. Deploy the built frontend files (in `dist/`) to your web server
   - The built files are static and can be served by any web server (Nginx, Apache, etc.)
   - Configure your web server to serve the frontend files and handle client-side routing

### Backend Deployment
1. Environment Variables Required:
```bash
# Database Configuration
DATABASE_URL=postgresql://user:password@host:port/database

# Server Configuration
PORT=5000
HOST=0.0.0.0
NODE_ENV=production
ALLOWED_ORIGINS=https://your-frontend-domain.com  # Comma-separated list of allowed frontend origins

# Authentication
SESSION_SECRET=your_secure_session_secret

# Payment Processing
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

2. Install dependencies and start the server:
```bash
cd server
npm install
npm run build
NODE_ENV=production node dist/index.js
```

## Security Considerations for Split Deployment

### CORS Configuration
- The backend is configured to accept requests only from specified origins
- Update `ALLOWED_ORIGINS` to include your frontend domain
- Ensure `credentials: true` is set for handling authentication cookies

### Session Management
- Session cookies are configured to work across different domains
- Ensure proper SSL/TLS configuration on both frontend and backend
- Set appropriate cookie security options (Secure, SameSite)

### SSL/TLS
- Both frontend and backend should use HTTPS in production
- Configure SSL certificates for both domains
- Update frontend API calls to use HTTPS endpoints

## Monitoring and Maintenance

### Frontend Monitoring
- Set up error tracking (e.g., Sentry)
- Configure performance monitoring
- Implement user analytics

### Backend Monitoring
- Monitor API endpoint performance
- Set up database connection monitoring
- Configure error logging and alerting

## Scaling Considerations

### Frontend Scaling
- Use a CDN for static assets
- Implement caching strategies
- Consider regional deployments

### Backend Scaling
- Configure load balancing
- Implement horizontal scaling
- Monitor and optimize database performance

## Troubleshooting

### Frontend Issues
1. API Connection Problems:
   - Verify VITE_API_URL is correct
   - Check CORS configuration
   - Validate SSL certificates

2. Build Issues:
   - Clear build cache
   - Update dependencies
   - Check build logs

### Backend Issues
1. Database Connection:
   - Verify DATABASE_URL is correct
   - Check database user permissions
   - Ensure database is accessible

2. CORS Errors:
   - Verify ALLOWED_ORIGINS includes frontend domain
   - Check request headers
   - Validate CORS configuration

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