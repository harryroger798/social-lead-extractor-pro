import { useParams, Link, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { motion } from 'framer-motion'
import { 
  Smartphone, Laptop, Tablet, Monitor, Headphones, Watch, Cpu, HardDrive, 
  ArrowRight, Check, Clock, Shield, Wrench, Phone, MessageCircle,
  ChevronRight, Zap, Award
} from 'lucide-react'
import { GradientOrbs, FloatingTechIcons, DotGridPattern, FloatingParticles, CircuitPattern } from '@/components/ui/visual-enhancements'

interface ServiceData {
  key: string
  slug: string
  icon: typeof Smartphone
  color: string
  image: string
  features: string[]
  pricing: { name: string; price: string }[]
  faqs: { question: string; answer: string }[]
}

const servicesData: ServiceData[] = [
  {
    key: 'smartphone',
    slug: 'mobile',
    icon: Smartphone,
    color: 'from-green-500 to-emerald-500',
    image: '/images/screen-replacement.png',
    features: [
      'Screen replacement (original & compatible)',
      'Battery replacement',
      'Charging port repair',
      'Speaker & microphone repair',
      'Camera repair',
      'Software troubleshooting',
      'Water damage repair',
      'Back glass replacement'
    ],
    pricing: [
      { name: 'Screen Replacement', price: '₹1,500 - ₹8,000' },
      { name: 'Battery Replacement', price: '₹800 - ₹2,500' },
      { name: 'Charging Port', price: '₹500 - ₹1,500' },
      { name: 'Software Fix', price: '₹300 - ₹800' }
    ],
    faqs: [
      { question: 'How long does screen replacement take?', answer: 'Most screen replacements are completed within 1-2 hours.' },
      { question: 'Do you use original parts?', answer: 'We offer both original and high-quality compatible parts. You can choose based on your budget.' },
      { question: 'Is there a warranty?', answer: 'Yes, all repairs come with a 90-day warranty.' }
    ]
  },
  {
    key: 'laptop',
    slug: 'laptop',
    icon: Laptop,
    color: 'from-blue-500 to-cyan-500',
    image: '/images/laptop-repair.png',
    features: [
      'Screen replacement',
      'Keyboard replacement',
      'Battery replacement',
      'Motherboard repair',
      'RAM & SSD upgrades',
      'Hinge repair',
      'Virus removal',
      'OS installation'
    ],
    pricing: [
      { name: 'Screen Replacement', price: '₹3,000 - ₹15,000' },
      { name: 'Keyboard Replacement', price: '₹1,500 - ₹4,000' },
      { name: 'SSD Upgrade', price: '₹2,500 - ₹8,000' },
      { name: 'OS Installation', price: '₹500 - ₹1,500' }
    ],
    faqs: [
      { question: 'Can you repair all laptop brands?', answer: 'Yes, we repair all major brands including Dell, HP, Lenovo, Asus, Acer, Apple MacBook, and more.' },
      { question: 'How long does motherboard repair take?', answer: 'Motherboard repairs typically take 2-5 days depending on the issue.' },
      { question: 'Do you provide pickup service?', answer: 'Yes, we offer free pickup and delivery for laptop repairs within Barrackpore.' }
    ]
  },
  {
    key: 'tablet',
    slug: 'tablet',
    icon: Tablet,
    color: 'from-purple-500 to-pink-500',
    image: '/images/screen-replacement.png',
    features: [
      'Screen replacement',
      'Battery replacement',
      'Charging port repair',
      'Button repair',
      'Software troubleshooting',
      'Water damage repair',
      'Speaker repair',
      'Camera repair'
    ],
    pricing: [
      { name: 'Screen Replacement', price: '₹2,000 - ₹12,000' },
      { name: 'Battery Replacement', price: '₹1,500 - ₹4,000' },
      { name: 'Charging Port', price: '₹800 - ₹2,000' },
      { name: 'Software Fix', price: '₹500 - ₹1,000' }
    ],
    faqs: [
      { question: 'Do you repair iPads?', answer: 'Yes, we repair all iPad models including iPad Pro, iPad Air, and iPad Mini.' },
      { question: 'Can you fix a cracked screen?', answer: 'Absolutely! Screen replacement is one of our most common tablet repairs.' },
      { question: 'How long does tablet repair take?', answer: 'Most tablet repairs are completed within 1-3 days.' }
    ]
  },
  {
    key: 'desktop',
    slug: 'pc',
    icon: Monitor,
    color: 'from-orange-500 to-red-500',
    image: '/images/hardware-upgrade.png',
    features: [
      'Hardware diagnostics',
      'Component replacement',
      'RAM & storage upgrades',
      'Graphics card installation',
      'Power supply replacement',
      'Virus removal',
      'OS installation',
      'Custom PC building'
    ],
    pricing: [
      { name: 'Hardware Diagnostics', price: '₹300 - ₹500' },
      { name: 'RAM Upgrade', price: '₹1,500 - ₹6,000' },
      { name: 'SSD Installation', price: '₹2,500 - ₹10,000' },
      { name: 'Full Service', price: '₹800 - ₹1,500' }
    ],
    faqs: [
      { question: 'Can you build a custom PC?', answer: 'Yes! We can build custom PCs for gaming, work, or any specific requirements.' },
      { question: 'Do you offer on-site service?', answer: 'Yes, we provide on-site service for desktop repairs within Barrackpore.' },
      { question: 'How often should I service my PC?', answer: 'We recommend a full service every 6-12 months for optimal performance.' }
    ]
  },
  {
    key: 'audio',
    slug: 'audio',
    icon: Headphones,
    color: 'from-indigo-500 to-purple-500',
    image: '/images/software-installation.png',
    features: [
      'Headphone repair',
      'Speaker repair',
      'Bluetooth connectivity issues',
      'Driver replacement',
      'Cable repair',
      'Amplifier repair',
      'Microphone repair',
      'Sound system setup'
    ],
    pricing: [
      { name: 'Headphone Repair', price: '₹300 - ₹1,500' },
      { name: 'Speaker Repair', price: '₹500 - ₹3,000' },
      { name: 'Cable Replacement', price: '₹200 - ₹800' },
      { name: 'Driver Replacement', price: '₹400 - ₹1,200' }
    ],
    faqs: [
      { question: 'Can you repair wireless earbuds?', answer: 'Yes, we repair most wireless earbuds including AirPods, Galaxy Buds, and others.' },
      { question: 'Do you repair vintage audio equipment?', answer: 'Yes, we have experience with vintage audio equipment repairs.' },
      { question: 'How long does headphone repair take?', answer: 'Most headphone repairs are completed within 1-2 days.' }
    ]
  },
  {
    key: 'smartwatch',
    slug: 'smartwatch',
    icon: Watch,
    color: 'from-teal-500 to-cyan-500',
    image: '/images/screen-replacement.png',
    features: [
      'Screen replacement',
      'Battery replacement',
      'Strap replacement',
      'Button repair',
      'Water damage repair',
      'Software troubleshooting',
      'Sensor calibration',
      'Charging issues'
    ],
    pricing: [
      { name: 'Screen Replacement', price: '₹1,500 - ₹6,000' },
      { name: 'Battery Replacement', price: '₹800 - ₹2,500' },
      { name: 'Strap Replacement', price: '₹300 - ₹2,000' },
      { name: 'Software Fix', price: '₹300 - ₹800' }
    ],
    faqs: [
      { question: 'Do you repair Apple Watch?', answer: 'Yes, we repair all Apple Watch models including Series 1 through the latest.' },
      { question: 'Can you fix water damage?', answer: 'Yes, we specialize in water damage repair for smartwatches.' },
      { question: 'How long does battery replacement take?', answer: 'Smartwatch battery replacement typically takes 1-2 hours.' }
    ]
  },
  {
    key: 'gaming',
    slug: 'gaming',
    icon: Cpu,
    color: 'from-red-500 to-pink-500',
    image: '/images/hardware-upgrade.png',
    features: [
      'Console repair (PS5, Xbox, Switch)',
      'Controller repair',
      'HDMI port repair',
      'Disc drive repair',
      'Overheating issues',
      'Power supply repair',
      'Software troubleshooting',
      'Gaming PC optimization'
    ],
    pricing: [
      { name: 'Controller Repair', price: '₹500 - ₹1,500' },
      { name: 'HDMI Port Repair', price: '₹1,500 - ₹3,500' },
      { name: 'Disc Drive Repair', price: '₹1,000 - ₹3,000' },
      { name: 'Thermal Paste Replacement', price: '₹500 - ₹1,000' }
    ],
    faqs: [
      { question: 'Which gaming consoles do you repair?', answer: 'We repair PlayStation (PS4, PS5), Xbox (One, Series X/S), Nintendo Switch, and more.' },
      { question: 'Can you fix drift on controllers?', answer: 'Yes, joystick drift repair is one of our common controller fixes.' },
      { question: 'Do you repair gaming PCs?', answer: 'Absolutely! We repair and upgrade gaming PCs of all configurations.' }
    ]
  },
  {
    key: 'dataRecovery',
    slug: 'data-recovery',
    icon: HardDrive,
    color: 'from-amber-500 to-orange-500',
    image: '/images/data-recovery.png',
    features: [
      'Hard drive data recovery',
      'SSD data recovery',
      'USB drive recovery',
      'Memory card recovery',
      'RAID recovery',
      'Deleted file recovery',
      'Formatted drive recovery',
      'Water damaged device recovery'
    ],
    pricing: [
      { name: 'Basic Recovery', price: '₹1,500 - ₹3,000' },
      { name: 'Advanced Recovery', price: '₹3,000 - ₹8,000' },
      { name: 'Critical Recovery', price: '₹8,000 - ₹20,000' },
      { name: 'RAID Recovery', price: '₹10,000+' }
    ],
    faqs: [
      { question: 'Can you recover data from a dead hard drive?', answer: 'In most cases, yes. We have specialized tools for recovering data from failed drives.' },
      { question: 'Is my data safe with you?', answer: 'Absolutely. We maintain strict confidentiality and never access your personal files.' },
      { question: 'What if recovery is not possible?', answer: 'If we cannot recover your data, you do not pay for the recovery service.' }
    ]
  }
]

const slugToServiceMap: Record<string, string> = {
  'mobile': 'smartphone',
  'smartphone': 'smartphone',
  'laptop': 'laptop',
  'tablet': 'tablet',
  'pc': 'desktop',
  'desktop': 'desktop',
  'computer': 'desktop',
  'audio': 'audio',
  'headphones': 'audio',
  'speakers': 'audio',
  'smartwatch': 'smartwatch',
  'watch': 'smartwatch',
  'gaming': 'gaming',
  'console': 'gaming',
  'playstation': 'gaming',
  'xbox': 'gaming',
  'data-recovery': 'dataRecovery',
  'datarecovery': 'dataRecovery',
  'data': 'dataRecovery'
}

export function ServiceDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { t, i18n } = useTranslation()

  const serviceKey = slug ? slugToServiceMap[slug.toLowerCase()] : null
  const service = servicesData.find(s => s.key === serviceKey)

  if (!service) {
    return <Navigate to="/services" replace />
  }

  const IconComponent = service.icon

  const quirkyDescriptions: Record<string, Record<string, string>> = {
    smartphone: {
      en: "Screen cracked? We'll make it look brand new!",
      hi: "Screen toot gayi? Hum naya jaisa kar denge!",
      bn: "স্ক্রিন ভেঙে গেছে? নতুনের মতো করে দেব!"
    },
    laptop: {
      en: "Laptop acting slow? We'll give it wings!",
      hi: "Laptop slow hai? Hum usse rocket bana denge!",
      bn: "ল্যাপটপ স্লো? রকেট বানিয়ে দেব!"
    },
    tablet: {
      en: "Tablet troubles? Consider them gone!",
      hi: "Tablet mein problem? Gayab kar denge!",
      bn: "ট্যাবলেট সমস্যা? গায়েব করে দেব!"
    },
    desktop: {
      en: "Desktop down? We'll bring it back to life!",
      hi: "Desktop band? Hum zinda kar denge!",
      bn: "ডেস্কটপ বন্ধ? জীবন দিয়ে দেব!"
    },
    audio: {
      en: "No sound? We'll make it sing again!",
      hi: "Awaaz nahi? Phir se gaana bajayenge!",
      bn: "আওয়াজ নেই? আবার গান বাজাব!"
    },
    smartwatch: {
      en: "Watch stopped? Time to fix it!",
      hi: "Watch ruk gayi? Time to fix it!",
      bn: "ঘড়ি থেমে গেছে? ঠিক করার সময়!"
    },
    gaming: {
      en: "Gaming rig issues? Level up with us!",
      hi: "Gaming PC mein dikkat? Level up karo!",
      bn: "গেমিং পিসি সমস্যা? লেভেল আপ করুন!"
    },
    dataRecovery: {
      en: "Lost data? We're digital detectives!",
      hi: "Data kho gaya? Hum digital detective hain!",
      bn: "ডেটা হারিয়ে গেছে? আমরা ডিজিটাল গোয়েন্দা!"
    }
  }

  const getQuirkyDesc = (key: string) => {
    const lang = i18n.language as 'en' | 'hi' | 'bn'
    return quirkyDescriptions[key]?.[lang] || quirkyDescriptions[key]?.en || ''
  }

  const relatedServices = servicesData.filter(s => s.key !== service.key).slice(0, 3)

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 animate-pulse" />
        <FloatingParticles count={30} color="white" />
        <FloatingTechIcons variant="light" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="flex-1 text-center lg:text-left"
            >
              <div className="flex items-center gap-2 text-white/60 mb-4 justify-center lg:justify-start">
                <Link to="/" className="hover:text-white transition-colors">Home</Link>
                <ChevronRight className="h-4 w-4" />
                <Link to="/services" className="hover:text-white transition-colors">Services</Link>
                <ChevronRight className="h-4 w-4" />
                <span className="text-white">{t(`public.services.${service.key}.title`)}</span>
              </div>
              <div className={`inline-flex h-20 w-20 rounded-2xl bg-gradient-to-br ${service.color} items-center justify-center mb-6`}>
                <IconComponent className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                {t(`public.services.${service.key}.title`)}
              </h1>
              <p className="text-xl text-primary font-medium italic mb-4">
                "{getQuirkyDesc(service.key)}"
              </p>
              <p className="text-lg text-white/80 mb-8 max-w-xl">
                {t(`public.services.${service.key}.description`)}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/booking">
                  <Button size="lg" className={`gap-2 bg-gradient-to-r ${service.color} hover:opacity-90 text-white border-0 shadow-lg px-8`}>
                    {t('public.services.bookNow')}
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                                <a href="tel:+917003888936">
                                  <Button size="lg" className="gap-2 bg-white text-slate-800 hover:bg-slate-100 border-0 shadow-lg">
                                    <Phone className="h-5 w-5" />
                                    Call Now
                                  </Button>
                                </a>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex-1"
            >
              <img 
                src={service.image} 
                alt={t(`public.services.${service.key}.title`)}
                className="w-full max-w-md mx-auto rounded-2xl shadow-2xl"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 overflow-hidden">
        <GradientOrbs variant="subtle" />
        <DotGridPattern opacity="light" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 dark:text-white">
              {i18n.language === 'hi' ? 'Hum Kya Karte Hain' :
               i18n.language === 'bn' ? 'আমরা কী করি' :
               'What We Fix'}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {i18n.language === 'hi' ? 'Hamari expert team aapke device ki har problem solve kar sakti hai' :
               i18n.language === 'bn' ? 'আমাদের বিশেষজ্ঞ দল আপনার ডিভাইসের সব সমস্যা সমাধান করতে পারে' :
               'Our expert team can solve any problem with your device'}
            </p>
          </motion.div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {service.features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-slate-800 shadow-md border border-slate-100 dark:border-slate-700"
              >
                <div className={`h-8 w-8 rounded-full bg-gradient-to-br ${service.color} flex items-center justify-center flex-shrink-0`}>
                  <Check className="h-4 w-4 text-white" />
                </div>
                <span className="text-slate-700 dark:text-slate-200 font-medium">{feature}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="relative py-20 bg-white dark:bg-slate-900 overflow-hidden">
        <CircuitPattern variant="default" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 dark:text-white">
              {i18n.language === 'hi' ? 'Pricing Guide' :
               i18n.language === 'bn' ? 'মূল্য নির্দেশিকা' :
               'Pricing Guide'}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {i18n.language === 'hi' ? 'Transparent pricing, koi hidden charges nahi' :
               i18n.language === 'bn' ? 'স্বচ্ছ মূল্য, কোনো লুকানো চার্জ নেই' :
               'Transparent pricing with no hidden charges'}
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
            {service.pricing.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-700 shadow-lg border border-slate-100 dark:border-slate-600 text-center"
              >
                <h3 className="text-lg font-semibold mb-2 dark:text-white">{item.name}</h3>
                <p className={`text-2xl font-bold bg-gradient-to-r ${service.color} bg-clip-text text-transparent`}>
                  {item.price}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center text-muted-foreground mt-8"
          >
            * {i18n.language === 'hi' ? 'Final price device aur problem ke hisaab se vary kar sakti hai' :
               i18n.language === 'bn' ? 'চূড়ান্ত মূল্য ডিভাইস এবং সমস্যার উপর নির্ভর করে পরিবর্তিত হতে পারে' :
               'Final price may vary based on device model and specific issue'}
          </motion.p>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="relative py-20 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 overflow-hidden">
        <FloatingParticles count={40} color="white" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t('public.services.whyChooseUs')}
            </h2>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-4">
            {[
              { icon: Wrench, title: 'Expert Technicians', desc: 'Certified professionals with years of experience' },
              { icon: Shield, title: '90-Day Warranty', desc: 'All repairs come with warranty coverage' },
              { icon: Clock, title: 'Fast Service', desc: 'Most repairs completed same day' },
              { icon: Award, title: 'Quality Parts', desc: 'We use only genuine or high-quality parts' }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-white/80">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="relative py-20 bg-slate-50 dark:bg-slate-900 overflow-hidden">
        <GradientOrbs variant="subtle" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 dark:text-white">
              {i18n.language === 'hi' ? 'Aksar Poochhe Jaane Wale Sawal' :
               i18n.language === 'bn' ? 'প্রায়শই জিজ্ঞাসিত প্রশ্ন' :
               'Frequently Asked Questions'}
            </h2>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-4">
            {service.faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="p-6 rounded-2xl bg-white dark:bg-slate-800 shadow-md border border-slate-100 dark:border-slate-700"
              >
                <h3 className="text-lg font-semibold mb-2 dark:text-white">{faq.question}</h3>
                <p className="text-muted-foreground">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Related Services */}
      <section className="relative py-20 bg-white dark:bg-slate-800 overflow-hidden">
        <DotGridPattern opacity="light" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 dark:text-white">
              {i18n.language === 'hi' ? 'Aur Services Dekhein' :
               i18n.language === 'bn' ? 'আরও সেবা দেখুন' :
               'Explore More Services'}
            </h2>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3">
            {relatedServices.map((relatedService, index) => {
              const RelatedIcon = relatedService.icon
              return (
                <motion.div
                  key={relatedService.key}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-700 shadow-md border border-slate-100 dark:border-slate-600"
                >
                  <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${relatedService.color} flex items-center justify-center mb-4`}>
                    <RelatedIcon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 dark:text-white">
                    {t(`public.services.${relatedService.key}.title`)}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {t(`public.services.${relatedService.key}.description`)}
                  </p>
                  <Link to={`/services/${relatedService.slug}`}>
                    <Button variant="outline" className="gap-2">
                      Learn More
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
        <FloatingParticles count={30} color="white" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <Zap className="h-16 w-16 text-primary mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {i18n.language === 'hi' ? 'Abhi Apna Device Theek Karwayein!' :
               i18n.language === 'bn' ? 'এখনই আপনার ডিভাইস ঠিক করান!' :
               'Get Your Device Fixed Today!'}
            </h2>
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              {i18n.language === 'hi' ? 'Free diagnosis ke saath. Koi hidden charges nahi!' :
               i18n.language === 'bn' ? 'বিনামূল্যে ডায়াগনোসিস সহ। কোনো লুকানো চার্জ নেই!' :
               'Free diagnosis included. No hidden charges!'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/booking">
                <Button size="lg" className={`gap-2 bg-gradient-to-r ${service.color} hover:opacity-90 text-white border-0 shadow-lg px-8 py-6 text-lg`}>
                  {t('public.services.bookNow')}
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
                            <a href="https://wa.me/917003888936?text=Hello! I need help with my device.">
                              <Button size="lg" className="gap-2 bg-white text-slate-800 hover:bg-slate-100 border-0 shadow-lg px-8 py-6 text-lg">
                                <MessageCircle className="h-5 w-5" />
                                WhatsApp Us
                              </Button>
                            </a>
            </div>
          </motion.div>
        </div>
      </section>
    </PublicLayout>
  )
}
