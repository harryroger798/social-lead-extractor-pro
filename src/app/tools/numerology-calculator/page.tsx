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
  Hash,
  Calendar,
  User,
  Sparkles,
  ArrowRight,
  Star,
  Heart,
  Briefcase,
} from "lucide-react";

const numerologyData: Record<number, {
  name: string;
  hindi: string;
  planet: string;
  traits: string[];
  description: string;
  career: string[];
  compatibility: number[];
  luckyColors: string[];
  luckyDays: string[];
}> = {
  1: {
    name: "The Leader",
    hindi: "नेता",
    planet: "Sun (Surya)",
    traits: ["Independent", "Ambitious", "Creative", "Determined", "Pioneering"],
    description: "Number 1 represents leadership, independence, and new beginnings. You are a natural leader with strong willpower and determination. You prefer to work independently and have original ideas.",
    career: ["Entrepreneur", "CEO", "Director", "Inventor", "Politician"],
    compatibility: [1, 2, 3, 9],
    luckyColors: ["Gold", "Orange", "Yellow"],
    luckyDays: ["Sunday", "Monday"],
  },
  2: {
    name: "The Diplomat",
    hindi: "कूटनीतिज्ञ",
    planet: "Moon (Chandra)",
    traits: ["Cooperative", "Sensitive", "Diplomatic", "Patient", "Intuitive"],
    description: "Number 2 represents harmony, balance, and partnerships. You are a natural peacemaker with strong intuition. You work well in teams and value relationships deeply.",
    career: ["Counselor", "Mediator", "Artist", "Healer", "Teacher"],
    compatibility: [1, 2, 4, 7],
    luckyColors: ["White", "Cream", "Green"],
    luckyDays: ["Monday", "Friday"],
  },
  3: {
    name: "The Communicator",
    hindi: "संवादक",
    planet: "Jupiter (Guru)",
    traits: ["Creative", "Expressive", "Optimistic", "Social", "Artistic"],
    description: "Number 3 represents creativity, self-expression, and joy. You have a gift for communication and artistic expression. You bring optimism and enthusiasm to everything you do.",
    career: ["Writer", "Actor", "Speaker", "Designer", "Entertainer"],
    compatibility: [1, 3, 5, 6, 9],
    luckyColors: ["Yellow", "Purple", "Pink"],
    luckyDays: ["Thursday", "Friday"],
  },
  4: {
    name: "The Builder",
    hindi: "निर्माता",
    planet: "Rahu",
    traits: ["Practical", "Organized", "Hardworking", "Loyal", "Disciplined"],
    description: "Number 4 represents stability, hard work, and foundation. You are practical and methodical, building things that last. You value security and are extremely reliable.",
    career: ["Engineer", "Architect", "Accountant", "Manager", "Scientist"],
    compatibility: [2, 4, 6, 8],
    luckyColors: ["Blue", "Gray", "Green"],
    luckyDays: ["Saturday", "Sunday"],
  },
  5: {
    name: "The Adventurer",
    hindi: "साहसी",
    planet: "Mercury (Budh)",
    traits: ["Versatile", "Adventurous", "Curious", "Freedom-loving", "Dynamic"],
    description: "Number 5 represents freedom, change, and adventure. You crave variety and new experiences. You are adaptable and quick-thinking, always ready for the next adventure.",
    career: ["Travel Agent", "Journalist", "Sales", "Marketing", "Consultant"],
    compatibility: [3, 5, 6, 7, 9],
    luckyColors: ["Green", "White", "Gray"],
    luckyDays: ["Wednesday", "Friday"],
  },
  6: {
    name: "The Nurturer",
    hindi: "पालनकर्ता",
    planet: "Venus (Shukra)",
    traits: ["Caring", "Responsible", "Loving", "Protective", "Harmonious"],
    description: "Number 6 represents love, family, and responsibility. You are naturally nurturing and create harmony wherever you go. Home and family are central to your happiness.",
    career: ["Doctor", "Nurse", "Teacher", "Interior Designer", "Chef"],
    compatibility: [3, 4, 5, 6, 9],
    luckyColors: ["Blue", "Pink", "White"],
    luckyDays: ["Friday", "Wednesday"],
  },
  7: {
    name: "The Seeker",
    hindi: "खोजी",
    planet: "Ketu",
    traits: ["Analytical", "Spiritual", "Introspective", "Wise", "Mysterious"],
    description: "Number 7 represents spirituality, wisdom, and inner knowledge. You are a deep thinker who seeks truth and understanding. You have strong intuition and analytical abilities.",
    career: ["Researcher", "Philosopher", "Scientist", "Astrologer", "Psychologist"],
    compatibility: [2, 5, 7],
    luckyColors: ["White", "Yellow", "Green"],
    luckyDays: ["Monday", "Sunday"],
  },
  8: {
    name: "The Achiever",
    hindi: "सिद्धिकर्ता",
    planet: "Saturn (Shani)",
    traits: ["Ambitious", "Authoritative", "Successful", "Practical", "Powerful"],
    description: "Number 8 represents power, success, and material abundance. You have strong business acumen and the ability to achieve great things. You understand the material world well.",
    career: ["Business Owner", "Banker", "Lawyer", "Real Estate", "Executive"],
    compatibility: [4, 8],
    luckyColors: ["Black", "Blue", "Gray"],
    luckyDays: ["Saturday", "Thursday"],
  },
  9: {
    name: "The Humanitarian",
    hindi: "मानवतावादी",
    planet: "Mars (Mangal)",
    traits: ["Compassionate", "Generous", "Idealistic", "Creative", "Selfless"],
    description: "Number 9 represents completion, wisdom, and humanitarianism. You have a broad perspective and care deeply about making the world better. You are generous and inspiring.",
    career: ["Social Worker", "Teacher", "Artist", "Healer", "Philanthropist"],
    compatibility: [1, 3, 5, 6, 9],
    luckyColors: ["Red", "Pink", "Coral"],
    luckyDays: ["Tuesday", "Thursday"],
  },
};

// Radical Number (Moolank) - calculated from birth DAY only
function calculateRadicalNumber(dateString: string): number {
  // Extract the day from the date (YYYY-MM-DD format)
  const day = parseInt(dateString.split("-")[2], 10);
  let sum = day;
  while (sum > 9) {
    sum = sum.toString().split("").map(Number).reduce((a, b) => a + b, 0);
  }
  return sum;
}

// Destiny Number (Bhagyank) - calculated from full birth date (day + month + year)
function calculateDestinyNumber(dateString: string): number {
  const digits = dateString.replace(/-/g, "").split("").map(Number);
  let sum = digits.reduce((a, b) => a + b, 0);
  while (sum > 9) {
    sum = sum.toString().split("").map(Number).reduce((a, b) => a + b, 0);
  }
  return sum;
}

// Name Number - calculated from full name using Pythagorean system
function calculateNameNumber(name: string): number {
  const letterValues: Record<string, number> = {
    a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9,
    j: 1, k: 2, l: 3, m: 4, n: 5, o: 6, p: 7, q: 8, r: 9,
    s: 1, t: 2, u: 3, v: 4, w: 5, x: 6, y: 7, z: 8,
  };
  const cleanName = name.toLowerCase().replace(/[^a-z]/g, "");
  let sum = cleanName.split("").reduce((acc, char) => acc + (letterValues[char] || 0), 0);
  while (sum > 9) {
    sum = sum.toString().split("").map(Number).reduce((a, b) => a + b, 0);
  }
  return sum;
}

export default function NumerologyCalculatorPage() {
  const { t } = useLanguage();
  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [radicalNumber, setRadicalNumber] = useState<number | null>(null);
  const [destinyNumber, setDestinyNumber] = useState<number | null>(null);
  const [nameNumber, setNameNumber] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleCalculate = () => {
    if (!birthDate && !fullName) return;
    
    setIsCalculating(true);
    
    setTimeout(() => {
      if (birthDate) {
        setRadicalNumber(calculateRadicalNumber(birthDate));
        setDestinyNumber(calculateDestinyNumber(birthDate));
      }
      if (fullName) {
        setNameNumber(calculateNameNumber(fullName));
      }
      setIsCalculating(false);
    }, 500);
  };

  const radicalData = radicalNumber ? numerologyData[radicalNumber] : null;
  const destinyData = destinyNumber ? numerologyData[destinyNumber] : null;
  const nameData = nameNumber ? numerologyData[nameNumber] : null;

  return (
    <div className="py-12 lg:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-indigo-100 text-indigo-800">{t('calculator.freeTool', 'Free Tool')}</Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {t('calculator.numerology.title', 'Numerology Calculator')}
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {t('calculator.numerology.subtitle', 'Discover your Life Path Number and Destiny Number based on your birth date and name. Understand your personality, strengths, and life purpose through the ancient science of numerology.')}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="border-indigo-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="w-5 h-5 text-indigo-600" />
                {t('calculator.enterDetails', 'Enter Your Details')}
              </CardTitle>
              <CardDescription>
                {t('calculator.numerology.inputDesc', 'Enter your full name and birth date to calculate your numerology numbers')}
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
                  {t('calculator.numerology.nameNote', 'Use your full birth name for accurate Destiny Number')}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="date" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {t('calculator.dateOfBirth', 'Date of Birth')}
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                />
              </div>
              
              <Button 
                onClick={handleCalculate}
                className="w-full bg-indigo-600 hover:bg-indigo-700"
                disabled={(!birthDate && !fullName) || isCalculating}
              >
                {isCalculating ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                    {t('calculator.calculating', 'Calculating...')}
                  </>
                ) : (
                  <>
                    <Hash className="w-4 h-4 mr-2" />
                    {t('calculator.numerology.calculate', 'Calculate My Numbers')}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {(radicalNumber || destinyNumber || nameNumber) ? (
            <div className="space-y-6">
              {/* Summary Card showing all three numbers */}
              <Card className="border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Hash className="w-5 h-5 text-indigo-600" />
                    {t('calculator.numerology.yourNumbers', 'Your Numerology Numbers')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    {radicalNumber && (
                      <div className="text-center p-4 bg-white rounded-lg border border-indigo-200">
                        <p className="text-xs text-gray-600 mb-1">{t('calculator.numerology.radicalNumber', 'Radical Number')}</p>
                        <p className="text-xs text-gray-500 mb-2">{t('calculator.numerology.moolank', '(Moolank)')}</p>
                        <span className="text-4xl font-bold text-indigo-600">{radicalNumber}</span>
                      </div>
                    )}
                    {destinyNumber && (
                      <div className="text-center p-4 bg-white rounded-lg border border-purple-200">
                        <p className="text-xs text-gray-600 mb-1">{t('calculator.numerology.destinyNumber', 'Destiny Number')}</p>
                        <p className="text-xs text-gray-500 mb-2">{t('calculator.numerology.bhagyank', '(Bhagyank)')}</p>
                        <span className="text-4xl font-bold text-purple-600">{destinyNumber}</span>
                      </div>
                    )}
                    {nameNumber && (
                      <div className="text-center p-4 bg-white rounded-lg border border-green-200">
                        <p className="text-xs text-gray-600 mb-1">{t('calculator.numerology.nameNumber', 'Name Number')}</p>
                        <p className="text-xs text-gray-500 mb-2">{t('calculator.numerology.namank', '(Namank)')}</p>
                        <span className="text-4xl font-bold text-green-600">{nameNumber}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Radical Number Details */}
              {radicalNumber && radicalData && (
                <Card className="border-indigo-200 bg-indigo-50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-indigo-600" />
                        {t('calculator.numerology.radicalNumberDetails', 'Radical Number (Moolank)')}
                      </CardTitle>
                      <span className="text-3xl font-bold text-indigo-600">{radicalNumber}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center mb-4">
                      <h2 className="text-2xl font-bold text-indigo-700">{radicalData.name}</h2>
                      <p className="text-lg text-gray-600">{radicalData.hindi}</p>
                      <p className="text-sm text-gray-500">{t('calculator.ruledBy', 'Ruled by')} {radicalData.planet}</p>
                    </div>

                    <div className="space-y-3">
                      <div className="bg-white rounded-lg p-3">
                        <p className="text-gray-700 text-sm">{radicalData.description}</p>
                      </div>

                      <div className="bg-white rounded-lg p-3">
                        <h4 className="font-semibold text-gray-900 mb-2 text-sm">{t('calculator.keyTraits', 'Key Traits')}</h4>
                        <div className="flex flex-wrap gap-1">
                          {radicalData.traits.map((trait) => (
                            <Badge key={trait} variant="secondary" className="bg-indigo-100 text-indigo-700 text-xs">
                              {trait}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-white rounded-lg p-2 text-center">
                          <p className="text-xs text-gray-600">{t('calculator.luckyColors', 'Lucky Colors')}</p>
                          <p className="font-semibold text-indigo-700 text-sm">{radicalData.luckyColors.join(", ")}</p>
                        </div>
                        <div className="bg-white rounded-lg p-2 text-center">
                          <p className="text-xs text-gray-600">{t('calculator.luckyDays', 'Lucky Days')}</p>
                          <p className="font-semibold text-indigo-700 text-sm">{radicalData.luckyDays.join(", ")}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Destiny Number Details */}
              {destinyNumber && destinyData && (
                <Card className="border-purple-200 bg-purple-50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Heart className="w-5 h-5 text-purple-600" />
                        {t('calculator.numerology.destinyNumberDetails', 'Destiny Number (Bhagyank)')}
                      </CardTitle>
                      <span className="text-3xl font-bold text-purple-600">{destinyNumber}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center mb-4">
                      <h2 className="text-2xl font-bold text-purple-700">{destinyData.name}</h2>
                      <p className="text-lg text-gray-600">{destinyData.hindi}</p>
                    </div>

                    <div className="space-y-3">
                      <div className="bg-white rounded-lg p-3">
                        <h4 className="font-semibold text-gray-900 mb-2 text-sm flex items-center gap-2">
                          <Briefcase className="w-4 h-4" />
                          {t('calculator.numerology.careerPaths', 'Ideal Career Paths')}
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {destinyData.career.map((career) => (
                            <Badge key={career} variant="secondary" className="bg-purple-100 text-purple-700 text-xs">
                              {career}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="bg-white rounded-lg p-3">
                        <h4 className="font-semibold text-gray-900 mb-2 text-sm">{t('calculator.numerology.compatibleNumbers', 'Compatible Numbers')}</h4>
                        <div className="flex flex-wrap gap-1">
                          {destinyData.compatibility.map((num) => (
                            <Badge key={num} className="bg-green-100 text-green-700 text-xs">
                              {num}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Name Number Details */}
              {nameNumber && nameData && (
                <Card className="border-green-200 bg-green-50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5 text-green-600" />
                        {t('calculator.numerology.nameNumberDetails', 'Name Number (Namank)')}
                      </CardTitle>
                      <span className="text-3xl font-bold text-green-600">{nameNumber}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center mb-4">
                      <h2 className="text-2xl font-bold text-green-700">{nameData.name}</h2>
                      <p className="text-lg text-gray-600">{nameData.hindi}</p>
                    </div>

                    <div className="space-y-3">
                      <div className="bg-white rounded-lg p-3">
                        <p className="text-gray-700 text-sm">{nameData.description}</p>
                      </div>

                      <div className="bg-white rounded-lg p-3">
                        <h4 className="font-semibold text-gray-900 mb-2 text-sm">{t('calculator.keyTraits', 'Key Traits')}</h4>
                        <div className="flex flex-wrap gap-1">
                          {nameData.traits.map((trait) => (
                            <Badge key={trait} variant="secondary" className="bg-green-100 text-green-700 text-xs">
                              {trait}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card className="border-indigo-200 bg-indigo-50/50">
              <CardContent className="flex flex-col items-center justify-center h-full py-12">
                <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
                  <Hash className="w-12 h-12 text-indigo-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t('calculator.numerology.resultPlaceholder', 'Your Numbers Will Appear Here')}
                </h3>
                <p className="text-gray-600 text-center max-w-xs">
                  {t('calculator.numerology.resultPlaceholderDesc', 'Enter your name and birth date to discover your Life Path and Destiny Numbers.')}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="mt-12 grid md:grid-cols-3 gap-6">
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

          <Card className="border-amber-200 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-2">{t('calculator.naamRashi.title', 'Naam Rashi Calculator')}</h3>
              <p className="text-gray-600 text-sm mb-4">
                {t('calculator.naamRashi.shortDesc', 'Find your zodiac sign based on your name.')}
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/tools/naam-rashi-calculator">
                  {t('calculator.calculate', 'Calculate')} <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-amber-200 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-2">{t('calculator.moonSignCalc.title', 'Moon Sign Calculator')}</h3>
              <p className="text-gray-600 text-sm mb-4">
                {t('calculator.moonSignCalc.shortDesc', 'Discover your Moon Sign (Chandra Rashi).')}
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/tools/moon-sign-calculator">
                  {t('calculator.calculate', 'Calculate')} <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16 prose prose-lg max-w-none">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {t('calculator.numerology.aboutTitle', 'Understanding Numerology')}
          </h2>
          <p className="text-gray-700 mb-4">
            {t('calculator.numerology.aboutDesc1', 'Numerology is an ancient science that studies the mystical relationship between numbers and life events. It has been practiced for thousands of years across various cultures including Indian, Chinese, and Western traditions.')}
          </p>
          
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            {t('calculator.numerology.radicalTitle', 'What is Radical Number (Moolank)?')}
          </h3>
          <p className="text-gray-700 mb-4">
            {t('calculator.numerology.radicalDesc', 'Your Radical Number (Moolank) is calculated from your birth DAY only. For example, if you were born on the 28th, your Radical Number is 2+8=10, then 1+0=1. It represents your basic nature and personality traits.')}
          </p>
          
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            {t('calculator.numerology.destinyTitle', 'What is Destiny Number (Bhagyank)?')}
          </h3>
          <p className="text-gray-700 mb-4">
            {t('calculator.numerology.destinyDesc', 'Your Destiny Number (Bhagyank) is calculated from your complete birth date (day + month + year). It reveals your life purpose, the opportunities and challenges you may face, and your overall destiny in this lifetime.')}
          </p>
          
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            {t('calculator.numerology.nameTitle', 'What is Name Number (Namank)?')}
          </h3>
          <p className="text-gray-700 mb-4">
            {t('calculator.numerology.nameDesc', 'Your Name Number (Namank) is calculated from your full birth name using the Pythagorean system where each letter is assigned a number (A=1, B=2, etc.). It reveals your talents, abilities, and the impression you make on others.')}
          </p>
        </div>
      </div>
    </div>
  );
}
