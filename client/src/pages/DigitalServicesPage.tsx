import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Plus, Search, MoreHorizontal, Pencil, Eye, Trash2, Globe, Sparkles } from 'lucide-react'
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
import { Switch } from '@/components/ui/switch'
import { digitalServicesApi, customersApi } from '@/lib/api'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

interface DigitalService {
  id: number
  project_name: string
  customer_id: number
  customer_name: string
  customer_phone: string
  service_type: string
  description: string
  status: string
  is_retainer: boolean
  retainer_amount: number
  retainer_frequency: string
  total_amount: number
  amount_paid: number
  start_date: string
  deadline: string
  completed_at: string
  created_at: string
}

const SERVICE_TYPES = ['website', 'app', 'seo', 'social_media', 'graphic_design', 'video_editing', 'other']
const STATUSES = ['pending', 'in_progress', 'review', 'completed', 'cancelled']

export function DigitalServicesPage() {
  const { i18n } = useTranslation()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<DigitalService | null>(null)
  const [viewingProject, setViewingProject] = useState<DigitalService | null>(null)
  const [isRetainer, setIsRetainer] = useState(false)
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { data, isLoading } = useQuery({
    queryKey: ['digital-services', search, statusFilter],
    queryFn: () => digitalServicesApi.getAll({ search, status: statusFilter === 'all' ? undefined : statusFilter, limit: 50 }),
  })

  const { data: customersData } = useQuery({
    queryKey: ['customers-list'],
    queryFn: () => customersApi.getAll({ limit: 100 }),
  })

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => digitalServicesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['digital-services'] })
      setIsDialogOpen(false)
      setIsRetainer(false)
      toast({ title: 'Project created successfully' })
    },
    onError: () => {
      toast({ variant: 'destructive', title: 'Failed to create project' })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) =>
      digitalServicesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['digital-services'] })
      setIsDialogOpen(false)
      setEditingProject(null)
      toast({ title: 'Project updated successfully' })
    },
    onError: () => {
      toast({ variant: 'destructive', title: 'Failed to update project' })
    },
  })

    const updateStatusMutation = useMutation({
      mutationFn: ({ id, status }: { id: number; status: string }) =>
        digitalServicesApi.updateStatus(id, status),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['digital-services'] })
        toast({ title: 'Status updated successfully' })
      },
      onError: () => {
        toast({ variant: 'destructive', title: 'Failed to update status' })
      },
    })

    const deleteMutation = useMutation({
      mutationFn: (id: number) => digitalServicesApi.delete(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['digital-services'] })
        toast({ title: 'Project deleted successfully' })
      },
      onError: () => {
        toast({ variant: 'destructive', title: 'Failed to delete project' })
      },
    })

    const projects = data?.data?.data || []
  const customers = customersData?.data?.data || []

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const projectData = {
      project_name: formData.get('project_name'),
      customer_id: Number(formData.get('customer_id')),
      service_type: formData.get('service_type'),
      description: formData.get('description'),
      is_retainer: isRetainer,
      retainer_amount: isRetainer ? Number(formData.get('retainer_amount')) : 0,
      retainer_frequency: isRetainer ? formData.get('retainer_frequency') : null,
      total_amount: Number(formData.get('total_amount')) || 0,
      deadline: formData.get('deadline') || null,
    }

    if (editingProject) {
      updateMutation.mutate({ id: editingProject.id, data: projectData })
    } else {
      createMutation.mutate(projectData)
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
            className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/25"
          >
            <Globe className="h-6 w-6 text-white" />
          </motion.div>
          <div>
            <h1 className="text-3xl font-bold dark:text-white">Digital Services</h1>
            <p className="text-muted-foreground flex items-center gap-2">
              {i18n.language === 'hi' ? 'Digital projects aur retainers manage karein' :
               i18n.language === 'bn' ? 'ডিজিটাল প্রজেক্ট এবং রিটেইনার পরিচালনা করুন' :
               'Manage digital service projects and retainers'}
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
            className="gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-0 shadow-lg shadow-indigo-500/25"
          >
            <Plus className="h-4 w-4" />
            New Project
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
          <div className="h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
          <CardHeader>
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative flex-1 min-w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={i18n.language === 'hi' ? 'Projects khojein...' :
                              i18n.language === 'bn' ? 'প্রজেক্ট খুঁজুন...' :
                              'Search projects...'}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 bg-white/50 dark:bg-slate-700/50 border-white/20 dark:border-slate-600"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 bg-white/50 dark:bg-slate-700/50 border-white/20 dark:border-slate-600">
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
                    <TableHead className="font-semibold">Project</TableHead>
                    <TableHead className="font-semibold">Customer</TableHead>
                    <TableHead className="font-semibold">Type</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Amount</TableHead>
                    <TableHead className="font-semibold">Deadline</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12">
                        <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-2 opacity-50" />
                        <p className="text-muted-foreground">
                          {i18n.language === 'hi' ? 'Koi project nahi mila' :
                           i18n.language === 'bn' ? 'কোনো প্রজেক্ট পাওয়া যায়নি' :
                           'No projects found'}
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    projects.map((project: DigitalService, index: number) => (
                      <motion.tr
                        key={project.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50"
                      >
                        <TableCell>
                          <div>
                            <p className="font-medium dark:text-white">{project.project_name}</p>
                            {project.is_retainer && (
                              <Badge variant="info" className="mt-1 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-indigo-500/30">Retainer</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium dark:text-white">{project.customer_name}</p>
                            <p className="text-sm text-muted-foreground">{project.customer_phone}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-indigo-500/30">
                            {project.service_type.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={project.status}
                            onValueChange={(status) =>
                              updateStatusMutation.mutate({ id: project.id, status })
                            }
                          >
                            <SelectTrigger className="w-32 bg-white/50 dark:bg-slate-700/50">
                              <Badge className={getStatusColor(project.status)}>
                                {project.status.replace('_', ' ')}
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
                        <TableCell>
                          {project.is_retainer ? (
                            <div>
                              <p className="font-semibold text-green-600 dark:text-green-400">{formatCurrency(project.retainer_amount)}</p>
                              <p className="text-xs text-muted-foreground">/{project.retainer_frequency}</p>
                            </div>
                          ) : (
                            <span className="font-semibold text-green-600 dark:text-green-400">{formatCurrency(project.total_amount)}</span>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {project.deadline ? formatDate(project.deadline) : '-'}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="hover:bg-slate-100 dark:hover:bg-slate-700">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setViewingProject(project)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditingProject(project)
                                  setIsRetainer(project.is_retainer)
                                  setIsDialogOpen(true)
                                }}
                              >
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => {
                                  if (confirm('Are you sure you want to delete this project?')) {
                                    deleteMutation.mutate(project.id)
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
        if (!open) {
          setEditingProject(null)
          setIsRetainer(false)
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingProject ? 'Edit Project' : 'New Digital Service Project'}</DialogTitle>
            <DialogDescription>
              {editingProject ? 'Update project details' : 'Create a new digital service project'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="project_name">Project Name *</Label>
                  <Input
                    id="project_name"
                    name="project_name"
                    defaultValue={editingProject?.project_name}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customer_id">Customer *</Label>
                  <Select name="customer_id" defaultValue={editingProject?.customer_id?.toString()}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((c: { id: number; name: string; phone: string }) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.name} - {c.phone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="service_type">Service Type *</Label>
                  <Select name="service_type" defaultValue={editingProject?.service_type || 'website'}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SERVICE_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.replace('_', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deadline">Deadline</Label>
                  <Input
                    id="deadline"
                    name="deadline"
                    type="date"
                    defaultValue={editingProject?.deadline?.split('T')[0]}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={editingProject?.description}
                />
              </div>
              <div className="flex items-center gap-4">
                <Switch
                  id="is_retainer"
                  checked={isRetainer}
                  onCheckedChange={setIsRetainer}
                />
                <Label htmlFor="is_retainer">This is a retainer project</Label>
              </div>
              {isRetainer ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="retainer_amount">Retainer Amount *</Label>
                    <Input
                      id="retainer_amount"
                      name="retainer_amount"
                      type="number"
                      min="0"
                      defaultValue={editingProject?.retainer_amount || 0}
                      required={isRetainer}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="retainer_frequency">Frequency *</Label>
                    <Select name="retainer_frequency" defaultValue={editingProject?.retainer_frequency || 'monthly'}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="total_amount">Total Amount</Label>
                  <Input
                    id="total_amount"
                    name="total_amount"
                    type="number"
                    min="0"
                    defaultValue={editingProject?.total_amount || 0}
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingProject ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewingProject} onOpenChange={() => setViewingProject(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Project Details</DialogTitle>
          </DialogHeader>
          {viewingProject && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Project Name</p>
                  <p className="font-medium">{viewingProject.project_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Customer</p>
                  <p className="font-medium">{viewingProject.customer_name}</p>
                  <p className="text-sm">{viewingProject.customer_phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Service Type</p>
                  <Badge variant="outline">{viewingProject.service_type.replace('_', ' ')}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className={getStatusColor(viewingProject.status)}>
                    {viewingProject.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Start Date</p>
                  <p className="font-medium">{formatDate(viewingProject.start_date || viewingProject.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Deadline</p>
                  <p className="font-medium">{viewingProject.deadline ? formatDate(viewingProject.deadline) : '-'}</p>
                </div>
              </div>
              {viewingProject.description && (
                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="font-medium">{viewingProject.description}</p>
                </div>
              )}
              <div className="rounded-lg bg-muted p-4">
                <div className="grid grid-cols-2 gap-4">
                  {viewingProject.is_retainer ? (
                    <>
                      <div>
                        <p className="text-sm text-muted-foreground">Retainer Amount</p>
                        <p className="font-medium">{formatCurrency(viewingProject.retainer_amount)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Frequency</p>
                        <p className="font-medium capitalize">{viewingProject.retainer_frequency}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Amount</p>
                        <p className="font-medium">{formatCurrency(viewingProject.total_amount)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Amount Paid</p>
                        <p className="font-medium text-green-600">{formatCurrency(viewingProject.amount_paid)}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
