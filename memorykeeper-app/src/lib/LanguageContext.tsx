import i18n from './i18n/i18n';
import React, { useState, useEffect, useContext, ReactNode } from 'react';

// Define supported languages
export type SupportedLanguage = 'en' | 'es' | 'fr' | 'de';

export interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  availableLanguages: { code: SupportedLanguage; name: string }[];
}

// Create context
const LanguageContext = React.createContext<LanguageContextType | null>(null);

// Provider component
interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  // Available languages
  const availableLanguages: { code: SupportedLanguage; name: string }[] = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' }
  ];

  // Get initial language from localStorage or browser settings
  const getInitialLanguage = (): SupportedLanguage => {
    // Check localStorage first
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && availableLanguages.some(lang => lang.code === savedLanguage)) {
      return savedLanguage as SupportedLanguage;
    }

    // Check browser language
    const browserLang = navigator.language.split('-')[0] as SupportedLanguage;
    if (availableLanguages.some(lang => lang.code === browserLang)) {
      return browserLang;
    }

    // Default to English
    return 'en';
  };

  const [language, setLanguageState] = useState<SupportedLanguage>(getInitialLanguage());

  // Update language when state changes
  useEffect(() => {
    i18n.changeLanguage(language);
    localStorage.setItem('language', language);
  }, [language]);

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, availableLanguages }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use the language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === null) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};