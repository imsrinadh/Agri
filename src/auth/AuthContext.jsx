import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  loginUser as apiLoginUser,
  registerUser as apiRegisterUser,
  getCurrentUser as apiGetCurrentUser,
  logoutUser as apiLogoutUser,
  clearStoredAuth,
} from '../services/api';

const AuthContext = createContext(null);

const AUTH_STORAGE_KEY = 'agririsk_auth';

const getInitialAuthState = () => {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        user: parsed?.user || null,
        token: parsed?.token || null,
      };
    }
  } catch (err) {
    console.error('Failed to parse cached auth state:', err);
  }
  return { user: null, token: null };
};

export function AuthProvider({ children }) {
  const initial = getInitialAuthState();
  const [user, setUser] = useState(initial.user);
  const [token, setToken] = useState(initial.token);
  const [loading, setLoading] = useState(false);

  // Background token verification without blocking initial UI
  useEffect(() => {
    let isMounted = true;

    const verifyAuth = async () => {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!stored) return;

      try {
        const parsed = JSON.parse(stored);
        if (parsed?.token) {
          // Verify token with backend using a short timeout
          try {
            const verifiedUser = await apiGetCurrentUser({ timeout: 2500 });
            if (isMounted && verifiedUser) {
              setUser(verifiedUser);
            }
          } catch (err) {
            // Only clear auth on explicit 401 expiration, not on offline/timeout
            if (err.message && err.message.toLowerCase().includes('expired')) {
              clearStoredAuth();
              if (isMounted) {
                setUser(null);
                setToken(null);
              }
            }
          }
        }
      } catch (err) {
        console.error('Auth verification error:', err);
      }
    };

    verifyAuth();

    // Listen for global 401 unauthorized events
    const handleUnauthorized = () => {
      setUser(null);
      setToken(null);
    };
    window.addEventListener('agririsk:unauthorized', handleUnauthorized);
    return () => {
      isMounted = false;
      window.removeEventListener('agririsk:unauthorized', handleUnauthorized);
    };
  }, []);

  const login = async (credentials) => {
    const res = await apiLoginUser(credentials);
    if (res?.success && res?.token) {
      const authData = {
        token: res.token,
        user: res.user,
      };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
      setUser(authData.user);
      setToken(authData.token);
      return authData;
    }
    throw new Error('Authentication failed');
  };

  const signup = async (userData) => {
    return await apiRegisterUser(userData);
  };

  const logout = async () => {
    await apiLogoutUser().catch(() => {});
    clearStoredAuth();
    setUser(null);
    setToken(null);
  };

  const updateUserState = (updatedFields) => {
    setUser(prev => {
      const next = { ...prev, ...updatedFields };
      try {
        const stored = localStorage.getItem(AUTH_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ ...parsed, user: next }));
        }
      } catch {}
      return next;
    });
  };

  const value = {
    isAuthenticated: Boolean(token && user),
    user,
    token,
    loading,
    login,
    signup,
    logout,
    updateUserState,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
