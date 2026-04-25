import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { facilityOptions } from './facilityOptions';

const ResourceModal = ({ isOpen, resource, onClose, onSubmit }) => {
  const [form, setForm] = useState(facilityOptions.DEFAULT_RESOURCE_FORM);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (resource) {
        // Edit mode
        setForm({
          name: resource.name,
          type: resource.type,
          capacity: String(resource.capacity),
          location: resource.location,
          status: resource.status,
          description: resource.description,
        });
      } else {
        // Create mode
        setForm(facilityOptions.DEFAULT_RESOURCE_FORM);
      }
    }
  }, [isOpen, resource]);

  if (!isOpen) {
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await onSubmit({
        ...form,
        capacity: Number(form.capacity),
      });
    } finally {
      setSubmitting(false);
    }
  };

  const isEditMode = !!resource;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 rounded-xl border border-gray-700 max-w-2xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900/30 to-cyan-900/30 backdrop-blur-sm border-b border-gray-700 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-100">
              {isEditMode ? 'Edit Resource' : 'Create New Resource'}
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              {isEditMode ? 'Update resource details' : 'Add a new campus resource'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Resource Name *
            </label>
            <input
              required
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g., Main Lecture Hall"
              className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-gray-100 outline-none hover:border-gray-500 focus:border-cyan-500/60 transition-colors"
            />
          </div>

          {/* Type and Capacity Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Type *
              </label>
              <select
                required
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-gray-100 outline-none hover:border-gray-500 focus:border-cyan-500/60 transition-colors"
              >
                {facilityOptions.RESOURCE_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Capacity */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Capacity *
              </label>
              <input
                required
                type="number"
                min="1"
                name="capacity"
                value={form.capacity}
                onChange={handleChange}
                placeholder="e.g., 50"
                className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-gray-100 outline-none hover:border-gray-500 focus:border-cyan-500/60 transition-colors"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Location *
            </label>
            <input
              required
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="e.g., Building A - Floor 2"
              className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-gray-100 outline-none hover:border-gray-500 focus:border-cyan-500/60 transition-colors"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Status *
            </label>
            <select
              required
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-gray-100 outline-none hover:border-gray-500 focus:border-cyan-500/60 transition-colors"
            >
              {facilityOptions.RESOURCE_STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Optional details about this resource..."
              rows="3"
              className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-gray-100 outline-none hover:border-gray-500 focus:border-cyan-500/60 transition-colors resize-none"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="bg-gray-900/50 border-t border-gray-700 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {submitting ? 'Saving...' : isEditMode ? 'Update Resource' : 'Create Resource'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResourceModal;
