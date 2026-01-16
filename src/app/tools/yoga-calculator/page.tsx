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
  Star,
  Crown,
  Gem,
  TrendingUp,
} from "lucide-react";

interface BirthDetails {
  name: string;
  date: string;
  time: string;
  place: string;
}

interface Yoga {
  name: string;
  type: string;
  planets: string[];
  description: string;
  strength: string;
}

interface YogaResult {
  birth_details: {
    date: string;
    time: string;
    place: string;
  };
  ascendant: string;
  yogas: Yoga[];
  yoga_count: number;
  yoga_types: string[];
}

const YOGA_TYPE_ICONS: Record<string, React.ReactNode> = {
  "Wealth & Fame": <Gem className="w-4 h-4" />,
  "Power & Authority": <Crown className="w-4 h-4" />,
  "Panch Mahapurusha": <Star className="w-4 h-4" />,
  "Intelligence": <Sparkles className="w-4 h-4" />,
  "Wealth": <TrendingUp className="w-4 h-4" />,
  "Rise from Adversity": <TrendingUp className="w-4 h-4" />,
  "Success through Adversity": <TrendingUp className="w-4 h-4" />,
};

const YOGA_TYPE_COLORS: Record<string, string> = {
  "Wealth & Fame": "bg-yellow-100 text-yellow-800 border-yellow-300",
  "Power & Authority": "bg-purple-100 text-purple-800 border-purple-300",
  "Panch Mahapurusha": "bg-amber-100 text-amber-800 border-amber-300",
  "Intelligence": "bg-blue-100 text-blue-800 border-blue-300",
  "Wealth": "bg-green-100 text-green-800 border-green-300",
  "Rise from Adversity": "bg-orange-100 text-orange-800 border-orange-300",
  "Success through Adversity": "bg-red-100 text-red-800 border-red-300",
};

const STRENGTH_COLORS: Record<string, string> = {
  "Very Strong": "bg-green-500",
  "Strong": "bg-green-400",
  "Moderate": "bg-yellow-400",
  "Weak": "bg-orange-400",
};

export default function YogaCalculatorPage() {
  const [birthDetails, setBirthDetails] = useState<BirthDetails>({
    name: "",
    date: "",
    time: "",
    place: "",
  });
  const [yogaResult, setYogaResult] = useState<YogaResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCalculating(true);
    setError("");

    try {
      const response = await fetch("/api/calculate-yogas", {
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
        throw new Error("Failed to detect yogas");
      }

      const data = await response.json();
      setYogaResult(data);
    } catch (err) {
      console.error("Error detecting yogas:", err);
      setError("Unable to detect yogas. Please check your birth details and try again.");
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="py-12 lg:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-yellow-100 text-yellow-800">Advanced Feature</Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Yoga Calculator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover powerful planetary combinations (Yogas) in your birth chart. 
            Yogas indicate special talents, wealth potential, and life achievements.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="border-yellow-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-yellow-600" />
                Enter Birth Details
              </CardTitle>
              <CardDescription>
                Provide accurate birth information to detect Yogas in your chart
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
                  className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700"
                  disabled={isCalculating}
                >
                  {isCalculating ? (
                    <>
                      <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Star className="w-4 h-4 mr-2" />
                      Detect Yogas
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                <h3 className="font-semibold text-yellow-900 mb-2">What are Yogas?</h3>
                <p className="text-sm text-yellow-800">
                  Yogas are special planetary combinations that indicate exceptional 
                  qualities or life events. They can signify wealth (Dhana Yoga), 
                  power (Raj Yoga), wisdom (Hamsa Yoga), and more. The presence of 
                  strong Yogas can significantly enhance life outcomes.
                </p>
              </div>
            </CardContent>
          </Card>

          {yogaResult ? (
            <div className="space-y-6">
              <Card className="border-yellow-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-600" />
                    Yoga Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-500">Ascendant</div>
                      <div className="font-semibold text-gray-900">{yogaResult.ascendant}</div>
                    </div>
                    <div className="p-3 bg-yellow-100 rounded-lg">
                      <div className="text-sm text-yellow-600">Yogas Found</div>
                      <div className="font-semibold text-yellow-900">{yogaResult.yoga_count}</div>
                    </div>
                  </div>
                  
                  {yogaResult.yoga_types.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {yogaResult.yoga_types.map((type) => (
                        <Badge
                          key={type}
                          variant="outline"
                          className={YOGA_TYPE_COLORS[type] || "bg-gray-100"}
                        >
                          {YOGA_TYPE_ICONS[type]} {type}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {yogaResult.yogas.length > 0 ? (
                <Card className="border-yellow-200">
                  <CardHeader>
                    <CardTitle>Detected Yogas</CardTitle>
                    <CardDescription>
                      Planetary combinations found in your birth chart
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {yogaResult.yogas.map((yoga, index) => (
                      <div
                        key={index}
                        className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                              {YOGA_TYPE_ICONS[yoga.type]}
                              {yoga.name}
                            </h4>
                            <Badge
                              variant="outline"
                              className={`mt-1 ${YOGA_TYPE_COLORS[yoga.type] || "bg-gray-100"}`}
                            >
                              {yoga.type}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">Strength:</span>
                            <div className="flex items-center gap-1">
                              <div
                                className={`w-3 h-3 rounded-full ${
                                  STRENGTH_COLORS[yoga.strength] || "bg-gray-400"
                                }`}
                              />
                              <span className="text-sm font-medium">{yoga.strength}</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{yoga.description}</p>
                        <div className="flex flex-wrap gap-1">
                          <span className="text-xs text-gray-500">Planets involved:</span>
                          {yoga.planets.map((planet) => (
                            <Badge key={planet} variant="secondary" className="text-xs">
                              {planet}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-yellow-200">
                  <CardContent className="py-8 text-center">
                    <p className="text-gray-500">
                      No major Yogas detected in your chart. This doesn&apos;t mean your chart 
                      lacks potential - individual planetary strengths and house placements 
                      also play important roles.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card className="border-yellow-200 flex items-center justify-center min-h-[400px]">
              <CardContent className="text-center py-12">
                <Star className="w-16 h-16 text-yellow-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Enter Your Birth Details
                </h3>
                <p className="text-gray-500 max-w-sm">
                  Fill in the form to discover powerful Yogas (planetary combinations) 
                  in your birth chart.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Crown className="w-5 h-5 text-purple-600" />
                Raj Yoga
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Formed by conjunction of Kendra and Trikona lords. Indicates power, 
                authority, and rise to prominent positions in life.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Gem className="w-5 h-5 text-green-600" />
                Dhana Yoga
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Wealth-producing combinations involving 2nd and 11th house lords. 
                Indicates financial prosperity and material abundance.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-600" />
                Panch Mahapurusha
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Five great person yogas formed when Mars, Mercury, Jupiter, Venus, 
                or Saturn are in Kendra in their own or exaltation sign.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
