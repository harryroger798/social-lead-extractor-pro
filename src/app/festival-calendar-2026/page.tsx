"use client";

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
import { getCurrentYear, withCurrentYear } from "@/lib/utils";

export default function FestivalCalendar2026Page() {
  const { t } = useLanguage();

  const festivals2026 = [
    {
      month: t('festivalCalendar.month.january2026', 'January 2026'),
      festivals: [
        { name: t('festivalCalendar.festival.lohri.name', 'Lohri'), date: "January 13, 2026", type: t('festivalCalendar.type.regional', 'Regional'), typeKey: 'regional', description: t('festivalCalendar.festival.lohri.desc', 'Punjabi harvest festival celebrated with bonfires') },
        { name: t('festivalCalendar.festival.makarSankranti.name', 'Makar Sankranti'), date: "January 14, 2026", type: t('festivalCalendar.type.major', 'Major'), typeKey: 'major', description: t('festivalCalendar.festival.makarSankranti.desc', 'Sun enters Capricorn, kite flying festival') },
        { name: t('festivalCalendar.festival.pongal.name', 'Pongal'), date: "January 14-17, 2026", type: t('festivalCalendar.type.regional', 'Regional'), typeKey: 'regional', description: t('festivalCalendar.festival.pongal.desc', 'Tamil harvest festival spanning four days') },
        { name: t('festivalCalendar.festival.republicDay.name', 'Republic Day'), date: "January 26, 2026", type: t('festivalCalendar.type.national', 'National'), typeKey: 'national', description: t('festivalCalendar.festival.republicDay.desc', 'National holiday celebrating Indian constitution') },
        { name: t('festivalCalendar.festival.basantPanchami.name', 'Basant Panchami'), date: "January 29, 2026", type: t('festivalCalendar.type.major', 'Major'), typeKey: 'major', description: t('festivalCalendar.festival.basantPanchami.desc', 'Worship of Goddess Saraswati, arrival of spring') },
      ],
    },
    {
      month: t('festivalCalendar.month.february2026', 'February 2026'),
      festivals: [
        { name: t('festivalCalendar.festival.mahaShivaratri.name', 'Maha Shivaratri'), date: "February 26, 2026", type: t('festivalCalendar.type.major', 'Major'), typeKey: 'major', description: t('festivalCalendar.festival.mahaShivaratri.desc', 'Night of Lord Shiva, fasting and night vigil') },
      ],
    },
    {
      month: t('festivalCalendar.month.march2026', 'March 2026'),
      festivals: [
        { name: t('festivalCalendar.festival.holikaDahan.name', 'Holika Dahan'), date: "March 13, 2026", type: t('festivalCalendar.type.major', 'Major'), typeKey: 'major', description: t('festivalCalendar.festival.holikaDahan.desc', 'Burning of Holika, victory of good over evil') },
        { name: t('festivalCalendar.festival.holi.name', 'Holi'), date: "March 14, 2026", type: t('festivalCalendar.type.major', 'Major'), typeKey: 'major', description: t('festivalCalendar.festival.holi.desc', 'Festival of colors celebrating spring') },
        { name: t('festivalCalendar.festival.chaitraNavratri.name', 'Chaitra Navratri Begins'), date: "March 29, 2026", type: t('festivalCalendar.type.major', 'Major'), typeKey: 'major', description: t('festivalCalendar.festival.chaitraNavratri.desc', 'Nine nights of Goddess Durga worship') },
      ],
    },
    {
      month: t('festivalCalendar.month.april2026', 'April 2026'),
      festivals: [
        { name: t('festivalCalendar.festival.ugadiGudiPadwa.name', 'Ugadi / Gudi Padwa'), date: "March 29, 2026", type: t('festivalCalendar.type.regional', 'Regional'), typeKey: 'regional', description: t('festivalCalendar.festival.ugadiGudiPadwa.desc', 'Telugu and Marathi New Year') },
        { name: t('festivalCalendar.festival.ramNavami.name', 'Ram Navami'), date: "April 6, 2026", type: t('festivalCalendar.type.major', 'Major'), typeKey: 'major', description: t('festivalCalendar.festival.ramNavami.desc', 'Birth anniversary of Lord Rama') },
        { name: t('festivalCalendar.festival.mahavirJayanti.name', 'Mahavir Jayanti'), date: "April 13, 2026", type: t('festivalCalendar.type.major', 'Major'), typeKey: 'major', description: t('festivalCalendar.festival.mahavirJayanti.desc', 'Birth anniversary of Lord Mahavira') },
        { name: t('festivalCalendar.festival.goodFriday.name', 'Good Friday'), date: "April 3, 2026", type: t('festivalCalendar.type.national', 'National'), typeKey: 'national', description: t('festivalCalendar.festival.goodFriday.desc', 'Christian observance') },
        { name: t('festivalCalendar.festival.hanumanJayanti.name', 'Hanuman Jayanti'), date: "April 14, 2026", type: t('festivalCalendar.type.major', 'Major'), typeKey: 'major', description: t('festivalCalendar.festival.hanumanJayanti.desc', 'Birth anniversary of Lord Hanuman') },
        { name: t('festivalCalendar.festival.baisakhi.name', 'Baisakhi'), date: "April 14, 2026", type: t('festivalCalendar.type.regional', 'Regional'), typeKey: 'regional', description: t('festivalCalendar.festival.baisakhi.desc', 'Punjabi New Year and harvest festival') },
      ],
    },
    {
      month: t('festivalCalendar.month.may2026', 'May 2026'),
      festivals: [
        { name: t('festivalCalendar.festival.buddhaPurnima.name', 'Buddha Purnima'), date: "May 12, 2026", type: t('festivalCalendar.type.major', 'Major'), typeKey: 'major', description: t('festivalCalendar.festival.buddhaPurnima.desc', 'Birth anniversary of Gautama Buddha') },
        { name: t('festivalCalendar.festival.akshayaTritiya.name', 'Akshaya Tritiya'), date: "May 1, 2026", type: t('festivalCalendar.type.major', 'Major'), typeKey: 'major', description: t('festivalCalendar.festival.akshayaTritiya.desc', 'Auspicious day for new beginnings and gold purchase') },
      ],
    },
    {
      month: t('festivalCalendar.month.june2026', 'June 2026'),
      festivals: [
        { name: t('festivalCalendar.festival.gangaDussehra.name', 'Ganga Dussehra'), date: "June 7, 2026", type: t('festivalCalendar.type.regional', 'Regional'), typeKey: 'regional', description: t('festivalCalendar.festival.gangaDussehra.desc', 'Descent of River Ganga to Earth') },
        { name: t('festivalCalendar.festival.nirjalaEkadashi.name', 'Nirjala Ekadashi'), date: "June 8, 2026", type: t('festivalCalendar.type.vrat', 'Vrat'), typeKey: 'vrat', description: t('festivalCalendar.festival.nirjalaEkadashi.desc', 'Strictest Ekadashi fast without water') },
      ],
    },
    {
      month: t('festivalCalendar.month.july2026', 'July 2026'),
      festivals: [
        { name: t('festivalCalendar.festival.guruPurnima.name', 'Guru Purnima'), date: "July 10, 2026", type: t('festivalCalendar.type.major', 'Major'), typeKey: 'major', description: t('festivalCalendar.festival.guruPurnima.desc', 'Day to honor spiritual teachers') },
        { name: t('festivalCalendar.festival.eidUlAdha.name', 'Eid ul-Adha'), date: "July 7, 2026", type: t('festivalCalendar.type.national', 'National'), typeKey: 'national', description: t('festivalCalendar.festival.eidUlAdha.desc', 'Islamic festival of sacrifice') },
      ],
    },
    {
      month: t('festivalCalendar.month.august2026', 'August 2026'),
      festivals: [
        { name: t('festivalCalendar.festival.nagPanchami.name', 'Nag Panchami'), date: "August 1, 2026", type: t('festivalCalendar.type.major', 'Major'), typeKey: 'major', description: t('festivalCalendar.festival.nagPanchami.desc', 'Worship of serpent deities') },
        { name: t('festivalCalendar.festival.rakshaBandhan.name', 'Raksha Bandhan'), date: "August 9, 2026", type: t('festivalCalendar.type.major', 'Major'), typeKey: 'major', description: t('festivalCalendar.festival.rakshaBandhan.desc', 'Festival celebrating brother-sister bond') },
        { name: t('festivalCalendar.festival.independenceDay.name', 'Independence Day'), date: "August 15, 2026", type: t('festivalCalendar.type.national', 'National'), typeKey: 'national', description: t('festivalCalendar.festival.independenceDay.desc', 'Indian Independence Day') },
        { name: t('festivalCalendar.festival.krishnaJanmashtami.name', 'Krishna Janmashtami'), date: "August 22, 2026", type: t('festivalCalendar.type.major', 'Major'), typeKey: 'major', description: t('festivalCalendar.festival.janmashtami.desc', 'Birth anniversary of Lord Krishna') },
        { name: t('festivalCalendar.festival.ganeshChaturthi.name', 'Ganesh Chaturthi'), date: "August 27, 2026", type: t('festivalCalendar.type.major', 'Major'), typeKey: 'major', description: t('festivalCalendar.festival.ganeshChaturthi.desc', 'Birth of Lord Ganesha, 10-day celebration') },
      ],
    },
    {
      month: t('festivalCalendar.month.september2026', 'September 2026'),
      festivals: [
        { name: t('festivalCalendar.festival.anantChaturdashi.name', 'Anant Chaturdashi'), date: "September 5, 2026", type: t('festivalCalendar.type.major', 'Major'), typeKey: 'major', description: t('festivalCalendar.festival.anantChaturdashi.desc', 'Ganesh Visarjan day') },
        { name: t('festivalCalendar.festival.onam.name', 'Onam'), date: "September 4, 2026", type: t('festivalCalendar.type.regional', 'Regional'), typeKey: 'regional', description: t('festivalCalendar.festival.onam.desc', 'Kerala harvest festival') },
        { name: t('festivalCalendar.festival.pitruPaksha.name', 'Pitru Paksha Begins'), date: "September 7, 2026", type: t('festivalCalendar.type.vrat', 'Vrat'), typeKey: 'vrat', description: t('festivalCalendar.festival.pitruPaksha.desc', '16-day period for ancestor worship') },
      ],
    },
    {
      month: t('festivalCalendar.month.october2026', 'October 2026'),
      festivals: [
        { name: t('festivalCalendar.festival.sharadNavratri.name', 'Sharad Navratri Begins'), date: "September 22, 2026", type: t('festivalCalendar.type.major', 'Major'), typeKey: 'major', description: t('festivalCalendar.festival.sharadNavratri.desc', 'Nine nights of Goddess Durga worship') },
        { name: t('festivalCalendar.festival.durgaAshtami.name', 'Durga Ashtami'), date: "September 29, 2026", type: t('festivalCalendar.type.major', 'Major'), typeKey: 'major', description: t('festivalCalendar.festival.durgaAshtami.desc', 'Eighth day of Navratri') },
        { name: t('festivalCalendar.festival.mahaNavami.name', 'Maha Navami'), date: "September 30, 2026", type: t('festivalCalendar.type.major', 'Major'), typeKey: 'major', description: t('festivalCalendar.festival.mahaNavami.desc', 'Ninth day of Navratri') },
        { name: t('festivalCalendar.festival.dussehra.name', 'Dussehra / Vijayadashami'), date: "October 1, 2026", type: t('festivalCalendar.type.major', 'Major'), typeKey: 'major', description: t('festivalCalendar.festival.dussehra.desc', 'Victory of good over evil, Ravana Dahan') },
        { name: t('festivalCalendar.festival.karwaChauth.name', 'Karwa Chauth'), date: "October 12, 2026", type: t('festivalCalendar.type.vrat', 'Vrat'), typeKey: 'vrat', description: t('festivalCalendar.festival.karwaChauth.desc', 'Married women fast for husband\'s longevity') },
        { name: t('festivalCalendar.festival.dhanteras.name', 'Dhanteras'), date: "October 18, 2026", type: t('festivalCalendar.type.major', 'Major'), typeKey: 'major', description: t('festivalCalendar.festival.dhanteras.desc', 'First day of Diwali, worship of wealth') },
        { name: t('festivalCalendar.festival.narakChaturdashi.name', 'Narak Chaturdashi'), date: "October 19, 2026", type: t('festivalCalendar.type.major', 'Major'), typeKey: 'major', description: t('festivalCalendar.festival.narakChaturdashi.desc', 'Second day of Diwali') },
        { name: t('festivalCalendar.festival.diwali.name', 'Diwali / Lakshmi Puja'), date: "October 20, 2026", type: t('festivalCalendar.type.major', 'Major'), typeKey: 'major', description: t('festivalCalendar.festival.diwali.desc', 'Festival of lights, worship of Goddess Lakshmi') },
        { name: t('festivalCalendar.festival.govardhanPuja.name', 'Govardhan Puja'), date: "October 21, 2026", type: t('festivalCalendar.type.major', 'Major'), typeKey: 'major', description: t('festivalCalendar.festival.govardhanPuja.desc', 'Fourth day of Diwali') },
        { name: t('festivalCalendar.festival.bhaiDooj.name', 'Bhai Dooj'), date: "October 22, 2026", type: t('festivalCalendar.type.major', 'Major'), typeKey: 'major', description: t('festivalCalendar.festival.bhaiDooj.desc', 'Fifth day of Diwali, brother-sister celebration') },
        { name: t('festivalCalendar.festival.chhathPuja.name', 'Chhath Puja'), date: "October 26, 2026", type: t('festivalCalendar.type.regional', 'Regional'), typeKey: 'regional', description: t('festivalCalendar.festival.chhathPuja.desc', 'Sun worship festival, mainly in Bihar') },
      ],
    },
    {
      month: t('festivalCalendar.month.november2026', 'November 2026'),
      festivals: [
        { name: t('festivalCalendar.festival.devDiwali.name', 'Dev Diwali'), date: "November 4, 2026", type: t('festivalCalendar.type.regional', 'Regional'), typeKey: 'regional', description: t('festivalCalendar.festival.devDiwali.desc', 'Diwali of the Gods in Varanasi') },
        { name: t('festivalCalendar.festival.tulsiVivah.name', 'Tulsi Vivah'), date: "November 8, 2026", type: t('festivalCalendar.type.vrat', 'Vrat'), typeKey: 'vrat', description: t('festivalCalendar.festival.tulsiVivah.desc', 'Ceremonial marriage of Tulsi plant to Lord Vishnu') },
        { name: t('festivalCalendar.festival.guruNanakJayanti.name', 'Guru Nanak Jayanti'), date: "November 15, 2026", type: t('festivalCalendar.type.major', 'Major'), typeKey: 'major', description: t('festivalCalendar.festival.guruNanakJayanti.desc', 'Birth anniversary of Guru Nanak Dev Ji') },
      ],
    },
    {
      month: t('festivalCalendar.month.december2026', 'December 2026'),
      festivals: [
        { name: t('festivalCalendar.festival.gitaJayanti.name', 'Gita Jayanti'), date: "December 1, 2026", type: t('festivalCalendar.type.major', 'Major'), typeKey: 'major', description: t('festivalCalendar.festival.gitaJayanti.desc', 'Day Bhagavad Gita was revealed') },
        { name: t('festivalCalendar.festival.christmas.name', 'Christmas'), date: "December 25, 2026", type: t('festivalCalendar.type.national', 'National'), typeKey: 'national', description: t('festivalCalendar.festival.christmas.desc', 'Christian celebration of Jesus Christ\'s birth') },
      ],
    },
  ];

  const upcomingEclipses = [
    { type: t('festivalCalendar.eclipse.totalLunar', 'Total Lunar Eclipse'), date: "March 14, 2026", visibility: t('festivalCalendar.eclipse.visibleIndia', 'Visible in India'), isLunar: true },
    { type: t('festivalCalendar.eclipse.partialSolar', 'Partial Solar Eclipse'), date: "March 29, 2026", visibility: t('festivalCalendar.eclipse.notVisibleIndia', 'Not visible in India'), isLunar: false },
    { type: t('festivalCalendar.eclipse.totalLunar', 'Total Lunar Eclipse'), date: "September 7, 2026", visibility: t('festivalCalendar.eclipse.visibleIndia', 'Visible in India'), isLunar: true },
    { type: t('festivalCalendar.eclipse.annularSolar', 'Annular Solar Eclipse'), date: "September 22, 2026", visibility: t('festivalCalendar.eclipse.partiallyVisibleIndia', 'Partially visible in India'), isLunar: false },
  ];
  return (
    <div className="py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-amber-100 text-amber-800">{t('festivalCalendar.badge', {year} Calendar')}</Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {t('festivalCalendar.title', 'Hindu Festival Calendar {year}')}
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {t('festivalCalendar.subtitle', 'Complete list of Hindu festivals, fasts, and important dates for {year}. Plan your celebrations with accurate dates and timings.')}
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6 mb-12">
          <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
            <CardContent className="pt-6 text-center">
              <Calendar className="w-12 h-12 mx-auto text-amber-600 mb-3" />
              <h3 className="text-3xl font-bold text-amber-700">100+</h3>
              <p className="text-gray-600">{t('festivalCalendar.festivalsHolidays', 'Festivals & Holidays')}</p>
            </CardContent>
          </Card>
          <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
            <CardContent className="pt-6 text-center">
              <Moon className="w-12 h-12 mx-auto text-purple-600 mb-3" />
              <h3 className="text-3xl font-bold text-purple-700">4</h3>
              <p className="text-gray-600">{t('festivalCalendar.eclipsesIn2026', 'Eclipses in {year}')}</p>
            </CardContent>
          </Card>
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardContent className="pt-6 text-center">
              <Star className="w-12 h-12 mx-auto text-blue-600 mb-3" />
              <h3 className="text-3xl font-bold text-blue-700">24</h3>
              <p className="text-gray-600">{t('festivalCalendar.ekadashiFasts', 'Ekadashi Fasts')}</p>
            </CardContent>
          </Card>
          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardContent className="pt-6 text-center">
              <Sun className="w-12 h-12 mx-auto text-green-600 mb-3" />
              <h3 className="text-3xl font-bold text-green-700">12</h3>
              <p className="text-gray-600">{t('festivalCalendar.purnimaDays', 'Purnima Days')}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-amber-200 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Moon className="w-5 h-5 text-amber-600" />
              {t('festivalCalendar.eclipsesTitle', 'Eclipses in {year} (Grahan)')}
            </CardTitle>
            <CardDescription>
              {t('festivalCalendar.eclipsesDesc', 'Solar and Lunar eclipses with visibility in India')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {upcomingEclipses.map((eclipse, index) => (
                <div
                  key={index}
                  className={`rounded-lg p-4 ${
                    eclipse.isLunar
                      ? "bg-purple-50 border border-purple-200"
                      : "bg-orange-50 border border-orange-200"
                  }`}
                >
                  <Badge
                    className={
                      eclipse.isLunar
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
                              festival.typeKey === "major"
                                ? "bg-amber-500"
                                : festival.typeKey === "national"
                                ? "bg-blue-500"
                                : festival.typeKey === "vrat"
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
              <h3 className="font-semibold text-lg mb-2">{t('festivalCalendar.dailyPanchang', 'Daily Panchang')}</h3>
              <p className="text-gray-600 text-sm mb-4">
                {t('festivalCalendar.dailyPanchangDesc', 'Get daily Tithi, Nakshatra, Yoga, Karana, and auspicious timings.')}
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/panchang">
                  {t('festivalCalendar.viewPanchang', 'View Panchang')} <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-amber-200 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-2">{t('festivalCalendar.horoscope2026', '{year} Horoscope')}</h3>
              <p className="text-gray-600 text-sm mb-4">
                {t('festivalCalendar.horoscope2026Desc', 'Read your yearly horoscope predictions for {year}.')}
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/horoscope/2026">
                  {t('festivalCalendar.readHoroscope', 'Read Horoscope')} <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-amber-200 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-2">{t('festivalCalendar.freeKundli', 'Free Kundli')}</h3>
              <p className="text-gray-600 text-sm mb-4">
                {t('festivalCalendar.freeKundliDesc', 'Generate your complete birth chart with planetary positions.')}
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/tools/kundli-calculator">
                  {t('festivalCalendar.getKundli', 'Get Kundli')} <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="border-amber-200 bg-amber-50 mt-12">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {t('festivalCalendar.aboutTitle', 'About Hindu Festival Calendar')}
            </h2>
            <div className="prose prose-amber max-w-none">
              <p className="text-gray-700 mb-4">
                {t('festivalCalendar.aboutPara1', 'The Hindu festival calendar follows the lunisolar system, combining both lunar and solar movements to determine dates. Most Hindu festivals are based on the Panchang, which considers Tithi (lunar day), Nakshatra (lunar mansion), and other astronomical factors.')}
              </p>
              <p className="text-gray-700 mb-4">
                {t('festivalCalendar.aboutPara2', 'Major festivals like Diwali, Holi, Navratri, and Ganesh Chaturthi are celebrated across India, while regional festivals like Pongal, Onam, and Baisakhi have special significance in specific states. The calendar also includes important fasting days (Vrat) like Ekadashi, Pradosh, and Karwa Chauth.')}
              </p>
              <p className="text-gray-700">
                {t('festivalCalendar.aboutPara3', 'Eclipses (Grahan) hold special significance in Hindu tradition. During eclipses, temples are closed, and specific rituals are performed. The Sutak period before and after eclipses is considered inauspicious for starting new activities.')}
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
            headline: "Hindu Festival Calendar {year} - Complete List of Festivals & Holidays",
            description: "Complete Hindu festival calendar for {year} with dates, timings, and significance",
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
