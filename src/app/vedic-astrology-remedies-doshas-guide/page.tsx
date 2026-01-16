"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowRight, Gem, Sparkles, Clock, Shield, Heart } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const doshas = [
  {
    name: "Mangal Dosha (Kuja Dosha)",
    description: "Occurs when Mars is placed in 1st, 2nd, 4th, 7th, 8th, or 12th house from Ascendant, Moon, or Venus.",
    effects: ["Delays in marriage", "Marital discord", "Health issues for spouse", "Relationship challenges"],
    intensity: "Varies based on sign, aspects, and house",
    remedies: [
      "Kumbh Vivah (symbolic marriage to a pot or tree)",
      "Mangal Shanti Puja",
      "Wearing Red Coral (after consultation)",
      "Chanting Mangal Mantra",
      "Fasting on Tuesdays",
      "Donating red items on Tuesdays",
    ],
    cancellation: "Can be cancelled if partner also has Mangal Dosha, or Mars is in own/exalted sign",
  },
  {
    name: "Kaal Sarp Dosha",
    description: "Formed when all seven planets are hemmed between Rahu and Ketu in the birth chart.",
    effects: ["Struggles and obstacles", "Delays in success", "Mental stress", "Karmic lessons"],
    intensity: "12 types based on Rahu-Ketu axis position",
    remedies: [
      "Kaal Sarp Dosha Puja at Trimbakeshwar",
      "Rahu-Ketu Shanti Puja",
      "Chanting Maha Mrityunjaya Mantra",
      "Wearing Gomed or Cat's Eye (after consultation)",
      "Feeding birds and fish",
      "Donating on Saturdays",
    ],
    cancellation: "Partial cancellation if any planet is outside the Rahu-Ketu axis",
  },
  {
    name: "Pitru Dosha",
    description: "Related to ancestral karma, indicated by afflictions to Sun, 9th house, or specific planetary combinations.",
    effects: ["Obstacles in career", "Difficulties with children", "Financial struggles", "Family discord"],
    intensity: "Depends on the severity of affliction",
    remedies: [
      "Pitru Paksha Shraddha rituals",
      "Tarpan for ancestors",
      "Pind Daan at Gaya",
      "Feeding Brahmins on Amavasya",
      "Planting Peepal tree",
      "Charity in ancestors' names",
    ],
    cancellation: "Reduced through consistent ancestral rituals",
  },
  {
    name: "Sade Sati",
    description: "7.5-year period when Saturn transits through 12th, 1st, and 2nd houses from Moon sign.",
    effects: ["Career challenges", "Health issues", "Financial stress", "Relationship strain", "Transformation"],
    intensity: "Three phases of 2.5 years each",
    remedies: [
      "Shani Shanti Puja",
      "Wearing Blue Sapphire (only if suitable)",
      "Chanting Shani Mantra or Hanuman Chalisa",
      "Fasting on Saturdays",
      "Donating black items on Saturdays",
      "Serving the elderly and disabled",
    ],
    cancellation: "Effects vary based on Saturn's functional nature in the chart",
  },
];

const gemstones = [
  { planet: "Sun", gemstone: "Ruby (Manik)", metal: "Gold", finger: "Ring finger", day: "Sunday" },
  { planet: "Moon", gemstone: "Pearl (Moti)", metal: "Silver", finger: "Little finger", day: "Monday" },
  { planet: "Mars", gemstone: "Red Coral (Moonga)", metal: "Gold/Copper", finger: "Ring finger", day: "Tuesday" },
  { planet: "Mercury", gemstone: "Emerald (Panna)", metal: "Gold", finger: "Little finger", day: "Wednesday" },
  { planet: "Jupiter", gemstone: "Yellow Sapphire (Pukhraj)", metal: "Gold", finger: "Index finger", day: "Thursday" },
  { planet: "Venus", gemstone: "Diamond (Heera)", metal: "Platinum/Silver", finger: "Middle finger", day: "Friday" },
  { planet: "Saturn", gemstone: "Blue Sapphire (Neelam)", metal: "Silver/Iron", finger: "Middle finger", day: "Saturday" },
  { planet: "Rahu", gemstone: "Hessonite (Gomed)", metal: "Silver", finger: "Middle finger", day: "Saturday" },
  { planet: "Ketu", gemstone: "Cat's Eye (Lehsunia)", metal: "Silver", finger: "Little finger", day: "Tuesday" },
];

const mantras = [
  { planet: "Sun", beej: "Om Hraam Hreem Hraum Sah Suryaya Namah", vedic: "Om Aditya Namah", count: 7000 },
  { planet: "Moon", beej: "Om Shraam Shreem Shraum Sah Chandraya Namah", vedic: "Om Somaya Namah", count: 11000 },
  { planet: "Mars", beej: "Om Kraam Kreem Kraum Sah Bhaumaya Namah", vedic: "Om Mangalaya Namah", count: 10000 },
  { planet: "Mercury", beej: "Om Braam Breem Braum Sah Budhaya Namah", vedic: "Om Budhaya Namah", count: 9000 },
  { planet: "Jupiter", beej: "Om Graam Greem Graum Sah Gurave Namah", vedic: "Om Brihaspataye Namah", count: 19000 },
  { planet: "Venus", beej: "Om Draam Dreem Draum Sah Shukraya Namah", vedic: "Om Shukraya Namah", count: 16000 },
  { planet: "Saturn", beej: "Om Praam Preem Praum Sah Shanaye Namah", vedic: "Om Shanaischaraya Namah", count: 23000 },
  { planet: "Rahu", beej: "Om Bhraam Bhreem Bhraum Sah Rahave Namah", vedic: "Om Rahave Namah", count: 18000 },
  { planet: "Ketu", beej: "Om Sraam Sreem Sraum Sah Ketave Namah", vedic: "Om Ketave Namah", count: 17000 },
];

const charityItems = [
  { planet: "Sun", items: "Wheat, jaggery, red cloth, copper", day: "Sunday", recipient: "Father figures, government servants" },
  { planet: "Moon", items: "Rice, white cloth, silver, milk", day: "Monday", recipient: "Mother figures, women" },
  { planet: "Mars", items: "Red lentils, red cloth, copper, jaggery", day: "Tuesday", recipient: "Siblings, soldiers" },
  { planet: "Mercury", items: "Green moong, green cloth, books", day: "Wednesday", recipient: "Students, scholars" },
  { planet: "Jupiter", items: "Yellow cloth, turmeric, gold, books", day: "Thursday", recipient: "Teachers, priests" },
  { planet: "Venus", items: "White items, silk, perfume, sweets", day: "Friday", recipient: "Women, artists" },
  { planet: "Saturn", items: "Black sesame, iron, oil, black cloth", day: "Saturday", recipient: "Elderly, disabled, servants" },
  { planet: "Rahu", items: "Blue/black cloth, coconut, blankets", day: "Saturday", recipient: "Outcasts, sweepers" },
  { planet: "Ketu", items: "Mixed grains, blankets, dogs", day: "Tuesday", recipient: "Spiritual seekers, dogs" },
];

const faqs = [
  {
    question: "Do astrological remedies really work?",
    answer: "Astrological remedies work on the principle of resonance with planetary energies. Their effectiveness depends on faith, consistency, and choosing appropriate remedies based on individual charts. Many people report positive changes after following prescribed remedies sincerely.",
  },
  {
    question: "Should I wear gemstones for weak planets?",
    answer: "Gemstones strengthen the planet they represent, so they should typically be worn for benefic planets that are weak, not for malefic planets. Always consult an experienced astrologer before wearing any gemstone, as incorrect gemstones can cause harm.",
  },
  {
    question: "How long do I need to perform remedies?",
    answer: "The duration depends on the severity of the dosha and the remedy chosen. Some remedies like mantras require completion of a specific count (japa), while others like charity and fasting may need to be continued for extended periods or even lifelong for best results.",
  },
  {
    question: "Can remedies completely remove a dosha?",
    answer: "Remedies can significantly reduce the negative effects of doshas but may not completely eliminate them, as they represent karmic patterns. The goal is to minimize suffering and maximize positive outcomes within the karmic framework.",
  },
  {
    question: "Are expensive remedies more effective?",
    answer: "Not necessarily. The effectiveness of a remedy depends on its appropriateness for your chart, your faith, and consistency in practice. Simple remedies like mantras, charity, and lifestyle changes can be as effective as elaborate pujas when done with sincerity.",
  },
];

export default function RemediesGuidePage() {
  const { t } = useLanguage();
  return (
    <article className="py-12 lg:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Badge className="mb-4 bg-amber-100 text-amber-800">Complete Guide</Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Vedic Astrology Remedies & Doshas: Complete Guide
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            Learn about common doshas in Vedic astrology and discover effective remedies 
            including gemstones, mantras, charity, and rituals to overcome planetary challenges.
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              18 min read
            </span>
            <span>Updated: January 2025</span>
          </div>
        </div>

        <Card className="mb-8 bg-amber-50 border-amber-200">
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">TL;DR - Quick Summary</h2>
            <p className="text-gray-700 mb-4">
              Vedic astrology offers various remedies to mitigate challenging planetary influences. 
              Common doshas include Mangal Dosha (Mars affliction), Kaal Sarp Dosha (Rahu-Ketu axis), 
              Pitru Dosha (ancestral karma), and Sade Sati (Saturn transit). Remedies include 
              gemstones, mantras, charity, fasting, and pujas. Always consult an expert before 
              implementing remedies, especially for gemstones.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" asChild>
                <Link href="/tools/kundli-calculator">Check Your Doshas</Link>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <Link href="/consultation">Consult Expert</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            Understanding Doshas in Vedic Astrology
          </h2>
          <p className="text-gray-700 mb-6">
            Doshas are specific planetary combinations in a birth chart that indicate challenges 
            or obstacles in certain life areas. While they may sound alarming, it&apos;s important 
            to understand that most charts have some doshas, and their effects vary significantly 
            based on other factors in the chart. Proper analysis and appropriate remedies can 
            help minimize their negative impact.
          </p>
          
          <div className="space-y-6">
            {doshas.map((dosha) => (
              <Card key={dosha.name} className="border-amber-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-amber-600" />
                    {dosha.name}
                  </CardTitle>
                  <CardDescription>{dosha.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Effects:</h4>
                      <ul className="space-y-1">
                        {dosha.effects.map((effect) => (
                          <li key={effect} className="flex items-start gap-2 text-sm text-gray-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0"></span>
                            {effect}
                          </li>
                        ))}
                      </ul>
                      <p className="text-sm text-gray-500 mt-3">
                        <strong>Intensity:</strong> {dosha.intensity}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Remedies:</h4>
                      <ul className="space-y-1">
                        {dosha.remedies.slice(0, 4).map((remedy) => (
                          <li key={remedy} className="flex items-start gap-2 text-sm text-gray-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0"></span>
                            {remedy}
                          </li>
                        ))}
                      </ul>
                      <p className="text-sm text-green-700 mt-3">
                        <strong>Cancellation:</strong> {dosha.cancellation}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            <Gem className="inline w-8 h-8 text-amber-600 mr-2" />
            Gemstone Remedies
          </h2>
          <p className="text-gray-700 mb-6">
            Gemstones are powerful remedies that work by absorbing and transmitting planetary 
            energies. However, they must be chosen carefully based on individual chart analysis, 
            as wearing the wrong gemstone can cause harm.
          </p>
          
          <div className="overflow-x-auto mb-6">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-amber-50">
                  <th className="border border-amber-200 px-3 py-2 text-left">Planet</th>
                  <th className="border border-amber-200 px-3 py-2 text-left">Gemstone</th>
                  <th className="border border-amber-200 px-3 py-2 text-left">Metal</th>
                  <th className="border border-amber-200 px-3 py-2 text-left">Finger</th>
                  <th className="border border-amber-200 px-3 py-2 text-left">Day to Wear</th>
                </tr>
              </thead>
              <tbody>
                {gemstones.map((gem, index) => (
                  <tr key={gem.planet} className={index % 2 === 0 ? "" : "bg-gray-50"}>
                    <td className="border border-gray-200 px-3 py-2 font-medium">{gem.planet}</td>
                    <td className="border border-gray-200 px-3 py-2">{gem.gemstone}</td>
                    <td className="border border-gray-200 px-3 py-2">{gem.metal}</td>
                    <td className="border border-gray-200 px-3 py-2">{gem.finger}</td>
                    <td className="border border-gray-200 px-3 py-2">{gem.day}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <Card className="bg-red-50 border-red-200">
            <CardContent className="pt-4">
              <p className="text-sm text-red-700">
                <strong>Important Warning:</strong> Never wear gemstones without proper consultation. 
                Gemstones for malefic planets (Saturn, Rahu, Ketu, Mars) can cause serious problems 
                if worn incorrectly. Always consult an experienced astrologer before wearing any gemstone.
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            <Sparkles className="inline w-8 h-8 text-amber-600 mr-2" />
            Mantra Remedies
          </h2>
          <p className="text-gray-700 mb-6">
            Mantras are sacred sound vibrations that connect us with planetary energies. 
            Regular chanting with proper pronunciation and devotion can significantly 
            strengthen weak planets and reduce malefic effects.
          </p>
          
          <div className="overflow-x-auto mb-6">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-amber-50">
                  <th className="border border-amber-200 px-3 py-2 text-left">Planet</th>
                  <th className="border border-amber-200 px-3 py-2 text-left">Beej Mantra</th>
                  <th className="border border-amber-200 px-3 py-2 text-left">Recommended Count</th>
                </tr>
              </thead>
              <tbody>
                {mantras.map((mantra, index) => (
                  <tr key={mantra.planet} className={index % 2 === 0 ? "" : "bg-gray-50"}>
                    <td className="border border-gray-200 px-3 py-2 font-medium">{mantra.planet}</td>
                    <td className="border border-gray-200 px-3 py-2 text-xs italic">{mantra.beej}</td>
                    <td className="border border-gray-200 px-3 py-2">{mantra.count.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            <Heart className="inline w-8 h-8 text-amber-600 mr-2" />
            Charity (Dana) Remedies
          </h2>
          <p className="text-gray-700 mb-6">
            Charity is one of the most accessible and effective remedies. Donating items 
            associated with specific planets on their designated days helps reduce negative 
            karma and strengthen positive planetary influences.
          </p>
          
          <div className="overflow-x-auto mb-6">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-amber-50">
                  <th className="border border-amber-200 px-3 py-2 text-left">Planet</th>
                  <th className="border border-amber-200 px-3 py-2 text-left">Items to Donate</th>
                  <th className="border border-amber-200 px-3 py-2 text-left">Day</th>
                  <th className="border border-amber-200 px-3 py-2 text-left">Recipient</th>
                </tr>
              </thead>
              <tbody>
                {charityItems.map((item, index) => (
                  <tr key={item.planet} className={index % 2 === 0 ? "" : "bg-gray-50"}>
                    <td className="border border-gray-200 px-3 py-2 font-medium">{item.planet}</td>
                    <td className="border border-gray-200 px-3 py-2">{item.items}</td>
                    <td className="border border-gray-200 px-3 py-2">{item.day}</td>
                    <td className="border border-gray-200 px-3 py-2">{item.recipient}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-gray-600">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        <Card className="bg-gradient-to-r from-amber-500 to-orange-600 text-white">
          <CardContent className="pt-6 text-center">
            <h2 className="text-2xl font-bold mb-2">Need Personalized Remedies?</h2>
            <p className="mb-4 text-amber-100">
              Get your chart analyzed by our expert astrologers for customized remedy recommendations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-amber-600 hover:bg-amber-50" asChild>
                <Link href="/consultation">
                  Book Consultation
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
                            <Button size="lg" className="bg-white text-amber-600 hover:bg-amber-50" asChild>
                              <Link href="/tools/kundli-calculator">Check Your Chart</Link>
                            </Button>
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
            headline: "Vedic Astrology Remedies & Doshas: Complete Guide",
            description: "Complete guide to Vedic astrology remedies for doshas including gemstones, mantras, and charity.",
            author: { "@type": "Organization", name: "VedicStarAstro" },
            publisher: { "@type": "Organization", name: "VedicStarAstro" },
            datePublished: "2025-01-01",
            dateModified: new Date().toISOString().split("T")[0],
          }),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: { "@type": "Answer", text: faq.answer },
            })),
          }),
        }}
      />
    </article>
  );
}
