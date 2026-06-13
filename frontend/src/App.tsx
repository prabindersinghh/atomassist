import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { useAuthStore } from './stores/auth.js';
import { ProtectedRoute } from './components/ProtectedRoute.js';
import { Login } from './pages/Login.js';
import { Signup } from './pages/Signup.js';
import { AgentDashboard } from './pages/AgentDashboard.js';
import { SessionRoom } from './pages/SessionRoom.js';
import { AdminDashboard } from './pages/AdminDashboard.js';
import { JoinSession } from './pages/JoinSession.js';
import './index.css';

const queryClient = new QueryClient();

const App: React.FC = () => {
  const { restore } = useAuthStore();

  useEffect(() => {
    restore();
  }, [restore]);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/join" element={<JoinSession />} />

          {/* Protected routes */}
          <Route
            path="/agent/dashboard"
            element={
              <ProtectedRoute requiredRoles={['agent']}>
                <AgentDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/agent/session/:sessionId"
            element={
              <ProtectedRoute>
                <SessionRoom />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requiredRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Redirect to dashboard */}
          <Route path="/" element={<Navigate to="/agent/dashboard" />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
};

export default App;
