import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { Heart, Palette, Music, Book, Code, Camera, Scissors, ChevronLeft, ChevronRight, Plus, X, Users } from 'lucide-react';
import { toast } from 'sonner';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

const hobbyCategories = [
  { id: 'arts', label: 'Arts & Crafts', icon: Palette, examples: 'Painting, Drawing, Pottery' },
  { id: 'handcraft', label: 'Handcrafts', icon: Scissors, examples: 'Knitting, Sewing, Woodworking' },
  { id: 'music', label: 'Music', icon: Music, examples: 'Playing Instruments, Singing' },
  { id: 'photography', label: 'Photography', icon: Camera, examples: 'Digital, Film, Editing' },
  { id: 'writing', label: 'Writing', icon: Book, examples: 'Creative Writing, Poetry' },
  { id: 'technology', label: 'Technology', icon: Code, examples: 'Programming, Digital Art' },
];

const profileSchema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters'),
  bio: z.string().max(300, 'Bio must be less than 300 characters'),
  hobbies: z.array(z.string()).min(1, 'Please select at least one hobby'),
  skills: z.array(z.string()).min(1, 'Please add at least one skill'),
  teachingInterest: z.boolean(),
  volunteerInterest: z.boolean(),
  hobbyGroups: z.array(z.string()),
});

type ProfileFormData = z.infer<typeof profileSchema>;

function ProfileSetup() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [newSkill, setNewSkill] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const checkProfile = async () => {
      try {
        setIsLoading(true);
        const { data: existingProfile, error } = await supabase
          .from('users')
          .select('display_name, bio, hobbies')
          .eq('id', user.id)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        // Only redirect if profile is complete
        if (existingProfile?.display_name && existingProfile?.bio && existingProfile?.hobbies?.length > 0) {
          navigate('/profile-success');
        }
      } catch (err) {
        console.error('Error checking profile:', err);
        toast.error('Failed to check profile status');
      } finally {
        setIsLoading(false);
      }
    };

    checkProfile();
  }, [user, navigate]);

  const { register, handleSubmit, watch, setValue, formState: { errors, isValid } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      hobbies: [],
      skills: [],
      teachingInterest: false,
      volunteerInterest: false,
      hobbyGroups: [],
    },
    mode: 'onChange',
  });

  const selectedHobbies = watch('hobbies');
  const skills = watch('skills');
  const bio = watch('bio');
  const hobbyGroups = watch('hobbyGroups');

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setValue('skills', [...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setValue('skills', skills.filter(skill => skill !== skillToRemove));
  };

  const toggleHobby = (hobby: string) => {
    const currentHobbies = selectedHobbies || [];
    if (currentHobbies.includes(hobby)) {
      setValue('hobbies', currentHobbies.filter(h => h !== hobby));
      // Also remove from hobby groups if hobby is deselected
      setValue('hobbyGroups', hobbyGroups.filter(g => g !== hobby));
    } else {
      setValue('hobbies', [...currentHobbies, hobby]);
    }
  };

  const toggleHobbyGroup = (hobby: string) => {
    const currentGroups = hobbyGroups || [];
    if (currentGroups.includes(hobby)) {
      setValue('hobbyGroups', currentGroups.filter(h => h !== hobby));
    } else {
      setValue('hobbyGroups', [...currentGroups, hobby]);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) {
      toast.error('Please sign in to continue');
      navigate('/login');
      return;
    }

    try {
      setIsSubmitting(true);

      const { error } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email!,
          display_name: data.displayName,
          bio: data.bio,
          hobbies: data.hobbies,
          skills: data.skills,
          teaching_interest: data.teachingInterest,
          volunteer_interest: data.volunteerInterest,
          hobby_groups: data.hobbyGroups,
          completed_challenges: 0,
          level: 1,
          badges: [],
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });

      if (error) throw error;

      toast.success('Profile created successfully!');
      navigate('/profile-success');
    } catch (err: any) {
      console.error('Error saving profile:', err);
      toast.error(err.message || 'Failed to save profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12">
      <div className="card max-w-2xl w-full">
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8 px-4">
          {[1, 2, 3, 4].map((stepNumber) => (
            <div
              key={stepNumber}
              className="flex items-center relative"
              style={{ width: stepNumber < 4 ? '33%' : 'auto' }}
            >
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all
                  ${stepNumber === step ? 'border-primary bg-primary/10 text-primary font-medium' : 
                    stepNumber < step ? 'border-primary bg-primary text-white' : 
                    'border-gray-300 text-gray-400'}`}
              >
                {stepNumber < step ? '✓' : stepNumber}
              </div>
              {stepNumber < 4 && (
                <div 
                  className={`absolute left-[calc(100%-1rem)] right-0 h-0.5 transition-all duration-300
                    ${stepNumber < step ? 'bg-primary' : 'bg-gray-300'}`}
                  style={{ width: 'calc(100% - 2.5rem)', left: '2.5rem' }}
                />
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {step === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">Tell us about yourself</h2>
                <p className="text-gray-600">Let's start with the basics</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
                    What should we call you?
                  </label>
                  <input
                    {...register('displayName')}
                    type="text"
                    id="displayName"
                    className="input"
                    placeholder="Your name"
                  />
                  {errors.displayName && (
                    <p className="text-red-500 text-sm mt-1">{errors.displayName.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                    Brief bio
                  </label>
                  <textarea
                    {...register('bio')}
                    id="bio"
                    rows={4}
                    className="input"
                    placeholder="Tell us a bit about yourself..."
                  />
                  <div className="flex justify-between mt-1">
                    <p className={`text-sm ${errors.bio ? 'text-red-500' : 'text-gray-500'}`}>
                      {errors.bio?.message || `${bio?.length || 0}/300 characters`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">Select your hobbies</h2>
                <p className="text-gray-600">Choose the areas where you'd like to contribute</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {hobbyCategories.map(({ id, label, icon: Icon, examples }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => toggleHobby(id)}
                    className={`p-4 rounded-lg border-2 text-left transition-all hover:shadow-md
                      ${selectedHobbies?.includes(id) 
                        ? 'border-primary bg-primary/10' 
                        : 'border-gray-200 hover:border-primary/50'}`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className={`w-6 h-6 ${selectedHobbies?.includes(id) ? 'text-primary' : 'text-gray-500'}`} />
                      <div>
                        <h3 className="font-medium">{label}</h3>
                        <p className="text-sm text-gray-500">{examples}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              {errors.hobbies && (
                <p className="text-red-500 text-sm text-center">{errors.hobbies.message}</p>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">Join Hobby Groups</h2>
                <p className="text-gray-600">Connect with others who share your interests</p>
              </div>

              <div className="space-y-4">
                {selectedHobbies.map(hobby => {
                  const category = hobbyCategories.find(cat => cat.id === hobby);
                  if (!category) return null;

                  return (
                    <button
                      key={hobby}
                      type="button"
                      onClick={() => toggleHobbyGroup(hobby)}
                      className={`w-full p-4 rounded-lg border-2 text-left transition-all hover:shadow-md
                        ${hobbyGroups?.includes(hobby)
                          ? 'border-primary bg-primary/10'
                          : 'border-gray-200 hover:border-primary/50'}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <category.icon className={`w-6 h-6 ${hobbyGroups?.includes(hobby) ? 'text-primary' : 'text-gray-500'}`} />
                          <div>
                            <h3 className="font-medium">{category.label} Group</h3>
                            <p className="text-sm text-gray-500">Connect with other {category.label.toLowerCase()} enthusiasts</p>
                          </div>
                        </div>
                        <Users className={`w-5 h-5 ${hobbyGroups?.includes(hobby) ? 'text-primary' : 'text-gray-400'}`} />
                      </div>
                    </button>
                  );
                })}
                {selectedHobbies.length === 0 && (
                  <p className="text-center text-gray-500">
                    Please select some hobbies first to see available groups
                  </p>
                )}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">Skills & Interests</h2>
                <p className="text-gray-600">Tell us what you can share with others</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    What specific skills can you share?
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      className="input flex-1"
                      placeholder="e.g., Watercolor painting, Knitting scarves"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    />
                    <button
                      type="button"
                      onClick={addSkill}
                      className="btn-secondary flex items-center space-x-1"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add</span>
                    </button>
                  </div>
                  
                  <div className="mt-3 flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary/10 text-primary"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="ml-2 hover:text-primary/70"
                          aria-label={`Remove ${skill}`}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                  {errors.skills && (
                    <p className="text-red-500 text-sm mt-1">{errors.skills.message}</p>
                  )}
                </div>

                <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-700">Additional Interests</h3>
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="teachingInterest"
                      {...register('teachingInterest')}
                      className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                    />
                    <label htmlFor="teachingInterest" className="text-sm text-gray-700">
                      I'm interested in teaching or mentoring others
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="volunteerInterest"
                      {...register('volunteerInterest')}
                      className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                    />
                    <label htmlFor="volunteerInterest" className="text-sm text-gray-700">
                      I want to participate in charity challenges
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-6 border-t">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="btn-secondary flex items-center space-x-2"
                disabled={isSubmitting}
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <div></div>
            )}
            
            {step < 4 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="btn-primary flex items-center space-x-2"
                disabled={isSubmitting}
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                className="btn-primary flex items-center space-x-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin">⋯</span>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Heart className="w-4 h-4" />
                    <span>Complete Profile</span>
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProfileSetup;
export { hobbyCategories };