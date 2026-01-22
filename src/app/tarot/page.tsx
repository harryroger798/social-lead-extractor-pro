"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { CDN_IMAGES } from "@/lib/cdn";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sparkles,
  Heart,
  Briefcase,
  HelpCircle,
  RotateCcw,
  Star,
  Sun,
  Moon,
  Zap,
  Shield,
  Crown,
  Flame,
  Waves,
  Wind,
  Mountain,
} from "lucide-react";

interface TarotCard {
  name: string;
  number: number | string;
  arcana: "major" | "minor";
  suit?: string;
  upright: string[];
  reversed: string[];
  description: string;
  advice: string;
  isReversed: boolean;
  image: string;
}

// Tarot card images from Wikimedia Commons (public domain Rider-Waite-Smith deck)
const tarotImages: Record<number, string> = {
  0: "https://upload.wikimedia.org/wikipedia/commons/9/90/RWS_Tarot_00_Fool.jpg",
  1: "https://upload.wikimedia.org/wikipedia/commons/d/de/RWS_Tarot_01_Magician.jpg",
  2: "https://upload.wikimedia.org/wikipedia/commons/8/88/RWS_Tarot_02_High_Priestess.jpg",
  3: "https://upload.wikimedia.org/wikipedia/commons/d/d2/RWS_Tarot_03_Empress.jpg",
  4: "https://upload.wikimedia.org/wikipedia/commons/c/c3/RWS_Tarot_04_Emperor.jpg",
  5: "https://upload.wikimedia.org/wikipedia/commons/8/8d/RWS_Tarot_05_Hierophant.jpg",
  6: "https://upload.wikimedia.org/wikipedia/commons/3/3a/TheLovers.jpg",
  7: "https://upload.wikimedia.org/wikipedia/commons/9/9b/RWS_Tarot_07_Chariot.jpg",
  8: "https://upload.wikimedia.org/wikipedia/commons/f/f5/RWS_Tarot_08_Strength.jpg",
  9: "https://upload.wikimedia.org/wikipedia/commons/4/4d/RWS_Tarot_09_Hermit.jpg",
  10: "https://upload.wikimedia.org/wikipedia/commons/3/3c/RWS_Tarot_10_Wheel_of_Fortune.jpg",
  11: "https://upload.wikimedia.org/wikipedia/commons/e/e0/RWS_Tarot_11_Justice.jpg",
  12: "https://upload.wikimedia.org/wikipedia/commons/2/2b/RWS_Tarot_12_Hanged_Man.jpg",
  13: "https://upload.wikimedia.org/wikipedia/commons/d/d7/RWS_Tarot_13_Death.jpg",
  14: "https://upload.wikimedia.org/wikipedia/commons/f/f8/RWS_Tarot_14_Temperance.jpg",
  15: "https://upload.wikimedia.org/wikipedia/commons/5/55/RWS_Tarot_15_Devil.jpg",
  16: "https://upload.wikimedia.org/wikipedia/commons/5/53/RWS_Tarot_16_Tower.jpg",
  17: "https://upload.wikimedia.org/wikipedia/commons/d/db/RWS_Tarot_17_Star.jpg",
  18: "https://upload.wikimedia.org/wikipedia/commons/7/7f/RWS_Tarot_18_Moon.jpg",
  19: "https://upload.wikimedia.org/wikipedia/commons/1/17/RWS_Tarot_19_Sun.jpg",
  20: "https://upload.wikimedia.org/wikipedia/commons/d/dd/RWS_Tarot_20_Judgement.jpg",
  21: "https://upload.wikimedia.org/wikipedia/commons/f/ff/RWS_Tarot_21_World.jpg"
};

// Major Arcana cards
const majorArcana: Omit<TarotCard, 'isReversed'>[] = [
  {
    name: "The Fool",
    number: 0,
    arcana: "major",
    image: tarotImages[0],
    upright: ["New beginnings", "Innocence", "Spontaneity", "Free spirit"],
    reversed: ["Recklessness", "Risk-taking", "Holding back"],
    description: "The Fool represents new beginnings, having faith in the future, being inexperienced, not knowing what to expect, having beginner's luck, improvisation and believing in the universe.",
    advice: "Take a leap of faith. Trust in the journey ahead, even if you can't see the destination."
  },
  {
    name: "The Magician",
    number: 1,
    arcana: "major",
    image: tarotImages[1],
    upright: ["Manifestation", "Resourcefulness", "Power", "Inspired action"],
    reversed: ["Manipulation", "Poor planning", "Untapped talents"],
    description: "The Magician represents willpower, desire, creation, manifestation. He symbolizes the power to tap universal energies and use them for creative purposes.",
    advice: "You have all the tools you need. Focus your intention and take action to manifest your desires."
  },
  {
    name: "The High Priestess",
    number: 2,
    arcana: "major",
    image: tarotImages[2],
    upright: ["Intuition", "Sacred knowledge", "Divine feminine", "Subconscious mind"],
    reversed: ["Secrets", "Disconnected from intuition", "Withdrawal"],
    description: "The High Priestess represents wisdom, serenity, knowledge and understanding. She is often described as the guardian of the unconscious.",
    advice: "Trust your intuition. The answers you seek are within you. Take time for quiet reflection."
  },
  {
    name: "The Empress",
    number: 3,
    arcana: "major",
    image: tarotImages[3],
    upright: ["Femininity", "Beauty", "Nature", "Nurturing", "Abundance"],
    reversed: ["Creative block", "Dependence on others", "Emptiness"],
    description: "The Empress represents fertility, femininity, beauty, nature and abundance. She is the mother figure of the tarot deck.",
    advice: "Nurture yourself and others. Connect with nature and embrace creativity and abundance."
  },
  {
    name: "The Emperor",
    number: 4,
    arcana: "major",
    image: tarotImages[4],
    upright: ["Authority", "Establishment", "Structure", "Father figure"],
    reversed: ["Domination", "Excessive control", "Lack of discipline"],
    description: "The Emperor represents authority figures, structure, solid foundations. He is the father figure of the tarot deck.",
    advice: "Take charge of your situation. Establish order and structure to achieve your goals."
  },
  {
    name: "The Hierophant",
    number: 5,
    arcana: "major",
    image: tarotImages[5],
    upright: ["Spiritual wisdom", "Religious beliefs", "Conformity", "Tradition"],
    reversed: ["Personal beliefs", "Freedom", "Challenging the status quo"],
    description: "The Hierophant represents tradition, conformity, morality and ethics. He is the masculine counterpart to the High Priestess.",
    advice: "Seek guidance from a mentor or spiritual teacher. Honor traditions while finding your own path."
  },
  {
    name: "The Lovers",
    number: 6,
    arcana: "major",
    image: tarotImages[6],
    upright: ["Love", "Harmony", "Relationships", "Values alignment", "Choices"],
    reversed: ["Self-love", "Disharmony", "Imbalance", "Misalignment of values"],
    description: "The Lovers represents relationships and choices. Its appearance in a spread indicates some decision about an existing relationship or a temptation of the heart.",
    advice: "Follow your heart but also use your head. Make choices aligned with your values."
  },
  {
    name: "The Chariot",
    number: 7,
    arcana: "major",
    image: tarotImages[7],
    upright: ["Control", "Willpower", "Success", "Action", "Determination"],
    reversed: ["Self-discipline", "Opposition", "Lack of direction"],
    description: "The Chariot represents conquest, victory, overcoming obstacles through confidence and control. It suggests a battle that can be won if the querent has the willpower.",
    advice: "Stay focused and determined. You have the strength to overcome any obstacle."
  },
  {
    name: "Strength",
    number: 8,
    arcana: "major",
    image: tarotImages[8],
    upright: ["Strength", "Courage", "Persuasion", "Influence", "Compassion"],
    reversed: ["Inner strength", "Self-doubt", "Low energy", "Raw emotion"],
    description: "Strength represents inner strength, bravery, compassion, focus, and persuasion. This card suggests that you can overcome any obstacle with patience and inner calm.",
    advice: "Use gentle strength rather than force. Compassion and patience will see you through."
  },
  {
    name: "The Hermit",
    number: 9,
    arcana: "major",
    image: tarotImages[9],
    upright: ["Soul-searching", "Introspection", "Being alone", "Inner guidance"],
    reversed: ["Isolation", "Loneliness", "Withdrawal"],
    description: "The Hermit represents soul-searching, introspection, being alone, inner guidance. He is a seeker of truth and illumination.",
    advice: "Take time for solitude and reflection. The answers you seek require inner contemplation."
  },
  {
    name: "Wheel of Fortune",
    number: 10,
    arcana: "major",
    image: tarotImages[10],
    upright: ["Good luck", "Karma", "Life cycles", "Destiny", "Turning point"],
    reversed: ["Bad luck", "Resistance to change", "Breaking cycles"],
    description: "The Wheel of Fortune represents karma, destiny, a turning point, luck and fortune. It reminds us that nothing is permanent and change is inevitable.",
    advice: "Embrace change as part of life's natural cycle. What goes around comes around."
  },
  {
    name: "Justice",
    number: 11,
    arcana: "major",
    image: tarotImages[11],
    upright: ["Justice", "Fairness", "Truth", "Cause and effect", "Law"],
    reversed: ["Unfairness", "Lack of accountability", "Dishonesty"],
    description: "Justice represents justice, fairness, truth, cause and effect, law. It suggests that all actions have consequences.",
    advice: "Act with integrity and fairness. The truth will come to light, and justice will prevail."
  },
  {
    name: "The Hanged Man",
    number: 12,
    arcana: "major",
    image: tarotImages[12],
    upright: ["Pause", "Surrender", "Letting go", "New perspectives"],
    reversed: ["Delays", "Resistance", "Stalling", "Indecision"],
    description: "The Hanged Man represents surrender, letting go, new perspectives. It suggests a pause in life, perhaps a time of meditation and reflection.",
    advice: "Sometimes you need to let go and see things from a different perspective. Surrender to the process."
  },
  {
    name: "Death",
    number: 13,
    arcana: "major",
    image: tarotImages[13],
    upright: ["Endings", "Change", "Transformation", "Transition"],
    reversed: ["Resistance to change", "Personal transformation", "Inner purging"],
    description: "Death represents endings, change, transformation, transition. It rarely means physical death; rather, it signifies the end of a cycle and new beginnings.",
    advice: "Let go of what no longer serves you. Transformation is necessary for growth."
  },
  {
    name: "Temperance",
    number: 14,
    arcana: "major",
    image: tarotImages[14],
    upright: ["Balance", "Moderation", "Patience", "Purpose"],
    reversed: ["Imbalance", "Excess", "Self-healing", "Re-alignment"],
    description: "Temperance represents balance, moderation, patience, purpose. It suggests finding middle ground and avoiding extremes.",
    advice: "Practice moderation and patience. Balance is key to achieving your goals."
  },
  {
    name: "The Devil",
    number: 15,
    arcana: "major",
    image: tarotImages[15],
    upright: ["Shadow self", "Attachment", "Addiction", "Restriction"],
    reversed: ["Releasing limiting beliefs", "Exploring dark thoughts", "Detachment"],
    description: "The Devil represents shadow self, attachment, addiction, restriction, sexuality. It suggests being bound by material things or unhealthy attachments.",
    advice: "Recognize what's holding you back. You have the power to break free from limitations."
  },
  {
    name: "The Tower",
    number: 16,
    arcana: "major",
    image: tarotImages[16],
    upright: ["Sudden change", "Upheaval", "Chaos", "Revelation", "Awakening"],
    reversed: ["Personal transformation", "Fear of change", "Averting disaster"],
    description: "The Tower represents sudden change, upheaval, chaos, revelation, awakening. It suggests that change is coming whether you want it or not.",
    advice: "Sometimes destruction is necessary for rebuilding. Embrace the change and rebuild stronger."
  },
  {
    name: "The Star",
    number: 17,
    arcana: "major",
    image: tarotImages[17],
    upright: ["Hope", "Faith", "Purpose", "Renewal", "Spirituality"],
    reversed: ["Lack of faith", "Despair", "Self-trust", "Disconnection"],
    description: "The Star represents hope, faith, purpose, renewal, spirituality. It is a card of great hope and inspiration.",
    advice: "Have faith in the future. Hope and healing are on the horizon."
  },
  {
    name: "The Moon",
    number: 18,
    arcana: "major",
    image: tarotImages[18],
    upright: ["Illusion", "Fear", "Anxiety", "Subconscious", "Intuition"],
    reversed: ["Release of fear", "Repressed emotion", "Inner confusion"],
    description: "The Moon represents illusion, fear, anxiety, subconscious, intuition. It suggests that things may not be as they appear.",
    advice: "Trust your intuition but be aware of illusions. Face your fears to find clarity."
  },
  {
    name: "The Sun",
    number: 19,
    arcana: "major",
    image: tarotImages[19],
    upright: ["Positivity", "Fun", "Warmth", "Success", "Vitality"],
    reversed: ["Inner child", "Feeling down", "Overly optimistic"],
    description: "The Sun represents positivity, fun, warmth, success, vitality. It is one of the most positive cards in the deck.",
    advice: "Embrace joy and positivity. Success and happiness are within reach."
  },
  {
    name: "Judgement",
    number: 20,
    arcana: "major",
    image: tarotImages[20],
    upright: ["Judgement", "Rebirth", "Inner calling", "Absolution"],
    reversed: ["Self-doubt", "Inner critic", "Ignoring the call"],
    description: "Judgement represents judgement, rebirth, inner calling, absolution. It suggests a time of self-evaluation and reflection.",
    advice: "Answer your higher calling. It's time for self-reflection and making important decisions."
  },
  {
    name: "The World",
    number: 21,
    arcana: "major",
    image: tarotImages[21],
    upright: ["Completion", "Integration", "Accomplishment", "Travel"],
    reversed: ["Seeking personal closure", "Short-cuts", "Delays"],
    description: "The World represents completion, integration, accomplishment, travel. It signifies the end of a cycle and the achievement of goals.",
    advice: "Celebrate your accomplishments. A cycle is complete, and new adventures await."
  }
];

// Function to draw random cards
function drawCards(count: number): TarotCard[] {
  const shuffled = [...majorArcana].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map(card => ({
    ...card,
    isReversed: Math.random() > 0.7 // 30% chance of reversed
  }));
}

// Yes/No answer based on card
function getYesNoAnswer(card: TarotCard): { answer: string; confidence: string } {
  const yesCards = ["The Sun", "The Star", "The World", "The Empress", "The Magician", "Wheel of Fortune", "Strength", "The Lovers"];
  const noCards = ["The Tower", "The Devil", "Death", "The Moon", "The Hanged Man"];
  
  if (card.isReversed) {
    if (yesCards.includes(card.name)) return { answer: "Maybe", confidence: "Uncertain" };
    if (noCards.includes(card.name)) return { answer: "No", confidence: "Strong" };
    return { answer: "Unlikely", confidence: "Moderate" };
  } else {
    if (yesCards.includes(card.name)) return { answer: "Yes", confidence: "Strong" };
    if (noCards.includes(card.name)) return { answer: "No", confidence: "Moderate" };
    return { answer: "Maybe", confidence: "Uncertain" };
  }
}

export default function TarotPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("daily");
  const [dailyCard, setDailyCard] = useState<TarotCard | null>(null);
  const [loveCards, setLoveCards] = useState<TarotCard[]>([]);
  const [careerCards, setCareerCards] = useState<TarotCard[]>([]);
  const [yesNoCard, setYesNoCard] = useState<TarotCard | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const handleDailyDraw = async () => {
    setIsDrawing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setDailyCard(drawCards(1)[0]);
    setIsDrawing(false);
  };

  const handleLoveDraw = async () => {
    setIsDrawing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLoveCards(drawCards(3));
    setIsDrawing(false);
  };

  const handleCareerDraw = async () => {
    setIsDrawing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setCareerCards(drawCards(3));
    setIsDrawing(false);
  };

  const handleYesNoDraw = async () => {
    setIsDrawing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setYesNoCard(drawCards(1)[0]);
    setIsDrawing(false);
  };

    // Helper function to get translated card name
    const getTranslatedCardName = (name: string): string => {
      return t(`tarot.cardNames.${name}`, name);
    };

    const renderCard = (card: TarotCard, position?: string) => (
      <Card className={`overflow-hidden ${card.isReversed ? 'border-purple-300' : 'border-amber-300'} border-2`}>
        <div className={`h-64 relative overflow-hidden`}>
          {card.isReversed && (
            <Badge className="absolute top-2 right-2 bg-purple-800 z-10">
              {t("tarot.reversed", "Reversed")}
            </Badge>
          )}
          {position && (
            <Badge className="absolute top-2 left-2 bg-black/50 z-10">
              {position}
            </Badge>
          )}
          <img 
            src={card.image} 
            alt={card.name}
            className={`w-full h-full object-cover ${card.isReversed ? 'rotate-180' : ''}`}
          />
        </div>
        <CardContent className="p-4">
          <h4 className="font-semibold text-lg mb-2">{getTranslatedCardName(card.name)}</h4>
          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-1">
              {card.isReversed ? t("tarot.reversedMeaning", "Reversed Meaning") : t("tarot.uprightMeaning", "Upright Meaning")}
            </p>
            <div className="flex flex-wrap gap-1">
              {(card.isReversed ? card.reversed : card.upright).map((meaning, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {meaning}
                </Badge>
              ))}
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-3">{card.description}</p>
          <div className="p-2 bg-amber-50 rounded-lg">
            <p className="text-sm font-medium text-amber-800">
              <Sparkles className="w-4 h-4 inline mr-1" />
              {card.advice}
            </p>
          </div>
        </CardContent>
      </Card>
    );

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-50 to-indigo-50">
      {/* Hero Section */}
      <section className="relative py-16 bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url('${CDN_IMAGES.starsPattern}')` }}></div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <Badge className="mb-4 bg-white/20 text-white border-white/30">
              <Star className="w-3 h-3 mr-1" />
              {t("tarot.badge", "Tarot Reading")}
            </Badge>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              {t("tarot.title", "Tarot Card Reading")}
            </h1>
            <p className="text-lg text-purple-100 max-w-2xl mx-auto">
              {t("tarot.subtitle", "Discover insights about your life through the ancient wisdom of Tarot. Get daily guidance, love readings, career insights, and yes/no answers.")}
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto">
            <TabsTrigger value="daily" className="flex items-center gap-2">
              <Sun className="w-4 h-4" />
              {t("tarot.daily", "Daily")}
            </TabsTrigger>
            <TabsTrigger value="love" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              {t("tarot.love", "Love")}
            </TabsTrigger>
            <TabsTrigger value="career" className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              {t("tarot.career", "Career")}
            </TabsTrigger>
            <TabsTrigger value="yesno" className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4" />
              {t("tarot.yesNo", "Yes/No")}
            </TabsTrigger>
          </TabsList>

          {/* Daily Tarot */}
          <TabsContent value="daily">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {t("tarot.dailyTitle", "Daily Tarot Card")}
              </h2>
              <p className="text-gray-600">
                {t("tarot.dailyDesc", "Draw a single card for guidance on your day ahead")}
              </p>
            </div>

            <div className="flex flex-col items-center">
              {!dailyCard ? (
                <Card className="w-64 h-96 flex items-center justify-center bg-gradient-to-br from-purple-100 to-indigo-100 border-2 border-dashed border-purple-300">
                  <div className="text-center p-4">
                    <Moon className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">{t("tarot.clickToDraw", "Click below to draw your daily card")}</p>
                  </div>
                </Card>
              ) : (
                <div className="max-w-md">
                  {renderCard(dailyCard)}
                </div>
              )}

              <Button 
                onClick={handleDailyDraw}
                className="mt-6 bg-purple-600 hover:bg-purple-700"
                disabled={isDrawing}
              >
                {isDrawing ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                    {t("tarot.drawing", "Drawing...")}
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    {dailyCard ? t("tarot.drawAgain", "Draw Again") : t("tarot.drawCard", "Draw Card")}
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          {/* Love Tarot */}
          <TabsContent value="love">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {t("tarot.loveTitle", "Love & Relationship Reading")}
              </h2>
              <p className="text-gray-600">
                {t("tarot.loveDesc", "A three-card spread for insights into your love life: Past, Present, and Future")}
              </p>
            </div>

            <div className="flex flex-col items-center">
              {loveCards.length === 0 ? (
                <div className="flex gap-4">
                  {["Past", "Present", "Future"].map((pos, idx) => (
                    <Card key={idx} className="w-48 h-72 flex items-center justify-center bg-gradient-to-br from-pink-100 to-rose-100 border-2 border-dashed border-pink-300">
                      <div className="text-center p-4">
                        <Heart className="w-12 h-12 text-pink-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">{pos}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid md:grid-cols-3 gap-6">
                  {loveCards.map((card, idx) => (
                    <div key={idx}>
                      {renderCard(card, ["Past", "Present", "Future"][idx])}
                    </div>
                  ))}
                </div>
              )}

              <Button 
                onClick={handleLoveDraw}
                className="mt-6 bg-pink-600 hover:bg-pink-700"
                disabled={isDrawing}
              >
                {isDrawing ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                    {t("tarot.drawing", "Drawing...")}
                  </>
                ) : (
                  <>
                    <Heart className="w-4 h-4 mr-2" />
                    {loveCards.length > 0 ? t("tarot.drawAgain", "Draw Again") : t("tarot.drawCards", "Draw Cards")}
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          {/* Career Tarot */}
          <TabsContent value="career">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {t("tarot.careerTitle", "Career & Finance Reading")}
              </h2>
              <p className="text-gray-600">
                {t("tarot.careerDesc", "A three-card spread for career guidance: Situation, Challenge, and Advice")}
              </p>
            </div>

            <div className="flex flex-col items-center">
              {careerCards.length === 0 ? (
                <div className="flex gap-4">
                  {["Situation", "Challenge", "Advice"].map((pos, idx) => (
                    <Card key={idx} className="w-48 h-72 flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-100 border-2 border-dashed border-blue-300">
                      <div className="text-center p-4">
                        <Briefcase className="w-12 h-12 text-blue-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">{pos}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid md:grid-cols-3 gap-6">
                  {careerCards.map((card, idx) => (
                    <div key={idx}>
                      {renderCard(card, ["Situation", "Challenge", "Advice"][idx])}
                    </div>
                  ))}
                </div>
              )}

              <Button 
                onClick={handleCareerDraw}
                className="mt-6 bg-blue-600 hover:bg-blue-700"
                disabled={isDrawing}
              >
                {isDrawing ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                    {t("tarot.drawing", "Drawing...")}
                  </>
                ) : (
                  <>
                    <Briefcase className="w-4 h-4 mr-2" />
                    {careerCards.length > 0 ? t("tarot.drawAgain", "Draw Again") : t("tarot.drawCards", "Draw Cards")}
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          {/* Yes/No Tarot */}
          <TabsContent value="yesno">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {t("tarot.yesNoTitle", "Yes or No Reading")}
              </h2>
              <p className="text-gray-600">
                {t("tarot.yesNoDesc", "Think of a yes/no question, then draw a card for your answer")}
              </p>
            </div>

            <div className="flex flex-col items-center">
              {!yesNoCard ? (
                <Card className="w-64 h-96 flex items-center justify-center bg-gradient-to-br from-amber-100 to-orange-100 border-2 border-dashed border-amber-300">
                  <div className="text-center p-4">
                    <HelpCircle className="w-16 h-16 text-amber-400 mx-auto mb-4" />
                    <p className="text-gray-500">{t("tarot.thinkQuestion", "Think of your question...")}</p>
                  </div>
                </Card>
              ) : (
                <div className="max-w-md">
                  {renderCard(yesNoCard)}
                  
                  {/* Yes/No Answer */}
                  <Card className="mt-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                    <CardContent className="p-6 text-center">
                      <div className="text-4xl font-bold mb-2">
                        {getYesNoAnswer(yesNoCard).answer}
                      </div>
                      <div className="text-sm opacity-90">
                        {t("tarot.confidence", "Confidence")}: {getYesNoAnswer(yesNoCard).confidence}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              <Button 
                onClick={handleYesNoDraw}
                className="mt-6 bg-amber-600 hover:bg-amber-700"
                disabled={isDrawing}
              >
                {isDrawing ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                    {t("tarot.drawing", "Drawing...")}
                  </>
                ) : (
                  <>
                    <HelpCircle className="w-4 h-4 mr-2" />
                    {yesNoCard ? t("tarot.askAgain", "Ask Again") : t("tarot.getAnswer", "Get Answer")}
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* About Tarot Section */}
        <section className="mt-16">
          <Card>
            <CardHeader>
              <CardTitle>{t("tarot.aboutTitle", "About Tarot Reading")}</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p className="text-gray-600">
                {t("tarot.aboutText1", "Tarot is a form of divination that uses a deck of 78 cards to gain insight into the past, present, and future. The deck is divided into the Major Arcana (22 cards) representing life's spiritual lessons, and the Minor Arcana (56 cards) reflecting daily trials and tribulations.")}
              </p>
              <p className="text-gray-600 mt-4">
                {t("tarot.aboutText2", "Each card has its own imagery, symbolism, and story. When cards appear reversed (upside down), their meanings can be modified or intensified. Tarot readings are not about predicting a fixed future, but about exploring possibilities and gaining deeper self-understanding.")}
              </p>
              <p className="text-gray-600 mt-4">
                {t("tarot.aboutText3", "Our online tarot readings use the Major Arcana cards, which carry the most significant messages. Remember that tarot is a tool for reflection and guidance, not a definitive answer to life's questions. Use the insights gained to make informed decisions.")}
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
