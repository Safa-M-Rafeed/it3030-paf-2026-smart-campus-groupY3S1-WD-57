import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import AuthCallbackPage from './pages/AuthCallbackPage';


// Placeholder Pages (Create these files in src/pages/ if they don't exist)
const HomePage = () => <div className="p-8"><h1>Welcome to Smart Campus</h1></div>;
const FacilitiesPage = () => <div className="p-8"><h1>Campus Facilities</h1></div>;
const BookingsPage = () => <div className="p-8"><h1>My Bookings</h1></div>;
const TicketsPage = () => <div className="p-8"><h1>Support Tickets</h1></div>;
const AdminUsersPage = () => <div className="p-8"><h1>Admin: User Management</h1></div>;

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
                <HomePage />
              </ProtectedRoute>
            } />
            
            <Route path="/facilities" element={
              <ProtectedRoute>
                <FacilitiesPage />
              </ProtectedRoute>
            } />
            
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

            {/* Catch-all: Redirect unknown paths to Home */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;