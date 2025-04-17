import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { CheckIcon, XIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { PRICE_IDS } from '../lib/stripe';

// Plans configuration
const pricingPlans = [
  {
    id: 'free',
    name: 'Free',
    description: 'Perfect for trying out our service',
    monthlyPrice: 0,
    yearlyPrice: 0,
    monthlyCredits: 3,
    yearlyCredits: 3,
    features: [
      '3 image processes',
      'Basic quality',
      'Manual background removal',
      'PNG download',
      '7-day history retention',
    ],
    notIncluded: [
      'Priority processing',
      'Batch processing',
      'Advanced editing tools',
      'API access',
    ],
    mostPopular: false,
  },
  {
    id: 'lite_monthly',
    idYearly: 'lite_yearly',
    name: 'Lite',
    description: 'Great for occasional users',
    monthlyPrice: 9.9,
    yearlyPrice: 106.8,
    monthlyCredits: 50,
    yearlyCredits: 600,
    monthlyPriceId: PRICE_IDS.LITE_MONTHLY,
    yearlyPriceId: PRICE_IDS.LITE_YEARLY,
    features: [
      '50 monthly/600 yearly image processes',
      'High quality processing',
      'AI-powered background removal',
      'PNG & JPG downloads',
      '30-day history retention',
      'Priority processing',
    ],
    notIncluded: [
      'Batch processing',
      'API access',
    ],
    mostPopular: false,
  },
  {
    id: 'pro_monthly',
    idYearly: 'pro_yearly',
    name: 'Pro',
    description: 'Best for professional users',
    monthlyPrice: 24.9,
    yearlyPrice: 262.8,
    monthlyCredits: 250,
    yearlyCredits: 3000,
    monthlyPriceId: PRICE_IDS.PRO_MONTHLY,
    yearlyPriceId: PRICE_IDS.PRO_YEARLY,
    features: [
      '250 monthly/3000 yearly image processes',
      'Premium quality processing',
      'AI-powered background removal',
      'All file formats supported',
      '90-day history retention',
      'Highest priority processing',
      'Batch processing (up to 20 images)',
      'Basic API access',
    ],
    notIncluded: [],
    mostPopular: true,
  },
];

const PricingNew = () => {
  const { t, i18n } = useTranslation('pricing'); // Use pricing namespace
  
  // Debug translations
  useEffect(() => {
    console.log('Current language in PricingNew:', i18n.language);
    console.log('Translation for "title":', t('title'));
    console.log('Translation for "monthly":', t('monthly'));
    console.log('All available namespaces:', i18n.options.ns);
    console.log('Current namespace resources:', i18n.options.resources?.[i18n.language]?.pricing);
  }, [i18n.language, t]);
  const [yearlyBilling, setYearlyBilling] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const handleBillingToggle = () => {
    setYearlyBilling(!yearlyBilling);
  };

  const handlePurchase = async (planId) => {
    if (planId === 'free') {
      if (!isAuthenticated) {
        navigate('/register');
        return;
      } else {
        navigate('/dashboard');
        return;
      }
    }

    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/pricing', plan: planId } });
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Find the selected plan 
      const selectedPlan = pricingPlans.find((plan) => 
        yearlyBilling 
          ? (plan.idYearly || plan.id) === planId 
          : plan.id === planId
      );
      
      if (!selectedPlan) {
        throw new Error(`Plan ${planId} not found`);
      }
      
      // Determine price ID based on selection
      let priceId = '';
      let packageName = '';
      
      // Use the price ID directly from the plan object
      if (yearlyBilling) {
        priceId = selectedPlan.yearlyPriceId;
        packageName = `${selectedPlan.name} Yearly`;
      } else {
        priceId = selectedPlan.monthlyPriceId;
        packageName = `${selectedPlan.name} Monthly`;
      }
      
      // Debug information
      console.log('Selected plan:', selectedPlan);
      console.log('Price ID being used:', priceId);
      console.log('Package name:', packageName);
      console.log('Is yearly billing:', yearlyBilling);
      
      // Navigate to checkout page with the plan data
      navigate('/checkout', { 
        state: { 
          packageDetails: {
            priceId,
            packageName,
            isYearly: yearlyBilling
          }
        } 
      });
    } catch (err) {
      console.error('Error processing plan selection:', err.message);
      setError('Failed to process your selection. Please try again.');
      setLoading(false);
    }
  };

  // Calculate the savings for yearly billing
  const calculateSavings = (monthly, yearly) => {
    const monthlyCost = monthly * 12;
    const savings = ((monthlyCost - yearly) / monthlyCost) * 100;
    return Math.round(savings);
  };

  return (
    <div className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight">
            {t('title')}
          </h1>
          <p className="mt-5 text-xl text-gray-500 max-w-3xl mx-auto">
            {t('subtitle')}
          </p>
          
          {/* Billing toggle */}
          <div className="mt-12 flex justify-center">
            <div className="relative bg-white rounded-lg p-1 flex">
              <button
                type="button"
                className={`${
                  !yearlyBilling ? 'bg-teal-500 text-white' : 'bg-white text-gray-500'
                } relative py-2 px-6 border-transparent rounded-md shadow-sm text-sm font-medium whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-teal-500 focus:z-10 transition-all`}
                onClick={handleBillingToggle}
              >
                {t('monthly')}
              </button>
              <button
                type="button"
                className={`${
                  yearlyBilling ? 'bg-teal-500 text-white' : 'bg-white text-gray-500'
                } ml-0.5 relative py-2 px-6 border-transparent rounded-md shadow-sm text-sm font-medium whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-teal-500 focus:z-10 transition-all`}
                onClick={handleBillingToggle}
              >
                {t('yearly')}
              </button>
              {yearlyBilling && (
                <div className="absolute -top-3 right-6 rounded-full bg-green-100 px-3 py-0.5 text-xs font-semibold text-green-800">
                  {t('yearlyDiscount')}
                </div>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="max-w-3xl mx-auto mb-8 bg-red-50 border-l-4 border-red-500 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <XIcon className="h-5 w-5 text-red-500" />
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
              } transition-all hover:shadow-xl`}
            >
              {plan.mostPopular && (
                <div className="bg-teal-500 rounded-t-lg py-1.5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-white text-center">
                    {t('popular')}
                  </p>
                </div>
              )}

              <div className="p-6">
                <h2 className="text-xl leading-6 font-bold text-gray-900">
                  {t(`plans.${plan.id.split('_')[0]}.name`)}
                </h2>
                <p className="mt-2 text-sm text-gray-500">
                  {t(`plans.${plan.id.split('_')[0]}.description`)}
                </p>
                <p className="mt-4">
                  <span className="text-4xl font-extrabold text-gray-900">
                    ${yearlyBilling ? plan.yearlyPrice : plan.monthlyPrice}
                  </span>
                  <span className="text-base font-medium text-gray-500">
                    {yearlyBilling ? t('perYear') : t('perMonth')}
                  </span>
                </p>
                {yearlyBilling && plan.id !== 'free' && (
                  <p className="mt-1 text-sm text-green-700">
                    {t('savingsPercentage', { percent: calculateSavings(plan.monthlyPrice, plan.yearlyPrice) })}
                  </p>
                )}
                <p className="mt-4 text-sm text-gray-500">
                  <span className="font-medium text-gray-800">
                    {yearlyBilling ? plan.yearlyCredits : plan.monthlyCredits} 
                  </span> {t('credits')}
                  {plan.id !== 'free' && yearlyBilling && (
                    <span className="block text-xs mt-1 text-gray-500">
                      {t('creditsMonthlySuffix', { credits: Math.round(plan.yearlyCredits / 12) })}
                    </span>
                  )}
                </p>
              </div>

              <div className="pt-6 pb-8 px-6">
                <ul className="space-y-4">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <div className="flex-shrink-0">
                        <CheckIcon className="h-5 w-5 text-teal-500" />
                      </div>
                      <p className="ml-3 text-sm text-gray-500">
                        {t(`plans.${plan.id.split('_')[0]}.features.${index}`, { defaultValue: feature })}
                      </p>
                    </li>
                  ))}
                  {plan.notIncluded.map((feature, index) => (
                    <li key={index} className="flex items-start opacity-50">
                      <div className="flex-shrink-0">
                        <XIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <p className="ml-3 text-sm text-gray-400">{feature}</p>
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  <button
                    onClick={() => {
                      // Select the appropriate plan ID based on billing period
                      const effectivePlanId = yearlyBilling && plan.idYearly 
                        ? plan.idYearly 
                        : plan.id;
                      handlePurchase(effectivePlanId);
                    }}
                    disabled={loading}
                    className={`w-full bg-teal-500 hover:bg-teal-700 text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors ${
                      loading ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {loading ? 'Processing...' : plan.id === 'free' ? t('signUp') : t('subscribe')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <h3 className="text-lg font-medium text-gray-900">{t('moreInfoNeeded')}</h3>
          <p className="mt-2 text-gray-500">
            {t('enterpriseText')}
          </p>
          <a
            href="mailto:enterprise@imagenwiz.com"
            className="mt-4 inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-teal-600 bg-white hover:bg-teal-50"
          >
            {t('contactSales')}
          </a>
        </div>

        <div className="max-w-4xl mx-auto mt-16 bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('faq.title')}</h2>
          
          <div className="space-y-6">
            {t('faq.items', { returnObjects: true }).map((item, index) => (
              <div key={index}>
                <h3 className="text-lg font-medium text-gray-800 mb-2">{item.question}</h3>
                <p className="text-gray-600">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingNew;