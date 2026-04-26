import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

const BookingsPage = () => <div className="p-8"><h1 className="text-xl font-semibold">Bookings</h1><p className="mt-2 text-gray-600">Booking workflow integration point (Module B).</p></div>;
const TicketsPage = () => <div className="p-8"><h1 className="text-xl font-semibold">Tickets</h1><p className="mt-2 text-gray-600">Incident and maintenance workflow integration point (Module C).</p></div>;

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
            
            <Route path="/tickets" element={
              <ProtectedRoute>
                <TicketsPage />
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