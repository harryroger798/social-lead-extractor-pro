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
  Sun,
  Calendar,
  ArrowRight,
  Sparkles,
  Flame,
  Droplets,
  Wind,
  Mountain,
} from "lucide-react";

const sunSignData = {
  Aries: {
    hindi: "मेष",
    symbol: "♈",
    element: "Fire",
    quality: "Cardinal",
    ruler: "Mars",
    dates: "March 21 - April 19",
    traits: ["Bold", "Ambitious", "Competitive", "Energetic", "Pioneering"],
    description: "Aries is the first sign of the zodiac, representing new beginnings and initiative. As a fire sign ruled by Mars, Aries individuals are natural leaders who thrive on challenges and competition.",
    strengths: ["Courageous", "Determined", "Confident", "Enthusiastic", "Optimistic"],
    weaknesses: ["Impatient", "Impulsive", "Short-tempered", "Aggressive"],
    career: ["Entrepreneur", "Military", "Sports", "Sales", "Emergency Services"],
    compatibility: ["Leo", "Sagittarius", "Gemini", "Aquarius"],
  },
  Taurus: {
    hindi: "वृषभ",
    symbol: "♉",
    element: "Earth",
    quality: "Fixed",
    ruler: "Venus",
    dates: "April 20 - May 20",
    traits: ["Reliable", "Patient", "Practical", "Devoted", "Sensual"],
    description: "Taurus is an earth sign known for stability and determination. Ruled by Venus, Taurus individuals appreciate beauty, comfort, and the finer things in life.",
    strengths: ["Dependable", "Patient", "Practical", "Devoted", "Responsible"],
    weaknesses: ["Stubborn", "Possessive", "Uncompromising", "Materialistic"],
    career: ["Finance", "Real Estate", "Art", "Music", "Culinary Arts"],
    compatibility: ["Virgo", "Capricorn", "Cancer", "Pisces"],
  },
  Gemini: {
    hindi: "मिथुन",
    symbol: "♊",
    element: "Air",
    quality: "Mutable",
    ruler: "Mercury",
    dates: "May 21 - June 20",
    traits: ["Versatile", "Curious", "Communicative", "Witty", "Adaptable"],
    description: "Gemini is an air sign symbolized by the twins, representing duality and versatility. Ruled by Mercury, Geminis are excellent communicators with quick minds.",
    strengths: ["Gentle", "Affectionate", "Curious", "Adaptable", "Quick learner"],
    weaknesses: ["Nervous", "Inconsistent", "Indecisive", "Superficial"],
    career: ["Journalism", "Teaching", "Writing", "Marketing", "Public Relations"],
    compatibility: ["Libra", "Aquarius", "Aries", "Leo"],
  },
  Cancer: {
    hindi: "कर्क",
    symbol: "♋",
    element: "Water",
    quality: "Cardinal",
    ruler: "Moon",
    dates: "June 21 - July 22",
    traits: ["Nurturing", "Intuitive", "Protective", "Emotional", "Loyal"],
    description: "Cancer is a water sign ruled by the Moon, making it deeply connected to emotions and intuition. Cancerians are natural nurturers who value family and home.",
    strengths: ["Tenacious", "Loyal", "Emotional", "Sympathetic", "Persuasive"],
    weaknesses: ["Moody", "Pessimistic", "Suspicious", "Manipulative"],
    career: ["Healthcare", "Social Work", "Hospitality", "Real Estate", "Childcare"],
    compatibility: ["Scorpio", "Pisces", "Taurus", "Virgo"],
  },
  Leo: {
    hindi: "सिंह",
    symbol: "♌",
    element: "Fire",
    quality: "Fixed",
    ruler: "Sun",
    dates: "July 23 - August 22",
    traits: ["Confident", "Creative", "Generous", "Dramatic", "Charismatic"],
    description: "Leo is a fire sign ruled by the Sun, the center of our solar system. Leos naturally gravitate toward the spotlight and possess natural leadership qualities.",
    strengths: ["Creative", "Passionate", "Generous", "Warm-hearted", "Cheerful"],
    weaknesses: ["Arrogant", "Stubborn", "Self-centered", "Lazy", "Inflexible"],
    career: ["Entertainment", "Politics", "Management", "Fashion", "Education"],
    compatibility: ["Aries", "Sagittarius", "Gemini", "Libra"],
  },
  Virgo: {
    hindi: "कन्या",
    symbol: "♍",
    element: "Earth",
    quality: "Mutable",
    ruler: "Mercury",
    dates: "August 23 - September 22",
    traits: ["Analytical", "Practical", "Diligent", "Modest", "Perfectionist"],
    description: "Virgo is an earth sign known for attention to detail and analytical thinking. Ruled by Mercury, Virgos excel at problem-solving and organization.",
    strengths: ["Loyal", "Analytical", "Kind", "Hardworking", "Practical"],
    weaknesses: ["Shyness", "Worry", "Overly critical", "All work no play"],
    career: ["Healthcare", "Research", "Accounting", "Editing", "Quality Control"],
    compatibility: ["Taurus", "Capricorn", "Cancer", "Scorpio"],
  },
  Libra: {
    hindi: "तुला",
    symbol: "♎",
    element: "Air",
    quality: "Cardinal",
    ruler: "Venus",
    dates: "September 23 - October 22",
    traits: ["Diplomatic", "Fair-minded", "Social", "Cooperative", "Gracious"],
    description: "Libra is an air sign symbolized by the scales, representing balance and justice. Ruled by Venus, Libras have a natural appreciation for beauty and harmony.",
    strengths: ["Cooperative", "Diplomatic", "Gracious", "Fair-minded", "Social"],
    weaknesses: ["Indecisive", "Avoids confrontation", "Self-pity", "Grudge-holding"],
    career: ["Law", "Diplomacy", "Design", "Counseling", "Human Resources"],
    compatibility: ["Gemini", "Aquarius", "Leo", "Sagittarius"],
  },
  Scorpio: {
    hindi: "वृश्चिक",
    symbol: "♏",
    element: "Water",
    quality: "Fixed",
    ruler: "Mars/Pluto",
    dates: "October 23 - November 21",
    traits: ["Passionate", "Resourceful", "Brave", "Mysterious", "Intense"],
    description: "Scorpio is a water sign known for intensity and depth. Ruled by Mars and Pluto, Scorpios are transformative individuals with powerful emotional intelligence.",
    strengths: ["Resourceful", "Brave", "Passionate", "Stubborn", "True friend"],
    weaknesses: ["Distrusting", "Jealous", "Secretive", "Violent"],
    career: ["Investigation", "Psychology", "Research", "Surgery", "Finance"],
    compatibility: ["Cancer", "Pisces", "Virgo", "Capricorn"],
  },
  Sagittarius: {
    hindi: "धनु",
    symbol: "♐",
    element: "Fire",
    quality: "Mutable",
    ruler: "Jupiter",
    dates: "November 22 - December 21",
    traits: ["Optimistic", "Adventurous", "Philosophical", "Freedom-loving", "Honest"],
    description: "Sagittarius is a fire sign symbolized by the archer, representing the quest for knowledge and truth. Ruled by Jupiter, Sagittarians are natural explorers.",
    strengths: ["Generous", "Idealistic", "Great sense of humor", "Adventurous"],
    weaknesses: ["Promises more than can deliver", "Impatient", "Tactless"],
    career: ["Travel", "Education", "Publishing", "Philosophy", "Sports"],
    compatibility: ["Aries", "Leo", "Libra", "Aquarius"],
  },
  Capricorn: {
    hindi: "मकर",
    symbol: "♑",
    element: "Earth",
    quality: "Cardinal",
    ruler: "Saturn",
    dates: "December 22 - January 19",
    traits: ["Ambitious", "Disciplined", "Responsible", "Patient", "Practical"],
    description: "Capricorn is an earth sign known for ambition and discipline. Ruled by Saturn, Capricorns are master planners who achieve success through hard work.",
    strengths: ["Responsible", "Disciplined", "Self-control", "Good managers"],
    weaknesses: ["Know-it-all", "Unforgiving", "Condescending", "Pessimistic"],
    career: ["Business", "Government", "Engineering", "Architecture", "Banking"],
    compatibility: ["Taurus", "Virgo", "Scorpio", "Pisces"],
  },
  Aquarius: {
    hindi: "कुंभ",
    symbol: "♒",
    element: "Air",
    quality: "Fixed",
    ruler: "Saturn/Uranus",
    dates: "January 20 - February 18",
    traits: ["Progressive", "Original", "Independent", "Humanitarian", "Innovative"],
    description: "Aquarius is an air sign known for originality and humanitarian ideals. Ruled by Uranus, Aquarians are visionaries who think ahead of their time.",
    strengths: ["Progressive", "Original", "Independent", "Humanitarian"],
    weaknesses: ["Runs from emotional expression", "Temperamental", "Uncompromising"],
    career: ["Technology", "Science", "Social Work", "Aviation", "Invention"],
    compatibility: ["Gemini", "Libra", "Aries", "Sagittarius"],
  },
  Pisces: {
    hindi: "मीन",
    symbol: "♓",
    element: "Water",
    quality: "Mutable",
    ruler: "Jupiter/Neptune",
    dates: "February 19 - March 20",
    traits: ["Compassionate", "Artistic", "Intuitive", "Gentle", "Wise"],
    description: "Pisces is a water sign symbolized by two fish swimming in opposite directions, representing the constant division between fantasy and reality.",
    strengths: ["Compassionate", "Artistic", "Intuitive", "Gentle", "Wise", "Musical"],
    weaknesses: ["Fearful", "Overly trusting", "Sad", "Desire to escape reality"],
    career: ["Arts", "Music", "Healthcare", "Spirituality", "Photography"],
    compatibility: ["Cancer", "Scorpio", "Taurus", "Capricorn"],
  },
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

function calculateSunSign(dateStr: string): string {
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

const ElementIcon = ({ element }: { element: string }) => {
  switch (element) {
    case "Fire":
      return <Flame className="w-5 h-5 text-red-500" />;
    case "Water":
      return <Droplets className="w-5 h-5 text-blue-500" />;
    case "Air":
      return <Wind className="w-5 h-5 text-cyan-500" />;
    case "Earth":
      return <Mountain className="w-5 h-5 text-green-600" />;
    default:
      return null;
  }
};

export default function SunSignCalculatorPage() {
  const { t } = useLanguage();
  const [birthDate, setBirthDate] = useState("");
  const [sunSign, setSunSign] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleCalculate = async () => {
    if (!birthDate) return;
    
    setIsCalculating(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const sign = calculateSunSign(birthDate);
    setSunSign(sign);
    setIsCalculating(false);
  };

  const signData = sunSign ? sunSignData[sunSign as keyof typeof sunSignData] : null;

  return (
    <div className="py-12 lg:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-orange-100 text-orange-800">{t('calculator.freeTool', 'Free Calculator')}</Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {t('calculator.sunSignCalc.title', 'Sun Sign Calculator (Surya Rashi)')}
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {t('calculator.sunSignCalc.subtitle', 'Discover your Sun Sign based on your birth date. Your Sun Sign represents your core identity, ego, and the essence of who you are.')}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sun className="w-5 h-5 text-orange-600" />
                {t('calculator.enterBirthDate', 'Enter Your Birth Date')}
              </CardTitle>
              <CardDescription>
                {t('calculator.sunSignCalc.sunPositionNote', 'Your Sun Sign is determined by the position of the Sun on your birth date')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                  required
                />
              </div>
              
              <Button 
                onClick={handleCalculate}
                className="w-full bg-amber-600 hover:bg-amber-700"
                disabled={!birthDate || isCalculating}
              >
                {isCalculating ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                    {t('calculator.calculating', 'Calculating...')}
                  </>
                ) : (
                  <>
                    <Sun className="w-4 h-4 mr-2" />
                    {t('calculator.sunSignCalc.findSunSign', 'Find My Sun Sign')}
                  </>
                )}
              </Button>

              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold text-gray-900 mb-3">{t('calculator.sunSignCalc.quickReference', 'Quick Reference')}</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {zodiacDates.map((zodiac) => (
                    <div key={zodiac.sign} className="flex items-center gap-2 text-gray-600">
                      <span>{sunSignData[zodiac.sign as keyof typeof sunSignData].symbol}</span>
                      <span>{zodiac.sign}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {sunSign && signData ? (
            <Card className="border-orange-200 bg-amber-50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-4xl">{signData.symbol}</span>
                    {t('calculator.sunSignCalc.yourSunSign', 'Your Sun Sign')}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <ElementIcon element={signData.element} />
                    <Badge className="bg-orange-500">{signData.element}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <h2 className="text-3xl font-bold text-orange-700">{sunSign}</h2>
                  <p className="text-xl text-gray-600">{signData.hindi}</p>
                  <p className="text-sm text-gray-500">{signData.dates}</p>
                  <p className="text-sm text-gray-500">{t('calculator.ruledBy', 'Ruled by')} {signData.ruler} | {signData.quality}</p>
                </div>

                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{t('calculator.sunSignCalc.about', 'About')} {sunSign}</h3>
                    <p className="text-gray-700">{signData.description}</p>
                  </div>

                  <div className="bg-white rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{t('calculator.keyTraits', 'Key Traits')}</h3>
                    <div className="flex flex-wrap gap-2">
                      {signData.traits.map((trait) => (
                        <Badge key={trait} variant="secondary" className="bg-orange-100 text-orange-700">
                          {trait}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-50 rounded-lg p-3">
                      <h4 className="font-semibold text-green-800 mb-2">{t('calculator.strengths', 'Strengths')}</h4>
                      <ul className="text-sm text-green-700 space-y-1">
                        {signData.strengths.slice(0, 4).map((s) => (
                          <li key={s}>• {s}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-red-50 rounded-lg p-3">
                      <h4 className="font-semibold text-red-800 mb-2">{t('calculator.weaknesses', 'Weaknesses')}</h4>
                      <ul className="text-sm text-red-700 space-y-1">
                        {signData.weaknesses.slice(0, 4).map((w) => (
                          <li key={w}>• {w}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{t('calculator.sunSignCalc.bestCareerPaths', 'Best Career Paths')}</h3>
                    <div className="flex flex-wrap gap-2">
                      {signData.career.map((c) => (
                        <Badge key={c} variant="outline" className="border-orange-300">
                          {c}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{t('calculator.compatibleSigns', 'Compatible Signs')}</h3>
                    <div className="flex flex-wrap gap-2">
                      {signData.compatibility.map((sign) => (
                        <Badge key={sign} className="bg-green-100 text-green-700">
                          {sunSignData[sign as keyof typeof sunSignData].symbol} {sign}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-orange-200 bg-orange-50/50">
              <CardContent className="flex flex-col items-center justify-center h-full py-12">
                <div className="w-24 h-24 rounded-full bg-orange-100 flex items-center justify-center mb-4">
                  <Sun className="w-12 h-12 text-orange-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t('calculator.sunSignCalc.resultPlaceholder', 'Your Sun Sign Will Appear Here')}
                </h3>
                <p className="text-gray-600 text-center max-w-xs">
                  {t('calculator.sunSignCalc.resultPlaceholderDesc', 'Enter your birth date and click "Find My Sun Sign" to discover your zodiac sign and personality traits.')}
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
                {t('calculator.moonSignCalc.shortDesc', 'Find your Moon Sign for emotional insights.')}
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/tools/moon-sign-calculator">
                  Calculate <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-amber-200 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-2">{t('calculator.ascendantCalc.title', 'Ascendant Calculator')}</h3>
              <p className="text-gray-600 text-sm mb-4">
                {t('calculator.ascendantCalc.shortDesc', 'Discover your Rising Sign (Lagna).')}
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/tools/ascendant-calculator">
                  {t('common.calculate', 'Calculate')} <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-amber-200 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-2">{t('horoscope.daily.title', 'Daily Horoscope')}</h3>
              <p className="text-gray-600 text-sm mb-4">
                {t('horoscope.daily.shortDesc', "Read today's predictions for your sign.")}
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/daily-horoscope">
                  {t('common.readNow', 'Read Now')} <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="border-orange-200 bg-orange-50 mt-12">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {t('calculator.sunSignCalc.understandingTitle', 'Understanding Your Sun Sign')}
            </h2>
            <div className="prose prose-orange max-w-none">
              <p className="text-gray-700 mb-4">
                {t('calculator.sunSignCalc.understandingPara1', 'Your Sun Sign is the zodiac sign that the Sun was transiting at the time of your birth. In Western astrology, the Sun Sign is considered the most important factor in determining personality, as it represents your core identity, ego, and life purpose.')}
              </p>
              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                {t('calculator.sunSignCalc.fourElementsTitle', 'The Four Elements')}
              </h3>
              <p className="text-gray-700 mb-4">
                {t('calculator.sunSignCalc.fourElementsPara', 'The 12 zodiac signs are divided into four elements, each representing different temperaments and approaches to life:')}
              </p>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="bg-red-50 rounded-lg p-4">
                  <h4 className="font-semibold text-red-800 flex items-center gap-2">
                    <Flame className="w-4 h-4" /> {t('calculator.sunSignCalc.fireSigns', 'Fire Signs')}
                  </h4>
                  <p className="text-sm text-red-700">{t('calculator.sunSignCalc.fireSignsDesc', 'Aries, Leo, Sagittarius - Passionate, dynamic, temperamental')}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 flex items-center gap-2">
                    <Mountain className="w-4 h-4" /> {t('calculator.sunSignCalc.earthSigns', 'Earth Signs')}
                  </h4>
                  <p className="text-sm text-green-700">{t('calculator.sunSignCalc.earthSignsDesc', 'Taurus, Virgo, Capricorn - Grounded, practical, reliable')}</p>
                </div>
                <div className="bg-cyan-50 rounded-lg p-4">
                  <h4 className="font-semibold text-cyan-800 flex items-center gap-2">
                    <Wind className="w-4 h-4" /> {t('calculator.sunSignCalc.airSigns', 'Air Signs')}
                  </h4>
                  <p className="text-sm text-cyan-700">{t('calculator.sunSignCalc.airSignsDesc', 'Gemini, Libra, Aquarius - Intellectual, social, communicative')}</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 flex items-center gap-2">
                    <Droplets className="w-4 h-4" /> {t('calculator.sunSignCalc.waterSigns', 'Water Signs')}
                  </h4>
                  <p className="text-sm text-blue-700">{t('calculator.sunSignCalc.waterSignsDesc', 'Cancer, Scorpio, Pisces - Emotional, intuitive, sensitive')}</p>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                {t('calculator.sunSignCalc.vsMoonTitle', 'Sun Sign vs Moon Sign in Vedic Astrology')}
              </h3>
              <p className="text-gray-700">
                {t('calculator.sunSignCalc.vsMoonPara', "While Western astrology emphasizes the Sun Sign, Vedic astrology (Jyotish) places more importance on the Moon Sign (Rashi). For a complete understanding of your astrological profile, it's recommended to know both your Sun Sign and Moon Sign, as they represent different aspects of your personality.")}
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
            name: "Sun Sign Calculator",
            description: "Calculate your Sun Sign (Surya Rashi) based on birth date",
            url: "https://vedicstarastro.com/tools/sun-sign-calculator",
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
