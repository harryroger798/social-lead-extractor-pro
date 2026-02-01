// SEO Optimization Utilities
// SEO Optimizations #1-55

// Update document title and meta tags (SEO Optimization #16-17)
export function updatePageMeta(options: {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
  noIndex?: boolean;
}): void {
  // Update title
  document.title = options.title;
  
  // Update or create meta tags
  updateMetaTag('description', options.description);
  if (options.keywords) {
    updateMetaTag('keywords', options.keywords);
  }
  
  // Robots meta
  if (options.noIndex) {
    updateMetaTag('robots', 'noindex, nofollow');
  } else {
    updateMetaTag('robots', 'index, follow');
  }
  
  // Canonical URL (SEO Optimization #4)
  if (options.canonical) {
    updateLinkTag('canonical', options.canonical);
  }
  
  // Open Graph tags (SEO Optimization #41)
  updateMetaTag('og:title', options.title, 'property');
  updateMetaTag('og:description', options.description, 'property');
  updateMetaTag('og:type', options.ogType || 'website', 'property');
  updateMetaTag('og:url', options.canonical || window.location.href, 'property');
  if (options.ogImage) {
    updateMetaTag('og:image', options.ogImage, 'property');
  }
  
  // Twitter Card tags (SEO Optimization #42)
  updateMetaTag('twitter:card', options.twitterCard || 'summary_large_image');
  updateMetaTag('twitter:title', options.title);
  updateMetaTag('twitter:description', options.description);
  if (options.ogImage) {
    updateMetaTag('twitter:image', options.ogImage);
  }
}

// Helper to update or create meta tags
function updateMetaTag(name: string, content: string, attribute: 'name' | 'property' = 'name'): void {
  let meta = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute(attribute, name);
    document.head.appendChild(meta);
  }
  meta.content = content;
}

// Helper to update or create link tags
function updateLinkTag(rel: string, href: string): void {
  let link = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
  if (!link) {
    link = document.createElement('link');
    link.rel = rel;
    document.head.appendChild(link);
  }
  link.href = href;
}

// Add structured data to page (SEO Optimization #31-40)
export function addStructuredData(data: Record<string, unknown>, id?: string): void {
  const scriptId = id || `structured-data-${Date.now()}`;
  
  // Remove existing script with same ID
  const existing = document.getElementById(scriptId);
  if (existing) {
    existing.remove();
  }
  
  const script = document.createElement('script');
  script.id = scriptId;
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
}

// Remove structured data
export function removeStructuredData(id: string): void {
  const script = document.getElementById(id);
  if (script) {
    script.remove();
  }
}

// Generate FAQ Schema (SEO Optimization #34)
export function generateFAQSchema(faqs: { question: string; answer: string }[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

// Generate HowTo Schema (SEO Optimization #35)
export function generateHowToSchema(options: {
  name: string;
  description: string;
  steps: { name: string; text: string; image?: string }[];
  totalTime?: string;
}): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: options.name,
    description: options.description,
    totalTime: options.totalTime,
    step: options.steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
      image: step.image,
    })),
  };
}

// Generate Product Schema (SEO Optimization #36)
export function generateProductSchema(options: {
  name: string;
  description: string;
  image: string;
  brand: string;
  offers: {
    price: number;
    priceCurrency: string;
    availability: 'InStock' | 'OutOfStock' | 'PreOrder';
  }[];
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
  };
}): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: options.name,
    description: options.description,
    image: options.image,
    brand: {
      '@type': 'Brand',
      name: options.brand,
    },
    offers: options.offers.map(offer => ({
      '@type': 'Offer',
      price: offer.price,
      priceCurrency: offer.priceCurrency,
      availability: `https://schema.org/${offer.availability}`,
    })),
    ...(options.aggregateRating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: options.aggregateRating.ratingValue,
        reviewCount: options.aggregateRating.reviewCount,
      },
    }),
  };
}

// Generate Breadcrumb Schema (SEO Optimization #37)
export function generateBreadcrumbSchema(items: { name: string; url: string }[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// Generate Article Schema (SEO Optimization #39)
export function generateArticleSchema(options: {
  headline: string;
  description: string;
  image: string;
  datePublished: string;
  dateModified?: string;
  author: string;
  publisher: string;
  publisherLogo: string;
}): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: options.headline,
    description: options.description,
    image: options.image,
    datePublished: options.datePublished,
    dateModified: options.dateModified || options.datePublished,
    author: {
      '@type': 'Person',
      name: options.author,
    },
    publisher: {
      '@type': 'Organization',
      name: options.publisher,
      logo: {
        '@type': 'ImageObject',
        url: options.publisherLogo,
      },
    },
  };
}

// Generate Review Schema (SEO Optimization #38)
export function generateReviewSchema(options: {
  itemReviewed: { name: string; type: string };
  reviewRating: number;
  author: string;
  reviewBody: string;
  datePublished: string;
}): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    itemReviewed: {
      '@type': options.itemReviewed.type,
      name: options.itemReviewed.name,
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: options.reviewRating,
      bestRating: 5,
    },
    author: {
      '@type': 'Person',
      name: options.author,
    },
    reviewBody: options.reviewBody,
    datePublished: options.datePublished,
  };
}

// Prerender hints for faster navigation (SEO Optimization #22)
export function addPrerenderHint(url: string): void {
  const link = document.createElement('link');
  link.rel = 'prerender';
  link.href = url;
  document.head.appendChild(link);
}

// DNS prefetch for external domains (SEO Optimization #46)
export function addDnsPrefetch(domain: string): void {
  const link = document.createElement('link');
  link.rel = 'dns-prefetch';
  link.href = domain;
  document.head.appendChild(link);
}

// Preconnect to external domains (SEO Optimization #46)
export function addPreconnect(domain: string, crossOrigin: boolean = false): void {
  const link = document.createElement('link');
  link.rel = 'preconnect';
  link.href = domain;
  if (crossOrigin) {
    link.crossOrigin = 'anonymous';
  }
  document.head.appendChild(link);
}

// Generate sitemap entry format
export function formatSitemapEntry(options: {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}): string {
  return `
  <url>
    <loc>${options.loc}</loc>
    ${options.lastmod ? `<lastmod>${options.lastmod}</lastmod>` : ''}
    ${options.changefreq ? `<changefreq>${options.changefreq}</changefreq>` : ''}
    ${options.priority !== undefined ? `<priority>${options.priority}</priority>` : ''}
  </url>`;
}

// Track page view for analytics (SEO Optimization #55)
export function trackPageView(path: string, title: string): void {
  // Google Analytics 4
  if (typeof window !== 'undefined' && 'gtag' in window) {
    (window as unknown as { gtag: (...args: unknown[]) => void }).gtag('event', 'page_view', {
      page_path: path,
      page_title: title,
    });
  }
}

// Generate hreflang tags for international SEO (SEO Optimization #5)
export function addHreflangTags(alternates: { lang: string; url: string }[]): void {
  // Remove existing hreflang tags
  document.querySelectorAll('link[hreflang]').forEach(el => el.remove());
  
  alternates.forEach(({ lang, url }) => {
    const link = document.createElement('link');
    link.rel = 'alternate';
    link.hreflang = lang;
    link.href = url;
    document.head.appendChild(link);
  });
}

// Check if page is indexable
export function isPageIndexable(): boolean {
  const robotsMeta = document.querySelector('meta[name="robots"]');
  if (robotsMeta) {
    const content = robotsMeta.getAttribute('content') || '';
    return !content.includes('noindex');
  }
  return true;
}

// Get current page's canonical URL
export function getCanonicalUrl(): string | null {
  const canonical = document.querySelector('link[rel="canonical"]');
  return canonical ? canonical.getAttribute('href') : null;
}
