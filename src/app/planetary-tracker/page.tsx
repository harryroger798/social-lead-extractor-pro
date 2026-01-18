"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import {
  Sun,
  Moon,
  Star,
  Sparkles,
  ArrowRight,
  Bell,
  RefreshCw,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

interface PlanetPosition {
  name: string;
  nameHindi: string;
  symbol: string;
  sign: string;
  signHindi: string;
  degree: number;
  nakshatra: string;
  nakshatraHindi: string;
  retrograde: boolean;
  speed: "fast" | "normal" | "slow" | "stationary";
  houseEffect: string;
}

interface TransitEvent {
  date: string;
  event: string;
  eventHindi: string;
  planet: string;
  impact: "positive" | "negative" | "neutral";
  description: string;
  descriptionHindi: string;
}

const zodiacSigns = [
  { en: "Aries", hi: "मेष", symbol: "♈" },
  { en: "Taurus", hi: "वृषभ", symbol: "♉" },
  { en: "Gemini", hi: "मिथुन", symbol: "♊" },
  { en: "Cancer", hi: "कर्क", symbol: "♋" },
  { en: "Leo", hi: "सिंह", symbol: "♌" },
  { en: "Virgo", hi: "कन्या", symbol: "♍" },
  { en: "Libra", hi: "तुला", symbol: "♎" },
  { en: "Scorpio", hi: "वृश्चिक", symbol: "♏" },
  { en: "Sagittarius", hi: "धनु", symbol: "♐" },
  { en: "Capricorn", hi: "मकर", symbol: "♑" },
  { en: "Aquarius", hi: "कुंभ", symbol: "♒" },
  { en: "Pisces", hi: "मीन", symbol: "♓" },
];

const planetData: PlanetPosition[] = [
  {
    name: "Sun",
    nameHindi: "सूर्य",
    symbol: "☉",
    sign: "Capricorn",
    signHindi: "मकर",
    degree: 27.5,
    nakshatra: "Dhanishta",
    nakshatraHindi: "धनिष्ठा",
    retrograde: false,
    speed: "normal",
    houseEffect: "Career focus, authority matters",
  },
  {
    name: "Moon",
    nameHindi: "चंद्र",
    symbol: "☽",
    sign: "Gemini",
    signHindi: "मिथुन",
    degree: 15.3,
    nakshatra: "Ardra",
    nakshatraHindi: "आर्द्रा",
    retrograde: false,
    speed: "fast",
    houseEffect: "Communication, learning",
  },
  {
    name: "Mars",
    nameHindi: "मंगल",
    symbol: "♂",
    sign: "Cancer",
    signHindi: "कर्क",
    degree: 8.7,
    nakshatra: "Pushya",
    nakshatraHindi: "पुष्य",
    retrograde: false,
    speed: "normal",
    houseEffect: "Home, emotions, property",
  },
  {
    name: "Mercury",
    nameHindi: "बुध",
    symbol: "☿",
    sign: "Capricorn",
    signHindi: "मकर",
    degree: 12.4,
    nakshatra: "Shravana",
    nakshatraHindi: "श्रवण",
    retrograde: false,
    speed: "fast",
    houseEffect: "Career communication",
  },
  {
    name: "Jupiter",
    nameHindi: "गुरु",
    symbol: "♃",
    sign: "Taurus",
    signHindi: "वृषभ",
    degree: 18.9,
    nakshatra: "Rohini",
    nakshatraHindi: "रोहिणी",
    retrograde: false,
    speed: "slow",
    houseEffect: "Wealth, values, speech",
  },
  {
    name: "Venus",
    nameHindi: "शुक्र",
    symbol: "♀",
    sign: "Aquarius",
    signHindi: "कुंभ",
    degree: 5.2,
    nakshatra: "Dhanishta",
    nakshatraHindi: "धनिष्ठा",
    retrograde: false,
    speed: "normal",
    houseEffect: "Friendships, gains",
  },
  {
    name: "Saturn",
    nameHindi: "शनि",
    symbol: "♄",
    sign: "Pisces",
    signHindi: "मीन",
    degree: 22.1,
    nakshatra: "Revati",
    nakshatraHindi: "रेवती",
    retrograde: false,
    speed: "slow",
    houseEffect: "Spirituality, expenses",
  },
  {
    name: "Rahu",
    nameHindi: "राहु",
    symbol: "☊",
    sign: "Pisces",
    signHindi: "मीन",
    degree: 28.6,
    nakshatra: "Revati",
    nakshatraHindi: "रेवती",
    retrograde: true,
    speed: "slow",
    houseEffect: "Spiritual transformation",
  },
  {
    name: "Ketu",
    nameHindi: "केतु",
    symbol: "☋",
    sign: "Virgo",
    signHindi: "कन्या",
    degree: 28.6,
    nakshatra: "Chitra",
    nakshatraHindi: "चित्रा",
    retrograde: true,
    speed: "slow",
    houseEffect: "Health, service, detachment",
  },
];

const upcomingTransits: TransitEvent[] = [
  {
    date: "2026-01-25",
    event: "Sun enters Aquarius",
    eventHindi: "सूर्य कुंभ राशि में प्रवेश",
    planet: "Sun",
    impact: "neutral",
    description: "Focus shifts to humanitarian pursuits and innovation",
    descriptionHindi: "मानवतावादी कार्यों और नवाचार पर ध्यान केंद्रित",
  },
  {
    date: "2026-02-03",
    event: "Venus enters Pisces (Exalted)",
    eventHindi: "शुक्र मीन राशि में (उच्च)",
    planet: "Venus",
    impact: "positive",
    description: "Excellent time for love, creativity, and spiritual growth",
    descriptionHindi: "प्रेम, रचनात्मकता और आध्यात्मिक विकास के लिए उत्तम समय",
  },
  {
    date: "2026-02-14",
    event: "Mercury Retrograde begins",
    eventHindi: "बुध वक्री प्रारंभ",
    planet: "Mercury",
    impact: "negative",
    description: "Review communications, avoid new contracts",
    descriptionHindi: "संचार की समीक्षा करें, नए अनुबंधों से बचें",
  },
  {
    date: "2026-03-10",
    event: "Full Moon in Virgo",
    eventHindi: "कन्या राशि में पूर्णिमा",
    planet: "Moon",
    impact: "neutral",
    description: "Health and service matters come to completion",
    descriptionHindi: "स्वास्थ्य और सेवा के मामले पूर्ण होते हैं",
  },
  {
    date: "2026-03-29",
    event: "Solar Eclipse in Aries",
    eventHindi: "मेष राशि में सूर्य ग्रहण",
    planet: "Sun",
    impact: "negative",
    description: "New beginnings, but avoid major decisions",
    descriptionHindi: "नई शुरुआत, लेकिन बड़े निर्णयों से बचें",
  },
];

export default function PlanetaryTrackerPage() {
  const { t, language } = useLanguage();
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setLastUpdated(new Date());
      setIsRefreshing(false);
    }, 1000);
  };

  const getSpeedColor = (speed: string) => {
    switch (speed) {
      case "fast":
        return "text-green-600";
      case "normal":
        return "text-blue-600";
      case "slow":
        return "text-amber-600";
      case "stationary":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case "positive":
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case "negative":
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <ArrowRight className="w-4 h-4 text-gray-500" />;
    }
  };

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case "positive":
        return <Badge className="bg-green-100 text-green-800">{t("planetaryTracker.favorable", "Favorable")}</Badge>;
      case "negative":
        return <Badge className="bg-red-100 text-red-800">{t("planetaryTracker.challenging", "Challenging")}</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{t("planetaryTracker.neutral", "Neutral")}</Badge>;
    }
  };

  return (
    <div className="py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-purple-100 text-purple-800">
            {t("planetaryTracker.badge", "Live Planetary Positions")}
          </Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {t("planetaryTracker.title", "Real-Time Planetary Tracker")}
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {t("planetaryTracker.subtitle", "Track current planetary positions, upcoming transits, and cosmic events. Stay informed about how planetary movements affect your life.")}
          </p>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>
              {t("planetaryTracker.lastUpdated", "Last updated")}: {lastUpdated.toLocaleTimeString()}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
            {t("planetaryTracker.refresh", "Refresh")}
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2">
            <Card className="border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-purple-600" />
                  {t("planetaryTracker.currentPositions", "Current Planetary Positions")}
                </CardTitle>
                <CardDescription>
                  {t("planetaryTracker.currentPositionsDesc", "Real-time positions of all nine planets (Navagraha)")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {planetData.map((planet) => (
                    <div
                      key={planet.name}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-purple-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-3xl">{planet.symbol}</div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900">
                              {language === "hi" ? planet.nameHindi : planet.name}
                            </span>
                            {planet.retrograde && (
                              <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                                {t("planetaryTracker.retrograde", "Retrograde")}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            {language === "hi" ? planet.nakshatraHindi : planet.nakshatra}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-purple-700">
                            {language === "hi" ? planet.signHindi : planet.sign}
                          </span>
                          <span className="text-gray-500">{planet.degree.toFixed(1)}°</span>
                        </div>
                        <p className={`text-xs ${getSpeedColor(planet.speed)}`}>
                          {t(`planetaryTracker.speed.${planet.speed}`, planet.speed)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-amber-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  {t("planetaryTracker.activeAlerts", "Active Alerts")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">♄</span>
                      <span className="font-medium text-amber-800">
                        {t("planetaryTracker.saturnInPisces", "Saturn in Pisces")}
                      </span>
                    </div>
                    <p className="text-sm text-amber-700">
                      {t("planetaryTracker.sadeSatiActive", "Sade Sati active for Aquarius, Pisces, Aries Moon signs")}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">♃</span>
                      <span className="font-medium text-blue-800">
                        {t("planetaryTracker.jupiterInTaurus", "Jupiter in Taurus")}
                      </span>
                    </div>
                    <p className="text-sm text-blue-700">
                      {t("planetaryTracker.jupiterBlessings", "Favorable for Taurus, Cancer, Virgo, Capricorn")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Moon className="w-5 h-5 text-green-600" />
                  {t("planetaryTracker.todayMoon", "Today's Moon")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-5xl mb-2">🌓</div>
                  <p className="font-semibold text-gray-900">
                    {t("planetaryTracker.waxingMoon", "Waxing Moon")}
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    {language === "hi" ? "मिथुन राशि में" : "in Gemini"}
                  </p>
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-sm text-green-800">
                      {t("planetaryTracker.goodFor", "Good for")}: {t("planetaryTracker.communication", "Communication, learning, short travels")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="border-blue-200 mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              {t("planetaryTracker.upcomingTransits", "Upcoming Transits & Events")}
            </CardTitle>
            <CardDescription>
              {t("planetaryTracker.upcomingTransitsDesc", "Important planetary movements in the coming weeks")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingTransits.map((transit, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <div className="flex-shrink-0 w-16 text-center">
                    <div className="text-sm font-medium text-gray-900">
                      {new Date(transit.date).toLocaleDateString(language === "hi" ? "hi-IN" : "en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getImpactIcon(transit.impact)}
                      <span className="font-semibold text-gray-900">
                        {language === "hi" ? transit.eventHindi : transit.event}
                      </span>
                      {getImpactBadge(transit.impact)}
                    </div>
                    <p className="text-sm text-gray-600">
                      {language === "hi" ? transit.descriptionHindi : transit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="border-purple-200">
            <CardHeader>
              <CardTitle>{t("planetaryTracker.personalizedAlerts", "Get Personalized Alerts")}</CardTitle>
              <CardDescription>
                {t("planetaryTracker.personalizedAlertsDesc", "Receive notifications when planets transit your birth chart")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                {t("planetaryTracker.generateKundli", "Generate your Kundli to receive personalized transit alerts based on your birth chart.")}
              </p>
              <Link href="/tools/kundli-calculator">
                <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700">
                  <Sparkles className="w-4 h-4 mr-2" />
                  {t("planetaryTracker.generateFreeKundli", "Generate Free Kundli")}
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-amber-200">
            <CardHeader>
              <CardTitle>{t("planetaryTracker.learnMore", "Learn About Transits")}</CardTitle>
              <CardDescription>
                {t("planetaryTracker.learnMoreDesc", "Understand how planetary transits affect your life")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Link href="/transits/saturn-transit-2026" className="block">
                  <Button variant="outline" className="w-full justify-between">
                    {t("planetaryTracker.saturnTransit2026", "Saturn Transit 2026")}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/transits/jupiter-transit-2026" className="block">
                  <Button variant="outline" className="w-full justify-between">
                    {t("planetaryTracker.jupiterTransit2026", "Jupiter Transit 2026")}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/mercury-retrograde-2026" className="block">
                  <Button variant="outline" className="w-full justify-between">
                    {t("planetaryTracker.mercuryRetrograde2026", "Mercury Retrograde 2026")}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
