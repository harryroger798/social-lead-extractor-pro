import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Settings, Sparkles, Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { servicesApi } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

interface Service {
  id: number
  name: string
  category: string
  description: string
  price: number
  estimated_hours: number
  is_active: boolean
}

interface PhoneModel {
  id: number
  brand: string
  model: string
  screen_price: number
  battery_price: number
  charging_port_price: number
  back_panel_price: number
  software_price: number
}

const CATEGORIES = ['pc_repair', 'mobile_repair', 'digital_services']

export function ServicesPage() {
  const { i18n } = useTranslation()
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false)
  const [isPhoneDialogOpen, setIsPhoneDialogOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [editingPhone, setEditingPhone] = useState<PhoneModel | null>(null)
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { data: servicesData, isLoading: servicesLoading } = useQuery({
    queryKey: ['services', search, categoryFilter],
    queryFn: () => servicesApi.getAll({ search, category: categoryFilter === 'all' ? undefined : categoryFilter }),
  })

  const { data: phoneModelsData, isLoading: phonesLoading } = useQuery({
    queryKey: ['phone-models'],
    queryFn: () => servicesApi.getPhoneModels(),
  })

  const createServiceMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => servicesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
      setIsServiceDialogOpen(false)
      toast({ title: 'Service created successfully' })
    },
    onError: () => {
      toast({ variant: 'destructive', title: 'Failed to create service' })
    },
  })

  const updateServiceMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) =>
      servicesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
      setIsServiceDialogOpen(false)
      setEditingService(null)
      toast({ title: 'Service updated successfully' })
    },
    onError: () => {
      toast({ variant: 'destructive', title: 'Failed to update service' })
    },
  })

  const deleteServiceMutation = useMutation({
    mutationFn: (id: number) => servicesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
      toast({ title: 'Service deleted successfully' })
    },
    onError: () => {
      toast({ variant: 'destructive', title: 'Failed to delete service' })
    },
  })

  const createPhoneMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => servicesApi.createPhoneModel(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['phone-models'] })
      setIsPhoneDialogOpen(false)
      toast({ title: 'Phone model added successfully' })
    },
    onError: () => {
      toast({ variant: 'destructive', title: 'Failed to add phone model' })
    },
  })

    const updatePhoneMutation = useMutation({
      mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) =>
        servicesApi.updatePhoneModel(id, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['phone-models'] })
        setIsPhoneDialogOpen(false)
        setEditingPhone(null)
        toast({ title: 'Phone model updated successfully' })
      },
      onError: () => {
        toast({ variant: 'destructive', title: 'Failed to update phone model' })
      },
    })

    const deletePhoneMutation = useMutation({
      mutationFn: (id: number) => servicesApi.deletePhoneModel(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['phone-models'] })
        toast({ title: 'Phone model deleted successfully' })
      },
      onError: () => {
        toast({ variant: 'destructive', title: 'Failed to delete phone model' })
      },
    })

    const services = servicesData?.data?.data || []
  const phoneModels = phoneModelsData?.data?.data || []

  const handleServiceSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const serviceData = {
      name: formData.get('name'),
      category: formData.get('category'),
      description: formData.get('description'),
      price: Number(formData.get('price')),
      estimated_hours: Number(formData.get('estimated_hours')),
      is_active: formData.get('is_active') === 'true',
    }

    if (editingService) {
      updateServiceMutation.mutate({ id: editingService.id, data: serviceData })
    } else {
      createServiceMutation.mutate(serviceData)
    }
  }

  const handlePhoneSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const phoneData = {
      brand: formData.get('brand'),
      model: formData.get('model'),
      screen_price: Number(formData.get('screen_price')),
      battery_price: Number(formData.get('battery_price')),
      charging_port_price: Number(formData.get('charging_port_price')),
      back_panel_price: Number(formData.get('back_panel_price')),
      software_price: Number(formData.get('software_price')),
    }

    if (editingPhone) {
      updatePhoneMutation.mutate({ id: editingPhone.id, data: phoneData })
    } else {
      createPhoneMutation.mutate(phoneData)
    }
  }

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
          className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/25"
        >
          <Settings className="h-6 w-6 text-white" />
        </motion.div>
        <div>
          <h1 className="text-3xl font-bold dark:text-white">Services</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            {i18n.language === 'hi' ? 'Service catalog aur pricing manage karein' :
             i18n.language === 'bn' ? 'সার্ভিস ক্যাটালগ এবং মূল্য পরিচালনা করুন' :
             'Manage your service catalog and pricing'}
            <Sparkles className="h-4 w-4 text-primary" />
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Tabs defaultValue="services">
          <TabsList className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg">
            <TabsTrigger value="services" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white">Services</TabsTrigger>
            <TabsTrigger value="phone-models" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white">Phone Models</TabsTrigger>
          </TabsList>

          <TabsContent value="services" className="space-y-4">
            <Card className="overflow-hidden border-0 shadow-lg backdrop-blur-lg bg-white/70 dark:bg-slate-800/70">
              <div className="h-1 bg-gradient-to-r from-orange-500 to-red-500" />
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="dark:text-white">Service Catalog</CardTitle>
                  <Button 
                    onClick={() => setIsServiceDialogOpen(true)}
                    className="gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0 shadow-lg shadow-orange-500/25"
                  >
                    <Plus className="h-4 w-4" />
                    Add Service
                  </Button>
                </div>
                <div className="flex flex-wrap items-center gap-4 pt-4">
                  <div className="relative flex-1 min-w-64">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder={i18n.language === 'hi' ? 'Services khojein...' :
                                  i18n.language === 'bn' ? 'সার্ভিস খুঁজুন...' :
                                  'Search services...'}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9 bg-white/50 dark:bg-slate-700/50 border-white/20 dark:border-slate-600"
                    />
                  </div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-40 bg-white/50 dark:bg-slate-700/50 border-white/20 dark:border-slate-600">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat.replace('_', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {servicesLoading ? (
                  <div className="flex h-32 items-center justify-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent"
                    />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50 dark:bg-slate-700/50">
                        <TableHead className="font-semibold">Name</TableHead>
                        <TableHead className="font-semibold">Category</TableHead>
                        <TableHead className="font-semibold">Base Price</TableHead>
                        <TableHead className="font-semibold">Est. Time</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {services.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-12">
                            <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-2 opacity-50" />
                            <p className="text-muted-foreground">
                              {i18n.language === 'hi' ? 'Koi service nahi mili' :
                               i18n.language === 'bn' ? 'কোনো সার্ভিস পাওয়া যায়নি' :
                               'No services found'}
                            </p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        services.map((service: Service, index: number) => (
                          <motion.tr
                            key={service.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="border-b transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50"
                          >
                            <TableCell>
                              <div>
                                <p className="font-medium dark:text-white">{service.name}</p>
                                {service.description && (
                                  <p className="text-sm text-muted-foreground truncate max-w-64">
                                    {service.description}
                                  </p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/30">
                                {service.category.replace('_', ' ')}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-semibold text-green-600 dark:text-green-400">
                              {formatCurrency(service.price || 0)}
                            </TableCell>
                            <TableCell>{service.estimated_hours || 0} min</TableCell>
                            <TableCell>
                              <Badge variant={service.is_active ? 'success' : 'secondary'}>
                                {service.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="hover:bg-slate-100 dark:hover:bg-slate-700">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setEditingService(service)
                                      setIsServiceDialogOpen(true)
                                    }}
                                  >
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => {
                                      if (confirm('Are you sure you want to delete this service?')) {
                                        deleteServiceMutation.mutate(service.id)
                                      }
                                    }}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </motion.tr>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="phone-models" className="space-y-4">
            <Card className="overflow-hidden border-0 shadow-lg backdrop-blur-lg bg-white/70 dark:bg-slate-800/70">
              <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-500" />
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5 text-blue-500" />
                    <CardTitle className="dark:text-white">Phone Model Pricing</CardTitle>
                  </div>
                  <Button 
                    onClick={() => setIsPhoneDialogOpen(true)}
                    className="gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 shadow-lg shadow-blue-500/25"
                  >
                    <Plus className="h-4 w-4" />
                    Add Phone Model
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {phonesLoading ? (
                  <div className="flex h-32 items-center justify-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent"
                    />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50 dark:bg-slate-700/50">
                        <TableHead className="font-semibold">Brand</TableHead>
                        <TableHead className="font-semibold">Model</TableHead>
                        <TableHead className="font-semibold">Screen</TableHead>
                        <TableHead className="font-semibold">Battery</TableHead>
                        <TableHead className="font-semibold">Charging Port</TableHead>
                        <TableHead className="font-semibold">Back Panel</TableHead>
                        <TableHead className="font-semibold">Software</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {phoneModels.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-12">
                            <Smartphone className="h-12 w-12 text-muted-foreground mx-auto mb-2 opacity-50" />
                            <p className="text-muted-foreground">
                              {i18n.language === 'hi' ? 'Koi phone model nahi mila' :
                               i18n.language === 'bn' ? 'কোনো ফোন মডেল পাওয়া যায়নি' :
                               'No phone models found'}
                            </p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        phoneModels.map((phone: PhoneModel, index: number) => (
                          <motion.tr
                            key={phone.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="border-b transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50"
                          >
                            <TableCell className="font-medium dark:text-white">{phone.brand}</TableCell>
                            <TableCell>{phone.model}</TableCell>
                            <TableCell className="text-green-600 dark:text-green-400">{formatCurrency(phone.screen_price)}</TableCell>
                            <TableCell className="text-green-600 dark:text-green-400">{formatCurrency(phone.battery_price)}</TableCell>
                            <TableCell className="text-green-600 dark:text-green-400">{formatCurrency(phone.charging_port_price)}</TableCell>
                            <TableCell className="text-green-600 dark:text-green-400">{formatCurrency(phone.back_panel_price)}</TableCell>
                            <TableCell className="text-green-600 dark:text-green-400">{formatCurrency(phone.software_price)}</TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="hover:bg-slate-100 dark:hover:bg-slate-700">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setEditingPhone(phone)
                                      setIsPhoneDialogOpen(true)
                                    }}
                                  >
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => {
                                      if (confirm('Are you sure you want to delete this phone model?')) {
                                        deletePhoneMutation.mutate(phone.id)
                                      }
                                    }}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </motion.tr>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      <Dialog open={isServiceDialogOpen} onOpenChange={(open) => {
        setIsServiceDialogOpen(open)
        if (!open) setEditingService(null)
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingService ? 'Edit Service' : 'Add New Service'}</DialogTitle>
            <DialogDescription>
              {editingService ? 'Update service details' : 'Add a new service to your catalog'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleServiceSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input id="name" name="name" defaultValue={editingService?.name} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select name="category" defaultValue={editingService?.category || 'pc_repair'}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat.replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" defaultValue={editingService?.description} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Base Price *</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    defaultValue={editingService?.price || 0}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estimated_hours">Est. Time (hours)</Label>
                  <Input
                    id="estimated_hours"
                    name="estimated_hours"
                    type="number"
                    min="0"
                    defaultValue={editingService?.estimated_hours || 1}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="is_active">Status</Label>
                <Select name="is_active" defaultValue={editingService?.is_active !== false ? 'true' : 'false'}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsServiceDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createServiceMutation.isPending || updateServiceMutation.isPending}>
                {editingService ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isPhoneDialogOpen} onOpenChange={(open) => {
        setIsPhoneDialogOpen(open)
        if (!open) setEditingPhone(null)
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPhone ? 'Edit Phone Model' : 'Add Phone Model'}</DialogTitle>
            <DialogDescription>
              Set repair pricing for a phone model
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePhoneSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brand">Brand *</Label>
                  <Input id="brand" name="brand" defaultValue={editingPhone?.brand} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Model *</Label>
                  <Input id="model" name="model" defaultValue={editingPhone?.model} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="screen_price">Screen Price</Label>
                  <Input
                    id="screen_price"
                    name="screen_price"
                    type="number"
                    min="0"
                    defaultValue={editingPhone?.screen_price || 0}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="battery_price">Battery Price</Label>
                  <Input
                    id="battery_price"
                    name="battery_price"
                    type="number"
                    min="0"
                    defaultValue={editingPhone?.battery_price || 0}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="charging_port_price">Charging Port Price</Label>
                  <Input
                    id="charging_port_price"
                    name="charging_port_price"
                    type="number"
                    min="0"
                    defaultValue={editingPhone?.charging_port_price || 0}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="back_panel_price">Back Panel Price</Label>
                  <Input
                    id="back_panel_price"
                    name="back_panel_price"
                    type="number"
                    min="0"
                    defaultValue={editingPhone?.back_panel_price || 0}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="software_price">Software Price</Label>
                <Input
                  id="software_price"
                  name="software_price"
                  type="number"
                  min="0"
                  defaultValue={editingPhone?.software_price || 0}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsPhoneDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createPhoneMutation.isPending || updatePhoneMutation.isPending}>
                {editingPhone ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
