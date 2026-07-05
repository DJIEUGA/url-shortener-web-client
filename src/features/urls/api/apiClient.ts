import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: useful for adding Auth tokens or logging
apiClient.interceptors.request.use(
  (config) => {
    // Example: const token = localStorage.getItem('token');
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorMessage = error.response?.data?.error || error.message;
    console.error(`[API Error]: ${errorMessage}`);
    return Promise.reject(error);
  }
);

export default apiClient;