"use client";

import { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCurrentYear, withCurrentYear } from "@/lib/utils";
import {
  Star,
  ArrowRight,
  Calendar,
  Heart,
  Briefcase,
  Wallet,
  Activity,
  TrendingUp,
  TrendingDown,
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

const monthlyPredictions: Record<string, {
  overview: string;
  love: string;
  career: string;
  finance: string;
  health: string;
  bestDays: string;
  challengingDays: string;
  luckyNumbers: number[];
  luckyColors: string[];
  ratings: { love: number; career: number; finance: number; health: number; overall: number };
  keyDates: { date: string; event: string }[];
}> = {
  Aries: {
    overview: "January 2026 brings powerful energy for new beginnings. Mars, your ruling planet, activates your career sector, making this an excellent month for professional advancement. The New Moon on the 10th opens doors for fresh starts, while the Full Moon on the 25th illuminates relationship matters.",
    love: "Romance takes an exciting turn this month. Singles may meet someone through professional connections or social events around the 15th. Couples benefit from planning future goals together. Communication improves significantly after the 20th.",
    career: "Career momentum is strong throughout January. A promotion or new responsibility may come your way around the 12th. Networking events prove beneficial. Avoid conflicts with authority figures during the first week.",
    finance: "Financial prospects improve steadily. Investment opportunities arise around mid-month. Avoid impulsive spending during the Full Moon period. A bonus or unexpected income is possible after the 22nd.",
    health: "Energy levels are high but require proper channeling. Physical exercise is essential for managing stress. Pay attention to head and face areas. Meditation helps maintain mental balance.",
    bestDays: "10, 15, 22, 28",
    challengingDays: "3, 7, 19",
    luckyNumbers: [9, 18, 27],
    luckyColors: ["Red", "Orange", "Gold"],
    ratings: { love: 4, career: 5, finance: 4, health: 4, overall: 4 },
    keyDates: [
      { date: "Jan 10", event: "New Moon - New beginnings" },
      { date: "Jan 15", event: "Venus aspect - Romance peaks" },
      { date: "Jan 25", event: "Full Moon - Relationship clarity" },
    ],
  },
  Taurus: {
    overview: "January 2026 emphasizes travel, learning, and expansion for Taurus. Jupiter's influence brings opportunities for growth through education or long-distance connections. The month favors philosophical pursuits and spiritual development.",
    love: "Long-distance relationships are highlighted. Singles may connect with someone from a different cultural background. Existing relationships benefit from shared adventures and learning experiences.",
    career: "International business opportunities arise. Publishing, teaching, and legal matters are favored. Higher education or professional certifications advance your career.",
    finance: "Foreign investments or income from abroad is possible. Educational expenses are worthwhile investments. Avoid financial risks during the first week.",
    health: "Hip and thigh areas need attention. Travel may affect routine - maintain healthy habits. Outdoor activities boost overall wellness.",
    bestDays: "8, 14, 21, 29",
    challengingDays: "5, 12, 24",
    luckyNumbers: [6, 15, 24],
    luckyColors: ["Green", "Pink", "White"],
    ratings: { love: 4, career: 4, finance: 4, health: 4, overall: 4 },
    keyDates: [
      { date: "Jan 8", event: "Jupiter aspect - Expansion" },
      { date: "Jan 14", event: "Travel opportunities" },
      { date: "Jan 21", event: "Learning breakthroughs" },
    ],
  },
  Gemini: {
    overview: "January 2026 brings transformation and deep changes for Gemini. The 8th house activation indicates matters related to shared resources, inheritance, and psychological growth. This is a powerful month for releasing old patterns.",
    love: "Intimate relationships deepen significantly. Trust issues may surface for healing. Singles attract intense, transformative connections. Honesty is essential in all relationships.",
    career: "Research and investigation work excels. Joint ventures and partnerships bring financial benefits. Behind-the-scenes work leads to recognition.",
    finance: "Shared finances and investments are highlighted. Insurance, taxes, and inheritance matters need attention. Debt repayment is favored.",
    health: "Reproductive and elimination systems need care. Detoxification is beneficial. Psychological healing through therapy or self-reflection is recommended.",
    bestDays: "6, 13, 20, 27",
    challengingDays: "2, 9, 16",
    luckyNumbers: [5, 14, 23],
    luckyColors: ["Yellow", "Green", "Orange"],
    ratings: { love: 4, career: 4, finance: 5, health: 3, overall: 4 },
    keyDates: [
      { date: "Jan 6", event: "Financial opportunity" },
      { date: "Jan 13", event: "Transformation begins" },
      { date: "Jan 20", event: "Deep healing" },
    ],
  },
  Cancer: {
    overview: "January 2026 highlights partnerships and relationships for Cancer. The 7th house emphasis brings focus to marriage, business partnerships, and one-on-one connections. Balance between self and others is the key theme.",
    love: "Relationships are the central focus. Marriage proposals or commitments are possible. Singles have excellent prospects for meeting a significant partner. Existing relationships reach new levels of understanding.",
    career: "Business partnerships flourish. Negotiations and contracts are favored. Legal matters resolve positively. Collaboration brings better results than solo efforts.",
    finance: "Partner's income or joint finances improve. Business partnerships are profitable. Legal settlements are favorable.",
    health: "Kidney and lower back areas need attention. Balance in diet and lifestyle is essential. Partner's health may also be a concern.",
    bestDays: "4, 11, 18, 26",
    challengingDays: "1, 8, 22",
    luckyNumbers: [2, 11, 20],
    luckyColors: ["White", "Silver", "Cream"],
    ratings: { love: 5, career: 4, finance: 4, health: 4, overall: 4 },
    keyDates: [
      { date: "Jan 4", event: "Partnership opportunity" },
      { date: "Jan 11", event: "Relationship milestone" },
      { date: "Jan 26", event: "Commitment decisions" },
    ],
  },
  Leo: {
    overview: "January 2026 focuses on health, service, and daily routines for Leo. The 6th house activation encourages improvements in work habits, health practices, and service to others. Small changes lead to significant improvements.",
    love: "Romance develops through workplace or health-related activities. Pets may play a role in love life. Service to partner strengthens bonds. Singles meet potential partners through daily routines.",
    career: "Work efficiency improves dramatically. Health-related professions see success. Employee relations are favorable. Organizational skills bring recognition.",
    finance: "Income through service-oriented work increases. Health-related expenses are possible. Budgeting and financial organization pay off.",
    health: "Excellent month for health improvements. Digestive system benefits from dietary changes. Establish new wellness routines. Mental health through service to others.",
    bestDays: "3, 10, 17, 24",
    challengingDays: "6, 13, 27",
    luckyNumbers: [1, 10, 19],
    luckyColors: ["Gold", "Orange", "Yellow"],
    ratings: { love: 3, career: 4, finance: 4, health: 5, overall: 4 },
    keyDates: [
      { date: "Jan 3", event: "Health initiative" },
      { date: "Jan 10", event: "Work recognition" },
      { date: "Jan 24", event: "Service rewards" },
    ],
  },
  Virgo: {
    overview: "January 2026 brings creativity, romance, and joy for Virgo. The 5th house activation highlights children, creative projects, and romantic pursuits. Self-expression and pleasure are emphasized.",
    love: "Romance flourishes beautifully. Singles attract admirers through creative expression. Existing relationships reignite passion. Children bring joy and may play cupid.",
    career: "Creative projects gain recognition. Entertainment and arts-related work succeeds. Teaching and working with children is favored. Speculative ventures may pay off.",
    finance: "Speculative gains are possible but risky. Entertainment expenses increase. Children-related expenses arise. Creative work generates income.",
    health: "Heart health needs attention. Joy and laughter are healing. Creative expression benefits mental health. Avoid excessive stress.",
    bestDays: "2, 9, 16, 23",
    challengingDays: "5, 12, 26",
    luckyNumbers: [5, 14, 23],
    luckyColors: ["Green", "Brown", "Navy"],
    ratings: { love: 5, career: 4, finance: 3, health: 4, overall: 4 },
    keyDates: [
      { date: "Jan 2", event: "Creative inspiration" },
      { date: "Jan 9", event: "Romance peaks" },
      { date: "Jan 23", event: "Joy and celebration" },
    ],
  },
  Libra: {
    overview: "January 2026 emphasizes home, family, and emotional foundations for Libra. The 4th house activation brings focus to domestic matters, property, and inner emotional life. Creating security is the key theme.",
    love: "Family approval matters in relationships. Home-based romance is favored. Singles may meet someone through family connections. Emotional security deepens bonds.",
    career: "Work from home opportunities arise. Real estate and property-related work succeeds. Family business matters progress. Inner work supports outer success.",
    finance: "Property investments are favorable. Family financial matters resolve. Home improvements are worthwhile. Inheritance matters may arise.",
    health: "Emotional well-being is crucial. Stomach and chest areas need attention. Home environment affects health. Family support aids healing.",
    bestDays: "1, 8, 15, 22",
    challengingDays: "4, 11, 25",
    luckyNumbers: [6, 15, 24],
    luckyColors: ["Pink", "Blue", "White"],
    ratings: { love: 4, career: 4, finance: 4, health: 4, overall: 4 },
    keyDates: [
      { date: "Jan 1", event: "Family focus" },
      { date: "Jan 15", event: "Property matters" },
      { date: "Jan 22", event: "Emotional healing" },
    ],
  },
  Scorpio: {
    overview: "January 2026 activates communication and learning for Scorpio. The 3rd house emphasis brings opportunities through writing, speaking, and local connections. Short trips and sibling matters are highlighted.",
    love: "Communication improves relationships dramatically. Love letters and messages bring joy. Siblings may play matchmaker. Local social events bring romantic opportunities.",
    career: "Writing, teaching, and communication work excels. Sales and marketing efforts succeed. Local business connections are valuable. Learning new skills advances career.",
    finance: "Income through communication and sales. Short trips for business are profitable. Sibling financial matters may arise. Multiple income streams possible.",
    health: "Respiratory system and arms need attention. Mental stimulation is important. Avoid nervous tension. Short walks and local activities benefit health.",
    bestDays: "7, 14, 21, 28",
    challengingDays: "3, 10, 24",
    luckyNumbers: [8, 17, 26],
    luckyColors: ["Maroon", "Black", "Red"],
    ratings: { love: 4, career: 4, finance: 4, health: 4, overall: 4 },
    keyDates: [
      { date: "Jan 7", event: "Communication breakthrough" },
      { date: "Jan 14", event: "Learning opportunity" },
      { date: "Jan 28", event: "Local success" },
    ],
  },
  Sagittarius: {
    overview: "January 2026 focuses on finances and values for Sagittarius. The 2nd house activation brings attention to income, possessions, and self-worth. Building material security is emphasized.",
    love: "Shared values strengthen relationships. Gift-giving and material expressions of love are highlighted. Financial discussions with partner are productive.",
    career: "Income-generating activities are favored. Salary negotiations succeed. Skills and talents are monetized. Self-employment opportunities arise.",
    finance: "Excellent month for financial growth. New income sources develop. Investments in quality items pay off. Budgeting brings security.",
    health: "Throat and neck areas need attention. Eating habits affect well-being. Voice care is important. Material comfort supports health.",
    bestDays: "6, 13, 20, 27",
    challengingDays: "2, 9, 23",
    luckyNumbers: [3, 12, 21],
    luckyColors: ["Purple", "Blue", "Turquoise"],
    ratings: { love: 4, career: 4, finance: 5, health: 4, overall: 4 },
    keyDates: [
      { date: "Jan 6", event: "Income opportunity" },
      { date: "Jan 13", event: "Value recognition" },
      { date: "Jan 27", event: "Financial milestone" },
    ],
  },
  Capricorn: {
    overview: "January 2026 is YOUR month, Capricorn! The Sun in your sign brings personal power and new beginnings. This is the best time to initiate projects, improve your image, and assert your identity.",
    love: "Personal magnetism is at its peak. Singles attract admirers effortlessly. Existing relationships benefit from your renewed confidence. Self-love attracts love from others.",
    career: "Leadership opportunities abound. Personal branding efforts succeed. New projects launched now have staying power. Authority figures support your initiatives.",
    finance: "Personal income increases. Self-employment ventures succeed. Investments in yourself pay off. Financial independence grows.",
    health: "Overall vitality is strong. Bones, joints, and skin need attention. New health routines established now stick. Birthday resolutions are powerful.",
    bestDays: "5, 12, 19, 26",
    challengingDays: "1, 8, 22",
    luckyNumbers: [8, 17, 26],
    luckyColors: ["Black", "Brown", "Gray"],
    ratings: { love: 4, career: 5, finance: 5, health: 4, overall: 5 },
    keyDates: [
      { date: "Jan 5", event: "Personal power peak" },
      { date: "Jan 12", event: "New beginning" },
      { date: "Jan 26", event: "Achievement recognition" },
    ],
  },
  Aquarius: {
    overview: "January 2026 is a month of rest and preparation for Aquarius. The 12th house activation encourages spiritual retreat, healing, and completion of old cycles. Hidden matters come to light.",
    love: "Secret admirers may reveal themselves. Past relationships need closure. Spiritual connections deepen bonds. Solitude helps clarify relationship needs.",
    career: "Behind-the-scenes work succeeds. Hospital, prison, or institutional work is favored. Research and investigation excel. Prepare for your upcoming birthday season.",
    finance: "Hidden income sources emerge. Charitable giving brings spiritual returns. Avoid financial deception. Debts from the past may surface.",
    health: "Rest and recuperation are essential. Feet and immune system need attention. Spiritual practices heal. Avoid addictive substances.",
    bestDays: "4, 11, 18, 25",
    challengingDays: "7, 14, 28",
    luckyNumbers: [4, 13, 22],
    luckyColors: ["Blue", "Electric Blue", "Silver"],
    ratings: { love: 3, career: 3, finance: 3, health: 4, overall: 3 },
    keyDates: [
      { date: "Jan 4", event: "Spiritual insight" },
      { date: "Jan 11", event: "Hidden revealed" },
      { date: "Jan 25", event: "Completion" },
    ],
  },
  Pisces: {
    overview: "January 2026 brings social success and wish fulfillment for Pisces. The 11th house activation highlights friendships, groups, and long-term goals. Dreams begin manifesting into reality.",
    love: "Friendships may evolve into romance. Social events bring romantic opportunities. Group activities strengthen existing relationships. Shared dreams unite couples.",
    career: "Networking brings career opportunities. Group projects succeed. Technology and innovation are favored. Professional associations are beneficial.",
    finance: "Income through friends or groups. Crowdfunding or group investments succeed. Technology-related income increases. Long-term financial goals progress.",
    health: "Circulation and ankles need attention. Group fitness activities are beneficial. Social connections support mental health. Technology aids health tracking.",
    bestDays: "3, 10, 17, 24",
    challengingDays: "6, 13, 27",
    luckyNumbers: [7, 16, 25],
    luckyColors: ["Sea Green", "Lavender", "Aqua"],
    ratings: { love: 4, career: 4, finance: 4, health: 4, overall: 4 },
    keyDates: [
      { date: "Jan 3", event: "Social success" },
      { date: "Jan 10", event: "Wish fulfillment" },
      { date: "Jan 24", event: "Group achievement" },
    ],
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

function getCurrentMonth() {
  const now = new Date();
  return now.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export default function MonthlyHoroscopePage() {
  const { t } = useLanguage();
  const currentYear = getCurrentYear();
  const [selectedSign, setSelectedSign] = useState<string | null>(null);
  const prediction = selectedSign ? monthlyPredictions[selectedSign] : null;
  const signData = selectedSign ? zodiacSigns.find(s => s.name === selectedSign) : null;

  return (
    <div className="py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-indigo-100 text-indigo-800">{t('horoscope.monthlyPredictions', 'Monthly Predictions')}</Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {t('horoscope.monthly.title', 'Monthly Horoscope')}
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-2">
            {t('horoscope.monthly.subtitle', 'Your comprehensive monthly astrological forecast with detailed predictions.')}
          </p>
          <p className="text-indigo-600 font-medium flex items-center justify-center gap-2">
            <Calendar className="w-5 h-5" />
            {getCurrentMonth()}
          </p>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          {zodiacSigns.map((sign) => (
            <button
              key={sign.name}
              onClick={() => setSelectedSign(sign.name)}
              className={`p-4 rounded-xl border-2 transition-all hover:shadow-lg ${
                selectedSign === sign.name
                  ? "border-indigo-500 bg-indigo-50 shadow-md"
                  : "border-gray-200 hover:border-indigo-300"
              }`}
            >
              <span className="text-3xl block mb-1">{sign.symbol}</span>
              <span className="font-medium text-gray-900">{sign.name}</span>
              <span className="text-xs text-gray-500 block">{sign.hindi}</span>
            </button>
          ))}
        </div>

        {selectedSign && prediction && signData ? (
          <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50">
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <span className="text-5xl">{signData.symbol}</span>
                  <div>
                    <CardTitle className="text-2xl">{signData.name} {t('horoscope.monthlyHoroscope', 'Monthly Horoscope')}</CardTitle>
                    <CardDescription>{signData.dates} | {signData.hindi}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Overall:</span>
                  <RatingStars rating={prediction.ratings.overall} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-white rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">{t('horoscope.monthlyOverview', 'Monthly Overview')}</h3>
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
                        <Activity className="w-4 h-4" /> {t('horoscope.healthWellness', 'Health & Wellness')}
                      </h3>
                      <RatingStars rating={prediction.ratings.health} />
                    </div>
                    <p className="text-sm text-orange-700">{prediction.health}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-500" /> {t('horoscope.bestDays', 'Best Days')}
                    </h3>
                    <p className="text-green-700 font-medium">{prediction.bestDays}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <TrendingDown className="w-4 h-4 text-red-500" /> {t('horoscope.challengingDays', 'Challenging Days')}
                    </h3>
                    <p className="text-red-700 font-medium">{prediction.challengingDays}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{t('horoscope.luckyNumbers', 'Lucky Numbers')}</h3>
                    <div className="flex gap-2">
                      {prediction.luckyNumbers.map((num) => (
                        <Badge key={num} className="bg-indigo-500">{num}</Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">{t('horoscope.keyDates', 'Key Dates This Month')}</h3>
                  <div className="space-y-2">
                    {prediction.keyDates.map((item, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm">
                        <Badge variant="outline" className="min-w-[70px]">{item.date}</Badge>
                        <span className="text-gray-700">{item.event}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-indigo-100 rounded-lg p-4">
                  <h3 className="font-semibold text-indigo-800 mb-2">{t('horoscope.luckyColors', 'Lucky Colors')}</h3>
                  <div className="flex gap-2">
                    {prediction.luckyColors.map((color) => (
                      <Badge key={color} variant="secondary" className="bg-white text-indigo-700">
                        {color}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-indigo-200 bg-indigo-50/50">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
                <Calendar className="w-12 h-12 text-indigo-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('horoscope.selectYourSign', 'Select Your Zodiac Sign')}
              </h3>
              <p className="text-gray-600 text-center max-w-xs">
                {t('horoscope.selectSignMonthly', 'Select a zodiac sign above to view your monthly horoscope')}
              </p>
            </CardContent>
          </Card>
        )}

        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <Card className="border-amber-200 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-2">{t('horoscope.dailyHoroscope', 'Daily Horoscope')}</h3>
              <p className="text-gray-600 text-sm mb-4">
                {t('horoscope.dailyDesc', 'Get your daily predictions and guidance.')}
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/daily-horoscope">
                  {t('horoscope.readDaily', 'Read Daily')} <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-amber-200 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-2">{t('horoscope.weekly.title', 'Weekly Horoscope')}</h3>
              <p className="text-gray-600 text-sm mb-4">
                {t('horoscope.weeklyDesc', 'Your weekly astrological forecast.')}
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/horoscope/weekly">
                  {t('horoscope.readWeekly', 'Read Weekly')} <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>

                    <Card className="border-amber-200 hover:shadow-lg transition-shadow">
                      <CardContent className="pt-6">
                        <h3 className="font-semibold text-lg mb-2">{withCurrentYear(t('horoscope.yearlyHoroscope', '{year} Horoscope'))}</h3>
                        <p className="text-gray-600 text-sm mb-4">
                          {t('horoscope.yearlyDesc', 'Your complete yearly predictions.')}
                        </p>
                        <Button variant="outline" className="w-full" asChild>
                          <Link href={`/horoscope/${currentYear}`}>
                            {t('horoscope.readYearly', 'Read Yearly')} <ArrowRight className="w-4 h-4 ml-2" />
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
            headline: "Monthly Horoscope - Predictions for All Zodiac Signs",
            description: "Monthly horoscope predictions for all 12 zodiac signs",
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
