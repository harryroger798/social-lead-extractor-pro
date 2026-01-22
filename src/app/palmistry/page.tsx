"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Hand,
  Heart,
  Brain,
  TrendingUp,
  Star,
  Sparkles,
  Info,
  BookOpen,
  Target,
  Zap,
  Upload,
  Camera,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { CDN_IMAGES } from "@/lib/cdn";

// Palm analysis result interface
interface PalmAnalysisResult {
  detectedLines: {
    name: string;
    hindi: string;
    confidence: number;
    meaning: string;
    interpretation: string;
  }[];
  overallReading: string;
  handShape: {
    shape: string;
    element: string;
    characteristics: string;
  };
}

// Image paths for palm lines - using CDN
const lineImages: Record<string, string> = {
  "Heart Line": CDN_IMAGES.palmistry.lines.heartLine,
  "Head Line": CDN_IMAGES.palmistry.lines.headLine,
  "Life Line": CDN_IMAGES.palmistry.lines.lifeLine,
  "Fate Line": CDN_IMAGES.palmistry.lines.fateLine,
  "Sun Line": CDN_IMAGES.palmistry.lines.sunLine,
  "Marriage Line": CDN_IMAGES.palmistry.lines.marriageLine,
};

// Image paths for mounts - using CDN
const mountImages: Record<string, string> = {
  "Mount of Jupiter": CDN_IMAGES.palmistry.mounts.jupiter,
  "Mount of Saturn": CDN_IMAGES.palmistry.mounts.saturn,
  "Mount of Apollo (Sun)": CDN_IMAGES.palmistry.mounts.apollo,
  "Mount of Mercury": CDN_IMAGES.palmistry.mounts.mercury,
  "Mount of Venus": CDN_IMAGES.palmistry.mounts.venus,
  "Mount of Moon": CDN_IMAGES.palmistry.mounts.moon,
  "Mount of Mars (Upper)": CDN_IMAGES.palmistry.mounts.marsUpper,
  "Mount of Mars (Lower)": CDN_IMAGES.palmistry.mounts.marsLower,
};

// Image paths for hand shapes - using CDN
const handShapeImages: Record<string, string> = {
  "Earth Hand": CDN_IMAGES.palmistry.shapes.earthHand,
  "Air Hand": CDN_IMAGES.palmistry.shapes.airHand,
  "Water Hand": CDN_IMAGES.palmistry.shapes.waterHand,
  "Fire Hand": CDN_IMAGES.palmistry.shapes.fireHand,
};

// Helper function to get translated line name
const getTranslatedLineName = (name: string, t: (key: string, fallback: string) => string): string => {
  return t(`palmistry.lineNames.${name}`, name);
};

// Helper function to get translated mount name
const getTranslatedMountName = (name: string, t: (key: string, fallback: string) => string): string => {
  return t(`palmistry.mountNames.${name}`, name);
};

// Helper function to get translated finger type name
const getTranslatedFingerTypeName = (name: string, t: (key: string, fallback: string) => string): string => {
  return t(`palmistry.fingerTypeNames.${name}`, name);
};

// Helper function to get translated hand shape name
const getTranslatedHandShapeName = (name: string, t: (key: string, fallback: string) => string): string => {
  return t(`palmistry.handShapeNames.${name}`, name);
};

interface PalmLine {
  name: string;
  hindi: string;
  location: string;
  meaning: string;
  variations: { type: string; interpretation: string }[];
}

interface Mount {
  name: string;
  planet: string;
  location: string;
  meaning: string;
  wellDeveloped: string;
  underdeveloped: string;
}

const palmLines: PalmLine[] = [
  {
    name: "Heart Line",
    hindi: "हृदय रेखा",
    location: "Runs horizontally across the upper palm, below the fingers",
    meaning: "Represents emotional life, relationships, and cardiac health",
    variations: [
      { type: "Long and curved", interpretation: "Expressive of feelings, romantic, warm-hearted" },
      { type: "Short and straight", interpretation: "Practical in love, prefers actions over words" },
      { type: "Starts below index finger", interpretation: "Content with love life, selective in relationships" },
      { type: "Starts below middle finger", interpretation: "Selfish in love, may prioritize self over partner" },
      { type: "Broken line", interpretation: "Emotional trauma or heartbreak in life" },
      { type: "Chained appearance", interpretation: "Emotional sensitivity, prone to depression" }
    ]
  },
  {
    name: "Head Line",
    hindi: "मस्तिष्क रेखा",
    location: "Runs horizontally across the middle of the palm",
    meaning: "Represents intellect, learning style, and communication",
    variations: [
      { type: "Long line", interpretation: "Clear thinker, focused, successful in academics" },
      { type: "Short line", interpretation: "Prefers physical achievements over mental" },
      { type: "Curved/sloping", interpretation: "Creative, artistic, imaginative" },
      { type: "Straight line", interpretation: "Practical, logical, realistic thinker" },
      { type: "Separated from life line", interpretation: "Adventurous, independent thinker" },
      { type: "Wavy line", interpretation: "Short attention span, restless mind" }
    ]
  },
  {
    name: "Life Line",
    hindi: "जीवन रेखा",
    location: "Curves around the base of the thumb",
    meaning: "Represents vitality, life changes, and physical health (NOT length of life)",
    variations: [
      { type: "Long and deep", interpretation: "Strong vitality, good health, stable life" },
      { type: "Short and shallow", interpretation: "May be easily manipulated by others" },
      { type: "Curving widely", interpretation: "High energy, enthusiasm for life" },
      { type: "Close to thumb", interpretation: "Often tired, needs more rest" },
      { type: "Broken line", interpretation: "Major life changes or interruptions" },
      { type: "Multiple lines", interpretation: "Extra vitality, strong life force" }
    ]
  },
  {
    name: "Fate Line",
    hindi: "भाग्य रेखा",
    location: "Runs vertically from base of palm towards middle finger",
    meaning: "Represents career, life path, and destiny",
    variations: [
      { type: "Deep and clear", interpretation: "Strong sense of destiny, controlled by fate" },
      { type: "Broken in places", interpretation: "Career changes, life transitions" },
      { type: "Starts at life line", interpretation: "Self-made success, early responsibilities" },
      { type: "Starts at wrist", interpretation: "Destiny set from birth, traditional path" },
      { type: "Absent", interpretation: "Free will dominates, creates own path" },
      { type: "Multiple lines", interpretation: "Multiple careers or interests" }
    ]
  },
  {
    name: "Sun Line",
    hindi: "सूर्य रेखा",
    location: "Runs vertically below the ring finger",
    meaning: "Represents fame, success, and creativity",
    variations: [
      { type: "Clear and deep", interpretation: "Success, fame, good reputation" },
      { type: "Multiple lines", interpretation: "Many talents, scattered energy" },
      { type: "Absent", interpretation: "Success through hard work, not luck" },
      { type: "Starts from heart line", interpretation: "Success in later life through talent" },
      { type: "Starts from head line", interpretation: "Success through mental abilities" }
    ]
  },
  {
    name: "Marriage Line",
    hindi: "विवाह रेखा",
    location: "Small horizontal lines below the little finger",
    meaning: "Represents significant relationships and marriage",
    variations: [
      { type: "One strong line", interpretation: "One significant relationship/marriage" },
      { type: "Multiple lines", interpretation: "Multiple relationships or marriages" },
      { type: "Long line", interpretation: "Long-lasting relationship" },
      { type: "Short line", interpretation: "Brief relationship or affair" },
      { type: "Forked end", interpretation: "Possible separation or divorce" },
      { type: "Curved upward", interpretation: "Happy marriage, positive relationship" }
    ]
  }
];

const mounts: Mount[] = [
  {
    name: "Mount of Jupiter",
    planet: "Jupiter",
    location: "Below the index finger",
    meaning: "Ambition, leadership, spirituality",
    wellDeveloped: "Natural leader, ambitious, confident, religious",
    underdeveloped: "Lack of confidence, no ambition, follower mentality"
  },
  {
    name: "Mount of Saturn",
    planet: "Saturn",
    location: "Below the middle finger",
    meaning: "Wisdom, responsibility, fate",
    wellDeveloped: "Wise, responsible, studious, philosophical",
    underdeveloped: "Irresponsible, superficial, lacks depth"
  },
  {
    name: "Mount of Apollo (Sun)",
    planet: "Sun",
    location: "Below the ring finger",
    meaning: "Creativity, fame, success",
    wellDeveloped: "Artistic, successful, charismatic, optimistic",
    underdeveloped: "Lacks creativity, dull personality, pessimistic"
  },
  {
    name: "Mount of Mercury",
    planet: "Mercury",
    location: "Below the little finger",
    meaning: "Communication, business, intelligence",
    wellDeveloped: "Good communicator, business-minded, witty",
    underdeveloped: "Poor communication, lacks business sense"
  },
  {
    name: "Mount of Venus",
    planet: "Venus",
    location: "Base of thumb",
    meaning: "Love, beauty, passion",
    wellDeveloped: "Loving, passionate, artistic, sensual",
    underdeveloped: "Cold, unromantic, lacks passion"
  },
  {
    name: "Mount of Moon",
    planet: "Moon",
    location: "Opposite side of Venus mount",
    meaning: "Imagination, intuition, travel",
    wellDeveloped: "Imaginative, intuitive, loves travel, creative",
    underdeveloped: "Lacks imagination, practical to a fault"
  },
  {
    name: "Mount of Mars (Upper)",
    planet: "Mars",
    location: "Between Mercury and Moon mounts",
    meaning: "Courage, resistance, moral strength",
    wellDeveloped: "Courageous, persistent, strong moral fiber",
    underdeveloped: "Cowardly, gives up easily"
  },
  {
    name: "Mount of Mars (Lower)",
    planet: "Mars",
    location: "Between Jupiter and Venus mounts",
    meaning: "Physical courage, aggression",
    wellDeveloped: "Brave, aggressive when needed, fighter",
    underdeveloped: "Timid, avoids confrontation"
  }
];

const fingerTypes = [
  {
    name: "Long Fingers",
    meaning: "Detail-oriented, patient, analytical, good with intricate work"
  },
  {
    name: "Short Fingers",
    meaning: "Impatient, intuitive, sees big picture, quick decision maker"
  },
  {
    name: "Pointed Fingertips",
    meaning: "Sensitive, artistic, idealistic, spiritual"
  },
  {
    name: "Square Fingertips",
    meaning: "Practical, orderly, logical, down-to-earth"
  },
  {
    name: "Spatulate Fingertips",
    meaning: "Energetic, action-oriented, original, inventive"
  },
  {
    name: "Conic Fingertips",
    meaning: "Creative, impressionable, quick-minded, artistic"
  }
];

const handShapes = [
  {
    name: "Earth Hand",
    characteristics: "Square palm, short fingers",
    meaning: "Practical, reliable, down-to-earth, loves nature, hardworking"
  },
  {
    name: "Air Hand",
    characteristics: "Square palm, long fingers",
    meaning: "Intellectual, curious, good communicator, analytical, social"
  },
  {
    name: "Water Hand",
    characteristics: "Long palm, long fingers",
    meaning: "Emotional, intuitive, creative, sensitive, compassionate"
  },
  {
    name: "Fire Hand",
    characteristics: "Long palm, short fingers",
    meaning: "Energetic, passionate, optimistic, confident, risk-taker"
  }
];

export default function PalmistryPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("analyze");
  const [selectedLine, setSelectedLine] = useState<PalmLine | null>(null);
  const [selectedMount, setSelectedMount] = useState<Mount | null>(null);
  
  // Palm analysis states
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<PalmAnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [handedness, setHandedness] = useState<"right" | "left">("right");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file upload
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file type
      if (!file.type.startsWith("image/")) {
        setAnalysisError(t("palmistry.analyze.invalidFile", "Please upload a valid image file (JPG, PNG, etc.)"));
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }
      
      // Check file size (10MB limit)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (file.size > maxSize) {
        setAnalysisError(t("palmistry.analyze.fileTooLarge", "File size exceeds 10MB limit. Please upload a smaller image."));
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        setAnalysisResult(null);
        setAnalysisError(null);
      };
      reader.readAsDataURL(file);
    }
  }, [t]);

  // Analyze palm image
  const analyzePalm = useCallback(async () => {
    if (!uploadedImage) return;
    
    setIsAnalyzing(true);
    setAnalysisError(null);
    
    try {
      const response = await fetch("/api/analyze-palm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: uploadedImage }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setAnalysisResult(data.analysis);
      } else {
        setAnalysisError(data.error || t("palmistry.analyze.error", "Failed to analyze palm image. Please try again."));
      }
    } catch {
      setAnalysisError(t("palmistry.analyze.error", "Failed to analyze palm image. Please try again."));
    } finally {
      setIsAnalyzing(false);
    }
  }, [uploadedImage, t]);

  // Reset analysis
  const resetAnalysis = useCallback(() => {
    setUploadedImage(null);
    setAnalysisResult(null);
    setAnalysisError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      {/* Hero Section */}
      <section className="relative py-16 bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url('${CDN_IMAGES.starsPattern}')` }}></div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <Badge className="mb-4 bg-white/20 text-white border-white/30">
              <Hand className="w-3 h-3 mr-1" />
              {t("palmistry.badge", "Palmistry Guide")}
            </Badge>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              {t("palmistry.title", "Palm Reading Guide")}
            </h1>
            <p className="text-lg text-amber-100 max-w-2xl mx-auto">
              {t("palmistry.subtitle", "Learn the ancient art of palmistry. Understand the meaning of lines, mounts, and shapes on your palm.")}
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
                    <TabsList className="grid w-full grid-cols-5 max-w-3xl mx-auto">
                      <TabsTrigger value="analyze" className="flex items-center gap-2">
                        <Camera className="w-4 h-4" />
                        {t("palmistry.analyze.tab", "Analyze")}
                      </TabsTrigger>
                      <TabsTrigger value="lines" className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        {t("palmistry.lines", "Lines")}
                      </TabsTrigger>
                      <TabsTrigger value="mounts" className="flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        {t("palmistry.mounts", "Mounts")}
                      </TabsTrigger>
                      <TabsTrigger value="fingers" className="flex items-center gap-2">
                        <Hand className="w-4 h-4" />
                        {t("palmistry.fingers", "Fingers")}
                      </TabsTrigger>
                      <TabsTrigger value="shapes" className="flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        {t("palmistry.shapes", "Hand Shapes")}
                      </TabsTrigger>
                              </TabsList>

                    {/* Analyze Tab - Upload and analyze palm image */}
                    <TabsContent value="analyze">
                      <div className="max-w-4xl mx-auto">
                        <Card>
                          <CardHeader className="text-center">
                            <CardTitle className="text-2xl">
                              {t("palmistry.analyze.title", "Analyze Your Palm")}
                            </CardTitle>
                            <CardDescription>
                              {t("palmistry.analyze.description", "Upload a clear photo of your palm to get an AI-powered palm reading based on traditional Vedic palmistry.")}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-6">
                            {/* Handedness Selection */}
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                              <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                <Hand className="w-4 h-4 text-amber-600" />
                                {t("palmistry.analyze.whichHand", "Which hand should you photograph?")}
                              </h4>
                              <p className="text-sm text-gray-600 mb-4">
                                {t("palmistry.analyze.handExplanation", "In Vedic palmistry, your dominant hand (the one you write with) shows your current life path and future, while your non-dominant hand shows inherited traits and potential.")}
                              </p>
                              <div className="flex flex-col sm:flex-row gap-3">
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="radio"
                                    name="handedness"
                                    value="right"
                                    checked={handedness === "right"}
                                    onChange={() => setHandedness("right")}
                                    className="w-4 h-4 text-amber-600 focus:ring-amber-500"
                                  />
                                  <span className="text-gray-700">
                                    {t("palmistry.analyze.rightHanded", "I am right-handed")} → {t("palmistry.analyze.useRightPalm", "Upload RIGHT palm")}
                                  </span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="radio"
                                    name="handedness"
                                    value="left"
                                    checked={handedness === "left"}
                                    onChange={() => setHandedness("left")}
                                    className="w-4 h-4 text-amber-600 focus:ring-amber-500"
                                  />
                                  <span className="text-gray-700">
                                    {t("palmistry.analyze.leftHanded", "I am left-handed")} → {t("palmistry.analyze.useLeftPalm", "Upload LEFT palm")}
                                  </span>
                                </label>
                              </div>
                              <p className="text-xs text-gray-500 mt-3 italic">
                                {t("palmistry.analyze.genderNote", "Note: This applies to both men and women. The dominant hand is read for current life circumstances regardless of gender.")}
                              </p>
                            </div>

                            {/* Upload Section */}
                            {!uploadedImage ? (
                              <div className="border-2 border-dashed border-amber-300 rounded-lg p-8 text-center bg-amber-50/50">
                                <input
                                  type="file"
                                  ref={fileInputRef}
                                  onChange={handleFileUpload}
                                  accept="image/*"
                                  className="hidden"
                                  id="palm-upload"
                                />
                                <label
                                  htmlFor="palm-upload"
                                  className="cursor-pointer flex flex-col items-center gap-4"
                                >
                                  <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center">
                                    <Upload className="w-10 h-10 text-amber-600" />
                                  </div>
                                  <div>
                                    <p className="text-lg font-semibold text-gray-700">
                                      {t("palmistry.analyze.uploadPrompt", "Click to upload your palm image")}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">
                                      {t("palmistry.analyze.uploadHint", "JPG, PNG or WebP. Max 10MB.")}
                                    </p>
                                  </div>
                                  <Button variant="outline" className="mt-2">
                                    <Camera className="w-4 h-4 mr-2" />
                                    {t("palmistry.analyze.selectImage", "Select Image")}
                                  </Button>
                                </label>
                      
                                {/* Tips for good palm photo */}
                                <div className="mt-8 text-left bg-white rounded-lg p-4 border border-amber-200">
                                  <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                    <Info className="w-4 h-4 text-amber-600" />
                                    {t("palmistry.analyze.tipsTitle", "Tips for a good palm photo:")}
                                  </h4>
                                  <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                                    <li>{t("palmistry.analyze.tip1", "Use good lighting - natural daylight works best")}</li>
                                    <li>{t("palmistry.analyze.tip2", "Keep your palm flat and fingers slightly spread")}</li>
                                    <li>{t("palmistry.analyze.tip3", "Capture the hand selected above based on your handedness")}</li>
                                    <li>{t("palmistry.analyze.tip4", "Ensure all major lines are visible in the frame")}</li>
                                    <li>{t("palmistry.analyze.tip5", "Avoid shadows across your palm")}</li>
                                  </ul>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-6">
                                {/* Uploaded Image Preview */}
                                <div className="relative">
                                  <div className="relative w-full max-w-md mx-auto aspect-square rounded-lg overflow-hidden border-2 border-amber-200">
                                    <Image
                                      src={uploadedImage}
                                      alt={t("palmistry.analyze.uploadedPalm", "Uploaded palm image")}
                                      fill
                                      className="object-contain bg-gray-100"
                                    />
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="absolute top-2 right-2"
                                    onClick={resetAnalysis}
                                  >
                                    {t("palmistry.analyze.changeImage", "Change Image")}
                                  </Button>
                                </div>
                      
                                {/* Analyze Button */}
                                {!analysisResult && !isAnalyzing && (
                                  <div className="text-center">
                                    <Button
                                      size="lg"
                                      onClick={analyzePalm}
                                      className="bg-amber-600 hover:bg-amber-700"
                                    >
                                      <Hand className="w-5 h-5 mr-2" />
                                      {t("palmistry.analyze.analyzeButton", "Analyze My Palm")}
                                    </Button>
                                  </div>
                                )}
                      
                                {/* Loading State */}
                                {isAnalyzing && (
                                  <div className="text-center py-8">
                                    <Loader2 className="w-12 h-12 text-amber-600 animate-spin mx-auto mb-4" />
                                    <p className="text-lg font-semibold text-gray-700">
                                      {t("palmistry.analyze.analyzing", "Analyzing your palm...")}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">
                                      {t("palmistry.analyze.analyzingHint", "This may take a few seconds")}
                                    </p>
                                  </div>
                                )}
                      
                                {/* Error State */}
                                {analysisError && (
                                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                                    <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                                    <p className="text-red-700">{analysisError}</p>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="mt-3"
                                      onClick={() => setAnalysisError(null)}
                                    >
                                      {t("palmistry.analyze.tryAgain", "Try Again")}
                                    </Button>
                                  </div>
                                )}
                      
                                {/* Analysis Results */}
                                {analysisResult && (
                                  <div className="space-y-6">
                                    {/* Success Header */}
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                                      <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                                      <p className="text-green-700 font-semibold">
                                        {t("palmistry.analyze.analysisComplete", "Palm Analysis Complete!")}
                                      </p>
                                    </div>
                          
                                    {/* Overall Reading */}
                                    <Card className="bg-amber-50 border-amber-200">
                                      <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                          <BookOpen className="w-5 h-5 text-amber-600" />
                                          {t("palmistry.analyze.overallReading", "Overall Reading")}
                                        </CardTitle>
                                      </CardHeader>
                                      <CardContent>
                                        <p className="text-gray-700">{analysisResult.overallReading}</p>
                                      </CardContent>
                                    </Card>
                          
                                    {/* Detected Lines */}
                                    {analysisResult.detectedLines.length > 0 && (
                                      <div>
                                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                          <TrendingUp className="w-5 h-5 text-amber-600" />
                                          {t("palmistry.analyze.detectedLines", "Detected Palm Lines")}
                                        </h3>
                                        <div className="grid md:grid-cols-2 gap-4">
                                          {analysisResult.detectedLines.map((line, idx) => (
                                            <Card key={idx}>
                                              <CardHeader className="pb-2">
                                                <div className="flex items-center justify-between">
                                                  <CardTitle className="text-base">
                                                    {line.name}
                                                    <span className="text-sm text-gray-500 ml-2">({line.hindi})</span>
                                                  </CardTitle>
                                                  <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                                                    {line.confidence}% {t("palmistry.analyze.confidence", "confidence")}
                                                  </Badge>
                                                </div>
                                              </CardHeader>
                                              <CardContent className="pt-2">
                                                <p className="text-sm text-gray-500 mb-2">{line.meaning}</p>
                                                <p className="text-gray-700">{line.interpretation}</p>
                                              </CardContent>
                                            </Card>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                          
                                    {/* Hand Shape Analysis */}
                                    <Card>
                                      <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                          <Hand className="w-5 h-5 text-amber-600" />
                                          {t("palmistry.analyze.handShape", "Hand Shape Analysis")}
                                        </CardTitle>
                                      </CardHeader>
                                      <CardContent>
                                        <div className="flex items-center gap-4 mb-3">
                                          <Badge className="bg-amber-600">{analysisResult.handShape.shape}</Badge>
                                          <Badge variant="outline">{analysisResult.handShape.element} Element</Badge>
                                        </div>
                                        <p className="text-gray-700">{analysisResult.handShape.characteristics}</p>
                                      </CardContent>
                                    </Card>
                          
                                    {/* Disclaimer */}
                                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-600">
                                      <p className="flex items-start gap-2">
                                        <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                        {t("palmistry.analyze.disclaimer", "This palm reading is based on traditional Vedic palmistry principles and is intended for entertainment and self-reflection purposes only. It should not be considered as professional advice or absolute prediction.")}
                                      </p>
                                    </div>
                          
                                    {/* Try Another */}
                                    <div className="text-center">
                                      <Button variant="outline" onClick={resetAnalysis}>
                                        {t("palmistry.analyze.tryAnother", "Analyze Another Palm")}
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>

                    {/* Lines Tab */}
                    <TabsContent value="lines">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Lines List */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("palmistry.majorLines", "Major Palm Lines")}</CardTitle>
                    <CardDescription>
                      {t("palmistry.selectLine", "Select a line to learn more")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {palmLines.map((line, idx) => (
                      <Button
                        key={idx}
                        variant={selectedLine?.name === line.name ? "default" : "outline"}
                        className="w-full justify-start"
                        onClick={() => setSelectedLine(line)}
                      >
                        {line.name === "Heart Line" && <Heart className="w-4 h-4 mr-2 text-red-500" />}
                        {line.name === "Head Line" && <Brain className="w-4 h-4 mr-2 text-blue-500" />}
                        {line.name === "Life Line" && <Sparkles className="w-4 h-4 mr-2 text-green-500" />}
                        {line.name === "Fate Line" && <Star className="w-4 h-4 mr-2 text-purple-500" />}
                        {line.name === "Sun Line" && <Star className="w-4 h-4 mr-2 text-yellow-500" />}
                        {line.name === "Marriage Line" && <Heart className="w-4 h-4 mr-2 text-pink-500" />}
                        <span>{getTranslatedLineName(line.name, t)}</span>
                      </Button>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Line Details */}
              <div className="lg:col-span-2">
                {!selectedLine ? (
                  <Card className="h-full flex items-center justify-center min-h-[400px]">
                    <CardContent className="text-center py-12">
                      <Hand className="w-16 h-16 text-amber-200 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">
                        {t("palmistry.selectLinePrompt", "Select a line")}
                      </h3>
                      <p className="text-gray-500">
                        {t("palmistry.selectLineDesc", "Click on a palm line from the list to see its meaning and interpretations.")}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                          {selectedLine.name === "Heart Line" && <Heart className="w-6 h-6 text-red-500" />}
                          {selectedLine.name === "Head Line" && <Brain className="w-6 h-6 text-blue-500" />}
                          {selectedLine.name === "Life Line" && <Sparkles className="w-6 h-6 text-green-500" />}
                          {selectedLine.name === "Fate Line" && <Star className="w-6 h-6 text-purple-500" />}
                          {selectedLine.name === "Sun Line" && <Star className="w-6 h-6 text-yellow-500" />}
                          {selectedLine.name === "Marriage Line" && <Heart className="w-6 h-6 text-pink-500" />}
                        </div>
                        <div>
                          <CardTitle>{getTranslatedLineName(selectedLine.name, t)}</CardTitle>
                          <CardDescription>{selectedLine.hindi}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Line Image */}
                      {lineImages[selectedLine.name] && (
                        <div className="relative w-full h-64 md:h-80 rounded-lg overflow-hidden bg-gray-100">
                          <Image
                            src={lineImages[selectedLine.name]}
                            alt={getTranslatedLineName(selectedLine.name, t)}
                            fill
                            className="object-contain"
                            sizes="(max-width: 768px) 100vw, 50vw"
                          />
                        </div>
                      )}

                      <div className="p-4 bg-amber-50 rounded-lg">
                        <h4 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                          <Info className="w-4 h-4" />
                          {t("palmistry.location", "Location")}
                        </h4>
                        <p className="text-gray-700">{selectedLine.location}</p>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">{t("palmistry.meaning", "Meaning")}</h4>
                        <p className="text-gray-600">{selectedLine.meaning}</p>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-800 mb-3">{t("palmistry.variations", "Variations & Interpretations")}</h4>
                        <div className="space-y-3">
                          {selectedLine.variations.map((v, idx) => (
                            <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                              <p className="font-medium text-amber-700">{v.type}</p>
                              <p className="text-sm text-gray-600">{v.interpretation}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Mounts Tab */}
          <TabsContent value="mounts">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Mounts List */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("palmistry.palmMounts", "Palm Mounts")}</CardTitle>
                    <CardDescription>
                      {t("palmistry.selectMount", "Select a mount to learn more")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {mounts.map((mount, idx) => (
                      <Button
                        key={idx}
                        variant={selectedMount?.name === mount.name ? "default" : "outline"}
                        className="w-full justify-start text-left"
                        onClick={() => setSelectedMount(mount)}
                      >
                        <Star className="w-4 h-4 mr-2" />
                        <span className="truncate">{getTranslatedMountName(mount.name, t)}</span>
                      </Button>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Mount Details */}
              <div className="lg:col-span-2">
                {!selectedMount ? (
                  <Card className="h-full flex items-center justify-center min-h-[400px]">
                    <CardContent className="text-center py-12">
                      <Target className="w-16 h-16 text-amber-200 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">
                        {t("palmistry.selectMountPrompt", "Select a mount")}
                      </h3>
                      <p className="text-gray-500">
                        {t("palmistry.selectMountDesc", "Click on a palm mount from the list to see its meaning and interpretations.")}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>{getTranslatedMountName(selectedMount.name, t)}</CardTitle>
                      <CardDescription>Planet: {selectedMount.planet}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Mount Image */}
                      {mountImages[selectedMount.name] && (
                        <div className="relative w-full h-64 md:h-80 rounded-lg overflow-hidden bg-gray-100">
                          <Image
                            src={mountImages[selectedMount.name]}
                            alt={getTranslatedMountName(selectedMount.name, t)}
                            fill
                            className="object-contain"
                            sizes="(max-width: 768px) 100vw, 50vw"
                          />
                        </div>
                      )}

                      <div className="p-4 bg-amber-50 rounded-lg">
                        <h4 className="font-semibold text-amber-800 mb-2">{t("palmistry.location", "Location")}</h4>
                        <p className="text-gray-700">{selectedMount.location}</p>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">{t("palmistry.represents", "Represents")}</h4>
                        <p className="text-gray-600">{selectedMount.meaning}</p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-4 bg-green-50 rounded-lg">
                          <h4 className="font-semibold text-green-700 mb-2">{t("palmistry.wellDeveloped", "Well Developed")}</h4>
                          <p className="text-sm text-gray-600">{selectedMount.wellDeveloped}</p>
                        </div>
                        <div className="p-4 bg-orange-50 rounded-lg">
                          <h4 className="font-semibold text-orange-700 mb-2">{t("palmistry.underdeveloped", "Underdeveloped")}</h4>
                          <p className="text-sm text-gray-600">{selectedMount.underdeveloped}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Fingers Tab */}
          <TabsContent value="fingers">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {fingerTypes.map((finger, idx) => (
                <Card key={idx} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{getTranslatedFingerTypeName(finger.name, t)}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{finger.meaning}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="mt-8">
              <CardHeader>
                <CardTitle>{t("palmistry.individualFingers", "Individual Finger Meanings")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="p-4 bg-purple-50 rounded-lg text-center">
                    <h4 className="font-semibold text-purple-700">Thumb</h4>
                    <p className="text-sm text-gray-600 mt-2">Willpower, logic, love</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg text-center">
                    <h4 className="font-semibold text-blue-700">Index (Jupiter)</h4>
                    <p className="text-sm text-gray-600 mt-2">Ambition, leadership, ego</p>
                  </div>
                  <div className="p-4 bg-gray-100 rounded-lg text-center">
                    <h4 className="font-semibold text-gray-700">Middle (Saturn)</h4>
                    <p className="text-sm text-gray-600 mt-2">Responsibility, balance, law</p>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg text-center">
                    <h4 className="font-semibold text-yellow-700">Ring (Apollo)</h4>
                    <p className="text-sm text-gray-600 mt-2">Creativity, fame, relationships</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg text-center">
                    <h4 className="font-semibold text-green-700">Little (Mercury)</h4>
                    <p className="text-sm text-gray-600 mt-2">Communication, intuition, business</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Hand Shapes Tab */}
          <TabsContent value="shapes">
            <div className="grid md:grid-cols-2 gap-6">
              {handShapes.map((shape, idx) => (
                <Card key={idx} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {shape.name === "Earth Hand" && <span className="text-2xl">🌍</span>}
                      {shape.name === "Air Hand" && <span className="text-2xl">💨</span>}
                      {shape.name === "Water Hand" && <span className="text-2xl">💧</span>}
                      {shape.name === "Fire Hand" && <span className="text-2xl">🔥</span>}
                      {getTranslatedHandShapeName(shape.name, t)}
                    </CardTitle>
                    <CardDescription>{shape.characteristics}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Hand Shape Image */}
                    {handShapeImages[shape.name] && (
                      <div className="relative w-full h-64 rounded-lg overflow-hidden bg-gray-100">
                        <Image
                          src={handShapeImages[shape.name]}
                          alt={getTranslatedHandShapeName(shape.name, t)}
                          fill
                          className="object-contain"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                      </div>
                    )}
                    <p className="text-gray-600">{shape.meaning}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="mt-8">
              <CardHeader>
                <CardTitle>{t("palmistry.howToIdentify", "How to Identify Your Hand Shape")}</CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none">
                <ol className="list-decimal list-inside space-y-2 text-gray-600">
                  <li>Measure your palm from the base to the bottom of your middle finger</li>
                  <li>Measure your middle finger from base to tip</li>
                  <li>If palm length equals finger length, you have a square palm</li>
                  <li>If palm length is greater than finger length, you have a long palm</li>
                  <li>Compare finger length to palm width to determine short or long fingers</li>
                </ol>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* About Section */}
        <section className="mt-16">
          <Card>
            <CardHeader>
              <CardTitle>{t("palmistry.aboutTitle", "About Palmistry")}</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p className="text-gray-600">
                {t("palmistry.aboutText1", "Palmistry, also known as chiromancy or palm reading, is an ancient practice of interpreting the lines, shapes, and mounts on a person's palm to gain insights into their character, life path, and potential future. This practice has roots in ancient India, China, and Greece, dating back thousands of years.")}
              </p>
              <p className="text-gray-600 mt-4">
                {t("palmistry.aboutText2", "In Vedic tradition, palmistry (Hasta Samudrika Shastra) is considered a branch of astrology. The palm is seen as a map of one's karma and destiny, with each line and mount corresponding to different planets and aspects of life.")}
              </p>
              <p className="text-gray-600 mt-4">
                {t("palmistry.aboutText3", "While palmistry can provide interesting insights, it should be used as a tool for self-reflection rather than absolute prediction. The lines on your palm can change over time, reflecting changes in your life circumstances and personal growth.")}
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
