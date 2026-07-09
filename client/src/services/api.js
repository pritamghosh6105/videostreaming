import axios from 'axios';

// Get API base URL from env or default to local dev server
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token from localStorage if exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle errors globally
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // If token is invalid/expired, log user out
    if (error.response && error.response.status === 401) {
      console.warn('Unauthorized request. Logging out user.');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Dispatch a custom event to notify components/Context to clean states
      window.dispatchEvent(new Event('auth-logout'));
    }
    
    // If banned
    if (error.response && error.response.status === 403 && error.response.data?.message?.includes('banned')) {
      console.error('User channel is banned.');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('auth-logout'));
    }

    return Promise.reject(error);
  }
);

export default api;
