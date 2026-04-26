import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';
const BASE = `${API_BASE}/api/reports/audit-trail`;

const authHeader = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

export const getAuditTrail = (token, filters = {}) =>
  axios.get(BASE, {
    ...authHeader(token),
    params: {
      actor: filters.actor || undefined,
      actionType: filters.actionType || undefined,
      entity: filters.entity || undefined,
      fromDate: filters.fromDate || undefined,
      toDate: filters.toDate || undefined,
    },
  });

export const deleteAuditTrailEntry = (id, token) =>
  axios.delete(`${BASE}/${id}`, authHeader(token));

export const getAnalyticsDashboard = (token, filters = {}) =>
  axios.get(`${API_BASE}/api/reports/analytics-dashboard`, {
    ...authHeader(token),
    params: {
      fromDate: filters.fromDate || undefined,
      toDate: filters.toDate || undefined,
    },
  });
