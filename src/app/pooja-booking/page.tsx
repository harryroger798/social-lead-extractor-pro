"use client";

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
  Flame,
  Sun,
  Moon,
  Sparkles,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function PoojaBookingPage() {
  const { t } = useLanguage();

  const poojaCategories = [
    {
      id: "planetary",
      name: t('pooja.category.planetary', 'Planetary Poojas'),
      icon: Sun,
      description: t('pooja.category.planetaryDesc', 'Poojas to strengthen or pacify planetary influences'),
    },
    {
      id: "dosha",
      name: t('pooja.category.dosha', 'Dosha Nivaran'),
      icon: Shield,
      description: t('pooja.category.doshaDesc', 'Remedial poojas for various doshas in your chart'),
    },
    {
      id: "special",
      name: t('pooja.category.special', 'Special Occasions'),
      icon: Sparkles,
      description: t('pooja.category.specialDesc', 'Poojas for weddings, griha pravesh, and more'),
    },
    {
      id: "regular",
      name: t('pooja.category.regular', 'Regular Poojas'),
      icon: Flame,
      description: t('pooja.category.regularDesc', 'Daily and weekly poojas for general well-being'),
    },
  ];

  const poojas = [
    {
      name: t('pooja.navgraha.name', 'Navgraha Shanti Pooja'),
      hindi: "नवग्रह शांति पूजा",
      description: t('pooja.navgraha.desc', 'Pacify all nine planets for overall harmony and success in life.'),
      duration: t('pooja.navgraha.duration', '3-4 hours'),
      price: "₹5,100",
      originalPrice: "₹7,500",
      benefits: [
        t('pooja.navgraha.benefit1', 'Balances all planetary energies'),
        t('pooja.navgraha.benefit2', 'Removes obstacles in career and relationships'),
        t('pooja.navgraha.benefit3', 'Brings peace and prosperity'),
        t('pooja.navgraha.benefit4', 'Recommended during planetary transits'),
      ],
      category: "planetary",
      popular: true,
      image: "/images/pooja/navgraha.png",
    },
    {
      name: t('pooja.mangaldosh.name', 'Mangal Dosh Nivaran Pooja'),
      hindi: "मंगल दोष निवारण पूजा",
      description: t('pooja.mangaldosh.desc', 'Remedy for Mangal Dosh (Mars affliction) affecting marriage and relationships.'),
      duration: t('pooja.mangaldosh.duration', '2-3 hours'),
      price: "₹3,100",
      originalPrice: "₹5,000",
      benefits: [
        t('pooja.mangaldosh.benefit1', 'Reduces negative effects of Mars'),
        t('pooja.mangaldosh.benefit2', 'Improves marriage prospects'),
        t('pooja.mangaldosh.benefit3', 'Brings harmony in relationships'),
        t('pooja.mangaldosh.benefit4', 'Recommended before marriage'),
      ],
      category: "dosha",
      popular: true,
      image: "/images/pooja/mangal-dosh.png",
    },
    {
      name: t('pooja.kalsarp.name', 'Kaal Sarp Dosh Pooja'),
      hindi: "काल सर्प दोष पूजा",
      description: t('pooja.kalsarp.desc', 'Powerful remedy for Kaal Sarp Dosh caused by Rahu-Ketu axis.'),
      duration: t('pooja.kalsarp.duration', '4-5 hours'),
      price: "₹7,100",
      originalPrice: "₹11,000",
      benefits: [
        t('pooja.kalsarp.benefit1', 'Removes Kaal Sarp Dosh effects'),
        t('pooja.kalsarp.benefit2', 'Brings stability in life'),
        t('pooja.kalsarp.benefit3', 'Improves financial situation'),
        t('pooja.kalsarp.benefit4', 'Reduces anxiety and fear'),
      ],
      category: "dosha",
      popular: false,
      image: "/images/pooja/kaal-sarp.png",
    },
    {
      name: t('pooja.sadesati.name', 'Shani Sade Sati Pooja'),
      hindi: "शनि साढ़े साती पूजा",
      description: t('pooja.sadesati.desc', 'Relief from the challenging 7.5 year Saturn transit period.'),
      duration: t('pooja.sadesati.duration', '2-3 hours'),
      price: "₹3,500",
      originalPrice: "₹5,500",
      benefits: [
        t('pooja.sadesati.benefit1', 'Reduces Saturn\'s malefic effects'),
        t('pooja.sadesati.benefit2', 'Brings career stability'),
        t('pooja.sadesati.benefit3', 'Improves health and vitality'),
        t('pooja.sadesati.benefit4', 'Recommended during Sade Sati period'),
      ],
      category: "planetary",
      popular: true,
      image: "/images/pooja/shani.png",
    },
    {
      name: t('pooja.rudrabhishek.name', 'Rudrabhishek Pooja'),
      hindi: "रुद्राभिषेक पूजा",
      description: t('pooja.rudrabhishek.desc', 'Sacred Shiva pooja for removing obstacles and negative energies.'),
      duration: t('pooja.rudrabhishek.duration', '2-3 hours'),
      price: "₹2,500",
      originalPrice: "₹4,000",
      benefits: [
        t('pooja.rudrabhishek.benefit1', 'Removes negative energies'),
        t('pooja.rudrabhishek.benefit2', 'Brings peace and prosperity'),
        t('pooja.rudrabhishek.benefit3', 'Fulfills wishes'),
        t('pooja.rudrabhishek.benefit4', 'Good for health and longevity'),
      ],
      category: "regular",
      popular: false,
      image: "/images/pooja/rudrabhishek.png",
    },
    {
      name: t('pooja.satyanarayan.name', 'Satyanarayan Pooja'),
      hindi: "सत्यनारायण पूजा",
      description: t('pooja.satyanarayan.desc', 'Auspicious pooja for fulfillment of wishes and family well-being.'),
      duration: t('pooja.satyanarayan.duration', '2-3 hours'),
      price: "₹2,100",
      originalPrice: "₹3,500",
      benefits: [
        t('pooja.satyanarayan.benefit1', 'Brings prosperity and happiness'),
        t('pooja.satyanarayan.benefit2', 'Fulfills desires'),
        t('pooja.satyanarayan.benefit3', 'Removes obstacles'),
        t('pooja.satyanarayan.benefit4', 'Ideal for new beginnings'),
      ],
      category: "regular",
      popular: true,
      image: "/images/pooja/satyanarayan.png",
    },
    {
      name: t('pooja.grihapravesh.name', 'Griha Pravesh Pooja'),
      hindi: "गृह प्रवेश पूजा",
      description: t('pooja.grihapravesh.desc', 'Essential pooja before entering a new home for positive energy.'),
      duration: t('pooja.grihapravesh.duration', '3-4 hours'),
      price: "₹5,500",
      originalPrice: "₹8,000",
      benefits: [
        t('pooja.grihapravesh.benefit1', 'Purifies the new home'),
        t('pooja.grihapravesh.benefit2', 'Invokes positive energies'),
        t('pooja.grihapravesh.benefit3', 'Ensures family harmony'),
        t('pooja.grihapravesh.benefit4', 'Brings prosperity to the household'),
      ],
      category: "special",
      popular: false,
      image: "/images/pooja/griha-pravesh.png",
    },
    {
      name: t('pooja.vivah.name', 'Vivah Pooja (Wedding Ceremony)'),
      hindi: "विवाह पूजा",
      description: t('pooja.vivah.desc', 'Complete wedding ceremony rituals performed by experienced priests.'),
      duration: t('pooja.vivah.duration', '4-6 hours'),
      price: "₹11,000",
      originalPrice: "₹15,000",
      benefits: [
        t('pooja.vivah.benefit1', 'Traditional Vedic wedding rituals'),
        t('pooja.vivah.benefit2', 'Experienced and knowledgeable priests'),
        t('pooja.vivah.benefit3', 'All materials provided'),
        t('pooja.vivah.benefit4', 'Customized as per regional traditions'),
      ],
      category: "special",
      popular: false,
      image: "/images/pooja/vivah.png",
    },
    {
      name: t('pooja.lakshmi.name', 'Lakshmi Pooja'),
      hindi: "लक्ष्मी पूजा",
      description: t('pooja.lakshmi.desc', 'Invoke Goddess Lakshmi for wealth, prosperity, and financial growth.'),
      duration: t('pooja.lakshmi.duration', '1-2 hours'),
      price: "₹1,500",
      originalPrice: "₹2,500",
      benefits: [
        t('pooja.lakshmi.benefit1', 'Attracts wealth and prosperity'),
        t('pooja.lakshmi.benefit2', 'Removes financial obstacles'),
        t('pooja.lakshmi.benefit3', 'Brings business success'),
        t('pooja.lakshmi.benefit4', 'Ideal for Diwali and Fridays'),
      ],
      category: "regular",
      popular: false,
      image: "/images/pooja/lakshmi.png",
    },
  ];

  const whyChooseUs = [
    { 
      icon: Shield, 
      title: t('pooja.why.authenticRituals', 'Authentic Rituals'), 
      desc: t('pooja.why.authenticRitualsDesc', 'Traditional Vedic procedures followed precisely') 
    },
    { 
      icon: Award, 
      title: t('pooja.why.experiencedPriests', 'Experienced Priests'), 
      desc: t('pooja.why.experiencedPriestsDesc', 'Qualified pandits with 15+ years experience') 
    },
    { 
      icon: Clock, 
      title: t('pooja.why.flexibleScheduling', 'Flexible Scheduling'), 
      desc: t('pooja.why.flexibleSchedulingDesc', 'Book at your convenient date and time') 
    },
    { 
      icon: Users, 
      title: t('pooja.why.onlineOffline', 'Online & Offline'), 
      desc: t('pooja.why.onlineOfflineDesc', 'Attend virtually or in-person at temple') 
    },
  ];

  const faqs = [
    {
      question: t('pooja.faq.q1', 'How do I book a pooja?'),
      answer: t('pooja.faq.a1', 'Simply click on the "Book Now" button for your desired pooja. You\'ll be connected to our team via WhatsApp who will help you schedule the pooja at your preferred date and time.'),
    },
    {
      question: t('pooja.faq.q2', 'Can I attend the pooja online?'),
      answer: t('pooja.faq.a2', 'Yes! We offer live streaming of poojas via video call. You can participate from anywhere in the world and receive the prasad by courier.'),
    },
    {
      question: t('pooja.faq.q3', 'What materials are needed for the pooja?'),
      answer: t('pooja.faq.a3', 'All pooja materials (samagri) are arranged by us. For online poojas, we perform the rituals on your behalf. For in-person poojas, everything is provided.'),
    },
    {
      question: t('pooja.faq.q4', 'How do I know which pooja is right for me?'),
      answer: t('pooja.faq.a4', 'Our astrologers can analyze your birth chart and recommend the most beneficial poojas for your specific situation. Book a consultation for personalized guidance.'),
    },
  ];

  const handleBookPooja = (poojaName: string) => {
    const message = encodeURIComponent(
      `Hi, I would like to book ${poojaName}. Please help me with the booking process and available dates.`
    );
    window.open(`https://wa.me/918884919349?text=${message}`, '_blank');
  };

  return (
    <div className="py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-orange-100 text-orange-800">
            <Flame className="w-3 h-3 mr-1" />
            {t('pooja.badge', 'Sacred Rituals')}
          </Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {t('pooja.title', 'Book Pooja & Havan Services')}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('pooja.subtitle', 'Experience authentic Vedic rituals performed by experienced priests. Book online or in-person poojas for planetary remedies, dosha nivaran, and special occasions.')}
          </p>
        </div>

        {/* Categories */}
        <div className="grid md:grid-cols-4 gap-4 mb-12">
          {poojaCategories.map((category) => (
            <Card key={category.id} className="text-center hover:border-orange-300 transition-colors cursor-pointer">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-3">
                  <category.icon className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
                <p className="text-sm text-gray-600">{category.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Popular Poojas */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              {t('pooja.popularPoojas', 'Popular Poojas')}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {t('pooja.popularPoojasDesc', 'Most requested poojas by our clients for various life situations')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {poojas.filter(p => p.popular).map((pooja) => (
              <Card key={pooja.name} className="relative border-orange-200 hover:shadow-lg transition-shadow">
                <Badge className="absolute top-4 right-4 bg-orange-500 text-white">
                  {t('pooja.popular', 'Popular')}
                </Badge>
                <CardHeader>
                  <CardTitle className="text-lg">{pooja.name}</CardTitle>
                  <CardDescription className="text-orange-700 font-medium">{pooja.hindi}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">{pooja.description}</p>
                  
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-2xl font-bold text-gray-900">{pooja.price}</span>
                    <span className="text-sm text-gray-400 line-through">{pooja.originalPrice}</span>
                  </div>
                  
                  <div className="flex items-center gap-1 text-sm text-gray-600 mb-4">
                    <Clock className="w-4 h-4" />
                    {pooja.duration}
                  </div>
                  
                  <ul className="space-y-2 mb-6">
                    {pooja.benefits.slice(0, 3).map((benefit, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                    onClick={() => handleBookPooja(pooja.name)}
                  >
                    {t('pooja.bookNow', 'Book Now')}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* All Poojas */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              {t('pooja.allPoojas', 'All Pooja Services')}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {poojas.map((pooja) => (
              <Card key={pooja.name} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{pooja.name}</CardTitle>
                      <CardDescription className="text-orange-700 font-medium">{pooja.hindi}</CardDescription>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {poojaCategories.find(c => c.id === pooja.category)?.name}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">{pooja.description}</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold text-gray-900">{pooja.price}</span>
                      <span className="text-sm text-gray-400 line-through">{pooja.originalPrice}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      {pooja.duration}
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full"
                    variant="outline"
                    onClick={() => handleBookPooja(pooja.name)}
                  >
                    {t('pooja.bookNow', 'Book Now')}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="mb-16 bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              {t('pooja.whyChoose', 'Why Choose Our Pooja Services?')}
            </h2>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            {whyChooseUs.map((item) => (
              <div key={item.title} className="text-center">
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-3">
                  <item.icon className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              {t('pooja.howItWorks', 'How It Works')}
            </h2>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-orange-500 text-white flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                1
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{t('pooja.step1Title', 'Choose Pooja')}</h3>
              <p className="text-sm text-gray-600">{t('pooja.step1Desc', 'Select the pooja that suits your needs')}</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-orange-500 text-white flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                2
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{t('pooja.step2Title', 'Book Date')}</h3>
              <p className="text-sm text-gray-600">{t('pooja.step2Desc', 'Choose your preferred date and time')}</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-orange-500 text-white flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                3
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{t('pooja.step3Title', 'Make Payment')}</h3>
              <p className="text-sm text-gray-600">{t('pooja.step3Desc', 'Secure payment via UPI, card, or bank transfer')}</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-orange-500 text-white flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                4
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{t('pooja.step4Title', 'Attend Pooja')}</h3>
              <p className="text-sm text-gray-600">{t('pooja.step4Desc', 'Join online or visit temple for the ritual')}</p>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              {t('pooja.faqTitle', 'Frequently Asked Questions')}
            </h2>
          </div>
          
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <CardTitle className="text-lg">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl p-8 text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            {t('pooja.ctaTitle', 'Not Sure Which Pooja You Need?')}
          </h2>
          <p className="text-orange-100 mb-6 max-w-2xl mx-auto">
            {t('pooja.ctaDesc', 'Our expert astrologers can analyze your birth chart and recommend the most beneficial poojas for your specific situation.')}
          </p>
          <Button 
            size="lg" 
            className="bg-white text-orange-600 hover:bg-orange-50"
            onClick={() => window.open('https://wa.me/918884919349?text=' + encodeURIComponent('Hi, I need help choosing the right pooja for my situation. Can you please guide me?'), '_blank')}
          >
            <Calendar className="w-5 h-5 mr-2" />
            {t('pooja.ctaButton', 'Get Free Consultation')}
          </Button>
        </section>
      </div>
    </div>
  );
}
