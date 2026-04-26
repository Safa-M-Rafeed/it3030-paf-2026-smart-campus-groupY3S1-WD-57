import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Loader2, Monitor, Plus, Search, Users } from 'lucide-react';
import ResourceCard from '../components/ResourceCard';
import { resourceService } from '../services/resourceService';

const RESOURCE_TYPES = ['LECTURE_HALL', 'LAB', 'MEETING_ROOM', 'EQUIPMENT'];
const RESOURCE_STATUSES = ['ACTIVE', 'OUT_OF_SERVICE'];

const formatLabel = (value = '') => value.replaceAll('_', ' ');

function StatCard({ label, value, icon: Icon, tone }) {
  const styles = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-emerald-50 text-emerald-700',
    red: 'bg-red-50 text-red-700',
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm text-slate-500">{label}</p>
        <span className={`rounded-lg p-2 ${styles[tone]}`}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 h-6 w-1/2 rounded bg-slate-200" />
      <div className="mb-2 h-4 w-3/4 rounded bg-slate-100" />
      <div className="mb-5 h-4 w-2/3 rounded bg-slate-100" />
      <div className="grid grid-cols-2 gap-2">
        <div className="h-9 rounded bg-slate-100" />
        <div className="h-9 rounded bg-slate-200" />
      </div>
    </div>
  );
}

export default function ResourceListPage() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    query: '',
    type: '',
    status: '',
    capacity: '',
  });

  const canSearch = useMemo(() => filters.capacity === '' || Number(filters.capacity) > 0, [filters.capacity]);

  const loadResources = async (activeFilters) => {
    setLoading(true);
    setError('');
    try {
      const data = await resourceService.getAll(activeFilters);
      setResources(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources({});
  }, []);

  const onFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const onSearch = async (event) => {
    event.preventDefault();
    if (!canSearch) return;
    await loadResources({
      type: filters.type || undefined,
      status: filters.status || undefined,
      capacity: filters.capacity || undefined,
      location: filters.query || undefined,
    });
  };

  const onReset = async () => {
    const cleared = { query: '', type: '', status: '', capacity: '' };
    setFilters(cleared);
    await loadResources({});
  };

  const filteredResources = useMemo(() => {
    const query = filters.query.trim().toLowerCase();
    return resources.filter((resource) => {
      if (query) {
        const value = `${resource.name || ''} ${resource.location || ''}`.toLowerCase();
        if (!value.includes(query)) return false;
      }
      if (filters.type && resource.type !== filters.type) return false;
      if (filters.status && resource.status !== filters.status) return false;
      if (filters.capacity && Number(resource.capacity) < Number(filters.capacity)) return false;
      return true;
    });
  }, [resources, filters]);

  const stats = useMemo(() => {
    const total = resources.length;
    const active = resources.filter((resource) => resource.status === 'ACTIVE').length;
    return { total, active, outOfService: total - active };
  }, [resources]);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-blue-700 to-blue-600 p-6 text-white shadow">
          <p className="text-sm font-medium text-blue-100">Smart Campus Operations Hub</p>
          <h1 className="mt-1 text-3xl font-bold">Facilities & Assets</h1>
          <p className="mt-2 text-sm text-blue-100">
            Manage lecture halls, labs, meeting rooms, and equipment with real-time catalogue visibility.
          </p>
          <Link
            to="/facilities/new"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
          >
            <Plus className="h-4 w-4" />
            Add Resource
          </Link>
        </div>

        <div className="mb-6 grid gap-3 md:grid-cols-3">
          <StatCard label="Total Resources" value={stats.total} icon={Building2} tone="blue" />
          <StatCard label="Active" value={stats.active} icon={Users} tone="green" />
          <StatCard label="Out of Service" value={stats.outOfService} icon={Monitor} tone="red" />
        </div>

        <form className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" onSubmit={onSearch}>
          <div className="grid gap-3 md:grid-cols-4">
            <div className="relative md:col-span-2">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                name="query"
                value={filters.query}
                onChange={onFilterChange}
                placeholder="Search by name or location"
                className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none ring-blue-200 transition focus:ring-2"
              />
            </div>

            <select
              name="type"
              value={filters.type}
              onChange={onFilterChange}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-200 transition focus:ring-2"
            >
              <option value="">All Types</option>
              {RESOURCE_TYPES.map((type) => (
                <option key={type} value={type}>{formatLabel(type)}</option>
              ))}
            </select>

            <select
              name="status"
              value={filters.status}
              onChange={onFilterChange}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-200 transition focus:ring-2"
            >
              <option value="">All Statuses</option>
              {RESOURCE_STATUSES.map((status) => (
                <option key={status} value={status}>{formatLabel(status)}</option>
              ))}
            </select>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <input
              type="number"
              min="1"
              name="capacity"
              value={filters.capacity}
              onChange={onFilterChange}
              placeholder="Minimum capacity"
              className="w-56 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-200 transition focus:ring-2"
            />
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!canSearch}
            >
              Apply Filters
            </button>
            <button
              type="button"
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              onClick={onReset}
            >
              Reset
            </button>
          </div>
        </form>

        {error && <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {loading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : filteredResources.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <Loader2 className="mx-auto mb-3 h-8 w-8 text-slate-300" />
              <h3 className="text-lg font-semibold text-slate-800">No resources found</h3>
              <p className="mt-1 text-sm text-slate-500">Try changing filters or add a new resource.</p>
            </div>
          ) : (
            filteredResources.map((resource) => <ResourceCard key={resource.id} resource={resource} />)
          )}
        </div>
      </div>
    </div>
  );
}
