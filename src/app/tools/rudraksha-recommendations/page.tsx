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
  Circle,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  ArrowRight,
  Heart,
  Shield,
} from "lucide-react";

const rudrakshaData: Record<number, {
  name: string;
  hindi: string;
  mukhi: number;
  deity: string;
  planet: string;
  benefits: string[];
  description: string;
  mantra: string;
  wearingDay: string;
  bestFor: string[];
}> = {
  1: {
    name: "Ek Mukhi Rudraksha",
    hindi: "एक मुखी रुद्राक्ष",
    mukhi: 1,
    deity: "Lord Shiva",
    planet: "Sun (Surya)",
    benefits: ["Supreme Consciousness", "Enlightenment", "Leadership", "Self-Realization"],
    description: "The rarest and most powerful Rudraksha, Ek Mukhi represents Lord Shiva himself. It bestows supreme consciousness, spiritual enlightenment, and liberation from the cycle of birth and death.",
    mantra: "Om Hreem Namah",
    wearingDay: "Monday",
    bestFor: ["Spiritual Seekers", "Leaders", "Those seeking Moksha", "Weak Sun in horoscope"],
  },
  2: {
    name: "Do Mukhi Rudraksha",
    hindi: "दो मुखी रुद्राक्ष",
    mukhi: 2,
    deity: "Ardhanarishvara (Shiva-Shakti)",
    planet: "Moon (Chandra)",
    benefits: ["Unity & Harmony", "Emotional Balance", "Relationships", "Mental Peace"],
    description: "Do Mukhi Rudraksha represents the unity of Shiva and Shakti. It brings harmony in relationships, emotional stability, and helps overcome mental stress and depression.",
    mantra: "Om Namah",
    wearingDay: "Monday",
    bestFor: ["Relationship Issues", "Emotional Imbalance", "Weak Moon", "Mental Stress"],
  },
  3: {
    name: "Teen Mukhi Rudraksha",
    hindi: "तीन मुखी रुद्राक्ष",
    mukhi: 3,
    deity: "Agni (Fire God)",
    planet: "Mars (Mangal)",
    benefits: ["Confidence", "Energy", "Purification", "Success"],
    description: "Teen Mukhi Rudraksha is blessed by Agni Dev. It purifies the wearer from past sins, boosts confidence and energy, and helps overcome inferiority complex.",
    mantra: "Om Kleem Namah",
    wearingDay: "Tuesday",
    bestFor: ["Low Self-Esteem", "Lack of Energy", "Mangal Dosh", "Past Karma"],
  },
  4: {
    name: "Char Mukhi Rudraksha",
    hindi: "चार मुखी रुद्राक्ष",
    mukhi: 4,
    deity: "Lord Brahma",
    planet: "Mercury (Budh)",
    benefits: ["Knowledge", "Creativity", "Communication", "Intelligence"],
    description: "Char Mukhi Rudraksha is blessed by Lord Brahma, the creator. It enhances knowledge, creativity, memory, and communication skills. Ideal for students and intellectuals.",
    mantra: "Om Hreem Namah",
    wearingDay: "Wednesday",
    bestFor: ["Students", "Writers", "Weak Mercury", "Memory Issues"],
  },
  5: {
    name: "Panch Mukhi Rudraksha",
    hindi: "पांच मुखी रुद्राक्ष",
    mukhi: 5,
    deity: "Kalagni Rudra",
    planet: "Jupiter (Guru)",
    benefits: ["Health", "Peace", "Wisdom", "Protection"],
    description: "The most common and versatile Rudraksha, Panch Mukhi represents Kalagni Rudra. It brings overall well-being, peace of mind, and protection from negative energies.",
    mantra: "Om Hreem Namah",
    wearingDay: "Thursday",
    bestFor: ["General Well-being", "Blood Pressure", "Weak Jupiter", "Everyone"],
  },
  6: {
    name: "Chhah Mukhi Rudraksha",
    hindi: "छह मुखी रुद्राक्ष",
    mukhi: 6,
    deity: "Lord Kartikeya",
    planet: "Venus (Shukra)",
    benefits: ["Willpower", "Focus", "Grounding", "Stability"],
    description: "Chhah Mukhi Rudraksha is blessed by Lord Kartikeya. It enhances willpower, focus, and emotional stability. It helps overcome laziness and procrastination.",
    mantra: "Om Hreem Hoom Namah",
    wearingDay: "Friday",
    bestFor: ["Lack of Focus", "Weak Venus", "Emotional Instability", "Artists"],
  },
  7: {
    name: "Saat Mukhi Rudraksha",
    hindi: "सात मुखी रुद्राक्ष",
    mukhi: 7,
    deity: "Goddess Lakshmi",
    planet: "Saturn (Shani)",
    benefits: ["Wealth", "Good Fortune", "Health", "Success"],
    description: "Saat Mukhi Rudraksha is blessed by Goddess Lakshmi and the seven serpent deities. It brings wealth, prosperity, good health, and success in all endeavors.",
    mantra: "Om Hoom Namah",
    wearingDay: "Saturday",
    bestFor: ["Financial Problems", "Weak Saturn", "Business Growth", "Health Issues"],
  },
  8: {
    name: "Aath Mukhi Rudraksha",
    hindi: "आठ मुखी रुद्राक्ष",
    mukhi: 8,
    deity: "Lord Ganesha",
    planet: "Rahu",
    benefits: ["Obstacle Removal", "Success", "Wisdom", "New Beginnings"],
    description: "Aath Mukhi Rudraksha is blessed by Lord Ganesha. It removes obstacles, brings success in new ventures, and bestows wisdom and intelligence.",
    mantra: "Om Ganeshaya Namah",
    wearingDay: "Wednesday",
    bestFor: ["Obstacles in Life", "Rahu Dosh", "New Ventures", "Students"],
  },
  9: {
    name: "Nau Mukhi Rudraksha",
    hindi: "नौ मुखी रुद्राक्ष",
    mukhi: 9,
    deity: "Goddess Durga",
    planet: "Ketu",
    benefits: ["Courage", "Protection", "Energy", "Fearlessness"],
    description: "Nau Mukhi Rudraksha is blessed by Goddess Durga. It bestows courage, energy, and protection from negative forces. It helps overcome fear and anxiety.",
    mantra: "Om Hreem Hoom Namah",
    wearingDay: "Tuesday",
    bestFor: ["Fear & Anxiety", "Ketu Dosh", "Lack of Courage", "Protection"],
  },
  10: {
    name: "Das Mukhi Rudraksha",
    hindi: "दस मुखी रुद्राक्ष",
    mukhi: 10,
    deity: "Lord Vishnu",
    planet: "All Planets",
    benefits: ["Protection", "Peace", "Removes Negativity", "Divine Blessings"],
    description: "Das Mukhi Rudraksha is blessed by Lord Vishnu. It provides protection from all negative energies, evil spirits, and brings peace and divine blessings.",
    mantra: "Om Hreem Namah Namah",
    wearingDay: "Any Day",
    bestFor: ["Protection", "Negative Energies", "Peace of Mind", "All Doshas"],
  },
  11: {
    name: "Gyarah Mukhi Rudraksha",
    hindi: "ग्यारह मुखी रुद्राक्ष",
    mukhi: 11,
    deity: "Eleven Rudras",
    planet: "All Planets",
    benefits: ["Wisdom", "Right Judgment", "Adventure", "Protection"],
    description: "Gyarah Mukhi Rudraksha is blessed by the eleven Rudras. It bestows wisdom, courage, and protection. It helps in making right decisions and judgments.",
    mantra: "Om Hreem Hoom Namah",
    wearingDay: "Monday",
    bestFor: ["Decision Making", "Yogis", "Meditation", "Protection"],
  },
  12: {
    name: "Barah Mukhi Rudraksha",
    hindi: "बारह मुखी रुद्राक्ष",
    mukhi: 12,
    deity: "Lord Surya (Sun God)",
    planet: "Sun (Surya)",
    benefits: ["Leadership", "Radiance", "Authority", "Self-Confidence"],
    description: "Barah Mukhi Rudraksha is blessed by Lord Surya. It bestows leadership qualities, radiance, authority, and self-confidence. Ideal for administrators and leaders.",
    mantra: "Om Kraum Sraum Raum Namah",
    wearingDay: "Sunday",
    bestFor: ["Leaders", "Administrators", "Weak Sun", "Lack of Confidence"],
  },
};

export default function RudrakshaRecommendationsPage() {
  const { t } = useLanguage();
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [recommendations, setRecommendations] = useState<number[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleCalculate = async () => {
    if (!birthDate) return;
    
    setIsCalculating(true);
    
    // Simulate API call - in production, this would analyze the birth chart
    setTimeout(() => {
      const month = new Date(birthDate).getMonth();
      const day = new Date(birthDate).getDate();
      
      const recommended: number[] = [5]; // Everyone benefits from 5 Mukhi
      
      // Simple logic for demonstration - in production, use actual planetary positions
      if (month >= 0 && month <= 2) recommended.push(7); // Saturn period
      if (month >= 3 && month <= 5) recommended.push(3); // Mars period
      if (month >= 6 && month <= 8) recommended.push(4); // Mercury period
      if (month >= 9 && month <= 11) recommended.push(6); // Venus period
      
      if (day <= 10) recommended.push(1);
      else if (day <= 20) recommended.push(8);
      else recommended.push(9);
      
      setRecommendations([...new Set(recommended)].sort((a, b) => a - b));
      setIsCalculating(false);
    }, 1000);
  };

  return (
    <div className="py-12 lg:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-red-100 text-red-800">{t('calculator.freeTool', 'Free Tool')}</Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {t('calculator.rudraksha.title', 'Rudraksha Recommendations')}
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {t('calculator.rudraksha.subtitle', 'Discover which Rudraksha beads are most beneficial for you based on your birth chart. Rudraksha beads are sacred seeds with powerful spiritual and healing properties.')}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Circle className="w-5 h-5 text-red-600" />
                {t('calculator.enterBirthDetails', 'Enter Birth Details')}
              </CardTitle>
              <CardDescription>
                {t('calculator.rudraksha.inputDesc', 'Enter your birth details to get personalized Rudraksha recommendations')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="date" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {t('calculator.dateOfBirth', 'Date of Birth')}
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
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
                  value={birthTime}
                  onChange={(e) => setBirthTime(e.target.value)}
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
                  value={birthPlace}
                  onChange={(e) => setBirthPlace(e.target.value)}
                  onLocationSelect={(loc) => setBirthPlace(loc)}
                />
              </div>
              
              <Button 
                onClick={handleCalculate}
                className="w-full bg-red-600 hover:bg-red-700"
                disabled={!birthDate || isCalculating}
              >
                {isCalculating ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                    {t('calculator.analyzing', 'Analyzing...')}
                  </>
                ) : (
                  <>
                    <Circle className="w-4 h-4 mr-2" />
                    {t('calculator.rudraksha.getRecommendations', 'Get Rudraksha Recommendations')}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {recommendations.length > 0 ? (
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2 sticky top-0 bg-white py-2">
                <Shield className="w-5 h-5 text-red-600" />
                {t('calculator.rudraksha.recommendedRudraksha', 'Recommended Rudraksha for You')}
              </h3>
              {recommendations.map((mukhi) => {
                const rudraksha = rudrakshaData[mukhi];
                if (!rudraksha) return null;
                return (
                  <Card key={mukhi} className="border-red-200 bg-red-50">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <span className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center text-sm font-bold">
                            {mukhi}
                          </span>
                          {rudraksha.name}
                        </CardTitle>
                        <Badge className="bg-red-500">{rudraksha.planet}</Badge>
                      </div>
                      <p className="text-gray-600">{rudraksha.hindi} • {rudraksha.deity}</p>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 text-sm mb-3">{rudraksha.description}</p>
                      
                      <div className="space-y-2">
                        <div className="bg-white rounded-lg p-2">
                          <h4 className="font-semibold text-gray-900 text-sm mb-1 flex items-center gap-1">
                            <Heart className="w-3 h-3 text-red-500" />
                            {t('calculator.benefits', 'Benefits')}
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {rudraksha.benefits.map((benefit) => (
                              <Badge key={benefit} variant="secondary" className="bg-green-100 text-green-700 text-xs">
                                {benefit}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-white rounded-lg p-2">
                            <h4 className="font-semibold text-gray-900 text-xs mb-1">{t('calculator.mantra', 'Mantra')}</h4>
                            <p className="text-red-700 text-xs italic">{rudraksha.mantra}</p>
                          </div>
                          <div className="bg-white rounded-lg p-2">
                            <h4 className="font-semibold text-gray-900 text-xs mb-1">{t('calculator.rudraksha.wearingDay', 'Best Day to Wear')}</h4>
                            <p className="text-red-700 text-xs">{rudraksha.wearingDay}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="border-red-200 bg-red-50/50">
              <CardContent className="flex flex-col items-center justify-center h-full py-12">
                <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center mb-4">
                  <Circle className="w-12 h-12 text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t('calculator.rudraksha.resultPlaceholder', 'Your Rudraksha Recommendations Will Appear Here')}
                </h3>
                <p className="text-gray-600 text-center max-w-xs">
                  {t('calculator.rudraksha.resultPlaceholderDesc', 'Enter your birth details to discover which sacred Rudraksha beads are most beneficial for your spiritual and physical well-being.')}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <Card className="border-amber-200 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-2">{t('calculator.yantra.title', 'Yantra Recommendations')}</h3>
              <p className="text-gray-600 text-sm mb-4">
                {t('calculator.yantra.shortDesc', 'Find the right sacred Yantras for you.')}
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/tools/yantra-recommendations">
                  {t('calculator.discover', 'Discover')} <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-amber-200 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-2">{t('calculator.ishtaDevata.title', 'Ishta Devata Calculator')}</h3>
              <p className="text-gray-600 text-sm mb-4">
                {t('calculator.ishtaDevata.shortDesc', 'Find your personal deity based on your chart.')}
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/tools/ishta-devata-calculator">
                  {t('calculator.find', 'Find')} <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-amber-200 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-2">{t('calculator.gemstones.title', 'Gemstone Recommendations')}</h3>
              <p className="text-gray-600 text-sm mb-4">
                {t('calculator.gemstones.shortDesc', 'Find your lucky gemstones.')}
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/gemstones">
                  {t('calculator.explore', 'Explore')} <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16 prose prose-lg max-w-none">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {t('calculator.rudraksha.aboutTitle', 'About Rudraksha Beads')}
          </h2>
          <p className="text-gray-700 mb-4">
            {t('calculator.rudraksha.aboutDesc1', 'Rudraksha beads are sacred seeds from the Elaeocarpus ganitrus tree, found primarily in the Himalayan regions of Nepal and Indonesia. The word "Rudraksha" comes from "Rudra" (Lord Shiva) and "Aksha" (eyes), meaning "tears of Lord Shiva."')}
          </p>
          <p className="text-gray-700 mb-4">
            {t('calculator.rudraksha.aboutDesc2', 'Each Rudraksha bead has a certain number of "mukhis" or faces, ranging from 1 to 21. Each type has unique properties and is associated with different deities and planets. Wearing the right Rudraksha can bring spiritual, mental, and physical benefits.')}
          </p>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            {t('calculator.rudraksha.howToWear', 'How to Wear Rudraksha')}
          </h3>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>{t('calculator.rudraksha.step1', 'Energize the Rudraksha by chanting the associated mantra 108 times')}</li>
            <li>{t('calculator.rudraksha.step2', 'Wear it on the recommended day after taking a bath')}</li>
            <li>{t('calculator.rudraksha.step3', 'String it in silk or gold/silver thread')}</li>
            <li>{t('calculator.rudraksha.step4', 'Remove before sleeping or going to impure places')}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
