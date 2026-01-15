import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageSquare,
  Send,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Contact VedicStarAstro - Get in Touch",
  description:
    "Contact VedicStarAstro for astrology consultations, inquiries, or support. Reach us via phone, email, or our contact form. We're here to help.",
  keywords: [
    "contact vedicstarastro",
    "astrology consultation contact",
    "vedic astrology support",
  ],
  openGraph: {
    title: "Contact VedicStarAstro - Get in Touch",
    description: "Contact VedicStarAstro for astrology consultations, inquiries, or support.",
    type: "website",
  },
};

const contactInfo = [
  {
    icon: Mail,
    title: "Email Us",
    details: "contact@vedicstarastro.com",
    description: "We'll respond within 24 hours",
    href: "mailto:contact@vedicstarastro.com",
  },
  {
    icon: Phone,
    title: "Call Us",
    details: "+91 98765 43210",
    description: "Mon-Sat, 9 AM - 8 PM IST",
    href: "tel:+919876543210",
  },
  {
    icon: MessageSquare,
    title: "WhatsApp",
    details: "+91 98765 43210",
    description: "Quick responses on WhatsApp",
    href: "https://wa.me/919876543210",
  },
  {
    icon: MapPin,
    title: "Visit Us",
    details: "Bangalore, Karnataka",
    description: "By appointment only",
    href: "#",
  },
];

const faqs = [
  {
    question: "How do I book a consultation?",
    answer: "You can book a consultation through our website by visiting the Consultation page and selecting your preferred astrologer and time slot.",
  },
  {
    question: "What information do I need for a reading?",
    answer: "You'll need your exact date, time, and place of birth. If you don't know your exact birth time, let us know and we can help with birth time rectification.",
  },
  {
    question: "Do you offer refunds?",
    answer: "Yes, we offer a 100% satisfaction guarantee. If you're not satisfied with your consultation, contact us within 24 hours for a full refund.",
  },
  {
    question: "Can I reschedule my appointment?",
    answer: "Yes, you can reschedule your appointment up to 4 hours before the scheduled time through your account or by contacting us.",
  },
];

export default function ContactPage() {
  return (
    <div className="py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-amber-100 text-amber-800">Contact</Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Get in Touch
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Have questions about our services or need help with your consultation? 
            We&apos;re here to assist you on your astrological journey.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {contactInfo.map((info) => (
            <Card key={info.title} className="border-amber-100 hover:border-amber-300 transition-colors">
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                  <info.icon className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{info.title}</h3>
                <a 
                  href={info.href}
                  className="text-amber-600 hover:text-amber-700 font-medium block mb-1"
                >
                  {info.details}
                </a>
                <p className="text-sm text-gray-500">{info.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <Card className="border-amber-200">
            <CardHeader>
              <CardTitle>Send Us a Message</CardTitle>
              <CardDescription>
                Fill out the form below and we&apos;ll get back to you within 24 hours.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" placeholder="Your name" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="your@email.com" required />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" type="tel" placeholder="+91 98765 43210" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" placeholder="How can we help?" required />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <textarea
                    id="message"
                    className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Tell us more about your inquiry..."
                    required
                  />
                </div>
                
                <Button type="submit" className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700">
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-amber-100 bg-gradient-to-br from-amber-50 to-orange-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="w-6 h-6 text-amber-600" />
                  <h3 className="font-semibold text-gray-900">Business Hours</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monday - Saturday</span>
                    <span className="font-medium">9:00 AM - 8:00 PM IST</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sunday</span>
                    <span className="font-medium">10:00 AM - 6:00 PM IST</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Consultations</span>
                    <span className="font-medium">24/7 (By Appointment)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-amber-100">
              <CardHeader>
                <CardTitle className="text-lg">Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <div key={index}>
                      <h4 className="font-medium text-gray-900 mb-1">{faq.question}</h4>
                      <p className="text-sm text-gray-600">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

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
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" asChild>
                <Link href="/tools/kundli-calculator">Try Free Kundli</Link>
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
            "@type": "ContactPage",
            mainEntity: {
              "@type": "Organization",
              name: "VedicStarAstro",
              email: "contact@vedicstarastro.com",
              telephone: "+91-9876543210",
              address: {
                "@type": "PostalAddress",
                addressLocality: "Bangalore",
                addressRegion: "Karnataka",
                addressCountry: "IN",
              },
            },
          }),
        }}
      />
    </div>
  );
}
