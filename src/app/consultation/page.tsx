"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  Star,
  Shield,
  CheckCircle,
  Users,
  Award,
  Calendar,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

// Testimonials stay in original language as requested by user
// consultationTypes, astrologers, consultationTopics moved inside component to use t() function

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


export default function ConsultationPage() {
  const { t } = useLanguage();

  const consultationTypes = [
    {
      image: "/images/phone-consultation.png",
      title: t('consultation.phoneTitle', 'Phone Consultation'),
      duration: t('consultation.phoneDuration', '30-60 minutes'),
      price: "₹999",
      originalPrice: "₹1,499",
      description: t('consultation.phoneDesc', 'Direct phone call with our expert astrologer for personalized guidance.'),
      features: [
        t('consultation.feature.oneOnOne', 'One-on-one discussion'),
        t('consultation.feature.kundliAnalysis', 'Kundli analysis'),
        t('consultation.feature.personalizedPredictions', 'Personalized predictions'),
        t('consultation.feature.remediesRecommendation', 'Remedies recommendation'),
        t('consultation.feature.followUpSupport', 'Follow-up support'),
      ],
      popular: false,
    },
    {
      image: "/images/video-consultation.png",
      title: t('consultation.videoTitle', 'Video Consultation'),
      duration: t('consultation.videoDuration', '45-60 minutes'),
      price: "₹1,499",
      originalPrice: "₹2,499",
      description: t('consultation.videoDesc', 'Face-to-face video session with screen sharing for detailed chart analysis.'),
      features: [
        t('consultation.feature.faceToFace', 'Face-to-face interaction'),
        t('consultation.feature.screenSharing', 'Screen sharing for charts'),
        t('consultation.feature.detailedWalkthrough', 'Detailed Kundli walkthrough'),
        t('consultation.feature.visualRemedies', 'Visual remedies explanation'),
        t('consultation.feature.recordingAvailable', 'Recording available'),
        t('consultation.feature.prioritySupport', 'Priority support'),
      ],
      popular: true,
    },
    {
      image: "/images/chat-consultation.png",
      title: t('consultation.chatTitle', 'Chat Consultation'),
      duration: t('consultation.chatDuration', 'Unlimited (24 hours)'),
      price: "₹499",
      originalPrice: "₹799",
      description: t('consultation.chatDesc', 'Text-based consultation at your convenience within 24 hours.'),
      features: [
        t('consultation.feature.flexibleTiming', 'Flexible timing'),
        t('consultation.feature.writtenReport', 'Written analysis report'),
        t('consultation.feature.multipleQuestions', 'Ask multiple questions'),
        t('consultation.feature.referenceAnytime', 'Reference anytime'),
        t('consultation.feature.emailSummary', 'Email summary'),
      ],
      popular: false,
    },
  ];

  const astrologers = [
    {
      name: "Acharya Shridhar Khandal",
      specialization: t('consultation.spec.astroVastuPoojaGems', 'Astro, Vastu, Pooja & Gems'),
      experience: t('consultation.exp.35years', '35+ years'),
      rating: 4.9,
      consultations: 15000,
      languages: [t('common.hindi', 'Hindi'), t('common.english', 'English'), t('common.kannada', 'Kannada')],
      image: "/images/astrologers/acharya-shridhar-khandal.png",
    },
    {
      name: "Madhav Sharma",
      specialization: t('consultation.spec.astroPoojaGems', 'Astro, Pooja & Gems'),
      experience: t('consultation.exp.20years', '20+ years'),
      rating: 4.8,
      consultations: 12000,
      languages: [t('common.hindi', 'Hindi'), t('common.english', 'English')],
      image: "/images/astrologers/madhav-sharma.png",
    },
    {
      name: "Raj Kumar Shastri",
      specialization: t('consultation.spec.astroVastuPooja', 'Astro, Vastu & Pooja'),
      experience: t('consultation.exp.16years', '16+ years'),
      rating: 4.9,
      consultations: 10000,
      languages: [t('common.hindi', 'Hindi'), t('common.english', 'English'), t('common.bengali', 'Bengali')],
      image: "/images/astrologers/raj-kumar-shastri.png",
    },
  ];

  const consultationTopics = [
    t('consultation.topic.careerBusiness', 'Career & Business'),
    t('consultation.topic.marriageRelationships', 'Marriage & Relationships'),
    t('consultation.topic.healthWellness', 'Health & Wellness'),
    t('consultation.topic.financeWealth', 'Finance & Wealth'),
    t('consultation.topic.educationStudies', 'Education & Studies'),
    t('consultation.topic.familyChildren', 'Family & Children'),
    t('consultation.topic.propertyLegal', 'Property & Legal'),
    t('consultation.topic.foreignTravel', 'Foreign Travel'),
    t('consultation.topic.doshaAnalysis', 'Dosha Analysis'),
    t('consultation.topic.gemstoneRecommendation', 'Gemstone Recommendation'),
    t('consultation.topic.muhurtaSelection', 'Muhurta Selection'),
    t('consultation.topic.annualPredictions', 'Annual Predictions'),
  ];

  const faqs = [
    {
      question: t('consultation.faq.q1', 'What information do I need for a consultation?'),
      answer: t('consultation.faq.a1', "You'll need your exact date, time, and place of birth. If you don't know your exact birth time, our astrologers can help with birth time rectification."),
    },
    {
      question: t('consultation.faq.q2', 'How do I prepare for my consultation?'),
      answer: t('consultation.faq.a2', 'Write down your specific questions beforehand. Have your birth details ready. For video consultations, ensure you have a stable internet connection.'),
    },
    {
      question: t('consultation.faq.q3', "Can I get a refund if I'm not satisfied?"),
      answer: t('consultation.faq.a3', "Yes, we offer a 100% satisfaction guarantee. If you're not satisfied with your consultation, contact us within 24 hours for a full refund."),
    },
    {
      question: t('consultation.faq.q4', 'How soon can I book a consultation?'),
      answer: t('consultation.faq.a4', 'Most consultations can be scheduled within 24-48 hours. For urgent matters, we offer same-day appointments with available astrologers.'),
    },
  ];

  const whyChooseUs = [
    { icon: Shield, title: t('consultation.why.verifiedExperts', 'Verified Experts'), desc: t('consultation.why.verifiedExpertsDesc', 'All astrologers verified with 10+ years experience') },
    { icon: Award, title: t('consultation.why.satisfaction', '100% Satisfaction'), desc: t('consultation.why.satisfactionDesc', 'Full refund if not satisfied with consultation') },
    { icon: Clock, title: t('consultation.why.available247', '24/7 Available'), desc: t('consultation.why.available247Desc', 'Book consultations anytime, any day') },
    { icon: Users, title: t('consultation.why.happyClients', '50,000+ Happy Clients'), desc: t('consultation.why.happyClientsDesc', 'Trusted by thousands across India') },
  ];

  return (
    <div className="py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-amber-100 text-amber-800">{t('consultation.badge', 'Expert Guidance')}</Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {t('consultation.title', 'Book Your Vedic Astrology Consultation')}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('consultation.subtitle', 'Get personalized guidance from our verified expert astrologers with 15+ years of experience. Choose from phone, video, or chat consultations.')}
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
                  <Badge className="bg-amber-500 text-white">{t('consultation.mostPopular', 'Most Popular')}</Badge>
                </div>
              )}
              <CardHeader>
                <div className="w-24 h-24 mx-auto mb-4">
                  <Image
                    src={type.image}
                    alt={type.title}
                    width={96}
                    height={96}
                    className="w-full h-full object-contain"
                  />
                </div>
                <CardTitle className="text-center">{type.title}</CardTitle>
                <CardDescription className="text-center">{type.description}</CardDescription>
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
                  {t('consultation.bookNow', 'Book Now')}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              {t('consultation.ourExperts', 'Our Expert Astrologers')}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {t('consultation.ourExpertsDesc', 'All our astrologers are verified experts with extensive experience in Vedic astrology.')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {astrologers.map((astrologer) => (
              <Card key={astrologer.name} className="border-amber-100">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden">
                      <Image
                        src={astrologer.image}
                        alt={astrologer.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
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
                      <p className="text-xs text-gray-500">{t('consultation.rating', 'Rating')}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2 text-center">
                      <div className="font-semibold">{astrologer.experience}</div>
                      <p className="text-xs text-gray-500">{t('consultation.experience', 'Experience')}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {astrologer.consultations.toLocaleString()}+ {t('consultation.consultationsCount', 'consultations')}
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
                    {t('consultation.bookConsultation', 'Book Consultation')}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              {t('consultation.topics', 'Consultation Topics')}
            </h2>
            <p className="text-gray-600">
              {t('consultation.topicsDesc', 'Get expert guidance on any aspect of your life')}
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
              {t('consultation.whyChoose', 'Why Choose VedicStarAstro?')}
            </h2>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            {whyChooseUs.map((item) => (
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
              {t('consultation.testimonials', 'Client Testimonials')}
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
              {t('consultation.faq', 'Frequently Asked Questions')}
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
            <h2 className="text-2xl font-bold mb-2">{t('consultation.readyToStart', 'Ready to Get Started?')}</h2>
            <p className="mb-4 text-amber-100">
              {t('consultation.readyToStartDesc', "Book your consultation now and get clarity on your life's important questions.")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-amber-600 hover:bg-amber-50">
                {t('consultation.bookNowBtn', 'Book Consultation Now')}
              </Button>
                            <Button size="lg" className="bg-white text-amber-600 hover:bg-amber-50" asChild>
                              <Link href="/tools/kundli-calculator">{t('consultation.tryFreeKundli', 'Try Free Kundli First')}</Link>
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
