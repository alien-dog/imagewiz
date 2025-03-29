import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function PricingPage() {
  const [annual, setAnnual] = useState(false)
  const { currentUser } = useAuth()
  
  // Toggle between monthly and annual pricing
  const toggleBilling = () => {
    setAnnual(!annual)
  }
  
  // Calculate discounted price
  const discountedPrice = (monthlyPrice) => {
    const yearlyPrice = (monthlyPrice * 12 * 0.8).toFixed(2) // 20% discount for annual
    return yearlyPrice
  }
  
  // Calculate monthly price from yearly with discount
  const monthlyFromYearly = (yearlyPrice) => {
    return (yearlyPrice / 12).toFixed(2)
  }
  
  // Pricing plans data
  const plans = [
    {
      name: 'Free',
      description: 'Perfect for trying out the service',
      monthlyPrice: 0,
      features: [
        '50 image credits per month',
        'Standard background removal',
        'Max image size: 2 MB',
        'Basic support',
        '1-day image history'
      ],
      popular: false,
      buttonText: currentUser ? 'Current Plan' : 'Get Started',
      buttonAction: currentUser ? '/dashboard' : '/auth',
      buttonVariant: 'outline'
    },
    {
      name: 'Pro',
      description: 'For designers and small businesses',
      monthlyPrice: 9.99,
      features: [
        '500 image credits per month',
        'HD background removal',
        'Max image size: 15 MB',
        'Priority support',
        '30-day image history',
        'Batch processing',
        'Multiple background options'
      ],
      popular: true,
      buttonText: 'Upgrade to Pro',
      buttonAction: '/checkout/pro',
      buttonVariant: 'solid'
    },
    {
      name: 'Enterprise',
      description: 'For teams and businesses with high volume needs',
      monthlyPrice: 49.99,
      features: [
        '5,000 image credits per month',
        'Ultra HD background removal',
        'Max image size: 50 MB',
        '24/7 dedicated support',
        'Unlimited image history',
        'Advanced API access',
        'Custom integrations',
        'Dedicated account manager'
      ],
      popular: false,
      buttonText: 'Contact Sales',
      buttonAction: '/contact',
      buttonVariant: 'outline'
    }
  ]
  
  return (
    <div className="bg-gray-50 py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-gray-600 mb-8">
            Choose the plan that fits your needs. All plans include our AI-powered background removal technology.
          </p>
          
          {/* Billing toggle */}
          <div className="flex items-center justify-center">
            <span className={`mr-3 text-base ${!annual ? 'font-bold text-blue-600' : 'text-gray-500'}`}>Monthly</span>
            <div className="relative">
              <input 
                type="checkbox" 
                id="billing-toggle" 
                checked={annual} 
                onChange={toggleBilling}
                className="sr-only"
              />
              <label 
                htmlFor="billing-toggle"
                className="flex h-8 w-16 cursor-pointer items-center rounded-full bg-gray-300 p-1"
              >
                <div 
                  className={`h-6 w-6 rounded-full bg-white transition-all duration-300 ease-in-out ${annual ? 'transform translate-x-8' : ''}`} 
                />
              </label>
            </div>
            <div className="ml-3 flex items-center">
              <span className={`text-base ${annual ? 'font-bold text-blue-600' : 'text-gray-500'}`}>Annual</span>
              <span className="ml-2 rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">
                Save 20%
              </span>
            </div>
          </div>
        </div>
        
        {/* Pricing Cards */}
        <div className="grid gap-8 md:grid-cols-3">
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className={`rounded-lg shadow-lg overflow-hidden ${plan.popular ? 'border-2 border-blue-500 transform scale-105 z-10 bg-white' : 'bg-white'}`}
            >
              {plan.popular && (
                <div className="bg-blue-500 text-white text-center py-2 text-sm font-semibold">
                  MOST POPULAR
                </div>
              )}
              
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">{plan.name}</h2>
                <p className="text-gray-600 mb-6">{plan.description}</p>
                
                <div className="flex items-baseline mb-6">
                  <span className="text-4xl font-bold text-gray-900">
                    ${annual ? monthlyFromYearly(discountedPrice(plan.monthlyPrice)) : plan.monthlyPrice}
                  </span>
                  <span className="text-gray-600 ml-2">/month</span>
                </div>
                
                {annual && plan.monthlyPrice > 0 && (
                  <div className="mb-6">
                    <p className="text-green-600 font-medium">
                      ${discountedPrice(plan.monthlyPrice)} billed annually
                    </p>
                    <p className="text-gray-500 text-sm">
                      (Save ${(plan.monthlyPrice * 12 * 0.2).toFixed(2)} per year)
                    </p>
                  </div>
                )}
                
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Link 
                  to={plan.buttonAction}
                  className={`block w-full text-center py-3 px-4 rounded-md font-semibold ${
                    plan.buttonVariant === 'solid' 
                      ? 'bg-blue-500 text-white hover:bg-blue-600' 
                      : 'border-2 border-blue-500 text-blue-500 hover:bg-blue-50'
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
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold mb-2">What is a credit?</h3>
              <p className="text-gray-600">
                A credit is used each time you process an image with our AI technology. One credit equals one image processed.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold mb-2">Do unused credits roll over?</h3>
              <p className="text-gray-600">
                No, credits reset at the beginning of each billing cycle. However, any images you've already processed will remain in your history according to your plan's retention period.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold mb-2">Can I upgrade or downgrade my plan?</h3>
              <p className="text-gray-600">
                Yes, you can change your plan at any time. When upgrading, you'll get immediate access to the new features. When downgrading, the change will take effect on your next billing cycle.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold mb-2">How do I cancel my subscription?</h3>
              <p className="text-gray-600">
                You can cancel your subscription at any time from your account settings. You'll continue to have access to your plan until the end of the current billing period.
              </p>
            </div>
          </div>
        </div>
        
        {/* CTA Section */}
        <div className="mt-20 text-center">
          <h2 className="text-2xl font-bold mb-4">Need a custom solution?</h2>
          <p className="text-gray-600 mb-6 max-w-xl mx-auto">
            We offer custom plans for businesses with specific needs. Contact our sales team to discuss how we can help.
          </p>
          <Link 
            to="/contact" 
            className="inline-flex items-center bg-blue-500 text-white py-3 px-6 rounded-md font-semibold hover:bg-blue-600"
          >
            Contact Sales
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  )
}