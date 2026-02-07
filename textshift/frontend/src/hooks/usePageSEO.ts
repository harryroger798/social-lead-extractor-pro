import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { updatePageMeta, addStructuredData, removeStructuredData } from '@/lib/seo';

interface PageSEOConfig {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
  noIndex?: boolean;
  structuredData?: Record<string, unknown>[];
}

const SITE_NAME = 'TextShift';
const SITE_URL = 'https://textshift.org';
const DEFAULT_OG_IMAGE = `${SITE_URL}/images/og-image.png`;

export function usePageSEO(config: PageSEOConfig) {
  const location = useLocation();

  useEffect(() => {
    const fullTitle = `${config.title} | ${SITE_NAME}`;
    const canonicalUrl = config.canonical || `${SITE_URL}${location.pathname}`;

    updatePageMeta({
      title: fullTitle,
      description: config.description,
      keywords: config.keywords,
      canonical: canonicalUrl,
      ogImage: config.ogImage || DEFAULT_OG_IMAGE,
      ogType: config.ogType || 'website',
      twitterCard: config.twitterCard || 'summary_large_image',
      noIndex: config.noIndex,
    });

    const structuredDataIds: string[] = [];
    if (config.structuredData) {
      config.structuredData.forEach((data, index) => {
        const id = `page-sd-${index}`;
        addStructuredData(data, id);
        structuredDataIds.push(id);
      });
    }

    const webPageSchema: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: fullTitle,
      description: config.description,
      url: canonicalUrl,
      isPartOf: {
        '@type': 'WebSite',
        name: SITE_NAME,
        url: SITE_URL,
      },
    };
    const webPageId = 'page-sd-webpage';
    addStructuredData(webPageSchema, webPageId);
    structuredDataIds.push(webPageId);

    return () => {
      structuredDataIds.forEach((id) => removeStructuredData(id));
    };
  }, [location.pathname, config.title, config.description, config.keywords, config.canonical, config.ogImage, config.ogType, config.twitterCard, config.noIndex, config.structuredData]);
}
