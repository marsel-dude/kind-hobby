import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  User, Edit2, Save, MapPin, Calendar, Mail, 
  Briefcase, Facebook, Instagram, Shield, AlertCircle,
  Users, Star, Heart
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../hooks/useAuth';
import { useAvatar } from '../contexts/AvatarContext';
import { hobbyCategories } from './ProfileSetup';
import AvatarSelector from '../components/AvatarSelector';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { useProfile } from '../hooks/useProfile';
import { CompletenessIndicator } from '../components/profile/CompletenessIndicator';

const profileSchema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters'),
  bio: z.string().max(300, 'Bio must be less than 300 characters'),
  hobbies: z.array(z.string()).min(1, 'Please select at least one hobby'),
  skills: z.array(z.string()).min(1, 'Please add at least one skill'),
  teachingInterest: z.boolean(),
  volunteerInterest: z.boolean(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const { updateAvatar } = useAvatar();
  const [focusedSection, setFocusedSection] = useState<string | null>(null);

  const {
    profile,
    loading,
    error,
    isSaving,
    saveError,
    updateProfile
  } = useProfile(user?.id || '');

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      hobbies: [],
      skills: [],
      teachingInterest: false,
      volunteerInterest: false,
    },
  });

  // Initialize form with profile data
  useEffect(() => {
    if (!profile || isEditing) return;

    setValue('displayName', profile.display_name || '');
    setValue('bio', profile.bio || '');
    setValue('hobbies', profile.hobbies || []);
    setValue('skills', profile.skills || []);
    setValue('teachingInterest', profile.teaching_interest || false);
    setValue('volunteerInterest', profile.volunteer_interest || false);
    setSelectedAvatar(profile.avatar_url || '');
    updateAvatar(profile.avatar_url || '');
  }, [profile, setValue, updateAvatar, isEditing]);

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return;

    const updateData = {
      display_name: data.displayName,
      bio: data.bio,
      hobbies: data.hobbies,
      skills: data.skills,
      teaching_interest: data.teachingInterest,
      volunteer_interest: data.volunteerInterest,
      avatar_url: selectedAvatar,
    };

    const success = await updateProfile(updateData);
    if (success) {
      setIsEditing(false);
    }
  };

  const handleSectionClick = useCallback((section: string) => {
    setFocusedSection(section);
    setIsEditing(true);
    
    const element = document.getElementById(section.toLowerCase().replace(/\s+/g, '-'));
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  if (!user) {
    navigate('/login');
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <ErrorMessage message={error || saveError} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex justify-between items-start mb-8">
              <div className="flex items-center space-x-4">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center overflow-hidden">
                  {selectedAvatar ? (
                    <img
                      src={selectedAvatar}
                      alt="Selected avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-primary" />
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{profile?.display_name}</h1>
                  <p className="text-gray-600">Level {profile?.level}</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="btn-secondary flex items-center space-x-2"
              >
                {isEditing ? (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                ) : (
                  <>
                    <Edit2 className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </>
                )}
              </button>
            </div>

            {isEditing ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <div id="basic-info">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Avatar
                    </label>
                    <AvatarSelector
                      selectedAvatar={selectedAvatar}
                      onSelect={setSelectedAvatar}
                    />
                  </div>

                  <div>
                    <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
                      Display Name
                    </label>
                    <input
                      {...register('displayName')}
                      type="text"
                      id="displayName"
                      className="input"
                    />
                    {errors.displayName && (
                      <p className="text-red-500 text-sm mt-1">{errors.displayName.message}</p>
                    )}
                  </div>

                  <div id="bio">
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                      Bio
                    </label>
                    <textarea
                      {...register('bio')}
                      id="bio"
                      rows={4}
                      className="input"
                    />
                    {errors.bio && (
                      <p className="text-red-500 text-sm mt-1">{errors.bio.message}</p>
                    )}
                  </div>

                  <div id="hobbies-skills">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hobbies
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {hobbyCategories.map(({ id, label, icon: Icon }) => (
                        <label
                          key={id}
                          className="flex items-center space-x-3 p-3 rounded-lg border cursor-pointer hover:bg-gray-50"
                        >
                          <input
                            type="checkbox"
                            value={id}
                            {...register('hobbies')}
                            className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                          />
                          <div className="flex items-center space-x-2">
                            <Icon className="w-5 h-5 text-gray-500" />
                            <span>{label}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                    {errors.hobbies && (
                      <p className="text-red-500 text-sm mt-1">{errors.hobbies.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Interests
                    </label>
                    <div className="space-y-3">
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          {...register('teachingInterest')}
                          className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                        />
                        <span className="text-sm text-gray-700">
                          I'm interested in teaching or mentoring others
                        </span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          {...register('volunteerInterest')}
                          className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                        />
                        <span className="text-sm text-gray-700">
                          I want to participate in charity events
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column - Basic Info */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">About</h3>
                    <p className="text-gray-600">{profile?.bio || 'No bio provided'}</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Hobbies</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile?.hobbies?.map(hobby => {
                        const category = hobbyCategories.find(cat => cat.id === hobby);
                        return category ? (
                          <span
                            key={hobby}
                            className="inline-flex items-center space-x-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                          >
                            <category.icon className="w-4 h-4" />
                            <span>{category.label}</span>
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile?.skills?.map(skill => (
                        <span
                          key={skill}
                          className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column - Interests & Activity */}
                <div className="space-y-6">
                  {/* Interests Section */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-medium mb-4 flex items-center space-x-2">
                      <Heart className="w-5 h-5 text-gray-500" />
                      <span>Interests & Preferences</span>
                    </h3>
                    <div className="space-y-4">
                      {/* Teaching Interest */}
                      {profile?.teaching_interest && (
                        <div className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm">
                          <div className="p-2 bg-primary/10 rounded-full">
                            <Briefcase className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium">Teaching & Mentoring</h4>
                            <p className="text-sm text-gray-600">
                              Interested in sharing knowledge and skills with others
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Volunteer Interest */}
                      {profile?.volunteer_interest && (
                        <div className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm">
                          <div className="p-2 bg-primary/10 rounded-full">
                            <Heart className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium">Charity & Volunteering</h4>
                            <p className="text-sm text-gray-600">
                              Interested in participating in community events and charitable activities
                            </p>
                          </div>
                        </div>
                      )}

                      {/* No Interests Message */}
                      {!profile?.teaching_interest && !profile?.volunteer_interest && (
                        <div className="text-center py-6 text-gray-500">
                          <Heart className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                          <p>No interests selected yet</p>
                          {!isEditing && (
                            <button
                              onClick={() => setIsEditing(true)}
                              className="text-primary hover:text-primary/80 text-sm mt-2"
                            >
                              Add your interests
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-2 border-b border-gray-200">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-primary" />
                          <span className="text-sm">Joined Photography Group</span>
                        </div>
                        <span className="text-xs text-gray-500">2 days ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          <CompletenessIndicator 
            profileData={profile || {}} 
            onSectionClick={handleSectionClick}
          />

          {/* Stats Card */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="font-semibold mb-4">Profile Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-primary" />
                  <span>Groups Joined</span>
                </div>
                <span className="font-medium">{profile?.hobby_groups?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-primary" />
                  <span>Skills Shared</span>
                </div>
                <span className="font-medium">{profile?.skills?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Heart className="w-4 h-4 text-primary" />
                  <span>Impact Score</span>
                </div>
                <span className="font-medium">0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}