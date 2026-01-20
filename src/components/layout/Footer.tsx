"use client";

import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin, Facebook, Instagram, Youtube, Twitter } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

const socialLinks = [
  { name: "Facebook", href: "https://facebook.com/vedicstarastro", icon: Facebook },
  { name: "Instagram", href: "https://instagram.com/vedicstarastro", icon: Instagram },
  { name: "YouTube", href: "https://youtube.com/@vedicstarastro", icon: Youtube },
  { name: "Twitter", href: "https://twitter.com/vedicstarastro", icon: Twitter },
];

export function Footer() {
  const { t } = useLanguage();

  const footerLinks = {
    services: [
      { name: t('footer.freeKundli', 'Free Kundli'), href: "/tools/kundli-calculator" },
      { name: t('footer.nakshatraFinder', 'Nakshatra Finder'), href: "/tools/nakshatra-finder" },
      { name: t('footer.horoscopeMatching', 'Horoscope Matching'), href: "/tools/horoscope-matching" },
      { name: t('footer.consultation', 'Consultation'), href: "/consultation" },
      { name: t('footer.dailyHoroscope', 'Daily Horoscope'), href: "/daily-horoscope" },
    ],
    learn: [
      { name: t('footer.vedicAstrologyGuide', 'Vedic Astrology Guide'), href: "/vedic-astrology-guide-complete-2025" },
      { name: t('footer.kundliAnalysis', 'Kundli Analysis'), href: "/kundli-birth-chart-analysis-guide" },
      { name: t('footer.nakshatras27', '27 Nakshatras'), href: "/27-nakshatras-complete-guide-vedic-astrology" },
      { name: t('footer.remediesDoshas', 'Remedies & Doshas'), href: "/vedic-astrology-remedies-doshas-guide" },
      { name: t('footer.blog', 'Blog'), href: "/blog" },
    ],
    company: [
      { name: t('footer.aboutUs', 'About Us'), href: "/about" },
      { name: t('footer.ourAstrologers', 'Our Astrologers'), href: "/astrologers" },
      { name: t('footer.contact', 'Contact'), href: "/contact" },
      { name: t('footer.careers', 'Careers'), href: "/careers" },
      { name: t('footer.press', 'Press'), href: "/press" },
    ],
    legal: [
      { name: t('footer.privacyPolicy', 'Privacy Policy'), href: "/privacy-policy" },
      { name: t('footer.termsOfService', 'Terms of Service'), href: "/terms-of-service" },
      { name: t('footer.refundPolicy', 'Refund Policy'), href: "/refund-policy" },
      { name: t('footer.disclaimer', 'Disclaimer'), href: "/disclaimer" },
    ],
  };
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
              {t('footer.tagline', 'Authentic Vedic Astrology services with expert astrologers. Get accurate Kundli analysis, Nakshatra insights, and personalized consultations.')}
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3 text-sm">
                <MapPin className="w-4 h-4 text-amber-500 mt-1 flex-shrink-0" />
                <span>{t('footer.location', 'Nakshatraveda Astro House #12A, Ashraya Layout, S.Bingipura Village, Begur Koppa Road, Bangalore - 560100')}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-amber-500" />
                <a href="mailto:contact@vedicstarastro.com" className="hover:text-amber-400 transition-colors">
                  contact@vedicstarastro.com
                </a>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-amber-500" />
                <a href="tel:+918884919349" className="hover:text-amber-400 transition-colors">
                  +91 8884919349
                </a>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-4">{t('footer.servicesTitle', 'Services')}</h3>
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
            <h3 className="text-sm font-semibold text-white mb-4">{t('footer.learnTitle', 'Learn')}</h3>
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
            <h3 className="text-sm font-semibold text-white mb-4">{t('footer.companyTitle', 'Company')}</h3>
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
            <h3 className="text-sm font-semibold text-white mb-4">{t('footer.legalTitle', 'Legal')}</h3>
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
              &copy; {new Date().getFullYear()} VedicStarAstro. {t('footer.allRightsReserved', 'All rights reserved.')}
            </p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800">
          <p className="text-xs text-gray-500 text-center max-w-4xl mx-auto">
            <strong>{t('footer.disclaimerLabel', 'Disclaimer:')}</strong> {t('footer.disclaimerText', 'Astrological predictions and consultations are for entertainment and guidance purposes only. They should not be considered as substitutes for professional medical, legal, financial, or psychological advice. Individual results may vary. Past predictions do not guarantee future accuracy.')}
          </p>
        </div>
      </div>
    </footer>
  );
}
