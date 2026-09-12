import axios from 'axios';

const BACKEND_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? 'https://swiggy-backend-vwvl.onrender.com/api' : '/api');

const API = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('swiggy_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token on 401 unauth
      localStorage.removeItem('swiggy_token');
      localStorage.removeItem('swiggy_user');
    }
    return Promise.reject(error);
  }
);

export default API;
