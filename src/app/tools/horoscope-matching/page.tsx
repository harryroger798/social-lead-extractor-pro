"use client";

import { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";
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

// Varna classification for each Rashi (0=Brahmin, 1=Kshatriya, 2=Vaishya, 3=Shudra)
const rashiVarna = [1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0]; // Aries to Pisces

// Vashya classification for each Rashi
const rashiVashya: Record<number, string> = {
  0: "Chatushpada", 1: "Chatushpada", 2: "Manav", 3: "Jalachara",
  4: "Vanachara", 5: "Manav", 6: "Manav", 7: "Keeta",
  8: "Manav", 9: "Jalachara", 10: "Manav", 11: "Jalachara"
};

// Yoni (animal) for each Nakshatra
const nakshatraYoni = [
  "Horse", "Elephant", "Sheep", "Serpent", "Serpent", "Dog",
  "Cat", "Sheep", "Cat", "Rat", "Rat", "Cow",
  "Buffalo", "Tiger", "Buffalo", "Tiger", "Deer", "Deer",
  "Dog", "Monkey", "Mongoose", "Monkey", "Lion", "Horse",
  "Lion", "Cow", "Elephant"
];

// Yoni compatibility matrix (enemy pairs get 0, friendly pairs get more)
const yoniCompatibility: Record<string, string[]> = {
  "Horse": ["Buffalo"],
  "Elephant": ["Lion"],
  "Sheep": ["Monkey"],
  "Serpent": ["Mongoose"],
  "Dog": ["Deer"],
  "Cat": ["Rat"],
  "Cow": ["Tiger"],
  "Buffalo": ["Horse"],
  "Tiger": ["Cow"],
  "Rat": ["Cat"],
  "Deer": ["Dog"],
  "Monkey": ["Sheep"],
  "Mongoose": ["Serpent"],
  "Lion": ["Elephant"]
};

// Gana for each Nakshatra (0=Deva, 1=Manushya, 2=Rakshasa)
const nakshatraGana = [
  0, 1, 2, 1, 0, 1, 0, 0, 2, 2, 1, 1,
  0, 2, 0, 2, 0, 2, 2, 1, 1, 0, 2, 2,
  1, 1, 0
];

// Nadi for each Nakshatra (0=Aadi, 1=Madhya, 2=Antya)
const nakshatraNadi = [
  0, 1, 2, 2, 1, 0, 0, 1, 2, 2, 1, 0,
  0, 1, 2, 2, 1, 0, 0, 1, 2, 2, 1, 0,
  0, 1, 2
];

// Rashi lord for Graha Maitri
const rashiLord = ["Mars", "Venus", "Mercury", "Moon", "Sun", "Mercury", 
                   "Venus", "Mars", "Jupiter", "Saturn", "Saturn", "Jupiter"];

// Planet friendship matrix
const planetFriendship: Record<string, { friends: string[], enemies: string[], neutral: string[] }> = {
  "Sun": { friends: ["Moon", "Mars", "Jupiter"], enemies: ["Venus", "Saturn"], neutral: ["Mercury"] },
  "Moon": { friends: ["Sun", "Mercury"], enemies: [], neutral: ["Mars", "Jupiter", "Venus", "Saturn"] },
  "Mars": { friends: ["Sun", "Moon", "Jupiter"], enemies: ["Mercury"], neutral: ["Venus", "Saturn"] },
  "Mercury": { friends: ["Sun", "Venus"], enemies: ["Moon"], neutral: ["Mars", "Jupiter", "Saturn"] },
  "Jupiter": { friends: ["Sun", "Moon", "Mars"], enemies: ["Mercury", "Venus"], neutral: ["Saturn"] },
  "Venus": { friends: ["Mercury", "Saturn"], enemies: ["Sun", "Moon"], neutral: ["Mars", "Jupiter"] },
  "Saturn": { friends: ["Mercury", "Venus"], enemies: ["Sun", "Moon", "Mars"], neutral: ["Jupiter"] }
};

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

  // 1. VARNA (Max 1 point) - Groom's varna should be equal or higher than bride's
  const brideVarna = rashiVarna[brideRashiIndex];
  const groomVarna = rashiVarna[groomRashiIndex];
  const varna = groomVarna <= brideVarna ? 1 : 0;

  // 2. VASHYA (Max 2 points) - Based on Rashi animal classification
  const brideVashyaType = rashiVashya[brideRashiIndex];
  const groomVashyaType = rashiVashya[groomRashiIndex];
  let vashya = 0;
  if (brideVashyaType === groomVashyaType) vashya = 2;
  else if ((brideVashyaType === "Manav" && groomVashyaType !== "Vanachara") ||
           (groomVashyaType === "Manav" && brideVashyaType !== "Vanachara")) vashya = 1;

  // 3. TARA (Max 3 points) - Based on Nakshatra distance
  const taraDiff = ((groomNakshatraIndex - brideNakshatraIndex + 27) % 27) % 9;
  const auspiciousTaras = [1, 2, 4, 6, 8]; // 2nd, 3rd, 5th, 7th, 9th are auspicious
  const tara = auspiciousTaras.includes(taraDiff) ? 3 : (taraDiff === 0 ? 1 : 0);

  // 4. YONI (Max 4 points) - Based on Nakshatra animal compatibility
  const brideYoni = nakshatraYoni[brideNakshatraIndex];
  const groomYoni = nakshatraYoni[groomNakshatraIndex];
  let yoni = 0;
  if (brideYoni === groomYoni) yoni = 4;
  else if (yoniCompatibility[brideYoni]?.includes(groomYoni) || 
           yoniCompatibility[groomYoni]?.includes(brideYoni)) yoni = 0;
  else yoni = 2;

  // 5. GRAHA MAITRI (Max 5 points) - Based on Rashi lord friendship
  const brideLord = rashiLord[brideRashiIndex];
  const groomLord = rashiLord[groomRashiIndex];
  let graha = 0;
  if (brideLord === groomLord) graha = 5;
  else if (planetFriendship[brideLord]?.friends.includes(groomLord) &&
           planetFriendship[groomLord]?.friends.includes(brideLord)) graha = 5;
  else if (planetFriendship[brideLord]?.friends.includes(groomLord) ||
           planetFriendship[groomLord]?.friends.includes(brideLord)) graha = 4;
  else if (planetFriendship[brideLord]?.neutral.includes(groomLord) ||
           planetFriendship[groomLord]?.neutral.includes(brideLord)) graha = 3;
  else if (planetFriendship[brideLord]?.enemies.includes(groomLord) &&
           planetFriendship[groomLord]?.enemies.includes(brideLord)) graha = 0;
  else graha = 1;

  // 6. GANA (Max 6 points) - Based on Nakshatra temperament
  const brideGana = nakshatraGana[brideNakshatraIndex];
  const groomGana = nakshatraGana[groomNakshatraIndex];
  let gana = 0;
  if (brideGana === groomGana) gana = 6;
  else if ((brideGana === 0 && groomGana === 1) || (brideGana === 1 && groomGana === 0)) gana = 5;
  else if ((brideGana === 1 && groomGana === 2) || (brideGana === 2 && groomGana === 1)) gana = 1;
  else if ((brideGana === 0 && groomGana === 2) || (brideGana === 2 && groomGana === 0)) gana = 0;

  // 7. BHAKOOT (Max 7 points) - Based on Rashi positions
  const rashiDiff = Math.abs(brideRashiIndex - groomRashiIndex);
  let bhakoot = 7;
  // 6-8 and 2-12 positions are inauspicious
  if (rashiDiff === 5 || rashiDiff === 7) bhakoot = 0; // 6-8 position
  else if (rashiDiff === 1 || rashiDiff === 11) bhakoot = 0; // 2-12 position
  else if (rashiDiff === 4 || rashiDiff === 8) bhakoot = 4; // 5-9 position (partial)

  // 8. NADI (Max 8 points) - Based on Nakshatra Nadi (most important)
  const brideNadi = nakshatraNadi[brideNakshatraIndex];
  const groomNadi = nakshatraNadi[groomNakshatraIndex];
  const nadi = brideNadi === groomNadi ? 0 : 8; // Same Nadi = Nadi Dosha = 0 points

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

  // Dosha detection based on actual calculations
  const nadiDosha = nadi === 0;
  const bhakootDosha = bhakoot < 3;
  // Mangal Dosha would require Mars position - we'll mark it as "Check Required"
  const mangalDoshaCheckRequired = true;

  const doshas = [
    {
      name: "Mangal Dosha",
      present: false,
      severity: "Check Required",
      remedy: "Use Mangal Dosh Calculator with birth details for accurate assessment",
    },
    {
      name: "Nadi Dosha",
      present: nadiDosha,
      severity: nadiDosha ? "High" : "None",
      remedy: nadiDosha ? "Nadi Dosha Nivaran Puja and donation recommended" : "No remedy needed",
    },
    {
      name: "Bhakoot Dosha",
      present: bhakootDosha,
      severity: bhakootDosha ? "Medium" : "None",
      remedy: bhakootDosha ? "Graha Shanti Puja may be beneficial" : "No remedy needed",
    },
  ];

  return { totalScore, maxScore, percentage, verdict, gunas, doshas };
}

export default function HoroscopeMatchingPage() {
  const { t } = useLanguage();
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
          <Badge className="mb-4 bg-pink-100 text-pink-800">{t('calculator.freeTool', 'Free Tool')}</Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {t('calculator.horoscopeMatching.title', 'Horoscope Matching (Kundli Milan)')}
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {t('calculator.horoscopeMatching.subtitle', 'Check marriage compatibility using the traditional Ashtakoot Guna Milan system.')}
            {t('calculator.matching.getDetailedAnalysis', 'Get detailed analysis of 8 Gunas and Dosha assessment.')}
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
                      <h2 className="text-xl font-semibold text-gray-900">{t('calculator.matching.brideDetails', 'Bride Details')}</h2>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="brideNakshatra">{t('calculator.matching.birthNakshatra', 'Birth Nakshatra (Janma Nakshatra)')}</Label>
                      <select
                        id="brideNakshatra"
                        value={brideNakshatra}
                        onChange={(e) => setBrideNakshatra(e.target.value)}
                        className="w-full rounded-md border border-gray-300 p-2 focus:border-pink-500 focus:ring-pink-500"
                        required
                      >
                        <option value="">{t('calculator.matching.selectNakshatra', 'Select Nakshatra')}</option>
                        {nakshatras.map((n) => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="brideRashi">{t('calculator.matching.moonSign', 'Moon Sign (Rashi)')}</Label>
                      <select
                        id="brideRashi"
                        value={brideRashi}
                        onChange={(e) => setBrideRashi(e.target.value)}
                        className="w-full rounded-md border border-gray-300 p-2 focus:border-pink-500 focus:ring-pink-500"
                        required
                      >
                        <option value="">{t('calculator.matching.selectRashi', 'Select Rashi')}</option>
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
                      <h2 className="text-xl font-semibold text-gray-900">{t('calculator.matching.groomDetails', 'Groom Details')}</h2>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="groomNakshatra">{t('calculator.matching.birthNakshatra', 'Birth Nakshatra (Janma Nakshatra)')}</Label>
                      <select
                        id="groomNakshatra"
                        value={groomNakshatra}
                        onChange={(e) => setGroomNakshatra(e.target.value)}
                        className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-blue-500"
                        required
                      >
                        <option value="">{t('calculator.matching.selectNakshatra', 'Select Nakshatra')}</option>
                        {nakshatras.map((n) => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="groomRashi">{t('calculator.matching.moonSign', 'Moon Sign (Rashi)')}</Label>
                      <select
                        id="groomRashi"
                        value={groomRashi}
                        onChange={(e) => setGroomRashi(e.target.value)}
                        className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-blue-500"
                        required
                      >
                        <option value="">{t('calculator.matching.selectRashi', 'Select Rashi')}</option>
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
                    {t('calculator.matching.checkCompatibility', 'Check Compatibility')}
                  </Button>
                </div>
              </form>

              <div className="mt-8 p-4 bg-amber-50 rounded-lg flex items-start gap-3">
                <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700">
                  <strong>{t('common.note', 'Note')}:</strong> {t('calculator.matching.noteText', "For accurate results, use the Nakshatra and Rashi from your Kundli. If you don't know your Nakshatra, use our")}{" "}
                  <Link href="/tools/nakshatra-finder" className="text-amber-600 hover:underline">
                    {t('calculator.nakshatraFinder', 'Nakshatra Finder')}
                  </Link>{" "}
                  {t('calculator.matching.toolFirst', 'tool first.')}
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
                  {result.percentage}% {t('calculator.matching.compatible', 'Compatible')}
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
                  {t('calculator.matching.gunaAnalysis', 'Ashtakoot Guna Analysis (8 Gunas)')}
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
                  {t('calculator.matching.doshaAnalysis', 'Dosha Analysis')}
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
                            {t('calculator.matching.present', 'Present')} ({dosha.severity})
                          </Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            {t('calculator.matching.notPresent', 'Not Present')}
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
                {t('calculator.matching.checkAnother', 'Check Another Match')}
              </Button>
              <Button className="bg-amber-500 hover:bg-amber-600 text-white" asChild>
                <Link href="/consultation">
                  {t('consultation.consultExpert', 'Consult an Expert')}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </div>

            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="pt-6 text-center">
                <p className="text-gray-700 mb-4">
                  <strong>{t('common.disclaimer', 'Disclaimer')}:</strong> {t('calculator.matching.disclaimerText', 'This is a simplified Guna Milan calculation. For accurate marriage compatibility analysis, please consult with our expert astrologers who can analyze complete birth charts including planetary positions, Dasha periods, and more.')}
                </p>
                <Button className="bg-amber-500 hover:bg-amber-600 text-white" asChild>
                  <Link href="/consultation">{t('calculator.matching.getDetailedFromExpert', 'Get Detailed Analysis from Expert')}</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        <section className="mt-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              {t('calculator.matching.understandingTitle', 'Understanding Kundli Milan')}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-amber-100">
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-amber-100 flex items-center justify-center mb-3">
                  <span className="text-xl font-bold text-amber-600">36</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{t('calculator.matching.maxPoints', 'Maximum Points')}</h3>
                <p className="text-sm text-gray-600">
                  {t('calculator.matching.maxPointsDesc', 'The Ashtakoot system has a maximum of 36 points across 8 Gunas.')}
                </p>
              </CardContent>
            </Card>

            <Card className="border-green-100">
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-3">
                  <span className="text-xl font-bold text-green-600">18+</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{t('calculator.matching.minRequired', 'Minimum Required')}</h3>
                <p className="text-sm text-gray-600">
                  {t('calculator.matching.minRequiredDesc', 'At least 18 points (50%) is traditionally considered acceptable for marriage.')}
                </p>
              </CardContent>
            </Card>

            <Card className="border-blue-100">
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-blue-100 flex items-center justify-center mb-3">
                  <span className="text-xl font-bold text-blue-600">8</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{t('calculator.matching.gunasAnalyzed', 'Gunas Analyzed')}</h3>
                <p className="text-sm text-gray-600">
                  {t('calculator.matching.gunasAnalyzedDesc', 'Eight aspects of compatibility are analyzed: Varna, Vashya, Tara, Yoni, Graha, Gana, Bhakoot, Nadi.')}
                </p>
              </CardContent>
            </Card>

            <Card className="border-pink-100">
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-pink-100 flex items-center justify-center mb-3">
                  <Heart className="w-6 h-6 text-pink-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{t('calculator.matching.nadiCrucial', 'Nadi is Crucial')}</h3>
                <p className="text-sm text-gray-600">
                  {t('calculator.matching.nadiCrucialDesc', 'Nadi Dosha (0 points in Nadi) is considered serious and requires remedies.')}
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
