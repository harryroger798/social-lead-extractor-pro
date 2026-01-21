import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { getPostBySlug } from "@/lib/sanity";
import BlogPostContent from "./BlogPostContent";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Generate metadata for SEO (server-side)
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: "Article Not Found | VedicStarAstro",
      description: "The article you're looking for doesn't exist.",
    };
  }

  const metaTitle = post.seo?.metaTitle || post.title;
  const metaDescription = post.seo?.metaDescription || post.excerpt || "";
  const keywords = post.seo?.keywords?.join(", ") || "";
  const canonicalUrl = `https://vedicstarastro.com/blog/${post.slug.current}`;

  return {
    title: `${metaTitle} | VedicStarAstro`,
    description: metaDescription,
    keywords: keywords,
    robots: "index, follow",
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      type: "article",
      url: canonicalUrl,
      siteName: "VedicStarAstro",
      images: post.featuredImage?.url
        ? [
            {
              url: post.featuredImage.url,
              alt: post.featuredImage.alt || post.title,
            },
          ]
        : [],
      publishedTime: post.publishedAt,
      authors: post.author?.name ? [post.author.name] : [],
      section: post.categories?.[0]?.title || "Vedic Astrology",
    },
    twitter: {
      card: "summary_large_image",
      title: metaTitle,
      description: metaDescription,
      images: post.featuredImage?.url ? [post.featuredImage.url] : [],
    },
    other: {
      "article:published_time": post.publishedAt,
      "article:author": post.author?.name || "VedicStarAstro",
    },
  };
}

// Generate JSON-LD structured data
function generateJsonLd(post: NonNullable<Awaited<ReturnType<typeof getPostBySlug>>>) {
  const metaTitle = post.seo?.metaTitle || post.title;
  const metaDescription = post.seo?.metaDescription || post.excerpt || "";

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: metaTitle,
    description: metaDescription,
    image: post.featuredImage?.url || "https://vedicstarastro.com/images/logo.png",
    author: {
      "@type": "Person",
      name: post.author?.name || "VedicStarAstro",
    },
    publisher: {
      "@type": "Organization",
      name: "VedicStarAstro",
      logo: {
        "@type": "ImageObject",
        url: "https://vedicstarastro.com/images/logo.png",
      },
    },
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://vedicstarastro.com/blog/${post.slug.current}`,
    },
    keywords: post.seo?.keywords?.join(", ") || "",
    articleSection: post.categories?.[0]?.title || "Vedic Astrology",
    inLanguage: "en-IN",
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return (
      <div className="py-12 lg:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Article Not Found</h1>
            <p className="text-gray-500 mb-6">The article you&apos;re looking for doesn&apos;t exist.</p>
            <Button asChild>
              <Link href="/blog">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Blog
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* JSON-LD Structured Data - Server-side rendered */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateJsonLd(post)),
        }}
      />
      <BlogPostContent post={post} />
    </>
  );
}
