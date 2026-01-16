"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { useLanguage } from "@/lib/i18n";

export function Header() {
  const { t } = useLanguage();
  
  const navigation = [
    {
      name: t('nav.tools', 'Tools'),
      href: "#",
      children: [
        { name: t('nav.aiAstrologer', 'AI Astrologer'), href: "/ai-astrologer", description: t('nav.aiAstrologerDesc', 'Chat with our AI for instant guidance') },
        { name: t('nav.freeKundli', 'Free Kundli'), href: "/tools/kundli-calculator", description: t('nav.freeKundliDesc', 'Generate your birth chart instantly') },
        { name: t('nav.nakshatraFinder', 'Nakshatra Finder'), href: "/tools/nakshatra-finder", description: t('nav.nakshatraFinderDesc', 'Discover your lunar constellation') },
        { name: t('nav.horoscopeMatching', 'Horoscope Matching'), href: "/tools/horoscope-matching", description: t('nav.horoscopeMatchingDesc', 'Check marriage compatibility') },
        { name: t('nav.moonSignCalculator', 'Moon Sign Calculator'), href: "/tools/moon-sign-calculator", description: t('nav.moonSignCalculatorDesc', 'Find your Vedic Moon sign') },
        { name: t('nav.sunSignCalculator', 'Sun Sign Calculator'), href: "/tools/sun-sign-calculator", description: t('nav.sunSignCalculatorDesc', 'Discover your Sun sign') },
        { name: t('nav.ascendantCalculator', 'Ascendant Calculator'), href: "/tools/ascendant-calculator", description: t('nav.ascendantCalculatorDesc', 'Calculate your rising sign') },
        { name: t('nav.loveCompatibility', 'Love Compatibility'), href: "/tools/love-calculator", description: t('nav.loveCompatibilityDesc', 'Check zodiac compatibility') },
      ],
    },
    {
      name: t('nav.advanced', 'Advanced'),
      href: "#",
      children: [
        { name: t('nav.dashaCalculator', 'Dasha Calculator'), href: "/tools/dasha-calculator", description: t('nav.dashaCalculatorDesc', 'Vimshottari Dasha planetary periods') },
        { name: t('nav.navamsaChart', 'Navamsa Chart'), href: "/tools/navamsa-chart", description: t('nav.navamsaChartDesc', 'D-9 & divisional charts') },
        { name: t('nav.yogaCalculator', 'Yoga Calculator'), href: "/tools/yoga-calculator", description: t('nav.yogaCalculatorDesc', 'Detect Raj Yoga, Dhana Yoga & more') },
        { name: t('nav.muhurtaCalculator', 'Muhurta Calculator'), href: "/tools/muhurta-calculator", description: t('nav.muhurtaCalculatorDesc', 'Find auspicious timing') },
        { name: t('nav.transitAnalysis', 'Transit Analysis'), href: "/tools/transit-calculator", description: t('nav.transitAnalysisDesc', 'Current planetary effects (Gochar)') },
      ],
    },
    {
      name: t('nav.panchang', 'Panchang'),
      href: "#",
      children: [
        { name: t('nav.dailyPanchang', 'Daily Panchang'), href: "/panchang", description: t('nav.dailyPanchangDesc', "Today's tithi, nakshatra & muhurat") },
        { name: t('nav.festivalCalendar2026', 'Festival Calendar 2026'), href: "/festival-calendar-2026", description: t('nav.festivalCalendar2026Desc', 'Hindu festivals & important dates') },
      ],
    },
    {
      name: t('nav.horoscope', 'Horoscope'),
      href: "#",
      children: [
        { name: t('nav.dailyHoroscope', 'Daily Horoscope'), href: "/daily-horoscope", description: t('nav.dailyHoroscopeDesc', "Today's predictions") },
        { name: t('nav.weeklyHoroscope', 'Weekly Horoscope'), href: "/horoscope/weekly", description: t('nav.weeklyHoroscopeDesc', "This week's forecast") },
        { name: t('nav.monthlyHoroscope', 'Monthly Horoscope'), href: "/horoscope/monthly", description: t('nav.monthlyHoroscopeDesc', 'Monthly predictions') },
        { name: t('nav.horoscope2026', '2026 Horoscope'), href: "/horoscope/2026", description: t('nav.horoscope2026Desc', 'Yearly predictions for 2026') },
        { name: t('nav.saturnTransit2026', 'Saturn Transit 2026'), href: "/transits/saturn-transit-2026", description: t('nav.saturnTransit2026Desc', 'Shani Gochar effects') },
        { name: t('nav.jupiterTransit2026', 'Jupiter Transit 2026'), href: "/transits/jupiter-transit-2026", description: t('nav.jupiterTransit2026Desc', 'Guru Gochar predictions') },
        { name: t('nav.mercuryRetrograde', 'Mercury Retrograde'), href: "/transits/mercury-retrograde-2026", description: t('nav.mercuryRetrogradeDesc', 'Retrograde dates & survival guide') },
        { name: t('nav.eclipses2026', 'Eclipses 2026'), href: "/eclipses-2026", description: t('nav.eclipses2026Desc', 'Solar & lunar eclipse guide') },
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
    { name: t('nav.consultation', 'Consultation'), href: "/consultation" },
    { name: t('nav.about', 'About'), href: "/about" },
  ];
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-amber-100 shadow-sm">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center flex-shrink-0">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/images/logo.png"
                alt="VedicStarAstro Logo"
                width={48}
                height={48}
                className="w-10 h-10 object-contain"
                priority
              />
              <span className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                VedicStarAstro
              </span>
            </Link>
          </div>

          <div className="hidden lg:flex lg:items-center lg:gap-x-4 lg:ml-8">
            {navigation.map((item) => (
              <div key={item.name} className="relative">
                {item.children ? (
                  <div
                    className="relative"
                    onMouseEnter={() => setOpenDropdown(item.name)}
                    onMouseLeave={() => setOpenDropdown(null)}
                  >
                    <button className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-amber-600 transition-colors py-2">
                      {item.name}
                      <ChevronDown className="w-4 h-4" />
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
                    className="text-sm font-medium text-gray-700 hover:text-amber-600 transition-colors"
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
          </div>

          <div className="hidden lg:flex lg:items-center lg:gap-x-4">
                        <LanguageSwitcher />
                        <Button variant="outline" className="border-amber-500 text-amber-600 hover:bg-amber-50">
                          {t('nav.freeKundli', 'Free Kundli')}
                        </Button>
                        <Button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white">
                          {t('nav.bookConsultation', 'Book Consultation')}
                        </Button>
          </div>

          <div className="flex lg:hidden">
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
          <div className="lg:hidden py-4 border-t border-amber-100">
            <div className="space-y-2">
              {navigation.map((item) => (
                <div key={item.name}>
                  {item.children ? (
                    <div className="space-y-1">
                      <div className="px-3 py-2 text-sm font-semibold text-gray-900">{item.name}</div>
                      {item.children.map((child) => (
                        <Link
                          key={child.name}
                          href={child.href}
                          className="block px-6 py-2 text-sm text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-amber-600 hover:bg-amber-50 rounded-lg"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}
              <div className="pt-4 px-3 space-y-2">
                                <div className="flex justify-center pb-2">
                                  <LanguageSwitcher />
                                </div>
                                <Button variant="outline" className="w-full border-amber-500 text-amber-600">
                                  {t('nav.freeKundli', 'Free Kundli')}
                                </Button>
                                <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white">
                                  {t('nav.bookConsultation', 'Book Consultation')}
                                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
