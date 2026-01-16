"use client";

import { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { LocationInput } from "@/components/ui/location-input";
import {
  Moon,
  Calendar,
  Clock,
  MapPin,
  Star,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const moonSignData = {
  Aries: {
    hindi: "मेष",
    symbol: "♈",
    element: "Fire",
    ruler: "Mars",
    traits: ["Impulsive", "Energetic", "Courageous", "Independent", "Passionate"],
    description: "Moon in Aries makes you emotionally spontaneous and quick to react. You need excitement and new challenges to feel emotionally fulfilled. Your feelings are intense but may not last long.",
    compatibility: ["Leo", "Sagittarius", "Gemini", "Aquarius"],
    luckyDay: "Tuesday",
    luckyColor: "Red",
    luckyNumber: 9,
  },
  Taurus: {
    hindi: "वृषभ",
    symbol: "♉",
    element: "Earth",
    ruler: "Venus",
    traits: ["Stable", "Sensual", "Patient", "Reliable", "Stubborn"],
    description: "Moon in Taurus gives you emotional stability and a need for security. You find comfort in material pleasures and routine. Your feelings are deep and lasting.",
    compatibility: ["Virgo", "Capricorn", "Cancer", "Pisces"],
    luckyDay: "Friday",
    luckyColor: "Green",
    luckyNumber: 6,
  },
  Gemini: {
    hindi: "मिथुन",
    symbol: "♊",
    element: "Air",
    ruler: "Mercury",
    traits: ["Curious", "Adaptable", "Communicative", "Restless", "Witty"],
    description: "Moon in Gemini makes you emotionally versatile and intellectually curious. You need mental stimulation and variety. Your moods can change quickly.",
    compatibility: ["Libra", "Aquarius", "Aries", "Leo"],
    luckyDay: "Wednesday",
    luckyColor: "Yellow",
    luckyNumber: 5,
  },
  Cancer: {
    hindi: "कर्क",
    symbol: "♋",
    element: "Water",
    ruler: "Moon",
    traits: ["Nurturing", "Intuitive", "Protective", "Emotional", "Home-loving"],
    description: "Moon in Cancer is in its own sign, making emotions very strong. You are deeply intuitive and nurturing. Family and home are central to your emotional well-being.",
    compatibility: ["Scorpio", "Pisces", "Taurus", "Virgo"],
    luckyDay: "Monday",
    luckyColor: "White",
    luckyNumber: 2,
  },
  Leo: {
    hindi: "सिंह",
    symbol: "♌",
    element: "Fire",
    ruler: "Sun",
    traits: ["Dramatic", "Generous", "Proud", "Creative", "Warm-hearted"],
    description: "Moon in Leo gives you a need for recognition and appreciation. You express emotions dramatically and generously. You need to feel special and admired.",
    compatibility: ["Aries", "Sagittarius", "Gemini", "Libra"],
    luckyDay: "Sunday",
    luckyColor: "Gold",
    luckyNumber: 1,
  },
  Virgo: {
    hindi: "कन्या",
    symbol: "♍",
    element: "Earth",
    ruler: "Mercury",
    traits: ["Analytical", "Helpful", "Practical", "Modest", "Perfectionist"],
    description: "Moon in Virgo makes you emotionally reserved and analytical. You process feelings through logic and find comfort in being useful. You may worry excessively.",
    compatibility: ["Taurus", "Capricorn", "Cancer", "Scorpio"],
    luckyDay: "Wednesday",
    luckyColor: "Green",
    luckyNumber: 5,
  },
  Libra: {
    hindi: "तुला",
    symbol: "♎",
    element: "Air",
    ruler: "Venus",
    traits: ["Diplomatic", "Harmonious", "Indecisive", "Romantic", "Fair-minded"],
    description: "Moon in Libra gives you a strong need for harmony and partnership. You feel emotionally balanced when relationships are peaceful. You may avoid conflict.",
    compatibility: ["Gemini", "Aquarius", "Leo", "Sagittarius"],
    luckyDay: "Friday",
    luckyColor: "Pink",
    luckyNumber: 6,
  },
  Scorpio: {
    hindi: "वृश्चिक",
    symbol: "♏",
    element: "Water",
    ruler: "Mars/Pluto",
    traits: ["Intense", "Passionate", "Secretive", "Transformative", "Loyal"],
    description: "Moon in Scorpio creates deep, intense emotions. You feel things profoundly and may struggle to let go. You need emotional depth and authenticity in relationships.",
    compatibility: ["Cancer", "Pisces", "Virgo", "Capricorn"],
    luckyDay: "Tuesday",
    luckyColor: "Maroon",
    luckyNumber: 8,
  },
  Sagittarius: {
    hindi: "धनु",
    symbol: "♐",
    element: "Fire",
    ruler: "Jupiter",
    traits: ["Optimistic", "Adventurous", "Philosophical", "Freedom-loving", "Honest"],
    description: "Moon in Sagittarius makes you emotionally expansive and optimistic. You need freedom and adventure to feel fulfilled. You process emotions through philosophy and humor.",
    compatibility: ["Aries", "Leo", "Libra", "Aquarius"],
    luckyDay: "Thursday",
    luckyColor: "Purple",
    luckyNumber: 3,
  },
  Capricorn: {
    hindi: "मकर",
    symbol: "♑",
    element: "Earth",
    ruler: "Saturn",
    traits: ["Ambitious", "Disciplined", "Reserved", "Responsible", "Cautious"],
    description: "Moon in Capricorn makes you emotionally reserved and practical. You may suppress feelings for achievement. Security through status and accomplishment is important.",
    compatibility: ["Taurus", "Virgo", "Scorpio", "Pisces"],
    luckyDay: "Saturday",
    luckyColor: "Black",
    luckyNumber: 8,
  },
  Aquarius: {
    hindi: "कुंभ",
    symbol: "♒",
    element: "Air",
    ruler: "Saturn/Uranus",
    traits: ["Independent", "Humanitarian", "Unconventional", "Detached", "Innovative"],
    description: "Moon in Aquarius gives you emotional detachment and independence. You process feelings intellectually and need freedom. You care deeply about humanity but may seem aloof.",
    compatibility: ["Gemini", "Libra", "Aries", "Sagittarius"],
    luckyDay: "Saturday",
    luckyColor: "Blue",
    luckyNumber: 4,
  },
  Pisces: {
    hindi: "मीन",
    symbol: "♓",
    element: "Water",
    ruler: "Jupiter/Neptune",
    traits: ["Compassionate", "Intuitive", "Dreamy", "Sensitive", "Artistic"],
    description: "Moon in Pisces makes you extremely sensitive and intuitive. You absorb others' emotions easily and need creative or spiritual outlets. You may escape into fantasy.",
    compatibility: ["Cancer", "Scorpio", "Taurus", "Capricorn"],
    luckyDay: "Thursday",
    luckyColor: "Sea Green",
    luckyNumber: 7,
  },
};

export default function MoonSignCalculatorPage() {
  const { t } = useLanguage();
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [moonSign, setMoonSign] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState("");

  const handleCalculate = async () => {
    if (!birthDate) return;
    
    setIsCalculating(true);
    setError("");
    
    try {
      const response = await fetch("/api/calculate-moon-sign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          birth_date: birthDate,
          birth_time: birthTime || "12:00",
          birth_place: birthPlace || "Delhi",
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to calculate moon sign");
      }
      
      const data = await response.json();
      setMoonSign(data.moon_sign);
    } catch (err) {
      console.error("Error calculating moon sign:", err);
      setError("Unable to calculate. Please check your birth details and try again.");
    } finally {
      setIsCalculating(false);
    }
  };

  const signData = moonSign ? moonSignData[moonSign as keyof typeof moonSignData] : null;

  return (
    <div className="py-12 lg:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-purple-100 text-purple-800">{t('calculator.freeTool', 'Free Calculator')}</Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {t('calculator.moonSign.title', 'Moon Sign Calculator (Rashi Calculator)')}
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {t('calculator.moonSign.subtitle', 'Discover your Moon Sign (Chandra Rashi) based on your birth details. Your Moon Sign reveals your emotional nature, instincts, and inner self in Vedic astrology.')}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Moon className="w-5 h-5 text-purple-600" />
                {t('calculator.enterBirthDetails', 'Enter Birth Details')}
              </CardTitle>
              <CardDescription>
                {t('calculator.moonSign.birthTimeNote', 'Accurate birth time helps determine precise Moon position')}
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
              
              <div className="space-y-2">
                <Label htmlFor="time" className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {t('calculator.timeOfBirth', 'Time of Birth')}
                </Label>
                <Input
                  id="time"
                  type="time"
                  value={birthTime}
                  onChange={(e) => setBirthTime(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  {t('calculator.moonSign.moonChangeNote', 'Moon changes sign every 2.5 days, so accurate time improves precision')}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="place" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {t('calculator.placeOfBirth', 'Place of Birth')}
                </Label>
                <LocationInput
                  id="place"
                  placeholder={t('calculator.searchCity', 'Search city...')}
                  value={birthPlace}
                  onChange={(e) => setBirthPlace(e.target.value)}
                  onLocationSelect={(loc) => setBirthPlace(loc)}
                />
              </div>
              
              <Button 
                onClick={handleCalculate}
                className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
                disabled={!birthDate || isCalculating}
              >
                {isCalculating ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                    {t('calculator.calculating', 'Calculating...')}
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 mr-2" />
                    {t('calculator.moonSign.findMoonSign', 'Find My Moon Sign')}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {moonSign && signData ? (
            <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-4xl">{signData.symbol}</span>
                    Your Moon Sign
                  </CardTitle>
                  <Badge className="bg-purple-500 text-lg px-3 py-1">
                    {signData.element}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <h2 className="text-3xl font-bold text-purple-700">{moonSign}</h2>
                  <p className="text-xl text-gray-600">{signData.hindi}</p>
                  <p className="text-sm text-gray-500">Ruled by {signData.ruler}</p>
                </div>

                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Emotional Nature</h3>
                    <p className="text-gray-700">{signData.description}</p>
                  </div>

                  <div className="bg-white rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Key Traits</h3>
                    <div className="flex flex-wrap gap-2">
                      {signData.traits.map((trait) => (
                        <Badge key={trait} variant="secondary" className="bg-purple-100 text-purple-700">
                          {trait}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg p-3 text-center">
                      <p className="text-sm text-gray-600">Lucky Day</p>
                      <p className="font-semibold text-purple-700">{signData.luckyDay}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center">
                      <p className="text-sm text-gray-600">Lucky Color</p>
                      <p className="font-semibold text-purple-700">{signData.luckyColor}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center">
                      <p className="text-sm text-gray-600">Lucky Number</p>
                      <p className="font-semibold text-purple-700">{signData.luckyNumber}</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Compatible Moon Signs</h3>
                    <div className="flex flex-wrap gap-2">
                      {signData.compatibility.map((sign) => (
                        <Badge key={sign} className="bg-green-100 text-green-700">
                          {sign}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-purple-200 bg-purple-50/50">
              <CardContent className="flex flex-col items-center justify-center h-full py-12">
                <div className="w-24 h-24 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                  <Moon className="w-12 h-12 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Your Moon Sign Will Appear Here
                </h3>
                <p className="text-gray-600 text-center max-w-xs">
                  Enter your birth details and click &quot;Find My Moon Sign&quot; to discover 
                  your Chandra Rashi and emotional nature.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <Card className="border-amber-200 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-2">Sun Sign Calculator</h3>
              <p className="text-gray-600 text-sm mb-4">
                Find your Sun Sign (Surya Rashi) for personality insights.
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/tools/sun-sign-calculator">
                  Calculate <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-amber-200 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-2">Ascendant Calculator</h3>
              <p className="text-gray-600 text-sm mb-4">
                Discover your Rising Sign (Lagna) for outer personality.
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/tools/ascendant-calculator">
                  Calculate <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-amber-200 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-2">Full Kundli</h3>
              <p className="text-gray-600 text-sm mb-4">
                Generate complete birth chart with all planetary positions.
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/tools/kundli-calculator">
                  Generate <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="border-purple-200 bg-purple-50 mt-12">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Understanding Your Moon Sign in Vedic Astrology
            </h2>
            <div className="prose prose-purple max-w-none">
              <p className="text-gray-700 mb-4">
                In Vedic astrology (Jyotish), the Moon Sign (Chandra Rashi) is considered more 
                important than the Sun Sign. While Western astrology emphasizes the Sun Sign, 
                Vedic astrology places primary importance on the Moon because it represents 
                the mind, emotions, and inner self.
              </p>
              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                Why Moon Sign Matters
              </h3>
              <p className="text-gray-700 mb-4">
                The Moon moves through all 12 zodiac signs in approximately 27-28 days, spending 
                about 2.5 days in each sign. Your Moon Sign is determined by which zodiac sign 
                the Moon was transiting at the exact time of your birth. This placement reveals:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Your emotional nature and how you process feelings</li>
                <li>Your instinctive reactions and subconscious patterns</li>
                <li>Your relationship with your mother and nurturing style</li>
                <li>Your comfort zone and what makes you feel secure</li>
                <li>Your mental tendencies and thought patterns</li>
              </ul>
              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                Moon Sign vs Sun Sign
              </h3>
              <p className="text-gray-700">
                While your Sun Sign represents your core identity and ego, your Moon Sign 
                represents your emotional self and inner world. Many people find that Moon Sign 
                descriptions resonate more deeply because they describe the private self that 
                only close ones see. For accurate horoscope readings in Vedic astrology, 
                always use your Moon Sign (Rashi).
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
            name: "Moon Sign Calculator",
            description: "Calculate your Moon Sign (Chandra Rashi) based on birth details for Vedic astrology",
            url: "https://vedicstarastro.com/tools/moon-sign-calculator",
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
