"use client";

import { useState } from "react";
import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sun,
  Moon,
  Star,
  Heart,
  Briefcase,
  DollarSign,
  Activity,
  Calendar,
  ChevronRight,
} from "lucide-react";

const zodiacSigns = [
  { name: "Aries", hindi: "मेष", symbol: "♈", dates: "Mar 21 - Apr 19", element: "Fire" },
  { name: "Taurus", hindi: "वृषभ", symbol: "♉", dates: "Apr 20 - May 20", element: "Earth" },
  { name: "Gemini", hindi: "मिथुन", symbol: "♊", dates: "May 21 - Jun 20", element: "Air" },
  { name: "Cancer", hindi: "कर्क", symbol: "♋", dates: "Jun 21 - Jul 22", element: "Water" },
  { name: "Leo", hindi: "सिंह", symbol: "♌", dates: "Jul 23 - Aug 22", element: "Fire" },
  { name: "Virgo", hindi: "कन्या", symbol: "♍", dates: "Aug 23 - Sep 22", element: "Earth" },
  { name: "Libra", hindi: "तुला", symbol: "♎", dates: "Sep 23 - Oct 22", element: "Air" },
  { name: "Scorpio", hindi: "वृश्चिक", symbol: "♏", dates: "Oct 23 - Nov 21", element: "Water" },
  { name: "Sagittarius", hindi: "धनु", symbol: "♐", dates: "Nov 22 - Dec 21", element: "Fire" },
  { name: "Capricorn", hindi: "मकर", symbol: "♑", dates: "Dec 22 - Jan 19", element: "Earth" },
  { name: "Aquarius", hindi: "कुंभ", symbol: "♒", dates: "Jan 20 - Feb 18", element: "Air" },
  { name: "Pisces", hindi: "मीन", symbol: "♓", dates: "Feb 19 - Mar 20", element: "Water" },
];

const horoscopeData: Record<string, {
  overall: string;
  love: string;
  career: string;
  finance: string;
  health: string;
  luckyNumber: number;
  luckyColor: string;
  rating: number;
}> = {
  Aries: {
    overall: "Today brings exciting opportunities for personal growth. Your natural leadership qualities will shine, making it an excellent day for taking initiative on projects. Trust your instincts and don't hesitate to voice your opinions.",
    love: "Romance is in the air! Single Aries may encounter someone special through social activities. Couples should plan a surprise for their partner to strengthen the bond.",
    career: "Professional matters look promising. A new project or responsibility may come your way. Your enthusiasm will impress superiors and colleagues alike.",
    finance: "Financial decisions made today will have positive long-term effects. Consider investments but avoid impulsive purchases.",
    health: "Energy levels are high. Channel this into physical activities. A morning workout will set a positive tone for the day.",
    luckyNumber: 9,
    luckyColor: "Red",
    rating: 4,
  },
  Taurus: {
    overall: "Stability and comfort are your themes today. Focus on building secure foundations in all areas of life. Your practical approach will help solve complex problems.",
    love: "Emotional connections deepen today. Express your feelings openly to your partner. Singles may find comfort in familiar social circles.",
    career: "Steady progress at work. Your reliability is noticed and appreciated. Avoid rushing into new ventures; patience will pay off.",
    finance: "Good day for financial planning. Review your budget and savings goals. Avoid lending money today.",
    health: "Pay attention to your diet. Include more greens and stay hydrated. A relaxing evening routine will benefit your sleep.",
    luckyNumber: 6,
    luckyColor: "Green",
    rating: 3,
  },
  Gemini: {
    overall: "Communication is your superpower today. Express your ideas clearly and listen actively to others. Social interactions bring unexpected opportunities.",
    love: "Conversations with your partner lead to deeper understanding. Singles should engage in intellectual discussions to attract potential partners.",
    career: "Networking opportunities abound. Attend meetings and share your innovative ideas. Collaboration leads to success.",
    finance: "Multiple income streams may present themselves. Stay organized with paperwork and financial documents.",
    health: "Mental stimulation is important, but don't neglect physical activity. Short walks between tasks will refresh your mind.",
    luckyNumber: 5,
    luckyColor: "Yellow",
    rating: 4,
  },
  Cancer: {
    overall: "Emotional intelligence guides you today. Trust your intuition in personal matters. Home and family bring comfort and joy.",
    love: "Nurturing energy strengthens relationships. Plan a cozy evening at home with loved ones. Singles may reconnect with past acquaintances.",
    career: "Your empathetic nature helps in team dynamics. Support colleagues who need guidance. Recognition for past efforts is coming.",
    finance: "Focus on household expenses and family financial planning. Avoid major purchases; save for future security.",
    health: "Emotional well-being is connected to physical health. Practice self-care and don't neglect your needs while caring for others.",
    luckyNumber: 2,
    luckyColor: "Silver",
    rating: 3,
  },
  Leo: {
    overall: "Your charisma is magnetic today. Take center stage and showcase your talents. Creative pursuits bring fulfillment and recognition.",
    love: "Romance flourishes with grand gestures. Plan something special for your partner. Singles attract attention effortlessly.",
    career: "Leadership opportunities arise. Your confidence inspires others. Present your ideas boldly in meetings.",
    finance: "Generous spending tendencies today. Set a budget before shopping. Investments in creative ventures may pay off.",
    health: "Heart health is highlighted. Engage in activities that bring joy. Laughter truly is the best medicine today.",
    luckyNumber: 1,
    luckyColor: "Gold",
    rating: 5,
  },
  Virgo: {
    overall: "Attention to detail serves you well today. Organize your space and thoughts for maximum productivity. Health and wellness are priorities.",
    love: "Small acts of service express love better than words. Help your partner with practical matters. Singles should focus on self-improvement.",
    career: "Your analytical skills solve complex problems. Document your processes; they may become valuable resources.",
    finance: "Excellent day for budgeting and financial analysis. Review subscriptions and cut unnecessary expenses.",
    health: "Perfect day to start a new health routine. Focus on nutrition and establish healthy habits.",
    luckyNumber: 7,
    luckyColor: "Navy Blue",
    rating: 4,
  },
  Libra: {
    overall: "Balance and harmony are your guides today. Seek fairness in all dealings and appreciate beauty around you. Partnerships are highlighted.",
    love: "Relationships thrive through compromise and understanding. Plan romantic activities that both partners enjoy. Singles may meet someone through friends.",
    career: "Collaborative projects succeed. Your diplomatic skills resolve workplace conflicts. Aesthetic improvements to your workspace boost productivity.",
    finance: "Joint financial decisions require careful consideration. Seek balance between saving and spending.",
    health: "Mental peace affects physical health. Practice meditation or yoga. Surround yourself with beauty and calm.",
    luckyNumber: 6,
    luckyColor: "Pink",
    rating: 4,
  },
  Scorpio: {
    overall: "Transformation and depth characterize your day. Dive deep into matters that intrigue you. Hidden truths may surface.",
    love: "Intense emotional connections are possible. Be vulnerable with your partner. Singles may experience magnetic attractions.",
    career: "Research and investigation yield valuable insights. Trust your instincts about people and situations.",
    finance: "Good day for reviewing investments and insurance. Look into passive income opportunities.",
    health: "Emotional release is healing. Don't suppress feelings. Physical activities that challenge you are beneficial.",
    luckyNumber: 8,
    luckyColor: "Maroon",
    rating: 4,
  },
  Sagittarius: {
    overall: "Adventure calls today. Expand your horizons through learning or travel planning. Optimism attracts positive experiences.",
    love: "Shared adventures strengthen bonds. Plan future trips with your partner. Singles may find love in educational settings.",
    career: "International connections or higher learning opportunities arise. Share your knowledge generously.",
    finance: "Luck favors the bold, but don't gamble recklessly. Investments in education or travel pay dividends.",
    health: "Outdoor activities boost your spirits. Try a new sport or explore nature. Your enthusiasm is contagious.",
    luckyNumber: 3,
    luckyColor: "Purple",
    rating: 5,
  },
  Capricorn: {
    overall: "Ambition and discipline drive you today. Set long-term goals and take concrete steps toward them. Authority figures are supportive.",
    love: "Commitment and stability are valued. Discuss future plans with your partner. Singles should seek mature, goal-oriented individuals.",
    career: "Professional advancement is possible. Your hard work is recognized. Take on responsibilities that showcase your capabilities.",
    finance: "Excellent day for long-term financial planning. Consider retirement accounts and property investments.",
    health: "Don't neglect health for work. Schedule regular breaks. Bone and joint health need attention.",
    luckyNumber: 4,
    luckyColor: "Brown",
    rating: 4,
  },
  Aquarius: {
    overall: "Innovation and individuality shine today. Embrace your unique perspective and share unconventional ideas. Community involvement is rewarding.",
    love: "Freedom within relationships is important. Respect each other's individuality. Singles may find connections through group activities.",
    career: "Technology and innovation are your allies. Propose forward-thinking solutions. Networking with like-minded individuals opens doors.",
    finance: "Consider investments in technology or humanitarian causes. Crowdfunding or group investments may interest you.",
    health: "Mental stimulation is essential. Engage in puzzles or learn something new. Circulation and ankle health need attention.",
    luckyNumber: 11,
    luckyColor: "Electric Blue",
    rating: 4,
  },
  Pisces: {
    overall: "Intuition and creativity flow freely today. Trust your inner guidance and express yourself artistically. Spiritual practices bring peace.",
    love: "Deep emotional and spiritual connections are possible. Share your dreams with your partner. Singles may find soulmate connections.",
    career: "Creative projects flourish. Your imagination solves problems others can't. Trust your artistic instincts.",
    finance: "Be cautious with finances; avoid lending or borrowing. Investments in arts or spiritual ventures may appeal.",
    health: "Water-based activities are healing. Swimming or baths relax your spirit. Pay attention to feet health.",
    luckyNumber: 12,
    luckyColor: "Sea Green",
    rating: 3,
  },
};

export default function DailyHoroscopePage() {
  const [selectedSign, setSelectedSign] = useState<string | null>(null);
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const horoscope = selectedSign ? horoscopeData[selectedSign] : null;

  return (
    <div className="py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-amber-100 text-amber-800">Daily Horoscope</Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Today&apos;s Horoscope
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-2">
            Discover what the stars have in store for you today. Select your zodiac sign below.
          </p>
          <p className="text-amber-600 font-medium flex items-center justify-center gap-2">
            <Calendar className="w-5 h-5" />
            {today}
          </p>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-12">
          {zodiacSigns.map((sign) => (
            <Card
              key={sign.name}
              className={`cursor-pointer transition-all hover:border-amber-400 ${
                selectedSign === sign.name
                  ? "border-amber-500 bg-amber-50 ring-2 ring-amber-500"
                  : "border-gray-200"
              }`}
              onClick={() => setSelectedSign(sign.name)}
            >
              <CardContent className="pt-4 text-center">
                <div className="text-3xl mb-2">{sign.symbol}</div>
                <h3 className="font-semibold text-gray-900">{sign.name}</h3>
                <p className="text-xs text-gray-500">{sign.hindi}</p>
                <p className="text-xs text-gray-400 mt-1">{sign.dates}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {selectedSign && horoscope && (
          <div className="space-y-6">
            <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-4xl">
                      {zodiacSigns.find((s) => s.name === selectedSign)?.symbol}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedSign}</h2>
                      <p className="text-gray-600">
                        {zodiacSigns.find((s) => s.name === selectedSign)?.hindi} |{" "}
                        {zodiacSigns.find((s) => s.name === selectedSign)?.element} Sign
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < horoscope.rating
                              ? "text-yellow-500 fill-yellow-500"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Today&apos;s Rating</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-sm text-gray-600">Lucky Number</p>
                    <p className="text-2xl font-bold text-amber-600">{horoscope.luckyNumber}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-sm text-gray-600">Lucky Color</p>
                    <p className="text-2xl font-bold text-amber-600">{horoscope.luckyColor}</p>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sun className="w-5 h-5 text-amber-600" />
                    <h3 className="font-semibold text-gray-900">Overall</h3>
                  </div>
                  <p className="text-gray-700">{horoscope.overall}</p>
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-pink-200">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Heart className="w-5 h-5 text-pink-500" />
                    <h3 className="font-semibold text-gray-900">Love & Relationships</h3>
                  </div>
                  <p className="text-gray-700">{horoscope.love}</p>
                </CardContent>
              </Card>

              <Card className="border-blue-200">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Briefcase className="w-5 h-5 text-blue-500" />
                    <h3 className="font-semibold text-gray-900">Career & Work</h3>
                  </div>
                  <p className="text-gray-700">{horoscope.career}</p>
                </CardContent>
              </Card>

              <Card className="border-green-200">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <DollarSign className="w-5 h-5 text-green-500" />
                    <h3 className="font-semibold text-gray-900">Finance & Money</h3>
                  </div>
                  <p className="text-gray-700">{horoscope.finance}</p>
                </CardContent>
              </Card>

              <Card className="border-red-200">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Activity className="w-5 h-5 text-red-500" />
                    <h3 className="font-semibold text-gray-900">Health & Wellness</h3>
                  </div>
                  <p className="text-gray-700">{horoscope.health}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {!selectedSign && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="pt-6 text-center">
              <Moon className="w-12 h-12 mx-auto text-amber-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Select Your Zodiac Sign
              </h3>
              <p className="text-gray-600">
                Click on your zodiac sign above to view your personalized daily horoscope.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            Want a more detailed and personalized reading based on your exact birth chart?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-amber-500 hover:bg-amber-600 text-white" asChild>
              <Link href="/tools/kundli-calculator">
                Generate Free Kundli
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
            <Button variant="outline" className="border-amber-500 text-amber-600" asChild>
              <Link href="/consultation">Talk to an Astrologer</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
