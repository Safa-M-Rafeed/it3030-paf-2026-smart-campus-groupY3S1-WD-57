import { useContext, useEffect, useMemo, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { deleteAuditTrailEntry, getAuditTrail } from '../api/reportApi';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const formatDateTime = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
};

export default function AuditTrailPage() {
  const { token } = useContext(AuthContext);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    actor: '',
    actionType: '',
    entity: '',
    fromDate: '',
    toDate: '',
  });

  const fetchEntries = async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError('');
      const res = await getAuditTrail(token, filters);
      setEntries(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load audit trail');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [token]);

  const actionTypes = useMemo(
    () => Array.from(new Set(entries.map((entry) => entry.actionType).filter(Boolean))),
    [entries]
  );
  const entities = useMemo(
    () => Array.from(new Set(entries.map((entry) => entry.entity).filter(Boolean))),
    [entries]
  );

  const onDelete = async (id) => {
    if (!window.confirm('Delete this audit entry?')) return;
    try {
      await deleteAuditTrailEntry(id, token);
      setEntries((prev) => prev.filter((entry) => entry.id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete audit entry');
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape' });

    // Header
    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42);
    doc.text('Audit Trail Report', 14, 18);

    // Active filters summary
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    const filterParts = [];
    if (filters.actor) filterParts.push(`Actor: ${filters.actor}`);
    if (filters.actionType) filterParts.push(`Action: ${filters.actionType}`);
    if (filters.entity) filterParts.push(`Entity: ${filters.entity}`);
    if (filters.fromDate) filterParts.push(`From: ${filters.fromDate}`);
    if (filters.toDate) filterParts.push(`To: ${filters.toDate}`);
    const filterText = filterParts.length ? filterParts.join('  |  ') : 'No filters applied';
    doc.text(filterText, 14, 26);
    doc.text(`Generated: ${new Date().toLocaleString()}  —  ${entries.length} record(s)`, 14, 32);

    autoTable(doc, {
      startY: 38,
      head: [['Actor', 'Action', 'Entity', 'Target', 'Change', 'Timestamp']],
      body: entries.map((e) => [
        e.actor || '-',
        e.actionType || '-',
        e.entity || '-',
        e.targetItem || '-',
        `${e.oldValue || '-'} → ${e.newValue || '-'}`,
        formatDateTime(e.createdAt),
      ]),
      headStyles: { fillColor: [15, 23, 42], textColor: 255, fontStyle: 'bold', fontSize: 9 },
      bodyStyles: { fontSize: 8, textColor: [30, 41, 59] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      styles: { cellPadding: 3, overflow: 'linebreak' },
      columnStyles: { 4: { cellWidth: 50 } },
    });

    const activeFilters = filterParts.length ? `_${filterParts.map(f => f.replace(/[^a-z0-9]/gi, '-')).join('_')}` : '';
    doc.save(`audit-trail${activeFilters}.pdf`);
  };

  return (
    <div className="mx-auto max-w-7xl p-8">
      <div className="rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-8 py-10 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-300">Module F</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">Audit Trail</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
            Review who changed what and when across ticketing and resource operations.
          </p>
        </div>

        <div className="space-y-5 px-8 py-8">
          <div className="grid gap-3 md:grid-cols-5">
            <input
              value={filters.actor}
              onChange={(e) => setFilters((prev) => ({ ...prev, actor: e.target.value }))}
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
              placeholder="Filter by actor"
            />
            <select
              value={filters.actionType}
              onChange={(e) => setFilters((prev) => ({ ...prev, actionType: e.target.value }))}
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">All actions</option>
              {actionTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <select
              value={filters.entity}
              onChange={(e) => setFilters((prev) => ({ ...prev, entity: e.target.value }))}
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">All entities</option>
              {entities.map((entity) => (
                <option key={entity} value={entity}>{entity}</option>
              ))}
            </select>
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
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
              onClick={fetchEntries}
            >
              Apply filters
            </button>
            <button
              type="button"
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
              onClick={() => {
                setFilters({ actor: '', actionType: '', entity: '', fromDate: '', toDate: '' });
                setTimeout(fetchEntries, 0);
              }}
            >
              Reset
            </button>
            <button
              type="button"
              disabled={loading || entries.length === 0}
              className="ml-auto flex items-center gap-2 rounded-xl bg-rose-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
              onClick={exportPDF}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="12" y1="18" x2="12" y2="12"/>
                <line x1="9" y1="15" x2="15" y2="15"/>
              </svg>
              Export PDF
            </button>
          </div>

          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              {error}
            </div>
          )}

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Actor</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Action</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Entity</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Target</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Change</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Timestamp</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {!loading && entries.length === 0 && (
                  <tr>
                    <td className="px-4 py-4 text-slate-500" colSpan={7}>No audit entries found.</td>
                  </tr>
                )}
                {loading && (
                  <tr>
                    <td className="px-4 py-4 text-slate-500" colSpan={7}>Loading audit entries...</td>
                  </tr>
                )}
                {!loading && entries.map((entry) => (
                  <tr key={entry.id}>
                    <td className="px-4 py-3 text-slate-700">{entry.actor}</td>
                    <td className="px-4 py-3 text-slate-700">{entry.actionType}</td>
                    <td className="px-4 py-3 text-slate-700">{entry.entity}</td>
                    <td className="px-4 py-3 text-slate-700">{entry.targetItem}</td>
                    <td className="px-4 py-3 text-slate-700">
                      {entry.oldValue || '-'} {'->'} {entry.newValue || '-'}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{formatDateTime(entry.createdAt)}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => onDelete(entry.id)}
                        className="rounded-lg border border-rose-300 px-3 py-1 text-xs font-medium text-rose-700"
                      >
                        Delete
                      </button>
                    </td>
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
