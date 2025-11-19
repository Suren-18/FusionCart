import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

console.log('🔗 API URL configured:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('📤 API Request:', config.method.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log('📥 API Response:', response.config.url, '✓');
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else if (error.code === 'ECONNABORTED') {
      console.error('Request timeout - server took too long to respond');
    } else if (error.request) {
      console.error('No response - is the backend server running?');
    }
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
};

// Product API
export const productAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  search: (query) => api.get(`/products/search?q=${query}`),
  searchSuggestions: (query) => api.get(`/products/suggestions?q=${query}`),
  create: (productData) => api.post('/products', productData),
  update: (id, productData) => api.put(`/products/${id}`, productData),
  delete: (id) => api.delete(`/products/${id}`),
};

// Review API
export const reviewAPI = {
  getByProduct: (productId) => api.get(`/reviews/product/${productId}`),
  create: (reviewData) => api.post('/reviews', reviewData),
  update: (id, reviewData) => api.put(`/reviews/${id}`, reviewData),
  delete: (id) => api.delete(`/reviews/${id}`),
  upvote: (id) => api.post(`/reviews/${id}/upvote`),
  downvote: (id) => api.post(`/reviews/${id}/downvote`),
};

// Order API
export const orderAPI = {
  create: (orderData) => api.post('/orders', orderData),
  getMyOrders: () => api.get('/orders/my-orders'),
  getById: (id) => api.get(`/orders/${id}`),
  addToCart: (productId, quantity) => api.post('/orders/cart', { productId, quantity }),
};

// Admin API
export const adminAPI = {
  getAllUsers: () => api.get('/admin/users'),
  getAllOrders: () => api.get('/admin/orders'),
  updateOrderStatus: (id, status) => api.put(`/admin/orders/${id}/status`, { status }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getStats: () => api.get('/admin/stats'),
};

export default api;