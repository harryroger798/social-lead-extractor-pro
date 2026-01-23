"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCurrentYear, withCurrentYear } from "@/lib/utils";
import { ArrowRight, Orbit, Moon, RotateCcw } from "lucide-react";

export default function TransitsIndexPage() {
  const { t } = useLanguage();
  const currentYear = getCurrentYear();

  const transitsList = [
    {
      key: "jupiter",
      href: `/transits/jupiter-transit-${currentYear}`,
      icon: Orbit,
      color: "amber",
      planet: "Jupiter",
      sanskrit: "Guru",
    },
    {
      key: "saturn",
      href: `/transits/saturn-transit-${currentYear}`,
      icon: Moon,
      color: "blue",
      planet: "Saturn",
      sanskrit: "Shani",
    },
    {
      key: "mercury",
      href: `/transits/mercury-retrograde-${currentYear}`,
      icon: RotateCcw,
      color: "purple",
      planet: "Mercury",
      sanskrit: "Budh",
    },
  ];

  return (
    <div className="py-12 lg:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-amber-100 text-amber-800">
            {t('transits.index.badge', 'Vedic Astrology')}
          </Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {withCurrentYear(t('transits.index.title', 'Planetary Transits {year}'))}
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {withCurrentYear(t('transits.index.subtitle', 'Explore how major planetary transits in {year} will affect your zodiac sign. Get detailed predictions for Jupiter, Saturn, and Mercury movements.'))}
          </p>
        </div>

        <Card className="border-amber-200 bg-amber-50 mb-12">
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              {t('transits.index.whatAreTransits', 'What are Planetary Transits?')}
            </h2>
            <p className="text-gray-700">
              {t('transits.index.description', 'In Vedic astrology, planetary transits (Gochar) refer to the movement of planets through different zodiac signs. These transits significantly influence various aspects of life including career, relationships, health, and finances. Understanding transits helps you prepare for upcoming changes and make the most of favorable periods.')}
            </p>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {transitsList.map((transit) => {
            const Icon = transit.icon;
            const colorClasses = {
              amber: "border-amber-200 hover:border-amber-300",
              blue: "border-blue-200 hover:border-blue-300",
              purple: "border-purple-200 hover:border-purple-300",
            };
            const iconColorClasses = {
              amber: "text-amber-600 bg-amber-100",
              blue: "text-blue-600 bg-blue-100",
              purple: "text-purple-600 bg-purple-100",
            };
            const badgeClasses = {
              amber: "bg-amber-100 text-amber-800",
              blue: "bg-blue-100 text-blue-800",
              purple: "bg-purple-100 text-purple-800",
            };

            return (
              <Card 
                key={transit.key} 
                className={`${colorClasses[transit.color as keyof typeof colorClasses]} transition-all hover:shadow-lg`}
              >
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-3 rounded-lg ${iconColorClasses[transit.color as keyof typeof iconColorClasses]}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <Badge className={badgeClasses[transit.color as keyof typeof badgeClasses]}>
                      {transit.sanskrit}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">
                    {withCurrentYear(t(`transits.index.${transit.key}.title`, `${transit.planet} Transit {year}`))}
                  </CardTitle>
                  <CardDescription>
                    {t(`transits.index.${transit.key}.description`, '')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-4">
                    {withCurrentYear(t(`transits.index.${transit.key}.summary`, ''))}
                  </p>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={transit.href}>
                      {t('transits.index.viewDetails', 'View Details')} <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card className="border-indigo-200 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-2">
                {withCurrentYear(t('transits.index.eclipses.title', 'Eclipses {year}'))}
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                {t('transits.index.eclipses.description', 'Solar and lunar eclipse dates, timings, and their astrological significance.')}
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/eclipses-${currentYear}`}>
                  {t('transits.index.viewEclipses', 'View Eclipse Calendar')} <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-green-200 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-2">
                {withCurrentYear(t('transits.index.festivals.title', 'Festival Calendar {year}'))}
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                {t('transits.index.festivals.description', 'Important Hindu festivals, muhurtas, and auspicious dates based on Panchang.')}
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/festival-calendar-${currentYear}`}>
                  {t('transits.index.viewFestivals', 'View Festival Calendar')} <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              {t('transits.index.personalizedTitle', 'Get Personalized Transit Analysis')}
            </h2>
            <p className="text-gray-700 mb-4">
              {t('transits.index.personalizedDescription', 'For accurate transit predictions based on your exact birth chart, generate your free Kundli or use our transit calculator.')}
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild>
                <Link href="/tools/kundli-calculator">
                  {t('transits.index.generateKundli', 'Generate Free Kundli')}
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/tools/transit-calculator">
                  {t('transits.index.transitCalculator', 'Transit Calculator')}
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/planetary-tracker">
                  {t('transits.index.planetaryTracker', 'Live Planetary Positions')}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
