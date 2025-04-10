import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { Suspense, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

// Initialize i18n with helper functions
import './i18n/i18n';
import { isRTL } from './i18n/i18n';

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
  
  // Check for language in localStorage and URL on mount
  useEffect(() => {
    // Read localStorage directly to avoid cached values
    const storedLang = localStorage.getItem('i18nextLng');
    const urlParams = new URLSearchParams(window.location.search);
    const langParam = urlParams.get('lang');
    
    // URL parameter takes precedence over localStorage
    const targetLang = langParam || storedLang || 'en';
    
    console.log(`App initialization - storedLang: ${storedLang}, URL lang: ${langParam}, current i18n: ${i18n.language}`);
    
    // If we need to change language
    if (targetLang && targetLang !== i18n.language) {
      console.log(`Language mismatch detected, changing to: ${targetLang}`);
      
      // Update localStorage if needed
      if (targetLang !== storedLang) {
        localStorage.setItem('i18nextLng', targetLang);
      }
      
      // Apply language change
      i18n.changeLanguage(targetLang)
        .then(() => console.log(`Successfully changed language to ${targetLang}`))
        .catch(err => console.error(`Error changing language to ${targetLang}:`, err));
      
      // Clean up URL if it had a lang parameter
      if (langParam) {
        urlParams.delete('lang');
        const newUrl = window.location.pathname + (urlParams.toString() ? `?${urlParams.toString()}` : '');
        window.history.replaceState({}, '', newUrl);
      }
    }
  }, []);
  
  // Set document language and direction on language change
  useEffect(() => {
    // Set the document language attribute
    document.documentElement.lang = i18n.language;
    
    // Use the imported isRTL helper for consistent RTL detection
    const rtl = isRTL(i18n.language);
    
    // Set the document direction attribute
    document.documentElement.dir = rtl ? 'rtl' : 'ltr';
    
    // Add a global CSS class to the body for easier RTL/LTR styling
    if (rtl) {
      document.body.classList.add('rtl-layout');
      document.body.classList.remove('ltr-layout');
    } else {
      document.body.classList.add('ltr-layout');
      document.body.classList.remove('rtl-layout');
    }
    
    console.log(`App.jsx: Set language to ${i18n.language}, direction: ${rtl ? 'rtl' : 'ltr'}`);
    
    
    // Add a global stylesheet for RTL/LTR fixes
    let styleEl = document.getElementById('direction-style');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'direction-style';
      document.head.appendChild(styleEl);
    }
    
    // Add important override styles for CMS editors
    styleEl.textContent = `
      /* Global direction styles */
      html[dir="ltr"] .force-ltr {
        direction: ltr !important;
        text-align: left !important;
      }
      html[dir="rtl"] .force-rtl {
        direction: rtl !important;
        text-align: right !important;
      }
      /* Override for CMS editor containers */
      .ltr-text {
        direction: ltr !important;
        text-align: left !important;
        unicode-bidi: isolate !important;
      }
      .rtl-text {
        direction: rtl !important;
        text-align: right !important;
        unicode-bidi: isolate !important;
      }
      /* Isolate CMS editor from global direction */
      .editor-content[contenteditable="true"] {
        unicode-bidi: isolate;
      }
    `;
    
    // Log language changes for debugging
    console.log(`Language changed to: ${i18n.language}, direction: ${document.documentElement.dir}`);
  }, [i18n.language]);
  
  // Loading component for suspense fallback
  const Loader = () => (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
  
  return (
    <Router>
      {/* Use the language code as a key to force remount when language changes */}
      <div className="flex flex-col min-h-screen" key={i18n.language}>
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