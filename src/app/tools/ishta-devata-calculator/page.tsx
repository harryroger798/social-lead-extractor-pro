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
  Flame,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  ArrowRight,
  Heart,
  Star,
  Sun,
} from "lucide-react";

const deityData: Record<string, {
  name: string;
  hindi: string;
  description: string;
  attributes: string[];
  mantra: string;
  worship: string;
  bestDay: string;
  offerings: string[];
  benefits: string[];
}> = {
  "Lord Shiva": {
    name: "Lord Shiva",
    hindi: "भगवान शिव",
    description: "Lord Shiva is the destroyer and transformer in the Hindu trinity. He represents the supreme consciousness and is worshipped for liberation, wisdom, and destruction of negativity.",
    attributes: ["Destroyer of Evil", "Lord of Meditation", "Cosmic Dancer", "Benevolent One"],
    mantra: "Om Namah Shivaya",
    worship: "Worship Lord Shiva with Bilva leaves, milk, water, and flowers. Monday is the most auspicious day for Shiva worship.",
    bestDay: "Monday",
    offerings: ["Bilva Leaves", "Milk", "Water", "White Flowers", "Dhatura"],
    benefits: ["Spiritual Liberation", "Removal of Obstacles", "Inner Peace", "Protection"],
  },
  "Lord Vishnu": {
    name: "Lord Vishnu",
    hindi: "भगवान विष्णु",
    description: "Lord Vishnu is the preserver and protector of the universe. He maintains cosmic order and is worshipped for prosperity, protection, and sustenance.",
    attributes: ["Preserver of Universe", "Protector", "Sustainer", "All-Pervading"],
    mantra: "Om Namo Narayanaya",
    worship: "Worship Lord Vishnu with Tulsi leaves, yellow flowers, and sandalwood. Thursday is especially auspicious.",
    bestDay: "Thursday",
    offerings: ["Tulsi Leaves", "Yellow Flowers", "Sandalwood", "Butter", "Sweets"],
    benefits: ["Prosperity", "Protection", "Good Fortune", "Family Harmony"],
  },
  "Goddess Lakshmi": {
    name: "Goddess Lakshmi",
    hindi: "देवी लक्ष्मी",
    description: "Goddess Lakshmi is the deity of wealth, fortune, and prosperity. She bestows material and spiritual abundance upon her devotees.",
    attributes: ["Goddess of Wealth", "Bestower of Fortune", "Divine Mother", "Lotus-Born"],
    mantra: "Om Shreem Mahalakshmiyei Namaha",
    worship: "Worship Goddess Lakshmi with lotus flowers, rice, and gold/silver items. Friday is the most auspicious day.",
    bestDay: "Friday",
    offerings: ["Lotus Flowers", "Rice", "Coins", "Red Flowers", "Sweets"],
    benefits: ["Wealth", "Prosperity", "Good Fortune", "Material Abundance"],
  },
  "Goddess Durga": {
    name: "Goddess Durga",
    hindi: "देवी दुर्गा",
    description: "Goddess Durga is the fierce form of the Divine Mother. She destroys evil forces and protects her devotees from all dangers.",
    attributes: ["Destroyer of Evil", "Divine Mother", "Invincible", "Protector"],
    mantra: "Om Dum Durgayei Namaha",
    worship: "Worship Goddess Durga with red flowers, kumkum, and coconut. Tuesday and Friday are auspicious.",
    bestDay: "Tuesday",
    offerings: ["Red Flowers", "Kumkum", "Coconut", "Lemons", "Sweets"],
    benefits: ["Protection", "Courage", "Victory", "Removal of Fear"],
  },
  "Lord Ganesha": {
    name: "Lord Ganesha",
    hindi: "भगवान गणेश",
    description: "Lord Ganesha is the remover of obstacles and the god of beginnings. He is worshipped before starting any new venture or important task.",
    attributes: ["Remover of Obstacles", "God of Beginnings", "Lord of Wisdom", "Elephant-Headed"],
    mantra: "Om Gam Ganapataye Namaha",
    worship: "Worship Lord Ganesha with modak, durva grass, and red flowers. Wednesday is especially auspicious.",
    bestDay: "Wednesday",
    offerings: ["Modak", "Durva Grass", "Red Flowers", "Coconut", "Laddu"],
    benefits: ["Success", "Wisdom", "New Beginnings", "Obstacle Removal"],
  },
  "Lord Hanuman": {
    name: "Lord Hanuman",
    hindi: "भगवान हनुमान",
    description: "Lord Hanuman is the epitome of devotion, strength, and selfless service. He is worshipped for courage, protection, and overcoming difficulties.",
    attributes: ["Devotee of Rama", "Mighty Warrior", "Protector", "Immortal"],
    mantra: "Om Hanumate Namaha",
    worship: "Worship Lord Hanuman with sindoor, jasmine oil, and red flowers. Tuesday and Saturday are most auspicious.",
    bestDay: "Tuesday",
    offerings: ["Sindoor", "Jasmine Oil", "Red Flowers", "Bananas", "Besan Laddu"],
    benefits: ["Courage", "Strength", "Protection", "Overcoming Fear"],
  },
  "Lord Krishna": {
    name: "Lord Krishna",
    hindi: "भगवान कृष्ण",
    description: "Lord Krishna is the divine lover and the speaker of Bhagavad Gita. He represents divine love, wisdom, and the path of devotion.",
    attributes: ["Divine Lover", "Supreme Teacher", "Protector", "Flute Player"],
    mantra: "Hare Krishna Hare Krishna Krishna Krishna Hare Hare",
    worship: "Worship Lord Krishna with butter, tulsi, and peacock feathers. Wednesday and Friday are auspicious.",
    bestDay: "Wednesday",
    offerings: ["Butter", "Tulsi", "Peacock Feathers", "Flute", "Sweets"],
    benefits: ["Divine Love", "Wisdom", "Joy", "Liberation"],
  },
  "Lord Surya": {
    name: "Lord Surya",
    hindi: "भगवान सूर्य",
    description: "Lord Surya is the Sun God, the source of all life and energy. He bestows health, vitality, and success upon his devotees.",
    attributes: ["Source of Life", "Giver of Health", "Illuminator", "Cosmic Eye"],
    mantra: "Om Suryaya Namaha",
    worship: "Worship Lord Surya at sunrise with water offering (Arghya) and red flowers. Sunday is most auspicious.",
    bestDay: "Sunday",
    offerings: ["Water (Arghya)", "Red Flowers", "Wheat", "Jaggery", "Copper"],
    benefits: ["Health", "Vitality", "Success", "Authority"],
  },
  "Goddess Saraswati": {
    name: "Goddess Saraswati",
    hindi: "देवी सरस्वती",
    description: "Goddess Saraswati is the deity of knowledge, music, and arts. She bestows wisdom, learning, and creative abilities upon her devotees.",
    attributes: ["Goddess of Knowledge", "Divine Artist", "Bestower of Wisdom", "Pure One"],
    mantra: "Om Aim Saraswatyai Namaha",
    worship: "Worship Goddess Saraswati with white flowers, books, and musical instruments. Thursday is most auspicious.",
    bestDay: "Thursday",
    offerings: ["White Flowers", "Books", "Pen/Ink", "Honey", "White Sweets"],
    benefits: ["Knowledge", "Wisdom", "Artistic Skills", "Academic Success"],
  },
};

export default function IshtaDevataCalculatorPage() {
  const { t } = useLanguage();
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [ishtaDevata, setIshtaDevata] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleCalculate = async () => {
    if (!birthDate) return;
    
    setIsCalculating(true);
    
    // Simulate API call - in production, this would analyze the 9th house lord and Atmakaraka
    setTimeout(() => {
      const month = new Date(birthDate).getMonth();
      const day = new Date(birthDate).getDate();
      
      // Simple logic for demonstration - in production, use actual planetary positions
      const deities = Object.keys(deityData);
      const index = (month + day) % deities.length;
      
      setIshtaDevata(deities[index]);
      setIsCalculating(false);
    }, 1000);
  };

  const deity = ishtaDevata ? deityData[ishtaDevata] : null;

  return (
    <div className="py-12 lg:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-orange-100 text-orange-800">{t('calculator.freeTool', 'Free Tool')}</Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {t('calculator.ishtaDevata.title', 'Ishta Devata Calculator')}
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {t('calculator.ishtaDevata.subtitle', 'Discover your Ishta Devata (personal deity) based on your birth chart. Your Ishta Devata is the form of the Divine that is most suited for your spiritual evolution.')}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-600" />
                {t('calculator.enterBirthDetails', 'Enter Birth Details')}
              </CardTitle>
              <CardDescription>
                {t('calculator.ishtaDevata.inputDesc', 'Enter your birth details to discover your personal deity')}
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
                <p className="text-xs text-gray-500">
                  {t('calculator.ishtaDevata.timeNote', 'Accurate birth time helps determine the 9th house lord precisely')}
                </p>
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
                className="w-full bg-orange-600 hover:bg-orange-700"
                disabled={!birthDate || isCalculating}
              >
                {isCalculating ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                    {t('calculator.analyzing', 'Analyzing...')}
                  </>
                ) : (
                  <>
                    <Flame className="w-4 h-4 mr-2" />
                    {t('calculator.ishtaDevata.findDeity', 'Find My Ishta Devata')}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {deity ? (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Sun className="w-5 h-5 text-orange-600" />
                    {t('calculator.ishtaDevata.yourDeity', 'Your Ishta Devata')}
                  </CardTitle>
                  <Badge className="bg-orange-500">{deity.bestDay}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <h2 className="text-3xl font-bold text-orange-700">{deity.name}</h2>
                  <p className="text-xl text-gray-600">{deity.hindi}</p>
                </div>

                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-gray-700">{deity.description}</p>
                  </div>

                  <div className="bg-white rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Star className="w-4 h-4 text-orange-500" />
                      {t('calculator.attributes', 'Divine Attributes')}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {deity.attributes.map((attr) => (
                        <Badge key={attr} variant="secondary" className="bg-orange-100 text-orange-700">
                          {attr}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{t('calculator.mantra', 'Sacred Mantra')}</h3>
                    <p className="text-orange-700 text-lg italic">{deity.mantra}</p>
                  </div>

                  <div className="bg-white rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{t('calculator.ishtaDevata.howToWorship', 'How to Worship')}</h3>
                    <p className="text-gray-700 text-sm">{deity.worship}</p>
                  </div>

                  <div className="bg-white rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Heart className="w-4 h-4 text-red-500" />
                      {t('calculator.ishtaDevata.offerings', 'Recommended Offerings')}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {deity.offerings.map((offering) => (
                        <Badge key={offering} className="bg-green-100 text-green-700">
                          {offering}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{t('calculator.benefits', 'Benefits of Worship')}</h3>
                    <div className="flex flex-wrap gap-2">
                      {deity.benefits.map((benefit) => (
                        <Badge key={benefit} variant="secondary" className="bg-blue-100 text-blue-700">
                          {benefit}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-orange-200 bg-orange-50/50">
              <CardContent className="flex flex-col items-center justify-center h-full py-12">
                <div className="w-24 h-24 rounded-full bg-orange-100 flex items-center justify-center mb-4">
                  <Flame className="w-12 h-12 text-orange-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t('calculator.ishtaDevata.resultPlaceholder', 'Your Ishta Devata Will Appear Here')}
                </h3>
                <p className="text-gray-600 text-center max-w-xs">
                  {t('calculator.ishtaDevata.resultPlaceholderDesc', 'Enter your birth details to discover your personal deity and learn how to connect with the Divine through worship.')}
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
              <h3 className="font-semibold text-lg mb-2">{t('calculator.rudraksha.title', 'Rudraksha Recommendations')}</h3>
              <p className="text-gray-600 text-sm mb-4">
                {t('calculator.rudraksha.shortDesc', 'Find the right Rudraksha beads for you.')}
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/tools/rudraksha-recommendations">
                  {t('calculator.discover', 'Discover')} <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-amber-200 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-2">{t('calculator.kundliCalc.title', 'Kundli Calculator')}</h3>
              <p className="text-gray-600 text-sm mb-4">
                {t('calculator.kundliCalc.shortDesc', 'Generate your complete Vedic birth chart.')}
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/tools/kundli-calculator">
                  {t('calculator.generate', 'Generate')} <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16 prose prose-lg max-w-none">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {t('calculator.ishtaDevata.aboutTitle', 'Understanding Ishta Devata')}
          </h2>
          <p className="text-gray-700 mb-4">
            {t('calculator.ishtaDevata.aboutDesc1', 'Ishta Devata is a Sanskrit term meaning "chosen deity" or "personal god." In Vedic astrology, your Ishta Devata is determined by analyzing the 12th house from the Karakamsha (the sign where Atmakaraka is placed in Navamsa chart).')}
          </p>
          <p className="text-gray-700 mb-4">
            {t('calculator.ishtaDevata.aboutDesc2', 'Your Ishta Devata represents the form of the Divine that is most suited for your spiritual evolution. Worshipping your Ishta Devata helps in achieving moksha (liberation) and accelerates your spiritual growth.')}
          </p>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            {t('calculator.ishtaDevata.whyImportant', 'Why is Ishta Devata Important?')}
          </h3>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>{t('calculator.ishtaDevata.reason1', 'Provides a personal connection with the Divine')}</li>
            <li>{t('calculator.ishtaDevata.reason2', 'Accelerates spiritual growth and evolution')}</li>
            <li>{t('calculator.ishtaDevata.reason3', 'Helps overcome karmic obstacles')}</li>
            <li>{t('calculator.ishtaDevata.reason4', 'Brings peace, prosperity, and protection')}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
