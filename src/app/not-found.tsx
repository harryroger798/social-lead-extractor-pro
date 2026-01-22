"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function NotFound() {
  const { t } = useLanguage();
  
  const popularPages = [
    { href: "/", label: t('nav.home', 'Home') },
    { href: "/tools/kundli-calculator", label: t('nav.freeKundli', 'Free Kundli') },
    { href: "/consultation", label: t('nav.consultation', 'Consultation') },
    { href: "/daily-horoscope", label: t('nav.dailyHoroscope', 'Daily Horoscope') },
    { href: "/tools/nakshatra-finder", label: t('nav.nakshatraFinder', 'Nakshatra Finder') },
    { href: "/tools/horoscope-matching", label: t('nav.horoscopeMatching', 'Horoscope Matching') },
    { href: "/contact", label: t('nav.contact', 'Contact Us') },
  ];

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-2xl mx-auto text-center">
        {/* 404 Icon */}
        <div className="mb-8">
          <svg
            className="w-32 h-32 mx-auto text-orange-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        {/* Error Message */}
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          {t('error.pageNotFound', 'Page Not Found')}
        </h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          {t('error.pageNotFoundDesc', 'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.')}
        </p>

        {/* Primary CTA */}
        <Link
          href="/"
          className="inline-flex items-center justify-center px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors mb-8"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          {t('error.goHome', 'Go to Homepage')}
        </Link>

        {/* Popular Pages */}
        <div className="border-t border-gray-200 pt-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            {t('error.popularPages', 'Popular Pages')}
          </h3>
          <div className="flex flex-wrap justify-center gap-3">
            {popularPages.map((page) => (
              <Link
                key={page.href}
                href={page.href}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-orange-100 hover:text-orange-600 transition-colors text-sm"
              >
                {page.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Search Suggestion */}
        <div className="mt-8 text-sm text-gray-500">
          <p>
            {t('error.needHelp', 'Need help?')}{' '}
            <Link href="/contact" className="text-orange-500 hover:underline">
              {t('error.contactUs', 'Contact our support team')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
