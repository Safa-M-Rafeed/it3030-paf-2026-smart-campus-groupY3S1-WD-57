import axios from "axios";

const API = "http://localhost:8081/api/bookings";

export const createBooking = (data: any) => {
  return axios.post(API, data);
};

export const getMyBookings = (userId: number) => {
  return axios.get(`${API}/my?userId=${userId}`);
};

export const getAllBookings = () => {
  return axios.get(API);
};

export const approveBooking = (id: number) => {
  return axios.put(`${API}/${id}/approve`);
};

export const rejectBooking = (id: number, reason: string) => {
  return axios.put(`${API}/${id}/reject`, { reason });
};

export const cancelBooking = (id: number) => {
  return axios.put(`${API}/${id}/cancel`);
};