import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const HistoryDetailPage = () => {
  const { id } = useParams();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`/api/matting/history/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setDetail(response.data);
      } catch (err) {
        console.error('Error fetching history detail:', err);
        setError('Failed to load details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDetail();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
        <div className="mt-4">
          <button 
            onClick={() => navigate('/history')} 
            className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600"
          >
            Back to History
          </button>
        </div>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Not Found: </strong>
          <span className="block sm:inline">The requested image processing record could not be found.</span>
        </div>
        <div className="mt-4">
          <button 
            onClick={() => navigate('/history')} 
            className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600"
          >
            Back to History
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Image Processing Details</h1>
        <button 
          onClick={() => navigate('/history')} 
          className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600"
        >
          Back to History
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <div className="mb-4">
            <span className="text-sm font-medium text-gray-500">Date Processed:</span>
            <p className="text-gray-800">
              {format(new Date(detail.created_at), 'PPpp')}
            </p>
          </div>
          <div className="mb-4">
            <span className="text-sm font-medium text-gray-500">Credits Used:</span>
            <p className="text-gray-800">{detail.credit_spent}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-3">Original Image</h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <img 
                  src={detail.original_image_url} 
                  alt="Original" 
                  className="w-full h-auto" 
                />
              </div>
              <div className="mt-4">
                <a 
                  href={detail.original_image_url} 
                  download
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 inline-block"
                >
                  Download Original
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-3">Processed Image</h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <img 
                  src={detail.processed_image_url} 
                  alt="Processed" 
                  className="w-full h-auto bg-checkerboard" 
                />
              </div>
              <div className="mt-4">
                <a 
                  href={detail.processed_image_url} 
                  download
                  className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600 inline-block"
                >
                  Download Processed
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .bg-checkerboard {
          background-image: linear-gradient(45deg, #f0f0f0 25%, transparent 25%),
            linear-gradient(-45deg, #f0f0f0 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #f0f0f0 75%),
            linear-gradient(-45deg, transparent 75%, #f0f0f0 75%);
          background-size: 20px 20px;
          background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
        }
      `}</style>
    </div>
  );
};

export default HistoryDetailPage;