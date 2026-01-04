import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';

function AdminContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-white text-xl">Chargement...</div>
      </div>
    );
  }

  return user ? <AdminDashboard /> : <AdminLogin />;
}

export default function AdminApp() {
  return (
    <AuthProvider>
      <AdminContent />
    </AuthProvider>
  );
}
