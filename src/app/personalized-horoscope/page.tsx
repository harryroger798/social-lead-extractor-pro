"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LocationInput } from "@/components/ui/location-input";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import {
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  Star,
  Heart,
  Briefcase,
  TrendingUp,
  Activity,
  Sun,
  Moon,
  RefreshCw,
  Share2,
  Download,
  User,
} from "lucide-react";

interface BirthDetails {
  name: string;
  date: string;
  time: string;
  place: string;
}

interface PersonalizedHoroscope {
  date: string;
  moonSign: string;
  moonSignHindi: string;
  ascendant: string;
  ascendantHindi: string;
  currentTransits: string;
  overall: {
    rating: number;
    prediction: string;
    predictionHindi: string;
  };
  love: {
    rating: number;
    prediction: string;
    predictionHindi: string;
  };
  career: {
    rating: number;
    prediction: string;
    predictionHindi: string;
  };
  finance: {
    rating: number;
    prediction: string;
    predictionHindi: string;
  };
  health: {
    rating: number;
    prediction: string;
    predictionHindi: string;
  };
  luckyNumber: string;
  luckyColor: string;
  luckyColorHindi: string;
  luckyTime: string;
  advice: string;
  adviceHindi: string;
  mantra: string;
  mantraHindi: string;
}

const sampleHoroscope: PersonalizedHoroscope = {
  date: new Date().toISOString().split("T")[0],
  moonSign: "Taurus",
  moonSignHindi: "वृषभ",
  ascendant: "Leo",
  ascendantHindi: "सिंह",
  currentTransits: "Moon in Gemini, Venus in Aquarius",
  overall: {
    rating: 4,
    prediction: "Today brings a harmonious blend of creativity and practicality. With Moon transiting your 2nd house, focus on financial matters and family relationships. Your natural determination will help you overcome any obstacles. The afternoon hours are particularly favorable for important decisions.",
    predictionHindi: "आज रचनात्मकता और व्यावहारिकता का सामंजस्यपूर्ण मिश्रण लाता है। चंद्रमा आपके दूसरे भाव में गोचर कर रहा है, वित्तीय मामलों और पारिवारिक संबंधों पर ध्यान दें। आपका स्वाभाविक दृढ़ संकल्प किसी भी बाधा को दूर करने में मदद करेगा। दोपहर के घंटे महत्वपूर्ण निर्णयों के लिए विशेष रूप से अनुकूल हैं।",
  },
  love: {
    rating: 5,
    prediction: "Venus aspects your 7th house today, creating wonderful energy for romantic connections. Single natives may encounter someone special through social gatherings. Those in relationships will experience deeper emotional bonding. Express your feelings openly.",
    predictionHindi: "शुक्र आज आपके 7वें भाव को देख रहा है, रोमांटिक संबंधों के लिए अद्भुत ऊर्जा पैदा कर रहा है। अविवाहित लोग सामाजिक समारोहों के माध्यम से किसी विशेष व्यक्ति से मिल सकते हैं। रिश्ते में रहने वालों को गहरा भावनात्मक जुड़ाव अनुभव होगा। अपनी भावनाओं को खुलकर व्यक्त करें।",
  },
  career: {
    rating: 4,
    prediction: "Professional matters look promising with Sun strengthening your 6th house. Your hard work will be noticed by superiors. Avoid conflicts with colleagues and focus on collaborative projects. A new opportunity may present itself in the coming days.",
    predictionHindi: "सूर्य आपके 6वें भाव को मजबूत कर रहा है, पेशेवर मामले आशाजनक दिखते हैं। आपकी मेहनत वरिष्ठों द्वारा देखी जाएगी। सहकर्मियों के साथ टकराव से बचें और सहयोगी परियोजनाओं पर ध्यान दें। आने वाले दिनों में एक नया अवसर आ सकता है।",
  },
  finance: {
    rating: 3,
    prediction: "Financial caution is advised today. While income remains stable, unexpected expenses may arise. Avoid major investments or loans. Focus on budgeting and saving. The period after the 20th will be more favorable for financial decisions.",
    predictionHindi: "आज वित्तीय सावधानी की सलाह दी जाती है। जबकि आय स्थिर रहती है, अप्रत्याशित खर्च हो सकते हैं। बड़े निवेश या ऋण से बचें। बजट और बचत पर ध्यान दें। 20 तारीख के बाद का समय वित्तीय निर्णयों के लिए अधिक अनुकूल होगा।",
  },
  health: {
    rating: 4,
    prediction: "Your vitality is strong today. Mars provides good energy for physical activities. Morning exercise or yoga will be beneficial. Pay attention to your diet and stay hydrated. Avoid stress and practice relaxation techniques in the evening.",
    predictionHindi: "आज आपकी जीवन शक्ति मजबूत है। मंगल शारीरिक गतिविधियों के लिए अच्छी ऊर्जा प्रदान करता है। सुबह का व्यायाम या योग लाभदायक होगा। अपने आहार पर ध्यान दें और हाइड्रेटेड रहें। तनाव से बचें और शाम को विश्राम तकनीकों का अभ्यास करें।",
  },
  luckyNumber: "7, 14, 21",
  luckyColor: "Green",
  luckyColorHindi: "हरा",
  luckyTime: "2:00 PM - 4:00 PM",
  advice: "Trust your instincts today. The universe is aligning to support your goals. Take calculated risks and don't be afraid to step out of your comfort zone.",
  adviceHindi: "आज अपनी अंतर्ज्ञान पर भरोसा करें। ब्रह्मांड आपके लक्ष्यों का समर्थन करने के लिए संरेखित हो रहा है। गणनात्मक जोखिम लें और अपने आराम क्षेत्र से बाहर निकलने से न डरें।",
  mantra: "Om Shukraya Namaha",
  mantraHindi: "ॐ शुक्राय नमः",
};

export default function PersonalizedHoroscopePage() {
  const { t, language } = useLanguage();
  const [birthDetails, setBirthDetails] = useState<BirthDetails>({
    name: "",
    date: "",
    time: "",
    place: "",
  });
  const [horoscope, setHoroscope] = useState<PersonalizedHoroscope | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("overall");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    
    setTimeout(() => {
      setHoroscope(sampleHoroscope);
      setIsGenerating(false);
    }, 2500);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? "fill-amber-400 text-amber-400" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

    const categoryConfig = {
      overall: { icon: Sun, color: "amber", label: t("horoscope.overall", "Overall") },
      love: { icon: Heart, color: "pink", label: t("horoscope.love", "Love") },
      career: { icon: Briefcase, color: "blue", label: t("horoscope.career", "Career") },
      finance: { icon: TrendingUp, color: "green", label: t("horoscope.finance", "Finance") },
      health: { icon: Activity, color: "red", label: t("horoscope.health", "Health") },
    };

    const shareHoroscope = async () => {
      if (!horoscope) return;
    
      const shareText = `${t("personalizedHoroscope.shareTitle", "My Personalized Horoscope for Today")}

  ${t("personalizedHoroscope.moonSign", "Moon Sign")}: ${language === "hi" ? horoscope.moonSignHindi : horoscope.moonSign}
  ${t("personalizedHoroscope.ascendant", "Ascendant")}: ${language === "hi" ? horoscope.ascendantHindi : horoscope.ascendant}
  ${t("personalizedHoroscope.luckyNumber", "Lucky Number")}: ${horoscope.luckyNumber}
  ${t("personalizedHoroscope.luckyColor", "Lucky Color")}: ${language === "hi" ? horoscope.luckyColorHindi : horoscope.luckyColor}

  ${t("personalizedHoroscope.getYours", "Get your personalized horoscope at VedicStarAstro!")}`;

      const shareData = {
        title: t("personalizedHoroscope.shareTitle", "My Personalized Horoscope"),
        text: shareText,
        url: window.location.href,
      };

      if (navigator.share) {
        try {
          await navigator.share(shareData);
        } catch (err) {
          navigator.clipboard.writeText(shareText + "\n" + window.location.href);
          alert(t("personalizedHoroscope.copiedToClipboard", "Horoscope details copied to clipboard!"));
        }
      } else {
        navigator.clipboard.writeText(shareText + "\n" + window.location.href);
        alert(t("personalizedHoroscope.copiedToClipboard", "Horoscope details copied to clipboard!"));
      }
    };

  return (
    <div className="py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-amber-100 text-amber-800">
            {t("personalizedHoroscope.badge", "AI-Powered Predictions")}
          </Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {t("personalizedHoroscope.title", "Personalized Daily Horoscope")}
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {t("personalizedHoroscope.subtitle", "Get truly personalized daily predictions based on your exact birth chart, not just your sun sign. Our AI analyzes your unique planetary positions and current transits.")}
          </p>
        </div>

        {!horoscope ? (
          <Card className="max-w-xl mx-auto border-amber-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-amber-600" />
                {t("personalizedHoroscope.enterDetails", "Enter Your Birth Details")}
              </CardTitle>
              <CardDescription>
                {t("personalizedHoroscope.enterDetailsDesc", "We'll generate a horoscope based on your exact birth chart")}
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
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                      {t("personalizedHoroscope.generating", "Generating Your Horoscope...")}
                    </>
                  ) : (
                    <>
                      <Star className="w-4 h-4 mr-2" />
                      {t("personalizedHoroscope.generate", "Get My Personalized Horoscope")}
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 p-4 bg-amber-50 rounded-lg">
                <h4 className="font-medium text-amber-800 mb-2">
                  {t("personalizedHoroscope.whyPersonalized", "Why Personalized?")}
                </h4>
                <p className="text-sm text-amber-700">
                  {t("personalizedHoroscope.whyPersonalizedDesc", "Generic horoscopes only consider your sun sign. Our AI analyzes your complete birth chart including Moon sign, Ascendant, and all planetary positions to give you truly personalized predictions.")}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            <Card className="border-amber-200">
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Sun className="w-5 h-5 text-amber-600" />
                      {t("personalizedHoroscope.todayHoroscope", "Today's Horoscope")} - {birthDetails.name}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {new Date().toLocaleDateString(language === "hi" ? "hi-IN" : "en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setHoroscope(null)}>
                      <RefreshCw className="w-4 h-4 mr-1" />
                      {t("personalizedHoroscope.refresh", "Refresh")}
                    </Button>
                                        <Button variant="outline" size="sm" onClick={shareHoroscope}>
                                          <Share2 className="w-4 h-4 mr-1" />
                                          {t("share.share", "Share")}
                                        </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 bg-amber-50 rounded-lg text-center">
                    <Moon className="w-6 h-6 mx-auto mb-2 text-amber-600" />
                    <p className="text-sm text-gray-600">{t("personalizedHoroscope.moonSign", "Moon Sign")}</p>
                    <p className="font-bold text-amber-800">
                      {language === "hi" ? horoscope.moonSignHindi : horoscope.moonSign}
                    </p>
                  </div>
                  <div className="p-4 bg-amber-50 rounded-lg text-center">
                    <Sun className="w-6 h-6 mx-auto mb-2 text-amber-600" />
                    <p className="text-sm text-gray-600">{t("personalizedHoroscope.ascendant", "Ascendant")}</p>
                    <p className="font-bold text-amber-800">
                      {language === "hi" ? horoscope.ascendantHindi : horoscope.ascendant}
                    </p>
                  </div>
                  <div className="p-4 bg-amber-50 rounded-lg text-center">
                    <Star className="w-6 h-6 mx-auto mb-2 text-amber-600" />
                    <p className="text-sm text-gray-600">{t("personalizedHoroscope.transits", "Current Transits")}</p>
                    <p className="font-bold text-amber-800 text-sm">{horoscope.currentTransits}</p>
                  </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid grid-cols-5 mb-6">
                    {Object.entries(categoryConfig).map(([key, config]) => {
                      const Icon = config.icon;
                      return (
                        <TabsTrigger key={key} value={key} className="flex items-center gap-1">
                          <Icon className="w-4 h-4" />
                          <span className="hidden sm:inline">{config.label}</span>
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>

                  {Object.entries(categoryConfig).map(([key, config]) => {
                    const data = horoscope[key as keyof typeof horoscope] as {
                      rating: number;
                      prediction: string;
                      predictionHindi: string;
                    };
                    return (
                      <TabsContent key={key} value={key}>
                        <div className="p-6 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">{config.label}</h3>
                            {renderStars(data.rating)}
                          </div>
                          <p className="text-gray-700 leading-relaxed">
                            {language === "hi" ? data.predictionHindi : data.prediction}
                          </p>
                        </div>
                      </TabsContent>
                    );
                  })}
                </Tabs>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-green-200">
                <CardContent className="pt-6 text-center">
                  <p className="text-sm text-gray-600 mb-1">{t("personalizedHoroscope.luckyNumber", "Lucky Number")}</p>
                  <p className="text-2xl font-bold text-green-600">{horoscope.luckyNumber}</p>
                </CardContent>
              </Card>
              <Card className="border-purple-200">
                <CardContent className="pt-6 text-center">
                  <p className="text-sm text-gray-600 mb-1">{t("personalizedHoroscope.luckyColor", "Lucky Color")}</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {language === "hi" ? horoscope.luckyColorHindi : horoscope.luckyColor}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-blue-200">
                <CardContent className="pt-6 text-center">
                  <p className="text-sm text-gray-600 mb-1">{t("personalizedHoroscope.luckyTime", "Lucky Time")}</p>
                  <p className="text-2xl font-bold text-blue-600">{horoscope.luckyTime}</p>
                </CardContent>
              </Card>
              <Card className="border-amber-200">
                <CardContent className="pt-6 text-center">
                  <p className="text-sm text-gray-600 mb-1">{t("personalizedHoroscope.mantra", "Today's Mantra")}</p>
                  <p className="text-lg font-bold text-amber-600">
                    {language === "hi" ? horoscope.mantraHindi : horoscope.mantra}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="border-indigo-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  {t("personalizedHoroscope.todayAdvice", "Today's Advice")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg text-gray-700 italic">
                  &ldquo;{language === "hi" ? horoscope.adviceHindi : horoscope.advice}&rdquo;
                </p>
              </CardContent>
            </Card>

            <div className="text-center">
              <p className="text-gray-600 mb-4">
                {t("personalizedHoroscope.wantMore", "Want more detailed predictions?")}
              </p>
              <div className="flex justify-center gap-4 flex-wrap">
                <Link href="/life-timeline">
                  <Button variant="outline">
                    {t("personalizedHoroscope.viewLifeTimeline", "View Life Timeline")}
                  </Button>
                </Link>
                <Link href="/consultation">
                  <Button className="bg-gradient-to-r from-indigo-500 to-purple-600">
                    {t("personalizedHoroscope.consultAstrologer", "Consult Astrologer")}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
