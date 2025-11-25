import React from 'react';
import { Navigate } from 'react-router-dom';

function AdminRoute({ children }) {
  let token = null;
  let role = '';
  try {
    token = localStorage.getItem('auth_token');
  } catch (_) {}
  try {
    const u = JSON.parse(localStorage.getItem('auth_user') || '{}');
    role = String(u?.role || '').trim();
  } catch (_) { role = ''; }

  const isAdmin = role.toLowerCase() === 'admin';

  if (!token) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
}

export default AdminRoute;