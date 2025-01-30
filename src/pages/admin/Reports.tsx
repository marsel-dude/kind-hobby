import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Flag, AlertTriangle, Search, Filter, 
  MoreVertical, CheckCircle, XCircle, MessageCircle 
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { useAdmin } from '../../hooks/useAdmin';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

interface Report {
  id: string;
  type: 'user' | 'event' | 'content';
  status: 'pending' | 'resolved' | 'dismissed';
  reason: string;
  details: string;
  reported_id: string;
  reported_by: string;
  created_at: string;
  priority: 'low' | 'medium' | 'high';
}

export default function Reports() {
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'resolved'>('all');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin/login');
      return;
    }
    fetchReports();
  }, [isAdmin, navigate, filter]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API calls
      const mockReports: Report[] = [
        {
          id: '1',
          type: 'user',
          status: 'pending',
          reason: 'Inappropriate behavior',
          details: 'User has been sending spam messages',
          reported_id: 'user123',
          reported_by: 'user456',
          created_at: new Date().toISOString(),
          priority: 'high',
        },
        {
          id: '2',
          type: 'event',
          status: 'pending',
          reason: 'Suspicious activity',
          details: 'Event seems to be collecting unauthorized payments',
          reported_id: 'event789',
          reported_by: 'user789',
          created_at: new Date().toISOString(),
          priority: 'medium',
        },
      ];
      setReports(mockReports);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleReportAction = async (action: 'resolve' | 'dismiss', reportId: string) => {
    try {
      const toastId = toast.loading('Processing...');
      
      // Mock API call - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setReports(prev => prev.map(report => {
        if (report.id === reportId) {
          return {
            ...report,
            status: action === 'resolve' ? 'resolved' : 'dismissed'
          };
        }
        return report;
      }));

      toast.success(`Report ${action}d successfully`, { id: toastId });
    } catch (err) {
      console.error('Action error:', err);
      toast.error('Failed to process action');
    }
  };

  const filteredReports = reports.filter(report => {
    if (filter !== 'all' && report.status !== filter) return false;
    return report.reason.toLowerCase().includes(search.toLowerCase()) ||
           report.details.toLowerCase().includes(search.toLowerCase());
  });

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Reports</h1>
            <p className="text-gray-600">Manage user reports and content flags</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search reports..."
                className="input pl-10"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'pending' | 'resolved')}
              className="input py-1"
            >
              <option value="all">All Reports</option>
              <option value="pending">Pending</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className={`p-2 rounded-lg
                    ${report.type === 'user' ? 'bg-red-100' :
                      report.type === 'event' ? 'bg-yellow-100' :
                      'bg-blue-100'}`}
                  >
                    <Flag className={`w-5 h-5
                      ${report.type === 'user' ? 'text-red-500' :
                        report.type === 'event' ? 'text-yellow-500' :
                        'text-blue-500'}`}
                    />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold">{report.reason}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium
                        ${report.priority === 'high' ? 'bg-red-100 text-red-800' :
                          report.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'}`}>
                        {report.priority} priority
                      </span>
                    </div>
                    <p className="text-gray-600 mt-1">{report.details}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span>Reported {new Date(report.created_at).toLocaleDateString()}</span>
                      <span>Type: {report.type}</span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                        ${report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          report.status === 'resolved' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'}`}>
                        {report.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleReportAction('resolve', report.id)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                    title="Resolve"
                  >
                    <CheckCircle className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleReportAction('dismiss', report.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    title="Dismiss"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setSelectedReport(report)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    title="Add Note"
                  >
                    <MessageCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredReports.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Flag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No Reports Found</h3>
              <p className="text-gray-500 mt-2">
                {filter === 'all' 
                  ? 'There are no reports to display'
                  : `No ${filter} reports found`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}