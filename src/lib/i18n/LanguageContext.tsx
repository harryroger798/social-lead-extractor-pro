"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { Language, translations, TranslationKeys } from "./translations";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationKeys;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = "vedicstarastro-language";

const VALID_LANGUAGES: Language[] = ["en", "hi", "ta", "te", "bn", "mr", "gu", "kn", "ml", "pa"];

function getInitialLanguage(): Language {
  if (typeof window === "undefined") return "en";
  const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language | null;
  if (savedLanguage && VALID_LANGUAGES.includes(savedLanguage)) {
    return savedLanguage;
  }
  return "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  };

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

export function useTranslation() {
  const { t, language } = useLanguage();
  return { t, language };
}
