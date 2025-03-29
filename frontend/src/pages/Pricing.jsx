import { useState } from 'react'
import { Link } from 'react-router-dom'

export function Pricing() {
  const [isYearly, setIsYearly] = useState(false)
  
  const plans = [
    {
      name: 'Free',
      description: 'For occasional personal use',
      price: {
        monthly: 0,
        yearly: 0
      },
      features: [
        '3 images per day',
        'Standard quality',
        'Basic customer support',
        'Web access only',
        'Standard processing'
      ],
      buttonText: 'Sign Up for Free',
      highlighted: false
    },
    {
      name: 'Pro',
      description: 'For designers and small businesses',
      price: {
        monthly: 12.99,
        yearly: 119.88 // 12.99 * 12 - discount
      },
      features: [
        '100 images per month',
        'HD quality',
        'Priority support',
        'Web & mobile access',
        'Fast processing',
        'Batch processing',
        'Cloud storage (30 days)'
      ],
      buttonText: 'Get Pro',
      highlighted: true
    },
    {
      name: 'Enterprise',
      description: 'For teams and businesses',
      price: {
        monthly: 49.99,
        yearly: 479.88
      },
      features: [
        'Unlimited images',
        'Ultra HD quality',
        '24/7 dedicated support',
        'Web, mobile & API access',
        'Ultra fast processing',
        'Advanced batch processing',
        'Cloud storage (90 days)',
        'Custom backgrounds',
        'Branded exports'
      ],
      buttonText: 'Contact Sales',
      highlighted: false
    }
  ]

  // Calculate the yearly savings for the Pro plan
  const monthlyCost = plans[1].price.monthly * 12
  const yearlyCost = plans[1].price.yearly
  const savings = monthlyCost - yearlyCost
  const savingsPercentage = Math.round((savings / monthlyCost) * 100)
  
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose the plan that works best for you and start transforming your images today.
          </p>
          
          {/* Pricing Toggle */}
          <div className="flex items-center justify-center mt-8">
            <span className={`text-sm ${!isYearly ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>Monthly</span>
            <button 
              className="mx-4 relative inline-flex h-6 w-12 items-center rounded-full bg-teal-500 focus:outline-none"
              onClick={() => setIsYearly(!isYearly)}
            >
              <span className="sr-only">Toggle yearly billing</span>
              <span
                className={`${
                  isYearly ? 'translate-x-6' : 'translate-x-1'
                } inline-block h-4 w-4 transform rounded-full bg-white transition`}
              />
            </button>
            <span className={`flex items-center text-sm ${isYearly ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
              Yearly
              <span className="ml-2 bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded">
                Save {savingsPercentage}%
              </span>
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`bg-white rounded-lg shadow-md overflow-hidden border ${plan.highlighted ? 'border-teal-500 transform md:scale-105' : 'border-gray-200'}`}
            >
              {plan.highlighted && (
                <div className="bg-teal-500 text-white py-1 px-4 text-center text-sm font-medium">
                  MOST POPULAR
                </div>
              )}
              
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{plan.name}</h3>
                <p className="text-gray-500 mb-4">{plan.description}</p>
                
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">
                    ${isYearly ? (plan.price.yearly / 12).toFixed(2) : plan.price.monthly}
                  </span>
                  <span className="text-gray-500">/month</span>
                  
                  {isYearly && (
                    <div className="text-sm text-gray-500 mt-1">
                      Billed annually (${plan.price.yearly.toFixed(2)})
                    </div>
                  )}
                </div>
                
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <svg className="h-5 w-5 mr-2 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Link 
                  to={plan.name === 'Enterprise' ? '/contact' : '/auth'}
                  className={`w-full text-center py-2 px-4 rounded-md font-medium transition-colors ${
                    plan.highlighted
                      ? 'bg-teal-500 text-white hover:bg-teal-600'
                      : 'bg-white border border-teal-500 text-teal-500 hover:bg-teal-50'
                  }`}
                >
                  {plan.buttonText}
                </Link>
              </div>
            </div>
          ))}
        </div>
        
        {/* FAQ Section */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600">
                We accept all major credit cards, PayPal, and selected regional payment methods. All payments are securely processed.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-2">Can I upgrade or downgrade my plan?</h3>
              <p className="text-gray-600">
                Yes, you can change your plan at any time. When upgrading, you'll be charged the prorated difference. When downgrading, the new rate will apply to your next billing cycle.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-2">Do unused credits roll over?</h3>
              <p className="text-gray-600">
                No, the monthly credits reset at the beginning of each billing cycle. However, yearly plan subscribers receive 20% bonus credits as a loyalty benefit.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-2">Is there a refund policy?</h3>
              <p className="text-gray-600">
                We offer a 7-day money-back guarantee for new subscriptions. If you're not satisfied with our service, contact support within 7 days of your purchase for a full refund.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}