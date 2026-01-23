"use client";

import { useState } from "react";
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
  Sparkles,
  Grid3X3,
} from "lucide-react";

interface BirthDetails {
  name: string;
  date: string;
  time: string;
  place: string;
}

interface PlanetPosition {
  sign: string;
  sign_sanskrit: string;
  sign_index: number;
}

interface DivisionalCharts {
  D1_Rashi: Record<string, { sign: string; sign_sanskrit: string; degree?: number }>;
  D9_Navamsa: Record<string, PlanetPosition>;
  D10_Dasamsa: Record<string, PlanetPosition>;
  D7_Saptamsa: Record<string, PlanetPosition>;
  D12_Dwadasamsa: Record<string, PlanetPosition>;
  D24_Chaturvimsamsa: Record<string, PlanetPosition>;
}

interface ChartResult {
  birth_details: {
    date: string;
    time: string;
    place: string;
  };
  rashi_chart: {
    ascendant: string;
    planets: Array<{
      name: string;
      sign: string;
      house: number;
      degree: number;
    }>;
  };
  divisional_charts: DivisionalCharts;
}

const CHART_KEYS = ["D1_Rashi", "D9_Navamsa", "D10_Dasamsa", "D7_Saptamsa", "D12_Dwadasamsa", "D24_Chaturvimsamsa"] as const;

const PLANETS = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu", "Ascendant"];

export default function NavamsaChartPage() {
  const { t } = useLanguage();
  const [birthDetails, setBirthDetails] = useState<BirthDetails>({
    name: "",
    date: "",
    time: "",
    place: "",
  });
  const [chartResult, setChartResult] = useState<ChartResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState("");
  const [activeChart, setActiveChart] = useState("D9_Navamsa");

  const chartDescriptions: Record<string, { name: string; purpose: string }> = {
    D1_Rashi: {
      name: t('calculator.navamsa.rashiChart', 'Rashi Chart (D-1)'),
      purpose: t('calculator.navamsa.rashiChartDesc', 'Main birth chart showing overall life patterns and personality'),
    },
    D9_Navamsa: {
      name: t('calculator.navamsa.navamsaChart', 'Navamsa Chart (D-9)'),
      purpose: t('calculator.navamsa.navamsaChartDesc', 'Marriage, spouse, dharma, and spiritual path. Most important divisional chart.'),
    },
    D10_Dasamsa: {
      name: t('calculator.navamsa.dasamsaChart', 'Dasamsa Chart (D-10)'),
      purpose: t('calculator.navamsa.dasamsaChartDesc', 'Career, profession, status, and achievements in society'),
    },
    D7_Saptamsa: {
      name: t('calculator.navamsa.saptamsaChart', 'Saptamsa Chart (D-7)'),
      purpose: t('calculator.navamsa.saptamsaChartDesc', 'Children, progeny, and creative abilities'),
    },
    D12_Dwadasamsa: {
      name: t('calculator.navamsa.dwadasamsaChart', 'Dwadasamsa Chart (D-12)'),
      purpose: t('calculator.navamsa.dwadasamsaChartDesc', 'Parents, ancestry, and karmic inheritance'),
    },
    D24_Chaturvimsamsa: {
      name: t('calculator.navamsa.chaturvimsamsaChart', 'Chaturvimsamsa Chart (D-24)'),
      purpose: t('calculator.navamsa.chaturvimsamsaChartDesc', 'Education, learning, and academic achievements'),
    },
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCalculating(true);
    setError("");

    try {
      const response = await fetch("/api/calculate-divisional", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: birthDetails.name,
          birth_date: birthDetails.date,
          birth_time: birthDetails.time,
          birth_place: birthDetails.place,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to calculate divisional charts");
      }

      const data = await response.json();
      setChartResult(data);
    } catch (err) {
      console.error("Error calculating charts:", err);
      setError("Unable to calculate charts. Please check your birth details and try again.");
    } finally {
      setIsCalculating(false);
    }
  };

  const renderChartTable = (chartKey: string) => {
    if (!chartResult) return null;
    
    const chart = chartResult.divisional_charts[chartKey as keyof DivisionalCharts];
    if (!chart) return null;

    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-amber-50">
              <th className="border border-amber-200 px-4 py-2 text-left">{t('calculator.planet', 'Planet')}</th>
              <th className="border border-amber-200 px-4 py-2 text-left">{t('calculator.sign', 'Sign')}</th>
              <th className="border border-amber-200 px-4 py-2 text-left">{t('calculator.sanskrit', 'Sanskrit')}</th>
            </tr>
          </thead>
          <tbody>
            {PLANETS.map((planet) => {
              const position = chart[planet];
              if (!position) return null;
              return (
                <tr key={planet} className="hover:bg-amber-50/50">
                  <td className="border border-amber-200 px-4 py-2 font-medium">{planet}</td>
                  <td className="border border-amber-200 px-4 py-2">{position.sign}</td>
                  <td className="border border-amber-200 px-4 py-2 text-gray-600">
                    {position.sign_sanskrit}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="py-12 lg:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-amber-100 text-amber-800">{t('calculator.advancedFeature', 'Advanced Feature')}</Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {t('calculator.navamsa.title', 'Navamsa & Divisional Charts')}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('calculator.navamsa.subtitle', 'Calculate your Navamsa (D-9) and other divisional charts (Vargas). These charts reveal deeper insights into specific life areas like marriage, career, children, and education.')}
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
                {t('calculator.navamsa.birthTimeNote', 'Accurate birth time is essential for divisional chart calculations')}
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
                  <p className="text-xs text-amber-600">
                    {t('calculator.navamsa.timeWarning', 'Even a few minutes difference can change divisional chart positions')}
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

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-amber-600 hover:bg-amber-700"
                  disabled={isCalculating}
                >
                  {isCalculating ? (
                    <>
                      <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                      {t('calculator.calculating', 'Calculating...')}
                    </>
                  ) : (
                    <>
                      <Grid3X3 className="w-4 h-4 mr-2" />
                      {t('calculator.navamsa.calculateCharts', 'Calculate Charts')}
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 p-4 bg-amber-50 rounded-lg">
                <h3 className="font-semibold text-amber-900 mb-2">{t('calculator.navamsa.whyImportant', 'Why Navamsa is Important')}</h3>
                <p className="text-sm text-amber-800">
                  {t('calculator.navamsa.whyImportantDesc', 'The Navamsa chart (D-9) is considered the second most important chart after the birth chart. It reveals the true strength of planets and is essential for marriage predictions, understanding spouse characteristics, and assessing spiritual development.')}
                </p>
              </div>
            </CardContent>
          </Card>

          {chartResult ? (
            <Card className="border-amber-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Grid3X3 className="w-5 h-5 text-amber-600" />
                  {t('calculator.navamsa.divisionalCharts', 'Divisional Charts')}
                </CardTitle>
                <CardDescription>
                  For {birthDetails.name} - {birthDetails.date}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeChart} onValueChange={setActiveChart}>
                  <TabsList className="grid grid-cols-3 mb-4">
                    <TabsTrigger value="D9_Navamsa">D-9</TabsTrigger>
                    <TabsTrigger value="D10_Dasamsa">D-10</TabsTrigger>
                    <TabsTrigger value="D7_Saptamsa">D-7</TabsTrigger>
                  </TabsList>
                  <TabsList className="grid grid-cols-3 mb-4">
                    <TabsTrigger value="D12_Dwadasamsa">D-12</TabsTrigger>
                    <TabsTrigger value="D24_Chaturvimsamsa">D-24</TabsTrigger>
                    <TabsTrigger value="D1_Rashi">D-1</TabsTrigger>
                  </TabsList>

                  {Object.keys(chartDescriptions).map((chartKey) => (
                    <TabsContent key={chartKey} value={chartKey}>
                      <div className="mb-4 p-3 bg-amber-50 rounded-lg">
                        <h4 className="font-semibold text-amber-900">
                          {chartDescriptions[chartKey].name}
                        </h4>
                        <p className="text-sm text-amber-700">
                          {chartDescriptions[chartKey].purpose}
                        </p>
                      </div>
                      {renderChartTable(chartKey)}
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-amber-200 flex items-center justify-center min-h-[400px]">
              <CardContent className="text-center py-12">
                <Grid3X3 className="w-16 h-16 text-amber-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  {t('calculator.enterBirthDetails', 'Enter Your Birth Details')}
                </h3>
                <p className="text-gray-500 max-w-sm">
                  {t('calculator.navamsa.resultPlaceholderDesc', 'Fill in the form to calculate your Navamsa and other divisional charts for deeper astrological insights.')}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(chartDescriptions).map(([key, info]) => (
            <Card key={key}>
              <CardHeader>
                <CardTitle className="text-lg">{info.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">{info.purpose}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
