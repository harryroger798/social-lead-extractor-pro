import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { LanguageSelector } from '@/components/LanguageSelector'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Users, Award, Clock, Shield } from 'lucide-react'

export function AboutPage() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="text-2xl font-bold text-primary">
            ByteCare
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm font-medium hover:text-primary">
              {t('nav.home')}
            </Link>
            <Link to="/services" className="text-sm font-medium hover:text-primary">
              {t('nav.services')}
            </Link>
            <Link to="/about" className="text-sm font-medium text-primary">
              {t('nav.about')}
            </Link>
            <Link to="/contact" className="text-sm font-medium hover:text-primary">
              {t('nav.contact')}
            </Link>
            <Link to="/blog" className="text-sm font-medium hover:text-primary">
              {t('nav.blog')}
            </Link>
            <Link to="/booking" className="text-sm font-medium hover:text-primary">
              {t('nav.booking')}
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <LanguageSelector />
            <ThemeToggle />
            <Link to="/login">
              <Button>{t('nav.login')}</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">{t('public.about.title')}</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('public.about.subtitle')}
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 mb-16">
          <div>
            <h2 className="text-2xl font-bold mb-4">{t('public.about.ourStory')}</h2>
            <p className="text-muted-foreground mb-4">
              {t('public.about.storyPara1')}
            </p>
            <p className="text-muted-foreground">
              {t('public.about.storyPara2')}
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-4">{t('public.about.ourMission')}</h2>
            <p className="text-muted-foreground mb-4">
              {t('public.about.missionPara1')}
            </p>
            <p className="text-muted-foreground">
              {t('public.about.missionPara2')}
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-4 mb-16">
          <Card>
            <CardContent className="pt-6 text-center">
              <Users className="h-12 w-12 mx-auto text-primary mb-4" />
              <h3 className="text-3xl font-bold">5000+</h3>
              <p className="text-muted-foreground">{t('public.about.happyCustomers')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Award className="h-12 w-12 mx-auto text-primary mb-4" />
              <h3 className="text-3xl font-bold">10+</h3>
              <p className="text-muted-foreground">{t('public.about.yearsExperience')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Clock className="h-12 w-12 mx-auto text-primary mb-4" />
              <h3 className="text-3xl font-bold">24/7</h3>
              <p className="text-muted-foreground">{t('public.about.support')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Shield className="h-12 w-12 mx-auto text-primary mb-4" />
              <h3 className="text-3xl font-bold">100%</h3>
              <p className="text-muted-foreground">{t('public.about.satisfaction')}</p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mb-16">
          <h2 className="text-2xl font-bold mb-8">{t('public.about.ourValues')}</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <h3 className="text-lg font-semibold mb-2">{t('public.about.quality')}</h3>
              <p className="text-muted-foreground">{t('public.about.qualityDesc')}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">{t('public.about.integrity')}</h3>
              <p className="text-muted-foreground">{t('public.about.integrityDesc')}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">{t('public.about.innovation')}</h3>
              <p className="text-muted-foreground">{t('public.about.innovationDesc')}</p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">{t('public.about.readyToStart')}</h2>
          <p className="text-muted-foreground mb-6">{t('public.about.readyToStartDesc')}</p>
          <Link to="/booking">
            <Button size="lg">{t('public.about.bookAppointment')}</Button>
          </Link>
        </div>
      </main>

      <footer className="border-t bg-card py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2024 ByteCare. {t('public.footer.rights')}</p>
        </div>
      </footer>
    </div>
  )
}
