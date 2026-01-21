"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, User, ArrowLeft, Share2, BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { getPostBySlug, SanityPost } from "@/lib/sanity";

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function estimateReadTime(body: string): number {
  const wordsPerMinute = 200;
  const wordCount = body ? body.split(/\s+/).length : 0;
  return Math.ceil(wordCount / wordsPerMinute) || 5;
}

export default function BlogPostPage() {
  const { t } = useLanguage();
  const params = useParams();
  const slug = params.slug as string;
  
    const [post, setPost] = useState<SanityPost | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tocExpanded, setTocExpanded] = useState(false);

    useEffect(() => {
      async function fetchPost() {
        if (!slug) return;
      
        try {
          const fetchedPost = await getPostBySlug(slug);
          if (fetchedPost) {
            setPost(fetchedPost);
          } else {
            setError("Post not found");
          }
        } catch (err) {
          console.error("Error fetching post:", err);
          setError("Failed to load post");
        } finally {
          setLoading(false);
        }
      }
      fetchPost();
    }, [slug]);

        // Effect to update document head with dynamic SEO meta tags from Sanity
        useEffect(() => {
          if (!post) return;

          // Update document title
          const metaTitle = post.seo?.metaTitle || post.title;
          document.title = `${metaTitle} | VedicStarAstro`;

          // Helper function to update or create meta tags
          const updateMetaTag = (name: string, content: string, isProperty = false) => {
            const attr = isProperty ? 'property' : 'name';
            let meta = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement;
            if (!meta) {
              meta = document.createElement('meta');
              meta.setAttribute(attr, name);
              document.head.appendChild(meta);
            }
            meta.content = content;
          };

          // Meta description
          const metaDescription = post.seo?.metaDescription || post.excerpt || '';
          updateMetaTag('description', metaDescription);

          // Keywords
          const keywords = post.seo?.keywords?.join(', ') || '';
          if (keywords) {
            updateMetaTag('keywords', keywords);
          }

          // Open Graph tags
          updateMetaTag('og:title', metaTitle, true);
          updateMetaTag('og:description', metaDescription, true);
          updateMetaTag('og:type', 'article', true);
          updateMetaTag('og:url', `https://vedicstarastro.com/blog/${post.slug.current}`, true);
          if (post.featuredImage?.url) {
            updateMetaTag('og:image', post.featuredImage.url, true);
            updateMetaTag('og:image:alt', post.featuredImage.alt || post.title, true);
          }

          // Twitter Card tags
          updateMetaTag('twitter:card', 'summary_large_image');
          updateMetaTag('twitter:title', metaTitle);
          updateMetaTag('twitter:description', metaDescription);
          if (post.featuredImage?.url) {
            updateMetaTag('twitter:image', post.featuredImage.url);
          }

          // Article specific meta tags
          updateMetaTag('article:published_time', post.publishedAt, true);
          if (post.author?.name) {
            updateMetaTag('article:author', post.author.name, true);
          }

          // Canonical URL
          let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
          if (!canonical) {
            canonical = document.createElement('link');
            canonical.rel = 'canonical';
            document.head.appendChild(canonical);
          }
          canonical.href = `https://vedicstarastro.com/blog/${post.slug.current}`;

        }, [post]);

        // Effect to make TOC collapsible after content loads
        useEffect(() => {
          if (!post || loading) return;

      // Find the TOC nav element and make it collapsible
      const tocNav = document.querySelector('.blog-content nav.table-of-contents, .blog-content nav');
      if (tocNav) {
        // Check if already processed
        if (tocNav.classList.contains('toc-processed')) return;
        tocNav.classList.add('toc-processed');

        // Get the h2 element (Table of Contents header)
        const tocHeader = tocNav.querySelector('h2');
        if (tocHeader) {
          // Create wrapper for collapsible content
          const tocContent = document.createElement('div');
          tocContent.className = 'toc-content';
        
          // Move all content except h2 into the wrapper
          const children = Array.from(tocNav.children);
          children.forEach(child => {
            if (child !== tocHeader) {
              tocContent.appendChild(child);
            }
          });
          tocNav.appendChild(tocContent);

          // Add toggle icon to header
          const toggleIcon = document.createElement('span');
          toggleIcon.className = 'toc-toggle-icon';
          toggleIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>`;
          tocHeader.appendChild(toggleIcon);

          // Make header clickable
          tocHeader.style.cursor = 'pointer';
          tocHeader.style.display = 'flex';
          tocHeader.style.justifyContent = 'space-between';
          tocHeader.style.alignItems = 'center';

          // Set initial state (collapsed)
          tocContent.style.maxHeight = '0';
          tocContent.style.overflow = 'hidden';
          tocContent.style.transition = 'max-height 0.3s ease-out';

          // Toggle function
          tocHeader.addEventListener('click', () => {
            const isExpanded = tocContent.style.maxHeight !== '0px';
            if (isExpanded) {
              tocContent.style.maxHeight = '0';
              toggleIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>`;
            } else {
              tocContent.style.maxHeight = tocContent.scrollHeight + 'px';
              toggleIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>`;
            }
          });
        }
      }
    }, [post, loading]);

  if (loading) {
    return (
      <div className="py-12 lg:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <p className="text-gray-500">Loading article...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="py-12 lg:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Article Not Found</h1>
            <p className="text-gray-500 mb-6">{error || "The article you're looking for doesn't exist."}</p>
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
    <div className="py-12 lg:py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link 
            href="/blog" 
            className="inline-flex items-center text-amber-600 hover:text-amber-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Link>
        </div>

        <article>
          <header className="mb-8">
            <div className="flex flex-wrap gap-2 mb-4">
              {post.categories?.map((category) => (
                <Badge key={category._id} className="bg-amber-100 text-amber-800">
                  {category.title}
                </Badge>
              ))}
            </div>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>{formatDate(post.publishedAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>{estimateReadTime(post.body)} min read</span>
              </div>
              {post.author && (
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  <span>{post.author.name}</span>
                </div>
              )}
            </div>

            {post.featuredImage?.url && (
              <div className="aspect-video rounded-xl overflow-hidden mb-8">
                <img 
                  src={post.featuredImage.url} 
                  alt={post.featuredImage.alt || post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </header>

          <style jsx global>{`
            .blog-content {
              font-size: 1.125rem;
              line-height: 1.75;
              color: #374151;
            }
            .blog-content h1 {
              font-size: 2rem;
              font-weight: 700;
              color: #111827;
              margin-top: 2.5rem;
              margin-bottom: 1rem;
              line-height: 1.25;
            }
            .blog-content h2 {
              font-size: 1.5rem;
              font-weight: 700;
              color: #111827;
              margin-top: 2rem;
              margin-bottom: 1rem;
              line-height: 1.3;
              border-bottom: 2px solid #fbbf24;
              padding-bottom: 0.5rem;
            }
            .blog-content h3 {
              font-size: 1.25rem;
              font-weight: 600;
              color: #1f2937;
              margin-top: 1.5rem;
              margin-bottom: 0.75rem;
              line-height: 1.4;
            }
            .blog-content p {
              margin-bottom: 1.25rem;
              line-height: 1.8;
            }
            .blog-content a {
              color: #d97706;
              text-decoration: underline;
            }
            .blog-content a:hover {
              color: #b45309;
            }
            .blog-content strong {
              font-weight: 600;
              color: #111827;
            }
            .blog-content ul {
              list-style-type: disc;
              padding-left: 2rem;
              margin-top: 1rem;
              margin-bottom: 1.5rem;
            }
            .blog-content ol {
              list-style-type: decimal;
              padding-left: 2rem;
              margin-top: 1rem;
              margin-bottom: 1.5rem;
            }
            .blog-content li {
              margin-bottom: 0.75rem;
              padding-left: 0.5rem;
              line-height: 1.7;
            }
            .blog-content table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 1.5rem;
              margin-bottom: 1.5rem;
              font-size: 1rem;
            }
            .blog-content th {
              background-color: #fef3c7;
              border: 1px solid #d1d5db;
              padding: 0.75rem 1rem;
              text-align: left;
              font-weight: 600;
              color: #111827;
            }
            .blog-content td {
              border: 1px solid #d1d5db;
              padding: 0.75rem 1rem;
              vertical-align: top;
            }
            .blog-content tr:nth-child(even) {
              background-color: #f9fafb;
            }
            .blog-content blockquote {
              border-left: 4px solid #f59e0b;
              padding-left: 1.5rem;
              margin: 1.5rem 0;
              font-style: italic;
              color: #4b5563;
              background-color: #fffbeb;
              padding: 1rem 1.5rem;
              border-radius: 0 0.5rem 0.5rem 0;
            }
            .blog-content code {
              background-color: #f3f4f6;
              padding: 0.125rem 0.375rem;
              border-radius: 0.25rem;
              font-size: 0.875rem;
              font-family: monospace;
            }
            .blog-content pre {
              background-color: #1f2937;
              color: #f3f4f6;
              padding: 1rem;
              border-radius: 0.5rem;
              overflow-x: auto;
              margin: 1.5rem 0;
            }
            .blog-content pre code {
              background-color: transparent;
              padding: 0;
            }
            .blog-content em {
              font-style: italic;
            }
                      .blog-content hr {
                        border: none;
                        border-top: 1px solid #e5e7eb;
                        margin: 2rem 0;
                      }
                      /* Table of Contents - Collapsible Styles */
                      .blog-content nav,
                      .blog-content nav.table-of-contents {
                        background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
                        border: 1px solid #fbbf24;
                        border-radius: 0.75rem;
                        padding: 1rem 1.5rem;
                        margin: 1.5rem 0 2rem 0;
                      }
                      .blog-content nav h2 {
                        font-size: 1.25rem;
                        font-weight: 600;
                        color: #92400e;
                        margin: 0;
                        padding: 0;
                        border: none;
                        cursor: pointer;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        user-select: none;
                      }
                      .blog-content nav h2:hover {
                        color: #78350f;
                      }
                      .blog-content nav .toc-toggle-icon {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: #d97706;
                        transition: transform 0.3s ease;
                      }
                      .blog-content nav .toc-content {
                        overflow: hidden;
                        transition: max-height 0.3s ease-out;
                      }
                      .blog-content nav ul {
                        margin: 0.75rem 0 0 0;
                        padding-left: 1.25rem;
                        list-style-type: none;
                      }
                      .blog-content nav ul li {
                        margin-bottom: 0.5rem;
                        padding-left: 0;
                        line-height: 1.5;
                      }
                      .blog-content nav ul li::before {
                        content: "\\2022";
                        color: #f59e0b;
                        font-weight: bold;
                        display: inline-block;
                        width: 1em;
                        margin-left: -1em;
                      }
                      .blog-content nav ul ul {
                        margin-top: 0.5rem;
                        padding-left: 1.5rem;
                      }
                      .blog-content nav ul ul li::before {
                        content: "\\25E6";
                        color: #d97706;
                      }
                      .blog-content nav a {
                        color: #b45309;
                        text-decoration: none;
                        font-size: 0.95rem;
                      }
                      .blog-content nav a:hover {
                        color: #92400e;
                        text-decoration: underline;
                      }
                    `}</style>
          <div 
            className="blog-content max-w-none"
            dangerouslySetInnerHTML={{ __html: post.body }}
          />

          {post.author && (
            <Card className="mt-12 border-amber-100">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center flex-shrink-0">
                    <User className="w-8 h-8 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">About the Author</h3>
                    <p className="font-medium text-amber-600 mb-2">{post.author.name}</p>
                    {post.author.bio && (
                      <p className="text-gray-600 text-sm">{post.author.bio}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <Button variant="outline" asChild>
                <Link href="/blog">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  More Articles
                </Link>
              </Button>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: post.title,
                      url: window.location.href,
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                  }
                }}>
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </article>

        <Card className="mt-12 border-amber-100 bg-gradient-to-br from-amber-50 to-orange-50">
          <CardContent className="p-6 text-center">
            <BookOpen className="w-12 h-12 text-amber-600 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">Get Your Free Kundli Analysis</h3>
            <p className="text-gray-600 mb-4">
              Discover your birth chart and planetary positions with our free Kundli calculator.
            </p>
            <Button className="bg-gradient-to-r from-amber-500 to-orange-600" asChild>
              <Link href="/tools/kundli-calculator">
                Generate Free Kundli
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {post.seo && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BlogPosting",
              headline: post.title,
              description: post.seo.metaDescription || post.excerpt,
              image: post.featuredImage?.url,
              datePublished: post.publishedAt,
              author: post.author ? {
                "@type": "Person",
                name: post.author.name,
              } : undefined,
              publisher: {
                "@type": "Organization",
                name: "VedicStarAstro",
                logo: {
                  "@type": "ImageObject",
                  url: "https://vedicstarastro.com/images/logo.png",
                },
              },
              mainEntityOfPage: {
                "@type": "WebPage",
                "@id": `https://vedicstarastro.com/blog/${post.slug.current}`,
              },
            }),
          }}
        />
      )}
    </div>
  );
}
