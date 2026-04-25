import React, { useState } from 'react';
import QRCode from 'qrcode.react';
import { Edit, Trash2, MapPin, Users, Type, QrCode } from 'lucide-react';
import { facilityOptions } from '../facilityOptions';

const ResourceCard = ({
  resource,
  onEdit,
  onDelete,
  onViewMap,
  userRole = 'USER',
}) => {
  const [showQR, setShowQR] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isAdmin = userRole === 'ADMIN';

  const getTypeMeta = (type) => {
    const meta = facilityOptions.getTypeMeta(type);
    return meta;
  };

  const typeMeta = getTypeMeta(resource.type);
  const Icon = typeMeta.Icon;

  const statusStyles = (status) => {
    const styles = {
      ACTIVE: 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200',
      OUT_OF_SERVICE: 'bg-rose-500/20 border-rose-500/50 text-rose-200',
    };
    return styles[status] || styles.ACTIVE;
  };

  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDelete(resource.id);
      setShowDeleteConfirm(false);
    } else {
      setShowDeleteConfirm(true);
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-700/50 hover:border-gray-600/50 overflow-hidden transition-all hover:shadow-lg hover:shadow-blue-500/10 flex flex-col h-full">
      {/* Header with Type Badge */}
      <div className="relative px-6 py-4 border-b border-gray-700/30">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-1">
            <div
              className={`p-2 rounded-lg ${typeMeta.accent}`}
            >
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-100 line-clamp-2">
                {resource.name}
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                {resource.type.replace(/_/g, ' ')}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowQR(!showQR)}
            className="p-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-300 hover:text-blue-200 hover:bg-blue-500/30 hover:border-blue-500/50 transition-all"
            title="View QR Code"
          >
            <QrCode className="w-5 h-5" />
          </button>
        </div>

        {/* Status Badge */}
        <div className="flex gap-2 mt-3">
          <span
            className={`text-xs font-semibold px-3 py-1 rounded-full border ${statusStyles(
              resource.status
            )}`}
          >
            {resource.status === 'ACTIVE' ? '✓ ACTIVE' : '⚠ OUT OF SERVICE'}
          </span>
        </div>
      </div>

      {/* QR Code Section (Expandable) */}
      {showQR && (
        <div className="px-6 py-4 bg-gray-900/50 border-b border-gray-700/30 flex flex-col items-center gap-2">
          <p className="text-xs text-gray-400">Resource ID & Details</p>
          <div className="bg-white p-3 rounded-lg">
            <QRCode
              value={JSON.stringify({
                id: resource.id,
                name: resource.name,
                type: resource.type,
                location: resource.location,
              })}
              size={150}
              level="H"
              includeMargin={true}
            />
          </div>
          <p className="text-xs text-gray-500 text-center">Scan to view details</p>
        </div>
      )}

      {/* Description */}
      <div className="px-6 py-3 border-b border-gray-700/30 flex-grow">
        <p className="text-sm text-gray-300 line-clamp-2">
          {resource.description}
        </p>
      </div>

      {/* Metadata Grid */}
      <div className="px-6 py-4 space-y-3 border-b border-gray-700/30">
        {/* Capacity */}
        <div className="flex items-center gap-3">
          <Users className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <span className="text-sm text-gray-300">
            <span className="font-semibold text-cyan-100">{resource.capacity}</span>{' '}
            <span className="text-gray-400">capacity</span>
          </span>
        </div>

        {/* Location */}
        <div className="flex items-center gap-3">
          <MapPin className="w-4 h-4 text-purple-400 flex-shrink-0" />
          <span className="text-sm text-gray-300">
            {resource.location}
          </span>
        </div>

        {/* Type Info */}
        <div className="flex items-center gap-3">
          <Type className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span className="text-sm text-gray-300">
            {resource.type.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      {/* Action Buttons - Only for ADMIN */}
      {isAdmin && (
        <div className="px-6 py-4 bg-gray-900/30 border-t border-gray-700/30 flex gap-2">
          {/* View Map Button */}
          <button
            onClick={() => onViewMap(resource)}
            className="flex-1 px-3 py-2 bg-gradient-to-r from-emerald-600/20 to-teal-600/20 border border-emerald-500/30 rounded-lg text-emerald-300 hover:text-emerald-200 hover:border-emerald-500/60 hover:bg-gradient-to-r hover:from-emerald-600/40 hover:to-teal-600/40 transition-all text-sm font-medium flex items-center justify-center gap-2"
          >
            <MapPin className="w-4 h-4" />
            <span className="hidden sm:inline">View Map</span>
            <span className="sm:hidden">Map</span>
          </button>

          {/* Edit Button */}
          <button
            onClick={() => onEdit(resource)}
            className="flex-1 px-3 py-2 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-lg text-blue-300 hover:text-blue-200 hover:border-blue-500/60 hover:bg-gradient-to-r hover:from-blue-600/40 hover:to-cyan-600/40 transition-all text-sm font-medium flex items-center justify-center gap-2"
          >
            <Edit className="w-4 h-4" />
            <span className="hidden sm:inline">Edit</span>
            <span className="sm:hidden">✎</span>
          </button>

          {/* Delete Button */}
          <button
            onClick={handleDelete}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all border ${
              showDeleteConfirm
                ? 'bg-rose-600 border-rose-500 text-rose-50 hover:bg-rose-700'
                : 'bg-gradient-to-r from-rose-600/20 to-red-600/20 border-rose-500/30 text-rose-300 hover:text-rose-200 hover:border-rose-500/60 hover:bg-gradient-to-r hover:from-rose-600/40 hover:to-red-600/40'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">
              {showDeleteConfirm ? 'Confirm?' : 'Delete'}
            </span>
            <span className="sm:hidden">🗑</span>
          </button>
        </div>
      )}

      {/* Non-Admin View Message */}
      {!isAdmin && (
        <div className="px-6 py-3 bg-gray-900/30 border-t border-gray-700/30">
          <p className="text-xs text-gray-400 italic">
            Admin access required for edit/delete operations
          </p>
        </div>
      )}
    </div>
  );
};

export default ResourceCard;
