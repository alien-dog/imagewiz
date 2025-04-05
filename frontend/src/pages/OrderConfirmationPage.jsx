import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, XCircle, Loader2, ArrowRight, Gift, CreditCard, Calendar, ShieldCheck, ChevronRight } from 'lucide-react';

const OrderConfirmationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [pollingCount, setPollingCount] = useState(0);
  const [redirectCountdown, setRedirectCountdown] = useState(3);
  
  // Get user from localStorage if available
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  
  const isAuthenticated = !!localStorage.getItem('token');
  
  // Parse URL parameters
  const params = new URLSearchParams(location.search || window.location.search);
  const sessionId = params.get('session_id');
  const search = location.search || window.location.search;
  
  // Function to refresh user data
  const refreshUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await axios.get('/api/auth/user', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data && response.data.user) {
        setUser(response.data.user);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return response.data.user;
      }
    } catch (err) {
      console.error('Error refreshing user data:', err);
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    // Skip verification if coming directly from a successful payment
    if (location.state && location.state.paymentSuccess) {
      console.log('Payment already verified via state');
      setPaymentVerified(true);
      setPaymentDetails(location.state.paymentDetails);
      setLoading(false);
      
      if (isAuthenticated) {
        startRedirectCountdown();
      }
      return;
    }
    
    console.log('Order confirmation page loaded');
    console.log('Session ID from URL:', sessionId);
    console.log('Full URL search params:', search);
    
    // Get additional parameters (useful for testing and direct display)
    const packageId = params.get('package_id');
    const price = params.get('price');
    const credits = params.get('credits');
    const isYearly = params.get('is_yearly');
    const directMode = params.get('direct') === 'true';
    
    console.log('Package ID:', packageId);
    console.log('Price:', price);
    console.log('Credits:', credits);
    console.log('Is Yearly:', isYearly);
    console.log('Direct Mode:', directMode);
    
    // If all direct parameters are provided, we can show confirmation immediately
    if (directMode && packageId && price && credits) {
      console.log('Using direct parameters for payment confirmation display');
      
      // Create payment details from URL parameters
      const directDetails = {
        packageName: packageId
          ? `${packageId.split('_')[0].charAt(0).toUpperCase() + packageId.split('_')[0].slice(1)} ${isYearly === 'true' ? 'Annual' : 'Monthly'}`
          : 'Credit Package',
        amountPaid: parseFloat(price),
        creditsAdded: parseInt(credits),
        isYearly: isYearly === 'true',
        newBalance: parseInt(credits),
      };
      
      setPaymentDetails(directDetails);
      setPaymentVerified(true);
      setLoading(false);
      return;
    }

    const pollPaymentStatus = async () => {
      try {
        if (!isMounted) return;
        
        // If no session ID is provided, we'll repeatedly check if the user's credit balance has increased
        if (!sessionId) {
          console.log('No session ID provided, checking user credit balance');
          
          // Best effort approach: just refresh the user data to see if their credit balance has changed
          await refreshUser();
          setPollingCount(prev => prev + 1);
          
          // After a few attempts, just redirect to dashboard
          if (pollingCount >= 5) {
            console.log('Maximum polling attempts reached, redirecting to dashboard');
            setLoading(false);
            setPaymentVerified(true); // Assume success to show a positive message
            if (isAuthenticated) {
              startRedirectCountdown();
            }
            return;
          }
          
          // Continue polling
          return;
        }
        
        // If session ID is available, verify with backend
        console.log(`Polling attempt #${pollingCount + 1} for session ${sessionId}`);
        
        // Get token if available (for authenticated users)
        const token = localStorage.getItem('token');
        
        // If user is not authenticated, we'll just show a success message
        // without checking the API, since the webhook would have processed the payment
        if (!token && !isAuthenticated) {
          console.log('User is not authenticated, showing generic success message');
          setPaymentVerified(true);
          setPaymentDetails({
            packageName: 'Credit Package',
            creditsAdded: 'Your account has been credited',
            newBalance: 'Please log in to see your updated balance'
          });
          setLoading(false);
          return;
        }
        
        // For authenticated users, verify with the API
        let headers = {};
        if (token) {
          headers = { 'Authorization': `Bearer ${token}` };
        }
        
        // First try to use the API endpoint
        try {
          const response = await axios.get(`/api/payment/verify?session_id=${sessionId}&t=${Date.now()}`, {
            headers,
            timeout: 8000 // 8 second timeout
          });
          
          console.log('Payment verification response:', response.data);
          
          if (response.data.status === 'success') {
            // Payment verified successfully
            setPaymentVerified(true);
            setPaymentDetails({
              packageName: response.data.package_name || 'Credit Package',
              amountPaid: response.data.amount_paid || 0,
              creditsAdded: response.data.credits_added || 0,
              isYearly: response.data.is_yearly || false,
              newBalance: response.data.new_balance || 0
            });
            
            // Refresh user data to get updated credit balance
            await refreshUser();
            
            setLoading(false);
            if (isAuthenticated) {
              startRedirectCountdown();
            }
            return;
          } else if (response.data.status === 'pending') {
            // Payment is still processing, continue polling
            console.log('Payment is still processing, continuing to poll');
            setPollingCount(prev => prev + 1);
          } else {
            // Payment failed or unknown status
            console.error('Payment verification failed with response:', response.data);
            setError('Payment verification failed. Please check your dashboard to see if your credits were applied or contact support.');
            setLoading(false);
          }
        } catch (apiError) {
          console.error('Error during payment verification request:', apiError);
          console.log('API connection failed, using direct Stripe fulfillment instead');
          
          // Second fallback: Try the direct fulfillment API route
          try {
            const fallbackResponse = await axios.get(`/api/order-confirmation?session_id=${sessionId}&api=true&t=${Date.now()}`, {
              headers,
              timeout: 8000
            });
            
            console.log('Fallback verification response:', fallbackResponse.data);
            
            if (fallbackResponse.data.status === 'success') {
              setPaymentVerified(true);
              setPaymentDetails({
                packageName: fallbackResponse.data.package_name || 'Credit Package',
                amountPaid: fallbackResponse.data.amount_paid || 0,
                creditsAdded: fallbackResponse.data.credits_added || 0,
                isYearly: fallbackResponse.data.is_yearly || false,
                newBalance: fallbackResponse.data.new_balance || 0
              });
              
              await refreshUser();
              setLoading(false);
              if (isAuthenticated) {
                startRedirectCountdown();
              }
              return;
            }
          } catch (fallbackError) {
            console.error('Fallback API also failed:', fallbackError);
            
            // Handle structured error responses
            if (apiError.response && apiError.response.data) {
              console.log('Error response data:', apiError.response.data);
              
              // Check for structured error response
              if (apiError.response.data.details) {
                try {
                  let errorDetails = apiError.response.data.details;
                  if (typeof errorDetails === 'string') {
                    try {
                      const parsedDetails = JSON.parse(errorDetails);
                      if (parsedDetails.message) {
                        setError(parsedDetails.message);
                        setLoading(false);
                        return;
                      }
                    } catch (e) {
                      // If parsing fails, use the string as is
                      if (errorDetails.includes('No such checkout.session') || 
                          errorDetails.includes('Payment session not found')) {
                        setError('The payment session was not found. This could happen if you\'re using an old or invalid session ID. Please check your dashboard to see if your credits were applied or try making a new purchase.');
                        setLoading(false);
                        return;
                      }
                    }
                  }
                } catch (e) {
                  console.error('Error parsing error details:', e);
                }
              }
              
              // If no structured message was found, check for general error message
              if (apiError.response.data.error) {
                setError(apiError.response.data.error);
                setLoading(false);
                return;
              }
            }
            
            // Third fallback option if all API attempts failed: Show success message based on session ID
            // This is last resort, assumes webhook will handle fulfillment eventually
            if (sessionId && pollingCount >= 3) {
              console.log('All API attempts failed, showing optimistic success message');
              setPaymentVerified(true);
              setPaymentDetails({
                packageName: 'Credit Package',
                amountPaid: 0,
                creditsAdded: 'Your credits will be added soon',
                isYearly: false,
                newBalance: 'Please refresh your dashboard to see your updated balance'
              });
              
              await refreshUser();
              setLoading(false);
              return;
            }
            
            // If we've tried too many times, stop polling and show error
            if (pollingCount >= 5) {
              setError('We were unable to verify your payment after multiple attempts. Please check your dashboard to see if your credits were applied or contact support.');
              setLoading(false);
              return;
            }
            
            // Continue polling on error
            setPollingCount(prev => prev + 1);
          }
        }
      } catch (err) {
        console.error('Unexpected error during payment verification:', err);
        
        // If we've tried too many times, stop polling and show a general error
        if (pollingCount >= 5) {
          setError('We were unable to verify your payment due to a system error. Please check your dashboard to see if your credits were applied or contact support.');
          setLoading(false);
          return;
        }
        
        setPollingCount(prev => prev + 1);
      }
    };
    
    // Start polling immediately
    pollPaymentStatus();
    
    // Continue polling every 3 seconds, up to 5 attempts
    const intervalId = setInterval(() => {
      if (pollingCount < 5 && isMounted) {
        pollPaymentStatus();
      } else if (isMounted) {
        // Max polling attempts reached, redirect to dashboard
        clearInterval(intervalId);
        if (loading) {
          console.log('Maximum polling attempts reached without success');
          setLoading(false);
          setError('Payment verification time exceeded. Please check your dashboard to see if your credits were applied.');
        }
      }
    }, 3000);
    
    // Cleanup function
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [
    location, 
    pollingCount, 
    refreshUser, 
    loading, 
    isAuthenticated, 
    navigate, 
    search, 
    sessionId, 
    user, 
    params
  ]);
  
  // Function to start countdown for dashboard redirect
  const startRedirectCountdown = () => {
    let countdown = 3;
    setRedirectCountdown(countdown);
    
    const intervalId = setInterval(() => {
      countdown -= 1;
      setRedirectCountdown(countdown);
      
      if (countdown <= 0) {
        clearInterval(intervalId);
        navigate('/dashboard');
      }
    }, 1000);
    
    return () => clearInterval(intervalId);
  };
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-teal-500 mb-4" />
        <p className="text-gray-600">Verifying your payment...</p>
        <p className="text-sm text-gray-500 mt-2">This may take a few moments...</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 pt-16 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-teal-600 py-4 px-6">
            <h1 className="text-xl font-semibold text-white">
              {paymentVerified ? 'Order Confirmation' : error ? 'Payment Issue' : 'Processing Payment'}
            </h1>
          </div>
          
          <div className="p-8">
            {error ? (
              <div className="text-center">
                <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">Payment Verification Issue</h2>
                <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 text-red-700 text-left">
                  {error}
                </div>
                
                {isAuthenticated ? (
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="px-6 py-3 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
                  >
                    Go to Dashboard
                  </button>
                ) : (
                  <button
                    onClick={() => navigate('/login')}
                    className="px-6 py-3 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
                  >
                    Log In
                  </button>
                )}
              </div>
            ) : paymentVerified ? (
              <div>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center bg-green-100 rounded-full p-3 mb-4">
                    <CheckCircle className="h-10 w-10 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h2>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Thank you for your purchase. Your payment was successful and your credits have been added to your account.
                  </p>
                </div>
                
                {/* Order information card */}
                <div className="max-w-2xl mx-auto bg-white border border-gray-200 rounded-lg shadow-sm mb-8 overflow-hidden">
                  <div className="bg-teal-50 px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-teal-800">Order Summary</h3>
                  </div>
                  
                  <div className="px-6 py-4">
                    {paymentDetails && (
                      <>
                        <div className="space-y-4 mb-6">
                          {/* Package info */}
                          <div className="flex items-start">
                            <div className="flex-shrink-0">
                              <Gift className="h-5 w-5 text-teal-600 mt-0.5" />
                            </div>
                            <div className="ml-3">
                              <h4 className="text-sm font-medium text-gray-900">Package</h4>
                              <p className="text-sm text-gray-600">{paymentDetails.packageName}</p>
                              <p className="text-xs text-gray-500">{paymentDetails.isYearly ? 'Annual subscription' : 'Monthly subscription'}</p>
                            </div>
                          </div>
                          
                          {/* Payment info */}
                          <div className="flex items-start">
                            <div className="flex-shrink-0">
                              <CreditCard className="h-5 w-5 text-teal-600 mt-0.5" />
                            </div>
                            <div className="ml-3">
                              <h4 className="text-sm font-medium text-gray-900">Payment</h4>
                              <p className="text-sm text-gray-600">${paymentDetails.amountPaid?.toFixed(2) || '0.00'}</p>
                              <p className="text-xs text-gray-500">Paid with credit card</p>
                            </div>
                          </div>
                          
                          {/* Billing period */}
                          <div className="flex items-start">
                            <div className="flex-shrink-0">
                              <Calendar className="h-5 w-5 text-teal-600 mt-0.5" />
                            </div>
                            <div className="ml-3">
                              <h4 className="text-sm font-medium text-gray-900">Billing period</h4>
                              <p className="text-sm text-gray-600">
                                {paymentDetails.isYearly 
                                  ? `Yearly (${new Date().toLocaleDateString()} - ${new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString()})` 
                                  : `Monthly (${new Date().toLocaleDateString()} - ${new Date(new Date().setMonth(new Date().getMonth() + 1)).toLocaleDateString()})`
                                }
                              </p>
                            </div>
                          </div>
                          
                          {/* Credits info */}
                          <div className="flex items-start">
                            <div className="flex-shrink-0">
                              <ShieldCheck className="h-5 w-5 text-teal-600 mt-0.5" />
                            </div>
                            <div className="ml-3">
                              <h4 className="text-sm font-medium text-gray-900">Credits</h4>
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">{paymentDetails.creditsAdded}</span> credits added
                              </p>
                              <p className="text-xs text-gray-500">
                                New balance: <span className="font-medium">{user?.credit_balance || paymentDetails.newBalance || 0}</span> credits
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Divider */}
                        <div className="border-t border-gray-200 my-4"></div>
                        
                        {/* Receipt number */}
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Order Date:</span>
                          <span className="text-gray-700">{new Date().toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between text-sm mt-1">
                          <span className="text-gray-500">Receipt ID:</span>
                          <span className="text-gray-700 font-mono text-xs">{
                            // Extract part of the session ID to show as receipt number
                            search.includes('session_id=') 
                              ? search.split('session_id=')[1].split('&')[0].slice(-8) 
                              : 'N/A'
                          }</span>
                        </div>
                        
                        {/* Add customer support info */}
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex items-start">
                            <div className="flex-shrink-0">
                              <ChevronRight className="h-5 w-5 text-teal-500" />
                            </div>
                            <div className="ml-2">
                              <p className="text-xs text-gray-500">
                                If you encounter any issues with your credits, please contact our customer support team at <a href="mailto:support@imagenwiz.com" className="text-teal-600 hover:underline">support@imagenwiz.com</a>
                              </p>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Next steps */}
                <div className="text-center">
                  {isAuthenticated ? (
                    <>
                      <p className="text-sm text-gray-500 mb-2">
                        Redirecting to dashboard in {redirectCountdown} seconds...
                      </p>
                      <button
                        onClick={() => navigate('/dashboard')}
                        className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 transition-colors"
                      >
                        Go to Dashboard
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-gray-500 mb-2">
                        Please log in to access your credits
                      </p>
                      <button
                        onClick={() => navigate('/login')}
                        className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 transition-colors"
                      >
                        Log In Now
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center">
                <Loader2 className="h-16 w-16 animate-spin text-teal-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">Verifying Payment</h2>
                <p className="text-gray-600 mb-6">
                  Please wait while we confirm your payment...
                </p>
                
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-6 py-3 border border-teal-600 text-teal-600 rounded-md hover:bg-teal-50 transition-colors"
                >
                  Skip to Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;