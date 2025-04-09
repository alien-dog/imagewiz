import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white to-teal-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0 md:pr-10">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Remove Image Backgrounds in Seconds
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Our AI-powered technology makes background removal fast, easy, and precise. Perfect for e-commerce, marketing, or personal projects.
              </p>
              <div className="flex flex-wrap gap-4">
                {isAuthenticated ? (
                  <Link
                    to="/dashboard"
                    className="bg-teal-500 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300"
                  >
                    Go to Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/register"
                      className="bg-teal-500 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300"
                    >
                      Get Started Free
                    </Link>
                    <Link
                      to="/login"
                      className="bg-white hover:bg-gray-100 text-teal-600 font-bold py-3 px-6 rounded-lg shadow-lg border border-teal-500 transition duration-300"
                    >
                      Login
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="md:w-1/2">
              <img
                src="/images/hero-image.svg"
                alt="AI Background Removal Demo"
                className="rounded-lg shadow-xl"
                onError={(e) => {
                  console.error("Failed to load hero image:", e);
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/600x400?text=iMagenWiz+Demo';
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Why Choose iMagenWiz?</h2>
            <p className="mt-4 text-xl text-gray-600">
              Our advanced AI provides the best results in the industry
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Feature 1 */}
            <div className="bg-gray-50 p-8 rounded-xl shadow-md">
              <div className="w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Lightning Fast</h3>
              <p className="text-gray-600">
                Process images in seconds, not minutes. Our AI is optimized for speed without sacrificing quality.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gray-50 p-8 rounded-xl shadow-md">
              <div className="w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Precise Results</h3>
              <p className="text-gray-600">
                Our AI accurately detects edges, hair, and complex details that other tools miss.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gray-50 p-8 rounded-xl shadow-md">
              <div className="w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Easy to Use</h3>
              <p className="text-gray-600">
                Simply upload your image and download the result. No technical expertise required.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
            <p className="mt-4 text-xl text-gray-600">
              Three simple steps to remove image backgrounds
            </p>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center space-y-10 md:space-y-0 md:space-x-8">
            {/* Step 1 */}
            <div className="text-center md:w-1/3">
              <div className="bg-teal-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-xl">1</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Upload Image</h3>
              <p className="text-gray-600">
                Upload any image from your device to our secure platform
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center md:w-1/3">
              <div className="bg-teal-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-xl">2</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">AI Processing</h3>
              <p className="text-gray-600">
                Our AI automatically detects and removes the background
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center md:w-1/3">
              <div className="bg-teal-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-xl">3</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Download Result</h3>
              <p className="text-gray-600">
                Download your transparent PNG or choose a custom background
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-teal-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to remove backgrounds?
          </h2>
          <p className="text-xl text-white mb-8 max-w-3xl mx-auto">
            Join thousands of professionals who trust iMagenWiz for their image processing needs.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="bg-white hover:bg-gray-100 text-teal-600 font-bold py-3 px-8 rounded-lg shadow-lg transition duration-300"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="bg-white hover:bg-gray-100 text-teal-600 font-bold py-3 px-8 rounded-lg shadow-lg transition duration-300"
                >
                  Get Started Free
                </Link>
                <Link
                  to="/pricing"
                  className="bg-transparent hover:bg-teal-400 text-white border border-white font-bold py-3 px-8 rounded-lg shadow-lg transition duration-300"
                >
                  View Pricing
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;