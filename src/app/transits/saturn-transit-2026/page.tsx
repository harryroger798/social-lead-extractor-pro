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

export default function SaturnTransit2026Page() {
  const { t } = useLanguage();

  const saturnEffects = [
    {
      sign: t('transits.saturn.signs.aries.name', 'Aries'),
      hindi: t('transits.saturn.signs.aries.hindi', 'मेष'),
      house: t('transits.saturn.signs.aries.house', '12th House'),
      effect: t('transits.saturn.signs.aries.effect', 'Challenging'),
      description: t('transits.saturn.signs.aries.description', 'Saturn transits your 12th house of losses, expenses, and spirituality. This period encourages spiritual growth but may bring increased expenses and sleep issues. Foreign connections are highlighted.'),
      advice: t('transits.saturn.signs.aries.advice', 'Focus on spiritual practices, meditation, and charitable activities. Avoid unnecessary expenses and maintain healthy sleep habits.'),
    },
    {
      sign: t('transits.saturn.signs.taurus.name', 'Taurus'),
      hindi: t('transits.saturn.signs.taurus.hindi', 'वृषभ'),
      house: t('transits.saturn.signs.taurus.house', '11th House'),
      effect: t('transits.saturn.signs.taurus.effect', 'Favorable'),
      description: t('transits.saturn.signs.taurus.description', 'Saturn blesses your 11th house of gains and friendships. This is an excellent period for achieving long-term goals, expanding social networks, and increasing income through persistent efforts.'),
      advice: t('transits.saturn.signs.taurus.advice', 'Network actively, pursue long-term goals, and invest in friendships. Your patience will be rewarded with material gains.'),
    },
    {
      sign: t('transits.saturn.signs.gemini.name', 'Gemini'),
      hindi: t('transits.saturn.signs.gemini.hindi', 'मिथुन'),
      house: t('transits.saturn.signs.gemini.house', '10th House'),
      effect: t('transits.saturn.signs.gemini.effect', 'Mixed'),
      description: t('transits.saturn.signs.gemini.description', 'Saturn transits your career house, bringing both challenges and opportunities. Hard work leads to recognition, but expect increased responsibilities. Authority figures play important roles.'),
      advice: t('transits.saturn.signs.gemini.advice', 'Stay dedicated to your work, maintain professional ethics, and be patient with career progress. Avoid shortcuts.'),
    },
    {
      sign: t('transits.saturn.signs.cancer.name', 'Cancer'),
      hindi: t('transits.saturn.signs.cancer.hindi', 'कर्क'),
      house: t('transits.saturn.signs.cancer.house', '9th House'),
      effect: t('transits.saturn.signs.cancer.effect', 'Favorable'),
      description: t('transits.saturn.signs.cancer.description', 'Saturn in your 9th house supports higher learning, long-distance travel, and spiritual growth. Father figures and teachers play important roles. Legal matters are favored.'),
      advice: t('transits.saturn.signs.cancer.advice', 'Pursue higher education, plan meaningful travels, and strengthen your spiritual foundation. Respect elders and teachers.'),
    },
    {
      sign: t('transits.saturn.signs.leo.name', 'Leo'),
      hindi: t('transits.saturn.signs.leo.hindi', 'सिंह'),
      house: t('transits.saturn.signs.leo.house', '8th House'),
      effect: t('transits.saturn.signs.leo.effect', 'Challenging'),
      description: t('transits.saturn.signs.leo.description', 'Saturn transits your 8th house of transformation. This period brings deep changes, possible health concerns, and matters related to inheritance or shared resources.'),
      advice: t('transits.saturn.signs.leo.advice', 'Focus on health, manage joint finances carefully, and embrace transformation. Regular health check-ups are recommended.'),
    },
    {
      sign: t('transits.saturn.signs.virgo.name', 'Virgo'),
      hindi: t('transits.saturn.signs.virgo.hindi', 'कन्या'),
      house: t('transits.saturn.signs.virgo.house', '7th House'),
      effect: t('transits.saturn.signs.virgo.effect', 'Mixed'),
      description: t('transits.saturn.signs.virgo.description', 'Saturn in your partnership house affects marriage and business relationships. Existing relationships are tested, but those that survive become stronger. New commitments require careful consideration.'),
      advice: t('transits.saturn.signs.virgo.advice', 'Work on relationship communication, be patient with partners, and avoid hasty commitments. Quality over quantity in relationships.'),
    },
    {
      sign: t('transits.saturn.signs.libra.name', 'Libra'),
      hindi: t('transits.saturn.signs.libra.hindi', 'तुला'),
      house: t('transits.saturn.signs.libra.house', '6th House'),
      effect: t('transits.saturn.signs.libra.effect', 'Favorable'),
      description: t('transits.saturn.signs.libra.description', 'Saturn supports your 6th house of health, service, and daily work. This is excellent for overcoming enemies, improving health habits, and excelling in service-oriented work.'),
      advice: t('transits.saturn.signs.libra.advice', 'Establish healthy routines, focus on service to others, and address health issues proactively. Legal victories are possible.'),
    },
    {
      sign: t('transits.saturn.signs.scorpio.name', 'Scorpio'),
      hindi: t('transits.saturn.signs.scorpio.hindi', 'वृश्चिक'),
      house: t('transits.saturn.signs.scorpio.house', '5th House'),
      effect: t('transits.saturn.signs.scorpio.effect', 'Challenging'),
      description: t('transits.saturn.signs.scorpio.description', 'Saturn transits your 5th house affecting creativity, children, and romance. Creative projects require extra effort. Matters related to children need attention. Romance may feel restricted.'),
      advice: t('transits.saturn.signs.scorpio.advice', 'Be patient with creative endeavors, give extra attention to children, and don\'t rush romantic decisions. Speculative investments should be avoided.'),
    },
    {
      sign: t('transits.saturn.signs.sagittarius.name', 'Sagittarius'),
      hindi: t('transits.saturn.signs.sagittarius.hindi', 'धनु'),
      house: t('transits.saturn.signs.sagittarius.house', '4th House'),
      effect: t('transits.saturn.signs.sagittarius.effect', 'Mixed'),
      description: t('transits.saturn.signs.sagittarius.description', 'Saturn in your 4th house affects home, mother, and emotional peace. Property matters require patience. Domestic responsibilities increase. Inner emotional work is necessary.'),
      advice: t('transits.saturn.signs.sagittarius.advice', 'Focus on home improvements, care for elderly family members, and work on emotional stability. Property decisions need careful thought.'),
    },
    {
      sign: t('transits.saturn.signs.capricorn.name', 'Capricorn'),
      hindi: t('transits.saturn.signs.capricorn.hindi', 'मकर'),
      house: t('transits.saturn.signs.capricorn.house', '3rd House'),
      effect: t('transits.saturn.signs.capricorn.effect', 'Favorable'),
      description: t('transits.saturn.signs.capricorn.description', 'Saturn supports your 3rd house of communication and courage. This is excellent for writing, learning new skills, and improving relationships with siblings. Short travels are productive.'),
      advice: t('transits.saturn.signs.capricorn.advice', 'Develop communication skills, learn new things, and strengthen sibling bonds. Your efforts in writing and speaking will be rewarded.'),
    },
    {
      sign: t('transits.saturn.signs.aquarius.name', 'Aquarius'),
      hindi: t('transits.saturn.signs.aquarius.hindi', 'कुंभ'),
      house: t('transits.saturn.signs.aquarius.house', '2nd House'),
      effect: t('transits.saturn.signs.aquarius.effect', 'Mixed'),
      description: t('transits.saturn.signs.aquarius.description', 'Saturn transits your 2nd house of wealth and family. Financial discipline is essential. Family responsibilities increase. Speech and eating habits need attention.'),
      advice: t('transits.saturn.signs.aquarius.advice', 'Budget carefully, save for the future, and maintain family harmony. Avoid harsh speech and unhealthy eating habits.'),
    },
    {
      sign: t('transits.saturn.signs.pisces.name', 'Pisces'),
      hindi: t('transits.saturn.signs.pisces.hindi', 'मीन'),
      house: t('transits.saturn.signs.pisces.house', '1st House (Sade Sati Peak)'),
      effect: t('transits.saturn.signs.pisces.effect', 'Challenging'),
      description: t('transits.saturn.signs.pisces.description', 'Saturn transits over your Moon sign - the peak of Sade Sati. This is a period of significant personal transformation, health focus, and karmic lessons. Self-discipline is crucial.'),
      advice: t('transits.saturn.signs.pisces.advice', 'Prioritize health, practice patience, and embrace personal growth. This challenging period builds character and resilience.'),
    },
  ];

  const importantDates = [
    { date: t('transits.saturn.dates.date1.date', 'March 29, 2025'), event: t('transits.saturn.dates.date1.event', 'Saturn enters Pisces'), description: t('transits.saturn.dates.date1.description', "Beginning of Saturn's transit through Pisces") },
    { date: t('transits.saturn.dates.date2.date', 'June 14, 2026'), event: t('transits.saturn.dates.date2.event', 'Saturn Retrograde begins'), description: t('transits.saturn.dates.date2.description', 'Saturn appears to move backward - review and reassess') },
    { date: t('transits.saturn.dates.date3.date', 'November 2, 2026'), event: t('transits.saturn.dates.date3.event', 'Saturn Direct'), description: t('transits.saturn.dates.date3.description', 'Saturn resumes forward motion - progress resumes') },
    { date: t('transits.saturn.dates.date4.date', 'June 2, 2028'), event: t('transits.saturn.dates.date4.event', 'Saturn enters Aries'), description: t('transits.saturn.dates.date4.description', "End of Saturn's Pisces transit") },
  ];

  const remedies = [
    { title: t('transits.saturn.remedies.remedy1.title', 'Shani Chalisa'), description: t('transits.saturn.remedies.remedy1.description', 'Recite Shani Chalisa on Saturdays') },
    { title: t('transits.saturn.remedies.remedy2.title', 'Donate to the needy'), description: t('transits.saturn.remedies.remedy2.description', 'Donate black items on Saturdays') },
    { title: t('transits.saturn.remedies.remedy3.title', 'Shani Mantra'), description: t('transits.saturn.remedies.remedy3.description', "Chant 'Om Sham Shanicharaya Namah' 108 times") },
    { title: t('transits.saturn.remedies.remedy4.title', 'Blue Sapphire'), description: t('transits.saturn.remedies.remedy4.description', 'Wear Blue Sapphire after proper consultation') },
    { title: t('transits.saturn.remedies.remedy5.title', 'Serve the elderly'), description: t('transits.saturn.remedies.remedy5.description', 'Help and respect elderly people') },
    { title: t('transits.saturn.remedies.remedy6.title', 'Fast on Saturdays'), description: t('transits.saturn.remedies.remedy6.description', 'Observe Shani Vrat on Saturdays') },
    { title: t('transits.saturn.remedies.remedy7.title', 'Visit Shani Temple'), description: t('transits.saturn.remedies.remedy7.description', 'Visit Shani temples on Saturdays') },
    { title: t('transits.saturn.remedies.remedy8.title', 'Oil to Shani'), description: t('transits.saturn.remedies.remedy8.description', 'Offer mustard oil to Shani idol') },
    { title: t('transits.saturn.remedies.remedy9.title', 'Iron Ring'), description: t('transits.saturn.remedies.remedy9.description', 'Wear iron ring on middle finger') },
    { title: t('transits.saturn.remedies.remedy10.title', 'Feed crows'), description: t('transits.saturn.remedies.remedy10.description', 'Feed crows on Saturdays') },
  ];

  return (
    <div className="py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-blue-100 text-blue-800">{t('transits.badge', 'Planetary Transit')}</Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {t('transits.saturn.title', 'Saturn Transit 2026 (Shani Gochar)')}
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {t('transits.saturn.subtitle', "Complete guide to Saturn's transit through Pisces in 2026. Understand how Shani Gochar affects your zodiac sign and learn effective remedies.")}
          </p>
        </div>

        <Card className="border-blue-200 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              {t('transits.saturn.overview.title', 'Saturn Transit Overview 2026')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">{t('transits.saturn.overview.currentPosition', 'Current Position')}</h3>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-lg font-bold text-blue-700">{t('transits.saturn.overview.positionTitle', 'Saturn in Pisces (Meena Rashi)')}</p>
                  <p className="text-sm text-blue-600">{t('transits.saturn.overview.positionPeriod', 'March 2025 - June 2028')}</p>
                  <p className="text-sm text-gray-600 mt-2">
                    {t('transits.saturn.overview.positionDescription', 'Saturn spends approximately 2.5 years in each zodiac sign. During its transit through Pisces, themes of spirituality, compassion, and karmic completion are emphasized for all signs.')}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">{t('transits.saturn.overview.sadeSatiStatus', 'Sade Sati Status')}</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 bg-red-50 rounded-lg p-3">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <span className="text-sm"><strong>{t('transits.saturn.overview.aquarius', 'Aquarius')}:</strong> {t('transits.saturn.overview.risingPhase', 'Rising Phase (12th from Moon)')}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-red-50 rounded-lg p-3">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <span className="text-sm"><strong>{t('transits.saturn.overview.pisces', 'Pisces')}:</strong> {t('transits.saturn.overview.peakPhase', 'Peak Phase (Over Moon)')}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-orange-50 rounded-lg p-3">
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                    <span className="text-sm"><strong>{t('transits.saturn.overview.aries', 'Aries')}:</strong> {t('transits.saturn.overview.settingPhase', 'Setting Phase (2nd from Moon)')}</span>
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
              {t('transits.saturn.importantDates', 'Important Dates in 2026')}
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

        <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('transits.saturn.effectsTitle', 'Effects on Each Zodiac Sign')}</h2>
        
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
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">{t('transits.saturn.advice', 'Advice')}</h4>
                  <p className="text-xs text-gray-600">{item.advice}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-indigo-200 mb-8">
          <CardHeader>
            <CardTitle>{t('transits.saturn.remediesTitle', 'Saturn Transit Remedies (Shani Shanti Upay)')}</CardTitle>
            <CardDescription>
              {t('transits.saturn.remediesSubtitle', 'Effective remedies to mitigate challenging Saturn effects')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {remedies.map((remedy, index) => (
                <div key={index} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-sm font-medium text-gray-900">{remedy.title}</span>
                    <p className="text-xs text-gray-600">{remedy.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="border-amber-200 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-2">{t('transits.saturn.related.sadeSati.title', 'Sade Sati Calculator')}</h3>
              <p className="text-gray-600 text-sm mb-4">
                {t('transits.saturn.related.sadeSati.description', "Check if you're under Sade Sati influence.")}
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/tools/sade-sati-calculator">
                  {t('transits.saturn.checkNow', 'Check Now')} <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-amber-200 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-2">{t('transits.saturn.related.jupiter.title', 'Jupiter Transit 2026')}</h3>
              <p className="text-gray-600 text-sm mb-4">
                {t('transits.saturn.related.jupiter.description', "Balance Saturn with Jupiter's blessings.")}
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/transits/jupiter-transit-2026">
                  {t('transits.saturn.readMore', 'Read More')} <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-amber-200 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-2">{t('transits.saturn.related.horoscope.title', '2026 Horoscope')}</h3>
              <p className="text-gray-600 text-sm mb-4">
                {t('transits.saturn.related.horoscope.description', 'Complete yearly predictions for your sign.')}
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/horoscope/2026">
                  {t('transits.saturn.readHoroscope', 'Read Horoscope')} <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="border-blue-200 bg-blue-50 mt-12">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {t('transits.saturn.understanding.title', 'Understanding Saturn Transit in Vedic Astrology')}
            </h2>
            <div className="prose prose-blue max-w-none">
              <p className="text-gray-700 mb-4">
                {t('transits.saturn.understanding.para1', 'Saturn (Shani) is known as the planet of karma, discipline, and justice in Vedic astrology. Its transit through each zodiac sign lasts approximately 2.5 years and brings significant lessons and transformations to the areas of life governed by that sign in your birth chart.')}
              </p>
              <p className="text-gray-700 mb-4">
                {t('transits.saturn.understanding.para2', "Saturn's transit through Pisces (2025-2028) emphasizes themes of spirituality, compassion, endings, and karmic completion. This water sign transit encourages letting go of material attachments and focusing on spiritual growth and service to others.")}
              </p>
              <p className="text-gray-700">
                {t('transits.saturn.understanding.para3', "While Saturn is often feared, it is actually a great teacher that rewards hard work, patience, and ethical conduct. Those who embrace Saturn's lessons with discipline and humility often emerge stronger and wiser from its transits.")}
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
