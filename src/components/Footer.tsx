import React, { useState, useRef, useEffect } from 'react';
import { Heart, ChevronDown } from 'lucide-react';
import { useLanguage, Language } from '../contexts/LanguageContext';

const languageOptions: {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
}[] = [
  {
    code: 'mk',
    name: 'Macedonian',
    nativeName: 'Македонски',
    flag: 'https://flagcdn.com/mk.svg',
  },
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: 'https://flagcdn.com/gb.svg',
  },
  {
    code: 'al',
    name: 'Albanian',
    nativeName: 'Shqip',
    flag: 'https://flagcdn.com/al.svg',
  },
];

export default function Footer() {
  const { language, setLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLanguage = languageOptions.find(lang => lang.code === language);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <footer className="bg-white shadow-md mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2">
            <Heart className="text-primary w-6 h-6" />
            <span className="text-lg font-semibold">KindHobby</span>
          </div>
          <div className="mt-4 md:mt-0">
            <p className="text-gray-600">{t('footer.tagline')}</p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center space-x-4">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <img
                  src={currentLanguage?.flag}
                  alt={currentLanguage?.name}
                  className="w-5 h-5 rounded-sm object-cover"
                />
                <span className="text-sm text-gray-700">{currentLanguage?.nativeName}</span>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>

              {isOpen && (
                <div className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50">
                  {languageOptions.map((option) => (
                    <button
                      key={option.code}
                      onClick={() => {
                        setLanguage(option.code);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-2 text-sm hover:bg-gray-100 transition-colors
                        ${language === option.code ? 'bg-gray-50' : ''}`}
                    >
                      <img
                        src={option.flag}
                        alt={option.name}
                        className="w-5 h-5 rounded-sm object-cover"
                      />
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{option.nativeName}</span>
                        <span className="text-xs text-gray-500">{option.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <p className="text-sm text-gray-500">{t('footer.rights')}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}