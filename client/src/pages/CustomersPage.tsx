import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Eye, Users, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { customersApi } from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

interface Customer {
  id: number
  name: string
  phone: string
  email: string
  address: string
  city: string
  source: string
  business_type: string
  gst_number: string
  total_spent: number
  repair_count: number
  created_at: string
}

export function CustomersPage() {
  const { i18n } = useTranslation()
  const [search, setSearch] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null)
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { data, isLoading } = useQuery({
    queryKey: ['customers', search],
    queryFn: () => customersApi.getAll({ search, limit: 50 }),
  })

    const createMutation = useMutation({
      mutationFn: (data: Record<string, unknown>) => customersApi.create(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['customers'] })
        queryClient.invalidateQueries({ queryKey: ['customers-list'] })
        setIsDialogOpen(false)
        toast({ title: 'Customer created successfully' })
      },
      onError: () => {
        toast({ variant: 'destructive', title: 'Failed to create customer' })
      },
    })

    const updateMutation = useMutation({
      mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) =>
        customersApi.update(id, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['customers'] })
        queryClient.invalidateQueries({ queryKey: ['customers-list'] })
        setIsDialogOpen(false)
        setEditingCustomer(null)
        toast({ title: 'Customer updated successfully' })
      },
      onError: () => {
        toast({ variant: 'destructive', title: 'Failed to update customer' })
      },
    })

    const deleteMutation = useMutation({
      mutationFn: (id: number) => customersApi.delete(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['customers'] })
        queryClient.invalidateQueries({ queryKey: ['customers-list'] })
        toast({ title: 'Customer deleted successfully' })
      },
      onError: () => {
        toast({ variant: 'destructive', title: 'Failed to delete customer' })
      },
    })

  const customers = data?.data?.data || []

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const customerData = {
      name: formData.get('name'),
      phone: formData.get('phone'),
      email: formData.get('email'),
      address: formData.get('address'),
      city: formData.get('city'),
      source: formData.get('source'),
      business_type: formData.get('business_type'),
      gst_number: formData.get('gst_number'),
      notes: formData.get('notes'),
    }

    if (editingCustomer) {
      updateMutation.mutate({ id: editingCustomer.id, data: customerData })
    } else {
      createMutation.mutate(customerData)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/25"
          >
            <Users className="h-6 w-6 text-white" />
          </motion.div>
          <div>
            <h1 className="text-3xl font-bold dark:text-white">Customers</h1>
            <p className="text-muted-foreground flex items-center gap-2">
              {i18n.language === 'hi' ? 'Apne customers ko manage karein' :
               i18n.language === 'bn' ? 'আপনার গ্রাহকদের পরিচালনা করুন' :
               'Manage your customer database'}
              <Sparkles className="h-4 w-4 text-primary" />
            </p>
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Button 
            onClick={() => setIsDialogOpen(true)}
            className="gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white border-0 shadow-lg shadow-cyan-500/25"
          >
            <Plus className="h-4 w-4" />
            Add Customer
          </Button>
        </motion.div>
      </motion.div>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="overflow-hidden border-0 shadow-lg backdrop-blur-lg bg-white/70 dark:bg-slate-800/70">
          <div className="h-1 bg-gradient-to-r from-cyan-500 to-blue-500" />
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={i18n.language === 'hi' ? 'Customers khojein...' :
                              i18n.language === 'bn' ? 'গ্রাহক খুঁজুন...' :
                              'Search customers...'}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 bg-white/50 dark:bg-slate-700/50 border-white/20 dark:border-slate-600"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
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
                    <TableHead className="font-semibold">Phone</TableHead>
                    <TableHead className="font-semibold">Email</TableHead>
                    <TableHead className="font-semibold">City</TableHead>
                    <TableHead className="font-semibold">Source</TableHead>
                    <TableHead className="font-semibold">Total Spent</TableHead>
                    <TableHead className="font-semibold">Repairs</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12">
                        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-2 opacity-50" />
                        <p className="text-muted-foreground">
                          {i18n.language === 'hi' ? 'Koi customer nahi mila' :
                           i18n.language === 'bn' ? 'কোনো গ্রাহক পাওয়া যায়নি' :
                           'No customers found'}
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    customers.map((customer: Customer, index: number) => (
                      <motion.tr
                        key={customer.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50"
                      >
                        <TableCell className="font-medium dark:text-white">{customer.name}</TableCell>
                        <TableCell>{customer.phone}</TableCell>
                        <TableCell>{customer.email || '-'}</TableCell>
                        <TableCell>{customer.city || '-'}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-cyan-500/30">
                            {customer.source || 'walk_in'}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold text-green-600 dark:text-green-400">
                          {formatCurrency(customer.total_spent || 0)}
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                            {customer.repair_count || 0}
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
                              <DropdownMenuItem onClick={() => setViewingCustomer(customer)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditingCustomer(customer)
                                  setIsDialogOpen(true)
                                }}
                              >
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => {
                                  if (confirm('Are you sure you want to delete this customer?')) {
                                    deleteMutation.mutate(customer.id)
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
      </motion.div>

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open)
        if (!open) setEditingCustomer(null)
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingCustomer ? 'Edit Customer' : 'Add New Customer'}</DialogTitle>
            <DialogDescription>
              {editingCustomer ? 'Update customer information' : 'Add a new customer to your database'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={editingCustomer?.name}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    defaultValue={editingCustomer?.phone}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={editingCustomer?.email}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="city"
                    defaultValue={editingCustomer?.city}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  name="address"
                  defaultValue={editingCustomer?.address}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="source">Source</Label>
                                    <Select name="source" defaultValue={editingCustomer?.source || 'Walk-in'}>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="Walk-in">Walk In</SelectItem>
                                        <SelectItem value="Referral">Referral</SelectItem>
                                        <SelectItem value="GMB">Google (GMB)</SelectItem>
                                        <SelectItem value="Facebook">Facebook</SelectItem>
                                        <SelectItem value="JustDial">JustDial</SelectItem>
                                        <SelectItem value="Email">Email</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                      </SelectContent>
                                    </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business_type">Business Type</Label>
                                    <Select name="business_type" defaultValue={editingCustomer?.business_type || 'individual'}>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="individual">Individual</SelectItem>
                                        <SelectItem value="business">Business</SelectItem>
                                        <SelectItem value="coaching">Coaching</SelectItem>
                                        <SelectItem value="clinic">Clinic</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                      </SelectContent>
                                    </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="gst_number">GST Number</Label>
                <Input
                  id="gst_number"
                  name="gst_number"
                  defaultValue={editingCustomer?.gst_number}
                  placeholder="For business customers"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" name="notes" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingCustomer ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewingCustomer} onOpenChange={() => setViewingCustomer(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
          </DialogHeader>
          {viewingCustomer && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{viewingCustomer.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{viewingCustomer.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{viewingCustomer.email || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">City</p>
                  <p className="font-medium">{viewingCustomer.city || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                  <p className="font-medium">{formatCurrency(viewingCustomer.total_spent || 0)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Repairs</p>
                  <p className="font-medium">{viewingCustomer.repair_count || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Customer Since</p>
                  <p className="font-medium">{formatDate(viewingCustomer.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">GST Number</p>
                  <p className="font-medium">{viewingCustomer.gst_number || '-'}</p>
                </div>
              </div>
              {viewingCustomer.address && (
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">{viewingCustomer.address}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
