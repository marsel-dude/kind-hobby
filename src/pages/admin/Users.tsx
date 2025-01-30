import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, AlertTriangle, Search, Filter, 
  MoreVertical, Download, Trash, CheckCircle 
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { useAdmin } from '../../hooks/useAdmin';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

interface User {
  id: string;
  email: string;
  username: string;
  display_name: string;
  is_admin: boolean;
  is_suspended: boolean;
  created_at: string;
}

export default function Users() {
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'admin' | 'suspended'>('all');

  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin/login');
      return;
    }
    fetchUsers();
  }, [isAdmin, navigate, filter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter === 'admin') {
        query = query.eq('is_admin', true);
      } else if (filter === 'suspended') {
        query = query.eq('is_suspended', true);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setUsers(data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (action: string, userId: string) => {
    try {
      const toastId = toast.loading('Processing...');
      
      if (action === 'promote') {
        const { error } = await supabase.rpc('promote_to_admin', {
          target_user_id: userId
        });
        if (error) throw error;
        toast.success('User promoted to admin', { id: toastId });
      } else if (action === 'suspend') {
        const { error } = await supabase
          .from('users')
          .update({ is_suspended: true })
          .eq('id', userId);
        if (error) throw error;
        toast.success('User suspended', { id: toastId });
      } else if (action === 'unsuspend') {
        const { error } = await supabase
          .from('users')
          .update({ is_suspended: false })
          .eq('id', userId);
        if (error) throw error;
        toast.success('User unsuspended', { id: toastId });
      }

      fetchUsers();
    } catch (err) {
      console.error('Action error:', err);
      toast.error('Failed to process action');
    }
  };

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase()) ||
    user.display_name.toLowerCase().includes(search.toLowerCase())
  );

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
            <h1 className="text-3xl font-bold">Users</h1>
            <p className="text-gray-600">Manage user accounts and permissions</p>
          </div>
          <button
            onClick={() => {/* Export users */}}
            className="btn-secondary flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export Users</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search users..."
                className="input pl-10"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'admin' | 'suspended')}
              className="input py-1"
            >
              <option value="all">All Users</option>
              <option value="admin">Admins</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-4 px-4 font-medium text-gray-600">User</th>
                <th className="text-left py-4 px-4 font-medium text-gray-600">Email</th>
                <th className="text-left py-4 px-4 font-medium text-gray-600">Status</th>
                <th className="text-left py-4 px-4 font-medium text-gray-600">Joined</th>
                <th className="text-left py-4 px-4 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-gray-100">
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        {user.is_admin ? (
                          <Shield className="w-5 h-5 text-primary" />
                        ) : (
                          <span className="text-primary font-medium">
                            {user.display_name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{user.display_name}</p>
                        <p className="text-sm text-gray-500">@{user.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-gray-600">{user.email}</span>
                  </td>
                  <td className="py-4 px-4">
                    {user.is_suspended ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Suspended
                      </span>
                    ) : user.is_admin ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-gray-600">
                      {new Date(user.created_at).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <UserActions user={user} onAction={handleUserAction} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

interface UserActionsProps {
  user: User;
  onAction: (action: string, userId: string) => void;
}

function UserActions({ user, onAction }: UserActionsProps) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="text-gray-400 hover:text-gray-600"
      >
        <MoreVertical className="w-5 h-5" />
      </button>

      {showMenu && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50">
          {!user.is_admin && (
            <button
              onClick={() => {
                onAction('promote', user.id);
                setShowMenu(false);
              }}
              className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
            >
              <Shield className="w-4 h-4" />
              <span>Make Admin</span>
            </button>
          )}
          {user.is_suspended ? (
            <button
              onClick={() => {
                onAction('unsuspend', user.id);
                setShowMenu(false);
              }}
              className="flex items-center space-x-2 px-4 py-2 text-sm text-green-600 hover:bg-gray-100 w-full text-left"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Unsuspend Account</span>
            </button>
          ) : (
            <button
              onClick={() => {
                onAction('suspend', user.id);
                setShowMenu(false);
              }}
              className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Suspend Account</span>
            </button>
          )}
          <button
            onClick={() => {
              /* Delete user functionality */
              setShowMenu(false);
            }}
            className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
          >
            <Trash className="w-4 h-4" />
            <span>Delete Account</span>
          </button>
        </div>
      )}
    </div>
  );
}