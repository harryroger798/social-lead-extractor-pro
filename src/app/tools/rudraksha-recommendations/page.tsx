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
  Circle,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  ArrowRight,
  Heart,
  Shield,
  AlertCircle,
} from "lucide-react";

interface Planet {
  name: string;
  sign: string;
  degree: number;
  house: number;
  retrograde: boolean;
}

interface ChartData {
  ascendant: string;
  moon_sign: string;
  nakshatra: string;
  planets: Planet[];
  doshas: {
    mangal_dosha: boolean;
    kaal_sarp_dosha: boolean;
  };
}

interface RudrakshaRecommendation {
  mukhi: number;
  reason: string;
  priority: "high" | "medium" | "low";
}

const rudrakshaData: Record<number, {
  name: string;
  hindi: string;
  mukhi: number;
  deity: string;
  planet: string;
  benefits: string[];
  description: string;
  mantra: string;
  wearingDay: string;
  bestFor: string[];
}> = {
  1: {
    name: "Ek Mukhi Rudraksha",
    hindi: "एक मुखी रुद्राक्ष",
    mukhi: 1,
    deity: "Lord Shiva",
    planet: "Sun (Surya)",
    benefits: ["Supreme Consciousness", "Enlightenment", "Leadership", "Self-Realization"],
    description: "The rarest and most powerful Rudraksha, Ek Mukhi represents Lord Shiva himself. It bestows supreme consciousness, spiritual enlightenment, and liberation from the cycle of birth and death.",
    mantra: "Om Hreem Namah",
    wearingDay: "Monday",
    bestFor: ["Spiritual Seekers", "Leaders", "Those seeking Moksha", "Weak Sun in horoscope"],
  },
  2: {
    name: "Do Mukhi Rudraksha",
    hindi: "दो मुखी रुद्राक्ष",
    mukhi: 2,
    deity: "Ardhanarishvara (Shiva-Shakti)",
    planet: "Moon (Chandra)",
    benefits: ["Unity & Harmony", "Emotional Balance", "Relationships", "Mental Peace"],
    description: "Do Mukhi Rudraksha represents the unity of Shiva and Shakti. It brings harmony in relationships, emotional stability, and helps overcome mental stress and depression.",
    mantra: "Om Namah",
    wearingDay: "Monday",
    bestFor: ["Relationship Issues", "Emotional Imbalance", "Weak Moon", "Mental Stress"],
  },
  3: {
    name: "Teen Mukhi Rudraksha",
    hindi: "तीन मुखी रुद्राक्ष",
    mukhi: 3,
    deity: "Agni (Fire God)",
    planet: "Mars (Mangal)",
    benefits: ["Confidence", "Energy", "Purification", "Success"],
    description: "Teen Mukhi Rudraksha is blessed by Agni Dev. It purifies the wearer from past sins, boosts confidence and energy, and helps overcome inferiority complex.",
    mantra: "Om Kleem Namah",
    wearingDay: "Tuesday",
    bestFor: ["Low Self-Esteem", "Lack of Energy", "Mangal Dosh", "Past Karma"],
  },
  4: {
    name: "Char Mukhi Rudraksha",
    hindi: "चार मुखी रुद्राक्ष",
    mukhi: 4,
    deity: "Lord Brahma",
    planet: "Mercury (Budh)",
    benefits: ["Knowledge", "Creativity", "Communication", "Intelligence"],
    description: "Char Mukhi Rudraksha is blessed by Lord Brahma, the creator. It enhances knowledge, creativity, memory, and communication skills. Ideal for students and intellectuals.",
    mantra: "Om Hreem Namah",
    wearingDay: "Wednesday",
    bestFor: ["Students", "Writers", "Weak Mercury", "Memory Issues"],
  },
  5: {
    name: "Panch Mukhi Rudraksha",
    hindi: "पांच मुखी रुद्राक्ष",
    mukhi: 5,
    deity: "Kalagni Rudra",
    planet: "Jupiter (Guru)",
    benefits: ["Health", "Peace", "Wisdom", "Protection"],
    description: "The most common and versatile Rudraksha, Panch Mukhi represents Kalagni Rudra. It brings overall well-being, peace of mind, and protection from negative energies.",
    mantra: "Om Hreem Namah",
    wearingDay: "Thursday",
    bestFor: ["General Well-being", "Blood Pressure", "Weak Jupiter", "Everyone"],
  },
  6: {
    name: "Chhah Mukhi Rudraksha",
    hindi: "छह मुखी रुद्राक्ष",
    mukhi: 6,
    deity: "Lord Kartikeya",
    planet: "Venus (Shukra)",
    benefits: ["Willpower", "Focus", "Grounding", "Stability"],
    description: "Chhah Mukhi Rudraksha is blessed by Lord Kartikeya. It enhances willpower, focus, and emotional stability. It helps overcome laziness and procrastination.",
    mantra: "Om Hreem Hoom Namah",
    wearingDay: "Friday",
    bestFor: ["Lack of Focus", "Weak Venus", "Emotional Instability", "Artists"],
  },
  7: {
    name: "Saat Mukhi Rudraksha",
    hindi: "सात मुखी रुद्राक्ष",
    mukhi: 7,
    deity: "Goddess Lakshmi",
    planet: "Saturn (Shani)",
    benefits: ["Wealth", "Good Fortune", "Health", "Success"],
    description: "Saat Mukhi Rudraksha is blessed by Goddess Lakshmi and the seven serpent deities. It brings wealth, prosperity, good health, and success in all endeavors.",
    mantra: "Om Hoom Namah",
    wearingDay: "Saturday",
    bestFor: ["Financial Problems", "Weak Saturn", "Business Growth", "Health Issues"],
  },
  8: {
    name: "Aath Mukhi Rudraksha",
    hindi: "आठ मुखी रुद्राक्ष",
    mukhi: 8,
    deity: "Lord Ganesha",
    planet: "Rahu",
    benefits: ["Obstacle Removal", "Success", "Wisdom", "New Beginnings"],
    description: "Aath Mukhi Rudraksha is blessed by Lord Ganesha. It removes obstacles, brings success in new ventures, and bestows wisdom and intelligence.",
    mantra: "Om Ganeshaya Namah",
    wearingDay: "Wednesday",
    bestFor: ["Obstacles in Life", "Rahu Dosh", "New Ventures", "Students"],
  },
  9: {
    name: "Nau Mukhi Rudraksha",
    hindi: "नौ मुखी रुद्राक्ष",
    mukhi: 9,
    deity: "Goddess Durga",
    planet: "Ketu",
    benefits: ["Courage", "Protection", "Energy", "Fearlessness"],
    description: "Nau Mukhi Rudraksha is blessed by Goddess Durga. It bestows courage, energy, and protection from negative forces. It helps overcome fear and anxiety.",
    mantra: "Om Hreem Hoom Namah",
    wearingDay: "Tuesday",
    bestFor: ["Fear & Anxiety", "Ketu Dosh", "Lack of Courage", "Protection"],
  },
  10: {
    name: "Das Mukhi Rudraksha",
    hindi: "दस मुखी रुद्राक्ष",
    mukhi: 10,
    deity: "Lord Vishnu",
    planet: "All Planets",
    benefits: ["Protection", "Peace", "Removes Negativity", "Divine Blessings"],
    description: "Das Mukhi Rudraksha is blessed by Lord Vishnu. It provides protection from all negative energies, evil spirits, and brings peace and divine blessings.",
    mantra: "Om Hreem Namah Namah",
    wearingDay: "Any Day",
    bestFor: ["Protection", "Negative Energies", "Peace of Mind", "All Doshas"],
  },
  11: {
    name: "Gyarah Mukhi Rudraksha",
    hindi: "ग्यारह मुखी रुद्राक्ष",
    mukhi: 11,
    deity: "Eleven Rudras",
    planet: "All Planets",
    benefits: ["Wisdom", "Right Judgment", "Adventure", "Protection"],
    description: "Gyarah Mukhi Rudraksha is blessed by the eleven Rudras. It bestows wisdom, courage, and protection. It helps in making right decisions and judgments.",
    mantra: "Om Hreem Hoom Namah",
    wearingDay: "Monday",
    bestFor: ["Decision Making", "Yogis", "Meditation", "Protection"],
  },
  12: {
    name: "Barah Mukhi Rudraksha",
    hindi: "बारह मुखी रुद्राक्ष",
    mukhi: 12,
    deity: "Lord Surya (Sun God)",
    planet: "Sun (Surya)",
    benefits: ["Leadership", "Radiance", "Authority", "Self-Confidence"],
    description: "Barah Mukhi Rudraksha is blessed by Lord Surya. It bestows leadership qualities, radiance, authority, and self-confidence. Ideal for administrators and leaders.",
    mantra: "Om Kraum Sraum Raum Namah",
    wearingDay: "Sunday",
    bestFor: ["Leaders", "Administrators", "Weak Sun", "Lack of Confidence"],
  },
};

// Planet to Rudraksha Mukhi mapping
const planetToRudraksha: Record<string, number> = {
  Sun: 12,      // 12 Mukhi for Sun
  Moon: 2,      // 2 Mukhi for Moon
  Mars: 3,      // 3 Mukhi for Mars
  Mercury: 4,   // 4 Mukhi for Mercury
  Jupiter: 5,   // 5 Mukhi for Jupiter
  Venus: 6,     // 6 Mukhi for Venus
  Saturn: 7,    // 7 Mukhi for Saturn
  Rahu: 8,      // 8 Mukhi for Rahu
  Ketu: 9,      // 9 Mukhi for Ketu
};

// Debilitated signs for each planet
const debilitatedSigns: Record<string, string> = {
  Sun: "Libra",
  Moon: "Scorpio",
  Mars: "Cancer",
  Mercury: "Pisces",
  Jupiter: "Capricorn",
  Venus: "Virgo",
  Saturn: "Aries",
};

// Dusthana houses (6, 8, 12) indicate challenges
const dusthanaHouses = [6, 8, 12];

function analyzeChartForRudraksha(chartData: ChartData): RudrakshaRecommendation[] {
  const recommendations: RudrakshaRecommendation[] = [];
  const addedMukhis = new Set<number>();

  // PRIORITY 1: Check Moon placement first (highest priority - matches AstroSage logic)
  // Moon represents the mind and mental well-being, so Moon issues take precedence
  // 2 Mukhi Rudraksha is ruled by Moon and recommended for weak Moon placement
  const moonPlanet = chartData.planets.find(p => p.name === "Moon");
  if (moonPlanet) {
    // Check if Moon is in dusthana house (6, 8, 12)
    if (dusthanaHouses.includes(moonPlanet.house)) {
      recommendations.push({
        mukhi: 2,
        reason: `Moon is placed in house ${moonPlanet.house} - 2 Mukhi Rudraksha (ruled by Moon) brings emotional balance, mental peace, and harmony. It is recommended for those with weak Moon placement.`,
        priority: "high",
      });
      addedMukhis.add(2);
    }
    // Check if Moon is debilitated (in Scorpio)
    else if (moonPlanet.sign === "Scorpio") {
      recommendations.push({
        mukhi: 2,
        reason: "Moon is debilitated in Scorpio - 2 Mukhi Rudraksha strengthens the Moon, bringing emotional stability and mental peace.",
        priority: "high",
      });
      addedMukhis.add(2);
    }
  }

  // PRIORITY 2: Check for Kaal Sarp Dosha (severe dosha)
  if (chartData.doshas?.kaal_sarp_dosha) {
    if (!addedMukhis.has(8)) {
      recommendations.push({
        mukhi: 8,
        reason: "Kaal Sarp Dosha detected - 8 Mukhi removes obstacles caused by Rahu",
        priority: "high",
      });
      addedMukhis.add(8);
    }
    if (!addedMukhis.has(9)) {
      recommendations.push({
        mukhi: 9,
        reason: "Kaal Sarp Dosha detected - 9 Mukhi neutralizes Ketu's negative effects",
        priority: "high",
      });
      addedMukhis.add(9);
    }
  }

  // PRIORITY 3: Check for Mangal Dosha
  if (chartData.doshas?.mangal_dosha && !addedMukhis.has(3)) {
    recommendations.push({
      mukhi: 3,
      reason: "Mangal Dosha detected - 3 Mukhi pacifies Mars and reduces its malefic effects on marriage",
      priority: "high",
    });
    addedMukhis.add(3);
  }

  // PRIORITY 4: Check for debilitated planets (excluding Moon which is already handled)
  for (const planet of chartData.planets) {
    if (planet.name === "Moon") continue; // Already handled above
    const debilitatedSign = debilitatedSigns[planet.name];
    if (debilitatedSign && planet.sign === debilitatedSign) {
      const mukhi = planetToRudraksha[planet.name];
      if (mukhi && !addedMukhis.has(mukhi)) {
        recommendations.push({
          mukhi,
          reason: `${planet.name} is debilitated in ${planet.sign} - ${mukhi} Mukhi strengthens this planet`,
          priority: "high",
        });
        addedMukhis.add(mukhi);
      }
    }
  }

  // PRIORITY 5: Check for other planets in dusthana houses (6, 8, 12) - excluding Moon
  for (const planet of chartData.planets) {
    if (planet.name === "Moon") continue; // Already handled above
    if (dusthanaHouses.includes(planet.house)) {
      const mukhi = planetToRudraksha[planet.name];
      if (mukhi && !addedMukhis.has(mukhi)) {
        recommendations.push({
          mukhi,
          reason: `${planet.name} in house ${planet.house} - ${mukhi} Mukhi helps overcome challenges`,
          priority: "medium",
        });
        addedMukhis.add(mukhi);
      }
    }
  }

  // PRIORITY 6: Check for retrograde planets (except Rahu/Ketu which are always retrograde)
  for (const planet of chartData.planets) {
    if (planet.retrograde && !["Rahu", "Ketu"].includes(planet.name)) {
      const mukhi = planetToRudraksha[planet.name];
      if (mukhi && !addedMukhis.has(mukhi)) {
        recommendations.push({
          mukhi,
          reason: `${planet.name} is retrograde - ${mukhi} Mukhi helps channel its energy positively`,
          priority: "low",
        });
        addedMukhis.add(mukhi);
      }
    }
  }

  // Always recommend 5 Mukhi for general well-being (if not already added)
  if (!addedMukhis.has(5)) {
    recommendations.push({
      mukhi: 5,
      reason: "Universal Rudraksha for overall well-being, peace, and protection - beneficial for everyone",
      priority: "medium",
    });
    addedMukhis.add(5);
  }

  // Sort by priority then by mukhi number
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  recommendations.sort((a, b) => {
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return a.mukhi - b.mukhi;
  });

  return recommendations.slice(0, 5); // Return top 5 recommendations
}

export default function RudrakshaRecommendationsPage() {
  const { t } = useLanguage();
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [recommendations, setRecommendations] = useState<RudrakshaRecommendation[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chartAnalysis, setChartAnalysis] = useState<string | null>(null);

  const handleLocationSelect = (location: string, lat?: number, lng?: number) => {
    setBirthPlace(location);
    if (lat !== undefined && lng !== undefined) {
      setLatitude(lat);
      setLongitude(lng);
    }
  };

  const handleCalculate = async () => {
    if (!birthDate || !birthTime || !birthPlace) {
      setError("Please fill in all birth details for accurate recommendations");
      return;
    }
    
    setIsCalculating(true);
    setError(null);
    setChartAnalysis(null);
    
    try {
      // Call the backend API for birth chart calculation
      const response = await fetch("https://vedicstarastro.com/api/charts/calculate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "User",
          birth_date: birthDate,
          birth_time: birthTime,
          birth_place: birthPlace,
          latitude: latitude || 28.6139,
          longitude: longitude || 77.2090,
          timezone: 5.5,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to calculate birth chart");
      }

      const data = await response.json();
      const chartData: ChartData = data.chart_data;

      // Analyze the chart and get recommendations
      const rudrakshaRecommendations = analyzeChartForRudraksha(chartData);
      setRecommendations(rudrakshaRecommendations);

      // Set chart analysis summary
      const doshaInfo = [];
      if (chartData.doshas?.mangal_dosha) doshaInfo.push("Mangal Dosha");
      if (chartData.doshas?.kaal_sarp_dosha) doshaInfo.push("Kaal Sarp Dosha");
      
      setChartAnalysis(
        `Ascendant: ${chartData.ascendant} | Moon Sign: ${chartData.moon_sign} | Nakshatra: ${chartData.nakshatra}${doshaInfo.length > 0 ? ` | Doshas: ${doshaInfo.join(", ")}` : ""}`
      );

    } catch (err) {
      console.error("Error calculating chart:", err);
      setError("Unable to connect to the astrology service. Please try again later.");
      
      // Fallback to basic recommendations
      const fallbackRecs: RudrakshaRecommendation[] = [
        { mukhi: 5, reason: "Universal Rudraksha for overall well-being", priority: "high" },
        { mukhi: 8, reason: "Removes obstacles and brings success", priority: "medium" },
      ];
      setRecommendations(fallbackRecs);
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="py-12 lg:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-red-100 text-red-800">{t('calculator.freeTool', 'Free Tool')}</Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {t('calculator.rudraksha.title', 'Rudraksha Recommendations')}
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {t('calculator.rudraksha.subtitle', 'Discover which Rudraksha beads are most beneficial for you based on your birth chart. Rudraksha beads are sacred seeds with powerful spiritual and healing properties.')}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Circle className="w-5 h-5 text-red-600" />
                {t('calculator.enterBirthDetails', 'Enter Birth Details')}
              </CardTitle>
              <CardDescription>
                {t('calculator.rudraksha.inputDesc', 'Enter your birth details to get personalized Rudraksha recommendations')}
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
                  onLocationSelect={handleLocationSelect}
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
                    {t('calculator.analyzing', 'Analyzing...')}
                  </>
                ) : (
                  <>
                    <Circle className="w-4 h-4 mr-2" />
                    {t('calculator.rudraksha.getRecommendations', 'Get Rudraksha Recommendations')}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {recommendations.length > 0 ? (
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2 sticky top-0 bg-white py-2">
                <Shield className="w-5 h-5 text-red-600" />
                {t('calculator.rudraksha.recommendedRudraksha', 'Recommended Rudraksha for You')}
              </h3>
              
              {chartAnalysis && (
                <div className="bg-red-100 border border-red-300 rounded-lg p-3 text-sm">
                  <p className="font-medium text-red-800">{t('calculator.chartAnalysis', 'Chart Analysis')}: {chartAnalysis}</p>
                </div>
              )}

              {error && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <p className="text-yellow-700">{error}</p>
                </div>
              )}

              {recommendations.map((rec) => {
                const rudraksha = rudrakshaData[rec.mukhi];
                if (!rudraksha) return null;
                return (
                  <Card key={rec.mukhi} className="border-red-200 bg-red-50">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <span className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center text-sm font-bold">
                            {rec.mukhi}
                          </span>
                          {rudraksha.name}
                        </CardTitle>
                        <div className="flex gap-2">
                          <Badge className={
                            rec.priority === "high" ? "bg-red-600" :
                            rec.priority === "medium" ? "bg-amber-500" : "bg-blue-500"
                          }>
                            {rec.priority === "high" ? t('calculator.highPriority', 'High Priority') :
                             rec.priority === "medium" ? t('calculator.mediumPriority', 'Recommended') :
                             t('calculator.lowPriority', 'Optional')}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-gray-600">{rudraksha.hindi} • {rudraksha.deity}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-white rounded-lg p-2 mb-3 border-l-4 border-red-400">
                        <p className="text-gray-700 text-sm font-medium">{t('calculator.whyRecommended', 'Why Recommended')}: {rec.reason}</p>
                      </div>
                      
                      <p className="text-gray-700 text-sm mb-3">{rudraksha.description}</p>
                      
                      <div className="space-y-2">
                        <div className="bg-white rounded-lg p-2">
                          <h4 className="font-semibold text-gray-900 text-sm mb-1 flex items-center gap-1">
                            <Heart className="w-3 h-3 text-red-500" />
                            {t('calculator.benefits', 'Benefits')}
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {rudraksha.benefits.map((benefit) => (
                              <Badge key={benefit} variant="secondary" className="bg-green-100 text-green-700 text-xs">
                                {benefit}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-white rounded-lg p-2">
                            <h4 className="font-semibold text-gray-900 text-xs mb-1">{t('calculator.mantra', 'Mantra')}</h4>
                            <p className="text-red-700 text-xs italic">{rudraksha.mantra}</p>
                          </div>
                          <div className="bg-white rounded-lg p-2">
                            <h4 className="font-semibold text-gray-900 text-xs mb-1">{t('calculator.rudraksha.wearingDay', 'Best Day to Wear')}</h4>
                            <p className="text-red-700 text-xs">{rudraksha.wearingDay}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="border-red-200 bg-red-50/50">
              <CardContent className="flex flex-col items-center justify-center h-full py-12">
                <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center mb-4">
                  <Circle className="w-12 h-12 text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t('calculator.rudraksha.resultPlaceholder', 'Your Rudraksha Recommendations Will Appear Here')}
                </h3>
                <p className="text-gray-600 text-center max-w-xs">
                  {t('calculator.rudraksha.resultPlaceholderDesc', 'Enter your birth details to discover which sacred Rudraksha beads are most beneficial for your spiritual and physical well-being.')}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <Card className="border-amber-200 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-2">{t('calculator.yantra.title', 'Yantra Recommendations')}</h3>
              <p className="text-gray-600 text-sm mb-4">
                {t('calculator.yantra.shortDesc', 'Find the right sacred Yantras for you.')}
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/tools/yantra-recommendations">
                  {t('calculator.discover', 'Discover')} <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-amber-200 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-2">{t('calculator.ishtaDevata.title', 'Ishta Devata Calculator')}</h3>
              <p className="text-gray-600 text-sm mb-4">
                {t('calculator.ishtaDevata.shortDesc', 'Find your personal deity based on your chart.')}
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/tools/ishta-devata-calculator">
                  {t('calculator.find', 'Find')} <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-amber-200 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-2">{t('calculator.gemstones.title', 'Gemstone Recommendations')}</h3>
              <p className="text-gray-600 text-sm mb-4">
                {t('calculator.gemstones.shortDesc', 'Find your lucky gemstones.')}
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/gemstones">
                  {t('calculator.explore', 'Explore')} <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16 prose prose-lg max-w-none">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {t('calculator.rudraksha.aboutTitle', 'About Rudraksha Beads')}
          </h2>
          <p className="text-gray-700 mb-4">
            {t('calculator.rudraksha.aboutDesc1', 'Rudraksha beads are sacred seeds from the Elaeocarpus ganitrus tree, found primarily in the Himalayan regions of Nepal and Indonesia. The word "Rudraksha" comes from "Rudra" (Lord Shiva) and "Aksha" (eyes), meaning "tears of Lord Shiva."')}
          </p>
          <p className="text-gray-700 mb-4">
            {t('calculator.rudraksha.aboutDesc2', 'Each Rudraksha bead has a certain number of "mukhis" or faces, ranging from 1 to 21. Each type has unique properties and is associated with different deities and planets. Wearing the right Rudraksha can bring spiritual, mental, and physical benefits.')}
          </p>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            {t('calculator.rudraksha.howToWear', 'How to Wear Rudraksha')}
          </h3>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>{t('calculator.rudraksha.step1', 'Energize the Rudraksha by chanting the associated mantra 108 times')}</li>
            <li>{t('calculator.rudraksha.step2', 'Wear it on the recommended day after taking a bath')}</li>
            <li>{t('calculator.rudraksha.step3', 'String it in silk or gold/silver thread')}</li>
            <li>{t('calculator.rudraksha.step4', 'Remove before sleeping or going to impure places')}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
