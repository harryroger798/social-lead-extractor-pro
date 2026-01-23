import { MetadataRoute } from 'next'

const BASE_URL = 'https://vedicstarastro.com'

const zodiacSigns = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'] as const

export default function sitemap(): MetadataRoute.Sitemap {
  const currentDate = new Date().toISOString()
  const currentYear = new Date().getFullYear()

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
    '/tools',
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
    '/horoscope',
    '/horoscope/weekly',
    '/horoscope/monthly',
    `/horoscope/${currentYear}`,
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
    '/doshas',
    '/doshas/mangal-dosh',
    '/doshas/kaal-sarp-dosh',
    '/doshas/sade-sati',
    '/doshas/pitra-dosh',
    '/transits',
    `/transits/jupiter-transit-${currentYear}`,
    `/transits/saturn-transit-${currentYear}`,
    `/transits/mercury-retrograde-${currentYear}`,
    `/eclipses-${currentYear}`,
    `/festival-calendar-${currentYear}`,
    '/vedic-astrology-guide-complete-2025',
    '/kundli-birth-chart-analysis-guide',
    '/27-nakshatras-complete-guide-vedic-astrology',
    '/vedic-astrology-remedies-doshas-guide',
  ]

  const sitemapEntries: MetadataRoute.Sitemap = []

  staticPages.forEach((page) => {
    sitemapEntries.push({
      url: `${BASE_URL}${page}`,
      lastModified: currentDate,
      changeFrequency: page === '' ? 'daily' : page.includes('horoscope') || page.includes('panchang') ? 'daily' : 'weekly',
      priority: page === '' ? 1.0 : page.includes('tools') ? 0.9 : page.includes('consultation') ? 0.9 : 0.8,
    })
  })

  zodiacSigns.forEach((sign) => {
    sitemapEntries.push({
      url: `${BASE_URL}/horoscope/yearly/${sign}`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    })
  })

  return sitemapEntries
}
