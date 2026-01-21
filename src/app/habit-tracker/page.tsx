"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { getCurrentYear } from "@/lib/utils";
import {
  Calendar,
  CheckCircle,
  Circle,
  Plus,
  Star,
  Sparkles,
  Sun,
  Moon,
  Dumbbell,
  BookOpen,
  Heart,
  Leaf,
  Brain,
  Music,
  Utensils,
  Bed,
  TrendingUp,
  Clock,
  Flame,
  Target,
  Award,
} from "lucide-react";

interface Habit {
  id: string;
  name: string;
  nameHindi: string;
  icon: string;
  category: string;
  streak: number;
  completedToday: boolean;
  bestDay: string;
  bestDayHindi: string;
  planetaryInfluence: string;
  planetaryInfluenceHindi: string;
}

interface DayRecommendation {
  date: string;
  dayName: string;
  dayNameHindi: string;
  planet: string;
  planetHindi: string;
  energy: "high" | "medium" | "low";
  bestFor: string[];
  bestForHindi: string[];
  avoid: string[];
  avoidHindi: string[];
}

const habitIcons: Record<string, React.ReactNode> = {
  exercise: <Dumbbell className="w-5 h-5" />,
  meditation: <Brain className="w-5 h-5" />,
  reading: <BookOpen className="w-5 h-5" />,
  healthy_eating: <Utensils className="w-5 h-5" />,
  sleep: <Bed className="w-5 h-5" />,
  gratitude: <Heart className="w-5 h-5" />,
  nature: <Leaf className="w-5 h-5" />,
  music: <Music className="w-5 h-5" />,
};

const sampleHabits: Habit[] = [
  {
    id: "1",
    name: "Morning Exercise",
    nameHindi: "सुबह का व्यायाम",
    icon: "exercise",
    category: "health",
    streak: 12,
    completedToday: true,
    bestDay: "Tuesday (Mars Day)",
    bestDayHindi: "मंगलवार (मंगल दिवस)",
    planetaryInfluence: "Mars energy boosts physical strength",
    planetaryInfluenceHindi: "मंगल ऊर्जा शारीरिक शक्ति बढ़ाती है",
  },
  {
    id: "2",
    name: "Meditation",
    nameHindi: "ध्यान",
    icon: "meditation",
    category: "spiritual",
    streak: 28,
    completedToday: true,
    bestDay: "Monday (Moon Day)",
    bestDayHindi: "सोमवार (चंद्र दिवस)",
    planetaryInfluence: "Moon enhances mental peace",
    planetaryInfluenceHindi: "चंद्रमा मानसिक शांति बढ़ाता है",
  },
  {
    id: "3",
    name: "Reading",
    nameHindi: "पढ़ना",
    icon: "reading",
    category: "learning",
    streak: 7,
    completedToday: false,
    bestDay: "Wednesday (Mercury Day)",
    bestDayHindi: "बुधवार (बुध दिवस)",
    planetaryInfluence: "Mercury supports learning and intellect",
    planetaryInfluenceHindi: "बुध सीखने और बुद्धि का समर्थन करता है",
  },
  {
    id: "4",
    name: "Healthy Eating",
    nameHindi: "स्वस्थ भोजन",
    icon: "healthy_eating",
    category: "health",
    streak: 5,
    completedToday: false,
    bestDay: "Friday (Venus Day)",
    bestDayHindi: "शुक्रवार (शुक्र दिवस)",
    planetaryInfluence: "Venus governs taste and nourishment",
    planetaryInfluenceHindi: "शुक्र स्वाद और पोषण को नियंत्रित करता है",
  },
  {
    id: "5",
    name: "Gratitude Journal",
    nameHindi: "कृतज्ञता डायरी",
    icon: "gratitude",
    category: "spiritual",
    streak: 15,
    completedToday: true,
    bestDay: "Thursday (Jupiter Day)",
    bestDayHindi: "गुरुवार (गुरु दिवस)",
    planetaryInfluence: "Jupiter expands positive thinking",
    planetaryInfluenceHindi: "गुरु सकारात्मक सोच का विस्तार करता है",
  },
];

const weekRecommendations: DayRecommendation[] = [
  {
    date: `${getCurrentYear()}-01-18`,
    dayName: "Sunday",
    dayNameHindi: "रविवार",
    planet: "Sun",
    planetHindi: "सूर्य",
    energy: "high",
    bestFor: ["Leadership activities", "Self-improvement", "Outdoor activities", "Starting new projects"],
    bestForHindi: ["नेतृत्व गतिविधियां", "आत्म-सुधार", "बाहरी गतिविधियां", "नई परियोजनाएं शुरू करना"],
    avoid: ["Overexertion", "Ego conflicts"],
    avoidHindi: ["अत्यधिक परिश्रम", "अहंकार संघर्ष"],
  },
  {
    date: `${getCurrentYear()}-01-19`,
    dayName: "Monday",
    dayNameHindi: "सोमवार",
    planet: "Moon",
    planetHindi: "चंद्रमा",
    energy: "medium",
    bestFor: ["Meditation", "Emotional healing", "Family time", "Creative activities"],
    bestForHindi: ["ध्यान", "भावनात्मक उपचार", "परिवार का समय", "रचनात्मक गतिविधियां"],
    avoid: ["Major decisions", "Confrontations"],
    avoidHindi: ["बड़े निर्णय", "टकराव"],
  },
  {
    date: `${getCurrentYear()}-01-20`,
    dayName: "Tuesday",
    dayNameHindi: "मंगलवार",
    planet: "Mars",
    planetHindi: "मंगल",
    energy: "high",
    bestFor: ["Physical exercise", "Competitive activities", "Courage-building", "Technical work"],
    bestForHindi: ["शारीरिक व्यायाम", "प्रतिस्पर्धी गतिविधियां", "साहस निर्माण", "तकनीकी कार्य"],
    avoid: ["Arguments", "Risky ventures"],
    avoidHindi: ["बहस", "जोखिम भरे उद्यम"],
  },
  {
    date: `${getCurrentYear()}-01-21`,
    dayName: "Wednesday",
    dayNameHindi: "बुधवार",
    planet: "Mercury",
    planetHindi: "बुध",
    energy: "high",
    bestFor: ["Learning", "Communication", "Writing", "Business deals"],
    bestForHindi: ["सीखना", "संचार", "लेखन", "व्यापारिक सौदे"],
    avoid: ["Long-term commitments", "Signing contracts during retrograde"],
    avoidHindi: ["दीर्घकालिक प्रतिबद्धताएं", "वक्री के दौरान अनुबंध पर हस्ताक्षर"],
  },
  {
    date: `${getCurrentYear()}-01-22`,
    dayName: "Thursday",
    dayNameHindi: "गुरुवार",
    planet: "Jupiter",
    planetHindi: "गुरु",
    energy: "high",
    bestFor: ["Spiritual practices", "Teaching", "Expansion", "Legal matters"],
    bestForHindi: ["आध्यात्मिक अभ्यास", "शिक्षण", "विस्तार", "कानूनी मामले"],
    avoid: ["Overindulgence", "Excessive spending"],
    avoidHindi: ["अति भोग", "अत्यधिक खर्च"],
  },
  {
    date: `${getCurrentYear()}-01-23`,
    dayName: "Friday",
    dayNameHindi: "शुक्रवार",
    planet: "Venus",
    planetHindi: "शुक्र",
    energy: "high",
    bestFor: ["Romance", "Art", "Beauty routines", "Social gatherings"],
    bestForHindi: ["रोमांस", "कला", "सौंदर्य दिनचर्या", "सामाजिक समारोह"],
    avoid: ["Laziness", "Excessive luxury"],
    avoidHindi: ["आलस्य", "अत्यधिक विलासिता"],
  },
  {
    date: `${getCurrentYear()}-01-24`,
    dayName: "Saturday",
    dayNameHindi: "शनिवार",
    planet: "Saturn",
    planetHindi: "शनि",
    energy: "low",
    bestFor: ["Discipline", "Organization", "Long-term planning", "Serving others"],
    bestForHindi: ["अनुशासन", "संगठन", "दीर्घकालिक योजना", "दूसरों की सेवा"],
    avoid: ["Starting new ventures", "Impulsive decisions"],
    avoidHindi: ["नए उद्यम शुरू करना", "आवेगी निर्णय"],
  },
];

export default function HabitTrackerPage() {
  const { t, language } = useLanguage();
  const [habits, setHabits] = useState<Habit[]>(sampleHabits);
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [newHabitName, setNewHabitName] = useState("");

  const toggleHabit = (habitId: string) => {
    setHabits(habits.map(habit => 
      habit.id === habitId 
        ? { ...habit, completedToday: !habit.completedToday, streak: habit.completedToday ? habit.streak - 1 : habit.streak + 1 }
        : habit
    ));
  };

  const addHabit = () => {
    if (newHabitName.trim()) {
      const newHabit: Habit = {
        id: Date.now().toString(),
        name: newHabitName,
        nameHindi: newHabitName,
        icon: "gratitude",
        category: "personal",
        streak: 0,
        completedToday: false,
        bestDay: "Any day",
        bestDayHindi: "कोई भी दिन",
        planetaryInfluence: "Personal growth",
        planetaryInfluenceHindi: "व्यक्तिगत विकास",
      };
      setHabits([...habits, newHabit]);
      setNewHabitName("");
      setShowAddHabit(false);
    }
  };

  const completedCount = habits.filter(h => h.completedToday).length;
  const totalStreak = habits.reduce((sum, h) => sum + h.streak, 0);

  const getEnergyColor = (energy: string) => {
    switch (energy) {
      case "high":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-amber-100 text-amber-800";
      case "low":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const todayRecommendation = weekRecommendations[0];

  return (
    <div className="py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-green-100 text-green-800">
            {t("habitTracker.badge", "Astrology-Powered Habits")}
          </Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {t("habitTracker.title", "Cosmic Habit Tracker")}
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {t("habitTracker.subtitle", "Build better habits aligned with planetary energies. Know the best days for each activity based on Vedic astrology.")}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          <Card className="border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{t("habitTracker.todayProgress", "Today's Progress")}</p>
                  <p className="text-3xl font-bold text-green-600">{completedCount}/{habits.length}</p>
                </div>
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <Target className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <Progress value={(completedCount / habits.length) * 100} className="mt-4 h-2" />
            </CardContent>
          </Card>

          <Card className="border-amber-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{t("habitTracker.totalStreak", "Total Streak Days")}</p>
                  <p className="text-3xl font-bold text-amber-600">{totalStreak}</p>
                </div>
                <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
                  <Flame className="w-8 h-8 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{t("habitTracker.todayEnergy", "Today's Energy")}</p>
                  <p className="text-xl font-bold text-purple-600">
                    {language === "hi" ? todayRecommendation.planetHindi : todayRecommendation.planet} {t("habitTracker.day", "Day")}
                  </p>
                </div>
                <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center">
                  <Sun className="w-8 h-8 text-purple-600" />
                </div>
              </div>
              <Badge className={`mt-2 ${getEnergyColor(todayRecommendation.energy)}`}>
                {t(`habitTracker.energy.${todayRecommendation.energy}`, todayRecommendation.energy)} {t("habitTracker.energyLevel", "Energy")}
              </Badge>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <Card className="border-green-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  {t("habitTracker.myHabits", "My Habits")}
                </CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowAddHabit(!showAddHabit)}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  {t("habitTracker.addHabit", "Add Habit")}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {showAddHabit && (
                <div className="flex gap-2 mb-4">
                  <Input
                    placeholder={t("habitTracker.habitName", "Habit name...")}
                    value={newHabitName}
                    onChange={(e) => setNewHabitName(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addHabit()}
                  />
                  <Button onClick={addHabit}>{t("habitTracker.add", "Add")}</Button>
                </div>
              )}

              <div className="space-y-3">
                {habits.map((habit) => (
                  <div
                    key={habit.id}
                    className={`flex items-center justify-between p-4 rounded-lg border transition-colors cursor-pointer ${
                      habit.completedToday
                        ? "bg-green-50 border-green-200"
                        : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                    }`}
                    onClick={() => toggleHabit(habit.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${habit.completedToday ? "bg-green-200" : "bg-gray-200"}`}>
                        {habitIcons[habit.icon] || <Star className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className={`font-medium ${habit.completedToday ? "text-green-800" : "text-gray-900"}`}>
                          {language === "hi" ? habit.nameHindi : habit.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {language === "hi" ? habit.bestDayHindi : habit.bestDay}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-amber-600">
                          <Flame className="w-4 h-4" />
                          <span className="font-medium">{habit.streak}</span>
                        </div>
                      </div>
                      {habit.completedToday ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : (
                        <Circle className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                {t("habitTracker.weeklyGuide", "Weekly Planetary Guide")}
              </CardTitle>
              <CardDescription>
                {t("habitTracker.weeklyGuideDesc", "Best activities for each day based on ruling planet")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {weekRecommendations.map((day, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${
                      index === 0 ? "border-purple-300 bg-purple-50" : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">
                          {language === "hi" ? day.dayNameHindi : day.dayName}
                        </span>
                        {index === 0 && (
                          <Badge className="bg-purple-100 text-purple-800 text-xs">
                            {t("habitTracker.today", "Today")}
                          </Badge>
                        )}
                      </div>
                      <Badge className={getEnergyColor(day.energy)}>
                        {language === "hi" ? day.planetHindi : day.planet}
                      </Badge>
                    </div>
                    <div className="text-sm">
                      <p className="text-green-700">
                        <span className="font-medium">{t("habitTracker.bestFor", "Best for")}:</span>{" "}
                        {(language === "hi" ? day.bestForHindi : day.bestFor).slice(0, 2).join(", ")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-amber-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-600" />
              {t("habitTracker.todayRecommendation", "Today's Recommendation")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  {t("habitTracker.bestActivities", "Best Activities Today")}
                </h4>
                <ul className="space-y-2">
                  {(language === "hi" ? todayRecommendation.bestForHindi : todayRecommendation.bestFor).map((activity, index) => (
                    <li key={index} className="flex items-center gap-2 text-gray-700">
                      <Star className="w-4 h-4 text-amber-500" />
                      {activity}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-red-700 mb-2 flex items-center gap-2">
                  <Circle className="w-4 h-4" />
                  {t("habitTracker.avoidToday", "Avoid Today")}
                </h4>
                <ul className="space-y-2">
                  {(language === "hi" ? todayRecommendation.avoidHindi : todayRecommendation.avoid).map((activity, index) => (
                    <li key={index} className="flex items-center gap-2 text-gray-700">
                      <Circle className="w-4 h-4 text-gray-400" />
                      {activity}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">
            {t("habitTracker.learnMore", "Want to learn more about planetary influences?")}
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link href="/planetary-tracker">
              <Button variant="outline">
                {t("habitTracker.viewPlanetaryTracker", "View Planetary Tracker")}
              </Button>
            </Link>
            <Link href="/tools/kundli-calculator">
              <Button className="bg-gradient-to-r from-green-500 to-teal-600">
                {t("habitTracker.getKundli", "Get Your Kundli")}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
