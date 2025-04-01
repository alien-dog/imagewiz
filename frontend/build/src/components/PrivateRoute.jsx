import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

// Component for protecting routes that require authentication
const PrivateRoute = ({ children }) => {
  const { currentUser, loading } = useAuth()
  
  // Show loading indicator while checking authentication
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }
  
  // Redirect to login page if not authenticated
  if (!currentUser) {
    return <Navigate to="/auth" replace />
  }
  
  // Render the protected component if authenticated
  return children
}

export default PrivateRoute