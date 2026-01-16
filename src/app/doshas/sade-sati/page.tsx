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
  Clock,
} from "lucide-react";

const phases = [
  {
    name: "Rising Phase (First Phase)",
    duration: "2.5 Years",
    position: "Saturn in 12th from Moon",
    description: "Saturn transits the 12th house from your Moon sign. This phase affects expenses, sleep, foreign connections, and spiritual matters.",
    effects: [
      "Increased expenses and financial strain",
      "Sleep disturbances and health issues",
      "Mental stress and anxiety",
      "Possible foreign travel or relocation",
      "Spiritual awakening begins",
    ],
    severity: "Moderate",
  },
  {
    name: "Peak Phase (Second Phase)",
    duration: "2.5 Years",
    position: "Saturn over Moon Sign",
    description: "Saturn transits directly over your Moon sign. This is the most intense phase affecting mind, emotions, and overall life circumstances.",
    effects: [
      "Emotional turbulence and mental pressure",
      "Career challenges and obstacles",
      "Health issues, especially mental health",
      "Relationship strain and family issues",
      "Major life transformations",
    ],
    severity: "High",
  },
  {
    name: "Setting Phase (Third Phase)",
    duration: "2.5 Years",
    position: "Saturn in 2nd from Moon",
    description: "Saturn transits the 2nd house from your Moon sign. This phase affects wealth, family, speech, and accumulated resources.",
    effects: [
      "Financial fluctuations and losses",
      "Family disputes and tensions",
      "Speech-related issues",
      "Eye and face-related health concerns",
      "Gradual improvement towards end",
    ],
    severity: "Moderate",
  },
];

const signEffects = [
  {
    sign: "Aries",
    currentStatus: "Not in Sade Sati",
    nextSadeSati: "2027-2034",
    advice: "Prepare for upcoming Sade Sati by strengthening Saturn in your chart.",
  },
  {
    sign: "Taurus",
    currentStatus: "Not in Sade Sati",
    nextSadeSati: "2029-2037",
    advice: "Good period for growth. Use this time to build strong foundations.",
  },
  {
    sign: "Gemini",
    currentStatus: "Not in Sade Sati",
    nextSadeSati: "2032-2039",
    advice: "Favorable period. Focus on career and relationship building.",
  },
  {
    sign: "Cancer",
    currentStatus: "Not in Sade Sati",
    nextSadeSati: "2034-2042",
    advice: "Excellent period for personal growth and achievements.",
  },
  {
    sign: "Leo",
    currentStatus: "Not in Sade Sati",
    nextSadeSati: "2037-2044",
    advice: "Use this favorable time for major life decisions.",
  },
  {
    sign: "Virgo",
    currentStatus: "Not in Sade Sati",
    nextSadeSati: "2039-2047",
    advice: "Good period for health improvements and service.",
  },
  {
    sign: "Libra",
    currentStatus: "Not in Sade Sati",
    nextSadeSati: "2042-2049",
    advice: "Focus on relationships and partnerships during this favorable time.",
  },
  {
    sign: "Scorpio",
    currentStatus: "Not in Sade Sati",
    nextSadeSati: "2044-2052",
    advice: "Excellent period for transformation and research.",
  },
  {
    sign: "Sagittarius",
    currentStatus: "Not in Sade Sati",
    nextSadeSati: "2047-2054",
    advice: "Good time for higher education and spiritual pursuits.",
  },
  {
    sign: "Capricorn",
    currentStatus: "Not in Sade Sati",
    nextSadeSati: "2020-2027 (ending)",
    advice: "Sade Sati ending soon. Relief and rewards coming.",
  },
  {
    sign: "Aquarius",
    currentStatus: "Rising Phase",
    nextSadeSati: "Current (2023-2030)",
    advice: "First phase active. Focus on spiritual growth and managing expenses.",
  },
  {
    sign: "Pisces",
    currentStatus: "Peak Phase",
    nextSadeSati: "Current (2025-2032)",
    advice: "Most intense phase. Practice patience and follow remedies diligently.",
  },
];

const remedies = {
  daily: [
    "Chant 'Om Sham Shanicharaya Namaha' 108 times daily",
    "Light a sesame oil lamp on Saturdays",
    "Recite Hanuman Chalisa, especially on Saturdays",
    "Meditate and practice patience",
    "Wake up before sunrise on Saturdays",
  ],
  weekly: [
    "Fast on Saturdays (eat only once after sunset)",
    "Visit Shani temple on Saturdays",
    "Donate black items (sesame, oil, cloth) on Saturdays",
    "Feed crows with rice mixed in sesame oil",
    "Serve the elderly and disabled on Saturdays",
  ],
  special: [
    "Perform Shani Shanti Puja",
    "Conduct Til (sesame) Havan",
    "Visit Shani Shingnapur temple",
    "Wear Blue Sapphire only after proper consultation",
    "Wear iron ring made from horseshoe on middle finger",
    "Donate to organizations helping the disabled",
  ],
  lifestyle: [
    "Practice honesty and ethical conduct",
    "Respect elders, servants, and workers",
    "Avoid alcohol and non-vegetarian food on Saturdays",
    "Maintain discipline and punctuality",
    "Help the poor and underprivileged",
    "Avoid starting new ventures on Saturdays",
  ],
};

const faqs = [
  {
    question: "Does everyone experience Sade Sati the same way?",
    answer: "No, the effects vary based on Saturn's position in your birth chart, its strength, aspects from other planets, and your overall karma. Some people experience mild effects while others face significant challenges.",
  },
  {
    question: "How many times does Sade Sati occur in a lifetime?",
    answer: "Sade Sati occurs 2-3 times in an average lifetime, as Saturn takes approximately 29.5 years to complete one cycle through all 12 zodiac signs.",
  },
  {
    question: "Is Sade Sati always negative?",
    answer: "Not necessarily. While it brings challenges, it also offers opportunities for growth, maturity, and spiritual development. Many people achieve great success during Sade Sati through hard work and perseverance.",
  },
  {
    question: "Can remedies completely remove Sade Sati effects?",
    answer: "Remedies help reduce the intensity of challenges and provide strength to face them. They don't completely remove effects but make the journey smoother and more manageable.",
  },
];

export default function SadeSatiPage() {
  const { t } = useLanguage();
  return (
    <div className="py-12 lg:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-blue-100 text-blue-800">{t('dosha.saturnTransit', 'Saturn Transit')}</Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {t('dosha.sadeSati.title', 'Shani Sade Sati')}
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {t('dosha.sadeSati.subtitle', "Complete guide to Saturn's 7.5 year transit over your Moon sign. Understand the three phases, effects, and powerful remedies.")}
          </p>
        </div>

        <Card className="border-blue-200 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              {t('dosha.sadeSati.whatIs', 'What is Sade Sati?')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-blue max-w-none">
              <p className="text-gray-700 mb-4">
                Sade Sati (साढ़े साती) literally means &quot;seven and a half&quot; in Hindi, 
                referring to the approximately 7.5 years Saturn takes to transit through 
                three zodiac signs - the sign before your Moon sign, your Moon sign itself, 
                and the sign after your Moon sign.
              </p>
              <p className="text-gray-700 mb-4">
                Since Saturn spends about 2.5 years in each sign, the total transit period 
                is 7.5 years. This period is considered significant in Vedic astrology as 
                Saturn, the planet of karma, discipline, and hard work, directly influences 
                your mind (represented by the Moon).
              </p>
              <p className="text-gray-700">
                While Sade Sati is often feared, it&apos;s actually a period of karmic 
                balancing and spiritual growth. Those who embrace its lessons with patience 
                and discipline often emerge stronger and wiser.
              </p>
            </div>
          </CardContent>
        </Card>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('dosha.sadeSati.threePhases', 'The Three Phases of Sade Sati')}</h2>
        
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {phases.map((phase, index) => (
            <Card 
              key={phase.name} 
              className={`border-2 ${
                phase.severity === "High" ? "border-red-200" : "border-amber-200"
              }`}
            >
              <CardHeader className={phase.severity === "High" ? "bg-red-50" : "bg-amber-50"}>
                <div className="flex items-center justify-between">
                  <Badge className={phase.severity === "High" ? "bg-red-500" : "bg-amber-500"}>
                    Phase {index + 1}
                  </Badge>
                  <span className="text-sm font-medium text-gray-600">{phase.duration}</span>
                </div>
                <CardTitle className="text-lg mt-2">{phase.name}</CardTitle>
                <CardDescription>{phase.position}</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm text-gray-700 mb-4">{phase.description}</p>
                <h4 className="font-semibold text-gray-900 mb-2 text-sm">Key Effects:</h4>
                <ul className="space-y-1">
                  {phase.effects.map((effect, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs">
                      <AlertTriangle className={`w-3 h-3 mt-0.5 flex-shrink-0 ${
                        phase.severity === "High" ? "text-red-500" : "text-amber-500"
                      }`} />
                      <span className="text-gray-600">{effect}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-indigo-200 mb-8">
          <CardHeader>
            <CardTitle>{t('dosha.sadeSati.currentStatus', 'Current Sade Sati Status by Moon Sign (2026)')}</CardTitle>
            <CardDescription>
              {t('dosha.sadeSati.currentStatusDesc', 'Check your Moon sign to see your current Sade Sati status')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {signEffects.map((item) => (
                <div 
                  key={item.sign} 
                  className={`rounded-lg p-3 ${
                    item.currentStatus.includes("Phase") ? "bg-red-50 border border-red-200" : "bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-gray-900">{item.sign}</h4>
                    <Badge 
                      variant={item.currentStatus.includes("Phase") ? "default" : "secondary"}
                      className={item.currentStatus.includes("Phase") ? "bg-red-500" : ""}
                    >
                      {item.currentStatus}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600">{item.advice}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('dosha.sadeSati.remedies', 'Remedies for Sade Sati')}</h2>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card className="border-amber-200">
            <CardHeader className="bg-amber-50">
              <CardTitle className="text-amber-800">{t('dosha.dailyPractices', 'Daily Practices')}</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="space-y-2">
                {remedies.daily.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-blue-200">
            <CardHeader className="bg-blue-50">
              <CardTitle className="text-blue-800">{t('dosha.weeklyPractices', 'Weekly Practices')}</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="space-y-2">
                {remedies.weekly.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-purple-200">
            <CardHeader className="bg-purple-50">
              <CardTitle className="text-purple-800">{t('dosha.specialRemedies', 'Special Remedies')}</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="space-y-2">
                {remedies.special.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-green-200">
            <CardHeader className="bg-green-50">
              <CardTitle className="text-green-800">{t('dosha.lifestyleChanges', 'Lifestyle Changes')}</CardTitle>
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

        <Card className="border-gray-200 mb-8">
          <CardHeader>
            <CardTitle>{t('dosha.faq', 'Frequently Asked Questions')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div key={index} className="border-b border-gray-200 pb-4 last:border-0">
                  <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                  <p className="text-sm text-gray-700">{faq.answer}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="border-amber-200 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-2">{t('calculator.sadeSati.title', 'Sade Sati Calculator')}</h3>
              <p className="text-gray-600 text-sm mb-4">
                {t('calculator.sadeSati.checkStatus', 'Check your current Sade Sati status.')}
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/tools/sade-sati-calculator">
                  {t('common.checkNow', 'Check Now')} <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-amber-200 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-2">{t('transit.saturnTransit2026', 'Saturn Transit 2026')}</h3>
              <p className="text-gray-600 text-sm mb-4">
                {t('transit.saturnTransitDesc', 'Detailed Saturn transit predictions.')}
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/transits/saturn-transit-2026">
                  {t('common.readMore', 'Read More')} <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-amber-200 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-2">{t('consultation.consultAstrologer', 'Consult an Astrologer')}</h3>
              <p className="text-gray-600 text-sm mb-4">
                {t('dosha.sadeSati.consultDesc', 'Get personalized Sade Sati guidance.')}
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/consultation">
                  Book Consultation <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="border-blue-200 bg-blue-50 mt-12">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              The Spiritual Purpose of Sade Sati
            </h2>
            <div className="prose prose-blue max-w-none">
              <p className="text-gray-700 mb-4">
                Saturn is known as the great teacher in Vedic astrology. Sade Sati is not 
                meant to punish but to teach valuable life lessons. It strips away what 
                is not serving your highest good and helps you build a more authentic, 
                disciplined life.
              </p>
              <p className="text-gray-700 mb-4">
                During this period, you may be called to let go of attachments, face your 
                fears, and develop inner strength. The challenges you face are opportunities 
                for growth. Many people report that their greatest achievements and spiritual 
                breakthroughs occurred during Sade Sati.
              </p>
              <p className="text-gray-700">
                Approach this period with humility, patience, and a willingness to learn. 
                Follow the remedies with faith, maintain ethical conduct, and trust that 
                this too shall pass. The rewards of navigating Sade Sati successfully are 
                lasting wisdom, inner strength, and karmic purification.
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
            headline: "Shani Sade Sati - Complete Guide",
            description: "Complete guide to Saturn's 7.5 year transit with phases and remedies",
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
