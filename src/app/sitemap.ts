import { MetadataRoute } from 'next'

const BASE_URL = 'https://vedicstarastro.com'

const languages = ['en', 'hi', 'ta', 'te', 'bn', 'mr', 'gu', 'kn', 'ml', 'pa'] as const

export default function sitemap(): MetadataRoute.Sitemap {
  const currentDate = new Date().toISOString()

  const staticPages = [
    '',
    '/about',
    '/contact',
    '/consultation',
    '/astrologers',
    '/blog',
    '/careers',
    '/press',
    '/privacy-policy',
    '/terms-of-service',
    '/refund-policy',
    '/disclaimer',
    '/tools/kundli-calculator',
    '/tools/nakshatra-finder',
    '/tools/horoscope-matching',
    '/tools/moon-sign-calculator',
    '/tools/sun-sign-calculator',
    '/tools/ascendant-calculator',
    '/tools/love-calculator',
    '/tools/dasha-calculator',
    '/tools/muhurta-calculator',
    '/tools/transit-calculator',
    '/tools/yoga-calculator',
    '/tools/navamsa-chart',
    '/tools/mangal-dosh-calculator',
    '/tools/sade-sati-calculator',
    '/panchang',
    '/daily-horoscope',
    '/horoscope/weekly',
    '/horoscope/monthly',
    '/horoscope/2026',
    '/ai-astrologer',
    '/ai-astrologer-pro',
    '/ai-chart-interpretation',
    '/voice-astrologer',
    '/palmistry',
    '/tarot',
    '/numerology',
    '/vastu',
    '/gemstones',
    '/baby-names',
    '/chinese-astrology',
    '/kp-system',
    '/lal-kitab',
    '/prashna-kundli',
    '/financial-astrology',
    '/personalized-horoscope',
    '/habit-tracker',
    '/life-timeline',
    '/planetary-tracker',
    '/blockchain-kundli',
    '/doshas/mangal-dosh',
    '/doshas/kaal-sarp-dosh',
    '/doshas/sade-sati',
    '/doshas/pitra-dosh',
    '/transits/jupiter-transit-2026',
    '/transits/saturn-transit-2026',
    '/transits/mercury-retrograde-2026',
    '/eclipses-2026',
    '/festival-calendar-2026',
    '/vedic-astrology-guide-complete-2025',
    '/kundli-birth-chart-analysis-guide',
    '/27-nakshatras-complete-guide-vedic-astrology',
    '/vedic-astrology-remedies-doshas-guide',
  ]

  const sitemapEntries: MetadataRoute.Sitemap = []

  staticPages.forEach((page) => {
    const alternates: Record<string, string> = {}
    languages.forEach((lang) => {
      alternates[lang] = `${BASE_URL}/${lang}${page}`
    })

    sitemapEntries.push({
      url: `${BASE_URL}${page}`,
      lastModified: currentDate,
      changeFrequency: page === '' ? 'daily' : page.includes('horoscope') || page.includes('panchang') ? 'daily' : 'weekly',
      priority: page === '' ? 1.0 : page.includes('tools') ? 0.9 : page.includes('consultation') ? 0.9 : 0.8,
      alternates: {
        languages: alternates,
      },
    })
  })

  return sitemapEntries
}
