import { useContext, useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from 'recharts';
import { AuthContext } from '../context/AuthContext';
import { getAnalyticsDashboard } from '../api/reportApi';

const PIE_COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AnalyticsDashboardPage() {
  const { token } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    fromDate: '',
    toDate: '',
  });

  const fetchData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError('');
      const res = await getAnalyticsDashboard(token, filters);
      setData(res.data?.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const summary = data?.summary || {
    totalBookingsThisWeek: 0,
    openTickets: 0,
    resolvedTickets: 0,
    resourceAvailabilityPercentage: 0,
  };

  const pieData = useMemo(() => data?.resourceTypeBreakdown || [], [data]);

  return (
    <div className="mx-auto max-w-7xl p-8 space-y-6">
      <div className="rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-gradient-to-r from-emerald-800 via-teal-700 to-cyan-700 px-8 py-10 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-100">Module F</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">Analytics Dashboard</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-emerald-50">
            Monitor bookings, incidents, and resource usage trends with date-range filtering.
          </p>
        </div>

        <div className="space-y-6 px-8 py-8">
          <div className="grid gap-3 sm:grid-cols-3">
            <input
              type="date"
              value={filters.fromDate}
              onChange={(e) => setFilters((prev) => ({ ...prev, fromDate: e.target.value }))}
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              type="date"
              value={filters.toDate}
              onChange={(e) => setFilters((prev) => ({ ...prev, toDate: e.target.value }))}
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
            />
            <button
              type="button"
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
              onClick={fetchData}
            >
              Apply date range
            </button>
          </div>

          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              {error}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-4">
            <Card label="Total bookings this week" value={summary.totalBookingsThisWeek} />
            <Card label="Open tickets" value={summary.openTickets} />
            <Card label="Resolved tickets" value={summary.resolvedTickets} />
            <Card label="Resource availability %" value={`${summary.resourceAvailabilityPercentage}%`} />
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <ChartCard title="Peak Booking Hours (Bar)">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data?.peakBookingHours || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" tick={{ fontSize: 11 }} interval={2} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#0f766e" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Incident Resolution Trend (Line)">
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={data?.incidentResolutionTrend || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="resolvedCount" stroke="#2563eb" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <ChartCard title="Resource Types Used Most (Pie)">
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie data={pieData} dataKey="count" nameKey="type" cx="50%" cy="50%" outerRadius={110} label>
                  {pieData.map((entry, index) => (
                    <Cell key={entry.type} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          {loading && <p className="text-sm text-slate-500">Loading analytics...</p>}
        </div>
      </div>
    </div>
  );
}

function Card({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="mb-3 text-sm font-semibold text-slate-800">{title}</p>
      {children}
    </div>
  );
}
