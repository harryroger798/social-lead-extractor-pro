"use client";

import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Newspaper,
  Download,
  Mail,
  ExternalLink,
  Calendar,
  Users,
  Star,
  TrendingUp,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export const metadata: Metadata = {
  title: "Press & Media - VedicStarAstro",
  description:
    "VedicStarAstro press kit, media resources, and news. Download brand assets and get in touch with our media team.",
  keywords: [
    "vedicstarastro press",
    "astrology news",
    "media kit",
    "press release",
  ],
  openGraph: {
    title: "Press & Media - VedicStarAstro",
    description:
      "Press resources and media information for VedicStarAstro.",
    type: "website",
  },
};

const pressReleases = [
  {
    id: 1,
    title: "VedicStarAstro Launches AI-Powered Kundli Analysis",
    date: "January 2026",
    excerpt:
      "VedicStarAstro introduces advanced AI technology combined with traditional Vedic astrology for more accurate birth chart analysis.",
  },
  {
    id: 2,
    title: "VedicStarAstro Reaches 50,000 Users Milestone",
    date: "December 2025",
    excerpt:
      "The platform celebrates serving over 50,000 users with free Kundli generation and expert consultations.",
  },
  {
    id: 3,
    title: "Partnership with Leading Vedic Astrology Institutions",
    date: "November 2025",
    excerpt:
      "VedicStarAstro announces partnerships with traditional Jyotish institutions to ensure authenticity of services.",
  },
];

const stats = [
  { value: "50,000+", label: "Users Served", icon: Users },
  { value: "100+", label: "Expert Astrologers", icon: Star },
  { value: "4.8/5", label: "User Rating", icon: TrendingUp },
  { value: "2024", label: "Founded", icon: Calendar },
];

const mediaFeatures = [
  {
    publication: "Times of India",
    title: "How Technology is Transforming Traditional Astrology",
    date: "December 2025",
  },
  {
    publication: "Economic Times",
    title: "Startup Spotlight: VedicStarAstro",
    date: "November 2025",
  },
  {
    publication: "YourStory",
    title: "Bringing Ancient Wisdom to the Digital Age",
    date: "October 2025",
  },
];

export default function PressPage() {
  const { t } = useLanguage();
  return (
    <div className="py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-amber-100 text-amber-800">Press & Media</Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Press Room
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Welcome to VedicStarAstro&apos;s press room. Find our latest news, media resources, 
            and brand assets here.
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

        <section className="mb-16">
          <div className="grid lg:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About VedicStarAstro</h2>
              <div className="prose prose-gray">
                <p className="text-gray-700 mb-4">
                  VedicStarAstro is a leading online platform for authentic Vedic astrology services. 
                  Founded in 2024, we combine ancient Jyotish Shastra wisdom with modern technology 
                  to provide accurate birth chart analysis, personalized predictions, and expert 
                  consultations.
                </p>
                <p className="text-gray-700 mb-4">
                  Our platform features free tools like Kundli Calculator and Nakshatra Finder, 
                  along with paid consultations with verified astrologers who have 10-25+ years 
                  of experience.
                </p>
                <p className="text-gray-700">
                  Based in Bangalore, India, VedicStarAstro serves users across India and 
                  internationally, making authentic Vedic astrology accessible to everyone.
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Media Contact</h3>
              <p className="text-gray-700 mb-6">
                For press inquiries, interviews, or media requests, please contact our communications team.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-amber-600" />
                  <a href="mailto:press@vedicstarastro.com" className="text-amber-600 hover:underline">
                    press@vedicstarastro.com
                  </a>
                </div>
              </div>
              <div className="mt-6">
                <Button className="bg-amber-500 hover:bg-amber-600 text-white" asChild>
                  <Link href="mailto:press@vedicstarastro.com">
                    <Mail className="w-4 h-4 mr-2" />
                    Contact Press Team
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Press Releases
            </h2>
          </div>

          <div className="space-y-4">
            {pressReleases.map((release) => (
              <Card key={release.id} className="border-amber-100 hover:border-amber-300 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Newspaper className="w-5 h-5 text-amber-600" />
                        <span className="text-sm text-gray-500">{release.date}</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{release.title}</h3>
                      <p className="text-gray-600">{release.excerpt}</p>
                    </div>
                    <Button variant="outline" className="border-amber-500 text-amber-600">
                      Read More
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Media Coverage
            </h2>
            <p className="text-gray-600">
              VedicStarAstro in the news
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {mediaFeatures.map((feature, index) => (
              <Card key={index} className="border-amber-100">
                <CardContent className="pt-6">
                  <Badge className="mb-3 bg-gray-100 text-gray-700">{feature.publication}</Badge>
                  <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-500">{feature.date}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <Card className="bg-gradient-to-r from-gray-800 to-gray-900 text-white">
            <CardContent className="pt-6">
              <div className="text-center">
                <Download className="w-12 h-12 mx-auto mb-4 text-amber-400" />
                <h2 className="text-2xl font-bold mb-2">Brand Assets & Press Kit</h2>
                <p className="mb-6 text-gray-300 max-w-2xl mx-auto">
                  Download our official logos, brand guidelines, and high-resolution images 
                  for media use. Please follow our brand guidelines when using these assets.
                </p>
                <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-white" asChild>
                  <Link href="mailto:press@vedicstarastro.com?subject=Press Kit Request">
                    <Download className="w-4 h-4 mr-2" />
                    Request Press Kit
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <div className="bg-amber-50 rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Interview Requests</h2>
            <p className="text-gray-700 max-w-2xl mx-auto mb-6">
              Our founders and expert astrologers are available for interviews on topics including 
              Vedic astrology, technology in traditional practices, and the future of spiritual wellness.
            </p>
            <Button className="bg-amber-500 hover:bg-amber-600 text-white" asChild>
              <Link href="mailto:press@vedicstarastro.com?subject=Interview Request">
                Request an Interview
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
