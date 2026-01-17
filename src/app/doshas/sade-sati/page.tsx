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

export default function SadeSatiPage() {
  const { t } = useLanguage();

  const phases = [
    {
      name: t('doshas.sadeSati.phases.rising.name', 'Rising Phase (First Phase)'),
      duration: t('doshas.sadeSati.phases.rising.duration', '2.5 Years'),
      position: t('doshas.sadeSati.phases.rising.position', 'Saturn in 12th from Moon'),
      description: t('doshas.sadeSati.phases.rising.description', 'Saturn transits the 12th house from your Moon sign. This phase affects expenses, sleep, foreign connections, and spiritual matters.'),
      effects: [
        t('doshas.sadeSati.phases.rising.effect1', 'Increased expenses and financial strain'),
        t('doshas.sadeSati.phases.rising.effect2', 'Sleep disturbances and health issues'),
        t('doshas.sadeSati.phases.rising.effect3', 'Mental stress and anxiety'),
        t('doshas.sadeSati.phases.rising.effect4', 'Possible foreign travel or relocation'),
        t('doshas.sadeSati.phases.rising.effect5', 'Spiritual awakening begins'),
      ],
      severity: t('doshas.severity.moderate', 'Moderate'),
    },
    {
      name: t('doshas.sadeSati.phases.peak.name', 'Peak Phase (Second Phase)'),
      duration: t('doshas.sadeSati.phases.peak.duration', '2.5 Years'),
      position: t('doshas.sadeSati.phases.peak.position', 'Saturn over Moon Sign'),
      description: t('doshas.sadeSati.phases.peak.description', 'Saturn transits directly over your Moon sign. This is the most intense phase affecting mind, emotions, and overall life circumstances.'),
      effects: [
        t('doshas.sadeSati.phases.peak.effect1', 'Emotional turbulence and mental pressure'),
        t('doshas.sadeSati.phases.peak.effect2', 'Career challenges and obstacles'),
        t('doshas.sadeSati.phases.peak.effect3', 'Health issues, especially mental health'),
        t('doshas.sadeSati.phases.peak.effect4', 'Relationship strain and family issues'),
        t('doshas.sadeSati.phases.peak.effect5', 'Major life transformations'),
      ],
      severity: t('doshas.severity.high', 'High'),
    },
    {
      name: t('doshas.sadeSati.phases.setting.name', 'Setting Phase (Third Phase)'),
      duration: t('doshas.sadeSati.phases.setting.duration', '2.5 Years'),
      position: t('doshas.sadeSati.phases.setting.position', 'Saturn in 2nd from Moon'),
      description: t('doshas.sadeSati.phases.setting.description', 'Saturn transits the 2nd house from your Moon sign. This phase affects wealth, family, speech, and accumulated resources.'),
      effects: [
        t('doshas.sadeSati.phases.setting.effect1', 'Financial fluctuations and losses'),
        t('doshas.sadeSati.phases.setting.effect2', 'Family disputes and tensions'),
        t('doshas.sadeSati.phases.setting.effect3', 'Speech-related issues'),
        t('doshas.sadeSati.phases.setting.effect4', 'Eye and face-related health concerns'),
        t('doshas.sadeSati.phases.setting.effect5', 'Gradual improvement towards end'),
      ],
      severity: t('doshas.severity.moderate', 'Moderate'),
    },
  ];

  const signEffects = [
    {
      sign: t('horoscope.signs.aries', 'Aries'),
      currentStatus: t('doshas.sadeSati.status.notInSadeSati', 'Not in Sade Sati'),
      nextSadeSati: "2027-2034",
      advice: t('doshas.sadeSati.signs.aries.advice', 'Prepare for upcoming Sade Sati by strengthening Saturn in your chart.'),
    },
    {
      sign: t('horoscope.signs.taurus', 'Taurus'),
      currentStatus: t('doshas.sadeSati.status.notInSadeSati', 'Not in Sade Sati'),
      nextSadeSati: "2029-2037",
      advice: t('doshas.sadeSati.signs.taurus.advice', 'Good period for growth. Use this time to build strong foundations.'),
    },
    {
      sign: t('horoscope.signs.gemini', 'Gemini'),
      currentStatus: t('doshas.sadeSati.status.notInSadeSati', 'Not in Sade Sati'),
      nextSadeSati: "2032-2039",
      advice: t('doshas.sadeSati.signs.gemini.advice', 'Favorable period. Focus on career and relationship building.'),
    },
    {
      sign: t('horoscope.signs.cancer', 'Cancer'),
      currentStatus: t('doshas.sadeSati.status.notInSadeSati', 'Not in Sade Sati'),
      nextSadeSati: "2034-2042",
      advice: t('doshas.sadeSati.signs.cancer.advice', 'Excellent period for personal growth and achievements.'),
    },
    {
      sign: t('horoscope.signs.leo', 'Leo'),
      currentStatus: t('doshas.sadeSati.status.notInSadeSati', 'Not in Sade Sati'),
      nextSadeSati: "2037-2044",
      advice: t('doshas.sadeSati.signs.leo.advice', 'Use this favorable time for major life decisions.'),
    },
    {
      sign: t('horoscope.signs.virgo', 'Virgo'),
      currentStatus: t('doshas.sadeSati.status.notInSadeSati', 'Not in Sade Sati'),
      nextSadeSati: "2039-2047",
      advice: t('doshas.sadeSati.signs.virgo.advice', 'Good period for health improvements and service.'),
    },
    {
      sign: t('horoscope.signs.libra', 'Libra'),
      currentStatus: t('doshas.sadeSati.status.notInSadeSati', 'Not in Sade Sati'),
      nextSadeSati: "2042-2049",
      advice: t('doshas.sadeSati.signs.libra.advice', 'Focus on relationships and partnerships during this favorable time.'),
    },
    {
      sign: t('horoscope.signs.scorpio', 'Scorpio'),
      currentStatus: t('doshas.sadeSati.status.notInSadeSati', 'Not in Sade Sati'),
      nextSadeSati: "2044-2052",
      advice: t('doshas.sadeSati.signs.scorpio.advice', 'Excellent period for transformation and research.'),
    },
    {
      sign: t('horoscope.signs.sagittarius', 'Sagittarius'),
      currentStatus: t('doshas.sadeSati.status.notInSadeSati', 'Not in Sade Sati'),
      nextSadeSati: "2047-2054",
      advice: t('doshas.sadeSati.signs.sagittarius.advice', 'Good time for higher education and spiritual pursuits.'),
    },
    {
      sign: t('horoscope.signs.capricorn', 'Capricorn'),
      currentStatus: t('doshas.sadeSati.status.notInSadeSati', 'Not in Sade Sati'),
      nextSadeSati: "2020-2027 (ending)",
      advice: t('doshas.sadeSati.signs.capricorn.advice', 'Sade Sati ending soon. Relief and rewards coming.'),
    },
    {
      sign: t('horoscope.signs.aquarius', 'Aquarius'),
      currentStatus: t('doshas.sadeSati.status.risingPhase', 'Rising Phase'),
      nextSadeSati: "Current (2023-2030)",
      advice: t('doshas.sadeSati.signs.aquarius.advice', 'First phase active. Focus on spiritual growth and managing expenses.'),
    },
    {
      sign: t('horoscope.signs.pisces', 'Pisces'),
      currentStatus: t('doshas.sadeSati.status.peakPhase', 'Peak Phase'),
      nextSadeSati: "Current (2025-2032)",
      advice: t('doshas.sadeSati.signs.pisces.advice', 'Most intense phase. Practice patience and follow remedies diligently.'),
    },
  ];

  const remedies = {
    daily: [
      t('doshas.sadeSati.remedies.daily.1', "Chant 'Om Sham Shanicharaya Namaha' 108 times daily"),
      t('doshas.sadeSati.remedies.daily.2', 'Light a sesame oil lamp on Saturdays'),
      t('doshas.sadeSati.remedies.daily.3', 'Recite Hanuman Chalisa, especially on Saturdays'),
      t('doshas.sadeSati.remedies.daily.4', 'Meditate and practice patience'),
      t('doshas.sadeSati.remedies.daily.5', 'Wake up before sunrise on Saturdays'),
    ],
    weekly: [
      t('doshas.sadeSati.remedies.weekly.1', 'Fast on Saturdays (eat only once after sunset)'),
      t('doshas.sadeSati.remedies.weekly.2', 'Visit Shani temple on Saturdays'),
      t('doshas.sadeSati.remedies.weekly.3', 'Donate black items (sesame, oil, cloth) on Saturdays'),
      t('doshas.sadeSati.remedies.weekly.4', 'Feed crows with rice mixed in sesame oil'),
      t('doshas.sadeSati.remedies.weekly.5', 'Serve the elderly and disabled on Saturdays'),
    ],
    special: [
      t('doshas.sadeSati.remedies.special.1', 'Perform Shani Shanti Puja'),
      t('doshas.sadeSati.remedies.special.2', 'Conduct Til (sesame) Havan'),
      t('doshas.sadeSati.remedies.special.3', 'Visit Shani Shingnapur temple'),
      t('doshas.sadeSati.remedies.special.4', 'Wear Blue Sapphire only after proper consultation'),
      t('doshas.sadeSati.remedies.special.5', 'Wear iron ring made from horseshoe on middle finger'),
      t('doshas.sadeSati.remedies.special.6', 'Donate to organizations helping the disabled'),
    ],
    lifestyle: [
      t('doshas.sadeSati.remedies.lifestyle.1', 'Practice honesty and ethical conduct'),
      t('doshas.sadeSati.remedies.lifestyle.2', 'Respect elders, servants, and workers'),
      t('doshas.sadeSati.remedies.lifestyle.3', 'Avoid alcohol and non-vegetarian food on Saturdays'),
      t('doshas.sadeSati.remedies.lifestyle.4', 'Maintain discipline and punctuality'),
      t('doshas.sadeSati.remedies.lifestyle.5', 'Help the poor and underprivileged'),
      t('doshas.sadeSati.remedies.lifestyle.6', 'Avoid starting new ventures on Saturdays'),
    ],
  };

  const faqs = [
    {
      question: t('doshas.sadeSati.faq.1.question', 'Does everyone experience Sade Sati the same way?'),
      answer: t('doshas.sadeSati.faq.1.answer', "No, the effects vary based on Saturn's position in your birth chart, its strength, aspects from other planets, and your overall karma. Some people experience mild effects while others face significant challenges."),
    },
    {
      question: t('doshas.sadeSati.faq.2.question', 'How many times does Sade Sati occur in a lifetime?'),
      answer: t('doshas.sadeSati.faq.2.answer', 'Sade Sati occurs 2-3 times in an average lifetime, as Saturn takes approximately 29.5 years to complete one cycle through all 12 zodiac signs.'),
    },
    {
      question: t('doshas.sadeSati.faq.3.question', 'Is Sade Sati always negative?'),
      answer: t('doshas.sadeSati.faq.3.answer', 'Not necessarily. While it brings challenges, it also offers opportunities for growth, maturity, and spiritual development. Many people achieve great success during Sade Sati through hard work and perseverance.'),
    },
    {
      question: t('doshas.sadeSati.faq.4.question', 'Can remedies completely remove Sade Sati effects?'),
      answer: t('doshas.sadeSati.faq.4.answer', "Remedies help reduce the intensity of challenges and provide strength to face them. They don't completely remove effects but make the journey smoother and more manageable."),
    },
  ];
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
                            {t('doshas.sadeSati.description1', 'Sade Sati (साढ़े साती) literally means "seven and a half" in Hindi, referring to the approximately 7.5 years Saturn takes to transit through three zodiac signs - the sign before your Moon sign, your Moon sign itself, and the sign after your Moon sign.')}
                          </p>
                          <p className="text-gray-700 mb-4">
                            {t('doshas.sadeSati.description2', 'Since Saturn spends about 2.5 years in each sign, the total transit period is 7.5 years. This period is considered significant in Vedic astrology as Saturn, the planet of karma, discipline, and hard work, directly influences your mind (represented by the Moon).')}
                          </p>
                          <p className="text-gray-700">
                            {t('doshas.sadeSati.description3', "While Sade Sati is often feared, it's actually a period of karmic balancing and spiritual growth. Those who embrace its lessons with patience and discipline often emerge stronger and wiser.")}
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
                                      {t('doshas.sadeSati.phase', 'Phase')} {index + 1}
                                    </Badge>
                  <span className="text-sm font-medium text-gray-600">{phase.duration}</span>
                </div>
                <CardTitle className="text-lg mt-2">{phase.name}</CardTitle>
                <CardDescription>{phase.position}</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm text-gray-700 mb-4">{phase.description}</p>
                <h4 className="font-semibold text-gray-900 mb-2 text-sm">{t('doshas.sadeSati.keyEffects', 'Key Effects:')}</h4>
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
                                  {t('consultation.bookConsultation', 'Book Consultation')} <ArrowRight className="w-4 h-4 ml-2" />
                                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

                <Card className="border-blue-200 bg-blue-50 mt-12">
                  <CardContent className="pt-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      {t('doshas.sadeSati.spiritualPurpose.title', 'The Spiritual Purpose of Sade Sati')}
                    </h2>
                    <div className="prose prose-blue max-w-none">
                      <p className="text-gray-700 mb-4">
                        {t('doshas.sadeSati.spiritualPurpose.para1', 'Saturn is known as the great teacher in Vedic astrology. Sade Sati is not meant to punish but to teach valuable life lessons. It strips away what is not serving your highest good and helps you build a more authentic, disciplined life.')}
                      </p>
                      <p className="text-gray-700 mb-4">
                        {t('doshas.sadeSati.spiritualPurpose.para2', 'During this period, you may be called to let go of attachments, face your fears, and develop inner strength. The challenges you face are opportunities for growth. Many people report that their greatest achievements and spiritual breakthroughs occurred during Sade Sati.')}
                      </p>
                      <p className="text-gray-700">
                        {t('doshas.sadeSati.spiritualPurpose.para3', 'Approach this period with humility, patience, and a willingness to learn. Follow the remedies with faith, maintain ethical conduct, and trust that this too shall pass. The rewards of navigating Sade Sati successfully are lasting wisdom, inner strength, and karmic purification.')}
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
