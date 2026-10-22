import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';

// Authentication Layer
import { AuthProvider } from './auth/AuthContext';
import ProtectedRoute from './auth/ProtectedRoute';

// Public Pages (Lazy Loaded for Fast Initial Bundle)
const Home            = lazy(() => import('./pages/Home'));
const About           = lazy(() => import('./pages/About'));
const Login           = lazy(() => import('./pages/Login'));
const SignUp          = lazy(() => import('./pages/SignUp'));
const ForgotPassword  = lazy(() => import('./pages/ForgotPassword'));

// Protected Platform Modules (Lazy Loaded)
const Dashboard       = lazy(() => import('./pages/Dashboard'));
const RiskAnalysis    = lazy(() => import('./pages/RiskAnalysis'));
const DiseaseDetection = lazy(() => import('./pages/DiseaseDetection'));
const Regions         = lazy(() => import('./pages/Regions'));
const Insights        = lazy(() => import('./pages/Insights'));
const Recommendations = lazy(() => import('./pages/Recommendations'));
const FarmerProtection = lazy(() => import('./pages/FarmerProtection'));
const Profile         = lazy(() => import('./pages/Profile'));
const Settings        = lazy(() => import('./pages/Settings'));

// Sleek fast page loading fallback
function PageLoader() {
  return (
    <div style={{
      minHeight: '60vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'transparent'
    }}>
      <div style={{
        width: 38,
        height: 38,
        borderRadius: '50%',
        border: '3px solid #D4E9B8',
        borderTop: '3px solid #2D5016',
        animation: 'spin 0.7s linear infinite'
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
    </div>
  );
}

// Scroll to top on navigation
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

// Ultra-fast route prefetcher during browser idle time
function RoutePrefetcher() {
  useEffect(() => {
    const prefetchRoutes = () => {
      // Warm up most frequented platform modules
      import('./pages/Dashboard');
      import('./pages/RiskAnalysis');
      import('./pages/DiseaseDetection');
      import('./pages/FarmerProtection');
    };

    if ('requestIdleCallback' in window) {
      const handle = window.requestIdleCallback(prefetchRoutes, { timeout: 2000 });
      return () => window.cancelIdleCallback(handle);
    } else {
      const timer = setTimeout(prefetchRoutes, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <RoutePrefetcher />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* ================= PUBLIC WEBSITE ================= */}
            <Route path="/"                element={<Home />} />
            <Route path="/about"           element={<About />} />
            <Route path="/login"           element={<Login />} />
            <Route path="/signup"          element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* ================= AUTHENTICATED PLATFORM (PROTECTED) ================= */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard"         element={<Dashboard />} />
              <Route path="/risk-analysis"     element={<RiskAnalysis />} />
              <Route path="/disease-detection" element={<DiseaseDetection />} />
              <Route path="/farmer-protection" element={<FarmerProtection />} />
              <Route path="/regions"           element={<Regions />} />
              <Route path="/insights"          element={<Insights />} />
              <Route path="/recommendations"   element={<Recommendations />} />
              <Route path="/profile"           element={<Profile />} />
              <Route path="/settings"          element={<Settings />} />
            </Route>

            {/* Catch-all → Home */}
            <Route path="*" element={<Home />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}
