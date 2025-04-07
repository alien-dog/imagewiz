import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Progress } from './ui/progress';
import { useAuth } from '../contexts/AuthContext';

interface Plan {
  name: string;
  credits: number;
}

const CreditUsageCard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [usageData, setUsageData] = useState({
    used: 0,
    total: 0,
    percentage: 0
  });

  // Fetch payment history to determine plan
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchPaymentData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication required');
          setLoading(false);
          return;
        }

        // Fetch payment history
        const response = await axios.get('/api/payment/history', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const history = response.data.history;
        
        if (history && history.length > 0) {
          // Get the most recent payment
          const latestPayment = history[0];
          
          // Set plan details based on package_id and credits
          setPlan({
            name: latestPayment.package_id.includes('pro') ? 'Pro' : 
                  latestPayment.package_id.includes('lite') ? 'Lite' : 'Free',
            credits: latestPayment.credit_gained
          });
          
          // Calculate usage data
          const used = latestPayment.credit_gained - (user.credits || 0);
          const total = latestPayment.credit_gained;
          const percentage = Math.min(Math.round((used / total) * 100), 100);
          
          setUsageData({
            used,
            total,
            percentage
          });
        } else {
          // If no payment history, set defaults
          setPlan({
            name: 'Free',
            credits: 3
          });
          
          // Calculate usage for free plan
          const used = 3 - (user.credits || 0);
          const total = 3;
          const percentage = Math.min(Math.round((used / total) * 100), 100);
          
          setUsageData({
            used,
            total,
            percentage
          });
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching payment data:', err);
        setError('Failed to load payment data');
        setLoading(false);
      }
    };

    fetchPaymentData();
  }, [user]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded mb-4 w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded mb-6 w-full"></div>
        <div className="h-2 bg-gray-200 rounded w-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">Credit Usage</h3>
      
      <div className="mb-4">
        <div className="text-sm text-gray-500 mb-1">
          {plan?.name} Plan: {usageData.used} of {usageData.total} credits used
        </div>
        <Progress 
          value={usageData.used} 
          max={usageData.total} 
          showPercentage={true}
        />
      </div>
      
      <div className="text-sm text-gray-600">
        {usageData.percentage >= 75 ? (
          <div className="text-red-500 font-medium">
            Your credits are running low! Consider purchasing more credits.
          </div>
        ) : usageData.percentage >= 50 ? (
          <div className="text-yellow-500 font-medium">
            You've used more than half of your credits.
          </div>
        ) : (
          <div className="text-green-500 font-medium">
            You have plenty of credits available.
          </div>
        )}
        <div className="mt-2">
          <span className="font-medium">{user?.credits || 0}</span> credits remaining
        </div>
      </div>
    </div>
  );
};

export default CreditUsageCard;