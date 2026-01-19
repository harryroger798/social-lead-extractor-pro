import { useTranslation } from 'react-i18next'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { motion } from 'framer-motion'
import { Calendar, User, ArrowLeft, Clock, Tag, ExternalLink, Loader2 } from 'lucide-react'
import { GradientOrbs, FloatingTechIcons, DotGridPattern, FloatingParticles } from '@/components/ui/visual-enhancements'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getPostBySlug, type SanityPost } from '@/lib/sanity'
import { Button } from '@/components/ui/button'

export function BlogPostPage() {
  const { t } = useTranslation()
  const { slug } = useParams<{ slug: string }>()
  const [post, setPost] = useState<SanityPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPost() {
      if (!slug) return
      
      try {
        setLoading(true)
        const fetchedPost = await getPostBySlug(slug)
        if (fetchedPost) {
          setPost(fetchedPost)
        } else {
          setError('Post not found')
        }
      } catch (err) {
        console.error('Error fetching post from Sanity:', err)
        setError('Failed to load blog post')
      } finally {
        setLoading(false)
      }
    }
    fetchPost()
  }, [slug])

  if (loading) {
    return (
      <PublicLayout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading blog post...</span>
        </div>
      </PublicLayout>
    )
  }

  if (error || !post) {
    return (
      <PublicLayout>
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
          <h1 className="text-2xl font-bold text-foreground mb-4">{error || 'Post not found'}</h1>
          <Link to="/blog">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </PublicLayout>
    )
  }

  const readingTime = Math.ceil((post.body?.length || 0) / 1000)

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 animate-pulse" />
        <FloatingParticles count={20} color="white" />
        <FloatingTechIcons variant="light" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <Link to="/blog" className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-6 transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Back to Blog
            </Link>
            
            {post.status === 'draft' && (
              <div className="inline-block px-3 py-1 bg-yellow-500 text-white text-sm font-semibold rounded-full mb-4">
                Draft - Not Published
              </div>
            )}
            
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-6">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-white/70">
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {new Date(post.publishedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
              {post.author && (
                <span className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {post.author.name}
                </span>
              )}
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {readingTime} min read
              </span>
            </div>
            
            {post.categories && post.categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {post.categories.map((category) => (
                  <span
                    key={category._id}
                    className="flex items-center gap-1 px-3 py-1 bg-white/10 text-white text-sm rounded-full"
                  >
                    <Tag className="h-3 w-3" />
                    {category.title}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Featured Image */}
      {post.featuredImage?.url && (
        <section className="relative -mt-10 z-10">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="max-w-4xl mx-auto"
            >
              <img
                src={post.featuredImage.url}
                alt={post.featuredImage.alt || post.title}
                className="w-full h-64 md:h-96 object-cover rounded-2xl shadow-2xl"
              />
            </motion.div>
          </div>
        </section>
      )}

      {/* Content Section */}
      <section className="relative py-16 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 overflow-hidden">
        <GradientOrbs variant="subtle" />
        <DotGridPattern opacity="light" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.article
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="max-w-4xl mx-auto"
          >
            <div className="backdrop-blur-lg bg-white/70 dark:bg-slate-800/70 border border-white/20 dark:border-slate-700/50 rounded-2xl shadow-xl p-8 md:p-12">
              {/* Blog Content */}
              <div className="prose prose-lg dark:prose-invert max-w-none">
                {post.body.split('\n').map((paragraph, index) => {
                  if (paragraph.startsWith('# ')) {
                    return <h1 key={index} className="text-3xl font-bold mt-8 mb-4">{paragraph.slice(2)}</h1>
                  }
                  if (paragraph.startsWith('## ')) {
                    return <h2 key={index} className="text-2xl font-bold mt-6 mb-3">{paragraph.slice(3)}</h2>
                  }
                  if (paragraph.startsWith('### ')) {
                    return <h3 key={index} className="text-xl font-bold mt-4 mb-2">{paragraph.slice(4)}</h3>
                  }
                  if (paragraph.startsWith('- ')) {
                    return <li key={index} className="ml-4">{paragraph.slice(2)}</li>
                  }
                  if (paragraph.trim() === '') {
                    return <br key={index} />
                  }
                  return <p key={index} className="mb-4 text-muted-foreground leading-relaxed">{paragraph}</p>
                })}
              </div>

              {/* Author Bio */}
              {post.author && (
                <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex items-start gap-4">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold">
                      {post.author.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{post.author.name}</h3>
                      {post.author.bio && (
                        <p className="text-muted-foreground mt-1">{post.author.bio}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Links Section */}
              {((post.internalLinks && post.internalLinks.length > 0) || (post.externalLinks && post.externalLinks.length > 0)) && (
                <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
                  <h3 className="font-bold text-lg mb-4">Related Links</h3>
                  <div className="flex flex-wrap gap-3">
                    {post.internalLinks?.map((link, index) => (
                      <Link
                        key={`internal-${index}`}
                        to={link}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                      >
                        {link}
                      </Link>
                    ))}
                    {post.externalLinks?.map((link, index) => (
                      <a
                        key={`external-${index}`}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-foreground rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                        {new URL(link).hostname}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Back to Blog CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-8 text-center"
            >
              <Link to="/blog">
                <Button variant="outline" size="lg" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  {t('public.blog.backToBlog') || 'Back to All Posts'}
                </Button>
              </Link>
            </motion.div>
          </motion.article>
        </div>
      </section>
    </PublicLayout>
  )
}
