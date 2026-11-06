import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import { MyReservationsPage } from './pages/MyReservationsPage';
import { StaffDashboard } from './pages/StaffDashboard';
import { RoomManagementPage } from './pages/RoomManagementPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

const ProtectedStaffRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="text-center py-20 text-gray-500">Loading...</div>;
  if (!user || user.role !== 'Staff') return <Navigate to="/login" replace />;
  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-slate-50 flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Guest & Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/my-reservations" element={<MyReservationsPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected Staff Routes */}
              <Route
                path="/staff/dashboard"
                element={
                  <ProtectedStaffRoute>
                    <StaffDashboard />
                  </ProtectedStaffRoute>
                }
              />
              <Route
                path="/staff/rooms"
                element={
                  <ProtectedStaffRoute>
                    <RoomManagementPage />
                  </ProtectedStaffRoute>
                }
              />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;