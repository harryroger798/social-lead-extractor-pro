import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { useToast } from '@/hooks/use-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Clock, CheckCircle, Smartphone, ArrowRight, ArrowLeft, Sparkles, Loader2 } from 'lucide-react'
import { GradientOrbs, FloatingTechIcons, DotGridPattern, FloatingParticles, CircuitPattern, AnimatedLines } from '@/components/ui/visual-enhancements'

const API_BASE_URL = import.meta.env.VITE_API_URL || ''

export function BookingPage() {
  const { t, i18n } = useTranslation()
  const { toast } = useToast()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bookingResult, setBookingResult] = useState<{
    invoice_number: string
    scheduled_date: string
    scheduled_time: string
  } | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    deviceType: '',
    brand: '',
    model: '',
    issue: '',
    date: '',
    time: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      
      const data = await response.json()
      
      if (data.success) {
        setBookingResult({
          invoice_number: data.data.invoice_number,
          scheduled_date: data.data.scheduled_date,
          scheduled_time: data.data.scheduled_time,
        })
        setStep(3)
        toast({
          title: t('public.booking.bookingConfirmed'),
          description: t('public.booking.bookingConfirmedDesc'),
        })
      } else {
        toast({
          title: i18n.language === 'hi' ? 'Error' : i18n.language === 'bn' ? 'ত্রুটি' : 'Error',
          description: data.message || (i18n.language === 'hi' ? 'Booking mein error hua. Phir se try karein.' : i18n.language === 'bn' ? 'বুকিং এ সমস্যা হয়েছে। আবার চেষ্টা করুন।' : 'Failed to create booking. Please try again.'),
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Booking error:', error)
      toast({
        title: i18n.language === 'hi' ? 'Error' : i18n.language === 'bn' ? 'ত্রুটি' : 'Error',
        description: i18n.language === 'hi' ? 'Network error. Phir se try karein.' : i18n.language === 'bn' ? 'নেটওয়ার্ক সমস্যা। আবার চেষ্টা করুন।' : 'Network error. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const timeSlots = [
    '10:00 AM', '11:00 AM', '12:00 PM',
    '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM'
  ]

  const stepLabels = [
    { en: 'Device Info', hi: 'Device Info', bn: 'ডিভাইস তথ্য' },
    { en: 'Schedule', hi: 'Schedule', bn: 'সময়সূচী' },
    { en: 'Confirm', hi: 'Confirm', bn: 'নিশ্চিত' },
  ]

  return (
    <PublicLayout>
            {/* Hero Section */}
            <section className="relative py-16 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 animate-pulse" />
              <FloatingParticles count={30} color="white" />
              <FloatingTechIcons variant="light" />
              <div className="container mx-auto px-4 relative z-10">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center md:text-left"
                  >
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                      {t('public.booking.title')}
                    </h1>
                    <p className="text-xl text-white/80 max-w-2xl mb-4">
                      {t('public.booking.subtitle')}
                    </p>
                    <p className="text-lg text-primary font-medium italic">
                      {i18n.language === 'hi' ? '"Book karo, relax karo, baaki hum dekh lenge!"' :
                       i18n.language === 'bn' ? '"বুক করুন, রিল্যাক্স করুন, বাকিটা আমরা দেখব!"' :
                       '"Book it, relax, we\'ll handle the rest!"'}
                    </p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="hidden md:block"
                  >
                    <img 
                      src="/images/booking-illustration.png" 
                      alt="Book a Repair" 
                      className="w-full max-w-md mx-auto"
                    />
                  </motion.div>
                </div>
              </div>
            </section>

      {/* Booking Form Section */}
      <section className="relative py-16 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 overflow-hidden">
        <GradientOrbs variant="subtle" />
        <DotGridPattern opacity="light" />
        <AnimatedLines color="default" />
        <CircuitPattern variant="default" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl mx-auto">
            {/* Progress Steps */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center mb-10"
            >
              <div className="flex items-center">
                {[1, 2, 3].map((s, index) => (
                  <div key={s} className="flex items-center">
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${
                        step >= s 
                          ? 'bg-gradient-to-br from-cyan-500 to-purple-500 text-white shadow-lg shadow-purple-500/25' 
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {step > s ? <CheckCircle className="h-6 w-6" /> : s}
                    </motion.div>
                    {index < 2 && (
                      <div className={`w-16 md:w-24 h-1 mx-2 rounded transition-all duration-300 ${
                        step > s ? 'bg-gradient-to-r from-cyan-500 to-purple-500' : 'bg-slate-200 dark:bg-slate-700'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Step Labels */}
            <div className="flex justify-between mb-8 px-4">
              {stepLabels.map((label, index) => (
                <span key={index} className={`text-sm font-medium ${
                  step === index + 1 ? 'text-primary' : 'text-muted-foreground'
                }`}>
                  {label[i18n.language as keyof typeof label] || label.en}
                </span>
              ))}
            </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="backdrop-blur-lg bg-white/70 dark:bg-slate-800/70 border border-white/20 dark:border-slate-700/50 rounded-2xl shadow-xl p-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
                    <Smartphone className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold dark:text-white">{t('public.booking.deviceDetails')}</h2>
                    <p className="text-sm text-muted-foreground">{t('public.booking.deviceDetailsDesc')}</p>
                  </div>
                </div>

                <form className="space-y-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="dark:text-white">{t('public.booking.yourName')}</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="bg-white/50 dark:bg-slate-700/50 border-white/20 dark:border-slate-600"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="dark:text-white">{t('public.booking.phoneNumber')}</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                        className="bg-white/50 dark:bg-slate-700/50 border-white/20 dark:border-slate-600"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="dark:text-white">{t('public.booking.email')}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="bg-white/50 dark:bg-slate-700/50 border-white/20 dark:border-slate-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="dark:text-white">{t('public.booking.deviceType')}</Label>
                    <Select
                      value={formData.deviceType}
                      onValueChange={(value) => setFormData({ ...formData, deviceType: value })}
                    >
                      <SelectTrigger className="bg-white/50 dark:bg-slate-700/50 border-white/20 dark:border-slate-600">
                        <SelectValue placeholder={t('public.booking.selectDevice')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="smartphone">{t('public.services.smartphone.title')}</SelectItem>
                        <SelectItem value="laptop">{t('public.services.laptop.title')}</SelectItem>
                        <SelectItem value="tablet">{t('public.services.tablet.title')}</SelectItem>
                        <SelectItem value="desktop">{t('public.services.desktop.title')}</SelectItem>
                        <SelectItem value="smartwatch">{t('public.services.smartwatch.title')}</SelectItem>
                        <SelectItem value="other">{t('common.other')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="brand" className="dark:text-white">{t('public.booking.brand')}</Label>
                      <Input
                        id="brand"
                        value={formData.brand}
                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                        placeholder="Apple, Samsung, etc."
                        className="bg-white/50 dark:bg-slate-700/50 border-white/20 dark:border-slate-600"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="model" className="dark:text-white">{t('public.booking.model')}</Label>
                      <Input
                        id="model"
                        value={formData.model}
                        onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                        placeholder="iPhone 15, Galaxy S24, etc."
                        className="bg-white/50 dark:bg-slate-700/50 border-white/20 dark:border-slate-600"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="issue" className="dark:text-white">{t('public.booking.issueDescription')}</Label>
                    <Textarea
                      id="issue"
                      rows={4}
                      value={formData.issue}
                      onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
                      placeholder={t('public.booking.issuePlaceholder')}
                      required
                      className="bg-white/50 dark:bg-slate-700/50 border-white/20 dark:border-slate-600"
                    />
                  </div>
                  <Button
                    type="button"
                    className="w-full gap-2 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white border-0 shadow-lg shadow-purple-500/25 py-6"
                    onClick={() => setStep(2)}
                    disabled={!formData.name || !formData.phone || !formData.deviceType || !formData.issue}
                  >
                    {t('common.next')}
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </form>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="backdrop-blur-lg bg-white/70 dark:bg-slate-800/70 border border-white/20 dark:border-slate-700/50 rounded-2xl shadow-xl p-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold dark:text-white">{t('public.booking.selectDateTime')}</h2>
                    <p className="text-sm text-muted-foreground">{t('public.booking.selectDateTimeDesc')}</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="date" className="flex items-center gap-2 dark:text-white">
                      <Calendar className="h-4 w-4 text-primary" />
                      {t('public.booking.preferredDate')}
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      required
                      className="bg-white/50 dark:bg-slate-700/50 border-white/20 dark:border-slate-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 dark:text-white">
                      <Clock className="h-4 w-4 text-primary" />
                      {t('public.booking.preferredTime')}
                    </Label>
                    <Select
                      value={formData.time}
                      onValueChange={(value) => setFormData({ ...formData, time: value })}
                    >
                      <SelectTrigger className="bg-white/50 dark:bg-slate-700/50 border-white/20 dark:border-slate-600">
                        <SelectValue placeholder={t('public.booking.selectTime')} />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((slot) => (
                          <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setStep(1)} 
                      className="flex-1 gap-2 py-6"
                    >
                      <ArrowLeft className="h-5 w-5" />
                      {t('common.back')}
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1 gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 shadow-lg shadow-green-500/25 py-6" 
                      disabled={!formData.date || !formData.time || isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          {i18n.language === 'hi' ? 'Processing...' : i18n.language === 'bn' ? 'প্রসেসিং...' : 'Processing...'}
                        </>
                      ) : (
                        <>
                          {t('public.booking.confirmBooking')}
                          <CheckCircle className="h-5 w-5" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="backdrop-blur-lg bg-white/70 dark:bg-slate-800/70 border border-white/20 dark:border-slate-700/50 rounded-2xl shadow-xl p-8 text-center"
              >
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                                  className="mb-6"
                                >
                                  <img 
                                    src="/images/booking-success.png" 
                                    alt="Booking Success" 
                                    className="w-48 h-48 mx-auto object-contain"
                                  />
                                </motion.div>
                <h2 className="text-2xl font-bold mb-2 dark:text-white">{t('public.booking.thankYou')}</h2>
                <p className="text-muted-foreground mb-2">
                  {t('public.booking.confirmationMessage')}
                </p>
                <p className="text-primary font-medium italic mb-6">
                  {i18n.language === 'hi' ? '"Aapka device jaldi theek ho jayega!"' :
                   i18n.language === 'bn' ? '"আপনার ডিভাইস শীঘ্রই ঠিক হয়ে যাবে!"' :
                   '"Your device will be fixed in no time!"'}
                </p>
                <div className="backdrop-blur-lg bg-slate-100/50 dark:bg-slate-700/50 p-6 rounded-xl text-left mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <h3 className="font-bold dark:text-white">{t('public.booking.bookingDetails')}</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    {bookingResult && (
                      <p className="dark:text-white text-lg font-semibold text-primary">
                        <strong>{i18n.language === 'hi' ? 'Ticket #:' : i18n.language === 'bn' ? 'টিকেট #:' : 'Ticket #:'}</strong> {bookingResult.invoice_number}
                      </p>
                    )}
                    <p className="dark:text-white"><strong>{t('public.booking.yourName')}:</strong> {formData.name}</p>
                    <p className="dark:text-white"><strong>{t('public.booking.deviceType')}:</strong> {formData.deviceType}</p>
                    <p className="dark:text-white"><strong>{t('public.booking.preferredDate')}:</strong> {bookingResult?.scheduled_date || formData.date}</p>
                    <p className="dark:text-white"><strong>{t('public.booking.preferredTime')}:</strong> {bookingResult?.scheduled_time || formData.time}</p>
                  </div>
                </div>
                <Link to="/">
                  <Button className="gap-2 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white border-0 shadow-lg shadow-purple-500/25 px-8 py-6">
                    {t('public.booking.backToHome')}
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
