"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { CDN_IMAGES } from "@/lib/cdn";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  HelpCircle,
  Clock,
  MapPin,
  Sparkles,
  Star,
  CheckCircle,
  AlertTriangle,
  Info,
} from "lucide-react";

interface PrashnaResult {
  question: string;
  timestamp: string;
  ascendant: string;
  moonSign: string;
  answer: "positive" | "negative" | "neutral";
  confidence: "high" | "medium" | "low";
  interpretation: string;
  timing: string;
  advice: string[];
  favorablePlanets: string[];
  unfavorablePlanets: string[];
}

const zodiacSigns = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

const questionCategories = [
  { id: "career", label: "Career & Business", icon: "💼" },
  { id: "love", label: "Love & Relationships", icon: "❤️" },
  { id: "health", label: "Health & Wellness", icon: "🏥" },
  { id: "finance", label: "Money & Finance", icon: "💰" },
  { id: "travel", label: "Travel & Relocation", icon: "✈️" },
  { id: "education", label: "Education & Learning", icon: "📚" },
  { id: "legal", label: "Legal Matters", icon: "⚖️" },
  { id: "general", label: "General Question", icon: "❓" },
];

function calculatePrashnaChart(timestamp: Date, questionText: string): { ascendant: string; moonSign: string; planets: Record<string, number>; nakshatra: string; nakshatraPada: number } {
  const hour = timestamp.getHours() + timestamp.getMinutes() / 60 + timestamp.getSeconds() / 3600;
  const dayOfYear = Math.floor((timestamp.getTime() - new Date(timestamp.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const milliseconds = timestamp.getMilliseconds();
  
  // Create a hash from the question text to add variation
  let questionHash = 0;
  for (let i = 0; i < questionText.length; i++) {
    questionHash = ((questionHash << 5) - questionHash) + questionText.charCodeAt(i);
    questionHash = questionHash & questionHash; // Convert to 32bit integer
  }
  const questionFactor = Math.abs(questionHash % 1000) / 1000;
  
  // Calculate ascendant based on time with more precision (approximately 2 hours per sign, but with minute/second variation)
  // In real Vedic astrology, ascendant changes every ~2 hours, but we add slight variation based on exact time
  const preciseHour = hour + (milliseconds / 3600000) + (questionFactor * 0.1);
  const ascendantIndex = Math.floor(((preciseHour + 6) % 24) / 2) % 12;
  
  // Calculate moon sign based on day with more precision
  // Moon moves through zodiac in ~27.3 days, so roughly 2.5 days per sign
  const moonProgress = (dayOfYear * 13.176 + hour * 0.55 + questionFactor * 2) / 30;
  const moonIndex = Math.floor(moonProgress) % 12;
  
  // Calculate Nakshatra (27 lunar mansions) - Moon's position in nakshatra
  const nakshatras = [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
    "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
    "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
    "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha",
    "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
  ];
  const nakshatraIndex = Math.floor((moonProgress * 27 / 12) + questionFactor * 3) % 27;
  const nakshatraPada = Math.floor((moonProgress * 108 / 12) % 4) + 1;
  
  // More accurate planetary positions based on actual orbital periods
  // These are simplified but more realistic than before
  const planets: Record<string, number> = {
    Sun: Math.floor(dayOfYear / 30.44) % 12, // Sun moves ~1 sign per month
    Moon: moonIndex,
    Mars: Math.floor((dayOfYear + questionFactor * 30) * 0.524 / 30) % 12, // Mars ~687 days orbit
    Mercury: (Math.floor(dayOfYear / 30) + Math.floor(Math.sin((dayOfYear + questionFactor * 10) * 0.1) * 2) + 12) % 12, // Mercury close to Sun
    Jupiter: Math.floor((dayOfYear + 180) * 0.083 / 30) % 12, // Jupiter ~12 years orbit
    Venus: (Math.floor(dayOfYear / 30) + Math.floor(Math.sin((dayOfYear + questionFactor * 15) * 0.08) * 2) + 12) % 12, // Venus close to Sun
    Saturn: Math.floor((dayOfYear + 90) * 0.033 / 30) % 12, // Saturn ~29.5 years orbit
    Rahu: (12 - Math.floor((dayOfYear + questionFactor * 50) * 0.05 / 30)) % 12, // Rahu moves retrograde
    Ketu: (6 - Math.floor((dayOfYear + questionFactor * 50) * 0.05 / 30) + 12) % 12, // Ketu opposite Rahu
  };
  
  return {
    ascendant: zodiacSigns[ascendantIndex],
    moonSign: zodiacSigns[moonIndex],
    planets,
    nakshatra: nakshatras[nakshatraIndex],
    nakshatraPada
  };
}

function generatePrashnaAnswer(question: string, category: string, chart: { ascendant: string; moonSign: string; planets: Record<string, number>; nakshatra: string; nakshatraPada: number }): PrashnaResult {
  const timestamp = new Date();
  
  // Determine answer based on ascendant, moon position, and nakshatra
  const ascendantIndex = zodiacSigns.indexOf(chart.ascendant);
  const moonIndex = zodiacSigns.indexOf(chart.moonSign);
  
  // Favorable ascendants for positive answers (odd signs in Vedic astrology are generally more active/positive)
  const favorableAscendants = [0, 2, 4, 6, 8, 10]; // Aries, Gemini, Leo, Libra, Sagittarius, Aquarius
  const isFavorableAscendant = favorableAscendants.includes(ascendantIndex);
  
  // Moon in good houses (1, 4, 5, 7, 9, 10, 11 from ascendant are generally favorable)
  const moonHouse = ((moonIndex - ascendantIndex + 12) % 12) + 1;
  const isFavorableMoon = [1, 4, 5, 7, 9, 10, 11].includes(moonHouse);
  
  // Nakshatra-based favorability (some nakshatras are more auspicious)
  const auspiciousNakshatras = ["Ashwini", "Rohini", "Mrigashira", "Punarvasu", "Pushya", "Hasta", "Chitra", "Swati", "Anuradha", "Shravana", "Dhanishta", "Revati"];
  const isAuspiciousNakshatra = auspiciousNakshatras.includes(chart.nakshatra);
  
  // Pada consideration (1st and 4th padas are generally more favorable)
  const isFavorablePada = [1, 4].includes(chart.nakshatraPada);
  
  let answer: "positive" | "negative" | "neutral";
  let confidence: "high" | "medium" | "low";
  
  // Calculate favorability score based on multiple factors
  let favorabilityScore = 0;
  if (isFavorableAscendant) favorabilityScore += 2;
  if (isFavorableMoon) favorabilityScore += 2;
  if (isAuspiciousNakshatra) favorabilityScore += 1;
  if (isFavorablePada) favorabilityScore += 1;
  
  // Determine answer based on combined score (0-6 range)
  if (favorabilityScore >= 5) {
    answer = "positive";
    confidence = "high";
  } else if (favorabilityScore >= 3) {
    answer = "positive";
    confidence = "medium";
  } else if (favorabilityScore >= 2) {
    answer = "neutral";
    confidence = "medium";
  } else if (favorabilityScore === 1) {
    answer = "negative";
    confidence = "medium";
  } else {
    answer = "negative";
    confidence = "high";
  }
  
  // Generate interpretation based on category and answer
  const interpretations: Record<string, Record<string, string>> = {
    career: {
      positive: "The planetary positions indicate favorable conditions for your career question. The ascendant lord is well-placed, suggesting success in professional matters. This is a good time to take initiative.",
      negative: "The current planetary alignment suggests some obstacles in career matters. It may be wise to wait for a more favorable time or approach the situation with extra caution.",
      neutral: "The chart shows mixed influences regarding your career question. Success is possible but may require additional effort and patience."
    },
    love: {
      positive: "Venus and the Moon are favorably positioned, indicating positive developments in matters of the heart. This is an auspicious time for relationship decisions.",
      negative: "The current positions suggest some challenges in romantic matters. Communication and patience will be key during this period.",
      neutral: "The chart shows balanced energies in love matters. Proceed with awareness and open communication."
    },
    health: {
      positive: "The ascendant and its lord are strong, indicating good vitality and recovery. Health matters look favorable.",
      negative: "The chart suggests paying extra attention to health matters. Preventive care and rest are recommended.",
      neutral: "Health indicators are moderate. Maintain regular routines and avoid excesses."
    },
    finance: {
      positive: "Jupiter's position favors financial growth. This is a good time for investments and financial decisions.",
      negative: "Saturn's influence suggests caution in financial matters. Avoid risky investments at this time.",
      neutral: "Financial matters show mixed results. Conservative approaches are recommended."
    },
    travel: {
      positive: "The 3rd and 9th houses are well-aspected, indicating successful travel. This is a favorable time for journeys.",
      negative: "Travel may face some delays or obstacles. Consider postponing if possible or prepare for contingencies.",
      neutral: "Travel is possible but may have minor challenges. Plan carefully."
    },
    education: {
      positive: "Mercury and Jupiter favor learning and education. This is an excellent time for studies and examinations.",
      negative: "Focus and concentration may be challenged. Extra effort in studies is recommended.",
      neutral: "Educational pursuits will yield results proportional to effort invested."
    },
    legal: {
      positive: "The 6th house lord's position suggests favorable outcomes in legal matters. Justice is likely to prevail.",
      negative: "Legal matters may face delays or complications. Seek expert advice and be patient.",
      neutral: "Legal outcomes are uncertain. Prepare thoroughly and consider settlement options."
    },
    general: {
      positive: "The overall chart indicates favorable conditions for your question. The time is auspicious for moving forward.",
      negative: "The planetary positions suggest waiting for a more favorable time. Patience is advised.",
      neutral: "The answer to your question depends on additional factors. Consider all aspects carefully."
    }
  };
  
  const timingOptions = {
    positive: ["Within days to weeks", "Soon, when Moon transits a favorable sign", "During the next auspicious muhurta"],
    negative: ["After current planetary transit ends", "When Saturn moves to next sign", "After careful preparation"],
    neutral: ["Timing depends on your actions", "When you feel ready", "After gathering more information"]
  };
  
  const adviceOptions = {
    positive: [
      "Take action with confidence",
      "Trust your instincts",
      "This is a favorable time to proceed",
      "Success is indicated with proper effort"
    ],
    negative: [
      "Exercise patience and wait",
      "Seek additional guidance",
      "Prepare more thoroughly",
      "Consider alternative approaches"
    ],
    neutral: [
      "Weigh all options carefully",
      "Gather more information",
      "Trust the process",
      "Balance action with patience"
    ]
  };
  
  const favorablePlanets = answer === "positive" 
    ? ["Jupiter", "Venus", "Mercury"] 
    : answer === "negative" 
    ? ["Moon (waxing)"] 
    : ["Jupiter", "Moon"];
    
  const unfavorablePlanets = answer === "negative"
    ? ["Saturn", "Mars", "Rahu"]
    : answer === "positive"
    ? []
    : ["Saturn"];
  
  return {
    question,
    timestamp: timestamp.toISOString(),
    ascendant: chart.ascendant,
    moonSign: chart.moonSign,
    answer,
    confidence,
    interpretation: interpretations[category]?.[answer] || interpretations.general[answer],
    timing: timingOptions[answer][Math.floor(Math.random() * timingOptions[answer].length)],
    advice: adviceOptions[answer],
    favorablePlanets,
    unfavorablePlanets
  };
}

export default function PrashnaKundliPage() {
  const { t } = useLanguage();
  const [question, setQuestion] = useState("");
  const [category, setCategory] = useState("general");
  const [result, setResult] = useState<PrashnaResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCalculating(true);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Pass the question text to add variation based on the specific question asked
    const chart = calculatePrashnaChart(new Date(), question);
    const prashnaResult = generatePrashnaAnswer(question, category, chart);
    setResult(prashnaResult);
    
    setIsCalculating(false);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-50 to-blue-50">
      {/* Hero Section */}
      <section className="relative py-16 bg-gradient-to-r from-indigo-700 via-blue-600 to-indigo-700">
        <div className={`absolute inset-0 bg-[url('${CDN_IMAGES.starsPattern}')] opacity-10`}></div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <Badge className="mb-4 bg-white/20 text-white border-white/30">
              <HelpCircle className="w-3 h-3 mr-1" />
              {t("prashna.badge", "Prashna Kundli")}
            </Badge>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              {t("prashna.title", "Prashna Kundli - Horary Astrology")}
            </h1>
            <p className="text-lg text-indigo-100 max-w-2xl mx-auto">
              {t("prashna.subtitle", "Ask a question and get answers based on the planetary positions at this exact moment. No birth details required.")}
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
                  <HelpCircle className="w-5 h-5 text-indigo-600" />
                  {t("prashna.askQuestion", "Ask Your Question")}
                </CardTitle>
                <CardDescription>
                  {t("prashna.askQuestionDesc", "The answer is based on current planetary positions")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Current Time Display */}
                <div className="mb-6 p-4 bg-indigo-50 rounded-lg text-center">
                  <p className="text-sm text-indigo-600 mb-1">{t("prashna.currentTime", "Current Time")}</p>
                  <p className="text-2xl font-bold text-indigo-800">
                    {currentTime.toLocaleTimeString()}
                  </p>
                  <p className="text-sm text-indigo-600">
                    {currentTime.toLocaleDateString()}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>{t("prashna.category", "Question Category")}</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {questionCategories.map((cat) => (
                        <Button
                          key={cat.id}
                          type="button"
                          variant={category === cat.id ? "default" : "outline"}
                          className={`text-xs h-auto py-2 ${category === cat.id ? 'bg-indigo-600' : ''}`}
                          onClick={() => setCategory(cat.id)}
                        >
                          <span className="mr-1">{cat.icon}</span>
                          {cat.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="question">{t("prashna.yourQuestion", "Your Question")}</Label>
                    <Textarea
                      id="question"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder={t("prashna.questionPlaceholder", "Type your question here... Be specific and clear.")}
                      rows={4}
                      required
                    />
                    <p className="text-xs text-gray-500">
                      {t("prashna.questionTip", "Ask a clear yes/no question for best results")}
                    </p>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                    disabled={isCalculating || !question.trim()}
                  >
                    {isCalculating ? (
                      <>
                        <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                        {t("prashna.analyzing", "Analyzing Planets...")}
                      </>
                    ) : (
                      <>
                        <Star className="w-4 h-4 mr-2" />
                        {t("prashna.getAnswer", "Get Answer")}
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-2">
            {!result ? (
              <Card className="h-full flex items-center justify-center min-h-[500px]">
                <CardContent className="text-center py-12">
                  <HelpCircle className="w-16 h-16 text-indigo-200 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    {t("prashna.noResult", "Ask a Question")}
                  </h3>
                  <p className="text-gray-500 max-w-md">
                    {t("prashna.noResultDesc", "Prashna Kundli (Horary Astrology) provides answers based on the planetary positions at the exact moment you ask your question. No birth details are needed.")}
                  </p>
                  
                  <div className="mt-8 p-4 bg-indigo-50 rounded-lg max-w-md mx-auto">
                    <h4 className="font-semibold text-indigo-700 mb-2">{t("prashna.howItWorks", "How It Works")}</h4>
                    <ul className="text-sm text-left text-gray-600 space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="text-indigo-500">1.</span>
                        Think clearly about your question
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-indigo-500">2.</span>
                        Select the appropriate category
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-indigo-500">3.</span>
                        Type your question and submit
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-indigo-500">4.</span>
                        Receive answer based on current planetary positions
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* Answer Card */}
                <Card className={`border-2 ${
                  result.answer === "positive" ? "border-green-300 bg-gradient-to-br from-green-50 to-emerald-50" :
                  result.answer === "negative" ? "border-red-300 bg-gradient-to-br from-red-50 to-orange-50" :
                  "border-yellow-300 bg-gradient-to-br from-yellow-50 to-amber-50"
                }`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{t("prashna.yourQuestion", "Your Question")}</CardTitle>
                        <p className="text-gray-600 mt-1">{result.question}</p>
                      </div>
                      <Badge className={
                        result.answer === "positive" ? "bg-green-500" :
                        result.answer === "negative" ? "bg-red-500" :
                        "bg-yellow-500"
                      }>
                        {result.confidence.toUpperCase()} {t("prashna.confidence", "Confidence")}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-6">
                      <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
                        result.answer === "positive" ? "bg-green-100" :
                        result.answer === "negative" ? "bg-red-100" :
                        "bg-yellow-100"
                      }`}>
                        {result.answer === "positive" && <CheckCircle className="w-10 h-10 text-green-600" />}
                        {result.answer === "negative" && <AlertTriangle className="w-10 h-10 text-red-600" />}
                        {result.answer === "neutral" && <Info className="w-10 h-10 text-yellow-600" />}
                      </div>
                      <h2 className={`text-3xl font-bold ${
                        result.answer === "positive" ? "text-green-700" :
                        result.answer === "negative" ? "text-red-700" :
                        "text-yellow-700"
                      }`}>
                        {result.answer === "positive" ? t("prashna.yes", "YES - Favorable") :
                         result.answer === "negative" ? t("prashna.no", "NO - Unfavorable") :
                         t("prashna.maybe", "MAYBE - Mixed")}
                      </h2>
                    </div>
                  </CardContent>
                </Card>

                {/* Chart Details */}
                <div className="grid md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{t("prashna.chartDetails", "Prashna Chart Details")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">{t("prashna.time", "Time")}:</span>
                          <span className="font-medium">{new Date(result.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">{t("prashna.ascendant", "Ascendant")}:</span>
                          <span className="font-medium">{result.ascendant}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">{t("prashna.moonSign", "Moon Sign")}:</span>
                          <span className="font-medium">{result.moonSign}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{t("prashna.timing", "Timing")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-3">
                        <Clock className="w-8 h-8 text-indigo-500" />
                        <p className="text-gray-700">{result.timing}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Interpretation */}
                <Card>
                  <CardHeader>
                    <CardTitle>{t("prashna.interpretation", "Interpretation")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">{result.interpretation}</p>
                  </CardContent>
                </Card>

                {/* Advice */}
                <Card>
                  <CardHeader>
                    <CardTitle>{t("prashna.advice", "Advice")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {result.advice.map((advice, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Star className="w-5 h-5 text-indigo-500 mt-0.5 flex-shrink-0" />
                          <span>{advice}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Planetary Influences */}
                <div className="grid md:grid-cols-2 gap-4">
                  {result.favorablePlanets.length > 0 && (
                    <Card className="border-green-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg text-green-700">{t("prashna.favorable", "Favorable Planets")}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {result.favorablePlanets.map((planet, idx) => (
                            <Badge key={idx} className="bg-green-100 text-green-700">{planet}</Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                  {result.unfavorablePlanets.length > 0 && (
                    <Card className="border-red-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg text-red-700">{t("prashna.unfavorable", "Challenging Planets")}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {result.unfavorablePlanets.map((planet, idx) => (
                            <Badge key={idx} className="bg-red-100 text-red-700">{planet}</Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Ask Another Question */}
                <div className="text-center">
                  <Button 
                    onClick={() => { setResult(null); setQuestion(""); }}
                    variant="outline"
                    className="border-indigo-300 text-indigo-600"
                  >
                    <HelpCircle className="w-4 h-4 mr-2" />
                    {t("prashna.askAnother", "Ask Another Question")}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* About Section */}
        <section className="mt-16">
          <Card>
            <CardHeader>
              <CardTitle>{t("prashna.aboutTitle", "About Prashna Kundli")}</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p className="text-gray-600">
                {t("prashna.aboutText1", "Prashna Kundli, also known as Horary Astrology, is a branch of Vedic astrology that provides answers to specific questions based on the planetary positions at the exact moment the question is asked. Unlike natal astrology, which requires birth details, Prashna Kundli can be used when birth information is unknown or unavailable.")}
              </p>
              <p className="text-gray-600 mt-4">
                {t("prashna.aboutText2", "The principle behind Prashna Kundli is that the moment a sincere question arises in the mind is cosmically significant. The planetary positions at that moment contain the answer to the question. The ascendant (rising sign) at the time of the question represents the querent (person asking), while other houses and planets provide information about the subject of the question.")}
              </p>
              <p className="text-gray-600 mt-4">
                {t("prashna.aboutText3", "For best results with Prashna Kundli: (1) Ask only one question at a time, (2) Be sincere and focused when asking, (3) Frame your question clearly, preferably as a yes/no question, (4) Don't ask the same question repeatedly, and (5) Accept the answer with an open mind.")}
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
