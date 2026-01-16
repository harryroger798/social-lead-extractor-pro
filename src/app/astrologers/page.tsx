"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  Clock,
  MessageCircle,
  Video,
  Phone,
  Award,
  Users,
  CheckCircle,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const astrologers = [
  {
    id: 1,
    name: "Pt. Ramesh Sharma",
    title: "Chief Astrologer",
    experience: "25+ years",
    specializations: ["Kundli Analysis", "Career Predictions", "Muhurta"],
    languages: ["Hindi", "English", "Sanskrit"],
    rating: 4.9,
    consultations: 15000,
    price: 1500,
    available: true,
    bio: "A renowned Vedic astrologer trained in the traditional Gurukul system under Pt. Vishwanath Shastri. Specializes in Parashari and Jaimini systems with expertise in career and business astrology.",
    education: "Jyotish Acharya from Banaras Hindu University",
  },
  {
    id: 2,
    name: "Dr. Lakshmi Devi",
    title: "Senior Astrologer",
    experience: "20+ years",
    specializations: ["Marriage Compatibility", "Relationships", "Muhurta"],
    languages: ["Hindi", "English", "Tamil"],
    rating: 4.8,
    consultations: 12000,
    price: 1200,
    available: true,
    bio: "Ph.D. in Sanskrit with specialization in Jaimini astrology. Expert in marriage compatibility analysis and relationship counseling through Vedic astrology.",
    education: "Ph.D. Sanskrit, Jyotish Visharad",
  },
  {
    id: 3,
    name: "Acharya Suresh Kumar",
    title: "Remedies Specialist",
    experience: "18+ years",
    specializations: ["Doshas", "Remedial Measures", "Gemstone Therapy"],
    languages: ["Hindi", "English", "Kannada"],
    rating: 4.9,
    consultations: 10000,
    price: 1000,
    available: true,
    bio: "Expert in Tantric remedies and gemstone therapy. Has helped thousands overcome challenging planetary periods through effective remedial measures.",
    education: "Jyotish Acharya, Certified Gemologist",
  },
  {
    id: 4,
    name: "Pt. Arvind Mishra",
    title: "Vastu & Astrology Expert",
    experience: "22+ years",
    specializations: ["Vastu Shastra", "Kundli Analysis", "Business Astrology"],
    languages: ["Hindi", "English"],
    rating: 4.7,
    consultations: 8500,
    price: 1300,
    available: false,
    bio: "Combined expertise in Vedic astrology and Vastu Shastra. Specializes in business astrology and property-related consultations.",
    education: "Jyotish Ratna, Vastu Visharad",
  },
  {
    id: 5,
    name: "Smt. Gayatri Sharma",
    title: "Nakshatra Specialist",
    experience: "15+ years",
    specializations: ["Nakshatra Analysis", "Child Astrology", "Name Selection"],
    languages: ["Hindi", "English", "Marathi"],
    rating: 4.8,
    consultations: 7000,
    price: 900,
    available: true,
    bio: "Specializes in Nakshatra-based predictions and child astrology. Expert in selecting auspicious names based on birth charts.",
    education: "Jyotish Visharad, Child Psychology Certification",
  },
  {
    id: 6,
    name: "Pt. Dinesh Joshi",
    title: "KP Astrology Expert",
    experience: "16+ years",
    specializations: ["KP Astrology", "Prashna Kundli", "Stock Market"],
    languages: ["Hindi", "English", "Gujarati"],
    rating: 4.6,
    consultations: 6000,
    price: 1100,
    available: true,
    bio: "Expert in Krishnamurti Paddhati (KP) astrology system. Specializes in Prashna Kundli and financial astrology for stock market predictions.",
    education: "KP Astrology Certification, MBA Finance",
  },
];

const stats = [
  { value: "100+", label: "Expert Astrologers", icon: Users },
  { value: "50,000+", label: "Consultations Done", icon: MessageCircle },
  { value: "4.8/5", label: "Average Rating", icon: Star },
  { value: "15+", label: "Years Avg Experience", icon: Award },
];

export default function AstrologersPage() {
  const { t } = useLanguage();
  return (
    <div className="py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-amber-100 text-amber-800">{t('astrologers.badge', 'Our Experts')}</Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {t('astrologers.title', 'Meet Our Verified Astrologers')}
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {t('astrologers.subtitle', 'Our team of expert Vedic astrologers brings decades of experience in Jyotish Shastra. Each astrologer is verified and follows traditional methodologies for accurate predictions.')}
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-12">
          {stats.map((stat) => (
            <Card key={stat.label} className="text-center border-amber-100">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-3">
                  <stat.icon className="w-6 h-6 text-amber-600" />
                </div>
                <div className="text-2xl font-bold text-amber-600 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {astrologers.map((astrologer) => (
            <Card key={astrologer.id} className="border-amber-100 hover:border-amber-300 transition-colors">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                    {astrologer.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{astrologer.name}</h3>
                      {astrologer.available ? (
                        <Badge className="bg-green-100 text-green-700 text-xs">Available</Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-600 text-xs">Busy</Badge>
                      )}
                    </div>
                    <p className="text-sm text-amber-600">{astrologer.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-medium ml-1">{astrologer.rating}</span>
                      </div>
                      <span className="text-gray-300">|</span>
                      <span className="text-sm text-gray-600">{astrologer.consultations.toLocaleString()} consultations</span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{astrologer.bio}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Experience:</span>
                    <span className="font-medium">{astrologer.experience}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Award className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{astrologer.education}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {astrologer.specializations.map((spec) => (
                    <Badge key={spec} variant="secondary" className="text-xs">
                      {spec}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div>
                    <span className="text-lg font-bold text-amber-600">₹{astrologer.price}</span>
                    <span className="text-sm text-gray-500">/session</span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="border-amber-500 text-amber-600">
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="border-amber-500 text-amber-600">
                      <Video className="w-4 h-4" />
                    </Button>
                    <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white">
                      <MessageCircle className="w-4 h-4 mr-1" />
                      Chat
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <section className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-8 mb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Why Choose Our Astrologers?
            </h2>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-amber-100 flex items-center justify-center mb-3">
                <CheckCircle className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Verified Experts</h3>
              <p className="text-sm text-gray-600">
                All astrologers undergo rigorous verification and testing before joining our platform.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-amber-100 flex items-center justify-center mb-3">
                <Award className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Traditional Training</h3>
              <p className="text-sm text-gray-600">
                Trained in classical Vedic texts and traditional Gurukul systems.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-amber-100 flex items-center justify-center mb-3">
                <Users className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Proven Track Record</h3>
              <p className="text-sm text-gray-600">
                Thousands of satisfied clients with consistently high ratings.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-amber-100 flex items-center justify-center mb-3">
                <MessageCircle className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Multiple Languages</h3>
              <p className="text-sm text-gray-600">
                Consultations available in Hindi, English, and regional languages.
              </p>
            </div>
          </div>
        </section>

        <Card className="bg-gradient-to-r from-amber-500 to-orange-600 text-white">
          <CardContent className="pt-6 text-center">
            <h2 className="text-2xl font-bold mb-2">Ready for Your Consultation?</h2>
            <p className="mb-4 text-amber-100">
              Book a session with our expert astrologers and get personalized guidance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-amber-600 hover:bg-amber-50" asChild>
                <Link href="/consultation">Book Consultation</Link>
              </Button>
                            <Button size="lg" className="bg-white text-amber-600 hover:bg-amber-50" asChild>
                              <Link href="/tools/kundli-calculator">Try Free Kundli First</Link>
                            </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
