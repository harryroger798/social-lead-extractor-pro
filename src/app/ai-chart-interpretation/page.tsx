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
  Brain,
  Heart,
  Briefcase,
  TrendingUp,
  Activity,
  Home,
  Users,
  GraduationCap,
  Plane,
  User,
  ChevronRight,
  Download,
  Share2,
  MessageCircle,
} from "lucide-react";

interface BirthDetails {
  name: string;
  date: string;
  time: string;
  place: string;
}

interface ChartInterpretation {
  personality: {
    title: string;
    titleHindi: string;
    content: string;
    contentHindi: string;
    strengths: string[];
    strengthsHindi: string[];
    challenges: string[];
    challengesHindi: string[];
  };
  career: {
    title: string;
    titleHindi: string;
    content: string;
    contentHindi: string;
    suitableFields: string[];
    suitableFieldsHindi: string[];
    advice: string;
    adviceHindi: string;
  };
  relationships: {
    title: string;
    titleHindi: string;
    content: string;
    contentHindi: string;
    loveStyle: string;
    loveStyleHindi: string;
    compatibility: string[];
    compatibilityHindi: string[];
  };
  finance: {
    title: string;
    titleHindi: string;
    content: string;
    contentHindi: string;
    wealthPotential: string;
    wealthPotentialHindi: string;
    advice: string;
    adviceHindi: string;
  };
  health: {
    title: string;
    titleHindi: string;
    content: string;
    contentHindi: string;
    vulnerabilities: string[];
    vulnerabilitiesHindi: string[];
    remedies: string[];
    remediesHindi: string[];
  };
  spiritual: {
    title: string;
    titleHindi: string;
    content: string;
    contentHindi: string;
    path: string;
    pathHindi: string;
    practices: string[];
    practicesHindi: string[];
  };
}

const sampleInterpretation: ChartInterpretation = {
  personality: {
    title: "Personality & Character",
    titleHindi: "व्यक्तित्व और चरित्र",
    content: "With Leo Ascendant and Moon in Taurus, you possess a unique blend of regal confidence and grounded stability. Your personality radiates warmth and generosity, while your emotional nature seeks security and comfort. The Sun in Capricorn adds ambition and determination to your character, making you a natural leader who works methodically toward goals.",
    contentHindi: "सिंह लग्न और वृषभ में चंद्रमा के साथ, आपके पास शाही आत्मविश्वास और जमीनी स्थिरता का अनूठा मिश्रण है। आपका व्यक्तित्व गर्मजोशी और उदारता विकीर्ण करता है, जबकि आपकी भावनात्मक प्रकृति सुरक्षा और आराम चाहती है। मकर में सूर्य आपके चरित्र में महत्वाकांक्षा और दृढ़ संकल्प जोड़ता है।",
    strengths: ["Natural leadership abilities", "Strong determination", "Loyal and dependable", "Creative expression", "Financial acumen"],
    strengthsHindi: ["प्राकृतिक नेतृत्व क्षमता", "मजबूत दृढ़ संकल्प", "वफादार और भरोसेमंद", "रचनात्मक अभिव्यक्ति", "वित्तीय कौशल"],
    challenges: ["Stubbornness at times", "Resistance to change", "Pride and ego issues", "Tendency to overwork"],
    challengesHindi: ["कभी-कभी जिद्दीपन", "बदलाव का प्रतिरोध", "अभिमान और अहंकार के मुद्दे", "अधिक काम करने की प्रवृत्ति"],
  },
  career: {
    title: "Career & Professional Life",
    titleHindi: "करियर और पेशेवर जीवन",
    content: "Your 10th house configuration indicates strong potential for success in leadership roles. Saturn's influence brings discipline and long-term thinking, while Jupiter's aspect promises growth and recognition. You're likely to achieve significant career milestones after age 32, with peak success between 36-45.",
    contentHindi: "आपके 10वें भाव की स्थिति नेतृत्व भूमिकाओं में सफलता की मजबूत संभावना दर्शाती है। शनि का प्रभाव अनुशासन और दीर्घकालिक सोच लाता है, जबकि गुरु की दृष्टि विकास और मान्यता का वादा करती है। 32 वर्ष की आयु के बाद महत्वपूर्ण करियर मील के पत्थर हासिल करने की संभावना है।",
    suitableFields: ["Management & Administration", "Finance & Banking", "Real Estate", "Government Services", "Entertainment Industry"],
    suitableFieldsHindi: ["प्रबंधन और प्रशासन", "वित्त और बैंकिंग", "रियल एस्टेट", "सरकारी सेवाएं", "मनोरंजन उद्योग"],
    advice: "Focus on building long-term relationships in your field. Your success will come through persistence and quality work rather than shortcuts.",
    adviceHindi: "अपने क्षेत्र में दीर्घकालिक संबंध बनाने पर ध्यान दें। आपकी सफलता शॉर्टकट के बजाय दृढ़ता और गुणवत्तापूर्ण कार्य से आएगी।",
  },
  relationships: {
    title: "Love & Relationships",
    titleHindi: "प्रेम और रिश्ते",
    content: "Venus in your chart indicates a deep appreciation for beauty, comfort, and harmonious relationships. You seek a partner who provides emotional security while respecting your need for independence. Your 7th house suggests marriage to someone who is practical, possibly from a different cultural background.",
    contentHindi: "आपकी कुंडली में शुक्र सुंदरता, आराम और सामंजस्यपूर्ण संबंधों की गहरी सराहना दर्शाता है। आप एक ऐसे साथी की तलाश करते हैं जो भावनात्मक सुरक्षा प्रदान करे और आपकी स्वतंत्रता की आवश्यकता का सम्मान करे।",
    loveStyle: "Loyal, protective, and generous in love. You express affection through actions and material gestures.",
    loveStyleHindi: "प्यार में वफादार, सुरक्षात्मक और उदार। आप कार्यों और भौतिक इशारों के माध्यम से स्नेह व्यक्त करते हैं।",
    compatibility: ["Taurus", "Virgo", "Capricorn", "Cancer", "Pisces"],
    compatibilityHindi: ["वृषभ", "कन्या", "मकर", "कर्क", "मीन"],
  },
  finance: {
    title: "Wealth & Finance",
    titleHindi: "धन और वित्त",
    content: "Your 2nd house lord is well-placed, indicating good earning potential. The presence of Dhana Yoga suggests wealth accumulation, particularly through career and investments. Financial stability typically comes after age 28, with significant wealth building between 35-50.",
    contentHindi: "आपके दूसरे भाव का स्वामी अच्छी स्थिति में है, जो अच्छी कमाई की संभावना दर्शाता है। धन योग की उपस्थिति धन संचय का संकेत देती है, विशेष रूप से करियर और निवेश के माध्यम से।",
    wealthPotential: "Above average wealth potential with steady growth. Best gains through real estate and long-term investments.",
    wealthPotentialHindi: "स्थिर वृद्धि के साथ औसत से ऊपर धन क्षमता। रियल एस्टेट और दीर्घकालिक निवेश के माध्यम से सर्वोत्तम लाभ।",
    advice: "Avoid speculative investments. Focus on building assets gradually. Gold and property are favorable for you.",
    adviceHindi: "सट्टा निवेश से बचें। धीरे-धीरे संपत्ति बनाने पर ध्यान दें। सोना और संपत्ति आपके लिए अनुकूल हैं।",
  },
  health: {
    title: "Health & Wellness",
    titleHindi: "स्वास्थ्य और कल्याण",
    content: "Your chart indicates generally robust health with good vitality. However, the 6th house configuration suggests attention needed for digestive system and throat-related issues. Stress management is important as you tend to internalize pressure.",
    contentHindi: "आपकी कुंडली अच्छी जीवन शक्ति के साथ आम तौर पर मजबूत स्वास्थ्य दर्शाती है। हालांकि, 6वें भाव की स्थिति पाचन तंत्र और गले से संबंधित मुद्दों पर ध्यान देने का संकेत देती है।",
    vulnerabilities: ["Digestive issues", "Throat problems", "Lower back pain", "Stress-related ailments"],
    vulnerabilitiesHindi: ["पाचन संबंधी समस्याएं", "गले की समस्याएं", "पीठ के निचले हिस्से में दर्द", "तनाव संबंधी बीमारियां"],
    remedies: ["Regular exercise, especially morning walks", "Yoga and pranayama", "Balanced diet with less spicy food", "Adequate sleep and rest"],
    remediesHindi: ["नियमित व्यायाम, विशेष रूप से सुबह की सैर", "योग और प्राणायाम", "कम मसालेदार भोजन के साथ संतुलित आहार", "पर्याप्त नींद और आराम"],
  },
  spiritual: {
    title: "Spiritual Path",
    titleHindi: "आध्यात्मिक मार्ग",
    content: "Your 9th house indicates a natural inclination toward spirituality and higher knowledge. Jupiter's placement suggests you'll find meaning through teaching, philosophy, or religious practices. Spiritual growth accelerates after age 40.",
    contentHindi: "आपका 9वां भाव आध्यात्मिकता और उच्च ज्ञान की ओर स्वाभाविक झुकाव दर्शाता है। गुरु की स्थिति बताती है कि आप शिक्षण, दर्शन या धार्मिक प्रथाओं के माध्यम से अर्थ पाएंगे।",
    path: "Karma Yoga - finding spirituality through dedicated action and service",
    pathHindi: "कर्म योग - समर्पित कार्य और सेवा के माध्यम से आध्यात्मिकता खोजना",
    practices: ["Morning meditation", "Chanting mantras", "Visiting temples on Thursdays", "Charitable activities"],
    practicesHindi: ["सुबह का ध्यान", "मंत्र जाप", "गुरुवार को मंदिर जाना", "धर्मार्थ गतिविधियां"],
  },
};

const tabConfig = [
  { id: "personality", icon: User, label: "Personality" },
  { id: "career", icon: Briefcase, label: "Career" },
  { id: "relationships", icon: Heart, label: "Relationships" },
  { id: "finance", icon: TrendingUp, label: "Finance" },
  { id: "health", icon: Activity, label: "Health" },
  { id: "spiritual", icon: Star, label: "Spiritual" },
];

export default function AIChartInterpretationPage() {
  const { t, language } = useLanguage();
  const [birthDetails, setBirthDetails] = useState<BirthDetails>({
    name: "",
    date: "",
    time: "",
    place: "",
  });
  const [interpretation, setInterpretation] = useState<ChartInterpretation | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState("personality");

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsAnalyzing(true);

      setTimeout(() => {
        setInterpretation(sampleInterpretation);
        setIsAnalyzing(false);
      }, 3000);
    };

    const downloadInterpretation = () => {
      if (!interpretation) return;
    
      const content = `
  AI CHART INTERPRETATION - VEDICSTARASTRO
  ==========================================

  Name: ${birthDetails.name}
  Date of Birth: ${birthDetails.date}
  Time of Birth: ${birthDetails.time}
  Place of Birth: ${birthDetails.place}

  ==========================================
  PERSONALITY & CHARACTER
  ==========================================
  ${language === "hi" ? interpretation.personality.contentHindi : interpretation.personality.content}

  Strengths:
  ${(language === "hi" ? interpretation.personality.strengthsHindi : interpretation.personality.strengths).map(s => `- ${s}`).join("\n")}

  Challenges:
  ${(language === "hi" ? interpretation.personality.challengesHindi : interpretation.personality.challenges).map(c => `- ${c}`).join("\n")}

  ==========================================
  CAREER & PROFESSIONAL LIFE
  ==========================================
  ${language === "hi" ? interpretation.career.contentHindi : interpretation.career.content}

  Suitable Fields:
  ${(language === "hi" ? interpretation.career.suitableFieldsHindi : interpretation.career.suitableFields).map(f => `- ${f}`).join("\n")}

  Advice: ${language === "hi" ? interpretation.career.adviceHindi : interpretation.career.advice}

  ==========================================
  LOVE & RELATIONSHIPS
  ==========================================
  ${language === "hi" ? interpretation.relationships.contentHindi : interpretation.relationships.content}

  Love Style: ${language === "hi" ? interpretation.relationships.loveStyleHindi : interpretation.relationships.loveStyle}

  Compatible Signs:
  ${(language === "hi" ? interpretation.relationships.compatibilityHindi : interpretation.relationships.compatibility).map(c => `- ${c}`).join("\n")}

  ==========================================
  WEALTH & FINANCE
  ==========================================
  ${language === "hi" ? interpretation.finance.contentHindi : interpretation.finance.content}

  Wealth Potential: ${language === "hi" ? interpretation.finance.wealthPotentialHindi : interpretation.finance.wealthPotential}

  Advice: ${language === "hi" ? interpretation.finance.adviceHindi : interpretation.finance.advice}

  ==========================================
  HEALTH & WELLNESS
  ==========================================
  ${language === "hi" ? interpretation.health.contentHindi : interpretation.health.content}

  Areas to Watch:
  ${(language === "hi" ? interpretation.health.vulnerabilitiesHindi : interpretation.health.vulnerabilities).map(v => `- ${v}`).join("\n")}

  Remedies:
  ${(language === "hi" ? interpretation.health.remediesHindi : interpretation.health.remedies).map(r => `- ${r}`).join("\n")}

  ==========================================
  SPIRITUAL PATH
  ==========================================
  ${language === "hi" ? interpretation.spiritual.contentHindi : interpretation.spiritual.content}

  Your Path: ${language === "hi" ? interpretation.spiritual.pathHindi : interpretation.spiritual.path}

  Recommended Practices:
  ${(language === "hi" ? interpretation.spiritual.practicesHindi : interpretation.spiritual.practices).map(p => `- ${p}`).join("\n")}

  ==========================================
  Generated by VedicStarAstro AI
  https://vedicstarastro.com
      `.trim();

      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `chart-interpretation-${birthDetails.name.replace(/\s+/g, "-")}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };

    const shareInterpretation = async () => {
      if (!interpretation) return;
    
      const shareText = `${t("aiChartInterpretation.shareTitle", "My AI Chart Interpretation from VedicStarAstro")}

  ${t("aiChartInterpretation.personality", "Personality")}: ${language === "hi" ? interpretation.personality.titleHindi : interpretation.personality.title}
  ${t("aiChartInterpretation.career", "Career")}: ${language === "hi" ? interpretation.career.titleHindi : interpretation.career.title}

  ${t("aiChartInterpretation.getYours", "Get your personalized AI chart interpretation at VedicStarAstro!")}`;

      const shareData = {
        title: t("aiChartInterpretation.shareTitle", "My AI Chart Interpretation"),
        text: shareText,
        url: window.location.href,
      };

      if (navigator.share) {
        try {
          await navigator.share(shareData);
        } catch (err) {
          navigator.clipboard.writeText(shareText + "\n" + window.location.href);
          alert(t("aiChartInterpretation.copiedToClipboard", "Interpretation details copied to clipboard!"));
        }
      } else {
        navigator.clipboard.writeText(shareText + "\n" + window.location.href);
        alert(t("aiChartInterpretation.copiedToClipboard", "Interpretation details copied to clipboard!"));
      }
    };

  return (
    <div className="py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-indigo-100 text-indigo-800">
            {t("aiChartInterpretation.badge", "AI-Powered Analysis")}
          </Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {t("aiChartInterpretation.title", "AI Chart Interpretation")}
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {t("aiChartInterpretation.subtitle", "Get a comprehensive AI-powered analysis of your Vedic birth chart. Understand your personality, career potential, relationships, finances, health, and spiritual path.")}
          </p>
        </div>

        {!interpretation ? (
          <Card className="max-w-xl mx-auto border-indigo-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-indigo-600" />
                {t("aiChartInterpretation.enterDetails", "Enter Your Birth Details")}
              </CardTitle>
              <CardDescription>
                {t("aiChartInterpretation.enterDetailsDesc", "Our AI will analyze your complete birth chart")}
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
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? (
                    <>
                      <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                      {t("aiChartInterpretation.analyzing", "AI is Analyzing Your Chart...")}
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4 mr-2" />
                      {t("aiChartInterpretation.analyze", "Get AI Interpretation")}
                    </>
                  )}
                </Button>
              </form>

              {isAnalyzing && (
                <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
                  <p className="text-sm text-indigo-700 mb-3">
                    {t("aiChartInterpretation.analyzingSteps", "Our AI is analyzing your birth chart...")}
                  </p>
                  <div className="space-y-2 text-sm text-indigo-600">
                    <p className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 animate-pulse" />
                      {t("aiChartInterpretation.step1", "Calculating planetary positions...")}
                    </p>
                    <p className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 animate-pulse" />
                      {t("aiChartInterpretation.step2", "Analyzing house placements...")}
                    </p>
                    <p className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 animate-pulse" />
                      {t("aiChartInterpretation.step3", "Generating personalized insights...")}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {t("aiChartInterpretation.resultsFor", "Chart Analysis for")} {birthDetails.name}
                </h2>
                <p className="text-gray-600">
                  {t("aiChartInterpretation.generatedBy", "Generated by VedicStarAstro AI")}
                </p>
              </div>
              <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={downloadInterpretation}>
                                  <Download className="w-4 h-4 mr-1" />
                                  {t("aiChartInterpretation.download", "Download")}
                                </Button>
                                <Button variant="outline" size="sm" onClick={shareInterpretation}>
                                  <Share2 className="w-4 h-4 mr-1" />
                                  {t("aiChartInterpretation.share", "Share")}
                                </Button>
                <Button variant="outline" size="sm" onClick={() => setInterpretation(null)}>
                  {t("aiChartInterpretation.newAnalysis", "New Analysis")}
                </Button>
              </div>
            </div>

            <Card className="border-indigo-200">
              <CardContent className="pt-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-6">
                    {tabConfig.map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-1">
                          <Icon className="w-4 h-4" />
                          <span className="hidden sm:inline">{t(`aiChartInterpretation.tab.${tab.id}`, tab.label)}</span>
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>

                  <TabsContent value="personality">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">
                          {language === "hi" ? interpretation.personality.titleHindi : interpretation.personality.title}
                        </h3>
                        <p className="text-gray-700 leading-relaxed">
                          {language === "hi" ? interpretation.personality.contentHindi : interpretation.personality.content}
                        </p>
                      </div>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="p-4 bg-green-50 rounded-lg">
                          <h4 className="font-semibold text-green-800 mb-3">{t("aiChartInterpretation.strengths", "Strengths")}</h4>
                          <ul className="space-y-2">
                            {(language === "hi" ? interpretation.personality.strengthsHindi : interpretation.personality.strengths).map((item, i) => (
                              <li key={i} className="flex items-center gap-2 text-green-700">
                                <ChevronRight className="w-4 h-4" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="p-4 bg-amber-50 rounded-lg">
                          <h4 className="font-semibold text-amber-800 mb-3">{t("aiChartInterpretation.challenges", "Challenges")}</h4>
                          <ul className="space-y-2">
                            {(language === "hi" ? interpretation.personality.challengesHindi : interpretation.personality.challenges).map((item, i) => (
                              <li key={i} className="flex items-center gap-2 text-amber-700">
                                <ChevronRight className="w-4 h-4" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="career">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">
                          {language === "hi" ? interpretation.career.titleHindi : interpretation.career.title}
                        </h3>
                        <p className="text-gray-700 leading-relaxed">
                          {language === "hi" ? interpretation.career.contentHindi : interpretation.career.content}
                        </p>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-semibold text-blue-800 mb-3">{t("aiChartInterpretation.suitableFields", "Suitable Career Fields")}</h4>
                        <div className="flex flex-wrap gap-2">
                          {(language === "hi" ? interpretation.career.suitableFieldsHindi : interpretation.career.suitableFields).map((field, i) => (
                            <Badge key={i} className="bg-blue-100 text-blue-800">{field}</Badge>
                          ))}
                        </div>
                      </div>
                      <div className="p-4 bg-indigo-50 rounded-lg">
                        <h4 className="font-semibold text-indigo-800 mb-2">{t("aiChartInterpretation.careerAdvice", "Career Advice")}</h4>
                        <p className="text-indigo-700">
                          {language === "hi" ? interpretation.career.adviceHindi : interpretation.career.advice}
                        </p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="relationships">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">
                          {language === "hi" ? interpretation.relationships.titleHindi : interpretation.relationships.title}
                        </h3>
                        <p className="text-gray-700 leading-relaxed">
                          {language === "hi" ? interpretation.relationships.contentHindi : interpretation.relationships.content}
                        </p>
                      </div>
                      <div className="p-4 bg-pink-50 rounded-lg">
                        <h4 className="font-semibold text-pink-800 mb-2">{t("aiChartInterpretation.loveStyle", "Your Love Style")}</h4>
                        <p className="text-pink-700">
                          {language === "hi" ? interpretation.relationships.loveStyleHindi : interpretation.relationships.loveStyle}
                        </p>
                      </div>
                      <div className="p-4 bg-rose-50 rounded-lg">
                        <h4 className="font-semibold text-rose-800 mb-3">{t("aiChartInterpretation.bestCompatibility", "Best Compatibility")}</h4>
                        <div className="flex flex-wrap gap-2">
                          {(language === "hi" ? interpretation.relationships.compatibilityHindi : interpretation.relationships.compatibility).map((sign, i) => (
                            <Badge key={i} className="bg-rose-100 text-rose-800">{sign}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="finance">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">
                          {language === "hi" ? interpretation.finance.titleHindi : interpretation.finance.title}
                        </h3>
                        <p className="text-gray-700 leading-relaxed">
                          {language === "hi" ? interpretation.finance.contentHindi : interpretation.finance.content}
                        </p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <h4 className="font-semibold text-green-800 mb-2">{t("aiChartInterpretation.wealthPotential", "Wealth Potential")}</h4>
                        <p className="text-green-700">
                          {language === "hi" ? interpretation.finance.wealthPotentialHindi : interpretation.finance.wealthPotential}
                        </p>
                      </div>
                      <div className="p-4 bg-emerald-50 rounded-lg">
                        <h4 className="font-semibold text-emerald-800 mb-2">{t("aiChartInterpretation.financialAdvice", "Financial Advice")}</h4>
                        <p className="text-emerald-700">
                          {language === "hi" ? interpretation.finance.adviceHindi : interpretation.finance.advice}
                        </p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="health">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">
                          {language === "hi" ? interpretation.health.titleHindi : interpretation.health.title}
                        </h3>
                        <p className="text-gray-700 leading-relaxed">
                          {language === "hi" ? interpretation.health.contentHindi : interpretation.health.content}
                        </p>
                      </div>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="p-4 bg-red-50 rounded-lg">
                          <h4 className="font-semibold text-red-800 mb-3">{t("aiChartInterpretation.healthVulnerabilities", "Areas to Watch")}</h4>
                          <ul className="space-y-2">
                            {(language === "hi" ? interpretation.health.vulnerabilitiesHindi : interpretation.health.vulnerabilities).map((item, i) => (
                              <li key={i} className="flex items-center gap-2 text-red-700">
                                <ChevronRight className="w-4 h-4" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="p-4 bg-teal-50 rounded-lg">
                          <h4 className="font-semibold text-teal-800 mb-3">{t("aiChartInterpretation.healthRemedies", "Recommended Remedies")}</h4>
                          <ul className="space-y-2">
                            {(language === "hi" ? interpretation.health.remediesHindi : interpretation.health.remedies).map((item, i) => (
                              <li key={i} className="flex items-center gap-2 text-teal-700">
                                <ChevronRight className="w-4 h-4" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="spiritual">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">
                          {language === "hi" ? interpretation.spiritual.titleHindi : interpretation.spiritual.title}
                        </h3>
                        <p className="text-gray-700 leading-relaxed">
                          {language === "hi" ? interpretation.spiritual.contentHindi : interpretation.spiritual.content}
                        </p>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <h4 className="font-semibold text-purple-800 mb-2">{t("aiChartInterpretation.spiritualPath", "Your Spiritual Path")}</h4>
                        <p className="text-purple-700">
                          {language === "hi" ? interpretation.spiritual.pathHindi : interpretation.spiritual.path}
                        </p>
                      </div>
                      <div className="p-4 bg-violet-50 rounded-lg">
                        <h4 className="font-semibold text-violet-800 mb-3">{t("aiChartInterpretation.recommendedPractices", "Recommended Practices")}</h4>
                        <ul className="space-y-2">
                          {(language === "hi" ? interpretation.spiritual.practicesHindi : interpretation.spiritual.practices).map((item, i) => (
                            <li key={i} className="flex items-center gap-2 text-violet-700">
                              <Star className="w-4 h-4" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <div className="text-center">
              <p className="text-gray-600 mb-4">
                {t("aiChartInterpretation.wantMore", "Want more detailed analysis or have questions?")}
              </p>
              <div className="flex justify-center gap-4 flex-wrap">
                <Link href="/ai-astrologer">
                  <Button variant="outline">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    {t("aiChartInterpretation.askAI", "Ask AI Astrologer")}
                  </Button>
                </Link>
                <Link href="/consultation">
                  <Button className="bg-gradient-to-r from-indigo-500 to-purple-600">
                    {t("aiChartInterpretation.consultExpert", "Consult Expert")}
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
