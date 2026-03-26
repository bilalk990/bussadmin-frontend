import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import SplashScreen from './components/auth/SplashScreen';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import FleetManagement from './pages/FleetManagement';
import DriversManagement from './pages/DriversManagement';
import RoutesManagement from './pages/RoutesManagement';
import ScheduleManagement from './pages/ScheduleManagement';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import CompaniesManagement from './pages/CompaniesManagement';
import CompanyAnalytics from './pages/CompanyAnalytics';
import StaffManagement from './pages/StaffManagement';
import SupportTickets from './pages/SupportTickets';
import BookingsManagement from './pages/BookingsManagement';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import AppInitializer from './components/auth/AppInitializer';
import { authService } from './services/authService';
import { SearchProvider } from './context/SearchContext';

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = authService.getToken();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// Super admin only — redirects company-panel routes back to dashboard
const SuperAdminGuard = ({ children }: { children: React.ReactNode }) => {
  const role = authService.getTokenPayload()?.role;
  if (role === 'super_admin') return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

// Layout component for authenticated routes
const AuthenticatedLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden bg-gradient-to-br from-dark-blue to-dark">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header />
          <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
};

const App = () => {
  return (
    <SearchProvider>
      <Router>
        <AppInitializer />
        <AnimatePresence mode="wait">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={
              authService.isAuthenticated() ? <Navigate to="/dashboard" replace /> : <SplashScreen />
            } />
            <Route path="/login" element={<Login />} />

            {/* Authenticated routes */}
            <Route path="/dashboard" element={
              <AuthenticatedLayout>
                <Dashboard />
              </AuthenticatedLayout>
            } />
            <Route path="/fleet" element={
              <AuthenticatedLayout>
                <SuperAdminGuard><FleetManagement /></SuperAdminGuard>
              </AuthenticatedLayout>
            } />
            <Route path="/drivers" element={
              <AuthenticatedLayout>
                <SuperAdminGuard><DriversManagement /></SuperAdminGuard>
              </AuthenticatedLayout>
            } />
            <Route path="/routes" element={
              <AuthenticatedLayout>
                <SuperAdminGuard><RoutesManagement /></SuperAdminGuard>
              </AuthenticatedLayout>
            } />
            <Route path="/schedule" element={
              <AuthenticatedLayout>
                <SuperAdminGuard><ScheduleManagement /></SuperAdminGuard>
              </AuthenticatedLayout>
            } />
            <Route path="/bookings" element={
              <AuthenticatedLayout>
                <SuperAdminGuard><BookingsManagement /></SuperAdminGuard>
              </AuthenticatedLayout>
            } />
            <Route path="/staff" element={
              <AuthenticatedLayout>
                <SuperAdminGuard><StaffManagement /></SuperAdminGuard>
              </AuthenticatedLayout>
            } />
            <Route path="/support" element={
              <AuthenticatedLayout>
                <SupportTickets />
              </AuthenticatedLayout>
            } />
            <Route path="/companies" element={
              <AuthenticatedLayout>
                <CompaniesManagement />
              </AuthenticatedLayout>
            } />
            <Route path="/companies/:companyId/analytics" element={
              <AuthenticatedLayout>
                <CompanyAnalytics />
              </AuthenticatedLayout>
            } />
            <Route path="/settings" element={
              <AuthenticatedLayout>
                <Settings />
              </AuthenticatedLayout>
            } />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </AnimatePresence>
      </Router>
    </SearchProvider>
  );
};

export default App;