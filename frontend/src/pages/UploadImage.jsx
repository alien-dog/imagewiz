import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const UploadImage = () => {
  const [selectedFile, setSelectedFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [processedImage, setProcessedImage] = useState(null)
  const fileInputRef = useRef(null)
  
  const { currentUser, updateUserData } = useAuth()
  const navigate = useNavigate()
  
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    
    // Reset states
    setError('')
    setProcessedImage(null)
    
    // Validate file type
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg']
      if (!validTypes.includes(file.type)) {
        setError('Please select a valid image file (JPEG, PNG)')
        setSelectedFile(null)
        setPreview(null)
        return
      }
      
      setSelectedFile(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result)
      }
      reader.readAsDataURL(file)
    } else {
      setSelectedFile(null)
      setPreview(null)
    }
  }
  
  const handleDragOver = (e) => {
    e.preventDefault()
  }
  
  const handleDrop = (e) => {
    e.preventDefault()
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange({ target: { files: e.dataTransfer.files } })
    }
  }
  
  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select an image first')
      return
    }
    
    // Check if user has enough credits
    if (currentUser.credit_balance <= 0) {
      setError('You have insufficient credits. Please purchase more credits to continue.')
      return
    }
    
    setLoading(true)
    setError('')
    
    const formData = new FormData()
    formData.append('image', selectedFile)
    
    try {
      const token = localStorage.getItem('token')
      
      const response = await axios.post(`${API_URL}/matting/process`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.data.success) {
        setProcessedImage(response.data.matting)
        // Update user data (credit balance) after successful processing
        updateUserData()
      } else {
        setError(response.data.message || 'Failed to process image')
      }
    } catch (err) {
      console.error('Error uploading image:', err)
      setError(err.response?.data?.message || 'An error occurred during processing')
    } finally {
      setLoading(false)
    }
  }
  
  const handleReset = () => {
    setSelectedFile(null)
    setPreview(null)
    setProcessedImage(null)
    setError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }
  
  return (
    <div className="py-10">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Upload Image</h1>
          <p className="text-gray-600 mt-2">
            Upload an image to remove its background with our AI technology.
          </p>
        </div>
        
        {/* Credit Balance Warning */}
        {currentUser.credit_balance <= 0 && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  You have <span className="font-medium">0 credits</span> remaining. You need at least 1 credit to process an image.
                  <a href="/pricing" className="font-medium underline text-yellow-700 hover:text-yellow-600 ml-1">
                    Buy credits
                  </a>
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="bg-white shadow rounded-lg p-6">
          {!processedImage ? (
            <div className="space-y-6">
              {/* File Upload Area */}
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                {preview ? (
                  <div className="flex flex-col items-center">
                    <img 
                      src={preview} 
                      alt="Preview" 
                      className="max-h-64 mb-4 rounded"
                    />
                    <p className="text-sm text-gray-500">
                      {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                    </p>
                    <div className="mt-4 flex space-x-3">
                      <button
                        type="button"
                        onClick={handleReset}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Change Image
                      </button>
                      <button
                        type="button"
                        onClick={handleUpload}
                        disabled={loading || currentUser.credit_balance <= 0}
                        className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${(loading || currentUser.credit_balance <= 0) ? 'opacity-70 cursor-not-allowed' : ''}`}
                      >
                        {loading ? 'Processing...' : 'Remove Background'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <div className="flex text-sm text-gray-600 justify-center">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-blue-500 hover:text-blue-400 focus-within:outline-none"
                        >
                          <span>Upload an image</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            accept="image/png, image/jpeg, image/jpg"
                            onChange={handleFileChange}
                            ref={fileInputRef}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG up to 10MB
                      </p>
                    </div>
                  </>
                )}
              </div>
              
              {/* Information Panel */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-2">How it works</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <span className="bg-blue-100 text-blue-500 rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5 font-bold text-xs">1</span>
                    <span>Upload your image (JPG, PNG) using the form above</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-blue-100 text-blue-500 rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5 font-bold text-xs">2</span>
                    <span>Our AI will automatically detect and remove the background</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-blue-100 text-blue-500 rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5 font-bold text-xs">3</span>
                    <span>Download the processed image with a transparent background</span>
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800">Image Processed Successfully!</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-md font-medium text-gray-700 mb-2">Original Image</h3>
                  <img 
                    src={`${API_URL}${processedImage.original_image_url}`} 
                    alt="Original" 
                    className="max-w-full h-auto rounded shadow"
                  />
                </div>
                
                <div>
                  <h3 className="text-md font-medium text-gray-700 mb-2">Processed Image</h3>
                  <div className="bg-checkered rounded shadow">
                    <img 
                      src={`${API_URL}${processedImage.processed_image_url}`} 
                      alt="Processed" 
                      className="max-w-full h-auto rounded"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-4 border-t">
                <div>
                  <p className="text-sm text-gray-600">
                    Credits used: <span className="font-medium">{processedImage.credit_spent}</span> | 
                    Credits remaining: <span className="font-medium">{currentUser.credit_balance}</span>
                  </p>
                </div>
                
                <div className="flex space-x-3">
                  <a 
                    href={`${API_URL}${processedImage.processed_image_url}`}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Download Image
                  </a>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Process Another Image
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default UploadImage