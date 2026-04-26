import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CalendarPlus, Trash2 } from 'lucide-react';
import { resourceService } from '../services/resourceService';

const RESOURCE_TYPES = ['LECTURE_HALL', 'LAB', 'MEETING_ROOM', 'EQUIPMENT'];
const RESOURCE_STATUSES = ['ACTIVE', 'OUT_OF_SERVICE'];
const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
const DEFAULT_WINDOW = { day: 'MONDAY', startTime: '08:00', endTime: '17:00' };

const EMPTY_FORM = {
  name: '',
  type: 'LECTURE_HALL',
  capacity: '',
  location: '',
  description: '',
  availabilityWindows: [{ ...DEFAULT_WINDOW }],
  status: 'ACTIVE',
};

const formatLabel = (value = '') => value.replaceAll('_', ' ');
const toWindowString = (window) => `${window.day} ${window.startTime}-${window.endTime}`;

const parseWindowString = (value) => {
  if (typeof value !== 'string') return { ...DEFAULT_WINDOW };
  const [day = 'MONDAY', range = '08:00-17:00'] = value.split(' ');
  const [startTime = '08:00', endTime = '17:00'] = range.split('-');
  return { day, startTime, endTime };
};

export default function ResourceForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState('');
  const [successToast, setSuccessToast] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (!isEdit) return;

    const loadResource = async () => {
      setLoading(true);
      setError('');
      try {
        const resource = await resourceService.getById(id);
        setForm({
          name: resource.name || '',
          type: resource.type || 'LECTURE_HALL',
          capacity: resource.capacity || '',
          location: resource.location || '',
          description: resource.description || '',
          availabilityWindows: Array.isArray(resource.availabilityWindows) && resource.availabilityWindows.length > 0
            ? resource.availabilityWindows.map((window) => (
              typeof window === 'string'
                ? parseWindowString(window)
                : {
                  day: window.day || DEFAULT_WINDOW.day,
                  startTime: window.startTime || DEFAULT_WINDOW.startTime,
                  endTime: window.endTime || DEFAULT_WINDOW.endTime,
                }
            ))
            : [{ ...DEFAULT_WINDOW }],
          status: resource.status || 'ACTIVE',
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load resource');
      } finally {
        setLoading(false);
      }
    };

    loadResource();
  }, [id, isEdit]);

  const validate = () => {
    const nextErrors = {};

    if (!form.name.trim()) nextErrors.name = 'Name is required';
    if (!form.location.trim()) nextErrors.location = 'Location is required';

    const capacityValue = Number(form.capacity);
    if (!form.capacity || Number.isNaN(capacityValue) || capacityValue < 1) {
      nextErrors.capacity = 'Capacity must be 1 or more';
    }

    if (!Array.isArray(form.availabilityWindows) || form.availabilityWindows.length === 0) {
      nextErrors.availabilityWindows = 'Provide at least one availability window';
    } else {
      const hasInvalidWindow = form.availabilityWindows.some((window) => (
        !window.day || !window.startTime || !window.endTime || window.startTime >= window.endTime
      ));
      if (hasInvalidWindow) {
        nextErrors.availabilityWindows = 'Each window needs day, start time, and valid end time';
      }
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const payload = useMemo(() => ({
    name: form.name.trim(),
    type: form.type,
    capacity: Number(form.capacity),
    location: form.location.trim(),
    description: form.description.trim(),
    availabilityWindows: form.availabilityWindows.map(toWindowString),
    status: form.status,
  }), [form]);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const addWindow = () => {
    setForm((prev) => ({
      ...prev,
      availabilityWindows: [...prev.availabilityWindows, { ...DEFAULT_WINDOW }],
    }));
  };

  const removeWindow = (index) => {
    setForm((prev) => ({
      ...prev,
      availabilityWindows: prev.availabilityWindows.filter((_, idx) => idx !== index),
    }));
  };

  const onWindowChange = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      availabilityWindows: prev.availabilityWindows.map((window, idx) => (
        idx === index ? { ...window, [field]: value } : window
      )),
    }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!validate()) return;

    try {
      if (isEdit) {
        await resourceService.update(id, payload);
        setSuccessToast('Resource updated successfully');
      } else {
        await resourceService.create(payload);
        setSuccessToast('Resource created successfully');
      }
      setTimeout(() => navigate('/facilities'), 900);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save resource');
    }
  };

  if (loading) return <div className="p-6">Loading form...</div>;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 md:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">{isEdit ? 'Edit Resource' : 'Create Resource'}</h1>
          <Link to="/facilities" className="text-sm font-medium text-blue-700 hover:text-blue-800">Back to list</Link>
        </div>

        {error && <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {successToast && (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {successToast}
          </div>
        )}

        <form className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" onSubmit={onSubmit}>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Name</label>
            <input
              name="name"
              value={form.name}
              onChange={onChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-200 focus:ring-2"
            />
            {fieldErrors.name && <p className="text-sm text-red-600">{fieldErrors.name}</p>}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Type</label>
              <select
                name="type"
                value={form.type}
                onChange={onChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-200 focus:ring-2"
              >
                {RESOURCE_TYPES.map((type) => (
                  <option key={type} value={type}>{formatLabel(type)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={onChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-200 focus:ring-2"
              >
                {RESOURCE_STATUSES.map((status) => (
                  <option key={status} value={status}>{formatLabel(status)}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Capacity</label>
              <input
                type="number"
                min="1"
                name="capacity"
                value={form.capacity}
                onChange={onChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-200 focus:ring-2"
              />
              {fieldErrors.capacity && <p className="text-sm text-red-600">{fieldErrors.capacity}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Location</label>
              <input
                name="location"
                value={form.location}
                onChange={onChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-200 focus:ring-2"
              />
              {fieldErrors.location && <p className="text-sm text-red-600">{fieldErrors.location}</p>}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
            <textarea
              rows="3"
              name="description"
              value={form.description}
              onChange={onChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-200 focus:ring-2"
            />
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <div className="mb-3 flex items-center justify-between">
              <label className="block text-sm font-medium text-slate-700">Availability Windows</label>
              <button
                type="button"
                onClick={addWindow}
                className="inline-flex items-center gap-1 rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-50"
              >
                <CalendarPlus className="h-3.5 w-3.5" />
                Add window
              </button>
            </div>
            <div className="space-y-2">
              {form.availabilityWindows.map((window, index) => (
                <div key={`${window.day}-${index}`} className="grid gap-2 md:grid-cols-[1fr_1fr_1fr_auto]">
                  <select
                    value={window.day}
                    onChange={(event) => onWindowChange(index, 'day', event.target.value)}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-200 focus:ring-2"
                  >
                    {DAYS.map((day) => (
                      <option key={day} value={day}>{formatLabel(day)}</option>
                    ))}
                  </select>
                  <input
                    type="time"
                    value={window.startTime}
                    onChange={(event) => onWindowChange(index, 'startTime', event.target.value)}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-200 focus:ring-2"
                  />
                  <input
                    type="time"
                    value={window.endTime}
                    onChange={(event) => onWindowChange(index, 'endTime', event.target.value)}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-200 focus:ring-2"
                  />
                  <button
                    type="button"
                    onClick={() => removeWindow(index)}
                    disabled={form.availabilityWindows.length === 1}
                    className="inline-flex items-center justify-center rounded-lg border border-red-200 px-3 py-2 text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            {fieldErrors.availabilityWindows && <p className="mt-2 text-sm text-red-600">{fieldErrors.availabilityWindows}</p>}
          </div>

          <div className="flex gap-2">
            <button type="submit" className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">
              {isEdit ? 'Update Resource' : 'Create Resource'}
            </button>
            <button
              type="button"
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              onClick={() => navigate('/facilities')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
