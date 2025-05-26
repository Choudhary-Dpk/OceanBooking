import axios from 'axios';

// Create axios instance with custom config
const axiosInstance = axios.create({
  baseURL: import.meta.env.DEV ? 'http://localhost:5000' : '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export default axiosInstance; 