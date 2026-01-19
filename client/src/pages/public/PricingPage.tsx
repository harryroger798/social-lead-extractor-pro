import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { motion } from 'framer-motion'
import { 
  Check, 
  Star,
  Zap,
  Shield,
  Clock,
  Phone,
  MessageCircle
} from 'lucide-react'

export function PricingPage() {
  const { i18n } = useTranslation()

  const pricingPlans = [
    {
      name: i18n.language === 'hi' ? 'PC Repair' : i18n.language === 'bn' ? 'পিসি মেরামত' : 'PC Repair',
      description: i18n.language === 'hi' ? 'Desktop aur laptop ke liye' : i18n.language === 'bn' ? 'ডেস্কটপ এবং ল্যাপটপের জন্য' : 'For desktops and laptops',
      color: 'from-blue-500 to-cyan-500',
      features: [
        i18n.language === 'hi' ? 'OS Installation' : i18n.language === 'bn' ? 'ওএস ইনস্টলেশন' : 'OS Installation',
        i18n.language === 'hi' ? 'Virus Removal' : i18n.language === 'bn' ? 'ভাইরাস রিমুভাল' : 'Virus Removal',
        i18n.language === 'hi' ? 'RAM Upgrade' : i18n.language === 'bn' ? 'র‍্যাম আপগ্রেড' : 'RAM Upgrade',
        i18n.language === 'hi' ? 'SSD Upgrade' : i18n.language === 'bn' ? 'এসএসডি আপগ্রেড' : 'SSD Upgrade',
        i18n.language === 'hi' ? 'Data Recovery' : i18n.language === 'bn' ? 'ডেটা রিকভারি' : 'Data Recovery',
        i18n.language === 'hi' ? 'Hardware Repair' : i18n.language === 'bn' ? 'হার্ডওয়্যার মেরামত' : 'Hardware Repair',
      ]
    },
    {
      name: i18n.language === 'hi' ? 'Mobile Repair' : i18n.language === 'bn' ? 'মোবাইল মেরামত' : 'Mobile Repair',
      description: i18n.language === 'hi' ? 'Smartphone aur tablet ke liye' : i18n.language === 'bn' ? 'স্মার্টফোন এবং ট্যাবলেটের জন্য' : 'For smartphones and tablets',
      color: 'from-green-500 to-emerald-500',
      popular: true,
      features: [
        i18n.language === 'hi' ? 'Screen Replacement' : i18n.language === 'bn' ? 'স্ক্রিন রিপ্লেসমেন্ট' : 'Screen Replacement',
        i18n.language === 'hi' ? 'Battery Replacement' : i18n.language === 'bn' ? 'ব্যাটারি রিপ্লেসমেন্ট' : 'Battery Replacement',
        i18n.language === 'hi' ? 'Charging Port' : i18n.language === 'bn' ? 'চার্জিং পোর্ট' : 'Charging Port Repair',
        i18n.language === 'hi' ? 'Speaker/Mic Repair' : i18n.language === 'bn' ? 'স্পিকার/মাইক মেরামত' : 'Speaker/Mic Repair',
        i18n.language === 'hi' ? 'Software Issues' : i18n.language === 'bn' ? 'সফটওয়্যার সমস্যা' : 'Software Issues',
        i18n.language === 'hi' ? 'Water Damage' : i18n.language === 'bn' ? 'জলের ক্ষতি' : 'Water Damage Repair',
      ]
    },
    {
      name: i18n.language === 'hi' ? 'Digital Services' : i18n.language === 'bn' ? 'ডিজিটাল সার্ভিস' : 'Digital Services',
      description: i18n.language === 'hi' ? 'Website aur digital marketing' : i18n.language === 'bn' ? 'ওয়েবসাইট এবং ডিজিটাল মার্কেটিং' : 'Website and digital marketing',
      color: 'from-purple-500 to-pink-500',
      features: [
        i18n.language === 'hi' ? 'Basic Website' : i18n.language === 'bn' ? 'বেসিক ওয়েবসাইট' : 'Basic Website',
        i18n.language === 'hi' ? 'E-commerce Site' : i18n.language === 'bn' ? 'ই-কমার্স সাইট' : 'E-commerce Website',
        i18n.language === 'hi' ? 'Logo Design' : i18n.language === 'bn' ? 'লোগো ডিজাইন' : 'Logo Design',
        i18n.language === 'hi' ? 'Social Media Setup' : i18n.language === 'bn' ? 'সোশ্যাল মিডিয়া সেটআপ' : 'Social Media Setup',
        i18n.language === 'hi' ? 'SEO Package' : i18n.language === 'bn' ? 'এসইও প্যাকেজ' : 'SEO Package',
        i18n.language === 'hi' ? 'Google Ads Setup' : i18n.language === 'bn' ? 'গুগল অ্যাডস সেটআপ' : 'Google Ads Setup',
      ]
    }
  ]

  const guarantees = [
    {
      icon: Shield,
      title: i18n.language === 'hi' ? '90 Din Warranty' : i18n.language === 'bn' ? '৯০ দিন ওয়ারেন্টি' : '90-Day Warranty',
      description: i18n.language === 'hi' ? 'Sabhi repairs pe warranty' : i18n.language === 'bn' ? 'সব মেরামতে ওয়ারেন্টি' : 'All repairs come with warranty'
    },
    {
      icon: Zap,
      title: i18n.language === 'hi' ? 'Free Diagnosis' : i18n.language === 'bn' ? 'ফ্রি ডায়াগনোসিস' : 'Free Diagnosis',
      description: i18n.language === 'hi' ? 'Pehle check, phir decide' : i18n.language === 'bn' ? 'আগে চেক, তারপর সিদ্ধান্ত' : 'Check first, then decide'
    },
    {
      icon: Clock,
      title: i18n.language === 'hi' ? 'Quick Service' : i18n.language === 'bn' ? 'দ্রুত সার্ভিস' : 'Quick Service',
      description: i18n.language === 'hi' ? '24-48 ghante mein' : i18n.language === 'bn' ? '২৪-৪৮ ঘণ্টায়' : 'Most repairs in 24-48 hours'
    },
    {
      icon: Star,
      title: i18n.language === 'hi' ? 'Genuine Parts' : i18n.language === 'bn' ? 'জেনুইন পার্টস' : 'Genuine Parts',
      description: i18n.language === 'hi' ? 'Original parts only' : i18n.language === 'bn' ? 'শুধুমাত্র অরিজিনাল পার্টস' : 'Only original quality parts'
    }
  ]

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              {i18n.language === 'hi' ? 'Transparent Pricing' :
               i18n.language === 'bn' ? 'স্বচ্ছ মূল্য' :
               'Transparent Pricing'}
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto mb-8">
              {i18n.language === 'hi' ? 'No hidden charges, no surprises. Aapko pata hoga ki aap kya pay kar rahe ho.' :
               i18n.language === 'bn' ? 'কোনো লুকানো চার্জ নেই, কোনো সারপ্রাইজ নেই। আপনি জানবেন আপনি কী পে করছেন।' :
               'No hidden charges, no surprises. You know exactly what you pay for.'}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/booking">
                <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white border-0">
                  {i18n.language === 'hi' ? 'Book Now' : i18n.language === 'bn' ? 'এখনই বুক করুন' : 'Book Now'}
                </Button>
              </Link>
              <a href="tel:+919876543210">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 bg-transparent">
                  <Phone className="h-5 w-5 mr-2" />
                  {i18n.language === 'hi' ? 'Call for Quote' : i18n.language === 'bn' ? 'কোট জন্য কল করুন' : 'Call for Quote'}
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className={`relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden ${plan.popular ? 'ring-2 ring-primary' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                    {i18n.language === 'hi' ? 'Popular' : i18n.language === 'bn' ? 'জনপ্রিয়' : 'Most Popular'}
                  </div>
                )}
                <div className={`p-6 bg-gradient-to-r ${plan.color} text-white`}>
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-white/80 text-sm mb-4">{plan.description}</p>
                  <p className="text-sm text-white/90 mt-2">
                    {i18n.language === 'hi' ? 'Quote ke liye call karein' : i18n.language === 'bn' ? 'কোটের জন্য কল করুন' : 'Call for a quote'}
                  </p>
                </div>
                <div className="p-6">
                  <ul className="space-y-4">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="dark:text-white">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/booking" className="block mt-6">
                    <Button className="w-full bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 text-white" size="lg">
                      {i18n.language === 'hi' ? 'Book Now' : i18n.language === 'bn' ? 'এখনই বুক করুন' : 'Book Now'}
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Guarantees */}
      <section className="py-20 bg-white dark:bg-slate-800">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold dark:text-white mb-4">
              {i18n.language === 'hi' ? 'Humari Guarantee' :
               i18n.language === 'bn' ? 'আমাদের গ্যারান্টি' :
               'Our Guarantee'}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {i18n.language === 'hi' ? 'Aapka bharosa humari zimmedari' :
               i18n.language === 'bn' ? 'আপনার বিশ্বাস আমাদের দায়িত্ব' :
               'Your trust is our responsibility'}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            {guarantees.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-6"
              >
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold dark:text-white mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-purple-600">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              {i18n.language === 'hi' ? 'Koi Sawaal?' :
               i18n.language === 'bn' ? 'কোনো প্রশ্ন?' :
               'Have Questions?'}
            </h2>
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              {i18n.language === 'hi' ? 'WhatsApp pe message karo ya call karo, hum hamesha available hain!' :
               i18n.language === 'bn' ? 'WhatsApp-এ মেসেজ করুন বা কল করুন, আমরা সবসময় আছি!' :
               'Message us on WhatsApp or give us a call, we are always available!'}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="bg-green-500 hover:bg-green-600 text-white">
                  <MessageCircle className="h-5 w-5 mr-2" />
                  WhatsApp
                </Button>
              </a>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 bg-transparent">
                  {i18n.language === 'hi' ? 'Contact Us' : i18n.language === 'bn' ? 'যোগাযোগ করুন' : 'Contact Us'}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </PublicLayout>
  )
}
