import React from 'react';
import { Check } from 'lucide-react';
import { toast } from 'sonner';

const AVATAR_OPTIONS = [
  { id: 'avatar1', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=b6e3f4' },
  { id: 'avatar2', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka&backgroundColor=d1d4f9' },
  { id: 'avatar3', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bailey&backgroundColor=c0aede' },
  { id: 'avatar4', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie&backgroundColor=ffdfbf' },
  { id: 'avatar5', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Diana&backgroundColor=ffd5dc' },
  { id: 'avatar6', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Echo&backgroundColor=c1f0c1' },
];

interface AvatarSelectorProps {
  selectedAvatar: string;
  onSelect: (avatarUrl: string) => void;
}

export default function AvatarSelector({ selectedAvatar, onSelect }: AvatarSelectorProps) {
  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Choose your avatar
      </label>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
        {AVATAR_OPTIONS.map(({ id, url }) => (
          <button
            key={id}
            type="button"
            onClick={() => onSelect(url)}
            className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all
              ${selectedAvatar === url 
                ? 'border-primary ring-2 ring-primary ring-opacity-50' 
                : 'border-gray-200 hover:border-primary/50'}`}
          >
            <img
              src={url}
              alt={`Avatar option ${id}`}
              className="w-full h-full object-cover"
            />
            {selectedAvatar === url && (
              <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                <Check className="w-6 h-6 text-primary" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}