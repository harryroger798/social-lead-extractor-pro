"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCurrentYear, withCurrentYear } from "@/lib/utils";
import {
  Star,
  ArrowRight,
  ArrowLeft,
  TrendingUp,
  Heart,
  Briefcase,
  Wallet,
  Activity,
  Users,
  GraduationCap,
  Home,
  Calendar,
} from "lucide-react";

const zodiacSignsData: Record<string, {
  symbol: string;
  dates: string;
  element: string;
  ruler: string;
  rating: { overall: number; love: number; career: number; finance: number; health: number };
}> = {
  aries: { symbol: "♈", dates: "Mar 21 - Apr 19", element: "Fire", ruler: "Mars", rating: { overall: 4, love: 4, career: 5, finance: 3, health: 4 } },
  taurus: { symbol: "♉", dates: "Apr 20 - May 20", element: "Earth", ruler: "Venus", rating: { overall: 4, love: 5, career: 4, finance: 4, health: 4 } },
  gemini: { symbol: "♊", dates: "May 21 - Jun 20", element: "Air", ruler: "Mercury", rating: { overall: 4, love: 3, career: 4, finance: 4, health: 3 } },
  cancer: { symbol: "♋", dates: "Jun 21 - Jul 22", element: "Water", ruler: "Moon", rating: { overall: 4, love: 4, career: 4, finance: 4, health: 4 } },
  leo: { symbol: "♌", dates: "Jul 23 - Aug 22", element: "Fire", ruler: "Sun", rating: { overall: 5, love: 5, career: 5, finance: 3, health: 4 } },
  virgo: { symbol: "♍", dates: "Aug 23 - Sep 22", element: "Earth", ruler: "Mercury", rating: { overall: 4, love: 3, career: 4, finance: 4, health: 5 } },
  libra: { symbol: "♎", dates: "Sep 23 - Oct 22", element: "Air", ruler: "Venus", rating: { overall: 4, love: 5, career: 4, finance: 4, health: 4 } },
  scorpio: { symbol: "♏", dates: "Oct 23 - Nov 21", element: "Water", ruler: "Mars", rating: { overall: 4, love: 4, career: 4, finance: 5, health: 4 } },
  sagittarius: { symbol: "♐", dates: "Nov 22 - Dec 21", element: "Fire", ruler: "Jupiter", rating: { overall: 4, love: 4, career: 4, finance: 4, health: 4 } },
  capricorn: { symbol: "♑", dates: "Dec 22 - Jan 19", element: "Earth", ruler: "Saturn", rating: { overall: 5, love: 3, career: 5, finance: 5, health: 4 } },
  aquarius: { symbol: "♒", dates: "Jan 20 - Feb 18", element: "Air", ruler: "Saturn", rating: { overall: 4, love: 4, career: 4, finance: 4, health: 4 } },
  pisces: { symbol: "♓", dates: "Feb 19 - Mar 20", element: "Water", ruler: "Jupiter", rating: { overall: 4, love: 4, career: 3, finance: 4, health: 4 } },
};

const zodiacOrder = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];

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

export default function YearlyHoroscopePage() {
  const params = useParams();
  const { t } = useLanguage();
  const currentYear = getCurrentYear();
  
  const sign = (params.sign as string)?.toLowerCase();
  const signData = zodiacSignsData[sign];
  
  if (!signData) {
    return (
      <div className="py-12 lg:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {t('horoscope.yearly.notFound', 'Zodiac Sign Not Found')}
          </h1>
          <p className="text-gray-600 mb-6">
            {t('horoscope.yearly.notFoundDesc', 'The zodiac sign you are looking for does not exist.')}
          </p>
          <Button asChild>
            <Link href="/horoscope">
              {t('horoscope.yearly.backToHoroscope', 'Back to Horoscope')}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const currentIndex = zodiacOrder.indexOf(sign);
  const prevSign = currentIndex > 0 ? zodiacOrder[currentIndex - 1] : zodiacOrder[11];
  const nextSign = currentIndex < 11 ? zodiacOrder[currentIndex + 1] : zodiacOrder[0];

  const sections = [
    { key: 'overview', icon: TrendingUp, color: 'amber' },
    { key: 'love', icon: Heart, color: 'pink' },
    { key: 'career', icon: Briefcase, color: 'blue' },
    { key: 'finance', icon: Wallet, color: 'green' },
    { key: 'health', icon: Activity, color: 'red' },
    { key: 'family', icon: Users, color: 'purple' },
    { key: 'education', icon: GraduationCap, color: 'indigo' },
    { key: 'property', icon: Home, color: 'teal' },
  ];

  const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];

  return (
    <div className="py-12 lg:py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/horoscope/yearly/${prevSign}`}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              {t(`horoscope.signs.${prevSign}`, prevSign)}
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/horoscope/yearly/${nextSign}`}>
              {t(`horoscope.signs.${nextSign}`, nextSign)}
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </div>

        <div className="text-center mb-12">
          <span className="text-6xl md:text-8xl block mb-4">{signData.symbol}</span>
          <Badge className="mb-4 bg-amber-100 text-amber-800">
            {withCurrentYear(t('horoscope.yearly.badge', '{year} Horoscope'))}
          </Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2">
            {withCurrentYear(t(`horoscope.yearly.title.${sign}`, `${sign.charAt(0).toUpperCase() + sign.slice(1)} Horoscope {year}`))}
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            {t(`horoscope.yearly.hindi.${sign}`, '')} | {signData.dates}
          </p>
          <div className="flex justify-center gap-4 text-sm text-gray-500">
            <span>{t('horoscope.yearly.element', 'Element')}: <strong>{t(`horoscope.elements.${signData.element.toLowerCase()}`, signData.element)}</strong></span>
            <span>{t('horoscope.yearly.ruler', 'Ruler')}: <strong>{t(`horoscope.planets.${signData.ruler.toLowerCase()}`, signData.ruler)}</strong></span>
          </div>
        </div>

        <Card className="border-amber-200 mb-8">
          <CardHeader>
            <CardTitle>{withCurrentYear(t('horoscope.yearly.ratings', '{year} Ratings'))}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-3 bg-amber-50 rounded-lg">
                <TrendingUp className="w-6 h-6 mx-auto mb-2 text-amber-600" />
                <p className="text-sm font-medium mb-1">{t('horoscope.yearly.labels.overall', 'Overall')}</p>
                <RatingStars rating={signData.rating.overall} />
              </div>
              <div className="text-center p-3 bg-pink-50 rounded-lg">
                <Heart className="w-6 h-6 mx-auto mb-2 text-pink-600" />
                <p className="text-sm font-medium mb-1">{t('horoscope.yearly.labels.love', 'Love')}</p>
                <RatingStars rating={signData.rating.love} />
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <Briefcase className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                <p className="text-sm font-medium mb-1">{t('horoscope.yearly.labels.career', 'Career')}</p>
                <RatingStars rating={signData.rating.career} />
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <Wallet className="w-6 h-6 mx-auto mb-2 text-green-600" />
                <p className="text-sm font-medium mb-1">{t('horoscope.yearly.labels.finance', 'Finance')}</p>
                <RatingStars rating={signData.rating.finance} />
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <Activity className="w-6 h-6 mx-auto mb-2 text-red-600" />
                <p className="text-sm font-medium mb-1">{t('horoscope.yearly.labels.health', 'Health')}</p>
                <RatingStars rating={signData.rating.health} />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6 mb-12">
          {sections.map((section) => {
            const Icon = section.icon;
            const colorClasses: Record<string, string> = {
              amber: 'border-amber-200 bg-amber-50',
              pink: 'border-pink-200 bg-pink-50',
              blue: 'border-blue-200 bg-blue-50',
              green: 'border-green-200 bg-green-50',
              red: 'border-red-200 bg-red-50',
              purple: 'border-purple-200 bg-purple-50',
              indigo: 'border-indigo-200 bg-indigo-50',
              teal: 'border-teal-200 bg-teal-50',
            };
            const iconColorClasses: Record<string, string> = {
              amber: 'text-amber-600',
              pink: 'text-pink-600',
              blue: 'text-blue-600',
              green: 'text-green-600',
              red: 'text-red-600',
              purple: 'text-purple-600',
              indigo: 'text-indigo-600',
              teal: 'text-teal-600',
            };

            return (
              <Card key={section.key} className={colorClasses[section.color]}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon className={`w-5 h-5 ${iconColorClasses[section.color]}`} />
                    {withCurrentYear(t(`horoscope.yearly.sections.${section.key}.title`, `${section.key.charAt(0).toUpperCase() + section.key.slice(1)} {year}`))}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">
                    {withCurrentYear(t(`horoscope.yearly.${sign}.${section.key}`, t(`horoscope.yearly.default.${section.key}`, `Your ${section.key} predictions for {year} will be influenced by planetary transits. Check back for detailed predictions.`)))}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="border-indigo-200 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              {withCurrentYear(t('horoscope.yearly.monthlyOverview', 'Month-by-Month Overview {year}'))}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {months.map((month) => (
                <div key={month} className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {t(`horoscope.months.${month}`, month.charAt(0).toUpperCase() + month.slice(1))}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {t(`horoscope.yearly.${sign}.months.${month}`, t('horoscope.yearly.default.monthSummary', 'Planetary influences will shape this month. Focus on balance and growth.'))}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-200 mb-8">
          <CardHeader>
            <CardTitle>{withCurrentYear(t('horoscope.yearly.luckyFactors', 'Lucky Factors for {year}'))}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-amber-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">{t('horoscope.yearly.lucky.numbers', 'Lucky Numbers')}</p>
                <p className="font-bold text-amber-700">{t(`horoscope.yearly.${sign}.luckyNumbers`, '3, 7, 9')}</p>
              </div>
              <div className="text-center p-4 bg-amber-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">{t('horoscope.yearly.lucky.colors', 'Lucky Colors')}</p>
                <p className="font-bold text-amber-700">{t(`horoscope.yearly.${sign}.luckyColors`, 'Red, Gold')}</p>
              </div>
              <div className="text-center p-4 bg-amber-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">{t('horoscope.yearly.lucky.days', 'Lucky Days')}</p>
                <p className="font-bold text-amber-700">{t(`horoscope.yearly.${sign}.luckyDays`, 'Tuesday, Sunday')}</p>
              </div>
              <div className="text-center p-4 bg-amber-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">{t('horoscope.yearly.lucky.gemstone', 'Lucky Gemstone')}</p>
                <p className="font-bold text-amber-700">{t(`horoscope.yearly.${sign}.luckyGemstone`, 'Red Coral')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              {t('horoscope.yearly.personalizedTitle', 'Get Personalized Predictions')}
            </h2>
            <p className="text-gray-700 mb-4">
              {t('horoscope.yearly.personalizedDescription', 'For more accurate predictions based on your exact birth details, generate your free Kundli or consult with our expert astrologers.')}
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild>
                <Link href="/tools/kundli-calculator">
                  {t('horoscope.yearly.generateKundli', 'Generate Free Kundli')}
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/consultation">
                  {t('horoscope.yearly.consultAstrologer', 'Consult an Astrologer')}
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href={`/horoscope/${currentYear}`}>
                  {t('horoscope.yearly.viewAllSigns', 'View All Signs')}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between items-center mt-8">
          <Button variant="outline" asChild>
            <Link href={`/horoscope/yearly/${prevSign}`}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              {t(`horoscope.signs.${prevSign}`, prevSign)}
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/horoscope/yearly/${nextSign}`}>
              {t(`horoscope.signs.${nextSign}`, nextSign)}
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
