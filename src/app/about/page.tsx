import { Metadata } from "next";
import Link from "next/link";
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

export const metadata: Metadata = {
  title: "About VedicStarAstro - Our Story & Mission",
  description:
    "Learn about VedicStarAstro's mission to make authentic Vedic astrology accessible to everyone. Meet our team of expert astrologers with 20+ years of experience.",
  keywords: [
    "about vedicstarastro",
    "vedic astrology experts",
    "astrology team",
    "jyotish experts",
  ],
  openGraph: {
    title: "About VedicStarAstro - Our Story & Mission",
    description:
      "Learn about VedicStarAstro's mission to make authentic Vedic astrology accessible to everyone.",
    type: "website",
  },
};

const stats = [
  { value: "50,000+", label: "Charts Generated", icon: Star },
  { value: "10,000+", label: "Happy Clients", icon: Users },
  { value: "100+", label: "Expert Astrologers", icon: Award },
  { value: "15+", label: "Years Experience", icon: Clock },
];

const values = [
  {
    icon: Shield,
    title: "Authenticity",
    description: "We follow traditional Parashari and Jaimini systems, ensuring our predictions are rooted in ancient Vedic wisdom.",
  },
  {
    icon: Target,
    title: "Accuracy",
    description: "Our calculations use Swiss Ephemeris for precise planetary positions, combined with expert interpretation.",
  },
  {
    icon: Heart,
    title: "Compassion",
    description: "We approach every consultation with empathy, understanding that astrology touches deeply personal aspects of life.",
  },
  {
    icon: BookOpen,
    title: "Education",
    description: "We believe in empowering our clients with knowledge, not just predictions, so they can understand their own charts.",
  },
];

const team = [
  {
    name: "Pt. Ramesh Sharma",
    role: "Founder & Chief Astrologer",
    experience: "25+ years",
    specialization: "Kundli Analysis, Career Predictions",
    bio: "A renowned Vedic astrologer trained in the traditional Gurukul system, Pt. Ramesh Sharma has dedicated his life to making authentic Jyotish accessible to the modern world.",
  },
  {
    name: "Dr. Lakshmi Devi",
    role: "Senior Astrologer",
    experience: "20+ years",
    specialization: "Marriage Compatibility, Relationships",
    bio: "With a Ph.D. in Sanskrit and specialization in Jaimini astrology, Dr. Lakshmi brings academic rigor to traditional astrological practice.",
  },
  {
    name: "Acharya Suresh Kumar",
    role: "Remedies Specialist",
    experience: "18+ years",
    specialization: "Doshas, Remedial Measures",
    bio: "An expert in Tantric remedies and gemstone therapy, Acharya Suresh has helped thousands overcome challenging planetary periods.",
  },
];

export default function AboutPage() {
  return (
    <div className="py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-amber-100 text-amber-800">About Us</Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Bringing Ancient Wisdom to Modern Lives
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            VedicStarAstro was founded with a simple mission: to make authentic Vedic astrology 
            accessible to everyone, combining ancient wisdom with modern technology.
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
                Our Story
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  VedicStarAstro began in 2010 when our founder, Pt. Ramesh Sharma, recognized 
                  a growing disconnect between authentic Vedic astrology and the commercialized 
                  predictions flooding the internet. Having trained in the traditional Gurukul 
                  system under renowned masters, he saw the need for a platform that honored 
                  the depth and precision of Jyotish Shastra.
                </p>
                <p>
                  What started as a small consultation practice in Bangalore has grown into 
                  a trusted platform serving clients across India and the world. Our team of 
                  verified astrologers follows strict ethical guidelines and undergoes rigorous 
                  testing to ensure the quality of their predictions.
                </p>
                <p>
                  Today, VedicStarAstro combines the wisdom of ancient texts like Brihat 
                  Parashara Hora Shastra with modern technology, offering accurate calculations 
                  and personalized insights that help people navigate life&apos;s challenges with 
                  clarity and confidence.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 p-8 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                    <Star className="w-16 h-16 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Since 2010</h3>
                  <p className="text-gray-600">Serving seekers of cosmic wisdom</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Our Values
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              These core principles guide everything we do at VedicStarAstro.
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
              Meet Our Team
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our astrologers are verified experts with decades of experience in Vedic astrology.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {team.map((member) => (
              <Card key={member.name} className="border-amber-100">
                <CardContent className="pt-6">
                  <div className="text-center mb-4">
                    <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-3xl font-bold mb-3">
                      {member.name.charAt(0)}
                    </div>
                    <h3 className="font-semibold text-gray-900">{member.name}</h3>
                    <p className="text-sm text-amber-600">{member.role}</p>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Experience:</span>
                      <span className="font-medium">{member.experience}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-600">Specialization:</span>
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
              Our Approach
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-amber-100 flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-amber-600">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Traditional Foundation</h3>
              <p className="text-sm text-gray-600">
                All our astrologers are trained in classical Vedic texts and follow 
                time-tested methodologies passed down through generations.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-amber-100 flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-amber-600">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Modern Technology</h3>
              <p className="text-sm text-gray-600">
                We use Swiss Ephemeris for precise calculations and modern tools 
                to deliver accurate, instant results for our users.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-amber-100 flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-amber-600">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Personalized Guidance</h3>
              <p className="text-sm text-gray-600">
                Every consultation is tailored to your unique chart and circumstances, 
                with practical remedies you can actually implement.
              </p>
            </div>
          </div>
        </section>

        <Card className="bg-gradient-to-r from-amber-500 to-orange-600 text-white">
          <CardContent className="pt-6 text-center">
            <h2 className="text-2xl font-bold mb-2">Ready to Explore Your Chart?</h2>
            <p className="mb-4 text-amber-100">
              Start with a free Kundli or book a consultation with our expert astrologers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-amber-600 hover:bg-amber-50" asChild>
                <Link href="/tools/kundli-calculator">Generate Free Kundli</Link>
              </Button>
                            <Button size="lg" className="bg-white text-amber-600 hover:bg-amber-50" asChild>
                              <Link href="/consultation">Book Consultation</Link>
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
                  name: "Pt. Ramesh Sharma",
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
