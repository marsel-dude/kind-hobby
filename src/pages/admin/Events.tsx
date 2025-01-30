import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, Search, Filter, MoreVertical, 
  Download, CheckCircle, XCircle, Star, AlertTriangle 
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { useAdmin } from '../../hooks/useAdmin';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { hobbyCategories } from '../../pages/ProfileSetup';

interface Event {
  id: string;
  type: 'spark' | 'hangout';
  title: string;
  description: string;
  date: string;
  location: string;
  status: 'pending' | 'active' | 'rejected' | 'featured';
  hobby_category: string;
  created_by: string;
  created_at: string;
  current_participants: number;
  max_participants: number;
}

export default function Events() {
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'active' | 'featured'>('all');

  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin/login');
      return;
    }
    fetchEvents();
  }, [isAdmin, navigate, filter]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setEvents(data || []);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleEventAction = async (action: string, eventId: string) => {
    try {
      const toastId = toast.loading('Processing...');
      
      const { error } = await supabase
        .from('events')
        .update({ 
          status: action === 'approve' ? 'active' : 
                 action === 'reject' ? 'rejected' : 
                 action === 'feature' ? 'featured' : 
                 'pending'
        })
        .eq('id', eventId);

      if (error) throw error;
      
      toast.success(`Event ${action}d successfully`, { id: toastId });
      fetchEvents();
    } catch (err) {
      console.error('Action error:', err);
      toast.error('Failed to process action');
    }
  };

  const filteredEvents = events.filter(event => 
    event.title.toLowerCase().includes(search.toLowerCase()) ||
    event.description.toLowerCase().includes(search.toLowerCase())
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
            <h1 className="text-3xl font-bold">Events</h1>
            <p className="text-gray-600">Manage community events and activities</p>
          </div>
          <button
            onClick={() => {/* Export events */}}
            className="btn-secondary flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export Events</span>
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
                placeholder="Search events..."
                className="input pl-10"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'pending' | 'active' | 'featured')}
              className="input py-1"
            >
              <option value="all">All Events</option>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="featured">Featured</option>
            </select>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => (
            <div key={event.id} className="card">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium
                    ${event.type === 'spark' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'}`}>
                    {event.type === 'spark' ? 'Spark Event' : 'Hangout Event'}
                  </span>
                  <h3 className="text-lg font-semibold mt-2">{event.title}</h3>
                </div>
                <EventActions event={event} onAction={handleEventAction} />
              </div>

              <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(event.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                    ${event.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      event.status === 'active' ? 'bg-green-100 text-green-800' :
                      event.status === 'featured' ? 'bg-primary/10 text-primary' :
                      'bg-red-100 text-red-800'}`}>
                    {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface EventActionsProps {
  event: Event;
  onAction: (action: string, eventId: string) => void;
}

function EventActions({ event, onAction }: EventActionsProps) {
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
          {event.status === 'pending' && (
            <>
              <button
                onClick={() => {
                  onAction('approve', event.id);
                  setShowMenu(false);
                }}
                className="flex items-center space-x-2 px-4 py-2 text-sm text-green-600 hover:bg-gray-100 w-full text-left"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Approve Event</span>
              </button>
              <button
                onClick={() => {
                  onAction('reject', event.id);
                  setShowMenu(false);
                }}
                className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject Event</span>
              </button>
            </>
          )}
          {event.status === 'active' && (
            <button
              onClick={() => {
                onAction('feature', event.id);
                setShowMenu(false);
              }}
              className="flex items-center space-x-2 px-4 py-2 text-sm text-primary hover:bg-gray-100 w-full text-left"
            >
              <Star className="w-4 h-4" />
              <span>Feature Event</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}