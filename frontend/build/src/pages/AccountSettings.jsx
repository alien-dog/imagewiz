import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'

export default function AccountSettings() {
  const { currentUser, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  
  // Profile settings state
  const [name, setName] = useState(currentUser?.name || '')
  const [email, setEmail] = useState(currentUser?.email || '')
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
  const [profileError, setProfileError] = useState(null)
  const [profileSuccess, setProfileSuccess] = useState(false)
  
  // Password settings state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState(null)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  
  // Handle profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setProfileError(null)
    setProfileSuccess(false)
    setIsUpdatingProfile(true)
    
    try {
      // API call to update profile
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name,
          email
        })
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to update profile')
      }
      
      setProfileSuccess(true)
    } catch (error) {
      setProfileError(error.message)
    } finally {
      setIsUpdatingProfile(false)
    }
  }
  
  // Handle password update
  const handlePasswordUpdate = async (e) => {
    e.preventDefault()
    setPasswordError(null)
    setPasswordSuccess(false)
    
    // Validate passwords
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match')
      return
    }
    
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long')
      return
    }
    
    setIsUpdatingPassword(true)
    
    try {
      // API call to update password
      const response = await fetch('/api/user/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to update password')
      }
      
      // Reset password fields
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      
      setPasswordSuccess(true)
    } catch (error) {
      setPasswordError(error.message)
    } finally {
      setIsUpdatingPassword(false)
    }
  }
  
  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return
    }
    
    try {
      // API call to delete account
      const response = await fetch('/api/user', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to delete account')
      }
      
      // Log out the user after successful deletion
      logout()
    } catch (error) {
      alert('Error deleting account: ' + error.message)
    }
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Account Settings</h1>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-4 px-6 text-sm font-medium ${
              activeTab === 'profile'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`py-4 px-6 text-sm font-medium ${
              activeTab === 'password'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Password
          </button>
          <button
            onClick={() => setActiveTab('subscription')}
            className={`py-4 px-6 text-sm font-medium ${
              activeTab === 'subscription'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Subscription
          </button>
          <button
            onClick={() => setActiveTab('danger')}
            className={`py-4 px-6 text-sm font-medium ${
              activeTab === 'danger'
                ? 'border-b-2 border-red-500 text-red-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Delete Account
          </button>
        </div>
        
        <div className="p-6">
          {/* Profile Settings */}
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileUpdate}>
              <h2 className="text-xl font-semibold mb-6">Profile Settings</h2>
              
              {profileError && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md border border-red-200">
                  {profileError}
                </div>
              )}
              
              {profileSuccess && (
                <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md border border-green-200">
                  Profile updated successfully
                </div>
              )}
              
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className={`bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    isUpdatingProfile ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {isUpdatingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}
          
          {/* Password Settings */}
          {activeTab === 'password' && (
            <form onSubmit={handlePasswordUpdate}>
              <h2 className="text-xl font-semibold mb-6">Change Password</h2>
              
              {passwordError && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md border border-red-200">
                  {passwordError}
                </div>
              )}
              
              {passwordSuccess && (
                <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md border border-green-200">
                  Password updated successfully
                </div>
              )}
              
              <div className="mb-4">
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Must be at least 8 characters long
                </p>
              </div>
              
              <div className="mb-6">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className={`bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    isUpdatingPassword ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          )}
          
          {/* Subscription Settings */}
          {activeTab === 'subscription' && (
            <div>
              <h2 className="text-xl font-semibold mb-6">Subscription Management</h2>
              
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-medium text-gray-900">Current Plan</h3>
                    <p className="text-gray-600">{currentUser?.plan || 'Free'}</p>
                  </div>
                  <div className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    Active
                  </div>
                </div>
                
                <div className="border-t border-gray-200 my-4 pt-4">
                  <p className="text-sm text-gray-600 mb-1">
                    Credits: <span className="font-medium">{currentUser?.credits || 0} remaining</span>
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    Renewal date: <span className="font-medium">
                      {new Date().toLocaleDateString()}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Billing cycle: <span className="font-medium">Monthly</span>
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-4">
                <Link 
                  to="/pricing" 
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Change Plan
                </Link>
                <button 
                  className="text-gray-700 border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Cancel Subscription
                </button>
              </div>
              
              <div className="mt-8">
                <h3 className="font-medium text-gray-900 mb-2">Payment Method</h3>
                <div className="flex items-center p-4 border border-gray-200 rounded-lg">
                  <div className="mr-4 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Visa ending in 4242</p>
                    <p className="text-sm text-gray-500">Expires 12/2025</p>
                  </div>
                  <button className="ml-auto text-blue-600 hover:text-blue-800 text-sm">
                    Update
                  </button>
                </div>
              </div>
              
              <div className="mt-8">
                <h3 className="font-medium text-gray-900 mb-2">Billing History</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="relative px-6 py-3">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          March 1, 2025
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          $9.99
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Paid
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <a href="#" className="text-blue-600 hover:text-blue-900">
                            Invoice
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          February 1, 2025
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          $9.99
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Paid
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <a href="#" className="text-blue-600 hover:text-blue-900">
                            Invoice
                          </a>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          
          {/* Delete Account */}
          {activeTab === 'danger' && (
            <div>
              <h2 className="text-xl font-semibold mb-6">Delete Account</h2>
              
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                <h3 className="text-lg font-medium text-red-800 mb-2">Warning: This action cannot be undone</h3>
                <p className="text-red-700">
                  Once you delete your account, all of your data will be permanently removed. This includes your profile, images, credit history, and all other associated data.
                </p>
              </div>
              
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-2">Before you delete your account:</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Download any processed images you want to keep</li>
                  <li>Cancel any active subscriptions</li>
                  <li>Consider reaching out to our support team if you're having issues</li>
                </ul>
              </div>
              
              <button 
                onClick={handleDeleteAccount}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Delete Account
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}