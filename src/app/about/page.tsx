"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  Users,
  Award,
  Shield,
  Heart,
  Target,
  BookOpen,
  Clock,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { CDN_IMAGES } from "@/lib/cdn";

export default function AboutPage() {
  const { t } = useLanguage();
  
  const stats = [
    { value: "50,000+", label: t('about.chartsGenerated', 'Charts Generated'), icon: Star },
    { value: "10,000+", label: t('about.happyClients', 'Happy Clients'), icon: Users },
    { value: "100+", label: t('about.expertAstrologers', 'Expert Astrologers'), icon: Award },
    { value: "15+", label: t('about.yearsExperience', 'Years Experience'), icon: Clock },
  ];

  const values = [
    {
      icon: Shield,
      title: t('about.authenticity', 'Authenticity'),
      description: t('about.authenticityDesc', 'We follow traditional Parashari and Jaimini systems, ensuring our predictions are rooted in ancient Vedic wisdom.'),
    },
    {
      icon: Target,
      title: t('about.accuracy', 'Accuracy'),
      description: t('about.accuracyDesc', 'Our calculations use Swiss Ephemeris for precise planetary positions, combined with expert interpretation.'),
    },
    {
      icon: Heart,
      title: t('about.compassion', 'Compassion'),
      description: t('about.compassionDesc', 'We approach every consultation with empathy, understanding that astrology touches deeply personal aspects of life.'),
    },
    {
      icon: BookOpen,
      title: t('about.education', 'Education'),
      description: t('about.educationDesc', 'We believe in empowering our clients with knowledge, not just predictions, so they can understand their own charts.'),
    },
  ];

    const team = [
      {
        name: "Acharya Shridhar Khandal",
        role: t('about.founderRole', 'Founder & Chief Astrologer'),
        experience: t('about.exp35', '35+ years'),
        specialization: t('about.specAstroVastuPoojaGems', 'Astro, Vastu, Pooja & Gems'),
        bio: t('about.bioShridhar', 'A renowned Vedic astrologer with 35 years of experience in Astrology, Vastu, Pooja, and Gemstone consultation. Based in Bengaluru, Acharya Shridhar has dedicated his life to making authentic Jyotish accessible to the modern world.'),
        location: t('about.locationBengaluru', 'Bengaluru'),
        image: CDN_IMAGES.astrologers.acharyaShridhar,
      },
      {
        name: "Madhav Sharma",
        role: t('about.seniorRole', 'Senior Astrologer'),
        experience: t('about.exp20', '20+ years'),
        specialization: t('about.specAstroPoojaGems', 'Astro, Pooja & Gems'),
        bio: t('about.bioMadhav', 'With 20 years of experience in Astrology, Pooja, and Gemstone consultation, Madhav Sharma brings deep expertise to traditional astrological practice from Jaipur.'),
        location: t('about.locationJaipur', 'Jaipur'),
        image: CDN_IMAGES.astrologers.madhavSharma,
      },
      {
        name: "Raj Kumar Shastri",
        role: t('about.remediesRole', 'Remedies Specialist'),
        experience: t('about.exp16', '16+ years'),
        specialization: t('about.specAstroVastuPooja', 'Astro, Vastu & Pooja'),
        bio: t('about.bioRajKumar', 'An expert in Astrology, Vastu, and Pooja with 16 years of experience, Raj Kumar Shastri has helped thousands from Kolkata overcome challenging planetary periods.'),
        location: t('about.locationKolkata', 'Kolkata (WB)'),
        image: CDN_IMAGES.astrologers.rajKumarShastri,
      },
    ];
  return (
    <div className="py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-amber-100 text-amber-800">{t('about.badge', 'About Us')}</Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {t('about.title', 'Bringing Ancient Wisdom to Modern Lives')}
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {t('about.subtitle', 'VedicStarAstro was founded with a simple mission: to make authentic Vedic astrology accessible to everyone, combining ancient wisdom with modern technology.')}
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat) => (
            <Card key={stat.label} className="text-center border-amber-100">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-3">
                  <stat.icon className="w-6 h-6 text-amber-600" />
                </div>
                <div className="text-3xl font-bold text-amber-600 mb-1">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <section className="mb-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                {t('about.ourStory', 'Our Story')}
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  {t('about.storyP1', 'VedicStarAstro began in 2010 when our founder, Acharya Shridhar Khandal, recognized a growing disconnect between authentic Vedic astrology and the commercialized predictions flooding the internet. Having trained in the traditional Gurukul system under renowned masters, he saw the need for a platform that honored the depth and precision of Jyotish Shastra.')}
                </p>
                <p>
                  {t('about.storyP2', 'What started as a small consultation practice in Bangalore has grown into a trusted platform serving clients across India and the world. Our team of verified astrologers follows strict ethical guidelines and undergoes rigorous testing to ensure the quality of their predictions.')}
                </p>
                <p>
                  {t('about.storyP3', 'Today, VedicStarAstro combines the wisdom of ancient texts like Brihat Parashara Hora Shastra with modern technology, offering accurate calculations and personalized insights that help people navigate life\'s challenges with clarity and confidence.')}
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 p-8 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                    <Star className="w-16 h-16 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('about.since2010', 'Since 2010')}</h3>
                  <p className="text-gray-600">{t('about.servingSeekers', 'Serving seekers of cosmic wisdom')}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              {t('about.ourValues', 'Our Values')}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {t('about.valuesSubtitle', 'These core principles guide everything we do at VedicStarAstro.')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => (
              <Card key={value.title} className="border-amber-100 hover:border-amber-300 transition-colors">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center mb-4">
                    <value.icon className="w-6 h-6 text-amber-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{value.title}</h3>
                  <p className="text-sm text-gray-600">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              {t('about.meetOurTeam', 'Meet Our Team')}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {t('about.teamSubtitle', 'Our astrologers are verified experts with decades of experience in Vedic astrology.')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {team.map((member) => (
              <Card key={member.name} className="border-amber-100">
                <CardContent className="pt-6">
                  <div className="text-center mb-4">
                    <div className="w-24 h-24 mx-auto rounded-full overflow-hidden mb-3">
                      <Image
                        src={member.image}
                        alt={member.name}
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="font-semibold text-gray-900">{member.name}</h3>
                    <p className="text-sm text-amber-600">{member.role}</p>
                    <p className="text-xs text-gray-500">{member.location}</p>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{t('about.experience', 'Experience')}:</span>
                      <span className="font-medium">{member.experience}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-600">{t('about.specialization', 'Specialization')}:</span>
                      <p className="font-medium">{member.specialization}</p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mb-16 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              {t('about.ourApproach', 'Our Approach')}
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-amber-100 flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-amber-600">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{t('about.traditionalFoundation', 'Traditional Foundation')}</h3>
              <p className="text-sm text-gray-600">
                {t('about.traditionalFoundationDesc', 'All our astrologers are trained in classical Vedic texts and follow time-tested methodologies passed down through generations.')}
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-amber-100 flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-amber-600">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{t('about.modernTechnology', 'Modern Technology')}</h3>
              <p className="text-sm text-gray-600">
                {t('about.modernTechnologyDesc', 'We use Swiss Ephemeris for precise calculations and modern tools to deliver accurate, instant results for our users.')}
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-amber-100 flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-amber-600">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{t('about.personalizedGuidance', 'Personalized Guidance')}</h3>
              <p className="text-sm text-gray-600">
                {t('about.personalizedGuidanceDesc', 'Every consultation is tailored to your unique chart and circumstances, with practical remedies you can actually implement.')}
              </p>
            </div>
          </div>
        </section>

        <Card className="bg-gradient-to-r from-amber-500 to-orange-600 text-white">
          <CardContent className="pt-6 text-center">
            <h2 className="text-2xl font-bold mb-2">{t('about.readyToExplore', 'Ready to Explore Your Chart?')}</h2>
            <p className="mb-4 text-amber-100">
              {t('about.startWithFree', 'Start with a free Kundli or book a consultation with our expert astrologers.')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-amber-600 hover:bg-amber-50" asChild>
                <Link href="/tools/kundli-calculator">{t('about.generateFreeKundli', 'Generate Free Kundli')}</Link>
              </Button>
              <Button size="lg" className="bg-white text-amber-600 hover:bg-amber-50" asChild>
                <Link href="/consultation">{t('about.bookConsultation', 'Book Consultation')}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AboutPage",
            mainEntity: {
              "@type": "Organization",
              name: "VedicStarAstro",
              description: "Authentic Vedic Astrology services",
              foundingDate: "2010",
              founders: [
                {
                  "@type": "Person",
                  name: "Acharya Shridhar Khandal",
                  jobTitle: "Founder & Chief Astrologer",
                },
              ],
            },
          }),
        }}
      />
    </div>
  );
}
