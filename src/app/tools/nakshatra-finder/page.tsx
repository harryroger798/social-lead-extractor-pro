"use client";

import { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { LocationInput } from "@/components/ui/location-input";
import {
  Moon,
  Calendar,
  Clock,
  MapPin,
  Star,
  Sparkles,
  Heart,
  Gem,
  Palette,
} from "lucide-react";

interface NakshatraData {
  name: string;
  sanskrit: string;
  lord: string;
  deity: string;
  symbol: string;
  element: string;
  gana: string;
  animal: string;
  characteristics: string[];
  strengths: string[];
  challenges: string[];
  compatibility: string[];
  luckyColor: string;
  luckyNumber: number;
  luckyDay: string;
  gemstone: string;
  mantra: string;
}

const nakshatraDatabase: NakshatraData[] = [
  {
    name: "Ashwini",
    sanskrit: "अश्विनी",
    lord: "Ketu",
    deity: "Ashwini Kumaras (Divine Physicians)",
    symbol: "Horse's Head",
    element: "Earth",
    gana: "Deva (Divine)",
    animal: "Male Horse",
    characteristics: ["Quick-witted", "Energetic", "Pioneering", "Healing abilities", "Independent"],
    strengths: ["Natural healers", "Quick decision makers", "Adventurous spirit", "Leadership qualities"],
    challenges: ["Impatience", "Impulsiveness", "Difficulty completing tasks", "Restlessness"],
    compatibility: ["Bharani", "Pushya", "Ashlesha"],
    luckyColor: "#FF0000",
    luckyNumber: 7,
    luckyDay: "Tuesday",
    gemstone: "Cat's Eye",
    mantra: "Om Ashwini Kumarabhyam Namah",
  },
  {
    name: "Bharani",
    sanskrit: "भरणी",
    lord: "Venus",
    deity: "Yama (God of Death)",
    symbol: "Yoni (Female Reproductive Organ)",
    element: "Earth",
    gana: "Manushya (Human)",
    animal: "Male Elephant",
    characteristics: ["Creative", "Nurturing", "Transformative", "Determined", "Passionate"],
    strengths: ["Strong willpower", "Creative expression", "Ability to transform", "Protective nature"],
    challenges: ["Jealousy", "Possessiveness", "Extremism", "Struggle with change"],
    compatibility: ["Ashwini", "Rohini", "Pushya"],
    luckyColor: "#8B0000",
    luckyNumber: 9,
    luckyDay: "Friday",
    gemstone: "Diamond",
    mantra: "Om Yamaya Namah",
  },
  {
    name: "Krittika",
    sanskrit: "कृत्तिका",
    lord: "Sun",
    deity: "Agni (Fire God)",
    symbol: "Razor/Flame",
    element: "Fire",
    gana: "Rakshasa (Demon)",
    animal: "Female Sheep",
    characteristics: ["Sharp intellect", "Purifying nature", "Leadership", "Courage", "Determination"],
    strengths: ["Strong leadership", "Ability to cut through illusions", "Protective", "Dignified"],
    challenges: ["Harsh speech", "Stubbornness", "Aggressive tendencies", "Pride"],
    compatibility: ["Rohini", "Mrigashira", "Pushya"],
    luckyColor: "#FFFFFF",
    luckyNumber: 1,
    luckyDay: "Sunday",
    gemstone: "Ruby",
    mantra: "Om Agnaye Namah",
  },
  {
    name: "Rohini",
    sanskrit: "रोहिणी",
    lord: "Moon",
    deity: "Brahma (Creator)",
    symbol: "Ox Cart/Chariot",
    element: "Earth",
    gana: "Manushya (Human)",
    animal: "Male Serpent",
    characteristics: ["Beautiful", "Artistic", "Sensual", "Materialistic", "Grounded"],
    strengths: ["Artistic talents", "Material success", "Attractive personality", "Stability"],
    challenges: ["Possessiveness", "Jealousy", "Over-indulgence", "Stubbornness"],
    compatibility: ["Mrigashira", "Hasta", "Shravana"],
    luckyColor: "#FFFAF0",
    luckyNumber: 2,
    luckyDay: "Monday",
    gemstone: "Pearl",
    mantra: "Om Brahmane Namah",
  },
  {
    name: "Mrigashira",
    sanskrit: "मृगशिरा",
    lord: "Mars",
    deity: "Soma (Moon God)",
    symbol: "Deer's Head",
    element: "Earth",
    gana: "Deva (Divine)",
    animal: "Female Serpent",
    characteristics: ["Curious", "Searching", "Gentle", "Sensual", "Artistic"],
    strengths: ["Research abilities", "Gentle nature", "Artistic expression", "Adaptability"],
    challenges: ["Fickleness", "Suspicion", "Restlessness", "Indecision"],
    compatibility: ["Rohini", "Ardra", "Chitra"],
    luckyColor: "#C0C0C0",
    luckyNumber: 3,
    luckyDay: "Tuesday",
    gemstone: "Red Coral",
    mantra: "Om Somaya Namah",
  },
  {
    name: "Ardra",
    sanskrit: "आर्द्रा",
    lord: "Rahu",
    deity: "Rudra (Storm God)",
    symbol: "Teardrop/Diamond",
    element: "Water",
    gana: "Manushya (Human)",
    animal: "Female Dog",
    characteristics: ["Intellectual", "Transformative", "Intense", "Curious", "Destructive-Creative"],
    strengths: ["Deep thinking", "Research abilities", "Transformation power", "Emotional depth"],
    challenges: ["Destructive tendencies", "Arrogance", "Critical nature", "Emotional storms"],
    compatibility: ["Mrigashira", "Punarvasu", "Swati"],
    luckyColor: "#008000",
    luckyNumber: 4,
    luckyDay: "Wednesday",
    gemstone: "Hessonite",
    mantra: "Om Rudraya Namah",
  },
  {
    name: "Punarvasu",
    sanskrit: "पुनर्वसु",
    lord: "Jupiter",
    deity: "Aditi (Mother of Gods)",
    symbol: "Bow and Quiver",
    element: "Water",
    gana: "Deva (Divine)",
    animal: "Female Cat",
    characteristics: ["Optimistic", "Nurturing", "Philosophical", "Generous", "Returning"],
    strengths: ["Resilience", "Wisdom", "Nurturing nature", "Spiritual inclination"],
    challenges: ["Over-simplification", "Lack of ambition", "Complacency", "Indecisiveness"],
    compatibility: ["Ardra", "Pushya", "Ashlesha"],
    luckyColor: "#FFFF00",
    luckyNumber: 3,
    luckyDay: "Thursday",
    gemstone: "Yellow Sapphire",
    mantra: "Om Aditaye Namah",
  },
  {
    name: "Pushya",
    sanskrit: "पुष्य",
    lord: "Saturn",
    deity: "Brihaspati (Divine Priest)",
    symbol: "Cow's Udder/Lotus",
    element: "Water",
    gana: "Deva (Divine)",
    animal: "Male Sheep",
    characteristics: ["Nourishing", "Protective", "Spiritual", "Generous", "Traditional"],
    strengths: ["Nurturing abilities", "Spiritual wisdom", "Generosity", "Stability"],
    challenges: ["Over-attachment", "Stubbornness", "Orthodoxy", "Possessiveness"],
    compatibility: ["Punarvasu", "Ashlesha", "Magha"],
    luckyColor: "#000080",
    luckyNumber: 8,
    luckyDay: "Saturday",
    gemstone: "Blue Sapphire",
    mantra: "Om Brihaspataye Namah",
  },
  {
    name: "Ashlesha",
    sanskrit: "आश्लेषा",
    lord: "Mercury",
    deity: "Nagas (Serpent Gods)",
    symbol: "Coiled Serpent",
    element: "Water",
    gana: "Rakshasa (Demon)",
    animal: "Male Cat",
    characteristics: ["Intuitive", "Mystical", "Hypnotic", "Cunning", "Transformative"],
    strengths: ["Intuition", "Mystical abilities", "Persuasion", "Healing powers"],
    challenges: ["Deception", "Manipulation", "Coldness", "Secretiveness"],
    compatibility: ["Pushya", "Magha", "Purva Phalguni"],
    luckyColor: "#006400",
    luckyNumber: 5,
    luckyDay: "Wednesday",
    gemstone: "Emerald",
    mantra: "Om Sarpebhyo Namah",
  },
  {
    name: "Magha",
    sanskrit: "मघा",
    lord: "Ketu",
    deity: "Pitris (Ancestors)",
    symbol: "Royal Throne",
    element: "Fire",
    gana: "Rakshasa (Demon)",
    animal: "Male Rat",
    characteristics: ["Royal", "Authoritative", "Traditional", "Ambitious", "Ancestral"],
    strengths: ["Leadership", "Authority", "Respect for tradition", "Ambition"],
    challenges: ["Arrogance", "Aloofness", "Rigidity", "Superiority complex"],
    compatibility: ["Ashlesha", "Purva Phalguni", "Uttara Phalguni"],
    luckyColor: "#FFD700",
    luckyNumber: 7,
    luckyDay: "Tuesday",
    gemstone: "Cat's Eye",
    mantra: "Om Pitribhyo Namah",
  },
  {
    name: "Purva Phalguni",
    sanskrit: "पूर्व फाल्गुनी",
    lord: "Venus",
    deity: "Bhaga (God of Fortune)",
    symbol: "Front Legs of Bed/Hammock",
    element: "Fire",
    gana: "Manushya (Human)",
    animal: "Female Rat",
    characteristics: ["Creative", "Romantic", "Luxurious", "Artistic", "Pleasure-seeking"],
    strengths: ["Creativity", "Charm", "Artistic abilities", "Enjoyment of life"],
    challenges: ["Vanity", "Laziness", "Over-indulgence", "Superficiality"],
    compatibility: ["Magha", "Uttara Phalguni", "Hasta"],
    luckyColor: "#FFC0CB",
    luckyNumber: 6,
    luckyDay: "Friday",
    gemstone: "Diamond",
    mantra: "Om Bhagaya Namah",
  },
  {
    name: "Uttara Phalguni",
    sanskrit: "उत्तर फाल्गुनी",
    lord: "Sun",
    deity: "Aryaman (God of Contracts)",
    symbol: "Back Legs of Bed",
    element: "Fire",
    gana: "Manushya (Human)",
    animal: "Male Cow",
    characteristics: ["Generous", "Helpful", "Friendly", "Prosperous", "Charitable"],
    strengths: ["Generosity", "Leadership", "Helpfulness", "Prosperity"],
    challenges: ["Over-confidence", "Stubbornness", "Patronizing", "Restlessness"],
    compatibility: ["Purva Phalguni", "Hasta", "Chitra"],
    luckyColor: "#FFA500",
    luckyNumber: 1,
    luckyDay: "Sunday",
    gemstone: "Ruby",
    mantra: "Om Aryamne Namah",
  },
  {
    name: "Hasta",
    sanskrit: "हस्त",
    lord: "Moon",
    deity: "Savitar (Sun God)",
    symbol: "Hand/Palm",
    element: "Fire",
    gana: "Deva (Divine)",
    animal: "Female Buffalo",
    characteristics: ["Skillful", "Clever", "Industrious", "Resourceful", "Healing"],
    strengths: ["Manual skills", "Cleverness", "Resourcefulness", "Healing abilities"],
    challenges: ["Cunning", "Restlessness", "Over-thinking", "Criticism"],
    compatibility: ["Uttara Phalguni", "Chitra", "Swati"],
    luckyColor: "#F5F5DC",
    luckyNumber: 2,
    luckyDay: "Monday",
    gemstone: "Pearl",
    mantra: "Om Savitre Namah",
  },
  {
    name: "Chitra",
    sanskrit: "चित्रा",
    lord: "Mars",
    deity: "Vishwakarma (Divine Architect)",
    symbol: "Bright Jewel/Pearl",
    element: "Fire",
    gana: "Rakshasa (Demon)",
    animal: "Female Tiger",
    characteristics: ["Creative", "Artistic", "Charismatic", "Elegant", "Perfectionist"],
    strengths: ["Creativity", "Artistic vision", "Charisma", "Beauty appreciation"],
    challenges: ["Vanity", "Self-centeredness", "Criticism", "Superficiality"],
    compatibility: ["Hasta", "Swati", "Vishakha"],
    luckyColor: "#FF4500",
    luckyNumber: 9,
    luckyDay: "Tuesday",
    gemstone: "Red Coral",
    mantra: "Om Vishwakarmane Namah",
  },
  {
    name: "Swati",
    sanskrit: "स्वाति",
    lord: "Rahu",
    deity: "Vayu (Wind God)",
    symbol: "Coral/Sword",
    element: "Fire",
    gana: "Deva (Divine)",
    animal: "Male Buffalo",
    characteristics: ["Independent", "Flexible", "Diplomatic", "Business-minded", "Restless"],
    strengths: ["Independence", "Adaptability", "Diplomacy", "Business acumen"],
    challenges: ["Restlessness", "Indecision", "Scattered energy", "Superficiality"],
    compatibility: ["Chitra", "Vishakha", "Anuradha"],
    luckyColor: "#00CED1",
    luckyNumber: 4,
    luckyDay: "Wednesday",
    gemstone: "Hessonite",
    mantra: "Om Vayave Namah",
  },
  {
    name: "Vishakha",
    sanskrit: "विशाखा",
    lord: "Jupiter",
    deity: "Indra-Agni (King of Gods & Fire)",
    symbol: "Triumphal Arch/Potter's Wheel",
    element: "Fire",
    gana: "Rakshasa (Demon)",
    animal: "Male Tiger",
    characteristics: ["Determined", "Goal-oriented", "Ambitious", "Competitive", "Transformative"],
    strengths: ["Determination", "Focus", "Ambition", "Achievement"],
    challenges: ["Jealousy", "Frustration", "Aggression", "Obsession"],
    compatibility: ["Swati", "Anuradha", "Jyeshtha"],
    luckyColor: "#DAA520",
    luckyNumber: 3,
    luckyDay: "Thursday",
    gemstone: "Yellow Sapphire",
    mantra: "Om Indragnibhyam Namah",
  },
  {
    name: "Anuradha",
    sanskrit: "अनुराधा",
    lord: "Saturn",
    deity: "Mitra (God of Friendship)",
    symbol: "Lotus/Triumphal Gateway",
    element: "Water",
    gana: "Deva (Divine)",
    animal: "Female Deer",
    characteristics: ["Friendly", "Devoted", "Successful", "Spiritual", "Cooperative"],
    strengths: ["Friendship", "Devotion", "Success in foreign lands", "Spirituality"],
    challenges: ["Jealousy", "Controlling", "Secretiveness", "Melancholy"],
    compatibility: ["Vishakha", "Jyeshtha", "Mula"],
    luckyColor: "#800000",
    luckyNumber: 8,
    luckyDay: "Saturday",
    gemstone: "Blue Sapphire",
    mantra: "Om Mitraya Namah",
  },
  {
    name: "Jyeshtha",
    sanskrit: "ज्येष्ठा",
    lord: "Mercury",
    deity: "Indra (King of Gods)",
    symbol: "Circular Amulet/Earring",
    element: "Water",
    gana: "Rakshasa (Demon)",
    animal: "Male Deer",
    characteristics: ["Protective", "Responsible", "Authoritative", "Eldest", "Powerful"],
    strengths: ["Protection", "Authority", "Responsibility", "Power"],
    challenges: ["Jealousy", "Arrogance", "Vindictiveness", "Hypocrisy"],
    compatibility: ["Anuradha", "Mula", "Purva Ashadha"],
    luckyColor: "#2F4F4F",
    luckyNumber: 5,
    luckyDay: "Wednesday",
    gemstone: "Emerald",
    mantra: "Om Indraya Namah",
  },
  {
    name: "Mula",
    sanskrit: "मूल",
    lord: "Ketu",
    deity: "Nirriti (Goddess of Destruction)",
    symbol: "Bunch of Roots/Lion's Tail",
    element: "Water",
    gana: "Rakshasa (Demon)",
    animal: "Male Dog",
    characteristics: ["Investigative", "Destructive-Creative", "Root-seeking", "Philosophical", "Intense"],
    strengths: ["Investigation", "Getting to root causes", "Transformation", "Philosophy"],
    challenges: ["Destructiveness", "Arrogance", "Harshness", "Instability"],
    compatibility: ["Jyeshtha", "Purva Ashadha", "Uttara Ashadha"],
    luckyColor: "#8B4513",
    luckyNumber: 7,
    luckyDay: "Tuesday",
    gemstone: "Cat's Eye",
    mantra: "Om Nirritaye Namah",
  },
  {
    name: "Purva Ashadha",
    sanskrit: "पूर्वाषाढ़ा",
    lord: "Venus",
    deity: "Apas (Water Goddess)",
    symbol: "Elephant Tusk/Fan",
    element: "Water",
    gana: "Manushya (Human)",
    animal: "Male Monkey",
    characteristics: ["Invincible", "Purifying", "Ambitious", "Philosophical", "Proud"],
    strengths: ["Invincibility", "Purification", "Ambition", "Influence"],
    challenges: ["Pride", "Stubbornness", "Over-confidence", "Argumentative"],
    compatibility: ["Mula", "Uttara Ashadha", "Shravana"],
    luckyColor: "#4169E1",
    luckyNumber: 6,
    luckyDay: "Friday",
    gemstone: "Diamond",
    mantra: "Om Apadevyai Namah",
  },
  {
    name: "Uttara Ashadha",
    sanskrit: "उत्तराषाढ़ा",
    lord: "Sun",
    deity: "Vishvadevas (Universal Gods)",
    symbol: "Elephant Tusk/Small Bed",
    element: "Water",
    gana: "Manushya (Human)",
    animal: "Female Mongoose",
    characteristics: ["Victorious", "Righteous", "Leadership", "Enduring", "Introspective"],
    strengths: ["Victory", "Righteousness", "Leadership", "Endurance"],
    challenges: ["Loneliness", "Rigidity", "Aloofness", "Uncompromising"],
    compatibility: ["Purva Ashadha", "Shravana", "Dhanishta"],
    luckyColor: "#FF6347",
    luckyNumber: 1,
    luckyDay: "Sunday",
    gemstone: "Ruby",
    mantra: "Om Vishvadebhyo Namah",
  },
  {
    name: "Shravana",
    sanskrit: "श्रवण",
    lord: "Moon",
    deity: "Vishnu (Preserver)",
    symbol: "Ear/Three Footprints",
    element: "Air",
    gana: "Deva (Divine)",
    animal: "Female Monkey",
    characteristics: ["Listening", "Learning", "Connected", "Persevering", "Traditional"],
    strengths: ["Learning ability", "Listening skills", "Perseverance", "Connection"],
    challenges: ["Gossip", "Over-sensitivity", "Rigidity", "Jealousy"],
    compatibility: ["Uttara Ashadha", "Dhanishta", "Shatabhisha"],
    luckyColor: "#E6E6FA",
    luckyNumber: 2,
    luckyDay: "Monday",
    gemstone: "Pearl",
    mantra: "Om Vishnave Namah",
  },
  {
    name: "Dhanishta",
    sanskrit: "धनिष्ठा",
    lord: "Mars",
    deity: "Vasus (Eight Elemental Gods)",
    symbol: "Drum/Flute",
    element: "Air",
    gana: "Rakshasa (Demon)",
    animal: "Female Lion",
    characteristics: ["Wealthy", "Musical", "Charitable", "Ambitious", "Versatile"],
    strengths: ["Wealth accumulation", "Musical talent", "Charity", "Versatility"],
    challenges: ["Selfishness", "Carelessness", "Argumentative", "Marital issues"],
    compatibility: ["Shravana", "Shatabhisha", "Purva Bhadrapada"],
    luckyColor: "#B22222",
    luckyNumber: 9,
    luckyDay: "Tuesday",
    gemstone: "Red Coral",
    mantra: "Om Vasubhyo Namah",
  },
  {
    name: "Shatabhisha",
    sanskrit: "शतभिषा",
    lord: "Rahu",
    deity: "Varuna (God of Cosmic Waters)",
    symbol: "Empty Circle/100 Flowers",
    element: "Air",
    gana: "Rakshasa (Demon)",
    animal: "Female Horse",
    characteristics: ["Healing", "Secretive", "Independent", "Philosophical", "Mystical"],
    strengths: ["Healing abilities", "Independence", "Philosophy", "Mysticism"],
    challenges: ["Secretiveness", "Loneliness", "Eccentricity", "Addictions"],
    compatibility: ["Dhanishta", "Purva Bhadrapada", "Uttara Bhadrapada"],
    luckyColor: "#008080",
    luckyNumber: 4,
    luckyDay: "Wednesday",
    gemstone: "Hessonite",
    mantra: "Om Varunaya Namah",
  },
  {
    name: "Purva Bhadrapada",
    sanskrit: "पूर्व भाद्रपद",
    lord: "Jupiter",
    deity: "Aja Ekapada (One-footed Goat)",
    symbol: "Front of Funeral Cot/Sword",
    element: "Air",
    gana: "Manushya (Human)",
    animal: "Male Lion",
    characteristics: ["Passionate", "Transformative", "Spiritual", "Intense", "Dual-natured"],
    strengths: ["Passion", "Transformation", "Spirituality", "Intensity"],
    challenges: ["Extremism", "Cynicism", "Pessimism", "Violent tendencies"],
    compatibility: ["Shatabhisha", "Uttara Bhadrapada", "Revati"],
    luckyColor: "#4B0082",
    luckyNumber: 3,
    luckyDay: "Thursday",
    gemstone: "Yellow Sapphire",
    mantra: "Om Aja Ekapadaya Namah",
  },
  {
    name: "Uttara Bhadrapada",
    sanskrit: "उत्तर भाद्रपद",
    lord: "Saturn",
    deity: "Ahir Budhnya (Serpent of the Deep)",
    symbol: "Back of Funeral Cot/Twins",
    element: "Air",
    gana: "Manushya (Human)",
    animal: "Female Cow",
    characteristics: ["Wise", "Controlled", "Spiritual", "Charitable", "Enduring"],
    strengths: ["Wisdom", "Self-control", "Spirituality", "Charity"],
    challenges: ["Laziness", "Irresponsibility", "Aloofness", "Detachment"],
    compatibility: ["Purva Bhadrapada", "Revati", "Ashwini"],
    luckyColor: "#800080",
    luckyNumber: 8,
    luckyDay: "Saturday",
    gemstone: "Blue Sapphire",
    mantra: "Om Ahir Budhnyaya Namah",
  },
  {
    name: "Revati",
    sanskrit: "रेवती",
    lord: "Mercury",
    deity: "Pushan (Nourisher/Protector)",
    symbol: "Fish/Drum",
    element: "Air",
    gana: "Deva (Divine)",
    animal: "Female Elephant",
    characteristics: ["Nurturing", "Wealthy", "Creative", "Spiritual", "Compassionate"],
    strengths: ["Nurturing", "Wealth", "Creativity", "Compassion"],
    challenges: ["Over-sensitivity", "Indecision", "Dependency", "Escapism"],
    compatibility: ["Uttara Bhadrapada", "Ashwini", "Bharani"],
    luckyColor: "#9370DB",
    luckyNumber: 5,
    luckyDay: "Wednesday",
    gemstone: "Emerald",
    mantra: "Om Pushne Namah",
  },
];

// Helper function to find nakshatra data from database by name
function findNakshatraByName(name: string): NakshatraData | null {
  return nakshatraDatabase.find(n => n.name.toLowerCase() === name.toLowerCase()) || null;
}

export default function NakshatraFinderPage() {
  const { t } = useLanguage();
  const [birthDetails, setBirthDetails] = useState({
    date: "",
    time: "",
    place: "",
  });
  const [nakshatra, setNakshatra] = useState<NakshatraData | null>(null);
  const [nakshatraPada, setNakshatraPada] = useState<number>(1);
  const [moonSign, setMoonSign] = useState<string>("");
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCalculating(true);
    setError("");
    
    try {
      // Call the backend API for real astronomical calculations
      const response = await fetch("/api/calculate-nakshatra", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          birth_date: birthDetails.date,
          birth_time: birthDetails.time,
          birth_place: birthDetails.place,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to calculate nakshatra");
      }
      
      const data = await response.json();
      
      // Find the nakshatra data from our database
      const nakshatraData = findNakshatraByName(data.nakshatra);
      if (nakshatraData) {
        setNakshatra(nakshatraData);
        setNakshatraPada(data.pada || 1);
        setMoonSign(data.moon_sign || "");
      } else {
        throw new Error("Nakshatra not found in database");
      }
    } catch (err) {
      console.error("Error calculating nakshatra:", err);
      setError("Unable to calculate. Please check your birth details and try again.");
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="py-12 lg:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-green-100 text-green-800">{t('calculator.freeTool', 'Free Tool')}</Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {t('calculator.nakshatraFinder.title', 'Nakshatra Finder')}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('calculator.nakshatraFinder.subtitle', 'Discover your birth Nakshatra (lunar constellation) and understand its profound influence on your personality, destiny, and life path.')}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="border-amber-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Moon className="w-5 h-5 text-amber-600" />
                {t('calculator.enterBirthDetails', 'Enter Birth Details')}
              </CardTitle>
              <CardDescription>
                {t('calculator.nakshatraFinder.moonPositionNote', "Your Nakshatra is determined by the Moon's position at birth")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="date" className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {t('calculator.dateOfBirth', 'Date of Birth')}
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
                    {t('calculator.timeOfBirth', 'Time of Birth')}
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
                    {t('calculator.placeOfBirth', 'Place of Birth')}
                  </Label>
                  <LocationInput
                    id="place"
                    placeholder={t('calculator.searchCity', 'Search city...')}
                    value={birthDetails.place}
                    onChange={(e) => setBirthDetails({ ...birthDetails, place: e.target.value })}
                    onLocationSelect={(loc) => setBirthDetails({ ...birthDetails, place: loc })}
                    required
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                  disabled={isCalculating}
                >
                    {isCalculating ? (
                      <>
                        <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                        {t('calculator.calculating', 'Finding...')}
                      </>
                    ) : (
                      <>
                        <Moon className="w-4 h-4 mr-2" />
                        {t('calculator.nakshatraFinder.find', 'Find My Nakshatra')}
                      </>
                    )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {nakshatra ? (
            <Card className="border-amber-200">
              <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50">
                <div className="flex items-center justify-between">
                  <div>
                    <Badge className="mb-2 bg-amber-100 text-amber-800">{t('calculator.nakshatraFinder.yourNakshatra', 'Your Nakshatra')}</Badge>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <Star className="w-6 h-6 text-amber-600" />
                      {nakshatra.name}
                    </CardTitle>
                    <CardDescription className="text-lg">
                      {nakshatra.sanskrit} • {t('calculator.nakshatraFinder.ruledBy', 'Ruled by')} {nakshatra.lord}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-sm text-gray-600">{t('calculator.nakshatraFinder.deity', 'Deity')}</div>
                      <div className="font-medium">{nakshatra.deity}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-sm text-gray-600">{t('calculator.nakshatraFinder.symbol', 'Symbol')}</div>
                      <div className="font-medium">{nakshatra.symbol}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-sm text-gray-600">{t('calculator.nakshatraFinder.gana', 'Gana (Nature)')}</div>
                      <div className="font-medium">{nakshatra.gana}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-sm text-gray-600">{t('calculator.nakshatraFinder.element', 'Element')}</div>
                      <div className="font-medium">{nakshatra.element}</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">{t('calculator.nakshatraFinder.characteristics', 'Key Characteristics')}</h4>
                    <div className="flex flex-wrap gap-2">
                      {nakshatra.characteristics.map((char) => (
                        <Badge key={char} variant="outline" className="bg-amber-50">
                          {char}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-amber-200 bg-amber-50/50">
              <CardContent className="flex flex-col items-center justify-center h-full py-12">
                <div className="w-24 h-24 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                  <Moon className="w-12 h-12 text-amber-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t('calculator.nakshatraFinder.resultPlaceholder', 'Your Nakshatra Will Appear Here')}
                </h3>
                <p className="text-gray-600 text-center max-w-xs">
                  {t('calculator.nakshatraFinder.resultPlaceholderDesc', 'Enter your birth details to discover your Nakshatra and its influence on your life.')}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {nakshatra && (
          <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Star className="w-5 h-5 text-green-600" />
                  {t('calculator.nakshatraFinder.strengths', 'Strengths')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {nakshatra.strengths.map((strength) => (
                    <li key={strength} className="flex items-start gap-2 text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0"></span>
                      {strength}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-amber-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-600" />
                  {t('calculator.nakshatraFinder.challenges', 'Challenges')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {nakshatra.challenges.map((challenge) => (
                    <li key={challenge} className="flex items-start gap-2 text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0"></span>
                      {challenge}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-pink-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Heart className="w-5 h-5 text-pink-600" />
                  {t('calculator.nakshatraFinder.compatibility', 'Compatible Nakshatras')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {nakshatra.compatibility.map((compat) => (
                    <Badge key={compat} className="bg-pink-100 text-pink-700">
                      {compat}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Gem className="w-5 h-5 text-purple-600" />
                  {t('calculator.nakshatraFinder.luckyElements', 'Lucky Elements')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('calculator.nakshatraFinder.gemstone', 'Gemstone')}</span>
                    <span className="font-medium">{nakshatra.gemstone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('calculator.nakshatraFinder.luckyNumber', 'Lucky Number')}</span>
                    <span className="font-medium">{nakshatra.luckyNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('calculator.nakshatraFinder.luckyDay', 'Lucky Day')}</span>
                    <span className="font-medium">{nakshatra.luckyDay}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Palette className="w-5 h-5 text-blue-600" />
                  {t('calculator.nakshatraFinder.luckyColor', 'Lucky Color')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-lg border-2 border-gray-200"
                    style={{ backgroundColor: nakshatra.luckyColor.toLowerCase() }}
                  ></div>
                  <span className="font-medium text-lg">{nakshatra.luckyColor}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-orange-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Star className="w-5 h-5 text-orange-600" />
                  {t('calculator.nakshatraFinder.sacredMantra', 'Sacred Mantra')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-amber-700 font-medium italic">{nakshatra.mantra}</p>
                <p className="text-sm text-gray-500 mt-2">
                  {t('calculator.nakshatraFinder.mantraNote', 'Chant 108 times daily for best results')}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="mt-12 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {t('calculator.nakshatraFinder.understandingTitle', 'Understanding Nakshatras')}
          </h2>
          <div className="prose prose-amber max-w-none">
            <p className="text-gray-700 mb-4">
              {t('calculator.nakshatraFinder.understandingDesc1', "Nakshatras are the 27 lunar mansions in Vedic astrology, each spanning 13°20' of the zodiac. Your birth Nakshatra (Janma Nakshatra) is determined by the Moon's position at the time of your birth and reveals deep insights about your personality, emotional nature, and life path.")}
            </p>
            <p className="text-gray-700 mb-4">
              {t('calculator.nakshatraFinder.understandingDesc2', 'Each Nakshatra has a ruling deity, planetary lord, symbol, and unique characteristics that influence those born under it. Understanding your Nakshatra can help you:')}
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 mb-4">
              <li>{t('calculator.nakshatraFinder.benefit1', 'Understand your innate personality traits and tendencies')}</li>
              <li>{t('calculator.nakshatraFinder.benefit2', 'Identify your strengths and areas for growth')}</li>
              <li>{t('calculator.nakshatraFinder.benefit3', 'Find compatible partners for marriage (Nakshatra matching)')}</li>
              <li>{t('calculator.nakshatraFinder.benefit4', 'Choose auspicious times for important events (Muhurta)')}</li>
              <li>{t('calculator.nakshatraFinder.benefit5', 'Select appropriate remedies and gemstones')}</li>
            </ul>
          </div>
          <div className="mt-6 flex flex-wrap gap-4">
            <Button asChild>
              <Link href="/27-nakshatras-complete-guide-vedic-astrology">
                {t('calculator.nakshatraFinder.completeGuide', 'Complete Nakshatra Guide')}
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/tools/kundli-calculator">{t('calculator.nakshatraFinder.generateKundli', 'Generate Full Kundli')}</Link>
            </Button>
          </div>
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Nakshatra Finder",
            url: "https://vedicstarastro.com/tools/nakshatra-finder",
            description: "Discover your birth Nakshatra (lunar constellation) and understand its influence on your personality and destiny.",
            applicationCategory: "LifestyleApplication",
            operatingSystem: "Web",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "INR",
            },
            provider: {
              "@type": "Organization",
              name: "VedicStarAstro",
            },
          }),
        }}
      />
    </div>
  );
}
