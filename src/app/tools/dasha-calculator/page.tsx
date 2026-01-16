"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { LocationInput } from "@/components/ui/location-input";
import {
  Calculator,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

interface BirthDetails {
  name: string;
  date: string;
  time: string;
  place: string;
}

interface Antardasha {
  planet: string;
  start_date: string;
  end_date: string;
  duration_years: number;
  duration_months: number;
  is_current: boolean;
}

interface Mahadasha {
  planet: string;
  start_date: string;
  end_date: string;
  duration_years: number;
  is_current: boolean;
  antardashas: Antardasha[];
}

interface DashaData {
  mahadashas: Mahadasha[];
  current_mahadasha: Mahadasha | null;
  birth_nakshatra: string;
  birth_nakshatra_lord: string;
  total_cycle_years: number;
}

interface DashaResult {
  birth_details: {
    date: string;
    time: string;
    place: string;
  };
  moon_sign: string;
  nakshatra: string;
  dasha: DashaData;
}

const PLANET_COLORS: Record<string, string> = {
  Sun: "bg-orange-100 text-orange-800 border-orange-300",
  Moon: "bg-gray-100 text-gray-800 border-gray-300",
  Mars: "bg-red-100 text-red-800 border-red-300",
  Mercury: "bg-green-100 text-green-800 border-green-300",
  Jupiter: "bg-yellow-100 text-yellow-800 border-yellow-300",
  Venus: "bg-pink-100 text-pink-800 border-pink-300",
  Saturn: "bg-blue-100 text-blue-800 border-blue-300",
  Rahu: "bg-purple-100 text-purple-800 border-purple-300",
  Ketu: "bg-indigo-100 text-indigo-800 border-indigo-300",
};

const PLANET_DESCRIPTIONS: Record<string, string> = {
  Sun: "Leadership, authority, father, government, health, vitality",
  Moon: "Mind, emotions, mother, public, travel, liquids",
  Mars: "Energy, courage, siblings, property, accidents, surgery",
  Mercury: "Intelligence, communication, business, education, friends",
  Jupiter: "Wisdom, expansion, children, wealth, spirituality, teachers",
  Venus: "Love, marriage, arts, luxury, vehicles, beauty",
  Saturn: "Discipline, delays, hard work, longevity, karma, servants",
  Rahu: "Obsession, foreign, technology, unconventional, sudden gains",
  Ketu: "Spirituality, liberation, past karma, losses, mysticism",
};

function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function DashaCalculatorPage() {
  const [birthDetails, setBirthDetails] = useState<BirthDetails>({
    name: "",
    date: "",
    time: "",
    place: "",
  });
  const [dashaResult, setDashaResult] = useState<DashaResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState("");
  const [expandedDasha, setExpandedDasha] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCalculating(true);
    setError("");

    try {
      const response = await fetch("/api/calculate-dasha", {
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
        throw new Error("Failed to calculate Dasha");
      }

      const data = await response.json();
      setDashaResult(data);
      
      if (data.dasha?.current_mahadasha) {
        setExpandedDasha(data.dasha.current_mahadasha.planet);
      }
    } catch (err) {
      console.error("Error calculating Dasha:", err);
      setError("Unable to calculate Dasha. Please check your birth details and try again.");
    } finally {
      setIsCalculating(false);
    }
  };

  const toggleDasha = (planet: string) => {
    setExpandedDasha(expandedDasha === planet ? null : planet);
  };

  return (
    <div className="py-12 lg:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-purple-100 text-purple-800">Advanced Feature</Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Vimshottari Dasha Calculator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Calculate your complete Vimshottari Dasha (planetary periods) based on your Moon&apos;s 
            nakshatra position. Understand which planetary influences are active in your life.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-purple-600" />
                Enter Birth Details
              </CardTitle>
              <CardDescription>
                Provide accurate birth information for precise Dasha calculations
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="place" className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Place of Birth
                  </Label>
                  <LocationInput
                    id="place"
                    placeholder="Search city..."
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
                  className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
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
                      Calculate Dasha
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 p-4 bg-purple-50 rounded-lg">
                <h3 className="font-semibold text-purple-900 mb-2">What is Vimshottari Dasha?</h3>
                <p className="text-sm text-purple-800">
                  Vimshottari Dasha is a 120-year planetary period system in Vedic astrology. 
                  It divides life into major periods (Mahadasha) ruled by different planets, 
                  each with sub-periods (Antardasha). The starting Dasha is determined by 
                  the Moon&apos;s nakshatra at birth.
                </p>
              </div>
            </CardContent>
          </Card>

          {dashaResult ? (
            <div className="space-y-6">
              <Card className="border-purple-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    Dasha Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-500">Moon Sign</div>
                      <div className="font-semibold text-gray-900">{dashaResult.moon_sign}</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-500">Birth Nakshatra</div>
                      <div className="font-semibold text-gray-900">{dashaResult.nakshatra}</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-500">Starting Dasha Lord</div>
                      <div className="font-semibold text-gray-900">{dashaResult.dasha.birth_nakshatra_lord}</div>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <div className="text-sm text-purple-600">Current Mahadasha</div>
                      <div className="font-semibold text-purple-900">
                        {dashaResult.dasha.current_mahadasha?.planet || "N/A"}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-purple-200">
                <CardHeader>
                  <CardTitle>Mahadasha Periods</CardTitle>
                  <CardDescription>Click on a period to see Antardasha sub-periods</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {dashaResult.dasha.mahadashas.map((dasha) => (
                    <div key={dasha.planet} className="border rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleDasha(dasha.planet)}
                        className={`w-full p-4 flex items-center justify-between text-left transition-colors ${
                          dasha.is_current
                            ? "bg-purple-100 border-purple-300"
                            : "bg-white hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Badge className={PLANET_COLORS[dasha.planet] || "bg-gray-100"}>
                            {dasha.planet}
                          </Badge>
                          <div>
                            <div className="font-medium text-gray-900">
                              {formatDate(dasha.start_date)} - {formatDate(dasha.end_date)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {dasha.duration_years} years
                              {dasha.is_current && (
                                <span className="ml-2 text-purple-600 font-medium">(Current)</span>
                              )}
                            </div>
                          </div>
                        </div>
                        {expandedDasha === dasha.planet ? (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        )}
                      </button>

                      {expandedDasha === dasha.planet && (
                        <div className="p-4 bg-gray-50 border-t">
                          <div className="mb-3 p-3 bg-white rounded-lg">
                            <div className="text-sm font-medium text-gray-700 mb-1">
                              {dasha.planet} Mahadasha Significations:
                            </div>
                            <div className="text-sm text-gray-600">
                              {PLANET_DESCRIPTIONS[dasha.planet]}
                            </div>
                          </div>
                          <div className="text-sm font-medium text-gray-700 mb-2">
                            Antardasha Sub-periods:
                          </div>
                          <div className="space-y-2">
                            {dasha.antardashas.map((ad) => (
                              <div
                                key={`${dasha.planet}-${ad.planet}`}
                                className={`p-3 rounded-lg flex items-center justify-between ${
                                  ad.is_current
                                    ? "bg-purple-100 border border-purple-300"
                                    : "bg-white border border-gray-200"
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <Badge
                                    variant="outline"
                                    className={PLANET_COLORS[ad.planet] || ""}
                                  >
                                    {ad.planet}
                                  </Badge>
                                  <span className="text-sm text-gray-600">
                                    {formatDate(ad.start_date)} - {formatDate(ad.end_date)}
                                  </span>
                                </div>
                                <div className="text-sm text-gray-500">
                                  {ad.duration_months.toFixed(1)} months
                                  {ad.is_current && (
                                    <span className="ml-2 text-purple-600 font-medium">(Now)</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="border-purple-200 flex items-center justify-center min-h-[400px]">
              <CardContent className="text-center py-12">
                <Sparkles className="w-16 h-16 text-purple-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Enter Your Birth Details
                </h3>
                <p className="text-gray-500 max-w-sm">
                  Fill in the form to calculate your complete Vimshottari Dasha timeline 
                  with all Mahadasha and Antardasha periods.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Mahadasha</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Major planetary periods lasting 6-20 years. Each Mahadasha brings the 
                qualities and significations of its ruling planet into prominence.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Antardasha</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Sub-periods within each Mahadasha. The Antardasha lord modifies the 
                effects of the Mahadasha, creating specific life events and experiences.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pratyantardasha</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Even finer sub-sub-periods for precise timing. Used by advanced 
                astrologers to pinpoint exact timing of events within months.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
