import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Calendar, MapPin, Clock, Users, Plus, AlertCircle, 
  Filter, ChevronDown, DollarSign, Target 
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { hobbyCategories } from './ProfileSetup';
import { DonationForm } from '../components/events/DonationForm';
import { DonationList } from '../components/events/DonationList';
import { FundraisingProgress } from '../components/events/FundraisingProgress';

const eventSchema = z.object({
  type: z.enum(['spark', 'hangout']),
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  date: z.string().min(1, 'Date is required'),
  location: z.string().min(5, 'Location is required'),
  maxParticipants: z.number().min(1, 'Must allow at least 1 participant'),
  minParticipants: z.number().min(1, 'Must require at least 1 participant'),
  hobbyCategory: z.string().min(1, 'Please select a hobby category'),
  experienceLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  cause: z.string().optional(),
  priceRange: z.object({
    min: z.number(),
    max: z.number(),
  }).optional(),
  requirements: z.array(z.string()),
  safetyGuidelines: z.string().optional(),
  mediaPolicy: z.string().optional(),
});

type EventFormData = z.infer<typeof eventSchema>;

interface Event {
  id: string;
  type: 'spark' | 'hangout';
  title: string;
  description: string;
  date: string;
  location: string;
  max_participants: number;
  min_participants: number;
  current_participants: number;
  status: 'draft' | 'pending' | 'active' | 'completed' | 'cancelled';
  hobby_category: string;
  experience_level?: string;
  cause?: string;
  price_range?: { min: number; max: number };
  requirements: string[];
  safety_guidelines?: string;
  media_policy?: string;
  participants: string[];
  fundraising_goal?: number;
  funds_raised?: number;
  donor_count?: number;
}

export default function Events() {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [filter, setFilter] = useState<'all' | 'spark' | 'hangout'>('all');
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [donations, setDonations] = useState<any[]>([]);

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      requirements: [],
    },
  });

  const eventType = watch('type');

  useEffect(() => {
    fetchEvents();
  }, [filter]);

  useEffect(() => {
    if (selectedEvent) {
      fetchDonations(selectedEvent);
    }
  }, [selectedEvent]);

  const fetchEvents = async () => {
    try {
      let query = supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });

      if (filter !== 'all') {
        query = query.eq('type', filter);
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

  const fetchDonations = async (eventId: string) => {
    try {
      const { data, error } = await api.events.getDonations(eventId);
      if (error) throw error;
      setDonations(data || []);
    } catch (err) {
      console.error('Error fetching donations:', err);
      toast.error('Failed to load donations');
    }
  };

  const onSubmit = async (data: EventFormData) => {
    if (!user) return;

    try {
      const { error: submitError } = await supabase
        .from('events')
        .insert({
          ...data,
          created_by: user.id,
          status: 'pending',
          current_participants: 0,
          participants: [],
        });

      if (submitError) throw submitError;

      setShowForm(false);
      reset();
      fetchEvents();
      toast.success('Event created successfully!');
    } catch (err) {
      console.error('Error creating event:', err);
      toast.error('Failed to create event');
    }
  };

  const joinEvent = async (eventId: string) => {
    if (!user) {
      toast.error('Please sign in to join events');
      return;
    }

    try {
      const event = events.find(e => e.id === eventId);
      if (!event) return;

      if (event.current_participants >= event.max_participants) {
        toast.error('Event is full');
        return;
      }

      const newParticipants = [...event.participants, user.id];

      const { error: updateError } = await supabase
        .from('events')
        .update({
          participants: newParticipants,
          current_participants: event.current_participants + 1,
        })
        .eq('id', eventId);

      if (updateError) throw updateError;

      fetchEvents();
      toast.success('Successfully joined the event!');
    } catch (err) {
      console.error('Error joining event:', err);
      toast.error('Failed to join event');
    }
  };

  const renderEventCard = (event: Event) => {
    const category = hobbyCategories.find(cat => cat.id === event.hobby_category);
    const isParticipating = user && event.participants.includes(user.id);
    const isFull = event.current_participants >= event.max_participants;

    return (
      <div key={event.id} className="card hover:shadow-lg transition-shadow">
        <div className="mb-4">
          <span className={`inline-block px-2 py-1 rounded text-xs font-medium
            ${event.type === 'spark' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'}`}>
            {event.type === 'spark' ? 'Spark Event' : 'Hangout Event'}
          </span>
          {category && (
            <span className="ml-2 inline-flex items-center space-x-1 text-xs text-gray-500">
              <category.icon className="w-3 h-3" />
              <span>{category.label}</span>
            </span>
          )}
        </div>

        <h3 className="text-lg font-semibold mb-2">{event.title}</h3>
        <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>

        {event.type === 'spark' && event.fundraising_goal && (
          <div className="mb-4">
            <FundraisingProgress
              goal={event.fundraising_goal}
              raised={event.funds_raised || 0}
              donors={event.donor_count || 0}
            />
          </div>
        )}

        <div className="space-y-2 text-sm text-gray-600 mb-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>{new Date(event.date).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>{new Date(event.date).toLocaleTimeString()}</span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4" />
            <span>{event.location}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>
              {event.current_participants}/{event.max_participants} participants
            </span>
          </div>
        </div>

        <div className="space-y-4">
          {event.type === 'spark' && (
            <button
              onClick={() => setSelectedEvent(selectedEvent === event.id ? null : event.id)}
              className="btn-secondary w-full flex items-center justify-center space-x-2"
            >
              <DollarSign className="w-4 h-4" />
              <span>Support This Cause</span>
            </button>
          )}

          <button
            onClick={() => joinEvent(event.id)}
            disabled={isParticipating || isFull}
            className={`w-full btn-primary ${isParticipating ? 'bg-gray-400' : ''}`}
          >
            {isParticipating ? 'Already Joined' : isFull ? 'Event Full' : 'Join Event'}
          </button>
        </div>

        {selectedEvent === event.id && (
          <div className="mt-6 pt-6 border-t">
            <h4 className="text-lg font-semibold mb-4">Support This Event</h4>
            <DonationForm 
              eventId={event.id} 
              onSuccess={() => fetchDonations(event.id)} 
            />
            <div className="mt-6">
              <h4 className="text-lg font-semibold mb-4">Recent Donations</h4>
              <DonationList donations={donations} />
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading events...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Community Events</h1>
            <p className="text-gray-600">Join local events and activities or create your own</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Event</span>
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {showForm && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mb-8 p-6 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Type
                </label>
                <select {...register('type')} className="input">
                  <option value="">Select type</option>
                  <option value="spark">Spark (Create for Cause)</option>
                  <option value="hangout">Hangout (Social)</option>
                </select>
                {errors.type && (
                  <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hobby Category
                </label>
                <select {...register('hobbyCategory')} className="input">
                  <option value="">Select category</option>
                  {hobbyCategories.map(({ id, label }) => (
                    <option key={id} value={id}>{label}</option>
                  ))}
                </select>
                {errors.hobbyCategory && (
                  <p className="text-red-500 text-sm mt-1">{errors.hobbyCategory.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Title
                </label>
                <input
                  {...register('title')}
                  type="text"
                  className="input"
                  placeholder="Give your event a catchy title"
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  {...register('description')}
                  rows={4}
                  className="input"
                  placeholder="Describe what participants can expect"
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date & Time
                </label>
                <input
                  {...register('date')}
                  type="datetime-local"
                  className="input"
                />
                {errors.date && (
                  <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  {...register('location')}
                  type="text"
                  className="input"
                  placeholder="Physical address or online platform"
                />
                {errors.location && (
                  <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum Participants
                </label>
                <input
                  {...register('maxParticipants', { valueAsNumber: true })}
                  type="number"
                  className="input"
                  min="1"
                />
                {errors.maxParticipants && (
                  <p className="text-red-500 text-sm mt-1">{errors.maxParticipants.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Required
                </label>
                <input
                  {...register('minParticipants', { valueAsNumber: true })}
                  type="number"
                  className="input"
                  min="1"
                />
                {errors.minParticipants && (
                  <p className="text-red-500 text-sm mt-1">{errors.minParticipants.message}</p>
                )}
              </div>

              {eventType === 'hangout' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Experience Level
                  </label>
                  <select {...register('experienceLevel')} className="input">
                    <option value="">Select level</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                  {errors.experienceLevel && (
                    <p className="text-red-500 text-sm mt-1">{errors.experienceLevel.message}</p>
                  )}
                </div>
              )}

              {eventType === 'spark' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cause/Charity
                    </label>
                    <input
                      {...register('cause')}
                      type="text"
                      className="input"
                      placeholder="Beneficiary organization"
                    />
                    {errors.cause && (
                      <p className="text-red-500 text-sm mt-1">{errors.cause.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price Range
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        {...register('priceRange.min', { valueAsNumber: true })}
                        type="number"
                        className="input"
                        placeholder="Min"
                        min="0"
                      />
                      <input
                        {...register('priceRange.max', { valueAsNumber: true })}
                        type="number"
                        className="input"
                        placeholder="Max"
                        min="0"
                      />
                    </div>
                    {errors.priceRange && (
                      <p className="text-red-500 text-sm mt-1">Please enter valid price range</p>
                    )}
                  </div>
                </>
              )}

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Safety Guidelines
                </label>
                <textarea
                  {...register('safetyGuidelines')}
                  className="input"
                  rows={3}
                  placeholder="Any safety measures or precautions"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Photos/Media Policy
                </label>
                <textarea
                  {...register('mediaPolicy')}
                  className="input"
                  rows={2}
                  placeholder="Guidelines for taking and sharing photos/videos"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Create Event
              </button>
            </div>
          </form>
        )}

        <div className="flex items-center space-x-4 mb-6">
          <Filter className="w-5 h-5 text-gray-500" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'spark' | 'hangout')}
            className="input py-1"
          >
            <option value="all">All Events</option>
            <option value="spark">Spark Events</option>
            <option value="hangout">Hangout Events</option>
          </select>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map(renderEventCard)}
        </div>
      </div>
    </div>
  );
}