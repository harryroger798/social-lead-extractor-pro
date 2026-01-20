import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { motion } from 'framer-motion'
import { Search, Package, Clock, CheckCircle, AlertCircle, Wrench, Phone, ArrowLeft, Calendar, Shield } from 'lucide-react'
import { GradientOrbs, FloatingTechIcons, DotGridPattern, FloatingParticles, CircuitPattern } from '@/components/ui/visual-enhancements'

interface Repair {
  invoice_number: string
  device: string
  service: string
  status: string
  priority: string
  created_at: string
  estimated_completion: string | null
  completed_at: string | null
  warranty_expiry: string | null
}

interface TrackingResult {
  customer_name: string
  repairs: Repair[]
}

const statusConfig: Record<string, { color: string, icon: typeof CheckCircle, label: string }> = {
  pending: { color: 'from-yellow-500 to-orange-500', icon: Clock, label: 'Pending' },
  in_progress: { color: 'from-blue-500 to-cyan-500', icon: Wrench, label: 'In Progress' },
  completed: { color: 'from-green-500 to-emerald-500', icon: CheckCircle, label: 'Completed' },
  delivered: { color: 'from-purple-500 to-pink-500', icon: Package, label: 'Delivered' },
  cancelled: { color: 'from-red-500 to-rose-500', icon: AlertCircle, label: 'Cancelled' },
}

export function TrackRepairPage() {
  const { i18n } = useTranslation()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [phone, setPhone] = useState(searchParams.get('phone') || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<TrackingResult | null>(null)

  const fetchRepairStatus = async (phoneNumber: string) => {
    if (!phoneNumber || phoneNumber.length < 10) {
      setError('Please enter a valid phone number (at least 10 digits)')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch(`/api/repairs/public/track?phone=${encodeURIComponent(phoneNumber)}`)
      const data = await response.json()

      if (!response.ok) {
        setError(data.message || 'No repairs found for this phone number')
        return
      }

      setResult(data.data)
    } catch {
      setError('Failed to fetch repair status. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const phoneParam = searchParams.get('phone')
    if (phoneParam) {
      setPhone(phoneParam)
      fetchRepairStatus(phoneParam)
    }
  }, [searchParams])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (phone) {
      navigate(`/track?phone=${encodeURIComponent(phone)}`)
      fetchRepairStatus(phone)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
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
              <Search className="h-10 w-10 text-white" />
            </motion.div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              {i18n.language === 'hi' ? 'Repair Status Track Karein' :
               i18n.language === 'bn' ? 'মেরামতের স্ট্যাটাস ট্র্যাক করুন' :
               'Track Your Repair'}
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto mb-4">
              {i18n.language === 'hi' ? 'Apna phone number daalein aur apne device ka status jaanein' :
               i18n.language === 'bn' ? 'আপনার ফোন নম্বর দিন এবং আপনার ডিভাইসের স্ট্যাটাস জানুন' :
               'Enter your phone number to check your device repair status'}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search Section */}
      <section className="relative py-12 bg-white dark:bg-slate-800 overflow-hidden">
        <DotGridPattern opacity="light" />
        <GradientOrbs variant="subtle" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-xl mx-auto"
          >
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={i18n.language === 'hi' ? 'Apna phone number daalein' :
                               i18n.language === 'bn' ? 'আপনার ফোন নম্বর দিন' :
                               'Enter your phone number'}
                  className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <Button 
                type="submit"
                size="lg"
                disabled={loading}
                className="bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 text-white px-8"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    {i18n.language === 'hi' ? 'Dhundh rahe hain...' :
                     i18n.language === 'bn' ? 'খুঁজছি...' :
                     'Searching...'}
                  </span>
                ) : (
                  <>
                    <Search className="h-5 w-5 mr-2" />
                    {i18n.language === 'hi' ? 'Track Karein' :
                     i18n.language === 'bn' ? 'ট্র্যাক করুন' :
                     'Track Status'}
                  </>
                )}
              </Button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Results Section */}
      <section className="relative py-12 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 overflow-hidden min-h-[400px]">
        <CircuitPattern variant="default" />
        <FloatingParticles count={20} color="primary" />
        <div className="container mx-auto px-4 relative z-10">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto text-center"
            >
              <div className="backdrop-blur-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-8">
                <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">
                  {i18n.language === 'hi' ? 'Koi Repair Nahi Mila' :
                   i18n.language === 'bn' ? 'কোনো মেরামত পাওয়া যায়নি' :
                   'No Repairs Found'}
                </h3>
                <p className="text-red-600 dark:text-red-300 mb-6">{error}</p>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/')}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {i18n.language === 'hi' ? 'Home Par Jaayein' :
                   i18n.language === 'bn' ? 'হোমে যান' :
                   'Go to Home'}
                </Button>
              </div>
            </motion.div>
          )}

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto"
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold dark:text-white mb-2">
                  {i18n.language === 'hi' ? `Namaste, ${result.customer_name}!` :
                   i18n.language === 'bn' ? `নমস্কার, ${result.customer_name}!` :
                   `Hello, ${result.customer_name}!`}
                </h2>
                <p className="text-muted-foreground">
                  {i18n.language === 'hi' ? `Aapke ${result.repairs.length} repair(s) mile` :
                   i18n.language === 'bn' ? `আপনার ${result.repairs.length}টি মেরামত পাওয়া গেছে` :
                   `Found ${result.repairs.length} repair(s) for your account`}
                </p>
              </div>

              <div className="space-y-6">
                {result.repairs.map((repair, index) => {
                  const status = statusConfig[repair.status] || statusConfig.pending
                  const StatusIcon = status.icon

                  return (
                    <motion.div
                      key={repair.invoice_number}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="backdrop-blur-lg bg-white/70 dark:bg-slate-800/70 border border-white/20 dark:border-slate-700/50 rounded-2xl shadow-xl overflow-hidden"
                    >
                      {/* Status Header */}
                      <div className={`bg-gradient-to-r ${status.color} p-4 text-white`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <StatusIcon className="h-6 w-6" />
                            <span className="font-bold text-lg">{status.label}</span>
                          </div>
                          <span className="text-sm opacity-90">#{repair.invoice_number}</span>
                        </div>
                      </div>

                      {/* Repair Details */}
                      <div className="p-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-bold text-lg dark:text-white mb-4">{repair.device}</h4>
                            <p className="text-muted-foreground mb-2">
                              <span className="font-medium">Service:</span> {repair.service}
                            </p>
                            <p className="text-muted-foreground">
                              <span className="font-medium">Priority:</span>{' '}
                              <span className={`capitalize ${repair.priority === 'urgent' ? 'text-red-500' : repair.priority === 'high' ? 'text-orange-500' : ''}`}>
                                {repair.priority}
                              </span>
                            </p>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-muted-foreground">Created:</span>
                              <span className="dark:text-white">{formatDate(repair.created_at)}</span>
                            </div>
                            
                            {repair.estimated_completion && (
                              <div className="flex items-center gap-2 text-sm">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Est. Completion:</span>
                                <span className="dark:text-white">{formatDate(repair.estimated_completion)}</span>
                              </div>
                            )}

                            {repair.completed_at && (
                              <div className="flex items-center gap-2 text-sm">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span className="text-muted-foreground">Completed:</span>
                                <span className="dark:text-white">{formatDate(repair.completed_at)}</span>
                              </div>
                            )}

                            {repair.warranty_expiry && (
                              <div className="flex items-center gap-2 text-sm">
                                <Shield className="h-4 w-4 text-purple-500" />
                                <span className="text-muted-foreground">Warranty Until:</span>
                                <span className="dark:text-white">{formatDate(repair.warranty_expiry)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center mt-8"
              >
                <p className="text-muted-foreground mb-4">
                  {i18n.language === 'hi' ? 'Koi sawal hai? Humse contact karein!' :
                   i18n.language === 'bn' ? 'কোনো প্রশ্ন আছে? আমাদের সাথে যোগাযোগ করুন!' :
                   'Have questions? Contact us!'}
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Button variant="outline" onClick={() => navigate('/contact')} className="gap-2">
                    <Phone className="h-4 w-4" />
                    {i18n.language === 'hi' ? 'Contact Karein' :
                     i18n.language === 'bn' ? 'যোগাযোগ করুন' :
                     'Contact Us'}
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/')} className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    {i18n.language === 'hi' ? 'Home Par Jaayein' :
                     i18n.language === 'bn' ? 'হোমে যান' :
                     'Back to Home'}
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {!error && !result && !loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-2xl mx-auto text-center"
            >
              <div className="backdrop-blur-lg bg-white/70 dark:bg-slate-800/70 border border-white/20 dark:border-slate-700/50 rounded-2xl p-8">
                <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-bold dark:text-white mb-2">
                  {i18n.language === 'hi' ? 'Apna Phone Number Daalein' :
                   i18n.language === 'bn' ? 'আপনার ফোন নম্বর দিন' :
                   'Enter Your Phone Number'}
                </h3>
                <p className="text-muted-foreground">
                  {i18n.language === 'hi' ? 'Apne registered phone number se repair status check karein' :
                   i18n.language === 'bn' ? 'আপনার রেজিস্টার্ড ফোন নম্বর দিয়ে মেরামতের স্ট্যাটাস চেক করুন' :
                   'Use your registered phone number to check your repair status'}
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </section>
    </PublicLayout>
  )
}
