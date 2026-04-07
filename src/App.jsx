import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import AppLayout from './layouts/AppLayout';
import Auth from './pages/Auth';
import Onboarding from './pages/Onboarding';
import Home from './pages/Home';
import Journal from './pages/Journal';
import Insights from './pages/Insights';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <div className="w-10 h-10 rounded-xl bg-accent animate-pulse" />
      </div>
    );
  }
  
  if (!user) return <Navigate to="/auth" replace />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/auth" element={user ? <Navigate to="/home" replace /> : <Auth />} />
      
      <Route path="/onboarding" element={
        <ProtectedRoute><Onboarding /></ProtectedRoute>
      } />
      
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/home" element={<Home />} />
        <Route path="/journal" element={<Journal />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      
      <Route path="*" element={<Navigate to={user ? "/home" : "/auth"} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SettingsProvider>
          <AppRoutes />
        </SettingsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
