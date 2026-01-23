"use client";

import { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Type,
  User,
  Sparkles,
  ArrowRight,
  Star,
  Heart,
} from "lucide-react";

const rashiData: Record<string, {
  name: string;
  hindi: string;
  symbol: string;
  letters: string[];
  element: string;
  ruler: string;
  traits: string[];
  description: string;
  compatibility: string[];
  luckyDay: string;
  luckyColor: string;
  luckyNumber: number;
}> = {
  Aries: {
    name: "Aries",
    hindi: "मेष",
    symbol: "♈",
    letters: ["A", "L", "E", "Chu", "Che", "Cho", "La", "Li", "Lu", "Le", "Lo"],
    element: "Fire",
    ruler: "Mars",
    traits: ["Courageous", "Energetic", "Confident", "Enthusiastic", "Pioneering"],
    description: "Aries is the first sign of the zodiac, representing new beginnings and leadership. People with Naam Rashi as Aries are natural leaders with strong willpower and determination.",
    compatibility: ["Leo", "Sagittarius", "Gemini", "Aquarius"],
    luckyDay: "Tuesday",
    luckyColor: "Red",
    luckyNumber: 9,
  },
  Taurus: {
    name: "Taurus",
    hindi: "वृषभ",
    symbol: "♉",
    letters: ["B", "V", "U", "E", "O", "Wa", "Wi", "Wu", "We", "Wo"],
    element: "Earth",
    ruler: "Venus",
    traits: ["Reliable", "Patient", "Practical", "Devoted", "Responsible"],
    description: "Taurus represents stability and material comfort. People with Naam Rashi as Taurus are grounded, reliable, and have a strong appreciation for beauty and luxury.",
    compatibility: ["Virgo", "Capricorn", "Cancer", "Pisces"],
    luckyDay: "Friday",
    luckyColor: "Green",
    luckyNumber: 6,
  },
  Gemini: {
    name: "Gemini",
    hindi: "मिथुन",
    symbol: "♊",
    letters: ["K", "Ka", "Ki", "Ku", "Gha", "Ng", "Chh", "Ke", "Ko", "Ha"],
    element: "Air",
    ruler: "Mercury",
    traits: ["Adaptable", "Curious", "Communicative", "Witty", "Versatile"],
    description: "Gemini represents communication and intellect. People with Naam Rashi as Gemini are quick-witted, adaptable, and excellent communicators.",
    compatibility: ["Libra", "Aquarius", "Aries", "Leo"],
    luckyDay: "Wednesday",
    luckyColor: "Yellow",
    luckyNumber: 5,
  },
  Cancer: {
    name: "Cancer",
    hindi: "कर्क",
    symbol: "♋",
    letters: ["D", "H", "Hi", "Hu", "He", "Ho", "Da", "Di", "Du", "De", "Do"],
    element: "Water",
    ruler: "Moon",
    traits: ["Nurturing", "Intuitive", "Protective", "Emotional", "Loyal"],
    description: "Cancer represents home and family. People with Naam Rashi as Cancer are deeply intuitive, nurturing, and have strong emotional connections with loved ones.",
    compatibility: ["Scorpio", "Pisces", "Taurus", "Virgo"],
    luckyDay: "Monday",
    luckyColor: "White",
    luckyNumber: 2,
  },
  Leo: {
    name: "Leo",
    hindi: "सिंह",
    symbol: "♌",
    letters: ["M", "Ma", "Mi", "Mu", "Me", "Mo", "Ta", "Ti", "Tu", "Te"],
    element: "Fire",
    ruler: "Sun",
    traits: ["Confident", "Generous", "Creative", "Warm-hearted", "Charismatic"],
    description: "Leo represents creativity and self-expression. People with Naam Rashi as Leo are natural performers with a generous heart and strong leadership qualities.",
    compatibility: ["Aries", "Sagittarius", "Gemini", "Libra"],
    luckyDay: "Sunday",
    luckyColor: "Gold",
    luckyNumber: 1,
  },
  Virgo: {
    name: "Virgo",
    hindi: "कन्या",
    symbol: "♍",
    letters: ["P", "Pa", "Pi", "Pu", "Sha", "N", "Th", "Pe", "Po", "To"],
    element: "Earth",
    ruler: "Mercury",
    traits: ["Analytical", "Practical", "Diligent", "Modest", "Reliable"],
    description: "Virgo represents service and attention to detail. People with Naam Rashi as Virgo are analytical, hardworking, and have a strong desire to help others.",
    compatibility: ["Taurus", "Capricorn", "Cancer", "Scorpio"],
    luckyDay: "Wednesday",
    luckyColor: "Green",
    luckyNumber: 5,
  },
  Libra: {
    name: "Libra",
    hindi: "तुला",
    symbol: "♎",
    letters: ["R", "Ra", "Ri", "Ru", "Re", "Ro", "Ta", "Ti", "Tu", "Te"],
    element: "Air",
    ruler: "Venus",
    traits: ["Diplomatic", "Fair-minded", "Social", "Cooperative", "Gracious"],
    description: "Libra represents balance and harmony. People with Naam Rashi as Libra are diplomatic, fair-minded, and have a strong sense of justice.",
    compatibility: ["Gemini", "Aquarius", "Leo", "Sagittarius"],
    luckyDay: "Friday",
    luckyColor: "Pink",
    luckyNumber: 6,
  },
  Scorpio: {
    name: "Scorpio",
    hindi: "वृश्चिक",
    symbol: "♏",
    letters: ["N", "Na", "Ni", "Nu", "Ne", "No", "Ya", "Yi", "Yu"],
    element: "Water",
    ruler: "Mars",
    traits: ["Passionate", "Resourceful", "Brave", "Determined", "Loyal"],
    description: "Scorpio represents transformation and intensity. People with Naam Rashi as Scorpio are passionate, determined, and have deep emotional depth.",
    compatibility: ["Cancer", "Pisces", "Virgo", "Capricorn"],
    luckyDay: "Tuesday",
    luckyColor: "Maroon",
    luckyNumber: 8,
  },
  Sagittarius: {
    name: "Sagittarius",
    hindi: "धनु",
    symbol: "♐",
    letters: ["Bh", "Dh", "Ph", "Dha", "Bha", "Ye", "Yo", "Fa"],
    element: "Fire",
    ruler: "Jupiter",
    traits: ["Optimistic", "Adventurous", "Honest", "Philosophical", "Freedom-loving"],
    description: "Sagittarius represents adventure and wisdom. People with Naam Rashi as Sagittarius are optimistic, philosophical, and love exploring new horizons.",
    compatibility: ["Aries", "Leo", "Libra", "Aquarius"],
    luckyDay: "Thursday",
    luckyColor: "Purple",
    luckyNumber: 3,
  },
  Capricorn: {
    name: "Capricorn",
    hindi: "मकर",
    symbol: "♑",
    letters: ["J", "Kh", "Ja", "Ji", "Ju", "Je", "Jo", "Khi", "Khu", "Khe", "Kho", "Ga", "Gi"],
    element: "Earth",
    ruler: "Saturn",
    traits: ["Ambitious", "Disciplined", "Responsible", "Patient", "Practical"],
    description: "Capricorn represents ambition and discipline. People with Naam Rashi as Capricorn are hardworking, responsible, and have strong determination to achieve their goals.",
    compatibility: ["Taurus", "Virgo", "Scorpio", "Pisces"],
    luckyDay: "Saturday",
    luckyColor: "Black",
    luckyNumber: 8,
  },
  Aquarius: {
    name: "Aquarius",
    hindi: "कुंभ",
    symbol: "♒",
    letters: ["G", "S", "Gu", "Ge", "Go", "Sa", "Si", "Su", "Se", "So"],
    element: "Air",
    ruler: "Saturn",
    traits: ["Independent", "Humanitarian", "Innovative", "Original", "Progressive"],
    description: "Aquarius represents innovation and humanitarianism. People with Naam Rashi as Aquarius are independent thinkers with a strong desire to make the world better.",
    compatibility: ["Gemini", "Libra", "Aries", "Sagittarius"],
    luckyDay: "Saturday",
    luckyColor: "Blue",
    luckyNumber: 4,
  },
  Pisces: {
    name: "Pisces",
    hindi: "मीन",
    symbol: "♓",
    letters: ["D", "Ch", "Z", "Th", "Jh", "De", "Do", "Cha", "Chi"],
    element: "Water",
    ruler: "Jupiter",
    traits: ["Compassionate", "Intuitive", "Artistic", "Gentle", "Wise"],
    description: "Pisces represents spirituality and compassion. People with Naam Rashi as Pisces are deeply intuitive, artistic, and have a strong connection to the spiritual realm.",
    compatibility: ["Cancer", "Scorpio", "Taurus", "Capricorn"],
    luckyDay: "Thursday",
    luckyColor: "Sea Green",
    luckyNumber: 7,
  },
};

function findNaamRashi(name: string): string | null {
  const firstLetter = name.trim().charAt(0).toUpperCase();
  const firstTwo = name.trim().substring(0, 2);
  
  // Check for specific letter combinations first
  for (const [rashi, data] of Object.entries(rashiData)) {
    for (const letter of data.letters) {
      if (letter.length > 1 && firstTwo.toLowerCase().startsWith(letter.toLowerCase())) {
        return rashi;
      }
    }
  }
  
  // Then check single letters
  for (const [rashi, data] of Object.entries(rashiData)) {
    for (const letter of data.letters) {
      if (letter.length === 1 && firstLetter === letter.toUpperCase()) {
        return rashi;
      }
    }
  }
  
  // Default mapping based on first letter
  const letterToRashi: Record<string, string> = {
    A: "Aries", B: "Taurus", C: "Gemini", D: "Cancer",
    E: "Aries", F: "Sagittarius", G: "Aquarius", H: "Cancer",
    I: "Aries", J: "Capricorn", K: "Gemini", L: "Aries",
    M: "Leo", N: "Scorpio", O: "Taurus", P: "Virgo",
    Q: "Libra", R: "Libra", S: "Aquarius", T: "Leo",
    U: "Taurus", V: "Taurus", W: "Taurus", X: "Gemini",
    Y: "Scorpio", Z: "Pisces",
  };
  
  return letterToRashi[firstLetter] || null;
}

export default function NaamRashiCalculatorPage() {
  const { t } = useLanguage();
  const [fullName, setFullName] = useState("");
  const [naamRashi, setNaamRashi] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleCalculate = () => {
    if (!fullName.trim()) return;
    
    setIsCalculating(true);
    
    setTimeout(() => {
      const rashi = findNaamRashi(fullName);
      setNaamRashi(rashi);
      setIsCalculating(false);
    }, 500);
  };

  const rashiInfo = naamRashi ? rashiData[naamRashi] : null;

  return (
    <div className="py-12 lg:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-teal-100 text-teal-800">{t('calculator.freeTool', 'Free Tool')}</Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {t('calculator.naamRashi.title', 'Naam Rashi Calculator')}
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {t('calculator.naamRashi.subtitle', 'Discover your zodiac sign (Rashi) based on the first letter of your name. In Vedic astrology, Naam Rashi is used for daily horoscope readings and astrological predictions.')}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="border-teal-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="w-5 h-5 text-teal-600" />
                {t('calculator.enterName', 'Enter Your Name')}
              </CardTitle>
              <CardDescription>
                {t('calculator.naamRashi.inputDesc', 'Enter your name to find your Naam Rashi based on the first letter')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {t('calculator.fullName', 'Full Name')}
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder={t('calculator.enterFullName', 'Enter your full name')}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  {t('calculator.naamRashi.nameNote', 'Your Naam Rashi is determined by the first letter of your name')}
                </p>
              </div>
              
              <Button 
                onClick={handleCalculate}
                className="w-full bg-teal-600 hover:bg-teal-700"
                disabled={!fullName.trim() || isCalculating}
              >
                {isCalculating ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                    {t('calculator.calculating', 'Calculating...')}
                  </>
                ) : (
                  <>
                    <Type className="w-4 h-4 mr-2" />
                    {t('calculator.naamRashi.findRashi', 'Find My Naam Rashi')}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {rashiInfo ? (
            <Card className="border-teal-200 bg-teal-50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-4xl">{rashiInfo.symbol}</span>
                    {t('calculator.naamRashi.yourRashi', 'Your Naam Rashi')}
                  </CardTitle>
                  <Badge className="bg-teal-500 text-lg px-3 py-1">
                    {rashiInfo.element}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <h2 className="text-3xl font-bold text-teal-700">{rashiInfo.name}</h2>
                  <p className="text-xl text-gray-600">{rashiInfo.hindi}</p>
                  <p className="text-sm text-gray-500">{t('calculator.ruledBy', 'Ruled by')} {rashiInfo.ruler}</p>
                </div>

                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-gray-700">{rashiInfo.description}</p>
                  </div>

                  <div className="bg-white rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Star className="w-4 h-4 text-teal-500" />
                      {t('calculator.keyTraits', 'Key Traits')}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {rashiInfo.traits.map((trait) => (
                        <Badge key={trait} variant="secondary" className="bg-teal-100 text-teal-700">
                          {trait}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg p-3 text-center">
                      <p className="text-sm text-gray-600">{t('calculator.luckyDay', 'Lucky Day')}</p>
                      <p className="font-semibold text-teal-700">{rashiInfo.luckyDay}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center">
                      <p className="text-sm text-gray-600">{t('calculator.luckyColor', 'Lucky Color')}</p>
                      <p className="font-semibold text-teal-700">{rashiInfo.luckyColor}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center">
                      <p className="text-sm text-gray-600">{t('calculator.luckyNumber', 'Lucky Number')}</p>
                      <p className="font-semibold text-teal-700">{rashiInfo.luckyNumber}</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Heart className="w-4 h-4 text-red-500" />
                      {t('calculator.naamRashi.compatibleSigns', 'Compatible Signs')}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {rashiInfo.compatibility.map((sign) => (
                        <Badge key={sign} className="bg-green-100 text-green-700">
                          {sign}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{t('calculator.naamRashi.associatedLetters', 'Associated Letters')}</h3>
                    <div className="flex flex-wrap gap-2">
                      {rashiInfo.letters.slice(0, 8).map((letter) => (
                        <Badge key={letter} variant="outline" className="border-teal-300 text-teal-700">
                          {letter}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-teal-200 bg-teal-50/50">
              <CardContent className="flex flex-col items-center justify-center h-full py-12">
                <div className="w-24 h-24 rounded-full bg-teal-100 flex items-center justify-center mb-4">
                  <Type className="w-12 h-12 text-teal-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t('calculator.naamRashi.resultPlaceholder', 'Your Naam Rashi Will Appear Here')}
                </h3>
                <p className="text-gray-600 text-center max-w-xs">
                  {t('calculator.naamRashi.resultPlaceholderDesc', 'Enter your name to discover your zodiac sign based on the first letter of your name.')}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <Card className="border-amber-200 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-2">{t('calculator.moonSignCalc.title', 'Moon Sign Calculator')}</h3>
              <p className="text-gray-600 text-sm mb-4">
                {t('calculator.moonSignCalc.shortDesc', 'Find your Moon Sign based on birth details.')}
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/tools/moon-sign-calculator">
                  {t('calculator.calculate', 'Calculate')} <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-amber-200 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-2">{t('calculator.numerology.title', 'Numerology Calculator')}</h3>
              <p className="text-gray-600 text-sm mb-4">
                {t('calculator.numerology.shortDesc', 'Discover your Life Path and Destiny Numbers.')}
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/tools/numerology-calculator">
                  {t('calculator.calculate', 'Calculate')} <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-amber-200 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-2">{t('calculator.kundliCalc.title', 'Kundli Calculator')}</h3>
              <p className="text-gray-600 text-sm mb-4">
                {t('calculator.kundliCalc.shortDesc', 'Generate your complete Vedic birth chart.')}
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/tools/kundli-calculator">
                  {t('calculator.generate', 'Generate')} <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16 prose prose-lg max-w-none">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {t('calculator.naamRashi.aboutTitle', 'Understanding Naam Rashi')}
          </h2>
          <p className="text-gray-700 mb-4">
            {t('calculator.naamRashi.aboutDesc1', 'Naam Rashi (Name Zodiac Sign) is a concept in Vedic astrology where your zodiac sign is determined by the first letter or syllable of your name. This is different from your Moon Sign (Chandra Rashi) which is based on the position of the Moon at your birth.')}
          </p>
          <p className="text-gray-700 mb-4">
            {t('calculator.naamRashi.aboutDesc2', 'In Indian tradition, names are often chosen based on the Nakshatra (birth star) of the child, which corresponds to specific letters. This ensures that the name is astrologically aligned with the child\'s birth chart.')}
          </p>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            {t('calculator.naamRashi.whenToUse', 'When to Use Naam Rashi')}
          </h3>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>{t('calculator.naamRashi.use1', 'Reading daily, weekly, or monthly horoscopes in newspapers and magazines')}</li>
            <li>{t('calculator.naamRashi.use2', 'Quick astrological predictions when birth time is unknown')}</li>
            <li>{t('calculator.naamRashi.use3', 'Checking compatibility based on names')}</li>
            <li>{t('calculator.naamRashi.use4', 'Understanding general personality traits associated with your name')}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
