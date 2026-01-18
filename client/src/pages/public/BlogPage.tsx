import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { Calendar, User, ArrowRight } from 'lucide-react'

const blogPosts = [
  {
    id: 1,
    titleKey: 'post1Title',
    excerptKey: 'post1Excerpt',
    date: '2024-01-15',
    author: 'Sayan Roy',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400'
  },
  {
    id: 2,
    titleKey: 'post2Title',
    excerptKey: 'post2Excerpt',
    date: '2024-01-10',
    author: 'Rahul Kumar',
    image: 'https://images.unsplash.com/photo-1563770660941-20978e870e26?w=400'
  },
  {
    id: 3,
    titleKey: 'post3Title',
    excerptKey: 'post3Excerpt',
    date: '2024-01-05',
    author: 'Priya Sharma',
    image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400'
  },
  {
    id: 4,
    titleKey: 'post4Title',
    excerptKey: 'post4Excerpt',
    date: '2024-01-01',
    author: 'Amit Das',
    image: 'https://images.unsplash.com/photo-1580910051074-3eb694886f8b?w=400'
  },
]

export function BlogPage() {
  const { t } = useTranslation()

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">{t('public.blog.title')}</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('public.blog.subtitle')}
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {blogPosts.map((post) => (
            <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <img
                src={post.image}
                alt={t(`public.blog.${post.titleKey}`)}
                className="w-full h-48 object-cover"
              />
              <CardHeader>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(post.date).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {post.author}
                  </span>
                </div>
                <CardTitle className="line-clamp-2">{t(`public.blog.${post.titleKey}`)}</CardTitle>
                <CardDescription className="line-clamp-3">
                  {t(`public.blog.${post.excerptKey}`)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="link" className="p-0">
                  {t('public.blog.readMore')} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </PublicLayout>
  )
}
