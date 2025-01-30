import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Calendar, Settings, 
  Flag, BarChart2, LogOut, Shield 
} from 'lucide-react';
import { useAdmin } from '../../hooks/useAdmin';

const menuItems = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/users', label: 'Users', icon: Users },
  { path: '/admin/events', label: 'Events', icon: Calendar },
  { path: '/admin/reports', label: 'Reports', icon: Flag },
  { path: '/admin/analytics', label: 'Analytics', icon: BarChart2 },
  { path: '/admin/settings', label: 'Settings', icon: Settings },
];

export function AdminSidebar() {
  const location = useLocation();
  const { logout } = useAdmin();

  return (
    <div className="w-64 bg-white shadow-md h-screen fixed left-0 top-0">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8">
          <Shield className="w-8 h-8 text-primary" />
          <span className="text-xl font-bold">Admin Panel</span>
        </div>

        <nav className="space-y-2">
          {menuItems.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
                ${location.pathname === path 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6">
        <button
          onClick={logout}
          className="flex items-center space-x-3 text-gray-600 hover:text-red-500 transition-colors w-full"
        >
          <LogOut className="w-5 h-5" />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );
}