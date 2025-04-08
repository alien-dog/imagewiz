import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { Suspense, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

// Initialize i18n
import './i18n/i18n';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardPage from './pages/DashboardPage';
import HistoryPage from './pages/HistoryPage';
import HistoryDetailPage from './pages/HistoryDetailPage';
import Pricing from './pages/Pricing';
import PricingNew from './pages/PricingNew';
import CheckoutPage from './pages/CheckoutPage';
// Use PaymentVerifyPage as the primary page for payment verification
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import PaymentVerifyPage from './pages/PaymentVerifyPage';
import PaymentHistoryPage from './pages/PaymentHistoryPage';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

// CMS and Blog Pages
import CMSDashboardPage from './pages/cms/CMSDashboardPage';
import BlogHomePage from './pages/blog/BlogHomePage';
import BlogPostPage from './pages/blog/BlogPostPage';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
};

// Main App component
const AppContent = () => {
  const { i18n } = useTranslation();
  
  // Set document language and direction on language change
  useEffect(() => {
    document.documentElement.lang = i18n.language;
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
  }, [i18n.language]);
  
  // Loading component for suspense fallback
  const Loader = () => (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
  
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Suspense fallback={<Loader />}>
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/pricing" element={<PricingNew />} />
              <Route path="/pricing-old" element={<Pricing />} />
              <Route
                path="/checkout"
                element={
                  <ProtectedRoute>
                    <CheckoutPage />
                  </ProtectedRoute>
                }
              />
              {/* Payment verification page is accessible without authentication 
                  to handle redirects from Stripe after checkout */}
              <Route path="/payment-verify" element={<PaymentVerifyPage />} />
              
              {/* Legacy route for backward compatibility - redirects to the new path */}
              <Route path="/order-confirmation" element={<Navigate to="/payment-verify" replace state={{ fromLegacyRoute: true }} />} />
              
              {/* Protected routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/history"
                element={
                  <ProtectedRoute>
                    <HistoryPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/history/:id"
                element={
                  <ProtectedRoute>
                    <HistoryDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/payment-history"
                element={
                  <ProtectedRoute>
                    <PaymentHistoryPage />
                  </ProtectedRoute>
                }
              />
              
              {/* CMS routes */}
              <Route path="/cms/*" element={
                <ProtectedRoute>
                  <CMSDashboardPage />
                </ProtectedRoute>
              } />
              
              {/* Blog routes */}
              <Route path="/blog" element={<BlogHomePage />} />
              <Route path="/blog/:slug" element={<BlogPostPage />} />
              <Route path="/blog/tag/:tag" element={<BlogHomePage />} />
              
              {/* 404 route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </Suspense>
      </div>
    </Router>
  );
};

// Wrap the app with auth provider
const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;