import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Trophy, Plus, ChevronUp, Filter, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { hobbyCategories } from './ProfileSetup';

const challengeSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  hobby: z.string().min(1, 'Please select a hobby category'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
});

type ChallengeFormData = z.infer<typeof challengeSchema>;

interface Challenge {
  id: string;
  title: string;
  description: string;
  hobby: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  status: 'proposed' | 'active' | 'completed';
  created_by: string;
  created_at: string;
  votes: number;
  voted_users: string[];
}

export default function Challenges() {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [filter, setFilter] = useState<'all' | 'proposed' | 'active'>('all');
  const [selectedHobby, setSelectedHobby] = useState<string>('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ChallengeFormData>({
    resolver: zodResolver(challengeSchema),
  });

  useEffect(() => {
    fetchChallenges();
  }, [filter, selectedHobby]);

  const fetchChallenges = async () => {
    try {
      let query = supabase
        .from('challenges')
        .select('*')
        .order('votes', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      if (selectedHobby) {
        query = query.eq('hobby', selectedHobby);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setChallenges(data || []);
    } catch (err) {
      console.error('Error fetching challenges:', err);
      setError('Failed to load challenges');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ChallengeFormData) => {
    if (!user) return;

    try {
      const { error: submitError } = await supabase
        .from('challenges')
        .insert({
          ...data,
          created_by: user.id,
          status: 'proposed',
          points: getDifficultyPoints(data.difficulty),
          votes: 0,
          voted_users: [],
        });

      if (submitError) throw submitError;

      setShowForm(false);
      reset();
      fetchChallenges();
    } catch (err) {
      console.error('Error submitting challenge:', err);
      setError('Failed to submit challenge');
    }
  };

  const handleVote = async (challengeId: string) => {
    if (!user) return;

    try {
      const challenge = challenges.find(c => c.id === challengeId);
      if (!challenge) return;

      const hasVoted = challenge.voted_users.includes(user.id);
      const newVotes = hasVoted ? challenge.votes - 1 : challenge.votes + 1;
      const newVotedUsers = hasVoted
        ? challenge.voted_users.filter(id => id !== user.id)
        : [...challenge.voted_users, user.id];

      const { error: voteError } = await supabase
        .from('challenges')
        .update({
          votes: newVotes,
          voted_users: newVotedUsers,
        })
        .eq('id', challengeId);

      if (voteError) throw voteError;

      fetchChallenges();
    } catch (err) {
      console.error('Error voting:', err);
      setError('Failed to register vote');
    }
  };

  const getDifficultyPoints = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 10;
      case 'medium': return 20;
      case 'hard': return 30;
      default: return 10;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-500 bg-green-50';
      case 'medium': return 'text-yellow-500 bg-yellow-50';
      case 'hard': return 'text-red-500 bg-red-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading challenges...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Challenges</h1>
            <p className="text-gray-600">Vote for upcoming challenges or propose your own</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Propose Challenge</span>
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {showForm && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mb-8 p-6 bg-gray-50 rounded-lg">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Challenge Title
              </label>
              <input
                {...register('title')}
                type="text"
                id="title"
                className="input"
                placeholder="e.g., Paint a Portrait for a Senior Citizen"
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                {...register('description')}
                id="description"
                rows={4}
                className="input"
                placeholder="Describe the challenge and its impact..."
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="hobby" className="block text-sm font-medium text-gray-700 mb-1">
                  Hobby Category
                </label>
                <select {...register('hobby')} id="hobby" className="input">
                  <option value="">Select a category</option>
                  {hobbyCategories.map(({ id, label }) => (
                    <option key={id} value={id}>{label}</option>
                  ))}
                </select>
                {errors.hobby && (
                  <p className="text-red-500 text-sm mt-1">{errors.hobby.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">
                  Difficulty
                </label>
                <select {...register('difficulty')} id="difficulty" className="input">
                  <option value="">Select difficulty</option>
                  <option value="easy">Easy (10 points)</option>
                  <option value="medium">Medium (20 points)</option>
                  <option value="hard">Hard (30 points)</option>
                </select>
                {errors.difficulty && (
                  <p className="text-red-500 text-sm mt-1">{errors.difficulty.message}</p>
                )}
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
                Submit Challenge
              </button>
            </div>
          </form>
        )}

        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'proposed' | 'active')}
              className="input py-1"
            >
              <option value="all">All Challenges</option>
              <option value="proposed">Proposed</option>
              <option value="active">Active</option>
            </select>
          </div>

          <select
            value={selectedHobby}
            onChange={(e) => setSelectedHobby(e.target.value)}
            className="input py-1"
          >
            <option value="">All Categories</option>
            {hobbyCategories.map(({ id, label }) => (
              <option key={id} value={id}>{label}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {challenges.map((challenge) => {
            const category = hobbyCategories.find(cat => cat.id === challenge.hobby);
            const hasVoted = user && challenge.voted_users.includes(user.id);

            return (
              <div key={challenge.id} className="card">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(challenge.difficulty)}`}>
                      {challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1)}
                    </span>
                    <h3 className="text-lg font-semibold mt-2">{challenge.title}</h3>
                  </div>
                  <button
                    onClick={() => handleVote(challenge.id)}
                    className={`flex flex-col items-center p-2 rounded-lg transition-colors
                      ${hasVoted ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100'}`}
                  >
                    <ChevronUp className="w-5 h-5" />
                    <span className="text-sm font-medium">{challenge.votes}</span>
                  </button>
                </div>

                <p className="text-gray-600 mb-4 line-clamp-3">{challenge.description}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {category?.icon && (
                      <category.icon className="w-5 h-5 text-gray-500" />
                    )}
                    <span className="text-sm text-gray-600">{category?.label}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Trophy className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium">{challenge.points} pts</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}