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
  XCircle,
  RotateCcw,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { getCurrentYear, withCurrentYear } from "@/lib/utils";

export default function MercuryRetrograde2026Page() {
  const { t } = useLanguage();

  const retrogradePeriodsData = [
    {
      period: t('transits.mercury.periods.first.period', 'First Retrograde'),
      startDate: t('transits.mercury.periods.first.startDate', 'January 25, 2026'),
      endDate: t('transits.mercury.periods.first.endDate', 'February 14, 2026'),
      sign: t('transits.mercury.periods.first.sign', 'Aquarius'),
      element: t('transits.mercury.periods.first.element', 'Air'),
      shadowStart: t('transits.mercury.periods.first.shadowStart', 'January 8, 2026'),
      shadowEnd: t('transits.mercury.periods.first.shadowEnd', 'March 2, 2026'),
      themes: [
        t('transits.mercury.periods.first.theme1', 'Technology glitches'),
        t('transits.mercury.periods.first.theme2', 'Social media issues'),
        t('transits.mercury.periods.first.theme3', 'Group miscommunication'),
        t('transits.mercury.periods.first.theme4', 'Innovation delays'),
      ],
      advice: t('transits.mercury.periods.first.advice', 'Review technology systems, backup data, clarify group projects, avoid launching new apps or platforms.'),
    },
    {
      period: t('transits.mercury.periods.second.period', 'Second Retrograde'),
      startDate: t('transits.mercury.periods.second.startDate', 'May 19, 2026'),
      endDate: t('transits.mercury.periods.second.endDate', 'June 11, 2026'),
      sign: t('transits.mercury.periods.second.sign', 'Gemini'),
      element: t('transits.mercury.periods.second.element', 'Air'),
      shadowStart: t('transits.mercury.periods.second.shadowStart', 'May 2, 2026'),
      shadowEnd: t('transits.mercury.periods.second.shadowEnd', 'June 28, 2026'),
      themes: [
        t('transits.mercury.periods.second.theme1', 'Communication breakdowns'),
        t('transits.mercury.periods.second.theme2', 'Travel delays'),
        t('transits.mercury.periods.second.theme3', 'Sibling issues'),
        t('transits.mercury.periods.second.theme4', 'Contract problems'),
      ],
      advice: t('transits.mercury.periods.second.advice', 'Double-check all communications, avoid signing contracts, prepare for travel delays, reconnect with siblings.'),
    },
    {
      period: t('transits.mercury.periods.third.period', 'Third Retrograde'),
      startDate: t('transits.mercury.periods.third.startDate', 'September 17, 2026'),
      endDate: t('transits.mercury.periods.third.endDate', 'October 9, 2026'),
      sign: t('transits.mercury.periods.third.sign', 'Libra'),
      element: t('transits.mercury.periods.third.element', 'Air'),
      shadowStart: t('transits.mercury.periods.third.shadowStart', 'September 1, 2026'),
      shadowEnd: t('transits.mercury.periods.third.shadowEnd', 'October 26, 2026'),
      themes: [
        t('transits.mercury.periods.third.theme1', 'Relationship miscommunication'),
        t('transits.mercury.periods.third.theme2', 'Legal delays'),
        t('transits.mercury.periods.third.theme3', 'Partnership issues'),
        t('transits.mercury.periods.third.theme4', 'Negotiation problems'),
      ],
      advice: t('transits.mercury.periods.third.advice', 'Clarify relationship expectations, delay legal proceedings if possible, review partnership agreements.'),
    },
  ];

  const dosItems = [
    t('transits.mercury.dos.item1', 'Back up all important data and files'),
    t('transits.mercury.dos.item2', 'Review and revise existing projects'),
    t('transits.mercury.dos.item3', 'Reconnect with old friends and contacts'),
    t('transits.mercury.dos.item4', 'Reflect on past decisions and learn from them'),
    t('transits.mercury.dos.item5', 'Double-check all travel arrangements'),
    t('transits.mercury.dos.item6', 'Read contracts thoroughly before signing'),
    t('transits.mercury.dos.item7', 'Practice patience in all communications'),
    t('transits.mercury.dos.item8', 'Use the time for introspection and planning'),
    t('transits.mercury.dos.item9', 'Repair and maintain existing equipment'),
    t('transits.mercury.dos.item10', 'Resolve old misunderstandings'),
  ];

  const dontsItems = [
    t('transits.mercury.donts.item1', 'Start new major projects or ventures'),
    t('transits.mercury.donts.item2', 'Sign important contracts without careful review'),
    t('transits.mercury.donts.item3', 'Make major purchases, especially electronics'),
    t('transits.mercury.donts.item4', 'Launch new websites or apps'),
    t('transits.mercury.donts.item5', 'Have important conversations via text only'),
    t('transits.mercury.donts.item6', 'Assume others understand your intentions'),
    t('transits.mercury.donts.item7', 'Rush through important decisions'),
    t('transits.mercury.donts.item8', 'Ignore backup warnings on devices'),
    t('transits.mercury.donts.item9', 'Schedule tight travel connections'),
    t('transits.mercury.donts.item10', 'Make permanent relationship decisions'),
  ];

  const signEffectsData = [
    { sign: t('transits.mercury.signs.aries.name', 'Aries'), effect: t('transits.mercury.signs.aries.effect', 'Social circles and friendships may face miscommunication. Group projects need extra attention.') },
    { sign: t('transits.mercury.signs.taurus.name', 'Taurus'), effect: t('transits.mercury.signs.taurus.effect', 'Career communications may be affected. Double-check work emails and presentations.') },
    { sign: t('transits.mercury.signs.gemini.name', 'Gemini'), effect: t('transits.mercury.signs.gemini.effect', 'Personal expression and identity matters need clarity. Avoid impulsive self-presentation.') },
    { sign: t('transits.mercury.signs.cancer.name', 'Cancer'), effect: t('transits.mercury.signs.cancer.effect', 'Hidden matters and subconscious patterns surface. Good for therapy and reflection.') },
    { sign: t('transits.mercury.signs.leo.name', 'Leo'), effect: t('transits.mercury.signs.leo.effect', 'Friendships and social networks face challenges. Clarify group commitments.') },
    { sign: t('transits.mercury.signs.virgo.name', 'Virgo'), effect: t('transits.mercury.signs.virgo.effect', 'Career and public image communications need attention. Review professional documents.') },
    { sign: t('transits.mercury.signs.libra.name', 'Libra'), effect: t('transits.mercury.signs.libra.effect', 'Travel and higher learning face delays. Philosophical discussions may be confusing.') },
    { sign: t('transits.mercury.signs.scorpio.name', 'Scorpio'), effect: t('transits.mercury.signs.scorpio.effect', 'Shared finances and intimate communications need clarity. Review joint accounts.') },
    { sign: t('transits.mercury.signs.sagittarius.name', 'Sagittarius'), effect: t('transits.mercury.signs.sagittarius.effect', 'Partnership communications are affected. Clarify relationship expectations.') },
    { sign: t('transits.mercury.signs.capricorn.name', 'Capricorn'), effect: t('transits.mercury.signs.capricorn.effect', 'Work routines and health communications need attention. Double-check appointments.') },
    { sign: t('transits.mercury.signs.aquarius.name', 'Aquarius'), effect: t('transits.mercury.signs.aquarius.effect', 'Creative expression and romance face miscommunication. Clarify feelings clearly.') },
    { sign: t('transits.mercury.signs.pisces.name', 'Pisces'), effect: t('transits.mercury.signs.pisces.effect', 'Home and family communications need attention. Clarify domestic arrangements.') },
  ];

  return (
    <div className="py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-purple-100 text-purple-800">{t('transits.mercuryRetrograde.badge', 'Planetary Retrograde')}</Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {t('transits.mercuryRetrograde.title', 'Mercury Retrograde {year}')}
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {t('transits.mercuryRetrograde.subtitle', 'Complete survival guide for Mercury Retrograde in {year}. Learn the dates, understand the effects, and navigate these periods successfully.')}
          </p>
        </div>

        <Card className="border-purple-200 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-purple-600" />
              {t('transits.mercury.whatIs.title', 'What is Mercury Retrograde?')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-gray-700 mb-4">
                  {t('transits.mercury.whatIs.para1', "Mercury Retrograde occurs when Mercury appears to move backward in the sky from Earth's perspective. This optical illusion happens 3-4 times per year and lasts about three weeks each time.")}
                </p>
                <p className="text-gray-700">
                  {t('transits.mercury.whatIs.para2', 'In Vedic astrology, this is called Budh Vakri. Mercury governs communication, technology, travel, and commerce, so these areas are most affected during retrograde periods.')}
                </p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <h3 className="font-semibold text-purple-800 mb-3">{t('transits.mercury.whatIs.areasTitle', 'Areas Affected')}</h3>
                <ul className="text-sm text-purple-700 space-y-2">
                  <li>• {t('transits.mercury.whatIs.area1', 'Communication and conversations')}</li>
                  <li>• {t('transits.mercury.whatIs.area2', 'Technology and electronics')}</li>
                  <li>• {t('transits.mercury.whatIs.area3', 'Travel and transportation')}</li>
                  <li>• {t('transits.mercury.whatIs.area4', 'Contracts and agreements')}</li>
                  <li>• {t('transits.mercury.whatIs.area5', 'Commerce and business deals')}</li>
                  <li>• {t('transits.mercury.whatIs.area6', 'Mental clarity and decision-making')}</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('transits.mercury.periodsTitle', '{year} Mercury Retrograde Periods')}</h2>
        
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {retrogradePeriodsData.map((period, index) => (
            <Card key={index} className="border-purple-200">
              <CardHeader className="bg-purple-50">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{period.period}</CardTitle>
                  <Badge className="bg-purple-500">{period.sign}</Badge>
                </div>
                <CardDescription className="text-purple-700">
                  {period.element} {t('transits.mercury.signRetrograde', 'Sign Retrograde')}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <div className="bg-red-50 rounded-lg p-3">
                    <h4 className="font-semibold text-red-800 text-sm mb-1">{t('transits.mercury.retrogradePeriod', 'Retrograde Period')}</h4>
                    <p className="text-red-700 font-medium">{period.startDate} - {period.endDate}</p>
                  </div>
                  
                  <div className="bg-amber-50 rounded-lg p-3">
                    <h4 className="font-semibold text-amber-800 text-sm mb-1">{t('transits.mercury.shadowPeriod', 'Shadow Period')}</h4>
                    <p className="text-amber-700 text-sm">{period.shadowStart} - {period.shadowEnd}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm mb-2">{t('transits.mercury.keyThemes', 'Key Themes')}</h4>
                    <div className="flex flex-wrap gap-1">
                      {period.themes.map((theme, themeIndex) => (
                        <Badge key={themeIndex} variant="outline" className="text-xs">
                          {theme}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-3">
                    <h4 className="font-semibold text-blue-800 text-sm mb-1">{t('transits.mercury.advice', 'Advice')}</h4>
                    <p className="text-blue-700 text-xs">{period.advice}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="border-green-200">
            <CardHeader className="bg-green-50">
              <CardTitle className="flex items-center gap-2 text-green-800">
                <CheckCircle className="w-5 h-5" />
                {t('transits.mercury.dosTitle', 'DO During Mercury Retrograde')}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="space-y-2">
                {dosItems.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-red-200">
            <CardHeader className="bg-red-50">
              <CardTitle className="flex items-center gap-2 text-red-800">
                <XCircle className="w-5 h-5" />
                {t('transits.mercury.dontsTitle', "DON'T During Mercury Retrograde")}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="space-y-2">
                {dontsItems.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card className="border-amber-200 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-600" />
              {t('transits.mercury.effectsTitle', 'Effects by Zodiac Sign')}
            </CardTitle>
            <CardDescription>
              {t('transits.mercury.effectsSubtitle', 'How Mercury Retrograde {year} affects each sign')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {signEffectsData.map((item) => (
                <div key={item.sign} className="bg-gray-50 rounded-lg p-3">
                  <h4 className="font-semibold text-gray-900 mb-1">{item.sign}</h4>
                  <p className="text-xs text-gray-600">{item.effect}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-indigo-200 mb-8">
          <CardHeader>
            <CardTitle>{t('transits.mercury.remedies.title', 'Mercury Retrograde Remedies')}</CardTitle>
            <CardDescription>
              {t('transits.mercury.remedies.subtitle', 'Vedic remedies to ease Mercury Retrograde effects')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">{t('transits.mercury.remedies.mantrasTitle', 'Mantras & Prayers')}</h3>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>• {t('transits.mercury.remedies.mantra1', 'Chant "Om Budhaya Namaha" 108 times daily')}</li>
                  <li>• {t('transits.mercury.remedies.mantra2', 'Recite Budh Stotra on Wednesdays')}</li>
                  <li>• {t('transits.mercury.remedies.mantra3', 'Pray to Lord Vishnu for mental clarity')}</li>
                  <li>• {t('transits.mercury.remedies.mantra4', 'Meditate for clear communication')}</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">{t('transits.mercury.remedies.practicalTitle', 'Practical Remedies')}</h3>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>• {t('transits.mercury.remedies.practical1', 'Wear green on Wednesdays')}</li>
                  <li>• {t('transits.mercury.remedies.practical2', 'Donate green vegetables or moong dal')}</li>
                  <li>• {t('transits.mercury.remedies.practical3', 'Feed green grass to cows')}</li>
                  <li>• {t('transits.mercury.remedies.practical4', 'Keep an Emerald or green stone (after consultation)')}</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="border-amber-200 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-2">{t('transits.mercury.related.saturn.title', 'Saturn Transit {year}')}</h3>
              <p className="text-gray-600 text-sm mb-4">
                {t('transits.mercury.related.saturn.description', "Understand Saturn's major transit effects.")}
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/transits/saturn-transit-2026">
                  {t('transits.mercury.readMore', 'Read More')} <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-amber-200 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-2">{t('transits.mercury.related.jupiter.title', 'Jupiter Transit {year}')}</h3>
              <p className="text-gray-600 text-sm mb-4">
                {t('transits.mercury.related.jupiter.description', "Balance challenges with Jupiter's blessings.")}
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/transits/jupiter-transit-2026">
                  {t('transits.mercury.readMore', 'Read More')} <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-amber-200 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-2">{t('transits.mercury.related.eclipses.title', 'Eclipses {year}')}</h3>
              <p className="text-gray-600 text-sm mb-4">
                {t('transits.mercury.related.eclipses.description', 'Solar and lunar eclipse dates and effects.')}
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/eclipses-2026">
                  {t('transits.mercury.readMore', 'Read More')} <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="border-purple-200 bg-purple-50 mt-12">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {t('transits.mercury.silverLining.title', 'The Silver Lining of Mercury Retrograde')}
            </h2>
            <div className="prose prose-purple max-w-none">
              <p className="text-gray-700 mb-4">
                {t('transits.mercury.silverLining.para1', 'While Mercury Retrograde is often viewed negatively, it offers valuable opportunities for reflection, revision, and reconnection. The "re-" prefix is key: review, revise, reconnect, reflect, repair, and reconsider.')}
              </p>
              <p className="text-gray-700 mb-4">
                {t('transits.mercury.silverLining.para2', 'This is an excellent time to revisit old projects, reconnect with people from your past, and reflect on your communication patterns. Many people find that Mercury Retrograde brings back opportunities they thought were lost.')}
              </p>
              <p className="text-gray-700">
                {t('transits.mercury.silverLining.para3', 'Rather than fearing this period, use it as a cosmic pause button. Slow down, double-check your work, and use the time for introspection. The challenges of Mercury Retrograde often lead to important insights and improvements.')}
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
            headline: "Mercury Retrograde {year} - Dates, Effects & Survival Guide",
            description: "Complete guide to Mercury Retrograde {year} with dates and survival tips",
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
