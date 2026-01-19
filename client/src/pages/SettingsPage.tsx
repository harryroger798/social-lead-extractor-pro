import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Save, RefreshCw, Database, Cloud, Mail, Building2, CreditCard, Palette, Settings, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { settingsApi, airtableApi, backupApi } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { useAuthStore } from '@/stores/authStore'

export function SettingsPage() {
  const { i18n } = useTranslation()
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [isSyncing, setIsSyncing] = useState(false)
  const [isBackingUp, setIsBackingUp] = useState(false)

  const { data: settingsData, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsApi.getAll(),
  })

  const { data: syncStatus } = useQuery({
    queryKey: ['airtable-status'],
    queryFn: () => airtableApi.getStatus(),
  })

  const updateBusinessMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => settingsApi.updateBusiness(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
      toast({ title: 'Business settings updated successfully' })
    },
    onError: () => {
      toast({ variant: 'destructive', title: 'Failed to update business settings' })
    },
  })

  const updatePaymentMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => settingsApi.updatePayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
      toast({ title: 'Payment settings updated successfully' })
    },
    onError: () => {
      toast({ variant: 'destructive', title: 'Failed to update payment settings' })
    },
  })

  const updateIntegrationsMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => settingsApi.updateIntegrations(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
      toast({ title: 'Integration settings updated successfully' })
    },
    onError: () => {
      toast({ variant: 'destructive', title: 'Failed to update integration settings' })
    },
  })

  const updateSettingsMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => settingsApi.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
      toast({ title: 'Settings updated successfully' })
    },
    onError: () => {
      toast({ variant: 'destructive', title: 'Failed to update settings' })
    },
  })

  const settings = settingsData?.data?.data || {}
  const syncData = syncStatus?.data?.data || {}

  const handleBusinessSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    updateBusinessMutation.mutate({
      business_name: formData.get('business_name'),
      business_address: formData.get('business_address'),
      business_phone: formData.get('business_phone'),
      business_email: formData.get('business_email'),
      owner_name: formData.get('owner_name'),
    })
  }

  const handleAirtableSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    updateIntegrationsMutation.mutate({
      airtable_api_key: formData.get('airtable_api_key'),
      airtable_base_id: formData.get('airtable_base_id'),
    })
  }

  const handleOmnisendSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    updateIntegrationsMutation.mutate({
      omnisend_api_key: formData.get('omnisend_api_key'),
      omnisend_enabled: true,
    })
  }

  const handlePaymentSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    updatePaymentMutation.mutate({
      upi_id: formData.get('upi_id'),
      bank_name: formData.get('bank_name'),
      bank_account_number: formData.get('bank_account_number'),
      bank_ifsc: formData.get('bank_ifsc'),
      bank_account_name: formData.get('bank_account_name'),
    })
  }

  const handleGSTSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    updateSettingsMutation.mutate({
      gst_enabled: formData.get('gst_enabled') === 'on',
      gst_number: formData.get('gst_number'),
      gst_rate: Number(formData.get('gst_rate')),
    })
  }

  const handleSync = async () => {
    setIsSyncing(true)
    try {
      await airtableApi.syncNow()
      queryClient.invalidateQueries({ queryKey: ['airtable-status'] })
      toast({ title: 'Sync completed successfully' })
    } catch {
      toast({ variant: 'destructive', title: 'Sync failed' })
    } finally {
      setIsSyncing(false)
    }
  }

  const handleBackup = async () => {
    setIsBackingUp(true)
    try {
      await backupApi.create()
      toast({ title: 'Backup created successfully' })
    } catch {
      toast({ variant: 'destructive', title: 'Backup failed' })
    } finally {
      setIsBackingUp(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent"
        />
      </div>
    )
  }

  const isAdmin = user?.role === 'admin'

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-3"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="h-12 w-12 rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center shadow-lg shadow-slate-500/25"
        >
          <Settings className="h-6 w-6 text-white" />
        </motion.div>
        <div>
          <h1 className="text-3xl font-bold dark:text-white">Settings</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            {i18n.language === 'hi' ? 'Shop settings aur integrations manage karein' :
             i18n.language === 'bn' ? 'দোকানের সেটিংস এবং ইন্টিগ্রেশন পরিচালনা করুন' :
             'Manage your shop settings and integrations'}
            <Sparkles className="h-4 w-4 text-primary" />
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Tabs defaultValue="business">
          <TabsList className="grid w-full grid-cols-5 bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg">
            <TabsTrigger value="business" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-600 data-[state=active]:to-slate-800 data-[state=active]:text-white">Business</TabsTrigger>
            <TabsTrigger value="payment" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-600 data-[state=active]:to-slate-800 data-[state=active]:text-white">Payment</TabsTrigger>
            <TabsTrigger value="integrations" disabled={!isAdmin} className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-600 data-[state=active]:to-slate-800 data-[state=active]:text-white">Integrations</TabsTrigger>
            <TabsTrigger value="gst" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-600 data-[state=active]:to-slate-800 data-[state=active]:text-white">GST</TabsTrigger>
            <TabsTrigger value="backup" disabled={!isAdmin} className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-600 data-[state=active]:to-slate-800 data-[state=active]:text-white">Backup</TabsTrigger>
          </TabsList>

        <TabsContent value="business" className="space-y-4">
          <Card className="overflow-hidden border-0 shadow-lg backdrop-blur-lg bg-white/70 dark:bg-slate-800/70">
            <div className="h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2 dark:text-white">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <Building2 className="h-4 w-4 text-white" />
                </div>
                Business Information
              </CardTitle>
              <CardDescription>
                Update your business details that appear on invoices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBusinessSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="business_name">Business Name</Label>
                    <Input
                      id="business_name"
                      name="business_name"
                      defaultValue={settings.business_name || 'ByteCare'}
                      className="bg-white/50 dark:bg-slate-700/50 border-white/20 dark:border-slate-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="owner_name">Owner Name</Label>
                    <Input
                      id="owner_name"
                      name="owner_name"
                      defaultValue={settings.owner_name || 'Sayan Roy Chowdhury'}
                      className="bg-white/50 dark:bg-slate-700/50 border-white/20 dark:border-slate-600"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="business_phone">Phone</Label>
                    <Input
                      id="business_phone"
                      name="business_phone"
                      defaultValue={settings.business_phone}
                      className="bg-white/50 dark:bg-slate-700/50 border-white/20 dark:border-slate-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="business_email">Email</Label>
                    <Input
                      id="business_email"
                      name="business_email"
                      type="email"
                      defaultValue={settings.business_email || 'harryroger798@gmail.com'}
                      className="bg-white/50 dark:bg-slate-700/50 border-white/20 dark:border-slate-600"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business_address">Address</Label>
                  <Textarea
                    id="business_address"
                    name="business_address"
                    defaultValue={settings.business_address}
                    className="bg-white/50 dark:bg-slate-700/50 border-white/20 dark:border-slate-600"
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={updateSettingsMutation.isPending}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 shadow-lg shadow-blue-500/25"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="space-y-4">
          <Card className="overflow-hidden border-0 shadow-lg backdrop-blur-lg bg-white/70 dark:bg-slate-800/70">
            <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-500" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2 dark:text-white">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                  <CreditCard className="h-4 w-4 text-white" />
                </div>
                Payment Settings
              </CardTitle>
              <CardDescription>
                Configure UPI and bank details for payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="upi_id">UPI ID (Google Pay)</Label>
                  <Input
                    id="upi_id"
                    name="upi_id"
                    defaultValue={settings.upi_id || '7003888936@ptyes'}
                    placeholder="yourname@upi"
                    className="bg-white/50 dark:bg-slate-700/50 border-white/20 dark:border-slate-600"
                  />
                </div>
                <Separator />
                <h4 className="font-medium dark:text-white">Bank Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bank_name">Bank Name</Label>
                    <Input
                      id="bank_name"
                      name="bank_name"
                      defaultValue={settings.bank_name}
                      className="bg-white/50 dark:bg-slate-700/50 border-white/20 dark:border-slate-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bank_account_name">Account Holder Name</Label>
                    <Input
                      id="bank_account_name"
                      name="bank_account_name"
                      defaultValue={settings.bank_account_name}
                      className="bg-white/50 dark:bg-slate-700/50 border-white/20 dark:border-slate-600"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bank_account_number">Account Number</Label>
                    <Input
                      id="bank_account_number"
                      name="bank_account_number"
                      defaultValue={settings.bank_account_number}
                      className="bg-white/50 dark:bg-slate-700/50 border-white/20 dark:border-slate-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bank_ifsc">IFSC Code</Label>
                    <Input
                      id="bank_ifsc"
                      name="bank_ifsc"
                      defaultValue={settings.bank_ifsc}
                      className="bg-white/50 dark:bg-slate-700/50 border-white/20 dark:border-slate-600"
                    />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  disabled={updateSettingsMutation.isPending}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 shadow-lg shadow-green-500/25"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          {isAdmin ? (
            <>
              <Card className="overflow-hidden border-0 shadow-lg backdrop-blur-lg bg-white/70 dark:bg-slate-800/70">
                <div className="h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 dark:text-white">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <Cloud className="h-4 w-4 text-white" />
                    </div>
                    Airtable Integration
                  </CardTitle>
                  <CardDescription>
                    Configure Airtable for cloud backup and sync
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAirtableSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="airtable_api_key">API Key</Label>
                      <Input
                        id="airtable_api_key"
                        name="airtable_api_key"
                        type="password"
                        defaultValue={settings.airtable_api_key}
                        placeholder="pat..."
                        className="bg-white/50 dark:bg-slate-700/50 border-white/20 dark:border-slate-600"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="airtable_base_id">Base ID</Label>
                      <Input
                        id="airtable_base_id"
                        name="airtable_base_id"
                        defaultValue={settings.airtable_base_id}
                        placeholder="app..."
                        className="bg-white/50 dark:bg-slate-700/50 border-white/20 dark:border-slate-600"
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <Button 
                        type="submit" 
                        disabled={updateIntegrationsMutation.isPending}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-lg shadow-purple-500/25"
                      >
                        <Save className="mr-2 h-4 w-4" />
                        Save
                      </Button>
                      <Button type="button" variant="outline" onClick={handleSync} disabled={isSyncing}>
                        <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                        Sync Now
                      </Button>
                    </div>
                    {syncData.last_sync && (
                      <p className="text-sm text-muted-foreground">
                        Last sync: {new Date(syncData.last_sync).toLocaleString()}
                      </p>
                    )}
                  </form>
                </CardContent>
              </Card>

              <Card className="overflow-hidden border-0 shadow-lg backdrop-blur-lg bg-white/70 dark:bg-slate-800/70">
                <div className="h-1 bg-gradient-to-r from-orange-500 to-red-500" />
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 dark:text-white">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                      <Mail className="h-4 w-4 text-white" />
                    </div>
                    Omnisend Integration
                  </CardTitle>
                  <CardDescription>
                    Configure Omnisend for email and SMS notifications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleOmnisendSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="omnisend_api_key">API Key</Label>
                      <Input
                        id="omnisend_api_key"
                        name="omnisend_api_key"
                        type="password"
                        defaultValue={settings.omnisend_api_key}
                        placeholder="Enter Omnisend API key"
                        className="bg-white/50 dark:bg-slate-700/50 border-white/20 dark:border-slate-600"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      disabled={updateIntegrationsMutation.isPending}
                      className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0 shadow-lg shadow-orange-500/25"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Save
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="overflow-hidden border-0 shadow-lg backdrop-blur-lg bg-white/70 dark:bg-slate-800/70">
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">
                  Only administrators can access integration settings
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="gst" className="space-y-4">
          <Card className="overflow-hidden border-0 shadow-lg backdrop-blur-lg bg-white/70 dark:bg-slate-800/70">
            <div className="h-1 bg-gradient-to-r from-amber-500 to-yellow-500" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2 dark:text-white">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center">
                  <Palette className="h-4 w-4 text-white" />
                </div>
                GST Settings
              </CardTitle>
              <CardDescription>
                Configure GST for invoices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleGSTSubmit} className="space-y-4">
                <div className="flex items-center gap-4">
                  <Switch
                    id="gst_enabled"
                    name="gst_enabled"
                    defaultChecked={settings.gst_enabled}
                  />
                  <Label htmlFor="gst_enabled">Enable GST on invoices</Label>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gst_number">GST Number</Label>
                    <Input
                      id="gst_number"
                      name="gst_number"
                      defaultValue={settings.gst_number}
                      placeholder="22AAAAA0000A1Z5"
                      className="bg-white/50 dark:bg-slate-700/50 border-white/20 dark:border-slate-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gst_rate">GST Rate (%)</Label>
                    <Input
                      id="gst_rate"
                      name="gst_rate"
                      type="number"
                      min="0"
                      max="100"
                      defaultValue={settings.gst_rate || 18}
                      className="bg-white/50 dark:bg-slate-700/50 border-white/20 dark:border-slate-600"
                    />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  disabled={updateSettingsMutation.isPending}
                  className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white border-0 shadow-lg shadow-amber-500/25"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup" className="space-y-4">
          {isAdmin ? (
            <Card className="overflow-hidden border-0 shadow-lg backdrop-blur-lg bg-white/70 dark:bg-slate-800/70">
              <div className="h-1 bg-gradient-to-r from-red-500 to-rose-500" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-white">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center">
                    <Database className="h-4 w-4 text-white" />
                  </div>
                  Database Backup
                </CardTitle>
                <CardDescription>
                  Create and manage database backups
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={handleBackup} 
                  disabled={isBackingUp}
                  className="bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white border-0 shadow-lg shadow-red-500/25"
                >
                  <Database className={`mr-2 h-4 w-4 ${isBackingUp ? 'animate-pulse' : ''}`} />
                  {isBackingUp ? 'Creating Backup...' : 'Create Backup Now'}
                </Button>
                <p className="text-sm text-muted-foreground">
                  Backups are stored locally and can be downloaded from the server.
                  Regular backups are recommended to prevent data loss.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="overflow-hidden border-0 shadow-lg backdrop-blur-lg bg-white/70 dark:bg-slate-800/70">
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">
                  Only administrators can access backup settings
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        </Tabs>
      </motion.div>
    </div>
  )
}
