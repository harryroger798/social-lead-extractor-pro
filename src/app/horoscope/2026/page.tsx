"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCurrentYear, withCurrentYear } from "@/lib/utils";
import {
  Star,
  ArrowRight,
  TrendingUp,
  Heart,
  Briefcase,
  Wallet,
} from "lucide-react";

const zodiacSignsData = [
  { key: "aries", symbol: "♈", dates: "Mar 21 - Apr 19", element: "Fire", rating: { overall: 4, love: 4, career: 5, finance: 3 } },
  { key: "taurus", symbol: "♉", dates: "Apr 20 - May 20", element: "Earth", rating: { overall: 4, love: 5, career: 4, finance: 4 } },
  { key: "gemini", symbol: "♊", dates: "May 21 - Jun 20", element: "Air", rating: { overall: 4, love: 3, career: 4, finance: 4 } },
  { key: "cancer", symbol: "♋", dates: "Jun 21 - Jul 22", element: "Water", rating: { overall: 4, love: 4, career: 4, finance: 4 } },
  { key: "leo", symbol: "♌", dates: "Jul 23 - Aug 22", element: "Fire", rating: { overall: 5, love: 5, career: 5, finance: 3 } },
  { key: "virgo", symbol: "♍", dates: "Aug 23 - Sep 22", element: "Earth", rating: { overall: 4, love: 3, career: 4, finance: 4 } },
  { key: "libra", symbol: "♎", dates: "Sep 23 - Oct 22", element: "Air", rating: { overall: 4, love: 5, career: 4, finance: 4 } },
  { key: "scorpio", symbol: "♏", dates: "Oct 23 - Nov 21", element: "Water", rating: { overall: 4, love: 4, career: 4, finance: 5 } },
  { key: "sagittarius", symbol: "♐", dates: "Nov 22 - Dec 21", element: "Fire", rating: { overall: 4, love: 4, career: 4, finance: 4 } },
  { key: "capricorn", symbol: "♑", dates: "Dec 22 - Jan 19", element: "Earth", rating: { overall: 5, love: 3, career: 5, finance: 5 } },
  { key: "aquarius", symbol: "♒", dates: "Jan 20 - Feb 18", element: "Air", rating: { overall: 4, love: 4, career: 4, finance: 4 } },
  { key: "pisces", symbol: "♓", dates: "Feb 19 - Mar 20", element: "Water", rating: { overall: 4, love: 4, career: 3, finance: 4 } },
];

const majorTransitsData = [
  { key: "saturn" },
  { key: "jupiter" },
  { key: "rahuKetu" },
];

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${star <= rating ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
        />
      ))}
    </div>
  );
}

export default function Horoscope2026Page() {
  const { t } = useLanguage();
  const currentYear = getCurrentYear();
  return (
    <div className="py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                  <Badge className="mb-4 bg-amber-100 text-amber-800">{t('horoscope.yearlyPredictions', 'Yearly Predictions')}</Badge>
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                    {withCurrentYear(t('horoscope.year.title', '{year} Horoscope - Yearly Predictions'))}
                  </h1>
                  <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                    {withCurrentYear(t('horoscope.year.subtitle', 'Discover what {year} has in store for you. Read comprehensive yearly horoscope predictions for all 12 zodiac signs covering love, career, finance, and health.'))}
                  </p>
                </div>

                <Card className="border-amber-200 mb-8">
                  <CardHeader>
                    <CardTitle>{withCurrentYear(t('horoscope.year.majorTransits', 'Major Planetary Transits in {year}'))}</CardTitle>
                    <CardDescription>
                      {t('horoscope.year.keyEvents', 'Key astrological events shaping the year ahead')}
                    </CardDescription>
                  </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {majorTransitsData.map((transit, index) => (
                                <div key={index} className="bg-amber-50 rounded-lg p-4">
                                  <Badge className="bg-amber-500 mb-2">{t(`horoscope.year.transits.${transit.key}.planet`, transit.key)}</Badge>
                                  <h3 className="font-semibold text-gray-900">{t(`horoscope.year.transits.${transit.key}.event`, '')}</h3>
                                  <p className="text-sm text-gray-600 mb-2">{t(`horoscope.year.transits.${transit.key}.period`, '')}</p>
                                  <p className="text-sm text-amber-700">{t(`horoscope.year.transits.${transit.key}.effect`, '')}</p>
                                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {zodiacSignsData.map((sign) => (
            <Card key={sign.key} className="border-amber-200 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{sign.symbol}</span>
                    <div>
                                            <CardTitle className="text-xl">{t(`horoscope.year.zodiac.${sign.key}.name`, sign.key)}</CardTitle>
                                            <p className="text-sm text-gray-500">{t(`horoscope.year.zodiac.${sign.key}.hindi`, '')} | {sign.dates}</p>
                    </div>
                  </div>
                  <Badge className={
                    sign.element === "Fire" ? "bg-red-500" :
                    sign.element === "Earth" ? "bg-green-500" :
                    sign.element === "Air" ? "bg-cyan-500" :
                    "bg-blue-500"
                  }>
                    {t(`horoscope.year.elements.${sign.element.toLowerCase()}`, sign.element)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4">{t(`horoscope.year.zodiac.${sign.key}.overview`, '')}</p>
                
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-amber-600" />
                    <span className="text-sm">{t('horoscope.year.labels.overall', 'Overall')}</span>
                    <RatingStars rating={sign.rating.overall} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-pink-500" />
                    <span className="text-sm">{t('horoscope.year.labels.love', 'Love')}</span>
                    <RatingStars rating={sign.rating.love} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-blue-500" />
                    <span className="text-sm">{t('horoscope.year.labels.career', 'Career')}</span>
                    <RatingStars rating={sign.rating.career} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-green-500" />
                    <span className="text-sm">{t('horoscope.year.labels.finance', 'Finance')}</span>
                    <RatingStars rating={sign.rating.finance} />
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">{withCurrentYear(t('horoscope.year.highlights', '{year} Highlights'))}</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• {t(`horoscope.year.zodiac.${sign.key}.highlight1`, '')}</li>
                    <li>• {t(`horoscope.year.zodiac.${sign.key}.highlight2`, '')}</li>
                    <li>• {t(`horoscope.year.zodiac.${sign.key}.highlight3`, '')}</li>
                  </ul>
                </div>

                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/horoscope/yearly/${sign.key}`}>
                    {withCurrentYear(t('horoscope.year.readFull', 'Read Full {year} Horoscope'))} <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 grid md:grid-cols-4 gap-6">
          <Card className="border-amber-200 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
                            <h3 className="font-semibold text-lg mb-2">{withCurrentYear(t('horoscope.year.cards.saturnTransit', 'Saturn Transit {year}'))}</h3>
                            <p className="text-gray-600 text-sm mb-4">
                              {t('horoscope.year.cards.saturnDesc', 'Detailed Saturn transit predictions and effects.')}
                            </p>
                            <Button variant="outline" className="w-full" asChild>
                              <Link href={`/transits/saturn-transit-${currentYear}`}>
                  {t('horoscope.year.readMore', 'Read More')} <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-amber-200 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
                            <h3 className="font-semibold text-lg mb-2">{withCurrentYear(t('horoscope.year.cards.jupiterTransit', 'Jupiter Transit {year}'))}</h3>
                            <p className="text-gray-600 text-sm mb-4">
                              {t('horoscope.year.cards.jupiterDesc', "Jupiter's movement and its impact on signs.")}
                            </p>
                            <Button variant="outline" className="w-full" asChild>
                              <Link href={`/transits/jupiter-transit-${currentYear}`}>
                  {t('horoscope.year.readMore', 'Read More')} <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-amber-200 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
                            <h3 className="font-semibold text-lg mb-2">{withCurrentYear(t('horoscope.year.cards.mercuryRetrograde', 'Mercury Retrograde {year}'))}</h3>
                            <p className="text-gray-600 text-sm mb-4">
                              {t('horoscope.year.cards.mercuryDesc', 'Dates and survival guide for retrogrades.')}
                            </p>
                            <Button variant="outline" className="w-full" asChild>
                              <Link href={`/transits/mercury-retrograde-${currentYear}`}>
                  {t('horoscope.year.readMore', 'Read More')} <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-amber-200 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
                            <h3 className="font-semibold text-lg mb-2">{withCurrentYear(t('horoscope.year.cards.eclipses', 'Eclipses {year}'))}</h3>
                            <p className="text-gray-600 text-sm mb-4">
                              {t('horoscope.year.cards.eclipsesDesc', 'Solar and lunar eclipse dates and effects.')}
                            </p>
                            <Button variant="outline" className="w-full" asChild>
                              <Link href={`/eclipses-${currentYear}`}>
                  {t('horoscope.year.readMore', 'Read More')} <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="border-amber-200 bg-amber-50 mt-12">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {withCurrentYear(t('horoscope.year.overviewTitle', '{year} Astrological Overview'))}
            </h2>
            <div className="prose prose-amber max-w-none">
              <p className="text-gray-700 mb-4">
                {withCurrentYear(t('horoscope.year.overviewP1', '{year} promises to be a year of significant transformation and growth across all zodiac signs. With Saturn continuing its transit through Pisces, themes of spiritual discipline, karmic resolution, and compassionate service remain prominent throughout the year.'))}
              </p>
              <p className="text-gray-700 mb-4">
                {t('horoscope.year.overviewP2', "Jupiter's movement brings expansion and opportunities, particularly in areas related to home, family, and emotional security. The Rahu-Ketu axis in Pisces-Virgo creates a tension between spiritual aspirations and practical responsibilities, encouraging balance between dreams and daily duties.")}
              </p>
              <p className="text-gray-700">
                {withCurrentYear(t('horoscope.year.overviewP3', 'The four eclipses in {year} mark important turning points for collective and individual evolution. Pay attention to the eclipse dates and their effects on your specific zodiac sign for optimal planning and decision-making throughout the year.'))}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "Article",
                  headline: `${currentYear} Horoscope - Yearly Predictions for All Zodiac Signs`,
                  description: `Complete ${currentYear} horoscope predictions for all 12 zodiac signs`,
                  author: {
                    "@type": "Organization",
                    name: "VedicStarAstro",
                  },
                  publisher: {
                    "@type": "Organization",
                    name: "VedicStarAstro",
                  },
                  datePublished: `${currentYear - 1}-12-01`,
                  dateModified: `${currentYear}-01-01`,
                }),
              }}
            />
    </div>
  );
}
