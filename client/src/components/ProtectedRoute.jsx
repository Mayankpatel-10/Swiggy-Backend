import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-warm-muted flex flex-col items-center gap-2">
        <div className="w-8 h-8 border-4 border-warm-amber border-t-transparent rounded-full animate-spin" />
        <span>Verifying portal authorization...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect user to their own role-specific portal
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'delivery_partner') return <Navigate to="/delivery/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
}
