"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { LocationInput } from "@/components/ui/location-input";
import {
  Calculator,
  Calendar,
  MapPin,
  Sparkles,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

interface MuhurtaResult {
  date: string;
  event_type: string;
  panchang: {
    tithi: { name: string; number: number; auspicious: boolean };
    nakshatra: { name: string; pada: number; auspicious: boolean };
    yoga: { name: string; number: number };
    karana: { name: string; auspicious: boolean };
  };
  overall_auspiciousness: string;
  recommendation: string;
  factors: {
    tithi_favorable: boolean;
    nakshatra_favorable: boolean;
    karana_favorable: boolean;
  };
}

const EVENT_TYPES = [
  { value: "general", label: "General Activities", description: "Day-to-day important activities" },
  { value: "marriage", label: "Marriage", description: "Wedding ceremonies and engagements" },
  { value: "business", label: "Business", description: "Starting business, signing contracts" },
  { value: "travel", label: "Travel", description: "Starting journeys, trips" },
  { value: "griha_pravesh", label: "Griha Pravesh", description: "House warming, moving into new home" },
];

const AUSPICIOUSNESS_COLORS: Record<string, string> = {
  "Highly Auspicious": "bg-green-100 text-green-800 border-green-300",
  "Auspicious": "bg-blue-100 text-blue-800 border-blue-300",
  "Moderately Auspicious": "bg-yellow-100 text-yellow-800 border-yellow-300",
  "Not Recommended": "bg-red-100 text-red-800 border-red-300",
};

export default function MuhurtaCalculatorPage() {
  const { t } = useLanguage();
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedPlace, setSelectedPlace] = useState("");
  const [selectedEvent, setSelectedEvent] = useState("general");
  const [muhurtaResult, setMuhurtaResult] = useState<MuhurtaResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCalculating(true);
    setError("");

    try {
      const response = await fetch("/api/calculate-muhurta", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: selectedDate,
          place: selectedPlace,
          event_type: selectedEvent,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to calculate Muhurta");
      }

      const data = await response.json();
      setMuhurtaResult(data);
    } catch (err) {
      console.error("Error calculating Muhurta:", err);
      setError("Unable to calculate Muhurta. Please try again.");
    } finally {
      setIsCalculating(false);
    }
  };

  const renderFactorIcon = (favorable: boolean) => {
    return favorable ? (
      <CheckCircle className="w-5 h-5 text-green-500" />
    ) : (
      <XCircle className="w-5 h-5 text-red-500" />
    );
  };

  return (
    <div className="py-12 lg:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-green-100 text-green-800">{t('calculator.advancedFeature', 'Advanced Feature')}</Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {t('calculator.muhurta.title', 'Muhurta Calculator')}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('calculator.muhurta.subtitle', 'Find auspicious timing (Muhurta) for important events. Check if a date is favorable for marriage, business, travel, or house warming ceremonies.')}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-green-600" />
                {t('calculator.muhurta.checkMuhurta', 'Check Muhurta')}
              </CardTitle>
              <CardDescription>
                {t('calculator.muhurta.selectDateNote', 'Select a date and event type to check auspiciousness')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="date" className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {t('calculator.muhurta.selectDate', 'Select Date')}
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="place" className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {t('calculator.location', 'Location')}
                  </Label>
                  <LocationInput
                    id="place"
                    placeholder={t('calculator.searchCity', 'Search city...')}
                    value={selectedPlace}
                    onChange={(e) => setSelectedPlace(e.target.value)}
                    onLocationSelect={(loc) => setSelectedPlace(loc)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t('calculator.muhurta.eventType', 'Event Type')}</Label>
                  <div className="grid grid-cols-1 gap-2">
                    {EVENT_TYPES.map((event) => (
                      <button
                        key={event.value}
                        type="button"
                        onClick={() => setSelectedEvent(event.value)}
                        className={`p-3 text-left rounded-lg border transition-colors ${
                          selectedEvent === event.value
                            ? "border-green-500 bg-green-50"
                            : "border-gray-200 hover:border-green-300"
                        }`}
                      >
                        <div className="font-medium text-gray-900">{event.label}</div>
                        <div className="text-sm text-gray-500">{event.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  disabled={isCalculating}
                >
                  {isCalculating ? (
                    <>
                      <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                      {t('calculator.calculating', 'Calculating...')}
                    </>
                  ) : (
                    <>
                      <Calendar className="w-4 h-4 mr-2" />
                      {t('calculator.muhurta.checkMuhurtaBtn', 'Check Muhurta')}
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-2">{t('calculator.muhurta.whatIs', 'What is Muhurta?')}</h3>
                <p className="text-sm text-green-800">
                  {t('calculator.muhurta.whatIsDesc', 'Muhurta is the Vedic science of electional astrology - finding the most auspicious time to begin important activities. It considers Tithi (lunar day), Nakshatra (lunar mansion), Yoga, and Karana to determine favorable timing.')}
                </p>
              </div>
            </CardContent>
          </Card>

          {muhurtaResult ? (
            <div className="space-y-6">
              <Card className="border-green-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-green-600" />
                      {t('calculator.muhurta.result', 'Muhurta Result')}
                    </CardTitle>
                    <Badge className={AUSPICIOUSNESS_COLORS[muhurtaResult.overall_auspiciousness]}>
                      {muhurtaResult.overall_auspiciousness}
                    </Badge>
                  </div>
                  <CardDescription>
                    {new Date(muhurtaResult.date).toLocaleDateString("en-IN", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-gray-50 rounded-lg mb-4">
                    <p className="text-gray-700">{muhurtaResult.recommendation}</p>
                  </div>

                  <h4 className="font-semibold text-gray-900 mb-3">{t('calculator.muhurta.panchangDetails', 'Panchang Details')}</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white border rounded-lg">
                      <div>
                        <div className="text-sm text-gray-500">Tithi</div>
                        <div className="font-medium">{muhurtaResult.panchang.tithi.name}</div>
                      </div>
                      {renderFactorIcon(muhurtaResult.factors.tithi_favorable)}
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white border rounded-lg">
                      <div>
                        <div className="text-sm text-gray-500">Nakshatra</div>
                        <div className="font-medium">
                          {muhurtaResult.panchang.nakshatra.name} (Pada {muhurtaResult.panchang.nakshatra.pada})
                        </div>
                      </div>
                      {renderFactorIcon(muhurtaResult.factors.nakshatra_favorable)}
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white border rounded-lg">
                      <div>
                        <div className="text-sm text-gray-500">Yoga</div>
                        <div className="font-medium">{muhurtaResult.panchang.yoga.name}</div>
                      </div>
                      <AlertCircle className="w-5 h-5 text-gray-400" />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white border rounded-lg">
                      <div>
                        <div className="text-sm text-gray-500">Karana</div>
                        <div className="font-medium">{muhurtaResult.panchang.karana.name}</div>
                      </div>
                      {renderFactorIcon(muhurtaResult.factors.karana_favorable)}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle className="text-lg">{t('calculator.muhurta.factorsConsidered', 'Factors Considered')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      {renderFactorIcon(muhurtaResult.factors.tithi_favorable)}
                      <span>
                        Tithi is {muhurtaResult.factors.tithi_favorable ? "favorable" : "not ideal"} for{" "}
                        {muhurtaResult.event_type}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {renderFactorIcon(muhurtaResult.factors.nakshatra_favorable)}
                      <span>
                        Nakshatra is {muhurtaResult.factors.nakshatra_favorable ? "auspicious" : "not recommended"} for{" "}
                        {muhurtaResult.event_type}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {renderFactorIcon(muhurtaResult.factors.karana_favorable)}
                      <span>
                        Karana is {muhurtaResult.factors.karana_favorable ? "supportive" : "Vishti (Bhadra) - avoid"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="border-green-200 flex items-center justify-center min-h-[400px]">
              <CardContent className="text-center py-12">
                <Calendar className="w-16 h-16 text-green-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  {t('calculator.muhurta.selectDateTitle', 'Select a Date')}
                </h3>
                <p className="text-gray-500 max-w-sm">
                  {t('calculator.muhurta.resultPlaceholderDesc', "Choose a date and event type to check if it's auspicious according to Vedic Muhurta principles.")}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('panchang.tithi', 'Tithi')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                {t('calculator.muhurta.tithiDesc', 'Lunar day based on Moon-Sun angle. Certain tithis are favorable for specific activities.')}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('panchang.nakshatra', 'Nakshatra')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                {t('calculator.muhurta.nakshatraDesc', 'Lunar mansion where Moon is placed. Each nakshatra has specific qualities and suitable activities.')}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('panchang.yoga', 'Yoga')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                {t('calculator.muhurta.yogaDesc', 'Combination of Sun and Moon longitudes. 27 yogas indicate different qualities of time.')}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('panchang.karana', 'Karana')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                {t('calculator.muhurta.karanaDesc', 'Half of a tithi. Vishti (Bhadra) karana should be avoided for auspicious activities.')}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
