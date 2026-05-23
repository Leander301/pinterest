import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
});

// Request interceptor: attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pinvault_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Response interceptor: handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('pinvault_token');
      localStorage.removeItem('pinvault_user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updatePassword: (data) => api.put('/auth/update-password', data),
};

// Pins
export const pinsAPI = {
  getAll: (params) => api.get('/pins', { params }),
  getById: (id) => api.get(`/pins/${id}`),
  create: (formData) => api.post('/pins', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.put(`/pins/${id}`, data),
  delete: (id) => api.delete(`/pins/${id}`),
  like: (id) => api.post(`/pins/${id}/like`),
  save: (id) => api.post(`/pins/${id}/save`),
  addComment: (id, data) => api.post(`/pins/${id}/comments`, data),
  deleteComment: (pinId, commentId) => api.delete(`/pins/${pinId}/comments/${commentId}`),
};

// Users
export const usersAPI = {
  getProfile: (username) => api.get(`/users/${username}`),
  updateProfile: (formData) => api.put('/users/profile/update', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  follow: (id) => api.post(`/users/${id}/follow`),
  getSavedPins: (id) => api.get(`/users/${id}/saved-pins`),
  search: (q) => api.get('/users/search/query', { params: { q } }),
};

// Categories
export const categoriesAPI = {
  getAll: () => api.get('/categories'),
};

export default api;
