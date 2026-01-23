"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCurrentYear } from "@/lib/utils";
import { ArrowRight, Calendar, CalendarDays, CalendarRange, Star } from "lucide-react";

const zodiacSigns = [
  { key: "aries", symbol: "♈", dates: "Mar 21 - Apr 19" },
  { key: "taurus", symbol: "♉", dates: "Apr 20 - May 20" },
  { key: "gemini", symbol: "♊", dates: "May 21 - Jun 20" },
  { key: "cancer", symbol: "♋", dates: "Jun 21 - Jul 22" },
  { key: "leo", symbol: "♌", dates: "Jul 23 - Aug 22" },
  { key: "virgo", symbol: "♍", dates: "Aug 23 - Sep 22" },
  { key: "libra", symbol: "♎", dates: "Sep 23 - Oct 22" },
  { key: "scorpio", symbol: "♏", dates: "Oct 23 - Nov 21" },
  { key: "sagittarius", symbol: "♐", dates: "Nov 22 - Dec 21" },
  { key: "capricorn", symbol: "♑", dates: "Dec 22 - Jan 19" },
  { key: "aquarius", symbol: "♒", dates: "Jan 20 - Feb 18" },
  { key: "pisces", symbol: "♓", dates: "Feb 19 - Mar 20" },
];

export default function HoroscopeIndexPage() {
  const { t } = useLanguage();
  const currentYear = getCurrentYear();

  const horoscopeTypes = [
    {
      key: "daily",
      href: "/daily-horoscope",
      icon: Calendar,
      color: "amber",
    },
    {
      key: "weekly",
      href: "/horoscope/weekly",
      icon: CalendarDays,
      color: "blue",
    },
    {
      key: "monthly",
      href: "/horoscope/monthly",
      icon: CalendarRange,
      color: "purple",
    },
    {
      key: "yearly",
      href: `/horoscope/${currentYear}`,
      icon: Star,
      color: "green",
    },
  ];

  return (
    <div className="py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-amber-100 text-amber-800">
            {t('horoscope.index.badge', 'Vedic Astrology')}
          </Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {t('horoscope.index.title', 'Horoscope Predictions')}
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {t('horoscope.index.subtitle', 'Get accurate horoscope predictions based on Vedic astrology. Choose from daily, weekly, monthly, or yearly horoscopes for all 12 zodiac signs.')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {horoscopeTypes.map((type) => {
            const Icon = type.icon;
            const colorClasses = {
              amber: "border-amber-200 hover:border-amber-300 bg-amber-50",
              blue: "border-blue-200 hover:border-blue-300 bg-blue-50",
              purple: "border-purple-200 hover:border-purple-300 bg-purple-50",
              green: "border-green-200 hover:border-green-300 bg-green-50",
            };
            const iconColorClasses = {
              amber: "text-amber-600",
              blue: "text-blue-600",
              purple: "text-purple-600",
              green: "text-green-600",
            };

            return (
              <Card 
                key={type.key} 
                className={`${colorClasses[type.color as keyof typeof colorClasses]} transition-all hover:shadow-lg`}
              >
                <CardHeader className="text-center">
                  <Icon className={`w-12 h-12 mx-auto mb-2 ${iconColorClasses[type.color as keyof typeof iconColorClasses]}`} />
                  <CardTitle className="text-xl">
                    {t(`horoscope.index.types.${type.key}.title`, type.key)}
                  </CardTitle>
                  <CardDescription>
                    {t(`horoscope.index.types.${type.key}.description`, '')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={type.href}>
                      {t('horoscope.index.viewHoroscope', 'View Horoscope')} <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="border-amber-200 bg-amber-50 mb-12">
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              {t('horoscope.index.aboutTitle', 'About Vedic Horoscopes')}
            </h2>
            <p className="text-gray-700">
              {t('horoscope.index.aboutDescription', 'Our horoscope predictions are based on Vedic astrology, an ancient Indian system that uses the sidereal zodiac. Unlike Western astrology, Vedic astrology accounts for the precession of equinoxes, providing more accurate planetary positions. Our predictions consider the Moon sign (Rashi), planetary transits, and dasha periods for comprehensive insights.')}
            </p>
          </CardContent>
        </Card>

        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          {t('horoscope.index.selectSign', 'Select Your Zodiac Sign')}
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-12">
          {zodiacSigns.map((sign) => (
            <Link 
              key={sign.key} 
              href={`/horoscope/yearly/${sign.key}`}
              className="block"
            >
              <Card className="border-gray-200 hover:border-amber-300 hover:shadow-md transition-all text-center">
                <CardContent className="pt-4 pb-4">
                  <span className="text-4xl block mb-2">{sign.symbol}</span>
                  <h3 className="font-semibold text-gray-900">
                    {t(`horoscope.signs.${sign.key}`, sign.key)}
                  </h3>
                  <p className="text-xs text-gray-500">{sign.dates}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              {t('horoscope.index.personalizedTitle', 'Get Personalized Predictions')}
            </h2>
            <p className="text-gray-700 mb-4">
              {t('horoscope.index.personalizedDescription', 'For more accurate predictions based on your exact birth details, generate your free Kundli or consult with our expert astrologers.')}
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild>
                <Link href="/tools/kundli-calculator">
                  {t('horoscope.index.generateKundli', 'Generate Free Kundli')}
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/consultation">
                  {t('horoscope.index.consultAstrologer', 'Consult an Astrologer')}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
