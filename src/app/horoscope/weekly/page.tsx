"use client";

import { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Star,
  ArrowRight,
  Calendar,
  Heart,
  Briefcase,
  Wallet,
  Activity,
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

const weeklyPredictions: Record<string, {
  overview: string;
  love: string;
  career: string;
  finance: string;
  health: string;
  luckyDay: string;
  luckyNumber: number;
  ratings: { love: number; career: number; finance: number; health: number };
}> = {
  Aries: {
    overview: "This week brings dynamic energy and new opportunities. Mars energizes your ambitions, making it an excellent time to start new projects. Mid-week may bring some challenges in relationships, but the weekend promises social enjoyment.",
    love: "Singles may encounter an exciting connection through work or social events. Couples should focus on communication to avoid misunderstandings. Weekend brings romantic opportunities.",
    career: "Professional momentum builds throughout the week. A new project or responsibility may come your way. Avoid conflicts with colleagues on Wednesday.",
    finance: "Financial prospects look positive. An unexpected opportunity for income may arise. Avoid impulsive purchases mid-week.",
    health: "Energy levels are high but pace yourself. Include physical activity in your routine. Watch for stress-related tension.",
    luckyDay: "Thursday",
    luckyNumber: 9,
    ratings: { love: 4, career: 5, finance: 4, health: 4 },
  },
  Taurus: {
    overview: "A week focused on stability and practical matters. Venus brings harmony to relationships, while Saturn encourages financial discipline. Take time for self-care and avoid overcommitting.",
    love: "Romantic relationships deepen through quality time together. Singles may reconnect with someone from the past. Express your feelings openly.",
    career: "Steady progress at work. Focus on completing existing tasks rather than starting new ones. Recognition for past efforts is possible.",
    finance: "Good week for financial planning and budgeting. Avoid lending money. Investment opportunities require careful analysis.",
    health: "Focus on rest and relaxation. Throat and neck areas need attention. Gentle exercise is beneficial.",
    luckyDay: "Friday",
    luckyNumber: 6,
    ratings: { love: 5, career: 4, finance: 4, health: 3 },
  },
  Gemini: {
    overview: "Communication is your superpower this week. Mercury enhances your ability to connect and persuade. Social activities bring joy, but don't neglect important responsibilities.",
    love: "Conversations lead to deeper understanding in relationships. Singles attract attention through wit and charm. Avoid gossip that could backfire.",
    career: "Excellent week for presentations, negotiations, and networking. New ideas are well-received. Collaboration brings success.",
    finance: "Multiple income streams possible. Be cautious with contracts and agreements. Read fine print carefully.",
    health: "Mental stimulation is high but watch for anxiety. Practice mindfulness. Respiratory health needs attention.",
    luckyDay: "Wednesday",
    luckyNumber: 5,
    ratings: { love: 4, career: 5, finance: 4, health: 3 },
  },
  Cancer: {
    overview: "Emotional depth and intuition guide you this week. Home and family matters take priority. Trust your instincts in decision-making, especially regarding personal matters.",
    love: "Deep emotional connections are favored. Family approval matters in relationships. Nurturing gestures strengthen bonds.",
    career: "Work from home or remote opportunities arise. Creative projects flourish. Avoid workplace politics.",
    finance: "Property and real estate matters are favorable. Family financial discussions are productive. Save for future security.",
    health: "Emotional well-being affects physical health. Digestive system needs attention. Water intake is important.",
    luckyDay: "Monday",
    luckyNumber: 2,
    ratings: { love: 5, career: 4, finance: 4, health: 4 },
  },
  Leo: {
    overview: "Your natural charisma shines brightly this week. Creative expression brings recognition. Leadership opportunities arise, but balance confidence with humility.",
    love: "Romance flourishes with grand gestures appreciated. Singles attract admirers easily. Avoid ego clashes in relationships.",
    career: "Leadership roles suit you well. Creative projects gain recognition. Avoid power struggles with superiors.",
    finance: "Speculative gains possible but risky. Entertainment expenses may increase. Children-related expenses arise.",
    health: "Heart health and back care are important. Maintain regular exercise. Avoid excessive stress.",
    luckyDay: "Sunday",
    luckyNumber: 1,
    ratings: { love: 5, career: 5, finance: 3, health: 4 },
  },
  Virgo: {
    overview: "Attention to detail serves you well this week. Health and wellness improvements are favored. Service to others brings satisfaction and unexpected rewards.",
    love: "Practical expressions of love are appreciated. Singles may meet someone through work or health activities. Avoid being overly critical.",
    career: "Analytical skills are in demand. Health-related professions see success. Organizational tasks bring recognition.",
    finance: "Careful budgeting pays off. Health-related expenses possible. Service-based income increases.",
    health: "Excellent week for health improvements. Digestive system benefits from dietary changes. Mental health matters.",
    luckyDay: "Wednesday",
    luckyNumber: 5,
    ratings: { love: 3, career: 4, finance: 4, health: 5 },
  },
  Libra: {
    overview: "Balance and harmony are your themes this week. Partnerships of all kinds are highlighted. Artistic pursuits bring joy and possibly income.",
    love: "Relationships reach new levels of harmony. Marriage discussions are favorable. Singles attract through charm and grace.",
    career: "Partnerships and collaborations succeed. Legal matters resolve favorably. Diplomatic skills are valued.",
    finance: "Joint finances improve. Business partnerships are profitable. Art and beauty investments pay off.",
    health: "Kidney and lower back need attention. Balance in all things promotes wellness. Avoid excess.",
    luckyDay: "Friday",
    luckyNumber: 6,
    ratings: { love: 5, career: 4, finance: 4, health: 4 },
  },
  Scorpio: {
    overview: "Transformation and intensity mark this week. Hidden matters come to light. Research and investigation bring discoveries. Trust your powerful intuition.",
    love: "Deep, passionate connections are favored. Secrets may be revealed in relationships. Jealousy needs management.",
    career: "Research and investigation succeed. Hidden opportunities emerge. Power dynamics shift in your favor.",
    finance: "Inheritance or insurance matters progress. Joint finances need attention. Investment research pays off.",
    health: "Reproductive health matters. Detoxification is beneficial. Emotional release promotes healing.",
    luckyDay: "Tuesday",
    luckyNumber: 8,
    ratings: { love: 4, career: 4, finance: 5, health: 4 },
  },
  Sagittarius: {
    overview: "Adventure and expansion call to you this week. Higher learning and travel opportunities arise. Optimism attracts good fortune, but avoid overcommitting.",
    love: "Long-distance relationships are highlighted. Cultural differences add excitement. Freedom in love is important.",
    career: "Teaching, publishing, and travel-related work flourishes. International opportunities arise. Higher education benefits career.",
    finance: "Foreign investments or income possible. Educational expenses are worthwhile. Avoid gambling.",
    health: "Hip and thigh areas need attention. Outdoor activities boost wellness. Avoid excess in food and drink.",
    luckyDay: "Thursday",
    luckyNumber: 3,
    ratings: { love: 4, career: 5, finance: 4, health: 4 },
  },
  Capricorn: {
    overview: "Career and public image are highlighted this week. Authority figures support your goals. Hard work brings recognition. Balance ambition with personal life.",
    love: "Professional connections may lead to romance. Status matters in relationships. Work-life balance affects love life.",
    career: "Major career advancement possible. Recognition from superiors. Leadership responsibilities increase.",
    finance: "Professional income increases. Business ventures succeed. Long-term investments are favorable.",
    health: "Bones and joints need care. Stress management is crucial. Regular check-ups recommended.",
    luckyDay: "Saturday",
    luckyNumber: 8,
    ratings: { love: 3, career: 5, finance: 5, health: 3 },
  },
  Aquarius: {
    overview: "Social connections and innovation are your focus this week. Group activities bring opportunities. Humanitarian causes inspire action. Technology aids progress.",
    love: "Friendships may evolve into romance. Unconventional relationships are highlighted. Freedom and space are valued.",
    career: "Technology and innovation bring success. Group projects flourish. Networking opens doors.",
    finance: "Income through friends or groups. Technology investments pay off. Crowdfunding opportunities arise.",
    health: "Circulation and ankles need attention. Group fitness activities are beneficial. Mental health through social connection.",
    luckyDay: "Saturday",
    luckyNumber: 4,
    ratings: { love: 4, career: 4, finance: 4, health: 4 },
  },
  Pisces: {
    overview: "Spirituality and creativity flow strongly this week. Intuition guides important decisions. Solitude brings insights. Compassion for others brings blessings.",
    love: "Soulmate connections are possible. Spiritual bonds deepen relationships. Avoid escapism in love.",
    career: "Creative and spiritual professions thrive. Behind-the-scenes work succeeds. Hospitals and institutions are favorable.",
    finance: "Hidden income sources emerge. Charitable giving brings returns. Avoid financial deception.",
    health: "Feet and immune system need attention. Rest and meditation are healing. Avoid addictive substances.",
    luckyDay: "Thursday",
    luckyNumber: 7,
    ratings: { love: 5, career: 4, finance: 4, health: 4 },
  },
};

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-3 h-3 ${star <= rating ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
        />
      ))}
    </div>
  );
}

function getWeekDates() {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - dayOfWeek);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  
  const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  return `${startOfWeek.toLocaleDateString("en-US", options)} - ${endOfWeek.toLocaleDateString("en-US", options)}, ${endOfWeek.getFullYear()}`;
}

export default function WeeklyHoroscopePage() {
  const { t } = useLanguage();
  const [selectedSign, setSelectedSign] = useState<string | null>(null);
  const prediction = selectedSign ? weeklyPredictions[selectedSign] : null;
  const signData = selectedSign ? zodiacSigns.find(s => s.name === selectedSign) : null;

  return (
    <div className="py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-purple-100 text-purple-800">{t('horoscope.weeklyPredictions', 'Weekly Predictions')}</Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {t('horoscope.weekly.title', 'Weekly Horoscope')}
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-2">
            {t('horoscope.weekly.subtitle', 'Your weekly astrological forecast for love, career, finance, and health.')}
          </p>
          <p className="text-amber-600 font-medium flex items-center justify-center gap-2">
            <Calendar className="w-5 h-5" />
            Week of {getWeekDates()}
          </p>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          {zodiacSigns.map((sign) => (
            <button
              key={sign.name}
              onClick={() => setSelectedSign(sign.name)}
              className={`p-4 rounded-xl border-2 transition-all hover:shadow-lg ${
                selectedSign === sign.name
                  ? "border-purple-500 bg-purple-50 shadow-md"
                  : "border-gray-200 hover:border-purple-300"
              }`}
            >
              <span className="text-3xl block mb-1">{sign.symbol}</span>
              <span className="font-medium text-gray-900">{sign.name}</span>
              <span className="text-xs text-gray-500 block">{sign.hindi}</span>
            </button>
          ))}
        </div>

        {selectedSign && prediction && signData ? (
          <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-5xl">{signData.symbol}</span>
                  <div>
                    <CardTitle className="text-2xl">{signData.name} {t('horoscope.weeklyHoroscope', 'Weekly Horoscope')}</CardTitle>
                    <CardDescription>{signData.dates} | {signData.hindi}</CardDescription>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">{t('horoscope.luckyDay', 'Lucky Day')}</p>
                  <p className="font-bold text-purple-700">{prediction.luckyDay}</p>
                  <p className="text-sm text-gray-600 mt-1">{t('horoscope.luckyNumber', 'Lucky Number')}</p>
                  <p className="font-bold text-purple-700">{prediction.luckyNumber}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-white rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Weekly Overview</h3>
                  <p className="text-gray-700">{prediction.overview}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-pink-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-pink-800 flex items-center gap-2">
                        <Heart className="w-4 h-4" /> {t('horoscope.loveRelationships', 'Love & Relationships')}
                      </h3>
                      <RatingStars rating={prediction.ratings.love} />
                    </div>
                    <p className="text-sm text-pink-700">{prediction.love}</p>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-blue-800 flex items-center gap-2">
                        <Briefcase className="w-4 h-4" /> {t('horoscope.careerWork', 'Career & Work')}
                      </h3>
                      <RatingStars rating={prediction.ratings.career} />
                    </div>
                    <p className="text-sm text-blue-700">{prediction.career}</p>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-green-800 flex items-center gap-2">
                        <Wallet className="w-4 h-4" /> {t('horoscope.financeMoney', 'Finance & Money')}
                      </h3>
                      <RatingStars rating={prediction.ratings.finance} />
                    </div>
                    <p className="text-sm text-green-700">{prediction.finance}</p>
                  </div>

                  <div className="bg-orange-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-orange-800 flex items-center gap-2">
                        <Activity className="w-4 h-4" /> Health & Wellness
                      </h3>
                      <RatingStars rating={prediction.ratings.health} />
                    </div>
                    <p className="text-sm text-orange-700">{prediction.health}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-purple-200 bg-purple-50/50">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-24 h-24 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                <Star className="w-12 h-12 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Select Your Zodiac Sign
              </h3>
              <p className="text-gray-600 text-center max-w-xs">
                Click on your zodiac sign above to read your weekly horoscope predictions.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <Card className="border-amber-200 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-2">Daily Horoscope</h3>
              <p className="text-gray-600 text-sm mb-4">
                Get your daily predictions and guidance.
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/daily-horoscope">
                  Read Daily <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-amber-200 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-2">Monthly Horoscope</h3>
              <p className="text-gray-600 text-sm mb-4">
                Plan your month with detailed forecasts.
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/horoscope/monthly">
                  Read Monthly <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-amber-200 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-2">2026 Horoscope</h3>
              <p className="text-gray-600 text-sm mb-4">
                Your complete yearly predictions.
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/horoscope/2026">
                  Read Yearly <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: "Weekly Horoscope - Predictions for All Zodiac Signs",
            description: "Weekly horoscope predictions for all 12 zodiac signs",
            author: {
              "@type": "Organization",
              name: "VedicStarAstro",
            },
          }),
        }}
      />
    </div>
  );
}
