import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Settings } from './pages/Settings';
import { Playlists } from './pages/Playlists';
import { LiveTV } from './pages/LiveTV';
import { EPGGuide } from './pages/EPGGuide';
import { Favorites } from './pages/Favorites';
import { History } from './pages/History';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminUsers } from './pages/admin/AdminUsers';

const queryClient = new QueryClient();

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Dashboard />} />
            <Route path="/settings" element={<Settings />} />
            {/* Fallback routes for upcoming modules */}
            <Route path="/live" element={<LiveTV />} />
            <Route path="/epg" element={<EPGGuide />} />
            <Route path="/playlists" element={<Playlists />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/history" element={<History />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};
