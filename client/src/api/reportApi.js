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

export const getSystemHealthStatusBoard = (token) =>
  axios.get(`${API_BASE}/api/reports/system-health-status-board`, authHeader(token));

export const getMostActiveUsersReport = (token, params = {}) =>
  axios.get(`${API_BASE}/api/reports/report-export/most-active-users`, {
    ...authHeader(token),
    params: {
      rangeType: params.rangeType || 'this_week',
      fromDate: params.fromDate || undefined,
      toDate: params.toDate || undefined,
    },
  });

export const exportMostActiveUsersCsv = (token, params = {}) =>
  axios.get(`${API_BASE}/api/reports/report-export/most-active-users/csv`, {
    ...authHeader(token),
    params: {
      rangeType: params.rangeType || 'this_week',
      fromDate: params.fromDate || undefined,
      toDate: params.toDate || undefined,
    },
    responseType: 'blob',
  });

// ── Cost Expense API ──────────────────────────────────────────────────────────
const COST_BASE = `${API_BASE}/api/cost-expenses`;

export const getCostExpenses = (token) =>
  axios.get(COST_BASE, authHeader(token));

export const createCostExpense = (token, data) =>
  axios.post(COST_BASE, data, authHeader(token));

export const updateCostExpense = (token, id, data) =>
  axios.put(`${COST_BASE}/${id}`, data, authHeader(token));

export const deleteCostExpense = (token, id) =>
  axios.delete(`${COST_BASE}/${id}`, authHeader(token));

export const getCostSummary = (token, from, to) =>
  axios.get(`${COST_BASE}/summary`, {
    ...authHeader(token),
    params: { from: from || undefined, to: to || undefined },
  });
