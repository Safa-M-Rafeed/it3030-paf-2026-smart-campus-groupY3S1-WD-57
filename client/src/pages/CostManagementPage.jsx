import { useContext, useState, useEffect, useMemo } from 'react';
import { AuthContext } from '../context/AuthContext';
import {
  getCostExpenses, createCostExpense, updateCostExpense,
  deleteCostExpense, getCostSummary,
} from '../api/reportApi';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORIES = ['MAINTENANCE','UTILITIES','STAFFING','EQUIPMENT','SOFTWARE','FACILITIES','EVENTS','OTHER'];
const CAT_LABELS  = { MAINTENANCE:'Maintenance', UTILITIES:'Utilities', STAFFING:'Staffing',
  EQUIPMENT:'Equipment', SOFTWARE:'Software', FACILITIES:'Facilities', EVENTS:'Events', OTHER:'Other' };
const REC_LABELS  = { DAILY:'Daily', MONTHLY:'Monthly' };

const fmtLKR = (n) =>
  new Intl.NumberFormat('si-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 2 }).format(n ?? 0);

const today = () => new Date().toISOString().slice(0, 10);

const EMPTY_FORM = {
  name: '', category: 'MAINTENANCE', amountLkr: '',
  recurrenceType: 'MONTHLY', startDate: today(), endDate: '', note: '',
};

// ─── Expense Modal ────────────────────────────────────────────────────────────
function ExpenseModal({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial ? {
    id: initial.id,           // ← carry id so PUT uses the right endpoint
    name: initial.name,
    category: initial.category,
    amountLkr: String(initial.amountLkr),
    recurrenceType: initial.recurrenceType,
    startDate: initial.startDate,
    endDate: initial.endDate || '',
    note: initial.note || '',
  } : EMPTY_FORM);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const valid = form.name.trim() && form.amountLkr && parseFloat(form.amountLkr) > 0 && form.startDate;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl">
        <h2 className="text-lg font-semibold text-slate-900 mb-5">
          {initial ? 'Edit Expense' : 'Add Expense'}
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Expense Name *</label>
            <input value={form.name} onChange={(e) => set('name', e.target.value)}
              placeholder="e.g. Monthly electricity bill"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Category *</label>
              <select value={form.category} onChange={(e) => set('category', e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400">
                {CATEGORIES.map((c) => <option key={c} value={c}>{CAT_LABELS[c]}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Amount (LKR) *</label>
              <input type="number" min="0.01" step="0.01" value={form.amountLkr}
                onChange={(e) => set('amountLkr', e.target.value)} placeholder="0.00"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Recurrence *</label>
            <div className="flex gap-2">
              {['DAILY','MONTHLY'].map((r) => (
                <button key={r} type="button"
                  onClick={() => set('recurrenceType', r)}
                  className={`flex-1 rounded-xl border py-2 text-sm font-medium transition ${
                    form.recurrenceType === r
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}>
                  {r === 'DAILY' ? '📅 Daily' : '📆 Monthly'}
                </button>
              ))}
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              {form.recurrenceType === 'DAILY'
                ? 'Cost is multiplied by the number of days in the selected range.'
                : 'Cost is multiplied by the number of months in the selected range.'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Start Date *</label>
              <input type="date" value={form.startDate} onChange={(e) => set('startDate', e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">End Date <span className="font-normal text-slate-400">— optional</span></label>
              <input type="date" value={form.endDate} onChange={(e) => set('endDate', e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Note <span className="font-normal text-slate-400">— optional</span></label>
            <textarea rows={2} value={form.note} onChange={(e) => set('note', e.target.value)}
              placeholder="Additional details…"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none" />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" disabled={!valid}
              onClick={() => onSave({ ...form, amountLkr: parseFloat(form.amountLkr), endDate: form.endDate || null })}
              className="flex-1 rounded-xl bg-emerald-700 py-2 text-sm font-medium text-white hover:bg-emerald-800 transition disabled:opacity-40">
              {initial ? 'Save Changes' : 'Add Expense'}
            </button>
            <button type="button" onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color = 'text-slate-900' }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className={`mt-2 text-xl font-bold ${color} break-all`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
    </div>
  );
}

// ─── Category bar ─────────────────────────────────────────────────────────────
function CategoryBar({ byCategory, byCategoryMonthly }) {
  // prefer monthly-normalised data; fall back to range data
  const source = (byCategoryMonthly && Object.keys(byCategoryMonthly).length)
    ? byCategoryMonthly
    : byCategory;
  const entries = Object.entries(source || {}).sort((a, b) => b[1] - a[1]);
  const grand   = entries.reduce((s, [, v]) => s + Number(v), 0);
  if (!entries.length) return null;
  const COLORS = ['#059669','#0891b2','#7c3aed','#d97706','#dc2626','#db2777','#65a30d','#64748b'];
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-slate-800">Spending by Category</p>
        <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
          Monthly amounts
        </span>
      </div>
      <div className="space-y-3">
        {entries.map(([cat, amt], i) => {
          const pct = grand > 0 ? (Number(amt) / grand) * 100 : 0;
          return (
            <div key={cat}>
              <div className="flex justify-between text-xs text-slate-600 mb-1">
                <span className="font-medium">{CAT_LABELS[cat] || cat}</span>
                <span>{fmtLKR(amt)}<span className="text-slate-400 ml-1">({pct.toFixed(1)}%)</span></span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }} />
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-[11px] text-slate-400">
        Daily expenses shown as monthly equivalent (× 30 days).
      </p>
    </div>
  );
}

// ─── Monthly breakdown chart (Recharts) ──────────────────────────────────────
function MonthlyChart({ byMonth }) {
  const data = useMemo(() =>
    Object.entries(byMonth || {})
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, amt]) => ({ month, amount: Number(amt) })),
    [byMonth]
  );

  if (!data.length) return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex items-center justify-center h-48 text-slate-400 text-sm">
      No monthly data — apply a date range to see breakdown.
    </div>
  );

  const fmtShort = (v) =>
    new Intl.NumberFormat('si-LK', { notation: 'compact', maximumFractionDigits: 1 }).format(v);

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-lg text-xs">
        <p className="font-semibold text-slate-700 mb-1">{label}</p>
        <p className="text-emerald-700 font-bold">{fmtLKR(payload[0].value)}</p>
      </div>
    );
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-slate-800 mb-4">Monthly Breakdown</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: 16, bottom: 24 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 10, fill: '#64748b' }}
            angle={-35}
            textAnchor="end"
            interval={0}
            height={48}
          />
          <YAxis
            tickFormatter={fmtShort}
            tick={{ fontSize: 10, fill: '#64748b' }}
            width={80}
            label={{
              value: 'Expenses (LKR)',
              angle: -90,
              position: 'insideLeft',
              offset: -4,
              style: { fontSize: 10, fill: '#94a3b8', textAnchor: 'middle' },
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="amount" radius={[6, 6, 0, 0]} maxBarSize={48}>
            {data.map((_, i) => (
              <Cell key={i} fill={i % 2 === 0 ? '#059669' : '#0d9488'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── PDF export ───────────────────────────────────────────────────────────────
function buildPDF({ summary, fromDate, toDate }) {
  const doc = new jsPDF();

  // header
  doc.setFillColor(5, 150, 105);
  doc.rect(0, 0, 210, 38, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8); doc.setFont('helvetica', 'normal');
  doc.text('MODULE F  —  SMART CAMPUS', 14, 12);
  doc.setFontSize(20); doc.setFont('helvetica', 'bold');
  doc.text('Cost Management Report', 14, 26);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 34);

  // range
  doc.setTextColor(100, 116, 139); doc.setFontSize(8);
  const range = (fromDate || toDate)
    ? `Period: ${fromDate || '—'}  to  ${toDate || '—'}`
    : 'All dates — no range filter applied';
  doc.text(range, 14, 44);

  // summary boxes
  doc.setTextColor(30, 41, 59); doc.setFontSize(10); doc.setFont('helvetica', 'bold');
  doc.text('Financial Summary', 14, 54);

  const boxes = [
    ['Range Total',    fmtLKR(summary.totalLkr),        [5, 150, 105]],
    ['Monthly Total',  fmtLKR(summary.monthlyTotalLkr),  [7, 89, 133]],
    ['Annual Total',   fmtLKR(summary.annualTotalLkr),   [109, 40, 217]],
  ];
  boxes.forEach(([label, val, rgb], i) => {
    const x = 14 + i * 62;
    doc.setFillColor(...rgb);
    doc.roundedRect(x, 57, 58, 22, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7); doc.setFont('helvetica', 'normal');
    doc.text(label, x + 4, 64);
    doc.setFontSize(9); doc.setFont('helvetica', 'bold');
    doc.text(val, x + 4, 73);
  });

  // category table
  doc.setTextColor(30, 41, 59); doc.setFontSize(10); doc.setFont('helvetica', 'bold');
  doc.text('Spending by Category', 14, 90);
  const catEntries = Object.entries(summary.byCategory || {}).sort((a, b) => b[1] - a[1]);
  const grandTotal = catEntries.reduce((s, [, v]) => s + Number(v), 0);
  autoTable(doc, {
    startY: 94,
    head: [['Category', 'Total (LKR)', '% of Total']],
    body: catEntries.map(([cat, amt]) => [
      CAT_LABELS[cat] || cat,
      fmtLKR(amt),
      grandTotal > 0 ? `${((Number(amt) / grandTotal) * 100).toFixed(1)}%` : '—',
    ]),
    headStyles: { fillColor: [5, 150, 105], textColor: 255, fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 8, textColor: [30, 41, 59] },
    alternateRowStyles: { fillColor: [240, 253, 244] },
    columnStyles: { 0: { cellWidth: 70 }, 1: { cellWidth: 60, halign: 'right' }, 2: { cellWidth: 40, halign: 'center' } },
    styles: { cellPadding: 3 },
  });

  // monthly breakdown table
  const monthEntries = Object.entries(summary.byMonth || {});
  if (monthEntries.length) {
    const y2 = doc.lastAutoTable.finalY + 10;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(30, 41, 59);
    doc.text('Monthly Breakdown', 14, y2);
    autoTable(doc, {
      startY: y2 + 4,
      head: [['Month', 'Total (LKR)']],
      body: monthEntries.map(([m, v]) => [m, fmtLKR(v)]),
      headStyles: { fillColor: [15, 23, 42], textColor: 255, fontStyle: 'bold', fontSize: 9 },
      bodyStyles: { fontSize: 8, textColor: [30, 41, 59] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: { 0: { cellWidth: 60 }, 1: { cellWidth: 60, halign: 'right' } },
      styles: { cellPadding: 3 },
    });
  }

  // expense detail table
  const y3 = doc.lastAutoTable.finalY + 10;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(30, 41, 59);
  doc.text('Expense Detail', 14, y3);
  autoTable(doc, {
    startY: y3 + 4,
    head: [['Name', 'Category', 'Recurrence', 'Unit Amount', 'Computed (LKR)', 'Note']],
    body: (summary.expenses || []).map((e) => [
      e.name,
      CAT_LABELS[e.category] || e.category,
      REC_LABELS[e.recurrenceType] || e.recurrenceType,
      fmtLKR(e.amountLkr),
      fmtLKR(e.computedLkr),
      e.note || '—',
    ]),
    headStyles: { fillColor: [15, 23, 42], textColor: 255, fontStyle: 'bold', fontSize: 8 },
    bodyStyles: { fontSize: 7, textColor: [30, 41, 59] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 38 }, 1: { cellWidth: 24 }, 2: { cellWidth: 22 },
      3: { cellWidth: 30, halign: 'right' }, 4: { cellWidth: 30, halign: 'right' }, 5: { cellWidth: 36 },
    },
    foot: [['', '', '', 'TOTAL', fmtLKR(summary.totalLkr), '']],
    footStyles: { fillColor: [5, 150, 105], textColor: 255, fontStyle: 'bold', fontSize: 8 },
    styles: { cellPadding: 3, overflow: 'linebreak' },
  });

  doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(148, 163, 184);
  doc.text('Smart Campus — Module F  |  Cost Management Report  |  Amounts in LKR', 14, 287);

  doc.save(`cost-report-${fromDate || 'all'}-${toDate || 'all'}.pdf`);
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CostManagementPage() {
  const { token } = useContext(AuthContext);

  const [expenses, setExpenses] = useState([]);
  const [summary,  setSummary]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [modal,    setModal]    = useState(null); // null | 'add' | expense-obj

  const [fromDate, setFromDate] = useState('');
  const [toDate,   setToDate]   = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [search,   setSearch]   = useState('');

  // keep a ref so async callbacks always read the latest date range
  const rangeRef = { from: fromDate, to: toDate };

  // ── fetch all + summary ────────────────────────────────────────────────────
  const fetchAll = async (from, to) => {
    if (!token) return;
    // fall back to whatever is currently in state if not explicitly passed
    const f = from !== undefined ? from : rangeRef.from;
    const t = to   !== undefined ? to   : rangeRef.to;
    try {
      setLoading(true); setError('');
      const [expRes, sumRes] = await Promise.all([
        getCostExpenses(token),
        getCostSummary(token, f || null, t || null),
      ]);
      setExpenses(expRes.data?.data || []);
      setSummary(sumRes.data?.data || null);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load cost data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(fromDate, toDate); }, [token]);

  // ── CRUD ───────────────────────────────────────────────────────────────────
  const handleSave = async (form) => {
    setError('');
    try {
      if (form.id) {
        await updateCostExpense(token, form.id, form);
      } else {
        await createCostExpense(token, form);
      }
      setModal(null);
      await fetchAll(fromDate, toDate);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to save expense');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    setError('');
    try {
      await deleteCostExpense(token, id);
      await fetchAll(fromDate, toDate);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to delete expense');
    }
  };

  const applyRange = () => fetchAll(fromDate, toDate);

  const resetFilters = () => {
    setFromDate(''); setToDate(''); setCatFilter(''); setSearch('');
    fetchAll('', '');
  };

  // ── client-side filter for table display ──────────────────────────────────
  const filtered = useMemo(() => {
    return expenses.filter((e) => {
      if (catFilter && e.category !== catFilter) return false;
      if (search && !e.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [expenses, catFilter, search]);

  return (
    <div className="mx-auto max-w-7xl p-8">
      <div className="rounded-[2rem] border border-slate-200 bg-white shadow-sm">

        {/* header */}
        <div className="border-b border-slate-200 bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-600 px-8 py-10 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-200">Module F</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">Cost Management</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-emerald-100">
            Assign campus expenses with daily or monthly recurrence in LKR. Filter by date range to calculate period costs and export a full PDF cost summary.
          </p>
        </div>

        <div className="space-y-6 px-8 py-8">

          {/* ── Filters bar ── */}
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500">From</label>
              <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)}
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500">To</label>
              <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)}
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm" />
            </div>
            <button type="button" onClick={applyRange}
              className="self-end rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition">
              Apply Range
            </button>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500">Category</label>
              <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)}
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm">
                <option value="">All categories</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{CAT_LABELS[c]}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500">Search</label>
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name…"
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm" />
            </div>
            <button type="button" onClick={resetFilters}
              className="self-end rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition">
              Reset
            </button>

            <div className="ml-auto flex gap-2 self-end">
              <button type="button" onClick={() => setModal('add')}
                className="flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Add Expense
              </button>
              <button type="button" disabled={!summary || loading}
                onClick={() => buildPDF({ summary, fromDate, toDate })}
                className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition disabled:opacity-40">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>
                </svg>
                Export PDF
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</div>
          )}

          {/* ── Stat cards ── */}
          {summary && (
            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard label="Range Total (LKR)" value={fmtLKR(summary.totalLkr)} color="text-emerald-700"
                sub={`${(summary.expenses || []).length} expense(s) in range`} />
              <StatCard label="Monthly Projection" value={fmtLKR(summary.monthlyTotalLkr)}
                sub="Based on all active expenses" />
              <StatCard label="Annual Projection" value={fmtLKR(summary.annualTotalLkr)}
                sub="Monthly × 12" color="text-violet-700" />
            </div>
          )}

          {/* ── Charts ── */}
          {summary && (
            <div className="grid gap-5 lg:grid-cols-2">
              <CategoryBar byCategory={summary.byCategory} byCategoryMonthly={summary.byCategoryMonthly} />
              <MonthlyChart byMonth={summary.byMonth} />
            </div>
          )}

          {/* ── Expense table ── */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Category</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Recurrence</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-700">Unit Amount</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Start</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">End</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Note</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {loading && (
                  <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-400">Loading…</td></tr>
                )}
                {!loading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-slate-400">
                      {expenses.length === 0
                        ? 'No expenses yet — click "Add Expense" to get started.'
                        : 'No expenses match the current filters.'}
                    </td>
                  </tr>
                )}
                {!loading && filtered.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3 font-medium text-slate-900">{e.name}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                        {CAT_LABELS[e.category] || e.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                        e.recurrenceType === 'DAILY'
                          ? 'bg-blue-50 border-blue-200 text-blue-700'
                          : 'bg-violet-50 border-violet-200 text-violet-700'
                      }`}>
                        {e.recurrenceType === 'DAILY' ? '📅 Daily' : '📆 Monthly'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-900">{fmtLKR(e.amountLkr)}</td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{e.startDate}</td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{e.endDate || '—'}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs max-w-[140px] truncate">{e.note || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button type="button" onClick={() => setModal(e)}
                          className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 transition">
                          Edit
                        </button>
                        <button type="button" onClick={() => handleDelete(e.id)}
                          className="rounded-lg border border-rose-200 px-3 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 transition">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-slate-400">
            All amounts are in Sri Lankan Rupees (LKR). Daily expenses are multiplied by the number of days in the selected range; monthly expenses by the number of months.
          </p>
        </div>
      </div>

      {modal && (
        <ExpenseModal
          initial={modal === 'add' ? null : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
