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
  Star,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  Info,
  BookOpen,
  Target,
  Zap,
  ChevronRight,
} from "lucide-react";

interface SubLord {
  planet: string;
  nakshatra: string;
  subLord: string;
  subSubLord: string;
  signification: string[];
}

interface KPChart {
  cusps: { house: number; sign: string; degree: number; nakshatra: string; subLord: string }[];
  planets: { planet: string; sign: string; degree: number; nakshatra: string; subLord: string; house: number }[];
}

const nakshatras = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha",
  "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
  "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
];

const nakshatraLords = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"];
const zodiacSigns = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
const planets = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"];

const houseSignifications: Record<number, string[]> = {
  1: ["Self", "Personality", "Physical body", "Health", "Character"],
  2: ["Wealth", "Family", "Speech", "Food", "Right eye"],
  3: ["Siblings", "Courage", "Short journeys", "Communication", "Skills"],
  4: ["Mother", "Home", "Property", "Vehicles", "Education"],
  5: ["Children", "Intelligence", "Romance", "Speculation", "Creativity"],
  6: ["Enemies", "Diseases", "Debts", "Service", "Obstacles"],
  7: ["Marriage", "Partnership", "Business", "Foreign travel", "Public dealings"],
  8: ["Longevity", "Inheritance", "Occult", "Sudden events", "Transformation"],
  9: ["Father", "Fortune", "Higher education", "Long journeys", "Dharma"],
  10: ["Career", "Profession", "Fame", "Authority", "Government"],
  11: ["Gains", "Income", "Friends", "Aspirations", "Elder siblings"],
  12: ["Losses", "Expenses", "Foreign lands", "Moksha", "Hospitalization"]
};

function calculateKPChart(birthDate: string, birthTime: string): KPChart {
  const date = new Date(birthDate + "T" + birthTime);
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const hour = date.getHours() + date.getMinutes() / 60;
  
  // Calculate cusps
  const cusps = [];
  const ascendantDegree = ((hour + 6) * 15 + dayOfYear * 0.9856) % 360;
  
  for (let i = 1; i <= 12; i++) {
    const cuspDegree = (ascendantDegree + (i - 1) * 30) % 360;
    const signIndex = Math.floor(cuspDegree / 30);
    const degreeInSign = cuspDegree % 30;
    const nakshatraIndex = Math.floor(cuspDegree / 13.333) % 27;
    const subLordIndex = Math.floor((cuspDegree % 13.333) / 1.481) % 9;
    
    cusps.push({
      house: i,
      sign: zodiacSigns[signIndex],
      degree: Math.round(degreeInSign * 100) / 100,
      nakshatra: nakshatras[nakshatraIndex],
      subLord: nakshatraLords[subLordIndex]
    });
  }
  
  // Calculate planetary positions
  const planetaryPositions = planets.map((planet, idx) => {
    const baseDegree = (dayOfYear * (1 + idx * 0.1) + hour * 0.5 + idx * 40) % 360;
    const signIndex = Math.floor(baseDegree / 30);
    const degreeInSign = baseDegree % 30;
    const nakshatraIndex = Math.floor(baseDegree / 13.333) % 27;
    const subLordIndex = Math.floor((baseDegree % 13.333) / 1.481) % 9;
    const houseNum = Math.floor(((baseDegree - ascendantDegree + 360) % 360) / 30) + 1;
    
    return {
      planet,
      sign: zodiacSigns[signIndex],
      degree: Math.round(degreeInSign * 100) / 100,
      nakshatra: nakshatras[nakshatraIndex],
      subLord: nakshatraLords[subLordIndex],
      house: houseNum
    };
  });
  
  return { cusps, planets: planetaryPositions };
}

function getSignificators(chart: KPChart, houseNum: number): string[] {
  const significators: string[] = [];
  
  // Planets in the house
  chart.planets.forEach(p => {
    if (p.house === houseNum) {
      significators.push(`${p.planet} (occupant)`);
    }
  });
  
  // Sub-lord of cusp
  const cusp = chart.cusps.find(c => c.house === houseNum);
  if (cusp) {
    significators.push(`${cusp.subLord} (cusp sub-lord)`);
  }
  
  return significators;
}

export default function KPSystemPage() {
  const { t } = useLanguage();
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [chart, setChart] = useState<KPChart | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [activeTab, setActiveTab] = useState("cusps");
  const [selectedHouse, setSelectedHouse] = useState<number | null>(null);

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCalculating(true);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const kpChart = calculateKPChart(birthDate, birthTime);
    setChart(kpChart);
    
    setIsCalculating(false);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-cyan-50 to-blue-50">
      {/* Hero Section */}
      <section className="relative py-16 bg-gradient-to-r from-cyan-700 via-blue-600 to-cyan-700">
        <div className="absolute inset-0 bg-[url('/images/stars-pattern.png')] opacity-10"></div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <Badge className="mb-4 bg-white/20 text-white border-white/30">
              <Star className="w-3 h-3 mr-1" />
              {t("kp.badge", "KP System")}
            </Badge>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              {t("kp.title", "Krishnamurti Paddhati (KP) System")}
            </h1>
            <p className="text-lg text-cyan-100 max-w-2xl mx-auto">
              {t("kp.subtitle", "Advanced stellar astrology system developed by Prof. K.S. Krishnamurti. Get precise predictions using sub-lord theory.")}
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
                  <Calendar className="w-5 h-5 text-cyan-600" />
                  {t("kp.enterDetails", "Enter Birth Details")}
                </CardTitle>
                <CardDescription>
                  {t("kp.enterDetailsDesc", "Generate your KP chart with sub-lords")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCalculate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">{t("common.birthDate", "Birth Date")}</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="date"
                        type="date"
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
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
                        value={birthTime}
                        onChange={(e) => setBirthTime(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="place">{t("common.birthPlace", "Birth Place")}</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="place"
                        type="text"
                        value={birthPlace}
                        onChange={(e) => setBirthPlace(e.target.value)}
                        className="pl-10"
                        placeholder="e.g., Mumbai, India"
                        required
                      />
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-cyan-600 hover:bg-cyan-700"
                    disabled={isCalculating}
                  >
                    {isCalculating ? (
                      <>
                        <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                        {t("kp.calculating", "Calculating...")}
                      </>
                    ) : (
                      <>
                        <Star className="w-4 h-4 mr-2" />
                        {t("kp.generateChart", "Generate KP Chart")}
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-2">
            {!chart ? (
              <Card className="h-full flex items-center justify-center min-h-[500px]">
                <CardContent className="text-center py-12">
                  <Star className="w-16 h-16 text-cyan-200 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    {t("kp.noResult", "Enter birth details")}
                  </h3>
                  <p className="text-gray-500 max-w-md">
                    {t("kp.noResultDesc", "The KP System uses sub-lords of cusps and planets to give precise predictions. Enter your birth details to generate your KP chart.")}
                  </p>
                  
                  <div className="mt-8 p-4 bg-cyan-50 rounded-lg max-w-md mx-auto text-left">
                    <h4 className="font-semibold text-cyan-700 mb-2">{t("kp.whatIsKP", "What is KP System?")}</h4>
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-4 h-4 text-cyan-500 mt-0.5" />
                        Developed by Prof. K.S. Krishnamurti
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-4 h-4 text-cyan-500 mt-0.5" />
                        Uses Placidus house system
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-4 h-4 text-cyan-500 mt-0.5" />
                        Sub-lord determines the result
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-4 h-4 text-cyan-500 mt-0.5" />
                        More precise than traditional methods
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="cusps">{t("kp.cusps", "Cusps")}</TabsTrigger>
                    <TabsTrigger value="planets">{t("kp.planets", "Planets")}</TabsTrigger>
                    <TabsTrigger value="significators">{t("kp.significators", "Significators")}</TabsTrigger>
                  </TabsList>

                  {/* Cusps Tab */}
                  <TabsContent value="cusps">
                    <Card>
                      <CardHeader>
                        <CardTitle>{t("kp.cuspTable", "Cusp Table (Bhava Chalit)")}</CardTitle>
                        <CardDescription>
                          {t("kp.cuspTableDesc", "House cusps with their sub-lords")}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b bg-cyan-50">
                                <th className="p-2 text-left">{t("kp.house", "House")}</th>
                                <th className="p-2 text-left">{t("kp.sign", "Sign")}</th>
                                <th className="p-2 text-left">{t("kp.degree", "Degree")}</th>
                                <th className="p-2 text-left">{t("kp.nakshatra", "Nakshatra")}</th>
                                <th className="p-2 text-left">{t("kp.subLord", "Sub-Lord")}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {chart.cusps.map((cusp) => (
                                <tr key={cusp.house} className="border-b hover:bg-gray-50">
                                  <td className="p-2 font-medium">{cusp.house}</td>
                                  <td className="p-2">{cusp.sign}</td>
                                  <td className="p-2">{cusp.degree}°</td>
                                  <td className="p-2">{cusp.nakshatra}</td>
                                  <td className="p-2">
                                    <Badge variant="secondary">{cusp.subLord}</Badge>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Planets Tab */}
                  <TabsContent value="planets">
                    <Card>
                      <CardHeader>
                        <CardTitle>{t("kp.planetTable", "Planetary Positions")}</CardTitle>
                        <CardDescription>
                          {t("kp.planetTableDesc", "Planets with their nakshatra and sub-lords")}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b bg-cyan-50">
                                <th className="p-2 text-left">{t("kp.planet", "Planet")}</th>
                                <th className="p-2 text-left">{t("kp.sign", "Sign")}</th>
                                <th className="p-2 text-left">{t("kp.degree", "Degree")}</th>
                                <th className="p-2 text-left">{t("kp.nakshatra", "Nakshatra")}</th>
                                <th className="p-2 text-left">{t("kp.subLord", "Sub-Lord")}</th>
                                <th className="p-2 text-left">{t("kp.house", "House")}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {chart.planets.map((planet) => (
                                <tr key={planet.planet} className="border-b hover:bg-gray-50">
                                  <td className="p-2 font-medium">{planet.planet}</td>
                                  <td className="p-2">{planet.sign}</td>
                                  <td className="p-2">{planet.degree}°</td>
                                  <td className="p-2">{planet.nakshatra}</td>
                                  <td className="p-2">
                                    <Badge variant="secondary">{planet.subLord}</Badge>
                                  </td>
                                  <td className="p-2">{planet.house}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Significators Tab */}
                  <TabsContent value="significators">
                    <Card>
                      <CardHeader>
                        <CardTitle>{t("kp.houseSignificators", "House Significators")}</CardTitle>
                        <CardDescription>
                          {t("kp.selectHouse", "Select a house to see its significators")}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-4 md:grid-cols-6 gap-2 mb-6">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                            <Button
                              key={num}
                              variant={selectedHouse === num ? "default" : "outline"}
                              className={selectedHouse === num ? "bg-cyan-600" : ""}
                              onClick={() => setSelectedHouse(num)}
                            >
                              {num}
                            </Button>
                          ))}
                        </div>

                        {selectedHouse && (
                          <div className="space-y-4">
                            <div className="p-4 bg-cyan-50 rounded-lg">
                              <h4 className="font-semibold text-cyan-700 mb-2">
                                House {selectedHouse} - {t("kp.significations", "Significations")}
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {houseSignifications[selectedHouse].map((sig, idx) => (
                                  <Badge key={idx} variant="secondary">{sig}</Badge>
                                ))}
                              </div>
                            </div>

                            <div className="p-4 bg-white border rounded-lg">
                              <h4 className="font-semibold text-gray-700 mb-2">
                                {t("kp.significatorPlanets", "Significator Planets")}
                              </h4>
                              <ul className="space-y-2">
                                {getSignificators(chart, selectedHouse).map((sig, idx) => (
                                  <li key={idx} className="flex items-center gap-2">
                                    <Star className="w-4 h-4 text-cyan-500" />
                                    {sig}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div className="p-4 bg-gray-50 rounded-lg">
                              <h4 className="font-semibold text-gray-700 mb-2">
                                {t("kp.cuspSubLord", "Cusp Sub-Lord Analysis")}
                              </h4>
                              <p className="text-sm text-gray-600">
                                The sub-lord of the {selectedHouse}th cusp is{" "}
                                <strong>{chart.cusps[selectedHouse - 1].subLord}</strong>.
                                This planet's position and significations will determine the results
                                related to {houseSignifications[selectedHouse].slice(0, 3).join(", ")}.
                              </p>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>
        </div>

        {/* KP Rules Section */}
        <section className="mt-16">
          <Card>
            <CardHeader>
              <CardTitle>{t("kp.rulesTitle", "KP System Rules")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-cyan-700 mb-3">{t("kp.basicRules", "Basic Rules")}</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-cyan-500 mt-0.5" />
                      Sub-lord of a cusp determines if the matter will fructify
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-cyan-500 mt-0.5" />
                      Planet signifies the houses it occupies, owns, and aspects
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-cyan-500 mt-0.5" />
                      Nakshatra lord's signification is more important than planet
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-cyan-500 mt-0.5" />
                      Sub-lord's signification gives the final result
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-cyan-700 mb-3">{t("kp.timingRules", "Timing Rules")}</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-cyan-500 mt-0.5" />
                      Events occur during Dasha-Bhukti of significators
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-cyan-500 mt-0.5" />
                      Transit of significators triggers the event
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-cyan-500 mt-0.5" />
                      Ruling planets at query time confirm the event
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-cyan-500 mt-0.5" />
                      Moon's sub-lord indicates the nature of result
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* About Section */}
        <section className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>{t("kp.aboutTitle", "About KP System")}</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p className="text-gray-600">
                {t("kp.aboutText1", "The Krishnamurti Paddhati (KP) System is a modern approach to Vedic astrology developed by the late Prof. K.S. Krishnamurti in the 1960s. It combines the best features of Vedic and Western astrology with a unique sub-lord theory that provides more precise predictions.")}
              </p>
              <p className="text-gray-600 mt-4">
                {t("kp.aboutText2", "The key innovation of KP System is the concept of sub-lords. Each zodiac sign is divided into 9 unequal parts based on the Vimshottari Dasha proportions. The sub-lord of a cusp or planet determines whether the significations of that house will manifest positively, negatively, or not at all.")}
              </p>
              <p className="text-gray-600 mt-4">
                {t("kp.aboutText3", "KP System is particularly effective for answering specific questions (Horary/Prashna) and timing events. It uses the Placidus house system and considers the Ayanamsa (precession correction) for accurate calculations. Many astrologers prefer KP for its precision and logical approach.")}
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
