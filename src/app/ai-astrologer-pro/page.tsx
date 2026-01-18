"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LocationInput } from "@/components/ui/location-input";
import {
  Bot,
  Send,
  User,
  Sparkles,
  Star,
  Moon,
  Sun,
  MessageCircle,
  Loader2,
  Calendar,
  Clock,
  MapPin,
  Settings,
  Zap,
  Brain,
  Heart,
  Briefcase,
  TrendingUp,
  Shield,
  Phone,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  context?: string;
}

interface BirthDetails {
  name: string;
  date: string;
  time: string;
  place: string;
}

interface ChartContext {
  ascendant: string;
  moonSign: string;
  sunSign: string;
  nakshatra: string;
  currentDasha: string;
  activePlanets: string[];
}

const sampleChartContext: ChartContext = {
  ascendant: "Leo",
  moonSign: "Taurus",
  sunSign: "Capricorn",
  nakshatra: "Rohini",
  currentDasha: "Jupiter Mahadasha",
  activePlanets: ["Jupiter", "Saturn", "Venus"],
};

const quickTopics = [
  { id: "career", icon: Briefcase, label: "Career", labelHindi: "करियर" },
  { id: "love", icon: Heart, label: "Love", labelHindi: "प्रेम" },
  { id: "finance", icon: TrendingUp, label: "Finance", labelHindi: "वित्त" },
  { id: "health", icon: Shield, label: "Health", labelHindi: "स्वास्थ्य" },
  { id: "spiritual", icon: Star, label: "Spiritual", labelHindi: "आध्यात्मिक" },
];

function parseMarkdownLine(line: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  const boldRegex = /\*\*([^*]+)\*\*/g;
  let match;

  while ((match = boldRegex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      parts.push(line.slice(lastIndex, match.index));
    }
    parts.push(<strong key={match.index} className="font-semibold">{match[1]}</strong>);
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < line.length) {
    parts.push(line.slice(lastIndex));
  }

  return parts.length > 0 ? parts : line;
}

export default function AIAstrologerProPage() {
  const { t, language } = useLanguage();
  const [birthDetails, setBirthDetails] = useState<BirthDetails>({
    name: "",
    date: "",
    time: "",
    place: "",
  });
  const [chartContext, setChartContext] = useState<ChartContext | null>(null);
  const [isLoadingChart, setIsLoadingChart] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [activeMode, setActiveMode] = useState<"general" | "personalized">("general");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getWelcomeMessage = useCallback((hasChart: boolean, chart: ChartContext | null, name: string) => {
    if (hasChart && chart) {
      return `${t("aiAstrologerPro.welcomePersonalized", "Namaste")} ${name}! ${t("aiAstrologerPro.welcomeWithChart", "I have analyzed your birth chart and I'm ready to provide personalized guidance.")}

**${t("aiAstrologerPro.yourChart", "Your Chart Summary")}:**
- ${t("aiAstrologerPro.ascendant", "Ascendant")}: ${chart.ascendant}
- ${t("aiAstrologerPro.moonSign", "Moon Sign")}: ${chart.moonSign}
- ${t("aiAstrologerPro.nakshatra", "Nakshatra")}: ${chart.nakshatra}
- ${t("aiAstrologerPro.currentDasha", "Current Dasha")}: ${chart.currentDasha}

${t("aiAstrologerPro.askAnything", "Ask me anything about your career, relationships, health, or spiritual path. My answers will be tailored to your unique birth chart.")}`;
    }
    
    return `${t("aiAstrologerPro.welcomeGeneral", "Namaste! I am your Enhanced AI Astrologer with advanced capabilities.")}

**${t("aiAstrologerPro.proFeatures", "Pro Features")}:**
- ${t("aiAstrologerPro.feature1", "Personalized readings based on your birth chart")}
- ${t("aiAstrologerPro.feature2", "Context-aware responses considering your Dasha period")}
- ${t("aiAstrologerPro.feature3", "Detailed remedies tailored to your planetary positions")}
- ${t("aiAstrologerPro.feature4", "Quick topic selection for focused guidance")}

${t("aiAstrologerPro.enterBirthDetails", "Enter your birth details above for personalized guidance, or ask general astrology questions.")}`;
  }, [t]);

  // Compute welcome message based on current state
  const welcomeMessage = getWelcomeMessage(!!chartContext, chartContext, birthDetails.name);

  // Initialize messages with welcome message
  const [messages, setMessages] = useState<Message[]>([{
    id: "welcome",
    role: "assistant" as const,
    content: "",
    timestamp: new Date(),
  }]);

  // Derive the displayed messages with updated welcome message
  const displayedMessages = messages.map(msg => 
    msg.id === "welcome" 
      ? { ...msg, content: welcomeMessage }
      : msg
  );

  const handleLoadChart = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoadingChart(true);

    setTimeout(() => {
      setChartContext(sampleChartContext);
      setActiveMode("personalized");
      setIsLoadingChart(false);
    }, 2000);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      let responseContent = "";
      
      if (chartContext) {
        responseContent = `${t("aiAstrologerPro.basedOnChart", "Based on your birth chart analysis")}:

**${t("aiAstrologerPro.personalizedInsight", "Personalized Insight")}:**
${t("aiAstrologerPro.withAscendant", "With your")} ${chartContext.ascendant} ${t("aiAstrologerPro.ascendantAnd", "Ascendant and")} ${chartContext.moonSign} ${t("aiAstrologerPro.moonSignAnalysis", "Moon sign, here's what I see regarding your question")}:

${currentInput.toLowerCase().includes("career") ? 
  `${t("aiAstrologerPro.careerAnalysis", "Your 10th house lord is well-placed, indicating strong career potential. The current")} ${chartContext.currentDasha} ${t("aiAstrologerPro.careerDasha", "is favorable for professional growth. Focus on leadership roles that align with your Leo Ascendant's natural authority.")}` :
  currentInput.toLowerCase().includes("love") || currentInput.toLowerCase().includes("relationship") ?
  `${t("aiAstrologerPro.loveAnalysis", "Your 7th house analysis shows Venus's influence on partnerships. With")} ${chartContext.moonSign} ${t("aiAstrologerPro.loveMoon", "Moon, you seek emotional security in relationships. The current planetary period supports meaningful connections.")}` :
  currentInput.toLowerCase().includes("money") || currentInput.toLowerCase().includes("finance") ?
  `${t("aiAstrologerPro.financeAnalysis", "Your 2nd and 11th houses indicate good wealth potential. The")} ${chartContext.currentDasha} ${t("aiAstrologerPro.financeDasha", "supports financial growth through disciplined efforts. Real estate and long-term investments are favorable.")}` :
  `${t("aiAstrologerPro.generalAnalysis", "Considering your")} ${chartContext.nakshatra} ${t("aiAstrologerPro.nakshatraInfluence", "Nakshatra's influence and the current")} ${chartContext.currentDasha}, ${t("aiAstrologerPro.generalGuidance", "I recommend focusing on activities that align with your natural strengths. Your chart shows strong potential for success when you follow your intuition.")}`
}

**${t("aiAstrologerPro.remedies", "Recommended Remedies")}:**
- ${t("aiAstrologerPro.remedy1", "Chant the mantra for your ruling planet on its designated day")}
- ${t("aiAstrologerPro.remedy2", "Wear colors associated with your favorable planets")}
- ${t("aiAstrologerPro.remedy3", "Perform charity aligned with your chart's indications")}

${t("aiAstrologerPro.moreQuestions", "Would you like more specific guidance on any aspect?")}`;
      } else {
        responseContent = `${t("aiAstrologerPro.generalResponse", "Thank you for your question about")} "${currentInput}".

${t("aiAstrologerPro.generalAdvice", "Based on general Vedic astrology principles, here's my guidance")}:

${currentInput.toLowerCase().includes("saturn") || currentInput.toLowerCase().includes("shani") ?
  `**${t("aiAstrologerPro.saturnTitle", "Saturn's Influence")}:**
${t("aiAstrologerPro.saturnContent", "Saturn is the planet of karma, discipline, and life lessons. Its transit through your chart brings opportunities for growth through challenges. Embrace patience and hard work during Saturn periods.")}` :
  currentInput.toLowerCase().includes("jupiter") || currentInput.toLowerCase().includes("guru") ?
  `**${t("aiAstrologerPro.jupiterTitle", "Jupiter's Blessings")}:**
${t("aiAstrologerPro.jupiterContent", "Jupiter represents wisdom, expansion, and good fortune. When Jupiter aspects your key houses, expect growth in knowledge, spirituality, and material prosperity.")}` :
  `**${t("aiAstrologerPro.generalTitle", "Vedic Wisdom")}:**
${t("aiAstrologerPro.generalContent", "Vedic astrology offers profound insights into life's journey. For personalized guidance, I recommend entering your birth details above so I can analyze your unique chart.")}`
}

${t("aiAstrologerPro.forPersonalized", "For personalized predictions, please enter your birth details in the form above.")}`;
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: responseContent,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleQuickTopic = (topic: string) => {
    const topicQuestions: Record<string, string> = {
      career: t("aiAstrologerPro.quickCareer", "What does my chart say about my career prospects?"),
      love: t("aiAstrologerPro.quickLove", "Tell me about my love life and relationships"),
      finance: t("aiAstrologerPro.quickFinance", "How can I improve my financial situation?"),
      health: t("aiAstrologerPro.quickHealth", "What should I know about my health?"),
      spiritual: t("aiAstrologerPro.quickSpiritual", "Guide me on my spiritual path"),
    };
    setInput(topicQuestions[topic] || "");
  };

  return (
    <div className="py-8 lg:py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <Badge className="mb-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
            {t("aiAstrologerPro.badge", "Enhanced AI")}
          </Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {t("aiAstrologerPro.title", "AI Astrologer Pro")}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t("aiAstrologerPro.subtitle", "Get personalized astrological guidance powered by your birth chart. Context-aware AI that understands your unique planetary positions.")}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Settings className="w-5 h-5 text-purple-600" />
                  {t("aiAstrologerPro.birthDetails", "Birth Details")}
                </CardTitle>
                <CardDescription>
                  {t("aiAstrologerPro.birthDetailsDesc", "Enter for personalized readings")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLoadChart} className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="name" className="text-sm">{t("calculator.fullName", "Name")}</Label>
                    <Input
                      id="name"
                      placeholder={t("calculator.enterName", "Your name")}
                      value={birthDetails.name}
                      onChange={(e) => setBirthDetails({ ...birthDetails, name: e.target.value })}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="date" className="text-sm flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {t("calculator.dateOfBirth", "Date")}
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={birthDetails.date}
                      onChange={(e) => setBirthDetails({ ...birthDetails, date: e.target.value })}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="time" className="text-sm flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {t("calculator.timeOfBirth", "Time")}
                    </Label>
                    <Input
                      id="time"
                      type="time"
                      value={birthDetails.time}
                      onChange={(e) => setBirthDetails({ ...birthDetails, time: e.target.value })}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="place" className="text-sm flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {t("calculator.placeOfBirth", "Place")}
                    </Label>
                    <LocationInput
                      id="place"
                      placeholder={t("calculator.searchCity", "City...")}
                      value={birthDetails.place}
                      onChange={(e) => setBirthDetails({ ...birthDetails, place: e.target.value })}
                      onLocationSelect={(loc) => setBirthDetails({ ...birthDetails, place: loc })}
                      className="h-9"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-500 to-indigo-600"
                    disabled={isLoadingChart || !birthDetails.name || !birthDetails.date}
                  >
                    {isLoadingChart ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {t("aiAstrologerPro.loading", "Loading...")}
                      </>
                    ) : chartContext ? (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        {t("aiAstrologerPro.updateChart", "Update Chart")}
                      </>
                    ) : (
                      <>
                        <Brain className="w-4 h-4 mr-2" />
                        {t("aiAstrologerPro.loadChart", "Load My Chart")}
                      </>
                    )}
                  </Button>
                </form>

                {chartContext && (
                  <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                    <p className="text-xs font-medium text-purple-800 mb-2">
                      {t("aiAstrologerPro.chartLoaded", "Chart Loaded")}
                    </p>
                    <div className="space-y-1 text-xs text-purple-700">
                      <p>{t("aiAstrologerPro.ascendant", "Ascendant")}: {chartContext.ascendant}</p>
                      <p>{t("aiAstrologerPro.moonSign", "Moon")}: {chartContext.moonSign}</p>
                      <p>{t("aiAstrologerPro.dasha", "Dasha")}: {chartContext.currentDasha}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-amber-200">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Zap className="w-5 h-5 text-amber-600" />
                  {t("aiAstrologerPro.quickTopics", "Quick Topics")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {quickTopics.map((topic) => {
                    const Icon = topic.icon;
                    return (
                      <Button
                        key={topic.id}
                        variant="outline"
                        size="sm"
                        className="justify-start"
                        onClick={() => handleQuickTopic(topic.id)}
                      >
                        <Icon className="w-4 h-4 mr-1" />
                        {language === "hi" ? topic.labelHindi : topic.label}
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Phone className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">
                    {t("aiAstrologerPro.preferVoice", "Prefer Voice?")}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mb-3">
                  {t("aiAstrologerPro.voiceDesc", "Talk to our AI Astrologer using voice")}
                </p>
                <Link href="/voice-astrologer">
                  <Button variant="outline" size="sm" className="w-full">
                    {t("aiAstrologerPro.tryVoice", "Try Voice AI")}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="border-purple-200 shadow-lg h-full flex flex-col">
              <CardHeader className="border-b bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                      <Bot className="w-6 h-6" />
                    </div>
                    <div>
                      <CardTitle className="text-white">{t("aiAstrologerPro.chatTitle", "AI Astrologer Pro")}</CardTitle>
                      <CardDescription className="text-purple-100">
                        {chartContext 
                          ? t("aiAstrologerPro.personalizedMode", "Personalized Mode Active")
                          : t("aiAstrologerPro.generalMode", "General Mode")}
                      </CardDescription>
                    </div>
                  </div>
                  {chartContext && (
                    <Badge className="bg-white/20 text-white">
                      <Sparkles className="w-3 h-3 mr-1" />
                      {t("aiAstrologerPro.enhanced", "Enhanced")}
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col p-0">
                <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[400px] max-h-[500px]">
                  {displayedMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {message.role === "assistant" && (
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                          <Bot className="w-4 h-4 text-purple-600" />
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.role === "user"
                            ? "bg-purple-600 text-white"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        <div className="text-sm whitespace-pre-wrap">
                          {message.content.split("\n").map((line, i) => (
                            <p key={i} className={i > 0 ? "mt-2" : ""}>
                              {parseMarkdownLine(line)}
                            </p>
                          ))}
                        </div>
                      </div>
                      {message.role === "user" && (
                        <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                        <Bot className="w-4 h-4 text-purple-600" />
                      </div>
                      <div className="bg-gray-100 rounded-lg p-3">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder={t("aiAstrologerPro.askQuestion", "Ask your question...")}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSend()}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleSend}
                      disabled={!input.trim() || isTyping}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">
            {t("aiAstrologerPro.otherOptions", "Looking for other options?")}
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link href="/ai-astrologer">
              <Button variant="outline">
                <MessageCircle className="w-4 h-4 mr-2" />
                {t("aiAstrologerPro.basicChat", "Basic AI Chat")}
              </Button>
            </Link>
            <Link href="/ai-chart-interpretation">
              <Button variant="outline">
                <Brain className="w-4 h-4 mr-2" />
                {t("aiAstrologerPro.chartInterpretation", "Chart Interpretation")}
              </Button>
            </Link>
            <Link href="/consultation">
              <Button className="bg-gradient-to-r from-amber-500 to-orange-600">
                {t("aiAstrologerPro.humanExpert", "Talk to Human Expert")}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
