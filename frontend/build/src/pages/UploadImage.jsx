import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function UploadImage() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [result, setResult] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)
  const { currentUser, updateUserData } = useAuth()
  
  // Handle file selection
  const handleFileChange = (event) => {
    const file = event.target.files[0]
    if (!file) return
    
    setError(null)
    
    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, or WebP)')
      return
    }
    
    // Check file size (2MB for free plan, 15MB for pro plan)
    const maxSize = currentUser?.plan === 'Pro' ? 15 * 1024 * 1024 : 2 * 1024 * 1024
    if (file.size > maxSize) {
      const sizeMB = maxSize / (1024 * 1024)
      setError(`File size exceeds the maximum allowed (${sizeMB}MB). Upgrade to Pro for larger file support.`)
      return
    }
    
    setSelectedFile(file)
    
    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result)
    }
    reader.readAsDataURL(file)
    
    // Reset result when a new file is selected
    setResult(null)
  }
  
  // Handle file drop
  const handleDrop = (event) => {
    event.preventDefault()
    
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      const droppedFile = event.dataTransfer.files[0]
      
      // Manually assign the file to the file input
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(droppedFile)
      fileInputRef.current.files = dataTransfer.files
      
      // Trigger the onChange handler
      handleFileChange({ target: { files: dataTransfer.files } })
    }
  }
  
  // Prevent default drag behavior
  const handleDragOver = (event) => {
    event.preventDefault()
  }
  
  // Reset the form
  const handleReset = () => {
    setSelectedFile(null)
    setPreview(null)
    setResult(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }
  
  // Process the image
  const handleProcessImage = async () => {
    if (!selectedFile) return
    
    setIsProcessing(true)
    setError(null)
    
    try {
      // Check if user has enough credits
      if ((currentUser?.credits || 0) < 1) {
        throw new Error('You don\'t have enough credits. Please purchase more credits to continue.')
      }
      
      // Create form data for upload
      const formData = new FormData()
      formData.append('image', selectedFile)
      
      // API call to backend for processing
      const response = await fetch('/api/process-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to process image')
      }
      
      const data = await response.json()
      
      // Update result with processed image URL
      setResult(data.processedImageUrl)
      
      // Update user data (credits, etc.)
      await updateUserData()
      
    } catch (error) {
      setError(error.message)
    } finally {
      setIsProcessing(false)
    }
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Remove Image Background</h1>
        
        {/* Credits info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <p className="text-gray-700 mb-4 md:mb-0">
              You have <span className="font-bold text-blue-600">{currentUser?.credits || 0}</span> credits remaining.
              Each image processed uses 1 credit.
            </p>
            {(currentUser?.credits || 0) < 5 && (
              <Link 
                to="/pricing" 
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Get more credits
              </Link>
            )}
          </div>
        </div>
        
        {/* Upload area */}
        {!result && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              {preview ? (
                <div className="mb-6">
                  <img 
                    src={preview} 
                    alt="Preview" 
                    className="max-h-64 mx-auto rounded-lg"
                  />
                </div>
              ) : (
                <div className="py-8">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <h3 className="text-xl font-semibold mb-2">Drag and drop your image here</h3>
                  <p className="text-gray-500 mb-4">or click to select a file</p>
                  <p className="text-gray-500 text-sm">
                    Supported formats: JPG, PNG, WebP. 
                    <br />Maximum size: {currentUser?.plan === 'Pro' ? '15MB' : '2MB'}
                  </p>
                </div>
              )}
              
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                ref={fileInputRef}
                className="hidden"
                id="file-upload"
              />
              
              <div className="mt-4 flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                <label
                  htmlFor="file-upload"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium cursor-pointer transition-colors inline-block"
                >
                  {preview ? 'Select Another Image' : 'Select Image'}
                </label>
                
                {preview && (
                  <>
                    <button
                      onClick={handleProcessImage}
                      disabled={isProcessing}
                      className={`bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md font-medium transition-colors ${
                        isProcessing ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
                    >
                      {isProcessing ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </span>
                      ) : (
                        'Remove Background'
                      )}
                    </button>
                    <button
                      onClick={handleReset}
                      className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-md font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
            
            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md border border-red-200">
                {error}
              </div>
            )}
          </div>
        )}
        
        {/* Results */}
        {result && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold mb-6 text-center">Background Removed Successfully!</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-lg font-semibold mb-3 text-center">Original</h3>
                <div className="bg-checkered rounded-lg overflow-hidden">
                  <img 
                    src={preview} 
                    alt="Original image" 
                    className="w-full h-auto"
                  />
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3 text-center">Processed</h3>
                <div className="bg-checkered rounded-lg overflow-hidden">
                  <img 
                    src={result} 
                    alt="Processed image" 
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
              <a 
                href={result} 
                download="processed-image.png"
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md font-medium transition-colors text-center"
              >
                Download
              </a>
              <button 
                onClick={handleReset}
                className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2 rounded-md font-medium transition-colors"
              >
                Process Another Image
              </button>
            </div>
          </div>
        )}
        
        {/* Tutorial and tips */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Tips for Best Results</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex">
              <div className="mr-4 text-blue-500 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">Good Lighting</h3>
                <p className="text-gray-600">Use well-lit images with clear contrast between the subject and background.</p>
              </div>
            </div>
            
            <div className="flex">
              <div className="mr-4 text-blue-500 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">Clear Subject</h3>
                <p className="text-gray-600">Ensure your subject is clearly visible and distinct from the background.</p>
              </div>
            </div>
            
            <div className="flex">
              <div className="mr-4 text-blue-500 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">Higher Resolution</h3>
                <p className="text-gray-600">Use higher resolution images for better detail preservation in the final result.</p>
              </div>
            </div>
            
            <div className="flex">
              <div className="mr-4 text-blue-500 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">Simple Backgrounds</h3>
                <p className="text-gray-600">Images with simpler backgrounds typically yield better results than complex ones.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}