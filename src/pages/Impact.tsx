import React from 'react';
import { Heart, Star, TrendingUp } from 'lucide-react';

export default function Impact() {
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Your Impact</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Track how your hobbies and skills are making a difference in the community.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="card text-center">
          <div className="flex justify-center mb-4">
            <Heart className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-2xl font-bold text-primary">0</h3>
          <p className="text-gray-600">Lives Touched</p>
        </div>
        <div className="card text-center">
          <div className="flex justify-center mb-4">
            <Star className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-2xl font-bold text-primary">0</h3>
          <p className="text-gray-600">Skills Shared</p>
        </div>
        <div className="card text-center">
          <div className="flex justify-center mb-4">
            <TrendingUp className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-2xl font-bold text-primary">0</h3>
          <p className="text-gray-600">Community Events</p>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Impact Timeline</h2>
        <div className="space-y-6">
          <div className="flex items-start space-x-4">
            <div className="w-2 h-2 mt-2 rounded-full bg-primary"></div>
            <div className="flex-1 bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-400">Your impact story will appear here...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}