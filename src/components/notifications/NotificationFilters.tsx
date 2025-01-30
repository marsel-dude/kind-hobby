import React from 'react';
import { Filter, Search, Calendar } from 'lucide-react';

interface NotificationFiltersProps {
  filters: {
    search: string;
    dateRange: {
      start: string;
      end: string;
    };
    priority: string[];
    category: string[];
    status: 'all' | 'read' | 'unread';
  };
  onChange: (filters: any) => void;
}

export function NotificationFilters({ filters, onChange }: NotificationFiltersProps) {
  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          placeholder="Search notifications..."
          className="input pl-10"
        />
      </div>

      {/* Date Range */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            From
          </label>
          <input
            type="date"
            value={filters.dateRange.start}
            onChange={(e) => onChange({
              ...filters,
              dateRange: { ...filters.dateRange, start: e.target.value }
            })}
            className="input"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            To
          </label>
          <input
            type="date"
            value={filters.dateRange.end}
            onChange={(e) => onChange({
              ...filters,
              dateRange: { ...filters.dateRange, end: e.target.value }
            })}
            className="input"
          />
        </div>
      </div>

      {/* Priority & Category */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Priority
          </label>
          <select
            multiple
            value={filters.priority}
            onChange={(e) => onChange({
              ...filters,
              priority: Array.from(e.target.selectedOptions, option => option.value)
            })}
            className="input h-24"
          >
            <option value="high">High</option>
            <option value="normal">Normal</option>
            <option value="low">Low</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            multiple
            value={filters.category}
            onChange={(e) => onChange({
              ...filters,
              category: Array.from(e.target.selectedOptions, option => option.value)
            })}
            className="input h-24"
          >
            <option value="system">System</option>
            <option value="user">User</option>
            <option value="security">Security</option>
            <option value="updates">Updates</option>
          </select>
        </div>
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Status
        </label>
        <select
          value={filters.status}
          onChange={(e) => onChange({
            ...filters,
            status: e.target.value as 'all' | 'read' | 'unread'
          })}
          className="input"
        >
          <option value="all">All</option>
          <option value="read">Read</option>
          <option value="unread">Unread</option>
        </select>
      </div>
    </div>
  );
}