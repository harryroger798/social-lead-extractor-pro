import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { useToast } from '@/hooks/use-toast'
import { motion } from 'framer-motion'
import { MapPin, Phone, Mail, Clock, Send, MessageSquare } from 'lucide-react'
import { GradientOrbs, FloatingTechIcons, DotGridPattern, FloatingParticles, CircuitPattern, AnimatedLines } from '@/components/ui/visual-enhancements'

const contactInfo = [
  { icon: MapPin, key: 'address', value: 'Barrackpore, West Bengal', color: 'from-blue-500 to-cyan-500' },
  { icon: Phone, key: 'phoneNumber', value: '+91 98765 43210', color: 'from-green-500 to-emerald-500' },
  { icon: Mail, key: 'emailAddress', value: 'harryroger798@gmail.com', color: 'from-purple-500 to-pink-500' },
  { icon: Clock, key: 'businessHours', value: '10:00 AM - 8:00 PM', color: 'from-orange-500 to-red-500' },
]

export function ContactPage() {
  const { t, i18n } = useTranslation()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast({
      title: t('public.contact.messageSent'),
      description: t('public.contact.messageSentDesc'),
    })
    setFormData({ name: '', email: '', phone: '', message: '' })
  }

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 animate-pulse" />
        <FloatingParticles count={30} color="white" />
        <FloatingTechIcons variant="light" />
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
              <MessageSquare className="h-10 w-10 text-white" />
            </motion.div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              {t('public.contact.title')}
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto mb-4">
              {t('public.contact.subtitle')}
            </p>
            <p className="text-lg text-primary font-medium italic">
              {i18n.language === 'hi' ? '"Baat karo, hum sunne ke liye taiyaar hain!"' :
               i18n.language === 'bn' ? '"কথা বলুন, আমরা শুনতে প্রস্তুত!"' :
               '"Talk to us, we\'re all ears!"'}
            </p>
          </motion.div>
        </div>
      </section>

            {/* Contact Illustration Section */}
            <section className="relative py-12 bg-white dark:bg-slate-800 overflow-hidden">
              <DotGridPattern opacity="light" />
              <AnimatedLines color="default" />
              <FloatingParticles count={15} color="primary" />
              <div className="container mx-auto px-4">
                <div className="grid gap-12 md:grid-cols-2 items-center">
                  <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                  >
                    <img 
                      src="/images/contact-illustration.png" 
                      alt="Contact Us" 
                      className="w-full max-w-md mx-auto"
                    />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-center md:text-left"
                  >
                    <h2 className="text-3xl font-bold mb-4 dark:text-white">
                      {i18n.language === 'hi' ? 'Hum Yahan Hain Aapke Liye' :
                       i18n.language === 'bn' ? 'আমরা এখানে আপনার জন্য' :
                       "We're Here For You"}
                    </h2>
                    <p className="text-muted-foreground">
                      {i18n.language === 'hi' ? 'Koi bhi sawal ho, koi bhi problem ho - hum hamesha ready hain help karne ke liye!' :
                       i18n.language === 'bn' ? 'যেকোনো প্রশ্ন, যেকোনো সমস্যা - আমরা সবসময় সাহায্য করতে প্রস্তুত!' :
                       'Any question, any problem - we are always ready to help!'}
                    </p>
                  </motion.div>
                </div>
              </div>
            </section>

            {/* Contact Form & Info Section */}
            <section className="relative py-20 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 overflow-hidden">
              <GradientOrbs variant="subtle" />
              <FloatingTechIcons variant="default" />
              <DotGridPattern opacity="light" />
              <div className="container mx-auto px-4">
                <div className="grid gap-12 lg:grid-cols-2">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="backdrop-blur-lg bg-white/70 dark:bg-slate-800/70 border border-white/20 dark:border-slate-700/50 rounded-2xl shadow-xl p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
                  <Send className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold dark:text-white">{t('public.contact.sendMessage')}</h2>
                  <p className="text-sm text-muted-foreground">{t('public.contact.sendMessageDesc')}</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="space-y-2"
                >
                  <Label htmlFor="name" className="dark:text-white">{t('public.contact.name')}</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="bg-white/50 dark:bg-slate-700/50 border-white/20 dark:border-slate-600"
                    placeholder={i18n.language === 'hi' ? 'Aapka naam' : i18n.language === 'bn' ? 'আপনার নাম' : 'Your name'}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="space-y-2"
                >
                  <Label htmlFor="email" className="dark:text-white">{t('public.contact.email')}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="bg-white/50 dark:bg-slate-700/50 border-white/20 dark:border-slate-600"
                    placeholder="email@example.com"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="space-y-2"
                >
                  <Label htmlFor="phone" className="dark:text-white">{t('public.contact.phone')}</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="bg-white/50 dark:bg-slate-700/50 border-white/20 dark:border-slate-600"
                    placeholder="+91 98765 43210"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="space-y-2"
                >
                  <Label htmlFor="message" className="dark:text-white">{t('public.contact.message')}</Label>
                  <Textarea
                    id="message"
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    className="bg-white/50 dark:bg-slate-700/50 border-white/20 dark:border-slate-600"
                    placeholder={i18n.language === 'hi' ? 'Aapka message yahan likhein...' : 
                                 i18n.language === 'bn' ? 'আপনার মেসেজ এখানে লিখুন...' : 
                                 'Write your message here...'}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                >
                  <Button 
                    type="submit" 
                    className="w-full gap-2 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white border-0 shadow-lg shadow-purple-500/25 py-6 text-lg"
                  >
                    <Send className="h-5 w-5" />
                    {t('public.contact.send')}
                  </Button>
                </motion.div>
              </form>
            </motion.div>

            {/* Contact Info Cards */}
            <div className="space-y-6">
              {contactInfo.map((info, index) => (
                <motion.div
                  key={info.key}
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ x: 10, scale: 1.02 }}
                  className="backdrop-blur-lg bg-white/70 dark:bg-slate-800/70 border border-white/20 dark:border-slate-700/50 rounded-2xl shadow-xl p-6"
                >
                  <div className="flex items-center gap-4">
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                      className={`h-14 w-14 rounded-xl bg-gradient-to-br ${info.color} flex items-center justify-center flex-shrink-0`}
                    >
                      <info.icon className="h-7 w-7 text-white" />
                    </motion.div>
                    <div>
                      <h3 className="font-bold text-lg dark:text-white">{t(`public.contact.${info.key}`)}</h3>
                      <p className="text-muted-foreground">{info.value}</p>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Quirky Message Card */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="backdrop-blur-lg bg-gradient-to-r from-purple-600/90 to-pink-600/90 border border-white/20 rounded-2xl shadow-xl p-6 text-center"
              >
                <p className="text-white text-lg font-medium">
                  {i18n.language === 'hi' ? '"Humse baat karo, hum friendly hain - promise!"' :
                   i18n.language === 'bn' ? '"আমাদের সাথে কথা বলুন, আমরা ফ্রেন্ডলি - প্রমিস!"' :
                   '"Talk to us, we\'re friendly - promise!"'}
                </p>
                <p className="text-white/70 text-sm mt-2">
                  {i18n.language === 'hi' ? 'Response time: Chai break ke baad turant!' :
                   i18n.language === 'bn' ? 'রেসপন্স টাইম: চায়ের বিরতির পরেই!' :
                   'Response time: Right after our chai break!'}
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Location Map Section */}
      <section className="relative py-12 bg-white dark:bg-slate-800 overflow-hidden">
        <CircuitPattern variant="default" />
        <GradientOrbs variant="subtle" />
        <FloatingParticles count={15} color="primary" />
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl font-bold mb-4 dark:text-white">
              {i18n.language === 'hi' ? 'Humein Dhundhein' :
               i18n.language === 'bn' ? 'আমাদের খুঁজুন' :
               'Find Us'}
            </h2>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl overflow-hidden shadow-xl"
          >
            <img 
              src="/images/location-map.png" 
              alt="Our Location" 
              className="w-full h-auto"
            />
          </motion.div>
        </div>
      </section>
    </PublicLayout>
  )
}
