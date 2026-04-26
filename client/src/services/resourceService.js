import axios from 'axios';

const API_ORIGIN = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';
const API_BASE_URL = `${API_ORIGIN}/api/resources`;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const unwrap = (response) => response?.data?.data ?? response?.data;

export const resourceService = {
  getAll: async (filters = {}) => {
    const response = await apiClient.get('', { params: filters });
    return unwrap(response);
  },
  getById: async (id) => {
    const response = await apiClient.get(`/${id}`);
    return unwrap(response);
  },
  create: async (data) => {
    const response = await apiClient.post('', data);
    return unwrap(response);
  },
  update: async (id, data) => {
    const response = await apiClient.put(`/${id}`, data);
    return unwrap(response);
  },
  remove: async (id) => {
    const response = await apiClient.delete(`/${id}`);
    return unwrap(response);
  },
  updateStatus: async (id, status) => {
    const response = await apiClient.patch(`/${id}/status`, { status });
    return unwrap(response);
  },
};