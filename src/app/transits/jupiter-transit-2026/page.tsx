"use client";

import { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Calendar,
  Star,
  TrendingUp,
  Clock,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export const metadata: Metadata = {
  title: "Jupiter Transit 2026 - Guru Gochar Effects on All Zodiac Signs | VedicStarAstro",
  description: "Complete guide to Jupiter Transit 2026 (Guru Gochar). Learn how Jupiter's movement affects your zodiac sign with predictions, benefits, and important dates.",
  keywords: [
    "jupiter transit 2026",
    "guru gochar 2026",
    "jupiter in gemini 2026",
    "jupiter in cancer 2026",
    "brihaspati transit",
  ],
};

const jupiterEffects = [
  {
    sign: "Aries",
    hindi: "मेष",
    house: "3rd → 4th House",
    effect: "Favorable",
    description: "Jupiter moves from your 3rd house of communication to 4th house of home mid-year. First half favors learning and siblings; second half brings domestic happiness and property gains.",
    benefits: ["Communication skills", "Sibling harmony", "Property acquisition", "Domestic peace"],
  },
  {
    sign: "Taurus",
    hindi: "वृषभ",
    house: "2nd → 3rd House",
    effect: "Favorable",
    description: "Jupiter transits from wealth house to communication house. Financial growth in first half; enhanced skills and courage in second half. Family matters improve throughout.",
    benefits: ["Wealth accumulation", "Family harmony", "New skills", "Sibling support"],
  },
  {
    sign: "Gemini",
    hindi: "मिथुन",
    house: "1st → 2nd House",
    effect: "Excellent",
    description: "Jupiter blesses your sign in first half bringing personal growth and optimism. Second half focuses on wealth and family. This is your year for expansion!",
    benefits: ["Personal growth", "Optimism", "Financial gains", "Family blessings"],
  },
  {
    sign: "Cancer",
    hindi: "कर्क",
    house: "12th → 1st House",
    effect: "Transformative",
    description: "Jupiter moves from 12th house of spirituality to your sign mid-year. First half favors spiritual growth; second half brings personal expansion and new beginnings.",
    benefits: ["Spiritual growth", "Foreign gains", "Personal expansion", "New opportunities"],
  },
  {
    sign: "Leo",
    hindi: "सिंह",
    house: "11th → 12th House",
    effect: "Mixed",
    description: "Jupiter moves from gains house to expenses house. First half brings income and goal fulfillment; second half encourages spiritual pursuits and foreign connections.",
    benefits: ["Income growth", "Goal achievement", "Spiritual development", "Foreign travel"],
  },
  {
    sign: "Virgo",
    hindi: "कन्या",
    house: "10th → 11th House",
    effect: "Excellent",
    description: "Jupiter transits from career to gains house. Professional success in first half leads to financial rewards in second half. Excellent year for achievements!",
    benefits: ["Career success", "Recognition", "Income increase", "Network expansion"],
  },
  {
    sign: "Libra",
    hindi: "तुला",
    house: "9th → 10th House",
    effect: "Excellent",
    description: "Jupiter moves from fortune house to career house. Luck and higher learning in first half; career advancement in second half. A blessed year overall!",
    benefits: ["Good fortune", "Higher education", "Career growth", "Father's blessings"],
  },
  {
    sign: "Scorpio",
    hindi: "वृश्चिक",
    house: "8th → 9th House",
    effect: "Improving",
    description: "Jupiter moves from transformation house to fortune house. Challenges ease as year progresses. Second half brings luck, travel, and spiritual growth.",
    benefits: ["Transformation", "Hidden gains", "Good fortune", "Spiritual wisdom"],
  },
  {
    sign: "Sagittarius",
    hindi: "धनु",
    house: "7th → 8th House",
    effect: "Mixed",
    description: "Jupiter, your ruler, moves from partnership to transformation house. Relationships blessed in first half; deep changes and hidden gains in second half.",
    benefits: ["Partnership success", "Marriage blessings", "Transformation", "Research gains"],
  },
  {
    sign: "Capricorn",
    hindi: "मकर",
    house: "6th → 7th House",
    effect: "Favorable",
    description: "Jupiter moves from service house to partnership house. Health and work improve in first half; relationships and partnerships blessed in second half.",
    benefits: ["Health improvement", "Victory over enemies", "Partnership success", "Marriage prospects"],
  },
  {
    sign: "Aquarius",
    hindi: "कुंभ",
    house: "5th → 6th House",
    effect: "Mixed",
    description: "Jupiter transits from creativity house to service house. Romance and children blessed in first half; health focus and service success in second half.",
    benefits: ["Creative success", "Children's progress", "Health awareness", "Service recognition"],
  },
  {
    sign: "Pisces",
    hindi: "मीन",
    house: "4th → 5th House",
    effect: "Excellent",
    description: "Jupiter, your ruler, blesses home then creativity. Domestic happiness in first half; romance, children, and creative success in second half. A wonderful year!",
    benefits: ["Home happiness", "Property gains", "Romance", "Creative fulfillment"],
  },
];

const importantDates = [
  { date: "May 14, 2025", event: "Jupiter enters Gemini", description: "Beginning of Jupiter's Gemini transit" },
  { date: "October 18, 2025", event: "Jupiter Retrograde", description: "Jupiter appears to move backward" },
  { date: "February 11, 2026", event: "Jupiter Direct", description: "Jupiter resumes forward motion" },
  { date: "June 14, 2026", event: "Jupiter enters Cancer", description: "Jupiter moves into Cancer (exalted)" },
  { date: "November 11, 2026", event: "Jupiter Retrograde", description: "Second retrograde period begins" },
];

const jupiterRemedies = [
  "Recite Guru Stotra or Brihaspati Mantra on Thursdays",
  "Wear Yellow Sapphire (Pukhraj) after astrological consultation",
  "Donate yellow items, turmeric, or gram dal on Thursdays",
  "Feed Brahmins or teachers on Thursdays",
  "Chant 'Om Gram Greem Graum Sah Gurave Namaha' 108 times",
  "Visit Vishnu temples on Thursdays",
  "Respect teachers, elders, and spiritual guides",
  "Study scriptures and pursue higher knowledge",
  "Practice generosity and charitable giving",
  "Wear yellow clothes on Thursdays",
];

export default function JupiterTransit2026Page() {
  const { t } = useLanguage();
  return (
    <div className="py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-amber-100 text-amber-800">Planetary Transit</Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Jupiter Transit 2026 (Guru Gochar)
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Complete guide to Jupiter&apos;s transit in 2026. Discover how Guru Gochar brings 
            blessings, expansion, and opportunities to your zodiac sign.
          </p>
        </div>

        <Card className="border-amber-200 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              Jupiter Transit Overview 2026
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Transit Path</h3>
                <div className="space-y-3">
                  <div className="bg-amber-50 rounded-lg p-4">
                    <p className="text-lg font-bold text-amber-700">Gemini (Mithuna) → Cancer (Karka)</p>
                    <p className="text-sm text-amber-600">January - June 2026: Jupiter in Gemini</p>
                    <p className="text-sm text-amber-600">June 2026 onwards: Jupiter in Cancer (Exalted!)</p>
                  </div>
                  <p className="text-sm text-gray-600">
                    Jupiter&apos;s entry into Cancer is especially significant as Jupiter is 
                    exalted in this sign, bringing maximum benefic effects for all zodiac signs.
                  </p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Jupiter&apos;s Significance</h3>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li className="flex items-start gap-2">
                      <Star className="w-4 h-4 text-amber-500 mt-0.5" />
                      <span><strong>Guru:</strong> The great teacher and guide</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-4 h-4 text-amber-500 mt-0.5" />
                      <span><strong>Expansion:</strong> Growth, abundance, and opportunities</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-4 h-4 text-amber-500 mt-0.5" />
                      <span><strong>Wisdom:</strong> Higher knowledge and spirituality</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-4 h-4 text-amber-500 mt-0.5" />
                      <span><strong>Fortune:</strong> Luck, blessings, and prosperity</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-yellow-600" />
              Important Dates in 2026
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {importantDates.map((item, index) => (
                <div key={index} className="bg-yellow-50 rounded-lg p-4">
                  <Badge className="bg-yellow-500 mb-2">{item.date}</Badge>
                  <h4 className="font-semibold text-gray-900">{item.event}</h4>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">Effects on Each Zodiac Sign</h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {jupiterEffects.map((item) => (
            <Card 
              key={item.sign} 
              className={`border-2 ${
                item.effect === "Excellent" ? "border-green-200" :
                item.effect === "Favorable" ? "border-blue-200" :
                item.effect === "Transformative" ? "border-purple-200" :
                "border-amber-200"
              }`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{item.sign}</CardTitle>
                  <Badge className={
                    item.effect === "Excellent" ? "bg-green-500" :
                    item.effect === "Favorable" ? "bg-blue-500" :
                    item.effect === "Transformative" ? "bg-purple-500" :
                    "bg-amber-500"
                  }>
                    {item.effect}
                  </Badge>
                </div>
                <CardDescription>{item.hindi} | {item.house}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 mb-3">{item.description}</p>
                <div className="bg-gray-50 rounded-lg p-3">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Key Benefits</h4>
                  <div className="flex flex-wrap gap-1">
                    {item.benefits.map((benefit) => (
                      <Badge key={benefit} variant="outline" className="text-xs bg-green-50 text-green-700">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {benefit}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-amber-200 mb-8">
          <CardHeader>
            <CardTitle>Jupiter Transit Remedies (Guru Upay)</CardTitle>
            <CardDescription>
              Enhance Jupiter&apos;s blessings with these remedies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {jupiterRemedies.map((remedy, index) => (
                <div key={index} className="flex items-start gap-2">
                  <Star className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{remedy}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="border-amber-200 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-2">Saturn Transit 2026</h3>
              <p className="text-gray-600 text-sm mb-4">
                Balance Jupiter with Saturn&apos;s discipline.
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
              <h3 className="font-semibold text-lg mb-2">Mercury Retrograde 2026</h3>
              <p className="text-gray-600 text-sm mb-4">
                Navigate communication challenges.
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

        <Card className="border-amber-200 bg-amber-50 mt-12">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Understanding Jupiter Transit in Vedic Astrology
            </h2>
            <div className="prose prose-amber max-w-none">
              <p className="text-gray-700 mb-4">
                Jupiter (Brihaspati or Guru) is the most benefic planet in Vedic astrology, 
                representing wisdom, expansion, fortune, and spiritual growth. Its transit 
                through each zodiac sign lasts approximately one year and brings growth and 
                opportunities to the areas of life governed by that sign.
              </p>
              <p className="text-gray-700 mb-4">
                In 2026, Jupiter&apos;s entry into Cancer is particularly auspicious as Jupiter 
                is exalted (Uchcha) in this sign. This means Jupiter&apos;s positive qualities 
                are at their maximum strength, bringing enhanced blessings for all zodiac signs.
              </p>
              <p className="text-gray-700">
                Jupiter governs higher education, spirituality, children, wealth, and good 
                fortune. Its transit is generally considered positive, though the specific 
                effects depend on which house Jupiter transits in your birth chart. Embrace 
                Jupiter&apos;s energy through learning, teaching, generosity, and spiritual practice.
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
            headline: "Jupiter Transit 2026 - Effects on All Zodiac Signs",
            description: "Complete guide to Jupiter Transit 2026 with predictions and remedies",
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
