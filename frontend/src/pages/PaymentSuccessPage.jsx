import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const PaymentSuccessPage = () => {
  const [status, setStatus] = useState('loading');
  const [paymentDetails, setPaymentDetails] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshUser } = useAuth();
  
  useEffect(() => {
    const verifyPayment = async () => {
      // Extract session_id from URL query params
      const params = new URLSearchParams(location.search);
      const sessionId = params.get('session_id');
      
      if (!sessionId) {
        setStatus('error');
        return;
      }
      
      try {
        console.log('Verifying payment with session ID:', sessionId);
        const token = localStorage.getItem('token');
        const response = await axios.get(`/api/payment/verify?session_id=${sessionId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('Payment verification response:', response.data);
        setPaymentDetails(response.data);
        setStatus('success');
        
        // Refresh user data to update the credit balance
        const userData = await refreshUser();
        console.log('User data after refresh:', userData);
      } catch (error) {
        console.error('Payment verification error:', error.response?.data || error.message);
        setStatus('error');
      }
    };
    
    verifyPayment();
  }, [location.search, refreshUser]);

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
        {status === 'loading' && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-700">Verifying your payment...</h2>
            <p className="text-gray-600 mt-2">Please wait while we confirm your transaction.</p>
          </div>
        )}
        
        {status === 'success' && (
          <div className="text-center">
            <div className="bg-teal-100 rounded-full p-4 w-20 h-20 mx-auto mb-6">
              <svg className="w-12 h-12 text-teal-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Payment Successful!</h2>
            <p className="text-gray-600 mb-6">
              Thank you for your purchase. Your credits have been added to your account.
            </p>
            
            {paymentDetails && (
              <div className="border-t border-b border-gray-200 py-4 my-6">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Package:</span>
                  <span className="font-medium text-gray-800">{paymentDetails.package_name}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Amount Paid:</span>
                  <span className="font-medium text-gray-800">${paymentDetails.amount_paid}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Credits Added:</span>
                  <span className="font-medium text-gray-800">{paymentDetails.credits_added}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">New Balance:</span>
                  <span className="font-medium text-gray-800">{paymentDetails.new_balance} credits</span>
                </div>
              </div>
            )}
            
            <div className="flex justify-center space-x-4">
              <button 
                onClick={() => navigate('/dashboard')} 
                className="bg-teal-500 text-white px-6 py-2 rounded-md hover:bg-teal-600"
              >
                Go to Dashboard
              </button>
              <button 
                onClick={() => navigate('/payment-history')} 
                className="bg-gray-200 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-300"
              >
                View Payment History
              </button>
            </div>
          </div>
        )}
        
        {status === 'error' && (
          <div className="text-center">
            <div className="bg-red-100 rounded-full p-4 w-20 h-20 mx-auto mb-6">
              <svg className="w-12 h-12 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Payment Verification Failed</h2>
            <p className="text-gray-600 mb-6">
              We couldn't verify your payment. If you believe this is an error, please contact support with your payment details.
            </p>
            
            <div className="flex justify-center space-x-4">
              <button 
                onClick={() => navigate('/dashboard')} 
                className="bg-teal-500 text-white px-6 py-2 rounded-md hover:bg-teal-600"
              >
                Go to Dashboard
              </button>
              <button 
                onClick={() => navigate('/pricing')} 
                className="bg-gray-200 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-300"
              >
                Back to Pricing
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccessPage;