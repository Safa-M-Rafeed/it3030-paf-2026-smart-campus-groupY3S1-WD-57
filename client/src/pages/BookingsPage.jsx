import React, { useContext, useEffect, useMemo, useState } from 'react';
import { CalendarDays, Clock3, Users } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { bookingService } from '../services/bookingService';

const statuses = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'];

const styles = `
  .bk-wrap { min-height: calc(100vh - 72px); background: #f5f0e8; padding: 28px; font-family: 'DM Sans', sans-serif; color: #1f1a17; }
  .bk-hero { border: 1px solid #e2d8c8; background: #141414; color: #f5f0e8; padding: 22px; border-radius: 18px; margin-bottom: 18px; }
  .bk-title { font-family: 'Playfair Display', serif; font-size: 34px; margin: 0; }
  .bk-sub { margin-top: 8px; color: #d7cdbf; font-size: 14px; }
  .bk-grid { display: grid; gap: 18px; grid-template-columns: 1.1fr 1fr; }
  .bk-card { background: #fffaf3; border: 1px solid #e2d8c8; border-radius: 16px; padding: 18px; }
  .bk-label { font-size: 11px; letter-spacing: 1.2px; text-transform: uppercase; color: #8b6340; margin-bottom: 6px; font-weight: 700; }
  .bk-input, .bk-select, .bk-textarea { width: 100%; border: 1px solid #d9ccb8; background: #fff; color: #2b241f; border-radius: 10px; padding: 10px 12px; }
  .bk-row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .bk-textarea { min-height: 74px; resize: vertical; }
  .bk-btn { border: none; border-radius: 10px; padding: 11px 14px; font-weight: 700; cursor: pointer; }
  .bk-btn-dark { background: #141414; color: #f5f0e8; }
  .bk-btn-lite { background: #f0e7da; color: #3f3025; }
  .bk-list { display: grid; gap: 10px; max-height: 65vh; overflow: auto; }
  .bk-item { border: 1px solid #e2d8c8; border-radius: 12px; background: #fff; padding: 12px; }
  .bk-top { display: flex; justify-content: space-between; gap: 12px; align-items: center; }
  .bk-badge { padding: 4px 8px; border-radius: 99px; font-size: 11px; font-weight: 700; }
  .s-PENDING { background: #fff4db; color: #8c6300; }
  .s-APPROVED { background: #dcfce7; color: #166534; }
  .s-REJECTED { background: #fee2e2; color: #991b1b; }
  .s-CANCELLED { background: #e2e8f0; color: #334155; }
  .bk-meta { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 8px; font-size: 12px; color: #5d4f43; }
  .bk-actions { display: flex; gap: 8px; margin-top: 10px; }
  .bk-error { margin-top: 10px; color: #991b1b; font-size: 13px; }
  .bk-ok { margin-top: 10px; color: #166534; font-size: 13px; }
  @media (max-width: 1024px) { .bk-grid { grid-template-columns: 1fr; } }
`;

export default function BookingsPage() {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'ADMIN';
  const [items, setItems] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [facilityFilter, setFacilityFilter] = useState('');
  const [form, setForm] = useState({
    facilityId: '',
    date: '',
    startTime: '',
    endTime: '',
    purpose: '',
    attendees: '',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadBookings = async () => {
    setBusy(true);
    setError('');
    try {
      const filters = isAdmin ? { status: statusFilter || undefined, facilityId: facilityFilter || undefined } : {};
      const data = isAdmin ? await bookingService.getAllBookings(filters) : await bookingService.getMyBookings();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load bookings');
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => { loadBookings(); }, [isAdmin]);

  const onInput = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const onCreate = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await bookingService.create({
        facilityId: Number(form.facilityId),
        date: form.date,
        startTime: form.startTime,
        endTime: form.endTime,
        purpose: form.purpose,
        attendees: Number(form.attendees),
      });
      setMessage('Booking request submitted as PENDING.');
      setForm({ facilityId: '', date: '', startTime: '', endTime: '', purpose: '', attendees: '' });
      await loadBookings();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not submit booking request');
    }
  };

  const withAction = async (action) => {
    setError('');
    setMessage('');
    try {
      await action();
      await loadBookings();
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed');
    }
  };

  const sortedItems = useMemo(() => [...items].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)), [items]);

  return (
    <div className="bk-wrap">
      <style>{styles}</style>
      <div className="bk-hero">
        <h1 className="bk-title">Booking Management</h1>
        <p className="bk-sub">Workflow: PENDING → APPROVED/REJECTED, then APPROVED can be CANCELLED.</p>
      </div>

      <div className="bk-grid">
        <div className="bk-card">
          <div className="bk-label">Request a booking</div>
          <form onSubmit={onCreate}>
            <div className="bk-row2">
              <input className="bk-input" name="facilityId" type="number" min="1" placeholder="Facility ID" value={form.facilityId} onChange={onInput} required />
              <input className="bk-input" name="attendees" type="number" min="1" placeholder="Expected attendees" value={form.attendees} onChange={onInput} required />
            </div>
            <div className="bk-row2" style={{ marginTop: 10 }}>
              <input className="bk-input" name="date" type="date" value={form.date} onChange={onInput} required />
              <input className="bk-input" name="startTime" type="time" value={form.startTime} onChange={onInput} required />
            </div>
            <div className="bk-row2" style={{ marginTop: 10 }}>
              <input className="bk-input" name="endTime" type="time" value={form.endTime} onChange={onInput} required />
              <div />
            </div>
            <textarea className="bk-textarea" name="purpose" placeholder="Purpose" value={form.purpose} onChange={onInput} required style={{ marginTop: 10 }} />
            <button className="bk-btn bk-btn-dark" type="submit" style={{ marginTop: 10 }}>Submit Request</button>
          </form>
          {message ? <div className="bk-ok">{message}</div> : null}
          {error ? <div className="bk-error">{error}</div> : null}
        </div>

        <div className="bk-card">
          <div className="bk-top">
            <div className="bk-label">{isAdmin ? 'All bookings' : 'My bookings'}</div>
            <button className="bk-btn bk-btn-lite" type="button" onClick={loadBookings} disabled={busy}>{busy ? 'Loading...' : 'Refresh'}</button>
          </div>
          {isAdmin && (
            <div className="bk-row2" style={{ margin: '8px 0 12px' }}>
              <select className="bk-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">All statuses</option>
                {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <input className="bk-input" type="number" min="1" placeholder="Filter by facility ID" value={facilityFilter} onChange={(e) => setFacilityFilter(e.target.value)} />
            </div>
          )}
          <div className="bk-list">
            {sortedItems.map((item) => (
              <div className="bk-item" key={item.id}>
                <div className="bk-top">
                  <strong>Booking #{item.id} - Facility {item.facilityId}</strong>
                  <span className={`bk-badge s-${item.status}`}>{item.status}</span>
                </div>
                <div className="bk-meta">
                  <span><CalendarDays size={14} style={{ marginRight: 4 }} />{item.date}</span>
                  <span><Clock3 size={14} style={{ marginRight: 4 }} />{item.startTime} - {item.endTime}</span>
                  <span><Users size={14} style={{ marginRight: 4 }} />{item.attendees}</span>
                </div>
                <div className="bk-meta">Purpose: {item.purpose}</div>
                {item.adminNote ? <div className="bk-meta">Admin note: {item.adminNote}</div> : null}
                <div className="bk-actions">
                  {isAdmin && item.status === 'PENDING' && (
                    <>
                      <button className="bk-btn bk-btn-dark" type="button" onClick={() => withAction(() => bookingService.approve(item.id))}>Approve</button>
                      <button
                        className="bk-btn bk-btn-lite"
                        type="button"
                        onClick={() => {
                          const reason = window.prompt('Reason for rejection:');
                          if (reason?.trim()) withAction(() => bookingService.reject(item.id, reason.trim()));
                        }}
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {item.status === 'APPROVED' && (
                    <button className="bk-btn bk-btn-lite" type="button" onClick={() => withAction(() => bookingService.cancel(item.id))}>
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
            {!busy && sortedItems.length === 0 ? <div className="bk-meta">No bookings found.</div> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
