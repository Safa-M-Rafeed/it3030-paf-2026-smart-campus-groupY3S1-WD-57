import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import RoleHomeRedirect from './routes/RoleHomeRedirect';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import DashboardPage from './pages/DashboardPage';
import AdminUsersPage from './pages/AdminUsersPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import ResourceList from './pages/ResourceList';
import ResourceForm from './pages/ResourceForm';
import ResourceDetail from './pages/ResourceDetail';
import TicketListPage from './pages/TicketListPage';
import TicketDetailPage from './pages/TicketDetailPage';
import TicketFormPage from './pages/TicketFormPage';
import AuditTrailPage from './pages/AuditTrailPage';
import AnalyticsDashboardPage from './pages/AnalyticsDashboardPage';
import SystemHealthStatusBoardPage from './pages/SystemHealthStatusBoardPage';
import MostActiveUsersReportPage from './pages/MostActiveUsersReportPage';
import GoalsPage from './pages/GoalsPage';
import CostManagementPage from './pages/CostManagementPage';

const BookingsPage = () => <div className="p-8"><h1 className="text-xl font-semibold">Bookings</h1><p className="mt-2 text-gray-600">Booking workflow integration point (Module B).</p></div>;

const reportOptions = [
  {
    title: 'Audit Trail',
    desc: 'Review who changed what, when, and from which account across the platform.',
    path: '/reports/audit-trail',
    accent: 'from-slate-900 via-slate-800 to-slate-700',
  },
  {
    title: 'Analytics Dashboard',
    desc: 'Track trends, usage summaries, and operational health indicators for Module F.',
    path: '/reports/analytics-dashboard',
    accent: 'from-emerald-700 via-teal-700 to-cyan-700',
  },
  {
    title: '📄 Report Export',
    desc: 'Generate downloadable report outputs for sharing, review, or archival.',
    path: '/reports/report-export',
    accent: 'from-amber-700 via-orange-700 to-rose-700',
  },
  {
    title: 'System Health Status Board',
    desc: 'View live system health metrics, record counts, and operational risk indicators.',
    path: '/reports/system-health-status-board',
    accent: 'from-indigo-700 via-blue-700 to-cyan-700',
  },
  {
    title: '🎯 Goal & Target Setting',
    desc: 'Set monthly performance targets and track progress with colour-coded status rings.',
    path: '/reports/goals',
    accent: 'from-violet-700 via-purple-700 to-fuchsia-700',
  },
  {
    title: '💰 Cost Management',
    desc: 'Assign campus expenses, calculate totals by date range, and export a cost summary PDF.',
    path: '/reports/cost-management',
    accent: 'from-emerald-800 via-emerald-700 to-teal-600',
  },
];

const ReportsPage = () => (
  <div className="mx-auto max-w-6xl p-8">
    <div className="mb-8">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Module F</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">Reports & Analytics</h1>
      <p className="mt-3 max-w-2xl text-slate-600">
        Choose a reporting tool to inspect platform activity, verify changes, or export records.
      </p>
    </div>

    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      {reportOptions.map((option) => (
        <Link
          key={option.path}
          to={option.path}
          className={`group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg`}
        >
          <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${option.accent}`} />
          <div className="relative flex h-full min-h-[200px] flex-col justify-between">
            <div>
              <div className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-600">
                Option
              </div>
              <h2 className="mt-5 text-2xl font-semibold tracking-tight text-slate-950">{option.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{option.desc}</p>
            </div>
            <div className="mt-6 flex items-center justify-between text-sm font-medium text-slate-900">
              <span>Open section</span>
              <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        {/* Navbar is outside Routes so it shows on every page */}
        <Navbar />
        
        <div className="app-container">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />

            {/* Student Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <RoleHomeRedirect />
              </ProtectedRoute>
            } />

            <Route path="/user/dashboard" element={
              <ProtectedRoute requiredRole="USER">
                <DashboardPage />
              </ProtectedRoute>
            } />

            <Route path="/admin/dashboard" element={
              <ProtectedRoute requiredRole="ADMIN">
                <DashboardPage />
              </ProtectedRoute>
            } />

            <Route path="/technician/dashboard" element={
              <ProtectedRoute requiredRole="TECHNICIAN">
                <DashboardPage />
              </ProtectedRoute>
            } />

            <Route path="/manager/dashboard" element={
              <ProtectedRoute requiredRole="MANAGER">
                <DashboardPage />
              </ProtectedRoute>
            } />
            
            <Route path="/facilities" element={<ResourceList />} />

            <Route path="/facilities/new" element={<ResourceForm />} />

            <Route path="/facilities/:id" element={<ResourceDetail />} />

            <Route path="/facilities/:id/edit" element={<ResourceForm />} />
            
            <Route path="/bookings" element={
              <ProtectedRoute>
                <BookingsPage />
              </ProtectedRoute>
            } />

            <Route path="/reports" element={
              <ProtectedRoute requiredRole="ADMIN">
                <ReportsPage />
              </ProtectedRoute>
            } />

            <Route path="/reports/audit-trail" element={
              <ProtectedRoute requiredRole="ADMIN">
                <AuditTrailPage />
              </ProtectedRoute>
            } />

            <Route path="/reports/analytics-dashboard" element={
              <ProtectedRoute requiredRole="ADMIN">
                <AnalyticsDashboardPage />
              </ProtectedRoute>
            } />

            <Route path="/reports/report-export" element={
              <ProtectedRoute requiredRole="ADMIN">
                <MostActiveUsersReportPage />
              </ProtectedRoute>
            } />

            <Route path="/reports/system-health-status-board" element={
              <ProtectedRoute requiredRole="ADMIN">
                <SystemHealthStatusBoardPage />
              </ProtectedRoute>
            } />

            <Route path="/reports/goals" element={
              <ProtectedRoute requiredRole="ADMIN">
                <GoalsPage />
              </ProtectedRoute>
            } />

            <Route path="/reports/cost-management" element={
              <ProtectedRoute requiredRole="ADMIN">
                <CostManagementPage />
              </ProtectedRoute>
            } />
            
            <Route path="/tickets" element={
              <ProtectedRoute>
                <TicketListPage />
              </ProtectedRoute>
            } />
            <Route path="/tickets/new" element={
              <ProtectedRoute>
                <TicketFormPage />
              </ProtectedRoute>
            } />
            <Route path="/tickets/:id" element={
              <ProtectedRoute>
                <TicketDetailPage />
              </ProtectedRoute>
            } />

            {/* Admin Only Routes */}
            <Route path="/admin/users" element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminUsersPage />
              </ProtectedRoute>
            } />

            <Route path="/unauthorized" element={
              <ProtectedRoute>
                <UnauthorizedPage />
              </ProtectedRoute>
            } />

            {/* Catch-all: Redirect unknown paths to Home */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;