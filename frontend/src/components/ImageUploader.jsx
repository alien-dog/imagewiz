import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ImageUploader = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) {
      setFile(null);
      setPreview('');
      return;
    }

    // Check file type
    const fileType = selectedFile.type;
    if (!['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(fileType)) {
      setError('Please upload a PNG, JPEG, or WebP image.');
      setFile(null);
      setPreview('');
      return;
    }

    // Check file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10MB limit.');
      setFile(null);
      setPreview('');
      return;
    }

    setFile(selectedFile);
    setError('');
    setResult(null);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      // Create a synthetic event object with the files
      const syntheticEvent = {
        target: {
          files: [droppedFile]
        }
      };
      handleFileChange(syntheticEvent);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select an image first.');
      return;
    }

    if (user?.credits < 1) {
      setError('Insufficient credits. Please purchase more credits.');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('token');
      const response = await axios.post('/api/matting/process', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      setResult(response.data);
      refreshUser(); // Refresh user data to update credits
    } catch (error) {
      console.error('Upload error:', error);
      setError(error.response?.data?.error || 'Failed to process the image. Please try again later.');
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setPreview('');
    setResult(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const browseMore = () => {
    resetForm();
  };

  const goToHistory = () => {
    navigate('/history');
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
        Remove Image Background
      </h2>

      {!result ? (
        <>
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-teal-500 transition-colors"
            onClick={() => fileInputRef.current.click()}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {preview ? (
              <div className="flex flex-col items-center">
                <img src={preview} alt="Preview" className="max-h-64 max-w-full object-contain mb-4" />
                <p className="text-sm text-gray-500">Click or drag to replace</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <svg
                  className="w-16 h-16 text-gray-400 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  ></path>
                </svg>
                <p className="text-gray-600 mb-2">Drag and drop your image here or click to browse</p>
                <p className="text-sm text-gray-500">Supported formats: PNG, JPEG, WebP</p>
                <p className="text-sm text-gray-500">Max size: 10MB</p>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/png, image/jpeg, image/jpg, image/webp"
            />
          </div>

          <div className="flex justify-between items-center mt-6">
            <div className="text-sm text-gray-600">
              {user ? `Credits available: ${user.credits}` : 'Loading credits...'}
            </div>
            <button
              onClick={handleUpload}
              disabled={!file || isUploading || user?.credits < 1}
              className={`px-6 py-2 rounded-md text-white font-medium 
                ${!file || isUploading || user?.credits < 1
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-teal-500 hover:bg-teal-600'
                }`}
            >
              {isUploading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                'Remove Background'
              )}
            </button>
          </div>
        </>
      ) : (
        <div className="result-container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Original Image</h3>
              <img
                src={result.original_image}
                alt="Original"
                className="w-full h-auto border border-gray-200 rounded-lg"
              />
            </div>
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Processed Image</h3>
              <img
                src={result.processed_image}
                alt="Processed"
                className="w-full h-auto border border-gray-200 rounded-lg bg-checkerboard"
              />
            </div>
          </div>
          <div className="text-sm text-gray-600 mb-4">
            Credits remaining: {result.credits_remaining}
          </div>
          <div className="flex space-x-4">
            <button
              onClick={browseMore}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Process Another Image
            </button>
            <a
              href={result.processed_image}
              download
              className="px-6 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600"
            >
              Download
            </a>
            <button
              onClick={goToHistory}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              View History
            </button>
          </div>
        </div>
      )}

      {error && <div className="mt-4 text-red-500 text-center">{error}</div>}

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

export default ImageUploader;