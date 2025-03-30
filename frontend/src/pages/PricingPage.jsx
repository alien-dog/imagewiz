import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PricingPage = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);

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

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/payment/packages', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setPackages(response.data.packages);
        setLoading(false);
      } catch (err) {
        console.error('Error loading packages:', err);
        setError('Failed to load packages. Please refresh the page to try again.');
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  const handlePurchase = async (packageId) => {
    // Prevent multiple purchase attempts
    if (processingPayment) return;
    
    setSelectedPackage(packageId);
    setProcessingPayment(true);
    setError(''); // Clear any previous errors
    
    try {
      // Get the full current URL including protocol and host
      const baseUrl = window.location.origin;
      
      // Construct explicit absolute URLs for success and cancel
      const successUrl = `${baseUrl}/payment-success`;
      const cancelUrl = `${baseUrl}/pricing`;
      
      console.log(`Creating checkout session for package ${packageId}`, {
        packageId,
        successUrl,
        cancelUrl
      });
      
      const token = localStorage.getItem('token');
      console.log('Using authorization token:', token ? 'Token exists' : 'No token');
      
      // IMPORTANT FIX: Use the direct endpoint that works consistently
      // The issue was that we're not correctly routed to /api/payment/... 
      // Using /payment/... directly is properly proxied by the server
      const endpoint = '/payment/create-checkout-session';
      console.log('Making payment request to endpoint:', endpoint);
      
      // Get package details for better debugging
      const selectedPackage = packages.find(p => p.id === packageId) || 
                              defaultPackages.find(p => p.id === packageId);
                              
      console.log('Selected package details:', selectedPackage);
      
      // Include only minimal required fields - the server will handle success/cancel URLs
      const requestData = { 
        package_id: packageId,
        price: selectedPackage?.price || 0,
        credits: selectedPackage?.credits || 0,
        is_yearly: false
      };
      console.log('With payload:', requestData);
      
      const response = await axios.post(
        endpoint,
        requestData,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      console.log('Checkout session created:', response.data);
      
      // Redirect to Stripe Checkout
      if (response.data && response.data.url) {
        const checkoutUrl = response.data.url;
        console.log('Redirecting to Stripe checkout URL:', checkoutUrl);
        
        // Store the URL in localStorage for debugging/retry
        localStorage.setItem('stripeCheckoutUrl', checkoutUrl);
        
        // Set a message to inform the user
        setError("Redirecting to payment page...");
        
        // CHALLENGE: Stripe might be using the original URL for redirects causing /undefined
        console.log('Processing Stripe URL before redirect');
        
        // Verify URL - check if it's from Stripe checkout first
        if (!checkoutUrl.includes('checkout.stripe.com')) {
          setError("Invalid checkout URL received from server. Please try again.");
          setProcessingPayment(false);
          return;
        }
        
        // CRUCIAL FIX: Let's create our own return URL and pass it directly to Stripe
        try {
          // Create a new URL object to parse the Stripe URL
          const stripeUrl = new URL(checkoutUrl);
          
          // Get the current base URL directly from window.location
          const siteBaseUrl = window.location.origin;
          console.log('Using site base URL for redirects:', siteBaseUrl);
          
          // Create our success URL with the session ID parameter
          const successUrl = `${siteBaseUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`;
          const cancelUrl = `${siteBaseUrl}/pricing`;
          
          // Log the URLs for debugging
          console.log('Generated success URL:', successUrl);
          console.log('Generated cancel URL:', cancelUrl);
          
          // Create a modified URL by directly appending the return_url parameter
          // This is a more reliable approach than trying to modify Stripe's URL structure
          const finalUrl = `${checkoutUrl}&redirect_on_completion=always&success_url=${encodeURIComponent(successUrl)}&cancel_url=${encodeURIComponent(cancelUrl)}`;
          
          console.log('FINAL MODIFIED STRIPE URL:', finalUrl);
          localStorage.setItem('modifiedStripeUrl', finalUrl);
          
          // Show a message briefly before redirecting
          setError("Redirecting to secure payment page...");
          
          // Direct page redirect after a brief delay to show the message
          setTimeout(() => {
            window.location.href = finalUrl;
          }, 100);
          
        } catch (urlError) {
          console.error('Error modifying Stripe URL:', urlError);
          
          // Fallback to direct redirect with original URL if our enhancement fails
          console.log('FALLBACK: Using original URL for redirect');
          setError("Redirecting to Stripe checkout...");
          
          setTimeout(() => {
            window.location.href = checkoutUrl;
          }, 100);
        }
        
        // No further code needed - the page will redirect immediately
      } else {
        throw new Error('No checkout URL returned from server');
      }
    } catch (err) {
      console.error('Error creating checkout session:', err.response?.data || err.message);
      const errorDetails = err.response?.data ? JSON.stringify(err.response.data) : err.message;
      setError(`Payment failed: ${errorDetails}`);
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

  const displayPackages = packages.length > 0 ? packages : defaultPackages;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Simple, Transparent Pricing</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Choose the plan that works for you. All plans provide access to our AI-powered background removal tool.
        </p>
        <div className="mt-4">
          <a href="/test-stripe-open.html" target="_blank" className="text-sm text-blue-500 hover:underline">
            Test Stripe Checkout Directly
          </a>
        </div>
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