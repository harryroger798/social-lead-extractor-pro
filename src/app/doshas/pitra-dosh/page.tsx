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
  Users,
} from "lucide-react";

export default function PitraDoshPage() {
  const { t } = useLanguage();

  const causes = [
    t('doshas.pitraDosh.causes.cause1', 'Ancestors who died unnatural or untimely deaths'),
    t('doshas.pitraDosh.causes.cause2', 'Unfulfilled wishes or desires of departed ancestors'),
    t('doshas.pitraDosh.causes.cause3', 'Neglect of ancestral rites and rituals (Shraddha)'),
    t('doshas.pitraDosh.causes.cause4', 'Bad deeds or sins committed by ancestors'),
    t('doshas.pitraDosh.causes.cause5', 'Curses received by ancestors'),
    t('doshas.pitraDosh.causes.cause6', 'Improper last rites or cremation'),
    t('doshas.pitraDosh.causes.cause7', 'Family disputes over property or inheritance'),
    t('doshas.pitraDosh.causes.cause8', 'Disrespect shown to parents or elders'),
  ];

  const effects = [
    {
      area: t('doshas.pitraDosh.effects.familyChildren.area', 'Family & Children'),
      symptoms: [
        t('doshas.pitraDosh.effects.familyChildren.symptom1', 'Difficulty in conceiving children'),
        t('doshas.pitraDosh.effects.familyChildren.symptom2', 'Repeated miscarriages'),
        t('doshas.pitraDosh.effects.familyChildren.symptom3', 'Health issues in children'),
        t('doshas.pitraDosh.effects.familyChildren.symptom4', 'Lack of harmony in family'),
        t('doshas.pitraDosh.effects.familyChildren.symptom5', 'Frequent family disputes'),
      ],
    },
    {
      area: t('doshas.pitraDosh.effects.marriageRelationships.area', 'Marriage & Relationships'),
      symptoms: [
        t('doshas.pitraDosh.effects.marriageRelationships.symptom1', 'Delays in marriage'),
        t('doshas.pitraDosh.effects.marriageRelationships.symptom2', 'Marital discord and conflicts'),
        t('doshas.pitraDosh.effects.marriageRelationships.symptom3', 'Multiple marriages or divorces'),
        t('doshas.pitraDosh.effects.marriageRelationships.symptom4', 'Lack of happiness in married life'),
        t('doshas.pitraDosh.effects.marriageRelationships.symptom5', "Spouse's health issues"),
      ],
    },
    {
      area: t('doshas.pitraDosh.effects.careerFinance.area', 'Career & Finance'),
      symptoms: [
        t('doshas.pitraDosh.effects.careerFinance.symptom1', 'Obstacles in career growth'),
        t('doshas.pitraDosh.effects.careerFinance.symptom2', 'Financial instability'),
        t('doshas.pitraDosh.effects.careerFinance.symptom3', 'Business failures'),
        t('doshas.pitraDosh.effects.careerFinance.symptom4', 'Debts and losses'),
        t('doshas.pitraDosh.effects.careerFinance.symptom5', 'Lack of recognition despite hard work'),
      ],
    },
    {
      area: t('doshas.pitraDosh.effects.healthMentalPeace.area', 'Health & Mental Peace'),
      symptoms: [
        t('doshas.pitraDosh.effects.healthMentalPeace.symptom1', 'Chronic health issues'),
        t('doshas.pitraDosh.effects.healthMentalPeace.symptom2', 'Mental stress and anxiety'),
        t('doshas.pitraDosh.effects.healthMentalPeace.symptom3', 'Nightmares about deceased relatives'),
        t('doshas.pitraDosh.effects.healthMentalPeace.symptom4', 'Unexplained fears and phobias'),
        t('doshas.pitraDosh.effects.healthMentalPeace.symptom5', 'Lack of peace and satisfaction'),
      ],
    },
  ];

  const astrologicalIndicators = [
    t('doshas.pitraDosh.indicators.indicator1', 'Sun conjunct with Rahu in the birth chart'),
    t('doshas.pitraDosh.indicators.indicator2', 'Sun conjunct with Ketu in the birth chart'),
    t('doshas.pitraDosh.indicators.indicator3', 'Sun in the 9th house with malefic aspects'),
    t('doshas.pitraDosh.indicators.indicator4', '9th house lord afflicted by Rahu or Ketu'),
    t('doshas.pitraDosh.indicators.indicator5', 'Saturn aspecting the 9th house or its lord'),
    t('doshas.pitraDosh.indicators.indicator6', 'Rahu in the 9th house'),
    t('doshas.pitraDosh.indicators.indicator7', '5th house (children) afflicted by malefics'),
    t('doshas.pitraDosh.indicators.indicator8', 'Moon afflicted in the 4th house'),
  ];

  const remedies = {
    shraddha: [
      t('doshas.pitraDosh.remedies.shraddha.remedy1', 'Perform Shraddha rituals during Pitru Paksha (September-October)'),
      t('doshas.pitraDosh.remedies.shraddha.remedy2', 'Offer Tarpan (water offerings) to ancestors daily'),
      t('doshas.pitraDosh.remedies.shraddha.remedy3', 'Conduct Pind Daan at Gaya, Varanasi, or Prayagraj'),
      t('doshas.pitraDosh.remedies.shraddha.remedy4', 'Perform Narayan Bali Puja at Trimbakeshwar'),
      t('doshas.pitraDosh.remedies.shraddha.remedy5', 'Conduct Tripindi Shraddha for three generations'),
    ],
    puja: [
      t('doshas.pitraDosh.remedies.puja.remedy1', 'Perform Pitra Dosh Nivaran Puja'),
      t('doshas.pitraDosh.remedies.puja.remedy2', 'Conduct Rudrabhishek for ancestors'),
      t('doshas.pitraDosh.remedies.puja.remedy3', 'Perform Naag Puja if ancestors died of snake bite'),
      t('doshas.pitraDosh.remedies.puja.remedy4', 'Conduct Sarpa Shanti if Kaal Sarp is also present'),
      t('doshas.pitraDosh.remedies.puja.remedy5', 'Perform Brahma Puran recitation'),
    ],
    donations: [
      t('doshas.pitraDosh.remedies.donations.remedy1', 'Feed Brahmins and donate clothes during Pitru Paksha'),
      t('doshas.pitraDosh.remedies.donations.remedy2', "Donate food to the poor in ancestors' names"),
      t('doshas.pitraDosh.remedies.donations.remedy3', 'Donate black sesame seeds and rice'),
      t('doshas.pitraDosh.remedies.donations.remedy4', 'Donate cows or contribute to Gaushalas'),
      t('doshas.pitraDosh.remedies.donations.remedy5', 'Donate to orphanages and old age homes'),
    ],
    daily: [
      t('doshas.pitraDosh.remedies.daily.remedy1', 'Offer water to the Sun every morning'),
      t('doshas.pitraDosh.remedies.daily.remedy2', "Feed crows daily (considered ancestors' messengers)"),
      t('doshas.pitraDosh.remedies.daily.remedy3', 'Keep a photo of ancestors and offer flowers'),
      t('doshas.pitraDosh.remedies.daily.remedy4', 'Light a lamp for ancestors on Amavasya'),
      t('doshas.pitraDosh.remedies.daily.remedy5', 'Chant Pitru Gayatri Mantra daily'),
      t('doshas.pitraDosh.remedies.daily.remedy6', 'Respect and serve living parents and elders'),
    ],
  };

  const importantDays = [
    {
      occasion: t('doshas.pitraDosh.importantDays.pitruPaksha.occasion', 'Pitru Paksha'),
      timing: t('doshas.pitraDosh.importantDays.pitruPaksha.timing', 'September-October (16 days)'),
      significance: t('doshas.pitraDosh.importantDays.pitruPaksha.significance', 'Most important period for ancestor worship. Perform Shraddha and Tarpan.'),
    },
    {
      occasion: t('doshas.pitraDosh.importantDays.amavasya.occasion', 'Amavasya (New Moon)'),
      timing: t('doshas.pitraDosh.importantDays.amavasya.timing', 'Monthly'),
      significance: t('doshas.pitraDosh.importantDays.amavasya.significance', 'Offer Tarpan and light lamps for ancestors.'),
    },
    {
      occasion: t('doshas.pitraDosh.importantDays.deathAnniversary.occasion', 'Death Anniversary'),
      timing: t('doshas.pitraDosh.importantDays.deathAnniversary.timing', 'Yearly'),
      significance: t('doshas.pitraDosh.importantDays.deathAnniversary.significance', "Perform Shraddha on the tithi of ancestor's death."),
    },
    {
      occasion: t('doshas.pitraDosh.importantDays.mahalayaAmavasya.occasion', 'Mahalaya Amavasya'),
      timing: t('doshas.pitraDosh.importantDays.mahalayaAmavasya.timing', 'Last day of Pitru Paksha'),
      significance: t('doshas.pitraDosh.importantDays.mahalayaAmavasya.significance', 'Most powerful day for Pitra Dosh remedies.'),
    },
  ];

  const faqs = [
    {
      question: t('doshas.pitraDosh.faqs.faq1.question', 'How do I know if I have Pitra Dosh?'),
      answer: t('doshas.pitraDosh.faqs.faq1.answer', 'Pitra Dosh is identified through birth chart analysis, looking at the Sun, 9th house, and Rahu-Ketu positions. Symptoms like repeated obstacles, family issues, and childlessness may also indicate this dosha.'),
    },
    {
      question: t('doshas.pitraDosh.faqs.faq2.question', 'Can Pitra Dosh be completely removed?'),
      answer: t('doshas.pitraDosh.faqs.faq2.answer', 'With sincere remedies and ancestor worship, the effects can be significantly reduced. Complete removal depends on the severity and consistent practice of remedies over time.'),
    },
    {
      question: t('doshas.pitraDosh.faqs.faq3.question', 'Is Pitra Dosh hereditary?'),
      answer: t('doshas.pitraDosh.faqs.faq3.answer', "Yes, Pitra Dosh can pass through generations until the ancestral karma is resolved. This is why it's important to perform regular Shraddha and ancestor worship."),
    },
    {
      question: t('doshas.pitraDosh.faqs.faq4.question', 'What is the best place for Pitra Dosh remedies?'),
      answer: t('doshas.pitraDosh.faqs.faq4.answer', 'Gaya (Bihar) is considered the most powerful place for Pind Daan. Other important places include Varanasi, Prayagraj, Trimbakeshwar, and Haridwar.'),
    },
  ];
  return (
    <div className="py-12 lg:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
                    <Badge className="mb-4 bg-orange-100 text-orange-800">{t('doshas.pitraDosh.ancestralKarma', 'Ancestral Karma')}</Badge>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                      {t('doshas.pitraDosh.title', 'Pitra Dosh (Pitru Dosha)')}
                    </h1>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                      {t('doshas.pitraDosh.subtitle', 'Complete guide to understanding Pitra Dosh, ancestral karma, its effects on family and life, and powerful remedies to honor and pacify ancestors.')}
          </p>
        </div>

        <Card className="border-orange-200 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-orange-600" />
              {t('doshas.pitraDosh.whatIs.title', 'What is Pitra Dosh?')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-orange max-w-none">
              <p className="text-gray-700 mb-4">
                {t('doshas.pitraDosh.whatIs.description1', 'Pitra Dosh (also spelled Pitru Dosha) is a karmic debt owed to ancestors. In Vedic astrology, it occurs when the souls of departed ancestors are unsatisfied due to various reasons, and their unfulfilled karma affects the current generation.')}
              </p>
              <p className="text-gray-700 mb-4">
                {t('doshas.pitraDosh.whatIs.description2', 'The word "Pitra" means ancestors or forefathers, and "Dosh" means affliction or fault. This dosha is identified in the birth chart primarily through the position of the Sun (representing father and ancestors), the 9th house (house of father and fortune), and the nodes Rahu and Ketu.')}
              </p>
              <p className="text-gray-700">
                {t('doshas.pitraDosh.whatIs.description3', 'Pitra Dosh is not a curse but rather unresolved ancestral karma that needs to be addressed through proper rituals, worship, and good deeds. By honoring our ancestors and performing prescribed remedies, we can help their souls find peace and remove obstacles from our own lives.')}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="border-red-200">
            <CardHeader className="bg-red-50">
              <CardTitle className="text-red-800 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                {t('doshas.pitraDosh.causesTitle', 'Causes of Pitra Dosh')}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="space-y-2">
                {causes.map((cause, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-red-500 mt-0.5">•</span>
                    <span className="text-gray-700">{cause}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-indigo-200">
            <CardHeader className="bg-indigo-50">
              <CardTitle className="text-indigo-800">{t('doshas.pitraDosh.indicatorsTitle', 'Astrological Indicators')}</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="space-y-2">
                {astrologicalIndicators.map((indicator, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-indigo-500 mt-0.5">•</span>
                    <span className="text-gray-700">{indicator}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('doshas.pitraDosh.effectsTitle', 'Effects of Pitra Dosh')}</h2>
        
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {effects.map((category) => (
            <Card key={category.area} className="border-amber-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-amber-800">{category.area}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {category.symptoms.map((symptom, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <AlertTriangle className="w-3 h-3 text-amber-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{symptom}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('doshas.pitraDosh.remediesTitle', 'Remedies for Pitra Dosh')}</h2>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card className="border-orange-200">
            <CardHeader className="bg-orange-50">
              <CardTitle className="text-orange-800">{t('doshas.pitraDosh.remedies.shraddha.title', 'Shraddha & Tarpan')}</CardTitle>
              <CardDescription>{t('doshas.pitraDosh.remedies.shraddha.description', 'Most important remedies for ancestors')}</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="space-y-2">
                {remedies.shraddha.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-purple-200">
            <CardHeader className="bg-purple-50">
              <CardTitle className="text-purple-800">{t('doshas.pitraDosh.remedies.puja.title', 'Puja & Rituals')}</CardTitle>
              <CardDescription>{t('doshas.pitraDosh.remedies.puja.description', 'Special pujas for Pitra Dosh')}</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="space-y-2">
                {remedies.puja.map((item, index) => (
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
              <CardTitle className="text-blue-800">{t('doshas.pitraDosh.remedies.donations.title', 'Donations & Charity')}</CardTitle>
              <CardDescription>{t('doshas.pitraDosh.remedies.donations.description', "Give in ancestors' names")}</CardDescription>
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
              <CardTitle className="text-green-800">{t('doshas.pitraDosh.remedies.daily.title', 'Daily Practices')}</CardTitle>
              <CardDescription>{t('doshas.pitraDosh.remedies.daily.description', 'Regular ancestor worship')}</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="space-y-2">
                {remedies.daily.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card className="border-amber-200 mb-8">
          <CardHeader>
            <CardTitle>{t('doshas.pitraDosh.importantDaysTitle', 'Important Days for Pitra Dosh Remedies')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {importantDays.map((day, index) => (
                <div key={index} className="bg-amber-50 rounded-lg p-4">
                  <h4 className="font-semibold text-amber-800">{day.occasion}</h4>
                  <p className="text-sm text-amber-600 mb-1">{day.timing}</p>
                  <p className="text-sm text-gray-700">{day.significance}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 mb-8">
          <CardHeader>
            <CardTitle>{t('doshas.pitraDosh.faqTitle', 'Frequently Asked Questions')}</CardTitle>
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
              <h3 className="font-semibold text-lg mb-2">{t('doshas.pitraDosh.cta.kundli.title', 'Full Kundli Analysis')}</h3>
              <p className="text-gray-600 text-sm mb-4">
                {t('doshas.pitraDosh.cta.kundli.description', 'Check for Pitra Dosh in your birth chart.')}
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/tools/kundli-calculator">
                  {t('doshas.pitraDosh.cta.kundli.button', 'Generate Kundli')} <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-amber-200 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-2">{t('doshas.pitraDosh.cta.doshas.title', 'Other Doshas')}</h3>
              <p className="text-gray-600 text-sm mb-4">
                {t('doshas.pitraDosh.cta.doshas.description', 'Learn about Mangal Dosh and Kaal Sarp.')}
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/doshas/mangal-dosh">
                  {t('doshas.pitraDosh.cta.doshas.button', 'View Doshas')} <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-amber-200 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-2">{t('doshas.pitraDosh.cta.consult.title', 'Consult an Astrologer')}</h3>
              <p className="text-gray-600 text-sm mb-4">
                {t('doshas.pitraDosh.cta.consult.description', 'Get personalized Pitra Dosh guidance.')}
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/consultation">
                  {t('doshas.pitraDosh.cta.consult.button', 'Book Consultation')} <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="border-orange-200 bg-orange-50 mt-12">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {t('doshas.pitraDosh.importance.title', 'The Importance of Honoring Ancestors')}
            </h2>
            <div className="prose prose-orange max-w-none">
              <p className="text-gray-700 mb-4">
                {t('doshas.pitraDosh.importance.description1', 'In Vedic tradition, ancestors (Pitru) are considered divine beings who continue to influence our lives from the ancestral realm. Honoring them is not just a religious duty but a way of acknowledging our roots and the sacrifices made by previous generations.')}
              </p>
              <p className="text-gray-700 mb-4">
                {t('doshas.pitraDosh.importance.description2', 'Regular ancestor worship brings blessings in the form of family harmony, prosperity, good health, and spiritual progress. It creates a positive karmic cycle that benefits both the living and the departed souls.')}
              </p>
              <p className="text-gray-700">
                {t('doshas.pitraDosh.importance.description3', "Even if you don't have Pitra Dosh in your chart, performing Shraddha during Pitru Paksha and remembering ancestors with gratitude is highly recommended. This practice strengthens family bonds across generations and ensures the continued blessings of your ancestral lineage.")}
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
            headline: "Pitra Dosh - Ancestral Karma Guide",
            description: "Complete guide to Pitra Dosh with causes, effects, and remedies",
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
