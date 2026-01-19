"use client";

import { useState } from "react";
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
} from "lucide-react";

// Image paths for palm lines
const lineImages: Record<string, string> = {
  "Heart Line": "/images/palmistry/lines/heart-line.png",
  "Head Line": "/images/palmistry/lines/head-line.png",
  "Life Line": "/images/palmistry/lines/life-line.png",
  "Fate Line": "/images/palmistry/lines/fate-line.png",
  "Sun Line": "/images/palmistry/lines/sun-line.png",
  "Marriage Line": "/images/palmistry/lines/marriage-line.png",
};

// Image paths for mounts
const mountImages: Record<string, string> = {
  "Mount of Jupiter": "/images/palmistry/mounts/mount-jupiter.png",
  "Mount of Saturn": "/images/palmistry/mounts/mount-saturn.png",
  "Mount of Apollo (Sun)": "/images/palmistry/mounts/mount-apollo.png",
  "Mount of Mercury": "/images/palmistry/mounts/mount-mercury.png",
  "Mount of Venus": "/images/palmistry/mounts/mount-venus.png",
  "Mount of Moon": "/images/palmistry/mounts/mount-moon.png",
  "Mount of Mars (Upper)": "/images/palmistry/mounts/mount-mars-upper.png",
  "Mount of Mars (Lower)": "/images/palmistry/mounts/mount-mars-lower.png",
};

// Image paths for hand shapes
const handShapeImages: Record<string, string> = {
  "Earth Hand": "/images/palmistry/shapes/earth-hand.png",
  "Air Hand": "/images/palmistry/shapes/air-hand.png",
  "Water Hand": "/images/palmistry/shapes/water-hand.png",
  "Fire Hand": "/images/palmistry/shapes/fire-hand.png",
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
  const [activeTab, setActiveTab] = useState("lines");
  const [selectedLine, setSelectedLine] = useState<PalmLine | null>(null);
  const [selectedMount, setSelectedMount] = useState<Mount | null>(null);

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      {/* Hero Section */}
      <section className="relative py-16 bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600">
        <div className="absolute inset-0 bg-[url('/images/stars-pattern.png')] opacity-10"></div>
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
          <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto">
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
