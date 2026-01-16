"use client";

import { useState, useRef, useEffect } from "react";
import { useLanguage, Language } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Globe, ChevronDown } from "lucide-react";

const languages: { code: Language; name: string; nativeName: string }[] = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা" },
  { code: "mr", name: "Marathi", nativeName: "मराठी" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം" },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ" },
];

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang = languages.find((l) => l.code === language) || languages[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLanguageSelect = (code: Language) => {
    setLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 text-sm font-medium"
        title="Select language"
      >
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline">{currentLang.nativeName}</span>
        <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-48 rounded-md border border-gray-200 bg-white shadow-lg z-50 dark:bg-gray-800 dark:border-gray-700">
          <div className="py-1 max-h-80 overflow-y-auto">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageSelect(lang.code)}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between ${
                  language === lang.code ? "bg-orange-50 text-orange-600 dark:bg-orange-900/20" : ""
                }`}
              >
                <span>{lang.nativeName}</span>
                <span className="text-gray-400 text-xs">{lang.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
