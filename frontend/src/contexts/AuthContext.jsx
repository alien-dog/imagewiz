import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token')
    
    if (token) {
      fetchUserData(token)
    } else {
      setLoading(false)
    }
  }, [])
  
  // Fetch user data from API
  const fetchUserData = async (token) => {
    try {
      const response = await axios.get(`${API_URL}/auth/user`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.data.success) {
        setCurrentUser(response.data.user)
      } else {
        // Token might be invalid, remove it
        localStorage.removeItem('token')
        setCurrentUser(null)
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
      localStorage.removeItem('token')
      setCurrentUser(null)
    } finally {
      setLoading(false)
    }
  }
  
  // Login function
  const login = async (username, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        username,
        password
      })
      
      if (response.data.success) {
        localStorage.setItem('token', response.data.token)
        setCurrentUser(response.data.user)
        return response.data.user
      } else {
        throw new Error(response.data.message || 'Login failed')
      }
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message)
      }
      throw new Error('Login failed. Please check your credentials.')
    }
  }
  
  // Register function
  const register = async (username, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        username,
        password
      })
      
      if (response.data.success) {
        localStorage.setItem('token', response.data.token)
        setCurrentUser(response.data.user)
        return response.data.user
      } else {
        throw new Error(response.data.message || 'Registration failed')
      }
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message)
      }
      throw new Error('Registration failed. Please try again.')
    }
  }
  
  // Logout function
  const logout = () => {
    localStorage.removeItem('token')
    setCurrentUser(null)
  }
  
  // Update user data (e.g., after credit purchase)
  const updateUserData = async () => {
    const token = localStorage.getItem('token')
    if (token) {
      await fetchUserData(token)
    }
  }
  
  const value = {
    currentUser,
    loading,
    login,
    register,
    logout,
    updateUserData
  }
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}