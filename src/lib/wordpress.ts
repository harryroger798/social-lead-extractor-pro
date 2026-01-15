const WORDPRESS_API_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || "https://blog.vedicstarastro.com/wp-json/wp/v2";

export interface WordPressPost {
  id: number;
  date: string;
  modified: string;
  slug: string;
  status: string;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  excerpt: {
    rendered: string;
  };
  author: number;
  featured_media: number;
  categories: number[];
  tags: number[];
  yoast_head_json?: {
    title?: string;
    description?: string;
    og_title?: string;
    og_description?: string;
    og_image?: Array<{
      url: string;
      width: number;
      height: number;
    }>;
  };
  _embedded?: {
    author?: Array<{
      id: number;
      name: string;
      description: string;
      avatar_urls: {
        [key: string]: string;
      };
    }>;
    "wp:featuredmedia"?: Array<{
      id: number;
      source_url: string;
      alt_text: string;
      media_details: {
        width: number;
        height: number;
        sizes: {
          [key: string]: {
            source_url: string;
            width: number;
            height: number;
          };
        };
      };
    }>;
    "wp:term"?: Array<
      Array<{
        id: number;
        name: string;
        slug: string;
      }>
    >;
  };
}

export interface WordPressCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  count: number;
}

export interface WordPressTag {
  id: number;
  name: string;
  slug: string;
  count: number;
}

export interface WordPressAuthor {
  id: number;
  name: string;
  description: string;
  slug: string;
  avatar_urls: {
    [key: string]: string;
  };
}

export interface FetchPostsOptions {
  page?: number;
  perPage?: number;
  categories?: number[];
  tags?: number[];
  search?: string;
  orderBy?: "date" | "title" | "modified";
  order?: "asc" | "desc";
}

export async function fetchPosts(options: FetchPostsOptions = {}): Promise<{
  posts: WordPressPost[];
  totalPages: number;
  total: number;
}> {
  const {
    page = 1,
    perPage = 10,
    categories,
    tags,
    search,
    orderBy = "date",
    order = "desc",
  } = options;

  const params = new URLSearchParams({
    page: page.toString(),
    per_page: perPage.toString(),
    orderby: orderBy,
    order: order,
    _embed: "true",
  });

  if (categories?.length) {
    params.append("categories", categories.join(","));
  }

  if (tags?.length) {
    params.append("tags", tags.join(","));
  }

  if (search) {
    params.append("search", search);
  }

  try {
    const response = await fetch(`${WORDPRESS_API_URL}/posts?${params}`, {
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch posts: ${response.status}`);
    }

    const posts = await response.json();
    const totalPages = parseInt(response.headers.get("X-WP-TotalPages") || "1");
    const total = parseInt(response.headers.get("X-WP-Total") || "0");

    return { posts, totalPages, total };
  } catch (error) {
    console.error("Error fetching WordPress posts:", error);
    return { posts: [], totalPages: 0, total: 0 };
  }
}

export async function fetchPostBySlug(slug: string): Promise<WordPressPost | null> {
  try {
    const response = await fetch(
      `${WORDPRESS_API_URL}/posts?slug=${slug}&_embed=true`,
      { next: { revalidate: 300 } }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch post: ${response.status}`);
    }

    const posts = await response.json();
    return posts.length > 0 ? posts[0] : null;
  } catch (error) {
    console.error("Error fetching WordPress post:", error);
    return null;
  }
}

export async function fetchCategories(): Promise<WordPressCategory[]> {
  try {
    const response = await fetch(`${WORDPRESS_API_URL}/categories?per_page=100`, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching WordPress categories:", error);
    return [];
  }
}

export async function fetchTags(): Promise<WordPressTag[]> {
  try {
    const response = await fetch(`${WORDPRESS_API_URL}/tags?per_page=100`, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch tags: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching WordPress tags:", error);
    return [];
  }
}

export async function fetchAuthor(id: number): Promise<WordPressAuthor | null> {
  try {
    const response = await fetch(`${WORDPRESS_API_URL}/users/${id}`, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch author: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching WordPress author:", error);
    return null;
  }
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function getReadingTime(content: string): number {
  const text = stripHtml(content);
  const wordsPerMinute = 200;
  const words = text.split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

export function getFeaturedImageUrl(
  post: WordPressPost,
  size: "thumbnail" | "medium" | "large" | "full" = "large"
): string | null {
  const media = post._embedded?.["wp:featuredmedia"]?.[0];
  if (!media) return null;

  if (size === "full") {
    return media.source_url;
  }

  return media.media_details?.sizes?.[size]?.source_url || media.source_url;
}

export function getAuthorInfo(post: WordPressPost): {
  name: string;
  avatar: string;
  description: string;
} | null {
  const author = post._embedded?.author?.[0];
  if (!author) return null;

  return {
    name: author.name,
    avatar: author.avatar_urls?.["96"] || author.avatar_urls?.["48"] || "",
    description: author.description,
  };
}

export function getCategories(post: WordPressPost): Array<{ name: string; slug: string }> {
  const terms = post._embedded?.["wp:term"];
  if (!terms || !terms[0]) return [];

  return terms[0].map((cat) => ({
    name: cat.name,
    slug: cat.slug,
  }));
}

export function getTags(post: WordPressPost): Array<{ name: string; slug: string }> {
  const terms = post._embedded?.["wp:term"];
  if (!terms || !terms[1]) return [];

  return terms[1].map((tag) => ({
    name: tag.name,
    slug: tag.slug,
  }));
}
