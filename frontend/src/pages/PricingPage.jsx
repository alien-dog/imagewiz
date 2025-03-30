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
      
      // Include detailed package info in the request to help with debugging
      const requestData = { 
        package_id: packageId,
        success_url: successUrl,
        cancel_url: cancelUrl,
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
        
        // DIRECT APPROACH 1: Try immediate window.location redirect
        try {
          console.log('1. TRYING DIRECT WINDOW.LOCATION REDIRECT');
          window.location.href = checkoutUrl;
          return; // Exit and let the redirect happen
        } catch (e) {
          console.error('window.location.href redirect failed:', e);
        }
        
        // If we're still here, the direct redirect didn't work
        // APPROACH 2: Try window.open in a new tab
        try {
          console.log('2. TRYING WINDOW.OPEN IN NEW TAB');
          const newTab = window.open(checkoutUrl, '_blank');
          
          if (newTab && !newTab.closed) {
            console.log('Window.open success!');
            setError("Payment page opened in a new tab. If you don't see it, please check your popup blocker.");
            return; // Exit on success
          }
        } catch (e) {
          console.error('window.open failed:', e);
        }
        
        // APPROACH 3: Create a visible button for the user
        console.log('3. CREATING MANUAL CHECKOUT BUTTON');
        
        // Show clear message to user
        setError("Please click the button below to open the payment page:");
        
        // Create a prominent checkout button in the center of the screen
        const checkoutButton = document.createElement('div');
        checkoutButton.className = 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-white shadow-2xl rounded-lg p-6 max-w-md text-center';
        checkoutButton.innerHTML = `
          <h3 class="text-xl font-bold mb-4">Ready to Checkout</h3>
          <p class="mb-4">Your payment page is ready. Click the button below to open it:</p>
          <div class="mb-4">
            <a 
              href="${checkoutUrl}" 
              target="_blank"
              class="inline-block bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors">
              Open Checkout
            </a>
          </div>
          <div class="text-sm text-gray-600 mb-3">
            If nothing happens when you click, copy the link below and paste it into your browser:
          </div>
          <div class="bg-gray-100 p-3 rounded mb-4 break-all">
            <code class="text-xs">${checkoutUrl}</code>
          </div>
          <button class="text-gray-500 hover:text-gray-700 underline" id="close-checkout-prompt">
            Close this message
          </button>
        `;
        
        document.body.appendChild(checkoutButton);
        
        // Add event listener to close button
        document.getElementById('close-checkout-prompt').addEventListener('click', () => {
          checkoutButton.remove();
        });
        
        // Reset the processing state so user can try again if needed
        setProcessingPayment(false);
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