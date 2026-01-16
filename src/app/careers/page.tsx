"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Briefcase,
  MapPin,
  Clock,
  Users,
  Heart,
  Zap,
  BookOpen,
  Star,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const openPositions = [
  {
    id: 1,
    title: "Senior Vedic Astrologer",
    department: "Astrology",
    location: "Remote / Bangalore",
    type: "Full-time",
    experience: "10+ years",
    description:
      "Join our team of expert astrologers to provide consultations and create content for our platform.",
    requirements: [
      "Jyotish Acharya or equivalent certification",
      "10+ years of professional astrology experience",
      "Fluency in Hindi and English",
      "Experience with online consultations",
    ],
  },
  {
    id: 2,
    title: "Full Stack Developer",
    department: "Technology",
    location: "Bangalore / Remote",
    type: "Full-time",
    experience: "3-5 years",
    description:
      "Build and maintain our web platform using Next.js, React, and Python.",
    requirements: [
      "Strong experience with React/Next.js",
      "Python backend development",
      "Database design and optimization",
      "Interest in astrology is a plus",
    ],
  },
  {
    id: 3,
    title: "Content Writer - Astrology",
    department: "Content",
    location: "Remote",
    type: "Full-time / Part-time",
    experience: "2+ years",
    description:
      "Create engaging, SEO-optimized content about Vedic astrology, Nakshatras, and related topics.",
    requirements: [
      "Excellent writing skills in English",
      "Knowledge of Vedic astrology concepts",
      "SEO content writing experience",
      "Ability to explain complex topics simply",
    ],
  },
  {
    id: 4,
    title: "Customer Support Executive",
    department: "Operations",
    location: "Bangalore",
    type: "Full-time",
    experience: "1-3 years",
    description:
      "Provide excellent support to our users and help them with consultation bookings and queries.",
    requirements: [
      "Excellent communication skills",
      "Experience in customer support",
      "Fluency in Hindi and English",
      "Basic understanding of astrology",
    ],
  },
];

const benefits = [
  {
    icon: Heart,
    title: "Health Insurance",
    description: "Comprehensive health coverage for you and your family.",
  },
  {
    icon: Clock,
    title: "Flexible Hours",
    description: "Work-life balance with flexible working hours.",
  },
  {
    icon: BookOpen,
    title: "Learning Budget",
    description: "Annual budget for courses, books, and conferences.",
  },
  {
    icon: Zap,
    title: "Growth Opportunities",
    description: "Fast-growing company with career advancement paths.",
  },
];

const values = [
  {
    icon: Star,
    title: "Authenticity",
    description: "We honor traditional Vedic wisdom while embracing modern technology.",
  },
  {
    icon: Users,
    title: "Collaboration",
    description: "We work together across teams to deliver the best experience.",
  },
  {
    icon: Heart,
    title: "Compassion",
    description: "We approach our work with empathy for those seeking guidance.",
  },
];

export default function CareersPage() {
  const { t } = useLanguage();
  return (
    <div className="py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-amber-100 text-amber-800">Careers</Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Join Our Mission
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Help us bring authentic Vedic astrology to millions of people worldwide. 
            We&apos;re building a platform that combines ancient wisdom with modern technology.
          </p>
        </div>

        <section className="mb-16">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Our Values
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {values.map((value) => (
                <div key={value.title} className="text-center">
                  <div className="w-12 h-12 mx-auto rounded-full bg-amber-100 flex items-center justify-center mb-3">
                    <value.icon className="w-6 h-6 text-amber-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{value.title}</h3>
                  <p className="text-sm text-gray-600">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Open Positions
            </h2>
            <p className="text-gray-600">
              Find your perfect role and grow with us.
            </p>
          </div>

          <div className="space-y-4">
            {openPositions.map((position) => (
              <Card key={position.id} className="border-amber-100 hover:border-amber-300 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">{position.title}</h3>
                        <Badge className="bg-amber-100 text-amber-800">{position.department}</Badge>
                      </div>
                      <p className="text-gray-600 mb-3">{position.description}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {position.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Briefcase className="w-4 h-4" />
                          {position.type}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {position.experience}
                        </div>
                      </div>
                    </div>
                    <Button className="bg-amber-500 hover:bg-amber-600 text-white" asChild>
                      <Link href={`mailto:careers@vedicstarastro.com?subject=Application for ${position.title}`}>
                        Apply Now
                      </Link>
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
              Benefits & Perks
            </h2>
            <p className="text-gray-600">
              We take care of our team so they can focus on what matters.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit) => (
              <Card key={benefit.title} className="border-amber-100 text-center">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 mx-auto rounded-full bg-amber-100 flex items-center justify-center mb-3">
                    <benefit.icon className="w-6 h-6 text-amber-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-sm text-gray-600">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <Card className="bg-gradient-to-r from-amber-500 to-orange-600 text-white">
            <CardContent className="pt-6 text-center">
              <h2 className="text-2xl font-bold mb-2">Don&apos;t See a Perfect Fit?</h2>
              <p className="mb-4 text-amber-100">
                We&apos;re always looking for talented people. Send us your resume and we&apos;ll keep you in mind.
              </p>
              <Button size="lg" className="bg-white text-amber-600 hover:bg-amber-50" asChild>
                <Link href="mailto:careers@vedicstarastro.com">Send Your Resume</Link>
              </Button>
            </CardContent>
          </Card>
        </section>

        <section>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Apply</h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-6">
              Send your resume and a brief cover letter to <strong>careers@vedicstarastro.com</strong> with 
              the position title in the subject line. We review all applications and will get back to you 
              within 5-7 business days.
            </p>
            <p className="text-sm text-gray-500">
              VedicStarAstro is an equal opportunity employer. We celebrate diversity and are committed 
              to creating an inclusive environment for all employees.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
