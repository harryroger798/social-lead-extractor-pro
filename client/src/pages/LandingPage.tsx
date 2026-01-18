import { Link, Navigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/stores/authStore'
import { useTranslation } from 'react-i18next'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { 
  Wrench, 
  Smartphone, 
  Monitor, 
  Globe, 
  Shield, 
  Clock, 
  Users, 
  CheckCircle,
  ArrowRight
} from 'lucide-react'

export function LandingPage() {
  const { isAuthenticated } = useAuthStore()
  const { t } = useTranslation()
  
  const isElectron = typeof window !== 'undefined' && window.electronAPI?.isElectron
  
  if (isElectron) {
    if (isAuthenticated) {
      return <Navigate to="/app" replace />
    }
    return <Navigate to="/login" replace />
  }
  
    return (
      <PublicLayout>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
          {t('landing.hero.title')}
          <span className="text-primary block mt-2">{t('landing.hero.subtitle')}</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          {t('landing.hero.description')}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/booking">
            <Button size="lg" className="gap-2">
              {t('landing.hero.getStarted')} <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/services">
            <Button size="lg" variant="outline">
              {t('landing.hero.viewServices')}
            </Button>
          </Link>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-4 dark:text-white">{t('landing.services.title')}</h2>
        <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
          {t('landing.services.subtitle')}
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="hover:shadow-lg transition-shadow dark:bg-slate-800">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-4">
                <Monitor className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="dark:text-white">{t('landing.services.pcRepair.title')}</CardTitle>
              <CardDescription>
                {t('landing.services.pcRepair.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  {t('landing.services.pcRepair.feature1')}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  {t('landing.services.pcRepair.feature2')}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  {t('landing.services.pcRepair.feature3')}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  {t('landing.services.pcRepair.feature4')}
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow dark:bg-slate-800">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center mb-4">
                <Smartphone className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="dark:text-white">{t('landing.services.mobileRepair.title')}</CardTitle>
              <CardDescription>
                {t('landing.services.mobileRepair.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  {t('landing.services.mobileRepair.feature1')}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  {t('landing.services.mobileRepair.feature2')}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  {t('landing.services.mobileRepair.feature3')}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  {t('landing.services.mobileRepair.feature4')}
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow dark:bg-slate-800">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center mb-4">
                <Globe className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle className="dark:text-white">{t('landing.services.digitalServices.title')}</CardTitle>
              <CardDescription>
                {t('landing.services.digitalServices.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  {t('landing.services.digitalServices.feature1')}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  {t('landing.services.digitalServices.feature2')}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  {t('landing.services.digitalServices.feature3')}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  {t('landing.services.digitalServices.feature4')}
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white dark:bg-slate-800 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4 dark:text-white">{t('landing.features.title')}</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            {t('landing.features.subtitle')}
          </p>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Wrench className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2 dark:text-white">{t('landing.features.expertTechnicians.title')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('landing.features.expertTechnicians.description')}
              </p>
            </div>
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2 dark:text-white">{t('landing.features.quickTurnaround.title')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('landing.features.quickTurnaround.description')}
              </p>
            </div>
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2 dark:text-white">{t('landing.features.warranty.title')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('landing.features.warranty.description')}
              </p>
            </div>
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2 dark:text-white">{t('landing.features.customerSupport.title')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('landing.features.customerSupport.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-4 gap-8 text-center">
          <div>
            <p className="text-4xl font-bold text-primary mb-2">500+</p>
            <p className="text-muted-foreground">{t('landing.stats.devicesRepaired')}</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-primary mb-2">200+</p>
            <p className="text-muted-foreground">{t('landing.stats.happyCustomers')}</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-primary mb-2">50+</p>
            <p className="text-muted-foreground">{t('landing.stats.digitalProjects')}</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-primary mb-2">98%</p>
            <p className="text-muted-foreground">{t('landing.stats.satisfactionRate')}</p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="bg-white dark:bg-slate-800 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4 dark:text-white">{t('landing.about.title')}</h2>
            <p className="text-muted-foreground mb-6">
              {t('landing.about.description1')}
            </p>
            <p className="text-muted-foreground">
              {t('landing.about.description2')}
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4 dark:text-white">{t('landing.contact.title')}</h2>
          <p className="text-muted-foreground mb-8">
            {t('landing.contact.subtitle')}
          </p>
          <Card className="dark:bg-slate-800">
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-2 gap-6 text-left">
                <div>
                  <h3 className="font-semibold mb-2 dark:text-white">{t('landing.contact.contactInfo')}</h3>
                  <p className="text-sm text-muted-foreground mb-1">
                    {t('landing.contact.email')}: harryroger798@gmail.com
                  </p>
                  <p className="text-sm text-muted-foreground mb-1">
                    {t('landing.contact.location')}: Barrackpore, West Bengal
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 dark:text-white">{t('landing.contact.businessHours')}</h3>
                  <p className="text-sm text-muted-foreground mb-1">
                    {t('landing.contact.weekdays')}: 10:00 AM - 8:00 PM
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t('landing.contact.sunday')}: {t('landing.contact.closed')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

    </PublicLayout>
  )
}
