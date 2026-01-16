"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: "Home", href: "/" },
  {
    name: "Services",
    href: "#",
    children: [
      { name: "Free Kundli", href: "/tools/kundli-calculator", description: "Generate your birth chart instantly" },
      { name: "Nakshatra Finder", href: "/tools/nakshatra-finder", description: "Discover your lunar constellation" },
      { name: "Horoscope Matching", href: "/tools/horoscope-matching", description: "Check marriage compatibility" },
      { name: "Consultation", href: "/consultation", description: "Talk to expert astrologers" },
    ],
  },
  {
    name: "Learn",
    href: "#",
    children: [
      { name: "Vedic Astrology Guide", href: "/vedic-astrology-guide-complete-2025", description: "Complete beginner's guide" },
      { name: "Kundli Analysis", href: "/kundli-birth-chart-analysis-guide", description: "Understanding your birth chart" },
      { name: "27 Nakshatras", href: "/27-nakshatras-complete-guide-vedic-astrology", description: "Lunar constellations explained" },
      { name: "Remedies & Doshas", href: "/vedic-astrology-remedies-doshas-guide", description: "Solutions for planetary afflictions" },
    ],
  },
  { name: "Blog", href: "/blog" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-amber-100 shadow-sm">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/images/logo.png"
                alt="VedicStarAstro Logo"
                width={48}
                height={48}
                className="w-12 h-12 object-contain"
                priority
              />
              <span className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                VedicStarAstro
              </span>
            </Link>
          </div>

          <div className="hidden lg:flex lg:items-center lg:gap-x-8">
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
