"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Newspaper,
  Download,
  Mail,
  ChevronDown,
  ChevronUp,
  Calendar,
  Users,
  Star,
  TrendingUp,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { getCurrentYear } from "@/lib/utils";

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
  const [expandedRelease, setExpandedRelease] = useState<number | null>(null);
  const currentYear = getCurrentYear();

  const stats = [
    { value: "50,000+", label: t('press.usersServed', 'Users Served'), icon: Users },
    { value: "100+", label: t('press.expertAstrologers', 'Expert Astrologers'), icon: Star },
    { value: "4.8/5", label: t('press.userRating', 'User Rating'), icon: TrendingUp },
    { value: "2024", label: t('press.founded', 'Founded'), icon: Calendar },
  ];

  const pressReleases = [
    {
      id: 1,
      title: t('press.release1Title', 'VedicStarAstro Launches AI-Powered Kundli Analysis'),
      date: `${t('press.january', 'January')} ${currentYear}`,
      excerpt: t('press.release1Excerpt', 'VedicStarAstro introduces advanced AI technology combined with traditional Vedic astrology for more accurate birth chart analysis.'),
      fullContent: t('press.release1Full', 'VedicStarAstro, the leading platform for authentic Vedic astrology services, today announced the launch of its revolutionary AI-powered Kundli analysis feature. This groundbreaking technology combines the ancient wisdom of Jyotish Shastra with cutting-edge artificial intelligence to provide users with more accurate and detailed birth chart interpretations. The new feature analyzes planetary positions, house placements, and dasha periods with unprecedented precision, offering personalized insights that were previously only available through in-person consultations with expert astrologers. Users can now receive comprehensive birth chart analysis within minutes, complete with detailed explanations of planetary influences and practical remedies.'),
    },
    {
      id: 2,
      title: t('press.release2Title', 'VedicStarAstro Reaches 50,000 Users Milestone'),
      date: t('press.december2025', 'December 2025'),
      excerpt: t('press.release2Excerpt', 'The platform celebrates serving over 50,000 users with free Kundli generation and expert consultations.'),
      fullContent: t('press.release2Full', 'VedicStarAstro proudly announces reaching the milestone of 50,000 registered users, marking a significant achievement in making authentic Vedic astrology accessible to everyone. Since its launch in 2024, the platform has provided free Kundli generation services to thousands of users seeking guidance through traditional Jyotish wisdom. The platform has also facilitated over 10,000 expert consultations, connecting users with verified astrologers who have 10-25+ years of experience. This milestone reflects the growing trust in VedicStarAstro commitment to authenticity, accuracy, and user satisfaction. The company plans to expand its services further in the coming year.'),
    },
    {
      id: 3,
      title: t('press.release3Title', 'Partnership with Leading Vedic Astrology Institutions'),
      date: t('press.november2025', 'November 2025'),
      excerpt: t('press.release3Excerpt', 'VedicStarAstro announces partnerships with traditional Jyotish institutions to ensure authenticity of services.'),
      fullContent: t('press.release3Full', 'VedicStarAstro has established strategic partnerships with several prestigious Vedic astrology institutions across India to enhance the authenticity and quality of its services. These partnerships include collaborations with traditional Jyotish schools in Varanasi, Ujjain, and other centers of Vedic learning. Through these partnerships, VedicStarAstro will offer certified courses, workshops, and advanced training programs for aspiring astrologers. The collaborations also ensure that all astrologers on the platform are verified by recognized institutions, maintaining the highest standards of traditional Jyotish practice while making these services accessible through modern technology.'),
    },
  ];

  const toggleRelease = (id: number) => {
    setExpandedRelease(expandedRelease === id ? null : id);
  };

  return (
    <div className="py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-amber-100 text-amber-800">{t('press.badge', 'Press & Media')}</Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {t('press.title', 'Press Room')}
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {t('press.subtitle', "Welcome to VedicStarAstro's press room. Find our latest news, media resources, and brand assets here.")}
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center border-amber-100">
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
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('press.aboutTitle', 'About VedicStarAstro')}</h2>
              <div className="prose prose-gray">
                <p className="text-gray-700 mb-4">
                  {t('press.aboutDesc1', 'VedicStarAstro is a leading online platform for authentic Vedic astrology services. Founded in 2024, we combine ancient Jyotish Shastra wisdom with modern technology to provide accurate birth chart analysis, personalized predictions, and expert consultations.')}
                </p>
                <p className="text-gray-700 mb-4">
                  {t('press.aboutDesc2', 'Our platform features free tools like Kundli Calculator and Nakshatra Finder, along with paid consultations with verified astrologers who have 10-25+ years of experience.')}
                </p>
                <p className="text-gray-700">
                  {t('press.aboutDesc3', 'Based in Bangalore, India, VedicStarAstro serves users across India and internationally, making authentic Vedic astrology accessible to everyone.')}
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">{t('press.mediaContact', 'Media Contact')}</h3>
              <p className="text-gray-700 mb-6">
                {t('press.mediaContactDesc', 'For press inquiries, interviews, or media requests, please contact our communications team.')}
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
                    {t('press.contactPressTeam', 'Contact Press Team')}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              {t('press.pressReleases', 'Press Releases')}
            </h2>
          </div>

          <div className="space-y-4">
            {pressReleases.map((release) => (
              <Card key={release.id} className="border-amber-100 hover:border-amber-300 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Newspaper className="w-5 h-5 text-amber-600" />
                          <span className="text-sm text-gray-500">{release.date}</span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{release.title}</h3>
                        <p className="text-gray-600">{release.excerpt}</p>
                      </div>
                      <Button 
                        variant="outline" 
                        className="border-amber-500 text-amber-600"
                        onClick={() => toggleRelease(release.id)}
                      >
                        {expandedRelease === release.id ? t('press.showLess', 'Show Less') : t('press.readMore', 'Read More')}
                        {expandedRelease === release.id ? (
                          <ChevronUp className="w-4 h-4 ml-2" />
                        ) : (
                          <ChevronDown className="w-4 h-4 ml-2" />
                        )}
                      </Button>
                    </div>
                    {expandedRelease === release.id && (
                      <div className="mt-4 pt-4 border-t border-amber-100">
                        <p className="text-gray-700 leading-relaxed">{release.fullContent}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              {t('press.mediaCoverage', 'Media Coverage')}
            </h2>
            <p className="text-gray-600">
              {t('press.mediaCoverageDesc', 'VedicStarAstro in the news')}
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
                <h2 className="text-2xl font-bold mb-2">{t('press.brandAssets', 'Brand Assets & Press Kit')}</h2>
                <p className="mb-6 text-gray-300 max-w-2xl mx-auto">
                  {t('press.brandAssetsDesc', 'Download our official logos, brand guidelines, and high-resolution images for media use. Please follow our brand guidelines when using these assets.')}
                </p>
                <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-white" asChild>
                  <Link href="mailto:press@vedicstarastro.com?subject=Press Kit Request">
                    <Download className="w-4 h-4 mr-2" />
                    {t('press.requestPressKit', 'Request Press Kit')}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <div className="bg-amber-50 rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('press.interviewRequests', 'Interview Requests')}</h2>
            <p className="text-gray-700 max-w-2xl mx-auto mb-6">
              {t('press.interviewRequestsDesc', 'Our founders and expert astrologers are available for interviews on topics including Vedic astrology, technology in traditional practices, and the future of spiritual wellness.')}
            </p>
            <Button className="bg-amber-500 hover:bg-amber-600 text-white" asChild>
              <Link href="mailto:press@vedicstarastro.com?subject=Interview Request">
                {t('press.requestInterview', 'Request an Interview')}
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
