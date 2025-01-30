import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ArrowRight } from 'lucide-react';

export default function ProfileSuccess() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12">
      <div className="card max-w-xl w-full text-center space-y-8">
        <div className="space-y-4">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <Heart className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Welcome to KindHobby!</h1>
          <p className="text-gray-600 max-w-md mx-auto">
            Your profile has been created successfully. You're now ready to start your journey of sharing kindness through your hobbies.
          </p>
        </div>

        <div className="space-y-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">Join Challenges</h3>
              <p className="text-sm text-gray-600">Participate in community challenges and make a difference</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">Connect</h3>
              <p className="text-sm text-gray-600">Meet others who share your interests and passion</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">Share Skills</h3>
              <p className="text-sm text-gray-600">Help others learn and grow in their hobbies</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate('/groups')}
          className="btn-primary inline-flex items-center space-x-2 px-8"
        >
          <span>View Your Groups</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}