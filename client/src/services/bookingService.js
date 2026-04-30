import axios from 'axios';

const API_ORIGIN = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';
const API_BASE_URL = `${API_ORIGIN}/api/bookings`;

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

export const bookingService = {
  create: async (payload) => unwrap(await apiClient.post('', payload)),
  getMyBookings: async () => unwrap(await apiClient.get('/my')),
  getAllBookings: async (filters = {}) => unwrap(await apiClient.get('', { params: filters })),
  approve: async (bookingId) => unwrap(await apiClient.put(`/${bookingId}/approve`)),
  reject: async (bookingId, reason) => unwrap(await apiClient.put(`/${bookingId}/reject`, { reason })),
  cancel: async (bookingId) => unwrap(await apiClient.put(`/${bookingId}/cancel`)),
};
