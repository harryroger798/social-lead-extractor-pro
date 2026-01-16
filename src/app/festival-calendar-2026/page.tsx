"use client";

import { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Star,
  Sun,
  Moon,
  ArrowRight,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export const metadata: Metadata = {
  title: "Hindu Festival Calendar 2026 - Complete List of Festivals & Holidays",
  description: "Complete Hindu festival calendar for 2026 with dates, timings, and significance. Find Diwali, Holi, Navratri, Ganesh Chaturthi, and all major Hindu festivals.",
  keywords: [
    "hindu festival calendar 2026",
    "indian festivals 2026",
    "diwali 2026",
    "holi 2026",
    "navratri 2026",
    "ganesh chaturthi 2026",
    "hindu holidays 2026",
    "panchang 2026",
  ],
};

const festivals2026 = [
  {
    month: "January 2026",
    festivals: [
      { name: "Lohri", date: "January 13, 2026", type: "Regional", description: "Punjabi harvest festival celebrated with bonfires" },
      { name: "Makar Sankranti", date: "January 14, 2026", type: "Major", description: "Sun enters Capricorn, kite flying festival" },
      { name: "Pongal", date: "January 14-17, 2026", type: "Regional", description: "Tamil harvest festival spanning four days" },
      { name: "Republic Day", date: "January 26, 2026", type: "National", description: "National holiday celebrating Indian constitution" },
      { name: "Basant Panchami", date: "January 29, 2026", type: "Major", description: "Worship of Goddess Saraswati, arrival of spring" },
    ],
  },
  {
    month: "February 2026",
    festivals: [
      { name: "Maha Shivaratri", date: "February 26, 2026", type: "Major", description: "Night of Lord Shiva, fasting and night vigil" },
    ],
  },
  {
    month: "March 2026",
    festivals: [
      { name: "Holika Dahan", date: "March 13, 2026", type: "Major", description: "Burning of Holika, victory of good over evil" },
      { name: "Holi", date: "March 14, 2026", type: "Major", description: "Festival of colors celebrating spring" },
      { name: "Chaitra Navratri Begins", date: "March 29, 2026", type: "Major", description: "Nine nights of Goddess Durga worship" },
    ],
  },
  {
    month: "April 2026",
    festivals: [
      { name: "Ugadi / Gudi Padwa", date: "March 29, 2026", type: "Regional", description: "Telugu and Marathi New Year" },
      { name: "Ram Navami", date: "April 6, 2026", type: "Major", description: "Birth anniversary of Lord Rama" },
      { name: "Mahavir Jayanti", date: "April 13, 2026", type: "Major", description: "Birth anniversary of Lord Mahavira" },
      { name: "Good Friday", date: "April 3, 2026", type: "National", description: "Christian observance" },
      { name: "Hanuman Jayanti", date: "April 14, 2026", type: "Major", description: "Birth anniversary of Lord Hanuman" },
      { name: "Baisakhi", date: "April 14, 2026", type: "Regional", description: "Punjabi New Year and harvest festival" },
    ],
  },
  {
    month: "May 2026",
    festivals: [
      { name: "Buddha Purnima", date: "May 12, 2026", type: "Major", description: "Birth anniversary of Gautama Buddha" },
      { name: "Akshaya Tritiya", date: "May 1, 2026", type: "Major", description: "Auspicious day for new beginnings and gold purchase" },
    ],
  },
  {
    month: "June 2026",
    festivals: [
      { name: "Ganga Dussehra", date: "June 7, 2026", type: "Regional", description: "Descent of River Ganga to Earth" },
      { name: "Nirjala Ekadashi", date: "June 8, 2026", type: "Vrat", description: "Strictest Ekadashi fast without water" },
    ],
  },
  {
    month: "July 2026",
    festivals: [
      { name: "Guru Purnima", date: "July 10, 2026", type: "Major", description: "Day to honor spiritual teachers" },
      { name: "Eid ul-Adha", date: "July 7, 2026", type: "National", description: "Islamic festival of sacrifice" },
    ],
  },
  {
    month: "August 2026",
    festivals: [
      { name: "Nag Panchami", date: "August 1, 2026", type: "Major", description: "Worship of serpent deities" },
      { name: "Raksha Bandhan", date: "August 9, 2026", type: "Major", description: "Festival celebrating brother-sister bond" },
      { name: "Independence Day", date: "August 15, 2026", type: "National", description: "Indian Independence Day" },
      { name: "Krishna Janmashtami", date: "August 22, 2026", type: "Major", description: "Birth anniversary of Lord Krishna" },
      { name: "Ganesh Chaturthi", date: "August 27, 2026", type: "Major", description: "Birth of Lord Ganesha, 10-day celebration" },
    ],
  },
  {
    month: "September 2026",
    festivals: [
      { name: "Anant Chaturdashi", date: "September 5, 2026", type: "Major", description: "Ganesh Visarjan day" },
      { name: "Onam", date: "September 4, 2026", type: "Regional", description: "Kerala harvest festival" },
      { name: "Pitru Paksha Begins", date: "September 7, 2026", type: "Vrat", description: "16-day period for ancestor worship" },
    ],
  },
  {
    month: "October 2026",
    festivals: [
      { name: "Sharad Navratri Begins", date: "September 22, 2026", type: "Major", description: "Nine nights of Goddess Durga worship" },
      { name: "Durga Ashtami", date: "September 29, 2026", type: "Major", description: "Eighth day of Navratri" },
      { name: "Maha Navami", date: "September 30, 2026", type: "Major", description: "Ninth day of Navratri" },
      { name: "Dussehra / Vijayadashami", date: "October 1, 2026", type: "Major", description: "Victory of good over evil, Ravana Dahan" },
      { name: "Karwa Chauth", date: "October 12, 2026", type: "Vrat", description: "Married women fast for husband's longevity" },
      { name: "Dhanteras", date: "October 18, 2026", type: "Major", description: "First day of Diwali, worship of wealth" },
      { name: "Narak Chaturdashi", date: "October 19, 2026", type: "Major", description: "Second day of Diwali" },
      { name: "Diwali / Lakshmi Puja", date: "October 20, 2026", type: "Major", description: "Festival of lights, worship of Goddess Lakshmi" },
      { name: "Govardhan Puja", date: "October 21, 2026", type: "Major", description: "Fourth day of Diwali" },
      { name: "Bhai Dooj", date: "October 22, 2026", type: "Major", description: "Fifth day of Diwali, brother-sister celebration" },
      { name: "Chhath Puja", date: "October 26, 2026", type: "Regional", description: "Sun worship festival, mainly in Bihar" },
    ],
  },
  {
    month: "November 2026",
    festivals: [
      { name: "Dev Diwali", date: "November 4, 2026", type: "Regional", description: "Diwali of the Gods in Varanasi" },
      { name: "Tulsi Vivah", date: "November 8, 2026", type: "Vrat", description: "Ceremonial marriage of Tulsi plant to Lord Vishnu" },
      { name: "Guru Nanak Jayanti", date: "November 15, 2026", type: "Major", description: "Birth anniversary of Guru Nanak Dev Ji" },
    ],
  },
  {
    month: "December 2026",
    festivals: [
      { name: "Gita Jayanti", date: "December 1, 2026", type: "Major", description: "Day Bhagavad Gita was revealed" },
      { name: "Christmas", date: "December 25, 2026", type: "National", description: "Christian celebration of Jesus Christ's birth" },
    ],
  },
];

const upcomingEclipses = [
  { type: "Total Lunar Eclipse", date: "March 14, 2026", visibility: "Visible in India" },
  { type: "Partial Solar Eclipse", date: "March 29, 2026", visibility: "Not visible in India" },
  { type: "Total Lunar Eclipse", date: "September 7, 2026", visibility: "Visible in India" },
  { type: "Annular Solar Eclipse", date: "September 22, 2026", visibility: "Partially visible in India" },
];

export default function FestivalCalendar2026Page() {
  const { t } = useLanguage();
  return (
    <div className="py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-amber-100 text-amber-800">2026 Calendar</Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Hindu Festival Calendar 2026
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Complete list of Hindu festivals, fasts, and important dates for 2026. 
            Plan your celebrations with accurate dates and timings.
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6 mb-12">
          <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
            <CardContent className="pt-6 text-center">
              <Calendar className="w-12 h-12 mx-auto text-amber-600 mb-3" />
              <h3 className="text-3xl font-bold text-amber-700">100+</h3>
              <p className="text-gray-600">Festivals & Holidays</p>
            </CardContent>
          </Card>
          <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
            <CardContent className="pt-6 text-center">
              <Moon className="w-12 h-12 mx-auto text-purple-600 mb-3" />
              <h3 className="text-3xl font-bold text-purple-700">4</h3>
              <p className="text-gray-600">Eclipses in 2026</p>
            </CardContent>
          </Card>
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardContent className="pt-6 text-center">
              <Star className="w-12 h-12 mx-auto text-blue-600 mb-3" />
              <h3 className="text-3xl font-bold text-blue-700">24</h3>
              <p className="text-gray-600">Ekadashi Fasts</p>
            </CardContent>
          </Card>
          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardContent className="pt-6 text-center">
              <Sun className="w-12 h-12 mx-auto text-green-600 mb-3" />
              <h3 className="text-3xl font-bold text-green-700">12</h3>
              <p className="text-gray-600">Purnima Days</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-amber-200 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Moon className="w-5 h-5 text-amber-600" />
              Eclipses in 2026 (Grahan)
            </CardTitle>
            <CardDescription>
              Solar and Lunar eclipses with visibility in India
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {upcomingEclipses.map((eclipse, index) => (
                <div
                  key={index}
                  className={`rounded-lg p-4 ${
                    eclipse.type.includes("Lunar")
                      ? "bg-purple-50 border border-purple-200"
                      : "bg-orange-50 border border-orange-200"
                  }`}
                >
                  <Badge
                    className={
                      eclipse.type.includes("Lunar")
                        ? "bg-purple-500 mb-2"
                        : "bg-orange-500 mb-2"
                    }
                  >
                    {eclipse.type}
                  </Badge>
                  <p className="font-semibold text-gray-900">{eclipse.date}</p>
                  <p className="text-sm text-gray-600">{eclipse.visibility}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-8">
          {festivals2026.map((monthData) => (
            <Card key={monthData.month} className="border-amber-200">
              <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-amber-600" />
                  {monthData.month}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  {monthData.festivals.map((festival, index) => (
                    <div
                      key={index}
                      className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-amber-50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{festival.name}</h3>
                          <Badge
                            className={
                              festival.type === "Major"
                                ? "bg-amber-500"
                                : festival.type === "National"
                                ? "bg-blue-500"
                                : festival.type === "Vrat"
                                ? "bg-purple-500"
                                : "bg-green-500"
                            }
                          >
                            {festival.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{festival.description}</p>
                      </div>
                      <div className="mt-2 md:mt-0 md:ml-4">
                        <span className="text-amber-700 font-medium">{festival.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <Card className="border-amber-200 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-2">Daily Panchang</h3>
              <p className="text-gray-600 text-sm mb-4">
                Get daily Tithi, Nakshatra, Yoga, Karana, and auspicious timings.
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/panchang">
                  View Panchang <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-amber-200 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-2">2026 Horoscope</h3>
              <p className="text-gray-600 text-sm mb-4">
                Read your yearly horoscope predictions for 2026.
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/horoscope/2026">
                  Read Horoscope <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-amber-200 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-2">Free Kundli</h3>
              <p className="text-gray-600 text-sm mb-4">
                Generate your complete birth chart with planetary positions.
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/tools/kundli-calculator">
                  Get Kundli <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="border-amber-200 bg-amber-50 mt-12">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              About Hindu Festival Calendar
            </h2>
            <div className="prose prose-amber max-w-none">
              <p className="text-gray-700 mb-4">
                The Hindu festival calendar follows the lunisolar system, combining both lunar 
                and solar movements to determine dates. Most Hindu festivals are based on the 
                Panchang, which considers Tithi (lunar day), Nakshatra (lunar mansion), and 
                other astronomical factors.
              </p>
              <p className="text-gray-700 mb-4">
                Major festivals like Diwali, Holi, Navratri, and Ganesh Chaturthi are celebrated 
                across India, while regional festivals like Pongal, Onam, and Baisakhi have 
                special significance in specific states. The calendar also includes important 
                fasting days (Vrat) like Ekadashi, Pradosh, and Karwa Chauth.
              </p>
              <p className="text-gray-700">
                Eclipses (Grahan) hold special significance in Hindu tradition. During eclipses, 
                temples are closed, and specific rituals are performed. The Sutak period before 
                and after eclipses is considered inauspicious for starting new activities.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: "Hindu Festival Calendar 2026 - Complete List of Festivals & Holidays",
            description: "Complete Hindu festival calendar for 2026 with dates, timings, and significance",
            author: {
              "@type": "Organization",
              name: "VedicStarAstro",
            },
            publisher: {
              "@type": "Organization",
              name: "VedicStarAstro",
              logo: {
                "@type": "ImageObject",
                url: "https://vedicstarastro.com/logo.png",
              },
            },
            datePublished: "2025-12-01",
            dateModified: "2026-01-01",
          }),
        }}
      />
    </div>
  );
}
