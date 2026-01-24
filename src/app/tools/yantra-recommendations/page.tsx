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
  Hexagon,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  ArrowRight,
  Shield,
  Star,
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

interface YantraRecommendation {
  name: string;
  reason: string;
  priority: "high" | "medium" | "low";
}

const yantraData: Record<string, {
  name: string;
  hindi: string;
  deity: string;
  benefits: string[];
  description: string;
  bestFor: string[];
  mantra: string;
  color: string;
}> = {
  "Sri Yantra": {
    name: "Sri Yantra",
    hindi: "श्री यंत्र",
    deity: "Goddess Lakshmi",
    benefits: ["Wealth & Prosperity", "Spiritual Growth", "Success in Business", "Removes Obstacles"],
    description: "The most powerful and auspicious yantra, Sri Yantra represents the cosmic creation and the union of Shiva and Shakti. It attracts abundance, prosperity, and spiritual enlightenment.",
    bestFor: ["Weak Venus", "Financial Problems", "Business Growth", "Spiritual Seekers"],
    mantra: "Om Shreem Hreem Shreem Kamale Kamalalaye Praseed Praseed",
    color: "Gold/Yellow",
  },
  "Shani Yantra": {
    name: "Shani Yantra",
    hindi: "शनि यंत्र",
    deity: "Lord Shani",
    benefits: ["Reduces Saturn's Malefic Effects", "Career Stability", "Justice & Discipline", "Removes Delays"],
    description: "Shani Yantra pacifies the negative effects of Saturn in your horoscope. It helps overcome obstacles, delays, and hardships caused by Shani Dasha or Sade Sati.",
    bestFor: ["Sade Sati Period", "Saturn Dasha", "Career Obstacles", "Legal Issues"],
    mantra: "Om Sham Shanaishcharaya Namah",
    color: "Blue/Black",
  },
  "Mangal Yantra": {
    name: "Mangal Yantra",
    hindi: "मंगल यंत्र",
    deity: "Lord Mangal (Mars)",
    benefits: ["Reduces Mangal Dosh", "Courage & Strength", "Property Matters", "Victory Over Enemies"],
    description: "Mangal Yantra is used to pacify the malefic effects of Mars. It is especially beneficial for those with Mangal Dosh affecting their marriage or relationships.",
    bestFor: ["Mangal Dosh", "Anger Issues", "Property Disputes", "Blood-related Problems"],
    mantra: "Om Kram Kreem Kroum Sah Bhaumaya Namah",
    color: "Red",
  },
  "Budh Yantra": {
    name: "Budh Yantra",
    hindi: "बुध यंत्र",
    deity: "Lord Budh (Mercury)",
    benefits: ["Intelligence & Wisdom", "Communication Skills", "Business Success", "Education"],
    description: "Budh Yantra enhances intellectual abilities, communication skills, and business acumen. It is beneficial for students, writers, and business professionals.",
    bestFor: ["Weak Mercury", "Students", "Business People", "Communication Issues"],
    mantra: "Om Bram Breem Broum Sah Budhaya Namah",
    color: "Green",
  },
  "Guru Yantra": {
    name: "Guru Yantra",
    hindi: "गुरु यंत्र",
    deity: "Lord Brihaspati (Jupiter)",
    benefits: ["Wisdom & Knowledge", "Good Fortune", "Children & Marriage", "Spiritual Growth"],
    description: "Guru Yantra invokes the blessings of Jupiter, the planet of wisdom and fortune. It brings prosperity, good health, and spiritual advancement.",
    bestFor: ["Weak Jupiter", "Childless Couples", "Teachers & Scholars", "Financial Growth"],
    mantra: "Om Gram Greem Groum Sah Gurave Namah",
    color: "Yellow",
  },
  "Shukra Yantra": {
    name: "Shukra Yantra",
    hindi: "शुक्र यंत्र",
    deity: "Lord Shukra (Venus)",
    benefits: ["Love & Romance", "Beauty & Charm", "Artistic Abilities", "Material Comforts"],
    description: "Shukra Yantra enhances the positive effects of Venus. It brings love, beauty, luxury, and artistic talents into your life.",
    bestFor: ["Weak Venus", "Marriage Problems", "Artists & Performers", "Luxury & Comfort"],
    mantra: "Om Dram Dreem Droum Sah Shukraya Namah",
    color: "White/Pink",
  },
  "Surya Yantra": {
    name: "Surya Yantra",
    hindi: "सूर्य यंत्र",
    deity: "Lord Surya (Sun)",
    benefits: ["Leadership & Authority", "Health & Vitality", "Fame & Recognition", "Government Favors"],
    description: "Surya Yantra invokes the power of the Sun. It brings success, fame, authority, and good health. Ideal for those seeking leadership positions.",
    bestFor: ["Weak Sun", "Government Jobs", "Health Issues", "Lack of Confidence"],
    mantra: "Om Hram Hreem Hroum Sah Suryaya Namah",
    color: "Red/Orange",
  },
  "Chandra Yantra": {
    name: "Chandra Yantra",
    hindi: "चंद्र यंत्र",
    deity: "Lord Chandra (Moon)",
    benefits: ["Mental Peace", "Emotional Balance", "Mother's Blessings", "Intuition"],
    description: "Chandra Yantra pacifies the Moon and brings mental peace, emotional stability, and intuitive abilities. It is beneficial for those with mental stress.",
    bestFor: ["Weak Moon", "Mental Stress", "Emotional Issues", "Sleep Problems"],
    mantra: "Om Shram Shreem Shroum Sah Chandraya Namah",
    color: "White/Silver",
  },
  "Rahu Yantra": {
    name: "Rahu Yantra",
    hindi: "राहु यंत्र",
    deity: "Lord Rahu",
    benefits: ["Removes Rahu's Malefic Effects", "Success in Foreign Lands", "Occult Knowledge", "Sudden Gains"],
    description: "Rahu Yantra neutralizes the negative effects of Rahu. It helps in achieving success in foreign lands and protects from hidden enemies.",
    bestFor: ["Rahu Dasha", "Foreign Travel", "Sudden Problems", "Confusion & Illusion"],
    mantra: "Om Bhram Bhreem Bhroum Sah Rahave Namah",
    color: "Blue/Smoky",
  },
  "Ketu Yantra": {
    name: "Ketu Yantra",
    hindi: "केतु यंत्र",
    deity: "Lord Ketu",
    benefits: ["Spiritual Liberation", "Removes Ketu's Malefic Effects", "Moksha", "Healing"],
    description: "Ketu Yantra helps in spiritual advancement and liberation. It removes obstacles in spiritual path and provides protection from negative energies.",
    bestFor: ["Ketu Dasha", "Spiritual Seekers", "Mysterious Diseases", "Past Life Karma"],
    mantra: "Om Stram Streem Stroum Sah Ketave Namah",
    color: "Gray/Multi-colored",
  },
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

// Planet to Yantra mapping
const planetToYantra: Record<string, string> = {
  Sun: "Surya Yantra",
  Moon: "Chandra Yantra",
  Mars: "Mangal Yantra",
  Mercury: "Budh Yantra",
  Jupiter: "Guru Yantra",
  Venus: "Shukra Yantra",
  Saturn: "Shani Yantra",
  Rahu: "Rahu Yantra",
  Ketu: "Ketu Yantra",
};

function analyzeChartForYantras(chartData: ChartData): YantraRecommendation[] {
  const recommendations: YantraRecommendation[] = [];
  const addedYantras = new Set<string>();

  // Check for doshas first (highest priority)
  if (chartData.doshas?.mangal_dosha) {
    recommendations.push({
      name: "Mangal Yantra",
      reason: "Mangal Dosha detected in your chart - helps reduce Mars's malefic effects on marriage and relationships",
      priority: "high",
    });
    addedYantras.add("Mangal Yantra");
  }

  if (chartData.doshas?.kaal_sarp_dosha) {
    recommendations.push({
      name: "Rahu Yantra",
      reason: "Kaal Sarp Dosha detected - helps neutralize the effects of Rahu-Ketu axis",
      priority: "high",
    });
    addedYantras.add("Rahu Yantra");
    if (!addedYantras.has("Ketu Yantra")) {
      recommendations.push({
        name: "Ketu Yantra",
        reason: "Kaal Sarp Dosha detected - complements Rahu Yantra for complete protection",
        priority: "high",
      });
      addedYantras.add("Ketu Yantra");
    }
  }

  // Check for debilitated planets
  for (const planet of chartData.planets) {
    const debilitatedSign = debilitatedSigns[planet.name];
    if (debilitatedSign && planet.sign === debilitatedSign) {
      const yantraName = planetToYantra[planet.name];
      if (yantraName && !addedYantras.has(yantraName)) {
        recommendations.push({
          name: yantraName,
          reason: `${planet.name} is debilitated in ${planet.sign} - strengthens the planet's positive influence`,
          priority: "high",
        });
        addedYantras.add(yantraName);
      }
    }
  }

  // Check for planets in dusthana houses (6, 8, 12)
  for (const planet of chartData.planets) {
    if (dusthanaHouses.includes(planet.house)) {
      const yantraName = planetToYantra[planet.name];
      if (yantraName && !addedYantras.has(yantraName)) {
        recommendations.push({
          name: yantraName,
          reason: `${planet.name} is placed in house ${planet.house} - helps overcome challenges associated with this placement`,
          priority: "medium",
        });
        addedYantras.add(yantraName);
      }
    }
  }

  // Check for retrograde planets
  for (const planet of chartData.planets) {
    if (planet.retrograde && !["Rahu", "Ketu"].includes(planet.name)) {
      const yantraName = planetToYantra[planet.name];
      if (yantraName && !addedYantras.has(yantraName)) {
        recommendations.push({
          name: yantraName,
          reason: `${planet.name} is retrograde - helps channel the introspective energy positively`,
          priority: "low",
        });
        addedYantras.add(yantraName);
      }
    }
  }

  // Always recommend Sri Yantra for general prosperity if less than 3 recommendations
  if (recommendations.length < 3 && !addedYantras.has("Sri Yantra")) {
    recommendations.push({
      name: "Sri Yantra",
      reason: "Universal Yantra for prosperity, success, and spiritual growth - beneficial for everyone",
      priority: "medium",
    });
  }

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return recommendations.slice(0, 5); // Return top 5 recommendations
}

export default function YantraRecommendationsPage() {
  const { t } = useLanguage();
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [recommendations, setRecommendations] = useState<YantraRecommendation[]>([]);
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
          latitude: latitude || 28.6139, // Default to Delhi if not set
          longitude: longitude || 77.2090,
          timezone: 5.5, // IST
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to calculate birth chart");
      }

      const data = await response.json();
      const chartData: ChartData = data.chart_data;

      // Analyze the chart and get recommendations
      const yantraRecommendations = analyzeChartForYantras(chartData);
      setRecommendations(yantraRecommendations);

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
      
      // Fallback to basic recommendations based on date
      const month = new Date(birthDate).getMonth();
      const fallbackRecs: YantraRecommendation[] = [
        { name: "Sri Yantra", reason: "Universal Yantra for prosperity and success", priority: "high" },
      ];
      if (month >= 0 && month <= 2) fallbackRecs.push({ name: "Shani Yantra", reason: "Beneficial during this period", priority: "medium" });
      else if (month >= 3 && month <= 5) fallbackRecs.push({ name: "Mangal Yantra", reason: "Beneficial during this period", priority: "medium" });
      else if (month >= 6 && month <= 8) fallbackRecs.push({ name: "Budh Yantra", reason: "Beneficial during this period", priority: "medium" });
      else fallbackRecs.push({ name: "Guru Yantra", reason: "Beneficial during this period", priority: "medium" });
      
      setRecommendations(fallbackRecs);
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="py-12 lg:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-amber-100 text-amber-800">{t('calculator.freeTool', 'Free Tool')}</Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {t('calculator.yantra.title', 'Yantra Recommendations')}
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {t('calculator.yantra.subtitle', 'Discover which sacred Yantras are most beneficial for you based on your birth chart. Yantras are powerful geometric diagrams that invoke divine energies and bring positive changes in life.')}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="border-amber-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hexagon className="w-5 h-5 text-amber-600" />
                {t('calculator.enterBirthDetails', 'Enter Birth Details')}
              </CardTitle>
              <CardDescription>
                {t('calculator.yantra.inputDesc', 'Enter your birth details to get personalized Yantra recommendations')}
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
                className="w-full bg-amber-600 hover:bg-amber-700"
                disabled={!birthDate || isCalculating}
              >
                {isCalculating ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                    {t('calculator.analyzing', 'Analyzing...')}
                  </>
                ) : (
                  <>
                    <Hexagon className="w-4 h-4 mr-2" />
                    {t('calculator.yantra.getRecommendations', 'Get Yantra Recommendations')}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {recommendations.length > 0 ? (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-600" />
                {t('calculator.yantra.recommendedYantras', 'Recommended Yantras for You')}
              </h3>
              
              {chartAnalysis && (
                <div className="bg-amber-100 border border-amber-300 rounded-lg p-3 text-sm">
                  <p className="font-medium text-amber-800">{t('calculator.chartAnalysis', 'Chart Analysis')}: {chartAnalysis}</p>
                </div>
              )}

              {error && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <p className="text-yellow-700">{error}</p>
                </div>
              )}

              {recommendations.map((rec) => {
                const yantra = yantraData[rec.name];
                if (!yantra) return null;
                return (
                  <Card key={rec.name} className="border-amber-200 bg-amber-50">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Star className="w-5 h-5 text-amber-600" />
                          {yantra.name}
                        </CardTitle>
                        <div className="flex gap-2">
                          <Badge className={
                            rec.priority === "high" ? "bg-red-500" :
                            rec.priority === "medium" ? "bg-amber-500" : "bg-blue-500"
                          }>
                            {rec.priority === "high" ? t('calculator.highPriority', 'High Priority') :
                             rec.priority === "medium" ? t('calculator.mediumPriority', 'Recommended') :
                             t('calculator.lowPriority', 'Optional')}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-gray-600">{yantra.hindi} • {yantra.deity}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-white rounded-lg p-2 mb-3 border-l-4 border-amber-400">
                        <p className="text-gray-700 text-sm font-medium">{t('calculator.whyRecommended', 'Why Recommended')}: {rec.reason}</p>
                      </div>
                      
                      <p className="text-gray-700 text-sm mb-3">{yantra.description}</p>
                      
                      <div className="space-y-2">
                        <div className="bg-white rounded-lg p-2">
                          <h4 className="font-semibold text-gray-900 text-sm mb-1">{t('calculator.benefits', 'Benefits')}</h4>
                          <div className="flex flex-wrap gap-1">
                            {yantra.benefits.map((benefit) => (
                              <Badge key={benefit} variant="secondary" className="bg-green-100 text-green-700 text-xs">
                                {benefit}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div className="bg-white rounded-lg p-2">
                          <h4 className="font-semibold text-gray-900 text-sm mb-1">{t('calculator.mantra', 'Mantra')}</h4>
                          <p className="text-amber-700 text-sm italic">{yantra.mantra}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="border-amber-200 bg-amber-50/50">
              <CardContent className="flex flex-col items-center justify-center h-full py-12">
                <div className="w-24 h-24 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                  <Hexagon className="w-12 h-12 text-amber-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t('calculator.yantra.resultPlaceholder', 'Your Yantra Recommendations Will Appear Here')}
                </h3>
                <p className="text-gray-600 text-center max-w-xs">
                  {t('calculator.yantra.resultPlaceholderDesc', 'Enter your birth details to discover which sacred Yantras are most beneficial for your spiritual and material growth.')}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <Card className="border-amber-200 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-2">{t('calculator.rudraksha.title', 'Rudraksha Recommendations')}</h3>
              <p className="text-gray-600 text-sm mb-4">
                {t('calculator.rudraksha.shortDesc', 'Find the right Rudraksha beads for you.')}
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/tools/rudraksha-recommendations">
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
              <h3 className="font-semibold text-lg mb-2">{t('calculator.kundliCalc.title', 'Kundli Calculator')}</h3>
              <p className="text-gray-600 text-sm mb-4">
                {t('calculator.kundliCalc.shortDesc', 'Generate your complete Vedic birth chart.')}
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/tools/kundli-calculator">
                  {t('calculator.generate', 'Generate')} <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16 prose prose-lg max-w-none">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {t('calculator.yantra.aboutTitle', 'About Yantras in Vedic Astrology')}
          </h2>
          <p className="text-gray-700 mb-4">
            {t('calculator.yantra.aboutDesc1', 'Yantras are sacred geometric diagrams used in Hindu and Buddhist traditions for meditation and worship. They are believed to be the dwelling places of deities and serve as tools for focusing the mind and invoking divine energies.')}
          </p>
          <p className="text-gray-700 mb-4">
            {t('calculator.yantra.aboutDesc2', 'Each Yantra is associated with a specific deity or planet and is designed to harness particular cosmic energies. When properly energized and worshipped, Yantras can help overcome obstacles, attract prosperity, improve health, and accelerate spiritual growth.')}
          </p>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            {t('calculator.yantra.howToUse', 'How to Use a Yantra')}
          </h3>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>{t('calculator.yantra.step1', 'Place the Yantra in your puja room or meditation space facing East or North')}</li>
            <li>{t('calculator.yantra.step2', 'Clean the Yantra regularly and offer flowers, incense, and light a lamp')}</li>
            <li>{t('calculator.yantra.step3', 'Chant the associated mantra while focusing on the center of the Yantra')}</li>
            <li>{t('calculator.yantra.step4', 'Meditate on the Yantra daily for best results')}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
