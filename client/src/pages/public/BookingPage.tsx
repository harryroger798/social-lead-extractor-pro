import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { useToast } from '@/hooks/use-toast'
import { Calendar, Clock, CheckCircle } from 'lucide-react'

export function BookingPage() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const [step, setStep] = useState(1)
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setStep(3)
    toast({
      title: t('public.booking.bookingConfirmed'),
      description: t('public.booking.bookingConfirmedDesc'),
    })
  }

  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM'
  ]

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">{t('public.booking.title')}</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('public.booking.subtitle')}
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="flex justify-center mb-8">
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-primary text-white' : 'bg-muted'}`}>
                1
              </div>
              <div className={`w-24 h-1 ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-primary text-white' : 'bg-muted'}`}>
                2
              </div>
              <div className={`w-24 h-1 ${step >= 3 ? 'bg-primary' : 'bg-muted'}`} />
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-primary text-white' : 'bg-muted'}`}>
                3
              </div>
            </div>
          </div>

          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>{t('public.booking.deviceDetails')}</CardTitle>
                <CardDescription>{t('public.booking.deviceDetailsDesc')}</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">{t('public.booking.yourName')}</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">{t('public.booking.phoneNumber')}</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('public.booking.email')}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('public.booking.deviceType')}</Label>
                    <Select
                      value={formData.deviceType}
                      onValueChange={(value) => setFormData({ ...formData, deviceType: value })}
                    >
                      <SelectTrigger>
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
                      <Label htmlFor="brand">{t('public.booking.brand')}</Label>
                      <Input
                        id="brand"
                        value={formData.brand}
                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                        placeholder="Apple, Samsung, etc."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="model">{t('public.booking.model')}</Label>
                      <Input
                        id="model"
                        value={formData.model}
                        onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                        placeholder="iPhone 15, Galaxy S24, etc."
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="issue">{t('public.booking.issueDescription')}</Label>
                    <Textarea
                      id="issue"
                      rows={4}
                      value={formData.issue}
                      onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
                      placeholder={t('public.booking.issuePlaceholder')}
                      required
                    />
                  </div>
                  <Button
                    type="button"
                    className="w-full"
                    onClick={() => setStep(2)}
                    disabled={!formData.name || !formData.phone || !formData.deviceType || !formData.issue}
                  >
                    {t('common.next')}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>{t('public.booking.selectDateTime')}</CardTitle>
                <CardDescription>{t('public.booking.selectDateTimeDesc')}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="date" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {t('public.booking.preferredDate')}
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {t('public.booking.preferredTime')}
                    </Label>
                    <Select
                      value={formData.time}
                      onValueChange={(value) => setFormData({ ...formData, time: value })}
                    >
                      <SelectTrigger>
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
                    <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
                      {t('common.back')}
                    </Button>
                    <Button type="submit" className="flex-1" disabled={!formData.date || !formData.time}>
                      {t('public.booking.confirmBooking')}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card>
              <CardContent className="pt-6 text-center">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">{t('public.booking.thankYou')}</h2>
                <p className="text-muted-foreground mb-6">
                  {t('public.booking.confirmationMessage')}
                </p>
                <div className="bg-muted p-4 rounded-lg text-left mb-6">
                  <h3 className="font-semibold mb-2">{t('public.booking.bookingDetails')}</h3>
                  <p><strong>{t('public.booking.yourName')}:</strong> {formData.name}</p>
                  <p><strong>{t('public.booking.deviceType')}:</strong> {formData.deviceType}</p>
                  <p><strong>{t('public.booking.preferredDate')}:</strong> {formData.date}</p>
                  <p><strong>{t('public.booking.preferredTime')}:</strong> {formData.time}</p>
                </div>
                <Link to="/">
                  <Button>{t('public.booking.backToHome')}</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PublicLayout>
  )
}
