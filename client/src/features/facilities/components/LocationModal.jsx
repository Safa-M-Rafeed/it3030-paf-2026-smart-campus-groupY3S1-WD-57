import React from 'react';
import { X, MapPin } from 'lucide-react';

const LocationModal = ({ isOpen, onClose, resourceLocation, resourceName }) => {
  if (!isOpen) return null;

  // Campus floor map SVG - Static campus visualization
  const CampusMap = () => (
    <svg
      viewBox="0 0 1200 800"
      className="w-full border border-gray-600 rounded-lg bg-gray-900"
    >
      {/* Define gradients */}
      <defs>
        <linearGradient id="buildingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#374151', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#1f2937', stopOpacity: 1 }} />
        </linearGradient>
        <linearGradient id="highlightGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#10b981', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#059669', stopOpacity: 1 }} />
        </linearGradient>
      </defs>

      {/* Background */}
      <rect width="1200" height="800" fill="#111827" />

      {/* Grid lines */}
      <g stroke="#374151" strokeWidth="1" strokeDasharray="5,5" opacity="0.3">
        {Array.from({ length: 12 }).map((_, i) => (
          <line key={`v-${i}`} x1={i * 100} y1="0" x2={i * 100} y2="800" />
        ))}
        {Array.from({ length: 8 }).map((_, i) => (
          <line key={`h-${i}`} x1="0" y1={i * 100} x2="1200" y2={i * 100} />
        ))}
      </g>

      {/* Building A */}
      <g id="buildingA">
        <rect
          x="50"
          y="50"
          width="300"
          height="400"
          fill="url(#buildingGradient)"
          stroke="#60a5fa"
          strokeWidth="2"
        />
        <text
          x="200"
          y="120"
          fill="#93c5fd"
          fontSize="24"
          fontWeight="bold"
          textAnchor="middle"
        >
          Building A
        </text>

        {/* Rooms in Building A */}
        <rect
          x="70"
          y="150"
          width="260"
          height="80"
          fill={
            resourceLocation.includes('Building A - Floor 2')
              ? 'url(#highlightGradient)'
              : '#475569'
          }
          stroke="#94a3b8"
          strokeWidth="1"
          rx="4"
        />
        <text
          x="200"
          y="200"
          fill={
            resourceLocation.includes('Building A - Floor 2')
              ? '#f0fdf4'
              : '#cbd5e1'
          }
          fontSize="14"
          fontWeight="bold"
          textAnchor="middle"
        >
          Floor 2 - Lecture Hall A
        </text>

        <rect
          x="70"
          y="250"
          width="260"
          height="80"
          fill={
            resourceLocation.includes('Building A - Room 101')
              ? 'url(#highlightGradient)'
              : '#475569'
          }
          stroke="#94a3b8"
          strokeWidth="1"
          rx="4"
        />
        <text
          x="200"
          y="300"
          fill={
            resourceLocation.includes('Building A - Room 101')
              ? '#f0fdf4'
              : '#cbd5e1'
          }
          fontSize="14"
          fontWeight="bold"
          textAnchor="middle"
        >
          Room 101
        </text>

        <rect
          x="70"
          y="350"
          width="260"
          height="80"
          fill="#475569"
          stroke="#94a3b8"
          strokeWidth="1"
          rx="4"
        />
        <text
          x="200"
          y="400"
          fill="#cbd5e1"
          fontSize="14"
          fontWeight="bold"
          textAnchor="middle"
        >
          Floor 3 - Study Area
        </text>
      </g>

      {/* Building B */}
      <g id="buildingB">
        <rect
          x="450"
          y="50"
          width="300"
          height="400"
          fill="url(#buildingGradient)"
          stroke="#a78bfa"
          strokeWidth="2"
        />
        <text
          x="600"
          y="120"
          fill="#d8b4fe"
          fontSize="24"
          fontWeight="bold"
          textAnchor="middle"
        >
          Building B
        </text>

        {/* Rooms in Building B */}
        <rect
          x="470"
          y="150"
          width="260"
          height="80"
          fill={
            resourceLocation.includes('Building B - Floor 1')
              ? 'url(#highlightGradient)'
              : '#475569'
          }
          stroke="#94a3b8"
          strokeWidth="1"
          rx="4"
        />
        <text
          x="600"
          y="200"
          fill={
            resourceLocation.includes('Building B - Floor 1')
              ? '#f0fdf4'
              : '#cbd5e1'
          }
          fontSize="14"
          fontWeight="bold"
          textAnchor="middle"
        >
          Floor 1 - Physics Lab
        </text>

        <rect
          x="470"
          y="250"
          width="260"
          height="80"
          fill={
            resourceLocation.includes('Building B - Floor 2')
              ? 'url(#highlightGradient)'
              : '#475569'
          }
          stroke="#94a3b8"
          strokeWidth="1"
          rx="4"
        />
        <text
          x="600"
          y="300"
          fill={
            resourceLocation.includes('Building B - Floor 2')
              ? '#f0fdf4'
              : '#cbd5e1'
          }
          fontSize="14"
          fontWeight="bold"
          textAnchor="middle"
        >
          Floor 2 - Chemistry Lab
        </text>

        <rect
          x="470"
          y="350"
          width="260"
          height="80"
          fill="#475569"
          stroke="#94a3b8"
          strokeWidth="1"
          rx="4"
        />
        <text
          x="600"
          y="400"
          fill="#cbd5e1"
          fontSize="14"
          fontWeight="bold"
          textAnchor="middle"
        >
          Floor 3 - Storage
        </text>
      </g>

      {/* Building C */}
      <g id="buildingC">
        <rect
          x="850"
          y="50"
          width="300"
          height="400"
          fill="url(#buildingGradient)"
          stroke="#f97316"
          strokeWidth="2"
        />
        <text
          x="1000"
          y="120"
          fill="#feddcd"
          fontSize="24"
          fontWeight="bold"
          textAnchor="middle"
        >
          Building C
        </text>

        {/* Rooms in Building C */}
        <rect
          x="870"
          y="150"
          width="260"
          height="80"
          fill={
            resourceLocation.includes('Building C - Floor 3')
              ? 'url(#highlightGradient)'
              : '#475569'
          }
          stroke="#94a3b8"
          strokeWidth="1"
          rx="4"
        />
        <text
          x="1000"
          y="200"
          fill={
            resourceLocation.includes('Building C - Floor 3')
              ? '#f0fdf4'
              : '#cbd5e1'
          }
          fontSize="14"
          fontWeight="bold"
          textAnchor="middle"
        >
          Floor 3 - Computer Lab
        </text>

        <rect
          x="870"
          y="250"
          width="260"
          height="80"
          fill="#475569"
          stroke="#94a3b8"
          strokeWidth="1"
          rx="4"
        />
        <text
          x="1000"
          y="300"
          fill="#cbd5e1"
          fontSize="14"
          fontWeight="bold"
          textAnchor="middle"
        >
          Floor 2 - Office Space
        </text>

        <rect
          x="870"
          y="350"
          width="260"
          height="80"
          fill="#475569"
          stroke="#94a3b8"
          strokeWidth="1"
          rx="4"
        />
        <text
          x="1000"
          y="400"
          fill="#cbd5e1"
          fontSize="14"
          fontWeight="bold"
          textAnchor="middle"
        >
          Floor 1 - Cafeteria
        </text>
      </g>

      {/* Building D */}
      <g id="buildingD">
        <rect
          x="50"
          y="500"
          width="300"
          height="250"
          fill="url(#buildingGradient)"
          stroke="#ec4899"
          strokeWidth="2"
        />
        <text
          x="200"
          y="570"
          fill="#f9a8d4"
          fontSize="24"
          fontWeight="bold"
          textAnchor="middle"
        >
          Building D
        </text>

        <rect
          x="70"
          y="600"
          width="260"
          height="120"
          fill={
            resourceLocation.includes('Building D - Floor 1')
              ? 'url(#highlightGradient)'
              : '#475569'
          }
          stroke="#94a3b8"
          strokeWidth="1"
          rx="4"
        />
        <text
          x="200"
          y="660"
          fill={
            resourceLocation.includes('Building D - Floor 1')
              ? '#f0fdf4'
              : '#cbd5e1'
          }
          fontSize="14"
          fontWeight="bold"
          textAnchor="middle"
        >
          Floor 1 - Biology Wing
        </text>
      </g>

      {/* Legend */}
      <g id="legend">
        <rect
          x="450"
          y="550"
          width="300"
          height="200"
          fill="#1f2937"
          stroke="#4b5563"
          strokeWidth="1"
          rx="8"
        />
        <text
          x="600"
          y="575"
          fill="#e5e7eb"
          fontSize="16"
          fontWeight="bold"
          textAnchor="middle"
        >
          Campus Map Legend
        </text>

        <circle cx="470" cy="610" r="8" fill="#10b981" />
        <text x="490" y="615" fill="#d1d5db" fontSize="12">
          Current Resource Location
        </text>

        <circle cx="470" cy="640" r="8" fill="#475569" />
        <text x="490" y="645" fill="#d1d5db" fontSize="12">
          Other Facilities
        </text>

        <text x="470" y="685" fill="#9ca3af" fontSize="11">
          Resource: {resourceName}
        </text>
        <text x="470" y="705" fill="#9ca3af" fontSize="11">
          Location: {resourceLocation}
        </text>
      </g>
    </svg>
  );

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 rounded-xl border border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-emerald-900/30 to-teal-900/30 backdrop-blur-sm border-b border-gray-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MapPin className="w-6 h-6 text-emerald-400" />
            <div>
              <h2 className="text-xl font-bold text-gray-100">Campus Location Map</h2>
              <p className="text-sm text-gray-400">{resourceName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Map Content */}
        <div className="p-6">
          <CampusMap />
        </div>

        {/* Footer */}
        <div className="bg-gray-900/50 border-t border-gray-700 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-100 rounded-lg transition-colors"
          >
            Close Map
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationModal;
