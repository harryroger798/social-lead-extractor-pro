import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { motion } from 'framer-motion'
import { Smartphone, Laptop, Tablet, Monitor, Headphones, Watch, Cpu, HardDrive, Wrench, Shield, Clock, ArrowRight, Zap } from 'lucide-react'

const services = [
  { icon: Smartphone, key: 'smartphone', price: '₹500 - ₹5,000', color: 'from-green-500 to-emerald-500' },
  { icon: Laptop, key: 'laptop', price: '₹1,000 - ₹15,000', color: 'from-blue-500 to-cyan-500' },
  { icon: Tablet, key: 'tablet', price: '₹800 - ₹8,000', color: 'from-purple-500 to-pink-500' },
  { icon: Monitor, key: 'desktop', price: '₹1,500 - ₹20,000', color: 'from-orange-500 to-red-500' },
  { icon: Headphones, key: 'audio', price: '₹300 - ₹3,000', color: 'from-indigo-500 to-purple-500' },
  { icon: Watch, key: 'smartwatch', price: '₹500 - ₹5,000', color: 'from-teal-500 to-cyan-500' },
  { icon: Cpu, key: 'gaming', price: '₹2,000 - ₹25,000', color: 'from-red-500 to-pink-500' },
  { icon: HardDrive, key: 'dataRecovery', price: '₹1,000 - ₹10,000', color: 'from-amber-500 to-orange-500' },
]

const whyChooseUs = [
  { icon: Wrench, key: 'expertTechnicians', color: 'from-blue-500 to-cyan-500' },
  { icon: Shield, key: 'warranty', color: 'from-green-500 to-emerald-500' },
  { icon: Clock, key: 'fastService', color: 'from-purple-500 to-pink-500' },
]

export function PublicServicesPage() {
  const { t, i18n } = useTranslation()

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
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              {t('public.services.title')}
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto mb-4">
              {t('public.services.subtitle')}
            </p>
            <p className="text-lg text-primary font-medium italic">
              {i18n.language === 'hi' ? '"Kuch bhi toot jaye, hum theek kar denge!"' :
               i18n.language === 'bn' ? '"যা কিছু ভাঙে, আমরা ঠিক করে দেব!"' :
               '"If it\'s broken, we\'ll fix it!"'}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {services.map((service, index) => (
              <motion.div
                key={service.key}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="backdrop-blur-lg bg-white/70 dark:bg-slate-800/70 border border-white/20 dark:border-slate-700/50 rounded-2xl shadow-xl overflow-hidden group"
              >
                <div className={`h-2 bg-gradient-to-r ${service.color}`} />
                <div className="p-6 text-center">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <service.icon className="h-8 w-8 text-white" />
                  </motion.div>
                  <h3 className="text-xl font-bold mb-2 dark:text-white">
                    {t(`public.services.${service.key}.title`)}
                  </h3>
                  <p className="text-sm text-primary font-medium italic mb-3">
                    "{getQuirkyDesc(service.key)}"
                  </p>
                  <p className="text-muted-foreground text-sm mb-4">
                    {t(`public.services.${service.key}.description`)}
                  </p>
                  <div className="mb-4">
                    <p className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                      {service.price}
                    </p>
                    <p className="text-xs text-muted-foreground">{t('public.services.priceRange')}</p>
                  </div>
                  <Link to="/booking">
                    <Button className={`w-full gap-2 bg-gradient-to-r ${service.color} hover:opacity-90 text-white border-0`}>
                      {t('public.services.bookNow')}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t('public.services.whyChooseUs')}
            </h2>
            <p className="text-xl text-white/80">
              {i18n.language === 'hi' ? 'Kyunki hum best hain, baki sab test hain!' :
               i18n.language === 'bn' ? 'কারণ আমরা সেরা, বাকিরা পরীক্ষা!' :
               'Because we\'re the best, forget the rest!'}
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3">
            {whyChooseUs.map((item, index) => (
              <motion.div
                key={item.key}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                whileHover={{ y: -5 }}
                className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-8 text-center"
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className={`h-16 w-16 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center mx-auto mb-4`}
                >
                  <item.icon className="h-8 w-8 text-white" />
                </motion.div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {t(`public.services.${item.key}`)}
                </h3>
                <p className="text-white/80">
                  {t(`public.services.${item.key}Desc`)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <Zap className="h-16 w-16 text-primary mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4 dark:text-white">
              {i18n.language === 'hi' ? 'Abhi Book Karein!' :
               i18n.language === 'bn' ? 'এখনই বুক করুন!' :
               'Book Your Repair Now!'}
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              {i18n.language === 'hi' ? 'Jaldi karo, phone ro raha hai!' :
               i18n.language === 'bn' ? 'তাড়াতাড়ি করুন, ফোন কাঁদছে!' :
               'Hurry up, your phone is crying!'}
            </p>
            <Link to="/booking">
              <Button size="lg" className="gap-2 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white border-0 shadow-lg shadow-purple-500/25 px-8 py-6 text-lg">
                {i18n.language === 'hi' ? 'Abhi Book Karein' :
                 i18n.language === 'bn' ? 'এখনই বুক করুন' :
                 'Book Now'}
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </PublicLayout>
  )
}
