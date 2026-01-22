"use client";

import { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LocationInput } from "@/components/ui/location-input";
import {
  BookOpen,
  Calendar,
  Clock,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Sparkles,
  Heart,
  Users,
  Home,
  Coins,
  Baby,
  Shield,
  Flame,
  Star,
  Sun,
  Moon,
} from "lucide-react";

interface BirthDetails {
  name: string;
  date: string;
  time: string;
  place: string;
}

interface PlanetPosition {
  planet: string;
  house: number;
  sign: string;
}

interface Debt {
  key: string;
  name: string;
  nameHindi: string;
  description: string;
  isPresent: boolean;
  severity: "high" | "medium" | "low";
  remedies: string[];
}

interface LalKitabResult {
  planets: PlanetPosition[];
  debts: Debt[];
  predictions: string[];
  remedies: string[];
}

const zodiacSignKeys = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
] as const;

const planetKeys = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"] as const;

const debtKeys = [
  "pitriRina", "matriRina", "striRina", "bhaiRina", 
  "swajanRina", "kulRina", "atyacharRina", "ajanmaRina"
] as const;

// Lal Kitab Pakka Ghar (Permanent Houses) for each planet
const pakkaGhar: Record<string, number[]> = {
  Sun: [1],
  Moon: [4],
  Mars: [3, 8],
  Mercury: [7],
  Jupiter: [2, 5, 9],
  Venus: [7],
  Saturn: [8, 10, 11],
  Rahu: [12],
  Ketu: [6]
};

// Calculate planetary positions based on birth details
function calculatePlanetaryPositions(birthDate: string, birthTime: string): PlanetPosition[] {
  const date = new Date(birthDate + "T" + birthTime);
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const hour = date.getHours() + date.getMinutes() / 60;
  
  // Simplified calculation based on date and time
  // In production, this would use Swiss Ephemeris or similar
  const positions: PlanetPosition[] = [];
  
  // Sun position (approximately 1 degree per day)
  const sunLongitude = (dayOfYear * (360 / 365.25) + 280) % 360;
  const sunHouse = Math.floor(sunLongitude / 30) + 1;
  positions.push({ planet: "Sun", house: sunHouse, sign: zodiacSignKeys[sunHouse - 1] });
  
  // Moon position (approximately 13 degrees per day)
  const moonLongitude = (dayOfYear * 13.176 + hour * 0.55 + 180) % 360;
  const moonHouse = Math.floor(moonLongitude / 30) + 1;
  positions.push({ planet: "Moon", house: moonHouse > 12 ? moonHouse - 12 : moonHouse, sign: zodiacSignKeys[(moonHouse - 1) % 12] });
  
  // Mars (approximately 0.52 degrees per day)
  const marsLongitude = (dayOfYear * 0.524 + 45) % 360;
  const marsHouse = Math.floor(marsLongitude / 30) + 1;
  positions.push({ planet: "Mars", house: marsHouse > 12 ? marsHouse - 12 : marsHouse, sign: zodiacSignKeys[(marsHouse - 1) % 12] });
  
  // Mercury (close to Sun, within 28 degrees)
  const mercuryOffset = Math.sin(dayOfYear * 0.1) * 28;
  const mercuryLongitude = (sunLongitude + mercuryOffset + 360) % 360;
  const mercuryHouse = Math.floor(mercuryLongitude / 30) + 1;
  positions.push({ planet: "Mercury", house: mercuryHouse > 12 ? mercuryHouse - 12 : mercuryHouse, sign: zodiacSignKeys[(mercuryHouse - 1) % 12] });
  
  // Jupiter (approximately 0.083 degrees per day)
  const jupiterLongitude = (dayOfYear * 0.083 + 120) % 360;
  const jupiterHouse = Math.floor(jupiterLongitude / 30) + 1;
  positions.push({ planet: "Jupiter", house: jupiterHouse > 12 ? jupiterHouse - 12 : jupiterHouse, sign: zodiacSignKeys[(jupiterHouse - 1) % 12] });
  
  // Venus (close to Sun, within 47 degrees)
  const venusOffset = Math.sin(dayOfYear * 0.08) * 47;
  const venusLongitude = (sunLongitude + venusOffset + 360) % 360;
  const venusHouse = Math.floor(venusLongitude / 30) + 1;
  positions.push({ planet: "Venus", house: venusHouse > 12 ? venusHouse - 12 : venusHouse, sign: zodiacSignKeys[(venusHouse - 1) % 12] });
  
  // Saturn (approximately 0.033 degrees per day)
  const saturnLongitude = (dayOfYear * 0.033 + 240) % 360;
  const saturnHouse = Math.floor(saturnLongitude / 30) + 1;
  positions.push({ planet: "Saturn", house: saturnHouse > 12 ? saturnHouse - 12 : saturnHouse, sign: zodiacSignKeys[(saturnHouse - 1) % 12] });
  
  // Rahu (moves backwards, approximately 0.053 degrees per day)
  const rahuLongitude = (360 - (dayOfYear * 0.053) + 300) % 360;
  const rahuHouse = Math.floor(rahuLongitude / 30) + 1;
  positions.push({ planet: "Rahu", house: rahuHouse > 12 ? rahuHouse - 12 : rahuHouse, sign: zodiacSignKeys[(rahuHouse - 1) % 12] });
  
  // Ketu (opposite to Rahu)
  const ketuHouse = rahuHouse > 6 ? rahuHouse - 6 : rahuHouse + 6;
  positions.push({ planet: "Ketu", house: ketuHouse, sign: zodiacSignKeys[(ketuHouse - 1) % 12] });
  
  return positions;
}

// Calculate Lal Kitab Debts (Rinas)
function calculateDebts(positions: PlanetPosition[]): Debt[] {
  const debts: Debt[] = [];
  
  const getHouse = (planet: string): number => {
    const pos = positions.find(p => p.planet === planet);
    return pos ? pos.house : 0;
  };
  
  const jupiter = getHouse("Jupiter");
  const mercury = getHouse("Mercury");
  const venus = getHouse("Venus");
  const rahu = getHouse("Rahu");
  const ketu = getHouse("Ketu");
  const moon = getHouse("Moon");
  const sun = getHouse("Sun");
  const mars = getHouse("Mars");
  const saturn = getHouse("Saturn");
  
  // 1. Pitri Rina (Father's Debt)
  const jupiterBadHouses = [3, 6, 7, 8, 10];
  const pitriCondition1 = jupiterBadHouses.includes(jupiter);
  const pitriCondition2 = [mercury, venus, rahu, ketu].some(p => [2, 5, 9, 12].includes(p));
  debts.push({
    key: "pitriRina",
    name: "Father's Debt (Pitri Rina)",
    nameHindi: "पितृ ऋण",
    description: "Debt related to father or ancestors. May cause obstacles in career and education.",
    isPresent: pitriCondition1 && pitriCondition2,
    severity: pitriCondition1 && pitriCondition2 ? "high" : "low",
    remedies: [
      "Serve your father and elderly people",
      "Donate yellow items on Thursdays",
      "Feed crows and dogs",
      "Offer water to the Sun every morning",
      "Keep a piece of gold with you"
    ]
  });
  
  // 2. Matri Rina (Mother's Debt)
  const moonBadHouses = [3, 6, 8, 10, 11, 12];
  const matriCondition = moonBadHouses.includes(moon) || ketu === 4;
  debts.push({
    key: "matriRina",
    name: "Mother's Debt (Matri Rina)",
    nameHindi: "मातृ ऋण",
    description: "Debt related to mother. May cause mental stress and emotional issues.",
    isPresent: matriCondition,
    severity: matriCondition ? "high" : "low",
    remedies: [
      "Serve your mother with devotion",
      "Donate white items on Mondays",
      "Keep silver items at home",
      "Offer milk to Shivling",
      "Feed white cows"
    ]
  });
  
  // 3. Stri Rina (Wife's/Woman's Debt)
  const venusBadHouses = [3, 4, 5, 6, 9, 10, 11];
  const striCondition1 = venusBadHouses.includes(venus);
  const striCondition2 = [sun, moon, rahu].some(p => [2, 7].includes(p));
  debts.push({
    key: "striRina",
    name: "Wife's Debt (Stri Rina)",
    nameHindi: "स्त्री ऋण",
    description: "Debt related to wife or women. May cause marital problems and relationship issues.",
    isPresent: striCondition1 && striCondition2,
    severity: striCondition1 && striCondition2 ? "high" : "low",
    remedies: [
      "Respect all women in your life",
      "Donate white clothes to women on Fridays",
      "Keep a silver square piece",
      "Offer white flowers to Goddess Lakshmi",
      "Help poor women and widows"
    ]
  });
  
  // 4. Bhai Rina (Sibling's Debt)
  const mercuryBadHouses = [1, 2, 4, 5, 8, 10, 11];
  const bhaiCondition1 = mercuryBadHouses.includes(mercury);
  const bhaiCondition2 = [3, 6].includes(moon);
  debts.push({
    key: "bhaiRina",
    name: "Sibling's Debt (Bhai Rina)",
    nameHindi: "भाई ऋण",
    description: "Debt related to siblings. May cause conflicts with brothers/sisters.",
    isPresent: bhaiCondition1 && bhaiCondition2,
    severity: bhaiCondition1 && bhaiCondition2 ? "medium" : "low",
    remedies: [
      "Maintain good relations with siblings",
      "Donate green items on Wednesdays",
      "Feed green grass to cows",
      "Help your siblings financially",
      "Plant green trees"
    ]
  });
  
  // 5. Swajan Rina (Relative's Debt)
  const marsBadHouses = [2, 4, 5, 6, 9, 11, 12];
  const swajanCondition1 = marsBadHouses.includes(mars);
  const swajanCondition2 = [mercury, ketu].some(p => p === 8);
  debts.push({
    key: "swajanRina",
    name: "Relative's Debt (Swajan Rina)",
    nameHindi: "स्वजन ऋण",
    description: "Debt related to relatives. May cause property disputes and family conflicts.",
    isPresent: swajanCondition1 && swajanCondition2,
    severity: swajanCondition1 && swajanCondition2 ? "medium" : "low",
    remedies: [
      "Help your relatives in need",
      "Donate red items on Tuesdays",
      "Feed monkeys with jaggery",
      "Keep a red handkerchief",
      "Offer red flowers to Hanuman"
    ]
  });
  
  // 6. Kul Rina (Clan's Debt)
  const kulCondition1 = ![1, 5, 11].includes(sun);
  const kulCondition2 = [venus, saturn, rahu, ketu].some(p => p === 5);
  debts.push({
    key: "kulRina",
    name: "Clan's Debt (Kul Rina)",
    nameHindi: "कुल ऋण",
    description: "Debt related to family lineage. May cause issues with children and family reputation.",
    isPresent: kulCondition1 && kulCondition2,
    severity: kulCondition1 && kulCondition2 ? "high" : "low",
    remedies: [
      "Perform Pitra Tarpan on Amavasya",
      "Donate wheat and jaggery",
      "Feed Brahmins on ancestors' death anniversary",
      "Keep family traditions alive",
      "Offer water to Peepal tree"
    ]
  });
  
  // 7. Atyachar Rina (Cruelty Debt)
  const saturnBadHouses = [1, 2, 5, 6, 8, 9, 12];
  const atyacharCondition1 = saturnBadHouses.includes(saturn);
  const atyacharCondition2 = [sun, moon, mars].some(p => [10, 12].includes(p));
  debts.push({
    key: "atyacharRina",
    name: "Cruelty Debt (Atyachar Rina)",
    nameHindi: "अत्याचार ऋण",
    description: "Debt from past cruelty. May cause sudden losses and accidents.",
    isPresent: atyacharCondition1 && atyacharCondition2,
    severity: atyacharCondition1 && atyacharCondition2 ? "high" : "low",
    remedies: [
      "Be kind to all living beings",
      "Donate black items on Saturdays",
      "Feed black dogs and crows",
      "Help disabled and poor people",
      "Donate iron items"
    ]
  });
  
  // 8. Ajanma Rina (Unborn's Debt)
  const ajanmaCondition1 = ![3, 6].includes(rahu);
  const ajanmaCondition2 = [sun, mars, saturn].some(p => p === 5);
  debts.push({
    key: "ajanmaRina",
    name: "Unborn's Debt (Ajanma Rina)",
    nameHindi: "अजन्मा ऋण",
    description: "Debt related to unborn children. May cause issues with progeny.",
    isPresent: ajanmaCondition1 && ajanmaCondition2,
    severity: ajanmaCondition1 && ajanmaCondition2 ? "high" : "low",
    remedies: [
      "Donate to orphanages",
      "Feed children with sweets",
      "Keep a silver elephant at home",
      "Offer coconut to flowing water",
      "Help in education of poor children"
    ]
  });
  
  return debts;
}

// Generate Lal Kitab predictions based on planetary positions
function generatePredictions(positions: PlanetPosition[]): string[] {
  const predictions: string[] = [];
  
  positions.forEach(pos => {
    const isPakka = pakkaGhar[pos.planet]?.includes(pos.house);
    
    if (isPakka) {
      predictions.push(`${pos.planet} is in its Pakka Ghar (House ${pos.house}). This is highly favorable and will give excellent results.`);
    }
    
    // Sun predictions
    if (pos.planet === "Sun") {
      if (pos.house === 1) predictions.push("Sun in 1st house: Strong personality, leadership qualities, government favor.");
      else if (pos.house === 4) predictions.push("Sun in 4th house: May face challenges with property. Keep wheat and jaggery at home.");
      else if (pos.house === 7) predictions.push("Sun in 7th house: Late marriage possible. Maintain good relations with in-laws.");
      else if (pos.house === 10) predictions.push("Sun in 10th house: Excellent for career and authority. Will achieve high position.");
    }
    
    // Moon predictions
    if (pos.planet === "Moon") {
      if (pos.house === 4) predictions.push("Moon in 4th house: Blessed with mother's love, property gains, mental peace.");
      else if (pos.house === 1) predictions.push("Moon in 1st house: Emotional nature, good imagination, travel opportunities.");
      else if (pos.house === 8) predictions.push("Moon in 8th house: Keep silver with you. Avoid milk business.");
    }
    
    // Jupiter predictions
    if (pos.planet === "Jupiter") {
      if ([2, 5, 9].includes(pos.house)) predictions.push(`Jupiter in House ${pos.house}: Highly auspicious. Wealth, wisdom, and spiritual growth.`);
      else if (pos.house === 10) predictions.push("Jupiter in 10th house: Success in career but keep gold with you.");
    }
    
    // Saturn predictions
    if (pos.planet === "Saturn") {
      if ([10, 11].includes(pos.house)) predictions.push(`Saturn in House ${pos.house}: Good for career and income after age 36.`);
      else if (pos.house === 1) predictions.push("Saturn in 1st house: Hardworking nature. Success comes through persistent effort.");
    }
  });
  
  return predictions;
}

// Generate general Lal Kitab remedies
function generateRemedies(positions: PlanetPosition[]): string[] {
  const remedies: string[] = [];
  
  positions.forEach(pos => {
    const isPakka = pakkaGhar[pos.planet]?.includes(pos.house);
    
    if (!isPakka) {
      switch (pos.planet) {
        case "Sun":
          remedies.push(`For Sun in House ${pos.house}: Offer water to Sun at sunrise. Keep copper items.`);
          break;
        case "Moon":
          remedies.push(`For Moon in House ${pos.house}: Keep silver with you. Respect your mother.`);
          break;
        case "Mars":
          remedies.push(`For Mars in House ${pos.house}: Feed jaggery to monkeys. Keep red items.`);
          break;
        case "Mercury":
          remedies.push(`For Mercury in House ${pos.house}: Feed green grass to cows. Keep emerald or green items.`);
          break;
        case "Jupiter":
          remedies.push(`For Jupiter in House ${pos.house}: Respect elders and teachers. Donate yellow items on Thursday.`);
          break;
        case "Venus":
          remedies.push(`For Venus in House ${pos.house}: Respect women. Donate white items on Friday.`);
          break;
        case "Saturn":
          remedies.push(`For Saturn in House ${pos.house}: Serve the poor and disabled. Donate black items on Saturday.`);
          break;
        case "Rahu":
          remedies.push(`For Rahu in House ${pos.house}: Keep a silver ball. Donate to sweepers.`);
          break;
        case "Ketu":
          remedies.push(`For Ketu in House ${pos.house}: Feed dogs. Keep saffron at home.`);
          break;
      }
    }
  });
  
  return remedies;
}

export default function LalKitabPage() {
  const { t } = useLanguage();
  const [birthDetails, setBirthDetails] = useState<BirthDetails>({
    name: "",
    date: "",
    time: "",
    place: "",
  });
  const [result, setResult] = useState<LalKitabResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [activeTab, setActiveTab] = useState("chart");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCalculating(true);
    
    // Simulate calculation delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const positions = calculatePlanetaryPositions(birthDetails.date, birthDetails.time);
    const debts = calculateDebts(positions);
    const predictions = generatePredictions(positions);
    const remedies = generateRemedies(positions);
    
    setResult({
      planets: positions,
      debts,
      predictions,
      remedies
    });
    
    setIsCalculating(false);
  };

  const presentDebts = result?.debts.filter(d => d.isPresent) || [];

  return (
    <main className="min-h-screen bg-gradient-to-b from-red-50 to-orange-50">
      {/* Hero Section */}
      <section className="relative py-16 bg-gradient-to-r from-red-600 via-orange-600 to-red-700">
        <div className="absolute inset-0 bg-[url('/images/stars-pattern.png')] opacity-10"></div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <Badge className="mb-4 bg-white/20 text-white border-white/30">
              <BookOpen className="w-3 h-3 mr-1" />
              {t("lalKitab.badge", "Lal Kitab Astrology")}
            </Badge>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              {t("lalKitab.title", "Lal Kitab Kundli & Remedies")}
            </h1>
            <p className="text-lg text-red-100 max-w-2xl mx-auto">
              {t("lalKitab.subtitle", "Discover your Lal Kitab chart, debts (Rinas), and powerful remedies based on the ancient Red Book of astrology.")}
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
                  <Calendar className="w-5 h-5 text-red-600" />
                  {t("lalKitab.enterDetails", "Enter Birth Details")}
                </CardTitle>
                <CardDescription>
                  {t("lalKitab.enterDetailsDesc", "Generate your Lal Kitab Kundli and find remedies")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t("common.name", "Name")}</Label>
                    <Input
                      id="name"
                      value={birthDetails.name}
                      onChange={(e) => setBirthDetails({ ...birthDetails, name: e.target.value })}
                      placeholder={t("common.enterName", "Enter your name")}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="date">{t("common.birthDate", "Birth Date")}</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="date"
                        type="date"
                        value={birthDetails.date}
                        onChange={(e) => setBirthDetails({ ...birthDetails, date: e.target.value })}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="time">{t("common.birthTime", "Birth Time")}</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="time"
                        type="time"
                        value={birthDetails.time}
                        onChange={(e) => setBirthDetails({ ...birthDetails, time: e.target.value })}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="place">{t("common.birthPlace", "Birth Place")}</Label>
                                        <LocationInput
                                          value={birthDetails.place}
                                          onLocationSelect={(value) => setBirthDetails({ ...birthDetails, place: value })}
                                          placeholder={t("common.enterPlace", "Enter birth place")}
                                        />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-red-600 hover:bg-red-700"
                    disabled={isCalculating}
                  >
                    {isCalculating ? (
                      <>
                        <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                        {t("lalKitab.calculating", "Calculating...")}
                      </>
                    ) : (
                      <>
                        <BookOpen className="w-4 h-4 mr-2" />
                        {t("lalKitab.generateKundli", "Generate Lal Kitab Kundli")}
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
                  <BookOpen className="w-16 h-16 text-red-200 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    {t("lalKitab.noResult", "Enter your birth details")}
                  </h3>
                  <p className="text-gray-500 max-w-md">
                    {t("lalKitab.noResultDesc", "Fill in your birth information to generate your Lal Kitab Kundli, discover your debts (Rinas), and get personalized remedies.")}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4 mb-6">
                  <TabsTrigger value="chart">{t("lalKitab.chart", "Chart")}</TabsTrigger>
                  <TabsTrigger value="debts">{t("lalKitab.debts", "Debts")}</TabsTrigger>
                  <TabsTrigger value="predictions">{t("lalKitab.predictions", "Predictions")}</TabsTrigger>
                  <TabsTrigger value="remedies">{t("lalKitab.remedies", "Remedies")}</TabsTrigger>
                </TabsList>

                {/* Chart Tab */}
                <TabsContent value="chart">
                  <Card>
                    <CardHeader>
                      <CardTitle>{t("lalKitab.lalKitabChart", "Lal Kitab Chart")}</CardTitle>
                      <CardDescription>
                        {t("lalKitab.chartDesc", "Planetary positions according to Lal Kitab system")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {/* Lal Kitab Chart Grid */}
                      <div className="grid grid-cols-4 gap-1 max-w-md mx-auto mb-8">
                        {[12, 1, 2, 3, 11, null, null, 4, 10, null, null, 5, 9, 8, 7, 6].map((house, idx) => {
                          if (house === null) {
                            return <div key={idx} className="aspect-square bg-red-50"></div>;
                          }
                          const planetsInHouse = result.planets.filter(p => p.house === house);
                          const signKey = zodiacSignKeys[house - 1];
                          return (
                            <div 
                              key={idx} 
                              className="aspect-square border-2 border-red-300 bg-white p-1 flex flex-col items-center justify-center text-xs"
                            >
                              <span className="font-bold text-red-600">{house}</span>
                              <span className="text-[10px] text-gray-500">{t(`lalKitab.zodiacSigns.${signKey}`, signKey)}</span>
                              <div className="flex flex-wrap justify-center gap-0.5 mt-1">
                                {planetsInHouse.map(p => (
                                  <span key={p.planet} className="text-[9px] bg-red-100 px-1 rounded">
                                    {t(`lalKitab.planets.${p.planet}`, p.planet).substring(0, 2)}
                                  </span>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Planetary Positions Table */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2">{t("common.planet", "Planet")}</th>
                              <th className="text-left py-2">{t("common.house", "House")}</th>
                              <th className="text-left py-2">{t("common.sign", "Sign")}</th>
                              <th className="text-left py-2">{t("lalKitab.pakkaGhar", "Pakka Ghar")}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {result.planets.map(pos => {
                              const isPakka = pakkaGhar[pos.planet]?.includes(pos.house);
                              return (
                                <tr key={pos.planet} className="border-b">
                                  <td className="py-2 font-medium">{t(`lalKitab.planets.${pos.planet}`, pos.planet)}</td>
                                  <td className="py-2">{pos.house}</td>
                                  <td className="py-2">{t(`lalKitab.zodiacSigns.${pos.sign}`, pos.sign)}</td>
                                  <td className="py-2">
                                    {isPakka ? (
                                      <Badge className="bg-green-100 text-green-700">
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                        {t("lalKitab.yes", "Yes")}
                                      </Badge>
                                    ) : (
                                      <Badge variant="outline">{t("lalKitab.no", "No")}</Badge>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Debts Tab */}
                <TabsContent value="debts">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-orange-500" />
                        {t("lalKitab.lalKitabDebts", "Lal Kitab Debts (Rinas)")}
                      </CardTitle>
                      <CardDescription>
                        {t("lalKitab.debtsDesc", "Karmic debts from past lives that need to be resolved")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {presentDebts.length === 0 ? (
                        <div className="text-center py-8">
                          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-green-700">
                            {t("lalKitab.noDebts", "No Major Debts Found")}
                          </h3>
                          <p className="text-gray-500">
                            {t("lalKitab.noDebtsDesc", "Your chart shows no significant karmic debts.")}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {presentDebts.map((debt, idx) => (
                            <Card key={idx} className={`border-l-4 ${
                              debt.severity === "high" ? "border-l-red-500" :
                              debt.severity === "medium" ? "border-l-orange-500" : "border-l-yellow-500"
                            }`}>
                              <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                  <CardTitle className="text-lg">{t(`lalKitab.debtNames.${debt.key}`, debt.name)}</CardTitle>
                                  <Badge className={
                                    debt.severity === "high" ? "bg-red-100 text-red-700" :
                                    debt.severity === "medium" ? "bg-orange-100 text-orange-700" : "bg-yellow-100 text-yellow-700"
                                  }>
                                    {t(`lalKitab.severityLevels.${debt.severity}`, debt.severity.toUpperCase())}
                                  </Badge>
                                </div>
                              </CardHeader>
                              <CardContent>
                                <p className="text-gray-600 mb-4">{debt.description}</p>
                                <div>
                                  <h4 className="font-semibold text-sm mb-2">{t("lalKitab.remediesFor", "Remedies:")}</h4>
                                  <ul className="space-y-1">
                                    {debt.remedies.map((remedy, rIdx) => (
                                      <li key={rIdx} className="flex items-start gap-2 text-sm">
                                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                        <span>{remedy}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Predictions Tab */}
                <TabsContent value="predictions">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-500" />
                        {t("lalKitab.lalKitabPredictions", "Lal Kitab Predictions")}
                      </CardTitle>
                      <CardDescription>
                        {t("lalKitab.predictionsDesc", "Predictions based on your Lal Kitab chart")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {result.predictions.map((prediction, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                            <Sparkles className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                            <p className="text-gray-700">{prediction}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Remedies Tab */}
                <TabsContent value="remedies">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-green-500" />
                        {t("lalKitab.lalKitabRemedies", "Lal Kitab Remedies")}
                      </CardTitle>
                      <CardDescription>
                        {t("lalKitab.remediesDesc", "Simple and effective remedies to improve your life")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {result.remedies.map((remedy, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <p className="text-gray-700">{remedy}</p>
                          </div>
                        ))}
                      </div>
                      
                      {/* General Lal Kitab Tips */}
                      <div className="mt-8 p-4 bg-red-50 rounded-lg">
                        <h4 className="font-semibold text-red-700 mb-3">
                          {t("lalKitab.generalTips", "General Lal Kitab Tips")}
                        </h4>
                        <ul className="space-y-2 text-sm text-gray-700">
                          <li className="flex items-start gap-2">
                            <Sun className="w-4 h-4 text-orange-500 mt-0.5" />
                            <span>Offer water to the Sun every morning at sunrise</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Moon className="w-4 h-4 text-blue-500 mt-0.5" />
                            <span>Keep silver items at home for mental peace</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Heart className="w-4 h-4 text-red-500 mt-0.5" />
                            <span>Respect elders and serve parents for Jupiter's blessings</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Users className="w-4 h-4 text-purple-500 mt-0.5" />
                            <span>Help the poor and disabled for Saturn's favor</span>
                          </li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>

        {/* About Lal Kitab Section */}
        <section className="mt-16">
          <Card>
            <CardHeader>
              <CardTitle>{t("lalKitab.aboutTitle", "About Lal Kitab")}</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p className="text-gray-600">
                {t("lalKitab.aboutText1", "Lal Kitab, also known as the 'Red Book', is a unique system of Vedic astrology that originated in the Punjab region. Written in Urdu during 1939-1952 by Pandit Roop Chand Joshi, it offers a distinctive approach to horoscope analysis with simple, affordable, and highly effective remedies.")}
              </p>
              <p className="text-gray-600 mt-4">
                {t("lalKitab.aboutText2", "Unlike traditional Vedic astrology, Lal Kitab uses a fixed house system where Aries is always the first house, Taurus the second, and so on. It emphasizes the concept of 'Pakka Ghar' (permanent house) for each planet and introduces the unique concept of karmic debts (Rinas) that are carried forward from past lives.")}
              </p>
              <p className="text-gray-600 mt-4">
                {t("lalKitab.aboutText3", "The remedies prescribed in Lal Kitab are known for being simple, cost-effective, and quick to show results. They don't require complex rituals or expensive ceremonies - just simple acts like feeding animals, donating specific items, or keeping certain objects at home.")}
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
