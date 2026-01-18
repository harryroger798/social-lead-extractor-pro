import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { motion } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'
import { Users, Award, Clock, Shield, Heart, Lightbulb, Target, ArrowRight, MapPin, Sparkles } from 'lucide-react'

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

const stats = [
  { icon: Users, value: 500, suffix: '+', key: 'happyCustomers', color: 'from-blue-500 to-cyan-500' },
  { icon: Award, value: 1, suffix: '+', key: 'yearsExperience', color: 'from-green-500 to-emerald-500' },
  { icon: Clock, value: 24, suffix: '/7', key: 'support', color: 'from-purple-500 to-pink-500' },
  { icon: Shield, value: 100, suffix: '%', key: 'satisfaction', color: 'from-orange-500 to-red-500' },
]

const values = [
  { icon: Heart, key: 'quality', color: 'from-red-500 to-pink-500' },
  { icon: Target, key: 'integrity', color: 'from-blue-500 to-cyan-500' },
  { icon: Lightbulb, key: 'innovation', color: 'from-yellow-500 to-orange-500' },
]

export function AboutPage() {
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
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 mb-6"
            >
              <MapPin className="h-4 w-4" />
              <span className="text-sm font-medium">Barrackpore, West Bengal</span>
            </motion.div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              {t('public.about.title')}
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto mb-4">
              {t('public.about.subtitle')}
            </p>
            <p className="text-lg text-primary font-medium italic">
              {i18n.language === 'hi' ? '"Chai, code, aur customer satisfaction - yahi hamara formula hai!"' :
               i18n.language === 'bn' ? '"চা, কোড, আর কাস্টমার সন্তুষ্টি - এটাই আমাদের ফর্মুলা!"' :
               '"Tea, code, and customer satisfaction - that\'s our formula!"'}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 md:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="backdrop-blur-lg bg-white/70 dark:bg-slate-800/70 border border-white/20 dark:border-slate-700/50 rounded-2xl shadow-xl p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold dark:text-white">{t('public.about.ourStory')}</h2>
              </div>
              <p className="text-muted-foreground mb-4">
                {t('public.about.storyPara1')}
              </p>
              <p className="text-muted-foreground mb-4">
                {t('public.about.storyPara2')}
              </p>
              <p className="text-primary font-medium italic">
                {i18n.language === 'hi' ? '"Ek chhoti si dukaan se shuru hua, ab poore Barrackpore mein naam hai!"' :
                 i18n.language === 'bn' ? '"একটা ছোট্ট দোকান থেকে শুরু, এখন সারা ব্যারাকপুরে নাম!"' :
                 '"Started from a small shop, now we\'re known all over Barrackpore!"'}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="backdrop-blur-lg bg-white/70 dark:bg-slate-800/70 border border-white/20 dark:border-slate-700/50 rounded-2xl shadow-xl p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold dark:text-white">{t('public.about.ourMission')}</h2>
              </div>
              <p className="text-muted-foreground mb-4">
                {t('public.about.missionPara1')}
              </p>
              <p className="text-muted-foreground mb-4">
                {t('public.about.missionPara2')}
              </p>
              <p className="text-primary font-medium italic">
                {i18n.language === 'hi' ? '"Har device ko naya jaisa banana - yahi hamara mission hai!"' :
                 i18n.language === 'bn' ? '"প্রতিটা ডিভাইসকে নতুনের মতো বানানো - এটাই আমাদের মিশন!"' :
                 '"Making every device feel brand new - that\'s our mission!"'}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {i18n.language === 'hi' ? 'Numbers Jo Bolte Hain' :
               i18n.language === 'bn' ? 'সংখ্যা যা বলে' :
               'Numbers That Speak'}
            </h2>
            <p className="text-xl text-white/80">
              {i18n.language === 'hi' ? 'Hum sirf baatein nahi karte, kaam karte hain!' :
               i18n.language === 'bn' ? 'আমরা শুধু কথা বলি না, কাজ করি!' :
               "We don't just talk, we deliver!"}
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.key}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-6 text-center"
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className={`h-16 w-16 rounded-full bg-gradient-to-br ${stat.color} flex items-center justify-center mx-auto mb-4`}
                >
                  <stat.icon className="h-8 w-8 text-white" />
                </motion.div>
                <p className="text-4xl md:text-5xl font-bold text-white mb-2">
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                </p>
                <p className="text-white/80">{t(`public.about.${stat.key}`)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 dark:text-white">
              {t('public.about.ourValues')}
            </h2>
            <p className="text-xl text-muted-foreground">
              {i18n.language === 'hi' ? 'Ye values hain jo humein special banate hain' :
               i18n.language === 'bn' ? 'এই মূল্যবোধগুলো আমাদের বিশেষ করে তোলে' :
               'These values make us who we are'}
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3">
            {values.map((value, index) => (
              <motion.div
                key={value.key}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="backdrop-blur-lg bg-white/70 dark:bg-slate-800/70 border border-white/20 dark:border-slate-700/50 rounded-2xl shadow-xl p-8 text-center"
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className={`h-20 w-20 rounded-full bg-gradient-to-br ${value.color} flex items-center justify-center mx-auto mb-6`}
                >
                  <value.icon className="h-10 w-10 text-white" />
                </motion.div>
                <h3 className="text-xl font-bold mb-3 dark:text-white">
                  {t(`public.about.${value.key}`)}
                </h3>
                <p className="text-muted-foreground">
                  {t(`public.about.${value.key}Desc`)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 animate-pulse" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t('public.about.readyToStart')}
            </h2>
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              {t('public.about.readyToStartDesc')}
            </p>
            <p className="text-lg text-primary font-medium italic mb-8">
              {i18n.language === 'hi' ? '"Aao, milke aapke device ko naya jaisa banate hain!"' :
               i18n.language === 'bn' ? '"আসুন, একসাথে আপনার ডিভাইসকে নতুনের মতো বানাই!"' :
               '"Let\'s make your device feel brand new together!"'}
            </p>
            <Link to="/booking">
              <Button size="lg" className="gap-2 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white border-0 shadow-lg shadow-purple-500/25 px-8 py-6 text-lg">
                {t('public.about.bookAppointment')}
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </PublicLayout>
  )
}
