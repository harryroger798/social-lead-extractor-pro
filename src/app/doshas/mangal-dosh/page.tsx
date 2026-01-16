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
  Shield,
  Heart,
} from "lucide-react";

const mangalDoshHouses = [
  {
    house: "1st House (Lagna)",
    effect: "Affects personality and can cause aggressive behavior. May lead to conflicts in marriage due to dominating nature.",
    severity: "Moderate",
  },
  {
    house: "2nd House",
    effect: "Impacts family life, wealth, and speech. May cause harsh speech leading to family disputes.",
    severity: "Mild",
  },
  {
    house: "4th House",
    effect: "Affects domestic peace, property, and relationship with mother. Can cause frequent changes in residence.",
    severity: "Severe",
  },
  {
    house: "7th House",
    effect: "Directly impacts marriage and spouse. Most severe placement causing delays, conflicts, or separation.",
    severity: "Severe",
  },
  {
    house: "8th House",
    effect: "Affects longevity, in-laws, and sudden events. Can cause health issues for spouse or accidents.",
    severity: "Severe",
  },
  {
    house: "12th House",
    effect: "Impacts bed pleasures, expenses, and foreign connections. May cause separation or excessive expenses.",
    severity: "Moderate",
  },
];

const cancellationConditions = [
  "Mars is in its own sign (Aries or Scorpio)",
  "Mars is exalted in Capricorn",
  "Mars is aspected by benefic Jupiter",
  "Mars is conjunct with benefic planets (Jupiter, Venus, Mercury)",
  "Both partners have Mangal Dosha (mutual cancellation)",
  "Mars is in Navamsa of benefic planets",
  "Person is born on Tuesday",
  "Mars is in 2nd house in Gemini, Virgo, or Sagittarius",
  "Mars is in 12th house in Taurus or Libra",
  "Mars is in 4th house in Aries or Scorpio",
  "Mars is in 7th house in Cancer or Capricorn",
  "Mars is in 8th house in Sagittarius or Pisces",
  "Age above 28 years (Dosha weakens significantly)",
  "Mars is retrograde",
  "Mars is combust (close to Sun)",
];

const remedies = {
  puja: [
    "Perform Mangal Shanti Puja on Tuesday",
    "Conduct Navagraha Shanti Puja",
    "Perform Kumbh Vivah (symbolic marriage to a pot or tree)",
    "Visit Mangalnath Temple in Ujjain",
    "Perform Rudrabhishek on Mondays",
  ],
  mantras: [
    "Chant 'Om Angarakaya Namaha' 108 times daily",
    "Recite Hanuman Chalisa daily, especially on Tuesdays",
    "Chant Mangal Beej Mantra: 'Om Kram Kreem Kraum Sah Bhaumaya Namaha'",
    "Recite Sunderkand on Tuesdays and Saturdays",
    "Chant Gayatri Mantra 108 times daily",
  ],
  donations: [
    "Donate red items (red cloth, red lentils, red flowers) on Tuesdays",
    "Donate blood on Tuesdays (highly recommended)",
    "Donate wheat, jaggery, and copper on Tuesdays",
    "Feed monkeys with jaggery and gram on Tuesdays",
    "Donate to soldiers or fire department",
  ],
  lifestyle: [
    "Fast on Tuesdays (eat only once after sunset)",
    "Wear a coral (Moonga) gemstone after consultation",
    "Wear red or orange clothes on Tuesdays",
    "Serve your siblings and younger people",
    "Practice anger management and patience",
    "Avoid non-vegetarian food on Tuesdays",
  ],
};

const faqs = [
  {
    question: "What percentage of people have Mangal Dosha?",
    answer: "Approximately 40-50% of people have some form of Mangal Dosha in their birth chart. This is because Mars occupies one of the six houses (1, 2, 4, 7, 8, 12) in about half of all charts.",
  },
  {
    question: "Can two Manglik people marry each other?",
    answer: "Yes, when two Manglik individuals marry, their doshas are believed to cancel each other out. This is called 'Dosha Samya' and is considered an ideal match for Manglik natives.",
  },
  {
    question: "Does Mangal Dosha affect everyone equally?",
    answer: "No, the severity depends on the house Mars occupies, the sign it's in, aspects from other planets, and various cancellation conditions. A proper analysis by an astrologer is recommended.",
  },
  {
    question: "At what age does Mangal Dosha reduce?",
    answer: "Mangal Dosha is believed to significantly reduce after age 28. Some traditions say it completely nullifies after this age, while others suggest it merely weakens.",
  },
  {
    question: "Is Kumbh Vivah effective for Mangal Dosha?",
    answer: "Kumbh Vivah is a traditional remedy where the Manglik person symbolically marries a banana tree, peepal tree, or silver/gold idol of Lord Vishnu before their actual marriage. Many believe this transfers the negative effects.",
  },
];

export default function MangalDoshPage() {
  const { t } = useLanguage();
  return (
    <div className="py-12 lg:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-red-100 text-red-800">Dosha Guide</Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Mangal Dosh (Manglik Dosha)
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Complete guide to understanding Mangal Dosha, its effects on marriage and 
            relationships, cancellation conditions, and effective remedies.
          </p>
        </div>

        <Card className="border-red-200 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              What is Mangal Dosh?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-red max-w-none">
              <p className="text-gray-700 mb-4">
                Mangal Dosh, also known as Kuja Dosha, Bhom Dosha, or Manglik Dosha, is an 
                astrological condition that occurs when Mars (Mangal) is placed in certain 
                houses in a person&apos;s birth chart. It is one of the most discussed doshas 
                in Vedic astrology, particularly concerning marriage compatibility.
              </p>
              <p className="text-gray-700">
                The dosha is formed when Mars occupies the 1st, 2nd, 4th, 7th, 8th, or 12th 
                house from the Ascendant (Lagna), Moon, or Venus in the birth chart. Mars is 
                a fiery, aggressive planet, and its placement in these houses is believed to 
                affect marriage, relationships, and domestic harmony.
              </p>
            </div>
          </CardContent>
        </Card>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">Effects by House Placement</h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {mangalDoshHouses.map((item) => (
            <Card 
              key={item.house} 
              className={`border-2 ${
                item.severity === "Severe" ? "border-red-300" :
                item.severity === "Moderate" ? "border-orange-300" :
                "border-yellow-300"
              }`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{item.house}</CardTitle>
                  <Badge className={
                    item.severity === "Severe" ? "bg-red-500" :
                    item.severity === "Moderate" ? "bg-orange-500" :
                    "bg-yellow-500"
                  }>
                    {item.severity}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">{item.effect}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-green-200 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Shield className="w-5 h-5" />
              Cancellation Conditions (Dosha Bhanga)
            </CardTitle>
            <CardDescription>
              These conditions can reduce or completely cancel Mangal Dosha effects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {cancellationConditions.map((condition, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{condition}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">Remedies for Mangal Dosh</h2>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card className="border-amber-200">
            <CardHeader className="bg-amber-50">
              <CardTitle className="text-amber-800">Puja & Rituals</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="space-y-2">
                {remedies.puja.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-amber-500">•</span>
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
                    <span className="text-purple-500">•</span>
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
                    <span className="text-blue-500">•</span>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-green-200">
            <CardHeader className="bg-green-50">
              <CardTitle className="text-green-800">Lifestyle Changes</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="space-y-2">
                {remedies.lifestyle.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-green-500">•</span>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card className="border-indigo-200 mb-8">
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
              <h3 className="font-semibold text-lg mb-2">Mangal Dosh Calculator</h3>
              <p className="text-gray-600 text-sm mb-4">
                Check if you have Mangal Dosha in your chart.
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/tools/mangal-dosh-calculator">
                  Check Now <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-amber-200 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-500" />
                Horoscope Matching
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Check marriage compatibility with Kundli matching.
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/tools/horoscope-matching">
                  Match Kundli <ArrowRight className="w-4 h-4 ml-2" />
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

        <Card className="border-red-200 bg-red-50 mt-12">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Important Note About Mangal Dosh
            </h2>
            <div className="prose prose-red max-w-none">
              <p className="text-gray-700 mb-4">
                While Mangal Dosh is an important consideration in Vedic astrology, it&apos;s 
                essential to understand that it should not be the sole factor in marriage 
                decisions. Many successful marriages exist between Manglik and non-Manglik 
                individuals, and many factors in a birth chart can modify or cancel the dosha.
              </p>
              <p className="text-gray-700 mb-4">
                Modern astrologers recommend a holistic analysis of both charts rather than 
                focusing solely on Mangal Dosh. Factors like overall compatibility, planetary 
                strengths, dasha periods, and individual character should all be considered.
              </p>
              <p className="text-gray-700">
                If you&apos;re concerned about Mangal Dosh, we recommend consulting with a 
                qualified Vedic astrologer who can analyze your complete birth chart and 
                provide personalized guidance based on your specific planetary positions.
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
            headline: "Mangal Dosh (Manglik Dosha) - Complete Guide",
            description: "Complete guide to Mangal Dosh with effects, cancellation conditions, and remedies",
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
