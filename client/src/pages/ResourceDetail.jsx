import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarClock, MapPin, Trash2, Users2 } from 'lucide-react';
import { resourceService } from '../services/resourceService';

const formatLabel = (value = '') => value.replaceAll('_', ' ');
const parseWindow = (window) => {
  if (typeof window === 'string') {
    const [day = '', range = ''] = window.split(' ');
    const [startTime = '-', endTime = '-'] = range.split('-');
    return { day, startTime, endTime };
  }
  return {
    day: window?.day || '',
    startTime: window?.startTime || '-',
    endTime: window?.endTime || '-',
  };
};

export default function ResourceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    const loadResource = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await resourceService.getById(id);
        setResource(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load resource');
      } finally {
        setLoading(false);
      }
    };

    loadResource();
  }, [id]);

  const onDelete = async () => {
    try {
      await resourceService.remove(id);
      setToast('Resource deleted successfully');
      setTimeout(() => navigate('/facilities'), 900);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete resource');
    } finally {
      setShowDeleteDialog(false);
    }
  };

  if (loading) return <div className="p-6 text-slate-600">Loading resource details...</div>;
  if (error) return <div className="p-6 text-red-700">{error}</div>;
  if (!resource) return <div className="p-6 text-slate-700">Resource not found</div>;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 md:px-8">
      <div className="mx-auto max-w-4xl">
        <Link to="/facilities" className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-blue-700 hover:text-blue-800">
          <ArrowLeft className="h-4 w-4" />
          Back to Facilities
        </Link>

        {toast && (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {toast}
          </div>
        )}

        <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h1 className="text-2xl font-bold text-slate-900">{resource.name}</h1>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${resource.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
              {formatLabel(resource.status)}
            </span>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">Type</p>
              <p className="font-semibold text-slate-800">{formatLabel(resource.type)}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">Location</p>
              <p className="flex items-center gap-1 font-semibold text-slate-800"><MapPin className="h-4 w-4 text-blue-600" />{resource.location}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">Capacity</p>
              <p className="flex items-center gap-1 font-semibold text-slate-800"><Users2 className="h-4 w-4 text-blue-600" />{resource.capacity}</p>
            </div>
          </div>

          <div className="mt-4 rounded-xl bg-slate-50 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Description</p>
            <p className="mt-1 text-sm text-slate-700">{resource.description || 'No description provided.'}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-slate-900">
            <CalendarClock className="h-5 w-5 text-blue-600" />
            Availability Schedule
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0 text-sm">
              <thead>
                <tr>
                  <th className="border-b border-slate-200 bg-slate-50 px-3 py-2 text-left text-slate-600">Day</th>
                  <th className="border-b border-slate-200 bg-slate-50 px-3 py-2 text-left text-slate-600">Start Time</th>
                  <th className="border-b border-slate-200 bg-slate-50 px-3 py-2 text-left text-slate-600">End Time</th>
                </tr>
              </thead>
              <tbody>
                {(resource.availabilityWindows || []).length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-3 py-4 text-center text-slate-500">No availability windows set.</td>
                  </tr>
                ) : (
                  resource.availabilityWindows.map((rawWindow, index) => {
                    const window = parseWindow(rawWindow);
                    return (
                    <tr key={`${window.day}-${window.startTime}-${index}`}>
                      <td className="border-b border-slate-100 px-3 py-2 font-medium text-slate-700">{formatLabel(window.day || '')}</td>
                      <td className="border-b border-slate-100 px-3 py-2 text-slate-600">{window.startTime || '-'}</td>
                      <td className="border-b border-slate-100 px-3 py-2 text-slate-600">{window.endTime || '-'}</td>
                    </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
            onClick={() => navigate(`/facilities/${id}/edit`)}
          >
            Edit
          </button>
          <button
            className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>

        {showDeleteDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
              <h3 className="text-lg font-semibold text-slate-900">Delete resource?</h3>
              <p className="mt-2 text-sm text-slate-600">
                This action will permanently remove <span className="font-semibold">{resource.name}</span>.
              </p>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  onClick={() => setShowDeleteDialog(false)}
                >
                  Cancel
                </button>
                <button
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                  onClick={onDelete}
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
