import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { useProfileCompleteness } from '../../hooks/useProfileCompleteness';

interface CompletenessIndicatorProps {
  profileData: any;
  onSectionClick?: (section: string) => void;
}

export function CompletenessIndicator({ profileData, onSectionClick }: CompletenessIndicatorProps) {
  const completeness = useProfileCompleteness(profileData);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Profile Completeness</h3>
        <span className="text-2xl font-bold text-primary">
          {completeness.total}%
        </span>
      </div>

      <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden mb-6">
        <div 
          className="absolute left-0 top-0 h-full bg-primary transition-all duration-500"
          style={{ width: `${completeness.total}%` }}
        />
      </div>

      <div className="space-y-3">
        {completeness.details.map(({ name, complete, score }) => (
          <button
            key={name}
            onClick={() => onSectionClick?.(name)}
            className="w-full flex items-center justify-between p-2 rounded hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-2">
              {complete ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-yellow-500" />
              )}
              <span className={complete ? 'text-gray-600' : 'text-gray-900'}>
                {name}
              </span>
            </div>
            <span className="text-sm text-gray-500">
              {score}/{completeness.details.find(d => d.name === name)?.score}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}