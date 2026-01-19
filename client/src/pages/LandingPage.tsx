import { Link, Navigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/authStore'
import { useTranslation } from 'react-i18next'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'
import { 
  Wrench, 
  Smartphone, 
  Monitor, 
  Globe, 
  Shield, 
  Clock, 
  Users, 
  Zap,
  ArrowRight,
  Star,
  MapPin,
  Phone,
  Mail,
  Laptop,
  Cpu,
  HardDrive,
  Battery,
  Wifi,
  ChevronDown,
  Play,
  Award,
  MessageCircle,
  CreditCard
} from 'lucide-react'

function AnimatedCounter({ end, duration = 2000, suffix = '' }: { end: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [isVisible])

  useEffect(() => {
    if (!isVisible) return
    let startTime: number
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)
      setCount(Math.floor(progress * end))
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [isVisible, end, duration])

  return <span ref={ref}>{count}{suffix}</span>
}

function FloatingIcons() {
  const icons = [
    { Icon: Smartphone, delay: 0, x: '10%', y: '20%' },
    { Icon: Laptop, delay: 0.5, x: '80%', y: '15%' },
    { Icon: Cpu, delay: 1, x: '15%', y: '70%' },
    { Icon: HardDrive, delay: 1.5, x: '85%', y: '60%' },
    { Icon: Battery, delay: 2, x: '50%', y: '80%' },
    { Icon: Wifi, delay: 2.5, x: '70%', y: '30%' },
  ]

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {icons.map(({ Icon, delay, x, y }, index) => (
        <motion.div
          key={index}
          className="absolute text-primary/20 dark:text-primary/10"
          style={{ left: x, top: y }}
          animate={{ y: [0, -20, 0], rotate: [0, 10, -10, 0] }}
          transition={{ duration: 4, delay, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Icon className="h-12 w-12 md:h-16 md:w-16" />
        </motion.div>
      ))}
    </div>
  )
}

function TypewriterText({ texts, className }: { texts: string[]; className?: string }) {
  const [currentTextIndex, setCurrentTextIndex] = useState(0)
  const [displayText, setDisplayText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const currentFullText = texts[currentTextIndex]
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (displayText.length < currentFullText.length) {
          setDisplayText(currentFullText.slice(0, displayText.length + 1))
        } else {
          setTimeout(() => setIsDeleting(true), 2000)
        }
      } else {
        if (displayText.length > 0) {
          setDisplayText(displayText.slice(0, -1))
        } else {
          setIsDeleting(false)
          setCurrentTextIndex((prev) => (prev + 1) % texts.length)
        }
      }
    }, isDeleting ? 50 : 100)
    return () => clearTimeout(timeout)
  }, [displayText, isDeleting, currentTextIndex, texts])

  return (
    <span className={className}>
      {displayText}
      <span className="animate-pulse">|</span>
    </span>
  )
}

function GlassCard({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ scale: 1.02, y: -5 }}
      className={`backdrop-blur-lg bg-white/70 dark:bg-slate-800/70 border border-white/20 dark:border-slate-700/50 rounded-2xl shadow-xl ${className}`}
    >
      {children}
    </motion.div>
  )
}

export function LandingPage() {
  const { isAuthenticated } = useAuthStore()
  const { t, i18n } = useTranslation()
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 300])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  
  const isElectron = typeof window !== 'undefined' && window.electronAPI?.isElectron
  
  if (isElectron) {
    if (isAuthenticated) return <Navigate to="/app" replace />
    return <Navigate to="/login" replace />
  }

  const quirkyTaglines = {
    en: [
      "Your phone broke up with you? We'll fix that relationship!",
      "We speak fluent 'broken screen'",
      "Dropped your phone? We've seen worse. Much worse.",
      "Your laptop isn't slow, it's just... thinking very hard"
    ],
    hi: [
      "Phone ka breakup? Hum karenge patch-up!",
      "Screen crack? No panic, fantastic karenge!",
      "Battery down? Power up karenge!",
      "Laptop slow? Hum karenge fast!"
    ],
    bn: [
      "ফোন ভেঙে গেছে? চিন্তা নেই, আমরা আছি!",
      "স্ক্রিন ভাঙা? নতুন মুখ দেব!",
      "ব্যাটারি শেষ? নতুন জীবন দেব!",
      "অপেক্ষা করুন, জাদু হচ্ছে..."
    ]
  }

  const currentLang = i18n.language as keyof typeof quirkyTaglines
  const taglines = quirkyTaglines[currentLang] || quirkyTaglines.en

    const testimonials = [
      {
        name: 'Rahul Sharma',
        location: 'Barrackpore',
        text: i18n.language === 'hi' ? 'Bahut acchi service! Phone 2 ghante mein theek ho gaya.' : 
              i18n.language === 'bn' ? 'অসাধারণ সার্ভিস! ফোন ২ ঘণ্টায় ঠিক হয়ে গেল।' :
              'Amazing service! Phone fixed in 2 hours.',
        rating: 5,
        avatar: '/images/testimonial-avatar-1.png'
      },
      {
        name: 'Priya Das',
        location: 'Kolkata',
        text: i18n.language === 'hi' ? 'Laptop ki battery change karvayi, ekdum naya jaisa chal raha hai!' :
              i18n.language === 'bn' ? 'ল্যাপটপের ব্যাটারি বদলালাম, একদম নতুনের মতো চলছে!' :
              'Got laptop battery replaced, running like new!',
        rating: 5,
        avatar: '/images/testimonial-avatar-2.png'
      },
      {
        name: 'Amit Roy',
        location: 'Barrackpore',
        text: i18n.language === 'hi' ? 'Data recovery mein experts hain ye log. Sab kuch wapas mil gaya!' :
              i18n.language === 'bn' ? 'ডেটা রিকভারিতে এক্সপার্ট। সব কিছু ফিরে পেলাম!' :
              'Data recovery experts! Got everything back.',
        rating: 5,
        avatar: '/images/testimonial-avatar-3.png'
      }
    ]

    const services = [
      {
        icon: Monitor,
        title: t('landing.services.pcRepair.title'),
        description: i18n.language === 'hi' ? 'PC slow? Hum karenge fast!' : 
                     i18n.language === 'bn' ? 'পিসি স্লো? আমরা করব ফাস্ট!' :
                     "PC slow? We'll make it fast!",
        color: 'from-blue-500 to-cyan-500',
        image: '/images/pc-repair-card.png',
        features: [
          t('landing.services.pcRepair.feature1'),
          t('landing.services.pcRepair.feature2'),
          t('landing.services.pcRepair.feature3'),
          t('landing.services.pcRepair.feature4')
        ]
      },
      {
        icon: Smartphone,
        title: t('landing.services.mobileRepair.title'),
        description: i18n.language === 'hi' ? "Screen crack? No panic, we'll make it fantastic!" :
                     i18n.language === 'bn' ? 'স্ক্রিন ক্র্যাক? প্যানিক নয়, ফ্যান্টাস্টিক করব!' :
                     "Screen crack? No panic, we'll make it fantastic!",
        color: 'from-green-500 to-emerald-500',
        image: '/images/mobile-repair-card.png',
        features: [
          t('landing.services.mobileRepair.feature1'),
          t('landing.services.mobileRepair.feature2'),
          t('landing.services.mobileRepair.feature3'),
          t('landing.services.mobileRepair.feature4')
        ]
      },
      {
        icon: Globe,
        title: t('landing.services.digitalServices.title'),
        description: i18n.language === 'hi' ? 'Website chahiye? Hum banayenge!' :
                     i18n.language === 'bn' ? 'ওয়েবসাইট চাই? আমরা বানাব!' :
                     "Need a website? We'll build it!",
        color: 'from-purple-500 to-pink-500',
        image: '/images/digital-services-card.png',
        features: [
          t('landing.services.digitalServices.feature1'),
          t('landing.services.digitalServices.feature2'),
          t('landing.services.digitalServices.feature3'),
          t('landing.services.digitalServices.feature4')
        ]
      }
    ]

  const features = [
    {
      icon: Wrench,
      title: t('landing.features.expertTechnicians.title'),
      description: t('landing.features.expertTechnicians.description'),
      quirky: i18n.language === 'hi' ? 'Jugaad? No, we call it engineering!' :
              i18n.language === 'bn' ? 'জুগাড়? না, আমরা একে বলি ইঞ্জিনিয়ারিং!' :
              'Jugaad? No, we call it engineering!'
    },
    {
      icon: Clock,
      title: t('landing.features.quickTurnaround.title'),
      description: t('landing.features.quickTurnaround.description'),
      quirky: i18n.language === 'hi' ? 'Local train se fast, WiFi se zyada reliable!' :
              i18n.language === 'bn' ? 'লোকাল ট্রেনের চেয়ে দ্রুত, WiFi-এর চেয়ে বেশি ভরসা!' :
              'Faster than your local train, more reliable than your WiFi!'
    },
    {
      icon: Shield,
      title: t('landing.features.warranty.title'),
      description: t('landing.features.warranty.description'),
      quirky: i18n.language === 'hi' ? 'Guarantee ke saath, tension free!' :
              i18n.language === 'bn' ? 'গ্যারান্টি সহ, টেনশন ফ্রি!' :
              'With guarantee, tension free!'
    },
    {
      icon: Users,
      title: t('landing.features.customerSupport.title'),
      description: t('landing.features.customerSupport.description'),
      quirky: i18n.language === 'hi' ? 'Hum hain na, tension mat lo!' :
              i18n.language === 'bn' ? 'আমরা আছি, চিন্তা করবেন না!' :
              "We're here, don't worry!"
    }
  ]

  return (
    <PublicLayout>
            <section 
              ref={heroRef}
              className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
            >
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
                style={{ backgroundImage: 'url(/images/hero-background.png)' }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 animate-pulse" />
              <FloatingIcons />
        
        <motion.div 
          style={{ y: heroY, opacity: heroOpacity }}
          className="container mx-auto px-4 text-center relative z-10"
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 mb-8"
          >
            <MapPin className="h-4 w-4" />
            <span className="text-sm font-medium">
              {i18n.language === 'hi' ? 'Barrackpore mein 2024 se seva mein' :
               i18n.language === 'bn' ? 'ব্যারাকপুরে ২০২৪ থেকে সেবায়' :
               'Proudly Serving Barrackpore Since 2024'}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6"
          >
            <span className="block mb-2">{t('landing.hero.title')}</span>
            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              {t('landing.hero.subtitle')}
            </span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-white/80 mb-8 h-16"
          >
            <TypewriterText texts={taglines} className="font-medium" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/booking">
              <Button 
                size="lg" 
                className="gap-2 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white border-0 shadow-lg shadow-purple-500/25 px-8 py-6 text-lg"
              >
                {i18n.language === 'hi' ? 'Abhi Book Karein' :
                 i18n.language === 'bn' ? 'এখনই বুক করুন' :
                 'Book Now'} 
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/services">
              <Button 
                size="lg" 
                variant="outline"
                className="gap-2 bg-transparent border-white/30 text-white hover:bg-white/10 px-8 py-6 text-lg backdrop-blur-sm"
              >
                {t('landing.hero.viewServices')}
              </Button>
            </Link>
          </motion.div>

          {/* Watch Demo Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mt-8"
          >
            <button 
              onClick={() => window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '_blank')}
              className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all group"
            >
              <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Play className="h-5 w-5 fill-white" />
              </div>
              <span className="font-medium">
                {i18n.language === 'hi' ? 'Demo Dekhein' :
                 i18n.language === 'bn' ? 'ডেমো দেখুন' :
                 'Watch Demo'}
              </span>
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-12 flex items-center justify-center gap-6 text-white/60"
          >
            <span className="text-sm">Payment Methods:</span>
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 rounded-full bg-white/10 text-sm">UPI</span>
              <span className="px-3 py-1 rounded-full bg-white/10 text-sm">GPay</span>
              <span className="px-3 py-1 rounded-full bg-white/10 text-sm">Cash</span>
              <span className="px-3 py-1 rounded-full bg-white/10 text-sm">Card</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Dashboard Mockup */}
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="hidden lg:block absolute right-8 top-1/2 -translate-y-1/2 w-[500px]"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-2xl blur-3xl" />
            <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-4 shadow-2xl">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-yellow-400" />
                <div className="h-3 w-3 rounded-full bg-green-400" />
                <span className="ml-2 text-white/60 text-sm">ByteCare Dashboard</span>
              </div>
              <img 
                src="/images/dashboard-welcome.png" 
                alt="ByteCare Dashboard" 
                className="w-full rounded-lg opacity-90"
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-white/50"
          >
            <ChevronDown className="h-8 w-8" />
          </motion.div>
        </motion.div>
      </section>

      {/* Trust Signals Section */}
      <section className="py-12 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">
              {i18n.language === 'hi' ? 'Bharosa Karo' :
               i18n.language === 'bn' ? 'বিশ্বাস করুন' :
               'Trusted By'}
            </p>
            <h3 className="text-2xl font-bold dark:text-white">
              {i18n.language === 'hi' ? '500+ Khush Customers' :
               i18n.language === 'bn' ? '৫০০+ সন্তুষ্ট গ্রাহক' :
               '500+ Happy Customers'}
            </h3>
          </motion.div>

          {/* Review Badges */}
          <div className="flex flex-wrap justify-center items-center gap-8 mb-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg"
            >
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="font-semibold dark:text-white">4.9/5</span>
              <span className="text-sm text-muted-foreground">Google Reviews</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg"
            >
              <Award className="h-5 w-5 text-primary" />
              <span className="font-semibold dark:text-white">
                {i18n.language === 'hi' ? 'Certified Technicians' :
                 i18n.language === 'bn' ? 'সার্টিফাইড টেকনিশিয়ান' :
                 'Certified Technicians'}
              </span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg"
            >
              <Shield className="h-5 w-5 text-green-500" />
              <span className="font-semibold dark:text-white">
                {i18n.language === 'hi' ? '90 Din Warranty' :
                 i18n.language === 'bn' ? '৯০ দিন ওয়ারেন্টি' :
                 '90-Day Warranty'}
              </span>
            </motion.div>
          </div>

          {/* Integration Logos */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex flex-wrap justify-center items-center gap-8 opacity-60"
          >
            <span className="text-sm text-muted-foreground">
              {i18n.language === 'hi' ? 'Powered by:' :
               i18n.language === 'bn' ? 'পাওয়ার্ড বাই:' :
               'Powered by:'}
            </span>
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              <span className="font-medium">Google Pay</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              <span className="font-medium">Airtable</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              <span className="font-medium">Omnisend</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              <span className="font-medium">WhatsApp</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 dark:text-white">
              {t('landing.services.title')}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('landing.services.subtitle')}
            </p>
          </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                      {services.map((service, index) => (
                        <GlassCard key={index} delay={index * 0.2} className="p-8 group overflow-hidden">
                          <div className="relative mb-6">
                            <img 
                              src={service.image} 
                              alt={service.title} 
                              className="w-full h-48 object-contain rounded-xl group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <h3 className="text-2xl font-bold mb-2 dark:text-white">{service.title}</h3>
                          <p className="text-primary font-medium mb-4 italic">"{service.description}"</p>
                          <ul className="space-y-2">
                            {service.features.map((feature, i) => (
                              <li key={i} className="flex items-center gap-2 text-muted-foreground">
                                <Zap className="h-4 w-4 text-primary" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </GlassCard>
                      ))}
                    </div>
        </div>
      </section>

      {/* Stats Section with Counter Animation */}
      <section className="py-20 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="p-6"
            >
              <p className="text-5xl md:text-6xl font-bold mb-2">
                <AnimatedCounter end={500} suffix="+" />
              </p>
              <p className="text-white/80">{t('landing.stats.devicesRepaired')}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="p-6"
            >
              <p className="text-5xl md:text-6xl font-bold mb-2">
                <AnimatedCounter end={200} suffix="+" />
              </p>
              <p className="text-white/80">{t('landing.stats.happyCustomers')}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="p-6"
            >
              <p className="text-5xl md:text-6xl font-bold mb-2">
                <AnimatedCounter end={50} suffix="+" />
              </p>
              <p className="text-white/80">{t('landing.stats.digitalProjects')}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="p-6"
            >
              <p className="text-5xl md:text-6xl font-bold mb-2">
                <AnimatedCounter end={98} suffix="%" />
              </p>
              <p className="text-white/80">{t('landing.stats.satisfactionRate')}</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 dark:text-white">
              {t('landing.features.title')}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('landing.features.subtitle')}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="text-center p-6"
              >
                <motion.div 
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="h-20 w-20 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center mx-auto mb-6"
                >
                  <feature.icon className="h-10 w-10 text-primary" />
                </motion.div>
                <h3 className="text-xl font-bold mb-2 dark:text-white">{feature.title}</h3>
                <p className="text-muted-foreground mb-3">{feature.description}</p>
                <p className="text-sm text-primary italic">"{feature.quirky}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gradient-to-b from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 dark:text-white">
              {i18n.language === 'hi' ? 'Customers Ki Raay' :
               i18n.language === 'bn' ? 'গ্রাহকদের মতামত' :
               'What Our Customers Say'}
            </h2>
            <p className="text-xl text-muted-foreground">
              {i18n.language === 'hi' ? 'Real log, real reviews (humne check kiya)' :
               i18n.language === 'bn' ? 'আসল মানুষ, আসল রিভিউ (আমরা চেক করেছি)' :
               'Real people, real reviews (we checked)'}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <GlassCard key={index} delay={index * 0.2} className="p-8">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-lg mb-6 dark:text-white">"{testimonial.text}"</p>
                                <div className="flex items-center gap-3">
                                  <img 
                                    src={testimonial.avatar} 
                                    alt={testimonial.name}
                                    className="h-12 w-12 rounded-full object-cover"
                                  />
                                  <div>
                                    <p className="font-semibold dark:text-white">{testimonial.name}</p>
                                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                                      <MapPin className="h-3 w-3" /> {testimonial.location}
                                    </p>
                                  </div>
                                </div>
              </GlassCard>
            ))}
                </div>
              </div>
            </section>

            {/* WhatsApp Reviews Section */}
            <section className="py-24 bg-white dark:bg-slate-900">
              <div className="container mx-auto px-4">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-center mb-16"
                >
                  <h2 className="text-4xl md:text-5xl font-bold mb-4 dark:text-white">
                    {i18n.language === 'hi' ? 'Real Reviews, Real Customers' :
                     i18n.language === 'bn' ? 'আসল রিভিউ, আসল গ্রাহক' :
                     'Real Reviews, Real Customers'}
                  </h2>
                  <p className="text-xl text-muted-foreground">
                    {i18n.language === 'hi' ? 'WhatsApp pe jo bola, wahi dikha rahe hain!' :
                     i18n.language === 'bn' ? 'WhatsApp-এ যা বলেছে, তাই দেখাচ্ছি!' :
                     'Straight from WhatsApp - no filters!'}
                  </p>
                </motion.div>

                                                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                                                                  {[
                                                                    '/images/review-whatsapp-1.png',
                                                                    '/images/review-whatsapp-3.png',
                                                                    '/images/review-whatsapp-4.png',
                                                                    '/images/review-whatsapp-5.png',
                                                                    '/images/review-whatsapp-7.png',
                                                                    '/images/review-google.png',
                                                                  ].map((image, index) => (
                                                                    <motion.div
                                                                      key={index}
                                                                      initial={{ opacity: 0, y: 30 }}
                                                                      whileInView={{ opacity: 1, y: 0 }}
                                                                      viewport={{ once: true }}
                                                                      transition={{ delay: index * 0.1 }}
                                                                      whileHover={{ scale: 1.05, y: -8 }}
                                                                      className="rounded-xl overflow-hidden bg-white dark:bg-slate-800"
                                                                      style={{ 
                                                                        boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.3), 0 8px 16px -4px rgba(0, 0, 0, 0.2), 0 0 0 4px white',
                                                                        border: '4px solid white',
                                                                      }}
                                                                    >
                                                                      <img 
                                                                        src={image} 
                                                                        alt={`Customer Review ${index + 1}`}
                                                                        className="w-full h-auto"
                                                                      />
                                                                    </motion.div>
                                                                  ))}
                                                                </div>
              </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
              <FloatingIcons />
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {i18n.language === 'hi' ? 'Aapka phone ro raha hai, bachao use!' :
               i18n.language === 'bn' ? 'আপনার ফোন কাঁদছে, তাকে বাঁচান!' :
               'Your phone is crying for help. Answer its call!'}
            </h2>
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              {i18n.language === 'hi' ? "Don't ghost your broken phone, bring it to us!" :
               i18n.language === 'bn' ? 'আপনার ভাঙা ফোনকে ঘোস্ট করবেন না, আমাদের কাছে আনুন!' :
               "Don't ghost your broken phone, bring it to us!"}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/booking">
                <Button 
                  size="lg" 
                  className="gap-2 bg-white text-slate-900 hover:bg-white/90 px-8 py-6 text-lg"
                >
                  {i18n.language === 'hi' ? 'Abhi Book Karein' :
                   i18n.language === 'bn' ? 'এখনই বুক করুন' :
                   'Book Now'}
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="gap-2 bg-transparent border-white/30 text-white hover:bg-white/10 px-8 py-6 text-lg"
                >
                  <Phone className="h-5 w-5" />
                  {t('nav.contact')}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Section */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <GlassCard className="p-8 text-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2 dark:text-white">{t('landing.contact.location')}</h3>
              <p className="text-muted-foreground">Barrackpore, West Bengal</p>
            </GlassCard>
            <GlassCard delay={0.1} className="p-8 text-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2 dark:text-white">{t('landing.contact.email')}</h3>
              <p className="text-muted-foreground">harryroger798@gmail.com</p>
            </GlassCard>
            <GlassCard delay={0.2} className="p-8 text-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2 dark:text-white">{t('landing.contact.businessHours')}</h3>
              <p className="text-muted-foreground">
                {t('landing.contact.weekdays')}: 10:00 AM - 8:00 PM
              </p>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* Footer tagline */}
      <div className="py-8 bg-slate-900 text-center">
        <p className="text-white/60 text-sm">
          {i18n.language === 'hi' ? 'Barrackpore mein chai aur pyaar se banaya' :
           i18n.language === 'bn' ? 'ব্যারাকপুরে চা আর ভালোবাসা দিয়ে তৈরি' :
           'Made with love and lots of chai in Barrackpore'}
        </p>
      </div>
    </PublicLayout>
  )
}
