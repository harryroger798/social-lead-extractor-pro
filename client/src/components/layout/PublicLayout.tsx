import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { LanguageSelector } from '@/components/LanguageSelector'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Menu, X, Mail, MapPin, Phone, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react'

interface PublicLayoutProps {
  children: React.ReactNode
}

export function PublicLayout({ children }: PublicLayoutProps) {
  const { t } = useTranslation()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = [
    { href: '/', label: t('nav.home') },
    { href: '/services', label: t('nav.services') },
    { href: '/about', label: t('nav.about') },
    { href: '/contact', label: t('nav.contact') },
    { href: '/blog', label: t('nav.blog') },
    { href: '/booking', label: t('nav.booking') },
  ]

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/'
    return location.pathname.startsWith(href)
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2">
                                                    <img src="/images/favicon.png" alt="ByteCare" className="h-14 w-14 object-contain" />
                                                    <span className="text-3xl font-bold text-primary">ByteCare</span>
                        </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    isActive(link.href)
                      ? 'text-primary'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right side actions */}
            <div className="flex items-center gap-2">
              <LanguageSelector />
              <ThemeToggle />
              <Link to="/login" className="hidden sm:block">
                <Button>{t('nav.login')}</Button>
              </Link>
              
              {/* Mobile menu button */}
              <button
                className="md:hidden p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6 text-slate-600 dark:text-slate-300" />
                ) : (
                  <Menu className="h-6 w-6 text-slate-600 dark:text-slate-300" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-slate-200 dark:border-slate-700">
              <nav className="flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive(link.href)
                        ? 'bg-primary/10 text-primary'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2 mt-2"
                >
                  <Button className="w-full">{t('nav.login')}</Button>
                </Link>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid gap-8 md:grid-cols-4">
            {/* Company Info */}
            <div className="md:col-span-1">
                                                        <div className="flex items-center gap-2 mb-4">
                                                          <img src="/images/favicon.png" alt="ByteCare" className="h-14 w-14 object-contain" />
                                                          <span className="text-2xl font-bold">ByteCare</span>
                                                        </div>
              <p className="text-slate-400 text-sm mb-4">
                {t('footer.description')}
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  <Linkedin className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold mb-4">{t('footer.quickLinks')}</h3>
              <ul className="space-y-2">
                {navLinks.slice(1).map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-slate-400 hover:text-white transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div>
              <h3 className="font-semibold mb-4">{t('footer.services')}</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>{t('footer.pcRepair')}</li>
                <li>{t('footer.mobileRepair')}</li>
                <li>{t('footer.laptopRepair')}</li>
                <li>{t('footer.dataRecovery')}</li>
                <li>{t('footer.webDevelopment')}</li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="font-semibold mb-4">{t('footer.contactUs')}</h3>
              <ul className="space-y-3 text-sm text-slate-400">
                <li className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>Barrackpore, West Bengal, India</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 flex-shrink-0" />
                  <span>+91 98765 43210</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 flex-shrink-0" />
                  <span>harryroger798@gmail.com</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-slate-800 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-400 text-sm">
              &copy; {new Date().getFullYear()} ByteCare. {t('footer.rights')}
            </p>
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-slate-400 hover:text-white transition-colors text-sm">
                {t('footer.adminLogin')}
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
