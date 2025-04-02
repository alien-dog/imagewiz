import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { CheckCircle, ArrowRight, Loader2 } from 'lucide-react';

const PaymentSuccessPage = () => {
  const { user, refreshUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [error, setError] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [redirectCountdown, setRedirectCountdown] = useState(3);
  
  // Extract payment information from URL
  useEffect(() => {
    // Track if component is mounted to prevent state updates after unmount
    let isMounted = true;
    
    // Only run once flag to prevent repeated verification
    const alreadyRun = React.useRef(false);
    
    const verifyPayment = async () => {
      // Skip if already run
      if (alreadyRun.current) {
        return;
      }
      
      // Mark as run immediately to prevent double execution
      alreadyRun.current = true;
      
      try {
        if (!isMounted) return;
        setLoading(true);
        setError(null);
        
        // For Stripe hosted checkout, we get a session_id in the URL
        const params = new URLSearchParams(window.location.search);
        const sessionId = params.get('session_id');
        
        if (!sessionId) {
          throw new Error('No payment session information found.');
        }
        
        console.log('Verifying payment with session ID:', sessionId);
        
        // Verify payment with backend
        const token = localStorage.getItem('token');
        const response = await axios.get(`/api/payment/verify?session_id=${sessionId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('Payment verification response:', response.data);
        
        if (response.data.status === 'success' && isMounted) {
          setPaymentVerified(true);
          setPaymentDetails({
            packageName: response.data.package_name || 'Credit Package',
            amountPaid: response.data.amount_paid || 0,
            creditsAdded: response.data.credits_added || 0,
            isYearly: response.data.is_yearly || false
          });
          
          // Refresh user data to get updated credit balance
          await refreshUser();
          
          // Auto-redirect to dashboard after countdown
          console.log('Payment successful, starting redirect countdown...');
          // Start countdown timer
          const countdownInterval = setInterval(() => {
            if (isMounted) {
              setRedirectCountdown(prev => {
                if (prev <= 1) {
                  clearInterval(countdownInterval);
                  navigate('/dashboard');
                  return 0;
                }
                return prev - 1;
              });
            } else {
              clearInterval(countdownInterval);
            }
          }, 1000);
        } else if (isMounted) {
          throw new Error('Payment verification failed.');
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error verifying payment:', err);
          setError('We could not verify your payment. Please contact support if your credits are not applied.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    verifyPayment();
    
    // Cleanup function to prevent memory leaks and state updates after unmount
    return () => {
      isMounted = false;
    };
  }, [location, refreshUser, navigate]);
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-teal-500 mb-4" />
        <p className="text-gray-600">Verifying your payment...</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 pt-16 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-teal-600 py-4 px-6">
            <h1 className="text-xl font-semibold text-white">Payment {paymentVerified ? 'Successful' : 'Status'}</h1>
          </div>
          
          <div className="p-6">
            {error ? (
              <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
                {error}
              </div>
            ) : paymentVerified ? (
              <div className="text-center py-8">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You for Your Purchase!</h2>
                <p className="text-gray-600 mb-6">
                  Your payment was successful and your credits have been added to your account.
                </p>
                
                {paymentDetails && (
                  <div className="bg-gray-50 rounded-md p-4 max-w-sm mx-auto mb-8 text-left">
                    <div className="font-medium text-lg text-gray-900 mb-2">Order Details</div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-600">Package:</span>
                      <span className="font-medium">{paymentDetails.packageName}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-600">Billing Period:</span>
                      <span className="font-medium">{paymentDetails.isYearly ? 'Yearly' : 'Monthly'}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-600">Amount Paid:</span>
                      <span className="font-medium">${paymentDetails.amountPaid}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-600">Credits Added:</span>
                      <span className="font-medium">{paymentDetails.creditsAdded}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Current Balance:</span>
                      <span className="font-medium">{user?.credit_balance || 0} credits</span>
                    </div>
                  </div>
                )}
                
                <div className="flex flex-col items-center justify-center">
                  <p className="text-sm text-gray-500 mb-2">
                    Redirecting to dashboard in {redirectCountdown} seconds...
                  </p>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 transition-colors"
                  >
                    Go to Dashboard Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-500 p-4 text-yellow-700">
                  We're having trouble confirming your payment. If your payment was successful, your credits will be added to your account shortly.
                </div>
                
                <button
                  onClick={() => navigate('/dashboard')}
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 transition-colors"
                >
                  Return to Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;