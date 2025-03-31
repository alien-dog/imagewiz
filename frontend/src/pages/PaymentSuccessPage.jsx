import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { CheckCircle, ArrowRight } from 'lucide-react';

const PaymentSuccessPage = () => {
  const { user, refreshUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [error, setError] = useState(null);
  const [packageDetails, setPackageDetails] = useState(null);
  
  // Extract payment information from URL or location state
  useEffect(() => {
    const verifyPayment = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Check if we have payment intent from URL (redirect flow) or from state (direct flow)
        const params = new URLSearchParams(window.location.search);
        const paymentIntentFromUrl = params.get('payment_intent');
        const paymentIntentFromState = location.state?.paymentIntentId;
        const paymentIntentId = paymentIntentFromUrl || paymentIntentFromState;
        
        if (!paymentIntentId) {
          throw new Error('No payment information found.');
        }
        
        // Store package details from state if available
        if (location.state?.packageDetails) {
          setPackageDetails(location.state.packageDetails);
        }
        
        // Verify payment with backend
        const token = localStorage.getItem('token');
        const response = await axios.get(`/api/payment/verify-intent/${paymentIntentId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.data.status === 'success') {
          setPaymentVerified(true);
          // Refresh user data to get updated credit balance
          await refreshUser();
        } else {
          throw new Error('Payment verification failed.');
        }
      } catch (err) {
        console.error('Error verifying payment:', err);
        setError('We could not verify your payment. Please contact support if your credits are not applied.');
      } finally {
        setLoading(false);
      }
    };
    
    verifyPayment();
  }, [location, refreshUser]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
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
                
                {packageDetails && (
                  <div className="bg-gray-50 rounded-md p-4 max-w-sm mx-auto mb-8 text-left">
                    <div className="font-medium text-lg text-gray-900 mb-2">Order Details</div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-600">Package:</span>
                      <span className="font-medium">{packageDetails.packageName}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-600">Billing Period:</span>
                      <span className="font-medium">{packageDetails.isYearly ? 'Yearly' : 'Monthly'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Credit Balance:</span>
                      <span className="font-medium">{user?.credit_balance || 0} credits</span>
                    </div>
                  </div>
                )}
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 transition-colors"
                  >
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                  <button
                    onClick={() => navigate('/upload')}
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-teal-600 bg-white border-teal-600 hover:bg-teal-50 transition-colors"
                  >
                    Process Images Now
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