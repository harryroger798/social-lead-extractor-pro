"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import Vapi from "@vapi-ai/web";
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Star,
  Clock,
  User,
  MessageCircle,
  AlertCircle,
  CheckCircle,
  Info,
  Headphones,
  Settings,
  Globe,
} from "lucide-react";

interface CallState {
  status: "idle" | "connecting" | "connected" | "ended" | "error";
  duration: number;
  transcript: string[];
  errorMessage?: string;
}

interface VoiceLanguage {
  code: string;
  name: string;
  nameNative: string;
  available: boolean;
  vapiLanguage: string;
}

const voiceLanguages: VoiceLanguage[] = [
  { code: "en", name: "English", nameNative: "English", available: true, vapiLanguage: "en" },
  { code: "hi", name: "Hindi", nameNative: "हिंदी", available: true, vapiLanguage: "hi" },
  { code: "ta", name: "Tamil", nameNative: "தமிழ்", available: true, vapiLanguage: "ta" },
  { code: "te", name: "Telugu", nameNative: "తెలుగు", available: true, vapiLanguage: "te" },
  { code: "bn", name: "Bengali", nameNative: "বাংলা", available: true, vapiLanguage: "bn" },
  { code: "mr", name: "Marathi", nameNative: "मराठी", available: true, vapiLanguage: "mr" },
  { code: "gu", name: "Gujarati", nameNative: "ગુજરાતી", available: true, vapiLanguage: "gu" },
];

const VAPI_PUBLIC_KEYS = [
  "ad721a2d-e6d9-4ab9-9684-32a446b2c4e6",
  "79e3eede-bb04-4780-9f3e-f6ce67b190dd",
  "f31bac06-8fc3-4918-89a4-2f8ae64ffd36",
];

const getLanguageSystemPrompt = (langCode: string): string => {
  const languageNames: Record<string, string> = {
    en: "English",
    hi: "Hindi",
    ta: "Tamil",
    te: "Telugu",
    bn: "Bengali",
    mr: "Marathi",
    gu: "Gujarati",
  };
  
  const langName = languageNames[langCode] || "English";
  const languageInstruction = langCode === "en" 
    ? "Respond in English. You may use Hindi terms with English explanations when appropriate."
    : `IMPORTANT: You MUST respond entirely in ${langName}. All your responses must be in ${langName}. Do not respond in English unless the user specifically asks for it.`;

  return `You are an expert Vedic astrologer with deep knowledge of Jyotish Shastra. You provide guidance based on Vedic astrology principles, planetary positions, Nakshatras, Doshas and their remedies, Kundli interpretation, and Muhurat guidance.

Be compassionate and supportive. Provide practical remedies when discussing challenges. Keep responses concise (2-3 sentences for voice). 

${languageInstruction}

You are representing VedicStarAstro, a trusted platform for authentic Vedic astrology services.`;
};

const getFirstMessage = (langCode: string): string => {
  const messages: Record<string, string> = {
    en: "Namaste! I am your AI Astrologer from VedicStarAstro. How may I guide you today with the wisdom of Vedic astrology?",
    hi: "नमस्ते! मैं वेदिकस्टार एस्ट्रो से आपका AI ज्योतिषी हूं। वैदिक ज्योतिष के ज्ञान से आज मैं आपकी कैसे मदद कर सकता हूं?",
    ta: "வணக்கம்! நான் வேதிக்ஸ்டார் ஆஸ்ட்ரோவின் AI ஜோதிடர். வேத ஜோதிடத்தின் ஞானத்துடன் இன்று நான் உங்களுக்கு எவ்வாறு வழிகாட்ட முடியும்?",
    te: "నమస్కారం! నేను వేదిక్‌స్టార్ ఆస్ట్రో నుండి మీ AI జ్యోతిష్యుడిని. వేద జ్యోతిషశాస్త్ర జ్ఞానంతో ఈ రోజు నేను మీకు ఎలా మార్గదర్శకత్వం చేయగలను?",
    bn: "নমস্কার! আমি বেদিকস্টার অ্যাস্ট্রো থেকে আপনার AI জ্যোতিষী। বৈদিক জ্যোতিষের জ্ঞান দিয়ে আজ আমি আপনাকে কীভাবে সাহায্য করতে পারি?",
    mr: "नमस्कार! मी वेदिकस्टार अॅस्ट्रो मधून तुमचा AI ज्योतिषी आहे. वैदिक ज्योतिषाच्या ज्ञानाने आज मी तुम्हाला कसे मार्गदर्शन करू शकतो?",
    gu: "નમસ્તે! હું વેદિકસ્ટાર એસ્ટ્રોમાંથી તમારો AI જ્યોતિષી છું. વૈદિક જ્યોતિષના જ્ઞાન સાથે આજે હું તમને કેવી રીતે માર્ગદર્શન આપી શકું?",
  };
  return messages[langCode] || messages.en;
};

const sampleQuestions = [
  { en: "What does my birth chart say about my career?", hi: "मेरी जन्म कुंडली मेरे करियर के बारे में क्या कहती है?" },
  { en: "When is a good time for marriage?", hi: "विवाह के लिए अच्छा समय कब है?" },
  { en: "Tell me about my Dasha period", hi: "मुझे अपनी दशा अवधि के बारे में बताएं" },
  { en: "What are my lucky numbers?", hi: "मेरे भाग्यशाली अंक क्या हैं?" },
  { en: "How will 2026 be for me?", hi: "2026 मेरे लिए कैसा रहेगा?" },
];

export default function VoiceAstrologerPage() {
  const { t, language } = useLanguage();
  const [callState, setCallState] = useState<CallState>({
    status: "idle",
    duration: 0,
    transcript: [],
  });
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [dailyMinutesUsed, setDailyMinutesUsed] = useState(0);
  const [currentKeyIndex, setCurrentKeyIndex] = useState(0);
  const dailyLimit = 5;
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const vapiRef = useRef<Vapi | null>(null);

  useEffect(() => {
    const storedMinutes = localStorage.getItem("vapiDailyMinutes");
    const storedDate = localStorage.getItem("vapiDailyDate");
    const today = new Date().toDateString();
    
    if (storedDate === today && storedMinutes) {
      setDailyMinutesUsed(parseInt(storedMinutes, 10));
    } else {
      localStorage.setItem("vapiDailyDate", today);
      localStorage.setItem("vapiDailyMinutes", "0");
    }
  }, []);

  useEffect(() => {
    if (callState.status === "connected") {
      timerRef.current = setInterval(() => {
        setCallState((prev) => ({
          ...prev,
          duration: prev.duration + 1,
        }));
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [callState.status]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const startCall = async () => {
    if (dailyMinutesUsed >= dailyLimit) {
      alert(t("voiceAstrologer.limitReached", "You have reached your daily limit. Please try again tomorrow or upgrade to premium."));
      return;
    }

    setCallState({
      status: "connecting",
      duration: 0,
      transcript: [],
    });

    try {
      const publicKey = VAPI_PUBLIC_KEYS[currentKeyIndex];
      const vapi = new Vapi(publicKey);
      vapiRef.current = vapi;

      vapi.on("call-start", () => {
        setCallState((prev) => ({
          ...prev,
          status: "connected",
          transcript: [getFirstMessage(selectedLanguage)],
        }));
      });

      vapi.on("call-end", () => {
        const minutesUsed = Math.ceil(callState.duration / 60) || 1;
        const newTotal = dailyMinutesUsed + minutesUsed;
        setDailyMinutesUsed(newTotal);
        localStorage.setItem("vapiDailyMinutes", newTotal.toString());
        
        setCallState((prev) => ({
          ...prev,
          status: "ended",
        }));
      });

      vapi.on("message", (message: { type: string; transcriptType?: string; role?: string; transcript?: string }) => {
        if (message.type === "transcript" && message.transcriptType === "final") {
          const role = message.role === "assistant" ? "AI" : "You";
          setCallState((prev) => ({
            ...prev,
            transcript: [...prev.transcript, `${role}: ${message.transcript}`],
          }));
        }
      });

      vapi.on("error", (error: Error) => {
        console.error("VAPI Error:", error);
        if (currentKeyIndex < VAPI_PUBLIC_KEYS.length - 1) {
          setCurrentKeyIndex((prev) => prev + 1);
          setCallState((prev) => ({
            ...prev,
            status: "idle",
            errorMessage: t("voiceAstrologer.retrying", "Retrying with backup connection..."),
          }));
        } else {
          setCallState((prev) => ({
            ...prev,
            status: "error",
            errorMessage: t("voiceAstrologer.connectionError", "Connection error. Please try again later."),
          }));
        }
      });

      const selectedLang = voiceLanguages.find(l => l.code === selectedLanguage);
      const vapiLanguage = selectedLang?.vapiLanguage || "en";

      // Using VAPI's built-in assistant configuration
      // This uses VAPI's default providers (included in VAPI credits)
      // instead of requiring separate OpenAI/ElevenLabs API keys
      await vapi.start({
        transcriber: {
          provider: "deepgram",
          model: "nova-2",
          language: vapiLanguage as "en" | "hi" | "ta",
        },
        model: {
          provider: "groq",
          model: "llama-3.1-70b-versatile",
          temperature: 0.7,
          messages: [
            {
              role: "system",
              content: getLanguageSystemPrompt(selectedLanguage),
            },
          ],
        },
        voice: {
          provider: "playht",
          voiceId: "jennifer",
        },
        firstMessage: getFirstMessage(selectedLanguage),
      });
    } catch (error) {
      console.error("Failed to start call:", error);
      setCallState({
        status: "error",
        duration: 0,
        transcript: [],
        errorMessage: t("voiceAstrologer.startError", "Failed to start call. Please check your microphone permissions and try again."),
      });
    }
  };

  const endCall = () => {
    if (vapiRef.current) {
      vapiRef.current.stop();
    }
    const minutesUsed = Math.ceil(callState.duration / 60) || 1;
    const newTotal = dailyMinutesUsed + minutesUsed;
    setDailyMinutesUsed(newTotal);
    localStorage.setItem("vapiDailyMinutes", newTotal.toString());
    
    setCallState((prev) => ({
      ...prev,
      status: "ended",
    }));
  };

  const resetCall = () => {
    vapiRef.current = null;
    setCallState({
      status: "idle",
      duration: 0,
      transcript: [],
    });
  };

  const toggleMute = () => {
    if (vapiRef.current) {
      vapiRef.current.setMuted(!isMuted);
      setIsMuted(!isMuted);
    }
  };

  const remainingMinutes = dailyLimit - dailyMinutesUsed;

  return (
    <div className="py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-violet-100 text-violet-800">
            {t("voiceAstrologer.badge", "Voice AI Consultation")}
          </Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {t("voiceAstrologer.title", "Voice AI Astrologer")}
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {t("voiceAstrologer.subtitle", "Talk to our AI Astrologer in your preferred language. Get instant Vedic astrology guidance through natural voice conversation.")}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="border-violet-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="w-5 h-5 text-violet-600" />
                    {t("voiceAstrologer.callInterface", "Voice Call Interface")}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-gray-500" />
                    <select
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      className="text-sm border rounded-md px-2 py-1"
                      disabled={callState.status === "connected"}
                    >
                      {voiceLanguages.filter(l => l.available).map((lang) => (
                        <option key={lang.code} value={lang.code}>
                          {lang.nameNative}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-br from-violet-900 to-indigo-900 rounded-2xl p-8 text-white">
                  <div className="text-center mb-8">
                    <div className={`w-32 h-32 mx-auto rounded-full bg-white/10 flex items-center justify-center mb-4 ${
                      callState.status === "connected" ? "animate-pulse" : ""
                    }`}>
                      {callState.status === "idle" && (
                        <Headphones className="w-16 h-16 text-white/80" />
                      )}
                      {callState.status === "connecting" && (
                        <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                      )}
                      {callState.status === "connected" && (
                        <div className="relative">
                          <User className="w-16 h-16 text-white" />
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <Mic className="w-3 h-3" />
                          </div>
                        </div>
                      )}
                      {callState.status === "ended" && (
                        <CheckCircle className="w-16 h-16 text-green-400" />
                      )}
                      {callState.status === "error" && (
                        <AlertCircle className="w-16 h-16 text-red-400" />
                      )}
                    </div>

                    <h3 className="text-xl font-semibold mb-1">
                      {callState.status === "idle" && t("voiceAstrologer.readyToCall", "Ready to Call")}
                      {callState.status === "connecting" && t("voiceAstrologer.connecting", "Connecting...")}
                      {callState.status === "connected" && t("voiceAstrologer.inCall", "In Call")}
                      {callState.status === "ended" && t("voiceAstrologer.callEnded", "Call Ended")}
                      {callState.status === "error" && t("voiceAstrologer.error", "Error")}
                    </h3>

                    {callState.status === "connected" && (
                      <p className="text-2xl font-mono text-violet-300">
                        {formatDuration(callState.duration)}
                      </p>
                    )}

                    {callState.status === "ended" && (
                      <p className="text-violet-300">
                        {t("voiceAstrologer.duration", "Duration")}: {formatDuration(callState.duration)}
                      </p>
                    )}

                    {callState.status === "error" && callState.errorMessage && (
                      <p className="text-red-300 text-sm mt-2">
                        {callState.errorMessage}
                      </p>
                    )}
                  </div>

                  {callState.status === "connected" && callState.transcript.length > 0 && (
                    <div className="bg-white/10 rounded-lg p-4 mb-6 max-h-40 overflow-y-auto">
                      {callState.transcript.map((text, index) => (
                        <p key={index} className="text-sm text-white/90 mb-2">
                          <span className="text-violet-300 font-medium">AI: </span>
                          {text}
                        </p>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-center gap-4">
                    {(callState.status === "idle" || callState.status === "error") && (
                      <Button
                        size="lg"
                        className="bg-green-500 hover:bg-green-600 text-white rounded-full w-16 h-16"
                        onClick={startCall}
                        disabled={remainingMinutes <= 0}
                      >
                        <Phone className="w-6 h-6" />
                      </Button>
                    )}

                    {callState.status === "connecting" && (
                      <Button
                        size="lg"
                        className="bg-red-500 hover:bg-red-600 text-white rounded-full w-16 h-16"
                        onClick={() => {
                          if (vapiRef.current) {
                            vapiRef.current.stop();
                          }
                          setCallState({ status: "idle", duration: 0, transcript: [] });
                        }}
                      >
                        <PhoneOff className="w-6 h-6" />
                      </Button>
                    )}

                    {callState.status === "connected" && (
                      <>
                        <Button
                          size="lg"
                          variant="outline"
                          className={`rounded-full w-12 h-12 ${isMuted ? "bg-red-500/20 border-red-500" : "bg-white/10 border-white/30"}`}
                          onClick={toggleMute}
                        >
                          {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                        </Button>
                        <Button
                          size="lg"
                          className="bg-red-500 hover:bg-red-600 text-white rounded-full w-16 h-16"
                          onClick={endCall}
                        >
                          <PhoneOff className="w-6 h-6" />
                        </Button>
                        <Button
                          size="lg"
                          variant="outline"
                          className={`rounded-full w-12 h-12 ${!isSpeakerOn ? "bg-red-500/20 border-red-500" : "bg-white/10 border-white/30"}`}
                          onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                        >
                          {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                        </Button>
                      </>
                    )}

                    {callState.status === "ended" && (
                      <Button
                        size="lg"
                        className="bg-violet-500 hover:bg-violet-600 text-white"
                        onClick={resetCall}
                      >
                        {t("voiceAstrologer.newCall", "Start New Call")}
                      </Button>
                    )}
                  </div>
                </div>

                <div className="mt-6 p-4 bg-violet-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">
                      {t("voiceAstrologer.dailyLimit", "Daily Free Minutes")}
                    </span>
                    <span className="text-sm font-medium text-violet-700">
                      {remainingMinutes} {t("voiceAstrologer.minutesRemaining", "minutes remaining")}
                    </span>
                  </div>
                  <Progress value={(dailyMinutesUsed / dailyLimit) * 100} className="h-2" />
                  <p className="text-xs text-gray-500 mt-2">
                    {t("voiceAstrologer.limitNote", "Free users get 5 minutes per day. Upgrade for unlimited access.")}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-amber-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MessageCircle className="w-5 h-5 text-amber-600" />
                  {t("voiceAstrologer.sampleQuestions", "Sample Questions")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {sampleQuestions.map((q, index) => (
                    <div
                      key={index}
                      className="p-3 bg-amber-50 rounded-lg text-sm text-gray-700 hover:bg-amber-100 cursor-pointer transition-colors"
                    >
                      {language === "hi" ? q.hi : q.en}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Info className="w-5 h-5 text-blue-600" />
                  {t("voiceAstrologer.howItWorks", "How It Works")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-medium">1</span>
                    <span>{t("voiceAstrologer.step1", "Select your preferred language")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-medium">2</span>
                    <span>{t("voiceAstrologer.step2", "Click the call button to connect")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-medium">3</span>
                    <span>{t("voiceAstrologer.step3", "Speak naturally and ask your questions")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-medium">4</span>
                    <span>{t("voiceAstrologer.step4", "Receive personalized astrological guidance")}</span>
                  </li>
                </ol>
              </CardContent>
            </Card>

            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Star className="w-5 h-5 text-green-600" />
                  {t("voiceAstrologer.features", "Features")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    {t("voiceAstrologer.feature1", "Natural voice conversation")}
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    {t("voiceAstrologer.feature2", "Multiple Indian languages")}
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    {t("voiceAstrologer.feature3", "Vedic astrology expertise")}
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    {t("voiceAstrologer.feature4", "24/7 availability")}
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    {t("voiceAstrologer.feature5", "Instant responses")}
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            {t("voiceAstrologer.preferText", "Prefer text-based chat?")}
          </p>
          <Link href="/ai-astrologer">
            <Button variant="outline">
              <MessageCircle className="w-4 h-4 mr-2" />
              {t("voiceAstrologer.goToChat", "Go to AI Chat")}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
