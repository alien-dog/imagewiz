import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ImageUploader from '../components/ImageUploader';
import { useAuth } from '../contexts/AuthContext';
import CreditUsageCard from '../components/CreditUsageCard';

const DashboardPage = () => {
  const { user, refreshUser } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  
  useEffect(() => {
    // Refresh user data when component mounts
    const loadUserData = async () => {
      try {
        await refreshUser();
      } catch (error) {
        console.error("Error refreshing user data:", error);
      }
    };
    
    loadUserData();
  }, [refreshUser]);
  
  const handleRefreshCredits = async () => {
    if (refreshing) return;
    
    setRefreshing(true);
    try {
      await refreshUser();
      setTimeout(() => {
        setRefreshing(false);
      }, 1000); // Add a slight delay for better UX
    } catch (error) {
      console.error("Error refreshing credits:", error);
      setRefreshing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="bg-gradient-to-r from-teal-500 to-teal-700 text-white rounded-lg p-6 shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-xl md:text-2xl font-bold mb-2">Welcome, {user?.username || 'User'}!</h1>
              <p className="text-teal-100">
                Remove image backgrounds instantly with our AI-powered tool.
              </p>
            </div>
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-center">
                <div className="mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-medium">Available Credits</div>
                  <div className="text-2xl font-bold">{user?.credits || 0}</div>
                </div>
                <button 
                  onClick={handleRefreshCredits}
                  className="ml-3 p-1 text-white rounded-full hover:bg-white/20"
                  disabled={refreshing}
                  title="Refresh credits"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <div className="mt-6">
            <Link 
              to="/pricing" 
              className="bg-white text-teal-700 px-4 py-2 rounded font-medium hover:bg-teal-50 transition-colors inline-block"
            >
              Get More Credits
            </Link>
            <Link 
              to="/history" 
              className="ml-2 text-white border border-white px-4 py-2 rounded font-medium hover:bg-teal-600 transition-colors inline-block"
            >
              Processing History
            </Link>
            <Link 
              to="/payment-history" 
              className="ml-2 text-white border border-white px-4 py-2 rounded font-medium hover:bg-teal-600 transition-colors inline-block"
            >
              Payment History
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="md:col-span-3">
          <ImageUploader />
        </div>
        <div className="md:col-span-1">
          <CreditUsageCard />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-teal-100 text-teal-500 rounded-full mr-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-800">Fast Processing</h3>
          </div>
          <p className="text-gray-600">
            Our AI processes your images in seconds, saving you valuable time on your creative projects.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-teal-100 text-teal-500 rounded-full mr-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-800">High Quality</h3>
          </div>
          <p className="text-gray-600">
            Get precise and clean cutouts with our advanced AI algorithms that preserve fine details.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-teal-100 text-teal-500 rounded-full mr-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z"></path>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-800">Bulk Processing</h3>
          </div>
          <p className="text-gray-600">
            Upgrade to our Pro plan to process multiple images at once for increased productivity.
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold text-gray-800 mb-4">How It Works</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-teal-100 text-teal-500 rounded-full mb-4">
              1
            </div>
            <h3 className="font-medium text-gray-800 mb-2">Upload Image</h3>
            <p className="text-gray-600">
              Upload your image in PNG, JPEG, or WebP format.
            </p>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-teal-100 text-teal-500 rounded-full mb-4">
              2
            </div>
            <h3 className="font-medium text-gray-800 mb-2">Process</h3>
            <p className="text-gray-600">
              Our AI automatically removes the background.
            </p>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-teal-100 text-teal-500 rounded-full mb-4">
              3
            </div>
            <h3 className="font-medium text-gray-800 mb-2">Download</h3>
            <p className="text-gray-600">
              Download your image with the background removed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;