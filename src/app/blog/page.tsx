"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Calendar, Clock, User, ArrowRight, Search, Tag } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { getAllPosts, SanityPost } from "@/lib/sanity";

const categories = [
  { name: "Kundli & Birth Charts", count: 24, slug: "kundli" },
  { name: "Nakshatras", count: 18, slug: "nakshatra" },
  { name: "Kundli Milan & Horoscope Matching", count: 15, slug: "kundli-milan" },
  { name: "Doshas & Remedies", count: 22, slug: "doshas" },
  { name: "Navagraha & Planets", count: 12, slug: "navagraha" },
  { name: "Career Astrology", count: 10, slug: "career-astrology" },
  { name: "Relationship Astrology", count: 8, slug: "relationship-astrology" },
  { name: "Muhurta & Auspicious Timing", count: 14, slug: "muhurta" },
];

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

export default function BlogPage() {
  const { t } = useLanguage();
  const [sanityPosts, setSanityPosts] = useState<SanityPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const posts = await getAllPosts();
        setSanityPosts(posts);
      } catch (error) {
        console.error("Error fetching posts from Sanity:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, []);

  const displayPosts = sanityPosts.length > 0 ? sanityPosts : [];

  return (
    <div className="py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-amber-100 text-amber-800">Blog</Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Vedic Astrology Insights
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore articles, guides, and insights on Vedic astrology. Learn from our expert 
            astrologers about Kundli interpretation, planetary transits, and effective remedies.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-12 max-w-2xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search articles..."
              className="pl-10"
            />
          </div>
          <Button variant="outline">
            <Tag className="w-4 h-4 mr-2" />
            Categories
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading articles...</p>
          </div>
        ) : displayPosts.length > 0 ? (
          <>
            <section className="mb-16">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Latest Articles</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {displayPosts.slice(0, 3).map((post) => (
                  <Card key={post._id} className="group hover:shadow-lg transition-all duration-300 border-amber-100 hover:border-amber-300 overflow-hidden">
                    <div className="aspect-video bg-gradient-to-br from-amber-100 to-orange-100 relative">
                      {post.featuredImage?.url ? (
                        <img 
                          src={post.featuredImage.url} 
                          alt={post.featuredImage.alt || post.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-4xl">📜</span>
                        </div>
                      )}
                      <Badge className="absolute top-3 left-3 bg-amber-500 text-white">
                        {post.categories?.[0]?.title || "Astrology"}
                      </Badge>
                    </div>
                    <CardHeader>
                      <CardTitle className="text-lg group-hover:text-amber-600 transition-colors line-clamp-2">
                        <Link href={`/blog/${post.slug.current}`}>{post.title}</Link>
                      </CardTitle>
                      <CardDescription className="line-clamp-2">{post.excerpt}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(post.publishedAt)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {estimateReadTime(post.body)} min read
                        </div>
                      </div>
                      {post.author && (
                        <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
                          <User className="w-4 h-4" />
                          {post.author.name}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {displayPosts.length > 3 && (
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <section>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">More Articles</h2>
                    <div className="space-y-6">
                      {displayPosts.slice(3).map((post) => (
                        <Card key={post._id} className="group hover:shadow-md transition-all duration-300 border-gray-100 hover:border-amber-200">
                          <CardContent className="p-6">
                            <div className="flex gap-6">
                              <div className="hidden sm:block w-32 h-24 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg flex-shrink-0 overflow-hidden">
                                {post.featuredImage?.url ? (
                                  <img 
                                    src={post.featuredImage.url} 
                                    alt={post.featuredImage.alt || post.title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <span className="text-3xl">📖</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge variant="outline" className="text-xs">{post.categories?.[0]?.title || "Astrology"}</Badge>
                                  <span className="text-xs text-gray-400">•</span>
                                  <span className="text-xs text-gray-500">{formatDate(post.publishedAt)}</span>
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-amber-600 transition-colors">
                                  <Link href={`/blog/${post.slug.current}`}>{post.title}</Link>
                                </h3>
                                <p className="text-sm text-gray-600 line-clamp-2 mb-3">{post.excerpt}</p>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <User className="w-4 h-4" />
                                    {post.author?.name || "VedicStarAstro Team"}
                                  </div>
                                  <div className="flex items-center gap-1 text-sm text-gray-500">
                                    <Clock className="w-4 h-4" />
                                    {estimateReadTime(post.body)} min
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </section>
                </div>

                <div className="lg:col-span-1">
                  <div className="sticky top-24 space-y-8">
                    <Card className="border-amber-100">
                      <CardHeader>
                        <CardTitle className="text-lg">Categories</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {categories.map((category) => (
                            <Link
                              key={category.slug}
                              href={`/blog/category/${category.slug}`}
                              className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-amber-50 transition-colors"
                            >
                              <span className="text-gray-700">{category.name}</span>
                              <Badge variant="secondary" className="bg-gray-100">
                                {category.count}
                              </Badge>
                            </Link>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-amber-100 bg-gradient-to-br from-amber-50 to-orange-50">
                      <CardContent className="pt-6">
                        <h3 className="font-semibold text-gray-900 mb-2">Get Your Free Kundli</h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Generate your complete birth chart with planetary positions and predictions.
                        </p>
                        <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-600" asChild>
                          <Link href="/tools/kundli-calculator">
                            Generate Now
                            <ArrowRight className="ml-2 w-4 h-4" />
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No articles published yet. Check back soon!</p>
            <Button asChild>
              <Link href="/">
                Return Home
              </Link>
            </Button>
          </div>
        )}
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            name: "VedicStarAstro Blog",
            description: "Vedic astrology articles, guides, and insights",
            url: "https://vedicstarastro.com/blog",
            publisher: {
              "@type": "Organization",
              name: "VedicStarAstro",
            },
          }),
        }}
      />
    </div>
  );
}
