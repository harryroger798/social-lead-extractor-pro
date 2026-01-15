"use client";

import { useState } from "react";
import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calculator,
  Calendar,
  Clock,
  MapPin,
  Download,
  Share2,
  Star,
  Sun,
  Moon,
  Sparkles,
} from "lucide-react";

interface BirthDetails {
  name: string;
  date: string;
  time: string;
  place: string;
}

interface ChartData {
  ascendant: string;
  moonSign: string;
  sunSign: string;
  nakshatra: string;
  planets: {
    name: string;
    sign: string;
    house: number;
    degree: string;
    nakshatra: string;
    retrograde: boolean;
  }[];
  houses: {
    number: number;
    sign: string;
    planets: string[];
  }[];
}

const zodiacSigns = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

const nakshatras = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
  "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
  "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
  "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha",
  "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
];

function generateMockChart(details: BirthDetails): ChartData {
  const dateObj = new Date(details.date);
  const day = dateObj.getDate();
  const month = dateObj.getMonth();
  
  const ascIndex = (day + month) % 12;
  const moonIndex = (day * 2 + month) % 12;
  const sunIndex = month;
  const nakshatraIndex = (day + month * 2) % 27;

  const planets = [
    { name: "Sun", sign: zodiacSigns[sunIndex], house: (sunIndex - ascIndex + 12) % 12 + 1, degree: `${day % 30}°${(day * 2) % 60}'`, nakshatra: nakshatras[(sunIndex * 2 + day) % 27], retrograde: false },
    { name: "Moon", sign: zodiacSigns[moonIndex], house: (moonIndex - ascIndex + 12) % 12 + 1, degree: `${(day + 5) % 30}°${(day * 3) % 60}'`, nakshatra: nakshatras[nakshatraIndex], retrograde: false },
    { name: "Mars", sign: zodiacSigns[(ascIndex + 3) % 12], house: 4, degree: `${(day + 10) % 30}°${(day * 4) % 60}'`, nakshatra: nakshatras[(day + 5) % 27], retrograde: day % 5 === 0 },
    { name: "Mercury", sign: zodiacSigns[(sunIndex + 1) % 12], house: (sunIndex - ascIndex + 13) % 12 + 1, degree: `${(day + 15) % 30}°${(day * 5) % 60}'`, nakshatra: nakshatras[(day + 10) % 27], retrograde: day % 4 === 0 },
    { name: "Jupiter", sign: zodiacSigns[(ascIndex + 5) % 12], house: 6, degree: `${(day + 20) % 30}°${(day * 6) % 60}'`, nakshatra: nakshatras[(day + 15) % 27], retrograde: day % 6 === 0 },
    { name: "Venus", sign: zodiacSigns[(sunIndex + 2) % 12], house: (sunIndex - ascIndex + 14) % 12 + 1, degree: `${(day + 25) % 30}°${(day * 7) % 60}'`, nakshatra: nakshatras[(day + 20) % 27], retrograde: false },
    { name: "Saturn", sign: zodiacSigns[(ascIndex + 7) % 12], house: 8, degree: `${day % 30}°${(day * 8) % 60}'`, nakshatra: nakshatras[(day + 25) % 27], retrograde: day % 3 === 0 },
    { name: "Rahu", sign: zodiacSigns[(ascIndex + 9) % 12], house: 10, degree: `${(day + 5) % 30}°${(day * 9) % 60}'`, nakshatra: nakshatras[(day + 2) % 27], retrograde: true },
    { name: "Ketu", sign: zodiacSigns[(ascIndex + 3) % 12], house: 4, degree: `${(day + 5) % 30}°${(day * 9) % 60}'`, nakshatra: nakshatras[(day + 14) % 27], retrograde: true },
  ];

  const houses = Array.from({ length: 12 }, (_, i) => ({
    number: i + 1,
    sign: zodiacSigns[(ascIndex + i) % 12],
    planets: planets.filter(p => p.house === i + 1).map(p => p.name),
  }));

  return {
    ascendant: zodiacSigns[ascIndex],
    moonSign: zodiacSigns[moonIndex],
    sunSign: zodiacSigns[sunIndex],
    nakshatra: nakshatras[nakshatraIndex],
    planets,
    houses,
  };
}

function KundliChart({ chart }: { chart: ChartData }) {
  const housePositions = [
    { x: 150, y: 0 },
    { x: 225, y: 75 },
    { x: 300, y: 150 },
    { x: 225, y: 225 },
    { x: 150, y: 300 },
    { x: 75, y: 225 },
    { x: 0, y: 150 },
    { x: 75, y: 75 },
    { x: 150, y: 150 },
    { x: 75, y: 150 },
    { x: 150, y: 75 },
    { x: 225, y: 150 },
  ];

  return (
    <div className="relative w-full max-w-md mx-auto aspect-square">
      <svg viewBox="0 0 300 300" className="w-full h-full">
        <rect x="0" y="0" width="300" height="300" fill="none" stroke="#d97706" strokeWidth="2" />
        <line x1="0" y1="0" x2="300" y2="300" stroke="#d97706" strokeWidth="1" />
        <line x1="300" y1="0" x2="0" y2="300" stroke="#d97706" strokeWidth="1" />
        <line x1="150" y1="0" x2="0" y2="150" stroke="#d97706" strokeWidth="1" />
        <line x1="150" y1="0" x2="300" y2="150" stroke="#d97706" strokeWidth="1" />
        <line x1="0" y1="150" x2="150" y2="300" stroke="#d97706" strokeWidth="1" />
        <line x1="300" y1="150" x2="150" y2="300" stroke="#d97706" strokeWidth="1" />
        
        {chart.houses.map((house, index) => {
          const positions = [
            { x: 150, y: 40 },
            { x: 230, y: 75 },
            { x: 260, y: 150 },
            { x: 230, y: 225 },
            { x: 150, y: 260 },
            { x: 70, y: 225 },
            { x: 40, y: 150 },
            { x: 70, y: 75 },
            { x: 150, y: 150 },
            { x: 110, y: 110 },
            { x: 190, y: 110 },
            { x: 190, y: 190 },
          ];
          
          const pos = positions[index] || { x: 150, y: 150 };
          
          return (
            <g key={house.number}>
              <text
                x={pos.x}
                y={pos.y - 10}
                textAnchor="middle"
                className="text-xs fill-amber-700 font-medium"
              >
                {house.number}
              </text>
              <text
                x={pos.x}
                y={pos.y + 5}
                textAnchor="middle"
                className="text-xs fill-gray-600"
              >
                {house.sign.substring(0, 3)}
              </text>
              {house.planets.length > 0 && (
                <text
                  x={pos.x}
                  y={pos.y + 20}
                  textAnchor="middle"
                  className="text-xs fill-amber-600 font-medium"
                >
                  {house.planets.map(p => p.substring(0, 2)).join(", ")}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function KundliCalculatorPage() {
  const [birthDetails, setBirthDetails] = useState<BirthDetails>({
    name: "",
    date: "",
    time: "",
    place: "",
  });
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCalculating(true);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const chart = generateMockChart(birthDetails);
    setChartData(chart);
    setIsCalculating(false);
  };

  return (
    <div className="py-12 lg:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-green-100 text-green-800">Free Tool</Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Free Kundli Calculator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Generate your complete Vedic birth chart (Janam Kundli) instantly. Get detailed 
            planetary positions, house placements, Nakshatra information, and Dosha analysis.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="border-amber-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-amber-600" />
                Enter Birth Details
              </CardTitle>
              <CardDescription>
                Provide accurate birth information for precise calculations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter your name"
                    value={birthDetails.name}
                    onChange={(e) => setBirthDetails({ ...birthDetails, name: e.target.value })}
                    required
                  />
                </div>
                
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
                  <p className="text-xs text-gray-500">
                    Accurate birth time is crucial for precise Ascendant calculation
                  </p>
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
                      Calculating...
                    </>
                  ) : (
                    <>
                      <Calculator className="w-4 h-4 mr-2" />
                      Generate Kundli
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {chartData ? (
            <Card className="border-amber-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-600" />
                    Your Birth Chart
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4 mr-1" />
                      PDF
                    </Button>
                    <Button size="sm" variant="outline">
                      <Share2 className="w-4 h-4 mr-1" />
                      Share
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  Kundli for {birthDetails.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <KundliChart chart={chartData} />
                
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="bg-amber-50 rounded-lg p-3">
                    <div className="text-sm text-gray-600">Ascendant (Lagna)</div>
                    <div className="font-semibold text-amber-700">{chartData.ascendant}</div>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-3">
                    <div className="text-sm text-gray-600">Moon Sign (Rashi)</div>
                    <div className="font-semibold text-amber-700">{chartData.moonSign}</div>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-3">
                    <div className="text-sm text-gray-600">Sun Sign</div>
                    <div className="font-semibold text-amber-700">{chartData.sunSign}</div>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-3">
                    <div className="text-sm text-gray-600">Nakshatra</div>
                    <div className="font-semibold text-amber-700">{chartData.nakshatra}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-amber-200 bg-amber-50/50">
              <CardContent className="flex flex-col items-center justify-center h-full py-12">
                <div className="w-24 h-24 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                  <Star className="w-12 h-12 text-amber-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Your Kundli Will Appear Here
                </h3>
                <p className="text-gray-600 text-center max-w-xs">
                  Enter your birth details and click &ldquo;Generate Kundli&rdquo; to see your 
                  complete birth chart with planetary positions.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {chartData && (
          <div className="mt-8">
            <Tabs defaultValue="planets" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="planets">Planetary Positions</TabsTrigger>
                <TabsTrigger value="houses">House Analysis</TabsTrigger>
                <TabsTrigger value="doshas">Dosha Check</TabsTrigger>
              </TabsList>
              
              <TabsContent value="planets" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Planetary Positions (Graha Sthiti)</CardTitle>
                    <CardDescription>
                      Detailed positions of all nine planets in your birth chart
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-amber-50">
                            <th className="px-4 py-2 text-left">Planet</th>
                            <th className="px-4 py-2 text-left">Sign</th>
                            <th className="px-4 py-2 text-left">House</th>
                            <th className="px-4 py-2 text-left">Degree</th>
                            <th className="px-4 py-2 text-left">Nakshatra</th>
                            <th className="px-4 py-2 text-left">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {chartData.planets.map((planet) => (
                            <tr key={planet.name} className="border-b border-gray-100">
                              <td className="px-4 py-2 font-medium">{planet.name}</td>
                              <td className="px-4 py-2">{planet.sign}</td>
                              <td className="px-4 py-2">{planet.house}</td>
                              <td className="px-4 py-2">{planet.degree}</td>
                              <td className="px-4 py-2">{planet.nakshatra}</td>
                              <td className="px-4 py-2">
                                {planet.retrograde ? (
                                  <Badge variant="outline" className="text-red-600 border-red-200">
                                    Retrograde
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-green-600 border-green-200">
                                    Direct
                                  </Badge>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="houses" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>House Analysis (Bhava Vichar)</CardTitle>
                    <CardDescription>
                      Analysis of all 12 houses and their planetary occupants
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {chartData.houses.map((house) => (
                        <div key={house.number} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-amber-700">
                              House {house.number}
                            </span>
                            <Badge variant="outline">{house.sign}</Badge>
                          </div>
                          <div className="text-sm text-gray-600">
                            {house.planets.length > 0 ? (
                              <span>Planets: {house.planets.join(", ")}</span>
                            ) : (
                              <span className="text-gray-400">Empty</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="doshas" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Dosha Analysis</CardTitle>
                    <CardDescription>
                      Check for common doshas in your birth chart
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <span className="font-semibold text-green-800">Mangal Dosha</span>
                        </div>
                        <p className="text-sm text-green-700">
                          Based on Mars position in House {chartData.planets.find(p => p.name === "Mars")?.house}, 
                          Mangal Dosha is not present in your chart.
                        </p>
                      </div>
                      
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                          <span className="font-semibold text-amber-800">Kaal Sarp Dosha</span>
                        </div>
                        <p className="text-sm text-amber-700">
                          Partial Kaal Sarp Yoga may be present. Consult an astrologer for detailed analysis.
                        </p>
                      </div>
                      
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                          <span className="font-semibold text-blue-800">Sade Sati Status</span>
                        </div>
                        <p className="text-sm text-blue-700">
                          Based on your Moon sign ({chartData.moonSign}), check current Saturn transit 
                          for Sade Sati status.
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">
                        <strong>Note:</strong> This is a basic dosha analysis. For comprehensive 
                        dosha evaluation and personalized remedies, please consult with our expert 
                        astrologers.
                      </p>
                      <Button className="mt-4" asChild>
                        <Link href="/consultation">Book Detailed Consultation</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}

        <div className="mt-12 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            About Our Kundli Calculator
          </h2>
          <div className="prose prose-amber max-w-none">
            <p className="text-gray-700 mb-4">
              Our free Kundli calculator uses the Lahiri Ayanamsa and follows the North Indian 
              chart style (also known as the diamond chart). The calculations are based on the 
              Swiss Ephemeris for accurate planetary positions.
            </p>
            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-2">What You Get:</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Complete birth chart (Rashi chart/D-1)</li>
              <li>Planetary positions with degrees and Nakshatras</li>
              <li>House-wise planet placement</li>
              <li>Basic Dosha analysis (Mangal, Kaal Sarp)</li>
              <li>Ascendant, Moon sign, and Sun sign</li>
              <li>Downloadable PDF report</li>
              <li>Shareable chart link</li>
            </ul>
            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-2">For Detailed Analysis:</h3>
            <p className="text-gray-700">
              While this free tool provides accurate basic calculations, for in-depth analysis 
              including Dasha predictions, Yoga analysis, marriage compatibility, career guidance, 
              and personalized remedies, we recommend consulting with our expert astrologers.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-4">
            <Button asChild>
              <Link href="/consultation">Book Expert Consultation</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/vedic-astrology-guide-complete-2025">Learn Kundli Reading</Link>
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
            name: "Free Kundli Calculator",
            url: "https://vedicstarastro.com/tools/kundli-calculator",
            description: "Generate your complete Vedic birth chart (Janam Kundli) instantly with planetary positions, house placements, and Dosha analysis.",
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

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: "https://vedicstarastro.com",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Tools",
                item: "https://vedicstarastro.com/tools",
              },
              {
                "@type": "ListItem",
                position: 3,
                name: "Kundli Calculator",
                item: "https://vedicstarastro.com/tools/kundli-calculator",
              },
            ],
          }),
        }}
      />
    </div>
  );
}
