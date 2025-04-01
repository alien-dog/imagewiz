import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function HomePage() {
  const { currentUser } = useAuth()
  
  return (
    <div className="flex flex-col min-h-full">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0 md:pr-10">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
                Remove Image Backgrounds <span className="text-blue-200">Instantly</span> with AI
              </h1>
              <p className="text-xl mb-8 text-blue-100">
                Professional-quality background removal powered by artificial intelligence. 
                Fast, accurate, and incredibly easy to use.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                {currentUser ? (
                  <Link 
                    to="/upload" 
                    className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-md font-medium text-center"
                  >
                    Upload Image
                  </Link>
                ) : (
                  <Link 
                    to="/auth" 
                    className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-md font-medium text-center"
                  >
                    Get Started
                  </Link>
                )}
                <Link 
                  to="/pricing" 
                  className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 rounded-md font-medium transition-colors text-center"
                >
                  View Plans
                </Link>
              </div>
            </div>
            <div className="md:w-1/2">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-400 rounded-lg transform rotate-3"></div>
                <div className="relative bg-white p-2 rounded-lg shadow-xl">
                  <div className="aspect-w-16 aspect-h-9 rounded-md overflow-hidden">
                    <img 
                      src="/sample-before-after.jpg" 
                      alt="Before and after background removal" 
                      className="object-cover w-full h-full"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/800x450?text=Before+and+After';
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Remove backgrounds from images in three simple steps
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center text-blue-500 text-2xl font-bold mx-auto mb-6">1</div>
              <h3 className="text-xl font-semibold mb-4">Upload Your Image</h3>
              <p className="text-gray-600">
                Select and upload the image you want to process. We support JPG, PNG, and WebP formats.
              </p>
            </div>
            
            {/* Step 2 */}
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center text-blue-500 text-2xl font-bold mx-auto mb-6">2</div>
              <h3 className="text-xl font-semibold mb-4">AI Processing</h3>
              <p className="text-gray-600">
                Our advanced AI removes the background automatically with precision and attention to detail.
              </p>
            </div>
            
            {/* Step 3 */}
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center text-blue-500 text-2xl font-bold mx-auto mb-6">3</div>
              <h3 className="text-xl font-semibold mb-4">Download Result</h3>
              <p className="text-gray-600">
                Download your processed image with a transparent background in PNG format, ready to use.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Benefits Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Choose iMagenWiz</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Professional tools for designers, marketers, and businesses
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Benefit 1 */}
            <div className="flex">
              <div className="mr-4 text-blue-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
                <p className="text-gray-600">
                  Process images in seconds, not minutes. No more waiting for manual edits.
                </p>
              </div>
            </div>
            
            {/* Benefit 2 */}
            <div className="flex">
              <div className="mr-4 text-blue-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Pixel-Perfect Accuracy</h3>
                <p className="text-gray-600">
                  Our AI precisely detects edges, hair, and transparent objects with exceptional detail.
                </p>
              </div>
            </div>
            
            {/* Benefit 3 */}
            <div className="flex">
              <div className="mr-4 text-blue-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Transparent Background</h3>
                <p className="text-gray-600">
                  Get images with crystal-clear transparent backgrounds ready for any design.
                </p>
              </div>
            </div>
            
            {/* Benefit 4 */}
            <div className="flex">
              <div className="mr-4 text-blue-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Bulk Processing</h3>
                <p className="text-gray-600">
                  Process multiple images at once to save time on large projects.
                </p>
              </div>
            </div>
            
            {/* Benefit 5 */}
            <div className="flex">
              <div className="mr-4 text-blue-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Easy Customization</h3>
                <p className="text-gray-600">
                  Adjust settings and fine-tune results with our intuitive controls.
                </p>
              </div>
            </div>
            
            {/* Benefit 6 */}
            <div className="flex">
              <div className="mr-4 text-blue-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Detailed History</h3>
                <p className="text-gray-600">
                  Access all your processed images in one secure location for future use.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who trust iMagenWiz for their image processing needs.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            {currentUser ? (
              <Link 
                to="/upload" 
                className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-md font-medium"
              >
                Process Images Now
              </Link>
            ) : (
              <Link 
                to="/auth" 
                className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-md font-medium"
              >
                Create Free Account
              </Link>
            )}
            <Link 
              to="/pricing" 
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 rounded-md font-medium transition-colors"
            >
              See Pricing Plans
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}