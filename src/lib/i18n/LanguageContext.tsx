"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect, useMemo } from "react";
import { Language, translations } from "./translations";
import { newFeatureTranslations, deepMerge } from "./newFeatureTranslations";
import { astrologyFeatureTranslations, deepMergeAstrology } from "./astrologyFeatureTranslations";
import { homepageRedesignTranslations, deepMergeHomepage } from "./homepageRedesignTranslations";
import { astrologersTranslations, deepMergeAstrologers } from "./astrologersTranslations";
import { commentTranslations, deepMergeComments } from "./commentTranslations";
import { indexPagesTranslations, deepMergeIndexPages } from "./indexPagesTranslations";
import { poojaTranslations, deepMergePoojaTranslations } from "./poojaTranslations";

type TranslateFunction = (key: string, fallback?: string) => string;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslateFunction;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = "vedicstarastro-language";

const VALID_LANGUAGES: Language[] = ["en", "hi", "ta", "te", "bn", "mr", "gu", "kn", "ml", "pa"];

function getSavedLanguage(): Language | null {
  if (typeof window === "undefined") return null;
  const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language | null;
  if (savedLanguage && VALID_LANGUAGES.includes(savedLanguage)) {
    return savedLanguage;
  }
  return null;
}

function getNestedValue(obj: Record<string, unknown>, path: string): string | undefined {
  const keys = path.split('.');
  let current: unknown = obj;
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    
    // First, try to find a flat key with dots at the current level
    // This handles keys like "pitraDosh.causes.cause1" stored as flat strings
    if (current && typeof current === 'object') {
      const remainingPath = keys.slice(i).join('.');
      if (remainingPath in (current as Record<string, unknown>)) {
        const value = (current as Record<string, unknown>)[remainingPath];
        if (typeof value === 'string') {
          return value;
        }
      }
    }
    
    // Then try nested traversal
    if (current && typeof current === 'object' && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }
  return typeof current === 'string' ? current : undefined;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Start with "en" for SSR, then update from localStorage on client
  const [language, setLanguageState] = useState<Language>("en");

  // Read language from localStorage after mount to avoid hydration mismatch
  useEffect(() => {
    const savedLanguage = getSavedLanguage();
    if (savedLanguage && savedLanguage !== language) {
      setLanguageState(savedLanguage);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  };

    // Merge base translations with new feature translations, astrology feature translations, and homepage redesign translations
    const mergedTranslations = useMemo(() => {
      const merged: Record<Language, Record<string, unknown>> = {} as Record<Language, Record<string, unknown>>;
      for (const lang of VALID_LANGUAGES) {
        const base = deepMerge(
          translations[lang] as Record<string, unknown>,
          newFeatureTranslations[lang] || {}
        );
        const withAstrology = deepMergeAstrology(
          base,
          astrologyFeatureTranslations[lang] || {}
        );
        const withHomepage = deepMergeHomepage(
          withAstrology,
          homepageRedesignTranslations[lang] || {}
        );
        const withAstrologers = deepMergeAstrologers(
          withHomepage,
          astrologersTranslations[lang] || {}
        );
        const withComments = deepMergeComments(
          withAstrologers,
          commentTranslations[lang] || {}
        );
        const withIndexPages = deepMergeIndexPages(
          withComments,
          indexPagesTranslations[lang] || {}
        );
        merged[lang] = deepMergePoojaTranslations(
          withIndexPages,
          poojaTranslations[lang] || {}
        );
      }
      return merged;
    }, []);

  const t: TranslateFunction = useCallback((key: string, fallback?: string): string => {
    const currentTranslations = mergedTranslations[language];
    const value = getNestedValue(currentTranslations as Record<string, unknown>, key);
    if (value !== undefined) {
      return value;
    }
    // Try English fallback
    const englishValue = getNestedValue(mergedTranslations.en as Record<string, unknown>, key);
    if (englishValue !== undefined) {
      return englishValue;
    }
    // Return provided fallback or key
    return fallback || key;
  }, [language, mergedTranslations]);

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
