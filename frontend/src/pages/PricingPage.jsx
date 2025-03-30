import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PricingPage = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        console.log('Fetching packages from /api/payment/packages');
        const response = await axios.get('/api/payment/packages');
        console.log('Packages response:', response.data);
        setPackages(response.data.packages);
      } catch (err) {
        console.error('Error fetching packages:', err);
        console.error('Error response:', err.response?.data);
        // Fall back to default packages defined below if the API call fails
        setError('Using default packages. API error: ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  const handlePurchase = async (packageId) => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/pricing');
      return;
    }

    if (processingPayment) return;

    setProcessingPayment(true);
    try {
      // Generate a base URL for success and cancel redirects
      const baseUrl = window.location.origin;
      const successUrl = `${baseUrl}/payment-success`;
      const cancelUrl = `${baseUrl}/pricing`;
      
      console.log(`Creating checkout session for package ${packageId}`, {
        packageId,
        successUrl,
        cancelUrl
      });
      
      const token = localStorage.getItem('token');
      console.log('Using authorization token:', token ? 'Token exists' : 'No token');
      
      const response = await axios.post(
        '/api/payment/create-checkout-session',  // Keep this path the same
        { 
          package_id: packageId,
          success_url: successUrl,
          cancel_url: cancelUrl
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      console.log('Checkout session created:', response.data);
      
      // Redirect to Stripe Checkout
      if (response.data.url) {
        console.log('Redirecting to Stripe checkout:', response.data.url);
        window.location.href = response.data.url;
      } else {
        throw new Error('No checkout URL returned from server');
      }
    } catch (err) {
      console.error('Error creating checkout session:', err.response?.data || err.message);
      setError('Failed to initiate payment. Please try again later.');
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  // Default packages if API fails
  const defaultPackages = [
    { 
      id: "basic", 
      name: "Starter", 
      price: 5.99, 
      credits: 50, 
      description: "Perfect for occasional use", 
      features: ["50 image processes", "Valid for 90 days", "Standard quality"] 
    },
    { 
      id: "standard", 
      name: "Pro", 
      price: 14.99, 
      credits: 200, 
      description: "Best value for regular users", 
      features: ["200 image processes", "Valid for 180 days", "High quality", "Priority support"] 
    },
    { 
      id: "premium", 
      name: "Business", 
      price: 39.99, 
      credits: 500, 
      description: "Ideal for professional use", 
      features: ["500 image processes", "Valid for 365 days", "Premium quality", "Priority support", "Bulk processing"] 
    }
  ];

  const displayPackages = packages.length > 0 ? packages : defaultPackages;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Simple, Transparent Pricing</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Choose the plan that works for you. All plans provide access to our AI-powered background removal tool.
        </p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-8 max-w-4xl mx-auto" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {displayPackages.map((pkg) => (
          <div 
            key={pkg.id} 
            className={`bg-white rounded-xl shadow-lg overflow-hidden transition-transform hover:scale-105 ${
              selectedPackage === pkg.id ? 'ring-2 ring-teal-500' : ''
            }`}
          >
            <div className="p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">{pkg.name}</h3>
              <div className="flex items-baseline mb-4">
                <span className="text-4xl font-extrabold text-gray-900">${pkg.price}</span>
              </div>
              <p className="text-gray-600 mb-6">{pkg.description}</p>
              
              <ul className="space-y-3 mb-8">
                {pkg.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <svg className="h-6 w-6 text-teal-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button
                onClick={() => handlePurchase(pkg.id)}
                className={`w-full py-3 px-6 rounded-md font-medium text-white ${
                  processingPayment
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-teal-500 hover:bg-teal-600'
                }`}
                disabled={processingPayment}
              >
                {processingPayment ? 'Processing...' : `Get ${pkg.credits} Credits`}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="max-w-4xl mx-auto mt-16 bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Frequently Asked Questions</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">How do credits work?</h3>
            <p className="text-gray-600">
              Each credit allows you to process one image. Credits are deducted from your account after successful processing.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">Do credits expire?</h3>
            <p className="text-gray-600">
              Yes, credits expire based on the package you purchase. Check the package details for expiration information.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">Can I use multiple credits on one image?</h3>
            <p className="text-gray-600">
              No, one credit is used per image processed. For complex images that require additional processing, premium features may be available in the future.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">What payment methods do you accept?</h3>
            <p className="text-gray-600">
              We accept all major credit cards, including Visa, Mastercard, and American Express through our secure payment processor, Stripe.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;