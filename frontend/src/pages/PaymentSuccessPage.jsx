import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { CheckCircle, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

const PaymentSuccessPage = () => {
  const { user, refreshUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [error, setError] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [verificationAttempt, setVerificationAttempt] = useState(0);
  const [redirectCountdown, setRedirectCountdown] = useState(5);
  
  // Check for redirect loops by analyzing URL parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const redirectCount = parseInt(params.get('_redirect_count') || '0', 10);
    
    if (redirectCount > 2) {
      // If we've been redirected too many times, log the issue and provide direct access to dashboard
      console.error(`Detected redirect loop (${redirectCount} redirects)`);
      setError('We detected a redirect issue. Please use the button below to go to your dashboard.');
      setLoading(false);
    }
  }, []);
  
  // Extract payment information from URL and verify payment
  useEffect(() => {
    // Skip verification if we've detected a redirect loop
    if (error && error.includes('redirect issue')) {
      return;
    }
    
    // Track if component is mounted to prevent state updates after unmount
    let isMounted = true;
    
    // Only run once flag to prevent repeated verification
    const verificationRunning = React.useRef(false);
    
    const verifyPayment = async () => {
      // Skip if verification is already running
      if (verificationRunning.current) {
        return;
      }
      
      // Mark as running to prevent double execution
      verificationRunning.current = true;
      
      try {
        if (!isMounted) return;
        
        // For Stripe hosted checkout, we get a session_id in the URL
        const params = new URLSearchParams(window.location.search);
        const sessionId = params.get('session_id');
        
        // Debug payment verification
        console.log('Payment verification attempt #', verificationAttempt);
        console.log('Payment verification triggered with URL params:', window.location.search);
        console.log('Session ID from URL:', sessionId);
        
        if (!sessionId) {
          console.error('ERROR: No session_id found in URL parameters');
          // Instead of throwing error, show a recovery UI
          setError('No payment session information found. If you have completed a payment, please check your dashboard to see if credits were added or contact support.');
          setLoading(false);
          verificationRunning.current = false;
          return; // Exit early instead of throwing
        }
        
        console.log('Verifying payment with session ID:', sessionId);
        
        // Verify payment with backend
        const token = localStorage.getItem('token');
        
        // Add more detailed logging for debugging
        console.log('Sending payment verification request to API');
        console.log('API base URL:', axios.defaults.baseURL);
        console.log('Auth token present:', !!token);
        
        if (!token) {
          console.error('No auth token available for payment verification');
          setError('You need to be logged in to verify your payment. Please log in and check your dashboard.');
          setLoading(false);
          verificationRunning.current = false;
          return;
        }
        
        // Add timeout for robustness
        try {
          const response = await axios.get(`/api/payment/verify?session_id=${sessionId}&t=${Date.now()}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            },
            timeout: 10000 // 10 second timeout
          });
          
          console.log('Payment verification response:', response.data);
          
          if (response.data.status === 'success' && isMounted) {
            setPaymentVerified(true);
            setPaymentDetails({
              packageName: response.data.package_name || 'Credit Package',
              amountPaid: response.data.amount_paid || 0,
              creditsAdded: response.data.credits_added || 0,
              isYearly: response.data.is_yearly || false,
              newBalance: response.data.new_balance || 0
            });
            
            // Log payment details for debugging
            console.log('Payment details from backend:', response.data);
            console.log('Credits added:', response.data.credits_added);
            console.log('New balance should be:', response.data.new_balance);
            
            // Refresh user data to get updated credit balance
            await refreshUser();
            
            // Show success UI first (don't redirect automatically) to allow user to see purchase details
            console.log('Payment successful, showing success UI');
            setLoading(false);
            
            // Start countdown for dashboard redirect
            let countdown = 5;
            setRedirectCountdown(countdown);
            
            const intervalId = setInterval(() => {
              countdown -= 1;
              setRedirectCountdown(countdown);
              
              if (countdown <= 0) {
                clearInterval(intervalId);
                console.log('Countdown complete, redirecting to dashboard...');
                navigate('/dashboard');
              }
            }, 1000);
            
            // Cleanup interval on unmount
            return () => clearInterval(intervalId);
          } else if (isMounted) {
            console.error('Payment verification failed with response:', response.data);
            
            // If this is not our final attempt, try again
            if (verificationAttempt < 2) {
              console.log(`Verification attempt ${verificationAttempt + 1} failed, will retry...`);
              setVerificationAttempt(prev => prev + 1);
              verificationRunning.current = false;
              return;
            }
            
            setError('Payment verification failed. Please check your dashboard to see if your credits were applied or contact support.');
            setLoading(false);
          }
        } catch (err) {
          console.error('Error during payment verification request:', err);
          
          // If this is not our final attempt, try again
          if (verificationAttempt < 2 && isMounted) {
            console.log(`Verification attempt ${verificationAttempt + 1} failed with error, will retry...`);
            setVerificationAttempt(prev => prev + 1);
            verificationRunning.current = false;
            return;
          }
          
          if (isMounted) {
            setError('We could not verify your payment. Please check your dashboard to see if your credits were applied or contact support.');
            setLoading(false);
          }
        }
      } finally {
        if (isMounted) {
          verificationRunning.current = false;
        }
      }
    };
    
    // Only execute payment verification if we haven't reached max attempts
    if (verificationAttempt < 3) {
      verifyPayment();
    } else if (loading) {
      // If we've reached max attempts and are still loading, show error
      setError('Maximum verification attempts reached. Please check your dashboard to see if your credits were applied.');
      setLoading(false);
    }
    
    // Cleanup function to prevent memory leaks and state updates after unmount
    return () => {
      isMounted = false;
    };
  }, [location, refreshUser, navigate, verificationAttempt, error]);
  
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
                      <span className="font-medium">{user?.credits || 0} credits</span>
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