"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Star,
  ArrowRight,
  TrendingUp,
  Heart,
  Briefcase,
  Wallet,
} from "lucide-react";

export const metadata: Metadata = {
  title: "2026 Horoscope - Yearly Predictions for All Zodiac Signs | VedicStarAstro",
  description: "Read your complete 2026 horoscope predictions for all 12 zodiac signs. Get insights on love, career, finance, and health for the year ahead.",
  keywords: [
    "2026 horoscope",
    "yearly horoscope 2026",
    "zodiac predictions 2026",
    "astrology 2026",
    "aries 2026",
    "taurus 2026",
    "gemini 2026",
    "cancer 2026",
    "leo 2026",
    "virgo 2026",
    "libra 2026",
    "scorpio 2026",
    "sagittarius 2026",
    "capricorn 2026",
    "aquarius 2026",
    "pisces 2026",
  ],
};

const zodiacSigns = [
  {
    name: "Aries",
    hindi: "मेष",
    symbol: "♈",
    dates: "Mar 21 - Apr 19",
    element: "Fire",
    overview: "2026 brings transformative energy for Aries. Jupiter's influence in the first half promises career growth, while Saturn encourages financial discipline. Love life sees positive developments after mid-year.",
    rating: { overall: 4, love: 4, career: 5, finance: 3 },
    highlights: ["Career breakthrough in Q2", "New relationship opportunities", "Property investments favorable"],
  },
  {
    name: "Taurus",
    hindi: "वृषभ",
    symbol: "♉",
    dates: "Apr 20 - May 20",
    element: "Earth",
    overview: "A year of stability and growth for Taurus. Financial gains are indicated, especially through investments. Relationships deepen, and health requires attention in the latter half.",
    rating: { overall: 4, love: 5, career: 4, finance: 4 },
    highlights: ["Strong financial gains", "Marriage prospects for singles", "Health focus needed in Q4"],
  },
  {
    name: "Gemini",
    hindi: "मिथुन",
    symbol: "♊",
    dates: "May 21 - Jun 20",
    element: "Air",
    overview: "Communication and networking bring success in 2026. Career changes are possible, and travel opportunities arise. Love life may face some challenges requiring patience.",
    rating: { overall: 4, love: 3, career: 4, finance: 4 },
    highlights: ["Career advancement through networking", "International travel likely", "Communication skills shine"],
  },
  {
    name: "Cancer",
    hindi: "कर्क",
    symbol: "♋",
    dates: "Jun 21 - Jul 22",
    element: "Water",
    overview: "Home and family take center stage in 2026. Property matters resolve favorably. Career sees steady progress, and emotional well-being improves significantly.",
    rating: { overall: 4, love: 4, career: 4, finance: 4 },
    highlights: ["Property acquisition favorable", "Family harmony improves", "Emotional healing journey"],
  },
  {
    name: "Leo",
    hindi: "सिंह",
    symbol: "♌",
    dates: "Jul 23 - Aug 22",
    element: "Fire",
    overview: "Creative pursuits flourish in 2026. Recognition and fame are indicated for Leos. Romance blooms, and children bring joy. Financial management needs attention.",
    rating: { overall: 5, love: 5, career: 5, finance: 3 },
    highlights: ["Creative success and recognition", "Romantic fulfillment", "Children bring happiness"],
  },
  {
    name: "Virgo",
    hindi: "कन्या",
    symbol: "♍",
    dates: "Aug 23 - Sep 22",
    element: "Earth",
    overview: "Health and service themes dominate 2026. Career improvements through skill development. Relationships require effort, but rewards come to those who persist.",
    rating: { overall: 4, love: 3, career: 4, finance: 4 },
    highlights: ["Health improvements possible", "Skill development pays off", "Service-oriented success"],
  },
  {
    name: "Libra",
    hindi: "तुला",
    symbol: "♎",
    dates: "Sep 23 - Oct 22",
    element: "Air",
    overview: "Partnerships and relationships are highlighted in 2026. Business partnerships prove beneficial. Marriage is favored for singles. Legal matters resolve positively.",
    rating: { overall: 4, love: 5, career: 4, finance: 4 },
    highlights: ["Marriage prospects excellent", "Business partnerships thrive", "Legal victories possible"],
  },
  {
    name: "Scorpio",
    hindi: "वृश्चिक",
    symbol: "♏",
    dates: "Oct 23 - Nov 21",
    element: "Water",
    overview: "Transformation and rebirth define 2026 for Scorpio. Hidden matters come to light. Financial gains through inheritance or insurance. Health requires vigilance.",
    rating: { overall: 4, love: 4, career: 4, finance: 5 },
    highlights: ["Unexpected financial gains", "Deep transformation period", "Research and investigation success"],
  },
  {
    name: "Sagittarius",
    hindi: "धनु",
    symbol: "♐",
    dates: "Nov 22 - Dec 21",
    element: "Fire",
    overview: "Higher learning and travel expand horizons in 2026. Spiritual growth is emphasized. Father figures play important roles. Publishing and teaching opportunities arise.",
    rating: { overall: 4, love: 4, career: 4, finance: 4 },
    highlights: ["Educational achievements", "Spiritual awakening", "Long-distance travel favorable"],
  },
  {
    name: "Capricorn",
    hindi: "मकर",
    symbol: "♑",
    dates: "Dec 22 - Jan 19",
    element: "Earth",
    overview: "Career reaches new heights in 2026. Professional recognition and promotions are likely. Work-life balance needs attention. Authority figures support your growth.",
    rating: { overall: 5, love: 3, career: 5, finance: 5 },
    highlights: ["Major career advancement", "Professional recognition", "Leadership opportunities"],
  },
  {
    name: "Aquarius",
    hindi: "कुंभ",
    symbol: "♒",
    dates: "Jan 20 - Feb 18",
    element: "Air",
    overview: "Social connections and friendships bring opportunities in 2026. Group activities prove beneficial. Hopes and wishes manifest. Technology-related ventures succeed.",
    rating: { overall: 4, love: 4, career: 4, finance: 4 },
    highlights: ["Social network expansion", "Dreams becoming reality", "Technology ventures succeed"],
  },
  {
    name: "Pisces",
    hindi: "मीन",
    symbol: "♓",
    dates: "Feb 19 - Mar 20",
    element: "Water",
    overview: "Spiritual and creative pursuits dominate 2026. Intuition guides important decisions. Some isolation may be needed for growth. Hidden enemies may surface.",
    rating: { overall: 4, love: 4, career: 3, finance: 4 },
    highlights: ["Spiritual enlightenment", "Creative inspiration flows", "Intuitive guidance strong"],
  },
];

const majorTransits2026 = [
  {
    planet: "Saturn",
    event: "Saturn in Pisces",
    period: "Throughout 2026",
    effect: "Discipline in spiritual matters, karmic lessons in compassion",
  },
  {
    planet: "Jupiter",
    event: "Jupiter enters Cancer",
    period: "Mid-2026",
    effect: "Expansion in home, family, and emotional security",
  },
  {
    planet: "Rahu-Ketu",
    event: "Rahu in Pisces, Ketu in Virgo",
    period: "Throughout 2026",
    effect: "Focus on spirituality vs. practical service",
  },
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
  return (
    <div className="py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-amber-100 text-amber-800">Yearly Predictions</Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            2026 Horoscope - Yearly Predictions
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Discover what 2026 has in store for you. Read comprehensive yearly horoscope 
            predictions for all 12 zodiac signs covering love, career, finance, and health.
          </p>
        </div>

        <Card className="border-amber-200 mb-8">
          <CardHeader>
            <CardTitle>Major Planetary Transits in 2026</CardTitle>
            <CardDescription>
              Key astrological events shaping the year ahead
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {majorTransits2026.map((transit, index) => (
                <div key={index} className="bg-amber-50 rounded-lg p-4">
                  <Badge className="bg-amber-500 mb-2">{transit.planet}</Badge>
                  <h3 className="font-semibold text-gray-900">{transit.event}</h3>
                  <p className="text-sm text-gray-600 mb-2">{transit.period}</p>
                  <p className="text-sm text-amber-700">{transit.effect}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {zodiacSigns.map((sign) => (
            <Card key={sign.name} className="border-amber-200 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{sign.symbol}</span>
                    <div>
                      <CardTitle className="text-xl">{sign.name}</CardTitle>
                      <p className="text-sm text-gray-500">{sign.hindi} | {sign.dates}</p>
                    </div>
                  </div>
                  <Badge className={
                    sign.element === "Fire" ? "bg-red-500" :
                    sign.element === "Earth" ? "bg-green-500" :
                    sign.element === "Air" ? "bg-cyan-500" :
                    "bg-blue-500"
                  }>
                    {sign.element}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4">{sign.overview}</p>
                
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-amber-600" />
                    <span className="text-sm">Overall</span>
                    <RatingStars rating={sign.rating.overall} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-pink-500" />
                    <span className="text-sm">Love</span>
                    <RatingStars rating={sign.rating.love} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-blue-500" />
                    <span className="text-sm">Career</span>
                    <RatingStars rating={sign.rating.career} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Finance</span>
                    <RatingStars rating={sign.rating.finance} />
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">2026 Highlights</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {sign.highlights.map((highlight, i) => (
                      <li key={i}>• {highlight}</li>
                    ))}
                  </ul>
                </div>

                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/horoscope/yearly/${sign.name.toLowerCase()}`}>
                    Read Full 2026 Horoscope <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 grid md:grid-cols-4 gap-6">
          <Card className="border-amber-200 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-2">Saturn Transit 2026</h3>
              <p className="text-gray-600 text-sm mb-4">
                Detailed Saturn transit predictions and effects.
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/transits/saturn-transit-2026">
                  Read More <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-amber-200 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-2">Jupiter Transit 2026</h3>
              <p className="text-gray-600 text-sm mb-4">
                Jupiter&apos;s movement and its impact on signs.
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/transits/jupiter-transit-2026">
                  Read More <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-amber-200 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-2">Mercury Retrograde 2026</h3>
              <p className="text-gray-600 text-sm mb-4">
                Dates and survival guide for retrogrades.
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/transits/mercury-retrograde-2026">
                  Read More <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-amber-200 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-2">Eclipses 2026</h3>
              <p className="text-gray-600 text-sm mb-4">
                Solar and lunar eclipse dates and effects.
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/eclipses-2026">
                  Read More <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="border-amber-200 bg-amber-50 mt-12">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              2026 Astrological Overview
            </h2>
            <div className="prose prose-amber max-w-none">
              <p className="text-gray-700 mb-4">
                2026 promises to be a year of significant transformation and growth across all 
                zodiac signs. With Saturn continuing its transit through Pisces, themes of 
                spiritual discipline, karmic resolution, and compassionate service remain 
                prominent throughout the year.
              </p>
              <p className="text-gray-700 mb-4">
                Jupiter&apos;s movement brings expansion and opportunities, particularly in areas 
                related to home, family, and emotional security. The Rahu-Ketu axis in Pisces-Virgo 
                creates a tension between spiritual aspirations and practical responsibilities, 
                encouraging balance between dreams and daily duties.
              </p>
              <p className="text-gray-700">
                The four eclipses in 2026 mark important turning points for collective and 
                individual evolution. Pay attention to the eclipse dates and their effects on 
                your specific zodiac sign for optimal planning and decision-making throughout 
                the year.
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
            headline: "2026 Horoscope - Yearly Predictions for All Zodiac Signs",
            description: "Complete 2026 horoscope predictions for all 12 zodiac signs",
            author: {
              "@type": "Organization",
              name: "VedicStarAstro",
            },
            publisher: {
              "@type": "Organization",
              name: "VedicStarAstro",
            },
            datePublished: "2025-12-01",
            dateModified: "2026-01-01",
          }),
        }}
      />
    </div>
  );
}
