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
  Sunrise,
  Calendar,
  Clock,
  MapPin,
  ArrowRight,
  Sparkles,
  Star,
} from "lucide-react";

const ascendantData = {
  Aries: {
    hindi: "मेष लग्न",
    symbol: "♈",
    element: "Fire",
    ruler: "Mars",
    appearance: "Athletic build, sharp features, prominent forehead, quick movements",
    personality: "You come across as confident, energetic, and assertive. First impressions show you as a natural leader who takes initiative.",
    traits: ["Assertive", "Energetic", "Competitive", "Direct", "Courageous"],
    health: "Head, face, and brain are sensitive areas. Prone to headaches and fevers.",
    career: "Excel in leadership roles, sports, military, entrepreneurship, and competitive fields.",
    compatibility: ["Leo Ascendant", "Sagittarius Ascendant", "Gemini Ascendant"],
  },
  Taurus: {
    hindi: "वृषभ लग्न",
    symbol: "♉",
    element: "Earth",
    ruler: "Venus",
    appearance: "Strong neck and shoulders, pleasant features, melodious voice, graceful movements",
    personality: "You appear calm, reliable, and grounded. Others see you as patient and trustworthy with good taste.",
    traits: ["Stable", "Patient", "Sensual", "Determined", "Practical"],
    health: "Throat, neck, and thyroid are sensitive. Watch for weight gain and throat issues.",
    career: "Excel in finance, arts, music, real estate, luxury goods, and culinary fields.",
    compatibility: ["Virgo Ascendant", "Capricorn Ascendant", "Cancer Ascendant"],
  },
  Gemini: {
    hindi: "मिथुन लग्न",
    symbol: "♊",
    element: "Air",
    ruler: "Mercury",
    appearance: "Youthful appearance, expressive hands, bright eyes, quick gestures",
    personality: "You come across as witty, curious, and communicative. Others see you as versatile and intellectually engaging.",
    traits: ["Curious", "Adaptable", "Communicative", "Witty", "Restless"],
    health: "Lungs, arms, and nervous system are sensitive. Prone to anxiety and respiratory issues.",
    career: "Excel in writing, teaching, sales, media, technology, and communication fields.",
    compatibility: ["Libra Ascendant", "Aquarius Ascendant", "Aries Ascendant"],
  },
  Cancer: {
    hindi: "कर्क लग्न",
    symbol: "♋",
    element: "Water",
    ruler: "Moon",
    appearance: "Round face, soft features, nurturing demeanor, protective body language",
    personality: "You appear caring, intuitive, and emotionally attuned. Others see you as nurturing and family-oriented.",
    traits: ["Nurturing", "Intuitive", "Protective", "Emotional", "Home-loving"],
    health: "Stomach, chest, and digestive system are sensitive. Emotional eating tendencies.",
    career: "Excel in healthcare, hospitality, real estate, childcare, and nurturing professions.",
    compatibility: ["Scorpio Ascendant", "Pisces Ascendant", "Taurus Ascendant"],
  },
  Leo: {
    hindi: "सिंह लग्न",
    symbol: "♌",
    element: "Fire",
    ruler: "Sun",
    appearance: "Regal bearing, prominent hair, warm smile, commanding presence",
    personality: "You come across as confident, charismatic, and dignified. Others see you as a natural performer and leader.",
    traits: ["Confident", "Generous", "Dramatic", "Warm", "Creative"],
    health: "Heart, spine, and back are sensitive. Watch for heart issues and back problems.",
    career: "Excel in entertainment, politics, management, fashion, and creative leadership.",
    compatibility: ["Aries Ascendant", "Sagittarius Ascendant", "Gemini Ascendant"],
  },
  Virgo: {
    hindi: "कन्या लग्न",
    symbol: "♍",
    element: "Earth",
    ruler: "Mercury",
    appearance: "Neat appearance, intelligent eyes, modest demeanor, precise movements",
    personality: "You appear analytical, helpful, and detail-oriented. Others see you as practical and health-conscious.",
    traits: ["Analytical", "Helpful", "Modest", "Precise", "Health-conscious"],
    health: "Digestive system and intestines are sensitive. Prone to worry-related ailments.",
    career: "Excel in healthcare, research, editing, accounting, and service-oriented fields.",
    compatibility: ["Taurus Ascendant", "Capricorn Ascendant", "Cancer Ascendant"],
  },
  Libra: {
    hindi: "तुला लग्न",
    symbol: "♎",
    element: "Air",
    ruler: "Venus",
    appearance: "Attractive features, balanced proportions, charming smile, graceful manner",
    personality: "You come across as diplomatic, charming, and fair-minded. Others see you as socially adept and aesthetically inclined.",
    traits: ["Diplomatic", "Charming", "Fair", "Social", "Aesthetic"],
    health: "Kidneys, lower back, and skin are sensitive. Watch for balance-related issues.",
    career: "Excel in law, diplomacy, design, counseling, and partnership-based work.",
    compatibility: ["Gemini Ascendant", "Aquarius Ascendant", "Leo Ascendant"],
  },
  Scorpio: {
    hindi: "वृश्चिक लग्न",
    symbol: "♏",
    element: "Water",
    ruler: "Mars",
    appearance: "Intense eyes, magnetic presence, strong features, penetrating gaze",
    personality: "You appear mysterious, intense, and powerful. Others sense your depth and transformative nature.",
    traits: ["Intense", "Mysterious", "Powerful", "Perceptive", "Transformative"],
    health: "Reproductive system and elimination organs are sensitive. Strong regenerative ability.",
    career: "Excel in research, psychology, investigation, surgery, and transformative work.",
    compatibility: ["Cancer Ascendant", "Pisces Ascendant", "Virgo Ascendant"],
  },
  Sagittarius: {
    hindi: "धनु लग्न",
    symbol: "♐",
    element: "Fire",
    ruler: "Jupiter",
    appearance: "Tall stature, athletic build, open expression, enthusiastic demeanor",
    personality: "You come across as optimistic, adventurous, and philosophical. Others see you as honest and freedom-loving.",
    traits: ["Optimistic", "Adventurous", "Philosophical", "Honest", "Freedom-loving"],
    health: "Hips, thighs, and liver are sensitive. Prone to overindulgence.",
    career: "Excel in travel, education, publishing, law, and philosophical pursuits.",
    compatibility: ["Aries Ascendant", "Leo Ascendant", "Libra Ascendant"],
  },
  Capricorn: {
    hindi: "मकर लग्न",
    symbol: "♑",
    element: "Earth",
    ruler: "Saturn",
    appearance: "Serious expression, strong bone structure, mature demeanor, reserved manner",
    personality: "You appear ambitious, disciplined, and responsible. Others see you as reliable and goal-oriented.",
    traits: ["Ambitious", "Disciplined", "Responsible", "Patient", "Traditional"],
    health: "Bones, joints, and knees are sensitive. Prone to stiffness and dental issues.",
    career: "Excel in business, government, engineering, management, and structured fields.",
    compatibility: ["Taurus Ascendant", "Virgo Ascendant", "Scorpio Ascendant"],
  },
  Aquarius: {
    hindi: "कुंभ लग्न",
    symbol: "♒",
    element: "Air",
    ruler: "Saturn",
    appearance: "Unique features, friendly expression, unconventional style, detached manner",
    personality: "You come across as progressive, independent, and humanitarian. Others see you as innovative and socially conscious.",
    traits: ["Progressive", "Independent", "Humanitarian", "Innovative", "Detached"],
    health: "Ankles, circulation, and nervous system are sensitive. Prone to sudden ailments.",
    career: "Excel in technology, science, social work, aviation, and innovative fields.",
    compatibility: ["Gemini Ascendant", "Libra Ascendant", "Aries Ascendant"],
  },
  Pisces: {
    hindi: "मीन लग्न",
    symbol: "♓",
    element: "Water",
    ruler: "Jupiter",
    appearance: "Dreamy eyes, soft features, gentle demeanor, fluid movements",
    personality: "You appear compassionate, intuitive, and artistic. Others see you as sensitive and spiritually inclined.",
    traits: ["Compassionate", "Intuitive", "Artistic", "Sensitive", "Spiritual"],
    health: "Feet, lymphatic system, and immune system are sensitive. Prone to escapism.",
    career: "Excel in arts, music, healing, spirituality, and creative fields.",
    compatibility: ["Cancer Ascendant", "Scorpio Ascendant", "Taurus Ascendant"],
  },
};

export default function AscendantCalculatorPage() {
  const { t } = useLanguage();
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [ascendant, setAscendant] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState("");

  const handleCalculate = async () => {
    if (!birthDate || !birthTime) return;
    
    setIsCalculating(true);
    setError("");
    
    try {
      const response = await fetch("/api/calculate-ascendant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          birth_date: birthDate,
          birth_time: birthTime,
          birth_place: birthPlace || "Delhi",
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to calculate ascendant");
      }
      
      const data = await response.json();
      setAscendant(data.ascendant);
    } catch (err) {
      console.error("Error calculating ascendant:", err);
      setError("Unable to calculate. Please check your birth details and try again.");
    } finally {
      setIsCalculating(false);
    }
  };

  const signData = ascendant ? ascendantData[ascendant as keyof typeof ascendantData] : null;

  return (
    <div className="py-12 lg:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-indigo-100 text-indigo-800">{t('calculator.freeTool', 'Free Calculator')}</Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {t('calculator.ascendantCalc.title', 'Ascendant Calculator (Lagna Calculator)')}
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {t('calculator.ascendantCalc.subtitle', 'Discover your Rising Sign (Lagna) based on your exact birth time. Your Ascendant determines how others perceive you and shapes your physical appearance.')}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="border-indigo-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sunrise className="w-5 h-5 text-indigo-600" />
                {t('calculator.enterBirthDetails', 'Enter Birth Details')}
              </CardTitle>
              <CardDescription>
                {t('calculator.ascendantCalc.birthTimeNote', 'Exact birth time is essential for accurate Ascendant calculation')}
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
                  {t('calculator.timeOfBirthRequired', 'Time of Birth (Required)')}
                </Label>
                <Input
                  id="time"
                  type="time"
                  value={birthTime}
                  onChange={(e) => setBirthTime(e.target.value)}
                  required
                />
                <p className="text-xs text-red-500">
                  {t('calculator.ascendantCalc.timeWarning', '* Ascendant changes every 2 hours - exact time is crucial')}
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
                <p className="text-xs text-gray-500">
                  {t('calculator.ascendantCalc.locationNote', 'Location affects time zone and local sidereal time')}
                </p>
              </div>
              
              <Button 
                onClick={handleCalculate}
                className="w-full bg-indigo-600 hover:bg-indigo-700"
                disabled={!birthDate || !birthTime || isCalculating}
              >
                {isCalculating ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                    {t('calculator.calculating', 'Calculating...')}
                  </>
                ) : (
                  <>
                    <Sunrise className="w-4 h-4 mr-2" />
                    {t('calculator.ascendantCalc.findAscendant', 'Find My Ascendant')}
                  </>
                )}
              </Button>

              <div className="mt-6 pt-6 border-t bg-amber-50 rounded-lg p-4">
                <h3 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  {t('calculator.ascendantCalc.whyBirthTimeMatters', 'Why Birth Time Matters')}
                </h3>
                <p className="text-sm text-amber-700">
                  {t('calculator.ascendantCalc.birthTimeExplanation', 'The Ascendant (Lagna) is the zodiac sign rising on the eastern horizon at your exact moment of birth. It changes approximately every 2 hours, making precise birth time essential for accurate calculation.')}
                </p>
              </div>
            </CardContent>
          </Card>

          {ascendant && signData ? (
            <Card className="border-indigo-200 bg-indigo-50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-4xl">{signData.symbol}</span>
                    {t('calculator.ascendantCalc.yourAscendant', 'Your Ascendant')}
                  </CardTitle>
                  <Badge className="bg-indigo-500">{signData.element}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <h2 className="text-3xl font-bold text-indigo-700">{ascendant} Rising</h2>
                  <p className="text-xl text-gray-600">{signData.hindi}</p>
                  <p className="text-sm text-gray-500">{t('calculator.ruledBy', 'Ruled by')} {signData.ruler}</p>
                </div>

                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{t('calculator.ascendantCalc.firstImpressions', 'First Impressions')}</h3>
                    <p className="text-gray-700">{signData.personality}</p>
                  </div>

                  <div className="bg-white rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{t('calculator.ascendantCalc.physicalAppearance', 'Physical Appearance')}</h3>
                    <p className="text-gray-700">{signData.appearance}</p>
                  </div>

                  <div className="bg-white rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{t('calculator.keyTraits', 'Key Traits')}</h3>
                    <div className="flex flex-wrap gap-2">
                      {signData.traits.map((trait) => (
                        <Badge key={trait} variant="secondary" className="bg-indigo-100 text-indigo-700">
                          {trait}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-lg p-3">
                      <h4 className="font-semibold text-blue-800 mb-2">{t('calculator.ascendantCalc.healthFocus', 'Health Focus')}</h4>
                      <p className="text-sm text-blue-700">{signData.health}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3">
                      <h4 className="font-semibold text-green-800 mb-2">{t('calculator.ascendantCalc.careerStrengths', 'Career Strengths')}</h4>
                      <p className="text-sm text-green-700">{signData.career}</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{t('calculator.ascendantCalc.compatibleAscendants', 'Compatible Ascendants')}</h3>
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
            <Card className="border-indigo-200 bg-indigo-50/50">
              <CardContent className="flex flex-col items-center justify-center h-full py-12">
                <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
                  <Sunrise className="w-12 h-12 text-indigo-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t('calculator.ascendantCalc.resultPlaceholder', 'Your Ascendant Will Appear Here')}
                </h3>
                <p className="text-gray-600 text-center max-w-xs">
                  {t('calculator.ascendantCalc.resultPlaceholderDesc', 'Enter your birth details including exact time and click "Find My Ascendant" to discover your Rising Sign.')}
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
                  {t('common.calculate', 'Calculate')} <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-amber-200 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-2">{t('calculator.sunSignCalc.title', 'Sun Sign Calculator')}</h3>
              <p className="text-gray-600 text-sm mb-4">
                {t('calculator.sunSignCalc.shortDesc', 'Discover your Sun Sign personality.')}
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/tools/sun-sign-calculator">
                  {t('common.calculate', 'Calculate')} <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-amber-200 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-2">{t('calculator.kundli.title', 'Full Kundli')}</h3>
              <p className="text-gray-600 text-sm mb-4">
                {t('calculator.kundli.shortDesc', 'Generate complete birth chart.')}
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/tools/kundli-calculator">
                  Generate <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="border-indigo-200 bg-indigo-50 mt-12">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {t('calculator.ascendantCalc.understandingTitle', 'Understanding Your Ascendant (Lagna) in Vedic Astrology')}
            </h2>
            <div className="prose prose-indigo max-w-none">
              <p className="text-gray-700 mb-4">
                {t('calculator.ascendantCalc.understandingDesc1', 'The Ascendant, known as Lagna in Vedic astrology, is one of the most important factors in your birth chart. It represents the zodiac sign that was rising on the eastern horizon at the exact moment of your birth and serves as the starting point for all house calculations in your horoscope.')}
              </p>
              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                {t('calculator.ascendantCalc.whatRevealsTitle', 'What Your Ascendant Reveals')}
              </h3>
              <p className="text-gray-700 mb-4">
                {t('calculator.ascendantCalc.whatRevealsDesc', 'While your Sun Sign represents your core identity and Moon Sign reflects your emotional nature, your Ascendant determines:')}
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>{t('calculator.ascendantCalc.reveal1', 'How others perceive you at first meeting')}</li>
                <li>{t('calculator.ascendantCalc.reveal2', 'Your physical appearance and body type')}</li>
                <li>{t('calculator.ascendantCalc.reveal3', 'Your natural approach to new situations')}</li>
                <li>{t('calculator.ascendantCalc.reveal4', 'The lens through which you view the world')}</li>
                <li>{t('calculator.ascendantCalc.reveal5', 'Your outward personality and social mask')}</li>
              </ul>
              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                {t('calculator.ascendantCalc.threePillarsTitle', 'The Three Pillars of Your Chart')}
              </h3>
              <p className="text-gray-700">
                {t('calculator.ascendantCalc.threePillarsDesc', 'In Vedic astrology, the combination of Sun Sign, Moon Sign, and Ascendant creates a complete picture of your personality. The Sun represents your soul and ego, the Moon represents your mind and emotions, and the Ascendant represents your body and how you interact with the physical world. Understanding all three provides deep insight into your complete astrological profile.')}
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
            name: "Ascendant Calculator",
            description: "Calculate your Ascendant (Lagna/Rising Sign) based on birth time for Vedic astrology",
            url: "https://vedicstarastro.com/tools/ascendant-calculator",
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
