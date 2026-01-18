import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, MoreHorizontal, Pencil, Eye, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
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
import { SearchableSelect } from '@/components/ui/searchable-select'
import { repairsApi, customersApi, servicesApi } from '@/lib/api'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

interface Repair {
  id: number
  invoice_number: string
  customer_id: number
  customer_name: string
  customer_phone: string
  service_id: number
  service_name: string
  device_type: string
  brand: string
  model: string
  serial_number: string
  issue_description: string
  diagnosis: string
  status: string
  priority: string
  parts_cost: number
  labor_cost: number
  total_cost: number
  gst_amount: number
  final_price: number
  created_at: string
}

const STATUSES = ['pending', 'diagnosed', 'waiting_parts', 'in_progress', 'completed', 'delivered', 'cancelled']

const DEVICE_TYPES = [
  { value: 'LAPTOP', label: 'Laptop' },
  { value: 'PC', label: 'Desktop/PC' },
  { value: 'MOBILE', label: 'Mobile' },
  { value: 'TABLET', label: 'Tablet' },
  { value: 'OTHER', label: 'Other' },
]

export function RepairsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingRepair, setEditingRepair] = useState<Repair | null>(null)
  const [viewingRepair, setViewingRepair] = useState<Repair | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<string>('')
  const [selectedService, setSelectedService] = useState<string>('')
  const [selectedDeviceType, setSelectedDeviceType] = useState<string>('')
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { data, isLoading } = useQuery({
    queryKey: ['repairs', search, statusFilter],
    queryFn: () => repairsApi.getAll({ search, status: statusFilter === 'all' ? undefined : statusFilter, limit: 50 }),
  })

  const { data: customersData } = useQuery({
    queryKey: ['customers-list'],
    queryFn: () => customersApi.getAll({ limit: 100 }),
  })

  const { data: servicesData } = useQuery({
    queryKey: ['services-list'],
    queryFn: () => servicesApi.getAll({ limit: 100 }),
  })

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => repairsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repairs'] })
      setIsDialogOpen(false)
      toast({ title: 'Repair ticket created successfully' })
    },
    onError: () => {
      toast({ variant: 'destructive', title: 'Failed to create repair ticket' })
    },
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      repairsApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repairs'] })
      toast({ title: 'Status updated successfully' })
    },
    onError: () => {
      toast({ variant: 'destructive', title: 'Failed to update status' })
    },
  })

  const completeMutation = useMutation({
    mutationFn: (id: number) => repairsApi.complete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repairs'] })
      toast({ title: 'Repair marked as completed' })
    },
    onError: () => {
      toast({ variant: 'destructive', title: 'Failed to complete repair' })
    },
  })

        const repairs = data?.data?.data || []
      const customers = customersData?.data?.data || []
      const services = servicesData?.data?.data || []

      const customerOptions = customers.map((c: { id: number; name: string; phone: string }) => ({
        value: String(c.id),
        label: `${c.name} - ${c.phone}`
      }))

      const serviceOptions = services.map((s: { id: number; name: string; category: string }) => ({
        value: String(s.id),
        label: `${s.name} (${s.category})`
      }))

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      const formData = new FormData(e.currentTarget)
      const repairData = {
        customer_id: Number(selectedCustomer),
        service_id: Number(selectedService),
        device_type: selectedDeviceType,
        brand: formData.get('brand'),
        model: formData.get('model'),
        serial_number: formData.get('serial_number'),
        issue_description: formData.get('issue_description'),
        priority: formData.get('priority'),
        parts_cost: Number(formData.get('parts_cost')) || 0,
      }
      createMutation.mutate(repairData)
    }

    const resetFormState = () => {
      setSelectedCustomer('')
      setSelectedService('')
      setSelectedDeviceType('')
    }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Repairs</h1>
          <p className="text-muted-foreground">Manage repair tickets</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Repair
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search repairs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-32 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead>Issue</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {repairs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      No repairs found
                    </TableCell>
                  </TableRow>
                ) : (
                  repairs.map((repair: Repair) => (
                    <TableRow key={repair.id}>
                      <TableCell className="font-medium">{repair.invoice_number}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{repair.customer_name}</p>
                          <p className="text-sm text-muted-foreground">{repair.customer_phone}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p>{repair.device_type}</p>
                          <p className="text-sm text-muted-foreground">
                            {repair.brand} {repair.model}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-48 truncate">
                        {repair.issue_description}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={repair.status}
                          onValueChange={(status) =>
                            updateStatusMutation.mutate({ id: repair.id, status })
                          }
                        >
                          <SelectTrigger className="w-32">
                            <Badge className={getStatusColor(repair.status)}>
                              {repair.status.replace('_', ' ')}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            {STATUSES.map((status) => (
                              <SelectItem key={status} value={status}>
                                {status.replace('_', ' ')}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>{formatCurrency(repair.final_price)}</TableCell>
                      <TableCell>{formatDate(repair.created_at)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setViewingRepair(repair)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setEditingRepair(repair)
                                setIsDialogOpen(true)
                              }}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            {repair.status !== 'completed' && repair.status !== 'delivered' && (
                              <DropdownMenuItem
                                onClick={() => completeMutation.mutate(repair.id)}
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Mark Complete
                              </DropdownMenuItem>
                            )}
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

                    <Dialog open={isDialogOpen} onOpenChange={(open) => {
                setIsDialogOpen(open)
                if (!open) {
                  setEditingRepair(null)
                  resetFormState()
                }
              }}>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{editingRepair ? 'Edit Repair' : 'New Repair Ticket'}</DialogTitle>
                    <DialogDescription>
                      {editingRepair ? 'Update repair details' : 'Create a new repair ticket'}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Customer *</Label>
                          <SearchableSelect
                            options={customerOptions}
                            value={selectedCustomer}
                            onValueChange={setSelectedCustomer}
                            placeholder="Select customer"
                            searchPlaceholder="Search by name or phone..."
                            emptyMessage="No customers found"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Service *</Label>
                          <SearchableSelect
                            options={serviceOptions}
                            value={selectedService}
                            onValueChange={setSelectedService}
                            placeholder="Select service"
                            searchPlaceholder="Search by name or category..."
                            emptyMessage="No services found"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Device Type *</Label>
                          <SearchableSelect
                            options={DEVICE_TYPES}
                            value={selectedDeviceType}
                            onValueChange={setSelectedDeviceType}
                            placeholder="Select type"
                            searchPlaceholder="Search device type..."
                            emptyMessage="No device types found"
                          />
                        </div>
                <div className="space-y-2">
                  <Label htmlFor="brand">Brand *</Label>
                  <Input id="brand" name="brand" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Model *</Label>
                  <Input id="model" name="model" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="serial_number">Serial Number</Label>
                  <Input id="serial_number" name="serial_number" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select name="priority" defaultValue="normal">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="issue_description">Issue Description *</Label>
                <Textarea id="issue_description" name="issue_description" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parts_cost">Parts Cost (if any)</Label>
                <Input id="parts_cost" name="parts_cost" type="number" min="0" step="0.01" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {editingRepair ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewingRepair} onOpenChange={() => setViewingRepair(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Repair Details - {viewingRepair?.invoice_number}</DialogTitle>
          </DialogHeader>
          {viewingRepair && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Customer</p>
                  <p className="font-medium">{viewingRepair.customer_name}</p>
                  <p className="text-sm">{viewingRepair.customer_phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Device</p>
                  <p className="font-medium">{viewingRepair.device_type}</p>
                  <p className="text-sm">{viewingRepair.brand} {viewingRepair.model}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className={getStatusColor(viewingRepair.status)}>
                    {viewingRepair.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="font-medium">{formatDate(viewingRepair.created_at)}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Issue Description</p>
                <p className="font-medium">{viewingRepair.issue_description}</p>
              </div>
              {viewingRepair.diagnosis && (
                <div>
                  <p className="text-sm text-muted-foreground">Diagnosis</p>
                  <p className="font-medium">{viewingRepair.diagnosis}</p>
                </div>
              )}
              <div className="rounded-lg bg-muted p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Parts Cost</p>
                    <p className="font-medium">{formatCurrency(viewingRepair.parts_cost)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Labor Cost</p>
                    <p className="font-medium">{formatCurrency(viewingRepair.labor_cost)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">GST</p>
                    <p className="font-medium">{formatCurrency(viewingRepair.gst_amount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-lg font-bold">{formatCurrency(viewingRepair.final_price)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
