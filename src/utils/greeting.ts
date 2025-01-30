import { useEffect, useState } from 'react';

export function useGreeting(name?: string) {
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();
      let timeGreeting = '';
      
      if (hour >= 5 && hour < 12) {
        timeGreeting = 'Good morning';
      } else if (hour >= 12 && hour < 17) {
        timeGreeting = 'Good afternoon';
      } else if (hour >= 17 && hour < 22) {
        timeGreeting = 'Good evening';
      } else {
        timeGreeting = 'Good night';
      }

      setGreeting(name ? `${timeGreeting}, ${name}` : timeGreeting);
    };

    updateGreeting();
    const interval = setInterval(updateGreeting, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [name]);

  return greeting;
}