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

export default function KaalSarpDoshPage() {
  const { t } = useLanguage();

  const kaalSarpTypes = [
    {
      name: t('dosha.kaalSarp.types.anant.name', 'Anant Kaal Sarp Dosh'),
      rahu: t('dosha.kaalSarp.house1', '1st House'),
      ketu: t('dosha.kaalSarp.house7', '7th House'),
      effects: t('dosha.kaalSarp.types.anant.effects', 'Affects health, personality, and marriage. May cause delays in marriage and partnership issues.'),
      severity: t('dosha.severity.high', 'High'),
    },
    {
      name: t('dosha.kaalSarp.types.kulik.name', 'Kulik Kaal Sarp Dosh'),
      rahu: t('dosha.kaalSarp.house2', '2nd House'),
      ketu: t('dosha.kaalSarp.house8', '8th House'),
      effects: t('dosha.kaalSarp.types.kulik.effects', 'Impacts wealth, family, and longevity. Financial instability and family disputes possible.'),
      severity: t('dosha.severity.high', 'High'),
    },
    {
      name: t('dosha.kaalSarp.types.vasuki.name', 'Vasuki Kaal Sarp Dosh'),
      rahu: t('dosha.kaalSarp.house3', '3rd House'),
      ketu: t('dosha.kaalSarp.house9', '9th House'),
      effects: t('dosha.kaalSarp.types.vasuki.effects', 'Affects courage, siblings, and fortune. May cause issues with siblings and luck.'),
      severity: t('dosha.severity.medium', 'Medium'),
    },
    {
      name: t('dosha.kaalSarp.types.shankhpal.name', 'Shankhpal Kaal Sarp Dosh'),
      rahu: t('dosha.kaalSarp.house4', '4th House'),
      ketu: t('dosha.kaalSarp.house10', '10th House'),
      effects: t('dosha.kaalSarp.types.shankhpal.effects', 'Impacts home, mother, and career. Property issues and career obstacles possible.'),
      severity: t('dosha.severity.high', 'High'),
    },
    {
      name: t('dosha.kaalSarp.types.padma.name', 'Padma Kaal Sarp Dosh'),
      rahu: t('dosha.kaalSarp.house5', '5th House'),
      ketu: t('dosha.kaalSarp.house11', '11th House'),
      effects: t('dosha.kaalSarp.types.padma.effects', 'Affects children, education, and gains. May cause delays in childbirth and income issues.'),
      severity: t('dosha.severity.medium', 'Medium'),
    },
    {
      name: t('dosha.kaalSarp.types.mahapadma.name', 'Mahapadma Kaal Sarp Dosh'),
      rahu: t('dosha.kaalSarp.house6', '6th House'),
      ketu: t('dosha.kaalSarp.house12', '12th House'),
      effects: t('dosha.kaalSarp.types.mahapadma.effects', 'Impacts enemies, health, and expenses. Legal issues and health problems possible.'),
      severity: t('dosha.severity.medium', 'Medium'),
    },
    {
      name: t('dosha.kaalSarp.types.takshak.name', 'Takshak Kaal Sarp Dosh'),
      rahu: t('dosha.kaalSarp.house7', '7th House'),
      ketu: t('dosha.kaalSarp.house1', '1st House'),
      effects: t('dosha.kaalSarp.types.takshak.effects', 'Affects marriage, partnerships, and self. Relationship troubles and identity issues.'),
      severity: t('dosha.severity.high', 'High'),
    },
    {
      name: t('dosha.kaalSarp.types.karkotak.name', 'Karkotak Kaal Sarp Dosh'),
      rahu: t('dosha.kaalSarp.house8', '8th House'),
      ketu: t('dosha.kaalSarp.house2', '2nd House'),
      effects: t('dosha.kaalSarp.types.karkotak.effects', 'Impacts longevity, secrets, and family. Sudden events and family wealth issues.'),
      severity: t('dosha.severity.high', 'High'),
    },
    {
      name: t('dosha.kaalSarp.types.shankhachud.name', 'Shankhachud Kaal Sarp Dosh'),
      rahu: t('dosha.kaalSarp.house9', '9th House'),
      ketu: t('dosha.kaalSarp.house3', '3rd House'),
      effects: t('dosha.kaalSarp.types.shankhachud.effects', 'Affects fortune, father, and courage. Luck fluctuations and sibling issues.'),
      severity: t('dosha.severity.medium', 'Medium'),
    },
    {
      name: t('dosha.kaalSarp.types.ghatak.name', 'Ghatak Kaal Sarp Dosh'),
      rahu: t('dosha.kaalSarp.house10', '10th House'),
      ketu: t('dosha.kaalSarp.house4', '4th House'),
      effects: t('dosha.kaalSarp.types.ghatak.effects', 'Impacts career, reputation, and home. Professional setbacks and domestic unrest.'),
      severity: t('dosha.severity.high', 'High'),
    },
    {
      name: t('dosha.kaalSarp.types.vishdhar.name', 'Vishdhar Kaal Sarp Dosh'),
      rahu: t('dosha.kaalSarp.house11', '11th House'),
      ketu: t('dosha.kaalSarp.house5', '5th House'),
      effects: t('dosha.kaalSarp.types.vishdhar.effects', 'Affects gains, friends, and children. Income fluctuations and children-related concerns.'),
      severity: t('dosha.severity.medium', 'Medium'),
    },
    {
      name: t('dosha.kaalSarp.types.sheshnag.name', 'Sheshnag Kaal Sarp Dosh'),
      rahu: t('dosha.kaalSarp.house12', '12th House'),
      ketu: t('dosha.kaalSarp.house6', '6th House'),
      effects: t('dosha.kaalSarp.types.sheshnag.effects', 'Impacts expenses, spirituality, and enemies. Foreign connections and hidden enemies.'),
      severity: t('dosha.severity.medium', 'Medium'),
    },
  ];

  const remedies = {
    puja: [
      t('dosha.kaalSarp.remedies.puja.1', 'Perform Kaal Sarp Dosh Nivaran Puja at Trimbakeshwar'),
      t('dosha.kaalSarp.remedies.puja.2', 'Conduct Rahu-Ketu Shanti Puja'),
      t('dosha.kaalSarp.remedies.puja.3', 'Perform Naag Panchami Puja with devotion'),
      t('dosha.kaalSarp.remedies.puja.4', 'Visit Kaal Sarp temples like Mahakaleshwar, Ujjain'),
      t('dosha.kaalSarp.remedies.puja.5', 'Perform Rudrabhishek on Mondays'),
      t('dosha.kaalSarp.remedies.puja.6', 'Conduct Sarpa Suktam Parayanam'),
    ],
    mantras: [
      t('dosha.kaalSarp.remedies.mantras.1', "Chant Rahu Mantra: 'Om Bhram Bhreem Bhroum Sah Rahave Namaha' 18,000 times"),
      t('dosha.kaalSarp.remedies.mantras.2', "Chant Ketu Mantra: 'Om Stram Streem Straum Sah Ketave Namaha' 17,000 times"),
      t('dosha.kaalSarp.remedies.mantras.3', 'Recite Maha Mrityunjaya Mantra 108 times daily'),
      t('dosha.kaalSarp.remedies.mantras.4', 'Chant Naag Gayatri Mantra on Naag Panchami'),
      t('dosha.kaalSarp.remedies.mantras.5', 'Recite Vishnu Sahasranama on Saturdays'),
    ],
    donations: [
      t('dosha.kaalSarp.remedies.donations.1', 'Donate black and white sesame seeds on Saturdays'),
      t('dosha.kaalSarp.remedies.donations.2', 'Feed snakes milk on Naag Panchami (symbolically at temples)'),
      t('dosha.kaalSarp.remedies.donations.3', 'Donate blankets to the needy'),
      t('dosha.kaalSarp.remedies.donations.4', 'Offer coconut and flowers at snake temples'),
      t('dosha.kaalSarp.remedies.donations.5', 'Donate iron items on Saturdays'),
    ],
    lifestyle: [
      t('dosha.kaalSarp.remedies.lifestyle.1', 'Wear Gomed (Hessonite) for Rahu after consultation'),
      t('dosha.kaalSarp.remedies.lifestyle.2', "Wear Cat's Eye (Lehsunia) for Ketu after consultation"),
      t('dosha.kaalSarp.remedies.lifestyle.3', 'Keep a silver snake idol at home and worship'),
      t('dosha.kaalSarp.remedies.lifestyle.4', 'Avoid harming snakes or any reptiles'),
      t('dosha.kaalSarp.remedies.lifestyle.5', 'Practice meditation and spiritual activities'),
      t('dosha.kaalSarp.remedies.lifestyle.6', 'Fast on Naag Panchami'),
    ],
  };

  const generalEffects = [
    t('dosha.kaalSarp.effects.1', 'Delays and obstacles in major life events'),
    t('dosha.kaalSarp.effects.2', 'Sudden ups and downs in career and finances'),
    t('dosha.kaalSarp.effects.3', 'Health issues, especially related to nervous system'),
    t('dosha.kaalSarp.effects.4', 'Relationship and marriage difficulties'),
    t('dosha.kaalSarp.effects.5', 'Mental stress, anxiety, and fear'),
    t('dosha.kaalSarp.effects.6', 'Obstacles in education and career growth'),
    t('dosha.kaalSarp.effects.7', 'Property and legal disputes'),
    t('dosha.kaalSarp.effects.8', 'Lack of peace and satisfaction despite efforts'),
  ];
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
              {t('dosha.kaalSarp.whatIs', 'What is Kaal Sarp Dosh?')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-purple max-w-none">
              <p className="text-gray-700 mb-4">
                {t('dosha.kaalSarp.desc1', 'Kaal Sarp Dosh is formed when all seven planets (Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn) are hemmed between Rahu and Ketu in a birth chart. This creates a serpent-like formation where Rahu is the head and Ketu is the tail, with all planets trapped within.')}
              </p>
              <p className="text-gray-700 mb-4">
                {t('dosha.kaalSarp.desc2', 'The word "Kaal" means time or death, and "Sarp" means serpent. This yoga is believed to bring karmic challenges from past lives that need to be resolved in the current lifetime.')}
              </p>
              <p className="text-gray-700">
                {t('dosha.kaalSarp.desc3', 'There are 12 types of Kaal Sarp Dosh, each named after a mythological serpent, depending on which house Rahu occupies. The effects vary based on the type and the overall strength of the birth chart.')}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 mb-8">
          <CardHeader>
            <CardTitle className="text-red-800">{t('dosha.kaalSarp.generalEffects', 'General Effects of Kaal Sarp Dosh')}</CardTitle>
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

        <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('dosha.kaalSarp.types', '12 Types of Kaal Sarp Dosh')}</h2>
        
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
                  {t('dosha.rahu', 'Rahu')}: {type.rahu} | {t('dosha.ketu', 'Ketu')}: {type.ketu}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">{type.effects}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('dosha.kaalSarp.remedies', 'Remedies for Kaal Sarp Dosh')}</h2>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card className="border-amber-200">
            <CardHeader className="bg-amber-50">
              <CardTitle className="text-amber-800">{t('dosha.pujaRituals', 'Puja & Rituals')}</CardTitle>
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
              <CardTitle className="text-purple-800">{t('dosha.mantrasChanting', 'Mantras & Chanting')}</CardTitle>
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
              <CardTitle className="text-blue-800">{t('dosha.donationsCharity', 'Donations & Charity')}</CardTitle>
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
              <CardTitle className="text-green-800">{t('dosha.gemstonesLifestyle', 'Gemstones & Lifestyle')}</CardTitle>
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
            <CardTitle>{t('dosha.kaalSarp.importantTemples', 'Important Temples for Kaal Sarp Dosh')}</CardTitle>
            <CardDescription>
              {t('dosha.kaalSarp.templesDesc', 'Visit these temples for Kaal Sarp Dosh Nivaran Puja')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-indigo-50 rounded-lg p-4">
                <h4 className="font-semibold text-indigo-800">{t('dosha.kaalSarp.temples.trimbakeshwar.name', 'Trimbakeshwar, Nashik')}</h4>
                <p className="text-sm text-indigo-600">{t('dosha.kaalSarp.temples.trimbakeshwar.desc', 'Most famous for Kaal Sarp Puja')}</p>
              </div>
              <div className="bg-indigo-50 rounded-lg p-4">
                <h4 className="font-semibold text-indigo-800">{t('dosha.kaalSarp.temples.mahakaleshwar.name', 'Mahakaleshwar, Ujjain')}</h4>
                <p className="text-sm text-indigo-600">{t('dosha.kaalSarp.temples.mahakaleshwar.desc', 'One of 12 Jyotirlingas')}</p>
              </div>
              <div className="bg-indigo-50 rounded-lg p-4">
                <h4 className="font-semibold text-indigo-800">{t('dosha.kaalSarp.temples.kalahasti.name', 'Kalahasti, Andhra Pradesh')}</h4>
                <p className="text-sm text-indigo-600">{t('dosha.kaalSarp.temples.kalahasti.desc', 'Famous for Rahu-Ketu Puja')}</p>
              </div>
              <div className="bg-indigo-50 rounded-lg p-4">
                <h4 className="font-semibold text-indigo-800">{t('dosha.kaalSarp.temples.rameswaram.name', 'Rameswaram, Tamil Nadu')}</h4>
                <p className="text-sm text-indigo-600">{t('dosha.kaalSarp.temples.rameswaram.desc', 'For Naag Dosha Nivaran')}</p>
              </div>
              <div className="bg-indigo-50 rounded-lg p-4">
                <h4 className="font-semibold text-indigo-800">{t('dosha.kaalSarp.temples.kukke.name', 'Kukke Subramanya, Karnataka')}</h4>
                <p className="text-sm text-indigo-600">{t('dosha.kaalSarp.temples.kukke.desc', 'Famous Naag temple')}</p>
              </div>
              <div className="bg-indigo-50 rounded-lg p-4">
                <h4 className="font-semibold text-indigo-800">{t('dosha.kaalSarp.temples.thirunageswaram.name', 'Thirunageswaram, Tamil Nadu')}</h4>
                <p className="text-sm text-indigo-600">{t('dosha.kaalSarp.temples.thirunageswaram.desc', 'Rahu temple')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="border-amber-200 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-2">{t('calculator.fullKundliAnalysis', 'Full Kundli Analysis')}</h3>
              <p className="text-gray-600 text-sm mb-4">
                {t('dosha.kaalSarp.kundliDesc', 'Generate your birth chart to check for Kaal Sarp Dosh.')}
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/tools/kundli-calculator">
                  {t('calculator.generateKundli', 'Generate Kundli')} <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-amber-200 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-2">{t('dosha.otherDoshas', 'Other Doshas')}</h3>
              <p className="text-gray-600 text-sm mb-4">
                {t('dosha.otherDoshasDesc', 'Learn about Mangal Dosh and Sade Sati.')}
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/doshas/mangal-dosh">
                  {t('dosha.viewDoshas', 'View Doshas')} <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-amber-200 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-2">{t('consultation.consultAstrologer', 'Consult an Astrologer')}</h3>
              <p className="text-gray-600 text-sm mb-4">
                {t('consultation.personalizedGuidance', 'Get personalized guidance from experts.')}
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/consultation">
                  {t('consultation.bookConsultation', 'Book Consultation')} <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="border-purple-200 bg-purple-50 mt-12">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {t('dosha.kaalSarp.understanding.title', 'Understanding Kaal Sarp Dosh in Context')}
            </h2>
            <div className="prose prose-purple max-w-none">
              <p className="text-gray-700 mb-4">
                {t('dosha.kaalSarp.understanding.para1', "While Kaal Sarp Dosh is considered significant in Vedic astrology, it's important to understand that its effects are modified by many factors. The strength of individual planets, beneficial aspects, and the overall chart configuration all play a role.")}
              </p>
              <p className="text-gray-700 mb-4">
                {t('dosha.kaalSarp.understanding.para2', 'Many successful people have Kaal Sarp Yoga in their charts. The yoga can also bring intense focus, determination, and the ability to overcome obstacles. It often indicates a soul that has chosen challenging lessons for spiritual growth.')}
              </p>
              <p className="text-gray-700">
                {t('dosha.kaalSarp.understanding.para3', 'Rather than fearing this yoga, approach it as an opportunity for transformation. The remedies help balance the energies and reduce challenging effects while enhancing the positive potential of this powerful configuration.')}
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
