import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
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
      <div>
        <h1 className="text-3xl font-bold">Services</h1>
        <p className="text-muted-foreground">Manage your service catalog and pricing</p>
      </div>

      <Tabs defaultValue="services">
        <TabsList>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="phone-models">Phone Models</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Service Catalog</CardTitle>
                <Button onClick={() => setIsServiceDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Service
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-4 pt-4">
                <div className="relative flex-1 min-w-64">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search services..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-40">
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
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Base Price</TableHead>
                      <TableHead>Est. Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {services.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          No services found
                        </TableCell>
                      </TableRow>
                    ) : (
                      services.map((service: Service) => (
                        <TableRow key={service.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{service.name}</p>
                              {service.description && (
                                <p className="text-sm text-muted-foreground truncate max-w-64">
                                  {service.description}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{service.category.replace('_', ' ')}</Badge>
                          </TableCell>
                          <TableCell>{formatCurrency(service.price || 0)}</TableCell>
                          <TableCell>{service.estimated_hours || 0} min</TableCell>
                          <TableCell>
                            <Badge variant={service.is_active ? 'success' : 'secondary'}>
                              {service.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
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
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="phone-models" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Phone Model Pricing</CardTitle>
                <Button onClick={() => setIsPhoneDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Phone Model
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {phonesLoading ? (
                <div className="flex h-32 items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Brand</TableHead>
                      <TableHead>Model</TableHead>
                      <TableHead>Screen</TableHead>
                      <TableHead>Battery</TableHead>
                      <TableHead>Charging Port</TableHead>
                      <TableHead>Back Panel</TableHead>
                      <TableHead>Software</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {phoneModels.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground">
                          No phone models found
                        </TableCell>
                      </TableRow>
                    ) : (
                      phoneModels.map((phone: PhoneModel) => (
                        <TableRow key={phone.id}>
                          <TableCell className="font-medium">{phone.brand}</TableCell>
                          <TableCell>{phone.model}</TableCell>
                          <TableCell>{formatCurrency(phone.screen_price)}</TableCell>
                          <TableCell>{formatCurrency(phone.battery_price)}</TableCell>
                          <TableCell>{formatCurrency(phone.charging_port_price)}</TableCell>
                          <TableCell>{formatCurrency(phone.back_panel_price)}</TableCell>
                          <TableCell>{formatCurrency(phone.software_price)}</TableCell>
                                                  <TableCell>
                                                    <DropdownMenu>
                                                      <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
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
                                                </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
