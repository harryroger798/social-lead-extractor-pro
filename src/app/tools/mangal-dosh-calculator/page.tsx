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
  AlertTriangle,
  Calendar,
  Clock,
  MapPin,
  ArrowRight,
  Sparkles,
  Shield,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface MangalDoshResult {
  hasMangalDosh: boolean;
  severity: "None" | "Mild" | "Moderate" | "Severe";
  marsHouse: number;
  marsSign: string;
  affectedAreas: string[];
  remedies: string[];
  cancellations: string[];
  marriageAdvice: string;
}

const marsHouseEffects: Record<number, { effect: string; severity: string; areas: string[] }> = {
  1: { effect: "Mars in 1st house (Lagna)", severity: "Moderate", areas: ["Self", "Personality", "Health"] },
  2: { effect: "Mars in 2nd house", severity: "Mild", areas: ["Family", "Wealth", "Speech"] },
  4: { effect: "Mars in 4th house", severity: "Severe", areas: ["Home", "Mother", "Mental Peace"] },
  7: { effect: "Mars in 7th house", severity: "Severe", areas: ["Marriage", "Partnership", "Spouse"] },
  8: { effect: "Mars in 8th house", severity: "Severe", areas: ["Longevity", "In-laws", "Sudden Events"] },
  12: { effect: "Mars in 12th house", severity: "Moderate", areas: ["Expenses", "Bed Pleasures", "Foreign Lands"] },
};

const remedies = [
  "Recite Hanuman Chalisa daily, especially on Tuesdays",
  "Wear a coral (Moonga) gemstone after consulting an astrologer",
  "Fast on Tuesdays and donate red items",
  "Visit Mangal Nath temple in Ujjain",
  "Perform Mangal Shanti Puja",
  "Chant 'Om Angarakaya Namaha' 108 times daily",
  "Donate blood on Tuesdays",
  "Feed monkeys with jaggery and gram on Tuesdays",
  "Marry a Manglik person (Mangal Dosha cancels out)",
  "Perform Kumbh Vivah before actual marriage",
];

const cancellationConditions = [
  "Mars is in its own sign (Aries or Scorpio)",
  "Mars is in exaltation (Capricorn)",
  "Mars is aspected by benefic Jupiter",
  "Mars is conjunct with benefic planets",
  "Both partners have Mangal Dosha (mutual cancellation)",
  "Mars is in Navamsa of benefic planets",
  "Person is born on Tuesday",
  "Mars is in 2nd house in Gemini, Virgo, or Sagittarius",
  "Mars is in 12th house in Taurus or Libra",
  "Age above 28 years (Dosha weakens)",
];

async function fetchMangalDosh(date: string, time: string, place: string): Promise<MangalDoshResult> {
  try {
    const response = await fetch("/api/calculate-chart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "User",
        birth_date: date,
        birth_time: time || "12:00",
        birth_place: place || "Delhi",
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to calculate chart");
    }

    const data = await response.json();
    const chartData = data.chart_data;
    
    const marsPlanet = chartData.planets?.find((p: { name: string }) => p.name === "Mars");
    const marsHouse = marsPlanet?.house || 1;
    const marsSign = marsPlanet?.sign || "Aries";
    
    const mangalHouses = [1, 2, 4, 7, 8, 12];
    const isManglik = mangalHouses.includes(marsHouse);
    
    const houseEffect = marsHouseEffects[marsHouse];
    
    let severity: "None" | "Mild" | "Moderate" | "Severe" = "None";
    if (isManglik && houseEffect) {
      severity = houseEffect.severity as "Mild" | "Moderate" | "Severe";
    }
    
    const applicableCancellations: string[] = [];
    if (marsSign === "Aries" || marsSign === "Scorpio") {
      applicableCancellations.push("Mars is in its own sign - Dosha is reduced");
    }
    if (marsSign === "Capricorn") {
      applicableCancellations.push("Mars is exalted - Dosha effects are minimal");
    }
    const dateObj = new Date(date);
    if (dateObj.getDay() === 2) {
      applicableCancellations.push("Born on Tuesday - Dosha is weakened");
    }
    
    const applicableRemedies = isManglik ? remedies.slice(0, 6) : [];
    
    return {
      hasMangalDosh: isManglik,
      severity,
      marsHouse: marsHouse,
      marsSign,
      affectedAreas: houseEffect?.areas || [],
      remedies: applicableRemedies,
      cancellations: applicableCancellations,
      marriageAdvice: isManglik 
        ? "It is advisable to match horoscopes before marriage. Marrying another Manglik person can neutralize the Dosha."
        : "No Mangal Dosha detected. You can proceed with marriage without specific Manglik considerations.",
    };
  } catch (error) {
    console.error("Error calculating Mangal Dosh:", error);
    throw error;
  }
}

export default function MangalDoshCalculatorPage() {
  const { t } = useLanguage();
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [result, setResult] = useState<MangalDoshResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState("");

  const handleCalculate = async () => {
    if (!birthDate) return;
    
    setIsCalculating(true);
    setError("");
    
    try {
      const doshResult = await fetchMangalDosh(birthDate, birthTime, birthPlace);
      setResult(doshResult);
    } catch (err) {
      console.error("Error calculating Mangal Dosh:", err);
      setError("Unable to calculate. Please check your birth details and try again.");
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="py-12 lg:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-red-100 text-red-800">{t('calculator.freeTool', 'Free Calculator')}</Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {t('calculator.mangalDosh.title', 'Mangal Dosh Calculator (Manglik Check)')}
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {t('calculator.mangalDosh.subtitle', 'Check if you have Mangal Dosha (Kuja Dosha) in your birth chart. Understand its effects on marriage and learn about effective remedies.')}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                {t('calculator.enterBirthDetails', 'Enter Birth Details')}
              </CardTitle>
              <CardDescription>
                {t('calculator.mangalDosh.birthTimeNote', 'Accurate birth time helps determine Mars placement precisely')}
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
                  {t('calculator.mangalDosh.marsPlacementNote', 'Birth time affects house placement of Mars')}
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
                className="w-full bg-red-600 hover:bg-red-700"
                disabled={!birthDate || isCalculating}
              >
                {isCalculating ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                    {t('calculator.mangalDosh.analyzing', 'Analyzing Mars Position...')}
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    {t('calculator.mangalDosh.checkMangalDosh', 'Check Mangal Dosh')}
                  </>
                )}
              </Button>

              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold text-gray-900 mb-3">{t('calculator.mangalDosh.whatIs', 'What is Mangal Dosha?')}</h3>
                <p className="text-sm text-gray-600">
                  {t('calculator.mangalDosh.whatIsDesc', 'Mangal Dosha occurs when Mars (Mangal) is placed in the 1st, 2nd, 4th, 7th, 8th, or 12th house from Lagna, Moon, or Venus. It is believed to affect marriage and relationships.')}
                </p>
              </div>
            </CardContent>
          </Card>

          {result ? (
            <Card className={`border-2 ${result.hasMangalDosh ? "border-red-300 bg-red-50" : "border-green-300 bg-green-50"}`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {result.hasMangalDosh ? (
                    <>
                      <XCircle className="w-6 h-6 text-red-600" />
                      {t('calculator.mangalDosh.detected', 'Mangal Dosha Detected')}
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-6 h-6 text-green-600" />
                      {t('calculator.mangalDosh.notDetected', 'No Mangal Dosha')}
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4 text-center">
                      <p className="text-sm text-gray-600">{t('calculator.mangalDosh.marsHouse', 'Mars House')}</p>
                      <p className="text-2xl font-bold text-red-700">{result.marsHouse}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center">
                      <p className="text-sm text-gray-600">{t('calculator.mangalDosh.marsSign', 'Mars Sign')}</p>
                      <p className="text-2xl font-bold text-red-700">{result.marsSign}</p>
                    </div>
                  </div>

                  {result.hasMangalDosh && (
                    <>
                      <div className="bg-white rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-900">{t('calculator.mangalDosh.severityLevel', 'Severity Level')}</h3>
                          <Badge className={
                            result.severity === "Severe" ? "bg-red-500" :
                            result.severity === "Moderate" ? "bg-orange-500" :
                            "bg-yellow-500"
                          }>
                            {result.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          {result.severity === "Severe" 
                            ? "Strong Mangal Dosha - Remedies recommended before marriage"
                            : result.severity === "Moderate"
                            ? "Moderate Mangal Dosha - Some remedies may help"
                            : "Mild Mangal Dosha - Effects are minimal"}
                        </p>
                      </div>

                      <div className="bg-white rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 mb-2">{t('calculator.mangalDosh.affectedAreas', 'Affected Life Areas')}</h3>
                        <div className="flex flex-wrap gap-2">
                          {result.affectedAreas.map((area) => (
                            <Badge key={area} variant="secondary" className="bg-red-100 text-red-700">
                              {area}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {result.cancellations.length > 0 && (
                        <div className="bg-green-100 rounded-lg p-4">
                          <h3 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            {t('calculator.mangalDosh.cancellationFactors', 'Cancellation Factors Found')}
                          </h3>
                          <ul className="text-sm text-green-700 space-y-1">
                            {result.cancellations.map((c, i) => (
                              <li key={i}>• {c}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="bg-amber-50 rounded-lg p-4">
                        <h3 className="font-semibold text-amber-800 mb-2">{t('calculator.mangalDosh.recommendedRemedies', 'Recommended Remedies')}</h3>
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

                  <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-800 mb-2">{t('calculator.mangalDosh.marriageAdvice', 'Marriage Advice')}</h3>
                    <p className="text-sm text-blue-700">{result.marriageAdvice}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-red-200 bg-red-50/50">
              <CardContent className="flex flex-col items-center justify-center h-full py-12">
                <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center mb-4">
                  <AlertTriangle className="w-12 h-12 text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t('calculator.mangalDosh.resultPlaceholder', 'Your Mangal Dosh Result Will Appear Here')}
                </h3>
                <p className="text-gray-600 text-center max-w-xs">
                  {t('calculator.mangalDosh.resultPlaceholderDesc', 'Enter your birth details and click "Check Mangal Dosh" to analyze Mars placement in your chart.')}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <Card className="border-amber-200 mt-8">
          <CardHeader>
            <CardTitle>{t('calculator.mangalDosh.cancellationTitle', 'Mangal Dosha Cancellation Conditions')}</CardTitle>
            <CardDescription>
              {t('calculator.mangalDosh.cancellationDesc', 'These factors can reduce or cancel the effects of Mangal Dosha')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                t('calculator.mangalDosh.cancellation1', 'Mars is in its own sign (Aries or Scorpio)'),
                t('calculator.mangalDosh.cancellation2', 'Mars is in exaltation (Capricorn)'),
                t('calculator.mangalDosh.cancellation3', 'Mars is aspected by benefic Jupiter'),
                t('calculator.mangalDosh.cancellation4', 'Mars is conjunct with benefic planets'),
                t('calculator.mangalDosh.cancellation5', 'Both partners have Mangal Dosha (mutual cancellation)'),
                t('calculator.mangalDosh.cancellation6', 'Mars is in Navamsa of benefic planets'),
                t('calculator.mangalDosh.cancellation7', 'Person is born on Tuesday'),
                t('calculator.mangalDosh.cancellation8', 'Mars is in 2nd house in Gemini, Virgo, or Sagittarius'),
                t('calculator.mangalDosh.cancellation9', 'Mars is in 12th house in Taurus or Libra'),
                t('calculator.mangalDosh.cancellation10', 'Age above 28 years (Dosha weakens)'),
              ].map((condition, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{condition}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <Card className="border-amber-200 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-2">{t('calculator.horoscopeMatching.title', 'Horoscope Matching')}</h3>
              <p className="text-gray-600 text-sm mb-4">
                {t('calculator.horoscopeMatching.shortDesc', 'Complete Kundli matching with Guna Milan.')}
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/tools/horoscope-matching">
                  {t('calculator.horoscopeMatching.matchKundli', 'Match Kundli')} <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-amber-200 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-2">{t('calculator.mangalDosh.sadeSatiCalculator', 'Sade Sati Calculator')}</h3>
              <p className="text-gray-600 text-sm mb-4">
                {t('calculator.mangalDosh.sadeSatiCalculatorDesc', "Check Saturn's 7.5 year transit effects.")}
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/tools/sade-sati-calculator">
                  {t('calculator.mangalDosh.checkSadeSati', 'Check Sade Sati')} <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-amber-200 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-2">{t('calculator.mangalDosh.doshaRemediesGuide', 'Dosha Remedies Guide')}</h3>
              <p className="text-gray-600 text-sm mb-4">
                {t('calculator.mangalDosh.doshaRemediesGuideDesc', 'Learn about all doshas and their remedies.')}
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/doshas/mangal-dosh">
                  {t('calculator.readGuide', 'Read Guide')} <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="border-red-200 bg-red-50 mt-12">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {t('calculator.mangalDosh.guideTitle', 'Complete Guide to Mangal Dosha')}
            </h2>
            <div className="prose prose-red max-w-none">
              <p className="text-gray-700 mb-4">
                {t('calculator.mangalDosh.guideIntro', 'Mangal Dosha, also known as Kuja Dosha, Bhom Dosha, or Manglik Dosha, is one of the most discussed astrological conditions in Vedic astrology, particularly concerning marriage compatibility. It occurs when Mars (Mangal) occupies certain houses in the birth chart.')}
              </p>
              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                {t('calculator.mangalDosh.housesTitle', 'Houses That Cause Mangal Dosha')}
              </h3>
              <p className="text-gray-700 mb-4">
                {t('calculator.mangalDosh.housesDesc', 'Mars in the 1st, 2nd, 4th, 7th, 8th, or 12th house from Lagna (Ascendant), Moon, or Venus creates Mangal Dosha. The severity varies based on the house:')}
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li><strong>{t('calculator.mangalDosh.house1Label', '1st House:')}</strong> {t('calculator.mangalDosh.house1Desc', 'Affects personality and can cause aggressive behavior')}</li>
                <li><strong>{t('calculator.mangalDosh.house2Label', '2nd House:')}</strong> {t('calculator.mangalDosh.house2Desc', 'Impacts family life and financial stability')}</li>
                <li><strong>{t('calculator.mangalDosh.house4Label', '4th House:')}</strong> {t('calculator.mangalDosh.house4Desc', 'Affects domestic peace and relationship with mother')}</li>
                <li><strong>{t('calculator.mangalDosh.house7Label', '7th House:')}</strong> {t('calculator.mangalDosh.house7Desc', 'Directly impacts marriage and spouse')}</li>
                <li><strong>{t('calculator.mangalDosh.house8Label', '8th House:')}</strong> {t('calculator.mangalDosh.house8Desc', 'Can affect longevity and cause sudden events')}</li>
                <li><strong>{t('calculator.mangalDosh.house12Label', '12th House:')}</strong> {t('calculator.mangalDosh.house12Desc', 'Impacts bed pleasures and can cause separation')}</li>
              </ul>
              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                {t('calculator.mangalDosh.importantTitle', 'Important Considerations')}
              </h3>
              <p className="text-gray-700">
                {t('calculator.mangalDosh.importantDesc', "It's important to note that approximately 40% of people have some form of Mangal Dosha. Many cancellation factors exist, and the Dosha's effects diminish after age 28. A qualified astrologer should analyze the complete chart before drawing conclusions. Matching two Manglik individuals is traditionally considered to neutralize the Dosha.")}
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
            name: "Mangal Dosh Calculator",
            description: "Check Mangal Dosha (Manglik) in your birth chart and learn about remedies",
            url: "https://vedicstarastro.com/tools/mangal-dosh-calculator",
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
