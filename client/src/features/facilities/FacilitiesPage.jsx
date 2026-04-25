import React, { useState, useEffect, useMemo } from 'react';
import { AlertTriangle, RefreshCw, Building2 } from 'lucide-react';
import FilterBar from './FilterBar';
import ResourceCard from './ResourceCard';
import ResourceModal from './ResourceModal';
import StatusDashboard from './components/StatusDashboard';
import LocationModal from './components/LocationModal';
import { addResource, editResource, getResources, removeResource } from './facilitiesApi';
import { facilityOptions } from './facilityOptions';

const FacilitiesPage = () => {
  // User role - In production, this would come from authentication context
  const [userRole, setUserRole] = useState('ADMIN'); // Change to 'USER' to test role restrictions

  // Data states
  const [resources, setResources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [locationFilter, setLocationFilter] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [selectedLocationResource, setSelectedLocationResource] = useState(null);

  // Load resources and stats on mount
  useEffect(() => {
    loadResources();
  }, []);

  useEffect(() => {
    setStats(buildDashboardStats(resources));
  }, [resources]);

  const buildDashboardStats = (items) => {
    const total = items.length;
    const active = items.filter((r) => r.status === 'ACTIVE').length;
    const outOfService = items.filter((r) => r.status === 'OUT_OF_SERVICE').length;

    const typeBreakdown = {
      LECTURE_HALL: items.filter((r) => r.type === 'LECTURE_HALL').length,
      LAB: items.filter((r) => r.type === 'LAB').length,
      EQUIPMENT: items.filter((r) => r.type === 'EQUIPMENT').length,
    };

    return {
      total,
      active,
      outOfService,
      typeBreakdown,
      utilizationRate: total > 0 ? Math.round((active / total) * 100) : 0,
    };
  };

  const loadResources = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getResources();
      setResources(data);
    } catch (err) {
      setError(err.message || 'Failed to load resources');
      console.error('Error loading resources:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter resources
  const filteredResources = useMemo(() => {
    return resources.filter((resource) => {
      const matchesSearch =
        searchTerm === '' ||
        resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.location.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = typeFilter === 'ALL' || resource.type === typeFilter;

      const matchesLocation =
        locationFilter === '' ||
        resource.location.includes(locationFilter);

      return matchesSearch && matchesType && matchesLocation;
    });
  }, [resources, searchTerm, typeFilter, locationFilter]);

  // Get unique locations
  const locations = useMemo(() => {
    return [...new Set(resources.map((r) => r.location))].sort();
  }, [resources]);

  // Handle modal operations
  const openCreateModal = () => {
    setSelectedResource(null);
    setIsModalOpen(true);
  };

  const openEditModal = (resource) => {
    setSelectedResource(resource);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedResource(null);
  };

  const handleSave = async (formData) => {
    try {
      if (selectedResource) {
        // Edit existing
        const updated = await editResource(
          selectedResource.id,
          formData
        );
        setResources(
          resources.map((r) => (r.id === updated.id ? updated : r))
        );
      } else {
        // Create new
        const created = await addResource(formData);
        setResources([...resources, created]);
      }
      closeModal();
    } catch (err) {
      setError(err.message || 'Failed to save resource');
    }
  };

  const handleDelete = async (id) => {
    try {
      await removeResource(id);
      setResources(resources.filter((r) => r.id !== id));
    } catch (err) {
      setError(err.message || 'Failed to delete resource');
    }
  };

  const handleViewMap = (resource) => {
    setSelectedLocationResource(resource);
    setIsLocationModalOpen(true);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setTypeFilter('ALL');
    setLocationFilter('');
  };

  const isAdmin = userRole === 'ADMIN';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 text-gray-100">
      {/* Background Effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-purple-500 rounded-full mix-blend-screen filter blur-3xl opacity-10 animation-delay-2000"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl border border-blue-500/30">
                <Building2 className="w-8 h-8 text-blue-300" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-cyan-300">
                  Facilities Catalogue
                </h1>
                <p className="text-gray-400 text-sm mt-1">
                  Smart campus resources in one operational view
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg">
              <span className="text-sm text-gray-400">Role:</span>
              <span className={`text-sm font-semibold ${
                isAdmin ? 'text-emerald-400' : 'text-blue-400'
              }`}>
                {userRole}
              </span>
            </div>
          </div>

          {/* Quick Admin Toggle (for demo) */}
          <div className="text-xs text-gray-500 p-2 bg-gray-900/50 rounded border border-gray-800">
            💡 Demo: Currently in <strong>{userRole}</strong> mode. Edit/Delete buttons are{' '}
            {isAdmin ? 'visible' : 'hidden'}. Change role by modifying <code>setUserRole()</code> in
            FacilitiesPage.jsx
          </div>
        </div>

        {/* Status Dashboard */}
        <StatusDashboard stats={stats} isLoading={isLoading} />

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-lg flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-rose-200 font-medium">Error</p>
              <p className="text-rose-300 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Filter Bar */}
        <FilterBar
          searchTerm={searchTerm}
          typeFilter={typeFilter}
          locationFilter={locationFilter}
          locations={locations}
          onSearchChange={setSearchTerm}
          onTypeChange={setTypeFilter}
          onLocationChange={setLocationFilter}
          onReset={handleResetFilters}
          onAddClick={openCreateModal}
          canAdd={isAdmin}
        />

        {/* Loading State */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/50 overflow-hidden h-96 animate-pulse"
              >
                <div className="px-6 py-4 border-b border-gray-700/30">
                  <div className="flex gap-3">
                    <div className="w-12 h-12 bg-gray-700/50 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-700/50 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-700/50 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="h-8 bg-gray-700/50 rounded-full w-24 mt-3"></div>
                </div>
                <div className="px-6 py-3 border-b border-gray-700/30">
                  <div className="h-3 bg-gray-700/50 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-700/50 rounded w-5/6"></div>
                </div>
                <div className="px-6 py-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-4 bg-gray-700/50 rounded mb-3"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : filteredResources.length === 0 ? (
          // Empty State
          <div className="text-center py-12">
            <div className="inline-block p-4 bg-gray-800/50 rounded-full mb-4">
              <Building2 className="w-8 h-8 text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              No resources found
            </h3>
            <p className="text-gray-400 mb-6">
              {searchTerm || typeFilter !== 'ALL' || locationFilter
                ? 'Try adjusting your filters'
                : 'Start by creating your first resource'}
            </p>
            {isAdmin && (
              <button
                onClick={openCreateModal}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-lg transition-all font-medium"
              >
                Create First Resource
              </button>
            )}
          </div>
        ) : (
          // Resources Grid
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredResources.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                onEdit={openEditModal}
                onDelete={handleDelete}
                onViewMap={handleViewMap}
                userRole={userRole}
              />
            ))}
          </div>
        )}

        {/* Results Count */}
        {!isLoading && filteredResources.length > 0 && (
          <div className="text-center text-gray-400 text-sm mt-6">
            Showing {filteredResources.length} of {resources.length} resources
          </div>
        )}
      </div>

      {/* Resource Modal */}
      <ResourceModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleSave}
        resource={selectedResource}
      />

      {/* Location Modal */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        resourceLocation={selectedLocationResource?.location || ''}
        resourceName={selectedLocationResource?.name || ''}
      />

      {/* Refresh Button */}
      <button
        onClick={loadResources}
        className="fixed bottom-6 right-6 p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg hover:shadow-blue-500/50 transition-all hover:scale-110"
        title="Refresh resources"
      >
        <RefreshCw className="w-6 h-6" />
      </button>
    </div>
  );
};

export default FacilitiesPage;
