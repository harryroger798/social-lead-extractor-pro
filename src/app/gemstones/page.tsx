"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Gem,
  Calendar,
  Clock,
  Sparkles,
  Sun,
  Moon,
  Star,
  Shield,
  Heart,
  Briefcase,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

interface Gemstone {
  name: string;
  hindi: string;
  planet: string;
  color: string;
  image: string;
  benefits: string[];
  whoShouldWear: string[];
  whoShouldAvoid: string[];
  weight: string;
  metal: string;
  finger: string;
  day: string;
  mantra: string;
  price: string;
  alternatives: string[];
}

// Real gemstone images from Unsplash (allows hotlinking via source.unsplash.com)
const gemstoneImages: Record<string, string> = {
  Ruby: "https://images.unsplash.com/photo-1551122087-f99a4f5e5e6b?w=400&h=400&fit=crop",
  Pearl: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop",
  RedCoral: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400&h=400&fit=crop",
  Emerald: "https://images.unsplash.com/photo-1583937443566-6b087e0f2730?w=400&h=400&fit=crop",
  YellowSapphire: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop",
  Diamond: "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=400&h=400&fit=crop",
  BlueSapphire: "https://images.unsplash.com/photo-1615655406736-b37c4fabf923?w=400&h=400&fit=crop",
  Hessonite: "https://images.unsplash.com/photo-1551122089-4e3e72477432?w=400&h=400&fit=crop",
  CatsEye: "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=400&h=400&fit=crop"
};

const gemstones: Record<string, Gemstone> = {
  Ruby: {
    name: "Ruby",
    hindi: "माणिक्य (Manikya)",
    planet: "Sun",
    color: "Red",
    image: gemstoneImages.Ruby,
    benefits: [
      "Enhances leadership qualities",
      "Boosts confidence and self-esteem",
      "Improves relationship with father",
      "Brings fame and recognition",
      "Strengthens heart and spine"
    ],
    whoShouldWear: ["Leo ascendant", "Aries ascendant", "Sagittarius ascendant", "Those with weak Sun in chart"],
    whoShouldAvoid: ["Taurus ascendant", "Libra ascendant", "Capricorn ascendant", "Aquarius ascendant"],
    weight: "3-6 carats",
    metal: "Gold",
    finger: "Ring finger",
    day: "Sunday morning during Shukla Paksha",
    mantra: "Om Suryaya Namaha (108 times)",
    price: "High (₹5,000 - ₹50,000+ per carat)",
    alternatives: ["Red Garnet", "Red Spinel", "Star Ruby"]
  },
    Pearl: {
      name: "Pearl",
      hindi: "मोती (Moti)",
      planet: "Moon",
      color: "White/Cream",
      image: gemstoneImages.Pearl,
      benefits: [
      "Calms the mind and emotions",
      "Improves relationship with mother",
      "Enhances intuition",
      "Brings peace and harmony",
      "Good for mental health"
    ],
    whoShouldWear: ["Cancer ascendant", "Pisces ascendant", "Scorpio ascendant", "Those with weak Moon"],
    whoShouldAvoid: ["Capricorn ascendant", "Aquarius ascendant if Moon is malefic"],
    weight: "4-6 carats",
    metal: "Silver",
    finger: "Little finger",
    day: "Monday morning during Shukla Paksha",
    mantra: "Om Chandraya Namaha (108 times)",
    price: "Moderate (₹1,000 - ₹10,000+ per carat)",
    alternatives: ["Moonstone", "White Coral"]
  },
    RedCoral: {
      name: "Red Coral",
      hindi: "मूंगा (Moonga)",
      planet: "Mars",
      color: "Red/Orange",
      image: gemstoneImages.RedCoral,
      benefits: [
      "Increases courage and confidence",
      "Protects from enemies",
      "Good for blood-related issues",
      "Enhances physical strength",
      "Helps in property matters"
    ],
    whoShouldWear: ["Aries ascendant", "Scorpio ascendant", "Cancer ascendant", "Leo ascendant"],
    whoShouldAvoid: ["Virgo ascendant", "Gemini ascendant if Mars is malefic"],
    weight: "6-12 carats",
    metal: "Gold or Copper",
    finger: "Ring finger",
    day: "Tuesday morning during Shukla Paksha",
    mantra: "Om Mangalaya Namaha (108 times)",
    price: "Moderate (₹500 - ₹5,000+ per carat)",
    alternatives: ["Carnelian", "Red Jasper"]
  },
    Emerald: {
      name: "Emerald",
      hindi: "पन्ना (Panna)",
      planet: "Mercury",
      color: "Green",
      image: gemstoneImages.Emerald,
      benefits: [
      "Enhances intelligence and memory",
      "Good for communication skills",
      "Helps in business and trade",
      "Improves concentration",
      "Good for nervous system"
    ],
    whoShouldWear: ["Gemini ascendant", "Virgo ascendant", "Taurus ascendant", "Libra ascendant"],
    whoShouldAvoid: ["Aries ascendant", "Scorpio ascendant if Mercury is enemy"],
    weight: "3-6 carats",
    metal: "Gold",
    finger: "Little finger",
    day: "Wednesday morning during Shukla Paksha",
    mantra: "Om Budhaya Namaha (108 times)",
    price: "High (₹3,000 - ₹30,000+ per carat)",
    alternatives: ["Green Tourmaline", "Peridot", "Green Onyx"]
  },
    YellowSapphire: {
      name: "Yellow Sapphire",
      hindi: "पुखराज (Pukhraj)",
      planet: "Jupiter",
      color: "Yellow",
      image: gemstoneImages.YellowSapphire,
      benefits: [
      "Brings wisdom and knowledge",
      "Good for marriage and children",
      "Enhances wealth and prosperity",
      "Improves spiritual growth",
      "Good for teachers and scholars"
    ],
    whoShouldWear: ["Sagittarius ascendant", "Pisces ascendant", "Aries ascendant", "Leo ascendant"],
    whoShouldAvoid: ["Taurus ascendant", "Libra ascendant", "Capricorn ascendant"],
    weight: "3-5 carats",
    metal: "Gold",
    finger: "Index finger",
    day: "Thursday morning during Shukla Paksha",
    mantra: "Om Brihaspataye Namaha (108 times)",
    price: "High (₹5,000 - ₹50,000+ per carat)",
    alternatives: ["Citrine", "Yellow Topaz", "Golden Beryl"]
  },
    Diamond: {
      name: "Diamond",
      hindi: "हीरा (Heera)",
      planet: "Venus",
      color: "White/Colorless",
      image: gemstoneImages.Diamond,
      benefits: [
      "Brings luxury and comfort",
      "Enhances beauty and charm",
      "Good for love and marriage",
      "Improves artistic abilities",
      "Brings material success"
    ],
    whoShouldWear: ["Taurus ascendant", "Libra ascendant", "Capricorn ascendant", "Aquarius ascendant"],
    whoShouldAvoid: ["Aries ascendant", "Scorpio ascendant", "Leo ascendant"],
    weight: "0.5-1.5 carats",
    metal: "Platinum or White Gold",
    finger: "Middle finger or Ring finger",
    day: "Friday morning during Shukla Paksha",
    mantra: "Om Shukraya Namaha (108 times)",
    price: "Very High (₹50,000 - ₹5,00,000+ per carat)",
    alternatives: ["White Sapphire", "Zircon", "White Topaz"]
  },
    BlueSapphire: {
      name: "Blue Sapphire",
      hindi: "नीलम (Neelam)",
      planet: "Saturn",
      color: "Blue",
      image: gemstoneImages.BlueSapphire,
      benefits: [
      "Brings sudden wealth and success",
      "Protects from accidents",
      "Good for career growth",
      "Removes obstacles",
      "Brings discipline and focus"
    ],
    whoShouldWear: ["Capricorn ascendant", "Aquarius ascendant", "Taurus ascendant", "Libra ascendant"],
    whoShouldAvoid: ["Leo ascendant", "Aries ascendant", "Scorpio ascendant"],
    weight: "3-5 carats (test first)",
    metal: "Gold or Silver",
    finger: "Middle finger",
    day: "Saturday evening during Shukla Paksha",
    mantra: "Om Shanaischaraya Namaha (108 times)",
    price: "High (₹5,000 - ₹1,00,000+ per carat)",
    alternatives: ["Amethyst", "Blue Spinel", "Iolite"]
  },
    Hessonite: {
      name: "Hessonite (Gomed)",
      hindi: "गोमेद (Gomed)",
      planet: "Rahu",
      color: "Honey/Brown",
      image: gemstoneImages.Hessonite,
      benefits: [
      "Removes confusion and fear",
      "Good for sudden gains",
      "Protects from enemies",
      "Helps in foreign travels",
      "Good for research work"
    ],
    whoShouldWear: ["Those with Rahu in favorable position", "Aquarius ascendant", "During Rahu Mahadasha"],
    whoShouldAvoid: ["Those with Rahu in 6th, 8th, 12th house without proper analysis"],
    weight: "5-7 carats",
    metal: "Silver",
    finger: "Middle finger",
    day: "Saturday evening during Shukla Paksha",
    mantra: "Om Rahave Namaha (108 times)",
    price: "Moderate (₹500 - ₹5,000+ per carat)",
    alternatives: ["Orange Zircon", "Spessartite Garnet"]
  },
    CatsEye: {
      name: "Cat's Eye (Lehsunia)",
      hindi: "लहसुनिया (Lehsunia)",
      planet: "Ketu",
      color: "Greenish/Yellowish with chatoyancy",
      image: gemstoneImages.CatsEye,
      benefits: [
      "Protects from accidents",
      "Good for spiritual growth",
      "Removes negative energy",
      "Helps in moksha",
      "Good for meditation"
    ],
    whoShouldWear: ["Those with Ketu in favorable position", "During Ketu Mahadasha", "Pisces ascendant"],
    whoShouldAvoid: ["Those with Ketu in 6th, 8th, 12th house without proper analysis"],
    weight: "3-5 carats",
    metal: "Gold or Silver",
    finger: "Little finger or Ring finger",
    day: "Thursday or Saturday",
    mantra: "Om Ketave Namaha (108 times)",
    price: "Moderate (₹1,000 - ₹10,000+ per carat)",
    alternatives: ["Tiger's Eye", "Chrysoberyl"]
  }
};

const zodiacGemstones: Record<string, { primary: string; secondary: string[] }> = {
  Aries: { primary: "RedCoral", secondary: ["Ruby", "YellowSapphire"] },
  Taurus: { primary: "Diamond", secondary: ["Emerald", "BlueSapphire"] },
  Gemini: { primary: "Emerald", secondary: ["Diamond", "BlueSapphire"] },
  Cancer: { primary: "Pearl", secondary: ["Ruby", "YellowSapphire"] },
  Leo: { primary: "Ruby", secondary: ["RedCoral", "YellowSapphire"] },
  Virgo: { primary: "Emerald", secondary: ["Diamond", "BlueSapphire"] },
  Libra: { primary: "Diamond", secondary: ["Emerald", "BlueSapphire"] },
  Scorpio: { primary: "RedCoral", secondary: ["Pearl", "YellowSapphire"] },
  Sagittarius: { primary: "YellowSapphire", secondary: ["Ruby", "RedCoral"] },
  Capricorn: { primary: "BlueSapphire", secondary: ["Diamond", "Emerald"] },
  Aquarius: { primary: "BlueSapphire", secondary: ["Diamond", "Hessonite"] },
  Pisces: { primary: "YellowSapphire", secondary: ["Pearl", "CatsEye"] }
};

function getZodiacFromDate(date: string): string {
  const d = new Date(date);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "Aries";
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "Taurus";
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "Gemini";
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "Cancer";
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "Leo";
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "Virgo";
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "Libra";
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "Scorpio";
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "Sagittarius";
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return "Capricorn";
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "Aquarius";
  return "Pisces";
}

export default function GemstonesPage() {
  const { t } = useLanguage();
  const [birthDate, setBirthDate] = useState("");
  const [zodiac, setZodiac] = useState<string | null>(null);
  const [recommendation, setRecommendation] = useState<{ primary: Gemstone; secondary: Gemstone[] } | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [activeTab, setActiveTab] = useState("recommendation");
  const [selectedGem, setSelectedGem] = useState<string | null>(null);

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCalculating(true);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const sign = getZodiacFromDate(birthDate);
    setZodiac(sign);
    
    const gemRec = zodiacGemstones[sign];
    setRecommendation({
      primary: gemstones[gemRec.primary],
      secondary: gemRec.secondary.map(g => gemstones[g])
    });
    
    setIsCalculating(false);
  };

  const gemColors: Record<string, string> = {
    Ruby: "bg-red-500",
    Pearl: "bg-gray-100",
    RedCoral: "bg-orange-500",
    Emerald: "bg-emerald-500",
    YellowSapphire: "bg-yellow-400",
    Diamond: "bg-white border",
    BlueSapphire: "bg-blue-600",
    Hessonite: "bg-amber-600",
    CatsEye: "bg-lime-400"
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-violet-50 to-purple-50">
      {/* Hero Section */}
      <section className="relative py-16 bg-gradient-to-r from-violet-600 via-purple-600 to-violet-700">
        <div className="absolute inset-0 bg-[url('/images/stars-pattern.png')] opacity-10"></div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <Badge className="mb-4 bg-white/20 text-white border-white/30">
              <Gem className="w-3 h-3 mr-1" />
              {t("gemstones.badge", "Gemstone Recommendations")}
            </Badge>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              {t("gemstones.title", "Astrological Gemstones")}
            </h1>
            <p className="text-lg text-violet-100 max-w-2xl mx-auto">
              {t("gemstones.subtitle", "Discover the perfect gemstone for you based on your birth chart. Learn about the nine planetary gemstones and their benefits.")}
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 max-w-lg mx-auto">
            <TabsTrigger value="recommendation">{t("gemstones.forYou", "For You")}</TabsTrigger>
            <TabsTrigger value="all">{t("gemstones.allGems", "All Gems")}</TabsTrigger>
            <TabsTrigger value="guide">{t("gemstones.guide", "Guide")}</TabsTrigger>
          </TabsList>

          {/* Recommendation Tab */}
          <TabsContent value="recommendation">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Input Form */}
              <div className="lg:col-span-1">
                <Card className="sticky top-4">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-violet-600" />
                      {t("gemstones.findGemstone", "Find Your Gemstone")}
                    </CardTitle>
                    <CardDescription>
                      {t("gemstones.findGemstoneDesc", "Get personalized gemstone recommendations")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCalculate} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="date">{t("common.birthDate", "Birth Date")}</Label>
                        <Input
                          id="date"
                          type="date"
                          value={birthDate}
                          onChange={(e) => setBirthDate(e.target.value)}
                          required
                        />
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full bg-violet-600 hover:bg-violet-700"
                        disabled={isCalculating}
                      >
                        {isCalculating ? (
                          <>
                            <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                            {t("gemstones.finding", "Finding...")}
                          </>
                        ) : (
                          <>
                            <Gem className="w-4 h-4 mr-2" />
                            {t("gemstones.getRecommendation", "Get Recommendation")}
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Results */}
              <div className="lg:col-span-2">
                {!recommendation ? (
                  <Card className="h-full flex items-center justify-center min-h-[400px]">
                    <CardContent className="text-center py-12">
                      <Gem className="w-16 h-16 text-violet-200 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">
                        {t("gemstones.noResult", "Enter your birth date")}
                      </h3>
                      <p className="text-gray-500 max-w-md">
                        {t("gemstones.noResultDesc", "Get personalized gemstone recommendations based on your zodiac sign and planetary positions.")}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-6">
                    {/* Zodiac Badge */}
                    <div className="text-center">
                      <Badge className="text-lg px-4 py-2 bg-violet-100 text-violet-700">
                        {zodiac} - {t("gemstones.yourSign", "Your Sign")}
                      </Badge>
                    </div>

                    {/* Primary Gemstone */}
                    <Card className="border-2 border-violet-300 bg-gradient-to-br from-violet-50 to-purple-50">
                      <CardHeader>
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-full overflow-hidden shadow-lg">
                            <img src={recommendation.primary.image} alt={recommendation.primary.name} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <Badge className="mb-1 bg-violet-600">{t("gemstones.primary", "Primary Recommendation")}</Badge>
                            <CardTitle className="text-2xl">{recommendation.primary.name}</CardTitle>
                            <CardDescription>{recommendation.primary.hindi} - {recommendation.primary.planet}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            {t("gemstones.benefits", "Benefits")}
                          </h4>
                          <ul className="grid md:grid-cols-2 gap-2">
                            {recommendation.primary.benefits.map((benefit, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm">
                                <Star className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                {benefit}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="p-3 bg-white rounded-lg">
                            <h5 className="font-semibold text-sm mb-2">{t("gemstones.howToWear", "How to Wear")}</h5>
                            <p className="text-sm text-gray-600"><strong>Weight:</strong> {recommendation.primary.weight}</p>
                            <p className="text-sm text-gray-600"><strong>Metal:</strong> {recommendation.primary.metal}</p>
                            <p className="text-sm text-gray-600"><strong>Finger:</strong> {recommendation.primary.finger}</p>
                            <p className="text-sm text-gray-600"><strong>Day:</strong> {recommendation.primary.day}</p>
                          </div>
                          <div className="p-3 bg-white rounded-lg">
                            <h5 className="font-semibold text-sm mb-2">{t("gemstones.mantra", "Mantra")}</h5>
                            <p className="text-sm text-violet-700 font-medium">{recommendation.primary.mantra}</p>
                            <h5 className="font-semibold text-sm mt-3 mb-1">{t("gemstones.alternatives", "Alternatives")}</h5>
                            <p className="text-sm text-gray-600">{recommendation.primary.alternatives.join(", ")}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Secondary Gemstones */}
                    <h3 className="text-lg font-semibold">{t("gemstones.secondary", "Secondary Recommendations")}</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {recommendation.secondary.map((gem, idx) => (
                        <Card key={idx} className="hover:shadow-lg transition-shadow">
                          <CardHeader className="pb-2">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full overflow-hidden shadow">
                                <img src={gem.image} alt={gem.name} className="w-full h-full object-cover" />
                              </div>
                              <div>
                                <CardTitle className="text-lg">{gem.name}</CardTitle>
                                <CardDescription>{gem.planet}</CardDescription>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-1">
                              {gem.benefits.slice(0, 3).map((benefit, bIdx) => (
                                <li key={bIdx} className="flex items-start gap-2 text-sm">
                                  <Star className="w-3 h-3 text-yellow-500 mt-1 flex-shrink-0" />
                                  {benefit}
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* All Gemstones Tab */}
          <TabsContent value="all">
            <div className="grid md:grid-cols-3 gap-6">
              {Object.entries(gemstones).map(([key, gem]) => (
                <Card 
                  key={key} 
                  className={`cursor-pointer hover:shadow-lg transition-all ${selectedGem === key ? 'ring-2 ring-violet-500' : ''}`}
                  onClick={() => setSelectedGem(selectedGem === key ? null : key)}
                >
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden shadow-lg">
                        <img src={gem.image} alt={gem.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <CardTitle>{gem.name}</CardTitle>
                        <CardDescription>{gem.hindi}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline">{gem.planet}</Badge>
                      <Badge variant="secondary">{gem.color}</Badge>
                    </div>
                    
                    {selectedGem === key && (
                      <div className="space-y-4 mt-4 pt-4 border-t">
                        <div>
                          <h4 className="font-semibold text-sm text-green-700 mb-2">{t("gemstones.benefits", "Benefits")}</h4>
                          <ul className="space-y-1">
                            {gem.benefits.map((b, i) => (
                              <li key={i} className="text-sm flex items-start gap-2">
                                <CheckCircle className="w-3 h-3 text-green-500 mt-1" />
                                {b}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm mb-2">{t("gemstones.howToWear", "How to Wear")}</h4>
                          <p className="text-sm text-gray-600">Weight: {gem.weight}</p>
                          <p className="text-sm text-gray-600">Metal: {gem.metal}</p>
                          <p className="text-sm text-gray-600">Finger: {gem.finger}</p>
                          <p className="text-sm text-gray-600">Day: {gem.day}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm mb-1">{t("gemstones.mantra", "Mantra")}</h4>
                          <p className="text-sm text-violet-700">{gem.mantra}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Guide Tab */}
          <TabsContent value="guide">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t("gemstones.guideTitle", "Gemstone Wearing Guide")}</CardTitle>
                </CardHeader>
                <CardContent className="prose max-w-none">
                  <h3 className="text-lg font-semibold mt-4">{t("gemstones.beforeWearing", "Before Wearing a Gemstone")}</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
                      <span>Always consult a qualified astrologer before wearing any gemstone</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
                      <span>Get your birth chart analyzed to determine which planets need strengthening</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
                      <span>Test Blue Sapphire (Neelam) for 3 days before permanent wearing</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
                      <span>Buy certified, natural gemstones from reputable dealers</span>
                    </li>
                  </ul>

                  <h3 className="text-lg font-semibold mt-6">{t("gemstones.purification", "Purification Process")}</h3>
                  <ol className="list-decimal list-inside space-y-2 text-gray-600">
                    <li>Dip the gemstone in raw milk or Ganga water overnight</li>
                    <li>On the auspicious day, wash it with Ganga water</li>
                    <li>Place it on a clean cloth in front of your deity</li>
                    <li>Light incense and a lamp</li>
                    <li>Chant the respective mantra 108 times</li>
                    <li>Wear the gemstone on the specified finger</li>
                  </ol>

                  <h3 className="text-lg font-semibold mt-6">{t("gemstones.cautions", "Important Cautions")}</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>Never wear conflicting gemstones together (e.g., Ruby with Blue Sapphire)</li>
                    <li>Remove gemstones during impure activities</li>
                    <li>Gemstones lose power over time - replace after 3-5 years</li>
                    <li>Cracked or damaged gemstones should not be worn</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
