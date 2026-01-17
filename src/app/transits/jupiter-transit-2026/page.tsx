"use client";

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

export default function JupiterTransit2026Page() {
  const { t } = useLanguage();

  const jupiterEffects = [
    {
      sign: t('transits.jupiter.signs.aries.name', 'Aries'),
      hindi: t('transits.jupiter.signs.aries.hindi', 'मेष'),
      house: t('transits.jupiter.signs.aries.house', '3rd → 4th House'),
      effect: t('transits.jupiter.signs.aries.effect', 'Favorable'),
      description: t('transits.jupiter.signs.aries.description', 'Jupiter moves from your 3rd house of communication to 4th house of home mid-year. First half favors learning and siblings; second half brings domestic happiness and property gains.'),
      benefits: [
        t('transits.jupiter.signs.aries.benefit1', 'Communication skills'),
        t('transits.jupiter.signs.aries.benefit2', 'Sibling harmony'),
        t('transits.jupiter.signs.aries.benefit3', 'Property acquisition'),
        t('transits.jupiter.signs.aries.benefit4', 'Domestic peace'),
      ],
    },
    {
      sign: t('transits.jupiter.signs.taurus.name', 'Taurus'),
      hindi: t('transits.jupiter.signs.taurus.hindi', 'वृषभ'),
      house: t('transits.jupiter.signs.taurus.house', '2nd → 3rd House'),
      effect: t('transits.jupiter.signs.taurus.effect', 'Favorable'),
      description: t('transits.jupiter.signs.taurus.description', 'Jupiter transits from wealth house to communication house. Financial growth in first half; enhanced skills and courage in second half. Family matters improve throughout.'),
      benefits: [
        t('transits.jupiter.signs.taurus.benefit1', 'Wealth accumulation'),
        t('transits.jupiter.signs.taurus.benefit2', 'Family harmony'),
        t('transits.jupiter.signs.taurus.benefit3', 'New skills'),
        t('transits.jupiter.signs.taurus.benefit4', 'Sibling support'),
      ],
    },
    {
      sign: t('transits.jupiter.signs.gemini.name', 'Gemini'),
      hindi: t('transits.jupiter.signs.gemini.hindi', 'मिथुन'),
      house: t('transits.jupiter.signs.gemini.house', '1st → 2nd House'),
      effect: t('transits.jupiter.signs.gemini.effect', 'Excellent'),
      description: t('transits.jupiter.signs.gemini.description', 'Jupiter blesses your sign in first half bringing personal growth and optimism. Second half focuses on wealth and family. This is your year for expansion!'),
      benefits: [
        t('transits.jupiter.signs.gemini.benefit1', 'Personal growth'),
        t('transits.jupiter.signs.gemini.benefit2', 'Optimism'),
        t('transits.jupiter.signs.gemini.benefit3', 'Financial gains'),
        t('transits.jupiter.signs.gemini.benefit4', 'Family blessings'),
      ],
    },
    {
      sign: t('transits.jupiter.signs.cancer.name', 'Cancer'),
      hindi: t('transits.jupiter.signs.cancer.hindi', 'कर्क'),
      house: t('transits.jupiter.signs.cancer.house', '12th → 1st House'),
      effect: t('transits.jupiter.signs.cancer.effect', 'Transformative'),
      description: t('transits.jupiter.signs.cancer.description', 'Jupiter moves from 12th house of spirituality to your sign mid-year. First half favors spiritual growth; second half brings personal expansion and new beginnings.'),
      benefits: [
        t('transits.jupiter.signs.cancer.benefit1', 'Spiritual growth'),
        t('transits.jupiter.signs.cancer.benefit2', 'Foreign gains'),
        t('transits.jupiter.signs.cancer.benefit3', 'Personal expansion'),
        t('transits.jupiter.signs.cancer.benefit4', 'New opportunities'),
      ],
    },
    {
      sign: t('transits.jupiter.signs.leo.name', 'Leo'),
      hindi: t('transits.jupiter.signs.leo.hindi', 'सिंह'),
      house: t('transits.jupiter.signs.leo.house', '11th → 12th House'),
      effect: t('transits.jupiter.signs.leo.effect', 'Mixed'),
      description: t('transits.jupiter.signs.leo.description', 'Jupiter moves from gains house to expenses house. First half brings income and goal fulfillment; second half encourages spiritual pursuits and foreign connections.'),
      benefits: [
        t('transits.jupiter.signs.leo.benefit1', 'Income growth'),
        t('transits.jupiter.signs.leo.benefit2', 'Goal achievement'),
        t('transits.jupiter.signs.leo.benefit3', 'Spiritual development'),
        t('transits.jupiter.signs.leo.benefit4', 'Foreign travel'),
      ],
    },
    {
      sign: t('transits.jupiter.signs.virgo.name', 'Virgo'),
      hindi: t('transits.jupiter.signs.virgo.hindi', 'कन्या'),
      house: t('transits.jupiter.signs.virgo.house', '10th → 11th House'),
      effect: t('transits.jupiter.signs.virgo.effect', 'Excellent'),
      description: t('transits.jupiter.signs.virgo.description', 'Jupiter transits from career to gains house. Professional success in first half leads to financial rewards in second half. Excellent year for achievements!'),
      benefits: [
        t('transits.jupiter.signs.virgo.benefit1', 'Career success'),
        t('transits.jupiter.signs.virgo.benefit2', 'Recognition'),
        t('transits.jupiter.signs.virgo.benefit3', 'Income increase'),
        t('transits.jupiter.signs.virgo.benefit4', 'Network expansion'),
      ],
    },
    {
      sign: t('transits.jupiter.signs.libra.name', 'Libra'),
      hindi: t('transits.jupiter.signs.libra.hindi', 'तुला'),
      house: t('transits.jupiter.signs.libra.house', '9th → 10th House'),
      effect: t('transits.jupiter.signs.libra.effect', 'Excellent'),
      description: t('transits.jupiter.signs.libra.description', 'Jupiter moves from fortune house to career house. Luck and higher learning in first half; career advancement in second half. A blessed year overall!'),
      benefits: [
        t('transits.jupiter.signs.libra.benefit1', 'Good fortune'),
        t('transits.jupiter.signs.libra.benefit2', 'Higher education'),
        t('transits.jupiter.signs.libra.benefit3', 'Career growth'),
        t('transits.jupiter.signs.libra.benefit4', "Father's blessings"),
      ],
    },
    {
      sign: t('transits.jupiter.signs.scorpio.name', 'Scorpio'),
      hindi: t('transits.jupiter.signs.scorpio.hindi', 'वृश्चिक'),
      house: t('transits.jupiter.signs.scorpio.house', '8th → 9th House'),
      effect: t('transits.jupiter.signs.scorpio.effect', 'Improving'),
      description: t('transits.jupiter.signs.scorpio.description', 'Jupiter moves from transformation house to fortune house. Challenges ease as year progresses. Second half brings luck, travel, and spiritual growth.'),
      benefits: [
        t('transits.jupiter.signs.scorpio.benefit1', 'Transformation'),
        t('transits.jupiter.signs.scorpio.benefit2', 'Hidden gains'),
        t('transits.jupiter.signs.scorpio.benefit3', 'Good fortune'),
        t('transits.jupiter.signs.scorpio.benefit4', 'Spiritual wisdom'),
      ],
    },
    {
      sign: t('transits.jupiter.signs.sagittarius.name', 'Sagittarius'),
      hindi: t('transits.jupiter.signs.sagittarius.hindi', 'धनु'),
      house: t('transits.jupiter.signs.sagittarius.house', '7th → 8th House'),
      effect: t('transits.jupiter.signs.sagittarius.effect', 'Mixed'),
      description: t('transits.jupiter.signs.sagittarius.description', 'Jupiter, your ruler, moves from partnership to transformation house. Relationships blessed in first half; deep changes and hidden gains in second half.'),
      benefits: [
        t('transits.jupiter.signs.sagittarius.benefit1', 'Partnership success'),
        t('transits.jupiter.signs.sagittarius.benefit2', 'Marriage blessings'),
        t('transits.jupiter.signs.sagittarius.benefit3', 'Transformation'),
        t('transits.jupiter.signs.sagittarius.benefit4', 'Research gains'),
      ],
    },
    {
      sign: t('transits.jupiter.signs.capricorn.name', 'Capricorn'),
      hindi: t('transits.jupiter.signs.capricorn.hindi', 'मकर'),
      house: t('transits.jupiter.signs.capricorn.house', '6th → 7th House'),
      effect: t('transits.jupiter.signs.capricorn.effect', 'Favorable'),
      description: t('transits.jupiter.signs.capricorn.description', 'Jupiter moves from service house to partnership house. Health and work improve in first half; relationships and partnerships blessed in second half.'),
      benefits: [
        t('transits.jupiter.signs.capricorn.benefit1', 'Health improvement'),
        t('transits.jupiter.signs.capricorn.benefit2', 'Victory over enemies'),
        t('transits.jupiter.signs.capricorn.benefit3', 'Partnership success'),
        t('transits.jupiter.signs.capricorn.benefit4', 'Marriage prospects'),
      ],
    },
    {
      sign: t('transits.jupiter.signs.aquarius.name', 'Aquarius'),
      hindi: t('transits.jupiter.signs.aquarius.hindi', 'कुंभ'),
      house: t('transits.jupiter.signs.aquarius.house', '5th → 6th House'),
      effect: t('transits.jupiter.signs.aquarius.effect', 'Mixed'),
      description: t('transits.jupiter.signs.aquarius.description', 'Jupiter transits from creativity house to service house. Romance and children blessed in first half; health focus and service success in second half.'),
      benefits: [
        t('transits.jupiter.signs.aquarius.benefit1', 'Creative success'),
        t('transits.jupiter.signs.aquarius.benefit2', "Children's progress"),
        t('transits.jupiter.signs.aquarius.benefit3', 'Health awareness'),
        t('transits.jupiter.signs.aquarius.benefit4', 'Service recognition'),
      ],
    },
    {
      sign: t('transits.jupiter.signs.pisces.name', 'Pisces'),
      hindi: t('transits.jupiter.signs.pisces.hindi', 'मीन'),
      house: t('transits.jupiter.signs.pisces.house', '4th → 5th House'),
      effect: t('transits.jupiter.signs.pisces.effect', 'Excellent'),
      description: t('transits.jupiter.signs.pisces.description', 'Jupiter, your ruler, blesses home then creativity. Domestic happiness in first half; romance, children, and creative success in second half. A wonderful year!'),
      benefits: [
        t('transits.jupiter.signs.pisces.benefit1', 'Home happiness'),
        t('transits.jupiter.signs.pisces.benefit2', 'Property gains'),
        t('transits.jupiter.signs.pisces.benefit3', 'Romance'),
        t('transits.jupiter.signs.pisces.benefit4', 'Creative fulfillment'),
      ],
    },
  ];

  const importantDates = [
    { date: t('transits.jupiter.dates.date1.date', 'May 14, 2025'), event: t('transits.jupiter.dates.date1.event', 'Jupiter enters Gemini'), description: t('transits.jupiter.dates.date1.description', "Beginning of Jupiter's Gemini transit") },
    { date: t('transits.jupiter.dates.date2.date', 'October 18, 2025'), event: t('transits.jupiter.dates.date2.event', 'Jupiter Retrograde'), description: t('transits.jupiter.dates.date2.description', 'Jupiter appears to move backward') },
    { date: t('transits.jupiter.dates.date3.date', 'February 11, 2026'), event: t('transits.jupiter.dates.date3.event', 'Jupiter Direct'), description: t('transits.jupiter.dates.date3.description', 'Jupiter resumes forward motion') },
    { date: t('transits.jupiter.dates.date4.date', 'June 14, 2026'), event: t('transits.jupiter.dates.date4.event', 'Jupiter enters Cancer'), description: t('transits.jupiter.dates.date4.description', 'Jupiter moves into Cancer (exalted)') },
    { date: t('transits.jupiter.dates.date5.date', 'November 11, 2026'), event: t('transits.jupiter.dates.date5.event', 'Jupiter Retrograde'), description: t('transits.jupiter.dates.date5.description', 'Second retrograde period begins') },
  ];

  const jupiterRemedies = [
    t('transits.jupiter.remedies.remedy1', 'Recite Guru Stotra or Brihaspati Mantra on Thursdays'),
    t('transits.jupiter.remedies.remedy2', 'Wear Yellow Sapphire (Pukhraj) after astrological consultation'),
    t('transits.jupiter.remedies.remedy3', 'Donate yellow items, turmeric, or gram dal on Thursdays'),
    t('transits.jupiter.remedies.remedy4', 'Feed Brahmins or teachers on Thursdays'),
    t('transits.jupiter.remedies.remedy5', "Chant 'Om Gram Greem Graum Sah Gurave Namaha' 108 times"),
    t('transits.jupiter.remedies.remedy6', 'Visit Vishnu temples on Thursdays'),
    t('transits.jupiter.remedies.remedy7', 'Respect teachers, elders, and spiritual guides'),
    t('transits.jupiter.remedies.remedy8', 'Study scriptures and pursue higher knowledge'),
    t('transits.jupiter.remedies.remedy9', 'Practice generosity and charitable giving'),
    t('transits.jupiter.remedies.remedy10', 'Wear yellow clothes on Thursdays'),
  ];
  return (
    <div className="py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-amber-100 text-amber-800">{t('transits.badge', 'Planetary Transit')}</Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {t('transits.jupiter.title', 'Jupiter Transit 2026 (Guru Gochar)')}
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {t('transits.jupiter.subtitle', "Complete guide to Jupiter's transit in 2026. Discover how Guru Gochar brings blessings, expansion, and opportunities to your zodiac sign.")}
          </p>
        </div>

        <Card className="border-amber-200 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              {t('transits.jupiter.overview.title', 'Jupiter Transit Overview 2026')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">{t('transits.jupiter.overview.transitPath', 'Transit Path')}</h3>
                <div className="space-y-3">
                  <div className="bg-amber-50 rounded-lg p-4">
                    <p className="text-lg font-bold text-amber-700">{t('transits.jupiter.overview.pathTitle', 'Gemini (Mithuna) → Cancer (Karka)')}</p>
                    <p className="text-sm text-amber-600">{t('transits.jupiter.overview.pathLine1', 'January - June 2026: Jupiter in Gemini')}</p>
                    <p className="text-sm text-amber-600">{t('transits.jupiter.overview.pathLine2', 'June 2026 onwards: Jupiter in Cancer (Exalted!)')}</p>
                  </div>
                  <p className="text-sm text-gray-600">
                    {t('transits.jupiter.overview.pathDescription', "Jupiter's entry into Cancer is especially significant as Jupiter is exalted in this sign, bringing maximum benefic effects for all zodiac signs.")}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">{t('transits.jupiter.overview.significance', "Jupiter's Significance")}</h3>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li className="flex items-start gap-2">
                      <Star className="w-4 h-4 text-amber-500 mt-0.5" />
                      <span><strong>{t('transits.jupiter.overview.guru', 'Guru')}:</strong> {t('transits.jupiter.overview.guruDesc', 'The great teacher and guide')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-4 h-4 text-amber-500 mt-0.5" />
                      <span><strong>{t('transits.jupiter.overview.expansion', 'Expansion')}:</strong> {t('transits.jupiter.overview.expansionDesc', 'Growth, abundance, and opportunities')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-4 h-4 text-amber-500 mt-0.5" />
                      <span><strong>{t('transits.jupiter.overview.wisdom', 'Wisdom')}:</strong> {t('transits.jupiter.overview.wisdomDesc', 'Higher knowledge and spirituality')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-4 h-4 text-amber-500 mt-0.5" />
                      <span><strong>{t('transits.jupiter.overview.fortune', 'Fortune')}:</strong> {t('transits.jupiter.overview.fortuneDesc', 'Luck, blessings, and prosperity')}</span>
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
              {t('transits.jupiter.importantDates', 'Important Dates in 2026')}
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

        <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('transits.jupiter.effectsTitle', 'Effects on Each Zodiac Sign')}</h2>
        
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
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">{t('transits.jupiter.keyBenefits', 'Key Benefits')}</h4>
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
            <CardTitle>{t('transits.jupiter.remediesTitle', 'Jupiter Transit Remedies (Guru Upay)')}</CardTitle>
            <CardDescription>
              {t('transits.jupiter.remediesSubtitle', "Enhance Jupiter's blessings with these remedies")}
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
              <h3 className="font-semibold text-lg mb-2">{t('transits.jupiter.related.saturn.title', 'Saturn Transit 2026')}</h3>
              <p className="text-gray-600 text-sm mb-4">
                {t('transits.jupiter.related.saturn.description', "Balance Jupiter with Saturn's discipline.")}
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/transits/saturn-transit-2026">
                  {t('transits.jupiter.readMore', 'Read More')} <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-amber-200 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-2">{t('transits.jupiter.related.mercury.title', 'Mercury Retrograde 2026')}</h3>
              <p className="text-gray-600 text-sm mb-4">
                {t('transits.jupiter.related.mercury.description', 'Navigate communication challenges.')}
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/transits/mercury-retrograde-2026">
                  {t('transits.jupiter.readMore', 'Read More')} <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-amber-200 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-2">{t('transits.jupiter.related.horoscope.title', '2026 Horoscope')}</h3>
              <p className="text-gray-600 text-sm mb-4">
                {t('transits.jupiter.related.horoscope.description', 'Complete yearly predictions for your sign.')}
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/horoscope/2026">
                  {t('transits.jupiter.readHoroscope', 'Read Horoscope')} <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="border-amber-200 bg-amber-50 mt-12">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {t('transits.jupiter.understanding.title', 'Understanding Jupiter Transit in Vedic Astrology')}
            </h2>
            <div className="prose prose-amber max-w-none">
              <p className="text-gray-700 mb-4">
                {t('transits.jupiter.understanding.para1', 'Jupiter (Brihaspati or Guru) is the most benefic planet in Vedic astrology, representing wisdom, expansion, fortune, and spiritual growth. Its transit through each zodiac sign lasts approximately one year and brings growth and opportunities to the areas of life governed by that sign.')}
              </p>
              <p className="text-gray-700 mb-4">
                {t('transits.jupiter.understanding.para2', "In 2026, Jupiter's entry into Cancer is particularly auspicious as Jupiter is exalted (Uchcha) in this sign. This means Jupiter's positive qualities are at their maximum strength, bringing enhanced blessings for all zodiac signs.")}
              </p>
              <p className="text-gray-700">
                {t('transits.jupiter.understanding.para3', "Jupiter governs higher education, spirituality, children, wealth, and good fortune. Its transit is generally considered positive, though the specific effects depend on which house Jupiter transits in your birth chart. Embrace Jupiter's energy through learning, teaching, generosity, and spiritual practice.")}
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
