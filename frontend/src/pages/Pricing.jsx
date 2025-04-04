import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const pricingPlans = [
  {
    id: 'basic',
    name: 'Basic',
    credits: 10,
    priceMonthly: 4.99,
    priceYearly: 49.99,
    features: [
      '10 Image Process Credits',
      'PNG Download with Transparency',
      '7-day History Retention',
      'Standard Processing Priority',
    ],
    mostPopular: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    credits: 50,
    priceMonthly: 19.99,
    priceYearly: 199.99,
    features: [
      '50 Image Process Credits',
      'PNG Download with Transparency',
      '30-day History Retention',
      'High Processing Priority',
      'Batch Processing (5 images)',
    ],
    mostPopular: true,
  },
  {
    id: 'business',
    name: 'Business',
    credits: 200,
    priceMonthly: 69.99,
    priceYearly: 699.99,
    features: [
      '200 Image Process Credits',
      'PNG Download with Transparency',
      '90-day History Retention',
      'Highest Processing Priority',
      'Batch Processing (20 images)',
      'API Access',
    ],
    mostPopular: false,
  },
];

const Pricing = () => {
  const [yearlyBilling, setYearlyBilling] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handlePlanSelect = (planId) => {
    setSelectedPlan(planId);
  };

  const handleBillingToggle = () => {
    setYearlyBilling(!yearlyBilling);
  };

  const handlePurchase = async (planId) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/pricing', plan: planId } });
      return;
    }

    setLoading(true);
    setError('');

    try {
      const selectedPlan = pricingPlans.find((plan) => plan.id === planId);
      const price = yearlyBilling ? selectedPlan.priceYearly : selectedPlan.priceMonthly;
      
      // Generate a base URL for success and cancel redirects
      // For Replit hosted apps, construct URLs carefully to ensure redirection works
      let baseUrl;
      const url = new URL(window.location.href);
      
      if (url.hostname.includes('.replit.dev')) {
        // For Replit domains, ALWAYS use https protocol with NO port for most reliable routing
        baseUrl = `https://${url.hostname}`;
      } else if (url.hostname === 'localhost' || url.hostname === '0.0.0.0' || url.hostname === '127.0.0.1') {
        // For local development, keep the port
        baseUrl = window.location.origin;
      } else {
        // For all other environments, use clean URLs without ports
        baseUrl = `${url.protocol}//${url.hostname}`;
      }
      
      console.log('Using baseUrl for Stripe callbacks:', baseUrl);
      
      // Use our new order-confirmation page with session_id parameter
      const successUrl = `${baseUrl}/order-confirmation?session_id={CHECKOUT_SESSION_ID}&t=${Date.now()}`;
      const cancelUrl = `${baseUrl}/pricing?t=${Date.now()}`;
      
      console.log(`Creating checkout session for package ${planId}`, {
        planId,
        price,
        credits: selectedPlan.credits,
        successUrl,
        cancelUrl
      });
      
      // FIXED: Use the correct API endpoint with /api prefix
      const response = await axios.post('/api/payment/create-checkout-session', {
        package_id: planId,
        success_url: successUrl,
        cancel_url: cancelUrl
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      // Redirect to Stripe checkout
      if (response.data.url) {
        const checkoutUrl = response.data.url;
        console.log('Redirecting to Stripe checkout URL:', checkoutUrl);
        
        // Store the URL in localStorage in case we need to retry
        localStorage.setItem('stripeCheckoutUrl', checkoutUrl);
        
        // Create elements to display the URL and a retry button in case window.open fails
        const stripeUrlMessage = document.createElement('div');
        stripeUrlMessage.innerHTML = `
          <div style="margin-top: 10px; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
            <p>Click the button below to open the Stripe checkout page:</p>
            <a 
              href="${checkoutUrl}" 
              target="_blank"
              style="display: inline-block; background-color: #4CAF50; color: white; 
                    padding: 10px 15px; text-decoration: none; border-radius: 4px; 
                    margin-top: 10px;">
              Open Checkout Page
            </a>
          </div>
        `;
        
        // Try to open immediately in a new window
        const newWindow = window.open(checkoutUrl, '_blank');
        
        // Either way, set a helpful message
        setError("Stripe checkout page has been opened in a new tab. If you don't see it, please check your popup blocker or use the 'Open Checkout Page' button below.");
        setLoading(false);
        
        // Add the checkout button to the page after the "Get Started" button
        setTimeout(() => {
          const pricingCards = document.querySelectorAll('.bg-white.rounded-lg.shadow-lg');
          if (pricingCards.length > 0) {
            const targetCard = pricingCards[0];
            targetCard.appendChild(stripeUrlMessage);
          }
        }, 100);
        
      } else {
        throw new Error('No checkout URL returned from server');
      }
    } catch (err) {
      console.error('Error creating checkout session:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Failed to process your request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate the yearly savings percentage
  const calculateSavings = (monthly, yearly) => {
    const monthlyCost = monthly * 12;
    const savings = monthlyCost - yearly;
    const savingsPercentage = Math.round((savings / monthlyCost) * 100);
    return savingsPercentage;
  };

  return (
    <div className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight">
            Simple, Transparent Pricing
          </h1>
          <p className="mt-5 text-xl text-gray-500 max-w-3xl mx-auto">
            Choose the plan that's right for you. All plans come with a 100% satisfaction guarantee.
          </p>
          
          {/* Billing toggle */}
          <div className="mt-12 flex justify-center">
            <div className="relative bg-white rounded-lg p-1 flex">
              <button
                type="button"
                className={`${
                  !yearlyBilling ? 'bg-teal-500 text-white' : 'bg-white text-gray-500'
                } relative py-2 px-6 border-transparent rounded-md shadow-sm text-sm font-medium whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-teal-500 focus:z-10`}
                onClick={handleBillingToggle}
              >
                Monthly billing
              </button>
              <button
                type="button"
                className={`${
                  yearlyBilling ? 'bg-teal-500 text-white' : 'bg-white text-gray-500'
                } ml-0.5 relative py-2 px-6 border-transparent rounded-md shadow-sm text-sm font-medium whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-teal-500 focus:z-10`}
                onClick={handleBillingToggle}
              >
                Yearly billing
              </button>
              {yearlyBilling && (
                <div className="absolute -top-3 right-10 rounded-full bg-teal-100 px-3 py-0.5 text-xs font-semibold text-teal-800">
                  Save up to 17%
                </div>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="max-w-3xl mx-auto mb-8 bg-red-50 border-l-4 border-red-500 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:gap-8 lg:grid-cols-3 lg:max-w-7xl mx-auto">
          {pricingPlans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white rounded-lg shadow-lg divide-y divide-gray-200 ${
                plan.mostPopular ? 'ring-2 ring-teal-500' : ''
              }`}
            >
              {plan.mostPopular && (
                <div className="bg-teal-500 rounded-t-lg py-1.5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-white text-center">
                    Most popular
                  </p>
                </div>
              )}

              <div className="p-6">
                <h2 className="text-lg leading-6 font-medium text-gray-900">{plan.name}</h2>
                <p className="mt-4">
                  <span className="text-4xl font-extrabold text-gray-900">
                    ${yearlyBilling ? plan.priceYearly : plan.priceMonthly}
                  </span>
                  <span className="text-base font-medium text-gray-500">
                    {yearlyBilling ? '/year' : '/month'}
                  </span>
                </p>
                {yearlyBilling && (
                  <p className="mt-1 text-sm text-teal-700">
                    Save {calculateSavings(plan.priceMonthly, plan.priceYearly)}% with yearly billing
                  </p>
                )}
                <p className="mt-4 text-gray-500">
                  {plan.credits} image processing credits
                </p>
              </div>

              <div className="pt-6 pb-8 px-6">
                <ul className="space-y-4">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-teal-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="ml-3 text-base text-gray-500">{feature}</p>
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  <button
                    onClick={() => handlePurchase(plan.id)}
                    disabled={loading}
                    className={`w-full bg-teal-500 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 ${
                      loading && selectedPlan === plan.id ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {loading && selectedPlan === plan.id ? 'Processing...' : 'Get Started'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <h3 className="text-lg font-medium text-gray-900">Need more credits?</h3>
          <p className="mt-2 text-gray-500">
            Contact us for custom enterprise plans with higher volumes and additional features.
          </p>
          <a
            href="mailto:enterprise@imagenwiz.com"
            className="mt-4 inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-teal-600 bg-white hover:bg-teal-50"
          >
            Contact Sales
          </a>
        </div>
      </div>
    </div>
  );
};

export default Pricing;