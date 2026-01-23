"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
}

// Map of path segments to translation keys
const pathTranslations: Record<string, string> = {
  tools: 'breadcrumb.tools',
  consultation: 'breadcrumb.consultation',
  contact: 'breadcrumb.contact',
  about: 'breadcrumb.about',
  blog: 'breadcrumb.blog',
  astrologers: 'breadcrumb.astrologers',
  'daily-horoscope': 'breadcrumb.dailyHoroscope',
  'kundli-calculator': 'breadcrumb.kundliCalculator',
  'nakshatra-finder': 'breadcrumb.nakshatraFinder',
  'horoscope-matching': 'breadcrumb.horoscopeMatching',
  'moon-sign-calculator': 'breadcrumb.moonSignCalculator',
  'sun-sign-calculator': 'breadcrumb.sunSignCalculator',
  'dasha-calculator': 'breadcrumb.dashaCalculator',
  'transit-calculator': 'breadcrumb.transitCalculator',
  'yoga-calculator': 'breadcrumb.yogaCalculator',
  'navamsa-chart': 'breadcrumb.navamsaChart',
  'ascendant-calculator': 'breadcrumb.ascendantCalculator',
  'muhurta-calculator': 'breadcrumb.muhurtaCalculator',
  'love-calculator': 'breadcrumb.loveCalculator',
  'mangal-dosh-calculator': 'breadcrumb.mangalDoshCalculator',
  'sade-sati-calculator': 'breadcrumb.sadeSatiCalculator',
  doshas: 'breadcrumb.doshas',
  'mangal-dosh': 'breadcrumb.mangalDosh',
  'kaal-sarp-dosh': 'breadcrumb.kaalSarpDosh',
  'pitra-dosh': 'breadcrumb.pitraDosh',
  'sade-sati': 'breadcrumb.sadeSati',
  horoscope: 'breadcrumb.horoscope',
  weekly: 'breadcrumb.weekly',
  monthly: 'breadcrumb.monthly',
  transits: 'breadcrumb.transits',
  'jupiter-transit-2026': 'breadcrumb.jupiterTransit',
  'saturn-transit-2026': 'breadcrumb.saturnTransit',
  'mercury-retrograde-2026': 'breadcrumb.mercuryRetrograde',
  numerology: 'breadcrumb.numerology',
  tarot: 'breadcrumb.tarot',
  vastu: 'breadcrumb.vastu',
  palmistry: 'breadcrumb.palmistry',
  gemstones: 'breadcrumb.gemstones',
  panchang: 'breadcrumb.panchang',
  'ai-astrologer': 'breadcrumb.aiAstrologer',
  'ai-astrologer-pro': 'breadcrumb.aiAstrologerPro',
  'voice-astrologer': 'breadcrumb.voiceAstrologer',
  'ai-chart-interpretation': 'breadcrumb.aiChartInterpretation',
  'prashna-kundli': 'breadcrumb.prashnaKundli',
  'kp-system': 'breadcrumb.kpSystem',
  'lal-kitab': 'breadcrumb.lalKitab',
  'chinese-astrology': 'breadcrumb.chineseAstrology',
  'financial-astrology': 'breadcrumb.financialAstrology',
  'life-timeline': 'breadcrumb.lifeTimeline',
  'planetary-tracker': 'breadcrumb.planetaryTracker',
  'habit-tracker': 'breadcrumb.habitTracker',
  'personalized-horoscope': 'breadcrumb.personalizedHoroscope',
  'baby-names': 'breadcrumb.babyNames',
  'blockchain-kundli': 'breadcrumb.blockchainKundli',
  'festival-calendar-2026': 'breadcrumb.festivalCalendar',
  'eclipses-2026': 'breadcrumb.eclipses',
  careers: 'breadcrumb.careers',
  press: 'breadcrumb.press',
  'privacy-policy': 'breadcrumb.privacyPolicy',
  'terms-of-service': 'breadcrumb.termsOfService',
  'refund-policy': 'breadcrumb.refundPolicy',
  disclaimer: 'breadcrumb.disclaimer',
  'pooja-booking': 'breadcrumb.poojaBooking',
};

// Default labels for paths (fallback if translation not found)
const defaultLabels: Record<string, string> = {
  tools: 'Tools',
  consultation: 'Consultation',
  contact: 'Contact',
  about: 'About Us',
  blog: 'Blog',
  astrologers: 'Astrologers',
  'daily-horoscope': 'Daily Horoscope',
  'kundli-calculator': 'Kundli Calculator',
  'nakshatra-finder': 'Nakshatra Finder',
  'horoscope-matching': 'Horoscope Matching',
  'moon-sign-calculator': 'Moon Sign Calculator',
  'sun-sign-calculator': 'Sun Sign Calculator',
  'dasha-calculator': 'Dasha Calculator',
  'transit-calculator': 'Transit Calculator',
  'yoga-calculator': 'Yoga Calculator',
  'navamsa-chart': 'Navamsa Chart',
  'ascendant-calculator': 'Ascendant Calculator',
  'muhurta-calculator': 'Muhurta Calculator',
  'love-calculator': 'Love Calculator',
  'mangal-dosh-calculator': 'Mangal Dosh Calculator',
  'sade-sati-calculator': 'Sade Sati Calculator',
  doshas: 'Doshas',
  'mangal-dosh': 'Mangal Dosh',
  'kaal-sarp-dosh': 'Kaal Sarp Dosh',
  'pitra-dosh': 'Pitra Dosh',
  'sade-sati': 'Sade Sati',
  horoscope: 'Horoscope',
  weekly: 'Weekly',
  monthly: 'Monthly',
  transits: 'Transits',
  'jupiter-transit-2026': 'Jupiter Transit',
  'saturn-transit-2026': 'Saturn Transit',
  'mercury-retrograde-2026': 'Mercury Retrograde',
  numerology: 'Numerology',
  tarot: 'Tarot',
  vastu: 'Vastu',
  palmistry: 'Palmistry',
  gemstones: 'Gemstones',
  panchang: 'Panchang',
  'ai-astrologer': 'AI Astrologer',
  'ai-astrologer-pro': 'AI Astrologer Pro',
  'voice-astrologer': 'Voice Astrologer',
  'ai-chart-interpretation': 'AI Chart Interpretation',
  'prashna-kundli': 'Prashna Kundli',
  'kp-system': 'KP System',
  'lal-kitab': 'Lal Kitab',
  'chinese-astrology': 'Chinese Astrology',
  'financial-astrology': 'Financial Astrology',
  'life-timeline': 'Life Timeline',
  'planetary-tracker': 'Planetary Tracker',
  'habit-tracker': 'Habit Tracker',
  'personalized-horoscope': 'Personalized Horoscope',
  'baby-names': 'Baby Names',
  'blockchain-kundli': 'Blockchain Kundli',
  'festival-calendar-2026': 'Festival Calendar',
  'eclipses-2026': 'Eclipses',
  careers: 'Careers',
  press: 'Press',
  'privacy-policy': 'Privacy Policy',
  'terms-of-service': 'Terms of Service',
  'refund-policy': 'Refund Policy',
  disclaimer: 'Disclaimer',
  'pooja-booking': 'Pooja Booking',
};

export function Breadcrumb({ items, className = "" }: BreadcrumbProps) {
  const pathname = usePathname();
  const { t } = useLanguage();

  // Generate breadcrumb items from pathname if not provided
  const breadcrumbItems: BreadcrumbItem[] = items || (() => {
    const segments = pathname.split('/').filter(Boolean);
    const generatedItems: BreadcrumbItem[] = [
      { label: t('breadcrumb.home', 'Home'), href: '/' }
    ];

    let currentPath = '';
    segments.forEach((segment) => {
      currentPath += `/${segment}`;
      const translationKey = pathTranslations[segment];
      const defaultLabel = defaultLabels[segment] || segment.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      const label = translationKey ? t(translationKey, defaultLabel) : defaultLabel;
      generatedItems.push({ label, href: currentPath });
    });

    return generatedItems;
  })();

  // Don't show breadcrumb on homepage
  if (pathname === '/') {
    return null;
  }

  // Generate JSON-LD schema for breadcrumbs
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbItems.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.label,
      "item": `https://vedicstarastro.com${item.href}`
    }))
  };

  return (
    <>
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      
      {/* Visual Breadcrumb */}
      <nav aria-label="Breadcrumb" className={`py-3 px-4 ${className}`}>
        <ol className="flex flex-wrap items-center gap-2 text-sm">
          {breadcrumbItems.map((item, index) => {
            const isLast = index === breadcrumbItems.length - 1;
            
            return (
              <li key={item.href} className="flex items-center">
                {index > 0 && (
                  <svg
                    className="w-4 h-4 mx-2 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                )}
                {isLast ? (
                  <span className="text-gray-600 font-medium" aria-current="page">
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="text-orange-600 hover:text-orange-700 hover:underline transition-colors"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}

export default Breadcrumb;
