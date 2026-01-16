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
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

interface BirthDetails {
  name: string;
  date: string;
  time: string;
  place: string;
}

interface TransitPlanet {
  name: string;
  sign: string;
  degree: number;
  nakshatra: string;
  retrograde: boolean;
}

interface TransitEffect {
  planet: string;
  current_sign: string;
  house_from_moon: number;
  effect: string;
  retrograde: boolean;
}

interface TransitHighlight {
  type: string;
  description: string;
  severity: string;
}

interface TransitResult {
  birth_details: {
    date: string;
    time: string;
    place: string;
  };
  birth_chart_summary: {
    ascendant: string;
    moon_sign: string;
    sun_sign: string;
    nakshatra: string;
  };
  transits: {
    transit_date: string;
    birth_moon_sign: string;
    current_transits: TransitPlanet[];
    transit_effects: TransitEffect[];
    highlights: TransitHighlight[];
    summary: {
      favorable_transits: number;
      challenging_transits: number;
      neutral_transits: number;
    };
  };
}

const EFFECT_ICONS: Record<string, React.ReactNode> = {
  Favorable: <TrendingUp className="w-4 h-4 text-green-500" />,
  Challenging: <TrendingDown className="w-4 h-4 text-red-500" />,
  Neutral: <Minus className="w-4 h-4 text-gray-500" />,
};

const EFFECT_COLORS: Record<string, string> = {
  Favorable: "bg-green-100 text-green-800 border-green-300",
  Challenging: "bg-red-100 text-red-800 border-red-300",
  Neutral: "bg-gray-100 text-gray-800 border-gray-300",
};

const PLANET_COLORS: Record<string, string> = {
  Sun: "bg-orange-100 text-orange-800",
  Moon: "bg-gray-100 text-gray-800",
  Mars: "bg-red-100 text-red-800",
  Mercury: "bg-green-100 text-green-800",
  Jupiter: "bg-yellow-100 text-yellow-800",
  Venus: "bg-pink-100 text-pink-800",
  Saturn: "bg-blue-100 text-blue-800",
  Rahu: "bg-purple-100 text-purple-800",
  Ketu: "bg-indigo-100 text-indigo-800",
};

export default function TransitCalculatorPage() {
  const [birthDetails, setBirthDetails] = useState<BirthDetails>({
    name: "",
    date: "",
    time: "",
    place: "",
  });
  const [transitResult, setTransitResult] = useState<TransitResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCalculating(true);
    setError("");

    try {
      const response = await fetch("/api/calculate-transits", {
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
        throw new Error("Failed to calculate transits");
      }

      const data = await response.json();
      setTransitResult(data);
    } catch (err) {
      console.error("Error calculating transits:", err);
      setError("Unable to calculate transits. Please check your birth details and try again.");
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="py-12 lg:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-blue-100 text-blue-800">Advanced Feature</Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Transit Analysis (Gochar)
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Analyze current planetary transits and their effects on your birth chart. 
            Understand which planets are favorable or challenging for you right now.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-blue-600" />
                Enter Birth Details
              </CardTitle>
              <CardDescription>
                Provide your birth information to analyze current transits
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
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                  disabled={isCalculating}
                >
                  {isCalculating ? (
                    <>
                      <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Analyze Transits
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">What is Gochar?</h3>
                <p className="text-sm text-blue-800">
                  Gochar (transit) analysis shows how current planetary positions affect 
                  your birth chart. Transits are analyzed from your Moon sign to determine 
                  favorable and challenging periods for different life areas.
                </p>
              </div>
            </CardContent>
          </Card>

          {transitResult ? (
            <div className="space-y-6">
              <Card className="border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-blue-600" />
                    Transit Summary
                  </CardTitle>
                  <CardDescription>
                    As of {new Date(transitResult.transits.transit_date).toLocaleDateString("en-IN")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-500">Your Moon Sign</div>
                      <div className="font-semibold text-gray-900">
                        {transitResult.birth_chart_summary.moon_sign}
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-500">Your Nakshatra</div>
                      <div className="font-semibold text-gray-900">
                        {transitResult.birth_chart_summary.nakshatra}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 bg-green-50 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {transitResult.transits.summary.favorable_transits}
                      </div>
                      <div className="text-xs text-green-700">Favorable</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg text-center">
                      <div className="text-2xl font-bold text-gray-600">
                        {transitResult.transits.summary.neutral_transits}
                      </div>
                      <div className="text-xs text-gray-700">Neutral</div>
                    </div>
                    <div className="p-3 bg-red-50 rounded-lg text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {transitResult.transits.summary.challenging_transits}
                      </div>
                      <div className="text-xs text-red-700">Challenging</div>
                    </div>
                  </div>

                  {transitResult.transits.highlights.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {transitResult.transits.highlights.map((highlight, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded-lg flex items-start gap-2 ${
                            highlight.severity === "Major"
                              ? "bg-amber-50 border border-amber-200"
                              : "bg-green-50 border border-green-200"
                          }`}
                        >
                          {highlight.severity === "Major" ? (
                            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                          ) : (
                            <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                          )}
                          <div>
                            <div className="font-medium text-gray-900">{highlight.type}</div>
                            <div className="text-sm text-gray-600">{highlight.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-blue-200">
                <CardHeader>
                  <CardTitle>Current Planetary Positions</CardTitle>
                  <CardDescription>Real-time transit positions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {transitResult.transits.current_transits.map((planet) => (
                      <div
                        key={planet.name}
                        className="flex items-center justify-between p-3 bg-white border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Badge className={PLANET_COLORS[planet.name] || "bg-gray-100"}>
                            {planet.name}
                          </Badge>
                          <div>
                            <div className="font-medium text-gray-900">
                              {planet.sign} {planet.degree.toFixed(1)}°
                            </div>
                            <div className="text-xs text-gray-500">{planet.nakshatra}</div>
                          </div>
                        </div>
                        {planet.retrograde && (
                          <Badge variant="outline" className="text-xs">
                            Retrograde
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-200">
                <CardHeader>
                  <CardTitle>Transit Effects on Your Chart</CardTitle>
                  <CardDescription>How transits affect you based on Moon sign</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {transitResult.transits.transit_effects.map((effect) => (
                      <div
                        key={effect.planet}
                        className="flex items-center justify-between p-3 bg-white border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          {EFFECT_ICONS[effect.effect]}
                          <div>
                            <div className="font-medium text-gray-900">{effect.planet}</div>
                            <div className="text-xs text-gray-500">
                              {effect.current_sign} - {effect.house_from_moon}th from Moon
                            </div>
                          </div>
                        </div>
                        <Badge className={EFFECT_COLORS[effect.effect]}>{effect.effect}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="border-blue-200 flex items-center justify-center min-h-[400px]">
              <CardContent className="text-center py-12">
                <TrendingUp className="w-16 h-16 text-blue-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Enter Your Birth Details
                </h3>
                <p className="text-gray-500 max-w-sm">
                  Fill in the form to analyze how current planetary transits 
                  are affecting your birth chart.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Saturn Transit</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Saturn&apos;s transit through 12th, 1st, and 2nd from Moon is called 
                Sade Sati - a 7.5 year period of challenges and transformation.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Jupiter Transit</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Jupiter&apos;s transit through favorable houses (2, 5, 7, 9, 11) brings 
                growth, opportunities, and blessings in those life areas.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Rahu-Ketu Transit</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                The nodes transit each sign for 18 months, bringing karmic lessons 
                and sudden changes in the houses they occupy.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
