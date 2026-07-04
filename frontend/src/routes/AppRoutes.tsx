import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import ProtectedRoute from '../components/layout/ProtectedRoute';

// Auth
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';

// Student
import StudentDashboard from '../pages/student/StudentDashboard';
import RaiseIssue from '../pages/student/RaiseIssue';
import MyIssues from '../pages/student/MyIssues';
import IssueDetail from '../pages/student/IssueDetail';

// Staff
import StaffDashboard from '../pages/staff/StaffDashboard';
import AssignedIssues from '../pages/staff/AssignedIssues';

// Admin
import AdminDashboard from '../pages/admin/AdminDashboard';
import AllIssues from '../pages/admin/AllIssues';
import Analytics from '../pages/admin/Analytics';
import ManageLocations from '../pages/admin/ManageLocations';
import StaffManagement from '../pages/admin/StaffManagement';

function RootRedirect() {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === 'STUDENT') return <Navigate to="/student" replace />;
  if (user?.role === 'STAFF') return <Navigate to="/staff" replace />;
  return <Navigate to="/admin" replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Student */}
      <Route path="/student" element={
        <ProtectedRoute allowedRoles={['STUDENT']}><StudentDashboard /></ProtectedRoute>
      } />
      <Route path="/raise-issue" element={
        <ProtectedRoute allowedRoles={['STUDENT']}><RaiseIssue /></ProtectedRoute>
      } />
      <Route path="/my-issues" element={
        <ProtectedRoute allowedRoles={['STUDENT']}><MyIssues /></ProtectedRoute>
      } />
      <Route path="/issue/:id" element={
        <ProtectedRoute allowedRoles={['STUDENT', 'STAFF', 'ADMIN']}><IssueDetail /></ProtectedRoute>
      } />

      {/* Staff */}
      <Route path="/staff" element={
        <ProtectedRoute allowedRoles={['STAFF']}><StaffDashboard /></ProtectedRoute>
      } />
      <Route path="/assigned" element={
        <ProtectedRoute allowedRoles={['STAFF']}><AssignedIssues /></ProtectedRoute>
      } />

      {/* Admin */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>
      } />
      <Route path="/all-issues" element={
        <ProtectedRoute allowedRoles={['ADMIN']}><AllIssues /></ProtectedRoute>
      } />
      <Route path="/analytics" element={
        <ProtectedRoute allowedRoles={['ADMIN']}><Analytics /></ProtectedRoute>
      } />
      <Route path="/admin/locations" element={
        <ProtectedRoute allowedRoles={['ADMIN']}><ManageLocations /></ProtectedRoute>
      } />
      <Route path="/admin/staff" element={
        <ProtectedRoute allowedRoles={['ADMIN']}><StaffManagement /></ProtectedRoute>
      } />

      {/* 404 */}
      <Route path="*" element={
        <div className="min-h-screen flex items-center justify-center text-center">
          <div>
            <p className="text-5xl mb-4">🔍</p>
            <h1 className="text-xl font-bold text-gray-800">Page not found</h1>
            <a href="/" className="text-indigo-600 text-sm mt-2 block">Go home</a>
          </div>
        </div>
      } />
    </Routes>
  );
}
