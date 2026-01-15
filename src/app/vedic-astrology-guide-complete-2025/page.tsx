import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowRight, BookOpen, Star, Clock, CheckCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Complete Vedic Astrology Guide 2025 - Learn Jyotish Shastra",
  description:
    "Master Vedic astrology with our comprehensive guide. Learn about Kundli, Nakshatras, planetary influences, doshas, and remedies. Free resources for beginners and advanced practitioners.",
  keywords: [
    "vedic astrology",
    "jyotish shastra",
    "vedic astrology guide",
    "learn astrology",
    "indian astrology",
    "hindu astrology",
    "birth chart interpretation",
    "kundli reading",
  ],
  openGraph: {
    title: "Complete Vedic Astrology Guide 2025 - Learn Jyotish Shastra",
    description:
      "Master Vedic astrology with our comprehensive guide. Learn about Kundli, Nakshatras, planetary influences, doshas, and remedies.",
    type: "article",
    publishedTime: "2025-01-01T00:00:00Z",
    modifiedTime: new Date().toISOString(),
    authors: ["VedicStarAstro"],
  },
};

const tableOfContents = [
  { id: "introduction", title: "Introduction to Vedic Astrology" },
  { id: "history", title: "History and Origins" },
  { id: "vs-western", title: "Vedic vs Western Astrology" },
  { id: "zodiac-signs", title: "The 12 Zodiac Signs (Rashis)" },
  { id: "planets", title: "The 9 Planets (Navagrahas)" },
  { id: "houses", title: "The 12 Houses (Bhavas)" },
  { id: "nakshatras", title: "The 27 Nakshatras" },
  { id: "kundli", title: "Understanding Your Kundli" },
  { id: "doshas", title: "Doshas and Their Effects" },
  { id: "remedies", title: "Astrological Remedies" },
  { id: "faq", title: "Frequently Asked Questions" },
];

const zodiacSigns = [
  { name: "Mesha (Aries)", element: "Fire", ruler: "Mars", quality: "Cardinal" },
  { name: "Vrishabha (Taurus)", element: "Earth", ruler: "Venus", quality: "Fixed" },
  { name: "Mithuna (Gemini)", element: "Air", ruler: "Mercury", quality: "Mutable" },
  { name: "Karka (Cancer)", element: "Water", ruler: "Moon", quality: "Cardinal" },
  { name: "Simha (Leo)", element: "Fire", ruler: "Sun", quality: "Fixed" },
  { name: "Kanya (Virgo)", element: "Earth", ruler: "Mercury", quality: "Mutable" },
  { name: "Tula (Libra)", element: "Air", ruler: "Venus", quality: "Cardinal" },
  { name: "Vrishchika (Scorpio)", element: "Water", ruler: "Mars", quality: "Fixed" },
  { name: "Dhanu (Sagittarius)", element: "Fire", ruler: "Jupiter", quality: "Mutable" },
  { name: "Makara (Capricorn)", element: "Earth", ruler: "Saturn", quality: "Cardinal" },
  { name: "Kumbha (Aquarius)", element: "Air", ruler: "Saturn", quality: "Fixed" },
  { name: "Meena (Pisces)", element: "Water", ruler: "Jupiter", quality: "Mutable" },
];

const planets = [
  { name: "Surya (Sun)", nature: "Malefic", signifies: "Soul, father, authority, government", exalted: "Aries", debilitated: "Libra" },
  { name: "Chandra (Moon)", nature: "Benefic", signifies: "Mind, mother, emotions, public", exalted: "Taurus", debilitated: "Scorpio" },
  { name: "Mangal (Mars)", nature: "Malefic", signifies: "Energy, courage, siblings, property", exalted: "Capricorn", debilitated: "Cancer" },
  { name: "Budha (Mercury)", nature: "Neutral", signifies: "Intelligence, communication, business", exalted: "Virgo", debilitated: "Pisces" },
  { name: "Guru (Jupiter)", nature: "Benefic", signifies: "Wisdom, children, fortune, spirituality", exalted: "Cancer", debilitated: "Capricorn" },
  { name: "Shukra (Venus)", nature: "Benefic", signifies: "Love, marriage, luxury, arts", exalted: "Pisces", debilitated: "Virgo" },
  { name: "Shani (Saturn)", nature: "Malefic", signifies: "Karma, discipline, longevity, hardship", exalted: "Libra", debilitated: "Aries" },
  { name: "Rahu (North Node)", nature: "Malefic", signifies: "Obsession, foreign, unconventional", exalted: "Taurus", debilitated: "Scorpio" },
  { name: "Ketu (South Node)", nature: "Malefic", signifies: "Spirituality, detachment, past karma", exalted: "Scorpio", debilitated: "Taurus" },
];

const houses = [
  { number: 1, name: "Lagna (Ascendant)", signifies: "Self, personality, physical body, health" },
  { number: 2, name: "Dhana Bhava", signifies: "Wealth, family, speech, food habits" },
  { number: 3, name: "Sahaja Bhava", signifies: "Siblings, courage, short travels, communication" },
  { number: 4, name: "Sukha Bhava", signifies: "Mother, home, vehicles, emotional peace" },
  { number: 5, name: "Putra Bhava", signifies: "Children, creativity, intelligence, romance" },
  { number: 6, name: "Ari Bhava", signifies: "Enemies, diseases, debts, service" },
  { number: 7, name: "Kalatra Bhava", signifies: "Marriage, partnerships, business, public dealings" },
  { number: 8, name: "Ayur Bhava", signifies: "Longevity, transformation, inheritance, occult" },
  { number: 9, name: "Dharma Bhava", signifies: "Fortune, father, religion, higher education" },
  { number: 10, name: "Karma Bhava", signifies: "Career, reputation, authority, achievements" },
  { number: 11, name: "Labha Bhava", signifies: "Gains, income, friends, aspirations" },
  { number: 12, name: "Vyaya Bhava", signifies: "Losses, expenses, foreign lands, liberation" },
];

const faqs = [
  {
    question: "What is Vedic Astrology?",
    answer: "Vedic Astrology, also known as Jyotish Shastra, is an ancient Indian system of astrology that originated over 5,000 years ago. It uses the sidereal zodiac (based on fixed star positions) and incorporates unique concepts like Nakshatras (lunar mansions), Dashas (planetary periods), and detailed divisional charts to provide comprehensive life predictions.",
  },
  {
    question: "How is Vedic Astrology different from Western Astrology?",
    answer: "The main differences are: 1) Vedic uses the sidereal zodiac while Western uses tropical zodiac (about 24 degrees difference), 2) Vedic emphasizes the Moon sign while Western focuses on Sun sign, 3) Vedic uses 27 Nakshatras for detailed analysis, 4) Vedic has unique predictive systems like Vimshottari Dasha, and 5) Vedic astrology is more deterministic with emphasis on karma and remedies.",
  },
  {
    question: "What is a Kundli or Birth Chart?",
    answer: "A Kundli (also called Janam Kundli or birth chart) is a map of the sky at the exact moment and location of your birth. It shows the positions of the Sun, Moon, and planets in the 12 zodiac signs and 12 houses. This chart is the foundation of all Vedic astrological predictions and reveals information about your personality, career, relationships, health, and life events.",
  },
  {
    question: "What are Nakshatras?",
    answer: "Nakshatras are 27 lunar mansions or star constellations that the Moon passes through during its monthly cycle. Each Nakshatra spans 13°20' of the zodiac and has unique characteristics, ruling deity, and planetary lord. Your birth Nakshatra (based on Moon's position) reveals deep insights about your personality, behavior patterns, and life path.",
  },
  {
    question: "What is Mangal Dosha (Manglik)?",
    answer: "Mangal Dosha occurs when Mars is placed in the 1st, 2nd, 4th, 7th, 8th, or 12th house from the Ascendant, Moon, or Venus in a birth chart. It's believed to cause delays or difficulties in marriage. However, the intensity varies based on the sign, aspects, and other planetary combinations. Many remedies exist to neutralize its effects.",
  },
  {
    question: "How accurate is Vedic Astrology?",
    answer: "Vedic Astrology's accuracy depends on: 1) Precise birth time (even minutes matter), 2) Correct birth location, 3) Astrologer's expertise and experience, and 4) Proper analysis of multiple factors. When these conditions are met, Vedic astrology can provide remarkably accurate insights. However, it shows tendencies and probabilities, not absolute certainties, as free will also plays a role.",
  },
  {
    question: "Can astrology predict the future?",
    answer: "Vedic astrology can indicate likely trends, opportunities, and challenges based on planetary periods (Dashas) and transits. It shows the karmic blueprint and probable outcomes if current patterns continue. However, astrology is best used as a guidance tool rather than absolute prediction, as human choices and efforts can modify outcomes within the karmic framework.",
  },
  {
    question: "What are astrological remedies?",
    answer: "Astrological remedies are prescribed actions to strengthen weak planets or reduce malefic effects. Common remedies include: gemstone wearing, mantra chanting, charity (dana), fasting on specific days, wearing specific colors, performing pujas, and lifestyle modifications. The effectiveness depends on faith, consistency, and choosing appropriate remedies based on individual charts.",
  },
];

export default function VedicAstrologyGuidePage() {
  return (
    <article className="py-12 lg:py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Badge className="mb-4 bg-amber-100 text-amber-800">Complete Guide</Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Complete Vedic Astrology Guide 2025: Master Jyotish Shastra
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            Your comprehensive resource for understanding Vedic astrology, from basic concepts 
            to advanced techniques. Learn about Kundli interpretation, Nakshatras, planetary 
            influences, and effective remedies.
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              25 min read
            </span>
            <span>Updated: January 2025</span>
          </div>
        </div>

        <Card className="mb-8 bg-amber-50 border-amber-200">
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">TL;DR - Quick Summary</h2>
            <p className="text-gray-700 mb-4">
              Vedic Astrology (Jyotish) is an ancient Indian system using the sidereal zodiac, 
              27 Nakshatras, and 9 planets to analyze birth charts (Kundli). Unlike Western 
              astrology, it emphasizes the Moon sign and uses unique predictive systems like 
              Vimshottari Dasha. Key components include 12 houses representing life areas, 
              planetary strengths/weaknesses, and remedial measures for challenging placements.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" asChild>
                <Link href="/tools/kundli-calculator">Generate Your Kundli</Link>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <Link href="/tools/nakshatra-finder">Find Your Nakshatra</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Table of Contents</h2>
            <nav>
              <ol className="space-y-2">
                {tableOfContents.map((item, index) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className="flex items-center gap-2 text-gray-600 hover:text-amber-600 transition-colors"
                    >
                      <span className="text-amber-600 font-medium">{index + 1}.</span>
                      {item.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </CardContent>
        </Card>

        <section id="introduction" className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            1. Introduction to Vedic Astrology
          </h2>
          <p className="text-gray-700 mb-4">
            Vedic Astrology, known as Jyotish Shastra in Sanskrit (meaning &ldquo;science of light&rdquo;), 
            is one of the oldest and most comprehensive astrological systems in the world. Originating 
            in ancient India over 5,000 years ago, it forms one of the six Vedangas (limbs of the Vedas) 
            and has been used for millennia to understand human destiny, timing of events, and spiritual growth.
          </p>
          <p className="text-gray-700 mb-4">
            Unlike modern Western astrology that primarily focuses on psychological traits, Vedic astrology 
            provides a complete framework for understanding all aspects of life including career, relationships, 
            health, finances, and spiritual evolution. It operates on the principle that celestial bodies 
            influence earthly events and that by understanding these influences, we can make better decisions 
            and navigate life&apos;s challenges more effectively.
          </p>
          <p className="text-gray-700">
            The foundation of Vedic astrology lies in the birth chart or Kundli, which captures the exact 
            positions of planets at the moment of birth. This cosmic snapshot serves as a blueprint of 
            one&apos;s karma and potential, revealing both opportunities and challenges that lie ahead.
          </p>
        </section>

        <section id="history" className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            2. History and Origins
          </h2>
          <p className="text-gray-700 mb-4">
            The origins of Vedic astrology trace back to the Vedic period (1500-500 BCE), with references 
            found in the Rigveda, the oldest of the four Vedas. The sage Parashara is credited with 
            systematizing Jyotish in his seminal work &ldquo;Brihat Parashara Hora Shastra,&rdquo; which remains 
            the primary reference text for Vedic astrologers today.
          </p>
          <p className="text-gray-700 mb-4">
            Other important contributors include Varahamihira (6th century CE), who wrote &ldquo;Brihat Jataka&rdquo; 
            and &ldquo;Brihat Samhita,&rdquo; and Jaimini, who developed an alternative predictive system. The 
            mathematical foundations were strengthened by astronomers like Aryabhata and Brahmagupta, 
            who calculated planetary positions with remarkable accuracy.
          </p>
          <p className="text-gray-700">
            Throughout history, Vedic astrology has been an integral part of Indian culture, used for 
            determining auspicious times (muhurta) for important events, matching horoscopes for marriage, 
            and guiding rulers in matters of state. Today, it continues to thrive both in India and 
            globally, with millions seeking its guidance for life decisions.
          </p>
        </section>

        <section id="vs-western" className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            3. Vedic vs Western Astrology: Key Differences
          </h2>
          <div className="overflow-x-auto mb-6">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-amber-50">
                  <th className="border border-amber-200 px-4 py-2 text-left">Aspect</th>
                  <th className="border border-amber-200 px-4 py-2 text-left">Vedic Astrology</th>
                  <th className="border border-amber-200 px-4 py-2 text-left">Western Astrology</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-200 px-4 py-2 font-medium">Zodiac System</td>
                  <td className="border border-gray-200 px-4 py-2">Sidereal (fixed stars)</td>
                  <td className="border border-gray-200 px-4 py-2">Tropical (seasons)</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-200 px-4 py-2 font-medium">Primary Focus</td>
                  <td className="border border-gray-200 px-4 py-2">Moon sign (Rashi)</td>
                  <td className="border border-gray-200 px-4 py-2">Sun sign</td>
                </tr>
                <tr>
                  <td className="border border-gray-200 px-4 py-2 font-medium">Lunar Mansions</td>
                  <td className="border border-gray-200 px-4 py-2">27 Nakshatras (essential)</td>
                  <td className="border border-gray-200 px-4 py-2">Not commonly used</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-200 px-4 py-2 font-medium">Predictive System</td>
                  <td className="border border-gray-200 px-4 py-2">Dasha system (planetary periods)</td>
                  <td className="border border-gray-200 px-4 py-2">Transits and progressions</td>
                </tr>
                <tr>
                  <td className="border border-gray-200 px-4 py-2 font-medium">Outer Planets</td>
                  <td className="border border-gray-200 px-4 py-2">Traditional 9 planets only</td>
                  <td className="border border-gray-200 px-4 py-2">Includes Uranus, Neptune, Pluto</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-200 px-4 py-2 font-medium">Remedies</td>
                  <td className="border border-gray-200 px-4 py-2">Extensive (gems, mantras, rituals)</td>
                  <td className="border border-gray-200 px-4 py-2">Limited focus on remedies</td>
                </tr>
                <tr>
                  <td className="border border-gray-200 px-4 py-2 font-medium">Approach</td>
                  <td className="border border-gray-200 px-4 py-2">More deterministic, karma-based</td>
                  <td className="border border-gray-200 px-4 py-2">More psychological</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-gray-700">
            The most significant difference is the zodiac calculation. Due to the precession of equinoxes, 
            there&apos;s approximately a 24-degree difference between the two systems. This means your Vedic 
            Sun sign may be different from your Western Sun sign. For example, if you&apos;re a Taurus in 
            Western astrology, you might be an Aries in Vedic astrology.
          </p>
        </section>

        <section id="zodiac-signs" className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            4. The 12 Zodiac Signs (Rashis)
          </h2>
          <p className="text-gray-700 mb-6">
            The zodiac in Vedic astrology is divided into 12 equal signs of 30 degrees each, called Rashis. 
            Each Rashi has specific characteristics, ruling planet, element, and quality that influence 
            the planets placed within them.
          </p>
          <div className="overflow-x-auto mb-6">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-amber-50">
                  <th className="border border-amber-200 px-4 py-2 text-left">Sign (Sanskrit)</th>
                  <th className="border border-amber-200 px-4 py-2 text-left">Element</th>
                  <th className="border border-amber-200 px-4 py-2 text-left">Ruler</th>
                  <th className="border border-amber-200 px-4 py-2 text-left">Quality</th>
                </tr>
              </thead>
              <tbody>
                {zodiacSigns.map((sign, index) => (
                  <tr key={sign.name} className={index % 2 === 0 ? "" : "bg-gray-50"}>
                    <td className="border border-gray-200 px-4 py-2 font-medium">{sign.name}</td>
                    <td className="border border-gray-200 px-4 py-2">{sign.element}</td>
                    <td className="border border-gray-200 px-4 py-2">{sign.ruler}</td>
                    <td className="border border-gray-200 px-4 py-2">{sign.quality}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section id="planets" className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            5. The 9 Planets (Navagrahas)
          </h2>
          <p className="text-gray-700 mb-6">
            Vedic astrology uses nine celestial bodies called Navagrahas (nine planets), which include 
            the Sun, Moon, five visible planets, and two lunar nodes (Rahu and Ketu). Each planet 
            governs specific aspects of life and has natural benefic or malefic tendencies.
          </p>
          <div className="overflow-x-auto mb-6">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-amber-50">
                  <th className="border border-amber-200 px-3 py-2 text-left">Planet</th>
                  <th className="border border-amber-200 px-3 py-2 text-left">Nature</th>
                  <th className="border border-amber-200 px-3 py-2 text-left">Signifies</th>
                  <th className="border border-amber-200 px-3 py-2 text-left">Exalted</th>
                  <th className="border border-amber-200 px-3 py-2 text-left">Debilitated</th>
                </tr>
              </thead>
              <tbody>
                {planets.map((planet, index) => (
                  <tr key={planet.name} className={index % 2 === 0 ? "" : "bg-gray-50"}>
                    <td className="border border-gray-200 px-3 py-2 font-medium">{planet.name}</td>
                    <td className="border border-gray-200 px-3 py-2">{planet.nature}</td>
                    <td className="border border-gray-200 px-3 py-2">{planet.signifies}</td>
                    <td className="border border-gray-200 px-3 py-2">{planet.exalted}</td>
                    <td className="border border-gray-200 px-3 py-2">{planet.debilitated}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section id="houses" className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            6. The 12 Houses (Bhavas)
          </h2>
          <p className="text-gray-700 mb-6">
            The birth chart is divided into 12 houses, each representing different areas of life. 
            The houses are counted from the Ascendant (Lagna), which marks the eastern horizon at 
            the time of birth. Planets placed in these houses influence the corresponding life areas.
          </p>
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {houses.map((house) => (
              <Card key={house.number} className="border-amber-100">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-amber-700 font-bold text-sm">{house.number}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{house.name}</h3>
                      <p className="text-sm text-gray-600">{house.signifies}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section id="nakshatras" className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            7. The 27 Nakshatras (Lunar Mansions)
          </h2>
          <p className="text-gray-700 mb-4">
            Nakshatras are 27 lunar constellations that the Moon traverses during its monthly cycle. 
            Each Nakshatra spans 13°20&apos; of the zodiac and provides deeper insights than the zodiac 
            signs alone. Your birth Nakshatra (Janma Nakshatra) is determined by the Moon&apos;s position 
            at birth and reveals your innermost nature, emotional patterns, and life purpose.
          </p>
          <p className="text-gray-700 mb-4">
            Each Nakshatra has a ruling deity, planetary lord, symbol, and unique characteristics. 
            They are extensively used in Muhurta (electional astrology), marriage compatibility 
            (Nakshatra matching), and the Vimshottari Dasha system for timing predictions.
          </p>
          <div className="flex gap-4">
            <Button asChild>
              <Link href="/27-nakshatras-complete-guide-vedic-astrology">
                Complete Nakshatra Guide
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/tools/nakshatra-finder">Find Your Nakshatra</Link>
            </Button>
          </div>
        </section>

        <section id="kundli" className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            8. Understanding Your Kundli (Birth Chart)
          </h2>
          <p className="text-gray-700 mb-4">
            A Kundli or Janam Kundli is the foundational chart in Vedic astrology. It&apos;s created using 
            three essential pieces of information: date of birth, time of birth, and place of birth. 
            The accuracy of predictions heavily depends on the precision of birth time—even a few 
            minutes can change the Ascendant and house positions.
          </p>
          <p className="text-gray-700 mb-4">
            The Kundli shows the positions of all nine planets in the 12 signs and 12 houses at the 
            moment of birth. From this main chart (Rashi chart or D-1), astrologers also calculate 
            divisional charts (Vargas) like Navamsa (D-9) for marriage, Dashamsa (D-10) for career, 
            and others for specific life areas.
          </p>
          <Card className="bg-amber-50 border-amber-200 mb-4">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-gray-900 mb-2">Key Elements in a Kundli:</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Ascendant (Lagna):</strong> The rising sign at birth, determines the house positions</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Moon Sign (Rashi):</strong> Your emotional nature and mind</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Sun Sign:</strong> Your soul, ego, and life purpose</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Planetary Positions:</strong> Where each planet is placed</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Aspects (Drishti):</strong> How planets influence each other</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Yogas:</strong> Special planetary combinations</span>
                </li>
              </ul>
            </CardContent>
          </Card>
          <Button asChild>
            <Link href="/tools/kundli-calculator">
              Generate Your Free Kundli
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </section>

        <section id="doshas" className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            9. Doshas and Their Effects
          </h2>
          <p className="text-gray-700 mb-4">
            Doshas are specific planetary combinations that indicate challenges or obstacles in certain 
            life areas. While they sound alarming, it&apos;s important to understand that most charts have 
            some doshas, and their effects vary based on other factors. Proper analysis and remedies 
            can significantly reduce their impact.
          </p>
          <div className="space-y-4 mb-6">
            <Card className="border-amber-100">
              <CardContent className="pt-4">
                <h3 className="font-semibold text-gray-900 mb-2">Mangal Dosha (Kuja Dosha)</h3>
                <p className="text-gray-600 text-sm">
                  Occurs when Mars is in 1st, 2nd, 4th, 7th, 8th, or 12th house. Associated with 
                  delays in marriage or marital discord. Intensity varies based on sign and aspects. 
                  Can be cancelled by various factors including partner also having Mangal Dosha.
                </p>
              </CardContent>
            </Card>
            <Card className="border-amber-100">
              <CardContent className="pt-4">
                <h3 className="font-semibold text-gray-900 mb-2">Kaal Sarp Dosha</h3>
                <p className="text-gray-600 text-sm">
                  Formed when all planets are hemmed between Rahu and Ketu. Associated with struggles, 
                  delays, and karmic lessons. Effects depend on which houses are involved and the 
                  specific type (12 variations exist).
                </p>
              </CardContent>
            </Card>
            <Card className="border-amber-100">
              <CardContent className="pt-4">
                <h3 className="font-semibold text-gray-900 mb-2">Pitru Dosha</h3>
                <p className="text-gray-600 text-sm">
                  Related to ancestral karma, indicated by afflictions to Sun or 9th house. May cause 
                  obstacles in career, children, or general prosperity. Remedies often involve 
                  ancestral rituals and charity.
                </p>
              </CardContent>
            </Card>
            <Card className="border-amber-100">
              <CardContent className="pt-4">
                <h3 className="font-semibold text-gray-900 mb-2">Shani Dosha (Sade Sati)</h3>
                <p className="text-gray-600 text-sm">
                  The 7.5-year period when Saturn transits through the 12th, 1st, and 2nd houses from 
                  Moon sign. A period of karmic lessons, hard work, and transformation. Not always 
                  negative—can bring significant achievements through effort.
                </p>
              </CardContent>
            </Card>
          </div>
          <Button asChild>
            <Link href="/vedic-astrology-remedies-doshas-guide">
              Learn About Remedies
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </section>

        <section id="remedies" className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            10. Astrological Remedies
          </h2>
          <p className="text-gray-700 mb-4">
            Vedic astrology offers various remedies to strengthen weak planets, reduce malefic effects, 
            and enhance positive influences. These remedies work on the principle of resonance—aligning 
            with planetary energies through specific actions, objects, or practices.
          </p>
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <Card className="border-amber-100">
              <CardContent className="pt-4">
                <h3 className="font-semibold text-gray-900 mb-2">Gemstones (Ratna)</h3>
                <p className="text-gray-600 text-sm">
                  Wearing specific gemstones to strengthen planetary energies. Must be chosen based 
                  on individual chart analysis. Examples: Ruby for Sun, Pearl for Moon, Red Coral for Mars.
                </p>
              </CardContent>
            </Card>
            <Card className="border-amber-100">
              <CardContent className="pt-4">
                <h3 className="font-semibold text-gray-900 mb-2">Mantras</h3>
                <p className="text-gray-600 text-sm">
                  Chanting planetary mantras to invoke positive energies. Each planet has specific 
                  Beej mantras and Vedic mantras. Regular practice with proper pronunciation is key.
                </p>
              </CardContent>
            </Card>
            <Card className="border-amber-100">
              <CardContent className="pt-4">
                <h3 className="font-semibold text-gray-900 mb-2">Charity (Dana)</h3>
                <p className="text-gray-600 text-sm">
                  Donating items associated with specific planets on their designated days. 
                  For example, donating wheat on Sundays for Sun, rice on Mondays for Moon.
                </p>
              </CardContent>
            </Card>
            <Card className="border-amber-100">
              <CardContent className="pt-4">
                <h3 className="font-semibold text-gray-900 mb-2">Fasting (Vrat)</h3>
                <p className="text-gray-600 text-sm">
                  Observing fasts on specific days to propitiate planets. Saturday fast for Saturn, 
                  Tuesday fast for Mars, Thursday fast for Jupiter, etc.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="faq" className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            11. Frequently Asked Questions
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
            <h2 className="text-2xl font-bold mb-2">Ready to Explore Your Birth Chart?</h2>
            <p className="mb-4 text-amber-100">
              Generate your free Kundli and discover insights about your life path, career, 
              relationships, and more.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-amber-600 hover:bg-amber-50" asChild>
                <Link href="/tools/kundli-calculator">
                  Generate Free Kundli
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" asChild>
                <Link href="/consultation">Book Consultation</Link>
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
            headline: "Complete Vedic Astrology Guide 2025: Master Jyotish Shastra",
            description: "Comprehensive guide to Vedic astrology covering Kundli, Nakshatras, planets, houses, doshas, and remedies.",
            image: "https://vedicstarastro.com/images/vedic-astrology-guide.jpg",
            author: {
              "@type": "Organization",
              name: "VedicStarAstro",
            },
            publisher: {
              "@type": "Organization",
              name: "VedicStarAstro",
              logo: {
                "@type": "ImageObject",
                url: "https://vedicstarastro.com/logo.png",
              },
            },
            datePublished: "2025-01-01",
            dateModified: new Date().toISOString().split("T")[0],
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": "https://vedicstarastro.com/vedic-astrology-guide-complete-2025",
            },
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
              acceptedAnswer: {
                "@type": "Answer",
                text: faq.answer,
              },
            })),
          }),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: "https://vedicstarastro.com",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Vedic Astrology Guide",
                item: "https://vedicstarastro.com/vedic-astrology-guide-complete-2025",
              },
            ],
          }),
        }}
      />
    </article>
  );
}
