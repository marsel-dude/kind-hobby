import React, { createContext, useContext, useState } from 'react';

interface AvatarContextType {
  avatarUrl: string | null;
  updateAvatar: (url: string | null) => void;
}

const AvatarContext = createContext<AvatarContextType | null>(null);

export function AvatarProvider({ children }: { children: React.ReactNode }) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const updateAvatar = (url: string | null) => {
    setAvatarUrl(url);
  };

  return (
    <AvatarContext.Provider value={{ avatarUrl, updateAvatar }}>
      {children}
    </AvatarContext.Provider>
  );
}

export function useAvatar() {
  const context = useContext(AvatarContext);
  if (!context) {
    throw new Error('useAvatar must be used within an AvatarProvider');
  }
  return context;
}