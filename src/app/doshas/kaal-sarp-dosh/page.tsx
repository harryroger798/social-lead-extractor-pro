"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

const kaalSarpTypes = [
  {
    name: "Anant Kaal Sarp Dosh",
    rahu: "1st House",
    ketu: "7th House",
    effects: "Affects health, personality, and marriage. May cause delays in marriage and partnership issues.",
    severity: "High",
  },
  {
    name: "Kulik Kaal Sarp Dosh",
    rahu: "2nd House",
    ketu: "8th House",
    effects: "Impacts wealth, family, and longevity. Financial instability and family disputes possible.",
    severity: "High",
  },
  {
    name: "Vasuki Kaal Sarp Dosh",
    rahu: "3rd House",
    ketu: "9th House",
    effects: "Affects courage, siblings, and fortune. May cause issues with siblings and luck.",
    severity: "Medium",
  },
  {
    name: "Shankhpal Kaal Sarp Dosh",
    rahu: "4th House",
    ketu: "10th House",
    effects: "Impacts home, mother, and career. Property issues and career obstacles possible.",
    severity: "High",
  },
  {
    name: "Padma Kaal Sarp Dosh",
    rahu: "5th House",
    ketu: "11th House",
    effects: "Affects children, education, and gains. May cause delays in childbirth and income issues.",
    severity: "Medium",
  },
  {
    name: "Mahapadma Kaal Sarp Dosh",
    rahu: "6th House",
    ketu: "12th House",
    effects: "Impacts enemies, health, and expenses. Legal issues and health problems possible.",
    severity: "Medium",
  },
  {
    name: "Takshak Kaal Sarp Dosh",
    rahu: "7th House",
    ketu: "1st House",
    effects: "Affects marriage, partnerships, and self. Relationship troubles and identity issues.",
    severity: "High",
  },
  {
    name: "Karkotak Kaal Sarp Dosh",
    rahu: "8th House",
    ketu: "2nd House",
    effects: "Impacts longevity, secrets, and family. Sudden events and family wealth issues.",
    severity: "High",
  },
  {
    name: "Shankhachud Kaal Sarp Dosh",
    rahu: "9th House",
    ketu: "3rd House",
    effects: "Affects fortune, father, and courage. Luck fluctuations and sibling issues.",
    severity: "Medium",
  },
  {
    name: "Ghatak Kaal Sarp Dosh",
    rahu: "10th House",
    ketu: "4th House",
    effects: "Impacts career, reputation, and home. Professional setbacks and domestic unrest.",
    severity: "High",
  },
  {
    name: "Vishdhar Kaal Sarp Dosh",
    rahu: "11th House",
    ketu: "5th House",
    effects: "Affects gains, friends, and children. Income fluctuations and children-related concerns.",
    severity: "Medium",
  },
  {
    name: "Sheshnag Kaal Sarp Dosh",
    rahu: "12th House",
    ketu: "6th House",
    effects: "Impacts expenses, spirituality, and enemies. Foreign connections and hidden enemies.",
    severity: "Medium",
  },
];

const remedies = {
  puja: [
    "Perform Kaal Sarp Dosh Nivaran Puja at Trimbakeshwar",
    "Conduct Rahu-Ketu Shanti Puja",
    "Perform Naag Panchami Puja with devotion",
    "Visit Kaal Sarp temples like Mahakaleshwar, Ujjain",
    "Perform Rudrabhishek on Mondays",
    "Conduct Sarpa Suktam Parayanam",
  ],
  mantras: [
    "Chant Rahu Mantra: 'Om Bhram Bhreem Bhroum Sah Rahave Namaha' 18,000 times",
    "Chant Ketu Mantra: 'Om Stram Streem Straum Sah Ketave Namaha' 17,000 times",
    "Recite Maha Mrityunjaya Mantra 108 times daily",
    "Chant Naag Gayatri Mantra on Naag Panchami",
    "Recite Vishnu Sahasranama on Saturdays",
  ],
  donations: [
    "Donate black and white sesame seeds on Saturdays",
    "Feed snakes milk on Naag Panchami (symbolically at temples)",
    "Donate blankets to the needy",
    "Offer coconut and flowers at snake temples",
    "Donate iron items on Saturdays",
  ],
  lifestyle: [
    "Wear Gomed (Hessonite) for Rahu after consultation",
    "Wear Cat's Eye (Lehsunia) for Ketu after consultation",
    "Keep a silver snake idol at home and worship",
    "Avoid harming snakes or any reptiles",
    "Practice meditation and spiritual activities",
    "Fast on Naag Panchami",
  ],
};

const generalEffects = [
  "Delays and obstacles in major life events",
  "Sudden ups and downs in career and finances",
  "Health issues, especially related to nervous system",
  "Relationship and marriage difficulties",
  "Mental stress, anxiety, and fear",
  "Obstacles in education and career growth",
  "Property and legal disputes",
  "Lack of peace and satisfaction despite efforts",
];

export default function KaalSarpDoshPage() {
  const { t } = useLanguage();
  return (
    <div className="py-12 lg:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-purple-100 text-purple-800">{t('dosha.guide', 'Dosha Guide')}</Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {t('dosha.kaalSarp.title', 'Kaal Sarp Dosh (Kaal Sarp Yoga)')}
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {t('dosha.kaalSarp.subtitle', 'Complete guide to understanding Kaal Sarp Dosh, its 12 types, effects on different aspects of life, and powerful remedies to overcome this dosha.')}
          </p>
        </div>

        <Card className="border-purple-200 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-purple-600" />
              What is Kaal Sarp Dosh?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-purple max-w-none">
              <p className="text-gray-700 mb-4">
                Kaal Sarp Dosh is formed when all seven planets (Sun, Moon, Mars, Mercury, 
                Jupiter, Venus, Saturn) are hemmed between Rahu and Ketu in a birth chart. 
                This creates a serpent-like formation where Rahu is the head and Ketu is the 
                tail, with all planets trapped within.
              </p>
              <p className="text-gray-700 mb-4">
                The word &quot;Kaal&quot; means time or death, and &quot;Sarp&quot; means serpent. This yoga 
                is believed to bring karmic challenges from past lives that need to be 
                resolved in the current lifetime.
              </p>
              <p className="text-gray-700">
                There are 12 types of Kaal Sarp Dosh, each named after a mythological serpent, 
                depending on which house Rahu occupies. The effects vary based on the type 
                and the overall strength of the birth chart.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 mb-8">
          <CardHeader>
            <CardTitle className="text-red-800">General Effects of Kaal Sarp Dosh</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-3">
              {generalEffects.map((effect, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{effect}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">12 Types of Kaal Sarp Dosh</h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {kaalSarpTypes.map((type) => (
            <Card 
              key={type.name} 
              className={`border-2 ${
                type.severity === "High" ? "border-red-200" : "border-amber-200"
              }`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{type.name}</CardTitle>
                  <Badge className={type.severity === "High" ? "bg-red-500" : "bg-amber-500"}>
                    {type.severity}
                  </Badge>
                </div>
                <CardDescription>
                  Rahu: {type.rahu} | Ketu: {type.ketu}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">{type.effects}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">Remedies for Kaal Sarp Dosh</h2>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card className="border-amber-200">
            <CardHeader className="bg-amber-50">
              <CardTitle className="text-amber-800">Puja & Rituals</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="space-y-2">
                {remedies.puja.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-purple-200">
            <CardHeader className="bg-purple-50">
              <CardTitle className="text-purple-800">Mantras & Chanting</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="space-y-2">
                {remedies.mantras.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-blue-200">
            <CardHeader className="bg-blue-50">
              <CardTitle className="text-blue-800">Donations & Charity</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="space-y-2">
                {remedies.donations.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-green-200">
            <CardHeader className="bg-green-50">
              <CardTitle className="text-green-800">Gemstones & Lifestyle</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="space-y-2">
                {remedies.lifestyle.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card className="border-indigo-200 mb-8">
          <CardHeader>
            <CardTitle>Important Temples for Kaal Sarp Dosh</CardTitle>
            <CardDescription>
              Visit these temples for Kaal Sarp Dosh Nivaran Puja
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-indigo-50 rounded-lg p-4">
                <h4 className="font-semibold text-indigo-800">Trimbakeshwar, Nashik</h4>
                <p className="text-sm text-indigo-600">Most famous for Kaal Sarp Puja</p>
              </div>
              <div className="bg-indigo-50 rounded-lg p-4">
                <h4 className="font-semibold text-indigo-800">Mahakaleshwar, Ujjain</h4>
                <p className="text-sm text-indigo-600">One of 12 Jyotirlingas</p>
              </div>
              <div className="bg-indigo-50 rounded-lg p-4">
                <h4 className="font-semibold text-indigo-800">Kalahasti, Andhra Pradesh</h4>
                <p className="text-sm text-indigo-600">Famous for Rahu-Ketu Puja</p>
              </div>
              <div className="bg-indigo-50 rounded-lg p-4">
                <h4 className="font-semibold text-indigo-800">Rameswaram, Tamil Nadu</h4>
                <p className="text-sm text-indigo-600">For Naag Dosha Nivaran</p>
              </div>
              <div className="bg-indigo-50 rounded-lg p-4">
                <h4 className="font-semibold text-indigo-800">Kukke Subramanya, Karnataka</h4>
                <p className="text-sm text-indigo-600">Famous Naag temple</p>
              </div>
              <div className="bg-indigo-50 rounded-lg p-4">
                <h4 className="font-semibold text-indigo-800">Thirunageswaram, Tamil Nadu</h4>
                <p className="text-sm text-indigo-600">Rahu temple</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="border-amber-200 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-2">Full Kundli Analysis</h3>
              <p className="text-gray-600 text-sm mb-4">
                Generate your birth chart to check for Kaal Sarp Dosh.
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/tools/kundli-calculator">
                  Generate Kundli <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-amber-200 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-2">Other Doshas</h3>
              <p className="text-gray-600 text-sm mb-4">
                Learn about Mangal Dosh and Sade Sati.
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/doshas/mangal-dosh">
                  View Doshas <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-amber-200 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-2">Consult an Astrologer</h3>
              <p className="text-gray-600 text-sm mb-4">
                Get personalized guidance from experts.
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/consultation">
                  Book Consultation <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="border-purple-200 bg-purple-50 mt-12">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Understanding Kaal Sarp Dosh in Context
            </h2>
            <div className="prose prose-purple max-w-none">
              <p className="text-gray-700 mb-4">
                While Kaal Sarp Dosh is considered significant in Vedic astrology, it&apos;s 
                important to understand that its effects are modified by many factors. The 
                strength of individual planets, beneficial aspects, and the overall chart 
                configuration all play a role.
              </p>
              <p className="text-gray-700 mb-4">
                Many successful people have Kaal Sarp Yoga in their charts. The yoga can 
                also bring intense focus, determination, and the ability to overcome 
                obstacles. It often indicates a soul that has chosen challenging lessons 
                for spiritual growth.
              </p>
              <p className="text-gray-700">
                Rather than fearing this yoga, approach it as an opportunity for 
                transformation. The remedies help balance the energies and reduce 
                challenging effects while enhancing the positive potential of this 
                powerful configuration.
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
            headline: "Kaal Sarp Dosh - Types, Effects & Remedies",
            description: "Complete guide to Kaal Sarp Dosh with 12 types and remedies",
            author: {
              "@type": "Organization",
              name: "VedicStarAstro",
            },
          }),
        }}
      />
    </div>
  );
}
