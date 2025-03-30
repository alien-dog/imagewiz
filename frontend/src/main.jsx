import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import App from './App';
import './index.css';

// Force axios to use relative URLs to ensure proxy works correctly
axios.defaults.baseURL = '';

// Add request interceptor to catch any direct backend access attempts
axios.interceptors.request.use(
  (config) => {
    console.log(`📡 DEBUG: Axios sending request to: ${config.url}`);
    
    // Catch direct attempts to use backend endpoints without /api prefix
    if (config.url) {
      // Important fix: Make sure /api/payment/create-checkout-session stays as is
      // This is the correct URL format and shouldn't be modified
      if (config.url === '/api/payment/create-checkout-session') {
        console.log(`✅ CORRECT URL: Using proper endpoint ${config.url}`);
      }
      // Handle direct /payment/create-checkout endpoint (without -session)
      else if (config.url === '/payment/create-checkout') {
        console.error(`⚠️ INTERCEPTED: Incorrect checkout endpoint ${config.url}`);
        // Fix the URL to use the proper endpoint name and API prefix
        config.url = `/api/payment/create-checkout-session`;
        console.log(`✅ FIXED: Automatically corrected URL to ${config.url}`);
      }
      // Handle direct /payment/... endpoints without /api prefix
      else if (config.url.startsWith('/payment/')) {
        console.error(`⚠️ INTERCEPTED: Attempted direct backend access to ${config.url}`);
        // Fix the URL to use the proper API prefix
        config.url = `/api${config.url}`;
        console.log(`✅ FIXED: Automatically corrected URL to ${config.url}`);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);