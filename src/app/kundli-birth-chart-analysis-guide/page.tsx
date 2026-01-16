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
import { ArrowRight, BookOpen, Star, Clock, CheckCircle, Sun, Moon } from "lucide-react";

export const metadata: Metadata = {
  title: "Kundli Birth Chart Analysis Guide - Understanding Your Janam Kundli",
  description:
    "Learn how to read and interpret your Kundli (birth chart). Comprehensive guide covering houses, planets, aspects, yogas, and dashas for accurate horoscope analysis.",
  keywords: [
    "kundli analysis",
    "birth chart reading",
    "janam kundli",
    "horoscope interpretation",
    "kundli houses",
    "planetary positions",
    "vedic birth chart",
    "kundli reading guide",
  ],
  openGraph: {
    title: "Kundli Birth Chart Analysis Guide - Understanding Your Janam Kundli",
    description:
      "Learn how to read and interpret your Kundli (birth chart). Comprehensive guide covering houses, planets, aspects, yogas, and dashas.",
    type: "article",
    publishedTime: "2025-01-01T00:00:00Z",
    modifiedTime: new Date().toISOString(),
    authors: ["VedicStarAstro"],
  },
};

const tableOfContents = [
  { id: "what-is-kundli", title: "What is a Kundli?" },
  { id: "components", title: "Components of a Birth Chart" },
  { id: "houses", title: "The 12 Houses Explained" },
  { id: "planets", title: "Planetary Significations" },
  { id: "aspects", title: "Planetary Aspects (Drishti)" },
  { id: "yogas", title: "Important Yogas" },
  { id: "dashas", title: "Dasha Systems" },
  { id: "reading-chart", title: "How to Read Your Chart" },
  { id: "common-combinations", title: "Common Planetary Combinations" },
  { id: "faq", title: "Frequently Asked Questions" },
];

const houses = [
  { number: 1, name: "Lagna (Ascendant)", signifies: "Self, personality, physical appearance, health, overall life direction", keywords: "Identity, Body, Vitality" },
  { number: 2, name: "Dhana Bhava", signifies: "Wealth, family, speech, food habits, early childhood, face, right eye", keywords: "Money, Family, Values" },
  { number: 3, name: "Sahaja Bhava", signifies: "Siblings, courage, short journeys, communication, skills, neighbors", keywords: "Courage, Siblings, Efforts" },
  { number: 4, name: "Sukha Bhava", signifies: "Mother, home, property, vehicles, education, emotional peace, chest", keywords: "Home, Mother, Comfort" },
  { number: 5, name: "Putra Bhava", signifies: "Children, creativity, intelligence, romance, speculation, past life merit", keywords: "Children, Creativity, Romance" },
  { number: 6, name: "Ari Bhava", signifies: "Enemies, diseases, debts, obstacles, service, maternal uncle, pets", keywords: "Health, Enemies, Service" },
  { number: 7, name: "Kalatra Bhava", signifies: "Marriage, spouse, partnerships, business, public dealings, foreign travel", keywords: "Marriage, Partnership, Others" },
  { number: 8, name: "Ayur Bhava", signifies: "Longevity, transformation, inheritance, occult, sudden events, in-laws", keywords: "Transformation, Death, Mystery" },
  { number: 9, name: "Dharma Bhava", signifies: "Fortune, father, religion, higher education, long journeys, guru", keywords: "Luck, Father, Wisdom" },
  { number: 10, name: "Karma Bhava", signifies: "Career, reputation, authority, achievements, government, father's status", keywords: "Career, Status, Authority" },
  { number: 11, name: "Labha Bhava", signifies: "Gains, income, friends, elder siblings, aspirations, social networks", keywords: "Gains, Friends, Wishes" },
  { number: 12, name: "Vyaya Bhava", signifies: "Losses, expenses, foreign lands, isolation, spirituality, liberation", keywords: "Loss, Spirituality, Abroad" },
];

const planets = [
  { name: "Sun (Surya)", nature: "Malefic", karakatva: "Soul, father, authority, government, health, ego", strong: "Leadership, confidence, success", weak: "Ego issues, health problems, father troubles" },
  { name: "Moon (Chandra)", nature: "Benefic", karakatva: "Mind, mother, emotions, public, liquids, travel", strong: "Emotional stability, popularity, nurturing", weak: "Mental stress, mother issues, mood swings" },
  { name: "Mars (Mangal)", nature: "Malefic", karakatva: "Energy, courage, siblings, property, blood, surgery", strong: "Courage, property gains, athletic ability", weak: "Anger, accidents, sibling conflicts" },
  { name: "Mercury (Budha)", nature: "Neutral", karakatva: "Intelligence, communication, business, skin, nervous system", strong: "Sharp intellect, business success, communication skills", weak: "Nervous disorders, speech issues, indecision" },
  { name: "Jupiter (Guru)", nature: "Benefic", karakatva: "Wisdom, children, fortune, spirituality, husband (for women)", strong: "Wisdom, children, wealth, spiritual growth", weak: "Liver issues, childlessness, bad judgment" },
  { name: "Venus (Shukra)", nature: "Benefic", karakatva: "Love, marriage, luxury, arts, wife (for men), vehicles", strong: "Happy marriage, artistic talent, luxury", weak: "Relationship issues, kidney problems, overindulgence" },
  { name: "Saturn (Shani)", nature: "Malefic", karakatva: "Karma, discipline, longevity, hardship, servants, delays", strong: "Discipline, longevity, career success", weak: "Delays, chronic diseases, depression" },
  { name: "Rahu", nature: "Malefic", karakatva: "Obsession, foreign, unconventional, illusion, paternal grandfather", strong: "Foreign success, unconventional gains, research", weak: "Confusion, addiction, scandals" },
  { name: "Ketu", nature: "Malefic", karakatva: "Spirituality, detachment, past karma, maternal grandfather, moksha", strong: "Spiritual growth, intuition, liberation", weak: "Detachment issues, mysterious diseases, losses" },
];

const yogas = [
  { name: "Raj Yoga", description: "Formed when lords of Kendra (1,4,7,10) and Trikona (1,5,9) houses combine. Brings power, authority, and success.", effect: "Highly Beneficial" },
  { name: "Dhana Yoga", description: "Combination of lords of 2nd, 5th, 9th, and 11th houses. Indicates wealth accumulation and financial prosperity.", effect: "Beneficial" },
  { name: "Gaja Kesari Yoga", description: "Jupiter in Kendra from Moon. Brings wisdom, fame, and lasting reputation.", effect: "Beneficial" },
  { name: "Budhaditya Yoga", description: "Sun and Mercury conjunction. Enhances intelligence, communication, and analytical abilities.", effect: "Beneficial" },
  { name: "Chandra-Mangal Yoga", description: "Moon and Mars conjunction or mutual aspect. Can bring wealth but also emotional intensity.", effect: "Mixed" },
  { name: "Vipreet Raj Yoga", description: "Lords of 6th, 8th, or 12th houses placed in each other's houses. Turns adversity into advantage.", effect: "Beneficial" },
  { name: "Kaal Sarp Dosha", description: "All planets hemmed between Rahu and Ketu. Can cause struggles but also spiritual growth.", effect: "Challenging" },
  { name: "Mangal Dosha", description: "Mars in 1st, 2nd, 4th, 7th, 8th, or 12th house. Affects marriage; remedies available.", effect: "Challenging" },
];

const faqs = [
  {
    question: "What information do I need to generate my Kundli?",
    answer: "To generate an accurate Kundli, you need three essential pieces of information: 1) Exact date of birth, 2) Precise time of birth (even minutes matter), and 3) Place of birth (for calculating the correct Ascendant). The birth time is crucial as the Ascendant changes approximately every 2 hours, significantly affecting the entire chart interpretation.",
  },
  {
    question: "Why is birth time so important in Kundli?",
    answer: "Birth time determines your Ascendant (Lagna), which is the foundation of your entire chart. The Ascendant sets the house positions for all planets and defines which houses they rule. Even a few minutes difference can change your Ascendant, Moon Nakshatra pada, and planetary house placements, leading to different predictions.",
  },
  {
    question: "What if I don't know my exact birth time?",
    answer: "If you don't know your exact birth time, astrologers can perform 'birth time rectification' using significant life events. Alternatively, a Moon chart (Chandra Kundli) or Sun chart (Surya Kundli) can be used, though they're less precise. Some astrologers also use Prashna Kundli (horary chart) for specific questions.",
  },
  {
    question: "What is the difference between Lagna Chart and Moon Chart?",
    answer: "The Lagna Chart (D-1) uses the Ascendant as the first house and is the primary chart for overall life analysis. The Moon Chart (Chandra Kundli) places the Moon sign as the first house and is used for mental/emotional analysis and in South Indian traditions. Both are important and often analyzed together.",
  },
  {
    question: "How do I know if a planet is strong or weak in my chart?",
    answer: "A planet's strength depends on multiple factors: 1) Sign placement (exalted, own sign, friendly, enemy, debilitated), 2) House placement (Kendra, Trikona, Dusthana), 3) Aspects from benefics or malefics, 4) Conjunctions, 5) Nakshatra lord, and 6) Shadbala (six-fold strength calculation). A comprehensive analysis considers all these factors.",
  },
  {
    question: "What are divisional charts (Vargas)?",
    answer: "Divisional charts are derived charts that provide detailed analysis of specific life areas. Important ones include: D-9 (Navamsa) for marriage and dharma, D-10 (Dasamsa) for career, D-7 (Saptamsa) for children, D-4 (Chaturthamsa) for property, and D-12 (Dwadasamsa) for parents. The D-1 (Rashi) and D-9 are most commonly used.",
  },
  {
    question: "How accurate are online Kundli generators?",
    answer: "Online Kundli generators are mathematically accurate for calculating planetary positions using Swiss Ephemeris or similar astronomical data. However, interpretation requires human expertise. Use online tools for generating the chart, but consult experienced astrologers for detailed analysis and predictions.",
  },
  {
    question: "Can Kundli predictions be changed?",
    answer: "Vedic astrology believes in karma and free will working together. While the Kundli shows karmic tendencies and probable outcomes, remedial measures (gemstones, mantras, charity, lifestyle changes) can mitigate negative effects and enhance positive ones. Your choices and efforts within the karmic framework can modify outcomes.",
  },
];

export default function KundliAnalysisGuidePage() {
  return (
    <article className="py-12 lg:py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Badge className="mb-4 bg-amber-100 text-amber-800">Complete Guide</Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Kundli Birth Chart Analysis: Complete Guide to Reading Your Horoscope
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            Master the art of Kundli interpretation with this comprehensive guide. Learn how to 
            analyze houses, planets, aspects, yogas, and dashas to unlock the secrets of your 
            birth chart.
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              20 min read
            </span>
            <span>Updated: January 2025</span>
          </div>
        </div>

        <Card className="mb-8 bg-amber-50 border-amber-200">
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Quick Summary</h2>
            <p className="text-gray-700 mb-4">
              A Kundli (Janam Kundli) is your cosmic blueprint showing planetary positions at birth. 
              It consists of 12 houses representing different life areas, 9 planets (Navagrahas) 
              indicating various influences, and their interactions through aspects and yogas. 
              Understanding your Kundli helps you navigate life decisions, relationships, career, 
              and spiritual growth.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" asChild>
                <Link href="/tools/kundli-calculator">Generate Your Kundli</Link>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <Link href="/consultation">Consult an Expert</Link>
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

        <section id="what-is-kundli" className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            1. What is a Kundli?
          </h2>
          <p className="text-gray-700 mb-4">
            A Kundli, also known as Janam Kundli, Janma Patri, or birth chart, is a celestial map 
            that captures the exact positions of the Sun, Moon, planets, and other astronomical 
            points at the precise moment and location of your birth. This cosmic snapshot serves 
            as the foundation for all Vedic astrological analysis and predictions.
          </p>
          <p className="text-gray-700 mb-4">
            The word &ldquo;Kundli&rdquo; comes from the Sanskrit word &ldquo;Kundala,&rdquo; meaning coil or circle, 
            referring to the circular representation of the zodiac. In Vedic astrology, the Kundli 
            is considered a karmic blueprint that reveals your past life impressions (samskaras), 
            present life tendencies, and future possibilities.
          </p>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <Card className="border-amber-100">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sun className="w-5 h-5 text-amber-600" />
                  <h3 className="font-semibold">North Indian Style</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Diamond-shaped chart with fixed house positions. The Ascendant is always at the top. 
                  Signs rotate based on the Ascendant sign.
                </p>
              </CardContent>
            </Card>
            <Card className="border-amber-100">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Moon className="w-5 h-5 text-amber-600" />
                  <h3 className="font-semibold">South Indian Style</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Square chart with fixed sign positions. Signs are always in the same boxes. 
                  The Ascendant is marked, and houses are counted from there.
                </p>
              </CardContent>
            </Card>
          </div>
          <p className="text-gray-700">
            Both styles contain the same information; the difference is only in presentation. 
            North Indian style is more common in North India, while South Indian style is 
            prevalent in South India and among many Western Vedic astrologers.
          </p>
        </section>

        <section id="components" className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            2. Components of a Birth Chart
          </h2>
          <p className="text-gray-700 mb-4">
            A complete Kundli consists of several interconnected components that work together 
            to provide a comprehensive picture of your life:
          </p>
          <div className="space-y-4 mb-4">
            <Card className="border-l-4 border-l-amber-500">
              <CardContent className="pt-4">
                <h3 className="font-semibold text-gray-900 mb-2">12 Houses (Bhavas)</h3>
                <p className="text-gray-600">
                  Represent different areas of life such as self, wealth, siblings, home, children, 
                  health, marriage, transformation, fortune, career, gains, and spirituality.
                </p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-orange-500">
              <CardContent className="pt-4">
                <h3 className="font-semibold text-gray-900 mb-2">12 Signs (Rashis)</h3>
                <p className="text-gray-600">
                  The zodiac signs from Aries to Pisces that occupy the houses and color the 
                  expression of planets placed in them.
                </p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-yellow-500">
              <CardContent className="pt-4">
                <h3 className="font-semibold text-gray-900 mb-2">9 Planets (Grahas)</h3>
                <p className="text-gray-600">
                  Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, and Ketu - each 
                  representing different aspects of life and consciousness.
                </p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="pt-4">
                <h3 className="font-semibold text-gray-900 mb-2">27 Nakshatras</h3>
                <p className="text-gray-600">
                  Lunar mansions that provide deeper insights into planetary placements and 
                  are crucial for Dasha calculations and muhurta selection.
                </p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="pt-4">
                <h3 className="font-semibold text-gray-900 mb-2">Ascendant (Lagna)</h3>
                <p className="text-gray-600">
                  The rising sign at the time of birth, which becomes the first house and 
                  sets the framework for the entire chart interpretation.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="houses" className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            3. The 12 Houses Explained
          </h2>
          <p className="text-gray-700 mb-6">
            Each house in the Kundli governs specific areas of life. Understanding house 
            significations is fundamental to chart interpretation:
          </p>
          <div className="space-y-4">
            {houses.map((house) => (
              <Card key={house.number} className="border-amber-100 hover:border-amber-300 transition-colors">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-sm">
                          {house.number}
                        </span>
                        <h3 className="font-semibold text-gray-900">{house.name}</h3>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{house.signifies}</p>
                      <div className="flex flex-wrap gap-1">
                        {house.keywords.split(", ").map((keyword) => (
                          <Badge key={keyword} variant="secondary" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="mt-6 bg-blue-50 border-blue-200">
            <CardContent className="pt-4">
              <h3 className="font-semibold text-gray-900 mb-2">House Classifications</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p><strong>Kendra (Angular):</strong> 1, 4, 7, 10 - Most powerful positions</p>
                  <p><strong>Trikona (Trine):</strong> 1, 5, 9 - Most auspicious houses</p>
                </div>
                <div>
                  <p><strong>Dusthana (Difficult):</strong> 6, 8, 12 - Challenging houses</p>
                  <p><strong>Upachaya (Growth):</strong> 3, 6, 10, 11 - Improve over time</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section id="planets" className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            4. Planetary Significations
          </h2>
          <p className="text-gray-700 mb-6">
            Each planet (Graha) represents specific aspects of life and consciousness. 
            Understanding their karakatvas (significations) is essential for accurate interpretation:
          </p>
          <div className="space-y-4">
            {planets.map((planet) => (
              <Card key={planet.name} className="border-amber-100">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{planet.name}</h3>
                    <Badge className={planet.nature === "Benefic" ? "bg-green-100 text-green-800" : planet.nature === "Malefic" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"}>
                      {planet.nature}
                    </Badge>
                  </div>
                  <p className="text-gray-600 text-sm mb-3"><strong>Signifies:</strong> {planet.karakatva}</p>
                  <div className="grid md:grid-cols-2 gap-2 text-sm">
                    <div className="bg-green-50 p-2 rounded">
                      <strong className="text-green-700">When Strong:</strong> {planet.strong}
                    </div>
                    <div className="bg-red-50 p-2 rounded">
                      <strong className="text-red-700">When Weak:</strong> {planet.weak}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section id="aspects" className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            5. Planetary Aspects (Drishti)
          </h2>
          <p className="text-gray-700 mb-4">
            In Vedic astrology, planets cast aspects (Drishti) on other planets and houses, 
            influencing them. Unlike Western astrology where aspects are based on degrees, 
            Vedic aspects are house-based:
          </p>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <Card className="border-amber-100">
              <CardContent className="pt-4">
                <h3 className="font-semibold text-gray-900 mb-2">All Planets</h3>
                <p className="text-gray-600 text-sm">
                  Every planet aspects the 7th house from itself (opposite house) with full strength.
                </p>
              </CardContent>
            </Card>
            <Card className="border-amber-100">
              <CardContent className="pt-4">
                <h3 className="font-semibold text-gray-900 mb-2">Mars Special Aspects</h3>
                <p className="text-gray-600 text-sm">
                  Mars additionally aspects the 4th and 8th houses from itself with full strength.
                </p>
              </CardContent>
            </Card>
            <Card className="border-amber-100">
              <CardContent className="pt-4">
                <h3 className="font-semibold text-gray-900 mb-2">Jupiter Special Aspects</h3>
                <p className="text-gray-600 text-sm">
                  Jupiter additionally aspects the 5th and 9th houses from itself with full strength.
                </p>
              </CardContent>
            </Card>
            <Card className="border-amber-100">
              <CardContent className="pt-4">
                <h3 className="font-semibold text-gray-900 mb-2">Saturn Special Aspects</h3>
                <p className="text-gray-600 text-sm">
                  Saturn additionally aspects the 3rd and 10th houses from itself with full strength.
                </p>
              </CardContent>
            </Card>
          </div>
          <p className="text-gray-700">
            Rahu and Ketu also have special aspects similar to Jupiter and Saturn respectively, 
            though some astrologers debate their aspect strength. Aspects from benefics (Jupiter, 
            Venus, well-placed Mercury and Moon) are protective, while aspects from malefics 
            (Saturn, Mars, Rahu, Ketu, Sun) can create challenges.
          </p>
        </section>

        <section id="yogas" className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            6. Important Yogas
          </h2>
          <p className="text-gray-700 mb-6">
            Yogas are specific planetary combinations that produce particular results. 
            Hundreds of yogas are described in classical texts. Here are some important ones:
          </p>
          <div className="space-y-4">
            {yogas.map((yoga) => (
              <Card key={yoga.name} className="border-amber-100">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{yoga.name}</h3>
                    <Badge className={
                      yoga.effect === "Highly Beneficial" ? "bg-green-100 text-green-800" :
                      yoga.effect === "Beneficial" ? "bg-blue-100 text-blue-800" :
                      yoga.effect === "Mixed" ? "bg-yellow-100 text-yellow-800" :
                      "bg-red-100 text-red-800"
                    }>
                      {yoga.effect}
                    </Badge>
                  </div>
                  <p className="text-gray-600 text-sm">{yoga.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section id="dashas" className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            7. Dasha Systems
          </h2>
          <p className="text-gray-700 mb-4">
            Dashas are planetary periods that determine when the promises of the birth chart 
            will manifest. The most widely used system is Vimshottari Dasha:
          </p>
          <Card className="mb-4 border-amber-200">
            <CardContent className="pt-4">
              <h3 className="font-semibold text-gray-900 mb-3">Vimshottari Dasha Periods</h3>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-2 text-sm">
                <div className="bg-amber-50 p-2 rounded text-center">
                  <div className="font-semibold">Ketu</div>
                  <div className="text-gray-600">7 years</div>
                </div>
                <div className="bg-amber-50 p-2 rounded text-center">
                  <div className="font-semibold">Venus</div>
                  <div className="text-gray-600">20 years</div>
                </div>
                <div className="bg-amber-50 p-2 rounded text-center">
                  <div className="font-semibold">Sun</div>
                  <div className="text-gray-600">6 years</div>
                </div>
                <div className="bg-amber-50 p-2 rounded text-center">
                  <div className="font-semibold">Moon</div>
                  <div className="text-gray-600">10 years</div>
                </div>
                <div className="bg-amber-50 p-2 rounded text-center">
                  <div className="font-semibold">Mars</div>
                  <div className="text-gray-600">7 years</div>
                </div>
                <div className="bg-amber-50 p-2 rounded text-center">
                  <div className="font-semibold">Rahu</div>
                  <div className="text-gray-600">18 years</div>
                </div>
                <div className="bg-amber-50 p-2 rounded text-center">
                  <div className="font-semibold">Jupiter</div>
                  <div className="text-gray-600">16 years</div>
                </div>
                <div className="bg-amber-50 p-2 rounded text-center">
                  <div className="font-semibold">Saturn</div>
                  <div className="text-gray-600">19 years</div>
                </div>
                <div className="bg-amber-50 p-2 rounded text-center">
                  <div className="font-semibold">Mercury</div>
                  <div className="text-gray-600">17 years</div>
                </div>
              </div>
              <p className="text-gray-600 text-sm mt-3">
                Total: 120 years. The starting Dasha is determined by Moon&apos;s Nakshatra at birth.
              </p>
            </CardContent>
          </Card>
          <p className="text-gray-700">
            Each Mahadasha (major period) is subdivided into Antardashas (sub-periods), 
            which are further divided into Pratyantardashas. The results depend on the 
            planet&apos;s placement, lordship, aspects, and conjunctions in the birth chart.
          </p>
        </section>

        <section id="reading-chart" className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            8. How to Read Your Chart
          </h2>
          <p className="text-gray-700 mb-4">
            Follow these steps for a systematic approach to Kundli analysis:
          </p>
          <div className="space-y-3">
            {[
              "Identify the Ascendant (Lagna) - This sets the framework for the entire chart",
              "Note the Moon sign and Nakshatra - Important for mind, emotions, and Dasha calculation",
              "Analyze the Sun sign - Reveals soul purpose and father-related matters",
              "Check planetary strengths - Exaltation, debilitation, own sign, friendly/enemy signs",
              "Identify house lords and their placements - Where does each house lord sit?",
              "Look for yogas - Both beneficial and challenging combinations",
              "Analyze aspects - Which planets are influencing which houses?",
              "Check the current Dasha-Antardasha - What planetary period is active?",
              "Examine divisional charts - D-9 for marriage, D-10 for career, etc.",
              "Consider transits - Current planetary positions over natal chart",
            ].map((step, index) => (
              <div key={index} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-sm flex-shrink-0">
                  {index + 1}
                </span>
                <p className="text-gray-700">{step}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="common-combinations" className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            9. Common Planetary Combinations
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-green-200">
              <CardContent className="pt-4">
                <h3 className="font-semibold text-green-700 mb-2">Favorable Combinations</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Jupiter in Kendra or Trikona</li>
                  <li>• Venus in own sign or exalted</li>
                  <li>• Strong Moon (Shukla Paksha)</li>
                  <li>• Benefics in Kendras</li>
                  <li>• 9th and 10th lords together</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="border-red-200">
              <CardContent className="pt-4">
                <h3 className="font-semibold text-red-700 mb-2">Challenging Combinations</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Saturn-Mars conjunction</li>
                  <li>• Rahu-Moon conjunction (Grahan Yoga)</li>
                  <li>• Debilitated planets in Kendras</li>
                  <li>• 6th, 8th, 12th lords in Kendras</li>
                  <li>• Combust planets (too close to Sun)</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="faq" className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            10. Frequently Asked Questions
          </h2>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        <Card className="bg-gradient-to-r from-amber-500 to-orange-600 text-white">
          <CardContent className="pt-6 text-center">
            <h2 className="text-2xl font-bold mb-2">Ready to Analyze Your Kundli?</h2>
            <p className="mb-4 text-amber-100">
              Generate your free birth chart or consult with our expert astrologers for 
              personalized guidance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-amber-600 hover:bg-amber-50" asChild>
                <Link href="/tools/kundli-calculator">
                  Generate Free Kundli
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button size="lg" className="bg-white text-amber-600 hover:bg-amber-50" asChild>
                <Link href="/consultation">Expert Consultation</Link>
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
            headline: "Kundli Birth Chart Analysis: Complete Guide to Reading Your Horoscope",
            description: "Learn how to read and interpret your Kundli (birth chart). Comprehensive guide covering houses, planets, aspects, yogas, and dashas.",
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
