import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart2, TrendingUp, Users, Calendar,
  DollarSign, Heart, Target, AlertTriangle
} from 'lucide-react';
import { useAdmin } from '../../hooks/useAdmin';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

interface AnalyticsData {
  userGrowth: {
    total: number;
    growth: number;
    data: number[];
  };
  eventMetrics: {
    total: number;
    completed: number;
    upcoming: number;
    data: number[];
  };
  impactMetrics: {
    peopleHelped: number;
    volunteersEngaged: number;
    causesSupported: number;
    data: number[];
  };
  donationMetrics: {
    total: number;
    average: number;
    monthlyGrowth: number;
    data: number[];
  };
}

export default function Analytics() {
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState<AnalyticsData>({
    userGrowth: { total: 0, growth: 0, data: [] },
    eventMetrics: { total: 0, completed: 0, upcoming: 0, data: [] },
    impactMetrics: { peopleHelped: 0, volunteersEngaged: 0, causesSupported: 0, data: [] },
    donationMetrics: { total: 0, average: 0, monthlyGrowth: 0, data: [] },
  });

  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin/login');
      return;
    }
    fetchAnalytics();
  }, [isAdmin, navigate]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API calls
      setData({
        userGrowth: {
          total: 1250,
          growth: 15,
          data: [65, 75, 85, 95, 110, 120, 140, 160, 180, 200, 220, 250],
        },
        eventMetrics: {
          total: 48,
          completed: 32,
          upcoming: 16,
          data: [4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26],
        },
        impactMetrics: {
          peopleHelped: 750,
          volunteersEngaged: 280,
          causesSupported: 45,
          data: [20, 35, 45, 60, 75, 90, 110, 130, 150, 170, 190, 210],
        },
        donationMetrics: {
          total: 25000,
          average: 85,
          monthlyGrowth: 12,
          data: [1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000, 6500],
        },
      });
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
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
          <h2 className="text-xl font-bold text-gray-900 mb-2">Analytics Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold mb-8">Analytics Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="User Growth"
            value={data.userGrowth.total}
            change={data.userGrowth.growth}
            icon={Users}
            color="primary"
          />
          <MetricCard
            title="Total Events"
            value={data.eventMetrics.total}
            subtitle={`${data.eventMetrics.upcoming} upcoming`}
            icon={Calendar}
            color="secondary"
          />
          <MetricCard
            title="People Helped"
            value={data.impactMetrics.peopleHelped}
            subtitle={`${data.impactMetrics.causesSupported} causes`}
            icon={Heart}
            color="red"
          />
          <MetricCard
            title="Total Donations"
            value={`$${data.donationMetrics.total.toLocaleString()}`}
            change={data.donationMetrics.monthlyGrowth}
            icon={DollarSign}
            color="green"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Growth Trends</h2>
              <select className="input py-1">
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="365">Last year</option>
              </select>
            </div>
            <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg">
              <TrendingUp className="w-12 h-12 text-gray-300" />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Impact Metrics</h2>
              <select className="input py-1">
                <option value="all">All Categories</option>
                <option value="events">Events</option>
                <option value="donations">Donations</option>
              </select>
            </div>
            <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg">
              <Target className="w-12 h-12 text-gray-300" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: number | string;
  change?: number;
  subtitle?: string;
  icon: React.ElementType;
  color: string;
}

function MetricCard({ title, value, change, subtitle, icon: Icon, color }: MetricCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 bg-${color}/10 rounded-lg`}>
          <Icon className={`w-6 h-6 text-${color}`} />
        </div>
        {change !== undefined && (
          <span className={`text-sm font-medium ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {change >= 0 ? '+' : ''}{change}%
          </span>
        )}
      </div>
      <h3 className="text-sm text-gray-500 mb-1">{title}</h3>
      <p className="text-2xl font-bold">{value}</p>
      {subtitle && (
        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
      )}
    </div>
  );
}