import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { 
  Search,
  ChevronDown,
  ChevronUp,
  Smartphone,
  Monitor,
  Globe,
  Shield,
  Phone,
  MessageCircle,
  HelpCircle,
  CreditCard,
  MapPin
} from 'lucide-react'
import { GradientOrbs, FloatingTechIcons, DotGridPattern, FloatingParticles, CircuitPattern, AnimatedLines } from '@/components/ui/visual-enhancements'

interface FAQItem {
  question: string
  answer: string
}

function FAQAccordion({ items, category }: { items: FAQItem[], category: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="space-y-3">
      <h3 className="text-xl font-bold dark:text-white mb-4">{category}</h3>
      {items.map((item, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.05 }}
          className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden"
        >
          <button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="w-full flex items-center justify-between p-4 text-left bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <span className="font-medium dark:text-white">{item.question}</span>
            {openIndex === index ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </button>
          {openIndex === index && (
            <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
              <p className="text-muted-foreground">{item.answer}</p>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  )
}

export function HelpCenterPage() {
  const { i18n } = useTranslation()
  const [searchQuery, setSearchQuery] = useState('')

  const categories = [
    {
      icon: Smartphone,
      title: i18n.language === 'hi' ? 'Mobile Repair' : i18n.language === 'bn' ? 'মোবাইল মেরামত' : 'Mobile Repair',
      description: i18n.language === 'hi' ? 'Phone repair ke baare mein' : i18n.language === 'bn' ? 'ফোন মেরামত সম্পর্কে' : 'About phone repairs'
    },
    {
      icon: Monitor,
      title: i18n.language === 'hi' ? 'PC/Laptop Repair' : i18n.language === 'bn' ? 'পিসি/ল্যাপটপ মেরামত' : 'PC/Laptop Repair',
      description: i18n.language === 'hi' ? 'Computer repair ke baare mein' : i18n.language === 'bn' ? 'কম্পিউটার মেরামত সম্পর্কে' : 'About computer repairs'
    },
    {
      icon: Globe,
      title: i18n.language === 'hi' ? 'Digital Services' : i18n.language === 'bn' ? 'ডিজিটাল সার্ভিস' : 'Digital Services',
      description: i18n.language === 'hi' ? 'Website aur marketing' : i18n.language === 'bn' ? 'ওয়েবসাইট এবং মার্কেটিং' : 'Website and marketing'
    },
    {
      icon: CreditCard,
      title: i18n.language === 'hi' ? 'Payment & Billing' : i18n.language === 'bn' ? 'পেমেন্ট এবং বিলিং' : 'Payment & Billing',
      description: i18n.language === 'hi' ? 'Payment options' : i18n.language === 'bn' ? 'পেমেন্ট অপশন' : 'Payment options'
    },
    {
      icon: Shield,
      title: i18n.language === 'hi' ? 'Warranty & Returns' : i18n.language === 'bn' ? 'ওয়ারেন্টি এবং রিটার্ন' : 'Warranty & Returns',
      description: i18n.language === 'hi' ? 'Warranty policy' : i18n.language === 'bn' ? 'ওয়ারেন্টি পলিসি' : 'Warranty policy'
    },
    {
      icon: MapPin,
      title: i18n.language === 'hi' ? 'Pickup & Delivery' : i18n.language === 'bn' ? 'পিকআপ এবং ডেলিভারি' : 'Pickup & Delivery',
      description: i18n.language === 'hi' ? 'Home service' : i18n.language === 'bn' ? 'হোম সার্ভিস' : 'Home service'
    }
  ]

  const generalFAQs: FAQItem[] = [
    {
      question: i18n.language === 'hi' ? 'Repair mein kitna time lagta hai?' : i18n.language === 'bn' ? 'মেরামতে কত সময় লাগে?' : 'How long does a repair take?',
      answer: i18n.language === 'hi' ? 'Zyada tar repairs 24-48 ghante mein ho jaate hain. Complex repairs mein 3-5 din lag sakte hain.' : i18n.language === 'bn' ? 'বেশিরভাগ মেরামত ২৪-৪৮ ঘণ্টায় হয়ে যায়। জটিল মেরামতে ৩-৫ দিন লাগতে পারে।' : 'Most repairs are completed within 24-48 hours. Complex repairs may take 3-5 days.'
    },
    {
      question: i18n.language === 'hi' ? 'Kya aap home pickup dete ho?' : i18n.language === 'bn' ? 'আপনারা কি হোম পিকআপ দেন?' : 'Do you offer home pickup?',
      answer: i18n.language === 'hi' ? 'Haan! Hum free home pickup aur delivery dete hain 5km ke andar. Usse door ke liye nominal charge hai.' : i18n.language === 'bn' ? 'হ্যাঁ! আমরা ৫ কিমির মধ্যে ফ্রি হোম পিকআপ এবং ডেলিভারি দিই। এর বাইরে নামমাত্র চার্জ।' : 'Yes! We offer free home pickup and delivery within 5km. Nominal charges apply for farther distances.'
    },
    {
      question: i18n.language === 'hi' ? 'Warranty kitne din ki milti hai?' : i18n.language === 'bn' ? 'ওয়ারেন্টি কত দিনের?' : 'What is the warranty period?',
      answer: i18n.language === 'hi' ? 'Sabhi repairs pe 90 din ki warranty milti hai. Parts pe manufacturer warranty alag se milti hai.' : i18n.language === 'bn' ? 'সব মেরামতে ৯০ দিনের ওয়ারেন্টি। পার্টসে ম্যানুফ্যাকচারার ওয়ারেন্টি আলাদা।' : 'All repairs come with a 90-day warranty. Parts have separate manufacturer warranty.'
    },
    {
      question: i18n.language === 'hi' ? 'Payment ke kya options hain?' : i18n.language === 'bn' ? 'পেমেন্টের কী অপশন আছে?' : 'What payment options are available?',
      answer: i18n.language === 'hi' ? 'Cash, UPI (GPay, PhonePe, Paytm), Credit/Debit Card, Net Banking - sab accept karte hain.' : i18n.language === 'bn' ? 'ক্যাশ, UPI (GPay, PhonePe, Paytm), ক্রেডিট/ডেবিট কার্ড, নেট ব্যাংকিং - সব গ্রহণ করি।' : 'We accept Cash, UPI (GPay, PhonePe, Paytm), Credit/Debit Cards, and Net Banking.'
    },
    {
      question: i18n.language === 'hi' ? 'Kya original parts use karte ho?' : i18n.language === 'bn' ? 'আপনারা কি অরিজিনাল পার্টস ব্যবহার করেন?' : 'Do you use original parts?',
      answer: i18n.language === 'hi' ? 'Haan, hum sirf genuine aur high-quality parts use karte hain. Customer ko option dete hain original ya compatible parts ke beech.' : i18n.language === 'bn' ? 'হ্যাঁ, আমরা শুধু জেনুইন এবং উচ্চমানের পার্টস ব্যবহার করি। কাস্টমারকে অরিজিনাল বা কম্প্যাটিবল পার্টসের মধ্যে অপশন দিই।' : 'Yes, we only use genuine and high-quality parts. Customers can choose between original or compatible parts.'
    },
    {
      question: i18n.language === 'hi' ? 'Data safe rahega?' : i18n.language === 'bn' ? 'ডেটা সেফ থাকবে?' : 'Is my data safe?',
      answer: i18n.language === 'hi' ? 'Bilkul! Aapka data 100% safe hai. Hum kisi bhi personal data ko access nahi karte bina aapki permission ke.' : i18n.language === 'bn' ? 'অবশ্যই! আপনার ডেটা ১০০% সেফ। আমরা আপনার অনুমতি ছাড়া কোনো পার্সোনাল ডেটা অ্যাক্সেস করি না।' : 'Absolutely! Your data is 100% safe. We never access any personal data without your permission.'
    }
  ]

  const mobileRepairFAQs: FAQItem[] = [
    {
      question: i18n.language === 'hi' ? 'Screen replacement mein kitna time lagta hai?' : i18n.language === 'bn' ? 'স্ক্রিন রিপ্লেসমেন্টে কত সময় লাগে?' : 'How long does screen replacement take?',
      answer: i18n.language === 'hi' ? 'Zyada tar phones ka screen 1-2 ghante mein replace ho jaata hai. Kuch models mein same day delivery milti hai.' : i18n.language === 'bn' ? 'বেশিরভাগ ফোনের স্ক্রিন ১-২ ঘণ্টায় রিপ্লেস হয়ে যায়। কিছু মডেলে সেম ডে ডেলিভারি।' : 'Most phone screens are replaced within 1-2 hours. Some models offer same-day delivery.'
    },
    {
      question: i18n.language === 'hi' ? 'Water damage repair possible hai?' : i18n.language === 'bn' ? 'ওয়াটার ড্যামেজ রিপেয়ার সম্ভব?' : 'Is water damage repair possible?',
      answer: i18n.language === 'hi' ? 'Haan, hum water damage repair karte hain. Jitna jaldi laoge, utna better chances hain. Phone ko rice mein mat daalo!' : i18n.language === 'bn' ? 'হ্যাঁ, আমরা ওয়াটার ড্যামেজ রিপেয়ার করি। যত তাড়াতাড়ি আনবেন, তত ভালো চান্স। ফোন চালে দেবেন না!' : 'Yes, we repair water damage. The sooner you bring it, the better the chances. Do not put your phone in rice!'
    },
    {
      question: i18n.language === 'hi' ? 'Battery kitne din chalti hai replacement ke baad?' : i18n.language === 'bn' ? 'রিপ্লেসমেন্টের পর ব্যাটারি কত দিন চলে?' : 'How long does the battery last after replacement?',
      answer: i18n.language === 'hi' ? 'New battery se phone naye jaisa performance deta hai. Average 2-3 saal tak achhi battery life milti hai.' : i18n.language === 'bn' ? 'নতুন ব্যাটারিতে ফোন নতুনের মতো পারফর্ম করে। গড়ে ২-৩ বছর ভালো ব্যাটারি লাইফ পাবেন।' : 'A new battery gives your phone like-new performance. Average battery life is 2-3 years.'
    }
  ]

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 overflow-hidden">
        <FloatingParticles count={30} color="white" />
        <FloatingTechIcons variant="light" />
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <HelpCircle className="h-16 w-16 text-white mx-auto mb-6" />
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              {i18n.language === 'hi' ? 'Help Center' :
               i18n.language === 'bn' ? 'হেল্প সেন্টার' :
               'Help Center'}
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto mb-8">
              {i18n.language === 'hi' ? 'Aapke sawaalon ke jawaab yahan milenge' :
               i18n.language === 'bn' ? 'আপনার প্রশ্নের উত্তর এখানে পাবেন' :
               'Find answers to your questions here'}
            </p>
            
            {/* Search Bar */}
            <div className="max-w-xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={i18n.language === 'hi' ? 'Kuch bhi search karo...' : i18n.language === 'bn' ? 'যেকোনো কিছু সার্চ করুন...' : 'Search for anything...'}
                className="w-full pl-12 pr-4 py-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="relative py-16 bg-slate-50 dark:bg-slate-900 overflow-hidden">
        <GradientOrbs variant="subtle" />
        <DotGridPattern opacity="light" />
        <AnimatedLines color="default" />
        <FloatingTechIcons variant="default" />
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold dark:text-white mb-4">
              {i18n.language === 'hi' ? 'Browse by Category' :
               i18n.language === 'bn' ? 'ক্যাটাগরি অনুযায়ী ব্রাউজ করুন' :
               'Browse by Category'}
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow cursor-pointer group"
              >
                <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <category.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold dark:text-white mb-2">{category.title}</h3>
                <p className="text-muted-foreground">{category.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="relative py-16 bg-white dark:bg-slate-800 overflow-hidden">
        <CircuitPattern variant="default" />
        <GradientOrbs variant="subtle" />
        <FloatingParticles count={20} color="primary" />
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold dark:text-white mb-4">
              {i18n.language === 'hi' ? 'Frequently Asked Questions' :
               i18n.language === 'bn' ? 'সচরাচর জিজ্ঞাসিত প্রশ্ন' :
               'Frequently Asked Questions'}
            </h2>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-8">
            <FAQAccordion 
              items={generalFAQs} 
              category={i18n.language === 'hi' ? 'General Questions' : i18n.language === 'bn' ? 'সাধারণ প্রশ্ন' : 'General Questions'} 
            />
            <FAQAccordion 
              items={mobileRepairFAQs} 
              category={i18n.language === 'hi' ? 'Mobile Repair' : i18n.language === 'bn' ? 'মোবাইল মেরামত' : 'Mobile Repair'} 
            />
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="relative py-16 bg-gradient-to-r from-primary to-purple-600 overflow-hidden">
        <FloatingParticles count={40} color="white" />
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              {i18n.language === 'hi' ? 'Jawab nahi mila?' :
               i18n.language === 'bn' ? 'উত্তর পাননি?' :
               'Did not find your answer?'}
            </h2>
            <p className="text-xl text-white/80 mb-8">
              {i18n.language === 'hi' ? 'Humse seedha baat karo!' :
               i18n.language === 'bn' ? 'আমাদের সাথে সরাসরি কথা বলুন!' :
               'Talk to us directly!'}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="bg-green-500 hover:bg-green-600 text-white">
                  <MessageCircle className="h-5 w-5 mr-2" />
                  WhatsApp
                </Button>
              </a>
              <a href="tel:+919876543210">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  <Phone className="h-5 w-5 mr-2" />
                  {i18n.language === 'hi' ? 'Call Karo' : i18n.language === 'bn' ? 'কল করুন' : 'Call Us'}
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </PublicLayout>
  )
}
