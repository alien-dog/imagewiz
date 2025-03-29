import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

// Create context
export const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set up axios defaults - don't include /api as Vite proxy handles this
  axios.defaults.baseURL = '';

  // Set token in axios headers and localStorage
  const setAuthToken = (token) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  };

  // Register user
  const register = async (username, password) => {
    try {
      setError(null);
      const res = await axios.post('/api/auth/register', { username, password });
      setToken(res.data.access_token);
      setUser(res.data.user);
      setAuthToken(res.data.access_token);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
      throw err;
    }
  };

  // Login user
  const login = async (username, password) => {
    try {
      setError(null);
      console.log("Login attempt for:", username);
      console.log("Using axios baseURL:", axios.defaults.baseURL);
      console.log("Login URL:", axios.defaults.baseURL + '/api/auth/login');
      
      const res = await axios.post('/api/auth/login', { username, password });
      console.log("Login response:", res.data);
      console.log("Response structure:", JSON.stringify(res.data, null, 2));
      
      if (!res.data.access_token) {
        console.error("Missing access_token in response");
        setError('Login failed: Invalid response from server');
        throw new Error('Missing access_token in login response');
      }
      
      if (!res.data.user) {
        console.error("Missing user data in response");
        setError('Login failed: Invalid response from server');
        throw new Error('Missing user data in login response');
      }
      
      setToken(res.data.access_token);
      setUser(res.data.user);
      setAuthToken(res.data.access_token);
      return res.data;
    } catch (err) {
      console.error("Login error details:", err);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);
      console.error("Error config:", err.config);
      console.error("Full error object:", JSON.stringify(err, Object.getOwnPropertyNames(err)));
      
      setError(err.response?.data?.error || 'Login failed. Check your credentials.');
      throw err;
    }
  };

  // Logout user
  const logout = () => {
    setToken(null);
    setUser(null);
    setAuthToken(null);
  };

  // Check if user is authenticated on load
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          // Set auth token in headers
          setAuthToken(token);
          
          // Check if token is expired
          const decoded = jwtDecode(token);
          if (decoded.exp * 1000 < Date.now()) {
            setToken(null);
            setUser(null);
            setAuthToken(null);
            setLoading(false);
            return;
          }
          
          // Get user data
          const res = await axios.get('/api/auth/user');
          console.log("User data response:", res.data);
          
          // Handle different response formats
          if (res.data.user) {
            setUser(res.data.user);
          } else if (res.data && res.data.id) {
            // If the response is the user object directly
            setUser(res.data);
          } else {
            console.error("Unexpected user data format:", res.data);
            throw new Error('Invalid user data format');
          }
        } catch (err) {
          setToken(null);
          setUser(null);
          setAuthToken(null);
        }
      }
      setLoading(false);
    };
    
    loadUser();
  }, [token]);

  return (
    <AuthContext.Provider value={{
      token,
      user,
      loading,
      error,
      register,
      login,
      logout,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};