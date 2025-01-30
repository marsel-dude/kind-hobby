import React from 'react';
import { DollarSign, Users, Target } from 'lucide-react';

interface FundraisingProgressProps {
  goal: number;
  raised: number;
  donors: number;
}

export function FundraisingProgress({ goal, raised, donors }: FundraisingProgressProps) {
  const progress = Math.min((raised / goal) * 100, 100);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <DollarSign className="w-5 h-5 text-primary" />
          <span className="font-medium">${raised.toLocaleString()}</span>
          <span className="text-gray-500">raised of ${goal.toLocaleString()}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Users className="w-5 h-5 text-gray-500" />
          <span>{donors} donors</span>
        </div>
      </div>

      <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="absolute left-0 top-0 h-full bg-primary transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>{progress.toFixed(1)}% Complete</span>
        <div className="flex items-center space-x-1">
          <Target className="w-4 h-4" />
          <span>Goal: ${goal.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}