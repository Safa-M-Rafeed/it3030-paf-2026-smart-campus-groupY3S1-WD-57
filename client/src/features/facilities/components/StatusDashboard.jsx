import React from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

const StatusDashboard = ({ stats, isLoading = false }) => {
  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 animate-pulse">
        <div className="bg-gradient-to-br from-emerald-900/40 to-teal-900/40 backdrop-blur-sm rounded-xl p-6 border border-emerald-500/20 h-32"></div>
        <div className="bg-gradient-to-br from-blue-900/40 to-cyan-900/40 backdrop-blur-sm rounded-xl p-6 border border-blue-500/20 h-32"></div>
        <div className="bg-gradient-to-br from-violet-900/40 to-purple-900/40 backdrop-blur-sm rounded-xl p-6 border border-violet-500/20 h-32"></div>
      </div>
    );
  }

  const statusData = [
    { name: 'Active', value: stats.active, fill: '#10b981' },
    { name: 'Out of Service', value: stats.outOfService, fill: '#f43f5e' },
  ];

  const typeData = Object.entries(stats.typeBreakdown || {}).map(
    ([type, count]) => ({
      name: type.replace(/_/g, ' '),
      value: count,
    })
  );

  const pieColors = ['#3b82f6', '#8b5cf6', '#ec4899'];

  return (
    <div className="mb-8 space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Resources */}
        <div className="bg-gradient-to-br from-blue-900/40 to-cyan-900/40 backdrop-blur-sm rounded-xl p-6 border border-blue-500/20">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-blue-200 text-sm font-medium mb-2">
                Total Resources
              </p>
              <p className="text-4xl font-bold text-blue-100">
                {stats.total}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-400 opacity-50" />
          </div>
        </div>

        {/* Active Resources */}
        <div className="bg-gradient-to-br from-emerald-900/40 to-teal-900/40 backdrop-blur-sm rounded-xl p-6 border border-emerald-500/20">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-emerald-200 text-sm font-medium mb-2">
                Active
              </p>
              <p className="text-4xl font-bold text-emerald-100">
                {stats.active}
              </p>
              <p className="text-emerald-300 text-xs mt-2">
                {stats.utilizationRate}% utilization
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-emerald-400 opacity-50" />
          </div>
        </div>

        {/* Out of Service */}
        <div className="bg-gradient-to-br from-rose-900/40 to-red-900/40 backdrop-blur-sm rounded-xl p-6 border border-rose-500/20">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-rose-200 text-sm font-medium mb-2">
                Out of Service
              </p>
              <p className="text-4xl font-bold text-rose-100">
                {stats.outOfService}
              </p>
              <p className="text-rose-300 text-xs mt-2">Needs attention</p>
            </div>
            <AlertCircle className="w-8 h-8 text-rose-400 opacity-50" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution - Pie Chart */}
        <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm rounded-xl p-6 border border-gray-700/40">
          <h3 className="text-lg font-semibold text-gray-100 mb-4">
            Status Distribution
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value} items`} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Resource Type Distribution - Bar Chart */}
        <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm rounded-xl p-6 border border-gray-700/40">
          <h3 className="text-lg font-semibold text-gray-100 mb-4">
            Resource Types
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={typeData}>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(30, 30, 30, 0.95)',
                  border: '1px solid rgba(100, 100, 100, 0.2)',
                }}
                formatter={(value) => `${value} items`}
              />
              <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default StatusDashboard;
