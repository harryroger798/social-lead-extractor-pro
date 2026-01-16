"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

const navigation = [
  {
    name: "Tools",
    href: "#",
    children: [
      { name: "AI Astrologer", href: "/ai-astrologer", description: "Chat with our AI for instant guidance" },
      { name: "Free Kundli", href: "/tools/kundli-calculator", description: "Generate your birth chart instantly" },
      { name: "Nakshatra Finder", href: "/tools/nakshatra-finder", description: "Discover your lunar constellation" },
      { name: "Horoscope Matching", href: "/tools/horoscope-matching", description: "Check marriage compatibility" },
      { name: "Moon Sign Calculator", href: "/tools/moon-sign-calculator", description: "Find your Vedic Moon sign" },
      { name: "Sun Sign Calculator", href: "/tools/sun-sign-calculator", description: "Discover your Sun sign" },
      { name: "Ascendant Calculator", href: "/tools/ascendant-calculator", description: "Calculate your rising sign" },
      { name: "Love Compatibility", href: "/tools/love-calculator", description: "Check zodiac compatibility" },
    ],
  },
  {
    name: "Panchang",
    href: "#",
    children: [
      { name: "Daily Panchang", href: "/panchang", description: "Today's tithi, nakshatra & muhurat" },
      { name: "Festival Calendar 2026", href: "/festival-calendar-2026", description: "Hindu festivals & important dates" },
    ],
  },
  {
    name: "Horoscope",
    href: "#",
    children: [
      { name: "Daily Horoscope", href: "/daily-horoscope", description: "Today's predictions" },
      { name: "Weekly Horoscope", href: "/horoscope/weekly", description: "This week's forecast" },
      { name: "Monthly Horoscope", href: "/horoscope/monthly", description: "Monthly predictions" },
      { name: "2026 Horoscope", href: "/horoscope/2026", description: "Yearly predictions for 2026" },
      { name: "Saturn Transit 2026", href: "/transits/saturn-transit-2026", description: "Shani Gochar effects" },
      { name: "Jupiter Transit 2026", href: "/transits/jupiter-transit-2026", description: "Guru Gochar predictions" },
      { name: "Mercury Retrograde", href: "/transits/mercury-retrograde-2026", description: "Retrograde dates & survival guide" },
      { name: "Eclipses 2026", href: "/eclipses-2026", description: "Solar & lunar eclipse guide" },
    ],
  },
  {
    name: "Doshas",
    href: "#",
    children: [
      { name: "Mangal Dosh", href: "/doshas/mangal-dosh", description: "Manglik dosha guide & remedies" },
      { name: "Kaal Sarp Dosh", href: "/doshas/kaal-sarp-dosh", description: "12 types & remedies" },
      { name: "Sade Sati", href: "/doshas/sade-sati", description: "Saturn's 7.5 year transit" },
      { name: "Pitra Dosh", href: "/doshas/pitra-dosh", description: "Ancestral karma & remedies" },
      { name: "Mangal Dosh Calculator", href: "/tools/mangal-dosh-calculator", description: "Check Manglik status" },
      { name: "Sade Sati Calculator", href: "/tools/sade-sati-calculator", description: "Check Sade Sati phase" },
    ],
  },
  { name: "Consultation", href: "/consultation" },
  { name: "About", href: "/about" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-amber-100 shadow-sm">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/images/logo.png"
                alt="VedicStarAstro Logo"
                width={72}
                height={72}
                className="w-16 h-16 md:w-18 md:h-18 object-contain"
                priority
              />
              <span className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                VedicStarAstro
              </span>
            </Link>
          </div>

          <div className="hidden lg:flex lg:items-center lg:gap-x-5">
            {navigation.map((item) => (
              <div key={item.name} className="relative">
                {item.children ? (
                  <div
                    className="relative"
                    onMouseEnter={() => setOpenDropdown(item.name)}
                    onMouseLeave={() => setOpenDropdown(null)}
                  >
                    <button className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-amber-600 transition-colors py-2">
                      {item.name}
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    {openDropdown === item.name && (
                      <div className="absolute left-0 top-full pt-2 w-72">
                        <div className="bg-white rounded-xl shadow-lg ring-1 ring-black/5 p-2">
                          {item.children.map((child) => (
                            <Link
                              key={child.name}
                              href={child.href}
                              className="block rounded-lg p-3 hover:bg-amber-50 transition-colors"
                            >
                              <div className="font-medium text-gray-900">{child.name}</div>
                              <p className="text-sm text-gray-500">{child.description}</p>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    className="text-sm font-medium text-gray-700 hover:text-amber-600 transition-colors"
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
          </div>

          <div className="hidden lg:flex lg:items-center lg:gap-x-4">
            <Button variant="outline" className="border-amber-500 text-amber-600 hover:bg-amber-50">
              Free Kundli
            </Button>
            <Button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white">
              Book Consultation
            </Button>
          </div>

          <div className="flex lg:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-amber-100">
            <div className="space-y-2">
              {navigation.map((item) => (
                <div key={item.name}>
                  {item.children ? (
                    <div className="space-y-1">
                      <div className="px-3 py-2 text-sm font-semibold text-gray-900">{item.name}</div>
                      {item.children.map((child) => (
                        <Link
                          key={child.name}
                          href={child.href}
                          className="block px-6 py-2 text-sm text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-amber-600 hover:bg-amber-50 rounded-lg"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}
              <div className="pt-4 px-3 space-y-2">
                <Button variant="outline" className="w-full border-amber-500 text-amber-600">
                  Free Kundli
                </Button>
                <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white">
                  Book Consultation
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
