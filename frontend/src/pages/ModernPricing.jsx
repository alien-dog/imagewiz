import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { FiCheck, FiZap } from 'react-icons/fi';

const ModernPricing = () => {
  const [isYearly, setIsYearly] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Packages information
  const plans = [
    {
      name: 'Free',
      description: '1 trial credit to spend on AI edits',
      freeCredits: 3,
      priceMonthly: 0,
      priceYearly: 0,
      features: [
        'Basics, at no cost',
        'Experiment first, upgrade when needed',
        'API and integrations included'
      ],
      buttonText: 'Create account',
      action: () => navigate('/register'),
      showPrice: false,
      id: 'free',
      popular: false
    },
    {
      name: 'Lite',
      description: 'Use up to 50 credits per month',
      freeCredits: 0,
      creditsMonthly: 50,
      creditsYearly: 600,
      priceMonthly: 9.9,
      priceYearly: 106.8,
      features: [
        'AI Photo editor',
        'Remove background',
        'Erase and restore',
        'Max quality exports',
        'Automation',
        'API and integrations'
      ],
      buttonText: 'Subscribe',
      action: (id) => handleSubscription(id),
      showPrice: true,
      id: isYearly ? 'lite_yearly' : 'lite_monthly',
      popular: false
    },
    {
      name: 'Pro',
      description: 'Use up to 250 credits per month',
      freeCredits: 0,
      creditsMonthly: 250,
      creditsYearly: 3000,
      priceMonthly: 24.9,
      priceYearly: 262.8,
      features: [
        'AI Photo editor',
        'Remove background',
        'Erase and restore',
        'Max quality exports',
        'Automation',
        'API and integrations',
        'Bulk editing'
      ],
      buttonText: 'Subscribe',
      action: (id) => handleSubscription(id),
      showPrice: true,
      id: isYearly ? 'pro_yearly' : 'pro_monthly',
      popular: true
    }
  ];

  const handleSubscription = async (planId) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/pricing' } });
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Generate a base URL for success and cancel redirects
      const baseUrl = window.location.origin;
      const successUrl = `${baseUrl}/payment-success`;
      const cancelUrl = `${baseUrl}/pricing`;
      
      console.log(`Creating checkout session for package ${planId}`);
      
      const response = await axios.post('/api/payment/create-checkout-session', {
        package_id: planId,
        success_url: successUrl,
        cancel_url: cancelUrl
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.url) {
        const checkoutUrl = response.data.url;
        console.log('Redirecting to Stripe checkout URL:', checkoutUrl);
        
        // Store the URL in localStorage for debugging purposes
        localStorage.setItem('stripeCheckoutUrl', checkoutUrl);
        
        // Redirect to Stripe checkout
        window.location.href = checkoutUrl;
      } else {
        throw new Error('No checkout URL returned from server');
      }
    } catch (err) {
      console.error('Error creating checkout session:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Failed to process your request. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight">
          Choose Your Plan
        </h1>
        <p className="mt-5 text-xl text-gray-500 max-w-3xl mx-auto">
          Start with a free account or select a premium plan to get more credits and features.
        </p>
      </div>

      {/* Pricing toggle */}
      <div className="relative flex justify-center mb-16">
        <div className="bg-white rounded-full p-1 inline-flex shadow-sm">
          <button
            onClick={() => setIsYearly(false)}
            className={`${
              !isYearly
                ? 'bg-teal-500 text-white'
                : 'bg-white text-gray-700'
            } relative py-2 px-6 rounded-full transition-all duration-200 focus:outline-none`}
          >
            Monthly
          </button>
          <button
            onClick={() => setIsYearly(true)}
            className={`${
              isYearly
                ? 'bg-teal-500 text-white'
                : 'bg-white text-gray-700'
            } relative py-2 px-6 rounded-full transition-all duration-200 focus:outline-none`}
          >
            Yearly
          </button>
          {isYearly && (
            <span className="absolute -top-3 right-9 z-10 bg-yellow-300 text-yellow-800 text-xs font-semibold px-2 py-0.5 rounded-full">
              Save 10%
            </span>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Pricing cards */}
      <div className="grid gap-8 lg:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`bg-white rounded-lg shadow-lg overflow-hidden transition-transform hover:transform hover:scale-105 ${
              plan.popular ? 'border-2 border-yellow-400' : ''
            }`}
          >
            {/* Popular badge */}
            {plan.popular && (
              <div className="bg-yellow-300 px-4 py-1">
                <p className="text-sm font-semibold text-center text-yellow-800">
                  Most Popular
                </p>
              </div>
            )}

            <div className="p-8">
              {/* Plan name */}
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              
              {/* Credits */}
              <p className="text-gray-600 mb-6">
                {plan.showPrice ? (
                  isYearly ? (
                    `Use up to ${plan.creditsYearly} credits per year`
                  ) : (
                    `Use up to ${plan.creditsMonthly} credits per month`
                  )
                ) : (
                  `${plan.freeCredits} trial credits to spend on AI edits`
                )}
              </p>

              {/* Price */}
              {plan.showPrice && (
                <div className="mb-6">
                  <span className="text-5xl font-extrabold text-gray-900">
                    ${isYearly ? plan.priceYearly : plan.priceMonthly}
                  </span>
                  <span className="text-gray-500 ml-2">
                    {isYearly ? '/year' : '/month'}
                  </span>
                </div>
              )}
              {!plan.showPrice && (
                <div className="mb-6">
                  <span className="text-5xl font-extrabold text-gray-900">Free</span>
                </div>
              )}

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start">
                    {i === plan.features.length - 1 && plan.name === 'Pro' ? (
                      <FiZap className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0" />
                    ) : (
                      <FiCheck className="h-5 w-5 text-teal-500 mr-2 flex-shrink-0" />
                    )}
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <button
                onClick={() => plan.action(plan.id)}
                disabled={loading}
                className={`w-full py-3 px-4 rounded-md font-medium text-white transition-colors ${
                  plan.popular
                    ? 'bg-teal-600 hover:bg-teal-700'
                    : 'bg-teal-500 hover:bg-teal-600'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading ? 'Processing...' : plan.buttonText}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* FAQ Section */}
      <div className="mt-16 bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Frequently Asked Questions</h2>
        
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">How do credits work?</h3>
            <p className="text-gray-600">
              Each credit allows you to process one image. Credits are deducted from your account after successful processing.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">Do credits expire?</h3>
            <p className="text-gray-600">
              Yes, unused credits expire at the end of the billing period (monthly or yearly).
              Credits do not roll over to the next billing period.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">Can I upgrade or downgrade my plan?</h3>
            <p className="text-gray-600">
              Yes, you can change your plan at any time. When you upgrade, you'll be charged the prorated amount for the remainder of your billing period.
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

export default ModernPricing;