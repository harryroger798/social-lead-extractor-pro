"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LocationInput } from "@/components/ui/location-input";
import {
  Calendar,
  Sun,
  Moon,
  Clock,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Star,
  Sunrise,
  Sunset,
  ArrowRight,
} from "lucide-react";

const tithiNames = [
  "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami",
  "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
  "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Purnima/Amavasya"
];

const nakshatraNames = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
  "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
  "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
  "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha",
  "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
];

const yogaNames = [
  "Vishkumbha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda",
  "Sukarma", "Dhriti", "Shula", "Ganda", "Vriddhi", "Dhruva",
  "Vyaghata", "Harshana", "Vajra", "Siddhi", "Vyatipata", "Variyan",
  "Parigha", "Shiva", "Siddha", "Sadhya", "Shubha", "Shukla",
  "Brahma", "Indra", "Vaidhriti"
];

const karanaNames = [
  "Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija", "Vishti",
  "Shakuni", "Chatushpada", "Naga", "Kimstughna"
];

const weekdayData = {
  Sunday: { lord: "Sun (Surya)", color: "Red/Orange", deity: "Lord Surya" },
  Monday: { lord: "Moon (Chandra)", color: "White/Silver", deity: "Lord Shiva" },
  Tuesday: { lord: "Mars (Mangal)", color: "Red", deity: "Lord Hanuman" },
  Wednesday: { lord: "Mercury (Budh)", color: "Green", deity: "Lord Vishnu" },
  Thursday: { lord: "Jupiter (Guru)", color: "Yellow", deity: "Lord Brihaspati" },
  Friday: { lord: "Venus (Shukra)", color: "White/Pink", deity: "Goddess Lakshmi" },
  Saturday: { lord: "Saturn (Shani)", color: "Black/Blue", deity: "Lord Shani" },
};

interface PanchangData {
  date: string;
  weekday: string;
  tithi: string;
  tithiEndTime: string;
  nakshatra: string;
  nakshatraEndTime: string;
  yoga: string;
  yogaEndTime: string;
  karana: string;
  karanaEndTime: string;
  paksha: string;
  sunrise: string;
  sunset: string;
  moonrise: string;
  moonset: string;
  rahuKaal: string;
  yamaganda: string;
  gulikaKaal: string;
  abhijitMuhurat: string;
  amritKaal: string;
}

async function fetchPanchang(date: Date, location: string): Promise<PanchangData> {
  const dateStr = date.toISOString().split("T")[0];
  
  try {
    const response = await fetch("/api/calculate-panchang", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        date: dateStr,
        location: location,
      }),
    });
    
    if (!response.ok) {
      throw new Error("Failed to fetch panchang");
    }
    
    const data = await response.json();
    const weekday = data.weekday;
    
    const formatTime12 = (time24: string) => {
      if (!time24) return "N/A";
      const [h, m] = time24.split(":").map(Number);
      const ampm = h >= 12 ? "PM" : "AM";
      const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
      return `${displayH}:${m.toString().padStart(2, "0")} ${ampm}`;
    };
    
    const rahuKaalTimes: Record<string, number> = {
      Sunday: 16.5, Monday: 7.5, Tuesday: 15, Wednesday: 12,
      Thursday: 13.5, Friday: 10.5, Saturday: 9
    };
    const rahuKaalStart = rahuKaalTimes[weekday as string] || 12;
    
    const formatTimeFromHour = (hour: number) => {
      const h = Math.floor(hour);
      const m = Math.floor((hour - h) * 60);
      const ampm = h >= 12 ? "PM" : "AM";
      const displayH = h > 12 ? h - 12 : h;
      return `${displayH}:${m.toString().padStart(2, "0")} ${ampm}`;
    };
    
    const sunriseTime = formatTime12(data.sunrise);
    const sunsetTime = formatTime12(data.sunset);
    const moonriseTime = formatTime12(data.moonrise);
    const moonsetTime = formatTime12(data.moonset);
    const rahuStart = formatTime12(data.rahu_kaal?.start);
    const rahuEnd = formatTime12(data.rahu_kaal?.end);
    
    return {
      date: date.toLocaleDateString("en-IN", { 
        weekday: "long", 
        year: "numeric", 
        month: "long", 
        day: "numeric" 
      }),
      weekday,
      tithi: data.tithi?.name || "Calculating...",
      tithiEndTime: "Based on Moon-Sun angle",
      nakshatra: data.nakshatra?.name || "Calculating...",
      nakshatraEndTime: "Based on Moon position",
      yoga: data.yoga?.name || "Calculating...",
      yogaEndTime: "Based on Sun+Moon",
      karana: data.karana?.name || "Calculating...",
      karanaEndTime: "Half of Tithi",
      paksha: data.tithi?.paksha === "Shukla" ? "Shukla Paksha (Waxing Moon)" : "Krishna Paksha (Waning Moon)",
      sunrise: sunriseTime,
      sunset: sunsetTime,
      moonrise: moonriseTime,
      moonset: moonsetTime,
      rahuKaal: `${rahuStart} - ${rahuEnd}`,
      yamaganda: `${formatTimeFromHour(rahuKaalStart - 3)} - ${formatTimeFromHour(rahuKaalStart - 1.5)}`,
      gulikaKaal: `${formatTimeFromHour(rahuKaalStart + 3)} - ${formatTimeFromHour(rahuKaalStart + 4.5)}`,
      abhijitMuhurat: `${formatTimeFromHour(11.75)} - ${formatTimeFromHour(12.5)}`,
      amritKaal: "Based on Nakshatra",
    };
  } catch (error) {
    console.error("Error fetching panchang:", error);
    const weekday = date.toLocaleDateString("en-US", { weekday: "long" });
    return {
      date: date.toLocaleDateString("en-IN", { 
        weekday: "long", 
        year: "numeric", 
        month: "long", 
        day: "numeric" 
      }),
      weekday,
      tithi: "Unable to calculate",
      tithiEndTime: "N/A",
      nakshatra: "Unable to calculate",
      nakshatraEndTime: "N/A",
      yoga: "Unable to calculate",
      yogaEndTime: "N/A",
      karana: "Unable to calculate",
      karanaEndTime: "N/A",
      paksha: "N/A",
      sunrise: "N/A",
      sunset: "N/A",
      moonrise: "N/A",
      moonset: "N/A",
      rahuKaal: "N/A",
      yamaganda: "N/A",
      gulikaKaal: "N/A",
      abhijitMuhurat: "N/A",
      amritKaal: "N/A",
    };
  }
}

const choghadiyaData = [
  { name: "Udveg", nature: "Inauspicious", lord: "Sun", activities: "Avoid new beginnings" },
  { name: "Char", nature: "Good", lord: "Venus", activities: "Travel, moving" },
  { name: "Labh", nature: "Auspicious", lord: "Mercury", activities: "Business, profit" },
  { name: "Amrit", nature: "Most Auspicious", lord: "Moon", activities: "All good works" },
  { name: "Kaal", nature: "Inauspicious", lord: "Saturn", activities: "Avoid important work" },
  { name: "Shubh", nature: "Auspicious", lord: "Jupiter", activities: "Religious activities" },
  { name: "Rog", nature: "Inauspicious", lord: "Mars", activities: "Avoid health matters" },
];

export default function PanchangPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [location, setLocation] = useState("New Delhi, India");
  const [panchang, setPanchang] = useState<PanchangData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadPanchang = async () => {
      setIsLoading(true);
      const data = await fetchPanchang(selectedDate, location);
      setPanchang(data);
      setIsLoading(false);
    };
    loadPanchang();
  }, [selectedDate, location]);

  const weekdayInfo = panchang ? weekdayData[panchang.weekday as keyof typeof weekdayData] : null;

  return (
    <div className="py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-amber-100 text-amber-800">Hindu Calendar</Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Daily Panchang - Hindu Calendar
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Get accurate daily Panchang with Tithi, Nakshatra, Yoga, Karana, Rahu Kaal, 
            and auspicious timings. Plan your day according to Vedic astrology.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <Card className="border-amber-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-600" />
                Select Date
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={selectedDate.toISOString().split("T")[0]}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Location
                </Label>
                <LocationInput
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onLocationSelect={(loc) => setLocation(loc)}
                  placeholder="Search city..."
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDate(new Date(selectedDate.getTime() - 86400000))}
                >
                  Previous Day
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDate(new Date())}
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDate(new Date(selectedDate.getTime() + 86400000))}
                >
                  Next Day
                </Button>
              </div>
            </CardContent>
          </Card>

          {panchang && (
            <>
              <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sun className="w-5 h-5 text-amber-600" />
                    {panchang.date}
                  </CardTitle>
                  <CardDescription>
                    {panchang.weekday} | {weekdayInfo?.lord}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Paksha</span>
                      <span className="font-medium">{panchang.paksha}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Lucky Color</span>
                      <span className="font-medium">{weekdayInfo?.color}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Ruling Deity</span>
                      <span className="font-medium">{weekdayInfo?.deity}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-amber-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sunrise className="w-5 h-5 text-orange-500" />
                    Sun & Moon Timings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 flex items-center gap-2">
                        <Sunrise className="w-4 h-4" /> Sunrise
                      </span>
                      <span className="font-medium">{panchang.sunrise}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 flex items-center gap-2">
                        <Sunset className="w-4 h-4" /> Sunset
                      </span>
                      <span className="font-medium">{panchang.sunset}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 flex items-center gap-2">
                        <Moon className="w-4 h-4" /> Moonrise
                      </span>
                      <span className="font-medium">{panchang.moonrise}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 flex items-center gap-2">
                        <Moon className="w-4 h-4" /> Moonset
                      </span>
                      <span className="font-medium">{panchang.moonset}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {panchang && (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="border-purple-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Moon className="w-5 h-5 text-purple-600" />
                    Tithi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-purple-700">{panchang.tithi}</p>
                  <p className="text-sm text-gray-500">Until {panchang.tithiEndTime}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    Tithi is the lunar day based on Moon&apos;s position relative to Sun
                  </p>
                </CardContent>
              </Card>

              <Card className="border-blue-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Star className="w-5 h-5 text-blue-600" />
                    Nakshatra
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-blue-700">{panchang.nakshatra}</p>
                  <p className="text-sm text-gray-500">Until {panchang.nakshatraEndTime}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    Nakshatra is the lunar mansion Moon is transiting
                  </p>
                </CardContent>
              </Card>

              <Card className="border-green-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sun className="w-5 h-5 text-green-600" />
                    Yoga
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-green-700">{panchang.yoga}</p>
                  <p className="text-sm text-gray-500">Until {panchang.yogaEndTime}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    Yoga is calculated from Sun and Moon longitudes
                  </p>
                </CardContent>
              </Card>

              <Card className="border-orange-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="w-5 h-5 text-orange-600" />
                    Karana
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-orange-700">{panchang.karana}</p>
                  <p className="text-sm text-gray-500">Until {panchang.karanaEndTime}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    Karana is half of a Tithi, important for muhurat
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-700">
                    <AlertTriangle className="w-5 h-5" />
                    Inauspicious Timings (Avoid)
                  </CardTitle>
                  <CardDescription>
                    Avoid starting new ventures during these periods
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-red-50 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-red-800">Rahu Kaal</p>
                          <p className="text-sm text-red-600">Most inauspicious period</p>
                        </div>
                        <Badge variant="destructive">{panchang.rahuKaal}</Badge>
                      </div>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-orange-800">Yamaganda</p>
                          <p className="text-sm text-orange-600">Avoid important decisions</p>
                        </div>
                        <Badge className="bg-orange-500">{panchang.yamaganda}</Badge>
                      </div>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-yellow-800">Gulika Kaal</p>
                          <p className="text-sm text-yellow-600">Avoid new beginnings</p>
                        </div>
                        <Badge className="bg-yellow-500 text-yellow-900">{panchang.gulikaKaal}</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="w-5 h-5" />
                    Auspicious Timings (Recommended)
                  </CardTitle>
                  <CardDescription>
                    Best times for important activities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-green-800">Abhijit Muhurat</p>
                          <p className="text-sm text-green-600">Most auspicious time of day</p>
                        </div>
                        <Badge className="bg-green-500">{panchang.abhijitMuhurat}</Badge>
                      </div>
                    </div>
                    <div className="bg-emerald-50 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-emerald-800">Amrit Kaal</p>
                          <p className="text-sm text-emerald-600">Excellent for all activities</p>
                        </div>
                        <Badge className="bg-emerald-500">{panchang.amritKaal}</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-amber-200 mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-600" />
                  Choghadiya - Hourly Auspicious Timings
                </CardTitle>
                <CardDescription>
                  Choghadiya divides the day into auspicious and inauspicious periods
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {choghadiyaData.map((chog, index) => (
                    <div
                      key={chog.name}
                      className={`rounded-lg p-4 ${
                        chog.nature === "Most Auspicious"
                          ? "bg-green-100 border border-green-300"
                          : chog.nature === "Auspicious"
                          ? "bg-emerald-50 border border-emerald-200"
                          : chog.nature === "Good"
                          ? "bg-blue-50 border border-blue-200"
                          : "bg-red-50 border border-red-200"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">{chog.name}</span>
                        <Badge
                          className={
                            chog.nature === "Most Auspicious" || chog.nature === "Auspicious"
                              ? "bg-green-500"
                              : chog.nature === "Good"
                              ? "bg-blue-500"
                              : "bg-red-500"
                          }
                        >
                          {chog.nature}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">Lord: {chog.lord}</p>
                      <p className="text-xs text-gray-500 mt-1">{chog.activities}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-amber-200 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-2">Festival Calendar 2026</h3>
              <p className="text-gray-600 text-sm mb-4">
                Complete list of Hindu festivals, fasts, and important dates for 2026.
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/festival-calendar-2026">
                  View Festivals <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-amber-200 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-2">Muhurat Finder</h3>
              <p className="text-gray-600 text-sm mb-4">
                Find auspicious timings for marriage, griha pravesh, and other events.
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/tools/kundli-calculator">
                  Find Muhurat <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-amber-200 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-2">Daily Horoscope</h3>
              <p className="text-gray-600 text-sm mb-4">
                Read your personalized daily horoscope based on your zodiac sign.
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/daily-horoscope">
                  Read Horoscope <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Understanding Panchang - The Hindu Almanac
            </h2>
            <div className="prose prose-amber max-w-none">
              <p className="text-gray-700 mb-4">
                Panchang, derived from Sanskrit words &quot;Pancha&quot; (five) and &quot;Anga&quot; (limbs), 
                is the traditional Hindu calendar system that provides five essential elements for 
                determining auspicious timings. These five elements are Tithi (lunar day), Nakshatra 
                (lunar mansion), Yoga (luni-solar day), Karana (half of tithi), and Vara (weekday).
              </p>
              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">The Five Elements of Panchang</h3>
              <p className="text-gray-700 mb-4">
                <strong>Tithi:</strong> The lunar day calculated based on the angular distance between 
                the Sun and Moon. There are 30 tithis in a lunar month, 15 in each paksha (fortnight).
              </p>
              <p className="text-gray-700 mb-4">
                <strong>Nakshatra:</strong> The 27 lunar mansions through which the Moon travels. 
                Each nakshatra spans 13°20&apos; of the zodiac and has unique characteristics.
              </p>
              <p className="text-gray-700 mb-4">
                <strong>Yoga:</strong> One of 27 yogas formed by the combined longitudes of Sun and Moon. 
                Each yoga has specific qualities affecting the day&apos;s auspiciousness.
              </p>
              <p className="text-gray-700 mb-4">
                <strong>Karana:</strong> Half of a tithi, there are 11 karanas that repeat in a specific 
                pattern. Karanas are important for determining muhurat timings.
              </p>
              <p className="text-gray-700 mb-4">
                <strong>Vara:</strong> The weekday, each ruled by a specific planet and deity, 
                influencing the nature of activities suitable for that day.
              </p>
              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Importance of Rahu Kaal</h3>
              <p className="text-gray-700">
                Rahu Kaal is considered the most inauspicious period of the day, ruled by the shadow 
                planet Rahu. It is calculated based on sunrise and varies for each day of the week. 
                Starting new ventures, signing contracts, or beginning journeys during Rahu Kaal is 
                traditionally avoided in Vedic astrology.
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
            "@type": "WebApplication",
            name: "Daily Panchang Calculator",
            description: "Get accurate daily Panchang with Tithi, Nakshatra, Yoga, Karana, Rahu Kaal and auspicious timings",
            url: "https://vedicstarastro.com/panchang",
            applicationCategory: "LifestyleApplication",
            operatingSystem: "Web",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "INR",
            },
          }),
        }}
      />
    </div>
  );
}
