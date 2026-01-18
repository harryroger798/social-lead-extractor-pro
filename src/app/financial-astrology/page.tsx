"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LocationInput } from "@/components/ui/location-input";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import {
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  Star,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PiggyBank,
  Briefcase,
  Home,
  Car,
  GraduationCap,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  User,
  BarChart3,
  Wallet,
  Building,
  Gem,
} from "lucide-react";

interface BirthDetails {
  name: string;
  date: string;
  time: string;
  place: string;
}

interface FinancialPeriod {
  year: number;
  quarter: string;
  rating: number;
  trend: "up" | "down" | "stable";
  prediction: string;
  predictionHindi: string;
  opportunities: string[];
  opportunitiesHindi: string[];
  cautions: string[];
  cautionsHindi: string[];
}

interface WealthYoga {
  name: string;
  nameHindi: string;
  present: boolean;
  strength: "strong" | "moderate" | "weak";
  description: string;
  descriptionHindi: string;
}

interface InvestmentRecommendation {
  type: string;
  typeHindi: string;
  icon: string;
  suitability: "excellent" | "good" | "moderate" | "avoid";
  timing: string;
  timingHindi: string;
  reason: string;
  reasonHindi: string;
}

const investmentIcons: Record<string, React.ReactNode> = {
  stocks: <BarChart3 className="w-5 h-5" />,
  realestate: <Building className="w-5 h-5" />,
  gold: <Gem className="w-5 h-5" />,
  savings: <PiggyBank className="w-5 h-5" />,
  business: <Briefcase className="w-5 h-5" />,
  property: <Home className="w-5 h-5" />,
};

const sampleWealthYogas: WealthYoga[] = [
  {
    name: "Dhana Yoga",
    nameHindi: "धन योग",
    present: true,
    strength: "strong",
    description: "Lords of 2nd and 11th houses are well-placed, indicating good wealth accumulation potential.",
    descriptionHindi: "दूसरे और 11वें भाव के स्वामी अच्छी स्थिति में हैं, जो अच्छी धन संचय क्षमता दर्शाते हैं।",
  },
  {
    name: "Lakshmi Yoga",
    nameHindi: "लक्ष्मी योग",
    present: true,
    strength: "moderate",
    description: "Venus is strong and well-aspected, bringing financial blessings and luxury.",
    descriptionHindi: "शुक्र मजबूत और अच्छी दृष्टि में है, वित्तीय आशीर्वाद और विलासिता लाता है।",
  },
  {
    name: "Raj Yoga",
    nameHindi: "राज योग",
    present: true,
    strength: "moderate",
    description: "Connection between Kendra and Trikona lords brings success and recognition.",
    descriptionHindi: "केंद्र और त्रिकोण स्वामियों के बीच संबंध सफलता और मान्यता लाता है।",
  },
  {
    name: "Viparita Raja Yoga",
    nameHindi: "विपरीत राज योग",
    present: false,
    strength: "weak",
    description: "Not present in your chart. This yoga brings sudden gains from adversity.",
    descriptionHindi: "आपकी कुंडली में मौजूद नहीं है। यह योग विपरीत परिस्थितियों से अचानक लाभ लाता है।",
  },
];

const sampleFinancialPeriods: FinancialPeriod[] = [
  {
    year: 2026,
    quarter: "Q1 (Jan-Mar)",
    rating: 4,
    trend: "up",
    prediction: "Strong financial growth expected. Jupiter's aspect on 2nd house brings unexpected gains.",
    predictionHindi: "मजबूत वित्तीय वृद्धि की उम्मीद। दूसरे भाव पर गुरु की दृष्टि अप्रत्याशित लाभ लाती है।",
    opportunities: ["Investment in stocks", "Business expansion", "Property deals"],
    opportunitiesHindi: ["शेयरों में निवेश", "व्यापार विस्तार", "संपत्ति सौदे"],
    cautions: ["Avoid lending money", "Be careful with partnerships"],
    cautionsHindi: ["पैसे उधार देने से बचें", "साझेदारी में सावधान रहें"],
  },
  {
    year: 2026,
    quarter: "Q2 (Apr-Jun)",
    rating: 3,
    trend: "stable",
    prediction: "Moderate period. Focus on consolidation rather than new investments.",
    predictionHindi: "मध्यम अवधि। नए निवेश के बजाय समेकन पर ध्यान दें।",
    opportunities: ["Savings", "Debt repayment", "Skill development"],
    opportunitiesHindi: ["बचत", "ऋण चुकौती", "कौशल विकास"],
    cautions: ["Avoid speculation", "Don't take loans"],
    cautionsHindi: ["सट्टेबाजी से बचें", "ऋण न लें"],
  },
  {
    year: 2026,
    quarter: "Q3 (Jul-Sep)",
    rating: 5,
    trend: "up",
    prediction: "Excellent period for wealth accumulation. Multiple income sources likely.",
    predictionHindi: "धन संचय के लिए उत्कृष्ट अवधि। कई आय स्रोतों की संभावना।",
    opportunities: ["New income sources", "Promotions", "Inheritance"],
    opportunitiesHindi: ["नए आय स्रोत", "पदोन्नति", "विरासत"],
    cautions: ["Don't overspend", "Maintain emergency fund"],
    cautionsHindi: ["अधिक खर्च न करें", "आपातकालीन निधि बनाए रखें"],
  },
  {
    year: 2026,
    quarter: "Q4 (Oct-Dec)",
    rating: 3,
    trend: "down",
    prediction: "Saturn transit may bring some financial challenges. Plan expenses carefully.",
    predictionHindi: "शनि गोचर कुछ वित्तीय चुनौतियां ला सकता है। खर्चों की सावधानी से योजना बनाएं।",
    opportunities: ["Long-term investments", "Real estate", "Gold"],
    opportunitiesHindi: ["दीर्घकालिक निवेश", "रियल एस्टेट", "सोना"],
    cautions: ["Avoid risky investments", "Control unnecessary expenses"],
    cautionsHindi: ["जोखिम भरे निवेश से बचें", "अनावश्यक खर्चों पर नियंत्रण रखें"],
  },
];

const sampleInvestmentRecommendations: InvestmentRecommendation[] = [
  {
    type: "Stocks & Equities",
    typeHindi: "शेयर और इक्विटी",
    icon: "stocks",
    suitability: "good",
    timing: "Best during Mercury periods",
    timingHindi: "बुध की अवधि में सर्वोत्तम",
    reason: "Mercury in 11th house supports gains from trading",
    reasonHindi: "11वें भाव में बुध व्यापार से लाभ का समर्थन करता है",
  },
  {
    type: "Real Estate",
    typeHindi: "रियल एस्टेट",
    icon: "realestate",
    suitability: "excellent",
    timing: "2026-2028 is favorable",
    timingHindi: "2026-2028 अनुकूल है",
    reason: "Strong 4th house with Jupiter aspect indicates property gains",
    reasonHindi: "गुरु दृष्टि के साथ मजबूत चौथा भाव संपत्ति लाभ दर्शाता है",
  },
  {
    type: "Gold & Precious Metals",
    typeHindi: "सोना और कीमती धातुएं",
    icon: "gold",
    suitability: "excellent",
    timing: "Buy during Venus periods",
    timingHindi: "शुक्र की अवधि में खरीदें",
    reason: "Venus is strong in your chart, favoring luxury investments",
    reasonHindi: "आपकी कुंडली में शुक्र मजबूत है, विलासिता निवेश का समर्थन करता है",
  },
  {
    type: "Fixed Deposits & Savings",
    typeHindi: "सावधि जमा और बचत",
    icon: "savings",
    suitability: "good",
    timing: "Saturn periods favor savings",
    timingHindi: "शनि की अवधि बचत का समर्थन करती है",
    reason: "Saturn's influence promotes disciplined saving habits",
    reasonHindi: "शनि का प्रभाव अनुशासित बचत आदतों को बढ़ावा देता है",
  },
  {
    type: "Business Ventures",
    typeHindi: "व्यापारिक उद्यम",
    icon: "business",
    suitability: "moderate",
    timing: "Start during Jupiter-Mercury periods",
    timingHindi: "गुरु-बुध की अवधि में शुरू करें",
    reason: "10th house needs strengthening for business success",
    reasonHindi: "व्यापारिक सफलता के लिए 10वें भाव को मजबूत करने की आवश्यकता है",
  },
];

export default function FinancialAstrologyPage() {
  const { t, language } = useLanguage();
  const [birthDetails, setBirthDetails] = useState<BirthDetails>({
    name: "",
    date: "",
    time: "",
    place: "",
  });
  const [showResults, setShowResults] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCalculating(true);
    
    setTimeout(() => {
      setShowResults(true);
      setIsCalculating(false);
    }, 2000);
  };

  const getSuitabilityColor = (suitability: string) => {
    switch (suitability) {
      case "excellent":
        return "bg-green-100 text-green-800 border-green-200";
      case "good":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "moderate":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "avoid":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case "strong":
        return "text-green-600";
      case "moderate":
        return "text-amber-600";
      case "weak":
        return "text-gray-400";
      default:
        return "text-gray-600";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      case "down":
        return <TrendingDown className="w-5 h-5 text-red-500" />;
      default:
        return <ArrowRight className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-emerald-100 text-emerald-800">
            {t("financialAstrology.badge", "Wealth & Prosperity")}
          </Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {t("financialAstrology.title", "Financial Astrology")}
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {t("financialAstrology.subtitle", "Discover your wealth potential, best investment periods, and financial opportunities based on your Vedic birth chart.")}
          </p>
        </div>

        {!showResults ? (
          <Card className="max-w-xl mx-auto border-emerald-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-emerald-600" />
                {t("financialAstrology.enterDetails", "Enter Your Birth Details")}
              </CardTitle>
              <CardDescription>
                {t("financialAstrology.enterDetailsDesc", "Get personalized financial predictions based on your birth chart")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t("calculator.fullName", "Full Name")}</Label>
                  <Input
                    id="name"
                    placeholder={t("calculator.enterName", "Enter your name")}
                    value={birthDetails.name}
                    onChange={(e) => setBirthDetails({ ...birthDetails, name: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="date" className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {t("calculator.dateOfBirth", "Date of Birth")}
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
                    {t("calculator.timeOfBirth", "Time of Birth")}
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
                    {t("calculator.placeOfBirth", "Place of Birth")}
                  </Label>
                  <LocationInput
                    id="place"
                    placeholder={t("calculator.searchCity", "Search city...")}
                    value={birthDetails.place}
                    onChange={(e) => setBirthDetails({ ...birthDetails, place: e.target.value })}
                    onLocationSelect={(loc) => setBirthDetails({ ...birthDetails, place: loc })}
                    required
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                  disabled={isCalculating}
                >
                  {isCalculating ? (
                    <>
                      <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                      {t("financialAstrology.analyzing", "Analyzing Your Chart...")}
                    </>
                  ) : (
                    <>
                      <DollarSign className="w-4 h-4 mr-2" />
                      {t("financialAstrology.analyze", "Analyze My Financial Potential")}
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setShowResults(false)}>
                {t("financialAstrology.newAnalysis", "New Analysis")}
              </Button>
            </div>

            <Card className="border-emerald-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-emerald-600" />
                  {t("financialAstrology.wealthYogas", "Wealth Yogas in Your Chart")}
                </CardTitle>
                <CardDescription>
                  {t("financialAstrology.wealthYogasDesc", "Special planetary combinations that indicate wealth potential")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {sampleWealthYogas.map((yoga, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${
                        yoga.present ? "bg-emerald-50 border-emerald-200" : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {yoga.present ? (
                            <CheckCircle className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <AlertTriangle className="w-5 h-5 text-gray-400" />
                          )}
                          <span className="font-semibold text-gray-900">
                            {language === "hi" ? yoga.nameHindi : yoga.name}
                          </span>
                        </div>
                        <Badge className={`${yoga.present ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-600"}`}>
                          {yoga.present ? t(`financialAstrology.strength.${yoga.strength}`, yoga.strength) : t("financialAstrology.notPresent", "Not Present")}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        {language === "hi" ? yoga.descriptionHindi : yoga.description}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  {t("financialAstrology.quarterlyForecast", "2026 Quarterly Financial Forecast")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sampleFinancialPeriods.map((period, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {getTrendIcon(period.trend)}
                          <div>
                            <span className="font-semibold text-gray-900">{period.quarter}</span>
                            <div className="flex gap-1 mt-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <= period.rating ? "fill-amber-400 text-amber-400" : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <Badge className={period.trend === "up" ? "bg-green-100 text-green-800" : period.trend === "down" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"}>
                          {t(`financialAstrology.trend.${period.trend}`, period.trend)}
                        </Badge>
                      </div>
                      <p className="text-gray-700 mb-3">
                        {language === "hi" ? period.predictionHindi : period.prediction}
                      </p>
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-green-700 mb-1">{t("financialAstrology.opportunities", "Opportunities")}:</p>
                          <ul className="space-y-1">
                            {(language === "hi" ? period.opportunitiesHindi : period.opportunities).map((opp, i) => (
                              <li key={i} className="flex items-center gap-1 text-gray-600">
                                <CheckCircle className="w-3 h-3 text-green-500" />
                                {opp}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="font-medium text-red-700 mb-1">{t("financialAstrology.cautions", "Cautions")}:</p>
                          <ul className="space-y-1">
                            {(language === "hi" ? period.cautionsHindi : period.cautions).map((caution, i) => (
                              <li key={i} className="flex items-center gap-1 text-gray-600">
                                <AlertTriangle className="w-3 h-3 text-red-500" />
                                {caution}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-purple-600" />
                  {t("financialAstrology.investmentGuide", "Personalized Investment Guide")}
                </CardTitle>
                <CardDescription>
                  {t("financialAstrology.investmentGuideDesc", "Best investment options based on your planetary positions")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sampleInvestmentRecommendations.map((rec, index) => (
                    <div key={index} className={`p-4 rounded-lg border ${getSuitabilityColor(rec.suitability)}`}>
                      <div className="flex items-center gap-2 mb-3">
                        {investmentIcons[rec.icon]}
                        <span className="font-semibold">
                          {language === "hi" ? rec.typeHindi : rec.type}
                        </span>
                      </div>
                      <Badge className={getSuitabilityColor(rec.suitability)}>
                        {t(`financialAstrology.suitability.${rec.suitability}`, rec.suitability)}
                      </Badge>
                      <p className="text-sm text-gray-600 mt-2">
                        <span className="font-medium">{t("financialAstrology.timing", "Timing")}:</span>{" "}
                        {language === "hi" ? rec.timingHindi : rec.timing}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {language === "hi" ? rec.reasonHindi : rec.reason}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-amber-200">
              <CardHeader>
                <CardTitle>{t("financialAstrology.disclaimer", "Important Disclaimer")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  {t("financialAstrology.disclaimerText", "Financial astrology provides guidance based on planetary positions and should not be considered as financial advice. Always consult with qualified financial advisors before making investment decisions. Past planetary patterns do not guarantee future results.")}
                </p>
                <div className="flex gap-4 mt-4 flex-wrap">
                  <Link href="/consultation">
                    <Button variant="outline">
                      {t("financialAstrology.consultAstrologer", "Consult Expert Astrologer")}
                    </Button>
                  </Link>
                  <Link href="/life-timeline">
                    <Button className="bg-gradient-to-r from-purple-500 to-indigo-600">
                      {t("financialAstrology.viewLifeTimeline", "View Life Timeline")}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
