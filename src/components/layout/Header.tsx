"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X, ChevronDown, ChevronRight, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { useLanguage, Language } from "@/lib/i18n";
import { getCurrentYear, withCurrentYear } from "@/lib/utils";
import { CDN_IMAGES } from "@/lib/cdn";

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

export function Header() {
  const { t, language, setLanguage } = useLanguage();
  const currentYear = getCurrentYear();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const toggleSection = (sectionName: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionName) 
        ? prev.filter(s => s !== sectionName)
        : [...prev, sectionName]
    );
  };
  
  const navigation = [
    {
      name: t('nav.tools', 'Tools'),
      href: "#",
      children: [
        { name: t('nav.freeKundli', 'Free Kundli'), href: "/tools/kundli-calculator", description: t('nav.freeKundliDesc', 'Generate your birth chart instantly') },
        { name: t('nav.nakshatraFinder', 'Nakshatra Finder'), href: "/tools/nakshatra-finder", description: t('nav.nakshatraFinderDesc', 'Discover your lunar constellation') },
        { name: t('nav.horoscopeMatching', 'Horoscope Matching'), href: "/tools/horoscope-matching", description: t('nav.horoscopeMatchingDesc', 'Check marriage compatibility') },
        { name: t('nav.moonSignCalculator', 'Moon Sign Calculator'), href: "/tools/moon-sign-calculator", description: t('nav.moonSignCalculatorDesc', 'Find your Vedic Moon sign') },
        { name: t('nav.sunSignCalculator', 'Sun Sign Calculator'), href: "/tools/sun-sign-calculator", description: t('nav.sunSignCalculatorDesc', 'Discover your Sun sign') },
        { name: t('nav.ascendantCalculator', 'Ascendant Calculator'), href: "/tools/ascendant-calculator", description: t('nav.ascendantCalculatorDesc', 'Calculate your rising sign') },
        { name: t('nav.loveCompatibility', 'Love Compatibility'), href: "/tools/love-calculator", description: t('nav.loveCompatibilityDesc', 'Check zodiac compatibility') },
        { name: t('nav.habitTracker', 'Habit Tracker'), href: "/habit-tracker", description: t('nav.habitTrackerDesc', 'Track habits with astro timing') },
      ],
    },
    {
      name: t('nav.aiFeatures', 'AI & Pro'),
      href: "#",
      children: [
        { name: t('nav.aiAstrologer', 'AI Astrologer'), href: "/ai-astrologer", description: t('nav.aiAstrologerDesc', 'Chat with our AI for instant guidance') },
        { name: t('nav.aiAstrologerPro', 'AI Astrologer Pro'), href: "/ai-astrologer-pro", description: t('nav.aiAstrologerProDesc', 'Context-aware AI with birth chart') },
        { name: t('nav.voiceAstrologer', 'Voice AI Astrologer'), href: "/voice-astrologer", description: t('nav.voiceAstrologerDesc', 'Talk to AI astrologer by voice') },
        { name: t('nav.aiChartInterpretation', 'AI Chart Interpretation'), href: "/ai-chart-interpretation", description: t('nav.aiChartInterpretationDesc', 'Detailed AI analysis of your chart') },
      ],
    },
    {
      name: t('nav.advanced', 'Advanced'),
      href: "#",
      children: [
        { name: t('nav.dashaCalculator', 'Dasha Calculator'), href: "/tools/dasha-calculator", description: t('nav.dashaCalculatorDesc', 'Vimshottari Dasha planetary periods') },
        { name: t('nav.lifeTimeline', 'Life Timeline'), href: "/life-timeline", description: t('nav.lifeTimelineDesc', 'Predicted life events based on Dasha') },
        { name: t('nav.navamsaChart', 'Navamsa Chart'), href: "/tools/navamsa-chart", description: t('nav.navamsaChartDesc', 'D-9 & divisional charts') },
        { name: t('nav.yogaCalculator', 'Yoga Calculator'), href: "/tools/yoga-calculator", description: t('nav.yogaCalculatorDesc', 'Detect Raj Yoga, Dhana Yoga & more') },
        { name: t('nav.muhurtaCalculator', 'Muhurta Calculator'), href: "/tools/muhurta-calculator", description: t('nav.muhurtaCalculatorDesc', 'Find auspicious timing') },
        { name: t('nav.transitAnalysis', 'Transit Analysis'), href: "/tools/transit-calculator", description: t('nav.transitAnalysisDesc', 'Current planetary effects (Gochar)') },
        { name: t('nav.blockchainKundli', 'Blockchain Kundli'), href: "/blockchain-kundli", description: t('nav.blockchainKundliDesc', 'Verified tamper-proof certificate') },
        { name: t('nav.financialAstrology', 'Financial Astrology'), href: "/financial-astrology", description: t('nav.financialAstrologyDesc', 'Wealth timing predictions') },
      ],
    },
    {
      name: t('nav.panchang', 'Panchang'),
      href: "#",
      children: [
        { name: t('nav.dailyPanchang', 'Daily Panchang'), href: "/panchang", description: t('nav.dailyPanchangDesc', "Today's tithi, nakshatra & muhurat") },
        { name: t('nav.planetaryTracker', 'Planetary Tracker'), href: "/planetary-tracker", description: t('nav.planetaryTrackerDesc', 'Live planetary positions & transits') },
        { name: withCurrentYear(t('nav.festivalCalendarYear', 'Festival Calendar {year}')), href: `/festival-calendar-${currentYear}`, description: t('nav.festivalCalendarYearDesc', 'Hindu festivals & important dates') },
      ],
    },
    {
      name: t('nav.horoscope', 'Horoscope'),
      href: "#",
      children: [
        { name: t('nav.personalizedHoroscope', 'Personalized Horoscope'), href: "/personalized-horoscope", description: t('nav.personalizedHoroscopeDesc', 'AI-generated based on your chart') },
        { name: t('nav.dailyHoroscope', 'Daily Horoscope'), href: "/daily-horoscope", description: t('nav.dailyHoroscopeDesc', "Today's predictions") },
        { name: t('nav.weeklyHoroscope', 'Weekly Horoscope'), href: "/horoscope/weekly", description: t('nav.weeklyHoroscopeDesc', "This week's forecast") },
        { name: t('nav.monthlyHoroscope', 'Monthly Horoscope'), href: "/horoscope/monthly", description: t('nav.monthlyHoroscopeDesc', 'Monthly predictions') },
        { name: withCurrentYear(t('nav.horoscopeYear', '{year} Horoscope')), href: `/horoscope/${currentYear}`, description: withCurrentYear(t('nav.horoscopeYearDesc', 'Yearly predictions for {year}')) },
        { name: withCurrentYear(t('nav.saturnTransitYear', 'Saturn Transit {year}')), href: `/transits/saturn-transit-${currentYear}`, description: t('nav.saturnTransitYearDesc', 'Shani Gochar effects') },
        { name: withCurrentYear(t('nav.jupiterTransitYear', 'Jupiter Transit {year}')), href: `/transits/jupiter-transit-${currentYear}`, description: t('nav.jupiterTransitYearDesc', 'Guru Gochar predictions') },
        { name: t('nav.mercuryRetrograde', 'Mercury Retrograde'), href: `/transits/mercury-retrograde-${currentYear}`, description: t('nav.mercuryRetrogradeDesc', 'Retrograde dates & survival guide') },
        { name: withCurrentYear(t('nav.eclipsesYear', 'Eclipses {year}')), href: `/eclipses-${currentYear}`, description: t('nav.eclipsesYearDesc', 'Solar & lunar eclipse guide') },
      ],
    },
        {
          name: t('nav.doshas', 'Doshas'),
          href: "#",
          children: [
            { name: t('nav.mangalDosh', 'Mangal Dosh'), href: "/doshas/mangal-dosh", description: t('nav.mangalDoshDesc', 'Manglik dosha guide & remedies') },
            { name: t('nav.kaalSarpDosh', 'Kaal Sarp Dosh'), href: "/doshas/kaal-sarp-dosh", description: t('nav.kaalSarpDoshDesc', '12 types & remedies') },
            { name: t('nav.sadeSati', 'Sade Sati'), href: "/doshas/sade-sati", description: t('nav.sadeSatiDesc', "Saturn's 7.5 year transit") },
            { name: t('nav.pitraDosh', 'Pitra Dosh'), href: "/doshas/pitra-dosh", description: t('nav.pitraDoshDesc', 'Ancestral karma & remedies') },
            { name: t('nav.mangalDoshCalculator', 'Mangal Dosh Calculator'), href: "/tools/mangal-dosh-calculator", description: t('nav.mangalDoshCalculatorDesc', 'Check Manglik status') },
            { name: t('nav.sadeSatiCalculator', 'Sade Sati Calculator'), href: "/tools/sade-sati-calculator", description: t('nav.sadeSatiCalculatorDesc', 'Check Sade Sati phase') },
          ],
        },
        {
          name: t('nav.moreAstrology', 'More'),
          href: "#",
          children: [
            { name: t('navAstrology.lalKitab', 'Lal Kitab'), href: "/lal-kitab", description: t('navAstrology.lalKitabDesc', 'Ancient remedial astrology system') },
            { name: t('navAstrology.numerology', 'Numerology'), href: "/numerology", description: t('navAstrology.numerologyDesc', 'Discover your life path numbers') },
            { name: t('navAstrology.tarot', 'Tarot Reading'), href: "/tarot", description: t('navAstrology.tarotDesc', 'Daily, love, career card readings') },
            { name: t('navAstrology.vastu', 'Vastu Shastra'), href: "/vastu", description: t('navAstrology.vastuDesc', 'Home and office Vastu tips') },
            { name: t('navAstrology.chinese', 'Chinese Astrology'), href: "/chinese-astrology", description: t('navAstrology.chineseDesc', 'Your Chinese zodiac sign') },
            { name: t('navAstrology.kpSystem', 'KP System'), href: "/kp-system", description: t('navAstrology.kpSystemDesc', 'Krishnamurti Paddhati astrology') },
            { name: t('navAstrology.prashna', 'Prashna Kundli'), href: "/prashna-kundli", description: t('navAstrology.prashnaDesc', 'Question-based horary astrology') },
            { name: t('navAstrology.babyNames', 'Baby Names'), href: "/baby-names", description: t('navAstrology.babyNamesDesc', 'Nakshatra-based name suggestions') },
            { name: t('navAstrology.gemstones', 'Gemstones'), href: "/gemstones", description: t('navAstrology.gemstonesDesc', 'Astrological gemstone guide') },
            { name: t('navAstrology.palmistry', 'Palmistry'), href: "/palmistry", description: t('navAstrology.palmistryDesc', 'Palm reading guide') },
          ],
        },
        { name: t('nav.consultation', 'Consultation'), href: "/consultation" },
    { name: t('nav.about', 'About'), href: "/about" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-amber-100 shadow-sm">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center flex-shrink-0">
            <Link href="/" className="flex items-center gap-1">
<Image
                src={CDN_IMAGES.logoOptimized}
                alt="VedicStarAstro Logo"
                width={56}
                height={56}
                className="w-14 h-14 object-contain"
                priority
              />
              <span className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                VedicStarAstro
              </span>
            </Link>
          </div>

          <div className="hidden xl:flex xl:items-center xl:gap-x-2 xl:ml-6">
            {navigation.map((item) => (
              <div key={item.name} className="relative">
                {item.children ? (
                  <div
                    className="relative"
                    onMouseEnter={() => setOpenDropdown(item.name)}
                    onMouseLeave={() => setOpenDropdown(null)}
                  >
                    <button className="flex items-center gap-0.5 text-xs font-medium text-gray-700 hover:text-amber-600 transition-colors py-2 whitespace-nowrap">
                      {item.name}
                      <ChevronDown className="w-3 h-3" />
                    </button>
                    {openDropdown === item.name && (
                      <div className="absolute left-0 top-full pt-2 w-72">
                        <div className="bg-white rounded-xl shadow-lg ring-1 ring-black/5 p-2">
                          {item.children.map((child) => (
                            <Link
                              key={child.name}
                              href={child.href}
                              className="block rounded-lg p-3 hover:bg-amber-50 transition-colors"
                            >
                              <div className="font-medium text-gray-900">{child.name}</div>
                              <p className="text-sm text-gray-500">{child.description}</p>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    className="text-xs font-medium text-gray-700 hover:text-amber-600 transition-colors whitespace-nowrap"
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
          </div>

          <div className="hidden xl:flex xl:items-center xl:gap-x-2">
                        <LanguageSwitcher />
                        <Link href="/tools/kundli-calculator">
                          <Button variant="outline" className="border-amber-500 text-amber-600 hover:bg-amber-50">
                            {t('nav.freeKundli', 'Free Kundli')}
                          </Button>
                        </Link>
                        <Link href="/consultation">
                          <Button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white">
                            {t('nav.bookConsultation', 'Book Consultation')}
                          </Button>
                        </Link>
          </div>

          <div className="flex xl:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="xl:hidden flex flex-col border-t border-amber-100 max-h-[calc(100vh-5rem)]">
            {/* Language Selector at TOP - Inline Grid */}
            <div className="px-3 py-3 border-b border-amber-100 bg-amber-50/50">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-medium text-gray-700">{t('nav.selectLanguage', 'Select Language')}</span>
              </div>
              <div className="grid grid-cols-5 gap-1">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`px-2 py-1.5 text-xs rounded-md transition-colors ${
                      language === lang.code
                        ? "bg-amber-500 text-white font-medium"
                        : "bg-white text-gray-700 hover:bg-amber-100 border border-gray-200"
                    }`}
                    title={lang.name}
                  >
                    {lang.nativeName.substring(0, 4)}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable Navigation with Collapsible Sections */}
            <div className="flex-1 overflow-y-auto py-2">
              <div className="space-y-1">
                {navigation.map((item) => (
                  <div key={item.name}>
                    {item.children ? (
                      <div>
                        <button
                          onClick={() => toggleSection(item.name)}
                          className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-semibold text-gray-900 hover:bg-amber-50 rounded-lg transition-colors"
                        >
                          <span>{item.name}</span>
                          <ChevronRight 
                            className={`w-4 h-4 text-gray-400 transition-transform ${
                              expandedSections.includes(item.name) ? 'rotate-90' : ''
                            }`} 
                          />
                        </button>
                        {expandedSections.includes(item.name) && (
                          <div className="ml-3 pl-3 border-l-2 border-amber-200 space-y-0.5">
                            {item.children.map((child) => (
                              <Link
                                key={child.name}
                                href={child.href}
                                className="block px-3 py-2 text-sm text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                              >
                                {child.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <Link
                        href={item.href}
                        className="block px-3 py-2.5 text-sm font-semibold text-gray-900 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.name}
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Fixed CTA Buttons at BOTTOM */}
            <div className="px-3 py-3 border-t border-amber-100 bg-white space-y-2">
              <Link href="/tools/kundli-calculator" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full border-amber-500 text-amber-600 hover:bg-amber-50">
                  {t('nav.freeKundli', 'Free Kundli')}
                </Button>
              </Link>
              <Link href="/consultation" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white">
                  {t('nav.bookConsultation', 'Book Consultation')}
                </Button>
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
