import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export const Header = () => {
  const { user: currentUser, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }
  
  const handleLogout = async () => {
    try {
      await logout()
      // Close mobile menu after logout
      setMobileMenuOpen(false)
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }
  
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold text-blue-500">iMagenWiz</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6 items-center">
            <Link to="/" className="text-gray-600 hover:text-blue-500">Home</Link>
            <Link to="/pricing" className="text-gray-600 hover:text-blue-500">Pricing</Link>
            
            {currentUser ? (
              <>
                <Link to="/dashboard" className="text-gray-600 hover:text-blue-500">Dashboard</Link>
                <Link to="/upload" className="text-gray-600 hover:text-blue-500">Upload</Link>
                <Link to="/history" className="text-gray-600 hover:text-blue-500">History</Link>
                {currentUser && currentUser.is_admin && (
                  <Link to="/cms" className="text-gray-600 hover:text-blue-500 font-semibold">CMS</Link>
                )}
                <div className="relative group">
                  <button className="flex items-center text-gray-600 hover:text-blue-500">
                    <span>Account</span>
                    <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b">
                      <div>{currentUser.email || currentUser.username}</div>
                      <div className="text-blue-500">{currentUser.credit_balance || 0} Credits</div>
                    </div>
                    <Link to="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</Link>
                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <Link 
                to="/auth" 
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
              >
                Login / Sign Up
              </Link>
            )}
          </nav>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              onClick={toggleMobileMenu}
              className="text-gray-500 hover:text-blue-500 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 pb-3 space-y-1">
            <Link 
              to="/" 
              className="block py-2 text-gray-600 hover:text-blue-500"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/pricing" 
              className="block py-2 text-gray-600 hover:text-blue-500"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            
            {currentUser ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="block py-2 text-gray-600 hover:text-blue-500"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/upload" 
                  className="block py-2 text-gray-600 hover:text-blue-500"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Upload
                </Link>
                <Link 
                  to="/history" 
                  className="block py-2 text-gray-600 hover:text-blue-500"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  History
                </Link>
                {currentUser && currentUser.is_admin && (
                  <Link 
                    to="/cms" 
                    className="block py-2 text-gray-600 hover:text-blue-500 font-semibold"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    CMS
                  </Link>
                )}
                <Link 
                  to="/settings" 
                  className="block py-2 text-gray-600 hover:text-blue-500"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Settings
                </Link>
                <div className="pt-2 border-t border-gray-200">
                  <div className="py-2 text-sm text-gray-700">
                    <div>{currentUser.email || currentUser.username}</div>
                    <div className="text-blue-500">{currentUser.credit_balance || 0} Credits</div>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="block w-full text-left py-2 text-red-600 hover:text-red-800"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <Link 
                to="/auth" 
                className="block py-2 text-blue-500 hover:text-blue-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login / Sign Up
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  )
}