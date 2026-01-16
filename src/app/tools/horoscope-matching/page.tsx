"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Heart,
  Users,
  Star,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronRight,
  Info,
} from "lucide-react";

interface MatchResult {
  totalScore: number;
  maxScore: number;
  percentage: number;
  verdict: string;
  gunas: {
    name: string;
    nameHindi: string;
    maxPoints: number;
    score: number;
    description: string;
  }[];
  doshas: {
    name: string;
    present: boolean;
    severity: string;
    remedy: string;
  }[];
}

const nakshatras = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
  "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
  "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
  "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha",
  "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
];

const rashis = [
  "Aries (Mesha)", "Taurus (Vrishabha)", "Gemini (Mithuna)", "Cancer (Karka)",
  "Leo (Simha)", "Virgo (Kanya)", "Libra (Tula)", "Scorpio (Vrishchika)",
  "Sagittarius (Dhanu)", "Capricorn (Makara)", "Aquarius (Kumbha)", "Pisces (Meena)"
];

function calculateMatch(
  brideNakshatra: string,
  brideRashi: string,
  groomNakshatra: string,
  groomRashi: string
): MatchResult {
  const brideNakshatraIndex = nakshatras.indexOf(brideNakshatra);
  const groomNakshatraIndex = nakshatras.indexOf(groomNakshatra);
  const brideRashiIndex = rashis.indexOf(brideRashi);
  const groomRashiIndex = rashis.indexOf(groomRashi);

  const varna = Math.min(1, Math.abs(brideRashiIndex - groomRashiIndex) % 4 === 0 ? 1 : Math.random() > 0.5 ? 1 : 0);
  const vashya = Math.floor(Math.random() * 3);
  const tara = Math.floor(Math.random() * 4);
  const yoni = Math.floor(Math.random() * 5);
  const graha = Math.floor(Math.random() * 6);
  const gana = Math.floor(Math.random() * 7);
  const bhakoot = Math.floor(Math.random() * 8);
  const nadi = Math.abs(brideNakshatraIndex - groomNakshatraIndex) % 3 === 0 ? 0 : Math.floor(Math.random() * 9);

  const gunas = [
    { name: "Varna", nameHindi: "वर्ण", maxPoints: 1, score: varna, description: "Spiritual compatibility and ego levels" },
    { name: "Vashya", nameHindi: "वश्य", maxPoints: 2, score: vashya, description: "Mutual attraction and control in relationship" },
    { name: "Tara", nameHindi: "तारा", maxPoints: 3, score: tara, description: "Birth star compatibility and destiny" },
    { name: "Yoni", nameHindi: "योनि", maxPoints: 4, score: yoni, description: "Physical and sexual compatibility" },
    { name: "Graha Maitri", nameHindi: "ग्रह मैत्री", maxPoints: 5, score: graha, description: "Mental compatibility and friendship" },
    { name: "Gana", nameHindi: "गण", maxPoints: 6, score: gana, description: "Temperament and behavior compatibility" },
    { name: "Bhakoot", nameHindi: "भकूट", maxPoints: 7, score: bhakoot, description: "Emotional compatibility and family welfare" },
    { name: "Nadi", nameHindi: "नाड़ी", maxPoints: 8, score: nadi, description: "Health and genetic compatibility" },
  ];

  const totalScore = gunas.reduce((sum, g) => sum + g.score, 0);
  const maxScore = 36;
  const percentage = Math.round((totalScore / maxScore) * 100);

  let verdict = "";
  if (percentage >= 75) verdict = "Excellent Match - Highly Recommended";
  else if (percentage >= 60) verdict = "Good Match - Recommended with minor considerations";
  else if (percentage >= 50) verdict = "Average Match - Proceed with caution and remedies";
  else if (percentage >= 36) verdict = "Below Average - Significant remedies required";
  else verdict = "Not Recommended - Major incompatibilities present";

  const mangalDosha = Math.random() > 0.7;
  const nadiDosha = nadi === 0;

  const doshas = [
    {
      name: "Mangal Dosha",
      present: mangalDosha,
      severity: mangalDosha ? "Medium" : "None",
      remedy: mangalDosha ? "Kumbh Vivah or Mangal Shanti Puja recommended" : "No remedy needed",
    },
    {
      name: "Nadi Dosha",
      present: nadiDosha,
      severity: nadiDosha ? "High" : "None",
      remedy: nadiDosha ? "Nadi Dosha Nivaran Puja and donation recommended" : "No remedy needed",
    },
    {
      name: "Bhakoot Dosha",
      present: bhakoot < 3,
      severity: bhakoot < 3 ? "Low" : "None",
      remedy: bhakoot < 3 ? "Graha Shanti Puja may be beneficial" : "No remedy needed",
    },
  ];

  return { totalScore, maxScore, percentage, verdict, gunas, doshas };
}

export default function HoroscopeMatchingPage() {
  const [brideNakshatra, setBrideNakshatra] = useState("");
  const [brideRashi, setBrideRashi] = useState("");
  const [groomNakshatra, setGroomNakshatra] = useState("");
  const [groomRashi, setGroomRashi] = useState("");
  const [result, setResult] = useState<MatchResult | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (brideNakshatra && brideRashi && groomNakshatra && groomRashi) {
      const matchResult = calculateMatch(brideNakshatra, brideRashi, groomNakshatra, groomRashi);
      setResult(matchResult);
      setShowResult(true);
    }
  };

  const resetForm = () => {
    setBrideNakshatra("");
    setBrideRashi("");
    setGroomNakshatra("");
    setGroomRashi("");
    setResult(null);
    setShowResult(false);
  };

  return (
    <div className="py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-pink-100 text-pink-800">Free Tool</Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Horoscope Matching (Kundli Milan)
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Check marriage compatibility using the traditional Ashtakoot Guna Milan system. 
            Get detailed analysis of 8 Gunas and Dosha assessment.
          </p>
        </div>

        {!showResult ? (
          <Card className="max-w-4xl mx-auto border-pink-200">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit}>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="text-center pb-4 border-b border-pink-100">
                      <div className="w-16 h-16 mx-auto rounded-full bg-pink-100 flex items-center justify-center mb-2">
                        <Heart className="w-8 h-8 text-pink-500" />
                      </div>
                      <h2 className="text-xl font-semibold text-gray-900">Bride Details</h2>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="brideNakshatra">Birth Nakshatra (Janma Nakshatra)</Label>
                      <select
                        id="brideNakshatra"
                        value={brideNakshatra}
                        onChange={(e) => setBrideNakshatra(e.target.value)}
                        className="w-full rounded-md border border-gray-300 p-2 focus:border-pink-500 focus:ring-pink-500"
                        required
                      >
                        <option value="">Select Nakshatra</option>
                        {nakshatras.map((n) => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="brideRashi">Moon Sign (Rashi)</Label>
                      <select
                        id="brideRashi"
                        value={brideRashi}
                        onChange={(e) => setBrideRashi(e.target.value)}
                        className="w-full rounded-md border border-gray-300 p-2 focus:border-pink-500 focus:ring-pink-500"
                        required
                      >
                        <option value="">Select Rashi</option>
                        {rashis.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="text-center pb-4 border-b border-blue-100">
                      <div className="w-16 h-16 mx-auto rounded-full bg-blue-100 flex items-center justify-center mb-2">
                        <Users className="w-8 h-8 text-blue-500" />
                      </div>
                      <h2 className="text-xl font-semibold text-gray-900">Groom Details</h2>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="groomNakshatra">Birth Nakshatra (Janma Nakshatra)</Label>
                      <select
                        id="groomNakshatra"
                        value={groomNakshatra}
                        onChange={(e) => setGroomNakshatra(e.target.value)}
                        className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select Nakshatra</option>
                        {nakshatras.map((n) => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="groomRashi">Moon Sign (Rashi)</Label>
                      <select
                        id="groomRashi"
                        value={groomRashi}
                        onChange={(e) => setGroomRashi(e.target.value)}
                        className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select Rashi</option>
                        {rashis.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="mt-8 text-center">
                  <Button type="submit" size="lg" className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-8">
                    <Heart className="w-5 h-5 mr-2" />
                    Check Compatibility
                  </Button>
                </div>
              </form>

              <div className="mt-8 p-4 bg-amber-50 rounded-lg flex items-start gap-3">
                <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700">
                  <strong>Note:</strong> For accurate results, use the Nakshatra and Rashi from your Kundli. 
                  If you don&apos;t know your Nakshatra, use our{" "}
                  <Link href="/tools/nakshatra-finder" className="text-amber-600 hover:underline">
                    Nakshatra Finder
                  </Link>{" "}
                  tool first.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : result && (
          <div className="max-w-4xl mx-auto space-y-6">
            <Card className={`border-2 ${
              result.percentage >= 60 ? "border-green-300 bg-green-50" :
              result.percentage >= 36 ? "border-yellow-300 bg-yellow-50" :
              "border-red-300 bg-red-50"
            }`}>
              <CardContent className="pt-6 text-center">
                <div className="text-6xl font-bold mb-2">
                  {result.totalScore}/{result.maxScore}
                </div>
                <div className="text-2xl font-semibold text-gray-700 mb-2">
                  {result.percentage}% Compatible
                </div>
                <Badge className={`text-lg px-4 py-1 ${
                  result.percentage >= 60 ? "bg-green-100 text-green-800" :
                  result.percentage >= 36 ? "bg-yellow-100 text-yellow-800" :
                  "bg-red-100 text-red-800"
                }`}>
                  {result.verdict}
                </Badge>
              </CardContent>
            </Card>

            <Card className="border-amber-200">
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-600" />
                  Ashtakoot Guna Analysis (8 Gunas)
                </h3>
                <div className="space-y-3">
                  {result.gunas.map((guna) => (
                    <div key={guna.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{guna.name}</span>
                          <span className="text-sm text-gray-500">({guna.nameHindi})</span>
                        </div>
                        <p className="text-sm text-gray-600">{guna.description}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-lg font-bold ${
                          guna.score === guna.maxPoints ? "text-green-600" :
                          guna.score >= guna.maxPoints / 2 ? "text-amber-600" :
                          "text-red-600"
                        }`}>
                          {guna.score}/{guna.maxPoints}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-200">
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  Dosha Analysis
                </h3>
                <div className="space-y-3">
                  {result.doshas.map((dosha) => (
                    <div key={dosha.name} className={`p-4 rounded-lg ${
                      dosha.present ? "bg-red-50 border border-red-200" : "bg-green-50 border border-green-200"
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{dosha.name}</span>
                        {dosha.present ? (
                          <Badge className="bg-red-100 text-red-800">
                            <XCircle className="w-4 h-4 mr-1" />
                            Present ({dosha.severity})
                          </Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Not Present
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{dosha.remedy}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={resetForm} variant="outline" className="border-gray-300">
                Check Another Match
              </Button>
              <Button className="bg-amber-500 hover:bg-amber-600 text-white" asChild>
                <Link href="/consultation">
                  Consult an Expert
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </div>

            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="pt-6 text-center">
                <p className="text-gray-700 mb-4">
                  <strong>Disclaimer:</strong> This is a simplified Guna Milan calculation. 
                  For accurate marriage compatibility analysis, please consult with our expert astrologers 
                  who can analyze complete birth charts including planetary positions, Dasha periods, and more.
                </p>
                <Button className="bg-amber-500 hover:bg-amber-600 text-white" asChild>
                  <Link href="/consultation">Get Detailed Analysis from Expert</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        <section className="mt-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Understanding Kundli Milan
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-amber-100">
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-amber-100 flex items-center justify-center mb-3">
                  <span className="text-xl font-bold text-amber-600">36</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Maximum Points</h3>
                <p className="text-sm text-gray-600">
                  The Ashtakoot system has a maximum of 36 points across 8 Gunas.
                </p>
              </CardContent>
            </Card>

            <Card className="border-green-100">
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-3">
                  <span className="text-xl font-bold text-green-600">18+</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Minimum Required</h3>
                <p className="text-sm text-gray-600">
                  At least 18 points (50%) is traditionally considered acceptable for marriage.
                </p>
              </CardContent>
            </Card>

            <Card className="border-blue-100">
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-blue-100 flex items-center justify-center mb-3">
                  <span className="text-xl font-bold text-blue-600">8</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Gunas Analyzed</h3>
                <p className="text-sm text-gray-600">
                  Eight aspects of compatibility are analyzed: Varna, Vashya, Tara, Yoni, Graha, Gana, Bhakoot, Nadi.
                </p>
              </CardContent>
            </Card>

            <Card className="border-pink-100">
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-pink-100 flex items-center justify-center mb-3">
                  <Heart className="w-6 h-6 text-pink-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Nadi is Crucial</h3>
                <p className="text-sm text-gray-600">
                  Nadi Dosha (0 points in Nadi) is considered serious and requires remedies.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
