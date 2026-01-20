"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/lib/i18n";
import { getCurrentYear, withCurrentYear } from "@/lib/utils";
import { 
  Star, 
  Calculator, 
  Moon, 
  Users, 
  BookOpen, 
  ArrowRight, 
  CheckCircle,
  Sparkles,
  Clock,
  Shield,
  Award,
  Calendar,
  Sun,
  Heart,
  AlertTriangle,
  Mic,
  Phone,
  MapPin,
  Zap,
  TrendingUp,
  Share2,
  MessageCircle,
  Flame,
  Eye,
  Gift,
  Crown,
  Target,
  Compass,
  Briefcase,
  Wallet,
  Brain,
} from "lucide-react";

// Testimonials stay in original language as requested by user
const testimonials = [
  {
    name: "Priya Sharma",
    location: "Mumbai",
    text: "The Kundli analysis was incredibly accurate. The astrologer explained everything in detail and gave practical remedies.",
    rating: 5,
  },
  {
    name: "Rajesh Kumar",
    location: "Delhi",
    text: "Best astrology service I've used. The marriage compatibility report helped us understand our relationship better.",
    rating: 5,
  },
  {
    name: "Anita Patel",
    location: "Bangalore",
    text: "The career predictions were spot on. I followed the suggested remedies and saw positive changes within months.",
    rating: 5,
  },
];

export default function Home() {
  const { t } = useLanguage();
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
    const [liveCount, setLiveCount] = useState(2847);
  
    // Dynamic year - automatically updates each year
    const currentYear = getCurrentYear();

  // Simulate live counter
  useState(() => {
    const interval = setInterval(() => {
      setLiveCount(prev => prev + Math.floor(Math.random() * 3) - 1);
    }, 3000);
    return () => clearInterval(interval);
  });

  const handleQuickStart = () => {
    if (birthDate && birthTime && birthPlace) {
      const params = new URLSearchParams({
        date: birthDate,
        time: birthTime,
        place: birthPlace,
      });
      window.location.href = `/tools/kundli-calculator?${params.toString()}`;
    }
  };

  // Life Journeys - 4 main categories replacing 8 dropdowns
  const lifeJourneys = [
    {
      icon: Heart,
      title: t('homepage.loveJourneyTitle', 'Love & Relationships'),
      description: t('homepage.loveJourneyDesc', 'Compatibility, marriage timing, relationship insights'),
      color: 'from-pink-500 to-rose-500',
      bgColor: 'bg-pink-50',
      tools: [
        { name: t('homepage.horoscopeMatching', 'Horoscope Matching'), href: '/tools/horoscope-matching' },
        { name: t('homepage.loveCompatibility', 'Love Compatibility'), href: '/tools/love-calculator' },
        { name: t('homepage.marriageTiming', 'Marriage Timing'), href: '/tools/muhurta-calculator' },
      ],
    },
    {
      icon: Briefcase,
      title: t('homepage.careerJourneyTitle', 'Career & Wealth'),
      description: t('homepage.careerJourneyDesc', 'Financial astrology, career predictions, wealth timing'),
      color: 'from-emerald-500 to-teal-500',
      bgColor: 'bg-emerald-50',
      tools: [
        { name: t('homepage.financialAstrology', 'Financial Astrology'), href: '/tools/financial-astrology' },
        { name: t('homepage.careerPredictions', 'Career Predictions'), href: '/horoscope/career' },
        { name: t('homepage.wealthTiming', 'Wealth Timing'), href: '/tools/dasha-calculator' },
      ],
    },
    {
      icon: Compass,
      title: t('homepage.dailyJourneyTitle', 'Daily Guidance'),
      description: t('homepage.dailyJourneyDesc', 'Panchang, daily horoscope, voice AI astrologer'),
      color: 'from-violet-500 to-purple-500',
      bgColor: 'bg-violet-50',
      tools: [
        { name: t('homepage.dailyPanchang', 'Daily Panchang'), href: '/panchang' },
        { name: t('homepage.dailyHoroscope', 'Daily Horoscope'), href: '/horoscope/daily' },
        { name: t('homepage.voiceAstrologer', 'Voice AI Astrologer'), href: '/voice-astrologer' },
      ],
    },
    {
      icon: Brain,
      title: t('homepage.deepDiveJourneyTitle', 'Deep Dive'),
      description: t('homepage.deepDiveJourneyDesc', 'Advanced charts, doshas, remedies, numerology'),
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-50',
      tools: [
        { name: t('homepage.fullKundli', 'Full Kundli Analysis'), href: '/tools/kundli-calculator' },
        { name: t('homepage.doshaAnalysis', 'Dosha Analysis'), href: '/doshas' },
        { name: t('homepage.numerology', 'Numerology'), href: '/tools/numerology' },
      ],
    },
  ];

  const features = [
    {
      icon: Calculator,
      title: t('home.freeKundliTitle', 'Free Kundli Calculator'),
      description: t('home.freeKundliDesc', 'Generate your complete birth chart with planetary positions, houses, and doshas instantly.'),
      href: "/tools/kundli-calculator",
      badge: t('home.free', 'Free'),
    },
    {
      icon: Moon,
      title: t('home.moonSignTitle', 'Moon Sign Calculator'),
      description: t('home.moonSignDesc', 'Discover your Vedic Moon sign (Chandra Rashi) and understand your emotional nature.'),
      href: "/tools/moon-sign-calculator",
      badge: t('home.free', 'Free'),
    },
    {
      icon: Calendar,
      title: t('home.dailyPanchangTitle', 'Daily Panchang'),
      description: t('home.dailyPanchangDesc', "Get today's tithi, nakshatra, yoga, karana, Rahu Kaal, and auspicious timings."),
      href: "/panchang",
      badge: t('home.free', 'Free'),
    },
    {
      icon: BookOpen,
      title: t('home.expertConsultationTitle', 'Expert Consultation'),
      description: t('home.expertConsultationDesc', 'Connect with verified Vedic astrologers for personalized guidance and predictions.'),
      href: "/consultation",
      badge: t('home.premium', 'Premium'),
    },
  ];

  const moreTools = [
    {
      icon: Sun,
      title: t('home.sunSignTitle', 'Sun Sign Calculator'),
      description: t('home.sunSignDesc', 'Find your Western zodiac sign based on your birth date.'),
      href: "/tools/sun-sign-calculator",
    },
    {
      icon: Star,
      title: t('home.ascendantTitle', 'Ascendant Calculator'),
      description: t('home.ascendantDesc', 'Calculate your rising sign (Lagna) for accurate predictions.'),
      href: "/tools/ascendant-calculator",
    },
    {
      icon: Heart,
      title: t('home.loveCompatibilityTitle', 'Love Compatibility'),
      description: t('home.loveCompatibilityDesc', 'Check zodiac compatibility with your partner.'),
      href: "/tools/love-calculator",
    },
    {
      icon: Users,
      title: t('home.horoscopeMatchingTitle', 'Horoscope Matching'),
      description: t('home.horoscopeMatchingDesc', 'Detailed Guna Milan for marriage compatibility.'),
      href: "/tools/horoscope-matching",
    },
    {
      icon: AlertTriangle,
      title: t('home.mangalDoshTitle', 'Mangal Dosh Calculator'),
      description: t('home.mangalDoshDesc', 'Check if you have Manglik Dosha in your chart.'),
      href: "/tools/mangal-dosh-calculator",
    },
    {
      icon: Clock,
      title: t('home.sadeSatiTitle', 'Sade Sati Calculator'),
      description: t('home.sadeSatiDesc', 'Check your current Sade Sati status and phase.'),
      href: "/tools/sade-sati-calculator",
    },
  ];

    // Dynamic year predictions - automatically updates each year
    const yearlyPredictions = [
      {
        title: withCurrentYear(t('home.horoscopeYearTitle', '{year} Horoscope')),
        description: t('home.horoscopeYearDesc', 'Yearly predictions for all 12 zodiac signs'),
        href: `/horoscope/${currentYear}`,
      },
      {
        title: withCurrentYear(t('home.saturnTransitTitle', 'Saturn Transit {year}')),
        description: t('home.saturnTransitDesc', 'Shani Gochar effects on your sign'),
        href: `/transits/saturn-transit-${currentYear}`,
      },
      {
        title: withCurrentYear(t('home.jupiterTransitTitle', 'Jupiter Transit {year}')),
        description: t('home.jupiterTransitDesc', 'Guru Gochar blessings and opportunities'),
        href: `/transits/jupiter-transit-${currentYear}`,
      },
      {
        title: withCurrentYear(t('home.mercuryRetrogradeTitle', 'Mercury Retrograde {year}')),
        description: t('home.mercuryRetrogradeDesc', 'Dates, effects, and survival guide'),
        href: `/transits/mercury-retrograde-${currentYear}`,
      },
      {
        title: withCurrentYear(t('home.eclipsesTitle', 'Eclipses {year}')),
        description: t('home.eclipsesDesc', 'Solar & lunar eclipse dates and effects'),
        href: `/eclipses-${currentYear}`,
      },
      {
        title: withCurrentYear(t('home.festivalCalendarTitle', 'Festival Calendar {year}')),
        description: t('home.festivalCalendarDesc', 'Hindu festivals and important dates'),
        href: `/festival-calendar-${currentYear}`,
      },
    ];

  const stats = [
    { value: "50,000+", label: t('home.chartsGenerated', 'Charts Generated') },
    { value: "10,000+", label: t('home.happyClients', 'Happy Clients') },
    { value: "100+", label: t('home.expertAstrologers', 'Expert Astrologers') },
    { value: "4.9/5", label: t('home.userRating', 'User Rating') },
  ];
  return (
    <>
      {/* Phase 1: Redesigned Hero Section with Single Powerful Hook */}
      <section className="relative overflow-hidden py-16 lg:py-24 min-h-[90vh] flex items-center bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950">
        {/* Animated starfield background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[url('/images/hero-bg.png')] bg-cover bg-center opacity-30"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-950/50 to-slate-950"></div>
          {/* Animated stars */}
          <div className="stars-container absolute inset-0">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${2 + Math.random() * 3}s`,
                }}
              />
            ))}
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Main hook and form */}
            <div className="text-center lg:text-left">
              {/* Live counter badge */}
              <Badge className="mb-6 bg-green-500/20 text-green-400 border-green-500/30 animate-pulse">
                <Eye className="w-3 h-3 mr-1" />
                {t('homepage.liveNow', '{count} people checking charts now').replace('{count}', liveCount.toLocaleString())}
              </Badge>

                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                              {t('homepage.heroMainTitle', 'Discover What {year} Has in Store for You').replace('{year}', currentYear.toString())}
                            </h1>

              <p className="text-xl md:text-2xl text-indigo-200 mb-8 max-w-xl">
                {t('homepage.heroSubtitle', 'Your complete cosmic blueprint in 60 seconds. Free forever.')}
              </p>

              {/* 3-Field Quick Start Form */}
              <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6 max-w-md mx-auto lg:mx-0">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white text-center lg:text-left">
                    {t('homepage.heroFormTitle', 'Get Your Cosmic Profile')}
                  </h3>
                  
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="birthDate" className="text-indigo-200 text-sm">
                        {t('homepage.birthDate', 'Birth Date')}
                      </Label>
                      <Input
                        id="birthDate"
                        type="date"
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        className="bg-white/10 border-white/30 text-white placeholder:text-gray-400"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="birthTime" className="text-indigo-200 text-sm">
                        {t('homepage.birthTime', 'Birth Time')}
                      </Label>
                      <Input
                        id="birthTime"
                        type="time"
                        value={birthTime}
                        onChange={(e) => setBirthTime(e.target.value)}
                        className="bg-white/10 border-white/30 text-white placeholder:text-gray-400"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="birthPlace" className="text-indigo-200 text-sm">
                        {t('homepage.birthPlace', 'Birth Place')}
                      </Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="birthPlace"
                          type="text"
                          placeholder={t('homepage.birthPlacePlaceholder', 'Enter city name')}
                          value={birthPlace}
                          onChange={(e) => setBirthPlace(e.target.value)}
                          className="bg-white/10 border-white/30 text-white placeholder:text-gray-400 pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleQuickStart}
                    disabled={!birthDate || !birthTime || !birthPlace}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-lg py-6 disabled:opacity-50"
                  >
                    <Zap className="mr-2 w-5 h-5" />
                    {t('homepage.revealDestiny', 'Reveal My Destiny')}
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>

                  <p className="text-center text-xs text-indigo-300">
                    {t('homepage.freeForever', 'Free forever. No credit card required.')}
                  </p>
                </div>
              </Card>
            </div>

            {/* Right side - Cosmic Profile Preview */}
            <div className="hidden lg:block">
              <div className="relative">
                {/* Glowing orb effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-purple-500/20 rounded-full blur-3xl"></div>
                
                {/* Preview card */}
                <Card className="relative bg-gradient-to-br from-indigo-900/80 to-purple-900/80 backdrop-blur-md border-white/20 p-8 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                  <div className="text-center">
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                      <Star className="w-12 h-12 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {t('homepage.cosmicProfileTitle', 'Your Cosmic DNA')}
                    </h3>
                    <div className="space-y-2 text-indigo-200">
                      <p><Sun className="inline w-4 h-4 mr-2 text-amber-400" />{t('homepage.sunSign', 'Sun Sign')}: ???</p>
                      <p><Moon className="inline w-4 h-4 mr-2 text-blue-300" />{t('homepage.moonSign', 'Moon Sign')}: ???</p>
                      <p><Star className="inline w-4 h-4 mr-2 text-purple-400" />{t('homepage.risingSign', 'Rising Sign')}: ???</p>
                    </div>
                    <div className="mt-6 p-4 bg-white/10 rounded-lg">
                                            <p className="text-amber-300 font-semibold">
                                              {withCurrentYear(t('homepage.predictionYear', '{year} Prediction'))}
                                            </p>
                      <p className="text-white text-sm mt-1">
                        {t('homepage.enterDetailsToReveal', 'Enter your details to reveal...')}
                      </p>
                    </div>
                                        <Button className="mt-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600">
                                          <Share2 className="mr-2 w-4 h-4" />
                                          {t('homepage.shareCosmicDna', 'Share Your Cosmic DNA')}
                                        </Button>
                  </div>
                </Card>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-amber-400">{stat.value}</div>
                <div className="text-sm text-indigo-300 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Phase 3: Life Journeys - 4 Main Categories */}
      <section className="py-16 bg-gradient-to-b from-slate-950 to-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-purple-500/20 text-purple-300 border-purple-500/30">
              <Compass className="w-3 h-3 mr-1" />
              {t('homepage.lifeJourneysBadge', 'Your Life Journeys')}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t('homepage.lifeJourneysTitle', 'Explore Your Cosmic Path')}
            </h2>
            <p className="text-lg text-indigo-200 max-w-2xl mx-auto">
              {t('homepage.lifeJourneysDesc', 'Choose your journey and discover what the stars reveal about your life')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {lifeJourneys.map((journey) => (
              <Card 
                key={journey.title} 
                className="group bg-white/5 backdrop-blur-sm border-white/10 hover:border-white/30 hover:bg-white/10 transition-all duration-300 overflow-hidden"
              >
                <CardHeader className="pb-2">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${journey.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <journey.icon className="w-7 h-7 text-white" />
                  </div>
                  <CardTitle className="text-xl text-white">{journey.title}</CardTitle>
                  <CardDescription className="text-indigo-300">{journey.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {journey.tools.map((tool) => (
                      <Link
                        key={tool.name}
                        href={tool.href}
                        className="flex items-center text-sm text-indigo-200 hover:text-amber-400 transition-colors"
                      >
                        <ArrowRight className="w-3 h-3 mr-2" />
                        {tool.name}
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Voice AI Astrologer Highlight Section */}
      <section className="py-12 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/stars-pattern.png')] opacity-10"></div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex-1 text-center lg:text-left">
              <Badge className="mb-4 bg-white/20 text-white border-white/30">
                <Sparkles className="w-3 h-3 mr-1" />
                {t('home.voiceAiBadge', 'NEW - Voice AI Feature')}
              </Badge>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4">
                {t('home.voiceAiTitle', 'Talk to Our AI Astrologer')}
              </h2>
              <p className="text-lg text-purple-100 mb-6 max-w-xl">
                {t('home.voiceAiDesc', 'Get instant Vedic astrology guidance through natural voice conversation. Ask about your birth chart, career, relationships, and more!')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button 
                  size="lg" 
                  className="bg-white text-purple-700 hover:bg-purple-50 text-lg px-8 py-6 shadow-lg"
                  asChild
                >
                  <Link href="/voice-astrologer">
                    <Mic className="mr-2 w-5 h-5" />
                    {t('home.tryVoiceAi', 'Try Voice AI Now')}
                  </Link>
                </Button>
                <div className="flex items-center justify-center gap-2 text-purple-200">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm">{t('home.voiceAiFree', '5 Free Minutes Daily')}</span>
                </div>
              </div>
            </div>
            <div className="flex-shrink-0">
              <div className="w-40 h-40 lg:w-48 lg:h-48 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border-4 border-white/20 animate-pulse">
                <div className="w-28 h-28 lg:w-36 lg:h-36 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-2xl">
                  <Mic className="w-14 h-14 lg:w-16 lg:h-16 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('home.featuresTitle', 'Free Astrology Tools & Services')}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('home.featuresDesc', 'Access powerful Vedic astrology tools and connect with expert astrologers for personalized guidance.')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="group hover:shadow-lg transition-all duration-300 border-amber-100 hover:border-amber-300">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center group-hover:from-amber-200 group-hover:to-orange-200 transition-colors">
                      <feature.icon className="w-6 h-6 text-amber-600" />
                    </div>
                    <Badge variant={feature.badge === t('home.free', 'Free') ? "secondary" : "default"} className={feature.badge === t('home.free', 'Free') ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}>
                      {feature.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link 
                    href={feature.href}
                    className="inline-flex items-center text-amber-600 font-medium hover:text-amber-700 transition-colors"
                  >
                    {t('home.tryNow', 'Try Now')}
                    <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <Badge className="mb-4 bg-purple-100 text-purple-800">{t('home.moreToolsBadge', 'More Free Tools')}</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('home.moreToolsTitle', 'Explore Our Astrology Calculators')}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('home.moreToolsDesc', 'Discover more free tools to understand your astrological profile.')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {moreTools.map((tool) => (
              <Link 
                key={tool.title} 
                href={tool.href}
                className="group flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-200 transition-colors">
                  <tool.icon className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">{tool.title}</h3>
                  <p className="text-sm text-gray-600">{tool.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
                      <Badge className="mb-4 bg-amber-400 text-amber-900">{withCurrentYear(t('home.predictionsYearBadge', '{year} Predictions'))}</Badge>
                      <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        {withCurrentYear(t('home.predictionsYearTitle', 'What Does {year} Hold For You?'))}
                      </h2>
                      <p className="text-lg text-indigo-200 max-w-2xl mx-auto">
                        {withCurrentYear(t('home.predictionsYearDesc', 'Explore detailed predictions, planetary transits, and cosmic events for {year}.'))}
                      </p>
                    </div>
          
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {yearlyPredictions.map((item) => (
              <Link 
                key={item.title} 
                href={item.href}
                className="group p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/20 hover:border-amber-400/50 transition-all"
              >
                <h3 className="font-semibold text-white text-lg mb-2 group-hover:text-amber-300 transition-colors">
                  {item.title}
                </h3>
                <p className="text-indigo-200 text-sm">{item.description}</p>
                <span className="inline-flex items-center text-amber-400 text-sm mt-3 group-hover:text-amber-300">
                  {t('common.readMore', 'Read More')} <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-b from-amber-50 to-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-amber-100 text-amber-800">{t('home.whyChooseUsBadge', 'Why Choose Us')}</Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                {t('home.whyChooseUsTitle', 'Authentic Vedic Wisdom, Modern Experience')}
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                {t('home.whyChooseUsDesc', 'We combine ancient Jyotish Shastra knowledge with modern technology to provide accurate, personalized astrological guidance. Our expert astrologers follow traditional Parashari and Jaimini systems for precise predictions.')}
              </p>
              
              <div className="space-y-4">
                {[
                  { icon: Shield, text: t('home.verifiedExperts', 'Verified Expert Astrologers with 10+ Years Experience') },
                  { icon: Clock, text: t('home.availability247', '24/7 Availability for Consultations') },
                  { icon: Award, text: t('home.satisfactionGuarantee', '100% Satisfaction Guarantee') },
                  { icon: CheckCircle, text: t('home.accurateCalculations', 'Accurate Calculations Based on Swiss Ephemeris') },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-gray-700">{item.text}</span>
                  </div>
                ))}
              </div>
              
              <Button 
                size="lg" 
                className="mt-8 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                asChild
              >
                <Link href="/about">
                  {t('home.learnMoreAboutUs', 'Learn More About Us')}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>
            
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/images/kundli-chart.png"
                  alt="Vedic Birth Chart (Kundli) Illustration"
                  width={600}
                  height={400}
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-amber-100 text-amber-800">{t('home.testimonialsBadge', 'Testimonials')}</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('home.testimonialsTitle', 'What Our Clients Say')}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('home.testimonialsDesc', 'Join thousands of satisfied clients who have found guidance through our services.')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.name} className="border-amber-100">
                <CardContent className="pt-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4">&ldquo;{testimonial.text}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-semibold">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-500">{testimonial.location}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-amber-500 to-orange-600">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {t('home.ctaTitle', 'Ready to Discover Your Cosmic Path?')}
          </h2>
          <p className="text-lg text-amber-100 mb-8 max-w-2xl mx-auto">
            {t('home.ctaDesc', 'Get your free Kundli analysis now and unlock insights about your life, career, relationships, and future.')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-amber-600 hover:bg-amber-50 text-lg px-8 py-6"
              asChild
            >
              <Link href="/tools/kundli-calculator">
                {t('home.generateFreeKundli', 'Generate Free Kundli')}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white bg-white/10 text-white hover:bg-white hover:text-amber-600 text-lg px-8 py-6"
              asChild
            >
              <Link href="/consultation">
                {t('home.bookConsultation', 'Book Consultation')}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "VedicStarAstro",
            url: "https://vedicstarastro.com",
            potentialAction: {
              "@type": "SearchAction",
              target: "https://vedicstarastro.com/search?q={search_term_string}",
              "query-input": "required name=search_term_string",
            },
          }),
        }}
      />
    </>
  );
}
