"use client";

import { useLanguage, Language } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

const languages: { code: Language; name: string; nativeName: string }[] = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
];

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    const newLang = language === "en" ? "hi" : "en";
    setLanguage(newLang);
  };

  const currentLang = languages.find((l) => l.code === language);
  const otherLang = languages.find((l) => l.code !== language);

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="flex items-center gap-1.5 text-sm font-medium"
      title={`Switch to ${otherLang?.name}`}
    >
      <Globe className="h-4 w-4" />
      <span className="hidden sm:inline">{currentLang?.nativeName}</span>
    </Button>
  );
}
