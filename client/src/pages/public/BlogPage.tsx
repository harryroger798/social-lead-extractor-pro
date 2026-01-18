import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { motion } from 'framer-motion'
import { Calendar, User, ArrowRight, BookOpen, Lightbulb, Wrench, Shield } from 'lucide-react'

const blogPosts = [
  {
    id: 1,
    titleKey: 'post1Title',
    excerptKey: 'post1Excerpt',
    date: '2024-01-15',
    author: 'Sayan Roy',
    image: '/images/blog-tech-tips.png',
    icon: Lightbulb,
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 2,
    titleKey: 'post2Title',
    excerptKey: 'post2Excerpt',
    date: '2024-01-10',
    author: 'Rahul Kumar',
    image: '/images/blog-repair-guide.png',
    icon: Wrench,
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 3,
    titleKey: 'post3Title',
    excerptKey: 'post3Excerpt',
    date: '2024-01-05',
    author: 'Priya Sharma',
    image: '/images/blog-industry-news.png',
    icon: Shield,
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 4,
    titleKey: 'post4Title',
    excerptKey: 'post4Excerpt',
    date: '2024-01-01',
    author: 'Amit Das',
    image: '/images/blog-tech-tips.png',
    icon: Lightbulb,
    color: 'from-orange-500 to-red-500'
  },
]

export function BlogPage() {
  const { t, i18n } = useTranslation()

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 animate-pulse" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="h-20 w-20 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center mx-auto mb-6"
            >
              <BookOpen className="h-10 w-10 text-white" />
            </motion.div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              {t('public.blog.title')}
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto mb-4">
              {t('public.blog.subtitle')}
            </p>
            <p className="text-lg text-primary font-medium italic">
              {i18n.language === 'hi' ? '"Tech tips jo aapko smart banayein!"' :
               i18n.language === 'bn' ? '"টেক টিপস যা আপনাকে স্মার্ট করবে!"' :
               '"Tech tips to make you smarter!"'}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Blog Posts Section */}
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-2">
            {blogPosts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="backdrop-blur-lg bg-white/70 dark:bg-slate-800/70 border border-white/20 dark:border-slate-700/50 rounded-2xl shadow-xl overflow-hidden group"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={post.image}
                    alt={t(`public.blog.${post.titleKey}`)}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className={`absolute top-4 right-4 h-12 w-12 rounded-xl bg-gradient-to-br ${post.color} flex items-center justify-center`}
                  >
                    <post.icon className="h-6 w-6 text-white" />
                  </motion.div>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-primary" />
                      {new Date(post.date).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="h-4 w-4 text-primary" />
                      {post.author}
                    </span>
                  </div>

                  <h2 className="text-xl font-bold mb-3 dark:text-white line-clamp-2 group-hover:text-primary transition-colors">
                    {t(`public.blog.${post.titleKey}`)}
                  </h2>

                  <p className="text-muted-foreground mb-4 line-clamp-3">
                    {t(`public.blog.${post.excerptKey}`)}
                  </p>

                  <Button 
                    variant="link" 
                    className={`p-0 gap-2 bg-gradient-to-r ${post.color} bg-clip-text text-transparent font-semibold`}
                  >
                    {t('public.blog.readMore')} 
                    <ArrowRight className="h-4 w-4 text-primary" />
                  </Button>
                </div>
              </motion.article>
            ))}
          </div>

          {/* Quirky CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-16 text-center"
          >
            <div className="backdrop-blur-lg bg-gradient-to-r from-purple-600/90 to-pink-600/90 border border-white/20 rounded-2xl shadow-xl p-8 max-w-2xl mx-auto">
              <p className="text-white text-xl font-medium mb-2">
                {i18n.language === 'hi' ? '"Aur bhi tips chahiye? Subscribe karein!"' :
                 i18n.language === 'bn' ? '"আরও টিপস চান? সাবস্ক্রাইব করুন!"' :
                 '"Want more tips? Subscribe to our newsletter!"'}
              </p>
              <p className="text-white/70 text-sm">
                {i18n.language === 'hi' ? 'Spam nahi, sirf useful content - promise!' :
                 i18n.language === 'bn' ? 'স্প্যাম নয়, শুধু দরকারি কন্টেন্ট - প্রমিস!' :
                 'No spam, only useful content - promise!'}
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </PublicLayout>
  )
}
