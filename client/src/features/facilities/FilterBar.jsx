import {
  Filter,
  MapPin,
  Plus,
  Search,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { facilityOptions } from './facilityOptions';

const FilterBar = ({
  searchTerm,
  typeFilter,
  locationFilter,
  locations,
  onSearchChange,
  onTypeChange,
  onLocationChange,
  onAddClick,
  onReset,
  canAdd = true,
}) => {
  const allLocations = locations || [];

  return (
    <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm rounded-xl border border-gray-700/40 p-6 space-y-4 mb-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <p className="text-sm font-medium text-cyan-300 uppercase tracking-wider">
              Search & Filter
            </p>
          </div>
          <h3 className="text-lg font-semibold text-gray-100">
            Find Resources
          </h3>
        </div>
        {canAdd && (
          <button
            onClick={onAddClick}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-lg transition-all font-medium flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Add Resource</span>
            <span className="sm:hidden">Add</span>
          </button>
        )}
      </div>

      {/* Filters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search */}
        <div className="col-span-1 sm:col-span-2">
          <label className="flex items-center gap-3 bg-gray-900/50 border border-gray-600/30 rounded-lg px-4 py-3 hover:border-gray-600/60 focus-within:border-cyan-500/60 transition">
            <Search className="w-5 h-5 text-cyan-400 flex-shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by name, location..."
              className="bg-transparent text-gray-200 outline-none placeholder:text-gray-500 flex-1 text-sm"
            />
          </label>
        </div>

        {/* Type Filter */}
        <label className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <Filter className="w-4 h-4" />
          </span>
          <select
            value={typeFilter}
            onChange={(e) => onTypeChange(e.target.value)}
            className="w-full appearance-none bg-gray-900/50 border border-gray-600/30 rounded-lg pl-10 pr-4 py-3 text-gray-200 outline-none hover:border-gray-600/60 focus:border-cyan-500/60 transition text-sm"
          >
            {facilityOptions.RESOURCE_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        {/* Location Filter */}
        <label className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <MapPin className="w-4 h-4" />
          </span>
          <select
            value={locationFilter}
            onChange={(e) => onLocationChange(e.target.value)}
            className="w-full appearance-none bg-gray-900/50 border border-gray-600/30 rounded-lg pl-10 pr-4 py-3 text-gray-200 outline-none hover:border-gray-600/60 focus:border-cyan-500/60 transition text-sm"
          >
            <option value="">All Locations</option>
            {allLocations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </label>

        {/* Reset Button */}
        <button
          onClick={onReset}
          className="px-4 py-3 bg-gray-900/50 border border-gray-600/30 rounded-lg text-gray-400 hover:text-gray-200 hover:border-gray-600/60 transition-all flex items-center justify-center gap-2 font-medium text-sm"
        >
          <Trash2 className="w-4 h-4" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>
    </div>
  );
};

export default FilterBar;
