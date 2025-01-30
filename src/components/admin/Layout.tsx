import React from 'react';
import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import { AdminSidebar } from './Sidebar';
import { useAdmin } from '../../hooks/useAdmin';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { toast } from 'sonner';

export function AdminLayout() {
  const { isAdmin, loading } = useAdmin();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!loading && !isAdmin) {
      toast.error('Access denied. Please log in as an admin.');
      navigate('/admin/login');
    }
  }, [isAdmin, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <div className="pl-64">
        <main className="container mx-auto px-8 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}