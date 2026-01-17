"use client";

import { useState, useRef, useEffect } from "react";
import { Metadata } from "next";
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
  Check,
  Copy,
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

async function fetchChartFromBackend(details: BirthDetails): Promise<ChartData> {
  try {
    const response = await fetch("/api/calculate-chart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: details.name,
        birth_date: details.date,
        birth_time: details.time,
        birth_place: details.place,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to calculate chart");
    }

    const data = await response.json();
    const chartData = data.chart_data;

    const ascIndex = zodiacSigns.findIndex(s => s === chartData.ascendant);
    
    const planets = chartData.planets?.map((p: { name: string; sign: string; house: number; longitude: number; nakshatra: string; is_retrograde: boolean }) => ({
      name: p.name,
      sign: p.sign,
      house: p.house,
      degree: `${Math.floor(p.longitude % 30)}°${Math.floor((p.longitude % 1) * 60)}'`,
      nakshatra: p.nakshatra || nakshatras[Math.floor((p.longitude / 360) * 27) % 27],
      retrograde: p.is_retrograde || false,
    })) || [];

    const houses = Array.from({ length: 12 }, (_, i) => ({
      number: i + 1,
      sign: zodiacSigns[(ascIndex + i) % 12],
      planets: planets.filter((p: { house: number }) => p.house === i + 1).map((p: { name: string }) => p.name),
    }));

    return {
      ascendant: chartData.ascendant,
      moonSign: chartData.moon_sign,
      sunSign: chartData.sun_sign,
      nakshatra: chartData.nakshatra,
      planets,
      houses,
    };
  } catch (error) {
    console.error("Error fetching chart:", error);
    throw error;
  }
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
  const { t } = useLanguage();
  const [birthDetails, setBirthDetails] = useState<BirthDetails>({
    name: "",
    date: "",
    time: "",
    place: "",
  });
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const name = params.get('name');
      const date = params.get('date');
      const time = params.get('time');
      const place = params.get('place');
      
      if (name && date && time && place) {
        const details = { name, date, time, place };
        setBirthDetails(details);
        fetchChartFromBackend(details)
          .then(chart => setChartData(chart))
          .catch(err => {
            console.error("Error loading chart from URL:", err);
            setError("Unable to load chart. Please try again.");
          });
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCalculating(true);
    setError("");
    
    try {
      const chart = await fetchChartFromBackend(birthDetails);
      setChartData(chart);
      setShareUrl(null);
    } catch (err) {
      console.error("Error calculating chart:", err);
      setError("Unable to calculate chart. Please check your birth details and try again.");
    } finally {
      setIsCalculating(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!chartRef.current || !chartData) return;
    
    setIsGeneratingPdf(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;
      
      const canvas = await html2canvas(chartRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      pdf.setFontSize(20);
      pdf.setTextColor(217, 119, 6);
      pdf.text('VedicStarAstro - Birth Chart', pageWidth / 2, 20, { align: 'center' });
      
      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Name: ${birthDetails.name}`, 20, 35);
      pdf.text(`Date of Birth: ${birthDetails.date}`, 20, 42);
      pdf.text(`Time of Birth: ${birthDetails.time}`, 20, 49);
      pdf.text(`Place of Birth: ${birthDetails.place}`, 20, 56);
      
      const imgWidth = pageWidth - 40;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 20, 65, imgWidth, Math.min(imgHeight, pageHeight - 100));
      
      pdf.setFontSize(10);
      pdf.setTextColor(128, 128, 128);
      pdf.text('Generated by VedicStarAstro.com', pageWidth / 2, pageHeight - 10, { align: 'center' });
      
      pdf.save(`kundli-${birthDetails.name.replace(/\s+/g, '-').toLowerCase()}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleShare = () => {
    const params = new URLSearchParams({
      name: birthDetails.name,
      date: birthDetails.date,
      time: birthDetails.time,
      place: birthDetails.place,
    });
    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    setShareUrl(url);
  };

  const handleCopyLink = async () => {
    if (shareUrl) {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="py-12 lg:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-green-100 text-green-800">{t('calculator.freeTool', 'Free Tool')}</Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {t('calculator.kundli.title', 'Free Kundli Calculator')}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('calculator.kundli.subtitle', 'Generate your complete Vedic birth chart (Janam Kundli) instantly. Get detailed planetary positions, house placements, Nakshatra information, and Dosha analysis.')}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="border-amber-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-amber-600" />
                {t('calculator.enterBirthDetails', 'Enter Birth Details')}
              </CardTitle>
              <CardDescription>
                {t('calculator.birthDetailsDesc', 'Provide accurate birth information for precise calculations')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('calculator.fullName', 'Full Name')}</Label>
                  <Input
                    id="name"
                    placeholder={t('calculator.enterName', 'Enter your name')}
                    value={birthDetails.name}
                    onChange={(e) => setBirthDetails({ ...birthDetails, name: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="date" className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {t('calculator.dateOfBirth', 'Date of Birth')}
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
                    {t('calculator.timeOfBirth', 'Time of Birth')}
                  </Label>
                  <Input
                    id="time"
                    type="time"
                    value={birthDetails.time}
                    onChange={(e) => setBirthDetails({ ...birthDetails, time: e.target.value })}
                    required
                  />
                  <p className="text-xs text-gray-500">
                    {t('calculator.timeNote', 'Accurate birth time is crucial for precise Ascendant calculation')}
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
                    value={birthDetails.place}
                    onChange={(e) => setBirthDetails({ ...birthDetails, place: e.target.value })}
                    onLocationSelect={(loc) => setBirthDetails({ ...birthDetails, place: loc })}
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
                      {t('calculator.calculating', 'Calculating...')}
                    </>
                  ) : (
                    <>
                      <Calculator className="w-4 h-4 mr-2" />
                      {t('calculator.kundli.generate', 'Generate Kundli')}
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
                    {t('calculator.kundli.yourBirthChart', 'Your Birth Chart')}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={handleDownloadPdf}
                      disabled={isGeneratingPdf}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      {isGeneratingPdf ? t('calculator.generating', 'Generating...') : t('calculator.pdf', 'PDF')}
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleShare}>
                      <Share2 className="w-4 h-4 mr-1" />
                      {t('calculator.share', 'Share')}
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  {t('calculator.kundli.kundliFor', 'Kundli for')} {birthDetails.name}
                </CardDescription>
                {shareUrl && (
                  <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-sm text-green-800 font-medium mb-2">{t('calculator.shareableLink', 'Shareable Link:')}</div>
                    <div className="flex gap-2">
                      <Input 
                        value={shareUrl} 
                        readOnly 
                        className="text-xs bg-white"
                      />
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={handleCopyLink}
                        className="shrink-0"
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div ref={chartRef}>
                  <KundliChart chart={chartData} />
                  
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="bg-amber-50 rounded-lg p-3">
                      <div className="text-sm text-gray-600">{t('calculator.ascendantLagna', 'Ascendant (Lagna)')}</div>
                      <div className="font-semibold text-amber-700">{chartData.ascendant}</div>
                    </div>
                    <div className="bg-amber-50 rounded-lg p-3">
                      <div className="text-sm text-gray-600">{t('calculator.moonSignRashi', 'Moon Sign (Rashi)')}</div>
                      <div className="font-semibold text-amber-700">{chartData.moonSign}</div>
                    </div>
                    <div className="bg-amber-50 rounded-lg p-3">
                      <div className="text-sm text-gray-600">{t('calculator.sunSign', 'Sun Sign')}</div>
                      <div className="font-semibold text-amber-700">{chartData.sunSign}</div>
                    </div>
                    <div className="bg-amber-50 rounded-lg p-3">
                      <div className="text-sm text-gray-600">{t('calculator.nakshatra', 'Nakshatra')}</div>
                      <div className="font-semibold text-amber-700">{chartData.nakshatra}</div>
                    </div>
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
                  {t('calculator.kundli.resultPlaceholder', 'Your Kundli Will Appear Here')}
                </h3>
                <p className="text-gray-600 text-center max-w-xs">
                  {t('calculator.kundli.resultPlaceholderDesc', 'Enter your birth details and click "Generate Kundli" to see your complete birth chart with planetary positions.')}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {chartData && (
          <div className="mt-8">
            <Tabs defaultValue="planets" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="planets">{t('calculator.kundli.planetaryPositions', 'Planetary Positions')}</TabsTrigger>
                <TabsTrigger value="houses">{t('calculator.kundli.houseAnalysis', 'House Analysis')}</TabsTrigger>
                <TabsTrigger value="doshas">{t('calculator.kundli.doshaCheck', 'Dosha Check')}</TabsTrigger>
              </TabsList>
              
              <TabsContent value="planets" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('calculator.kundli.planetaryPositionsTitle', 'Planetary Positions (Graha Sthiti)')}</CardTitle>
                    <CardDescription>
                      {t('calculator.kundli.planetaryPositionsDesc', 'Detailed positions of all nine planets in your birth chart')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-amber-50">
                            <th className="px-4 py-2 text-left">{t('calculator.planet', 'Planet')}</th>
                            <th className="px-4 py-2 text-left">{t('calculator.sign', 'Sign')}</th>
                            <th className="px-4 py-2 text-left">{t('calculator.house', 'House')}</th>
                            <th className="px-4 py-2 text-left">{t('calculator.degree', 'Degree')}</th>
                            <th className="px-4 py-2 text-left">{t('calculator.nakshatra', 'Nakshatra')}</th>
                            <th className="px-4 py-2 text-left">{t('calculator.status', 'Status')}</th>
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
                                    {t('calculator.retrograde', 'Retrograde')}
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-green-600 border-green-200">
                                    {t('calculator.direct', 'Direct')}
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
                    <CardTitle>{t('calculator.kundli.houseAnalysisTitle', 'House Analysis (Bhava Vichar)')}</CardTitle>
                    <CardDescription>
                      {t('calculator.kundli.houseAnalysisDesc', 'Analysis of all 12 houses and their planetary occupants')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {chartData.houses.map((house) => (
                        <div key={house.number} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-amber-700">
                              {t('calculator.house', 'House')} {house.number}
                            </span>
                            <Badge variant="outline">{house.sign}</Badge>
                          </div>
                          <div className="text-sm text-gray-600">
                            {house.planets.length > 0 ? (
                              <span>{t('calculator.planets', 'Planets')}: {house.planets.join(", ")}</span>
                            ) : (
                              <span className="text-gray-400">{t('calculator.empty', 'Empty')}</span>
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
                    <CardTitle>{t('calculator.kundli.doshaAnalysis', 'Dosha Analysis')}</CardTitle>
                    <CardDescription>
                      {t('calculator.kundli.doshaAnalysisDesc', 'Check for common doshas in your birth chart')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <span className="font-semibold text-green-800">{t('calculator.kundli.mangalDosha', 'Mangal Dosha')}</span>
                        </div>
                        <p className="text-sm text-green-700">
                          {t('calculator.kundli.mangalDoshaResult', 'Based on Mars position in House')} {chartData.planets.find(p => p.name === "Mars")?.house}, 
                          {t('calculator.kundli.mangalDoshaNotPresent', 'Mangal Dosha is not present in your chart.')}
                        </p>
                      </div>
                      
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                          <span className="font-semibold text-amber-800">{t('calculator.kundli.kaalSarpDosha', 'Kaal Sarp Dosha')}</span>
                        </div>
                        <p className="text-sm text-amber-700">
                          {t('calculator.kundli.kaalSarpDoshaResult', 'Partial Kaal Sarp Yoga may be present. Consult an astrologer for detailed analysis.')}
                        </p>
                      </div>
                      
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                          <span className="font-semibold text-blue-800">{t('calculator.kundli.sadeSatiStatus', 'Sade Sati Status')}</span>
                        </div>
                        <p className="text-sm text-blue-700">
                          {t('calculator.kundli.sadeSatiResult', 'Based on your Moon sign')} ({chartData.moonSign}), {t('calculator.kundli.sadeSatiCheck', 'check current Saturn transit for Sade Sati status.')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">
                        <strong>{t('calculator.note', 'Note')}:</strong> {t('calculator.kundli.doshaNote', 'This is a basic dosha analysis. For comprehensive dosha evaluation and personalized remedies, please consult with our expert astrologers.')}
                      </p>
                      <Button className="mt-4" asChild>
                        <Link href="/consultation">{t('calculator.kundli.bookDetailedConsultation', 'Book Detailed Consultation')}</Link>
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
            {t('calculator.kundli.aboutTitle', 'About Our Kundli Calculator')}
          </h2>
          <div className="prose prose-amber max-w-none">
            <p className="text-gray-700 mb-4">
              {t('calculator.kundli.aboutDesc', 'Our free Kundli calculator uses the Lahiri Ayanamsa and follows the North Indian chart style (also known as the diamond chart). The calculations are based on the Swiss Ephemeris for accurate planetary positions.')}
            </p>
            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-2">{t('calculator.kundli.whatYouGet', 'What You Get:')}</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>{t('calculator.kundli.feature1', 'Complete birth chart (Rashi chart/D-1)')}</li>
              <li>{t('calculator.kundli.feature2', 'Planetary positions with degrees and Nakshatras')}</li>
              <li>{t('calculator.kundli.feature3', 'House-wise planet placement')}</li>
              <li>{t('calculator.kundli.feature4', 'Basic Dosha analysis (Mangal, Kaal Sarp)')}</li>
              <li>{t('calculator.kundli.feature5', 'Ascendant, Moon sign, and Sun sign')}</li>
              <li>{t('calculator.kundli.feature6', 'Downloadable PDF report')}</li>
              <li>{t('calculator.kundli.feature7', 'Shareable chart link')}</li>
            </ul>
            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-2">{t('calculator.kundli.forDetailedAnalysis', 'For Detailed Analysis:')}</h3>
            <p className="text-gray-700">
              {t('calculator.kundli.detailedAnalysisDesc', 'While this free tool provides accurate basic calculations, for in-depth analysis including Dasha predictions, Yoga analysis, marriage compatibility, career guidance, and personalized remedies, we recommend consulting with our expert astrologers.')}
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-4">
            <Button asChild>
              <Link href="/consultation">{t('calculator.kundli.bookExpertConsultation', 'Book Expert Consultation')}</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/vedic-astrology-guide-complete-2025">{t('calculator.kundli.learnKundliReading', 'Learn Kundli Reading')}</Link>
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
