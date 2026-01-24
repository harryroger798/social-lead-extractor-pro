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
  Flame,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  ArrowRight,
  Heart,
  Star,
  Sun,
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
}

interface DeityRecommendation {
  deity: string;
  reason: string;
  confidence: "high" | "medium" | "low";
}

const deityData: Record<string, {
  name: string;
  hindi: string;
  description: string;
  attributes: string[];
  mantra: string;
  worship: string;
  bestDay: string;
  offerings: string[];
  benefits: string[];
}> = {
  "Lord Shiva": {
    name: "Lord Shiva",
    hindi: "भगवान शिव",
    description: "Lord Shiva is the destroyer and transformer in the Hindu trinity. He represents the supreme consciousness and is worshipped for liberation, wisdom, and destruction of negativity.",
    attributes: ["Destroyer of Evil", "Lord of Meditation", "Cosmic Dancer", "Benevolent One"],
    mantra: "Om Namah Shivaya",
    worship: "Worship Lord Shiva with Bilva leaves, milk, water, and flowers. Monday is the most auspicious day for Shiva worship.",
    bestDay: "Monday",
    offerings: ["Bilva Leaves", "Milk", "Water", "White Flowers", "Dhatura"],
    benefits: ["Spiritual Liberation", "Removal of Obstacles", "Inner Peace", "Protection"],
  },
  "Lord Vishnu": {
    name: "Lord Vishnu",
    hindi: "भगवान विष्णु",
    description: "Lord Vishnu is the preserver and protector of the universe. He maintains cosmic order and is worshipped for prosperity, protection, and sustenance.",
    attributes: ["Preserver of Universe", "Protector", "Sustainer", "All-Pervading"],
    mantra: "Om Namo Narayanaya",
    worship: "Worship Lord Vishnu with Tulsi leaves, yellow flowers, and sandalwood. Thursday is especially auspicious.",
    bestDay: "Thursday",
    offerings: ["Tulsi Leaves", "Yellow Flowers", "Sandalwood", "Butter", "Sweets"],
    benefits: ["Prosperity", "Protection", "Good Fortune", "Family Harmony"],
  },
  "Goddess Lakshmi": {
    name: "Goddess Lakshmi",
    hindi: "देवी लक्ष्मी",
    description: "Goddess Lakshmi is the deity of wealth, fortune, and prosperity. She bestows material and spiritual abundance upon her devotees.",
    attributes: ["Goddess of Wealth", "Bestower of Fortune", "Divine Mother", "Lotus-Born"],
    mantra: "Om Shreem Mahalakshmiyei Namaha",
    worship: "Worship Goddess Lakshmi with lotus flowers, rice, and gold/silver items. Friday is the most auspicious day.",
    bestDay: "Friday",
    offerings: ["Lotus Flowers", "Rice", "Coins", "Red Flowers", "Sweets"],
    benefits: ["Wealth", "Prosperity", "Good Fortune", "Material Abundance"],
  },
  "Goddess Durga": {
    name: "Goddess Durga",
    hindi: "देवी दुर्गा",
    description: "Goddess Durga is the fierce form of the Divine Mother. She destroys evil forces and protects her devotees from all dangers.",
    attributes: ["Destroyer of Evil", "Divine Mother", "Invincible", "Protector"],
    mantra: "Om Dum Durgayei Namaha",
    worship: "Worship Goddess Durga with red flowers, kumkum, and coconut. Tuesday and Friday are auspicious.",
    bestDay: "Tuesday",
    offerings: ["Red Flowers", "Kumkum", "Coconut", "Lemons", "Sweets"],
    benefits: ["Protection", "Courage", "Victory", "Removal of Fear"],
  },
  "Lord Ganesha": {
    name: "Lord Ganesha",
    hindi: "भगवान गणेश",
    description: "Lord Ganesha is the remover of obstacles and the god of beginnings. He is worshipped before starting any new venture or important task.",
    attributes: ["Remover of Obstacles", "God of Beginnings", "Lord of Wisdom", "Elephant-Headed"],
    mantra: "Om Gam Ganapataye Namaha",
    worship: "Worship Lord Ganesha with modak, durva grass, and red flowers. Wednesday is especially auspicious.",
    bestDay: "Wednesday",
    offerings: ["Modak", "Durva Grass", "Red Flowers", "Coconut", "Laddu"],
    benefits: ["Success", "Wisdom", "New Beginnings", "Obstacle Removal"],
  },
  "Lord Hanuman": {
    name: "Lord Hanuman",
    hindi: "भगवान हनुमान",
    description: "Lord Hanuman is the epitome of devotion, strength, and selfless service. He is worshipped for courage, protection, and overcoming difficulties.",
    attributes: ["Devotee of Rama", "Mighty Warrior", "Protector", "Immortal"],
    mantra: "Om Hanumate Namaha",
    worship: "Worship Lord Hanuman with sindoor, jasmine oil, and red flowers. Tuesday and Saturday are most auspicious.",
    bestDay: "Tuesday",
    offerings: ["Sindoor", "Jasmine Oil", "Red Flowers", "Bananas", "Besan Laddu"],
    benefits: ["Courage", "Strength", "Protection", "Overcoming Fear"],
  },
  "Lord Krishna": {
    name: "Lord Krishna",
    hindi: "भगवान कृष्ण",
    description: "Lord Krishna is the divine lover and the speaker of Bhagavad Gita. He represents divine love, wisdom, and the path of devotion.",
    attributes: ["Divine Lover", "Supreme Teacher", "Protector", "Flute Player"],
    mantra: "Hare Krishna Hare Krishna Krishna Krishna Hare Hare",
    worship: "Worship Lord Krishna with butter, tulsi, and peacock feathers. Wednesday and Friday are auspicious.",
    bestDay: "Wednesday",
    offerings: ["Butter", "Tulsi", "Peacock Feathers", "Flute", "Sweets"],
    benefits: ["Divine Love", "Wisdom", "Joy", "Liberation"],
  },
  "Lord Surya": {
    name: "Lord Surya",
    hindi: "भगवान सूर्य",
    description: "Lord Surya is the Sun God, the source of all life and energy. He bestows health, vitality, and success upon his devotees.",
    attributes: ["Source of Life", "Giver of Health", "Illuminator", "Cosmic Eye"],
    mantra: "Om Suryaya Namaha",
    worship: "Worship Lord Surya at sunrise with water offering (Arghya) and red flowers. Sunday is most auspicious.",
    bestDay: "Sunday",
    offerings: ["Water (Arghya)", "Red Flowers", "Wheat", "Jaggery", "Copper"],
    benefits: ["Health", "Vitality", "Success", "Authority"],
  },
  "Goddess Saraswati": {
    name: "Goddess Saraswati",
    hindi: "देवी सरस्वती",
    description: "Goddess Saraswati is the deity of knowledge, music, and arts. She bestows wisdom, learning, and creative abilities upon her devotees.",
    attributes: ["Goddess of Knowledge", "Divine Artist", "Bestower of Wisdom", "Pure One"],
    mantra: "Om Aim Saraswatyai Namaha",
    worship: "Worship Goddess Saraswati with white flowers, books, and musical instruments. Thursday is most auspicious.",
    bestDay: "Thursday",
    offerings: ["White Flowers", "Books", "Pen/Ink", "Honey", "White Sweets"],
    benefits: ["Knowledge", "Wisdom", "Artistic Skills", "Academic Success"],
  },
};

// Mapping of planets to their associated deities
const planetToDeity: Record<string, string> = {
  Sun: "Lord Surya",
  Moon: "Lord Shiva",
  Mars: "Lord Hanuman",
  Mercury: "Lord Ganesha",
  Jupiter: "Lord Vishnu",
  Venus: "Goddess Lakshmi",
  Saturn: "Lord Hanuman",
  Rahu: "Goddess Durga",
  Ketu: "Lord Ganesha",
};

// Mapping of zodiac signs to their ruling planets
const signToRuler: Record<string, string> = {
  Aries: "Mars",
  Taurus: "Venus",
  Gemini: "Mercury",
  Cancer: "Moon",
  Leo: "Sun",
  Virgo: "Mercury",
  Libra: "Venus",
  Scorpio: "Mars",
  Sagittarius: "Jupiter",
  Capricorn: "Saturn",
  Aquarius: "Saturn",
  Pisces: "Jupiter",
};

// Mapping of nakshatras to deities
const nakshatraToDeity: Record<string, string> = {
  Ashwini: "Lord Ganesha",
  Bharani: "Goddess Durga",
  Krittika: "Lord Surya",
  Rohini: "Lord Krishna",
  Mrigashira: "Lord Shiva",
  Ardra: "Lord Shiva",
  Punarvasu: "Lord Vishnu",
  Pushya: "Lord Vishnu",
  Ashlesha: "Goddess Durga",
  Magha: "Lord Hanuman",
  "Purva Phalguni": "Goddess Lakshmi",
  "Uttara Phalguni": "Lord Surya",
  Hasta: "Lord Vishnu",
  Chitra: "Lord Vishnu",
  Swati: "Goddess Saraswati",
  Vishakha: "Lord Ganesha",
  Anuradha: "Lord Krishna",
  Jyeshtha: "Lord Vishnu",
  Mula: "Lord Ganesha",
  "Purva Ashadha": "Goddess Lakshmi",
  "Uttara Ashadha": "Lord Vishnu",
  Shravana: "Lord Vishnu",
  Dhanishta: "Lord Hanuman",
  Shatabhisha: "Lord Shiva",
  "Purva Bhadrapada": "Lord Shiva",
  "Uttara Bhadrapada": "Lord Shiva",
  Revati: "Lord Vishnu",
};

function analyzeChartForIshtaDevata(chartData: ChartData): DeityRecommendation {
  // Find Atmakaraka (planet with highest degree)
  let atmakaraka: Planet | null = null;
  let highestDegree = -1;
  
  for (const planet of chartData.planets) {
    // Exclude Rahu and Ketu from Atmakaraka calculation (traditional method)
    if (planet.name !== "Rahu" && planet.name !== "Ketu") {
      if (planet.degree > highestDegree) {
        highestDegree = planet.degree;
        atmakaraka = planet;
      }
    }
  }

  // Find 9th house lord (Dharma lord)
  const ascendantSign = chartData.ascendant;
  const signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", 
                 "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
  const ascIndex = signs.findIndex(s => ascendantSign.includes(s));
  const ninthHouseSign = signs[(ascIndex + 8) % 12];
  const ninthLord = signToRuler[ninthHouseSign];

  // Determine Ishta Devata based on multiple factors
  // Priority: 1. Atmakaraka, 2. 9th house lord, 3. Nakshatra, 4. Moon sign

  // Check Atmakaraka first (highest priority)
  if (atmakaraka && planetToDeity[atmakaraka.name]) {
    return {
      deity: planetToDeity[atmakaraka.name],
      reason: `Based on your Atmakaraka (soul significator) ${atmakaraka.name} at ${atmakaraka.degree.toFixed(2)}° in ${atmakaraka.sign}`,
      confidence: "high",
    };
  }

  // Check 9th house lord
  if (ninthLord && planetToDeity[ninthLord]) {
    return {
      deity: planetToDeity[ninthLord],
      reason: `Based on your 9th house (Dharma) lord ${ninthLord} ruling ${ninthHouseSign}`,
      confidence: "high",
    };
  }

  // Check Nakshatra
  if (chartData.nakshatra && nakshatraToDeity[chartData.nakshatra]) {
    return {
      deity: nakshatraToDeity[chartData.nakshatra],
      reason: `Based on your birth Nakshatra ${chartData.nakshatra}`,
      confidence: "medium",
    };
  }

  // Fallback to Moon sign
  const moonSignRuler = signToRuler[chartData.moon_sign];
  if (moonSignRuler && planetToDeity[moonSignRuler]) {
    return {
      deity: planetToDeity[moonSignRuler],
      reason: `Based on your Moon sign ${chartData.moon_sign} ruled by ${moonSignRuler}`,
      confidence: "medium",
    };
  }

  // Default fallback
  return {
    deity: "Lord Ganesha",
    reason: "Lord Ganesha is the universal deity suitable for all, as the remover of obstacles",
    confidence: "low",
  };
}

export default function IshtaDevataCalculatorPage() {
  const { t } = useLanguage();
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [ishtaDevata, setIshtaDevata] = useState<string | null>(null);
  const [deityReason, setDeityReason] = useState<string | null>(null);
  const [deityConfidence, setDeityConfidence] = useState<"high" | "medium" | "low" | null>(null);
  const [chartAnalysis, setChartAnalysis] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLocationSelect = (location: string, lat?: number, lng?: number) => {
    setBirthPlace(location);
    if (lat !== undefined) setLatitude(lat);
    if (lng !== undefined) setLongitude(lng);
  };

  const handleCalculate = async () => {
    if (!birthDate || !birthTime || !birthPlace) {
      setError("Please fill in all birth details for accurate deity determination");
      return;
    }
    
    setIsCalculating(true);
    setError(null);
    setChartAnalysis(null);
    
    try {
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

      if (response.ok) {
        const data = await response.json();
        const chartData: ChartData = {
          ascendant: data.ascendant || "Aries",
          moon_sign: data.moon_sign || "Aries",
          nakshatra: data.nakshatra || "Ashwini",
          planets: data.planets || [],
        };

        const recommendation = analyzeChartForIshtaDevata(chartData);
        setIshtaDevata(recommendation.deity);
        setDeityReason(recommendation.reason);
        setDeityConfidence(recommendation.confidence);
        setChartAnalysis(`Ascendant: ${chartData.ascendant}, Moon Sign: ${chartData.moon_sign}, Nakshatra: ${chartData.nakshatra}`);
      } else {
        // Fallback to simplified calculation
        setError("Could not connect to birth chart API. Using simplified calculation based on birth date.");
        const month = new Date(birthDate).getMonth();
        const day = new Date(birthDate).getDate();
        const deities = Object.keys(deityData);
        const index = (month + day) % deities.length;
        setIshtaDevata(deities[index]);
        setDeityReason("Based on birth date calculation (simplified method)");
        setDeityConfidence("low");
      }
    } catch {
      // Fallback to simplified calculation
      setError("Could not connect to birth chart API. Using simplified calculation based on birth date.");
      const month = new Date(birthDate).getMonth();
      const day = new Date(birthDate).getDate();
      const deities = Object.keys(deityData);
      const index = (month + day) % deities.length;
      setIshtaDevata(deities[index]);
      setDeityReason("Based on birth date calculation (simplified method)");
      setDeityConfidence("low");
    } finally {
      setIsCalculating(false);
    }
  };

  const deity = ishtaDevata ? deityData[ishtaDevata] : null;

  return (
    <div className="py-12 lg:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-orange-100 text-orange-800">{t('calculator.freeTool', 'Free Tool')}</Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {t('calculator.ishtaDevata.title', 'Ishta Devata Calculator')}
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {t('calculator.ishtaDevata.subtitle', 'Discover your Ishta Devata (personal deity) based on your birth chart. Your Ishta Devata is the form of the Divine that is most suited for your spiritual evolution.')}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-600" />
                {t('calculator.enterBirthDetails', 'Enter Birth Details')}
              </CardTitle>
              <CardDescription>
                {t('calculator.ishtaDevata.inputDesc', 'Enter your birth details to discover your personal deity')}
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
                  {t('calculator.ishtaDevata.timeNote', 'Accurate birth time helps determine the 9th house lord precisely')}
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
                  onLocationSelect={handleLocationSelect}
                />
              </div>
              
              <Button 
                onClick={handleCalculate}
                className="w-full bg-orange-600 hover:bg-orange-700"
                disabled={!birthDate || isCalculating}
              >
                {isCalculating ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                    {t('calculator.analyzing', 'Analyzing...')}
                  </>
                ) : (
                  <>
                    <Flame className="w-4 h-4 mr-2" />
                    {t('calculator.ishtaDevata.findDeity', 'Find My Ishta Devata')}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {deity ? (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Sun className="w-5 h-5 text-orange-600" />
                    {t('calculator.ishtaDevata.yourDeity', 'Your Ishta Devata')}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Badge className={
                      deityConfidence === "high" ? "bg-green-600" :
                      deityConfidence === "medium" ? "bg-amber-500" : "bg-blue-500"
                    }>
                      {deityConfidence === "high" ? t('calculator.highConfidence', 'High Confidence') :
                       deityConfidence === "medium" ? t('calculator.mediumConfidence', 'Medium Confidence') :
                       t('calculator.lowConfidence', 'Basic Analysis')}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {chartAnalysis && (
                  <div className="bg-orange-100 border border-orange-300 rounded-lg p-3 text-sm mb-4">
                    <p className="font-medium text-orange-800">{t('calculator.chartAnalysis', 'Chart Analysis')}: {chartAnalysis}</p>
                  </div>
                )}

                {error && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm flex items-start gap-2 mb-4">
                    <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <p className="text-yellow-700">{error}</p>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h2 className="text-3xl font-bold text-orange-700">{deity.name}</h2>
                  <p className="text-xl text-gray-600">{deity.hindi}</p>
                  <Badge className="mt-2 bg-orange-500">{t('calculator.bestDay', 'Best Day')}: {deity.bestDay}</Badge>
                </div>

                {deityReason && (
                  <div className="bg-white rounded-lg p-4 mb-4 border-l-4 border-orange-400">
                    <p className="text-gray-700 text-sm font-medium">{t('calculator.whyRecommended', 'Why Recommended')}: {deityReason}</p>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-gray-700">{deity.description}</p>
                  </div>

                  <div className="bg-white rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Star className="w-4 h-4 text-orange-500" />
                      {t('calculator.attributes', 'Divine Attributes')}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {deity.attributes.map((attr) => (
                        <Badge key={attr} variant="secondary" className="bg-orange-100 text-orange-700">
                          {attr}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{t('calculator.mantra', 'Sacred Mantra')}</h3>
                    <p className="text-orange-700 text-lg italic">{deity.mantra}</p>
                  </div>

                  <div className="bg-white rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{t('calculator.ishtaDevata.howToWorship', 'How to Worship')}</h3>
                    <p className="text-gray-700 text-sm">{deity.worship}</p>
                  </div>

                  <div className="bg-white rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Heart className="w-4 h-4 text-red-500" />
                      {t('calculator.ishtaDevata.offerings', 'Recommended Offerings')}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {deity.offerings.map((offering) => (
                        <Badge key={offering} className="bg-green-100 text-green-700">
                          {offering}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{t('calculator.benefits', 'Benefits of Worship')}</h3>
                    <div className="flex flex-wrap gap-2">
                      {deity.benefits.map((benefit) => (
                        <Badge key={benefit} variant="secondary" className="bg-blue-100 text-blue-700">
                          {benefit}
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
                  <Flame className="w-12 h-12 text-orange-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t('calculator.ishtaDevata.resultPlaceholder', 'Your Ishta Devata Will Appear Here')}
                </h3>
                <p className="text-gray-600 text-center max-w-xs">
                  {t('calculator.ishtaDevata.resultPlaceholderDesc', 'Enter your birth details to discover your personal deity and learn how to connect with the Divine through worship.')}
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
            {t('calculator.ishtaDevata.aboutTitle', 'Understanding Ishta Devata')}
          </h2>
          <p className="text-gray-700 mb-4">
            {t('calculator.ishtaDevata.aboutDesc1', 'Ishta Devata is a Sanskrit term meaning "chosen deity" or "personal god." In Vedic astrology, your Ishta Devata is determined by analyzing the 12th house from the Karakamsha (the sign where Atmakaraka is placed in Navamsa chart).')}
          </p>
          <p className="text-gray-700 mb-4">
            {t('calculator.ishtaDevata.aboutDesc2', 'Your Ishta Devata represents the form of the Divine that is most suited for your spiritual evolution. Worshipping your Ishta Devata helps in achieving moksha (liberation) and accelerates your spiritual growth.')}
          </p>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            {t('calculator.ishtaDevata.whyImportant', 'Why is Ishta Devata Important?')}
          </h3>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>{t('calculator.ishtaDevata.reason1', 'Provides a personal connection with the Divine')}</li>
            <li>{t('calculator.ishtaDevata.reason2', 'Accelerates spiritual growth and evolution')}</li>
            <li>{t('calculator.ishtaDevata.reason3', 'Helps overcome karmic obstacles')}</li>
            <li>{t('calculator.ishtaDevata.reason4', 'Brings peace, prosperity, and protection')}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
