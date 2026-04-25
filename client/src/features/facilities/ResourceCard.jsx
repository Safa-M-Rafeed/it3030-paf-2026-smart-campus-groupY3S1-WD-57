import {
  MapPin,
  PencilLine,
  School,
  Trash2,
  Users,
} from 'lucide-react'
import { getTypeMeta } from './facilityOptions.js'

function statusStyles(status) {
  if (status === 'ACTIVE') {
    return 'border-emerald-400/20 bg-emerald-400/15 text-emerald-200'
  }

  return 'border-rose-400/20 bg-rose-400/15 text-rose-200'
}

export default function ResourceCard({ resource, onEdit, onDelete }) {
  const meta = getTypeMeta(resource.type)
  const TypeIcon = meta.Icon ?? School

  return (
    <article className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/70 p-5 shadow-[0_24px_80px_rgba(2,6,23,0.32)] backdrop-blur-xl transition hover:-translate-y-1 hover:border-cyan-400/25 hover:shadow-[0_28px_90px_rgba(8,145,178,0.18)]">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-400 via-sky-500 to-violet-400" />
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <div
            className={`inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r ${meta.accent} px-3 py-2 text-sm font-semibold text-slate-950`}
          >
            <TypeIcon className="h-4.5 w-4.5" />
            {meta.label}
          </div>

          <div>
            <h3 className="text-xl font-semibold tracking-tight text-white">
              {resource.name}
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              {meta.description}
            </p>
          </div>
        </div>

        <span
          className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${statusStyles(resource.status)}`}
        >
          {resource.status}
        </span>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/8 bg-white/5 p-3">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-400">
            <Users className="h-4 w-4 text-cyan-300" />
            Capacity
          </div>
          <p className="mt-2 text-lg font-semibold text-white">
            {resource.capacity}
          </p>
        </div>

        <div className="rounded-2xl border border-white/8 bg-white/5 p-3">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-400">
            <MapPin className="h-4 w-4 text-cyan-300" />
            Location
          </div>
          <p className="mt-2 text-lg font-semibold text-white">
            {resource.location}
          </p>
        </div>
      </div>

      {resource.description ? (
        <p className="mt-4 min-h-12 text-sm leading-6 text-slate-300">
          {resource.description}
        </p>
      ) : null}

      <div className="mt-5 flex items-center gap-3 border-t border-white/8 pt-4">
        <button
          type="button"
          onClick={() => onEdit(resource)}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:border-cyan-400/30 hover:bg-cyan-400/10"
        >
          <PencilLine className="h-4.5 w-4.5" />
          Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(resource)}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-2.5 text-sm font-semibold text-rose-200 transition hover:bg-rose-400/15"
        >
          <Trash2 className="h-4.5 w-4.5" />
          Delete
        </button>
      </div>
    </article>
  )
}
