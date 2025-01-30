import React from 'react';
import { Users, Search } from 'lucide-react';
import { hobbyCategories } from './ProfileSetup';

export default function Groups() {
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Hobby Groups</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Connect with fellow enthusiasts, share your experiences, and learn from others in your favorite hobby groups.
        </p>
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder="Search groups..."
          className="input pl-10"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hobbyCategories.map(({ id, label, icon: Icon, examples }) => (
          <div key={id} className="card hover:shadow-lg transition-shadow">
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{label} Group</h3>
                <p className="text-sm text-gray-500">124 members</p>
              </div>
            </div>
            
            <p className="text-gray-600 mb-6">{examples}</p>
            
            <div className="flex items-center justify-between">
              <div className="flex -space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-medium"
                  >
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              <button className="btn-secondary flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>Join Group</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}