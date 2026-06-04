import axios from 'axios';

// Automatically switches between localhost for dev, and your real URL for production
const API_URL = import.meta.env.VITE_API_URL;

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// REQUEST INTERCEPTOR: Automatically attach the JWT token to every request
api.interceptors.request.use(
  (config) => {
    // Assuming you store your token in localStorage upon login
    const token = localStorage.getItem('cubora_token'); 
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// RESPONSE INTERCEPTOR: Catch global backend errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If your auth.js middleware throws a 401 (Unauthorized)
    if (error.response && error.response.status === 401) {
      console.warn('Session expired or invalid token. Redirecting to login...');
      // Force clear the token and kick the user back to the login screen safely
      localStorage.removeItem('cubora_token');
      window.location.href = '/login'; 
    }
    
    // Extract the exact error message sent from Express
    const message = error.response?.data?.error || 'An unexpected server error occurred.';
    return Promise.reject(new Error(message));
  }
);