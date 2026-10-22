import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';
import AppLayout from '../layouts/AppLayout';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--warm-cream)',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              border: '3px solid var(--pale-green)',
              borderTop: '3px solid var(--forest-green)',
              margin: '0 auto 16px',
              animation: 'spin 1s linear infinite',
            }}
          />
          <p style={{ color: 'var(--text-medium)', fontFamily: 'Manrope, sans-serif' }}>
            Verifying agricultural security credentials...
          </p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          message: 'Please log in to access the AgriRisk platform.',
          from: location,
        }}
      />
    );
  }

  // Render child or Outlet wrapped in the authenticated layout
  return (
    <AppLayout>
      {children ? children : <Outlet />}
    </AppLayout>
  );
}
