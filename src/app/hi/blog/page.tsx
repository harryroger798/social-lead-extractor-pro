"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, ArrowRight, Tag, Globe } from "lucide-react";
import { getAllPosts, formatDate, SanityPost } from "@/lib/sanity";

export default function HindiBlogPage() {
  const [posts, setPosts] = useState<SanityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const allPosts = await getAllPosts('hi');
        setPosts(allPosts);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, []);

  const categories = posts.reduce((acc, post) => {
    post.categories?.forEach((cat) => {
      if (!acc.find((c) => c._id === cat._id)) {
        acc.push(cat);
      }
    });
    return acc;
  }, [] as Array<{ _id: string; title: string; slug: { current: string } }>);

  const filteredPosts = selectedCategory
    ? posts.filter((post) =>
        post.categories?.some((cat) => cat._id === selectedCategory)
      )
    : posts;

  const getCategoryCount = (categoryId: string) => {
    return posts.filter((post) =>
      post.categories?.some((cat) => cat._id === categoryId)
    ).length;
  };

  if (loading) {
    return (
      <div className="py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-96 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            वैदिक ज्योतिष ब्लॉग
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            वैदिक ज्योतिष, कुंडली विश्लेषण, नक्षत्र, और आध्यात्मिक मार्गदर्शन पर विशेषज्ञ लेख पढ़ें।
          </p>
          {/* Language Toggle */}
          <div className="mt-4 flex items-center justify-center gap-2">
            <Globe className="w-4 h-4 text-gray-500" />
            <Link href="/blog" className="text-sm text-gray-500 hover:text-orange-600">
              English
            </Link>
            <span className="text-gray-300">|</span>
            <span className="text-sm text-orange-600 font-medium">हिंदी</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Categories */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">श्रेणियाँ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button
                    variant={selectedCategory === null ? "default" : "ghost"}
                    className="w-full justify-between"
                    onClick={() => setSelectedCategory(null)}
                  >
                    <span>सभी लेख</span>
                    <Badge variant="secondary">{posts.length}</Badge>
                  </Button>
                  {categories.map((category) => (
                    <Button
                      key={category._id}
                      variant={
                        selectedCategory === category._id ? "default" : "ghost"
                      }
                      className="w-full justify-between"
                      onClick={() => setSelectedCategory(category._id)}
                    >
                      <span className="truncate">{category.title}</span>
                      <Badge variant="secondary">
                        {getCategoryCount(category._id)}
                      </Badge>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Blog Posts */}
          <div className="lg:col-span-3">
            {filteredPosts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  {selectedCategory
                    ? "इस श्रेणी में कोई लेख नहीं मिला।"
                    : "अभी तक कोई हिंदी ब्लॉग पोस्ट प्रकाशित नहीं हुई है।"}
                </p>
                <Link href="/blog" className="text-orange-600 hover:underline mt-2 inline-block">
                  अंग्रेजी ब्लॉग देखें
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredPosts.map((post) => (
                  <Card
                    key={post._id}
                    className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full"
                  >
                    {post.featuredImage?.url && (
                      <div className="relative h-48 w-full">
                        <Image
                          src={post.featuredImage.url}
                          alt={post.featuredImage.alt || post.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <CardHeader className="flex-grow">
                      <div className="flex flex-wrap gap-2 mb-2">
                        {post.categories?.slice(0, 2).map((category) => (
                          <Badge
                            key={category._id}
                            variant="secondary"
                            className="text-xs"
                          >
                            <Tag className="w-3 h-3 mr-1" />
                            {category.title}
                          </Badge>
                        ))}
                      </div>
                      <CardTitle className="text-xl line-clamp-2">
                        <Link
                          href={`/hi/blog/${post.slug.current}`}
                          className="hover:text-orange-600 transition-colors"
                        >
                          {post.title}
                        </Link>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-4">
                          {post.author?.name && (
                            <span className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              {post.author.name}
                            </span>
                          )}
                          {post.publishedAt && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(post.publishedAt)}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button
                        asChild
                        variant="link"
                        className="p-0 mt-4 text-orange-600"
                      >
                        <Link href={`/hi/blog/${post.slug.current}`}>
                          पूरा पढ़ें
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
