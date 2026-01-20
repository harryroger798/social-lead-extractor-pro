"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { getCurrentYear, withCurrentYear } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Sparkles,
  Heart,
  Briefcase,
  Star,
  Users,
  TrendingUp,
  Shield,
} from "lucide-react";

interface ChineseZodiac {
  animal: string;
  element: string;
  yinYang: string;
  years: number[];
  characteristics: string[];
  strengths: string[];
  weaknesses: string[];
  compatibility: string[];
  incompatibility: string[];
  luckyNumbers: number[];
  luckyColors: string[];
  luckyFlowers: string[];
  career: string[];
  health: string;
  predictionYear: string;
}

const zodiacAnimals: Record<string, Omit<ChineseZodiac, 'element' | 'yinYang' | 'years'>> = {
  Rat: {
    animal: "Rat",
    characteristics: ["Quick-witted", "Resourceful", "Versatile", "Kind"],
    strengths: ["Adaptable", "Smart", "Cautious", "Acute", "Alert"],
    weaknesses: ["Timid", "Stubborn", "Picky", "Lack of persistence"],
    compatibility: ["Dragon", "Monkey", "Ox"],
    incompatibility: ["Horse", "Goat", "Rabbit"],
    luckyNumbers: [2, 3],
    luckyColors: ["Blue", "Gold", "Green"],
    luckyFlowers: ["Lily", "African Violet"],
    career: ["Writer", "Broadcaster", "Actor", "Lawyer", "Politician"],
    health: "Generally good health, but watch for stress-related issues",
    predictionYear: "The current year brings opportunities for career advancement. Focus on networking and building relationships. Financial gains are likely in the second half of the year."
  },
  Ox: {
    animal: "Ox",
    characteristics: ["Diligent", "Dependable", "Strong", "Determined"],
    strengths: ["Honest", "Loyal", "Patient", "Methodical"],
    weaknesses: ["Stubborn", "Narrow-minded", "Materialistic"],
    compatibility: ["Rat", "Snake", "Rooster"],
    incompatibility: ["Tiger", "Dragon", "Horse", "Goat"],
    luckyNumbers: [1, 4],
    luckyColors: ["White", "Yellow", "Green"],
    luckyFlowers: ["Tulip", "Evergreen"],
    career: ["Agriculture", "Manufacturing", "Engineering", "Real Estate"],
    health: "Strong constitution, but avoid overwork",
    predictionYear: "A year of steady progress. Hard work will be rewarded. Be patient with slow-moving projects. Romance looks promising for singles."
  },
  Tiger: {
    animal: "Tiger",
    characteristics: ["Brave", "Competitive", "Unpredictable", "Confident"],
    strengths: ["Courageous", "Enthusiastic", "Leadership", "Ambitious"],
    weaknesses: ["Arrogant", "Short-tempered", "Hasty"],
    compatibility: ["Dragon", "Horse", "Pig"],
    incompatibility: ["Ox", "Tiger", "Snake", "Monkey"],
    luckyNumbers: [1, 3, 4],
    luckyColors: ["Blue", "Grey", "Orange"],
    luckyFlowers: ["Yellow Lily", "Cineraria"],
    career: ["Advertising", "Travel", "Politics", "Entrepreneur"],
    health: "High energy but prone to accidents, be careful",
    predictionYear: "An exciting year with new opportunities. Take calculated risks. Travel is favored. Watch your temper in relationships."
  },
  Rabbit: {
    animal: "Rabbit",
    characteristics: ["Quiet", "Elegant", "Kind", "Responsible"],
    strengths: ["Gentle", "Sensitive", "Compassionate", "Amiable"],
    weaknesses: ["Timid", "Conservative", "Escapist"],
    compatibility: ["Goat", "Monkey", "Dog", "Pig"],
    incompatibility: ["Snake", "Rooster"],
    luckyNumbers: [3, 4, 6],
    luckyColors: ["Red", "Pink", "Purple", "Blue"],
    luckyFlowers: ["Plantain Lily", "Jasmine"],
    career: ["Art", "Music", "Literature", "Healthcare"],
    health: "Generally good, maintain emotional balance",
    predictionYear: "A harmonious year ahead. Focus on home and family. Creative projects will flourish. Avoid major financial risks."
  },
  Dragon: {
    animal: "Dragon",
    characteristics: ["Confident", "Intelligent", "Enthusiastic", "Ambitious"],
    strengths: ["Decisive", "Inspiring", "Generous", "Fearless"],
    weaknesses: ["Arrogant", "Impatient", "Intolerant"],
    compatibility: ["Rooster", "Rat", "Monkey"],
    incompatibility: ["Ox", "Goat", "Dog"],
    luckyNumbers: [1, 6, 7],
    luckyColors: ["Gold", "Silver", "Grey"],
    luckyFlowers: ["Bleeding Heart", "Dragon Flowers"],
    career: ["Architect", "Lawyer", "Engineer", "Broker"],
    health: "Strong vitality, watch for stress",
    predictionYear: "A powerful year for Dragons. Leadership opportunities arise. Financial success is indicated. Be mindful of ego in relationships."
  },
  Snake: {
    animal: "Snake",
    characteristics: ["Enigmatic", "Intelligent", "Wise", "Intuitive"],
    strengths: ["Analytical", "Determined", "Elegant", "Romantic"],
    weaknesses: ["Jealous", "Suspicious", "Sly"],
    compatibility: ["Dragon", "Rooster", "Ox"],
    incompatibility: ["Tiger", "Rabbit", "Snake", "Goat", "Pig"],
    luckyNumbers: [2, 8, 9],
    luckyColors: ["Black", "Red", "Yellow"],
    luckyFlowers: ["Orchid", "Cactus"],
    career: ["Scientist", "Analyst", "Investigator", "Painter"],
    health: "Prone to stress, practice relaxation",
    predictionYear: "A year of transformation. Trust your intuition. Financial investments may pay off. Focus on self-improvement."
  },
  Horse: {
    animal: "Horse",
    characteristics: ["Animated", "Active", "Energetic", "Independent"],
    strengths: ["Warm-hearted", "Enthusiastic", "Positive", "Talented"],
    weaknesses: ["Impatient", "Hot-blooded", "Stubborn"],
    compatibility: ["Tiger", "Goat", "Rabbit"],
    incompatibility: ["Rat", "Ox", "Rooster", "Horse"],
    luckyNumbers: [2, 3, 7],
    luckyColors: ["Yellow", "Green"],
    luckyFlowers: ["Calla Lily", "Jasmine"],
    career: ["Performer", "Salesperson", "Journalist", "Translator"],
    health: "High energy, avoid overexertion",
    predictionYear: "An active year with travel opportunities. Career changes are favorable. Romance is exciting but may be unstable."
  },
  Goat: {
    animal: "Goat",
    characteristics: ["Calm", "Gentle", "Sympathetic", "Creative"],
    strengths: ["Tasteful", "Crafty", "Warm", "Elegant"],
    weaknesses: ["Indecisive", "Timid", "Pessimistic"],
    compatibility: ["Rabbit", "Horse", "Pig"],
    incompatibility: ["Ox", "Tiger", "Dog"],
    luckyNumbers: [2, 7],
    luckyColors: ["Brown", "Red", "Purple"],
    luckyFlowers: ["Carnation", "Primrose"],
    career: ["Artist", "Musician", "Designer", "Florist"],
    health: "Sensitive constitution, maintain routine",
    predictionYear: "A creative and peaceful year. Artistic pursuits are favored. Relationships deepen. Avoid financial speculation."
  },
  Monkey: {
    animal: "Monkey",
    characteristics: ["Sharp", "Smart", "Curious", "Mischievous"],
    strengths: ["Sociable", "Innovative", "Enthusiastic", "Self-assured"],
    weaknesses: ["Suspicious", "Cunning", "Selfish"],
    compatibility: ["Ox", "Rabbit", "Dragon", "Rat"],
    incompatibility: ["Tiger", "Pig"],
    luckyNumbers: [4, 9],
    luckyColors: ["White", "Blue", "Gold"],
    luckyFlowers: ["Chrysanthemum", "Crape Myrtle"],
    career: ["Accountant", "Scientist", "Engineer", "Stock Analyst"],
    health: "Generally good, watch nervous system",
    predictionYear: "An intellectually stimulating year. Problem-solving skills shine. Business ventures are favorable. Be honest in relationships."
  },
  Rooster: {
    animal: "Rooster",
    characteristics: ["Observant", "Hardworking", "Courageous", "Talented"],
    strengths: ["Honest", "Energetic", "Intelligent", "Confident"],
    weaknesses: ["Vain", "Boastful", "Critical"],
    compatibility: ["Ox", "Snake", "Dragon"],
    incompatibility: ["Rat", "Rabbit", "Horse", "Rooster", "Dog"],
    luckyNumbers: [5, 7, 8],
    luckyColors: ["Gold", "Brown", "Yellow"],
    luckyFlowers: ["Gladiola", "Impatiens"],
    career: ["Newsreader", "Salesperson", "Restaurant Owner", "Hairdresser"],
    health: "Good health, avoid stress",
    predictionYear: "A year of recognition. Hard work pays off. Social life is active. Be diplomatic to avoid conflicts."
  },
  Dog: {
    animal: "Dog",
    characteristics: ["Loyal", "Honest", "Amiable", "Kind"],
    strengths: ["Valiant", "Faithful", "Courageous", "Dexterous"],
    weaknesses: ["Sensitive", "Conservative", "Stubborn"],
    compatibility: ["Rabbit", "Tiger", "Horse"],
    incompatibility: ["Dragon", "Goat", "Rooster"],
    luckyNumbers: [3, 4, 9],
    luckyColors: ["Red", "Green", "Purple"],
    luckyFlowers: ["Rose", "Cymbidium Orchid"],
    career: ["Police", "Scientist", "Counselor", "Professor"],
    health: "Generally good, watch for anxiety",
    predictionYear: "A stable year with loyal friends. Career is steady. Focus on family relationships. Health needs attention."
  },
  Pig: {
    animal: "Pig",
    characteristics: ["Compassionate", "Generous", "Diligent", "Sincere"],
    strengths: ["Honorable", "Philanthropic", "Optimistic", "Sincere"],
    weaknesses: ["Naive", "Over-reliant", "Self-indulgent"],
    compatibility: ["Tiger", "Rabbit", "Goat"],
    incompatibility: ["Snake", "Monkey"],
    luckyNumbers: [2, 5, 8],
    luckyColors: ["Yellow", "Grey", "Brown", "Gold"],
    luckyFlowers: ["Hydrangea", "Daisy"],
    career: ["Entertainment", "Retail", "Hospitality", "Healthcare"],
    health: "Watch diet and exercise",
    predictionYear: "A prosperous year. Financial luck is strong. Social life is vibrant. Be cautious with new partnerships."
  }
};

const elements = ["Wood", "Fire", "Earth", "Metal", "Water"];

function getChineseZodiac(year: number): { animal: string; element: string; yinYang: string } {
  const animals = ["Rat", "Ox", "Tiger", "Rabbit", "Dragon", "Snake", "Horse", "Goat", "Monkey", "Rooster", "Dog", "Pig"];
  const animalIndex = (year - 4) % 12;
  const elementIndex = Math.floor(((year - 4) % 10) / 2);
  const yinYang = year % 2 === 0 ? "Yang" : "Yin";
  
  return {
    animal: animals[animalIndex],
    element: elements[elementIndex],
    yinYang
  };
}

export default function ChineseAstrologyPage() {
  const { t } = useLanguage();
  const [birthYear, setBirthYear] = useState("");
  const [result, setResult] = useState<ChineseZodiac | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCalculating(true);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const year = parseInt(birthYear);
    const zodiac = getChineseZodiac(year);
    const animalData = zodiacAnimals[zodiac.animal];
    
    setResult({
      ...animalData,
      element: zodiac.element,
      yinYang: zodiac.yinYang,
      years: Array.from({ length: 10 }, (_, i) => year - 12 * (5 - i)).filter(y => y > 1900 && y < 2100)
    });
    
    setIsCalculating(false);
  };

  const animalEmojis: Record<string, string> = {
    Rat: "🐀", Ox: "🐂", Tiger: "🐅", Rabbit: "🐇", Dragon: "🐉", Snake: "🐍",
    Horse: "🐎", Goat: "🐐", Monkey: "🐒", Rooster: "🐓", Dog: "🐕", Pig: "🐖"
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-red-50 to-orange-50">
      {/* Hero Section */}
      <section className="relative py-16 bg-gradient-to-r from-red-700 via-red-600 to-orange-600">
        <div className="absolute inset-0 bg-[url('/images/stars-pattern.png')] opacity-10"></div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <Badge className="mb-4 bg-white/20 text-white border-white/30">
              <Star className="w-3 h-3 mr-1" />
              {t("chinese.badge", "Chinese Astrology")}
            </Badge>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              {t("chinese.title", "Chinese Zodiac")}
            </h1>
            <p className="text-lg text-red-100 max-w-2xl mx-auto">
              {withCurrentYear(t("chinese.subtitleYear", "Discover your Chinese zodiac animal, element, and what the Year of the Snake ({year}) holds for you."))}
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
                  {t("chinese.enterYear", "Enter Birth Year")}
                </CardTitle>
                <CardDescription>
                  {t("chinese.enterYearDesc", "Find your Chinese zodiac sign")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCalculate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="year">{t("chinese.birthYear", "Birth Year")}</Label>
                    <Input
                      id="year"
                      type="number"
                      min="1900"
                      max="2100"
                      value={birthYear}
                      onChange={(e) => setBirthYear(e.target.value)}
                      placeholder="e.g., 1998"
                      required
                    />
                    <p className="text-xs text-gray-500">
                      {t("chinese.yearHint", "Enter your birth year (1900-2100)")}
                    </p>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-red-600 hover:bg-red-700"
                    disabled={isCalculating}
                  >
                    {isCalculating ? (
                      <>
                        <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                        {t("chinese.calculating", "Calculating...")}
                      </>
                    ) : (
                      <>
                        <Star className="w-4 h-4 mr-2" />
                        {t("chinese.findZodiac", "Find My Zodiac")}
                      </>
                    )}
                  </Button>
                </form>

                {/* Quick Reference */}
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-semibold text-sm mb-3">{t("chinese.quickRef", "Quick Reference")}</h4>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    {Object.entries(animalEmojis).map(([animal, emoji]) => (
                      <div key={animal} className="text-xs">
                        <div className="text-2xl">{emoji}</div>
                        <div className="text-gray-600">{animal}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-2">
            {!result ? (
              <Card className="h-full flex items-center justify-center min-h-[400px]">
                <CardContent className="text-center py-12">
                  <div className="text-6xl mb-4">🐉</div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    {t("chinese.noResult", "Enter your birth year")}
                  </h3>
                  <p className="text-gray-500 max-w-md">
                    {t("chinese.noResultDesc", "Discover your Chinese zodiac animal, element, and personality traits based on the ancient Chinese astrological system.")}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* Main Result Card */}
                <Card className="bg-gradient-to-br from-red-500 to-orange-500 text-white">
                  <CardContent className="p-8 text-center">
                    <div className="text-8xl mb-4">{animalEmojis[result.animal]}</div>
                    <h2 className="text-3xl font-bold mb-2">{result.animal}</h2>
                    <div className="flex justify-center gap-4 mb-4">
                      <Badge className="bg-white/20 text-white">{result.element} Element</Badge>
                      <Badge className="bg-white/20 text-white">{result.yinYang}</Badge>
                    </div>
                    <p className="text-red-100">
                      {t("chinese.yearsLabel", "Years")}: {result.years.join(", ")}
                    </p>
                  </CardContent>
                </Card>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">{t("chinese.overview", "Overview")}</TabsTrigger>
                    <TabsTrigger value="compatibility">{t("chinese.compatibility", "Love")}</TabsTrigger>
                    <TabsTrigger value="career">{t("chinese.career", "Career")}</TabsTrigger>
                    <TabsTrigger value="currentYear">{getCurrentYear().toString()}</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview">
                    <div className="grid md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">{t("chinese.characteristics", "Characteristics")}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {result.characteristics.map((char, idx) => (
                              <Badge key={idx} variant="secondary">{char}</Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg text-green-700">{t("chinese.strengths", "Strengths")}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-1">
                            {result.strengths.map((str, idx) => (
                              <li key={idx} className="flex items-center gap-2 text-sm">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                {str}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg text-orange-700">{t("chinese.weaknesses", "Weaknesses")}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-1">
                            {result.weaknesses.map((weak, idx) => (
                              <li key={idx} className="flex items-center gap-2 text-sm">
                                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                {weak}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">{t("chinese.luckyThings", "Lucky Things")}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <p className="text-sm"><strong>Numbers:</strong> {result.luckyNumbers.join(", ")}</p>
                          <p className="text-sm"><strong>Colors:</strong> {result.luckyColors.join(", ")}</p>
                          <p className="text-sm"><strong>Flowers:</strong> {result.luckyFlowers.join(", ")}</p>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="compatibility">
                    <div className="grid md:grid-cols-2 gap-4">
                      <Card className="border-green-200">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-green-700">
                            <Heart className="w-5 h-5" />
                            {t("chinese.bestMatches", "Best Matches")}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-3">
                            {result.compatibility.map((animal, idx) => (
                              <div key={idx} className="text-center">
                                <div className="text-4xl">{animalEmojis[animal]}</div>
                                <div className="text-sm">{animal}</div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-red-200">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-red-700">
                            <Shield className="w-5 h-5" />
                            {t("chinese.leastCompatible", "Least Compatible")}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-3">
                            {result.incompatibility.map((animal, idx) => (
                              <div key={idx} className="text-center">
                                <div className="text-4xl">{animalEmojis[animal]}</div>
                                <div className="text-sm">{animal}</div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="career">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Briefcase className="w-5 h-5 text-blue-600" />
                          {t("chinese.careerPaths", "Ideal Career Paths")}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {result.career.map((career, idx) => (
                            <Badge key={idx} className="bg-blue-100 text-blue-700">{career}</Badge>
                          ))}
                        </div>
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <h4 className="font-semibold text-blue-700 mb-2">{t("chinese.healthAdvice", "Health Advice")}</h4>
                          <p className="text-sm text-gray-600">{result.health}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="currentYear">
                    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-green-600" />
                          {withCurrentYear(t("chinese.predictionYearTitle", "Year of the Snake {year} Prediction"))}
                        </CardTitle>
                        <CardDescription>
                          {t("chinese.predictionFor", "Prediction for")} {result.animal}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700 leading-relaxed">{result.predictionYear}</p>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>
        </div>

        {/* About Section */}
        <section className="mt-16">
          <Card>
            <CardHeader>
              <CardTitle>{t("chinese.aboutTitle", "About Chinese Astrology")}</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p className="text-gray-600">
                {t("chinese.aboutText1", "Chinese astrology is based on a 12-year cycle, with each year represented by an animal sign. The system also incorporates five elements (Wood, Fire, Earth, Metal, Water) and the concept of Yin and Yang, creating a 60-year cycle of unique combinations.")}
              </p>
              <p className="text-gray-600 mt-4">
                {t("chinese.aboutText2", "Your Chinese zodiac sign is determined by your birth year according to the Chinese lunar calendar. Each animal sign has its own characteristics, strengths, weaknesses, and compatibility with other signs.")}
              </p>
              <p className="text-gray-600 mt-4">
                {withCurrentYear(t("chinese.aboutText3Year", "{year} is the Year of the Snake, which begins on February 17, {year}. The Snake is associated with wisdom, intuition, and transformation. It's a year that favors careful planning, deep thinking, and strategic moves."))}
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
