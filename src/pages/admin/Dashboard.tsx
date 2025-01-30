import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Calendar, Flag, BarChart2, 
  Settings, Shield, AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

interface AdminStats {
  totalUsers: number;
  activeEvents: number;
  pendingReports: number;
  totalDonations: number;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeEvents: 0,
    pendingReports: 0,
    totalDonations: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const init = async () => {
      try {
        if (!user) {
          navigate('/admin/login');
          return;
        }

        const { data: userData, error: userError } = await api.users.get(user.id);
        
        if (userError) throw userError;
        
        if (!userData?.is_admin) {
          setError('Unauthorized access');
          navigate('/');
          return;
        }

        await fetchAdminStats();
      } catch (err) {
        console.error('Admin access check failed:', err);
        setError('Failed to verify admin access');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [user, navigate]);

  const fetchAdminStats = async () => {
    try {
      // Mock data for now - replace with actual API calls
      setStats({
        totalUsers: 150,
        activeEvents: 12,
        pendingReports: 5,
        totalDonations: 25000
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      setError('Failed to load dashboard data');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Access Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Users}
            label="Total Users"
            value={stats.totalUsers}
            color="primary"
          />
          <StatCard
            icon={Calendar}
            label="Active Events"
            value={stats.activeEvents}
            color="secondary"
          />
          <StatCard
            icon={Flag}
            label="Pending Reports"
            value={stats.pendingReports}
            color="red"
          />
          <StatCard
            icon={BarChart2}
            label="Total Donations"
            value={`$${stats.totalDonations.toLocaleString()}`}
            color="green"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
              <Shield className="w-5 h-5 text-primary" />
              <span>Quick Actions</span>
            </h2>
            <div className="space-y-4">
              <button className="btn-secondary w-full text-left flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span>Manage Users</span>
              </button>
              <button className="btn-secondary w-full text-left flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Review Events</span>
              </button>
              <button className="btn-secondary w-full text-left flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Handle Reports</span>
              </button>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-4">
              <p className="text-gray-500 text-center py-8">
                Activity feed will appear here
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: number | string;
  color: string;
}

function StatCard({ icon: Icon, label, value, color }: StatCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm">
      <div className="flex items-center space-x-4">
        <div className={`p-3 bg-${color}/10 rounded-lg`}>
          <Icon className={`w-6 h-6 text-${color}`} />
        </div>
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
}