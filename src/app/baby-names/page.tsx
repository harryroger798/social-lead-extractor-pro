"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { CDN_IMAGES } from "@/lib/cdn";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Baby,
  Calendar,
  Clock,
  Star,
  Sparkles,
  Heart,
  Search,
  Filter,
} from "lucide-react";

interface BabyName {
  name: string;
  meaning: string;
  gender: "boy" | "girl" | "unisex";
  origin: string;
  numerology: number;
}

interface NakshatraInfo {
  name: string;
  deity: string;
  symbol: string;
  letters: string[];
  characteristics: string[];
  luckyColor: string;
  luckyNumber: number;
}

const nakshatras: NakshatraInfo[] = [
  { name: "Ashwini", deity: "Ashwini Kumaras", symbol: "Horse's Head", letters: ["Chu", "Che", "Cho", "La"], characteristics: ["Quick", "Energetic", "Healing"], luckyColor: "Red", luckyNumber: 1 },
  { name: "Bharani", deity: "Yama", symbol: "Yoni", letters: ["Li", "Lu", "Le", "Lo"], characteristics: ["Creative", "Nurturing", "Transformative"], luckyColor: "Blood Red", luckyNumber: 9 },
  { name: "Krittika", deity: "Agni", symbol: "Razor/Flame", letters: ["A", "I", "U", "E"], characteristics: ["Sharp", "Determined", "Purifying"], luckyColor: "White", luckyNumber: 1 },
  { name: "Rohini", deity: "Brahma", symbol: "Chariot/Ox Cart", letters: ["O", "Va", "Vi", "Vu"], characteristics: ["Beautiful", "Artistic", "Fertile"], luckyColor: "White", luckyNumber: 2 },
  { name: "Mrigashira", deity: "Soma", symbol: "Deer's Head", letters: ["Ve", "Vo", "Ka", "Ki"], characteristics: ["Curious", "Gentle", "Searching"], luckyColor: "Silver Grey", luckyNumber: 3 },
  { name: "Ardra", deity: "Rudra", symbol: "Teardrop", letters: ["Ku", "Gha", "Ng", "Chha"], characteristics: ["Intense", "Transformative", "Emotional"], luckyColor: "Green", luckyNumber: 4 },
  { name: "Punarvasu", deity: "Aditi", symbol: "Bow/Quiver", letters: ["Ke", "Ko", "Ha", "Hi"], characteristics: ["Nurturing", "Optimistic", "Renewing"], luckyColor: "Yellow", luckyNumber: 3 },
  { name: "Pushya", deity: "Brihaspati", symbol: "Flower/Circle", letters: ["Hu", "He", "Ho", "Da"], characteristics: ["Nourishing", "Spiritual", "Prosperous"], luckyColor: "Yellow", luckyNumber: 8 },
  { name: "Ashlesha", deity: "Nagas", symbol: "Serpent", letters: ["Di", "Du", "De", "Do"], characteristics: ["Intuitive", "Mystical", "Penetrating"], luckyColor: "Black-Red", luckyNumber: 4 },
  { name: "Magha", deity: "Pitris", symbol: "Royal Throne", letters: ["Ma", "Mi", "Mu", "Me"], characteristics: ["Royal", "Ancestral", "Authoritative"], luckyColor: "Ivory", luckyNumber: 1 },
  { name: "Purva Phalguni", deity: "Bhaga", symbol: "Hammock", letters: ["Mo", "Ta", "Ti", "Tu"], characteristics: ["Creative", "Romantic", "Relaxing"], luckyColor: "Light Brown", luckyNumber: 9 },
  { name: "Uttara Phalguni", deity: "Aryaman", symbol: "Bed", letters: ["Te", "To", "Pa", "Pi"], characteristics: ["Generous", "Friendly", "Helpful"], luckyColor: "Bright Blue", luckyNumber: 1 },
  { name: "Hasta", deity: "Savitar", symbol: "Hand", letters: ["Pu", "Sha", "Na", "Tha"], characteristics: ["Skillful", "Clever", "Healing"], luckyColor: "Deep Green", luckyNumber: 2 },
  { name: "Chitra", deity: "Vishwakarma", symbol: "Pearl", letters: ["Pe", "Po", "Ra", "Ri"], characteristics: ["Artistic", "Beautiful", "Creative"], luckyColor: "Black", luckyNumber: 5 },
  { name: "Swati", deity: "Vayu", symbol: "Coral", letters: ["Ru", "Re", "Ro", "Ta"], characteristics: ["Independent", "Flexible", "Diplomatic"], luckyColor: "Black", luckyNumber: 4 },
  { name: "Vishakha", deity: "Indra-Agni", symbol: "Archway", letters: ["Ti", "Tu", "Te", "To"], characteristics: ["Determined", "Ambitious", "Focused"], luckyColor: "Golden", luckyNumber: 3 },
  { name: "Anuradha", deity: "Mitra", symbol: "Lotus", letters: ["Na", "Ni", "Nu", "Ne"], characteristics: ["Devoted", "Friendly", "Successful"], luckyColor: "Reddish Brown", luckyNumber: 8 },
  { name: "Jyeshtha", deity: "Indra", symbol: "Earring", letters: ["No", "Ya", "Yi", "Yu"], characteristics: ["Protective", "Courageous", "Senior"], luckyColor: "Cream", luckyNumber: 9 },
  { name: "Mula", deity: "Nirriti", symbol: "Roots", letters: ["Ye", "Yo", "Bha", "Bhi"], characteristics: ["Investigative", "Destructive", "Transformative"], luckyColor: "Brown Yellow", luckyNumber: 7 },
  { name: "Purva Ashadha", deity: "Apas", symbol: "Fan", letters: ["Bhu", "Dha", "Pha", "Dha"], characteristics: ["Invincible", "Purifying", "Energizing"], luckyColor: "Black", luckyNumber: 9 },
  { name: "Uttara Ashadha", deity: "Vishvadevas", symbol: "Elephant Tusk", letters: ["Be", "Bo", "Ja", "Ji"], characteristics: ["Universal", "Victorious", "Righteous"], luckyColor: "Copper", luckyNumber: 1 },
  { name: "Shravana", deity: "Vishnu", symbol: "Ear/Footprints", letters: ["Ju", "Je", "Jo", "Gha"], characteristics: ["Listening", "Learning", "Connected"], luckyColor: "Light Blue", luckyNumber: 2 },
  { name: "Dhanishta", deity: "Vasus", symbol: "Drum", letters: ["Ga", "Gi", "Gu", "Ge"], characteristics: ["Wealthy", "Musical", "Adaptable"], luckyColor: "Silver Grey", luckyNumber: 8 },
  { name: "Shatabhisha", deity: "Varuna", symbol: "Circle", letters: ["Go", "Sa", "Si", "Su"], characteristics: ["Healing", "Mystical", "Independent"], luckyColor: "Blue Green", luckyNumber: 4 },
  { name: "Purva Bhadrapada", deity: "Aja Ekapada", symbol: "Sword", letters: ["Se", "So", "Da", "Di"], characteristics: ["Fiery", "Transformative", "Spiritual"], luckyColor: "Silver Grey", luckyNumber: 7 },
  { name: "Uttara Bhadrapada", deity: "Ahir Budhnya", symbol: "Twins", letters: ["Du", "Tha", "Jha", "Da"], characteristics: ["Deep", "Wise", "Controlled"], luckyColor: "Purple", luckyNumber: 3 },
  { name: "Revati", deity: "Pushan", symbol: "Fish", letters: ["De", "Do", "Cha", "Chi"], characteristics: ["Nurturing", "Prosperous", "Safe"], luckyColor: "Brown", luckyNumber: 5 }
];

// Sample baby names database organized by starting letters
const babyNamesDB: Record<string, BabyName[]> = {
  "A": [
    { name: "Aarav", meaning: "Peaceful", gender: "boy", origin: "Sanskrit", numerology: 7 },
    { name: "Aanya", meaning: "Graceful", gender: "girl", origin: "Sanskrit", numerology: 1 },
    { name: "Advait", meaning: "Unique", gender: "boy", origin: "Sanskrit", numerology: 9 },
    { name: "Ananya", meaning: "Matchless", gender: "girl", origin: "Sanskrit", numerology: 5 },
    { name: "Arjun", meaning: "Bright", gender: "boy", origin: "Sanskrit", numerology: 3 },
    { name: "Aisha", meaning: "Living", gender: "girl", origin: "Arabic", numerology: 6 },
  ],
  "B": [
    { name: "Bhavya", meaning: "Grand", gender: "unisex", origin: "Sanskrit", numerology: 8 },
    { name: "Bhuvan", meaning: "World", gender: "boy", origin: "Sanskrit", numerology: 4 },
  ],
  "C": [
    { name: "Chaitanya", meaning: "Consciousness", gender: "boy", origin: "Sanskrit", numerology: 1 },
    { name: "Charvi", meaning: "Beautiful", gender: "girl", origin: "Sanskrit", numerology: 3 },
  ],
  "D": [
    { name: "Darsh", meaning: "Sight", gender: "boy", origin: "Sanskrit", numerology: 5 },
    { name: "Diya", meaning: "Lamp", gender: "girl", origin: "Sanskrit", numerology: 9 },
    { name: "Dev", meaning: "God", gender: "boy", origin: "Sanskrit", numerology: 1 },
    { name: "Divya", meaning: "Divine", gender: "girl", origin: "Sanskrit", numerology: 7 },
  ],
  "G": [
    { name: "Gaurav", meaning: "Pride", gender: "boy", origin: "Sanskrit", numerology: 6 },
    { name: "Gauri", meaning: "Fair", gender: "girl", origin: "Sanskrit", numerology: 3 },
    { name: "Gagan", meaning: "Sky", gender: "boy", origin: "Sanskrit", numerology: 8 },
  ],
  "H": [
    { name: "Harsh", meaning: "Joy", gender: "boy", origin: "Sanskrit", numerology: 4 },
    { name: "Hridaya", meaning: "Heart", gender: "unisex", origin: "Sanskrit", numerology: 2 },
  ],
  "I": [
    { name: "Ishaan", meaning: "Sun", gender: "boy", origin: "Sanskrit", numerology: 1 },
    { name: "Ira", meaning: "Earth", gender: "girl", origin: "Sanskrit", numerology: 9 },
  ],
  "J": [
    { name: "Jai", meaning: "Victory", gender: "boy", origin: "Sanskrit", numerology: 1 },
    { name: "Jiya", meaning: "Heart", gender: "girl", origin: "Sanskrit", numerology: 5 },
  ],
  "K": [
    { name: "Kabir", meaning: "Great", gender: "boy", origin: "Arabic", numerology: 8 },
    { name: "Kavya", meaning: "Poetry", gender: "girl", origin: "Sanskrit", numerology: 6 },
    { name: "Krishna", meaning: "Dark", gender: "boy", origin: "Sanskrit", numerology: 2 },
    { name: "Kiara", meaning: "Grace", gender: "girl", origin: "Italian", numerology: 4 },
  ],
  "L": [
    { name: "Lakshya", meaning: "Aim", gender: "boy", origin: "Sanskrit", numerology: 3 },
    { name: "Lavanya", meaning: "Grace", gender: "girl", origin: "Sanskrit", numerology: 7 },
  ],
  "M": [
    { name: "Manav", meaning: "Human", gender: "boy", origin: "Sanskrit", numerology: 5 },
    { name: "Maya", meaning: "Illusion", gender: "girl", origin: "Sanskrit", numerology: 1 },
    { name: "Moksh", meaning: "Liberation", gender: "boy", origin: "Sanskrit", numerology: 9 },
    { name: "Meera", meaning: "Devotee", gender: "girl", origin: "Sanskrit", numerology: 6 },
  ],
  "N": [
    { name: "Nakul", meaning: "Mongoose", gender: "boy", origin: "Sanskrit", numerology: 4 },
    { name: "Nisha", meaning: "Night", gender: "girl", origin: "Sanskrit", numerology: 8 },
    { name: "Nikhil", meaning: "Complete", gender: "boy", origin: "Sanskrit", numerology: 2 },
    { name: "Navya", meaning: "New", gender: "girl", origin: "Sanskrit", numerology: 3 },
  ],
  "O": [
    { name: "Om", meaning: "Sacred Sound", gender: "boy", origin: "Sanskrit", numerology: 9 },
  ],
  "P": [
    { name: "Pranav", meaning: "Om", gender: "boy", origin: "Sanskrit", numerology: 7 },
    { name: "Priya", meaning: "Beloved", gender: "girl", origin: "Sanskrit", numerology: 5 },
    { name: "Parth", meaning: "Arjuna", gender: "boy", origin: "Sanskrit", numerology: 1 },
    { name: "Pari", meaning: "Fairy", gender: "girl", origin: "Persian", numerology: 3 },
  ],
  "R": [
    { name: "Rahul", meaning: "Efficient", gender: "boy", origin: "Sanskrit", numerology: 6 },
    { name: "Riya", meaning: "Singer", gender: "girl", origin: "Sanskrit", numerology: 4 },
    { name: "Rohan", meaning: "Ascending", gender: "boy", origin: "Sanskrit", numerology: 8 },
    { name: "Ria", meaning: "River", gender: "girl", origin: "Spanish", numerology: 9 },
  ],
  "S": [
    { name: "Samar", meaning: "War", gender: "boy", origin: "Arabic", numerology: 2 },
    { name: "Sara", meaning: "Princess", gender: "girl", origin: "Hebrew", numerology: 7 },
    { name: "Shaurya", meaning: "Bravery", gender: "boy", origin: "Sanskrit", numerology: 5 },
    { name: "Siya", meaning: "Sita", gender: "girl", origin: "Sanskrit", numerology: 1 },
  ],
  "T": [
    { name: "Tanish", meaning: "Ambition", gender: "boy", origin: "Sanskrit", numerology: 3 },
    { name: "Tara", meaning: "Star", gender: "girl", origin: "Sanskrit", numerology: 6 },
  ],
  "U": [
    { name: "Utkarsh", meaning: "Prosperity", gender: "boy", origin: "Sanskrit", numerology: 4 },
  ],
  "V": [
    { name: "Vihaan", meaning: "Dawn", gender: "boy", origin: "Sanskrit", numerology: 8 },
    { name: "Vidya", meaning: "Knowledge", gender: "girl", origin: "Sanskrit", numerology: 2 },
    { name: "Vivaan", meaning: "Full of Life", gender: "boy", origin: "Sanskrit", numerology: 1 },
    { name: "Vanya", meaning: "Gracious", gender: "girl", origin: "Russian", numerology: 9 },
  ],
  "Y": [
    { name: "Yash", meaning: "Fame", gender: "boy", origin: "Sanskrit", numerology: 7 },
    { name: "Yashvi", meaning: "Fame", gender: "girl", origin: "Sanskrit", numerology: 5 },
  ],
};

function getNakshatraFromDate(date: string, time: string): NakshatraInfo {
  const d = new Date(date + "T" + time);
  const dayOfYear = Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const hour = d.getHours() + d.getMinutes() / 60;
  const moonPosition = (dayOfYear * 13.176 + hour * 0.55) % 360;
  const nakshatraIndex = Math.floor(moonPosition / (360 / 27)) % 27;
  return nakshatras[nakshatraIndex];
}

function getNamesByLetters(letters: string[]): BabyName[] {
  const names: BabyName[] = [];
  letters.forEach(letter => {
    const firstLetter = letter.charAt(0).toUpperCase();
    if (babyNamesDB[firstLetter]) {
      babyNamesDB[firstLetter].forEach(name => {
        if (name.name.toLowerCase().startsWith(letter.toLowerCase())) {
          names.push(name);
        }
      });
    }
  });
  // Also add names starting with the first letter of each syllable
  letters.forEach(letter => {
    const firstLetter = letter.charAt(0).toUpperCase();
    if (babyNamesDB[firstLetter]) {
      babyNamesDB[firstLetter].forEach(name => {
        if (!names.find(n => n.name === name.name)) {
          names.push(name);
        }
      });
    }
  });
  return names;
}

export default function BabyNamesPage() {
  const { t } = useLanguage();
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [nakshatra, setNakshatra] = useState<NakshatraInfo | null>(null);
  const [suggestedNames, setSuggestedNames] = useState<BabyName[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [genderFilter, setGenderFilter] = useState<"all" | "boy" | "girl">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCalculating(true);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const nakshatraInfo = getNakshatraFromDate(birthDate, birthTime);
    setNakshatra(nakshatraInfo);
    
    const names = getNamesByLetters(nakshatraInfo.letters);
    setSuggestedNames(names);
    
    setIsCalculating(false);
  };

  const filteredNames = suggestedNames.filter(name => {
    const matchesGender = genderFilter === "all" || name.gender === genderFilter || name.gender === "unisex";
    const matchesSearch = name.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         name.meaning.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGender && matchesSearch;
  });

  return (
    <main className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50">
      {/* Hero Section */}
      <section className="relative py-16 bg-gradient-to-r from-pink-500 via-purple-500 to-pink-600">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url('${CDN_IMAGES.starsPattern}')` }}></div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <Badge className="mb-4 bg-white/20 text-white border-white/30">
              <Baby className="w-3 h-3 mr-1" />
              {t("babyNames.badge", "Baby Names")}
            </Badge>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              {t("babyNames.title", "Nakshatra-Based Baby Names")}
            </h1>
            <p className="text-lg text-pink-100 max-w-2xl mx-auto">
              {t("babyNames.subtitle", "Find the perfect name for your baby based on their birth Nakshatra. Traditional Vedic naming with meaningful suggestions.")}
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Input Form */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-pink-600" />
                  {t("babyNames.enterDetails", "Enter Birth Details")}
                </CardTitle>
                <CardDescription>
                  {t("babyNames.enterDetailsDesc", "Find names based on baby's Nakshatra")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCalculate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">{t("common.birthDate", "Birth Date")}</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="date"
                        type="date"
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="time">{t("common.birthTime", "Birth Time")}</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="time"
                        type="time"
                        value={birthTime}
                        onChange={(e) => setBirthTime(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-pink-600 hover:bg-pink-700"
                    disabled={isCalculating}
                  >
                    {isCalculating ? (
                      <>
                        <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                        {t("babyNames.finding", "Finding Names...")}
                      </>
                    ) : (
                      <>
                        <Baby className="w-4 h-4 mr-2" />
                        {t("babyNames.findNames", "Find Baby Names")}
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-2">
            {!nakshatra ? (
              <Card className="h-full flex items-center justify-center min-h-[400px]">
                <CardContent className="text-center py-12">
                  <Baby className="w-16 h-16 text-pink-200 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    {t("babyNames.noResult", "Enter birth details")}
                  </h3>
                  <p className="text-gray-500 max-w-md">
                    {t("babyNames.noResultDesc", "Enter the baby's birth date and time to find their Nakshatra and get personalized name suggestions based on Vedic traditions.")}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* Nakshatra Info Card */}
                <Card className="bg-gradient-to-br from-pink-500 to-purple-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-2xl font-bold">{nakshatra.name}</h2>
                        <p className="text-pink-100">{nakshatra.deity}</p>
                      </div>
                      <div className="text-4xl">{nakshatra.symbol}</div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-pink-200">{t("babyNames.startingLetters", "Starting Letters")}</p>
                        <p className="font-bold text-lg">{nakshatra.letters.join(", ")}</p>
                      </div>
                      <div>
                        <p className="text-pink-200">{t("babyNames.luckyColor", "Lucky Color")}</p>
                        <p className="font-bold">{nakshatra.luckyColor}</p>
                      </div>
                      <div>
                        <p className="text-pink-200">{t("babyNames.luckyNumber", "Lucky Number")}</p>
                        <p className="font-bold text-lg">{nakshatra.luckyNumber}</p>
                      </div>
                      <div>
                        <p className="text-pink-200">{t("babyNames.traits", "Traits")}</p>
                        <p className="font-bold">{nakshatra.characteristics.join(", ")}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Filters */}
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder={t("babyNames.searchPlaceholder", "Search names...")}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={genderFilter === "all" ? "default" : "outline"}
                      onClick={() => setGenderFilter("all")}
                      size="sm"
                    >
                      {t("babyNames.all", "All")}
                    </Button>
                    <Button
                      variant={genderFilter === "boy" ? "default" : "outline"}
                      onClick={() => setGenderFilter("boy")}
                      size="sm"
                      className={genderFilter === "boy" ? "bg-blue-600" : ""}
                    >
                      {t("babyNames.boy", "Boy")}
                    </Button>
                    <Button
                      variant={genderFilter === "girl" ? "default" : "outline"}
                      onClick={() => setGenderFilter("girl")}
                      size="sm"
                      className={genderFilter === "girl" ? "bg-pink-600" : ""}
                    >
                      {t("babyNames.girl", "Girl")}
                    </Button>
                  </div>
                </div>

                {/* Names Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredNames.map((name, idx) => (
                    <Card key={idx} className={`hover:shadow-lg transition-shadow ${
                      name.gender === "boy" ? "border-l-4 border-l-blue-500" :
                      name.gender === "girl" ? "border-l-4 border-l-pink-500" :
                      "border-l-4 border-l-purple-500"
                    }`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-bold">{name.name}</h3>
                          <Badge variant="secondary" className={
                            name.gender === "boy" ? "bg-blue-100 text-blue-700" :
                            name.gender === "girl" ? "bg-pink-100 text-pink-700" :
                            "bg-purple-100 text-purple-700"
                          }>
                            {name.gender}
                          </Badge>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{name.meaning}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{name.origin}</span>
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            {t("babyNames.numerology", "Numerology")}: {name.numerology}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {filteredNames.length === 0 && (
                  <Card className="p-8 text-center">
                    <p className="text-gray-500">{t("babyNames.noNamesFound", "No names found matching your criteria")}</p>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>

        {/* All Nakshatras Reference */}
        <section className="mt-16">
          <Card>
            <CardHeader>
              <CardTitle>{t("babyNames.nakshatraReference", "Nakshatra Reference Guide")}</CardTitle>
              <CardDescription>
                {t("babyNames.nakshatraReferenceDesc", "All 27 Nakshatras and their starting letters for baby names")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
                {nakshatras.map((nak, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-sm">{nak.name}</h4>
                    <p className="text-xs text-gray-500">{nak.letters.join(", ")}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* About Section */}
        <section className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>{t("babyNames.aboutTitle", "About Nakshatra-Based Naming")}</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p className="text-gray-600">
                {t("babyNames.aboutText1", "In Vedic tradition, a baby's name is chosen based on their birth Nakshatra (lunar mansion). Each of the 27 Nakshatras has specific syllables or letters associated with it, and names starting with these sounds are believed to bring good fortune and align with the child's cosmic energy.")}
              </p>
              <p className="text-gray-600 mt-4">
                {t("babyNames.aboutText2", "The Nakshatra is determined by the Moon's position at the time of birth. This ancient practice, known as 'Namakarana', is one of the 16 Samskaras (sacred rituals) in Hindu tradition and is typically performed on the 11th or 12th day after birth.")}
              </p>
              <p className="text-gray-600 mt-4">
                {t("babyNames.aboutText3", "While following Nakshatra-based naming is traditional, the most important thing is to choose a name that resonates with your family and carries a beautiful meaning. Use this tool as a guide to find meaningful names that honor both tradition and your personal preferences.")}
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
