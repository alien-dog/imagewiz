import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/matting/history', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setHistory(response.data.history);
      } catch (err) {
        console.error('Error fetching history:', err);
        setError('Failed to load history. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

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
            onClick={() => navigate('/dashboard')} 
            className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Processing History</h1>
        <button 
          onClick={() => navigate('/dashboard')} 
          className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600"
        >
          Back to Dashboard
        </button>
      </div>

      {history.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No processing history yet</h2>
          <p className="text-gray-600 mb-4">Start by removing the background from an image.</p>
          <button 
            onClick={() => navigate('/dashboard')} 
            className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600"
          >
            Process an Image
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {history.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative h-48 bg-gray-200">
                <img 
                  src={item.processed_image_url} 
                  alt="Processed" 
                  className="w-full h-full object-contain bg-checkerboard" 
                />
              </div>
              <div className="p-4">
                <div className="text-sm text-gray-500 mb-2">
                  {format(new Date(item.created_at), 'PPP')}
                </div>
                <div className="text-sm text-gray-600 mb-3">
                  Credits used: {item.credit_spent}
                </div>
                <div className="flex space-x-2">
                  <a 
                    href={item.processed_image_url} 
                    download 
                    className="bg-teal-500 text-white text-sm px-3 py-1 rounded hover:bg-teal-600 flex-1 text-center"
                  >
                    Download
                  </a>
                  <Link 
                    to={`/history/${item.id}`} 
                    className="bg-gray-200 text-gray-800 text-sm px-3 py-1 rounded hover:bg-gray-300 flex-1 text-center"
                  >
                    Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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

export default HistoryPage;