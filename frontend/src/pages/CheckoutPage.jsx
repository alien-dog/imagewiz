import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import StripeCheckoutForm from '../components/StripeCheckoutForm';
import axios from 'axios';
import { ArrowLeft } from 'lucide-react';

// Load Stripe outside of component render cycle
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CheckoutPage = () => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [packageDetails, setPackageDetails] = useState(null);

  useEffect(() => {
    if (!location.state?.packageDetails) {
      navigate('/pricing');
      return;
    }

    setPackageDetails(location.state.packageDetails);
    
    // Create PaymentIntent as soon as the page loads
    const createPaymentIntent = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.post('/api/payment/create-payment-intent', {
          priceId: location.state.packageDetails.priceId,
          packageName: location.state.packageDetails.packageName,
          isYearly: location.state.packageDetails.isYearly
        });
        
        setClientSecret(response.data.clientSecret);
      } catch (err) {
        console.error('Error creating payment intent:', err);
        setError('Failed to initialize payment. Please try again or contact support.');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      createPaymentIntent();
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  const appearance = {
    theme: 'stripe',
    variables: {
      colorPrimary: '#0d9488', // teal-600
      fontFamily: 'Inter, system-ui, sans-serif',
      borderRadius: '8px',
    },
  };

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
            
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-2">Order Summary</h2>
              {packageDetails && (
                <div className="bg-gray-50 rounded-md p-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Package:</span>
                    <span className="font-medium">{packageDetails.packageName}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Billing Period:</span>
                    <span className="font-medium">{packageDetails.isYearly ? 'Yearly' : 'Monthly'}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Account:</span>
                    <span className="font-medium">{user?.username}</span>
                  </div>
                </div>
              )}
            </div>
            
            <h2 className="text-lg font-medium text-gray-900 mb-4">Payment Details</h2>
            {clientSecret && (
              <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
                <StripeCheckoutForm clientSecret={clientSecret} packageDetails={packageDetails} />
              </Elements>
            )}
            
            <div className="mt-8 text-sm text-gray-500">
              <p>
                Your payment is processed securely through Stripe. We do not store your credit card information.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;