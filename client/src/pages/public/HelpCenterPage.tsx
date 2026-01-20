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

function FAQAccordion({ items, category, id }: { items: FAQItem[], category: string, id?: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="space-y-3" id={id}>
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
        description: i18n.language === 'hi' ? 'Phone repair ke baare mein' : i18n.language === 'bn' ? 'ফোন মেরামত সম্পর্কে' : 'About phone repairs',
        sectionId: 'faq-mobile-repair'
      },
      {
        icon: Monitor,
        title: i18n.language === 'hi' ? 'PC/Laptop Repair' : i18n.language === 'bn' ? 'পিসি/ল্যাপটপ মেরামত' : 'PC/Laptop Repair',
        description: i18n.language === 'hi' ? 'Computer repair ke baare mein' : i18n.language === 'bn' ? 'কম্পিউটার মেরামত সম্পর্কে' : 'About computer repairs',
        sectionId: 'faq-pc-laptop'
      },
      {
        icon: Globe,
        title: i18n.language === 'hi' ? 'Digital Services' : i18n.language === 'bn' ? 'ডিজিটাল সার্ভিস' : 'Digital Services',
        description: i18n.language === 'hi' ? 'Website aur marketing' : i18n.language === 'bn' ? 'ওয়েবসাইট এবং মার্কেটিং' : 'Website and marketing',
        sectionId: 'faq-digital-services'
      },
      {
        icon: CreditCard,
        title: i18n.language === 'hi' ? 'Payment & Billing' : i18n.language === 'bn' ? 'পেমেন্ট এবং বিলিং' : 'Payment & Billing',
        description: i18n.language === 'hi' ? 'Payment options' : i18n.language === 'bn' ? 'পেমেন্ট অপশন' : 'Payment options',
        sectionId: 'faq-payment'
      },
      {
        icon: Shield,
        title: i18n.language === 'hi' ? 'Warranty & Returns' : i18n.language === 'bn' ? 'ওয়ারেন্টি এবং রিটার্ন' : 'Warranty & Returns',
        description: i18n.language === 'hi' ? 'Warranty policy' : i18n.language === 'bn' ? 'ওয়ারেন্টি পলিসি' : 'Warranty policy',
        sectionId: 'faq-warranty'
      },
      {
        icon: MapPin,
        title: i18n.language === 'hi' ? 'Pickup & Delivery' : i18n.language === 'bn' ? 'পিকআপ এবং ডেলিভারি' : 'Pickup & Delivery',
        description: i18n.language === 'hi' ? 'Home service' : i18n.language === 'bn' ? 'হোম সার্ভিস' : 'Home service',
        sectionId: 'faq-pickup-delivery'
      }
    ]

      const scrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }

    const generalFAQs: FAQItem[] = [
    {
      question: i18n.language === 'hi' ? 'Repair mein kitna time lagta hai?' : i18n.language === 'bn' ? 'মেরামতে কত সময় লাগে?' : 'How long does a repair take?',
      answer: i18n.language === 'hi' ? 'Zyada tar repairs 24-48 ghante mein ho jaate hain. Complex repairs mein 3-5 din lag sakte hain. Screen replacement jaise simple repairs same day bhi ho sakte hain.' : i18n.language === 'bn' ? 'বেশিরভাগ মেরামত ২৪-৪৮ ঘণ্টায় হয়ে যায়। জটিল মেরামতে ৩-৫ দিন লাগতে পারে। স্ক্রিন রিপ্লেসমেন্টের মতো সাধারণ মেরামত একই দিনে হতে পারে।' : 'Most repairs are completed within 24-48 hours. Complex repairs may take 3-5 days. Simple repairs like screen replacement can be done same day.'
    },
    {
      question: i18n.language === 'hi' ? 'Kya aap home pickup dete ho?' : i18n.language === 'bn' ? 'আপনারা কি হোম পিকআপ দেন?' : 'Do you offer home pickup?',
      answer: i18n.language === 'hi' ? 'Haan! Hum free home pickup aur delivery dete hain 5km ke andar. Usse door ke liye nominal charge hai. Pickup schedule karne ke liye humein call ya WhatsApp karein.' : i18n.language === 'bn' ? 'হ্যাঁ! আমরা ৫ কিমির মধ্যে ফ্রি হোম পিকআপ এবং ডেলিভারি দিই। এর বাইরে নামমাত্র চার্জ। পিকআপ শিডিউল করতে আমাদের কল বা হোয়াটসঅ্যাপ করুন।' : 'Yes! We offer free home pickup and delivery within 5km. Nominal charges apply for farther distances. Call or WhatsApp us to schedule pickup.'
    },
    {
      question: i18n.language === 'hi' ? 'Warranty kitne din ki milti hai?' : i18n.language === 'bn' ? 'ওয়ারেন্টি কত দিনের?' : 'What is the warranty period?',
      answer: i18n.language === 'hi' ? 'Sabhi repairs pe 90 din ki warranty milti hai. Parts pe manufacturer warranty alag se milti hai. Warranty mein labor aur parts dono cover hote hain.' : i18n.language === 'bn' ? 'সব মেরামতে ৯০ দিনের ওয়ারেন্টি। পার্টসে ম্যানুফ্যাকচারার ওয়ারেন্টি আলাদা। ওয়ারেন্টিতে লেবার এবং পার্টস দুটোই কভার হয়।' : 'All repairs come with a 90-day warranty. Parts have separate manufacturer warranty. Warranty covers both labor and parts.'
    },
    {
      question: i18n.language === 'hi' ? 'Payment ke kya options hain?' : i18n.language === 'bn' ? 'পেমেন্টের কী অপশন আছে?' : 'What payment options are available?',
      answer: i18n.language === 'hi' ? 'Cash, UPI (GPay, PhonePe, Paytm), Credit/Debit Card, Net Banking - sab accept karte hain. GST bill bhi milta hai.' : i18n.language === 'bn' ? 'ক্যাশ, UPI (GPay, PhonePe, Paytm), ক্রেডিট/ডেবিট কার্ড, নেট ব্যাংকিং - সব গ্রহণ করি। GST বিল পাবেন।' : 'We accept Cash, UPI (GPay, PhonePe, Paytm), Credit/Debit Cards, and Net Banking. GST invoice provided.'
    },
    {
      question: i18n.language === 'hi' ? 'Kya original parts use karte ho?' : i18n.language === 'bn' ? 'আপনারা কি অরিজিনাল পার্টস ব্যবহার করেন?' : 'Do you use original parts?',
      answer: i18n.language === 'hi' ? 'Haan, hum sirf genuine aur high-quality parts use karte hain. Customer ko option dete hain original ya compatible parts ke beech. Dono pe warranty milti hai.' : i18n.language === 'bn' ? 'হ্যাঁ, আমরা শুধু জেনুইন এবং উচ্চমানের পার্টস ব্যবহার করি। কাস্টমারকে অরিজিনাল বা কম্প্যাটিবল পার্টসের মধ্যে অপশন দিই। দুটোতেই ওয়ারেন্টি পাবেন।' : 'Yes, we only use genuine and high-quality parts. Customers can choose between original or compatible parts. Both come with warranty.'
    },
    {
      question: i18n.language === 'hi' ? 'Data safe rahega?' : i18n.language === 'bn' ? 'ডেটা সেফ থাকবে?' : 'Is my data safe?',
      answer: i18n.language === 'hi' ? 'Bilkul! Aapka data 100% safe hai. Hum kisi bhi personal data ko access nahi karte bina aapki permission ke. Repair se pehle backup lena recommend karte hain.' : i18n.language === 'bn' ? 'অবশ্যই! আপনার ডেটা ১০০% সেফ। আমরা আপনার অনুমতি ছাড়া কোনো পার্সোনাল ডেটা অ্যাক্সেস করি না। মেরামতের আগে ব্যাকআপ নেওয়ার পরামর্শ দিই।' : 'Absolutely! Your data is 100% safe. We never access any personal data without your permission. We recommend taking backup before repair.'
    },
    {
      question: i18n.language === 'hi' ? 'Aapka shop kahan hai?' : i18n.language === 'bn' ? 'আপনার দোকান কোথায়?' : 'Where is your shop located?',
      answer: i18n.language === 'hi' ? 'Hum Barrackpore, West Bengal mein hain. Exact location ke liye humein call karein ya Google Maps pe "ByteCare" search karein.' : i18n.language === 'bn' ? 'আমরা ব্যারাকপুর, পশ্চিমবঙ্গে আছি। সঠিক লোকেশনের জন্য আমাদের কল করুন বা গুগল ম্যাপে "ByteCare" সার্চ করুন।' : 'We are located in Barrackpore, West Bengal. Call us for exact location or search "ByteCare" on Google Maps.'
    },
    {
      question: i18n.language === 'hi' ? 'Kya repair se pehle estimate milta hai?' : i18n.language === 'bn' ? 'মেরামতের আগে এস্টিমেট পাওয়া যায়?' : 'Do you provide estimate before repair?',
      answer: i18n.language === 'hi' ? 'Haan! Hum free diagnosis karte hain aur repair se pehle detailed estimate dete hain. Aapki approval ke baad hi repair start karte hain.' : i18n.language === 'bn' ? 'হ্যাঁ! আমরা ফ্রি ডায়াগনোসিস করি এবং মেরামতের আগে বিস্তারিত এস্টিমেট দিই। আপনার অনুমোদনের পরই মেরামত শুরু করি।' : 'Yes! We provide free diagnosis and detailed estimate before repair. We start repair only after your approval.'
    },
    {
      question: i18n.language === 'hi' ? 'Kya sabhi brands repair karte ho?' : i18n.language === 'bn' ? 'সব ব্র্যান্ড মেরামত করেন?' : 'Do you repair all brands?',
      answer: i18n.language === 'hi' ? 'Haan! Hum sabhi major brands repair karte hain - Samsung, Apple, Xiaomi, OnePlus, Vivo, Oppo, Realme, Dell, HP, Lenovo, Asus, Acer, etc.' : i18n.language === 'bn' ? 'হ্যাঁ! আমরা সব প্রধান ব্র্যান্ড মেরামত করি - Samsung, Apple, Xiaomi, OnePlus, Vivo, Oppo, Realme, Dell, HP, Lenovo, Asus, Acer, ইত্যাদি।' : 'Yes! We repair all major brands - Samsung, Apple, Xiaomi, OnePlus, Vivo, Oppo, Realme, Dell, HP, Lenovo, Asus, Acer, etc.'
    },
    {
      question: i18n.language === 'hi' ? 'Repair status track kar sakte hain?' : i18n.language === 'bn' ? 'মেরামত স্ট্যাটাস ট্র্যাক করা যায়?' : 'Can I track my repair status?',
      answer: i18n.language === 'hi' ? 'Haan! Aapko job card number milega jisse aap online repair status track kar sakte ho. Humari website pe "Track Repair" section hai.' : i18n.language === 'bn' ? 'হ্যাঁ! আপনি জব কার্ড নম্বর পাবেন যা দিয়ে অনলাইনে মেরামত স্ট্যাটাস ট্র্যাক করতে পারবেন। আমাদের ওয়েবসাইটে "Track Repair" সেকশন আছে।' : 'Yes! You will get a job card number to track your repair status online. Our website has a "Track Repair" section.'
    },
    {
      question: i18n.language === 'hi' ? 'Aapke working hours kya hain?' : i18n.language === 'bn' ? 'আপনাদের কাজের সময় কী?' : 'What are your working hours?',
      answer: i18n.language === 'hi' ? 'Hum Monday se Saturday, subah 10 baje se raat 8 baje tak khule rehte hain. Sunday ko 11 baje se shaam 6 baje tak.' : i18n.language === 'bn' ? 'আমরা সোমবার থেকে শনিবার সকাল ১০টা থেকে রাত ৮টা পর্যন্ত খোলা থাকি। রবিবার ১১টা থেকে সন্ধ্যা ৬টা পর্যন্ত।' : 'We are open Monday to Saturday, 10 AM to 8 PM. Sunday 11 AM to 6 PM.'
    },
    {
      question: i18n.language === 'hi' ? 'Agar repair se satisfied nahi hua to?' : i18n.language === 'bn' ? 'মেরামতে সন্তুষ্ট না হলে?' : 'What if I am not satisfied with the repair?',
      answer: i18n.language === 'hi' ? 'Agar aap satisfied nahi hain, humein turant batayein. Hum issue ko free mein fix karenge. Customer satisfaction hamari priority hai.' : i18n.language === 'bn' ? 'যদি আপনি সন্তুষ্ট না হন, আমাদের তৎক্ষণাৎ জানান। আমরা সমস্যা ফ্রিতে ঠিক করব। কাস্টমার সন্তুষ্টি আমাদের অগ্রাধিকার।' : 'If you are not satisfied, let us know immediately. We will fix the issue for free. Customer satisfaction is our priority.'
    }
  ]

  const mobileRepairFAQs: FAQItem[] = [
    {
      question: i18n.language === 'hi' ? 'Screen replacement mein kitna time lagta hai?' : i18n.language === 'bn' ? 'স্ক্রিন রিপ্লেসমেন্টে কত সময় লাগে?' : 'How long does screen replacement take?',
      answer: i18n.language === 'hi' ? 'Zyada tar phones ka screen 1-2 ghante mein replace ho jaata hai. Kuch models mein same day delivery milti hai.' : i18n.language === 'bn' ? 'বেশিরভাগ ফোনের স্ক্রিন ১-২ ঘণ্টায় রিপ্লেস হয়ে যায়। কিছু মডেলে সেম ডে ডেলিভারি।' : 'Most phone screens are replaced within 1-2 hours. Some models offer same-day delivery.'
    },
    {
      question: i18n.language === 'hi' ? 'Water damage repair possible hai?' : i18n.language === 'bn' ? 'ওয়াটার ড্যামেজ রিপেয়ার সম্ভব?' : 'Is water damage repair possible?',
      answer: i18n.language === 'hi' ? 'Haan, hum water damage repair karte hain. Jitna jaldi laoge, utna better chances hain. Phone ko rice mein mat daalo - ye myth hai!' : i18n.language === 'bn' ? 'হ্যাঁ, আমরা ওয়াটার ড্যামেজ রিপেয়ার করি। যত তাড়াতাড়ি আনবেন, তত ভালো চান্স। ফোন চালে দেবেন না - এটা মিথ!' : 'Yes, we repair water damage. The sooner you bring it, the better the chances. Do not put your phone in rice - that is a myth!'
    },
    {
      question: i18n.language === 'hi' ? 'Battery kitne din chalti hai replacement ke baad?' : i18n.language === 'bn' ? 'রিপ্লেসমেন্টের পর ব্যাটারি কত দিন চলে?' : 'How long does the battery last after replacement?',
      answer: i18n.language === 'hi' ? 'New battery se phone naye jaisa performance deta hai. Average 2-3 saal tak achhi battery life milti hai proper usage ke saath.' : i18n.language === 'bn' ? 'নতুন ব্যাটারিতে ফোন নতুনের মতো পারফর্ম করে। সঠিক ব্যবহারে গড়ে ২-৩ বছর ভালো ব্যাটারি লাইফ পাবেন।' : 'A new battery gives your phone like-new performance. Average battery life is 2-3 years with proper usage.'
    },
    {
      question: i18n.language === 'hi' ? 'Kya broken phone se data recover ho sakta hai?' : i18n.language === 'bn' ? 'ভাঙা ফোন থেকে ডেটা রিকভার হয়?' : 'Can you recover data from a broken phone?',
      answer: i18n.language === 'hi' ? 'Haan, zyada tar cases mein hum broken phone se data recover kar sakte hain. Screen damage, water damage, ya dead phone - sab se try karte hain.' : i18n.language === 'bn' ? 'হ্যাঁ, বেশিরভাগ ক্ষেত্রে আমরা ভাঙা ফোন থেকে ডেটা রিকভার করতে পারি। স্ক্রিন ড্যামেজ, ওয়াটার ড্যামেজ, বা ডেড ফোন - সব থেকে চেষ্টা করি।' : 'Yes, in most cases we can recover data from broken phones. Screen damage, water damage, or dead phone - we try from all.'
    },
    {
      question: i18n.language === 'hi' ? 'iPhone repair karte ho?' : i18n.language === 'bn' ? 'আইফোন মেরামত করেন?' : 'Do you repair iPhones?',
      answer: i18n.language === 'hi' ? 'Haan! Hum sabhi iPhone models repair karte hain - iPhone 6 se lekar latest models tak. Screen, battery, charging port, camera - sab fix karte hain.' : i18n.language === 'bn' ? 'হ্যাঁ! আমরা সব আইফোন মডেল মেরামত করি - iPhone 6 থেকে লেটেস্ট মডেল পর্যন্ত। স্ক্রিন, ব্যাটারি, চার্জিং পোর্ট, ক্যামেরা - সব ঠিক করি।' : 'Yes! We repair all iPhone models - from iPhone 6 to latest models. Screen, battery, charging port, camera - we fix everything.'
    },
    {
      question: i18n.language === 'hi' ? 'Charging port kharab hai, repair hoga?' : i18n.language === 'bn' ? 'চার্জিং পোর্ট খারাপ, মেরামত হবে?' : 'My charging port is damaged, can it be repaired?',
      answer: i18n.language === 'hi' ? 'Haan! Charging port repair ya replacement 30 minutes se 2 ghante mein ho jaata hai. Pehle cleaning try karte hain, agar kaam na kare to replace karte hain.' : i18n.language === 'bn' ? 'হ্যাঁ! চার্জিং পোর্ট মেরামত বা রিপ্লেসমেন্ট ৩০ মিনিট থেকে ২ ঘণ্টায় হয়ে যায়। প্রথমে ক্লিনিং ট্রাই করি, কাজ না হলে রিপ্লেস করি।' : 'Yes! Charging port repair or replacement takes 30 minutes to 2 hours. We first try cleaning, if that does not work we replace it.'
    },
    {
      question: i18n.language === 'hi' ? 'Phone ki touch kaam nahi kar rahi, screen theek hai' : i18n.language === 'bn' ? 'ফোনের টাচ কাজ করছে না, স্ক্রিন ঠিক আছে' : 'Touch is not working but screen looks fine',
      answer: i18n.language === 'hi' ? 'Ye digitizer issue ho sakta hai. Kabhi kabhi sirf digitizer replace karna padta hai, kabhi puri display. Hum diagnose karke batayenge exact problem.' : i18n.language === 'bn' ? 'এটা ডিজিটাইজার ইস্যু হতে পারে। কখনো শুধু ডিজিটাইজার রিপ্লেস করতে হয়, কখনো পুরো ডিসপ্লে। আমরা ডায়াগনোস করে সঠিক সমস্যা বলব।' : 'This could be a digitizer issue. Sometimes only digitizer needs replacement, sometimes the whole display. We will diagnose and tell you the exact problem.'
    },
    {
      question: i18n.language === 'hi' ? 'Phone bahut garam ho raha hai' : i18n.language === 'bn' ? 'ফোন অনেক গরম হচ্ছে' : 'My phone is overheating',
      answer: i18n.language === 'hi' ? 'Overheating ke kai reasons ho sakte hain - battery issue, software problem, ya internal damage. Free diagnosis mein exact cause pata chalega aur solution batayenge.' : i18n.language === 'bn' ? 'ওভারহিটিংয়ের অনেক কারণ হতে পারে - ব্যাটারি ইস্যু, সফটওয়্যার সমস্যা, বা ইন্টারনাল ড্যামেজ। ফ্রি ডায়াগনোসিসে সঠিক কারণ জানাব এবং সমাধান বলব।' : 'Overheating can have many reasons - battery issue, software problem, or internal damage. Free diagnosis will reveal the exact cause and we will suggest the solution.'
    },
    {
      question: i18n.language === 'hi' ? 'Speaker ya mic kaam nahi kar raha' : i18n.language === 'bn' ? 'স্পিকার বা মাইক কাজ করছে না' : 'Speaker or microphone not working',
      answer: i18n.language === 'hi' ? 'Speaker aur mic repair karte hain. Kabhi kabhi sirf cleaning se theek ho jaata hai, kabhi replacement chahiye. 1-2 ghante mein fix ho jaata hai.' : i18n.language === 'bn' ? 'স্পিকার এবং মাইক মেরামত করি। কখনো শুধু ক্লিনিং করলেই ঠিক হয়ে যায়, কখনো রিপ্লেসমেন্ট লাগে। ১-২ ঘণ্টায় ঠিক হয়ে যায়।' : 'We repair speakers and mics. Sometimes just cleaning fixes it, sometimes replacement is needed. Usually fixed in 1-2 hours.'
    },
    {
      question: i18n.language === 'hi' ? 'Camera blur aa raha hai' : i18n.language === 'bn' ? 'ক্যামেরা ব্লার আসছে' : 'Camera is blurry',
      answer: i18n.language === 'hi' ? 'Camera blur lens damage, focus issue, ya software problem ho sakta hai. Pehle cleaning aur software check karte hain. Agar hardware issue hai to camera module replace karte hain.' : i18n.language === 'bn' ? 'ক্যামেরা ব্লার লেন্স ড্যামেজ, ফোকাস ইস্যু, বা সফটওয়্যার সমস্যা হতে পারে। প্রথমে ক্লিনিং এবং সফটওয়্যার চেক করি। হার্ডওয়্যার ইস্যু হলে ক্যামেরা মডিউল রিপ্লেস করি।' : 'Camera blur can be lens damage, focus issue, or software problem. We first try cleaning and software check. If it is a hardware issue, we replace the camera module.'
    }
  ]

  const pcLaptopFAQs: FAQItem[] = [
    {
      question: i18n.language === 'hi' ? 'Laptop on nahi ho raha' : i18n.language === 'bn' ? 'ল্যাপটপ অন হচ্ছে না' : 'Laptop is not turning on',
      answer: i18n.language === 'hi' ? 'Ye power issue, battery problem, ya motherboard fault ho sakta hai. Hum free diagnosis karke exact problem batayenge. Zyada tar cases mein repair possible hai.' : i18n.language === 'bn' ? 'এটা পাওয়ার ইস্যু, ব্যাটারি সমস্যা, বা মাদারবোর্ড ফল্ট হতে পারে। আমরা ফ্রি ডায়াগনোসিস করে সঠিক সমস্যা বলব। বেশিরভাগ ক্ষেত্রে মেরামত সম্ভব।' : 'This could be a power issue, battery problem, or motherboard fault. We will do free diagnosis and tell you the exact problem. Repair is possible in most cases.'
    },
    {
      question: i18n.language === 'hi' ? 'Blue screen error aa raha hai' : i18n.language === 'bn' ? 'ব্লু স্ক্রিন এরর আসছে' : 'Getting blue screen errors',
      answer: i18n.language === 'hi' ? 'Blue screen (BSOD) RAM issue, hard drive failure, driver problem, ya overheating se ho sakta hai. Hum diagnose karke root cause fix karte hain.' : i18n.language === 'bn' ? 'ব্লু স্ক্রিন (BSOD) RAM ইস্যু, হার্ড ড্রাইভ ফেইলিওর, ড্রাইভার সমস্যা, বা ওভারহিটিং থেকে হতে পারে। আমরা ডায়াগনোস করে রুট কজ ঠিক করি।' : 'Blue screen (BSOD) can be caused by RAM issue, hard drive failure, driver problem, or overheating. We diagnose and fix the root cause.'
    },
    {
      question: i18n.language === 'hi' ? 'Laptop bahut slow ho gaya hai' : i18n.language === 'bn' ? 'ল্যাপটপ অনেক স্লো হয়ে গেছে' : 'Laptop has become very slow',
      answer: i18n.language === 'hi' ? 'Slow laptop ke kai reasons - virus, full hard drive, kam RAM, ya old HDD. SSD upgrade se laptop naye jaisa fast ho jaata hai. RAM upgrade bhi help karta hai.' : i18n.language === 'bn' ? 'স্লো ল্যাপটপের অনেক কারণ - ভাইরাস, ফুল হার্ড ড্রাইভ, কম RAM, বা পুরানো HDD। SSD আপগ্রেডে ল্যাপটপ নতুনের মতো ফাস্ট হয়ে যায়। RAM আপগ্রেডও হেল্প করে।' : 'Slow laptop can have many reasons - virus, full hard drive, low RAM, or old HDD. SSD upgrade makes laptop fast like new. RAM upgrade also helps.'
    },
    {
      question: i18n.language === 'hi' ? 'Virus remove karte ho?' : i18n.language === 'bn' ? 'ভাইরাস রিমুভ করেন?' : 'Do you remove viruses?',
      answer: i18n.language === 'hi' ? 'Haan! Virus, malware, ransomware - sab remove karte hain. Data safe rakhte hue system clean karte hain. Antivirus bhi install kar dete hain.' : i18n.language === 'bn' ? 'হ্যাঁ! ভাইরাস, ম্যালওয়্যার, র‍্যানসমওয়্যার - সব রিমুভ করি। ডেটা সেফ রেখে সিস্টেম ক্লিন করি। অ্যান্টিভাইরাসও ইনস্টল করে দিই।' : 'Yes! We remove viruses, malware, ransomware - everything. We clean the system while keeping your data safe. We also install antivirus.'
    },
    {
      question: i18n.language === 'hi' ? 'HDD se SSD upgrade kitne ka padega?' : i18n.language === 'bn' ? 'HDD থেকে SSD আপগ্রেড কত পড়বে?' : 'How much does HDD to SSD upgrade cost?',
      answer: i18n.language === 'hi' ? 'SSD upgrade cost SSD capacity pe depend karta hai. 256GB se 1TB tak options hain. Purana data bhi transfer kar dete hain. Laptop 5-10x fast ho jaata hai!' : i18n.language === 'bn' ? 'SSD আপগ্রেড খরচ SSD ক্যাপাসিটির উপর নির্ভর করে। 256GB থেকে 1TB পর্যন্ত অপশন আছে। পুরানো ডেটাও ট্রান্সফার করে দিই। ল্যাপটপ ৫-১০ গুণ ফাস্ট হয়ে যায়!' : 'SSD upgrade cost depends on SSD capacity. Options from 256GB to 1TB. We also transfer your old data. Laptop becomes 5-10x faster!'
    },
    {
      question: i18n.language === 'hi' ? 'RAM upgrade kar sakte ho?' : i18n.language === 'bn' ? 'RAM আপগ্রেড করতে পারেন?' : 'Can you upgrade RAM?',
      answer: i18n.language === 'hi' ? 'Haan! Zyada tar laptops mein RAM upgrade possible hai. 4GB se 8GB ya 16GB upgrade se multitasking smooth ho jaati hai. Pehle compatibility check karte hain.' : i18n.language === 'bn' ? 'হ্যাঁ! বেশিরভাগ ল্যাপটপে RAM আপগ্রেড সম্ভব। 4GB থেকে 8GB বা 16GB আপগ্রেডে মাল্টিটাস্কিং স্মুথ হয়ে যায়। প্রথমে কম্প্যাটিবিলিটি চেক করি।' : 'Yes! RAM upgrade is possible in most laptops. Upgrading from 4GB to 8GB or 16GB makes multitasking smooth. We first check compatibility.'
    },
    {
      question: i18n.language === 'hi' ? 'Laptop keyboard kharab hai' : i18n.language === 'bn' ? 'ল্যাপটপ কীবোর্ড খারাপ' : 'Laptop keyboard is not working',
      answer: i18n.language === 'hi' ? 'Keyboard replacement karte hain. Kuch keys kharab hain ya pura keyboard - dono fix karte hain. 2-4 ghante mein ho jaata hai. External keyboard bhi recommend kar sakte hain.' : i18n.language === 'bn' ? 'কীবোর্ড রিপ্লেসমেন্ট করি। কিছু কী খারাপ বা পুরো কীবোর্ড - দুটোই ঠিক করি। ২-৪ ঘণ্টায় হয়ে যায়। এক্সটার্নাল কীবোর্ডও রিকমেন্ড করতে পারি।' : 'We do keyboard replacement. Some keys not working or whole keyboard - we fix both. Done in 2-4 hours. We can also recommend external keyboard.'
    },
    {
      question: i18n.language === 'hi' ? 'Laptop screen crack ho gayi' : i18n.language === 'bn' ? 'ল্যাপটপ স্ক্রিন ক্র্যাক হয়ে গেছে' : 'Laptop screen is cracked',
      answer: i18n.language === 'hi' ? 'Laptop screen replacement karte hain. Original aur compatible dono options available hain. Same day ya next day delivery. Touch screen laptops bhi repair karte hain.' : i18n.language === 'bn' ? 'ল্যাপটপ স্ক্রিন রিপ্লেসমেন্ট করি। অরিজিনাল এবং কম্প্যাটিবল দুটো অপশন আছে। সেম ডে বা নেক্সট ডে ডেলিভারি। টাচ স্ক্রিন ল্যাপটপও মেরামত করি।' : 'We do laptop screen replacement. Both original and compatible options available. Same day or next day delivery. We also repair touch screen laptops.'
    },
    {
      question: i18n.language === 'hi' ? 'Motherboard repair hota hai?' : i18n.language === 'bn' ? 'মাদারবোর্ড মেরামত হয়?' : 'Do you repair motherboards?',
      answer: i18n.language === 'hi' ? 'Haan! Motherboard chip level repair karte hain. Power issue, no display, USB ports not working - sab fix karte hain. Replacement se sasta padta hai.' : i18n.language === 'bn' ? 'হ্যাঁ! মাদারবোর্ড চিপ লেভেল মেরামত করি। পাওয়ার ইস্যু, নো ডিসপ্লে, USB পোর্ট কাজ না করা - সব ঠিক করি। রিপ্লেসমেন্টের চেয়ে সস্তা পড়ে।' : 'Yes! We do motherboard chip level repair. Power issue, no display, USB ports not working - we fix everything. Cheaper than replacement.'
    },
    {
      question: i18n.language === 'hi' ? 'Windows install karte ho?' : i18n.language === 'bn' ? 'উইন্ডোজ ইনস্টল করেন?' : 'Do you install Windows?',
      answer: i18n.language === 'hi' ? 'Haan! Windows 10, 11 install karte hain. Genuine license ke saath. Purana data backup karke fresh install karte hain. Drivers aur basic software bhi install kar dete hain.' : i18n.language === 'bn' ? 'হ্যাঁ! Windows 10, 11 ইনস্টল করি। জেনুইন লাইসেন্স সহ। পুরানো ডেটা ব্যাকআপ করে ফ্রেশ ইনস্টল করি। ড্রাইভার এবং বেসিক সফটওয়্যারও ইনস্টল করে দিই।' : 'Yes! We install Windows 10, 11 with genuine license. We backup old data and do fresh install. We also install drivers and basic software.'
    },
    {
      question: i18n.language === 'hi' ? 'Laptop overheating ho raha hai' : i18n.language === 'bn' ? 'ল্যাপটপ ওভারহিটিং হচ্ছে' : 'Laptop is overheating',
      answer: i18n.language === 'hi' ? 'Overheating usually dust accumulation ya thermal paste dry hone se hota hai. Hum internal cleaning karte hain aur thermal paste replace karte hain. Fan bhi check karte hain.' : i18n.language === 'bn' ? 'ওভারহিটিং সাধারণত ধুলো জমা বা থার্মাল পেস্ট শুকিয়ে যাওয়ায় হয়। আমরা ইন্টারনাল ক্লিনিং করি এবং থার্মাল পেস্ট রিপ্লেস করি। ফ্যানও চেক করি।' : 'Overheating usually happens due to dust accumulation or dried thermal paste. We do internal cleaning and replace thermal paste. We also check the fan.'
    },
    {
      question: i18n.language === 'hi' ? 'Data recovery crashed hard drive se' : i18n.language === 'bn' ? 'ক্র্যাশড হার্ড ড্রাইভ থেকে ডেটা রিকভারি' : 'Data recovery from crashed hard drive',
      answer: i18n.language === 'hi' ? 'Haan! Crashed, corrupted, ya formatted hard drive se data recovery karte hain. Success rate 80-90% hai. Pehle free assessment karte hain.' : i18n.language === 'bn' ? 'হ্যাঁ! ক্র্যাশড, করাপ্টেড, বা ফরম্যাটেড হার্ড ড্রাইভ থেকে ডেটা রিকভারি করি। সাকসেস রেট ৮০-৯০%। প্রথমে ফ্রি অ্যাসেসমেন্ট করি।' : 'Yes! We recover data from crashed, corrupted, or formatted hard drives. Success rate is 80-90%. We do free assessment first.'
    }
  ]

  const paymentFAQs: FAQItem[] = [
    {
      question: i18n.language === 'hi' ? 'Payment ke kya options hain?' : i18n.language === 'bn' ? 'পেমেন্টের কী অপশন আছে?' : 'What payment options do you accept?',
      answer: i18n.language === 'hi' ? 'Cash, UPI (GPay, PhonePe, Paytm), Credit Card, Debit Card, Net Banking - sab accept karte hain. Jo aapko convenient lage.' : i18n.language === 'bn' ? 'ক্যাশ, UPI (GPay, PhonePe, Paytm), ক্রেডিট কার্ড, ডেবিট কার্ড, নেট ব্যাংকিং - সব গ্রহণ করি। যেটা আপনার সুবিধা।' : 'We accept Cash, UPI (GPay, PhonePe, Paytm), Credit Card, Debit Card, Net Banking - whatever is convenient for you.'
    },
    {
      question: i18n.language === 'hi' ? 'Advance payment dena padega?' : i18n.language === 'bn' ? 'অ্যাডভান্স পেমেন্ট দিতে হবে?' : 'Do I need to pay in advance?',
      answer: i18n.language === 'hi' ? 'Normal repairs ke liye advance nahi chahiye. Sirf parts order karne ke liye 50% advance lete hain. Baaki delivery ke time.' : i18n.language === 'bn' ? 'সাধারণ মেরামতের জন্য অ্যাডভান্স লাগে না। শুধু পার্টস অর্ডার করার জন্য ৫০% অ্যাডভান্স নিই। বাকি ডেলিভারির সময়।' : 'No advance needed for normal repairs. Only 50% advance for ordering parts. Rest at delivery time.'
    },
    {
      question: i18n.language === 'hi' ? 'EMI available hai?' : i18n.language === 'bn' ? 'EMI আছে?' : 'Is EMI available?',
      answer: i18n.language === 'hi' ? 'Haan! Credit card pe EMI available hai ₹3000 se upar ke repairs pe. No cost EMI bhi available hai select cards pe.' : i18n.language === 'bn' ? 'হ্যাঁ! ক্রেডিট কার্ডে EMI আছে ₹৩০০০ এর উপরে মেরামতে। নো কস্ট EMI-ও আছে সিলেক্ট কার্ডে।' : 'Yes! Credit card EMI available for repairs above ₹3000. No cost EMI also available on select cards.'
    },
    {
      question: i18n.language === 'hi' ? 'GST bill milega?' : i18n.language === 'bn' ? 'GST বিল পাব?' : 'Will I get GST invoice?',
      answer: i18n.language === 'hi' ? 'Haan! Sabhi repairs pe proper GST invoice milta hai. Company reimbursement ke liye bhi valid hai.' : i18n.language === 'bn' ? 'হ্যাঁ! সব মেরামতে প্রপার GST ইনভয়েস পাবেন। কোম্পানি রিইম্বার্সমেন্টের জন্যও ভ্যালিড।' : 'Yes! Proper GST invoice provided for all repairs. Valid for company reimbursement too.'
    },
    {
      question: i18n.language === 'hi' ? 'Refund policy kya hai?' : i18n.language === 'bn' ? 'রিফান্ড পলিসি কী?' : 'What is your refund policy?',
      answer: i18n.language === 'hi' ? 'Agar repair successful nahi hua, to sirf diagnosis charge lagega. Parts ke liye refund nahi milta agar already install ho gaye. Unused parts return kar sakte ho.' : i18n.language === 'bn' ? 'মেরামত সফল না হলে শুধু ডায়াগনোসিস চার্জ লাগবে। পার্টস ইনস্টল হয়ে গেলে রিফান্ড নেই। অব্যবহৃত পার্টস রিটার্ন করতে পারবেন।' : 'If repair is not successful, only diagnosis charge applies. No refund for parts already installed. Unused parts can be returned.'
    },
    {
      question: i18n.language === 'hi' ? 'Online payment safe hai?' : i18n.language === 'bn' ? 'অনলাইন পেমেন্ট সেফ?' : 'Is online payment safe?',
      answer: i18n.language === 'hi' ? 'Bilkul safe hai! Hum Razorpay use karte hain jo India ka trusted payment gateway hai. Aapki card details humare paas nahi aati.' : i18n.language === 'bn' ? 'সম্পূর্ণ সেফ! আমরা Razorpay ব্যবহার করি যা ভারতের বিশ্বস্ত পেমেন্ট গেটওয়ে। আপনার কার্ড ডিটেইলস আমাদের কাছে আসে না।' : 'Completely safe! We use Razorpay which is India\'s trusted payment gateway. Your card details never come to us.'
    }
  ]

  const warrantyFAQs: FAQItem[] = [
    {
      question: i18n.language === 'hi' ? 'Warranty kitne din ki hai?' : i18n.language === 'bn' ? 'ওয়ারেন্টি কত দিনের?' : 'What is the warranty period?',
      answer: i18n.language === 'hi' ? 'Sabhi repairs pe 90 din ki service warranty. Parts pe manufacturer warranty alag se - usually 6 months to 1 year.' : i18n.language === 'bn' ? 'সব মেরামতে ৯০ দিনের সার্ভিস ওয়ারেন্টি। পার্টসে ম্যানুফ্যাকচারার ওয়ারেন্টি আলাদা - সাধারণত ৬ মাস থেকে ১ বছর।' : 'All repairs have 90-day service warranty. Parts have separate manufacturer warranty - usually 6 months to 1 year.'
    },
    {
      question: i18n.language === 'hi' ? 'Warranty mein kya cover hota hai?' : i18n.language === 'bn' ? 'ওয়ারেন্টিতে কী কভার হয়?' : 'What is covered under warranty?',
      answer: i18n.language === 'hi' ? 'Same issue dobara aaye to free repair. Parts defect bhi cover hai. Labor charges bhi nahi lagte warranty period mein.' : i18n.language === 'bn' ? 'একই সমস্যা আবার হলে ফ্রি মেরামত। পার্টস ডিফেক্টও কভার। ওয়ারেন্টি পিরিয়ডে লেবার চার্জও লাগে না।' : 'Free repair if same issue occurs again. Parts defect also covered. No labor charges during warranty period.'
    },
    {
      question: i18n.language === 'hi' ? 'Warranty mein kya cover nahi hota?' : i18n.language === 'bn' ? 'ওয়ারেন্টিতে কী কভার হয় না?' : 'What is not covered under warranty?',
      answer: i18n.language === 'hi' ? 'Physical damage, water damage, unauthorized repair, ya misuse se hone wali problems warranty mein cover nahi hoti.' : i18n.language === 'bn' ? 'ফিজিক্যাল ড্যামেজ, ওয়াটার ড্যামেজ, আনঅথরাইজড মেরামত, বা অপব্যবহারে হওয়া সমস্যা ওয়ারেন্টিতে কভার হয় না।' : 'Physical damage, water damage, unauthorized repair, or problems due to misuse are not covered under warranty.'
    },
    {
      question: i18n.language === 'hi' ? 'Warranty claim kaise karu?' : i18n.language === 'bn' ? 'ওয়ারেন্টি ক্লেম কীভাবে করব?' : 'How do I claim warranty?',
      answer: i18n.language === 'hi' ? 'Job card aur bill lekar aao. Hum device check karenge aur agar warranty valid hai to free mein fix karenge. Usually same day ho jaata hai.' : i18n.language === 'bn' ? 'জব কার্ড এবং বিল নিয়ে আসুন। আমরা ডিভাইস চেক করব এবং ওয়ারেন্টি ভ্যালিড হলে ফ্রিতে ঠিক করব। সাধারণত সেম ডে হয়ে যায়।' : 'Bring your job card and bill. We will check the device and fix it free if warranty is valid. Usually done same day.'
    },
    {
      question: i18n.language === 'hi' ? 'Compatible parts pe warranty hai?' : i18n.language === 'bn' ? 'কম্প্যাটিবল পার্টসে ওয়ারেন্টি আছে?' : 'Is there warranty on compatible parts?',
      answer: i18n.language === 'hi' ? 'Haan! Compatible parts pe bhi 90 din ki warranty milti hai. Quality same hoti hai, sirf brand different hota hai.' : i18n.language === 'bn' ? 'হ্যাঁ! কম্প্যাটিবল পার্টসেও ৯০ দিনের ওয়ারেন্টি পাবেন। কোয়ালিটি একই, শুধু ব্র্যান্ড আলাদা।' : 'Yes! Compatible parts also have 90-day warranty. Quality is same, only brand is different.'
    },
    {
      question: i18n.language === 'hi' ? 'Kya parts return kar sakte hain?' : i18n.language === 'bn' ? 'পার্টস রিটার্ন করা যায়?' : 'Can I return parts?',
      answer: i18n.language === 'hi' ? 'Install hone se pehle parts return kar sakte ho. Install ke baad sirf defective parts exchange hote hain warranty ke under.' : i18n.language === 'bn' ? 'ইনস্টল হওয়ার আগে পার্টস রিটার্ন করতে পারবেন। ইনস্টলের পর শুধু ডিফেক্টিভ পার্টস এক্সচেঞ্জ হয় ওয়ারেন্টির আন্ডারে।' : 'Parts can be returned before installation. After installation, only defective parts are exchanged under warranty.'
    }
  ]

  const pickupDeliveryFAQs: FAQItem[] = [
    {
      question: i18n.language === 'hi' ? 'Home pickup free hai?' : i18n.language === 'bn' ? 'হোম পিকআপ ফ্রি?' : 'Is home pickup free?',
      answer: i18n.language === 'hi' ? '5km ke andar free pickup aur delivery. Usse door ke liye ₹50-100 charge hai distance ke hisaab se.' : i18n.language === 'bn' ? '৫ কিমির মধ্যে ফ্রি পিকআপ এবং ডেলিভারি। এর বাইরে দূরত্ব অনুযায়ী ₹৫০-১০০ চার্জ।' : 'Free pickup and delivery within 5km. ₹50-100 charge for farther distances based on location.'
    },
    {
      question: i18n.language === 'hi' ? 'Pickup kaise schedule karu?' : i18n.language === 'bn' ? 'পিকআপ কীভাবে শিডিউল করব?' : 'How do I schedule pickup?',
      answer: i18n.language === 'hi' ? 'Call ya WhatsApp karo +91 7003888936 pe. Address aur convenient time batao. Hum aapke time pe aa jayenge.' : i18n.language === 'bn' ? 'কল বা হোয়াটসঅ্যাপ করুন +91 7003888936 এ। ঠিকানা এবং সুবিধাজনক সময় বলুন। আমরা আপনার সময়ে চলে আসব।' : 'Call or WhatsApp us at +91 7003888936. Tell us your address and convenient time. We will come at your preferred time.'
    },
    {
      question: i18n.language === 'hi' ? 'Kaunse areas mein service dete ho?' : i18n.language === 'bn' ? 'কোন এলাকায় সার্ভিস দেন?' : 'Which areas do you serve?',
      answer: i18n.language === 'hi' ? 'Barrackpore aur aas paas ke areas - Titagarh, Khardah, Sodepur, Baranagar, Dumdum, Belgharia, Kamarhati. Kolkata bhi cover karte hain.' : i18n.language === 'bn' ? 'ব্যারাকপুর এবং আশেপাশের এলাকা - টিটাগড়, খড়দা, সোদপুর, বরানগর, দমদম, বেলঘরিয়া, কামারহাটি। কলকাতাও কভার করি।' : 'Barrackpore and nearby areas - Titagarh, Khardah, Sodepur, Baranagar, Dumdum, Belgharia, Kamarhati. We also cover Kolkata.'
    },
    {
      question: i18n.language === 'hi' ? 'Same day pickup milta hai?' : i18n.language === 'bn' ? 'সেম ডে পিকআপ পাওয়া যায়?' : 'Is same day pickup available?',
      answer: i18n.language === 'hi' ? 'Haan! Subah 12 baje se pehle book karo to same day pickup. Baad mein book karo to next day morning.' : i18n.language === 'bn' ? 'হ্যাঁ! সকাল ১২টার আগে বুক করলে সেম ডে পিকআপ। পরে বুক করলে নেক্সট ডে মর্নিং।' : 'Yes! Book before 12 PM for same day pickup. Book later for next day morning pickup.'
    },
    {
      question: i18n.language === 'hi' ? 'Delivery ke time payment kar sakte hain?' : i18n.language === 'bn' ? 'ডেলিভারির সময় পেমেন্ট করা যায়?' : 'Can I pay at delivery?',
      answer: i18n.language === 'hi' ? 'Haan! Cash on delivery available hai. UPI se bhi delivery ke time pay kar sakte ho.' : i18n.language === 'bn' ? 'হ্যাঁ! ক্যাশ অন ডেলিভারি আছে। UPI দিয়েও ডেলিভারির সময় পে করতে পারবেন।' : 'Yes! Cash on delivery available. You can also pay via UPI at delivery time.'
    },
    {
      question: i18n.language === 'hi' ? 'Device safe rahega pickup mein?' : i18n.language === 'bn' ? 'পিকআপে ডিভাইস সেফ থাকবে?' : 'Is my device safe during pickup?',
      answer: i18n.language === 'hi' ? 'Bilkul! Pickup ke time proper receipt milegi. Device insured hai transit mein. Careful handling guarantee.' : i18n.language === 'bn' ? 'অবশ্যই! পিকআপের সময় প্রপার রিসিট পাবেন। ট্রানজিটে ডিভাইস ইনশিওর্ড। কেয়ারফুল হ্যান্ডলিং গ্যারান্টি।' : 'Absolutely! You will get proper receipt at pickup. Device is insured during transit. Careful handling guaranteed.'
    }
  ]

  const digitalServicesFAQs: FAQItem[] = [
    {
      question: i18n.language === 'hi' ? 'Website banane mein kitna kharcha aata hai?' : i18n.language === 'bn' ? 'ওয়েবসাইট বানাতে কত খরচ?' : 'How much does website development cost?',
      answer: i18n.language === 'hi' ? 'Basic website ₹5,000 se start hoti hai. E-commerce ya custom features ke saath ₹15,000-50,000. Free consultation mein exact quote dete hain.' : i18n.language === 'bn' ? 'বেসিক ওয়েবসাইট ₹৫,০০০ থেকে শুরু। ই-কমার্স বা কাস্টম ফিচার সহ ₹১৫,০০০-৫০,০০০। ফ্রি কনসালটেশনে সঠিক কোট দিই।' : 'Basic website starts from ₹5,000. With e-commerce or custom features ₹15,000-50,000. We give exact quote in free consultation.'
    },
    {
      question: i18n.language === 'hi' ? 'Website kitne din mein ban jaati hai?' : i18n.language === 'bn' ? 'ওয়েবসাইট কত দিনে তৈরি হয়?' : 'How long does it take to build a website?',
      answer: i18n.language === 'hi' ? 'Simple website 3-5 din mein. E-commerce 1-2 weeks. Custom web app 2-4 weeks. Timeline project complexity pe depend karta hai.' : i18n.language === 'bn' ? 'সিম্পল ওয়েবসাইট ৩-৫ দিনে। ই-কমার্স ১-২ সপ্তাহ। কাস্টম ওয়েব অ্যাপ ২-৪ সপ্তাহ। টাইমলাইন প্রজেক্ট কমপ্লেক্সিটির উপর নির্ভর করে।' : 'Simple website in 3-5 days. E-commerce in 1-2 weeks. Custom web app in 2-4 weeks. Timeline depends on project complexity.'
    },
    {
      question: i18n.language === 'hi' ? 'Hosting aur domain bhi dete ho?' : i18n.language === 'bn' ? 'হোস্টিং এবং ডোমেইনও দেন?' : 'Do you provide hosting and domain?',
      answer: i18n.language === 'hi' ? 'Haan! Domain registration aur hosting dono provide karte hain. First year free hosting bhi available hai kuch packages mein.' : i18n.language === 'bn' ? 'হ্যাঁ! ডোমেইন রেজিস্ট্রেশন এবং হোস্টিং দুটোই প্রোভাইড করি। কিছু প্যাকেজে প্রথম বছর ফ্রি হোস্টিং আছে।' : 'Yes! We provide both domain registration and hosting. First year free hosting available in some packages.'
    },
    {
      question: i18n.language === 'hi' ? 'SEO services dete ho?' : i18n.language === 'bn' ? 'SEO সার্ভিস দেন?' : 'Do you offer SEO services?',
      answer: i18n.language === 'hi' ? 'Haan! On-page SEO, local SEO, aur Google My Business optimization karte hain. Monthly SEO packages bhi available hain.' : i18n.language === 'bn' ? 'হ্যাঁ! অন-পেজ SEO, লোকাল SEO, এবং Google My Business অপ্টিমাইজেশন করি। মাসিক SEO প্যাকেজও আছে।' : 'Yes! We do on-page SEO, local SEO, and Google My Business optimization. Monthly SEO packages also available.'
    },
    {
      question: i18n.language === 'hi' ? 'Social media marketing karte ho?' : i18n.language === 'bn' ? 'সোশ্যাল মিডিয়া মার্কেটিং করেন?' : 'Do you do social media marketing?',
      answer: i18n.language === 'hi' ? 'Haan! Facebook, Instagram, Google Ads - sab manage karte hain. Content creation, posting, aur ad campaigns sab included.' : i18n.language === 'bn' ? 'হ্যাঁ! Facebook, Instagram, Google Ads - সব ম্যানেজ করি। কন্টেন্ট ক্রিয়েশন, পোস্টিং, এবং অ্যাড ক্যাম্পেইন সব ইনক্লুডেড।' : 'Yes! We manage Facebook, Instagram, Google Ads - everything. Content creation, posting, and ad campaigns all included.'
    },
    {
      question: i18n.language === 'hi' ? 'Website maintenance karte ho?' : i18n.language === 'bn' ? 'ওয়েবসাইট মেইনটেন্যান্স করেন?' : 'Do you provide website maintenance?',
      answer: i18n.language === 'hi' ? 'Haan! Monthly maintenance packages available hain. Updates, security, backups, aur minor changes sab cover hota hai.' : i18n.language === 'bn' ? 'হ্যাঁ! মাসিক মেইনটেন্যান্স প্যাকেজ আছে। আপডেট, সিকিউরিটি, ব্যাকআপ, এবং মাইনর চেঞ্জ সব কভার হয়।' : 'Yes! Monthly maintenance packages available. Updates, security, backups, and minor changes all covered.'
      }
    ]

      // Filter FAQs based on search query
      const filterFAQs = (faqs: FAQItem[]) => {
        if (!searchQuery.trim()) return faqs
        const query = searchQuery.toLowerCase()
        return faqs.filter(faq => 
          faq.question.toLowerCase().includes(query) || 
          faq.answer.toLowerCase().includes(query)
        )
      }

      const filteredGeneralFAQs = filterFAQs(generalFAQs)
      const filteredMobileRepairFAQs = filterFAQs(mobileRepairFAQs)
      const filteredPcLaptopFAQs = filterFAQs(pcLaptopFAQs)
      const filteredPaymentFAQs = filterFAQs(paymentFAQs)
      const filteredWarrantyFAQs = filterFAQs(warrantyFAQs)
      const filteredPickupDeliveryFAQs = filterFAQs(pickupDeliveryFAQs)
      const filteredDigitalServicesFAQs = filterFAQs(digitalServicesFAQs)

      const hasSearchResults = searchQuery.trim() && (
        filteredGeneralFAQs.length > 0 ||
        filteredMobileRepairFAQs.length > 0 ||
        filteredPcLaptopFAQs.length > 0 ||
        filteredPaymentFAQs.length > 0 ||
        filteredWarrantyFAQs.length > 0 ||
        filteredPickupDeliveryFAQs.length > 0 ||
        filteredDigitalServicesFAQs.length > 0
      )

      const noSearchResults = searchQuery.trim() && !hasSearchResults

    return (
      <PublicLayout>
        {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 overflow-hidden">
        <FloatingParticles count={30} color="white" />
        <FloatingTechIcons variant="light" />
        <div className="container mx-auto px-4 text-center relative z-10">
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
        <div className="container mx-auto px-4 relative z-10">
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
                          onClick={() => scrollToSection(category.sectionId)}
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
        <div className="container mx-auto px-4 relative z-10">
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
                                          {noSearchResults && (
                                            <div className="text-center py-8">
                                              <p className="text-muted-foreground text-lg">
                                                {i18n.language === 'hi' ? 'Koi result nahi mila. Kuch aur search karein.' : 
                                                 i18n.language === 'bn' ? 'কোনো ফলাফল পাওয়া যায়নি। অন্য কিছু সার্চ করুন।' : 
                                                 'No results found. Try searching for something else.'}
                                              </p>
                                            </div>
                                          )}
                                          {filteredGeneralFAQs.length > 0 && (
                                            <FAQAccordion 
                                              items={filteredGeneralFAQs} 
                                              category={i18n.language === 'hi' ? 'General Questions' : i18n.language === 'bn' ? 'সাধারণ প্রশ্ন' : 'General Questions'}
                                              id="faq-general"
                                            />
                                          )}
                                          {filteredMobileRepairFAQs.length > 0 && (
                                            <FAQAccordion 
                                              items={filteredMobileRepairFAQs} 
                                              category={i18n.language === 'hi' ? 'Mobile Repair' : i18n.language === 'bn' ? 'মোবাইল মেরামত' : 'Mobile Repair'}
                                              id="faq-mobile-repair"
                                            />
                                          )}
                                          {filteredPcLaptopFAQs.length > 0 && (
                                            <FAQAccordion 
                                              items={filteredPcLaptopFAQs} 
                                              category={i18n.language === 'hi' ? 'PC/Laptop Repair' : i18n.language === 'bn' ? 'পিসি/ল্যাপটপ মেরামত' : 'PC/Laptop Repair'}
                                              id="faq-pc-laptop"
                                            />
                                          )}
                                          {filteredPaymentFAQs.length > 0 && (
                                            <FAQAccordion 
                                              items={filteredPaymentFAQs} 
                                              category={i18n.language === 'hi' ? 'Payment & Billing' : i18n.language === 'bn' ? 'পেমেন্ট এবং বিলিং' : 'Payment & Billing'}
                                              id="faq-payment"
                                            />
                                          )}
                                          {filteredWarrantyFAQs.length > 0 && (
                                            <FAQAccordion 
                                              items={filteredWarrantyFAQs} 
                                              category={i18n.language === 'hi' ? 'Warranty & Returns' : i18n.language === 'bn' ? 'ওয়ারেন্টি এবং রিটার্ন' : 'Warranty & Returns'}
                                              id="faq-warranty"
                                            />
                                          )}
                                          {filteredPickupDeliveryFAQs.length > 0 && (
                                            <FAQAccordion 
                                              items={filteredPickupDeliveryFAQs} 
                                              category={i18n.language === 'hi' ? 'Pickup & Delivery' : i18n.language === 'bn' ? 'পিকআপ এবং ডেলিভারি' : 'Pickup & Delivery'}
                                              id="faq-pickup-delivery"
                                            />
                                          )}
                                          {filteredDigitalServicesFAQs.length > 0 && (
                                            <FAQAccordion 
                                              items={filteredDigitalServicesFAQs} 
                                              category={i18n.language === 'hi' ? 'Digital Services' : i18n.language === 'bn' ? 'ডিজিটাল সার্ভিস' : 'Digital Services'}
                                              id="faq-digital-services"
                                            />
                                          )}
                                        </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="relative py-16 bg-gradient-to-r from-primary to-purple-600 overflow-hidden">
        <FloatingParticles count={40} color="white" />
        <div className="container mx-auto px-4 text-center relative z-10">
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
                            <a href="https://wa.me/917003888936" target="_blank" rel="noopener noreferrer">
                              <Button size="lg" className="bg-green-500 hover:bg-green-600 text-white">
                                <MessageCircle className="h-5 w-5 mr-2" />
                                WhatsApp
                              </Button>
                            </a>
                            <a href="tel:+917003888936">
                              <Button size="lg" className="bg-white text-slate-800 hover:bg-slate-100 border-0 shadow-lg">
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
