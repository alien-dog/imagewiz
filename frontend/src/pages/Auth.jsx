import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

export function Auth({ onLogin }) {
  const [isLoginMode, setIsLoginMode] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }
  
  const validateForm = () => {
    if (isLoginMode) {
      return formData.email.trim() !== '' && formData.password.trim() !== ''
    } else {
      return (
        formData.username.trim() !== '' &&
        formData.email.trim() !== '' &&
        formData.password.trim() !== '' &&
        formData.password === formData.confirmPassword
      )
    }
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      if (!isLoginMode && formData.password !== formData.confirmPassword) {
        toast.error('Passwords do not match')
      } else {
        toast.error('Please fill in all fields')
      }
      return
    }
    
    setIsLoading(true)
    
    try {
      const endpoint = isLoginMode ? '/auth/login' : '/auth/register'
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed')
      }
      
      toast.success(isLoginMode ? 'Login successful!' : 'Registration successful!')
      onLogin(data)
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.message || 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
          <div className="md:flex">
            {/* Form Section */}
            <div className="md:w-1/2 p-8 md:p-12">
              <h2 className="text-2xl font-bold text-teal-600 mb-6">
                {isLoginMode ? 'Sign In to Your Account' : 'Create an Account'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {!isLoginMode && (
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Choose a username"
                    />
                  </div>
                )}
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter your email"
                  />
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter your password"
                  />
                </div>
                
                {!isLoginMode && (
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Confirm your password"
                    />
                  </div>
                )}
                
                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full btn-primary flex justify-center items-center"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      isLoginMode ? 'Sign In' : 'Create Account'
                    )}
                  </button>
                </div>
              </form>
              
              <div className="mt-6 text-center">
                <button
                  onClick={() => setIsLoginMode(!isLoginMode)}
                  className="text-teal-600 hover:text-teal-800 font-medium"
                >
                  {isLoginMode ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                </button>
              </div>
              
              <div className="mt-8">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                  </div>
                </div>
                
                <div className="mt-6">
                  <button className="w-full bg-white border border-gray-300 rounded-md py-2 px-4 flex justify-center items-center text-gray-700 hover:bg-gray-50">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" fill="#4285F4" />
                      <path d="M7.545,14.021l-1.232-0.921l-0.088,0.088v0.001l4.426,3.525l6.066-7.589h-7.421" fill="#FBBC05" />
                      <path d="M7.545,9.979L7.545,9.979l4.426-3.525l1.428,1.132l5.071-1.043l0.002-0.003C16.971,4.389,14.441,3,12.545,3c-3.566,0-6.614,2.072-8.073,5.067" fill="#EA4335" />
                      <path d="M12.545,21c3.633,0,6.688-1.199,8.902-3.242L16.215,13.95c-1.325,0.89-3.03,1.422-4.88,1.422c-3.458,0-6.389-2.332-7.436-5.485l-0.728,0.697L0.08,13.681l0.05,0.142C2.090,18.297,6.975,21,12.545,21" fill="#34A853" />
                    </svg>
                    Sign in with Google
                  </button>
                </div>
              </div>
            </div>
            
            {/* Hero Section */}
            <div className="md:w-1/2 bg-gradient-to-br from-teal-500 to-teal-600 text-white p-8 md:p-12 flex flex-col justify-center">
              <h3 className="text-2xl font-bold mb-4">Welcome to iMagenWiz</h3>
              <p className="text-lg mb-6">
                The professional AI-powered background removal and image editing platform.
              </p>
              
              <ul className="space-y-3">
                <li className="flex items-start">
                  <svg className="h-6 w-6 mr-2 text-teal-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Remove backgrounds in seconds</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 mr-2 text-teal-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Advanced AI detection for hair and fine details</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 mr-2 text-teal-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Download in multiple formats</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 mr-2 text-teal-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Process in bulk for e-commerce and catalogs</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}