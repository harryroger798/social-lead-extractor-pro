"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowRight, Moon, Star, Clock } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const nakshatras = [
  {
    number: 1,
    name: "Ashwini",
    sanskrit: "अश्विनी",
    degrees: "0°00' - 13°20' Aries",
    lord: "Ketu",
    deity: "Ashwini Kumaras",
    symbol: "Horse's Head",
    gana: "Deva",
    characteristics: "Quick, energetic, healing abilities, pioneering spirit, independent nature",
    careers: "Medicine, healing, sports, emergency services, entrepreneurship",
  },
  {
    number: 2,
    name: "Bharani",
    sanskrit: "भरणी",
    degrees: "13°20' - 26°40' Aries",
    lord: "Venus",
    deity: "Yama",
    symbol: "Yoni",
    gana: "Manushya",
    characteristics: "Creative, nurturing, transformative, determined, passionate",
    careers: "Arts, entertainment, hospitality, psychology, birth/death related fields",
  },
  {
    number: 3,
    name: "Krittika",
    sanskrit: "कृत्तिका",
    degrees: "26°40' Aries - 10°00' Taurus",
    lord: "Sun",
    deity: "Agni",
    symbol: "Razor/Flame",
    gana: "Rakshasa",
    characteristics: "Sharp intellect, purifying nature, leadership, courage, determination",
    careers: "Military, cooking, metallurgy, leadership roles, criticism",
  },
  {
    number: 4,
    name: "Rohini",
    sanskrit: "रोहिणी",
    degrees: "10°00' - 23°20' Taurus",
    lord: "Moon",
    deity: "Brahma",
    symbol: "Ox Cart",
    gana: "Manushya",
    characteristics: "Beautiful, artistic, sensual, materialistic, grounded",
    careers: "Fashion, beauty, agriculture, arts, luxury goods",
  },
  {
    number: 5,
    name: "Mrigashira",
    sanskrit: "मृगशिरा",
    degrees: "23°20' Taurus - 6°40' Gemini",
    lord: "Mars",
    deity: "Soma",
    symbol: "Deer's Head",
    gana: "Deva",
    characteristics: "Curious, searching, gentle, sensual, artistic",
    careers: "Research, travel, textiles, music, writing",
  },
  {
    number: 6,
    name: "Ardra",
    sanskrit: "आर्द्रा",
    degrees: "6°40' - 20°00' Gemini",
    lord: "Rahu",
    deity: "Rudra",
    symbol: "Teardrop",
    gana: "Manushya",
    characteristics: "Intellectual, transformative, destructive-creative, intense",
    careers: "Technology, research, medicine, psychology, disaster management",
  },
  {
    number: 7,
    name: "Punarvasu",
    sanskrit: "पुनर्वसु",
    degrees: "20°00' Gemini - 3°20' Cancer",
    lord: "Jupiter",
    deity: "Aditi",
    symbol: "Bow and Quiver",
    gana: "Deva",
    characteristics: "Optimistic, philosophical, nurturing, returning, expansive",
    careers: "Teaching, counseling, hospitality, travel, philosophy",
  },
  {
    number: 8,
    name: "Pushya",
    sanskrit: "पुष्य",
    degrees: "3°20' - 16°40' Cancer",
    lord: "Saturn",
    deity: "Brihaspati",
    symbol: "Cow's Udder",
    gana: "Deva",
    characteristics: "Nourishing, protective, traditional, spiritual, generous",
    careers: "Teaching, clergy, dairy, counseling, public service",
  },
  {
    number: 9,
    name: "Ashlesha",
    sanskrit: "आश्लेषा",
    degrees: "16°40' - 30°00' Cancer",
    lord: "Mercury",
    deity: "Nagas",
    symbol: "Coiled Serpent",
    gana: "Rakshasa",
    characteristics: "Mystical, hypnotic, cunning, intuitive, transformative",
    careers: "Occult, psychology, politics, pharmaceuticals, research",
  },
  {
    number: 10,
    name: "Magha",
    sanskrit: "मघा",
    degrees: "0°00' - 13°20' Leo",
    lord: "Ketu",
    deity: "Pitris (Ancestors)",
    symbol: "Royal Throne",
    gana: "Rakshasa",
    characteristics: "Royal, authoritative, traditional, ancestral connection, proud",
    careers: "Government, administration, history, genealogy, leadership",
  },
  {
    number: 11,
    name: "Purva Phalguni",
    sanskrit: "पूर्व फाल्गुनी",
    degrees: "13°20' - 26°40' Leo",
    lord: "Venus",
    deity: "Bhaga",
    symbol: "Front Legs of Bed",
    gana: "Manushya",
    characteristics: "Creative, romantic, pleasure-seeking, artistic, charismatic",
    careers: "Entertainment, arts, marriage counseling, luxury goods, hospitality",
  },
  {
    number: 12,
    name: "Uttara Phalguni",
    sanskrit: "उत्तर फाल्गुनी",
    degrees: "26°40' Leo - 10°00' Virgo",
    lord: "Sun",
    deity: "Aryaman",
    symbol: "Back Legs of Bed",
    gana: "Manushya",
    characteristics: "Helpful, friendly, generous, leadership, social service",
    careers: "Social work, HR, counseling, healing, administration",
  },
  {
    number: 13,
    name: "Hasta",
    sanskrit: "हस्त",
    degrees: "10°00' - 23°20' Virgo",
    lord: "Moon",
    deity: "Savitar",
    symbol: "Hand",
    gana: "Deva",
    characteristics: "Skillful, clever, healing hands, industrious, practical",
    careers: "Crafts, healing, magic, manufacturing, service industries",
  },
  {
    number: 14,
    name: "Chitra",
    sanskrit: "चित्रा",
    degrees: "23°20' Virgo - 6°40' Libra",
    lord: "Mars",
    deity: "Vishwakarma",
    symbol: "Bright Jewel",
    gana: "Rakshasa",
    characteristics: "Creative, artistic, attractive, perfectionist, dynamic",
    careers: "Architecture, design, fashion, jewelry, engineering",
  },
  {
    number: 15,
    name: "Swati",
    sanskrit: "स्वाति",
    degrees: "6°40' - 20°00' Libra",
    lord: "Rahu",
    deity: "Vayu",
    symbol: "Young Plant",
    gana: "Deva",
    characteristics: "Independent, flexible, diplomatic, business-minded, restless",
    careers: "Business, trade, travel, diplomacy, communication",
  },
  {
    number: 16,
    name: "Vishakha",
    sanskrit: "विशाखा",
    degrees: "20°00' Libra - 3°20' Scorpio",
    lord: "Jupiter",
    deity: "Indra-Agni",
    symbol: "Triumphal Arch",
    gana: "Rakshasa",
    characteristics: "Determined, goal-oriented, competitive, transformative, ambitious",
    careers: "Politics, military, sports, research, leadership",
  },
  {
    number: 17,
    name: "Anuradha",
    sanskrit: "अनुराधा",
    degrees: "3°20' - 16°40' Scorpio",
    lord: "Saturn",
    deity: "Mitra",
    symbol: "Lotus",
    gana: "Deva",
    characteristics: "Friendly, devoted, organizational, spiritual, cooperative",
    careers: "Organizations, friendship-based work, occult, mathematics",
  },
  {
    number: 18,
    name: "Jyeshtha",
    sanskrit: "ज्येष्ठा",
    degrees: "16°40' - 30°00' Scorpio",
    lord: "Mercury",
    deity: "Indra",
    symbol: "Circular Amulet",
    gana: "Rakshasa",
    characteristics: "Protective, senior, authoritative, mystical, intense",
    careers: "Military, police, occult, administration, protection services",
  },
  {
    number: 19,
    name: "Mula",
    sanskrit: "मूल",
    degrees: "0°00' - 13°20' Sagittarius",
    lord: "Ketu",
    deity: "Nirriti",
    symbol: "Bunch of Roots",
    gana: "Rakshasa",
    characteristics: "Investigative, destructive-creative, philosophical, root-seeking",
    careers: "Research, medicine, philosophy, destruction/construction, herbalism",
  },
  {
    number: 20,
    name: "Purva Ashadha",
    sanskrit: "पूर्वाषाढ़ा",
    degrees: "13°20' - 26°40' Sagittarius",
    lord: "Venus",
    deity: "Apas (Water)",
    symbol: "Elephant Tusk",
    gana: "Manushya",
    characteristics: "Invincible, purifying, philosophical, proud, influential",
    careers: "Law, philosophy, water-related, shipping, counseling",
  },
  {
    number: 21,
    name: "Uttara Ashadha",
    sanskrit: "उत्तराषाढ़ा",
    degrees: "26°40' Sagittarius - 10°00' Capricorn",
    lord: "Sun",
    deity: "Vishvadevas",
    symbol: "Elephant Tusk",
    gana: "Manushya",
    characteristics: "Leadership, righteous, victorious, responsible, ethical",
    careers: "Government, law, military, leadership, social reform",
  },
  {
    number: 22,
    name: "Shravana",
    sanskrit: "श्रवण",
    degrees: "10°00' - 23°20' Capricorn",
    lord: "Moon",
    deity: "Vishnu",
    symbol: "Three Footprints",
    gana: "Deva",
    characteristics: "Listening, learning, connected, media-oriented, preserving",
    careers: "Media, teaching, counseling, music, telecommunications",
  },
  {
    number: 23,
    name: "Dhanishta",
    sanskrit: "धनिष्ठा",
    degrees: "23°20' Capricorn - 6°40' Aquarius",
    lord: "Mars",
    deity: "Eight Vasus",
    symbol: "Drum",
    gana: "Rakshasa",
    characteristics: "Wealthy, musical, ambitious, adaptable, charitable",
    careers: "Music, real estate, charity, sports, science",
  },
  {
    number: 24,
    name: "Shatabhisha",
    sanskrit: "शतभिषा",
    degrees: "6°40' - 20°00' Aquarius",
    lord: "Rahu",
    deity: "Varuna",
    symbol: "Empty Circle",
    gana: "Rakshasa",
    characteristics: "Healing, secretive, philosophical, independent, mystical",
    careers: "Healing, astronomy, technology, research, aquatic fields",
  },
  {
    number: 25,
    name: "Purva Bhadrapada",
    sanskrit: "पूर्व भाद्रपद",
    degrees: "20°00' Aquarius - 3°20' Pisces",
    lord: "Jupiter",
    deity: "Aja Ekapada",
    symbol: "Front of Funeral Cot",
    gana: "Manushya",
    characteristics: "Passionate, transformative, mystical, intense, philosophical",
    careers: "Occult, astrology, transformation work, philosophy, death-related",
  },
  {
    number: 26,
    name: "Uttara Bhadrapada",
    sanskrit: "उत्तर भाद्रपद",
    degrees: "3°20' - 16°40' Pisces",
    lord: "Saturn",
    deity: "Ahir Budhnya",
    symbol: "Back of Funeral Cot",
    gana: "Manushya",
    characteristics: "Wise, controlled, spiritual, deep, charitable",
    careers: "Charity, yoga, counseling, non-profit, spiritual teaching",
  },
  {
    number: 27,
    name: "Revati",
    sanskrit: "रेवती",
    degrees: "16°40' - 30°00' Pisces",
    lord: "Mercury",
    deity: "Pushan",
    symbol: "Fish/Drum",
    gana: "Deva",
    characteristics: "Nurturing, protective, wealthy, creative, journey-oriented",
    careers: "Travel, animal care, roads, creative arts, fostering",
  },
];

export default function NakshatrasGuidePage() {
  const { t } = useLanguage();

  const faqs = [
    {
      question: t('guides.nakshatras.faq.q1', "What is a Nakshatra in Vedic Astrology?"),
      answer: t('guides.nakshatras.faq.a1', "A Nakshatra is one of 27 lunar mansions or star constellations that the Moon passes through during its monthly cycle. Each Nakshatra spans 13°20' of the zodiac and has unique characteristics, ruling deity, and planetary lord that influence those born under it."),
    },
    {
      question: t('guides.nakshatras.faq.q2', "How do I find my birth Nakshatra?"),
      answer: t('guides.nakshatras.faq.a2', "Your birth Nakshatra (Janma Nakshatra) is determined by the Moon's position at the exact time and place of your birth. You can use our free Nakshatra Finder tool or consult your Kundli to find your Nakshatra."),
    },
    {
      question: t('guides.nakshatras.faq.q3', "What is the importance of Nakshatra in marriage matching?"),
      answer: t('guides.nakshatras.faq.a3', "Nakshatra matching (Nakshatra Porutham) is a crucial part of horoscope matching for marriage in Vedic astrology. It assesses compatibility between partners based on their birth Nakshatras, considering factors like Gana (temperament), Yoni (sexual compatibility), and Nadi (health)."),
    },
    {
      question: t('guides.nakshatras.faq.q4', "Can Nakshatra predict personality traits?"),
      answer: t('guides.nakshatras.faq.a4', "Yes, your birth Nakshatra reveals deep insights about your personality, emotional nature, strengths, challenges, and life tendencies. It's considered more precise than zodiac signs for understanding individual characteristics."),
    },
    {
      question: t('guides.nakshatras.faq.q5', "What is the difference between Rashi and Nakshatra?"),
      answer: t('guides.nakshatras.faq.a5', "Rashi (zodiac sign) divides the zodiac into 12 equal parts of 30° each, while Nakshatras divide it into 27 parts of 13°20' each. Nakshatras provide more detailed and nuanced information about personality and destiny compared to Rashis."),
    },
  ];
  return (
    <article className="py-12 lg:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Badge className="mb-4 bg-amber-100 text-amber-800">{t('guides.badge', 'Complete Guide')}</Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {t('guides.nakshatras.title', '27 Nakshatras: Complete Guide to Vedic Lunar Mansions')}
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            {t('guides.nakshatras.subtitle', "Discover the profound wisdom of the 27 Nakshatras in Vedic astrology. Learn about each lunar constellation's characteristics, ruling deity, and influence on personality and destiny.")}
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {t('guides.nakshatras.readTime', '20 min read')}
            </span>
            <span>{t('guides.nakshatras.updated', 'Updated: January 2025')}</span>
          </div>
        </div>

        <div className="mb-12 rounded-2xl overflow-hidden shadow-xl">
          <Image
            src="/images/nakshatra-art.png"
            alt="27 Nakshatras Constellation Art - Vedic Astrology Lunar Mansions"
            width={1200}
            height={800}
            className="w-full h-auto object-cover"
            priority
          />
        </div>

        <Card className="mb-8 bg-amber-50 border-amber-200">
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">{t('guides.nakshatras.tldr.title', 'TL;DR - Quick Summary')}</h2>
            <p className="text-gray-700 mb-4">
              {t('guides.nakshatras.tldr.content', "Nakshatras are 27 lunar mansions in Vedic astrology, each spanning 13°20' of the zodiac. Your birth Nakshatra (based on Moon's position) reveals your emotional nature, personality traits, and life path. Each Nakshatra has a ruling planet, deity, symbol, and unique characteristics. They're essential for marriage matching, muhurta selection, and the Vimshottari Dasha system.")}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" asChild>
                <Link href="/tools/nakshatra-finder">{t('guides.nakshatras.findYourNakshatra', 'Find Your Nakshatra')}</Link>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <Link href="/tools/kundli-calculator">{t('guides.nakshatras.generateKundli', 'Generate Kundli')}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            {t('guides.nakshatras.sections.completeList', 'Complete List of 27 Nakshatras')}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-amber-50">
                  <th className="border border-amber-200 px-3 py-2 text-left">{t('guides.nakshatras.table.number', '#')}</th>
                  <th className="border border-amber-200 px-3 py-2 text-left">{t('guides.nakshatras.table.nakshatra', 'Nakshatra')}</th>
                  <th className="border border-amber-200 px-3 py-2 text-left">{t('guides.nakshatras.table.degrees', 'Degrees')}</th>
                  <th className="border border-amber-200 px-3 py-2 text-left">{t('guides.nakshatras.table.lord', 'Lord')}</th>
                  <th className="border border-amber-200 px-3 py-2 text-left">{t('guides.nakshatras.table.deity', 'Deity')}</th>
                  <th className="border border-amber-200 px-3 py-2 text-left">{t('guides.nakshatras.table.symbol', 'Symbol')}</th>
                  <th className="border border-amber-200 px-3 py-2 text-left">{t('guides.nakshatras.table.gana', 'Gana')}</th>
                </tr>
              </thead>
              <tbody>
                {nakshatras.map((nakshatra, index) => (
                  <tr key={nakshatra.name} className={index % 2 === 0 ? "" : "bg-gray-50"}>
                    <td className="border border-gray-200 px-3 py-2">{nakshatra.number}</td>
                    <td className="border border-gray-200 px-3 py-2 font-medium">
                      {nakshatra.name}
                      <span className="text-gray-500 ml-1 text-xs">{nakshatra.sanskrit}</span>
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-xs">{nakshatra.degrees}</td>
                    <td className="border border-gray-200 px-3 py-2">{nakshatra.lord}</td>
                    <td className="border border-gray-200 px-3 py-2">{nakshatra.deity}</td>
                    <td className="border border-gray-200 px-3 py-2">{nakshatra.symbol}</td>
                    <td className="border border-gray-200 px-3 py-2">{nakshatra.gana}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            {t('guides.nakshatras.sections.detailedDescriptions', 'Detailed Nakshatra Descriptions')}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {nakshatras.slice(0, 9).map((nakshatra) => (
              <Card key={nakshatra.name} className="border-amber-100 hover:border-amber-300 transition-colors">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                      <span className="text-amber-700 font-bold text-sm">{nakshatra.number}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{nakshatra.name}</h3>
                      <p className="text-xs text-gray-500">{nakshatra.sanskrit}</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Lord:</span>
                      <span className="font-medium">{nakshatra.lord}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Deity:</span>
                      <span className="font-medium">{nakshatra.deity}</span>
                    </div>
                    <p className="text-gray-600 text-xs mt-2">{nakshatra.characteristics}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Button variant="outline" asChild>
              <Link href="/tools/nakshatra-finder">
                Find Your Nakshatra
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            {t('guides.nakshatras.sections.understandingGroups', 'Understanding Nakshatra Groups')}
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-4">
                <h3 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  {t('guides.nakshatras.gana.deva.title', 'Deva Gana (Divine)')}
                </h3>
                <p className="text-sm text-green-700 mb-2">
                  {t('guides.nakshatras.gana.deva.desc', 'Gentle, spiritual, and benevolent nature. Good for spiritual pursuits.')}
                </p>
                <div className="flex flex-wrap gap-1">
                  {["Ashwini", "Mrigashira", "Punarvasu", "Pushya", "Hasta", "Swati", "Anuradha", "Shravana", "Revati"].map(n => (
                    <Badge key={n} variant="outline" className="text-xs bg-white">{n}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="pt-4">
                <h3 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  {t('guides.nakshatras.gana.manushya.title', 'Manushya Gana (Human)')}
                </h3>
                <p className="text-sm text-amber-700 mb-2">
                  {t('guides.nakshatras.gana.manushya.desc', 'Balanced nature with both material and spiritual interests.')}
                </p>
                <div className="flex flex-wrap gap-1">
                  {["Bharani", "Rohini", "Purva Phalguni", "Uttara Phalguni", "Purva Ashadha", "Uttara Ashadha", "Purva Bhadrapada", "Uttara Bhadrapada"].map(n => (
                    <Badge key={n} variant="outline" className="text-xs bg-white">{n}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-4">
                <h3 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  {t('guides.nakshatras.gana.rakshasa.title', 'Rakshasa Gana (Demon)')}
                </h3>
                <p className="text-sm text-red-700 mb-2">
                  {t('guides.nakshatras.gana.rakshasa.desc', 'Intense, powerful, and transformative. Strong willpower.')}
                </p>
                <div className="flex flex-wrap gap-1">
                  {["Krittika", "Ashlesha", "Magha", "Chitra", "Vishakha", "Jyeshtha", "Mula", "Dhanishta", "Shatabhisha"].map(n => (
                    <Badge key={n} variant="outline" className="text-xs bg-white">{n}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            {t('guides.nakshatras.sections.faq', 'Frequently Asked Questions')}
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
            <h2 className="text-2xl font-bold mb-2">{t('guides.nakshatras.cta.title', 'Discover Your Nakshatra')}</h2>
            <p className="mb-4 text-amber-100">
              {t('guides.nakshatras.cta.description', 'Find your birth Nakshatra and understand its influence on your life.')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-amber-600 hover:bg-amber-50" asChild>
                <Link href="/tools/nakshatra-finder">
                  {t('guides.nakshatras.cta.findMyNakshatra', 'Find My Nakshatra')}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button size="lg" className="bg-white text-amber-600 hover:bg-amber-50" asChild>
                <Link href="/consultation">{t('guides.nakshatras.cta.expertConsultation', 'Expert Consultation')}</Link>
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
            headline: "27 Nakshatras: Complete Guide to Vedic Lunar Mansions",
            description: "Comprehensive guide to all 27 Nakshatras in Vedic astrology with characteristics, deities, and influences.",
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
