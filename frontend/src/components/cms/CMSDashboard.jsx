import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FileText, 
  Tag, 
  Globe, 
  Plus, 
  Settings, 
  ChevronRight,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const CMSDashboard = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [error, setError] = useState(null);

  // Check if user is authenticated and is admin
  const isAdmin = isAuthenticated && user && user.is_admin;

  // Navigation items for the sidebar
  const navItems = [
    {
      label: 'Posts',
      icon: <FileText className="h-5 w-5" />,
      path: '/cms/posts'
    },
    {
      label: 'New Post',
      icon: <Plus className="h-5 w-5" />,
      path: '/cms/posts/new'
    },
    {
      label: 'Tags',
      icon: <Tag className="h-5 w-5" />,
      path: '/cms/tags'
    },
    {
      label: 'Languages',
      icon: <Globe className="h-5 w-5" />,
      path: '/cms/languages'
    },
    {
      label: 'Settings',
      icon: <Settings className="h-5 w-5" />,
      path: '/cms/settings'
    }
  ];

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
          <div className="flex items-center text-red-500 mb-4">
            <AlertTriangle className="h-8 w-8 mr-3" />
            <h2 className="text-xl font-semibold">Access Denied</h2>
          </div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            className="w-full bg-teal-500 hover:bg-teal-600 text-white py-2 px-4 rounded transition-colors"
            onClick={() => navigate('/login')}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
          <div className="flex items-center text-red-500 mb-4">
            <AlertTriangle className="h-8 w-8 mr-3" />
            <h2 className="text-xl font-semibold">Authentication Required</h2>
          </div>
          <p className="text-gray-600 mb-4">You must be logged in to access the CMS dashboard.</p>
          <button
            className="w-full bg-teal-500 hover:bg-teal-600 text-white py-2 px-4 rounded transition-colors"
            onClick={() => navigate('/login')}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }
  
  if (isAuthenticated && !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
          <div className="flex items-center text-red-500 mb-4">
            <AlertTriangle className="h-8 w-8 mr-3" />
            <h2 className="text-xl font-semibold">Admin Access Required</h2>
          </div>
          <p className="text-gray-600 mb-4">You must have administrator privileges to access the CMS dashboard.</p>
          <div className="text-sm text-gray-500 mb-4">
            <p>User: {user?.username}</p>
            <p>Admin Status: {String(user?.is_admin)}</p>
          </div>
          <button
            className="w-full bg-teal-500 hover:bg-teal-600 text-white py-2 px-4 rounded transition-colors"
            onClick={() => navigate('/')}
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* CMS Header */}
      <header className="bg-teal-600 text-white py-4 px-6 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">iMagenWiz CMS</h1>
          <div className="flex items-center space-x-4">
            <span>Welcome, {user?.username}</span>
            <button 
              className="bg-teal-700 hover:bg-teal-800 py-1 px-3 rounded text-sm transition-colors"
              onClick={() => navigate('/dashboard')}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 container mx-auto px-4 py-6">
        {/* Sidebar */}
        <aside className="w-64 bg-white rounded-lg shadow-md h-fit p-4 mr-6">
          <nav>
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.path}>
                  <button
                    className={`flex items-center w-full text-left py-2 px-3 rounded transition-colors ${
                      location.pathname === item.path
                        ? 'bg-teal-100 text-teal-700'
                        : 'hover:bg-gray-100'
                    }`}
                    onClick={() => navigate(item.path)}
                  >
                    <span className="mr-3">{item.icon}</span>
                    <span>{item.label}</span>
                    <ChevronRight className="h-4 w-4 ml-auto" />
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Content Area */}
        <main className="flex-1 bg-white rounded-lg shadow-md p-6">
          {children}
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-gray-100 py-4 px-6 border-t">
        <div className="container mx-auto text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} iMagenWiz CMS. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default CMSDashboard;