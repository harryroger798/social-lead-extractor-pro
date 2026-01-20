import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { motion } from 'framer-motion'
import { Home, ArrowLeft } from 'lucide-react'

export function NotFoundPage() {
  const { i18n } = useTranslation()

  return (
    <PublicLayout>
      <section className="min-h-[70vh] flex items-center justify-center py-20 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.img 
              src="/images/404-illustration.png" 
              alt="404 - Page Not Found" 
              className="w-full max-w-md mx-auto mb-8"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            />
            
            <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-cyan-500 to-purple-500 bg-clip-text text-transparent mb-4">
              404
            </h1>
            
            <h2 className="text-2xl md:text-3xl font-bold mb-4 dark:text-white">
              {i18n.language === 'hi' ? 'Oops! Page Nahi Mila' :
               i18n.language === 'bn' ? 'উফ! পেজ পাওয়া যায়নি' :
               'Oops! Page Not Found'}
            </h2>
            
            <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
              {i18n.language === 'hi' ? 'Lagta hai ye page kho gaya hai, jaise aapka data backup ke bina!' :
               i18n.language === 'bn' ? 'মনে হচ্ছে এই পেজটা হারিয়ে গেছে, যেমন আপনার ডেটা ব্যাকআপ ছাড়া!' :
               'Looks like this page got lost, just like your data without a backup!'}
            </p>
            
            <p className="text-primary font-medium italic mb-8">
              {i18n.language === 'hi' ? '"Chinta mat karo, hum devices dhundhte hain, pages bhi dhundh lenge!"' :
               i18n.language === 'bn' ? '"চিন্তা করবেন না, আমরা ডিভাইস খুঁজি, পেজও খুঁজে দেব!"' :
               '"Don\'t worry, we find devices, we\'ll find pages too!"'}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/">
                <Button 
                  size="lg" 
                  className="gap-2 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white border-0 shadow-lg shadow-purple-500/25 px-8 py-6 text-lg"
                >
                  <Home className="h-5 w-5" />
                  {i18n.language === 'hi' ? 'Home Jao' :
                   i18n.language === 'bn' ? 'হোমে যান' :
                   'Go Home'}
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => window.history.back()}
                className="gap-2 px-8 py-6 text-lg border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <ArrowLeft className="h-5 w-5" />
                {i18n.language === 'hi' ? 'Peeche Jao' :
                 i18n.language === 'bn' ? 'পিছনে যান' :
                 'Go Back'}
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </PublicLayout>
  )
}
