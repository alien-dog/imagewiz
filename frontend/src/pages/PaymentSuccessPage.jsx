import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const PaymentSuccessPage = () => {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [paymentDetails, setPaymentDetails] = useState(null);
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const query = useQuery();
  const sessionId = query.get('session_id');

  useEffect(() => {
    console.log("Payment success page loaded");
    console.log("Session ID from URL:", sessionId);
    
    const verifyPayment = async () => {
      if (!sessionId) {
        // No session ID in URL, show generic success message
        setLoading(false);
        setMessage("Thank you for your purchase! Your payment is being processed.");
        return;
      }

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError("You must be logged in to verify payment.");
          setLoading(false);
          return;
        }

        console.log(`Verifying payment for session ${sessionId}`);
        const response = await axios.get(
          `/api/payment/verify?session_id=${sessionId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        console.log("Payment verification response:", response.data);
        
        // Update the user data to reflect new credit balance
        await refreshUser();
        
        setPaymentDetails(response.data);
        setMessage("Payment successful! Credits have been added to your account.");
        setLoading(false);
      } catch (err) {
        console.error("Error verifying payment:", err);
        setError(`Failed to verify payment: ${err.response?.data?.message || err.message}`);
        setLoading(false);
      }
    };

    verifyPayment();
  }, [sessionId, refreshUser]);

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  const handleGoToProcessImages = () => {
    navigate('/process');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white shadow-md rounded-lg p-8 mb-4">
            <h1 className="text-2xl font-bold text-center text-teal-600 mb-6">Processing Your Payment</h1>
            <div className="flex justify-center items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
            </div>
            <p className="text-center text-gray-600 mt-4">Please wait while we verify your payment...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-md rounded-lg p-8 mb-4">
          {error ? (
            <>
              <div className="text-red-500 text-center mb-4">
                <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <h1 className="text-2xl font-bold">Payment Verification Failed</h1>
              </div>
              <p className="text-gray-700 mb-6">{error}</p>
              <div className="flex flex-col space-y-3">
                <button 
                  onClick={() => navigate('/pricing')} 
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded"
                >
                  Try Again
                </button>
                <button 
                  onClick={() => navigate('/dashboard')} 
                  className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded"
                >
                  Go to Dashboard
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="text-teal-500 text-center mb-4">
                <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <h1 className="text-2xl font-bold">Payment Successful!</h1>
              </div>
              
              {paymentDetails ? (
                <div className="bg-gray-50 rounded p-4 mb-6">
                  <h3 className="font-semibold text-lg mb-2">
                    {/* Display either the package_name if it already includes the billing period or format it */}
                    {paymentDetails.package_name.includes('Monthly') || paymentDetails.package_name.includes('Yearly') 
                      ? paymentDetails.package_name
                      : `${paymentDetails.package_name} ${paymentDetails.is_yearly ? '(Yearly)' : '(Monthly)'} Plan`}
                  </h3>
                  <p className="text-gray-700 mb-1">
                    <span className="font-medium">Amount Paid:</span> ${paymentDetails.amount_paid.toFixed(2)}
                  </p>
                  <p className="text-gray-700 mb-1">
                    <span className="font-medium">Credits Added:</span> {paymentDetails.credits_added.toLocaleString()}
                    {paymentDetails.is_yearly && (
                      <span className="text-gray-500 text-sm ml-1">
                        ({Math.round(paymentDetails.credits_added/12).toLocaleString()} per month)
                      </span>
                    )}
                  </p>
                  <p className="text-gray-700 font-medium text-lg mt-2">
                    New Balance: <span className="text-teal-600">{paymentDetails.new_balance.toLocaleString()} credits</span>
                  </p>
                </div>
              ) : (
                <p className="text-gray-700 mb-6">{message}</p>
              )}
              
              <div className="flex flex-col space-y-3">
                <button 
                  onClick={handleGoToProcessImages}
                  className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded"
                >
                  Start Processing Images
                </button>
                <button 
                  onClick={handleGoToDashboard} 
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded"
                >
                  Go to Dashboard
                </button>
              </div>
            </>
          )}
        </div>
        
        <p className="text-center text-gray-500 text-sm">
          If you have any questions about your payment, please contact our support team.
        </p>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;