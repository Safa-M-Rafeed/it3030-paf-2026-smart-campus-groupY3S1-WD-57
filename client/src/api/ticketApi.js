import axios from 'axios';
const BASE = 'http://localhost:8080/api/tickets';
const authHeader = (token) => ({
headers: { Authorization: `Bearer ${token}` }
});
// Create ticket with file attachments
export const createTicket = (formData, token) =>
axios.post(BASE, formData, {
headers: {
Authorization: `Bearer ${token}`,
'Content-Type': 'multipart/form-data'
}
});
// Get tickets (own or all based on role)
export const getTickets = (token, status = '') =>
axios.get(`${BASE}${status ? '?status='+status : ''}`,
authHeader(token));
// Get single ticket
export const getTicket = (id, token) =>
axios.get(`${BASE}/${id}`, authHeader(token));
// Update ticket status
export const updateStatus = (id, status, note, token) =>
axios.put(
`${BASE}/${id}/status?status=${status}${note?'&resolutionNote='+encodeURIComponent(note):''}`,
{}, authHeader(token));
// Assign technician
export const assignTechnician = (id, techId, token) =>
axios.put(
`${BASE}/${id}/assign?technicianId=${techId}`,
{}, authHeader(token));
// Add comment
export const addComment = (id, content, token) =>
axios.post(
`${BASE}/${id}/comments?content=${encodeURIComponent(content)}`,
{}, authHeader(token));
// Delete comment
export const deleteComment = (ticketId, commentId, token) =>
axios.delete(
`${BASE}/${ticketId}/comments/${commentId}`,
authHeader(token));