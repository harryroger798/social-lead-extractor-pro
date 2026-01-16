"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const saturnEffects = [
  {
    sign: "Aries",
    hindi: "मेष",
    house: "12th House",
    effect: "Challenging",
    description: "Saturn transits your 12th house of losses, expenses, and spirituality. This period encourages spiritual growth but may bring increased expenses and sleep issues. Foreign connections are highlighted.",
    advice: "Focus on spiritual practices, meditation, and charitable activities. Avoid unnecessary expenses and maintain healthy sleep habits.",
    areas: ["Spirituality", "Expenses", "Foreign matters", "Sleep"],
  },
  {
    sign: "Taurus",
    hindi: "वृषभ",
    house: "11th House",
    effect: "Favorable",
    description: "Saturn blesses your 11th house of gains and friendships. This is an excellent period for achieving long-term goals, expanding social networks, and increasing income through persistent efforts.",
    advice: "Network actively, pursue long-term goals, and invest in friendships. Your patience will be rewarded with material gains.",
    areas: ["Income", "Friendships", "Goals", "Social circle"],
  },
  {
    sign: "Gemini",
    hindi: "मिथुन",
    house: "10th House",
    effect: "Mixed",
    description: "Saturn transits your career house, bringing both challenges and opportunities. Hard work leads to recognition, but expect increased responsibilities. Authority figures play important roles.",
    advice: "Stay dedicated to your work, maintain professional ethics, and be patient with career progress. Avoid shortcuts.",
    areas: ["Career", "Reputation", "Authority", "Public image"],
  },
  {
    sign: "Cancer",
    hindi: "कर्क",
    house: "9th House",
    effect: "Favorable",
    description: "Saturn in your 9th house supports higher learning, long-distance travel, and spiritual growth. Father figures and teachers play important roles. Legal matters are favored.",
    advice: "Pursue higher education, plan meaningful travels, and strengthen your spiritual foundation. Respect elders and teachers.",
    areas: ["Education", "Travel", "Spirituality", "Father"],
  },
  {
    sign: "Leo",
    hindi: "सिंह",
    house: "8th House",
    effect: "Challenging",
    description: "Saturn transits your 8th house of transformation. This period brings deep changes, possible health concerns, and matters related to inheritance or shared resources.",
    advice: "Focus on health, manage joint finances carefully, and embrace transformation. Regular health check-ups are recommended.",
    areas: ["Transformation", "Health", "Inheritance", "Shared resources"],
  },
  {
    sign: "Virgo",
    hindi: "कन्या",
    house: "7th House",
    effect: "Mixed",
    description: "Saturn in your partnership house affects marriage and business relationships. Existing relationships are tested, but those that survive become stronger. New commitments require careful consideration.",
    advice: "Work on relationship communication, be patient with partners, and avoid hasty commitments. Quality over quantity in relationships.",
    areas: ["Marriage", "Partnerships", "Contracts", "Public dealings"],
  },
  {
    sign: "Libra",
    hindi: "तुला",
    house: "6th House",
    effect: "Favorable",
    description: "Saturn supports your 6th house of health, service, and daily work. This is excellent for overcoming enemies, improving health habits, and excelling in service-oriented work.",
    advice: "Establish healthy routines, focus on service to others, and address health issues proactively. Legal victories are possible.",
    areas: ["Health", "Service", "Enemies", "Daily work"],
  },
  {
    sign: "Scorpio",
    hindi: "वृश्चिक",
    house: "5th House",
    effect: "Challenging",
    description: "Saturn transits your 5th house affecting creativity, children, and romance. Creative projects require extra effort. Matters related to children need attention. Romance may feel restricted.",
    advice: "Be patient with creative endeavors, give extra attention to children, and don't rush romantic decisions. Speculative investments should be avoided.",
    areas: ["Creativity", "Children", "Romance", "Speculation"],
  },
  {
    sign: "Sagittarius",
    hindi: "धनु",
    house: "4th House",
    effect: "Mixed",
    description: "Saturn in your 4th house affects home, mother, and emotional peace. Property matters require patience. Domestic responsibilities increase. Inner emotional work is necessary.",
    advice: "Focus on home improvements, care for elderly family members, and work on emotional stability. Property decisions need careful thought.",
    areas: ["Home", "Mother", "Property", "Emotional peace"],
  },
  {
    sign: "Capricorn",
    hindi: "मकर",
    house: "3rd House",
    effect: "Favorable",
    description: "Saturn supports your 3rd house of communication and courage. This is excellent for writing, learning new skills, and improving relationships with siblings. Short travels are productive.",
    advice: "Develop communication skills, learn new things, and strengthen sibling bonds. Your efforts in writing and speaking will be rewarded.",
    areas: ["Communication", "Siblings", "Skills", "Short travels"],
  },
  {
    sign: "Aquarius",
    hindi: "कुंभ",
    house: "2nd House",
    effect: "Mixed",
    description: "Saturn transits your 2nd house of wealth and family. Financial discipline is essential. Family responsibilities increase. Speech and eating habits need attention.",
    advice: "Budget carefully, save for the future, and maintain family harmony. Avoid harsh speech and unhealthy eating habits.",
    areas: ["Wealth", "Family", "Speech", "Food habits"],
  },
  {
    sign: "Pisces",
    hindi: "मीन",
    house: "1st House (Sade Sati Peak)",
    effect: "Challenging",
    description: "Saturn transits over your Moon sign - the peak of Sade Sati. This is a period of significant personal transformation, health focus, and karmic lessons. Self-discipline is crucial.",
    advice: "Prioritize health, practice patience, and embrace personal growth. This challenging period builds character and resilience.",
    areas: ["Self", "Health", "Identity", "Personal growth"],
  },
];

const importantDates = [
  { date: "March 29, 2025", event: "Saturn enters Pisces", description: "Beginning of Saturn's transit through Pisces" },
  { date: "June 14, 2026", event: "Saturn Retrograde begins", description: "Saturn appears to move backward - review and reassess" },
  { date: "November 2, 2026", event: "Saturn Direct", description: "Saturn resumes forward motion - progress resumes" },
  { date: "June 2, 2028", event: "Saturn enters Aries", description: "End of Saturn's Pisces transit" },
];

const remedies = [
  "Recite Shani Chalisa or Shani Stotra on Saturdays",
  "Donate black sesame seeds, mustard oil, or iron items on Saturdays",
  "Feed crows and black dogs on Saturdays",
  "Light a sesame oil lamp under a Peepal tree on Saturdays",
  "Wear a Blue Sapphire (Neelam) only after proper astrological consultation",
  "Chant 'Om Sham Shanicharaya Namaha' 108 times daily",
  "Visit Shani temples, especially on Saturdays",
  "Serve elderly people and the disabled",
  "Practice patience, discipline, and ethical conduct",
  "Avoid starting new ventures on Saturdays during challenging transits",
];

export default function SaturnTransit2026Page() {
  const { t } = useLanguage();
  return (
    <div className="py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-blue-100 text-blue-800">Planetary Transit</Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Saturn Transit 2026 (Shani Gochar)
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Complete guide to Saturn&apos;s transit through Pisces in 2026. Understand how 
            Shani Gochar affects your zodiac sign and learn effective remedies.
          </p>
        </div>

        <Card className="border-blue-200 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Saturn Transit Overview 2026
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Current Position</h3>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-lg font-bold text-blue-700">Saturn in Pisces (Meena Rashi)</p>
                  <p className="text-sm text-blue-600">March 2025 - June 2028</p>
                  <p className="text-sm text-gray-600 mt-2">
                    Saturn spends approximately 2.5 years in each zodiac sign. During its 
                    transit through Pisces, themes of spirituality, compassion, and karmic 
                    completion are emphasized for all signs.
                  </p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Sade Sati Status</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 bg-red-50 rounded-lg p-3">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <span className="text-sm"><strong>Aquarius:</strong> Rising Phase (12th from Moon)</span>
                  </div>
                  <div className="flex items-center gap-2 bg-red-50 rounded-lg p-3">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <span className="text-sm"><strong>Pisces:</strong> Peak Phase (Over Moon)</span>
                  </div>
                  <div className="flex items-center gap-2 bg-orange-50 rounded-lg p-3">
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                    <span className="text-sm"><strong>Aries:</strong> Setting Phase (2nd from Moon)</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-200 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-600" />
              Important Dates in 2026
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {importantDates.map((item, index) => (
                <div key={index} className="bg-amber-50 rounded-lg p-4">
                  <Badge className="bg-amber-500 mb-2">{item.date}</Badge>
                  <h4 className="font-semibold text-gray-900">{item.event}</h4>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">Effects on Each Zodiac Sign</h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {saturnEffects.map((item) => (
            <Card 
              key={item.sign} 
              className={`border-2 ${
                item.effect === "Favorable" ? "border-green-200" :
                item.effect === "Challenging" ? "border-red-200" :
                "border-amber-200"
              }`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{item.sign}</CardTitle>
                  <Badge className={
                    item.effect === "Favorable" ? "bg-green-500" :
                    item.effect === "Challenging" ? "bg-red-500" :
                    "bg-amber-500"
                  }>
                    {item.effect}
                  </Badge>
                </div>
                <CardDescription>{item.hindi} | {item.house}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 mb-3">{item.description}</p>
                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">Advice</h4>
                  <p className="text-xs text-gray-600">{item.advice}</p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {item.areas.map((area) => (
                    <Badge key={area} variant="outline" className="text-xs">
                      {area}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-indigo-200 mb-8">
          <CardHeader>
            <CardTitle>Saturn Transit Remedies (Shani Shanti Upay)</CardTitle>
            <CardDescription>
              Effective remedies to mitigate challenging Saturn effects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {remedies.map((remedy, index) => (
                <div key={index} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{remedy}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="border-amber-200 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-2">Sade Sati Calculator</h3>
              <p className="text-gray-600 text-sm mb-4">
                Check if you&apos;re under Sade Sati influence.
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/tools/sade-sati-calculator">
                  Check Now <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-amber-200 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-2">Jupiter Transit 2026</h3>
              <p className="text-gray-600 text-sm mb-4">
                Balance Saturn with Jupiter&apos;s blessings.
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
              <h3 className="font-semibold text-lg mb-2">2026 Horoscope</h3>
              <p className="text-gray-600 text-sm mb-4">
                Complete yearly predictions for your sign.
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/horoscope/2026">
                  Read Horoscope <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="border-blue-200 bg-blue-50 mt-12">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Understanding Saturn Transit in Vedic Astrology
            </h2>
            <div className="prose prose-blue max-w-none">
              <p className="text-gray-700 mb-4">
                Saturn (Shani) is known as the planet of karma, discipline, and justice in 
                Vedic astrology. Its transit through each zodiac sign lasts approximately 
                2.5 years and brings significant lessons and transformations to the areas 
                of life governed by that sign in your birth chart.
              </p>
              <p className="text-gray-700 mb-4">
                Saturn&apos;s transit through Pisces (2025-2028) emphasizes themes of 
                spirituality, compassion, endings, and karmic completion. This water sign 
                transit encourages letting go of material attachments and focusing on 
                spiritual growth and service to others.
              </p>
              <p className="text-gray-700">
                While Saturn is often feared, it is actually a great teacher that rewards 
                hard work, patience, and ethical conduct. Those who embrace Saturn&apos;s 
                lessons with discipline and humility often emerge stronger and wiser from 
                its transits.
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
            headline: "Saturn Transit 2026 - Effects on All Zodiac Signs",
            description: "Complete guide to Saturn Transit 2026 with predictions and remedies",
            author: {
              "@type": "Organization",
              name: "VedicStarAstro",
            },
            datePublished: "2025-12-01",
          }),
        }}
      />
    </div>
  );
}
