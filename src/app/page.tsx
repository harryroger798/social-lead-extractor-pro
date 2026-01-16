import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

const features = [
  {
    icon: Calculator,
    title: "Free Kundli Calculator",
    description: "Generate your complete birth chart with planetary positions, houses, and doshas instantly.",
    href: "/tools/kundli-calculator",
    badge: "Free",
  },
  {
    icon: Moon,
    title: "Moon Sign Calculator",
    description: "Discover your Vedic Moon sign (Chandra Rashi) and understand your emotional nature.",
    href: "/tools/moon-sign-calculator",
    badge: "Free",
  },
  {
    icon: Calendar,
    title: "Daily Panchang",
    description: "Get today's tithi, nakshatra, yoga, karana, Rahu Kaal, and auspicious timings.",
    href: "/panchang",
    badge: "Free",
  },
  {
    icon: BookOpen,
    title: "Expert Consultation",
    description: "Connect with verified Vedic astrologers for personalized guidance and predictions.",
    href: "/consultation",
    badge: "Premium",
  },
];

const moreTools = [
  {
    icon: Sun,
    title: "Sun Sign Calculator",
    description: "Find your Western zodiac sign based on your birth date.",
    href: "/tools/sun-sign-calculator",
  },
  {
    icon: Star,
    title: "Ascendant Calculator",
    description: "Calculate your rising sign (Lagna) for accurate predictions.",
    href: "/tools/ascendant-calculator",
  },
  {
    icon: Heart,
    title: "Love Compatibility",
    description: "Check zodiac compatibility with your partner.",
    href: "/tools/love-calculator",
  },
  {
    icon: Users,
    title: "Horoscope Matching",
    description: "Detailed Guna Milan for marriage compatibility.",
    href: "/tools/horoscope-matching",
  },
  {
    icon: AlertTriangle,
    title: "Mangal Dosh Calculator",
    description: "Check if you have Manglik Dosha in your chart.",
    href: "/tools/mangal-dosh-calculator",
  },
  {
    icon: Clock,
    title: "Sade Sati Calculator",
    description: "Check your current Sade Sati status and phase.",
    href: "/tools/sade-sati-calculator",
  },
];

const predictions2026 = [
  {
    title: "2026 Horoscope",
    description: "Yearly predictions for all 12 zodiac signs",
    href: "/horoscope/2026",
  },
  {
    title: "Saturn Transit 2026",
    description: "Shani Gochar effects on your sign",
    href: "/transits/saturn-transit-2026",
  },
  {
    title: "Jupiter Transit 2026",
    description: "Guru Gochar blessings and opportunities",
    href: "/transits/jupiter-transit-2026",
  },
  {
    title: "Mercury Retrograde 2026",
    description: "Dates, effects, and survival guide",
    href: "/transits/mercury-retrograde-2026",
  },
  {
    title: "Eclipses 2026",
    description: "Solar & lunar eclipse dates and effects",
    href: "/eclipses-2026",
  },
  {
    title: "Festival Calendar 2026",
    description: "Hindu festivals and important dates",
    href: "/festival-calendar-2026",
  },
];

const stats = [
  { value: "50,000+", label: "Charts Generated" },
  { value: "10,000+", label: "Happy Clients" },
  { value: "100+", label: "Expert Astrologers" },
  { value: "4.9/5", label: "User Rating" },
];

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
  return (
    <>
      <section className="relative overflow-hidden py-20 lg:py-28">
        <div className="absolute inset-0 bg-[url('/images/hero-bg.png')] bg-cover bg-center"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70"></div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-4 bg-amber-100 text-amber-800 hover:bg-amber-100">
              <Sparkles className="w-3 h-3 mr-1" />
              Trusted by 50,000+ Users
            </Badge>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Discover Your Destiny with{" "}
              <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                Authentic Vedic Astrology
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
              Get accurate Kundli analysis, Nakshatra insights, and personalized predictions 
              from expert astrologers with 20+ years of experience in Jyotish Shastra.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-lg px-8 py-6"
                asChild
              >
                <Link href="/tools/kundli-calculator">
                  Get Free Kundli
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
                  Talk to Astrologer
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
              Free Astrology Tools & Services
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Access powerful Vedic astrology tools and connect with expert astrologers 
              for personalized guidance.
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
                    <Badge variant={feature.badge === "Free" ? "secondary" : "default"} className={feature.badge === "Free" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}>
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
                    Try Now
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
            <Badge className="mb-4 bg-purple-100 text-purple-800">More Free Tools</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Explore Our Astrology Calculators
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover more free tools to understand your astrological profile.
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
            <Badge className="mb-4 bg-amber-400 text-amber-900">2026 Predictions</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              What Does 2026 Hold For You?
            </h2>
            <p className="text-lg text-indigo-200 max-w-2xl mx-auto">
              Explore detailed predictions, planetary transits, and cosmic events for 2026.
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
                  Read More <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
              <Badge className="mb-4 bg-amber-100 text-amber-800">Why Choose Us</Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Authentic Vedic Wisdom, Modern Experience
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                We combine ancient Jyotish Shastra knowledge with modern technology to provide 
                accurate, personalized astrological guidance. Our expert astrologers follow 
                traditional Parashari and Jaimini systems for precise predictions.
              </p>
              
              <div className="space-y-4">
                {[
                  { icon: Shield, text: "Verified Expert Astrologers with 10+ Years Experience" },
                  { icon: Clock, text: "24/7 Availability for Consultations" },
                  { icon: Award, text: "100% Satisfaction Guarantee" },
                  { icon: CheckCircle, text: "Accurate Calculations Based on Swiss Ephemeris" },
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
                  Learn More About Us
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
            <Badge className="mb-4 bg-amber-100 text-amber-800">Testimonials</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Clients Say
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join thousands of satisfied clients who have found guidance through our services.
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
            Ready to Discover Your Cosmic Path?
          </h2>
          <p className="text-lg text-amber-100 mb-8 max-w-2xl mx-auto">
            Get your free Kundli analysis now and unlock insights about your life, 
            career, relationships, and future.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-amber-600 hover:bg-amber-50 text-lg px-8 py-6"
              asChild
            >
              <Link href="/tools/kundli-calculator">
                Generate Free Kundli
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
                Book Consultation
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
