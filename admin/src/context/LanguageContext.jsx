import React, { createContext, useContext, useState, useEffect } from 'react';
import { getTranslation } from '../services/i18n';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    try {
      return localStorage.getItem('rakshak_web_lang') || 'ENG';
    } catch {
      return 'ENG';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('rakshak_web_lang', language);
    } catch {}
  }, [language]);

  const t = (key) => getTranslation(language, key);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    return {
      language: 'ENG',
      setLanguage: () => {},
      t: (key) => key,
    };
  }
  return ctx;
}
