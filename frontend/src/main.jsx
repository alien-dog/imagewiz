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
    // Catch any direct attempts to use /payment/... endpoints without /api prefix
    if (config.url && config.url.startsWith('/payment/')) {
      console.error(`⚠️ INTERCEPTED: Attempted direct backend access to ${config.url}`);
      console.error('Stack trace:', new Error().stack);
      // Fix the URL to use the proper API prefix
      config.url = `/api${config.url}`;
      console.log(`✅ FIXED: Automatically corrected URL to ${config.url}`);
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