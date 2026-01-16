"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/lib/i18n";
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

  const features = [
    {
      icon: Calculator,
      title: t.home.freeKundliTitle,
      description: t.home.freeKundliDesc,
      href: "/tools/kundli-calculator",
      badge: t.home.free,
    },
    {
      icon: Moon,
      title: t.home.moonSignTitle,
      description: t.home.moonSignDesc,
      href: "/tools/moon-sign-calculator",
      badge: t.home.free,
    },
    {
      icon: Calendar,
      title: t.home.dailyPanchangTitle,
      description: t.home.dailyPanchangDesc,
      href: "/panchang",
      badge: t.home.free,
    },
    {
      icon: BookOpen,
      title: t.home.expertConsultationTitle,
      description: t.home.expertConsultationDesc,
      href: "/consultation",
      badge: t.home.premium,
    },
  ];

  const moreTools = [
    {
      icon: Sun,
      title: t.home.sunSignTitle,
      description: t.home.sunSignDesc,
      href: "/tools/sun-sign-calculator",
    },
    {
      icon: Star,
      title: t.home.ascendantTitle,
      description: t.home.ascendantDesc,
      href: "/tools/ascendant-calculator",
    },
    {
      icon: Heart,
      title: t.home.loveCompatibilityTitle,
      description: t.home.loveCompatibilityDesc,
      href: "/tools/love-calculator",
    },
    {
      icon: Users,
      title: t.home.horoscopeMatchingTitle,
      description: t.home.horoscopeMatchingDesc,
      href: "/tools/horoscope-matching",
    },
    {
      icon: AlertTriangle,
      title: t.home.mangalDoshTitle,
      description: t.home.mangalDoshDesc,
      href: "/tools/mangal-dosh-calculator",
    },
    {
      icon: Clock,
      title: t.home.sadeSatiTitle,
      description: t.home.sadeSatiDesc,
      href: "/tools/sade-sati-calculator",
    },
  ];

  const predictions2026 = [
    {
      title: t.home.horoscope2026Title,
      description: t.home.horoscope2026Desc,
      href: "/horoscope/2026",
    },
    {
      title: t.home.saturnTransitTitle,
      description: t.home.saturnTransitDesc,
      href: "/transits/saturn-transit-2026",
    },
    {
      title: t.home.jupiterTransitTitle,
      description: t.home.jupiterTransitDesc,
      href: "/transits/jupiter-transit-2026",
    },
    {
      title: t.home.mercuryRetrogradeTitle,
      description: t.home.mercuryRetrogradeDesc,
      href: "/transits/mercury-retrograde-2026",
    },
    {
      title: t.home.eclipsesTitle,
      description: t.home.eclipsesDesc,
      href: "/eclipses-2026",
    },
    {
      title: t.home.festivalCalendarTitle,
      description: t.home.festivalCalendarDesc,
      href: "/festival-calendar-2026",
    },
  ];

  const stats = [
    { value: "50,000+", label: t.home.chartsGenerated },
    { value: "10,000+", label: t.home.happyClients },
    { value: "100+", label: t.home.expertAstrologers },
    { value: "4.9/5", label: t.home.userRating },
  ];
  return (
    <>
      <section className="relative overflow-hidden py-20 lg:py-28">
        <div className="absolute inset-0 bg-[url('/images/hero-bg.png')] bg-cover bg-center"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70"></div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-4 bg-amber-100 text-amber-800 hover:bg-amber-100">
              <Sparkles className="w-3 h-3 mr-1" />
              {t.home.trustedBadge}
            </Badge>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              {t.home.heroTitle}{" "}
              <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                {t.home.heroTitleHighlight}
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
              {t.home.heroSubtitle}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-lg px-8 py-6"
                asChild
              >
                <Link href="/tools/kundli-calculator">
                  {t.home.getFreeKundli}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-amber-500 text-amber-700 hover:bg-amber-50 text-lg px-8 py-6"
                asChild
              >
                <Link href="/consultation">
                  {t.home.talkToAstrologer}
                </Link>
              </Button>
            </div>
          </div>
          
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-amber-400">{stat.value}</div>
                <div className="text-sm text-gray-300 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t.home.featuresTitle}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t.home.featuresDesc}
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
                    <Badge variant={feature.badge === t.home.free ? "secondary" : "default"} className={feature.badge === t.home.free ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}>
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
                    {t.home.tryNow}
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
            <Badge className="mb-4 bg-purple-100 text-purple-800">{t.home.moreToolsBadge}</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t.home.moreToolsTitle}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t.home.moreToolsDesc}
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
            <Badge className="mb-4 bg-amber-400 text-amber-900">{t.home.predictions2026Badge}</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t.home.predictions2026Title}
            </h2>
            <p className="text-lg text-indigo-200 max-w-2xl mx-auto">
              {t.home.predictions2026Desc}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {predictions2026.map((item) => (
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
                  {t.common.readMore} <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
              <Badge className="mb-4 bg-amber-100 text-amber-800">{t.home.whyChooseUsBadge}</Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                {t.home.whyChooseUsTitle}
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                {t.home.whyChooseUsDesc}
              </p>
              
              <div className="space-y-4">
                {[
                  { icon: Shield, text: t.home.verifiedExperts },
                  { icon: Clock, text: t.home.availability247 },
                  { icon: Award, text: t.home.satisfactionGuarantee },
                  { icon: CheckCircle, text: t.home.accurateCalculations },
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
                  {t.home.learnMoreAboutUs}
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
            <Badge className="mb-4 bg-amber-100 text-amber-800">{t.home.testimonialsBadge}</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t.home.testimonialsTitle}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t.home.testimonialsDesc}
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
            {t.home.ctaTitle}
          </h2>
          <p className="text-lg text-amber-100 mb-8 max-w-2xl mx-auto">
            {t.home.ctaDesc}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-amber-600 hover:bg-amber-50 text-lg px-8 py-6"
              asChild
            >
              <Link href="/tools/kundli-calculator">
                {t.home.generateFreeKundli}
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
                {t.home.bookConsultation}
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
