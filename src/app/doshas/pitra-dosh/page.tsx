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

export const metadata: Metadata = {
  title: "Pitra Dosh - Ancestral Karma, Effects & Remedies | VedicStarAstro",
  description: "Complete guide to Pitra Dosh (Pitru Dosha). Learn about ancestral karma, causes, effects on family and life, and powerful remedies to pacify ancestors.",
  keywords: [
    "pitra dosh",
    "pitru dosha",
    "ancestral karma",
    "pitra dosh remedies",
    "pitru paksha",
    "ancestor worship",
  ],
};

const causes = [
  "Ancestors who died unnatural or untimely deaths",
  "Unfulfilled wishes or desires of departed ancestors",
  "Neglect of ancestral rites and rituals (Shraddha)",
  "Bad deeds or sins committed by ancestors",
  "Curses received by ancestors",
  "Improper last rites or cremation",
  "Family disputes over property or inheritance",
  "Disrespect shown to parents or elders",
];

const effects = [
  {
    area: "Family & Children",
    symptoms: [
      "Difficulty in conceiving children",
      "Repeated miscarriages",
      "Health issues in children",
      "Lack of harmony in family",
      "Frequent family disputes",
    ],
  },
  {
    area: "Marriage & Relationships",
    symptoms: [
      "Delays in marriage",
      "Marital discord and conflicts",
      "Multiple marriages or divorces",
      "Lack of happiness in married life",
      "Spouse's health issues",
    ],
  },
  {
    area: "Career & Finance",
    symptoms: [
      "Obstacles in career growth",
      "Financial instability",
      "Business failures",
      "Debts and losses",
      "Lack of recognition despite hard work",
    ],
  },
  {
    area: "Health & Mental Peace",
    symptoms: [
      "Chronic health issues",
      "Mental stress and anxiety",
      "Nightmares about deceased relatives",
      "Unexplained fears and phobias",
      "Lack of peace and satisfaction",
    ],
  },
];

const astrologicalIndicators = [
  "Sun conjunct with Rahu in the birth chart",
  "Sun conjunct with Ketu in the birth chart",
  "Sun in the 9th house with malefic aspects",
  "9th house lord afflicted by Rahu or Ketu",
  "Saturn aspecting the 9th house or its lord",
  "Rahu in the 9th house",
  "5th house (children) afflicted by malefics",
  "Moon afflicted in the 4th house",
];

const remedies = {
  shraddha: [
    "Perform Shraddha rituals during Pitru Paksha (September-October)",
    "Offer Tarpan (water offerings) to ancestors daily",
    "Conduct Pind Daan at Gaya, Varanasi, or Prayagraj",
    "Perform Narayan Bali Puja at Trimbakeshwar",
    "Conduct Tripindi Shraddha for three generations",
  ],
  puja: [
    "Perform Pitra Dosh Nivaran Puja",
    "Conduct Rudrabhishek for ancestors",
    "Perform Naag Puja if ancestors died of snake bite",
    "Conduct Sarpa Shanti if Kaal Sarp is also present",
    "Perform Brahma Puran recitation",
  ],
  donations: [
    "Feed Brahmins and donate clothes during Pitru Paksha",
    "Donate food to the poor in ancestors' names",
    "Donate black sesame seeds and rice",
    "Donate cows or contribute to Gaushalas",
    "Donate to orphanages and old age homes",
  ],
  daily: [
    "Offer water to the Sun every morning",
    "Feed crows daily (considered ancestors' messengers)",
    "Keep a photo of ancestors and offer flowers",
    "Light a lamp for ancestors on Amavasya",
    "Chant Pitru Gayatri Mantra daily",
    "Respect and serve living parents and elders",
  ],
};

const importantDays = [
  {
    occasion: "Pitru Paksha",
    timing: "September-October (16 days)",
    significance: "Most important period for ancestor worship. Perform Shraddha and Tarpan.",
  },
  {
    occasion: "Amavasya (New Moon)",
    timing: "Monthly",
    significance: "Offer Tarpan and light lamps for ancestors.",
  },
  {
    occasion: "Death Anniversary",
    timing: "Yearly",
    significance: "Perform Shraddha on the tithi of ancestor's death.",
  },
  {
    occasion: "Mahalaya Amavasya",
    timing: "Last day of Pitru Paksha",
    significance: "Most powerful day for Pitra Dosh remedies.",
  },
];

const faqs = [
  {
    question: "How do I know if I have Pitra Dosh?",
    answer: "Pitra Dosh is identified through birth chart analysis, looking at the Sun, 9th house, and Rahu-Ketu positions. Symptoms like repeated obstacles, family issues, and childlessness may also indicate this dosha.",
  },
  {
    question: "Can Pitra Dosh be completely removed?",
    answer: "With sincere remedies and ancestor worship, the effects can be significantly reduced. Complete removal depends on the severity and consistent practice of remedies over time.",
  },
  {
    question: "Is Pitra Dosh hereditary?",
    answer: "Yes, Pitra Dosh can pass through generations until the ancestral karma is resolved. This is why it's important to perform regular Shraddha and ancestor worship.",
  },
  {
    question: "What is the best place for Pitra Dosh remedies?",
    answer: "Gaya (Bihar) is considered the most powerful place for Pind Daan. Other important places include Varanasi, Prayagraj, Trimbakeshwar, and Haridwar.",
  },
];

export default function PitraDoshPage() {
  const { t } = useLanguage();
  return (
    <div className="py-12 lg:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-orange-100 text-orange-800">Ancestral Karma</Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Pitra Dosh (Pitru Dosha)
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Complete guide to understanding Pitra Dosh, ancestral karma, its effects 
            on family and life, and powerful remedies to honor and pacify ancestors.
          </p>
        </div>

        <Card className="border-orange-200 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-orange-600" />
              What is Pitra Dosh?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-orange max-w-none">
              <p className="text-gray-700 mb-4">
                Pitra Dosh (also spelled Pitru Dosha) is a karmic debt owed to ancestors. 
                In Vedic astrology, it occurs when the souls of departed ancestors are 
                unsatisfied due to various reasons, and their unfulfilled karma affects 
                the current generation.
              </p>
              <p className="text-gray-700 mb-4">
                The word &quot;Pitra&quot; means ancestors or forefathers, and &quot;Dosh&quot; means 
                affliction or fault. This dosha is identified in the birth chart primarily 
                through the position of the Sun (representing father and ancestors), the 
                9th house (house of father and fortune), and the nodes Rahu and Ketu.
              </p>
              <p className="text-gray-700">
                Pitra Dosh is not a curse but rather unresolved ancestral karma that needs 
                to be addressed through proper rituals, worship, and good deeds. By honoring 
                our ancestors and performing prescribed remedies, we can help their souls 
                find peace and remove obstacles from our own lives.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="border-red-200">
            <CardHeader className="bg-red-50">
              <CardTitle className="text-red-800 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Causes of Pitra Dosh
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
              <CardTitle className="text-indigo-800">Astrological Indicators</CardTitle>
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

        <h2 className="text-2xl font-bold text-gray-900 mb-6">Effects of Pitra Dosh</h2>
        
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

        <h2 className="text-2xl font-bold text-gray-900 mb-6">Remedies for Pitra Dosh</h2>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card className="border-orange-200">
            <CardHeader className="bg-orange-50">
              <CardTitle className="text-orange-800">Shraddha & Tarpan</CardTitle>
              <CardDescription>Most important remedies for ancestors</CardDescription>
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
              <CardTitle className="text-purple-800">Puja & Rituals</CardTitle>
              <CardDescription>Special pujas for Pitra Dosh</CardDescription>
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
              <CardTitle className="text-blue-800">Donations & Charity</CardTitle>
              <CardDescription>Give in ancestors&apos; names</CardDescription>
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
              <CardTitle className="text-green-800">Daily Practices</CardTitle>
              <CardDescription>Regular ancestor worship</CardDescription>
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
            <CardTitle>Important Days for Pitra Dosh Remedies</CardTitle>
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
            <CardTitle>Frequently Asked Questions</CardTitle>
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
              <h3 className="font-semibold text-lg mb-2">Full Kundli Analysis</h3>
              <p className="text-gray-600 text-sm mb-4">
                Check for Pitra Dosh in your birth chart.
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
                Learn about Mangal Dosh and Kaal Sarp.
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
                Get personalized Pitra Dosh guidance.
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/consultation">
                  Book Consultation <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="border-orange-200 bg-orange-50 mt-12">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              The Importance of Honoring Ancestors
            </h2>
            <div className="prose prose-orange max-w-none">
              <p className="text-gray-700 mb-4">
                In Vedic tradition, ancestors (Pitru) are considered divine beings who 
                continue to influence our lives from the ancestral realm. Honoring them 
                is not just a religious duty but a way of acknowledging our roots and 
                the sacrifices made by previous generations.
              </p>
              <p className="text-gray-700 mb-4">
                Regular ancestor worship brings blessings in the form of family harmony, 
                prosperity, good health, and spiritual progress. It creates a positive 
                karmic cycle that benefits both the living and the departed souls.
              </p>
              <p className="text-gray-700">
                Even if you don&apos;t have Pitra Dosh in your chart, performing Shraddha 
                during Pitru Paksha and remembering ancestors with gratitude is highly 
                recommended. This practice strengthens family bonds across generations 
                and ensures the continued blessings of your ancestral lineage.
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
