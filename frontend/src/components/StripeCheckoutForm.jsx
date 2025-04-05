import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { useAuth } from '../contexts/AuthContext';

const StripeCheckoutForm = ({ clientSecret, packageDetails }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't loaded yet. Make sure to disable
      // form submission until Stripe.js has loaded.
      return;
    }

    setProcessing(true);
    setMessage(null);
    
    // Ensure we have the auth token for JWT authentication
    const token = localStorage.getItem('token');
    if (!token) {
      setMessage("You must be logged in to complete this transaction.");
      setProcessing(false);
      return;
    }

    // Trigger form validation and wallet collection
    const { error: submitError } = await elements.submit();
    if (submitError) {
      setMessage(submitError.message);
      setProcessing(false);
      return;
    }

    try {
      // Calculate the base URL for redirects
      const url = new URL(window.location.href);
      let baseUrl;
      
      if (url.hostname.includes('.replit.dev')) {
        // For Replit domains, ALWAYS use https protocol with NO port
        baseUrl = `https://${url.hostname}`;
      } else if (url.hostname === 'localhost' || url.hostname === '0.0.0.0' || url.hostname === '127.0.0.1') {
        // For local development, keep the port
        baseUrl = window.location.origin;
      } else {
        // For all other environments, use clean URLs without ports
        baseUrl = `${url.protocol}//${url.hostname}`;
      }
      
      console.log('Using baseUrl for Stripe return_url:', baseUrl);
      
      // Confirm the payment
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          // For Replit hosted apps, construct URLs carefully to ensure redirection works
          return_url: `${baseUrl}/payment-verify?t=${Date.now()}`,
        },
        redirect: 'if_required',
      });

      if (error) {
        setMessage(error.message);
        setProcessing(false);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Payment succeeded, refresh user data and redirect to confirmation page
        await refreshUser(); // Refresh user data to update credit balance
        
        // Use payment-verify page for payment confirmation
        navigate(`/payment-verify?payment_intent=${paymentIntent.id}`, { 
          state: { 
            paymentIntentId: paymentIntent.id,
            packageDetails
          } 
        });
      } else {
        // Payment requires additional action, redirect should happen automatically
        setMessage("Your payment is processing...");
      }
    } catch (err) {
      console.error("Error confirming payment:", err);
      setMessage("An unexpected error occurred. Please try again.");
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <PaymentElement />
      
      {message && (
        <div className="mt-4 text-sm text-red-600">
          {message}
        </div>
      )}
      
      <button
        disabled={!stripe || processing}
        className={`w-full mt-6 py-3 px-4 rounded-md font-medium text-white ${
          !stripe || processing 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-teal-600 hover:bg-teal-700'
        } transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-600`}
      >
        {processing ? (
          <div className="flex items-center justify-center">
            <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
            Processing...
          </div>
        ) : (
          'Complete Payment'
        )}
      </button>
    </form>
  );
};

export default StripeCheckoutForm;