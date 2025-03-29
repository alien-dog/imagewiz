import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function ImageHistory() {
  const [images, setImages] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const { currentUser } = useAuth()
  
  // Fetch image history from API
  useEffect(() => {
    const fetchImages = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        const response = await fetch('/api/images', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch image history')
        }
        
        const data = await response.json()
        setImages(data.images || [])
      } catch (error) {
        console.error('Error fetching images:', error)
        setError(error.message)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchImages()
  }, [])
  
  // Handle image deletion
  const handleDeleteImage = async (imageId) => {
    if (!window.confirm('Are you sure you want to delete this image?')) {
      return
    }
    
    try {
      const response = await fetch(`/api/images/${imageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete image')
      }
      
      // Remove the deleted image from state
      setImages(images.filter(image => image.id !== imageId))
    } catch (error) {
      console.error('Error deleting image:', error)
      alert('Error deleting image: ' + error.message)
    }
  }
  
  // For demonstration purposes, let's create some mock data
  const mockImages = [
    {
      id: 1,
      originalUrl: 'https://via.placeholder.com/300x300',
      processedUrl: 'https://via.placeholder.com/300x300',
      filename: 'product_photo.jpg',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      fileSize: 1200000, // 1.2MB
    },
    {
      id: 2,
      originalUrl: 'https://via.placeholder.com/300x300',
      processedUrl: 'https://via.placeholder.com/300x300',
      filename: 'profile_picture.png',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
      fileSize: 800000, // 800KB
    },
    {
      id: 3,
      originalUrl: 'https://via.placeholder.com/300x300',
      processedUrl: 'https://via.placeholder.com/300x300',
      filename: 'banner_image.png',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
      fileSize: 2500000, // 2.5MB
    }
  ]
  
  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    else return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Image History</h1>
        <Link 
          to="/upload" 
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium transition-colors"
        >
          Process New Image
        </Link>
      </div>
      
      {/* Plan info */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <div>
            <p className="text-gray-700">
              Your <span className="font-medium">{currentUser?.plan || 'Free'} Plan</span> includes image history for{' '}
              <span className="font-medium">
                {currentUser?.plan === 'Pro' ? '30 days' : currentUser?.plan === 'Enterprise' ? 'unlimited time' : '1 day'}
              </span>
            </p>
          </div>
          {currentUser?.plan === 'Free' && (
            <Link 
              to="/pricing" 
              className="mt-4 md:mt-0 text-blue-600 hover:text-blue-700 font-medium"
            >
              Upgrade for longer history retention
            </Link>
          )}
        </div>
      </div>
      
      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {/* Error state */}
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md mb-8">
          <p className="font-medium">Error loading images</p>
          <p>{error}</p>
        </div>
      )}
      
      {/* Empty state */}
      {!isLoading && !error && (images.length === 0) && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h2 className="text-xl font-semibold mb-2">No processed images yet</h2>
          <p className="text-gray-600 mb-6">
            Once you process images, they'll appear here for easy access
          </p>
          <Link 
            to="/upload" 
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md font-medium transition-colors inline-block"
          >
            Process Your First Image
          </Link>
        </div>
      )}
      
      {/* Image grid */}
      {!isLoading && !error && (mockImages.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockImages.map(image => (
            <div key={image.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative">
                <div className="aspect-w-1 aspect-h-1 bg-checkered">
                  <img 
                    src={image.processedUrl} 
                    alt={image.filename}
                    className="object-contain w-full h-full"
                  />
                </div>
                <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs py-1 px-2 rounded">
                  {formatFileSize(image.fileSize)}
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-gray-900 truncate w-3/4" title={image.filename}>
                    {image.filename}
                  </h3>
                  <span className="text-xs text-gray-500">
                    {formatDate(image.createdAt)}
                  </span>
                </div>
                
                <div className="flex space-x-2 mt-4">
                  <a 
                    href={image.processedUrl} 
                    download={image.filename}
                    className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors flex-1 text-center"
                  >
                    Download
                  </a>
                  <button 
                    onClick={() => handleDeleteImage(image.id)}
                    className="text-red-500 hover:text-red-700 px-2 transition-colors"
                    title="Delete image"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Pagination - would be implemented in a real app */}
      {!isLoading && !error && mockImages.length > 0 && (
        <div className="mt-8 flex justify-center">
          <nav className="inline-flex rounded-md shadow">
            <a 
              href="#" 
              className="py-2 px-4 bg-white border border-gray-300 text-gray-500 rounded-l-md hover:bg-gray-50"
            >
              Previous
            </a>
            <a 
              href="#" 
              className="py-2 px-4 bg-blue-50 border border-blue-500 text-blue-600"
            >
              1
            </a>
            <a 
              href="#" 
              className="py-2 px-4 bg-white border border-gray-300 text-gray-500 hover:bg-gray-50"
            >
              2
            </a>
            <a 
              href="#" 
              className="py-2 px-4 bg-white border border-gray-300 text-gray-500 rounded-r-md hover:bg-gray-50"
            >
              Next
            </a>
          </nav>
        </div>
      )}
    </div>
  )
}