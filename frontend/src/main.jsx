import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import App from './App';
import './index.css';

// Set axios defaults globally
axios.defaults.baseURL = 'http://e3d010d3-10b7-4398-916c-9569531b7cb9-00-nzrxz81n08w.kirk.replit.dev:80';
console.log('Axios baseURL set globally to:', axios.defaults.baseURL);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);