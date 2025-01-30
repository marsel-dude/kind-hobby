import { useMemo } from 'react';

interface ProfileData {
  display_name?: string;
  bio?: string;
  hobbies?: string[];
  skills?: string[];
  avatar_url?: string;
  social?: Record<string, string>;
}

interface ProfileSection {
  name: string;
  weight: number;
  isComplete: (data: ProfileData) => boolean;
}

export function useProfileCompleteness(profileData: ProfileData) {
  const sections: ProfileSection[] = [
    {
      name: 'Basic Info',
      weight: 30,
      isComplete: (data) => !!data.display_name && !!data.avatar_url
    },
    {
      name: 'Bio',
      weight: 20,
      isComplete: (data) => !!data.bio && data.bio.length >= 50
    },
    {
      name: 'Hobbies & Skills',
      weight: 25,
      isComplete: (data) => 
        !!data.hobbies?.length && 
        !!data.skills?.length && 
        data.hobbies.length >= 2 && 
        data.skills.length >= 2
    },
    {
      name: 'Social Links',
      weight: 25,
      isComplete: (data) => 
        !!data.social && 
        Object.keys(data.social).length >= 2
    }
  ];

  const completeness = useMemo(() => {
    let total = 0;
    const details = sections.map(section => {
      const complete = section.isComplete(profileData);
      const score = complete ? section.weight : 0;
      total += score;
      return {
        name: section.name,
        complete,
        score
      };
    });

    return {
      total,
      details,
      isComplete: total === 100
    };
  }, [profileData]);

  return completeness;
}