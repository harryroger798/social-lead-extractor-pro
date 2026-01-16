"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Heart,
  Calendar,
  ArrowRight,
  Sparkles,
  Star,
  Users,
} from "lucide-react";

const zodiacCompatibility: Record<string, Record<string, number>> = {
  Aries: { Aries: 70, Taurus: 55, Gemini: 85, Cancer: 50, Leo: 95, Virgo: 45, Libra: 75, Scorpio: 60, Sagittarius: 90, Capricorn: 40, Aquarius: 80, Pisces: 65 },
  Taurus: { Aries: 55, Taurus: 75, Gemini: 50, Cancer: 90, Leo: 60, Virgo: 95, Libra: 70, Scorpio: 85, Sagittarius: 45, Capricorn: 92, Aquarius: 55, Pisces: 88 },
  Gemini: { Aries: 85, Taurus: 50, Gemini: 70, Cancer: 55, Leo: 88, Virgo: 60, Libra: 95, Scorpio: 45, Sagittarius: 80, Capricorn: 50, Aquarius: 92, Pisces: 55 },
  Cancer: { Aries: 50, Taurus: 90, Gemini: 55, Cancer: 75, Leo: 65, Virgo: 85, Libra: 55, Scorpio: 95, Sagittarius: 45, Capricorn: 70, Aquarius: 50, Pisces: 92 },
  Leo: { Aries: 95, Taurus: 60, Gemini: 88, Cancer: 65, Leo: 75, Virgo: 55, Libra: 85, Scorpio: 70, Sagittarius: 92, Capricorn: 50, Aquarius: 65, Pisces: 55 },
  Virgo: { Aries: 45, Taurus: 95, Gemini: 60, Cancer: 85, Leo: 55, Virgo: 70, Libra: 65, Scorpio: 88, Sagittarius: 50, Capricorn: 95, Aquarius: 55, Pisces: 80 },
  Libra: { Aries: 75, Taurus: 70, Gemini: 95, Cancer: 55, Leo: 85, Virgo: 65, Libra: 72, Scorpio: 60, Sagittarius: 88, Capricorn: 55, Aquarius: 92, Pisces: 65 },
  Scorpio: { Aries: 60, Taurus: 85, Gemini: 45, Cancer: 95, Leo: 70, Virgo: 88, Libra: 60, Scorpio: 75, Sagittarius: 55, Capricorn: 85, Aquarius: 50, Pisces: 95 },
  Sagittarius: { Aries: 90, Taurus: 45, Gemini: 80, Cancer: 45, Leo: 92, Virgo: 50, Libra: 88, Scorpio: 55, Sagittarius: 70, Capricorn: 55, Aquarius: 85, Pisces: 60 },
  Capricorn: { Aries: 40, Taurus: 92, Gemini: 50, Cancer: 70, Leo: 50, Virgo: 95, Libra: 55, Scorpio: 85, Sagittarius: 55, Capricorn: 75, Aquarius: 60, Pisces: 80 },
  Aquarius: { Aries: 80, Taurus: 55, Gemini: 92, Cancer: 50, Leo: 65, Virgo: 55, Libra: 92, Scorpio: 50, Sagittarius: 85, Capricorn: 60, Aquarius: 70, Pisces: 65 },
  Pisces: { Aries: 65, Taurus: 88, Gemini: 55, Cancer: 92, Leo: 55, Virgo: 80, Libra: 65, Scorpio: 95, Sagittarius: 60, Capricorn: 80, Aquarius: 65, Pisces: 75 },
};

const zodiacDates = [
  { sign: "Aries", start: { month: 3, day: 21 }, end: { month: 4, day: 19 } },
  { sign: "Taurus", start: { month: 4, day: 20 }, end: { month: 5, day: 20 } },
  { sign: "Gemini", start: { month: 5, day: 21 }, end: { month: 6, day: 20 } },
  { sign: "Cancer", start: { month: 6, day: 21 }, end: { month: 7, day: 22 } },
  { sign: "Leo", start: { month: 7, day: 23 }, end: { month: 8, day: 22 } },
  { sign: "Virgo", start: { month: 8, day: 23 }, end: { month: 9, day: 22 } },
  { sign: "Libra", start: { month: 9, day: 23 }, end: { month: 10, day: 22 } },
  { sign: "Scorpio", start: { month: 10, day: 23 }, end: { month: 11, day: 21 } },
  { sign: "Sagittarius", start: { month: 11, day: 22 }, end: { month: 12, day: 21 } },
  { sign: "Capricorn", start: { month: 12, day: 22 }, end: { month: 1, day: 19 } },
  { sign: "Aquarius", start: { month: 1, day: 20 }, end: { month: 2, day: 18 } },
  { sign: "Pisces", start: { month: 2, day: 19 }, end: { month: 3, day: 20 } },
];

const compatibilityMessages: Record<string, { title: string; description: string; advice: string }> = {
  excellent: {
    title: "Excellent Match!",
    description: "Your zodiac signs are highly compatible. This relationship has strong potential for lasting love and deep understanding.",
    advice: "Nurture this connection by maintaining open communication and celebrating your natural harmony.",
  },
  good: {
    title: "Good Compatibility",
    description: "You share a positive connection with good potential. While some differences exist, they can complement each other well.",
    advice: "Focus on your shared values and be patient with areas where you differ.",
  },
  moderate: {
    title: "Moderate Match",
    description: "Your compatibility is average with both harmonious and challenging aspects. Success requires effort from both partners.",
    advice: "Work on understanding each other's perspectives and find common ground.",
  },
  challenging: {
    title: "Challenging Match",
    description: "Your signs have significant differences that may require extra work to overcome. However, opposites can attract!",
    advice: "Focus on learning from each other and embrace your differences as opportunities for growth.",
  },
};

function getZodiacSign(dateStr: string): string {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();

  for (const zodiac of zodiacDates) {
    if (zodiac.start.month === zodiac.end.month) {
      if (month === zodiac.start.month && day >= zodiac.start.day && day <= zodiac.end.day) {
        return zodiac.sign;
      }
    } else if (zodiac.start.month > zodiac.end.month) {
      if ((month === zodiac.start.month && day >= zodiac.start.day) ||
          (month === zodiac.end.month && day <= zodiac.end.day)) {
        return zodiac.sign;
      }
    } else {
      if ((month === zodiac.start.month && day >= zodiac.start.day) ||
          (month === zodiac.end.month && day <= zodiac.end.day)) {
        return zodiac.sign;
      }
    }
  }
  return "Aries";
}

function getCompatibilityLevel(score: number): string {
  if (score >= 85) return "excellent";
  if (score >= 70) return "good";
  if (score >= 55) return "moderate";
  return "challenging";
}

interface CompatibilityResult {
  person1Sign: string;
  person2Sign: string;
  score: number;
  level: string;
  aspects: {
    emotional: number;
    intellectual: number;
    physical: number;
    spiritual: number;
  };
}

export default function LoveCalculatorPage() {
  const [person1Name, setPerson1Name] = useState("");
  const [person1Date, setPerson1Date] = useState("");
  const [person2Name, setPerson2Name] = useState("");
  const [person2Date, setPerson2Date] = useState("");
  const [result, setResult] = useState<CompatibilityResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleCalculate = async () => {
    if (!person1Date || !person2Date) return;
    
    setIsCalculating(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const sign1 = getZodiacSign(person1Date);
    const sign2 = getZodiacSign(person2Date);
    const baseScore = zodiacCompatibility[sign1][sign2];
    
    const nameBonus = (person1Name.length + person2Name.length) % 10;
    const finalScore = Math.min(99, baseScore + nameBonus);
    
    setResult({
      person1Sign: sign1,
      person2Sign: sign2,
      score: finalScore,
      level: getCompatibilityLevel(finalScore),
      aspects: {
        emotional: Math.min(100, baseScore + Math.floor(Math.random() * 15)),
        intellectual: Math.min(100, baseScore + Math.floor(Math.random() * 15) - 5),
        physical: Math.min(100, baseScore + Math.floor(Math.random() * 20) - 10),
        spiritual: Math.min(100, baseScore + Math.floor(Math.random() * 10)),
      },
    });
    setIsCalculating(false);
  };

  const message = result ? compatibilityMessages[result.level] : null;

  return (
    <div className="py-12 lg:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-pink-100 text-pink-800">Free Calculator</Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Love Compatibility Calculator
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Discover your romantic compatibility based on zodiac signs. Find out how well 
            you match with your partner in love, emotions, and life.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="border-pink-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-600" />
                Enter Your Details
              </CardTitle>
              <CardDescription>
                Enter birth dates to calculate zodiac compatibility
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-pink-50 rounded-lg p-4 space-y-4">
                <h3 className="font-semibold text-pink-800 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Person 1
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="name1">Name</Label>
                  <Input
                    id="name1"
                    placeholder="Enter name"
                    value={person1Name}
                    onChange={(e) => setPerson1Name(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date1" className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Date of Birth
                  </Label>
                  <Input
                    id="date1"
                    type="date"
                    value={person1Date}
                    onChange={(e) => setPerson1Date(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-center">
                <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center">
                  <Heart className="w-6 h-6 text-pink-500" />
                </div>
              </div>

              <div className="bg-red-50 rounded-lg p-4 space-y-4">
                <h3 className="font-semibold text-red-800 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Person 2
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="name2">Name</Label>
                  <Input
                    id="name2"
                    placeholder="Enter name"
                    value={person2Name}
                    onChange={(e) => setPerson2Name(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date2" className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Date of Birth
                  </Label>
                  <Input
                    id="date2"
                    type="date"
                    value={person2Date}
                    onChange={(e) => setPerson2Date(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <Button 
                onClick={handleCalculate}
                className="w-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600"
                disabled={!person1Date || !person2Date || isCalculating}
              >
                {isCalculating ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                    Calculating Love Match...
                  </>
                ) : (
                  <>
                    <Heart className="w-4 h-4 mr-2" />
                    Check Compatibility
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {result && message ? (
            <Card className="border-pink-200 bg-gradient-to-br from-pink-50 to-red-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-center justify-center">
                  <Heart className="w-6 h-6 text-pink-600" />
                  Love Compatibility Result
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">{person1Name || "Person 1"}</p>
                      <Badge className="bg-pink-500 text-lg px-3 py-1">{result.person1Sign}</Badge>
                    </div>
                    <Heart className="w-8 h-8 text-red-500 animate-pulse" />
                    <div className="text-center">
                      <p className="text-sm text-gray-600">{person2Name || "Person 2"}</p>
                      <Badge className="bg-red-500 text-lg px-3 py-1">{result.person2Sign}</Badge>
                    </div>
                  </div>
                  
                  <div className="relative w-32 h-32 mx-auto mb-4">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-200 to-red-200 animate-pulse"></div>
                    <div className="absolute inset-2 rounded-full bg-white flex items-center justify-center">
                      <span className="text-4xl font-bold text-pink-600">{result.score}%</span>
                    </div>
                  </div>
                  
                  <h2 className="text-2xl font-bold text-pink-700">{message.title}</h2>
                </div>

                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-gray-700">{message.description}</p>
                  </div>

                  <div className="bg-white rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Compatibility Aspects</h3>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Emotional Connection</span>
                          <span>{result.aspects.emotional}%</span>
                        </div>
                        <Progress value={result.aspects.emotional} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Intellectual Bond</span>
                          <span>{result.aspects.intellectual}%</span>
                        </div>
                        <Progress value={result.aspects.intellectual} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Physical Chemistry</span>
                          <span>{result.aspects.physical}%</span>
                        </div>
                        <Progress value={result.aspects.physical} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Spiritual Harmony</span>
                          <span>{result.aspects.spiritual}%</span>
                        </div>
                        <Progress value={result.aspects.spiritual} className="h-2" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-amber-50 rounded-lg p-4">
                    <h3 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      Relationship Advice
                    </h3>
                    <p className="text-amber-700">{message.advice}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-pink-200 bg-pink-50/50">
              <CardContent className="flex flex-col items-center justify-center h-full py-12">
                <div className="w-24 h-24 rounded-full bg-pink-100 flex items-center justify-center mb-4">
                  <Heart className="w-12 h-12 text-pink-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Your Love Match Will Appear Here
                </h3>
                <p className="text-gray-600 text-center max-w-xs">
                  Enter both birth dates and click &quot;Check Compatibility&quot; to discover 
                  your romantic compatibility score.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <Card className="border-amber-200 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-2">Horoscope Matching</h3>
              <p className="text-gray-600 text-sm mb-4">
                Detailed Kundli matching for marriage compatibility.
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
              <h3 className="font-semibold text-lg mb-2">Mangal Dosh Check</h3>
              <p className="text-gray-600 text-sm mb-4">
                Check for Manglik Dosha affecting marriage.
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/tools/mangal-dosh-calculator">
                  Check Dosha <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-amber-200 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-2">Daily Love Horoscope</h3>
              <p className="text-gray-600 text-sm mb-4">
                Read today&apos;s love predictions for your sign.
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/daily-horoscope">
                  Read Now <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="border-pink-200 bg-pink-50 mt-12">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Understanding Zodiac Love Compatibility
            </h2>
            <div className="prose prose-pink max-w-none">
              <p className="text-gray-700 mb-4">
                Zodiac compatibility is based on the elemental and modal relationships between 
                signs. Signs of the same element (Fire, Earth, Air, Water) typically share 
                natural understanding, while complementary elements can create dynamic partnerships.
              </p>
              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                Element Compatibility
              </h3>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="bg-red-50 rounded-lg p-4">
                  <h4 className="font-semibold text-red-800">Fire Signs (Aries, Leo, Sagittarius)</h4>
                  <p className="text-sm text-red-700">Best with Fire and Air signs. Passionate and energetic relationships.</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800">Earth Signs (Taurus, Virgo, Capricorn)</h4>
                  <p className="text-sm text-green-700">Best with Earth and Water signs. Stable and nurturing relationships.</p>
                </div>
                <div className="bg-cyan-50 rounded-lg p-4">
                  <h4 className="font-semibold text-cyan-800">Air Signs (Gemini, Libra, Aquarius)</h4>
                  <p className="text-sm text-cyan-700">Best with Air and Fire signs. Intellectual and communicative bonds.</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800">Water Signs (Cancer, Scorpio, Pisces)</h4>
                  <p className="text-sm text-blue-700">Best with Water and Earth signs. Deep emotional connections.</p>
                </div>
              </div>
              <p className="text-gray-700">
                While zodiac compatibility provides insights, remember that successful relationships 
                depend on many factors including communication, respect, and shared values. Use this 
                calculator as a fun guide, but trust your heart and personal experience above all.
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
            "@type": "WebApplication",
            name: "Love Compatibility Calculator",
            description: "Calculate love compatibility between zodiac signs based on birth dates",
            url: "https://vedicstarastro.com/tools/love-calculator",
            applicationCategory: "LifestyleApplication",
            operatingSystem: "Web",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "INR",
            },
          }),
        }}
      />
    </div>
  );
}
