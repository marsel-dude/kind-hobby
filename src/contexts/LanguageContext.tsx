import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'mk' | 'en' | 'al';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

// Translations for all supported languages
const translations: Record<Language, Record<string, string>> = {
  mk: {
    // Navigation
    'nav.challenges': 'Предизвици',
    'nav.groups': 'Групи',
    'nav.events': 'Настани',
    'nav.profile': 'Профил',
    'nav.logout': 'Одјави се',
    'nav.login': 'Најави се',
    'nav.signup': 'Регистрирај се',
    
    // Home
    'home.title': 'Каде хобијата се спојуваат со добрина',
    'home.search.placeholder': 'Пребарувај луѓе, хобија, настани...',
    'home.search.all': 'Сите',
    'home.search.users': 'Корисници',
    'home.search.hobbies': 'Хобија',
    'home.search.events': 'Настани',
    'home.search.groups': 'Групи',
    'home.search.challenges': 'Предизвици',

    // Features
    'features.challenges': 'Предизвици за добрина',
    'features.challenges.desc': 'Заврши предизвици и направи позитивно влијание',
    'features.groups': 'Хоби групи',
    'features.groups.desc': 'Поврзи се со истомисленици',
    'features.impact': 'Следи влијание',
    'features.impact.desc': 'Види ги твоите придонеси во заедницата',
    'features.events': 'Настани во заедницата',
    'features.events.desc': 'Приклучи се на локални активности',

    // Footer
    'footer.tagline': 'Поврзување на хобија со добрина',
    'footer.rights': '© 2024 KindHobby. Сите права се задржани.',
    'footer.language': 'Јазик',
  },
  en: {
    // Navigation
    'nav.challenges': 'Challenges',
    'nav.groups': 'Groups',
    'nav.events': 'Events',
    'nav.profile': 'Profile',
    'nav.logout': 'Log Out',
    'nav.login': 'Login',
    'nav.signup': 'Sign Up',
    
    // Home
    'home.title': 'Where Hobbies Meet Kindness',
    'home.search.placeholder': 'Search for people, hobbies, events...',
    'home.search.all': 'All',
    'home.search.users': 'Users',
    'home.search.hobbies': 'Hobbies',
    'home.search.events': 'Events',
    'home.search.groups': 'Groups',
    'home.search.challenges': 'Challenges',

    // Features
    'features.challenges': 'Kindness Challenges',
    'features.challenges.desc': 'Complete challenges and make a positive impact',
    'features.groups': 'Hobby Groups',
    'features.groups.desc': 'Connect with like-minded individuals',
    'features.impact': 'Track Impact',
    'features.impact.desc': 'See your community contributions',
    'features.events': 'Community Events',
    'features.events.desc': 'Join local kindness activities',

    // Footer
    'footer.tagline': 'Connecting Hobbies with Kindness',
    'footer.rights': '© 2024 KindHobby. All rights reserved.',
    'footer.language': 'Language',
  },
  al: {
    // Navigation
    'nav.challenges': 'Sfidat',
    'nav.groups': 'Grupet',
    'nav.events': 'Ngjarjet',
    'nav.profile': 'Profili',
    'nav.logout': 'Dilni',
    'nav.login': 'Hyni',
    'nav.signup': 'Regjistrohu',
    
    // Home
    'home.title': 'Ku Hobitë Takohen me Mirësinë',
    'home.search.placeholder': 'Kërko njerëz, hobi, ngjarje...',
    'home.search.all': 'Të gjitha',
    'home.search.users': 'Përdoruesit',
    'home.search.hobbies': 'Hobitë',
    'home.search.events': 'Ngjarjet',
    'home.search.groups': 'Grupet',
    'home.search.challenges': 'Sfidat',

    // Features
    'features.challenges': 'Sfidat e Mirësisë',
    'features.challenges.desc': 'Përfundo sfidat dhe bëj ndikim pozitiv',
    'features.groups': 'Grupet e Hobive',
    'features.groups.desc': 'Lidhu me njerëz që mendojnë njësoj',
    'features.impact': 'Gjurmo Ndikimin',
    'features.impact.desc': 'Shiko kontributet tua në komunitet',
    'features.events': 'Ngjarjet e Komunitetit',
    'features.events.desc': 'Bashkohu në aktivitetet lokale',

    // Footer
    'footer.tagline': 'Duke Lidhur Hobitë me Mirësinë',
    'footer.rights': '© 2024 KindHobby. Të gjitha të drejtat e rezervuara.',
    'footer.language': 'Gjuha',
  },
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language') as Language;
    return saved || 'mk';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}