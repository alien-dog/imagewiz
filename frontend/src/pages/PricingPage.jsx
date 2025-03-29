import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const PricingPage = () => {
  const [yearlyBilling, setYearlyBilling] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { currentUser } = useAuth()
  
  const pricingPlans = [
    {
      id: 'basic',
      name: 'Basic',
      description: 'For occasional use and small projects',
      features: [
        '50 credits',
        'Standard quality processing',
        'Email support',
        'Maximum file size: 10MB',
        '30-day credit validity'
      ],
      monthly: 9.99,
      yearly: 99.90,
      popular: false
    },
    {
      id: 'pro',
      name: 'Pro',
      description: 'For professionals with regular needs',
      features: [
        '200 credits',
        'High-quality processing',
        'Priority email support',
        'Maximum file size: 25MB',
        'API access (100 calls/month)',
        '60-day credit validity'
      ],
      monthly: 29.99,
      yearly: 299.90,
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'For businesses with high-volume needs',
      features: [
        '500 credits',
        'Ultra-high quality processing',
        'Priority email and chat support',
        'Maximum file size: 50MB',
        'API access (unlimited)',
        'Custom integration support',
        '90-day credit validity'
      ],
      monthly: 79.99,
      yearly: 799.90,
      popular: false
    }
  ]
  
  const handlePurchase = async (planId) => {
    if (!currentUser) {
      // Redirect to auth page if not logged in
      window.location.href = '/auth'
      return
    }
    
    setLoading(true)
    setError('')
    
    try {
      const token = localStorage.getItem('token')
      
      const response = await axios.post(`${API_URL}/payment/create-checkout-session`, {
        plan_id: planId,
        billing_cycle: yearlyBilling ? 'yearly' : 'monthly'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.data.success && response.data.checkout_url) {
        // Redirect to Stripe checkout
        window.location.href = response.data.checkout_url
      } else {
        setError(response.data.message || 'Failed to initiate checkout')
      }
    } catch (err) {
      console.error('Error creating checkout session:', err)
      setError(err.response?.data?.message || 'An error occurred during checkout')
    } finally {
      setLoading(false)
    }
  }
  
  // Calculate savings percentage for yearly billing
  const calculateSavings = (monthly, yearly) => {
    const monthlyCost = monthly * 12
    const savings = ((monthlyCost - yearly) / monthlyCost) * 100
    return Math.round(savings)
  }
  
  return (
    <div className="bg-gradient-to-b from-blue-50 to-white py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the plan that fits your needs. All plans include access to our AI-powered background removal technology.
          </p>
          
          {/* Billing Toggle */}
          <div className="mt-8 flex items-center justify-center">
            <span className={`text-sm font-medium ${!yearlyBilling ? 'text-gray-900' : 'text-gray-500'}`}>
              Monthly Billing
            </span>
            <button
              type="button"
              className="relative inline-flex mx-4 h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-blue-500 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              role="switch"
              aria-checked={yearlyBilling}
              onClick={() => setYearlyBilling(!yearlyBilling)}
            >
              <span className="sr-only">Toggle yearly billing</span>
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  yearlyBilling ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${yearlyBilling ? 'text-gray-900' : 'text-gray-500'}`}>
              Yearly Billing
            </span>
            {yearlyBilling && (
              <span className="ml-2 inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                Save {calculateSavings(pricingPlans[1].monthly, pricingPlans[1].yearly)}%
              </span>
            )}
          </div>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 max-w-lg mx-auto">
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
        
        {/* Pricing Cards */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
          {pricingPlans.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-lg shadow-lg overflow-hidden ${
                plan.popular
                  ? 'ring-2 ring-blue-500 bg-white transform lg:-translate-y-2'
                  : 'bg-white'
              }`}
            >
              {plan.popular && (
                <div className="bg-blue-500 py-1 text-center text-sm font-semibold uppercase text-white">
                  Most Popular
                </div>
              )}
              
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900">{plan.name}</h2>
                <p className="mt-2 text-sm text-gray-600">{plan.description}</p>
                
                <div className="mt-6">
                  <p className="flex items-baseline text-gray-900">
                    <span className="text-4xl font-bold tracking-tight">
                      ${yearlyBilling ? plan.yearly : plan.monthly}
                    </span>
                    <span className="ml-1 text-sm font-medium text-gray-500">
                      /{yearlyBilling ? 'year' : 'month'}
                    </span>
                  </p>
                  
                  {yearlyBilling && (
                    <p className="mt-1 text-sm text-gray-500">
                      ${Math.round((plan.yearly / 12) * 100) / 100}/month, billed annually
                    </p>
                  )}
                  
                  <button
                    type="button"
                    onClick={() => handlePurchase(plan.id)}
                    disabled={loading}
                    className={`mt-6 block w-full rounded-md py-3 px-4 text-center text-sm font-semibold shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                      plan.popular
                        ? 'bg-blue-500 text-white hover:bg-blue-600'
                        : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                    } ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {loading ? 'Processing...' : 'Get Started'}
                  </button>
                </div>
                
                <ul className="mt-6 space-y-4">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <svg
                        className="h-5 w-5 flex-shrink-0 text-green-500"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="ml-2 text-sm text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
        
        {/* Pay Per Use Section */}
        <div className="mt-16 bg-white rounded-lg shadow-lg p-8 max-w-xl mx-auto">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Need Just a Few Credits?</h2>
            <p className="text-gray-600 mb-6">
              If you don't need a subscription, you can purchase credits individually at any time.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="font-bold text-xl text-gray-900">10 Credits</p>
                <p className="text-blue-500 font-medium text-lg mb-2">$4.99</p>
                <button
                  type="button"
                  onClick={() => handlePurchase('pay_per_use_10')}
                  disabled={loading}
                  className={`w-full rounded-md py-2 px-4 text-center text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  Buy Now
                </button>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4 bg-blue-50">
                <p className="font-bold text-xl text-gray-900">25 Credits</p>
                <p className="text-blue-500 font-medium text-lg mb-2">$9.99</p>
                <button
                  type="button"
                  onClick={() => handlePurchase('pay_per_use_25')}
                  disabled={loading}
                  className={`w-full rounded-md py-2 px-4 text-center text-sm font-medium bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  Buy Now
                </button>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="font-bold text-xl text-gray-900">50 Credits</p>
                <p className="text-blue-500 font-medium text-lg mb-2">$19.99</p>
                <button
                  type="button"
                  onClick={() => handlePurchase('pay_per_use_50')}
                  disabled={loading}
                  className={`w-full rounded-md py-2 px-4 text-center text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  Buy Now
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-500">Pay-as-you-go credits never expire</p>
          </div>
        </div>
        
        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Frequently Asked Questions
          </h2>
          
          <div className="max-w-3xl mx-auto divide-y divide-gray-200">
            <div className="py-6">
              <h3 className="text-lg font-medium text-gray-900">
                What is a credit?
              </h3>
              <div className="mt-2 text-gray-600">
                <p>
                  A credit is the currency used on iMagenWiz. One credit allows you to process one image to remove its background.
                  Higher resolution images or more complex background removals may require additional credits.
                </p>
              </div>
            </div>
            
            <div className="py-6">
              <h3 className="text-lg font-medium text-gray-900">
                Do credits expire?
              </h3>
              <div className="mt-2 text-gray-600">
                <p>
                  Subscription credits expire based on your plan (30, 60, or 90 days). Pay-as-you-go credits never expire.
                </p>
              </div>
            </div>
            
            <div className="py-6">
              <h3 className="text-lg font-medium text-gray-900">
                Can I upgrade my plan?
              </h3>
              <div className="mt-2 text-gray-600">
                <p>
                  Yes, you can upgrade your plan at any time. When you upgrade, you'll be prorated for the remaining time on your current plan.
                </p>
              </div>
            </div>
            
            <div className="py-6">
              <h3 className="text-lg font-medium text-gray-900">
                What payment methods do you accept?
              </h3>
              <div className="mt-2 text-gray-600">
                <p>
                  We accept all major credit cards, including Visa, Mastercard, American Express, and Discover.
                </p>
              </div>
            </div>
            
            <div className="py-6">
              <h3 className="text-lg font-medium text-gray-900">
                Can I cancel my subscription?
              </h3>
              <div className="mt-2 text-gray-600">
                <p>
                  Yes, you can cancel your subscription at any time. Your subscription will remain active until the end of your current billing period.
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Have more questions?{' '}
              <Link to="/contact" className="text-blue-500 font-medium hover:text-blue-600">
                Contact our support team
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PricingPage