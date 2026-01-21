import { createClient } from '@sanity/client'

export const sanityClient = createClient({
  projectId: '5q99si1y',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
})

export interface SanityPost {
  _id: string
  title: string
  slug: { current: string }
  body: string
  excerpt: string
  status: string
  publishedAt: string
  language?: string
  linkedPost?: {
    _id: string
    slug: { current: string }
    language: string
  }
  featuredImage?: {
    url: string
    alt: string
  }
  seo?: {
    metaTitle: string
    metaDescription: string
    focusKeyword: string
    keywords: string[]
  }
  author?: {
    _id: string
    name: string
    slug: { current: string }
    bio: string
  }
  categories?: Array<{
    _id: string
    title: string
    slug: { current: string }
  }>
  internalLinks?: string[]
  externalLinks?: string[]
}

export async function getAllPosts(language?: string): Promise<SanityPost[]> {
  const languageFilter = language ? ` && language == "${language}"` : ''
  const query = `*[_type == "post" && status == "published"${languageFilter}] | order(publishedAt desc) {
    _id,
    title,
    slug,
    body,
    excerpt,
    status,
    publishedAt,
    language,
    "linkedPost": linkedPost->{_id, slug, language},
    featuredImage,
    seo,
    "author": author->{_id, name, slug, bio},
    "categories": categories[]->{_id, title, slug},
    internalLinks,
    externalLinks
  }`
  
  return sanityClient.fetch(query)
}

export async function getPostBySlug(slug: string): Promise<SanityPost | null> {
  const query = `*[_type == "post" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    body,
    excerpt,
    status,
    publishedAt,
    language,
    "linkedPost": linkedPost->{_id, slug, language},
    featuredImage,
    seo,
    "author": author->{_id, name, slug, bio},
    "categories": categories[]->{_id, title, slug},
    internalLinks,
    externalLinks
  }`
  
  return sanityClient.fetch(query, { slug })
}

// Get all translations of a post (including the post itself)
export async function getPostTranslations(postId: string): Promise<SanityPost[]> {
  const query = `*[_type == "post" && (_id == $postId || linkedPost._ref == $postId)] {
    _id,
    title,
    slug,
    language,
    status
  }`
  
  return sanityClient.fetch(query, { postId })
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}
