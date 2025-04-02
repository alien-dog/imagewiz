import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { ArrowLeft, Loader2 } from 'lucide-react';

const CheckoutPage = () => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [packageDetails, setPackageDetails] = useState(null);

  useEffect(() => {
    if (!location.state?.packageDetails) {
      navigate('/pricing');
      return;
    }

    setPackageDetails(location.state.packageDetails);
    
    // Create Stripe checkout session and redirect
    const createCheckoutSession = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        const payload = {
          package_id: location.state.packageDetails.isYearly 
            ? location.state.packageDetails.packageName.includes('Lite') ? 'lite_yearly' : 'pro_yearly'
            : location.state.packageDetails.packageName.includes('Lite') ? 'lite_monthly' : 'pro_monthly',
          is_yearly: location.state.packageDetails.isYearly,
          // Determine price based on the package name
          price: location.state.packageDetails.packageName.includes('Lite') 
            ? (location.state.packageDetails.isYearly ? 106.8 : 9.9)
            : (location.state.packageDetails.isYearly ? 262.8 : 24.9)
        };
        
        console.log('Creating checkout session with payload:', payload);
        
        // Use the traditional checkout session API
        const response = await axios.post('/api/payment/create-checkout-session', payload, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('Stripe checkout session created:', response.data);
        
        // Redirect to Stripe's hosted checkout page
        window.location.href = response.data.url;
      } catch (err) {
        console.error('Error creating checkout session:', err);
        setError('Failed to initialize payment. Please try again or contact support.');
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      createCheckoutSession();
    } else {
      navigate('/login', { 
        state: { 
          redirectTo: '/checkout',
          packageDetails: location.state.packageDetails
        } 
      });
    }
  }, [isAuthenticated, location.state, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-teal-500 mb-4" />
        <p className="text-gray-600">Redirecting to secure checkout...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <button 
          onClick={() => navigate('/pricing')}
          className="flex items-center text-teal-600 mb-8 hover:text-teal-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Return to pricing
        </button>
        
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-teal-600 py-4 px-6">
            <h1 className="text-xl font-semibold text-white">Checkout</h1>
          </div>
          
          <div className="p-6">
            {error && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
                {error}
              </div>
            )}
            
            <div className="text-center py-10">
              <Loader2 className="h-12 w-12 animate-spin text-teal-500 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Redirecting to Stripe for secure checkout...</p>
              <p className="text-sm text-gray-500">If you are not redirected automatically, please click the button below.</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-4 bg-teal-500 hover:bg-teal-600 text-white font-medium py-2 px-4 rounded transition-colors"
              >
                Go to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;