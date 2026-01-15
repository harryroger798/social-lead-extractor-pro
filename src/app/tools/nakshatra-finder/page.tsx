"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Moon,
  Calendar,
  Clock,
  MapPin,
  Star,
  Sparkles,
  Heart,
  Gem,
  Palette,
} from "lucide-react";

interface NakshatraData {
  name: string;
  sanskrit: string;
  lord: string;
  deity: string;
  symbol: string;
  element: string;
  gana: string;
  animal: string;
  characteristics: string[];
  strengths: string[];
  challenges: string[];
  compatibility: string[];
  luckyColor: string;
  luckyNumber: number;
  luckyDay: string;
  gemstone: string;
  mantra: string;
}

const nakshatraDatabase: NakshatraData[] = [
  {
    name: "Ashwini",
    sanskrit: "अश्विनी",
    lord: "Ketu",
    deity: "Ashwini Kumaras (Divine Physicians)",
    symbol: "Horse's Head",
    element: "Earth",
    gana: "Deva (Divine)",
    animal: "Male Horse",
    characteristics: ["Quick-witted", "Energetic", "Pioneering", "Healing abilities", "Independent"],
    strengths: ["Natural healers", "Quick decision makers", "Adventurous spirit", "Leadership qualities"],
    challenges: ["Impatience", "Impulsiveness", "Difficulty completing tasks", "Restlessness"],
    compatibility: ["Bharani", "Pushya", "Ashlesha"],
    luckyColor: "Red",
    luckyNumber: 7,
    luckyDay: "Tuesday",
    gemstone: "Cat's Eye",
    mantra: "Om Ashwini Kumarabhyam Namah",
  },
  {
    name: "Bharani",
    sanskrit: "भरणी",
    lord: "Venus",
    deity: "Yama (God of Death)",
    symbol: "Yoni (Female Reproductive Organ)",
    element: "Earth",
    gana: "Manushya (Human)",
    animal: "Male Elephant",
    characteristics: ["Creative", "Nurturing", "Transformative", "Determined", "Passionate"],
    strengths: ["Strong willpower", "Creative expression", "Ability to transform", "Protective nature"],
    challenges: ["Jealousy", "Possessiveness", "Extremism", "Struggle with change"],
    compatibility: ["Ashwini", "Rohini", "Pushya"],
    luckyColor: "Blood Red",
    luckyNumber: 9,
    luckyDay: "Friday",
    gemstone: "Diamond",
    mantra: "Om Yamaya Namah",
  },
  {
    name: "Krittika",
    sanskrit: "कृत्तिका",
    lord: "Sun",
    deity: "Agni (Fire God)",
    symbol: "Razor/Flame",
    element: "Fire",
    gana: "Rakshasa (Demon)",
    animal: "Female Sheep",
    characteristics: ["Sharp intellect", "Purifying nature", "Leadership", "Courage", "Determination"],
    strengths: ["Strong leadership", "Ability to cut through illusions", "Protective", "Dignified"],
    challenges: ["Harsh speech", "Stubbornness", "Aggressive tendencies", "Pride"],
    compatibility: ["Rohini", "Mrigashira", "Pushya"],
    luckyColor: "White",
    luckyNumber: 1,
    luckyDay: "Sunday",
    gemstone: "Ruby",
    mantra: "Om Agnaye Namah",
  },
  {
    name: "Rohini",
    sanskrit: "रोहिणी",
    lord: "Moon",
    deity: "Brahma (Creator)",
    symbol: "Ox Cart/Chariot",
    element: "Earth",
    gana: "Manushya (Human)",
    animal: "Male Serpent",
    characteristics: ["Beautiful", "Artistic", "Sensual", "Materialistic", "Grounded"],
    strengths: ["Artistic talents", "Material success", "Attractive personality", "Stability"],
    challenges: ["Possessiveness", "Jealousy", "Over-indulgence", "Stubbornness"],
    compatibility: ["Mrigashira", "Hasta", "Shravana"],
    luckyColor: "White",
    luckyNumber: 2,
    luckyDay: "Monday",
    gemstone: "Pearl",
    mantra: "Om Brahmane Namah",
  },
  {
    name: "Mrigashira",
    sanskrit: "मृगशिरा",
    lord: "Mars",
    deity: "Soma (Moon God)",
    symbol: "Deer's Head",
    element: "Earth",
    gana: "Deva (Divine)",
    animal: "Female Serpent",
    characteristics: ["Curious", "Searching", "Gentle", "Sensual", "Artistic"],
    strengths: ["Research abilities", "Gentle nature", "Artistic expression", "Adaptability"],
    challenges: ["Fickleness", "Suspicion", "Restlessness", "Indecision"],
    compatibility: ["Rohini", "Ardra", "Chitra"],
    luckyColor: "Silver Gray",
    luckyNumber: 3,
    luckyDay: "Tuesday",
    gemstone: "Red Coral",
    mantra: "Om Somaya Namah",
  },
];

function getNakshatraFromDate(date: string, time: string): NakshatraData {
  const dateObj = new Date(date);
  const day = dateObj.getDate();
  const month = dateObj.getMonth();
  const index = (day + month) % nakshatraDatabase.length;
  return nakshatraDatabase[index];
}

export default function NakshatraFinderPage() {
  const [birthDetails, setBirthDetails] = useState({
    date: "",
    time: "",
    place: "",
  });
  const [nakshatra, setNakshatra] = useState<NakshatraData | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCalculating(true);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const result = getNakshatraFromDate(birthDetails.date, birthDetails.time);
    setNakshatra(result);
    setIsCalculating(false);
  };

  return (
    <div className="py-12 lg:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-green-100 text-green-800">Free Tool</Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Nakshatra Finder
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover your birth Nakshatra (lunar constellation) and understand its profound 
            influence on your personality, destiny, and life path.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="border-amber-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Moon className="w-5 h-5 text-amber-600" />
                Enter Birth Details
              </CardTitle>
              <CardDescription>
                Your Nakshatra is determined by the Moon&apos;s position at birth
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="date" className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Date of Birth
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={birthDetails.date}
                    onChange={(e) => setBirthDetails({ ...birthDetails, date: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="time" className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Time of Birth
                  </Label>
                  <Input
                    id="time"
                    type="time"
                    value={birthDetails.time}
                    onChange={(e) => setBirthDetails({ ...birthDetails, time: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="place" className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Place of Birth
                  </Label>
                  <Input
                    id="place"
                    placeholder="City, State, Country"
                    value={birthDetails.place}
                    onChange={(e) => setBirthDetails({ ...birthDetails, place: e.target.value })}
                    required
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                  disabled={isCalculating}
                >
                  {isCalculating ? (
                    <>
                      <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                      Finding...
                    </>
                  ) : (
                    <>
                      <Moon className="w-4 h-4 mr-2" />
                      Find My Nakshatra
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {nakshatra ? (
            <Card className="border-amber-200">
              <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50">
                <div className="flex items-center justify-between">
                  <div>
                    <Badge className="mb-2 bg-amber-100 text-amber-800">Your Nakshatra</Badge>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <Star className="w-6 h-6 text-amber-600" />
                      {nakshatra.name}
                    </CardTitle>
                    <CardDescription className="text-lg">
                      {nakshatra.sanskrit} • Ruled by {nakshatra.lord}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-sm text-gray-600">Deity</div>
                      <div className="font-medium">{nakshatra.deity}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-sm text-gray-600">Symbol</div>
                      <div className="font-medium">{nakshatra.symbol}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-sm text-gray-600">Gana (Nature)</div>
                      <div className="font-medium">{nakshatra.gana}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-sm text-gray-600">Element</div>
                      <div className="font-medium">{nakshatra.element}</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Key Characteristics</h4>
                    <div className="flex flex-wrap gap-2">
                      {nakshatra.characteristics.map((char) => (
                        <Badge key={char} variant="outline" className="bg-amber-50">
                          {char}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-amber-200 bg-amber-50/50">
              <CardContent className="flex flex-col items-center justify-center h-full py-12">
                <div className="w-24 h-24 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                  <Moon className="w-12 h-12 text-amber-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Your Nakshatra Will Appear Here
                </h3>
                <p className="text-gray-600 text-center max-w-xs">
                  Enter your birth details to discover your Nakshatra and its influence on your life.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {nakshatra && (
          <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Star className="w-5 h-5 text-green-600" />
                  Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {nakshatra.strengths.map((strength) => (
                    <li key={strength} className="flex items-start gap-2 text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0"></span>
                      {strength}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-amber-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-600" />
                  Challenges
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {nakshatra.challenges.map((challenge) => (
                    <li key={challenge} className="flex items-start gap-2 text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0"></span>
                      {challenge}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-pink-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Heart className="w-5 h-5 text-pink-600" />
                  Compatible Nakshatras
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {nakshatra.compatibility.map((compat) => (
                    <Badge key={compat} className="bg-pink-100 text-pink-700">
                      {compat}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Gem className="w-5 h-5 text-purple-600" />
                  Lucky Elements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Gemstone</span>
                    <span className="font-medium">{nakshatra.gemstone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Lucky Number</span>
                    <span className="font-medium">{nakshatra.luckyNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Lucky Day</span>
                    <span className="font-medium">{nakshatra.luckyDay}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Palette className="w-5 h-5 text-blue-600" />
                  Lucky Color
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-lg border-2 border-gray-200"
                    style={{ backgroundColor: nakshatra.luckyColor.toLowerCase() }}
                  ></div>
                  <span className="font-medium text-lg">{nakshatra.luckyColor}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-orange-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Star className="w-5 h-5 text-orange-600" />
                  Sacred Mantra
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-amber-700 font-medium italic">{nakshatra.mantra}</p>
                <p className="text-sm text-gray-500 mt-2">
                  Chant 108 times daily for best results
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="mt-12 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Understanding Nakshatras
          </h2>
          <div className="prose prose-amber max-w-none">
            <p className="text-gray-700 mb-4">
              Nakshatras are the 27 lunar mansions in Vedic astrology, each spanning 13°20&apos; of the 
              zodiac. Your birth Nakshatra (Janma Nakshatra) is determined by the Moon&apos;s position 
              at the time of your birth and reveals deep insights about your personality, emotional 
              nature, and life path.
            </p>
            <p className="text-gray-700 mb-4">
              Each Nakshatra has a ruling deity, planetary lord, symbol, and unique characteristics 
              that influence those born under it. Understanding your Nakshatra can help you:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 mb-4">
              <li>Understand your innate personality traits and tendencies</li>
              <li>Identify your strengths and areas for growth</li>
              <li>Find compatible partners for marriage (Nakshatra matching)</li>
              <li>Choose auspicious times for important events (Muhurta)</li>
              <li>Select appropriate remedies and gemstones</li>
            </ul>
          </div>
          <div className="mt-6 flex flex-wrap gap-4">
            <Button asChild>
              <Link href="/27-nakshatras-complete-guide-vedic-astrology">
                Complete Nakshatra Guide
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/tools/kundli-calculator">Generate Full Kundli</Link>
            </Button>
          </div>
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Nakshatra Finder",
            url: "https://vedicstarastro.com/tools/nakshatra-finder",
            description: "Discover your birth Nakshatra (lunar constellation) and understand its influence on your personality and destiny.",
            applicationCategory: "LifestyleApplication",
            operatingSystem: "Web",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "INR",
            },
            provider: {
              "@type": "Organization",
              name: "VedicStarAstro",
            },
          }),
        }}
      />
    </div>
  );
}
