import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { exportMostActiveUsersCsv, getMostActiveUsersReport } from '../api/reportApi';

const formatDateTime = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
};

export default function MostActiveUsersReportPage() {
  const { token } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [report, setReport] = useState(null);
  const [filters, setFilters] = useState({
    rangeType: 'this_week',
    fromDate: '',
    toDate: '',
  });

  const fetchReport = async (currentFilters = filters) => {
    if (!token) return;
    try {
      setLoading(true);
      setError('');
      const res = await getMostActiveUsersReport(token, currentFilters);
      setReport(res.data?.data || null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load most active users report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [token]);

  const onExportCsv = async () => {
    try {
      const response = await exportMostActiveUsersCsv(token, filters);
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'most-active-users-report.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to export CSV');
    }
  };

  return (
    <div className="mx-auto max-w-7xl p-8">
      <div className="rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-gradient-to-r from-amber-700 via-orange-700 to-rose-700 px-8 py-10 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-100">Module F</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">Most Active Users Report</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-amber-50">
            Ranked user activity based on bookings made, tickets created, and comments posted.
          </p>
        </div>

        <div className="space-y-5 px-8 py-8">
          <div className="grid gap-3 md:grid-cols-5">
            <select
              value={filters.rangeType}
              onChange={(e) => setFilters((prev) => ({ ...prev, rangeType: e.target.value }))}
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="this_week">This week</option>
              <option value="this_month">This month</option>
              <option value="custom">Custom range</option>
            </select>
            <input
              type="date"
              value={filters.fromDate}
              disabled={filters.rangeType !== 'custom'}
              onChange={(e) => setFilters((prev) => ({ ...prev, fromDate: e.target.value }))}
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100"
            />
            <input
              type="date"
              value={filters.toDate}
              disabled={filters.rangeType !== 'custom'}
              onChange={(e) => setFilters((prev) => ({ ...prev, toDate: e.target.value }))}
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100"
            />
            <button
              type="button"
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
              onClick={() => fetchReport(filters)}
            >
              Apply filter
            </button>
            <button
              type="button"
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
              onClick={onExportCsv}
            >
              Export CSV
            </button>
          </div>

          {report && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              Showing <span className="font-semibold">{report.rangeType}</span> from{' '}
              <span className="font-semibold">{report.fromDate}</span> to{' '}
              <span className="font-semibold">{report.toDate}</span>.
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              {error}
            </div>
          )}

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Rank</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Email</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Bookings</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Tickets</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Comments</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Total Actions</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Last Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {loading && (
                  <tr>
                    <td className="px-4 py-4 text-slate-500" colSpan={8}>Loading most active users report...</td>
                  </tr>
                )}
                {!loading && (report?.users || []).length === 0 && (
                  <tr>
                    <td className="px-4 py-4 text-slate-500" colSpan={8}>No user activity found for selected range.</td>
                  </tr>
                )}
                {!loading && (report?.users || []).map((row, index) => (
                  <tr key={`${row.email}-${index}`}>
                    <td className="px-4 py-3 text-slate-700">{index + 1}</td>
                    <td className="px-4 py-3 text-slate-700">{row.name || '-'}</td>
                    <td className="px-4 py-3 text-slate-700">{row.email || '-'}</td>
                    <td className="px-4 py-3 text-slate-700">{row.bookingsMade}</td>
                    <td className="px-4 py-3 text-slate-700">{row.ticketsCreated}</td>
                    <td className="px-4 py-3 text-slate-700">{row.commentsPosted}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{row.totalActions}</td>
                    <td className="px-4 py-3 text-slate-700">{formatDateTime(row.lastActiveTime)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
