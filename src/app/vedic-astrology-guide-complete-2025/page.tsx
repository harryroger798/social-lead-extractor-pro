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
import { ArrowRight, BookOpen, Star, Clock, CheckCircle } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function VedicAstrologyGuidePage() {
  const { t } = useLanguage();

  const tableOfContents = [
    { id: "introduction", title: t('guides.vedicAstrology.toc.introduction', 'Introduction to Vedic Astrology') },
    { id: "history", title: t('guides.vedicAstrology.toc.history', 'History and Origins') },
    { id: "vs-western", title: t('guides.vedicAstrology.toc.vsWestern', 'Vedic vs Western Astrology') },
    { id: "zodiac-signs", title: t('guides.vedicAstrology.toc.zodiacSigns', 'The 12 Zodiac Signs (Rashis)') },
    { id: "planets", title: t('guides.vedicAstrology.toc.planets', 'The 9 Planets (Navagrahas)') },
    { id: "houses", title: t('guides.vedicAstrology.toc.houses', 'The 12 Houses (Bhavas)') },
    { id: "nakshatras", title: t('guides.vedicAstrology.toc.nakshatras', 'The 27 Nakshatras') },
    { id: "kundli", title: t('guides.vedicAstrology.toc.kundli', 'Understanding Your Kundli') },
    { id: "doshas", title: t('guides.vedicAstrology.toc.doshas', 'Doshas and Their Effects') },
    { id: "remedies", title: t('guides.vedicAstrology.toc.remedies', 'Astrological Remedies') },
    { id: "faq", title: t('guides.vedicAstrology.toc.faq', 'Frequently Asked Questions') },
  ];

  const zodiacSigns = [
    { name: t('guides.vedicAstrology.zodiac.mesha', 'Mesha (Aries)'), element: t('guides.vedicAstrology.element.fire', 'Fire'), ruler: t('guides.vedicAstrology.ruler.mars', 'Mars'), quality: t('guides.vedicAstrology.quality.cardinal', 'Cardinal') },
    { name: t('guides.vedicAstrology.zodiac.vrishabha', 'Vrishabha (Taurus)'), element: t('guides.vedicAstrology.element.earth', 'Earth'), ruler: t('guides.vedicAstrology.ruler.venus', 'Venus'), quality: t('guides.vedicAstrology.quality.fixed', 'Fixed') },
    { name: t('guides.vedicAstrology.zodiac.mithuna', 'Mithuna (Gemini)'), element: t('guides.vedicAstrology.element.air', 'Air'), ruler: t('guides.vedicAstrology.ruler.mercury', 'Mercury'), quality: t('guides.vedicAstrology.quality.mutable', 'Mutable') },
    { name: t('guides.vedicAstrology.zodiac.karka', 'Karka (Cancer)'), element: t('guides.vedicAstrology.element.water', 'Water'), ruler: t('guides.vedicAstrology.ruler.moon', 'Moon'), quality: t('guides.vedicAstrology.quality.cardinal', 'Cardinal') },
    { name: t('guides.vedicAstrology.zodiac.simha', 'Simha (Leo)'), element: t('guides.vedicAstrology.element.fire', 'Fire'), ruler: t('guides.vedicAstrology.ruler.sun', 'Sun'), quality: t('guides.vedicAstrology.quality.fixed', 'Fixed') },
    { name: t('guides.vedicAstrology.zodiac.kanya', 'Kanya (Virgo)'), element: t('guides.vedicAstrology.element.earth', 'Earth'), ruler: t('guides.vedicAstrology.ruler.mercury', 'Mercury'), quality: t('guides.vedicAstrology.quality.mutable', 'Mutable') },
    { name: t('guides.vedicAstrology.zodiac.tula', 'Tula (Libra)'), element: t('guides.vedicAstrology.element.air', 'Air'), ruler: t('guides.vedicAstrology.ruler.venus', 'Venus'), quality: t('guides.vedicAstrology.quality.cardinal', 'Cardinal') },
    { name: t('guides.vedicAstrology.zodiac.vrishchika', 'Vrishchika (Scorpio)'), element: t('guides.vedicAstrology.element.water', 'Water'), ruler: t('guides.vedicAstrology.ruler.mars', 'Mars'), quality: t('guides.vedicAstrology.quality.fixed', 'Fixed') },
    { name: t('guides.vedicAstrology.zodiac.dhanu', 'Dhanu (Sagittarius)'), element: t('guides.vedicAstrology.element.fire', 'Fire'), ruler: t('guides.vedicAstrology.ruler.jupiter', 'Jupiter'), quality: t('guides.vedicAstrology.quality.mutable', 'Mutable') },
    { name: t('guides.vedicAstrology.zodiac.makara', 'Makara (Capricorn)'), element: t('guides.vedicAstrology.element.earth', 'Earth'), ruler: t('guides.vedicAstrology.ruler.saturn', 'Saturn'), quality: t('guides.vedicAstrology.quality.cardinal', 'Cardinal') },
    { name: t('guides.vedicAstrology.zodiac.kumbha', 'Kumbha (Aquarius)'), element: t('guides.vedicAstrology.element.air', 'Air'), ruler: t('guides.vedicAstrology.ruler.saturn', 'Saturn'), quality: t('guides.vedicAstrology.quality.fixed', 'Fixed') },
    { name: t('guides.vedicAstrology.zodiac.meena', 'Meena (Pisces)'), element: t('guides.vedicAstrology.element.water', 'Water'), ruler: t('guides.vedicAstrology.ruler.jupiter', 'Jupiter'), quality: t('guides.vedicAstrology.quality.mutable', 'Mutable') },
  ];

  const planets = [
    { name: t('guides.vedicAstrology.planets.surya.name', 'Surya (Sun)'), nature: t('guides.vedicAstrology.planets.surya.nature', 'Malefic'), signifies: t('guides.vedicAstrology.planets.surya.signifies', 'Soul, father, authority, government'), exalted: t('guides.vedicAstrology.zodiac.mesha', 'Aries'), debilitated: t('guides.vedicAstrology.zodiac.tula', 'Libra') },
    { name: t('guides.vedicAstrology.planets.chandra.name', 'Chandra (Moon)'), nature: t('guides.vedicAstrology.planets.chandra.nature', 'Benefic'), signifies: t('guides.vedicAstrology.planets.chandra.signifies', 'Mind, mother, emotions, public'), exalted: t('guides.vedicAstrology.zodiac.vrishabha', 'Taurus'), debilitated: t('guides.vedicAstrology.zodiac.vrishchika', 'Scorpio') },
    { name: t('guides.vedicAstrology.planets.mangal.name', 'Mangal (Mars)'), nature: t('guides.vedicAstrology.planets.mangal.nature', 'Malefic'), signifies: t('guides.vedicAstrology.planets.mangal.signifies', 'Energy, courage, siblings, property'), exalted: t('guides.vedicAstrology.zodiac.makara', 'Capricorn'), debilitated: t('guides.vedicAstrology.zodiac.karka', 'Cancer') },
    { name: t('guides.vedicAstrology.planets.budha.name', 'Budha (Mercury)'), nature: t('guides.vedicAstrology.planets.budha.nature', 'Neutral'), signifies: t('guides.vedicAstrology.planets.budha.signifies', 'Intelligence, communication, business'), exalted: t('guides.vedicAstrology.zodiac.kanya', 'Virgo'), debilitated: t('guides.vedicAstrology.zodiac.meena', 'Pisces') },
    { name: t('guides.vedicAstrology.planets.guru.name', 'Guru (Jupiter)'), nature: t('guides.vedicAstrology.planets.guru.nature', 'Benefic'), signifies: t('guides.vedicAstrology.planets.guru.signifies', 'Wisdom, children, fortune, spirituality'), exalted: t('guides.vedicAstrology.zodiac.karka', 'Cancer'), debilitated: t('guides.vedicAstrology.zodiac.makara', 'Capricorn') },
    { name: t('guides.vedicAstrology.planets.shukra.name', 'Shukra (Venus)'), nature: t('guides.vedicAstrology.planets.shukra.nature', 'Benefic'), signifies: t('guides.vedicAstrology.planets.shukra.signifies', 'Love, marriage, luxury, arts'), exalted: t('guides.vedicAstrology.zodiac.meena', 'Pisces'), debilitated: t('guides.vedicAstrology.zodiac.kanya', 'Virgo') },
    { name: t('guides.vedicAstrology.planets.shani.name', 'Shani (Saturn)'), nature: t('guides.vedicAstrology.planets.shani.nature', 'Malefic'), signifies: t('guides.vedicAstrology.planets.shani.signifies', 'Karma, discipline, longevity, hardship'), exalted: t('guides.vedicAstrology.zodiac.tula', 'Libra'), debilitated: t('guides.vedicAstrology.zodiac.mesha', 'Aries') },
    { name: t('guides.vedicAstrology.planets.rahu.name', 'Rahu (North Node)'), nature: t('guides.vedicAstrology.planets.rahu.nature', 'Malefic'), signifies: t('guides.vedicAstrology.planets.rahu.signifies', 'Obsession, foreign, unconventional'), exalted: t('guides.vedicAstrology.zodiac.vrishabha', 'Taurus'), debilitated: t('guides.vedicAstrology.zodiac.vrishchika', 'Scorpio') },
    { name: t('guides.vedicAstrology.planets.ketu.name', 'Ketu (South Node)'), nature: t('guides.vedicAstrology.planets.ketu.nature', 'Malefic'), signifies: t('guides.vedicAstrology.planets.ketu.signifies', 'Spirituality, detachment, past karma'), exalted: t('guides.vedicAstrology.zodiac.vrishchika', 'Scorpio'), debilitated: t('guides.vedicAstrology.zodiac.vrishabha', 'Taurus') },
  ];

  const houses = [
    { number: 1, name: t('guides.vedicAstrology.houses.house1.name', 'Lagna (Ascendant)'), signifies: t('guides.vedicAstrology.houses.house1.signifies', 'Self, personality, physical body, health') },
    { number: 2, name: t('guides.vedicAstrology.houses.house2.name', 'Dhana Bhava'), signifies: t('guides.vedicAstrology.houses.house2.signifies', 'Wealth, family, speech, food habits') },
    { number: 3, name: t('guides.vedicAstrology.houses.house3.name', 'Sahaja Bhava'), signifies: t('guides.vedicAstrology.houses.house3.signifies', 'Siblings, courage, short travels, communication') },
    { number: 4, name: t('guides.vedicAstrology.houses.house4.name', 'Sukha Bhava'), signifies: t('guides.vedicAstrology.houses.house4.signifies', 'Mother, home, vehicles, emotional peace') },
    { number: 5, name: t('guides.vedicAstrology.houses.house5.name', 'Putra Bhava'), signifies: t('guides.vedicAstrology.houses.house5.signifies', 'Children, creativity, intelligence, romance') },
    { number: 6, name: t('guides.vedicAstrology.houses.house6.name', 'Ari Bhava'), signifies: t('guides.vedicAstrology.houses.house6.signifies', 'Enemies, diseases, debts, service') },
    { number: 7, name: t('guides.vedicAstrology.houses.house7.name', 'Kalatra Bhava'), signifies: t('guides.vedicAstrology.houses.house7.signifies', 'Marriage, partnerships, business, public dealings') },
    { number: 8, name: t('guides.vedicAstrology.houses.house8.name', 'Ayur Bhava'), signifies: t('guides.vedicAstrology.houses.house8.signifies', 'Longevity, transformation, inheritance, occult') },
    { number: 9, name: t('guides.vedicAstrology.houses.house9.name', 'Dharma Bhava'), signifies: t('guides.vedicAstrology.houses.house9.signifies', 'Fortune, father, religion, higher education') },
    { number: 10, name: t('guides.vedicAstrology.houses.house10.name', 'Karma Bhava'), signifies: t('guides.vedicAstrology.houses.house10.signifies', 'Career, reputation, authority, achievements') },
    { number: 11, name: t('guides.vedicAstrology.houses.house11.name', 'Labha Bhava'), signifies: t('guides.vedicAstrology.houses.house11.signifies', 'Gains, income, friends, aspirations') },
    { number: 12, name: t('guides.vedicAstrology.houses.house12.name', 'Vyaya Bhava'), signifies: t('guides.vedicAstrology.houses.house12.signifies', 'Losses, expenses, foreign lands, liberation') },
  ];

  const faqs = [
    {
      question: t('guides.vedicAstrology.faq.q1', 'What is Vedic Astrology?'),
      answer: t('guides.vedicAstrology.faq.a1', 'Vedic Astrology, also known as Jyotish Shastra, is an ancient Indian system of astrology that originated over 5,000 years ago. It uses the sidereal zodiac (based on fixed star positions) and incorporates unique concepts like Nakshatras (lunar mansions), Dashas (planetary periods), and detailed divisional charts to provide comprehensive life predictions.'),
    },
    {
      question: t('guides.vedicAstrology.faq.q2', 'How is Vedic Astrology different from Western Astrology?'),
      answer: t('guides.vedicAstrology.faq.a2', 'The main differences are: 1) Vedic uses the sidereal zodiac while Western uses tropical zodiac (about 24 degrees difference), 2) Vedic emphasizes the Moon sign while Western focuses on Sun sign, 3) Vedic uses 27 Nakshatras for detailed analysis, 4) Vedic has unique predictive systems like Vimshottari Dasha, and 5) Vedic astrology is more deterministic with emphasis on karma and remedies.'),
    },
    {
      question: t('guides.vedicAstrology.faq.q3', 'What is a Kundli or Birth Chart?'),
      answer: t('guides.vedicAstrology.faq.a3', 'A Kundli (also called Janam Kundli or birth chart) is a map of the sky at the exact moment and location of your birth. It shows the positions of the Sun, Moon, and planets in the 12 zodiac signs and 12 houses. This chart is the foundation of all Vedic astrological predictions and reveals information about your personality, career, relationships, health, and life events.'),
    },
    {
      question: t('guides.vedicAstrology.faq.q4', 'What are Nakshatras?'),
      answer: t('guides.vedicAstrology.faq.a4', "Nakshatras are 27 lunar mansions or star constellations that the Moon passes through during its monthly cycle. Each Nakshatra spans 13°20' of the zodiac and has unique characteristics, ruling deity, and planetary lord. Your birth Nakshatra (based on Moon's position) reveals deep insights about your personality, behavior patterns, and life path."),
    },
    {
      question: t('guides.vedicAstrology.faq.q5', 'What is Mangal Dosha (Manglik)?'),
      answer: t('guides.vedicAstrology.faq.a5', "Mangal Dosha occurs when Mars is placed in the 1st, 2nd, 4th, 7th, 8th, or 12th house from the Ascendant, Moon, or Venus in a birth chart. It's believed to cause delays or difficulties in marriage. However, the intensity varies based on the sign, aspects, and other planetary combinations. Many remedies exist to neutralize its effects."),
    },
    {
      question: t('guides.vedicAstrology.faq.q6', 'How accurate is Vedic Astrology?'),
      answer: t('guides.vedicAstrology.faq.a6', "Vedic Astrology's accuracy depends on: 1) Precise birth time (even minutes matter), 2) Correct birth location, 3) Astrologer's expertise and experience, and 4) Proper analysis of multiple factors. When these conditions are met, Vedic astrology can provide remarkably accurate insights. However, it shows tendencies and probabilities, not absolute certainties, as free will also plays a role."),
    },
    {
      question: t('guides.vedicAstrology.faq.q7', 'Can astrology predict the future?'),
      answer: t('guides.vedicAstrology.faq.a7', 'Vedic astrology can indicate likely trends, opportunities, and challenges based on planetary periods (Dashas) and transits. It shows the karmic blueprint and probable outcomes if current patterns continue. However, astrology is best used as a guidance tool rather than absolute prediction, as human choices and efforts can modify outcomes within the karmic framework.'),
    },
    {
      question: t('guides.vedicAstrology.faq.q8', 'What are astrological remedies?'),
      answer: t('guides.vedicAstrology.faq.a8', 'Astrological remedies are prescribed actions to strengthen weak planets or reduce malefic effects. Common remedies include: gemstone wearing, mantra chanting, charity (dana), fasting on specific days, wearing specific colors, performing pujas, and lifestyle modifications. The effectiveness depends on faith, consistency, and choosing appropriate remedies based on individual charts.'),
    },
  ];
  return (
    <article className="py-12 lg:py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Badge className="mb-4 bg-amber-100 text-amber-800">{t('guides.badge', 'Complete Guide')}</Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {t('guides.vedicAstrology.title', 'Complete Vedic Astrology Guide 2025: Master Jyotish Shastra')}
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            {t('guides.vedicAstrology.subtitle', 'Your comprehensive resource for understanding Vedic astrology, from basic concepts to advanced techniques. Learn about Kundli interpretation, Nakshatras, planetary influences, and effective remedies.')}
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {t('guides.vedicAstrology.readTime', '25 min read')}
            </span>
            <span>{t('guides.vedicAstrology.updated', 'Updated: January 2025')}</span>
          </div>
        </div>

        <Card className="mb-8 bg-amber-50 border-amber-200">
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">{t('guides.vedicAstrology.tldr.title', 'TL;DR - Quick Summary')}</h2>
            <p className="text-gray-700 mb-4">
              {t('guides.vedicAstrology.tldr.content', 'Vedic Astrology (Jyotish) is an ancient Indian system using the sidereal zodiac, 27 Nakshatras, and 9 planets to analyze birth charts (Kundli). Unlike Western astrology, it emphasizes the Moon sign and uses unique predictive systems like Vimshottari Dasha. Key components include 12 houses representing life areas, planetary strengths/weaknesses, and remedial measures for challenging placements.')}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" asChild>
                <Link href="/tools/kundli-calculator">{t('guides.vedicAstrology.cta.generateKundli', 'Generate Your Kundli')}</Link>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <Link href="/tools/nakshatra-finder">{t('guides.vedicAstrology.cta.findNakshatra', 'Find Your Nakshatra')}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('guides.vedicAstrology.tableOfContents', 'Table of Contents')}</h2>
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
            {t('guides.vedicAstrology.sections.introduction.title', '1. Introduction to Vedic Astrology')}
          </h2>
          <p className="text-gray-700 mb-4">
            {t('guides.vedicAstrology.sections.introduction.p1', 'Vedic Astrology, known as Jyotish Shastra in Sanskrit (meaning "science of light"), is one of the oldest and most comprehensive astrological systems in the world. Originating in ancient India over 5,000 years ago, it forms one of the six Vedangas (limbs of the Vedas) and has been used for millennia to understand human destiny, timing of events, and spiritual growth.')}
          </p>
          <p className="text-gray-700 mb-4">
            {t('guides.vedicAstrology.sections.introduction.p2', "Unlike modern Western astrology that primarily focuses on psychological traits, Vedic astrology provides a complete framework for understanding all aspects of life including career, relationships, health, finances, and spiritual evolution. It operates on the principle that celestial bodies influence earthly events and that by understanding these influences, we can make better decisions and navigate life's challenges more effectively.")}
          </p>
          <p className="text-gray-700">
            {t('guides.vedicAstrology.sections.introduction.p3', "The foundation of Vedic astrology lies in the birth chart or Kundli, which captures the exact positions of planets at the moment of birth. This cosmic snapshot serves as a blueprint of one's karma and potential, revealing both opportunities and challenges that lie ahead.")}
          </p>
        </section>

        <section id="history" className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            {t('guides.vedicAstrology.sections.history.title', '2. History and Origins')}
          </h2>
          <p className="text-gray-700 mb-4">
            {t('guides.vedicAstrology.sections.history.p1', 'The origins of Vedic astrology trace back to the Vedic period (1500-500 BCE), with references found in the Rigveda, the oldest of the four Vedas. The sage Parashara is credited with systematizing Jyotish in his seminal work "Brihat Parashara Hora Shastra," which remains the primary reference text for Vedic astrologers today.')}
          </p>
          <p className="text-gray-700 mb-4">
            {t('guides.vedicAstrology.sections.history.p2', 'Other important contributors include Varahamihira (6th century CE), who wrote "Brihat Jataka" and "Brihat Samhita," and Jaimini, who developed an alternative predictive system. The mathematical foundations were strengthened by astronomers like Aryabhata and Brahmagupta, who calculated planetary positions with remarkable accuracy.')}
          </p>
          <p className="text-gray-700">
            {t('guides.vedicAstrology.sections.history.p3', 'Throughout history, Vedic astrology has been an integral part of Indian culture, used for determining auspicious times (muhurta) for important events, matching horoscopes for marriage, and guiding rulers in matters of state. Today, it continues to thrive both in India and globally, with millions seeking its guidance for life decisions.')}
          </p>
        </section>

        <section id="vs-western" className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            {t('guides.vedicAstrology.sections.vsWestern.title', '3. Vedic vs Western Astrology: Key Differences')}
          </h2>
          <div className="overflow-x-auto mb-6">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-amber-50">
                  <th className="border border-amber-200 px-4 py-2 text-left">{t('guides.vedicAstrology.table.aspect', 'Aspect')}</th>
                  <th className="border border-amber-200 px-4 py-2 text-left">{t('guides.vedicAstrology.table.vedic', 'Vedic Astrology')}</th>
                  <th className="border border-amber-200 px-4 py-2 text-left">{t('guides.vedicAstrology.table.western', 'Western Astrology')}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-200 px-4 py-2 font-medium">{t('guides.vedicAstrology.table.zodiacSystem', 'Zodiac System')}</td>
                  <td className="border border-gray-200 px-4 py-2">{t('guides.vedicAstrology.table.sidereal', 'Sidereal (fixed stars)')}</td>
                  <td className="border border-gray-200 px-4 py-2">{t('guides.vedicAstrology.table.tropical', 'Tropical (seasons)')}</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-200 px-4 py-2 font-medium">{t('guides.vedicAstrology.table.primaryFocus', 'Primary Focus')}</td>
                  <td className="border border-gray-200 px-4 py-2">{t('guides.vedicAstrology.table.moonSign', 'Moon sign (Rashi)')}</td>
                  <td className="border border-gray-200 px-4 py-2">{t('guides.vedicAstrology.table.sunSign', 'Sun sign')}</td>
                </tr>
                <tr>
                  <td className="border border-gray-200 px-4 py-2 font-medium">{t('guides.vedicAstrology.table.lunarMansions', 'Lunar Mansions')}</td>
                  <td className="border border-gray-200 px-4 py-2">{t('guides.vedicAstrology.table.nakshatras', '27 Nakshatras (essential)')}</td>
                  <td className="border border-gray-200 px-4 py-2">{t('guides.vedicAstrology.table.notUsed', 'Not commonly used')}</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-200 px-4 py-2 font-medium">{t('guides.vedicAstrology.table.predictiveSystem', 'Predictive System')}</td>
                  <td className="border border-gray-200 px-4 py-2">{t('guides.vedicAstrology.table.dashaSystem', 'Dasha system (planetary periods)')}</td>
                  <td className="border border-gray-200 px-4 py-2">{t('guides.vedicAstrology.table.transits', 'Transits and progressions')}</td>
                </tr>
                <tr>
                  <td className="border border-gray-200 px-4 py-2 font-medium">{t('guides.vedicAstrology.table.outerPlanets', 'Outer Planets')}</td>
                  <td className="border border-gray-200 px-4 py-2">{t('guides.vedicAstrology.table.traditional9', 'Traditional 9 planets only')}</td>
                  <td className="border border-gray-200 px-4 py-2">{t('guides.vedicAstrology.table.includesOuter', 'Includes Uranus, Neptune, Pluto')}</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-200 px-4 py-2 font-medium">{t('guides.vedicAstrology.table.remedies', 'Remedies')}</td>
                  <td className="border border-gray-200 px-4 py-2">{t('guides.vedicAstrology.table.extensive', 'Extensive (gems, mantras, rituals)')}</td>
                  <td className="border border-gray-200 px-4 py-2">{t('guides.vedicAstrology.table.limited', 'Limited focus on remedies')}</td>
                </tr>
                <tr>
                  <td className="border border-gray-200 px-4 py-2 font-medium">{t('guides.vedicAstrology.table.approach', 'Approach')}</td>
                  <td className="border border-gray-200 px-4 py-2">{t('guides.vedicAstrology.table.deterministic', 'More deterministic, karma-based')}</td>
                  <td className="border border-gray-200 px-4 py-2">{t('guides.vedicAstrology.table.psychological', 'More psychological')}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-gray-700">
            {t('guides.vedicAstrology.sections.vsWestern.conclusion', "The most significant difference is the zodiac calculation. Due to the precession of equinoxes, there's approximately a 24-degree difference between the two systems. This means your Vedic Sun sign may be different from your Western Sun sign. For example, if you're a Taurus in Western astrology, you might be an Aries in Vedic astrology.")}
          </p>
        </section>

        <section id="zodiac-signs" className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            {t('guides.vedicAstrology.sections.zodiacSigns.title', '4. The 12 Zodiac Signs (Rashis)')}
          </h2>
          <p className="text-gray-700 mb-6">
            {t('guides.vedicAstrology.sections.zodiacSigns.intro', 'The zodiac in Vedic astrology is divided into 12 equal signs of 30 degrees each, called Rashis. Each Rashi has specific characteristics, ruling planet, element, and quality that influence the planets placed within them.')}
          </p>
          <div className="overflow-x-auto mb-6">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-amber-50">
                  <th className="border border-amber-200 px-4 py-2 text-left">{t('guides.vedicAstrology.table.signSanskrit', 'Sign (Sanskrit)')}</th>
                  <th className="border border-amber-200 px-4 py-2 text-left">{t('guides.vedicAstrology.table.element', 'Element')}</th>
                  <th className="border border-amber-200 px-4 py-2 text-left">{t('guides.vedicAstrology.table.ruler', 'Ruler')}</th>
                  <th className="border border-amber-200 px-4 py-2 text-left">{t('guides.vedicAstrology.table.quality', 'Quality')}</th>
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
            {t('guides.vedicAstrology.sections.planets.title', '5. The 9 Planets (Navagrahas)')}
          </h2>
          <p className="text-gray-700 mb-6">
            {t('guides.vedicAstrology.sections.planets.intro', 'Vedic astrology uses nine celestial bodies called Navagrahas (nine planets), which include the Sun, Moon, five visible planets, and two lunar nodes (Rahu and Ketu). Each planet governs specific aspects of life and has natural benefic or malefic tendencies.')}
          </p>
          <div className="overflow-x-auto mb-6">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-amber-50">
                  <th className="border border-amber-200 px-3 py-2 text-left">{t('guides.vedicAstrology.table.planet', 'Planet')}</th>
                  <th className="border border-amber-200 px-3 py-2 text-left">{t('guides.vedicAstrology.table.nature', 'Nature')}</th>
                  <th className="border border-amber-200 px-3 py-2 text-left">{t('guides.vedicAstrology.table.signifies', 'Signifies')}</th>
                  <th className="border border-amber-200 px-3 py-2 text-left">{t('guides.vedicAstrology.table.exalted', 'Exalted')}</th>
                  <th className="border border-amber-200 px-3 py-2 text-left">{t('guides.vedicAstrology.table.debilitated', 'Debilitated')}</th>
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
            {t('guides.vedicAstrology.sections.houses.title', '6. The 12 Houses (Bhavas)')}
          </h2>
          <p className="text-gray-700 mb-6">
            {t('guides.vedicAstrology.sections.houses.intro', 'The birth chart is divided into 12 houses, each representing different areas of life. The houses are counted from the Ascendant (Lagna), which marks the eastern horizon at the time of birth. Planets placed in these houses influence the corresponding life areas.')}
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
            {t('guides.vedicAstrology.sections.nakshatras.title', '7. The 27 Nakshatras (Lunar Mansions)')}
          </h2>
          <p className="text-gray-700 mb-4">
            {t('guides.vedicAstrology.sections.nakshatras.p1', "Nakshatras are 27 lunar constellations that the Moon traverses during its monthly cycle. Each Nakshatra spans 13°20' of the zodiac and provides deeper insights than the zodiac signs alone. Your birth Nakshatra (Janma Nakshatra) is determined by the Moon's position at birth and reveals your innermost nature, emotional patterns, and life purpose.")}
          </p>
          <p className="text-gray-700 mb-4">
            {t('guides.vedicAstrology.sections.nakshatras.p2', 'Each Nakshatra has a ruling deity, planetary lord, symbol, and unique characteristics. They are extensively used in Muhurta (electional astrology), marriage compatibility (Nakshatra matching), and the Vimshottari Dasha system for timing predictions.')}
          </p>
          <div className="flex gap-4">
            <Button asChild>
              <Link href="/27-nakshatras-complete-guide-vedic-astrology">
                {t('guides.vedicAstrology.cta.nakshatraGuide', 'Complete Nakshatra Guide')}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/tools/nakshatra-finder">{t('guides.vedicAstrology.cta.findNakshatra', 'Find Your Nakshatra')}</Link>
            </Button>
          </div>
        </section>

        <section id="kundli" className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            {t('guides.vedicAstrology.sections.kundli.title', '8. Understanding Your Kundli (Birth Chart)')}
          </h2>
          <p className="text-gray-700 mb-4">
            {t('guides.vedicAstrology.sections.kundli.p1', "A Kundli or Janam Kundli is the foundational chart in Vedic astrology. It's created using three essential pieces of information: date of birth, time of birth, and place of birth. The accuracy of predictions heavily depends on the precision of birth time—even a few minutes can change the Ascendant and house positions.")}
          </p>
          <p className="text-gray-700 mb-4">
            {t('guides.vedicAstrology.sections.kundli.p2', 'The Kundli shows the positions of all nine planets in the 12 signs and 12 houses at the moment of birth. From this main chart (Rashi chart or D-1), astrologers also calculate divisional charts (Vargas) like Navamsa (D-9) for marriage, Dashamsa (D-10) for career, and others for specific life areas.')}
          </p>
          <Card className="bg-amber-50 border-amber-200 mb-4">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-gray-900 mb-2">{t('guides.vedicAstrology.sections.kundli.keyElements', 'Key Elements in a Kundli:')}</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span><strong>{t('guides.vedicAstrology.sections.kundli.ascendant', 'Ascendant (Lagna):')}</strong> {t('guides.vedicAstrology.sections.kundli.ascendantDesc', 'The rising sign at birth, determines the house positions')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span><strong>{t('guides.vedicAstrology.sections.kundli.moonSign', 'Moon Sign (Rashi):')}</strong> {t('guides.vedicAstrology.sections.kundli.moonSignDesc', 'Your emotional nature and mind')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span><strong>{t('guides.vedicAstrology.sections.kundli.sunSign', 'Sun Sign:')}</strong> {t('guides.vedicAstrology.sections.kundli.sunSignDesc', 'Your soul, ego, and life purpose')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span><strong>{t('guides.vedicAstrology.sections.kundli.planetaryPositions', 'Planetary Positions:')}</strong> {t('guides.vedicAstrology.sections.kundli.planetaryPositionsDesc', 'Where each planet is placed')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span><strong>{t('guides.vedicAstrology.sections.kundli.aspects', 'Aspects (Drishti):')}</strong> {t('guides.vedicAstrology.sections.kundli.aspectsDesc', 'How planets influence each other')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span><strong>{t('guides.vedicAstrology.sections.kundli.yogas', 'Yogas:')}</strong> {t('guides.vedicAstrology.sections.kundli.yogasDesc', 'Special planetary combinations')}</span>
                </li>
              </ul>
            </CardContent>
          </Card>
          <Button asChild>
            <Link href="/tools/kundli-calculator">
              {t('guides.vedicAstrology.cta.generateFreeKundli', 'Generate Your Free Kundli')}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </section>

        <section id="doshas" className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            {t('guides.vedicAstrology.sections.doshas.title', '9. Doshas and Their Effects')}
          </h2>
          <p className="text-gray-700 mb-4">
            {t('guides.vedicAstrology.sections.doshas.intro', "Doshas are specific planetary combinations that indicate challenges or obstacles in certain life areas. While they sound alarming, it's important to understand that most charts have some doshas, and their effects vary based on other factors. Proper analysis and remedies can significantly reduce their impact.")}
          </p>
          <div className="space-y-4 mb-6">
            <Card className="border-amber-100">
              <CardContent className="pt-4">
                <h3 className="font-semibold text-gray-900 mb-2">{t('guides.vedicAstrology.sections.doshas.mangal.title', 'Mangal Dosha (Kuja Dosha)')}</h3>
                <p className="text-gray-600 text-sm">
                  {t('guides.vedicAstrology.sections.doshas.mangal.desc', 'Occurs when Mars is in 1st, 2nd, 4th, 7th, 8th, or 12th house. Associated with delays in marriage or marital discord. Intensity varies based on sign and aspects. Can be cancelled by various factors including partner also having Mangal Dosha.')}
                </p>
              </CardContent>
            </Card>
            <Card className="border-amber-100">
              <CardContent className="pt-4">
                <h3 className="font-semibold text-gray-900 mb-2">{t('guides.vedicAstrology.sections.doshas.kaalSarp.title', 'Kaal Sarp Dosha')}</h3>
                <p className="text-gray-600 text-sm">
                  {t('guides.vedicAstrology.sections.doshas.kaalSarp.desc', 'Formed when all planets are hemmed between Rahu and Ketu. Associated with struggles, delays, and karmic lessons. Effects depend on which houses are involved and the specific type (12 variations exist).')}
                </p>
              </CardContent>
            </Card>
            <Card className="border-amber-100">
              <CardContent className="pt-4">
                <h3 className="font-semibold text-gray-900 mb-2">{t('guides.vedicAstrology.sections.doshas.pitru.title', 'Pitru Dosha')}</h3>
                <p className="text-gray-600 text-sm">
                  {t('guides.vedicAstrology.sections.doshas.pitru.desc', 'Related to ancestral karma, indicated by afflictions to Sun or 9th house. May cause obstacles in career, children, or general prosperity. Remedies often involve ancestral rituals and charity.')}
                </p>
              </CardContent>
            </Card>
            <Card className="border-amber-100">
              <CardContent className="pt-4">
                <h3 className="font-semibold text-gray-900 mb-2">{t('guides.vedicAstrology.sections.doshas.shani.title', 'Shani Dosha (Sade Sati)')}</h3>
                <p className="text-gray-600 text-sm">
                  {t('guides.vedicAstrology.sections.doshas.shani.desc', 'The 7.5-year period when Saturn transits through the 12th, 1st, and 2nd houses from Moon sign. A period of karmic lessons, hard work, and transformation. Not always negative—can bring significant achievements through effort.')}
                </p>
              </CardContent>
            </Card>
          </div>
          <Button asChild>
            <Link href="/vedic-astrology-remedies-doshas-guide">
              {t('guides.vedicAstrology.cta.learnRemedies', 'Learn About Remedies')}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </section>

        <section id="remedies" className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            {t('guides.vedicAstrology.sections.remedies.title', '10. Astrological Remedies')}
          </h2>
          <p className="text-gray-700 mb-4">
            {t('guides.vedicAstrology.sections.remedies.intro', 'Vedic astrology offers various remedies to strengthen weak planets, reduce malefic effects, and enhance positive influences. These remedies work on the principle of resonance—aligning with planetary energies through specific actions, objects, or practices.')}
          </p>
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <Card className="border-amber-100">
              <CardContent className="pt-4">
                <h3 className="font-semibold text-gray-900 mb-2">{t('guides.vedicAstrology.sections.remedies.gemstones.title', 'Gemstones (Ratna)')}</h3>
                <p className="text-gray-600 text-sm">
                  {t('guides.vedicAstrology.sections.remedies.gemstones.desc', 'Wearing specific gemstones to strengthen planetary energies. Must be chosen based on individual chart analysis. Examples: Ruby for Sun, Pearl for Moon, Red Coral for Mars.')}
                </p>
              </CardContent>
            </Card>
            <Card className="border-amber-100">
              <CardContent className="pt-4">
                <h3 className="font-semibold text-gray-900 mb-2">{t('guides.vedicAstrology.sections.remedies.mantras.title', 'Mantras')}</h3>
                <p className="text-gray-600 text-sm">
                  {t('guides.vedicAstrology.sections.remedies.mantras.desc', 'Chanting planetary mantras to invoke positive energies. Each planet has specific Beej mantras and Vedic mantras. Regular practice with proper pronunciation is key.')}
                </p>
              </CardContent>
            </Card>
            <Card className="border-amber-100">
              <CardContent className="pt-4">
                <h3 className="font-semibold text-gray-900 mb-2">{t('guides.vedicAstrology.sections.remedies.charity.title', 'Charity (Dana)')}</h3>
                <p className="text-gray-600 text-sm">
                  {t('guides.vedicAstrology.sections.remedies.charity.desc', 'Donating items associated with specific planets on their designated days. For example, donating wheat on Sundays for Sun, rice on Mondays for Moon.')}
                </p>
              </CardContent>
            </Card>
            <Card className="border-amber-100">
              <CardContent className="pt-4">
                <h3 className="font-semibold text-gray-900 mb-2">{t('guides.vedicAstrology.sections.remedies.fasting.title', 'Fasting (Vrat)')}</h3>
                <p className="text-gray-600 text-sm">
                  {t('guides.vedicAstrology.sections.remedies.fasting.desc', 'Observing fasts on specific days to propitiate planets. Saturday fast for Saturn, Tuesday fast for Mars, Thursday fast for Jupiter, etc.')}
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="faq" className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            {t('guides.vedicAstrology.sections.faq.title', '11. Frequently Asked Questions')}
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
            <h2 className="text-2xl font-bold mb-2">{t('guides.vedicAstrology.cta.readyTitle', 'Ready to Explore Your Birth Chart?')}</h2>
            <p className="mb-4 text-amber-100">
              {t('guides.vedicAstrology.cta.readyDesc', 'Generate your free Kundli and discover insights about your life path, career, relationships, and more.')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-amber-600 hover:bg-amber-50" asChild>
                <Link href="/tools/kundli-calculator">
                  {t('guides.vedicAstrology.cta.generateFreeKundli', 'Generate Free Kundli')}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button size="lg" className="bg-white text-amber-600 hover:bg-amber-50" asChild>
                <Link href="/consultation">{t('consultation.bookConsultation', 'Book Consultation')}</Link>
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
