import { createClient } from '@sanity/client'

export const sanityClient = createClient({
  projectId: '75uz5ykn',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
})

export interface SanityPost {
  _id: string
  title: string
  slug: { current: string }
  body: string
  excerpt: string
  status: string
  publishedAt: string
  featuredImage?: {
    url: string
    alt: string
  }
  seo?: {
    metaTitle: string
    metaDescription: string
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

export async function getAllPosts(): Promise<SanityPost[]> {
  const query = `*[_type == "post" && status == "published"] | order(publishedAt desc) {
    _id,
    title,
    slug,
    body,
    excerpt,
    status,
    publishedAt,
    featuredImage,
    seo,
    "author": author->{_id, name, slug, bio},
    "categories": categories[]->{_id, title, slug},
    internalLinks,
    externalLinks
  }`
  
  return sanityClient.fetch(query)
}

export async function getAllPostsIncludingDrafts(): Promise<SanityPost[]> {
  const query = `*[_type == "post"] | order(publishedAt desc) {
    _id,
    title,
    slug,
    body,
    excerpt,
    status,
    publishedAt,
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
    featuredImage,
    seo,
    "author": author->{_id, name, slug, bio},
    "categories": categories[]->{_id, title, slug},
    internalLinks,
    externalLinks
  }`
  
  return sanityClient.fetch(query, { slug })
}

export async function getRelatedPosts(currentPostId: string, categoryIds: string[], limit: number = 3): Promise<SanityPost[]> {
  const query = `*[_type == "post" && status == "published" && _id != $currentPostId && count((categories[]._ref)[@ in $categoryIds]) > 0] | order(publishedAt desc) [0...$limit] {
    _id,
    title,
    slug,
    excerpt,
    publishedAt,
    featuredImage,
    "categories": categories[]->{_id, title, slug}
  }`
  
  return sanityClient.fetch(query, { currentPostId, categoryIds, limit })
}
