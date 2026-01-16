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

const retrogradeperiods = [
  {
    period: "First Retrograde",
    startDate: "January 25, 2026",
    endDate: "February 14, 2026",
    sign: "Aquarius",
    element: "Air",
    shadowStart: "January 8, 2026",
    shadowEnd: "March 2, 2026",
    themes: ["Technology glitches", "Social media issues", "Group miscommunication", "Innovation delays"],
    advice: "Review technology systems, backup data, clarify group projects, avoid launching new apps or platforms.",
  },
  {
    period: "Second Retrograde",
    startDate: "May 19, 2026",
    endDate: "June 11, 2026",
    sign: "Gemini",
    element: "Air",
    shadowStart: "May 2, 2026",
    shadowEnd: "June 28, 2026",
    themes: ["Communication breakdowns", "Travel delays", "Sibling issues", "Contract problems"],
    advice: "Double-check all communications, avoid signing contracts, prepare for travel delays, reconnect with siblings.",
  },
  {
    period: "Third Retrograde",
    startDate: "September 17, 2026",
    endDate: "October 9, 2026",
    sign: "Libra",
    element: "Air",
    shadowStart: "September 1, 2026",
    shadowEnd: "October 26, 2026",
    themes: ["Relationship miscommunication", "Legal delays", "Partnership issues", "Negotiation problems"],
    advice: "Clarify relationship expectations, delay legal proceedings if possible, review partnership agreements.",
  },
];

const dosDuringRetrograde = [
  "Back up all important data and files",
  "Review and revise existing projects",
  "Reconnect with old friends and contacts",
  "Reflect on past decisions and learn from them",
  "Double-check all travel arrangements",
  "Read contracts thoroughly before signing",
  "Practice patience in all communications",
  "Use the time for introspection and planning",
  "Repair and maintain existing equipment",
  "Resolve old misunderstandings",
];

const dontsDuringRetrograde = [
  "Start new major projects or ventures",
  "Sign important contracts without careful review",
  "Make major purchases, especially electronics",
  "Launch new websites or apps",
  "Have important conversations via text only",
  "Assume others understand your intentions",
  "Rush through important decisions",
  "Ignore backup warnings on devices",
  "Schedule tight travel connections",
  "Make permanent relationship decisions",
];

const signEffects = [
  { sign: "Aries", effect: "Social circles and friendships may face miscommunication. Group projects need extra attention." },
  { sign: "Taurus", effect: "Career communications may be affected. Double-check work emails and presentations." },
  { sign: "Gemini", effect: "Personal expression and identity matters need clarity. Avoid impulsive self-presentation." },
  { sign: "Cancer", effect: "Hidden matters and subconscious patterns surface. Good for therapy and reflection." },
  { sign: "Leo", effect: "Friendships and social networks face challenges. Clarify group commitments." },
  { sign: "Virgo", effect: "Career and public image communications need attention. Review professional documents." },
  { sign: "Libra", effect: "Travel and higher learning face delays. Philosophical discussions may be confusing." },
  { sign: "Scorpio", effect: "Shared finances and intimate communications need clarity. Review joint accounts." },
  { sign: "Sagittarius", effect: "Partnership communications are affected. Clarify relationship expectations." },
  { sign: "Capricorn", effect: "Work routines and health communications need attention. Double-check appointments." },
  { sign: "Aquarius", effect: "Creative expression and romance face miscommunication. Clarify feelings clearly." },
  { sign: "Pisces", effect: "Home and family communications need attention. Clarify domestic arrangements." },
];

export default function MercuryRetrograde2026Page() {
  const { t } = useLanguage();
  return (
    <div className="py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-purple-100 text-purple-800">{t('transits.mercuryRetrograde.badge', 'Planetary Retrograde')}</Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {t('transits.mercuryRetrograde.title', 'Mercury Retrograde 2026')}
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {t('transits.mercuryRetrograde.subtitle', 'Complete survival guide for Mercury Retrograde in 2026. Learn the dates, understand the effects, and navigate these periods successfully.')}
          </p>
        </div>

        <Card className="border-purple-200 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-purple-600" />
              What is Mercury Retrograde?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-gray-700 mb-4">
                  Mercury Retrograde occurs when Mercury appears to move backward in the sky 
                  from Earth&apos;s perspective. This optical illusion happens 3-4 times per year 
                  and lasts about three weeks each time.
                </p>
                <p className="text-gray-700">
                  In Vedic astrology, this is called <strong>Budh Vakri</strong>. Mercury governs 
                  communication, technology, travel, and commerce, so these areas are most 
                  affected during retrograde periods.
                </p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <h3 className="font-semibold text-purple-800 mb-3">Areas Affected</h3>
                <ul className="text-sm text-purple-700 space-y-2">
                  <li>• Communication and conversations</li>
                  <li>• Technology and electronics</li>
                  <li>• Travel and transportation</li>
                  <li>• Contracts and agreements</li>
                  <li>• Commerce and business deals</li>
                  <li>• Mental clarity and decision-making</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">2026 Mercury Retrograde Periods</h2>
        
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {retrogradeperiods.map((period, index) => (
            <Card key={index} className="border-purple-200">
              <CardHeader className="bg-purple-50">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{period.period}</CardTitle>
                  <Badge className="bg-purple-500">{period.sign}</Badge>
                </div>
                <CardDescription className="text-purple-700">
                  {period.element} Sign Retrograde
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <div className="bg-red-50 rounded-lg p-3">
                    <h4 className="font-semibold text-red-800 text-sm mb-1">Retrograde Period</h4>
                    <p className="text-red-700 font-medium">{period.startDate} - {period.endDate}</p>
                  </div>
                  
                  <div className="bg-amber-50 rounded-lg p-3">
                    <h4 className="font-semibold text-amber-800 text-sm mb-1">Shadow Period</h4>
                    <p className="text-amber-700 text-sm">{period.shadowStart} - {period.shadowEnd}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm mb-2">Key Themes</h4>
                    <div className="flex flex-wrap gap-1">
                      {period.themes.map((theme) => (
                        <Badge key={theme} variant="outline" className="text-xs">
                          {theme}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-3">
                    <h4 className="font-semibold text-blue-800 text-sm mb-1">Advice</h4>
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
                DO During Mercury Retrograde
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="space-y-2">
                {dosDuringRetrograde.map((item, index) => (
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
                DON&apos;T During Mercury Retrograde
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="space-y-2">
                {dontsDuringRetrograde.map((item, index) => (
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
              Effects by Zodiac Sign
            </CardTitle>
            <CardDescription>
              How Mercury Retrograde 2026 affects each sign
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {signEffects.map((item) => (
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
            <CardTitle>Mercury Retrograde Remedies</CardTitle>
            <CardDescription>
              Vedic remedies to ease Mercury Retrograde effects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Mantras & Prayers</h3>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>• Chant &quot;Om Budhaya Namaha&quot; 108 times daily</li>
                  <li>• Recite Budh Stotra on Wednesdays</li>
                  <li>• Pray to Lord Vishnu for mental clarity</li>
                  <li>• Meditate for clear communication</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Practical Remedies</h3>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>• Wear green on Wednesdays</li>
                  <li>• Donate green vegetables or moong dal</li>
                  <li>• Feed green grass to cows</li>
                  <li>• Keep an Emerald or green stone (after consultation)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="border-amber-200 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-2">Saturn Transit 2026</h3>
              <p className="text-gray-600 text-sm mb-4">
                Understand Saturn&apos;s major transit effects.
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
                Balance challenges with Jupiter&apos;s blessings.
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

        <Card className="border-purple-200 bg-purple-50 mt-12">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              The Silver Lining of Mercury Retrograde
            </h2>
            <div className="prose prose-purple max-w-none">
              <p className="text-gray-700 mb-4">
                While Mercury Retrograde is often viewed negatively, it offers valuable 
                opportunities for reflection, revision, and reconnection. The &quot;re-&quot; prefix 
                is key: review, revise, reconnect, reflect, repair, and reconsider.
              </p>
              <p className="text-gray-700 mb-4">
                This is an excellent time to revisit old projects, reconnect with people 
                from your past, and reflect on your communication patterns. Many people 
                find that Mercury Retrograde brings back opportunities they thought were lost.
              </p>
              <p className="text-gray-700">
                Rather than fearing this period, use it as a cosmic pause button. Slow down, 
                double-check your work, and use the time for introspection. The challenges 
                of Mercury Retrograde often lead to important insights and improvements.
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
            headline: "Mercury Retrograde 2026 - Dates, Effects & Survival Guide",
            description: "Complete guide to Mercury Retrograde 2026 with dates and survival tips",
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
