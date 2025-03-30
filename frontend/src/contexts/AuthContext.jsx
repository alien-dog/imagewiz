import { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

// Create context
export const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set up axios defaults - use relative URLs to ensure proxy works correctly
  axios.defaults.baseURL = '';  // Empty baseURL to use relative URLs

  // Debug our environment
  console.log("React environment:", import.meta.env);
  console.log("Current axios baseURL:", axios.defaults.baseURL);

  // Set token in axios headers and localStorage
  const setAuthToken = (token) => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      localStorage.setItem("token", token);
      console.log("Set auth token:", token.substring(0, 15) + "...");
    } else {
      delete axios.defaults.headers.common["Authorization"];
      localStorage.removeItem("token");
      console.log("Cleared auth token");
    }
  };

  // Register user
  const register = async (username, password) => {
    try {
      setError(null);
      console.log("Attempting registration for:", username);
      
      // Use relative URLs
      const registerUrl = "/api/auth/register";
      console.log("Making registration request to:", registerUrl);
      
      const res = await fetch(registerUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `HTTP error ${res.status}`);
      }
      
      const data = await res.json();
      console.log("Registration response:", data);

      setToken(data.access_token);
      setUser(data.user);
      setAuthToken(data.access_token);
      return data;
    } catch (err) {
      console.error("Registration error:", err);
      const errorMessage = err.message || "Registration failed";
      setError(errorMessage);
      throw err;
    }
  };

  // Login user with better error handling and debugging
  const login = async (username, password) => {
    try {
      setError(null);
      console.log("Login attempt for:", username);

      // Direct fetch approach
      // Add timestamp to prevent caching
      const timestamp = new Date().getTime();
      const loginUrl = `/api/auth/login?t=${timestamp}`;
      console.log("Making fetch request to:", loginUrl);
      const response = await fetch(loginUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }

      const data = await response.json();
      console.log("Login response:", data);

      if (!data.access_token) {
        throw new Error("Missing access_token in login response");
      }

      if (!data.user) {
        throw new Error("Missing user data in login response");
      }

      // Set auth state with response data
      setToken(data.access_token);
      setUser(data.user);
      setAuthToken(data.access_token);
      return data;
    } catch (err) {
      console.error("Login error:", err.message);
      setError(err.message || "Login failed. Check your credentials.");
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
          try {
            const decoded = jwtDecode(token);
            if (decoded.exp * 1000 < Date.now()) {
              console.log("Token expired, logging out");
              setToken(null);
              setUser(null);
              setAuthToken(null);
              setLoading(false);
              return;
            }
          } catch (jwtError) {
            console.error("JWT decode error:", jwtError);
            setToken(null);
            setUser(null);
            setAuthToken(null);
            setLoading(false);
            return;
          }

          // Get user data using fetch instead of axios
          // Add timestamp to prevent caching
          const userTimestamp = new Date().getTime();
          const userUrl = `/api/auth/user?t=${userTimestamp}`;
          console.log("Making user fetch request to:", userUrl);
          const response = await fetch(userUrl, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
          }

          const data = await response.json();
          console.log("User data response:", data);

          // Handle different response formats
          if (data.user) {
            setUser(data.user);
          } else if (data && data.id) {
            setUser(data);
          } else {
            throw new Error("Invalid user data format");
          }
        } catch (err) {
          console.error("Error loading user:", err);
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
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        error,
        register,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
