import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin, Facebook, Instagram, Youtube, Twitter } from "lucide-react";

const footerLinks = {
  services: [
    { name: "Free Kundli", href: "/tools/kundli-calculator" },
    { name: "Nakshatra Finder", href: "/tools/nakshatra-finder" },
    { name: "Horoscope Matching", href: "/tools/horoscope-matching" },
    { name: "Consultation", href: "/consultation" },
    { name: "Daily Horoscope", href: "/daily-horoscope" },
  ],
  learn: [
    { name: "Vedic Astrology Guide", href: "/vedic-astrology-guide-complete-2025" },
    { name: "Kundli Analysis", href: "/kundli-birth-chart-analysis-guide" },
    { name: "27 Nakshatras", href: "/27-nakshatras-complete-guide-vedic-astrology" },
    { name: "Remedies & Doshas", href: "/vedic-astrology-remedies-doshas-guide" },
    { name: "Blog", href: "/blog" },
  ],
  company: [
    { name: "About Us", href: "/about" },
    { name: "Our Astrologers", href: "/astrologers" },
    { name: "Contact", href: "/contact" },
    { name: "Careers", href: "/careers" },
    { name: "Press", href: "/press" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy-policy" },
    { name: "Terms of Service", href: "/terms-of-service" },
    { name: "Refund Policy", href: "/refund-policy" },
    { name: "Disclaimer", href: "/disclaimer" },
  ],
};

const socialLinks = [
  { name: "Facebook", href: "https://facebook.com/vedicstarastro", icon: Facebook },
  { name: "Instagram", href: "https://instagram.com/vedicstarastro", icon: Instagram },
  { name: "YouTube", href: "https://youtube.com/@vedicstarastro", icon: Youtube },
  { name: "Twitter", href: "https://twitter.com/vedicstarastro", icon: Twitter },
];

export function Footer() {
  return (
    <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-gray-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Image
                src="/images/logo.png"
                alt="VedicStarAstro Logo"
                width={48}
                height={48}
                className="w-12 h-12 object-contain"
              />
              <span className="text-xl font-bold text-white">VedicStarAstro</span>
            </Link>
            <p className="text-sm text-gray-400 mb-6 max-w-xs">
              Authentic Vedic Astrology services with expert astrologers. Get accurate Kundli analysis, 
              Nakshatra insights, and personalized consultations.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-4 h-4 text-amber-500" />
                <span>Bangalore, Karnataka, India</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-amber-500" />
                <a href="mailto:contact@vedicstarastro.com" className="hover:text-amber-400 transition-colors">
                  contact@vedicstarastro.com
                </a>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-amber-500" />
                <a href="tel:+919876543210" className="hover:text-amber-400 transition-colors">
                  +91 98765 43210
                </a>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Services</h3>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm hover:text-amber-400 transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Learn</h3>
            <ul className="space-y-3">
              {footerLinks.learn.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm hover:text-amber-400 transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm hover:text-amber-400 transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm hover:text-amber-400 transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 hover:bg-amber-600 transition-colors"
                  aria-label={social.name}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} VedicStarAstro. All rights reserved.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800">
          <p className="text-xs text-gray-500 text-center max-w-4xl mx-auto">
            <strong>Disclaimer:</strong> Astrological predictions and consultations are for entertainment 
            and guidance purposes only. They should not be considered as substitutes for professional 
            medical, legal, financial, or psychological advice. Individual results may vary. 
            Past predictions do not guarantee future accuracy.
          </p>
        </div>
      </div>
    </footer>
  );
}
