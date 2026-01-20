"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, User, ArrowLeft, Share2, BookOpen } from "lucide-react";
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

          <div className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-amber-600 prose-strong:text-gray-900">
            {post.body.split('\n\n').map((paragraph, index) => {
              if (paragraph.startsWith('## ')) {
                return <h2 key={index} className="text-2xl font-bold mt-8 mb-4">{paragraph.replace('## ', '')}</h2>;
              }
              if (paragraph.startsWith('### ')) {
                return <h3 key={index} className="text-xl font-semibold mt-6 mb-3">{paragraph.replace('### ', '')}</h3>;
              }
              if (paragraph.startsWith('- ')) {
                const items = paragraph.split('\n').filter(line => line.startsWith('- '));
                return (
                  <ul key={index} className="list-disc pl-6 my-4 space-y-2">
                    {items.map((item, i) => (
                      <li key={i} className="text-gray-700">{item.replace('- ', '')}</li>
                    ))}
                  </ul>
                );
              }
              if (paragraph.trim()) {
                return <p key={index} className="mb-4 leading-relaxed">{paragraph}</p>;
              }
              return null;
            })}
          </div>

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
