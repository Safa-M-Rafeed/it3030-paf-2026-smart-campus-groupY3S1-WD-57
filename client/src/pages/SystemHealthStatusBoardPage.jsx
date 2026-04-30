import { useContext, useEffect, useMemo, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getSystemHealthStatusBoard } from '../api/reportApi';

const TRAFFIC_LIGHTS = {
  green: '🟢',
  yellow: '🟡',
  red: '🔴',
};

function toMetricStatus(metricKey, value) {
  switch (metricKey) {
    case 'totalUsersRegistered':
      if (value > 0) return 'green';
      return 'yellow';
    case 'totalResources':
      if (value >= 5) return 'green';
      if (value >= 1) return 'yellow';
      return 'red';
    case 'pendingBookingsWaitingApproval':
      if (value <= 10) return 'green';
      if (value <= 25) return 'yellow';
      return 'red';
    case 'unresolvedTicketsOlderThan3Days':
      if (value <= 5) return 'green';
      if (value <= 12) return 'yellow';
      return 'red';
    default:
      return 'yellow';
  }
}

export default function SystemHealthStatusBoardPage() {
  const { token } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    if (!token) return;
    try {
      setError('');
      setLoading(true);
      const res = await getSystemHealthStatusBoard(token);
      setData(res.data?.data || null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load system health board');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  useEffect(() => {
    if (!token) return undefined;
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [token]);

  const metrics = useMemo(() => {
    const users = data?.totalUsersRegistered ?? 0;
    const resources = data?.totalResources ?? 0;
    const pendingBookings = data?.pendingBookingsWaitingApproval ?? 0;
    const unresolvedOldTickets = data?.unresolvedTicketsOlderThan3Days ?? 0;
    return [
      {
        key: 'totalUsersRegistered',
        label: 'Total users registered',
        value: users,
      },
      {
        key: 'totalResources',
        label: 'Total resources in the system',
        value: resources,
      },
      {
        key: 'pendingBookingsWaitingApproval',
        label: 'Pending bookings waiting for approval',
        value: pendingBookings,
      },
      {
        key: 'unresolvedTicketsOlderThan3Days',
        label: 'Unresolved tickets older than 3 days',
        value: unresolvedOldTickets,
      },
    ];
  }, [data]);

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-8">
      <div className="rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 px-8 py-10 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-300">Module F</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">System Health Status Board</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-200">
            Live operational status for key platform metrics with a traffic-light health indicator. Data auto-refreshes every 60 seconds.
          </p>
        </div>

        <div className="space-y-6 px-8 py-8">
          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              {error}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => {
              const status = toMetricStatus(metric.key, metric.value);
              return (
                <div key={metric.key} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{metric.label}</p>
                  <div className="mt-3 flex items-center gap-3">
                    <span className="text-2xl">{TRAFFIC_LIGHTS[status]}</span>
                    <span className="text-2xl font-semibold text-slate-900">{metric.value}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="mb-3 text-sm font-semibold text-slate-800">Database record counts per table</p>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(data?.databaseRecordCountsPerTable || {}).map(([tableName, count]) => (
                <div key={tableName} className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{tableName}</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">{count}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-slate-500">
            <span>{loading ? 'Refreshing data...' : 'Live data is up to date'}</span>
            <button
              type="button"
              className="rounded-lg border border-slate-300 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50"
              onClick={fetchData}
            >
              Refresh now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
