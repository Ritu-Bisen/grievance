import axios from 'axios';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: 'https://stnjr6z8-5000.euw.devtunnels.ms',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export default apiClient;
