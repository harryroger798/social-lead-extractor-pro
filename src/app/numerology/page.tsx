"use client";

import { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { CDN_IMAGES } from "@/lib/cdn";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Hash,
  Calendar,
  User,
  Heart,
  Briefcase,
  Star,
  Sparkles,
  TrendingUp,
  Shield,
  Zap,
} from "lucide-react";

interface NumerologyResult {
  lifePath: number;
  destiny: number;
  soul: number;
  personality: number;
  maturity: number;
  personalYear: number;
  luckyNumbers: number[];
  luckyColors: string[];
  luckyDays: string[];
  characteristics: string[];
  strengths: string[];
  challenges: string[];
  careerSuggestions: string[];
  compatibility: number[];
}

// Pythagorean numerology letter values
const letterValues: Record<string, number> = {
  a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9,
  j: 1, k: 2, l: 3, m: 4, n: 5, o: 6, p: 7, q: 8, r: 9,
  s: 1, t: 2, u: 3, v: 4, w: 5, x: 6, y: 7, z: 8
};

const vowels = ['a', 'e', 'i', 'o', 'u'];

// Reduce to single digit (except master numbers 11, 22, 33)
function reduceToSingleDigit(num: number): number {
  while (num > 9 && num !== 11 && num !== 22 && num !== 33) {
    num = String(num).split('').reduce((sum, digit) => sum + parseInt(digit), 0);
  }
  return num;
}

// Calculate Life Path Number from birth date
function calculateLifePath(birthDate: string): number {
  const [year, month, day] = birthDate.split('-').map(Number);
  const sum = reduceToSingleDigit(day) + reduceToSingleDigit(month) + reduceToSingleDigit(year);
  return reduceToSingleDigit(sum);
}

// Calculate Destiny/Expression Number from full name
function calculateDestiny(name: string): number {
  const sum = name.toLowerCase().split('').reduce((total, char) => {
    return total + (letterValues[char] || 0);
  }, 0);
  return reduceToSingleDigit(sum);
}

// Calculate Soul Urge Number from vowels in name
function calculateSoul(name: string): number {
  const sum = name.toLowerCase().split('').reduce((total, char) => {
    if (vowels.includes(char)) {
      return total + (letterValues[char] || 0);
    }
    return total;
  }, 0);
  return reduceToSingleDigit(sum);
}

// Calculate Personality Number from consonants in name
function calculatePersonality(name: string): number {
  const sum = name.toLowerCase().split('').reduce((total, char) => {
    if (!vowels.includes(char) && letterValues[char]) {
      return total + letterValues[char];
    }
    return total;
  }, 0);
  return reduceToSingleDigit(sum);
}

// Calculate Maturity Number
function calculateMaturity(lifePath: number, destiny: number): number {
  return reduceToSingleDigit(lifePath + destiny);
}

// Calculate Personal Year Number
function calculatePersonalYear(birthDate: string): number {
  const [, month, day] = birthDate.split('-').map(Number);
  const currentYear = new Date().getFullYear();
  const sum = reduceToSingleDigit(day) + reduceToSingleDigit(month) + reduceToSingleDigit(currentYear);
  return reduceToSingleDigit(sum);
}

// Get number characteristics
function getCharacteristics(num: number): { characteristics: string[], strengths: string[], challenges: string[], careers: string[] } {
  const data: Record<number, { characteristics: string[], strengths: string[], challenges: string[], careers: string[] }> = {
    1: {
      characteristics: ["Independent", "Leadership", "Pioneering", "Ambitious", "Original"],
      strengths: ["Self-motivation", "Determination", "Innovation", "Courage"],
      challenges: ["Stubbornness", "Impatience", "Self-centeredness"],
      careers: ["Entrepreneur", "CEO", "Inventor", "Director", "Military Leader"]
    },
    2: {
      characteristics: ["Diplomatic", "Cooperative", "Sensitive", "Peaceful", "Intuitive"],
      strengths: ["Mediation", "Partnership", "Patience", "Attention to detail"],
      challenges: ["Over-sensitivity", "Indecision", "Shyness"],
      careers: ["Counselor", "Diplomat", "Teacher", "Healer", "Artist"]
    },
    3: {
      characteristics: ["Creative", "Expressive", "Social", "Optimistic", "Artistic"],
      strengths: ["Communication", "Creativity", "Enthusiasm", "Inspiration"],
      challenges: ["Scattered energy", "Superficiality", "Moodiness"],
      careers: ["Writer", "Actor", "Designer", "Musician", "Public Speaker"]
    },
    4: {
      characteristics: ["Practical", "Organized", "Hardworking", "Loyal", "Stable"],
      strengths: ["Discipline", "Reliability", "Building foundations", "Attention to detail"],
      challenges: ["Rigidity", "Stubbornness", "Workaholic tendencies"],
      careers: ["Engineer", "Accountant", "Architect", "Manager", "Banker"]
    },
    5: {
      characteristics: ["Adventurous", "Freedom-loving", "Versatile", "Dynamic", "Curious"],
      strengths: ["Adaptability", "Resourcefulness", "Progressive thinking", "Communication"],
      challenges: ["Restlessness", "Inconsistency", "Overindulgence"],
      careers: ["Travel Agent", "Journalist", "Sales", "Marketing", "Entertainer"]
    },
    6: {
      characteristics: ["Nurturing", "Responsible", "Loving", "Protective", "Harmonious"],
      strengths: ["Caregiving", "Responsibility", "Artistic ability", "Community service"],
      challenges: ["Over-protectiveness", "Self-sacrifice", "Worry"],
      careers: ["Doctor", "Nurse", "Teacher", "Interior Designer", "Social Worker"]
    },
    7: {
      characteristics: ["Analytical", "Spiritual", "Introspective", "Wise", "Mysterious"],
      strengths: ["Research", "Analysis", "Intuition", "Spiritual understanding"],
      challenges: ["Isolation", "Skepticism", "Secretiveness"],
      careers: ["Scientist", "Researcher", "Philosopher", "Analyst", "Spiritual Teacher"]
    },
    8: {
      characteristics: ["Ambitious", "Authoritative", "Successful", "Material", "Powerful"],
      strengths: ["Business acumen", "Leadership", "Organization", "Financial management"],
      challenges: ["Materialism", "Workaholism", "Domination"],
      careers: ["Business Executive", "Banker", "Real Estate", "Lawyer", "Politician"]
    },
    9: {
      characteristics: ["Humanitarian", "Compassionate", "Generous", "Creative", "Romantic"],
      strengths: ["Compassion", "Artistic talent", "Wisdom", "Selflessness"],
      challenges: ["Over-idealism", "Emotional volatility", "Aloofness"],
      careers: ["Humanitarian", "Artist", "Healer", "Philanthropist", "Teacher"]
    },
    11: {
      characteristics: ["Visionary", "Intuitive", "Inspirational", "Idealistic", "Spiritual"],
      strengths: ["Spiritual insight", "Inspiration", "Invention", "Leadership"],
      challenges: ["Nervous tension", "Impracticality", "Self-doubt"],
      careers: ["Spiritual Leader", "Inventor", "Artist", "Psychic", "Motivational Speaker"]
    },
    22: {
      characteristics: ["Master Builder", "Visionary", "Practical", "Ambitious", "Powerful"],
      strengths: ["Large-scale achievement", "Practical idealism", "Leadership", "Diplomacy"],
      challenges: ["Overwhelm", "Nervous tension", "Manipulation"],
      careers: ["Architect", "International Leader", "Diplomat", "Philanthropist", "CEO"]
    },
    33: {
      characteristics: ["Master Teacher", "Nurturing", "Selfless", "Spiritual", "Healing"],
      strengths: ["Healing", "Teaching", "Compassion", "Spiritual mastery"],
      challenges: ["Martyrdom", "Over-responsibility", "Emotional burden"],
      careers: ["Spiritual Teacher", "Healer", "Counselor", "Humanitarian Leader", "Artist"]
    }
  };
  
  return data[num] || data[9];
}

// Get lucky attributes
function getLuckyAttributes(lifePath: number): { colors: string[], days: string[], numbers: number[] } {
  const data: Record<number, { colors: string[], days: string[], numbers: number[] }> = {
    1: { colors: ["Red", "Orange", "Gold"], days: ["Sunday"], numbers: [1, 10, 19, 28] },
    2: { colors: ["White", "Cream", "Green"], days: ["Monday"], numbers: [2, 11, 20, 29] },
    3: { colors: ["Yellow", "Purple", "Pink"], days: ["Thursday"], numbers: [3, 12, 21, 30] },
    4: { colors: ["Blue", "Grey", "Khaki"], days: ["Saturday", "Sunday"], numbers: [4, 13, 22, 31] },
    5: { colors: ["Green", "White", "Grey"], days: ["Wednesday"], numbers: [5, 14, 23] },
    6: { colors: ["Blue", "Pink", "White"], days: ["Friday"], numbers: [6, 15, 24] },
    7: { colors: ["Green", "Yellow", "White"], days: ["Monday"], numbers: [7, 16, 25] },
    8: { colors: ["Black", "Blue", "Grey"], days: ["Saturday"], numbers: [8, 17, 26] },
    9: { colors: ["Red", "Pink", "Coral"], days: ["Tuesday"], numbers: [9, 18, 27] },
    11: { colors: ["White", "Silver", "Violet"], days: ["Monday"], numbers: [11, 29, 38, 47] },
    22: { colors: ["Coral", "White", "Cream"], days: ["All days"], numbers: [22, 40, 48] },
    33: { colors: ["Purple", "Blue", "Pink"], days: ["Thursday"], numbers: [33, 42, 51] }
  };
  
  return data[lifePath] || data[9];
}

// Get compatible numbers
function getCompatibility(lifePath: number): number[] {
  const compatibility: Record<number, number[]> = {
    1: [1, 3, 5, 7, 9],
    2: [2, 4, 6, 8],
    3: [1, 3, 5, 6, 9],
    4: [2, 4, 6, 8],
    5: [1, 3, 5, 7, 9],
    6: [2, 3, 4, 6, 9],
    7: [1, 5, 7],
    8: [2, 4, 6, 8],
    9: [1, 3, 5, 6, 9],
    11: [2, 4, 6, 11, 22],
    22: [4, 6, 8, 11, 22],
    33: [3, 6, 9, 11, 33]
  };
  
  return compatibility[lifePath] || [1, 5, 9];
}

export default function NumerologyPage() {
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [result, setResult] = useState<NumerologyResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCalculating(true);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const lifePath = calculateLifePath(birthDate);
    const destiny = calculateDestiny(name);
    const soul = calculateSoul(name);
    const personality = calculatePersonality(name);
    const maturity = calculateMaturity(lifePath, destiny);
    const personalYear = calculatePersonalYear(birthDate);
    
    const chars = getCharacteristics(lifePath);
    const lucky = getLuckyAttributes(lifePath);
    const compatible = getCompatibility(lifePath);
    
    setResult({
      lifePath,
      destiny,
      soul,
      personality,
      maturity,
      personalYear,
      luckyNumbers: lucky.numbers,
      luckyColors: lucky.colors,
      luckyDays: lucky.days,
      characteristics: chars.characteristics,
      strengths: chars.strengths,
      challenges: chars.challenges,
      careerSuggestions: chars.careers,
      compatibility: compatible
    });
    
    setIsCalculating(false);
  };

  // Get translated number meaning
  const getNumberMeaning = (num: number): string => {
    const defaultMeanings: Record<number, string> = {
      1: "The Leader - Independent, ambitious, and pioneering",
      2: "The Peacemaker - Diplomatic, cooperative, and sensitive",
      3: "The Communicator - Creative, expressive, and social",
      4: "The Builder - Practical, organized, and hardworking",
      5: "The Freedom Seeker - Adventurous, versatile, and dynamic",
      6: "The Nurturer - Responsible, loving, and protective",
      7: "The Seeker - Analytical, spiritual, and introspective",
      8: "The Achiever - Ambitious, authoritative, and successful",
      9: "The Humanitarian - Compassionate, generous, and wise",
      11: "The Intuitive - Visionary, inspirational, and spiritual (Master Number)",
      22: "The Master Builder - Practical visionary with great potential (Master Number)",
      33: "The Master Teacher - Selfless, nurturing, and spiritually evolved (Master Number)"
    };
    return t(`numerology.numberMeanings.${num}`, defaultMeanings[num] || defaultMeanings[9]);
  };

  // Get translated color name
  const getTranslatedColor = (color: string): string => {
    return t(`numerology.colors.${color}`, color);
  };

  // Get translated day name
  const getTranslatedDay = (day: string): string => {
    return t(`numerology.days.${day}`, day);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-50 to-purple-50">
      {/* Hero Section */}
      <section className="relative py-16 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url('${CDN_IMAGES.starsPattern}')` }}></div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <Badge className="mb-4 bg-white/20 text-white border-white/30">
              <Hash className="w-3 h-3 mr-1" />
              {t("numerology.badge", "Numerology Calculator")}
            </Badge>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              {t("numerology.title", "Discover Your Numbers")}
            </h1>
            <p className="text-lg text-indigo-100 max-w-2xl mx-auto">
              {t("numerology.subtitle", "Unlock the secrets of your life through the ancient science of Numerology. Calculate your Life Path, Destiny, Soul, and more.")}
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Input Form */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-indigo-600" />
                  {t("numerology.enterDetails", "Enter Your Details")}
                </CardTitle>
                <CardDescription>
                  {t("numerology.enterDetailsDesc", "Calculate your numerology profile")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCalculate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t("common.fullName", "Full Name")}</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={t("numerology.namePlaceholder", "Enter your full birth name")}
                        className="pl-10"
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      {t("numerology.nameHint", "Use your full name as given at birth")}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="birthDate">{t("common.birthDate", "Birth Date")}</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="birthDate"
                        type="date"
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                    disabled={isCalculating}
                  >
                    {isCalculating ? (
                      <>
                        <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                        {t("numerology.calculating", "Calculating...")}
                      </>
                    ) : (
                      <>
                        <Hash className="w-4 h-4 mr-2" />
                        {t("numerology.calculate", "Calculate My Numbers")}
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-2">
            {!result ? (
              <Card className="h-full flex items-center justify-center min-h-[400px]">
                <CardContent className="text-center py-12">
                  <Hash className="w-16 h-16 text-indigo-200 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    {t("numerology.noResult", "Enter your details")}
                  </h3>
                  <p className="text-gray-500 max-w-md">
                    {t("numerology.noResultDesc", "Fill in your name and birth date to discover your numerology profile, lucky numbers, and life path insights.")}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* Core Numbers Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                    <CardContent className="p-4 text-center">
                      <div className="text-4xl font-bold mb-1">{result.lifePath}</div>
                      <div className="text-sm opacity-90">{t("numerology.lifePath", "Life Path")}</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white">
                    <CardContent className="p-4 text-center">
                      <div className="text-4xl font-bold mb-1">{result.destiny}</div>
                      <div className="text-sm opacity-90">{t("numerology.destiny", "Destiny")}</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-pink-500 to-red-600 text-white">
                    <CardContent className="p-4 text-center">
                      <div className="text-4xl font-bold mb-1">{result.soul}</div>
                      <div className="text-sm opacity-90">{t("numerology.soul", "Soul Urge")}</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
                    <CardContent className="p-4 text-center">
                      <div className="text-4xl font-bold mb-1">{result.personality}</div>
                      <div className="text-sm opacity-90">{t("numerology.personality", "Personality")}</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-teal-500 to-green-600 text-white">
                    <CardContent className="p-4 text-center">
                      <div className="text-4xl font-bold mb-1">{result.maturity}</div>
                      <div className="text-sm opacity-90">{t("numerology.maturity", "Maturity")}</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-orange-500 to-amber-600 text-white">
                    <CardContent className="p-4 text-center">
                      <div className="text-4xl font-bold mb-1">{result.personalYear}</div>
                      <div className="text-sm opacity-90">{t("numerology.personalYear", "Personal Year")}</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Tabs for detailed info */}
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">{t("numerology.overview", "Overview")}</TabsTrigger>
                    <TabsTrigger value="traits">{t("numerology.traits", "Traits")}</TabsTrigger>
                    <TabsTrigger value="lucky">{t("numerology.lucky", "Lucky")}</TabsTrigger>
                    <TabsTrigger value="compatibility">{t("numerology.compatibility", "Compatibility")}</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview">
                    <Card>
                      <CardHeader>
                        <CardTitle>{t("numerology.lifePathMeaning", "Your Life Path Number")}: {result.lifePath}</CardTitle>
                        <CardDescription>{getNumberMeaning(result.lifePath)}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="p-4 bg-indigo-50 rounded-lg">
                            <h4 className="font-semibold text-indigo-700 mb-2 flex items-center gap-2">
                              <Star className="w-4 h-4" />
                              {t("numerology.destinyNumber", "Destiny Number")}: {result.destiny}
                            </h4>
                            <p className="text-sm text-gray-600">{getNumberMeaning(result.destiny)}</p>
                          </div>
                          <div className="p-4 bg-purple-50 rounded-lg">
                            <h4 className="font-semibold text-purple-700 mb-2 flex items-center gap-2">
                              <Heart className="w-4 h-4" />
                              {t("numerology.soulNumber", "Soul Urge Number")}: {result.soul}
                            </h4>
                            <p className="text-sm text-gray-600">{getNumberMeaning(result.soul)}</p>
                          </div>
                          <div className="p-4 bg-pink-50 rounded-lg">
                            <h4 className="font-semibold text-pink-700 mb-2 flex items-center gap-2">
                              <User className="w-4 h-4" />
                              {t("numerology.personalityNumber", "Personality Number")}: {result.personality}
                            </h4>
                            <p className="text-sm text-gray-600">{getNumberMeaning(result.personality)}</p>
                          </div>
                          <div className="p-4 bg-blue-50 rounded-lg">
                            <h4 className="font-semibold text-blue-700 mb-2 flex items-center gap-2">
                              <TrendingUp className="w-4 h-4" />
                              {t("numerology.maturityNumber", "Maturity Number")}: {result.maturity}
                            </h4>
                            <p className="text-sm text-gray-600">{getNumberMeaning(result.maturity)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="traits">
                    <Card>
                      <CardHeader>
                        <CardTitle>{t("numerology.personalityTraits", "Personality Traits")}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div>
                          <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-indigo-500" />
                            {t("numerology.characteristics", "Key Characteristics")}
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {result.characteristics.map((char, idx) => (
                              <Badge key={idx} variant="secondary" className="bg-indigo-100 text-indigo-700">
                                {char}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <Shield className="w-4 h-4 text-green-500" />
                            {t("numerology.strengths", "Strengths")}
                          </h4>
                          <ul className="space-y-2">
                            {result.strengths.map((strength, idx) => (
                              <li key={idx} className="flex items-center gap-2 text-sm">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                {strength}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <Zap className="w-4 h-4 text-orange-500" />
                            {t("numerology.challenges", "Challenges")}
                          </h4>
                          <ul className="space-y-2">
                            {result.challenges.map((challenge, idx) => (
                              <li key={idx} className="flex items-center gap-2 text-sm">
                                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                {challenge}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-blue-500" />
                            {t("numerology.careerSuggestions", "Career Suggestions")}
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {result.careerSuggestions.map((career, idx) => (
                              <Badge key={idx} variant="outline" className="border-blue-300 text-blue-700">
                                {career}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="lucky">
                    <Card>
                      <CardHeader>
                        <CardTitle>{t("numerology.luckyAttributes", "Lucky Attributes")}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid md:grid-cols-3 gap-4">
                          <div className="p-4 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-lg border border-amber-200">
                            <h4 className="font-semibold text-amber-700 mb-3">
                              {t("numerology.luckyNumbers", "Lucky Numbers")}
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {result.luckyNumbers.map((num, idx) => (
                                <span key={idx} className="w-10 h-10 flex items-center justify-center bg-amber-500 text-white rounded-full font-bold">
                                  {num}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          <div className="p-4 bg-gradient-to-br from-pink-50 to-rose-50 rounded-lg border border-pink-200">
                            <h4 className="font-semibold text-pink-700 mb-3">
                              {t("numerology.luckyColors", "Lucky Colors")}
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                                            {result.luckyColors.map((color, idx) => (
                                                              <Badge key={idx} className="bg-pink-100 text-pink-700">
                                                                {getTranslatedColor(color)}
                                                              </Badge>
                                                            ))}
                            </div>
                          </div>
                          
                          <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                            <h4 className="font-semibold text-blue-700 mb-3">
                              {t("numerology.luckyDays", "Lucky Days")}
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                                            {result.luckyDays.map((day, idx) => (
                                                              <Badge key={idx} className="bg-blue-100 text-blue-700">
                                                                {getTranslatedDay(day)}
                                                              </Badge>
                                                            ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="compatibility">
                    <Card>
                      <CardHeader>
                        <CardTitle>{t("numerology.numberCompatibility", "Number Compatibility")}</CardTitle>
                        <CardDescription>
                          {t("numerology.compatibilityDesc", "Life Path numbers that are most compatible with yours")}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-4 justify-center">
                          {result.compatibility.map((num, idx) => (
                            <div key={idx} className="text-center">
                              <div className="w-16 h-16 flex items-center justify-center bg-gradient-to-br from-pink-500 to-red-500 text-white rounded-full text-2xl font-bold mb-2">
                                {num}
                              </div>
                              <p className="text-xs text-gray-500">{getNumberMeaning(num).split(' - ')[0]}</p>
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-6 p-4 bg-pink-50 rounded-lg">
                          <h4 className="font-semibold text-pink-700 mb-2">
                            {t("numerology.compatibilityTip", "Compatibility Tip")}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {t("numerology.compatibilityTipText", "While these numbers are naturally compatible with your Life Path, remember that any relationship can work with understanding and effort. Use this as a guide, not a rule.")}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>
        </div>

        {/* About Numerology Section */}
        <section className="mt-16">
          <Card>
            <CardHeader>
              <CardTitle>{t("numerology.aboutTitle", "About Numerology")}</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p className="text-gray-600">
                {t("numerology.aboutText1", "Numerology is an ancient metaphysical science that studies the mystical relationship between numbers and events in our lives. It dates back thousands of years and has been practiced by many civilizations including the Babylonians, Egyptians, Greeks, and Indians.")}
              </p>
              <p className="text-gray-600 mt-4">
                {t("numerology.aboutText2", "The most common system used today is Pythagorean numerology, named after the Greek mathematician Pythagoras. This system assigns numerical values to letters and uses birth dates to calculate various core numbers that reveal insights about personality, life purpose, and destiny.")}
              </p>
              <p className="text-gray-600 mt-4">
                {t("numerology.aboutText3", "Your Life Path number is considered the most important number in numerology, revealing your life's purpose and the path you're meant to walk. Other numbers like Destiny, Soul Urge, and Personality provide additional layers of insight into your character and potential.")}
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
