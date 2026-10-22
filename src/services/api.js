// ============================================================
//  AgriRisk — Centralized API Client & Service Hub
//  Connects React frontend directly to FastAPI backend.
// ============================================================

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || '/api';

const AUTH_STORAGE_KEY = 'agririsk_auth';

export const getStoredToken = () => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.token || null;
  } catch {
    return null;
  }
};

export const clearStoredAuth = () => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
};

// In-memory cache & In-flight request deduplication maps
const memoryCache = new Map();
const inFlightRequests = new Map();

export const clearApiCache = (pattern) => {
  if (!pattern) {
    memoryCache.clear();
    return;
  }
  for (const key of memoryCache.keys()) {
    if (key.includes(pattern)) {
      memoryCache.delete(key);
    }
  }
};

/**
 * Universal request wrapper handling JWT Bearer injection,
 * JSON/FormData payload formatting, caching, request deduplication, and automated 401 handling.
 */
export const request = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const method = (options.method || 'GET').toUpperCase();
  const token = getStoredToken();

  // Invalidate cache on mutations
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    clearApiCache();
  }

  // Handle client-side caching for GET requests
  const cacheKey = `${method}:${url}`;
  const cacheTtlMs = options.cacheTtlMs ?? 60000; // 60 seconds default memory cache for fast retrieval
  const useCache = method === 'GET' && !options.skipCache && cacheTtlMs > 0;

  if (useCache && memoryCache.has(cacheKey)) {
    const entry = memoryCache.get(cacheKey);
    if (Date.now() - entry.timestamp < cacheTtlMs) {
      return entry.data;
    }
    memoryCache.delete(cacheKey);
  }

  // Deduplicate identical simultaneous GET in-flight requests
  if (useCache && inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey);
  }

  const headers = { ...options.headers };

  // Set Authorization header if JWT token exists
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // If body is NOT FormData, set default application/json content type
  if (options.body && !(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const defaultTimeout = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method) ? 15000 : 8000;
  const timeoutMs = options.timeout || defaultTimeout;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const fetchOptions = {
    ...options,
    headers,
    signal: options.signal || controller.signal,
  };

  const fetchPromise = (async () => {
    try {
      const response = await fetch(url, fetchOptions);
      clearTimeout(timeoutId);

      // Handle 401 Unauthorized session expiration
      if (response.status === 401) {
        if (getStoredToken()) {
          clearStoredAuth();
          clearApiCache();
          window.dispatchEvent(new CustomEvent('agririsk:unauthorized'));
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Your session has expired. Please log in again.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg =
          errorData.detail ||
          (Array.isArray(errorData) ? errorData[0]?.msg : null) ||
          `Request failed with status ${response.status}`;
        throw new Error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
      }

      const data = await response.json();

      if (useCache) {
        memoryCache.set(cacheKey, { timestamp: Date.now(), data });
      }

      return data;
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw new Error('AgriRisk server request timed out. Please check your connection.');
      }
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        throw new Error('Unable to connect to AgriRisk server. Please ensure the backend is running.');
      }
      throw err;
    } finally {
      if (useCache) {
        inFlightRequests.delete(cacheKey);
      }
    }
  })();

  if (useCache) {
    inFlightRequests.set(cacheKey, fetchPromise);
  }

  return fetchPromise;
};

export const api = {
  get: (endpoint, options = {}) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options = {}) =>
    request(endpoint, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  put: (endpoint, body, options = {}) =>
    request(endpoint, {
      ...options,
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  delete: (endpoint, options = {}) => request(endpoint, { ...options, method: 'DELETE' }),
};

// Re-export specialized domain APIs
export * from './authApi';
export * from './userApi';
export * from './riskApi';
export * from './diseaseApi';
export * from './regionApi';
export * from './dashboardApi';
export * from './insightsApi';
export * from './recommendationApi';
