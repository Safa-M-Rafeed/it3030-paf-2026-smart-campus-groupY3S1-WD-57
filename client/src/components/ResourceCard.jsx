import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, FlaskConical, MapPin, Monitor, Users, Users2 } from 'lucide-react';

const typeIconMap = {
  LECTURE_HALL: Building2,
  LAB: FlaskConical,
  MEETING_ROOM: Users,
  EQUIPMENT: Monitor,
};

const formatType = (type = '') => type.replaceAll('_', ' ');

const summarizeAvailability = (windows = []) => {
  if (!Array.isArray(windows) || windows.length === 0) return 'No availability set';

  const hasObjects = typeof windows[0] === 'object' && windows[0] !== null;
  if (!hasObjects) {
    return windows.slice(0, 2).join(', ') + (windows.length > 2 ? ' ...' : '');
  }

  const uniqueDays = [...new Set(windows.map((w) => w.day).filter(Boolean))];
  if (uniqueDays.length === 5 && uniqueDays.join(',') === 'MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY') {
    return 'Mon-Fri schedule';
  }

  return uniqueDays.length > 0 ? uniqueDays.join(', ') : 'Custom schedule';
};

export default function ResourceCard({ resource }) {
  const Icon = typeIconMap[resource.type] || Building2;
  const isActive = resource.status === 'ACTIVE';

  return (
    <article className="rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="border-b border-slate-100 p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="rounded-xl bg-blue-600 p-2 text-white">
            <Icon className="h-5 w-5" />
          </div>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
              isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
            }`}
          >
            {resource.status}
          </span>
        </div>

        <h3 className="text-lg font-semibold text-slate-900">{resource.name}</h3>
        <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500">{formatType(resource.type)}</p>
      </div>

      <div className="space-y-3 p-5 text-sm text-slate-600">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-blue-600" />
          <span>{resource.location || 'Unknown location'}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
            <Users2 className="h-3.5 w-3.5" />
            Capacity {resource.capacity || 0}
          </span>
          <span className="text-xs text-slate-500">{summarizeAvailability(resource.availabilityWindows)}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 p-5 pt-0">
        <Link
          to={`/facilities/${resource.id}`}
          className="rounded-lg border border-blue-200 px-3 py-2 text-center text-sm font-medium text-blue-700 transition hover:bg-blue-50"
        >
          View Details
        </Link>
        <Link
          to={`/facilities/${resource.id}/edit`}
          className="rounded-lg bg-blue-600 px-3 py-2 text-center text-sm font-medium text-white transition hover:bg-blue-700"
        >
          Edit
        </Link>
      </div>
    </article>
  );
}
