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

// ─── Bookmark storage (per admin) ────────────────────────────────────────────
function bmKey(user) {
  return `sc_audit_bookmarks_${user?.id || user?.email || 'admin'}`;
}
function loadBookmarks(user) {
  try {
    return JSON.parse(localStorage.getItem(bmKey(user)) || '[]');
  } catch { return []; }
}
function saveBookmarks(user, bms) {
  localStorage.setItem(bmKey(user), JSON.stringify(bms));
}

// ─── Note Modal ───────────────────────────────────────────────────────────────
function NoteModal({ entry, existingNote, onSave, onClose }) {
  const [note, setNote] = useState(existingNote || '');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl">
        <h2 className="text-lg font-semibold text-slate-900 mb-1">Bookmark Note</h2>
        <p className="text-xs text-slate-500 mb-4">
          Add a personal note for this audit entry (e.g. "Suspicious deletion — investigate").
        </p>
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600 mb-4 space-y-1">
          <p><span className="font-semibold">Actor:</span> {entry.actor}</p>
          <p><span className="font-semibold">Action:</span> {entry.actionType} on {entry.entity}</p>
          <p><span className="font-semibold">Target:</span> {entry.targetItem || '—'}</p>
          <p><span className="font-semibold">Time:</span> {formatDateTime(entry.createdAt)}</p>
        </div>
        <textarea
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Write your note here…"
          className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
        />
        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={() => onSave(note.trim())}
            className="flex-1 rounded-xl bg-amber-500 py-2 text-sm font-medium text-white hover:bg-amber-600 transition"
          >
            Save Bookmark
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Bookmark icon button ─────────────────────────────────────────────────────
function BookmarkBtn({ bookmarked, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={bookmarked ? 'Bookmarked — click to edit note' : 'Bookmark this entry'}
      className={`rounded-lg px-2 py-1 transition ${
        bookmarked
          ? 'text-amber-500 hover:text-amber-600'
          : 'text-slate-300 hover:text-amber-400'
      }`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24"
        fill={bookmarked ? 'currentColor' : 'none'}
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
      </svg>
    </button>
  );
}

// ─── Bookmarked Logs Tab ──────────────────────────────────────────────────────
function BookmarkedTab({ bookmarks, onRemove, onEditNote }) {
  if (bookmarks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-3 opacity-30" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
        </svg>
        <p className="text-sm font-medium">No bookmarks yet</p>
        <p className="text-xs mt-1">Click the bookmark icon on any audit entry to save it here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {bookmarks.map((bm) => (
        <div key={bm.entry.id} className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 grid gap-1 text-xs text-slate-700">
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                <span><span className="font-semibold text-slate-500">Actor</span> {bm.entry.actor}</span>
                <span><span className="font-semibold text-slate-500">Action</span> {bm.entry.actionType}</span>
                <span><span className="font-semibold text-slate-500">Entity</span> {bm.entry.entity}</span>
                <span><span className="font-semibold text-slate-500">Target</span> {bm.entry.targetItem || '—'}</span>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-500">
                <span>
                  <span className="font-semibold">Change</span>{' '}
                  {bm.entry.oldValue || '-'} → {bm.entry.newValue || '-'}
                </span>
                <span><span className="font-semibold">Time</span> {formatDateTime(bm.entry.createdAt)}</span>
              </div>
              {bm.note && (
                <div className="mt-2 rounded-xl border border-amber-300 bg-white px-3 py-2 text-slate-700">
                  <span className="font-semibold text-amber-600">Note: </span>{bm.note}
                </div>
              )}
              <p className="text-[10px] text-slate-400 mt-1">Bookmarked {formatDateTime(bm.savedAt)}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                type="button"
                onClick={() => onEditNote(bm)}
                className="rounded-lg border border-amber-300 px-3 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100 transition"
              >
                Edit note
              </button>
              <button
                type="button"
                onClick={() => onRemove(bm.entry.id)}
                className="rounded-lg border border-rose-200 px-3 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 transition"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AuditTrailPage() {
  const { token, user } = useContext(AuthContext);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'bookmarked'
  const [filters, setFilters] = useState({
    actor: '', actionType: '', entity: '', fromDate: '', toDate: '',
  });

  // ── Bookmarks state ──────────────────────────────────────────────────────
  const [bookmarks, setBookmarks] = useState(() => loadBookmarks(user));
  const [noteModal, setNoteModal] = useState(null); // { entry, existingNote } | null

  // reload bookmarks when user changes
  useEffect(() => { setBookmarks(loadBookmarks(user)); }, [user]);
  // persist on every change
  useEffect(() => { saveBookmarks(user, bookmarks); }, [bookmarks, user]);

  const bookmarkedIds = useMemo(() => new Set(bookmarks.map((b) => b.entry.id)), [bookmarks]);

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

  useEffect(() => { fetchEntries(); }, [token]);

  const actionTypes = useMemo(
    () => Array.from(new Set(entries.map((e) => e.actionType).filter(Boolean))),
    [entries]
  );
  const entities = useMemo(
    () => Array.from(new Set(entries.map((e) => e.entity).filter(Boolean))),
    [entries]
  );

  const onDelete = async (id) => {
    if (!window.confirm('Delete this audit entry?')) return;
    try {
      await deleteAuditTrailEntry(id, token);
      setEntries((prev) => prev.filter((e) => e.id !== id));
      setBookmarks((prev) => prev.filter((b) => b.entry.id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete audit entry');
    }
  };

  // ── Bookmark handlers ────────────────────────────────────────────────────
  const openNoteModal = (entry) => {
    const existing = bookmarks.find((b) => b.entry.id === entry.id);
    setNoteModal({ entry, existingNote: existing?.note || '' });
  };

  const saveBookmark = (note) => {
    const { entry } = noteModal;
    setBookmarks((prev) => {
      const without = prev.filter((b) => b.entry.id !== entry.id);
      return [...without, { entry, note, savedAt: new Date().toISOString() }];
    });
    setNoteModal(null);
  };

  const removeBookmark = (id) => {
    setBookmarks((prev) => prev.filter((b) => b.entry.id !== id));
  };

  const editBookmarkNote = (bm) => {
    setNoteModal({ entry: bm.entry, existingNote: bm.note || '' });
  };

  // ── PDF export ───────────────────────────────────────────────────────────
  const exportPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42);
    doc.text('Audit Trail Report', 14, 18);
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
        e.actor || '-', e.actionType || '-', e.entity || '-', e.targetItem || '-',
        `${e.oldValue || '-'} → ${e.newValue || '-'}`, formatDateTime(e.createdAt),
      ]),
      headStyles: { fillColor: [15, 23, 42], textColor: 255, fontStyle: 'bold', fontSize: 9 },
      bodyStyles: { fontSize: 8, textColor: [30, 41, 59] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      styles: { cellPadding: 3, overflow: 'linebreak' },
      columnStyles: { 4: { cellWidth: 50 } },
    });
    const activeFilters = filterParts.length
      ? `_${filterParts.map((f) => f.replace(/[^a-z0-9]/gi, '-')).join('_')}`
      : '';
    doc.save(`audit-trail${activeFilters}.pdf`);
  };

  return (
    <div className="mx-auto max-w-7xl p-8">
      <div className="rounded-[2rem] border border-slate-200 bg-white shadow-sm">

        {/* ── Header ── */}
        <div className="border-b border-slate-200 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-8 py-10 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-300">Module F</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">Audit Trail</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
            Review who changed what and when across ticketing and resource operations.
          </p>
        </div>

        <div className="space-y-5 px-8 py-8">

          {/* ── Tabs ── */}
          <div className="flex gap-1 rounded-2xl border border-slate-200 bg-slate-100 p-1 w-fit">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`rounded-xl px-5 py-2 text-sm font-medium transition ${
                activeTab === 'all'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              All Logs
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('bookmarked')}
              className={`flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-medium transition ${
                activeTab === 'bookmarked'
                  ? 'bg-white text-amber-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24"
                fill={activeTab === 'bookmarked' ? 'currentColor' : 'none'}
                stroke="currentColor" strokeWidth="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
              </svg>
              Bookmarked Logs
              {bookmarks.length > 0 && (
                <span className="rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold text-white leading-none">
                  {bookmarks.length}
                </span>
              )}
            </button>
          </div>

          {/* ── All Logs Tab ── */}
          {activeTab === 'all' && (
            <>
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
                      <tr><td className="px-4 py-4 text-slate-500" colSpan={7}>No audit entries found.</td></tr>
                    )}
                    {loading && (
                      <tr><td className="px-4 py-4 text-slate-500" colSpan={7}>Loading audit entries...</td></tr>
                    )}
                    {!loading && entries.map((entry) => (
                      <tr key={entry.id} className={bookmarkedIds.has(entry.id) ? 'bg-amber-50/40' : ''}>
                        <td className="px-4 py-3 text-slate-700">{entry.actor}</td>
                        <td className="px-4 py-3 text-slate-700">{entry.actionType}</td>
                        <td className="px-4 py-3 text-slate-700">{entry.entity}</td>
                        <td className="px-4 py-3 text-slate-700">{entry.targetItem}</td>
                        <td className="px-4 py-3 text-slate-700">
                          {entry.oldValue || '-'} {'→'} {entry.newValue || '-'}
                        </td>
                        <td className="px-4 py-3 text-slate-700">{formatDateTime(entry.createdAt)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <BookmarkBtn
                              bookmarked={bookmarkedIds.has(entry.id)}
                              onClick={() => openNoteModal(entry)}
                            />
                            <button
                              type="button"
                              onClick={() => onDelete(entry.id)}
                              className="rounded-lg border border-rose-300 px-3 py-1 text-xs font-medium text-rose-700 hover:bg-rose-50 transition"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ── Bookmarked Tab ── */}
          {activeTab === 'bookmarked' && (
            <BookmarkedTab
              bookmarks={bookmarks}
              onRemove={removeBookmark}
              onEditNote={editBookmarkNote}
            />
          )}

        </div>
      </div>

      {/* ── Note Modal ── */}
      {noteModal && (
        <NoteModal
          entry={noteModal.entry}
          existingNote={noteModal.existingNote}
          onSave={saveBookmark}
          onClose={() => setNoteModal(null)}
        />
      )}
    </div>
  );
}
