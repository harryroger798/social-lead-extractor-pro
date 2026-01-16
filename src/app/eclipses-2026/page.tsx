import { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Calendar,
  Moon,
  Sun,
  AlertTriangle,
  MapPin,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Solar & Lunar Eclipses 2026 - Dates, Timings & Effects | VedicStarAstro",
  description: "Complete guide to Solar and Lunar Eclipses in 2026. Learn eclipse dates, visibility, astrological effects on zodiac signs, and important dos and don'ts.",
  keywords: [
    "eclipse 2026",
    "solar eclipse 2026",
    "lunar eclipse 2026",
    "surya grahan 2026",
    "chandra grahan 2026",
    "eclipse dates 2026",
  ],
};

const eclipses2026 = [
  {
    type: "Total Lunar Eclipse",
    hindi: "पूर्ण चंद्र ग्रहण",
    date: "March 3, 2026",
    time: "05:33 - 09:27 UTC",
    sign: "Virgo",
    nakshatra: "Uttara Phalguni",
    visibility: ["Americas", "Europe", "Africa", "Western Asia"],
    duration: "58 minutes (totality)",
    description: "The first eclipse of 2026 is a total lunar eclipse visible across the Americas, Europe, and Africa. The Moon will turn a deep red color during totality.",
    effects: "Emotional intensity, health matters surface, service-related changes, analytical insights.",
  },
  {
    type: "Partial Solar Eclipse",
    hindi: "आंशिक सूर्य ग्रहण",
    date: "March 17, 2026",
    time: "04:51 - 08:45 UTC",
    sign: "Pisces",
    nakshatra: "Uttara Bhadrapada",
    visibility: ["Northern Europe", "Northern Asia", "Northern North America"],
    duration: "Maximum coverage 94%",
    description: "A partial solar eclipse visible from northern regions. The Moon will cover up to 94% of the Sun's disk at maximum.",
    effects: "Spiritual awakening, endings and completions, hidden matters revealed, intuitive insights.",
  },
  {
    type: "Total Lunar Eclipse",
    hindi: "पूर्ण चंद्र ग्रहण",
    date: "August 28, 2026",
    time: "02:23 - 06:17 UTC",
    sign: "Aquarius",
    nakshatra: "Shatabhisha",
    visibility: ["Americas", "Europe", "Africa", "Middle East"],
    duration: "63 minutes (totality)",
    description: "The second total lunar eclipse of 2026, visible across much of the world. This is one of the longer total lunar eclipses.",
    effects: "Social changes, humanitarian concerns, technology disruptions, group dynamics shift.",
  },
  {
    type: "Annular Solar Eclipse",
    hindi: "वलयाकार सूर्य ग्रहण",
    date: "September 12, 2026",
    time: "14:23 - 18:17 UTC",
    sign: "Virgo",
    nakshatra: "Hasta",
    visibility: ["South America", "Atlantic Ocean", "Antarctica"],
    duration: "Ring of fire visible for 2 min 18 sec",
    description: "An annular solar eclipse creating a 'ring of fire' effect. The path of annularity crosses South America and the Atlantic.",
    effects: "Health focus, work changes, service improvements, analytical breakthroughs, skill development.",
  },
];

const eclipseDosAndDonts = {
  dos: [
    "Chant mantras and prayers during eclipse",
    "Take a bath before and after eclipse",
    "Meditate and practice spiritual activities",
    "Donate food and clothes after eclipse",
    "Keep tulsi leaves in food items",
    "Pregnant women should rest and chant mantras",
    "Clean your home after eclipse ends",
    "Offer water to the Sun after solar eclipse",
  ],
  donts: [
    "Avoid eating during eclipse (Sutak period)",
    "Don't start new ventures or sign contracts",
    "Avoid traveling during eclipse",
    "Don't look directly at solar eclipse",
    "Avoid cooking during eclipse",
    "Don't make important decisions",
    "Avoid sleeping during eclipse",
    "Don't use sharp objects",
  ],
};

const signEffects = [
  { sign: "Aries", effect: "Health and service matters highlighted. Focus on daily routines and wellness practices." },
  { sign: "Taurus", effect: "Creativity and romance affected. Children matters need attention. Speculative activities risky." },
  { sign: "Gemini", effect: "Home and family matters surface. Property decisions need careful thought. Emotional foundations shift." },
  { sign: "Cancer", effect: "Communication and siblings highlighted. Short travels affected. Learning opportunities arise." },
  { sign: "Leo", effect: "Finances and values in focus. Income sources may change. Self-worth matters surface." },
  { sign: "Virgo", effect: "Personal identity and self-expression highlighted. New beginnings possible. Health focus important." },
  { sign: "Libra", effect: "Hidden matters and spirituality emphasized. Rest and retreat beneficial. Past karma surfaces." },
  { sign: "Scorpio", effect: "Social circles and friendships affected. Group activities change. Long-term goals reassessed." },
  { sign: "Sagittarius", effect: "Career and public image highlighted. Professional changes possible. Authority matters surface." },
  { sign: "Capricorn", effect: "Higher learning and travel affected. Philosophical views shift. Legal matters need attention." },
  { sign: "Aquarius", effect: "Transformation and shared resources highlighted. Joint finances need review. Deep changes occur." },
  { sign: "Pisces", effect: "Partnerships and relationships in focus. Marriage matters highlighted. Contracts need review." },
];

export default function Eclipses2026Page() {
  return (
    <div className="py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-indigo-100 text-indigo-800">Celestial Events</Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Solar & Lunar Eclipses 2026
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Complete guide to all eclipses in 2026. Learn dates, timings, visibility, 
            astrological effects, and important dos and don&apos;ts during Grahan.
          </p>
        </div>

        <Card className="border-indigo-200 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              2026 Eclipse Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-amber-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Sun className="w-6 h-6 text-amber-500" />
                  <h3 className="font-semibold text-amber-800">Solar Eclipses (Surya Grahan)</h3>
                </div>
                <p className="text-amber-700 mb-2">2 Solar Eclipses in 2026:</p>
                <ul className="text-sm text-amber-600 space-y-1">
                  <li>• March 17 - Partial Solar Eclipse</li>
                  <li>• September 12 - Annular Solar Eclipse</li>
                </ul>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Moon className="w-6 h-6 text-blue-500" />
                  <h3 className="font-semibold text-blue-800">Lunar Eclipses (Chandra Grahan)</h3>
                </div>
                <p className="text-blue-700 mb-2">2 Lunar Eclipses in 2026:</p>
                <ul className="text-sm text-blue-600 space-y-1">
                  <li>• March 3 - Total Lunar Eclipse</li>
                  <li>• August 28 - Total Lunar Eclipse</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">Detailed Eclipse Information</h2>
        
        <div className="space-y-6 mb-12">
          {eclipses2026.map((eclipse, index) => (
            <Card 
              key={index} 
              className={`border-2 ${
                eclipse.type.includes("Solar") ? "border-amber-200" : "border-blue-200"
              }`}
            >
              <CardHeader className={eclipse.type.includes("Solar") ? "bg-amber-50" : "bg-blue-50"}>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    {eclipse.type.includes("Solar") ? (
                      <Sun className="w-8 h-8 text-amber-500" />
                    ) : (
                      <Moon className="w-8 h-8 text-blue-500" />
                    )}
                    <div>
                      <CardTitle className="text-xl">{eclipse.type}</CardTitle>
                      <CardDescription className="text-base">{eclipse.hindi}</CardDescription>
                    </div>
                  </div>
                  <Badge className={eclipse.type.includes("Solar") ? "bg-amber-500" : "bg-blue-500"}>
                    {eclipse.date}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Eclipse Details</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="bg-gray-50 rounded p-2">
                          <span className="text-gray-600">Time (UTC):</span>
                          <p className="font-medium">{eclipse.time}</p>
                        </div>
                        <div className="bg-gray-50 rounded p-2">
                          <span className="text-gray-600">Duration:</span>
                          <p className="font-medium">{eclipse.duration}</p>
                        </div>
                        <div className="bg-gray-50 rounded p-2">
                          <span className="text-gray-600">Zodiac Sign:</span>
                          <p className="font-medium">{eclipse.sign}</p>
                        </div>
                        <div className="bg-gray-50 rounded p-2">
                          <span className="text-gray-600">Nakshatra:</span>
                          <p className="font-medium">{eclipse.nakshatra}</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <MapPin className="w-4 h-4" /> Visibility
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {eclipse.visibility.map((region) => (
                          <Badge key={region} variant="outline" className="text-xs">
                            {region}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                      <p className="text-sm text-gray-700">{eclipse.description}</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3">
                      <h4 className="font-semibold text-purple-800 mb-1">Astrological Effects</h4>
                      <p className="text-sm text-purple-700">{eclipse.effects}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="border-green-200">
            <CardHeader className="bg-green-50">
              <CardTitle className="text-green-800">Do&apos;s During Eclipse</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="space-y-2">
                {eclipseDosAndDonts.dos.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-red-200">
            <CardHeader className="bg-red-50">
              <CardTitle className="text-red-800">Don&apos;ts During Eclipse</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="space-y-2">
                {eclipseDosAndDonts.donts.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-red-500 mt-0.5">✗</span>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card className="border-amber-200 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              Eclipse Effects by Zodiac Sign
            </CardTitle>
            <CardDescription>
              How the 2026 eclipses affect each zodiac sign
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {signEffects.map((item) => (
                <div key={item.sign} className="bg-gray-50 rounded-lg p-3">
                  <h4 className="font-semibold text-gray-900 mb-1">{item.sign}</h4>
                  <p className="text-xs text-gray-600">{item.effect}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="border-amber-200 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-2">2026 Horoscope</h3>
              <p className="text-gray-600 text-sm mb-4">
                Complete yearly predictions for your sign.
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
              <h3 className="font-semibold text-lg mb-2">Festival Calendar 2026</h3>
              <p className="text-gray-600 text-sm mb-4">
                All Hindu festivals and important dates.
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/festival-calendar-2026">
                  View Calendar <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-amber-200 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-2">Daily Panchang</h3>
              <p className="text-gray-600 text-sm mb-4">
                Check today&apos;s auspicious timings.
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/panchang">
                  View Panchang <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="border-indigo-200 bg-indigo-50 mt-12">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Understanding Eclipses in Vedic Astrology
            </h2>
            <div className="prose prose-indigo max-w-none">
              <p className="text-gray-700 mb-4">
                In Vedic astrology, eclipses (Grahan) are considered powerful cosmic events 
                that can trigger significant changes in our lives. Solar eclipses (Surya Grahan) 
                occur during New Moon when the Moon blocks the Sun, while lunar eclipses 
                (Chandra Grahan) occur during Full Moon when Earth&apos;s shadow falls on the Moon.
              </p>
              <p className="text-gray-700 mb-4">
                Eclipses are associated with the shadow planets Rahu and Ketu. Rahu causes 
                solar eclipses by &quot;swallowing&quot; the Sun, while Ketu causes lunar eclipses. 
                The effects of an eclipse are felt most strongly in the zodiac sign where 
                it occurs and in the houses it activates in your birth chart.
              </p>
              <p className="text-gray-700">
                The period before and after an eclipse is called Sutak, during which certain 
                activities are traditionally avoided. However, this is also considered an 
                auspicious time for spiritual practices, meditation, and mantra chanting. 
                The energy of an eclipse can be harnessed for positive transformation when 
                approached with awareness and intention.
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
            headline: "Solar & Lunar Eclipses 2026 - Complete Guide",
            description: "Complete guide to all eclipses in 2026 with dates, timings, and effects",
            author: {
              "@type": "Organization",
              name: "VedicStarAstro",
            },
            datePublished: "2025-12-01",
          }),
        }}
      />
    </div>
  );
}
