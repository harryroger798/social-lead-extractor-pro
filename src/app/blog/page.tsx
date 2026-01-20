"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Calendar, Clock, User, ArrowRight, Search, Tag } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const featuredPosts = [
  {
    id: 1,
    title: "Understanding Your Birth Chart: A Complete Beginner's Guide",
    excerpt: "Learn how to read and interpret your Vedic birth chart (Kundli) with this comprehensive guide for beginners.",
    slug: "understanding-birth-chart-beginners-guide",
    date: "2025-01-10",
    readTime: 12,
    author: "Acharya Shridhar Khandal",
    category: "Kundli Analysis",
    image: "/blog/birth-chart-guide.jpg",
    featured: true,
  },
  {
    id: 2,
    title: "Saturn Transit 2025: Effects on All 12 Moon Signs",
    excerpt: "Discover how Saturn's transit through Aquarius will affect your Moon sign and what remedies can help.",
    slug: "saturn-transit-2025-effects-moon-signs",
    date: "2025-01-08",
    readTime: 15,
    author: "Madhav Sharma",
    category: "Transits",
    image: "/blog/saturn-transit.jpg",
    featured: true,
  },
  {
    id: 3,
    title: "Mangal Dosha: Myths, Facts, and Effective Remedies",
    excerpt: "Separating fact from fiction about Mangal Dosha and exploring proven remedies that actually work.",
    slug: "mangal-dosha-myths-facts-remedies",
    date: "2025-01-05",
    readTime: 10,
    author: "Raj Kumar Shastri",
    category: "Doshas",
    image: "/blog/mangal-dosha.jpg",
    featured: true,
  },
];

const recentPosts = [
  {
    id: 4,
    title: "The Power of Nakshatras in Career Selection",
    excerpt: "How your birth Nakshatra can guide you towards the most suitable career path.",
    slug: "nakshatras-career-selection-guide",
    date: "2025-01-03",
    readTime: 8,
    author: "Banwari Dadich",
    category: "Career",
  },
  {
    id: 5,
    title: "Rahu Ketu Transit 2025: What to Expect",
    excerpt: "A detailed analysis of Rahu-Ketu axis shift and its impact on different ascendants.",
    slug: "rahu-ketu-transit-2025-predictions",
    date: "2025-01-01",
    readTime: 14,
    author: "Nemichand Shastri",
    category: "Transits",
  },
  {
    id: 6,
    title: "Gemstones in Vedic Astrology: A Scientific Approach",
    excerpt: "Understanding the science behind astrological gemstones and how to choose the right one.",
    slug: "gemstones-vedic-astrology-scientific-approach",
    date: "2024-12-28",
    readTime: 11,
    author: "Vinod Shastri",
    category: "Remedies",
  },
  {
    id: 7,
    title: "Marriage Compatibility: Beyond Guna Milan",
    excerpt: "Why 36 Guna matching alone isn't enough and what else to consider for marriage compatibility.",
    slug: "marriage-compatibility-beyond-guna-milan",
    date: "2024-12-25",
    readTime: 9,
    author: "Bajarangbali Dubey",
    category: "Relationships",
  },
  {
    id: 8,
    title: "Vimshottari Dasha: Predicting Life Events",
    excerpt: "Master the art of timing predictions using the Vimshottari Dasha system.",
    slug: "vimshottari-dasha-predicting-life-events",
    date: "2024-12-22",
    readTime: 16,
    author: "Pankaj Shastri",
    category: "Predictions",
  },
  {
    id: 9,
    title: "Remedies for Weak Planets in Your Chart",
    excerpt: "Practical and effective remedies to strengthen weak planetary positions.",
    slug: "remedies-weak-planets-chart",
    date: "2024-12-20",
    readTime: 10,
    author: "Acharya Shridhar Khandal",
    category: "Remedies",
  },
];

const categories = [
  { name: "Kundli Analysis", count: 24, slug: "kundli-analysis" },
  { name: "Nakshatras", count: 18, slug: "nakshatras" },
  { name: "Transits", count: 15, slug: "transits" },
  { name: "Remedies", count: 22, slug: "remedies" },
  { name: "Relationships", count: 12, slug: "relationships" },
  { name: "Career", count: 10, slug: "career" },
  { name: "Predictions", count: 8, slug: "predictions" },
  { name: "Doshas", count: 14, slug: "doshas" },
];

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function BlogPage() {
  const { t } = useLanguage();
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

        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Articles</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {featuredPosts.map((post) => (
              <Card key={post.id} className="group hover:shadow-lg transition-all duration-300 border-amber-100 hover:border-amber-300 overflow-hidden">
                <div className="aspect-video bg-gradient-to-br from-amber-100 to-orange-100 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl">📜</span>
                  </div>
                  <Badge className="absolute top-3 left-3 bg-amber-500 text-white">
                    Featured
                  </Badge>
                </div>
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">{post.category}</Badge>
                  </div>
                  <CardTitle className="text-lg group-hover:text-amber-600 transition-colors line-clamp-2">
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                  </CardTitle>
                  <CardDescription className="line-clamp-2">{post.excerpt}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(post.date)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {post.readTime} min read
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Articles</h2>
              <div className="space-y-6">
                {recentPosts.map((post) => (
                  <Card key={post.id} className="group hover:shadow-md transition-all duration-300 border-gray-100 hover:border-amber-200">
                    <CardContent className="p-6">
                      <div className="flex gap-6">
                        <div className="hidden sm:block w-32 h-24 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg flex-shrink-0 flex items-center justify-center">
                          <span className="text-3xl">📖</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">{post.category}</Badge>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-500">{formatDate(post.date)}</span>
                          </div>
                          <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-amber-600 transition-colors">
                            <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-2 mb-3">{post.excerpt}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <User className="w-4 h-4" />
                              {post.author}
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <Clock className="w-4 h-4" />
                              {post.readTime} min
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="mt-8 flex justify-center">
                <Button variant="outline">
                  Load More Articles
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
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

              <Card className="border-amber-100">
                <CardHeader>
                  <CardTitle className="text-lg">Newsletter</CardTitle>
                  <CardDescription>
                    Get weekly astrology insights delivered to your inbox.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Input placeholder="Your email address" type="email" />
                    <Button className="w-full" variant="outline">
                      Subscribe
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    No spam. Unsubscribe anytime.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
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
