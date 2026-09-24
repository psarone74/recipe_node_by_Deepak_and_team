import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('recipemaster_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor to handle 401 unauthenticated
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      // Don't auto-redirect on optional checks, only remove expired token if strictly invalid
      const msg = error.response?.data?.message || '';
      if (msg.includes('expired') || msg.includes('Invalid token')) {
        localStorage.removeItem('recipemaster_token');
        localStorage.removeItem('recipemaster_user');
      }
    }
    return Promise.reject(error);
  }
);
