"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { LocationInput } from "@/components/ui/location-input";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { getCurrentYear } from "@/lib/utils";
import {
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  Star,
  Heart,
  Briefcase,
  Home,
  GraduationCap,
  Plane,
  Baby,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  User,
} from "lucide-react";

interface BirthDetails {
  name: string;
  date: string;
  time: string;
  place: string;
}

interface LifeEvent {
  year: number;
  month?: number;
  category: "career" | "love" | "finance" | "health" | "travel" | "family" | "education" | "spiritual";
  title: string;
  titleHindi: string;
  description: string;
  descriptionHindi: string;
  probability: number;
  dashaLord: string;
  antardasha: string;
  impact: "positive" | "negative" | "neutral";
}

interface DashaPeriod {
  planet: string;
  planetHindi: string;
  startYear: number;
  endYear: number;
  duration: number;
  currentProgress?: number;
  theme: string;
  themeHindi: string;
}

const categoryIcons: Record<string, React.ReactNode> = {
  career: <Briefcase className="w-5 h-5" />,
  love: <Heart className="w-5 h-5" />,
  finance: <TrendingUp className="w-5 h-5" />,
  health: <AlertTriangle className="w-5 h-5" />,
  travel: <Plane className="w-5 h-5" />,
  family: <Home className="w-5 h-5" />,
  education: <GraduationCap className="w-5 h-5" />,
  spiritual: <Star className="w-5 h-5" />,
};

const categoryColors: Record<string, string> = {
  career: "bg-blue-100 text-blue-800 border-blue-200",
  love: "bg-pink-100 text-pink-800 border-pink-200",
  finance: "bg-green-100 text-green-800 border-green-200",
  health: "bg-red-100 text-red-800 border-red-200",
  travel: "bg-purple-100 text-purple-800 border-purple-200",
  family: "bg-amber-100 text-amber-800 border-amber-200",
  education: "bg-indigo-100 text-indigo-800 border-indigo-200",
  spiritual: "bg-teal-100 text-teal-800 border-teal-200",
};

const sampleDashaPeriods: DashaPeriod[] = [
  {
    planet: "Jupiter",
    planetHindi: "गुरु",
    startYear: 2020,
    endYear: 2036,
    duration: 16,
    currentProgress: 37.5,
    theme: "Expansion, wisdom, growth, spirituality",
    themeHindi: "विस्तार, ज्ञान, विकास, आध्यात्मिकता",
  },
  {
    planet: "Saturn",
    planetHindi: "शनि",
    startYear: 2036,
    endYear: 2055,
    duration: 19,
    theme: "Discipline, karma, hard work, responsibility",
    themeHindi: "अनुशासन, कर्म, कड़ी मेहनत, जिम्मेदारी",
  },
  {
    planet: "Mercury",
    planetHindi: "बुध",
    startYear: 2055,
    endYear: 2072,
    duration: 17,
    theme: "Communication, intellect, business, learning",
    themeHindi: "संचार, बुद्धि, व्यापार, सीखना",
  },
];

const sampleLifeEvents: LifeEvent[] = [
  {
    year: getCurrentYear(),
    month: 4,
    category: "career",
    title: "Career Advancement Opportunity",
    titleHindi: "करियर में उन्नति का अवसर",
    description: "Jupiter-Mercury period brings excellent opportunities for professional growth. Expect recognition and possible promotion.",
    descriptionHindi: "गुरु-बुध की अवधि पेशेवर विकास के लिए उत्कृष्ट अवसर लाती है। मान्यता और संभावित पदोन्नति की उम्मीद करें।",
    probability: 78,
    dashaLord: "Jupiter",
    antardasha: "Mercury",
    impact: "positive",
  },
  {
    year: getCurrentYear(),
    month: 8,
    category: "love",
    title: "Romantic Connection",
    titleHindi: "रोमांटिक संबंध",
    description: "Venus transit through your 7th house indicates potential for meaningful romantic connection or deepening of existing relationship.",
    descriptionHindi: "आपके 7वें भाव से शुक्र का गोचर सार्थक रोमांटिक संबंध या मौजूदा रिश्ते को गहरा करने की संभावना दर्शाता है।",
    probability: 65,
    dashaLord: "Jupiter",
    antardasha: "Venus",
    impact: "positive",
  },
  {
    year: 2027,
    month: 2,
    category: "finance",
    title: "Financial Growth Period",
    titleHindi: "वित्तीय विकास का समय",
    description: "Strong 2nd and 11th house activation suggests increased income and wealth accumulation opportunities.",
    descriptionHindi: "मजबूत दूसरे और 11वें भाव की सक्रियता बढ़ी हुई आय और धन संचय के अवसरों का संकेत देती है।",
    probability: 72,
    dashaLord: "Jupiter",
    antardasha: "Sun",
    impact: "positive",
  },
  {
    year: 2027,
    month: 9,
    category: "travel",
    title: "Long Distance Travel",
    titleHindi: "लंबी दूरी की यात्रा",
    description: "9th house activation indicates possibility of foreign travel or pilgrimage. Educational travel also favored.",
    descriptionHindi: "9वें भाव की सक्रियता विदेश यात्रा या तीर्थयात्रा की संभावना दर्शाती है। शैक्षिक यात्रा भी अनुकूल है।",
    probability: 58,
    dashaLord: "Jupiter",
    antardasha: "Moon",
    impact: "positive",
  },
  {
    year: 2028,
    month: 3,
    category: "health",
    title: "Health Attention Needed",
    titleHindi: "स्वास्थ्य पर ध्यान आवश्यक",
    description: "Saturn aspect on 6th house suggests need for health vigilance. Focus on preventive care and regular checkups.",
    descriptionHindi: "6वें भाव पर शनि की दृष्टि स्वास्थ्य सतर्कता की आवश्यकता का संकेत देती है। निवारक देखभाल और नियमित जांच पर ध्यान दें।",
    probability: 45,
    dashaLord: "Jupiter",
    antardasha: "Mars",
    impact: "negative",
  },
  {
    year: 2028,
    month: 11,
    category: "family",
    title: "Family Celebration",
    titleHindi: "पारिवारिक उत्सव",
    description: "4th house activation with benefic aspects indicates happy family events, possibly related to property or home.",
    descriptionHindi: "शुभ दृष्टि के साथ 4वें भाव की सक्रियता खुशहाल पारिवारिक आयोजनों का संकेत देती है, संभवतः संपत्ति या घर से संबंधित।",
    probability: 62,
    dashaLord: "Jupiter",
    antardasha: "Rahu",
    impact: "positive",
  },
  {
    year: 2029,
    month: 6,
    category: "education",
    title: "Learning & Skill Development",
    titleHindi: "सीखना और कौशल विकास",
    description: "Mercury influence brings opportunities for higher education, certifications, or skill enhancement.",
    descriptionHindi: "बुध का प्रभाव उच्च शिक्षा, प्रमाणपत्र, या कौशल वृद्धि के अवसर लाता है।",
    probability: 70,
    dashaLord: "Jupiter",
    antardasha: "Mercury",
    impact: "positive",
  },
  {
    year: 2030,
    month: 1,
    category: "spiritual",
    title: "Spiritual Awakening",
    titleHindi: "आध्यात्मिक जागृति",
    description: "Ketu period brings deep spiritual insights and potential for meditation practices or spiritual retreats.",
    descriptionHindi: "केतु की अवधि गहरी आध्यात्मिक अंतर्दृष्टि और ध्यान अभ्यास या आध्यात्मिक एकांतवास की संभावना लाती है।",
    probability: 55,
    dashaLord: "Jupiter",
    antardasha: "Ketu",
    impact: "neutral",
  },
];

export default function LifeTimelinePage() {
  const { t, language } = useLanguage();
  const [birthDetails, setBirthDetails] = useState<BirthDetails>({
    name: "",
    date: "",
    time: "",
    place: "",
  });
  const [showTimeline, setShowTimeline] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCalculating(true);
    
    setTimeout(() => {
      setShowTimeline(true);
      setIsCalculating(false);
    }, 2000);
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "positive":
        return "border-l-green-500 bg-green-50";
      case "negative":
        return "border-l-red-500 bg-red-50";
      default:
        return "border-l-gray-500 bg-gray-50";
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case "positive":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "negative":
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Star className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-indigo-100 text-indigo-800">
            {t("lifeTimeline.badge", "Predictive Astrology")}
          </Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {t("lifeTimeline.title", "Life Event Timeline")}
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {t("lifeTimeline.subtitle", "Discover your future life events based on Vimshottari Dasha system. Get personalized predictions for career, love, finance, and more.")}
          </p>
        </div>

        {!showTimeline ? (
          <Card className="max-w-xl mx-auto border-indigo-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-600" />
                {t("lifeTimeline.enterDetails", "Enter Your Birth Details")}
              </CardTitle>
              <CardDescription>
                {t("lifeTimeline.enterDetailsDesc", "Provide accurate birth information for precise life event predictions")}
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
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                  disabled={isCalculating}
                >
                  {isCalculating ? (
                    <>
                      <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                      {t("lifeTimeline.calculating", "Calculating Your Timeline...")}
                    </>
                  ) : (
                    <>
                      <Star className="w-4 h-4 mr-2" />
                      {t("lifeTimeline.generateTimeline", "Generate Life Timeline")}
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            <Card className="border-indigo-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-indigo-600" />
                      {t("lifeTimeline.dashaOverview", "Dasha Overview")}
                    </CardTitle>
                    <CardDescription>
                      {t("lifeTimeline.dashaOverviewDesc", "Your Vimshottari Dasha planetary periods")}
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowTimeline(false)}
                  >
                    {t("lifeTimeline.newCalculation", "New Calculation")}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sampleDashaPeriods.map((period, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${
                        period.currentProgress !== undefined
                          ? "border-indigo-300 bg-indigo-50"
                          : "border-gray-200 bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">
                            {language === "hi" ? period.planetHindi : period.planet} {t("lifeTimeline.mahadasha", "Mahadasha")}
                          </span>
                          {period.currentProgress !== undefined && (
                            <Badge className="bg-indigo-100 text-indigo-800">
                              {t("lifeTimeline.current", "Current")}
                            </Badge>
                          )}
                        </div>
                        <span className="text-sm text-gray-600">
                          {period.startYear} - {period.endYear} ({period.duration} {t("lifeTimeline.years", "years")})
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {language === "hi" ? period.themeHindi : period.theme}
                      </p>
                      {period.currentProgress !== undefined && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                            <span>{t("lifeTimeline.progress", "Progress")}</span>
                            <span>{period.currentProgress}%</span>
                          </div>
                          <Progress value={period.currentProgress} className="h-2" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  {t("lifeTimeline.predictedEvents", "Predicted Life Events")}
                </CardTitle>
                <CardDescription>
                  {t("lifeTimeline.predictedEventsDesc", "Major life events predicted based on your Dasha periods and transits")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200" />
                  
                  <div className="space-y-6">
                    {sampleLifeEvents.map((event, index) => (
                      <div key={index} className="relative flex gap-4">
                        <div className="flex-shrink-0 w-16 text-right">
                          <div className="font-bold text-gray-900">{event.year}</div>
                          {event.month && (
                            <div className="text-xs text-gray-500">
                              {new Date(event.year, event.month - 1).toLocaleDateString(
                                language === "hi" ? "hi-IN" : "en-US",
                                { month: "short" }
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-shrink-0 w-4 h-4 mt-1 rounded-full bg-white border-2 border-purple-500 z-10" />
                        
                        <div className={`flex-1 p-4 rounded-lg border-l-4 ${getImpactColor(event.impact)}`}>
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className={`p-1.5 rounded-lg ${categoryColors[event.category]}`}>
                                {categoryIcons[event.category]}
                              </span>
                              <div>
                                <h4 className="font-semibold text-gray-900">
                                  {language === "hi" ? event.titleHindi : event.title}
                                </h4>
                                <p className="text-xs text-gray-500">
                                  {event.dashaLord}-{event.antardasha} {t("lifeTimeline.period", "Period")}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {getImpactIcon(event.impact)}
                              <Badge variant="outline" className="text-xs">
                                {event.probability}% {t("lifeTimeline.probability", "probability")}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600">
                            {language === "hi" ? event.descriptionHindi : event.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-amber-200">
                <CardHeader>
                  <CardTitle>{t("lifeTimeline.disclaimer", "Important Note")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    {t("lifeTimeline.disclaimerText", "These predictions are based on Vedic astrology principles and should be used as guidance only. Life events are influenced by many factors including personal choices and karma. For detailed analysis and personalized remedies, consult with our expert astrologers.")}
                  </p>
                  <Link href="/consultation">
                    <Button className="mt-4 w-full" variant="outline">
                      {t("lifeTimeline.consultExpert", "Consult Expert Astrologer")}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle>{t("lifeTimeline.shareTimeline", "Share Your Timeline")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    {t("lifeTimeline.shareTimelineDesc", "Download or share your life event timeline with friends and family.")}
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1">
                      {t("share.download", "Download")}
                    </Button>
                    <Button variant="outline" className="flex-1">
                      {t("share.share", "Share")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
