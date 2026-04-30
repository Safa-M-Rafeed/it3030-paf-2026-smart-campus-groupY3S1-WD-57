import { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ─── Default goals ────────────────────────────────────────────────────────────
const DEFAULT_GOALS = [
  {
    id: 'ticket-resolution',
    label: 'Ticket Resolution within 48 h',
    description: 'Percentage of tickets resolved within 48 hours of creation.',
    target: 90,
    unit: '%',
    icon: '🎫',
    accentFrom: 'from-indigo-600',
    accentTo: 'to-violet-600',
  },
  {
    id: 'resource-utilization',
    label: 'Resource Utilization',
    description: 'Average utilization rate across all campus resources.',
    target: 70,
    unit: '%',
    icon: '🏛️',
    accentFrom: 'from-teal-600',
    accentTo: 'to-cyan-500',
  },
  {
    id: 'approval-rate',
    label: 'Approval Rate',
    description: 'Percentage of resource / booking requests that are approved.',
    target: 80,
    unit: '%',
    icon: '✅',
    accentFrom: 'from-amber-500',
    accentTo: 'to-orange-500',
  },
];

const STORAGE_KEY = 'sc_goals_v1';

function loadGoals() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_GOALS;
    const saved = JSON.parse(raw);
    // merge saved targets + actuals into defaults (keeps new fields safe)
    return DEFAULT_GOALS.map((g) => {
      const s = saved.find((x) => x.id === g.id);
      return s ? { ...g, target: s.target, actual: s.actual ?? g.actual } : g;
    });
  } catch {
    return DEFAULT_GOALS;
  }
}

function saveGoals(goals) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(goals.map(({ id, target, actual }) => ({ id, target, actual })))
  );
}

// ─── Status helpers ───────────────────────────────────────────────────────────
function getStatus(actual, target) {
  if (actual === undefined || actual === null) return 'unknown';
  const ratio = actual / target;
  if (ratio >= 1) return 'on-track';
  if (ratio >= 0.8) return 'at-risk';
  return 'missed';
}

const STATUS_META = {
  'on-track': { label: 'On Track', color: '#16a34a', bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', ring: '#16a34a' },
  'at-risk':  { label: 'At Risk',  color: '#d97706', bg: 'bg-amber-50',  border: 'border-amber-200',  text: 'text-amber-700',  ring: '#d97706' },
  'missed':   { label: 'Missed',   color: '#dc2626', bg: 'bg-rose-50',   border: 'border-rose-200',   text: 'text-rose-700',   ring: '#dc2626' },
  'unknown':  { label: 'No Data',  color: '#94a3b8', bg: 'bg-slate-50',  border: 'border-slate-200',  text: 'text-slate-500',  ring: '#94a3b8' },
};

// ─── Hex → RGB helper (for jsPDF) ────────────────────────────────────────────
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

// ─── SVG Progress Ring ────────────────────────────────────────────────────────
function ProgressRing({ actual, target, size = 120 }) {
  const status = getStatus(actual, target);
  const meta = STATUS_META[status];
  const radius = (size - 16) / 2;
  const circ = 2 * Math.PI * radius;
  const pct = actual != null ? Math.min(actual / target, 1) : 0;
  const dash = pct * circ;

  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e2e8f0" strokeWidth={10} />
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none"
        stroke={meta.ring}
        strokeWidth={10}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.6s ease' }}
      />
      <text
        x="50%" y="50%"
        dominantBaseline="middle" textAnchor="middle"
        className="rotate-90"
        style={{ transform: `rotate(90deg) translate(0, 0)`, transformOrigin: 'center', fontSize: 18, fontWeight: 700, fill: meta.ring }}
      >
      </text>
    </svg>
  );
}

// ─── Goal Card ────────────────────────────────────────────────────────────────
function GoalCard({ goal, onEdit }) {
  const status = getStatus(goal.actual, goal.target);
  const meta = STATUS_META[status];
  const pct = goal.actual != null ? Math.min(Math.round((goal.actual / goal.target) * 100), 100) : null;
  const barWidth = goal.actual != null ? Math.min((goal.actual / goal.target) * 100, 100) : 0;

  return (
    <div className={`relative overflow-hidden rounded-3xl border ${meta.border} bg-white shadow-sm`}>
      {/* top accent bar */}
      <div className={`h-1 w-full bg-gradient-to-r ${goal.accentFrom} ${goal.accentTo}`} />

      <div className="p-6">
        {/* header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{goal.icon}</span>
            <div>
              <p className="font-semibold text-slate-900 leading-tight">{goal.label}</p>
              <p className="mt-0.5 text-xs text-slate-500">{goal.description}</p>
            </div>
          </div>
          <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${meta.bg} ${meta.border} ${meta.text}`}>
            {meta.label}
          </span>
        </div>

        {/* ring + numbers */}
        <div className="mt-5 flex items-center gap-6">
          <div className="relative flex items-center justify-center" style={{ width: 100, height: 100 }}>
            <ProgressRing actual={goal.actual} target={goal.target} size={100} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold" style={{ color: meta.ring }}>
                {goal.actual != null ? `${goal.actual}${goal.unit}` : '—'}
              </span>
              <span className="text-[10px] text-slate-400">current</span>
            </div>
          </div>

          <div className="flex-1 space-y-3">
            <div>
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Progress</span>
                <span>{pct != null ? `${pct}%` : 'N/A'}</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${barWidth}%`, backgroundColor: meta.ring }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-xl bg-slate-50 px-3 py-2">
                <p className="text-slate-400">Target</p>
                <p className="font-semibold text-slate-800">{goal.target}{goal.unit}</p>
              </div>
              <div className="rounded-xl bg-slate-50 px-3 py-2">
                <p className="text-slate-400">Actual</p>
                <p className="font-semibold text-slate-800">{goal.actual != null ? `${goal.actual}${goal.unit}` : '—'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* edit button */}
        <button
          type="button"
          onClick={() => onEdit(goal)}
          className="mt-4 w-full rounded-xl border border-slate-200 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
        >
          Edit goal
        </button>
      </div>
    </div>
  );
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────
function EditModal({ goal, onSave, onClose }) {
  const [target, setTarget] = useState(String(goal.target));
  const [actual, setActual] = useState(goal.actual != null ? String(goal.actual) : '');

  const handleSave = () => {
    const t = parseFloat(target);
    const a = actual.trim() !== '' ? parseFloat(actual) : null;
    if (Number.isNaN(t) || t <= 0 || t > 100) return;
    if (a !== null && (Number.isNaN(a) || a < 0)) return;
    onSave({ ...goal, target: t, actual: a });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-3xl bg-white p-7 shadow-2xl">
        <div className="flex items-center gap-3 mb-5">
          <span className="text-2xl">{goal.icon}</span>
          <h2 className="text-lg font-semibold text-slate-900">{goal.label}</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Monthly Target ({goal.unit})
            </label>
            <input
              type="number" min="1" max="100" step="1"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Current Actual ({goal.unit}) <span className="font-normal text-slate-400">— leave blank if unknown</span>
            </label>
            <input
              type="number" min="0" max="100" step="0.1"
              value={actual}
              onChange={(e) => setActual(e.target.value)}
              placeholder="e.g. 85"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 rounded-xl bg-slate-900 py-2 text-sm font-medium text-white hover:bg-slate-800 transition"
          >
            Save
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

// ─── Summary bar ─────────────────────────────────────────────────────────────
function SummaryBar({ goals }) {
  const counts = { 'on-track': 0, 'at-risk': 0, missed: 0, unknown: 0 };
  goals.forEach((g) => { counts[getStatus(g.actual, g.target)]++; });
  return (
    <div className="flex flex-wrap gap-3">
      {[['on-track', '🟢'], ['at-risk', '🟡'], ['missed', '🔴']].map(([key, emoji]) => (
        <div key={key} className={`flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-medium ${STATUS_META[key].bg} ${STATUS_META[key].border} ${STATUS_META[key].text}`}>
          <span>{emoji}</span>
          <span>{counts[key]} {STATUS_META[key].label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function GoalsPage() {
  const [goals, setGoals] = useState(loadGoals);
  const [editing, setEditing] = useState(null);

  useEffect(() => { saveGoals(goals); }, [goals]);

  const handleSave = (updated) => {
    setGoals((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
    setEditing(null);
  };

  const exportPDF = () => {
    const doc = new jsPDF();

    // ── Title block ──────────────────────────────────────────────────────────
    doc.setFillColor(109, 40, 217); // violet-700
    doc.rect(0, 0, 210, 38, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.text('MODULE F  —  SMART CAMPUS', 14, 12);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Goal & Target Setting Report', 14, 26);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 34);

    // ── Summary counts ───────────────────────────────────────────────────────
    const counts = { 'on-track': 0, 'at-risk': 0, missed: 0, unknown: 0 };
    goals.forEach((g) => { counts[getStatus(g.actual, g.target)]++; });

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary', 14, 50);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);

    const summaryItems = [
      ['On Track', counts['on-track'], [22, 163, 74]],
      ['At Risk',  counts['at-risk'],  [217, 119, 6]],
      ['Missed',   counts.missed,      [220, 38, 38]],
    ];
    summaryItems.forEach(([label, count, rgb], i) => {
      const x = 14 + i * 62;
      doc.setFillColor(...rgb);
      doc.roundedRect(x, 54, 56, 16, 3, 3, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.text(`${label}: ${count}`, x + 5, 64);
    });

    // ── Goals table ──────────────────────────────────────────────────────────
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Goals Detail', 14, 82);

    autoTable(doc, {
      startY: 86,
      head: [['Goal', 'Description', 'Target', 'Actual', 'Progress', 'Status']],
      body: goals.map((g) => {
        const status = getStatus(g.actual, g.target);
        const pct = g.actual != null ? `${Math.round((g.actual / g.target) * 100)}%` : 'N/A';
        return [
          g.label,
          g.description,
          `${g.target}${g.unit}`,
          g.actual != null ? `${g.actual}${g.unit}` : '—',
          pct,
          STATUS_META[status].label,
        ];
      }),
      headStyles: {
        fillColor: [109, 40, 217],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 9,
      },
      bodyStyles: { fontSize: 8, textColor: [30, 41, 59] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: {
        0: { cellWidth: 42, fontStyle: 'bold' },
        1: { cellWidth: 60 },
        2: { cellWidth: 18, halign: 'center' },
        3: { cellWidth: 18, halign: 'center' },
        4: { cellWidth: 20, halign: 'center' },
        5: { cellWidth: 22, halign: 'center' },
      },
      didParseCell(data) {
        if (data.column.index === 5 && data.section === 'body') {
          const val = data.cell.raw;
          if (val === 'On Track') data.cell.styles.textColor = [22, 163, 74];
          else if (val === 'At Risk') data.cell.styles.textColor = [217, 119, 6];
          else if (val === 'Missed') data.cell.styles.textColor = [220, 38, 38];
        }
      },
      styles: { cellPadding: 4, overflow: 'linebreak' },
    });

    // ── Progress bars (visual section) ──────────────────────────────────────
    let y = doc.lastAutoTable.finalY + 12;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);
    doc.text('Progress Overview', 14, y);
    y += 6;

    goals.forEach((g) => {
      const status = getStatus(g.actual, g.target);
      const meta = STATUS_META[status];
      const rgb = hexToRgb(meta.ring);
      const fill = g.actual != null ? Math.min(g.actual / g.target, 1) : 0;
      const barW = 120;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(30, 41, 59);
      doc.text(`${g.label}`, 14, y + 4);

      // track
      doc.setFillColor(226, 232, 240);
      doc.roundedRect(14, y + 6, barW, 6, 2, 2, 'F');
      // fill
      if (fill > 0) {
        doc.setFillColor(...rgb);
        doc.roundedRect(14, y + 6, barW * fill, 6, 2, 2, 'F');
      }
      // label
      doc.setTextColor(...rgb);
      doc.setFont('helvetica', 'bold');
      doc.text(
        g.actual != null ? `${g.actual}${g.unit} / ${g.target}${g.unit}` : `— / ${g.target}${g.unit}`,
        14 + barW + 4, y + 11
      );

      y += 18;
    });

    doc.save('goals-report.pdf');
  };

  return (
    <div className="mx-auto max-w-7xl p-8">
      <div className="rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        {/* header */}
        <div className="border-b border-slate-200 bg-gradient-to-r from-violet-700 via-purple-700 to-fuchsia-700 px-8 py-10 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-violet-200">Module F</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">Goal & Target Setting</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-violet-100">
            Set monthly performance targets and track current progress. Goals are colour-coded by status — green for on track, yellow for at risk, and red for missed.
          </p>
        </div>

        <div className="space-y-6 px-8 py-8">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <SummaryBar goals={goals} />
            <button
              type="button"
              onClick={exportPDF}
              className="flex items-center gap-2 rounded-xl bg-violet-700 px-4 py-2 text-sm font-medium text-white hover:bg-violet-800 transition"
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

          <div className="grid gap-5 md:grid-cols-3">
            {goals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} onEdit={setEditing} />
            ))}
          </div>

          <p className="text-xs text-slate-400">
            Targets and actuals are stored locally in your browser. Update them monthly to keep the dashboard current.
          </p>
        </div>
      </div>

      {editing && (
        <EditModal goal={editing} onSave={handleSave} onClose={() => setEditing(null)} />
      )}
    </div>
  );
}
