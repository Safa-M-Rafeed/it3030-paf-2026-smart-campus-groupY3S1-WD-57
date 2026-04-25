import React from 'react';
import { Link } from 'react-router-dom';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-[calc(100vh-72px)] flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-md w-full bg-white border border-gray-200 rounded-lg p-6 text-center">
        <h1 className="text-xl font-bold text-gray-900">Access Denied</h1>
        <p className="text-gray-600 mt-2">
          You do not have permission to access this page.
        </p>
        <Link
          to="/"
          className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
