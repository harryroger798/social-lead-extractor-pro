"use client";

import { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LocationInput } from "@/components/ui/location-input";
import {
  Calendar,
  Clock,
  MapPin,
  ArrowRight,
  Sparkles,
  AlertCircle,
  CheckCircle,
  Moon,
} from "lucide-react";

const zodiacSigns = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

const saturnTransits = [
  { sign: "Aquarius", start: "2023-01-17", end: "2025-03-29" },
  { sign: "Pisces", start: "2025-03-29", end: "2028-06-02" },
  { sign: "Aries", start: "2028-06-02", end: "2031-07-12" },
];

interface SadeSatiResult {
  moonSign: string;
  currentSaturnSign: string;
  isInSadeSati: boolean;
  phase: "Not Active" | "Rising (1st Phase)" | "Peak (2nd Phase)" | "Setting (3rd Phase)";
  phaseDescription: string;
  startDate: string;
  endDate: string;
  percentComplete: number;
  effects: string[];
  remedies: string[];
  advice: string;
}

const phaseEffects = {
  "Rising (1st Phase)": {
    description: "Saturn transits the 12th house from Moon. This phase affects finances, sleep, and foreign connections.",
    effects: [
      "Increased expenses and financial pressure",
      "Sleep disturbances and mental stress",
      "Issues related to foreign travel or settlement",
      "Eye-related problems possible",
      "Separation from family members",
    ],
  },
  "Peak (2nd Phase)": {
    description: "Saturn transits over the natal Moon. This is the most intense phase affecting mind, emotions, and mother.",
    effects: [
      "Mental stress and emotional turbulence",
      "Health issues for self or mother",
      "Career obstacles and delays",
      "Relationship challenges",
      "Property-related problems",
    ],
  },
  "Setting (3rd Phase)": {
    description: "Saturn transits the 2nd house from Moon. This phase affects family, wealth, and speech.",
    effects: [
      "Family disputes and misunderstandings",
      "Financial losses or unexpected expenses",
      "Speech-related issues",
      "Health problems for family members",
      "Obstacles in accumulating wealth",
    ],
  },
};

const sadeSatiRemedies = [
  "Recite Shani Chalisa or Shani Stotra on Saturdays",
  "Wear a Blue Sapphire (Neelam) only after proper consultation",
  "Donate black items like sesame, mustard oil, iron on Saturdays",
  "Feed crows and black dogs on Saturdays",
  "Light a sesame oil lamp under a Peepal tree on Saturdays",
  "Visit Shani temples, especially Shani Shingnapur",
  "Chant 'Om Sham Shanicharaya Namaha' 108 times daily",
  "Perform Shani Shanti Puja",
  "Serve elderly people and the disabled",
  "Avoid starting new ventures on Saturdays",
];

async function fetchMoonSign(date: string, time: string, place: string): Promise<string> {
  try {
    const response = await fetch("/api/calculate-moon-sign", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        birth_date: date,
        birth_time: time || "12:00",
        birth_place: place || "Delhi",
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to calculate moon sign");
    }

    const data = await response.json();
    return data.moon_sign;
  } catch (error) {
    console.error("Error fetching moon sign:", error);
    throw error;
  }
}

function getCurrentSaturnSign(): string {
  return "Pisces";
}

function calculateSadeSati(moonSign: string): SadeSatiResult {
  const moonIndex = zodiacSigns.indexOf(moonSign);
  const saturnSign = getCurrentSaturnSign();
  const saturnIndex = zodiacSigns.indexOf(saturnSign);
  
  const twelfthFromMoon = (moonIndex - 1 + 12) % 12;
  const secondFromMoon = (moonIndex + 1) % 12;
  
  let isInSadeSati = false;
  let phase: "Not Active" | "Rising (1st Phase)" | "Peak (2nd Phase)" | "Setting (3rd Phase)" = "Not Active";
  
  if (saturnIndex === twelfthFromMoon) {
    isInSadeSati = true;
    phase = "Rising (1st Phase)";
  } else if (saturnIndex === moonIndex) {
    isInSadeSati = true;
    phase = "Peak (2nd Phase)";
  } else if (saturnIndex === secondFromMoon) {
    isInSadeSati = true;
    phase = "Setting (3rd Phase)";
  }
  
  const phaseInfo = phase !== "Not Active" ? phaseEffects[phase] : null;
  
  let startDate = "";
  let endDate = "";
  let percentComplete = 0;
  
  if (isInSadeSati) {
    startDate = "March 2025";
    endDate = "June 2028";
    percentComplete = 35;
  }
  
  return {
    moonSign,
    currentSaturnSign: saturnSign,
    isInSadeSati,
    phase,
    phaseDescription: phaseInfo?.description || "Sade Sati is not currently active for your Moon Sign.",
    startDate,
    endDate,
    percentComplete,
    effects: phaseInfo?.effects || [],
    remedies: isInSadeSati ? sadeSatiRemedies.slice(0, 6) : [],
    advice: isInSadeSati 
      ? "This is a period of transformation and karmic lessons. Stay patient, work hard, and maintain ethical conduct. The challenges you face now will strengthen you for the future."
      : "Sade Sati is not affecting you currently. Use this time to build strong foundations and prepare for future challenges.",
  };
}

export default function SadeSatiCalculatorPage() {
  const { t } = useLanguage();
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [result, setResult] = useState<SadeSatiResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState("");

  const handleCalculate = async () => {
    if (!birthDate) return;
    
    setIsCalculating(true);
    setError("");
    
    try {
      const moonSign = await fetchMoonSign(birthDate, birthTime, birthPlace);
      const sadeSatiResult = calculateSadeSati(moonSign);
      setResult(sadeSatiResult);
    } catch (err) {
      console.error("Error calculating Sade Sati:", err);
      setError("Unable to calculate. Please check your birth details and try again.");
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="py-12 lg:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-blue-100 text-blue-800">{t('calculator.freeTool', 'Free Calculator')}</Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {t('calculator.sadeSati.title', 'Sade Sati Calculator (Shani Sade Sati)')}
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {t('calculator.sadeSati.subtitle', "Check if you are under the influence of Saturn's 7.5 year transit (Sade Sati). Understand its phases, effects, and learn effective remedies.")}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Moon className="w-5 h-5 text-blue-600" />
                {t('calculator.enterBirthDetails', 'Enter Birth Details')}
              </CardTitle>
              <CardDescription>
                {t('calculator.sadeSati.moonSignHelper', 'Your Moon Sign determines Sade Sati timing')}
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
                  {t('calculator.sadeSati.timeHelper', 'Helps determine accurate Moon Sign')}
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
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                disabled={!birthDate || isCalculating}
              >
                {isCalculating ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                    {t('calculator.sadeSati.analyzing', 'Analyzing Saturn Transit...')}
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 mr-2" />
                    {t('calculator.sadeSati.checkStatus', 'Check Sade Sati Status')}
                  </>
                )}
              </Button>

              <div className="mt-6 pt-6 border-t bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">{t('calculator.sadeSati.currentSaturnPosition', 'Current Saturn Position')}</h3>
                <p className="text-sm text-blue-700">
                  {t('calculator.sadeSati.saturnTransitInfo', 'Saturn is currently transiting Pisces (March 2025 - June 2028). Moon Signs Aquarius, Pisces, and Aries are under Sade Sati influence.')}
                </p>
              </div>
            </CardContent>
          </Card>

          {result ? (
            <Card className={`border-2 ${result.isInSadeSati ? "border-blue-300 bg-blue-50" : "border-green-300 bg-green-50"}`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {result.isInSadeSati ? (
                    <>
                      <AlertCircle className="w-6 h-6 text-blue-600" />
                      {t('calculator.sadeSati.active', 'Sade Sati Active')}
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-6 h-6 text-green-600" />
                      {t('calculator.sadeSati.notActive', 'Sade Sati Not Active')}
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4 text-center">
                      <p className="text-sm text-gray-600">{t('calculator.sadeSati.yourMoonSign', 'Your Moon Sign')}</p>
                      <p className="text-xl font-bold text-blue-700">{result.moonSign}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center">
                      <p className="text-sm text-gray-600">{t('calculator.sadeSati.saturnIn', 'Saturn in')}</p>
                      <p className="text-xl font-bold text-blue-700">{result.currentSaturnSign}</p>
                    </div>
                  </div>

                  {result.isInSadeSati && (
                    <>
                      <div className="bg-white rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-900">{t('calculator.sadeSati.currentPhase', 'Current Phase')}</h3>
                          <Badge className={
                            result.phase === "Peak (2nd Phase)" ? "bg-red-500" :
                            result.phase === "Rising (1st Phase)" ? "bg-orange-500" :
                            "bg-yellow-500"
                          }>
                            {result.phase}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{result.phaseDescription}</p>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{result.startDate}</span>
                            <span>{result.endDate}</span>
                          </div>
                          <Progress value={result.percentComplete} className="h-2" />
                          <p className="text-xs text-center text-gray-500">
                            {result.percentComplete}% {t('calculator.sadeSati.complete', 'Complete')}
                          </p>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 mb-2">{t('calculator.sadeSati.effects', 'Effects During This Phase')}</h3>
                        <ul className="text-sm text-gray-700 space-y-2">
                          {result.effects.map((effect, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                              {effect}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-amber-50 rounded-lg p-4">
                        <h3 className="font-semibold text-amber-800 mb-2">{t('calculator.sadeSati.recommendedRemedies', 'Recommended Remedies')}</h3>
                        <ul className="text-sm text-amber-700 space-y-2">
                          {result.remedies.map((remedy, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-amber-500">•</span>
                              {remedy}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}

                  <div className="bg-indigo-50 rounded-lg p-4">
                    <h3 className="font-semibold text-indigo-800 mb-2">{t('calculator.sadeSati.guidance', 'Guidance')}</h3>
                    <p className="text-sm text-indigo-700">{result.advice}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-blue-200 bg-blue-50/50">
              <CardContent className="flex flex-col items-center justify-center h-full py-12">
                <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                  <Moon className="w-12 h-12 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t('calculator.sadeSati.resultPlaceholderTitle', 'Your Sade Sati Status Will Appear Here')}
                </h3>
                <p className="text-gray-600 text-center max-w-xs">
                  {t('calculator.sadeSati.resultPlaceholderDesc', 'Enter your birth details and click "Check Sade Sati Status" to analyze Saturn\'s influence on your Moon Sign.')}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <Card className="border-blue-200 mt-8">
          <CardHeader>
            <CardTitle>{t('calculator.sadeSati.timelineTitle', 'Sade Sati Timeline by Moon Sign')}</CardTitle>
            <CardDescription>
              {t('calculator.sadeSati.timelineSubtitle', "When each Moon Sign will experience Sade Sati based on Saturn's transit")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {zodiacSigns.map((sign, index) => {
                const saturnIndex = zodiacSigns.indexOf("Pisces");
                const twelfthFromMoon = (index - 1 + 12) % 12;
                const secondFromMoon = (index + 1) % 12;
                const isActive = saturnIndex === twelfthFromMoon || saturnIndex === index || saturnIndex === secondFromMoon;
                const signKey = sign.toLowerCase();
                
                return (
                  <div 
                    key={sign}
                    className={`rounded-lg p-3 ${isActive ? "bg-blue-100 border border-blue-300" : "bg-gray-50"}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{t(`zodiac.${signKey}`, sign)}</span>
                      {isActive && <Badge className="bg-blue-500">{t('calculator.sadeSati.activeLabel', 'Active')}</Badge>}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <Card className="border-amber-200 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-2">{t('calculator.sadeSati.moonSignCalculator', 'Moon Sign Calculator')}</h3>
              <p className="text-gray-600 text-sm mb-4">
                {t('calculator.sadeSati.moonSignCalculatorDesc', 'Find your Moon Sign for accurate predictions.')}
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
              <h3 className="font-semibold text-lg mb-2">{t('calculator.sadeSati.saturnTransit2026', 'Saturn Transit 2026')}</h3>
              <p className="text-gray-600 text-sm mb-4">
                {t('calculator.sadeSati.saturnTransit2026Desc', 'Detailed Saturn transit predictions for 2026.')}
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/transits/saturn-transit-2026">
                  {t('calculator.readMore', 'Read More')} <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-amber-200 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-2">{t('calculator.sadeSati.sadeSatiGuide', 'Sade Sati Guide')}</h3>
              <p className="text-gray-600 text-sm mb-4">
                {t('calculator.sadeSati.sadeSatiGuideDesc', 'Complete guide to Sade Sati effects and remedies.')}
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/doshas/sade-sati">
                  {t('calculator.readGuide', 'Read Guide')} <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="border-blue-200 bg-blue-50 mt-12">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {t('calculator.sadeSati.guideTitle', "Understanding Sade Sati - Saturn's 7.5 Year Transit")}
            </h2>
            <div className="prose prose-blue max-w-none">
              <p className="text-gray-700 mb-4">
                {t('calculator.sadeSati.guideIntro', 'Sade Sati is a 7.5 year period when Saturn transits through the 12th, 1st, and 2nd houses from your natal Moon. The term "Sade Sati" literally means "seven and a half" in Hindi, referring to the approximate duration of this transit.')}
              </p>
              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                {t('calculator.sadeSati.threePhasesTitle', 'The Three Phases of Sade Sati')}
              </h3>
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div className="bg-orange-50 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-800">{t('calculator.sadeSati.risingPhaseTitle', 'Rising Phase (2.5 years)')}</h4>
                  <p className="text-sm text-orange-700">
                    {t('calculator.sadeSati.risingPhaseDesc', 'Saturn in 12th from Moon. Affects finances, sleep, and foreign matters.')}
                  </p>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                  <h4 className="font-semibold text-red-800">{t('calculator.sadeSati.peakPhaseTitle', 'Peak Phase (2.5 years)')}</h4>
                  <p className="text-sm text-red-700">
                    {t('calculator.sadeSati.peakPhaseDesc', 'Saturn over Moon. Most intense phase affecting mind and emotions.')}
                  </p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800">{t('calculator.sadeSati.settingPhaseTitle', 'Setting Phase (2.5 years)')}</h4>
                  <p className="text-sm text-yellow-700">
                    {t('calculator.sadeSati.settingPhaseDesc', 'Saturn in 2nd from Moon. Affects family, wealth, and speech.')}
                  </p>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                {t('calculator.sadeSati.positiveAspectsTitle', 'Positive Aspects of Sade Sati')}
              </h3>
              <p className="text-gray-700 mb-4">
                {t('calculator.sadeSati.positiveAspectsIntro', "While Sade Sati is often feared, it's important to understand that Saturn is the planet of karma and discipline. This period can bring:")}
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>{t('calculator.sadeSati.positive1', 'Spiritual growth and maturity')}</li>
                <li>{t('calculator.sadeSati.positive2', 'Career advancement through hard work')}</li>
                <li>{t('calculator.sadeSati.positive3', 'Clearing of past karmic debts')}</li>
                <li>{t('calculator.sadeSati.positive4', 'Development of patience and resilience')}</li>
                <li>{t('calculator.sadeSati.positive5', 'Recognition for sincere efforts')}</li>
              </ul>
              <p className="text-gray-700">
                {t('calculator.sadeSati.positiveOutro', "The effects of Sade Sati vary based on Saturn's position in your birth chart, its aspects, and the overall planetary configuration. A well-placed Saturn can actually bring positive results during this period.")}
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
            name: "Sade Sati Calculator",
            description: "Check Sade Sati status based on Moon Sign and Saturn transit",
            url: "https://vedicstarastro.com/tools/sade-sati-calculator",
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
