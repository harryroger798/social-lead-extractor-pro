import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LanguageSelector } from '@/components/LanguageSelector'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Smartphone, Laptop, Tablet, Monitor, Headphones, Watch, Cpu, HardDrive } from 'lucide-react'

const services = [
  { icon: Smartphone, key: 'smartphone', price: '₹500 - ₹5,000' },
  { icon: Laptop, key: 'laptop', price: '₹1,000 - ₹15,000' },
  { icon: Tablet, key: 'tablet', price: '₹800 - ₹8,000' },
  { icon: Monitor, key: 'desktop', price: '₹1,500 - ₹20,000' },
  { icon: Headphones, key: 'audio', price: '₹300 - ₹3,000' },
  { icon: Watch, key: 'smartwatch', price: '₹500 - ₹5,000' },
  { icon: Cpu, key: 'gaming', price: '₹2,000 - ₹25,000' },
  { icon: HardDrive, key: 'dataRecovery', price: '₹1,000 - ₹10,000' },
]

export function PublicServicesPage() {
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
            <Link to="/services" className="text-sm font-medium text-primary">
              {t('nav.services')}
            </Link>
            <Link to="/about" className="text-sm font-medium hover:text-primary">
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
          <h1 className="text-4xl font-bold mb-4">{t('public.services.title')}</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('public.services.subtitle')}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <Card key={service.key} className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <service.icon className="h-12 w-12 mx-auto text-primary mb-4" />
                <CardTitle>{t(`public.services.${service.key}.title`)}</CardTitle>
                <CardDescription>{t(`public.services.${service.key}.description`)}</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-2xl font-bold text-primary">{service.price}</p>
                <p className="text-sm text-muted-foreground">{t('public.services.priceRange')}</p>
                <Link to="/booking" className="mt-4 block">
                  <Button className="w-full">{t('public.services.bookNow')}</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-4">{t('public.services.whyChooseUs')}</h2>
          <div className="grid gap-8 md:grid-cols-3 mt-8">
            <div>
              <h3 className="text-lg font-semibold mb-2">{t('public.services.expertTechnicians')}</h3>
              <p className="text-muted-foreground">{t('public.services.expertTechniciansDesc')}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">{t('public.services.warranty')}</h3>
              <p className="text-muted-foreground">{t('public.services.warrantyDesc')}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">{t('public.services.fastService')}</h3>
              <p className="text-muted-foreground">{t('public.services.fastServiceDesc')}</p>
            </div>
          </div>
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
