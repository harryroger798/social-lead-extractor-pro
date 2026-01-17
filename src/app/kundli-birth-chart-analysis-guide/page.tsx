"use client";

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
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function KundliAnalysisGuidePage() {
  const { t } = useLanguage();

  const tableOfContents = [
    { id: "what-is-kundli", title: t('guides.kundli.toc.whatIsKundli', 'What is a Kundli?') },
    { id: "components", title: t('guides.kundli.toc.components', 'Components of a Birth Chart') },
    { id: "houses", title: t('guides.kundli.toc.houses', 'The 12 Houses Explained') },
    { id: "planets", title: t('guides.kundli.toc.planets', 'Planetary Significations') },
    { id: "aspects", title: t('guides.kundli.toc.aspects', 'Planetary Aspects (Drishti)') },
    { id: "yogas", title: t('guides.kundli.toc.yogas', 'Important Yogas') },
    { id: "dashas", title: t('guides.kundli.toc.dashas', 'Dasha Systems') },
    { id: "reading-chart", title: t('guides.kundli.toc.readingChart', 'How to Read Your Chart') },
    { id: "common-combinations", title: t('guides.kundli.toc.commonCombinations', 'Common Planetary Combinations') },
    { id: "faq", title: t('guides.kundli.toc.faq', 'Frequently Asked Questions') },
  ];

  const houses = [
    { number: 1, name: t('guides.kundli.houses.house1.name', 'Lagna (Ascendant)'), signifies: t('guides.kundli.houses.house1.signifies', 'Self, personality, physical appearance, health, overall life direction'), keywords: t('guides.kundli.houses.house1.keywords', 'Identity, Body, Vitality') },
    { number: 2, name: t('guides.kundli.houses.house2.name', 'Dhana Bhava'), signifies: t('guides.kundli.houses.house2.signifies', 'Wealth, family, speech, food habits, early childhood, face, right eye'), keywords: t('guides.kundli.houses.house2.keywords', 'Money, Family, Values') },
    { number: 3, name: t('guides.kundli.houses.house3.name', 'Sahaja Bhava'), signifies: t('guides.kundli.houses.house3.signifies', 'Siblings, courage, short journeys, communication, skills, neighbors'), keywords: t('guides.kundli.houses.house3.keywords', 'Courage, Siblings, Efforts') },
    { number: 4, name: t('guides.kundli.houses.house4.name', 'Sukha Bhava'), signifies: t('guides.kundli.houses.house4.signifies', 'Mother, home, property, vehicles, education, emotional peace, chest'), keywords: t('guides.kundli.houses.house4.keywords', 'Home, Mother, Comfort') },
    { number: 5, name: t('guides.kundli.houses.house5.name', 'Putra Bhava'), signifies: t('guides.kundli.houses.house5.signifies', 'Children, creativity, intelligence, romance, speculation, past life merit'), keywords: t('guides.kundli.houses.house5.keywords', 'Children, Creativity, Romance') },
    { number: 6, name: t('guides.kundli.houses.house6.name', 'Ari Bhava'), signifies: t('guides.kundli.houses.house6.signifies', 'Enemies, diseases, debts, obstacles, service, maternal uncle, pets'), keywords: t('guides.kundli.houses.house6.keywords', 'Health, Enemies, Service') },
    { number: 7, name: t('guides.kundli.houses.house7.name', 'Kalatra Bhava'), signifies: t('guides.kundli.houses.house7.signifies', 'Marriage, spouse, partnerships, business, public dealings, foreign travel'), keywords: t('guides.kundli.houses.house7.keywords', 'Marriage, Partnership, Others') },
    { number: 8, name: t('guides.kundli.houses.house8.name', 'Ayur Bhava'), signifies: t('guides.kundli.houses.house8.signifies', 'Longevity, transformation, inheritance, occult, sudden events, in-laws'), keywords: t('guides.kundli.houses.house8.keywords', 'Transformation, Death, Mystery') },
    { number: 9, name: t('guides.kundli.houses.house9.name', 'Dharma Bhava'), signifies: t('guides.kundli.houses.house9.signifies', 'Fortune, father, religion, higher education, long journeys, guru'), keywords: t('guides.kundli.houses.house9.keywords', 'Luck, Father, Wisdom') },
    { number: 10, name: t('guides.kundli.houses.house10.name', 'Karma Bhava'), signifies: t('guides.kundli.houses.house10.signifies', 'Career, reputation, authority, achievements, government, father\'s status'), keywords: t('guides.kundli.houses.house10.keywords', 'Career, Status, Authority') },
    { number: 11, name: t('guides.kundli.houses.house11.name', 'Labha Bhava'), signifies: t('guides.kundli.houses.house11.signifies', 'Gains, income, friends, elder siblings, aspirations, social networks'), keywords: t('guides.kundli.houses.house11.keywords', 'Gains, Friends, Wishes') },
    { number: 12, name: t('guides.kundli.houses.house12.name', 'Vyaya Bhava'), signifies: t('guides.kundli.houses.house12.signifies', 'Losses, expenses, foreign lands, isolation, spirituality, liberation'), keywords: t('guides.kundli.houses.house12.keywords', 'Loss, Spirituality, Abroad') },
  ];

  const planets = [
    { name: t('guides.kundli.planets.sun.name', 'Sun (Surya)'), nature: t('guides.kundli.planets.sun.nature', 'Malefic'), karakatva: t('guides.kundli.planets.sun.karakatva', 'Soul, father, authority, government, health, ego'), strong: t('guides.kundli.planets.sun.strong', 'Leadership, confidence, success'), weak: t('guides.kundli.planets.sun.weak', 'Ego issues, health problems, father troubles') },
    { name: t('guides.kundli.planets.moon.name', 'Moon (Chandra)'), nature: t('guides.kundli.planets.moon.nature', 'Benefic'), karakatva: t('guides.kundli.planets.moon.karakatva', 'Mind, mother, emotions, public, liquids, travel'), strong: t('guides.kundli.planets.moon.strong', 'Emotional stability, popularity, nurturing'), weak: t('guides.kundli.planets.moon.weak', 'Mental stress, mother issues, mood swings') },
    { name: t('guides.kundli.planets.mars.name', 'Mars (Mangal)'), nature: t('guides.kundli.planets.mars.nature', 'Malefic'), karakatva: t('guides.kundli.planets.mars.karakatva', 'Energy, courage, siblings, property, blood, surgery'), strong: t('guides.kundli.planets.mars.strong', 'Courage, property gains, athletic ability'), weak: t('guides.kundli.planets.mars.weak', 'Anger, accidents, sibling conflicts') },
    { name: t('guides.kundli.planets.mercury.name', 'Mercury (Budha)'), nature: t('guides.kundli.planets.mercury.nature', 'Neutral'), karakatva: t('guides.kundli.planets.mercury.karakatva', 'Intelligence, communication, business, skin, nervous system'), strong: t('guides.kundli.planets.mercury.strong', 'Sharp intellect, business success, communication skills'), weak: t('guides.kundli.planets.mercury.weak', 'Nervous disorders, speech issues, indecision') },
    { name: t('guides.kundli.planets.jupiter.name', 'Jupiter (Guru)'), nature: t('guides.kundli.planets.jupiter.nature', 'Benefic'), karakatva: t('guides.kundli.planets.jupiter.karakatva', 'Wisdom, children, fortune, spirituality, husband (for women)'), strong: t('guides.kundli.planets.jupiter.strong', 'Wisdom, children, wealth, spiritual growth'), weak: t('guides.kundli.planets.jupiter.weak', 'Liver issues, childlessness, bad judgment') },
    { name: t('guides.kundli.planets.venus.name', 'Venus (Shukra)'), nature: t('guides.kundli.planets.venus.nature', 'Benefic'), karakatva: t('guides.kundli.planets.venus.karakatva', 'Love, marriage, luxury, arts, wife (for men), vehicles'), strong: t('guides.kundli.planets.venus.strong', 'Happy marriage, artistic talent, luxury'), weak: t('guides.kundli.planets.venus.weak', 'Relationship issues, kidney problems, overindulgence') },
    { name: t('guides.kundli.planets.saturn.name', 'Saturn (Shani)'), nature: t('guides.kundli.planets.saturn.nature', 'Malefic'), karakatva: t('guides.kundli.planets.saturn.karakatva', 'Karma, discipline, longevity, hardship, servants, delays'), strong: t('guides.kundli.planets.saturn.strong', 'Discipline, longevity, career success'), weak: t('guides.kundli.planets.saturn.weak', 'Delays, chronic diseases, depression') },
    { name: t('guides.kundli.planets.rahu.name', 'Rahu'), nature: t('guides.kundli.planets.rahu.nature', 'Malefic'), karakatva: t('guides.kundli.planets.rahu.karakatva', 'Obsession, foreign, unconventional, illusion, paternal grandfather'), strong: t('guides.kundli.planets.rahu.strong', 'Foreign success, unconventional gains, research'), weak: t('guides.kundli.planets.rahu.weak', 'Confusion, addiction, scandals') },
    { name: t('guides.kundli.planets.ketu.name', 'Ketu'), nature: t('guides.kundli.planets.ketu.nature', 'Malefic'), karakatva: t('guides.kundli.planets.ketu.karakatva', 'Spirituality, detachment, past karma, maternal grandfather, moksha'), strong: t('guides.kundli.planets.ketu.strong', 'Spiritual growth, intuition, liberation'), weak: t('guides.kundli.planets.ketu.weak', 'Detachment issues, mysterious diseases, losses') },
  ];

  const yogas = [
    { name: t('guides.kundli.yogas.rajYoga.name', 'Raj Yoga'), description: t('guides.kundli.yogas.rajYoga.description', 'Formed when lords of Kendra (1,4,7,10) and Trikona (1,5,9) houses combine. Brings power, authority, and success.'), effect: t('guides.kundli.yogas.rajYoga.effect', 'Highly Beneficial') },
    { name: t('guides.kundli.yogas.dhanaYoga.name', 'Dhana Yoga'), description: t('guides.kundli.yogas.dhanaYoga.description', 'Combination of lords of 2nd, 5th, 9th, and 11th houses. Indicates wealth accumulation and financial prosperity.'), effect: t('guides.kundli.yogas.dhanaYoga.effect', 'Beneficial') },
    { name: t('guides.kundli.yogas.gajaKesari.name', 'Gaja Kesari Yoga'), description: t('guides.kundli.yogas.gajaKesari.description', 'Jupiter in Kendra from Moon. Brings wisdom, fame, and lasting reputation.'), effect: t('guides.kundli.yogas.gajaKesari.effect', 'Beneficial') },
    { name: t('guides.kundli.yogas.budhaditya.name', 'Budhaditya Yoga'), description: t('guides.kundli.yogas.budhaditya.description', 'Sun and Mercury conjunction. Enhances intelligence, communication, and analytical abilities.'), effect: t('guides.kundli.yogas.budhaditya.effect', 'Beneficial') },
    { name: t('guides.kundli.yogas.chandraMangal.name', 'Chandra-Mangal Yoga'), description: t('guides.kundli.yogas.chandraMangal.description', 'Moon and Mars conjunction or mutual aspect. Can bring wealth but also emotional intensity.'), effect: t('guides.kundli.yogas.chandraMangal.effect', 'Mixed') },
    { name: t('guides.kundli.yogas.vipreetRaj.name', 'Vipreet Raj Yoga'), description: t('guides.kundli.yogas.vipreetRaj.description', 'Lords of 6th, 8th, or 12th houses placed in each other\'s houses. Turns adversity into advantage.'), effect: t('guides.kundli.yogas.vipreetRaj.effect', 'Beneficial') },
    { name: t('guides.kundli.yogas.kaalSarp.name', 'Kaal Sarp Dosha'), description: t('guides.kundli.yogas.kaalSarp.description', 'All planets hemmed between Rahu and Ketu. Can cause struggles but also spiritual growth.'), effect: t('guides.kundli.yogas.kaalSarp.effect', 'Challenging') },
    { name: t('guides.kundli.yogas.mangalDosha.name', 'Mangal Dosha'), description: t('guides.kundli.yogas.mangalDosha.description', 'Mars in 1st, 2nd, 4th, 7th, 8th, or 12th house. Affects marriage; remedies available.'), effect: t('guides.kundli.yogas.mangalDosha.effect', 'Challenging') },
  ];

  const faqs = [
    {
      question: t('guides.kundli.faqs.q1.question', 'What information do I need to generate my Kundli?'),
      answer: t('guides.kundli.faqs.q1.answer', 'To generate an accurate Kundli, you need three essential pieces of information: 1) Exact date of birth, 2) Precise time of birth (even minutes matter), and 3) Place of birth (for calculating the correct Ascendant). The birth time is crucial as the Ascendant changes approximately every 2 hours, significantly affecting the entire chart interpretation.'),
    },
    {
      question: t('guides.kundli.faqs.q2.question', 'Why is birth time so important in Kundli?'),
      answer: t('guides.kundli.faqs.q2.answer', 'Birth time determines your Ascendant (Lagna), which is the foundation of your entire chart. The Ascendant sets the house positions for all planets and defines which houses they rule. Even a few minutes difference can change your Ascendant, Moon Nakshatra pada, and planetary house placements, leading to different predictions.'),
    },
    {
      question: t('guides.kundli.faqs.q3.question', 'What if I don\'t know my exact birth time?'),
      answer: t('guides.kundli.faqs.q3.answer', 'If you don\'t know your exact birth time, astrologers can perform \'birth time rectification\' using significant life events. Alternatively, a Moon chart (Chandra Kundli) or Sun chart (Surya Kundli) can be used, though they\'re less precise. Some astrologers also use Prashna Kundli (horary chart) for specific questions.'),
    },
    {
      question: t('guides.kundli.faqs.q4.question', 'What is the difference between Lagna Chart and Moon Chart?'),
      answer: t('guides.kundli.faqs.q4.answer', 'The Lagna Chart (D-1) uses the Ascendant as the first house and is the primary chart for overall life analysis. The Moon Chart (Chandra Kundli) places the Moon sign as the first house and is used for mental/emotional analysis and in South Indian traditions. Both are important and often analyzed together.'),
    },
    {
      question: t('guides.kundli.faqs.q5.question', 'How do I know if a planet is strong or weak in my chart?'),
      answer: t('guides.kundli.faqs.q5.answer', 'A planet\'s strength depends on multiple factors: 1) Sign placement (exalted, own sign, friendly, enemy, debilitated), 2) House placement (Kendra, Trikona, Dusthana), 3) Aspects from benefics or malefics, 4) Conjunctions, 5) Nakshatra lord, and 6) Shadbala (six-fold strength calculation). A comprehensive analysis considers all these factors.'),
    },
    {
      question: t('guides.kundli.faqs.q6.question', 'What are divisional charts (Vargas)?'),
      answer: t('guides.kundli.faqs.q6.answer', 'Divisional charts are derived charts that provide detailed analysis of specific life areas. Important ones include: D-9 (Navamsa) for marriage and dharma, D-10 (Dasamsa) for career, D-7 (Saptamsa) for children, D-4 (Chaturthamsa) for property, and D-12 (Dwadasamsa) for parents. The D-1 (Rashi) and D-9 are most commonly used.'),
    },
    {
      question: t('guides.kundli.faqs.q7.question', 'How accurate are online Kundli generators?'),
      answer: t('guides.kundli.faqs.q7.answer', 'Online Kundli generators are mathematically accurate for calculating planetary positions using Swiss Ephemeris or similar astronomical data. However, interpretation requires human expertise. Use online tools for generating the chart, but consult experienced astrologers for detailed analysis and predictions.'),
    },
    {
      question: t('guides.kundli.faqs.q8.question', 'Can Kundli predictions be changed?'),
      answer: t('guides.kundli.faqs.q8.answer', 'Vedic astrology believes in karma and free will working together. While the Kundli shows karmic tendencies and probable outcomes, remedial measures (gemstones, mantras, charity, lifestyle changes) can mitigate negative effects and enhance positive ones. Your choices and efforts within the karmic framework can modify outcomes.'),
    },
  ];
  return (
    <article className="py-12 lg:py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Badge className="mb-4 bg-amber-100 text-amber-800">{t('guides.badge', 'Complete Guide')}</Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {t('guides.kundli.title', 'Kundli Birth Chart Analysis: Complete Guide to Reading Your Horoscope')}
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            {t('guides.kundli.subtitle', 'Master the art of Kundli interpretation with this comprehensive guide. Learn how to analyze houses, planets, aspects, yogas, and dashas to unlock the secrets of your birth chart.')}
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {t('guides.kundli.readTime', '20 min read')}
            </span>
            <span>{t('guides.kundli.updated', 'Updated: January 2025')}</span>
          </div>
        </div>

        <Card className="mb-8 bg-amber-50 border-amber-200">
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">{t('guides.kundli.quickSummary.title', 'Quick Summary')}</h2>
            <p className="text-gray-700 mb-4">
              {t('guides.kundli.quickSummary.content', 'A Kundli (Janam Kundli) is your cosmic blueprint showing planetary positions at birth. It consists of 12 houses representing different life areas, 9 planets (Navagrahas) indicating various influences, and their interactions through aspects and yogas. Understanding your Kundli helps you navigate life decisions, relationships, career, and spiritual growth.')}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" asChild>
                <Link href="/tools/kundli-calculator">{t('guides.kundli.generateYourKundli', 'Generate Your Kundli')}</Link>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <Link href="/consultation">{t('guides.kundli.consultExpert', 'Consult an Expert')}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('guides.kundli.tableOfContents', 'Table of Contents')}</h2>
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
            {t('guides.kundli.sections.whatIsKundli.title', '1. What is a Kundli?')}
          </h2>
          <p className="text-gray-700 mb-4">
            {t('guides.kundli.sections.whatIsKundli.para1', 'A Kundli, also known as Janam Kundli, Janma Patri, or birth chart, is a celestial map that captures the exact positions of the Sun, Moon, planets, and other astronomical points at the precise moment and location of your birth. This cosmic snapshot serves as the foundation for all Vedic astrological analysis and predictions.')}
          </p>
          <p className="text-gray-700 mb-4">
            {t('guides.kundli.sections.whatIsKundli.para2', 'The word "Kundli" comes from the Sanskrit word "Kundala," meaning coil or circle, referring to the circular representation of the zodiac. In Vedic astrology, the Kundli is considered a karmic blueprint that reveals your past life impressions (samskaras), present life tendencies, and future possibilities.')}
          </p>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <Card className="border-amber-100">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sun className="w-5 h-5 text-amber-600" />
                  <h3 className="font-semibold">{t('guides.kundli.sections.northIndianStyle', 'North Indian Style')}</h3>
                </div>
                <p className="text-sm text-gray-600">
                  {t('guides.kundli.sections.northIndianStyleDesc', 'Diamond-shaped chart with fixed house positions. The Ascendant is always at the top. Signs rotate based on the Ascendant sign.')}
                </p>
              </CardContent>
            </Card>
            <Card className="border-amber-100">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Moon className="w-5 h-5 text-amber-600" />
                  <h3 className="font-semibold">{t('guides.kundli.sections.southIndianStyle', 'South Indian Style')}</h3>
                </div>
                <p className="text-sm text-gray-600">
                  {t('guides.kundli.sections.southIndianStyleDesc', 'Square chart with fixed sign positions. Signs are always in the same boxes. The Ascendant is marked, and houses are counted from there.')}
                </p>
              </CardContent>
            </Card>
          </div>
          <p className="text-gray-700">
            {t('guides.kundli.sections.bothStylesNote', 'Both styles contain the same information; the difference is only in presentation. North Indian style is more common in North India, while South Indian style is prevalent in South India and among many Western Vedic astrologers.')}
          </p>
        </section>

        <section id="components" className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            {t('guides.kundli.sections.components.title', '2. Components of a Birth Chart')}
          </h2>
          <p className="text-gray-700 mb-4">
            {t('guides.kundli.sections.components.intro', 'A complete Kundli consists of several interconnected components that work together to provide a comprehensive picture of your life:')}
          </p>
          <div className="space-y-4 mb-4">
            <Card className="border-l-4 border-l-amber-500">
              <CardContent className="pt-4">
                <h3 className="font-semibold text-gray-900 mb-2">{t('guides.kundli.sections.components.houses.title', '12 Houses (Bhavas)')}</h3>
                <p className="text-gray-600">
                  {t('guides.kundli.sections.components.houses.desc', 'Represent different areas of life such as self, wealth, siblings, home, children, health, marriage, transformation, fortune, career, gains, and spirituality.')}
                </p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-orange-500">
              <CardContent className="pt-4">
                <h3 className="font-semibold text-gray-900 mb-2">{t('guides.kundli.sections.components.signs.title', '12 Signs (Rashis)')}</h3>
                <p className="text-gray-600">
                  {t('guides.kundli.sections.components.signs.desc', 'The zodiac signs from Aries to Pisces that occupy the houses and color the expression of planets placed in them.')}
                </p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-yellow-500">
              <CardContent className="pt-4">
                <h3 className="font-semibold text-gray-900 mb-2">{t('guides.kundli.sections.components.planets.title', '9 Planets (Grahas)')}</h3>
                <p className="text-gray-600">
                  {t('guides.kundli.sections.components.planets.desc', 'Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, and Ketu - each representing different aspects of life and consciousness.')}
                </p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="pt-4">
                <h3 className="font-semibold text-gray-900 mb-2">{t('guides.kundli.sections.components.nakshatras.title', '27 Nakshatras')}</h3>
                <p className="text-gray-600">
                  {t('guides.kundli.sections.components.nakshatras.desc', 'Lunar mansions that provide deeper insights into planetary placements and are crucial for Dasha calculations and muhurta selection.')}
                </p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="pt-4">
                <h3 className="font-semibold text-gray-900 mb-2">{t('guides.kundli.sections.components.ascendant.title', 'Ascendant (Lagna)')}</h3>
                <p className="text-gray-600">
                  {t('guides.kundli.sections.components.ascendant.desc', 'The rising sign at the time of birth, which becomes the first house and sets the framework for the entire chart interpretation.')}
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="houses" className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            {t('guides.kundli.sections.houses.title', '3. The 12 Houses Explained')}
          </h2>
          <p className="text-gray-700 mb-6">
            {t('guides.kundli.sections.houses.intro', 'Each house in the Kundli governs specific areas of life. Understanding house significations is fundamental to chart interpretation:')}
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
              <h3 className="font-semibold text-gray-900 mb-2">{t('guides.kundli.houseClassifications.title', 'House Classifications')}</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p><strong>{t('guides.kundli.houseClassifications.kendra', 'Kendra (Angular): 1, 4, 7, 10 - Most powerful positions')}</strong></p>
                  <p><strong>{t('guides.kundli.houseClassifications.trikona', 'Trikona (Trine): 1, 5, 9 - Most auspicious houses')}</strong></p>
                </div>
                <div>
                  <p><strong>{t('guides.kundli.houseClassifications.dusthana', 'Dusthana (Difficult): 6, 8, 12 - Challenging houses')}</strong></p>
                  <p><strong>{t('guides.kundli.houseClassifications.upachaya', 'Upachaya (Growth): 3, 6, 10, 11 - Improve over time')}</strong></p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section id="planets" className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            {t('guides.kundli.sections.planets.title', '4. Planetary Significations')}
          </h2>
          <p className="text-gray-700 mb-6">
            {t('guides.kundli.sections.planets.intro', 'Each planet (Graha) represents specific aspects of life and consciousness. Understanding their karakatvas (significations) is essential for accurate interpretation:')}
          </p>
          <div className="space-y-4">
            {planets.map((planet) => (
              <Card key={planet.name} className="border-amber-100">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{planet.name}</h3>
                    <Badge className={planet.nature === t('guides.kundli.planets.benefic', 'Benefic') ? "bg-green-100 text-green-800" : planet.nature === t('guides.kundli.planets.malefic', 'Malefic') ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"}>
                      {planet.nature}
                    </Badge>
                  </div>
                  <p className="text-gray-600 text-sm mb-3"><strong>{t('guides.kundli.planets.signifies', 'Signifies:')}</strong> {planet.karakatva}</p>
                  <div className="grid md:grid-cols-2 gap-2 text-sm">
                    <div className="bg-green-50 p-2 rounded">
                      <strong className="text-green-700">{t('guides.kundli.planets.whenStrong', 'When Strong:')}</strong> {planet.strong}
                    </div>
                    <div className="bg-red-50 p-2 rounded">
                      <strong className="text-red-700">{t('guides.kundli.planets.whenWeak', 'When Weak:')}</strong> {planet.weak}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section id="aspects" className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            {t('guides.kundli.sections.aspects.title', '5. Planetary Aspects (Drishti)')}
          </h2>
          <p className="text-gray-700 mb-4">
            {t('guides.kundli.sections.aspects.intro', 'In Vedic astrology, planets cast aspects (Drishti) on other planets and houses, influencing them. Unlike Western astrology where aspects are based on degrees, Vedic aspects are house-based:')}
          </p>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <Card className="border-amber-100">
              <CardContent className="pt-4">
                <h3 className="font-semibold text-gray-900 mb-2">{t('guides.kundli.aspects.allPlanets.title', 'All Planets')}</h3>
                <p className="text-gray-600 text-sm">
                  {t('guides.kundli.aspects.allPlanets.desc', 'Every planet aspects the 7th house from itself (opposite house) with full strength.')}
                </p>
              </CardContent>
            </Card>
            <Card className="border-amber-100">
              <CardContent className="pt-4">
                <h3 className="font-semibold text-gray-900 mb-2">{t('guides.kundli.aspects.mars.title', 'Mars Special Aspects')}</h3>
                <p className="text-gray-600 text-sm">
                  {t('guides.kundli.aspects.mars.desc', 'Mars additionally aspects the 4th and 8th houses from itself with full strength.')}
                </p>
              </CardContent>
            </Card>
            <Card className="border-amber-100">
              <CardContent className="pt-4">
                <h3 className="font-semibold text-gray-900 mb-2">{t('guides.kundli.aspects.jupiter.title', 'Jupiter Special Aspects')}</h3>
                <p className="text-gray-600 text-sm">
                  {t('guides.kundli.aspects.jupiter.desc', 'Jupiter additionally aspects the 5th and 9th houses from itself with full strength.')}
                </p>
              </CardContent>
            </Card>
            <Card className="border-amber-100">
              <CardContent className="pt-4">
                <h3 className="font-semibold text-gray-900 mb-2">{t('guides.kundli.aspects.saturn.title', 'Saturn Special Aspects')}</h3>
                <p className="text-gray-600 text-sm">
                  {t('guides.kundli.aspects.saturn.desc', 'Saturn additionally aspects the 3rd and 10th houses from itself with full strength.')}
                </p>
              </CardContent>
            </Card>
          </div>
          <p className="text-gray-700">
            {t('guides.kundli.aspects.rahuKetu', 'Rahu and Ketu also have special aspects similar to Jupiter and Saturn respectively, though some astrologers debate their aspect strength. Aspects from benefics (Jupiter, Venus, well-placed Mercury and Moon) are protective, while aspects from malefics (Saturn, Mars, Rahu, Ketu, Sun) can create challenges.')}
          </p>
        </section>

        <section id="yogas" className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            {t('guides.kundli.sections.yogas.title', '6. Important Yogas')}
          </h2>
          <p className="text-gray-700 mb-6">
            {t('guides.kundli.sections.yogas.intro', 'Yogas are specific planetary combinations that produce particular results. Hundreds of yogas are described in classical texts. Here are some important ones:')}
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
            {t('guides.kundli.sections.dashas.title', '7. Dasha Systems')}
          </h2>
          <p className="text-gray-700 mb-4">
            {t('guides.kundli.sections.dashas.intro', 'Dashas are planetary periods that determine when the promises of the birth chart will manifest. The most widely used system is Vimshottari Dasha:')}
          </p>
          <Card className="mb-4 border-amber-200">
            <CardContent className="pt-4">
              <h3 className="font-semibold text-gray-900 mb-3">{t('guides.kundli.dashas.vimshottari', 'Vimshottari Dasha Periods')}</h3>
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
                {t('guides.kundli.dashas.total', "Total: 120 years. The starting Dasha is determined by Moon's Nakshatra at birth.")}
              </p>
            </CardContent>
          </Card>
          <p className="text-gray-700">
            {t('guides.kundli.dashas.subdivision', "Each Mahadasha (major period) is subdivided into Antardashas (sub-periods), which are further divided into Pratyantardashas. The results depend on the planet's placement, lordship, aspects, and conjunctions in the birth chart.")}
          </p>
        </section>

        <section id="reading-chart" className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            {t('guides.kundli.sections.readingChart.title', '8. How to Read Your Chart')}
          </h2>
          <p className="text-gray-700 mb-4">
            {t('guides.kundli.sections.readingChart.intro', 'Follow these steps for a systematic approach to Kundli analysis:')}
          </p>
          <div className="space-y-3">
            {[
              t('guides.kundli.readingSteps.step1', 'Identify the Ascendant (Lagna) - This sets the framework for the entire chart'),
              t('guides.kundli.readingSteps.step2', 'Note the Moon sign and Nakshatra - Important for mind, emotions, and Dasha calculation'),
              t('guides.kundli.readingSteps.step3', 'Analyze the Sun sign - Reveals soul purpose and father-related matters'),
              t('guides.kundli.readingSteps.step4', 'Check planetary strengths - Exaltation, debilitation, own sign, friendly/enemy signs'),
              t('guides.kundli.readingSteps.step5', 'Identify house lords and their placements - Where does each house lord sit?'),
              t('guides.kundli.readingSteps.step6', 'Look for yogas - Both beneficial and challenging combinations'),
              t('guides.kundli.readingSteps.step7', 'Analyze aspects - Which planets are influencing which houses?'),
              t('guides.kundli.readingSteps.step8', 'Check the current Dasha-Antardasha - What planetary period is active?'),
              t('guides.kundli.readingSteps.step9', 'Examine divisional charts - D-9 for marriage, D-10 for career, etc.'),
              t('guides.kundli.readingSteps.step10', 'Consider transits - Current planetary positions over natal chart'),
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
            {t('guides.kundli.sections.commonCombinations.title', '9. Common Planetary Combinations')}
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-green-200">
              <CardContent className="pt-4">
                <h3 className="font-semibold text-green-700 mb-2">{t('guides.kundli.combinations.favorable.title', 'Favorable Combinations')}</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• {t('guides.kundli.combinations.favorable.item1', 'Jupiter in Kendra or Trikona')}</li>
                  <li>• {t('guides.kundli.combinations.favorable.item2', 'Venus in own sign or exalted')}</li>
                  <li>• {t('guides.kundli.combinations.favorable.item3', 'Strong Moon (Shukla Paksha)')}</li>
                  <li>• {t('guides.kundli.combinations.favorable.item4', 'Benefics in Kendras')}</li>
                  <li>• {t('guides.kundli.combinations.favorable.item5', '9th and 10th lords together')}</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="border-red-200">
              <CardContent className="pt-4">
                <h3 className="font-semibold text-red-700 mb-2">{t('guides.kundli.combinations.challenging.title', 'Challenging Combinations')}</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• {t('guides.kundli.combinations.challenging.item1', 'Saturn-Mars conjunction')}</li>
                  <li>• {t('guides.kundli.combinations.challenging.item2', 'Rahu-Moon conjunction (Grahan Yoga)')}</li>
                  <li>• {t('guides.kundli.combinations.challenging.item3', 'Debilitated planets in Kendras')}</li>
                  <li>• {t('guides.kundli.combinations.challenging.item4', '6th, 8th, 12th lords in Kendras')}</li>
                  <li>• {t('guides.kundli.combinations.challenging.item5', 'Combust planets (too close to Sun)')}</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="faq" className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            {t('guides.kundli.sections.faq.title', '10. Frequently Asked Questions')}
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
            <h2 className="text-2xl font-bold mb-2">{t('guides.kundli.cta.title', 'Ready to Analyze Your Kundli?')}</h2>
            <p className="mb-4 text-amber-100">
              {t('guides.kundli.cta.description', 'Generate your free birth chart or consult with our expert astrologers for personalized guidance.')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-amber-600 hover:bg-amber-50" asChild>
                <Link href="/tools/kundli-calculator">
                  {t('guides.kundli.cta.generateKundli', 'Generate Free Kundli')}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button size="lg" className="bg-white text-amber-600 hover:bg-amber-50" asChild>
                <Link href="/consultation">{t('guides.kundli.cta.expertConsultation', 'Expert Consultation')}</Link>
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
