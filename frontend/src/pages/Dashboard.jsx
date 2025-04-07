import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [originalImage, setOriginalImage] = useState(null);

  const onDrop = useCallback(async (acceptedFiles) => {
    // Reset states
    setError('');
    setResult(null);
    
    const file = acceptedFiles[0];
    if (!file) return;

    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      return setError('Please upload a valid image file (JPEG or PNG)');
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return setError('File is too large. Maximum size is 5MB.');
    }

    // Display the original image
    const originalUrl = URL.createObjectURL(file);
    setOriginalImage(originalUrl);

    // Create form data for upload
    const formData = new FormData();
    formData.append('image', file);

    setProcessing(true);

    try {
      const response = await axios.post('/matting/process', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred while processing the image. Please try again.');
    } finally {
      setProcessing(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': []
    },
    maxFiles: 1,
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Image Processing Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Upload an image to remove its background
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Credits display and Pricing card */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Credits</h2>
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-700">Available Credits:</span>
              <span className="text-2xl font-bold text-teal-600">{user?.credits || 0}</span>
            </div>
            <div className="text-sm text-gray-600 mb-6">
              Each image processing uses 1 credit
            </div>
            <Link
              to="/pricing"
              className="block w-full bg-teal-500 hover:bg-teal-700 text-white text-center font-bold py-2 px-4 rounded"
            >
              Purchase Credits
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <Link
              to="/history"
              className="text-teal-600 hover:text-teal-800 font-medium"
            >
              View Processing History →
            </Link>
          </div>
        </div>

        {/* Main upload area and results */}
        <div className="md:col-span-2 space-y-6">
          {/* Error message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-500"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Upload area */}
          <div 
            {...getRootProps()} 
            className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors duration-300 ${
              isDragActive ? 'border-teal-500 bg-teal-50' : 'border-gray-300 hover:border-teal-500 hover:bg-teal-50'
            }`}
          >
            <input {...getInputProps()} />
            <div className="space-y-4">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H8m36-12h-4m4 0H20"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="text-base text-gray-600">
                <span className="font-medium text-teal-600">
                  Click to upload
                </span>{' '}
                or drag and drop
              </p>
              <p className="text-sm text-gray-500">
                JPG or PNG, up to 5MB
              </p>
            </div>
          </div>

          {/* Processing indicator */}
          {processing && (
            <div className="text-center p-6 bg-white rounded-lg shadow">
              <div className="animate-pulse flex flex-col items-center">
                <div className="rounded-full bg-teal-200 h-16 w-16 flex items-center justify-center mb-4">
                  <svg
                    className="h-8 w-8 text-teal-600 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </div>
                <p className="text-lg font-medium text-teal-700">
                  Processing your image...
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  This may take a few moments
                </p>
              </div>
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Processing Results
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">
                    Original Image
                  </p>
                  {originalImage && (
                    <img
                      src={originalImage}
                      alt="Original"
                      className="w-full h-auto rounded border border-gray-200"
                    />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">
                    Processed Image
                  </p>
                  <img
                    src={result.processed_image_url}
                    alt="Processed"
                    className="w-full h-auto rounded border border-gray-200"
                    style={{
                      backgroundImage: 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAALElEQVQ4T2NkYGD4z4AHMI5qABsaQxgY/4PZowZQIxpBYhQ7YTQayRKN5AUjAK5bCRFxT5QPAAAAAElFTkSuQmCC")',
                      backgroundRepeat: 'repeat',
                    }}
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <a
                  href={result.processed_image_url}
                  download
                  className="bg-teal-500 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Download Result
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;