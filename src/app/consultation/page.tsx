import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Phone,
  Video,
  MessageSquare,
  Clock,
  Star,
  Shield,
  CheckCircle,
  Users,
  Award,
  Calendar,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Book Vedic Astrology Consultation - Expert Astrologers",
  description:
    "Book a personalized Vedic astrology consultation with our expert astrologers. Get guidance on career, marriage, health, and life decisions. Phone, video, and chat options available.",
  keywords: [
    "astrology consultation",
    "vedic astrology consultation",
    "talk to astrologer",
    "online astrology consultation",
    "kundli consultation",
    "horoscope consultation",
  ],
  openGraph: {
    title: "Book Vedic Astrology Consultation - Expert Astrologers",
    description:
      "Get personalized guidance from expert Vedic astrologers. Multiple consultation options available.",
    type: "website",
  },
};

const consultationTypes = [
  {
    icon: Phone,
    title: "Phone Consultation",
    duration: "30-60 minutes",
    price: "₹999",
    originalPrice: "₹1,499",
    description: "Direct phone call with our expert astrologer for personalized guidance.",
    features: [
      "One-on-one discussion",
      "Kundli analysis",
      "Personalized predictions",
      "Remedies recommendation",
      "Follow-up support",
    ],
    popular: false,
  },
  {
    icon: Video,
    title: "Video Consultation",
    duration: "45-60 minutes",
    price: "₹1,499",
    originalPrice: "₹2,499",
    description: "Face-to-face video session with screen sharing for detailed chart analysis.",
    features: [
      "Face-to-face interaction",
      "Screen sharing for charts",
      "Detailed Kundli walkthrough",
      "Visual remedies explanation",
      "Recording available",
      "Priority support",
    ],
    popular: true,
  },
  {
    icon: MessageSquare,
    title: "Chat Consultation",
    duration: "Unlimited (24 hours)",
    price: "₹499",
    originalPrice: "₹799",
    description: "Text-based consultation at your convenience within 24 hours.",
    features: [
      "Flexible timing",
      "Written analysis report",
      "Ask multiple questions",
      "Reference anytime",
      "Email summary",
    ],
    popular: false,
  },
];

const astrologers = [
  {
    name: "Pt. Ramesh Sharma",
    specialization: "Kundli Analysis, Career",
    experience: "25+ years",
    rating: 4.9,
    consultations: 15000,
    languages: ["Hindi", "English"],
    image: "/astrologers/ramesh-sharma.jpg",
  },
  {
    name: "Dr. Lakshmi Devi",
    specialization: "Marriage, Relationships",
    experience: "20+ years",
    rating: 4.8,
    consultations: 12000,
    languages: ["Hindi", "English", "Telugu"],
    image: "/astrologers/lakshmi-devi.jpg",
  },
  {
    name: "Acharya Suresh Kumar",
    specialization: "Remedies, Doshas",
    experience: "18+ years",
    rating: 4.9,
    consultations: 10000,
    languages: ["Hindi", "English", "Kannada"],
    image: "/astrologers/suresh-kumar.jpg",
  },
];

const consultationTopics = [
  "Career & Business",
  "Marriage & Relationships",
  "Health & Wellness",
  "Finance & Wealth",
  "Education & Studies",
  "Family & Children",
  "Property & Legal",
  "Foreign Travel",
  "Dosha Analysis",
  "Gemstone Recommendation",
  "Muhurta Selection",
  "Annual Predictions",
];

const testimonials = [
  {
    name: "Vikram Singh",
    location: "Delhi",
    text: "The career guidance I received was incredibly accurate. Within 3 months of following the remedies, I got my dream job promotion.",
    rating: 5,
    topic: "Career Consultation",
  },
  {
    name: "Meera Patel",
    location: "Mumbai",
    text: "We were worried about our marriage compatibility. The astrologer explained everything clearly and suggested simple remedies that worked.",
    rating: 5,
    topic: "Marriage Matching",
  },
  {
    name: "Arjun Reddy",
    location: "Hyderabad",
    text: "Very professional service. The video consultation was detailed and the astrologer took time to answer all my questions.",
    rating: 5,
    topic: "Video Consultation",
  },
];

const faqs = [
  {
    question: "What information do I need for a consultation?",
    answer: "You'll need your exact date, time, and place of birth. If you don't know your exact birth time, our astrologers can help with birth time rectification.",
  },
  {
    question: "How do I prepare for my consultation?",
    answer: "Write down your specific questions beforehand. Have your birth details ready. For video consultations, ensure you have a stable internet connection.",
  },
  {
    question: "Can I get a refund if I'm not satisfied?",
    answer: "Yes, we offer a 100% satisfaction guarantee. If you're not satisfied with your consultation, contact us within 24 hours for a full refund.",
  },
  {
    question: "How soon can I book a consultation?",
    answer: "Most consultations can be scheduled within 24-48 hours. For urgent matters, we offer same-day appointments with available astrologers.",
  },
];

export default function ConsultationPage() {
  return (
    <div className="py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-amber-100 text-amber-800">Expert Guidance</Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Book Your Vedic Astrology Consultation
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get personalized guidance from our verified expert astrologers with 15+ years 
            of experience. Choose from phone, video, or chat consultations.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {consultationTypes.map((type) => (
            <Card 
              key={type.title} 
              className={`relative ${type.popular ? "border-amber-500 border-2 shadow-lg" : "border-gray-200"}`}
            >
              {type.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-amber-500 text-white">Most Popular</Badge>
                </div>
              )}
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center mb-4">
                  <type.icon className="w-6 h-6 text-amber-600" />
                </div>
                <CardTitle>{type.title}</CardTitle>
                <CardDescription>{type.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-gray-900">{type.price}</span>
                    <span className="text-lg text-gray-400 line-through">{type.originalPrice}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                    <Clock className="w-4 h-4" />
                    {type.duration}
                  </div>
                </div>
                
                <ul className="space-y-2 mb-6">
                  {type.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={`w-full ${type.popular ? "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700" : ""}`}
                  variant={type.popular ? "default" : "outline"}
                >
                  Book Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Our Expert Astrologers
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              All our astrologers are verified experts with extensive experience in Vedic astrology.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {astrologers.map((astrologer) => (
              <Card key={astrologer.name} className="border-amber-100">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-2xl font-bold">
                      {astrologer.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{astrologer.name}</h3>
                      <p className="text-sm text-gray-600">{astrologer.specialization}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-50 rounded-lg p-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span className="font-semibold">{astrologer.rating}</span>
                      </div>
                      <p className="text-xs text-gray-500">Rating</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2 text-center">
                      <div className="font-semibold">{astrologer.experience}</div>
                      <p className="text-xs text-gray-500">Experience</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {astrologer.consultations.toLocaleString()}+ consultations
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-4">
                    {astrologer.languages.map((lang) => (
                      <Badge key={lang} variant="outline" className="text-xs">
                        {lang}
                      </Badge>
                    ))}
                  </div>
                  
                  <Button className="w-full" variant="outline">
                    <Calendar className="w-4 h-4 mr-2" />
                    Book Consultation
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Consultation Topics
            </h2>
            <p className="text-gray-600">
              Get expert guidance on any aspect of your life
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-3">
            {consultationTopics.map((topic) => (
              <Badge 
                key={topic} 
                variant="outline" 
                className="px-4 py-2 text-sm hover:bg-amber-50 hover:border-amber-300 cursor-pointer transition-colors"
              >
                {topic}
              </Badge>
            ))}
          </div>
        </section>

        <section className="mb-16 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Why Choose VedicStarAstro?
            </h2>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: Shield, title: "Verified Experts", desc: "All astrologers verified with 10+ years experience" },
              { icon: Award, title: "100% Satisfaction", desc: "Full refund if not satisfied with consultation" },
              { icon: Clock, title: "24/7 Available", desc: "Book consultations anytime, any day" },
              { icon: Users, title: "50,000+ Happy Clients", desc: "Trusted by thousands across India" },
            ].map((item) => (
              <div key={item.title} className="text-center">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-3">
                  <item.icon className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Client Testimonials
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.name} className="border-amber-100">
                <CardContent className="pt-6">
                  <Badge className="mb-3 bg-amber-100 text-amber-700">{testimonial.topic}</Badge>
                  <div className="flex gap-1 mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
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
        </section>

        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
          </div>
          
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="border-gray-200">
                <CardContent className="pt-4">
                  <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                  <p className="text-gray-600 text-sm">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Card className="bg-gradient-to-r from-amber-500 to-orange-600 text-white">
          <CardContent className="pt-6 text-center">
            <h2 className="text-2xl font-bold mb-2">Ready to Get Started?</h2>
            <p className="mb-4 text-amber-100">
              Book your consultation now and get clarity on your life&apos;s important questions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-amber-600 hover:bg-amber-50">
                Book Consultation Now
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" asChild>
                <Link href="/tools/kundli-calculator">Try Free Kundli First</Link>
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
            "@type": "Service",
            name: "Vedic Astrology Consultation",
            provider: {
              "@type": "Organization",
              name: "VedicStarAstro",
            },
            description: "Personalized Vedic astrology consultation with expert astrologers",
            offers: [
              {
                "@type": "Offer",
                name: "Phone Consultation",
                price: "999",
                priceCurrency: "INR",
              },
              {
                "@type": "Offer",
                name: "Video Consultation",
                price: "1499",
                priceCurrency: "INR",
              },
              {
                "@type": "Offer",
                name: "Chat Consultation",
                price: "499",
                priceCurrency: "INR",
              },
            ],
          }),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: { "@type": "Answer", text: faq.answer },
            })),
          }),
        }}
      />
    </div>
  );
}
