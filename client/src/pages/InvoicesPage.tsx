import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, MoreHorizontal, Eye, Send, QrCode, CreditCard } from 'lucide-react'
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
import { invoicesApi } from '@/lib/api'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

interface Invoice {
  id: number
  invoice_number: string
  repair_id: number
  customer_id: number
  customer_name: string
  customer_phone: string
  customer_email: string
  subtotal: number
  discount: number
  gst_amount: number
  total_amount: number
  amount_paid: number
  payment_status: string
  due_date: string
  created_at: string
}

export function InvoicesPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [qrDialogOpen, setQrDialogOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { data, isLoading } = useQuery({
    queryKey: ['invoices', search, statusFilter],
    queryFn: () => invoicesApi.getAll({ search, status: statusFilter || undefined, limit: 50 }),
  })

  const markPaidMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) =>
      invoicesApi.markPaid(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      setPaymentDialogOpen(false)
      setSelectedInvoice(null)
      toast({ title: 'Payment recorded successfully' })
    },
    onError: () => {
      toast({ variant: 'destructive', title: 'Failed to record payment' })
    },
  })

  const sendEmailMutation = useMutation({
    mutationFn: (id: number) => invoicesApi.sendEmail(id),
    onSuccess: () => {
      toast({ title: 'Invoice sent via email' })
    },
    onError: () => {
      toast({ variant: 'destructive', title: 'Failed to send email' })
    },
  })

  const invoices = data?.data?.data || []

  const handlePayment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedInvoice) return
    const formData = new FormData(e.currentTarget)
    const paymentData = {
      amount: Number(formData.get('amount')),
      payment_method: formData.get('payment_method'),
      reference_number: formData.get('reference_number'),
    }
    markPaidMutation.mutate({ id: selectedInvoice.id, data: paymentData })
  }

  const showQRCode = async (invoice: Invoice) => {
    try {
      const response = await invoicesApi.getPaymentQR(invoice.id)
      setQrCodeUrl(response.data.data.qr_code)
      setSelectedInvoice(invoice)
      setQrDialogOpen(true)
    } catch {
      toast({ variant: 'destructive', title: 'Failed to generate QR code' })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Invoices</h1>
          <p className="text-muted-foreground">Manage invoices and payments</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search invoices..."
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
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
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
                  <TableHead>Amount</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      No invoices found
                    </TableCell>
                  </TableRow>
                ) : (
                  invoices.map((invoice: Invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{invoice.customer_name}</p>
                          <p className="text-sm text-muted-foreground">{invoice.customer_phone}</p>
                        </div>
                      </TableCell>
                      <TableCell>{formatCurrency(invoice.total_amount)}</TableCell>
                      <TableCell>{formatCurrency(invoice.amount_paid)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(invoice.payment_status)}>
                          {invoice.payment_status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(invoice.due_date)}</TableCell>
                      <TableCell>{formatDate(invoice.created_at)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setViewingInvoice(invoice)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            {invoice.payment_status !== 'paid' && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedInvoice(invoice)
                                    setPaymentDialogOpen(true)
                                  }}
                                >
                                  <CreditCard className="mr-2 h-4 w-4" />
                                  Record Payment
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => showQRCode(invoice)}>
                                  <QrCode className="mr-2 h-4 w-4" />
                                  Show QR Code
                                </DropdownMenuItem>
                              </>
                            )}
                            {invoice.customer_email && (
                              <DropdownMenuItem
                                onClick={() => sendEmailMutation.mutate(invoice.id)}
                              >
                                <Send className="mr-2 h-4 w-4" />
                                Send Email
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

      <Dialog open={!!viewingInvoice} onOpenChange={() => setViewingInvoice(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Invoice Details - {viewingInvoice?.invoice_number}</DialogTitle>
          </DialogHeader>
          {viewingInvoice && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Customer</p>
                  <p className="font-medium">{viewingInvoice.customer_name}</p>
                  <p className="text-sm">{viewingInvoice.customer_phone}</p>
                  {viewingInvoice.customer_email && (
                    <p className="text-sm">{viewingInvoice.customer_email}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className={getStatusColor(viewingInvoice.payment_status)}>
                    {viewingInvoice.payment_status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Due Date</p>
                  <p className="font-medium">{formatDate(viewingInvoice.due_date)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="font-medium">{formatDate(viewingInvoice.created_at)}</p>
                </div>
              </div>
              <div className="rounded-lg bg-muted p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Subtotal</p>
                    <p className="font-medium">{formatCurrency(viewingInvoice.subtotal)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Discount</p>
                    <p className="font-medium">{formatCurrency(viewingInvoice.discount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">GST</p>
                    <p className="font-medium">{formatCurrency(viewingInvoice.gst_amount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-lg font-bold">{formatCurrency(viewingInvoice.total_amount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Amount Paid</p>
                    <p className="font-medium text-green-600">{formatCurrency(viewingInvoice.amount_paid)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Balance Due</p>
                    <p className="font-medium text-red-600">
                      {formatCurrency(viewingInvoice.total_amount - viewingInvoice.amount_paid)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Record a payment for invoice {selectedInvoice?.invoice_number}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePayment}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  max={selectedInvoice ? selectedInvoice.total_amount - selectedInvoice.amount_paid : 0}
                  defaultValue={selectedInvoice ? selectedInvoice.total_amount - selectedInvoice.amount_paid : 0}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment_method">Payment Method *</Label>
                <Select name="payment_method" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reference_number">Reference Number</Label>
                <Input id="reference_number" name="reference_number" placeholder="Transaction ID / Cheque No." />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setPaymentDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={markPaidMutation.isPending}>
                Record Payment
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Payment QR Code</DialogTitle>
            <DialogDescription>
              Scan to pay {formatCurrency(selectedInvoice ? selectedInvoice.total_amount - selectedInvoice.amount_paid : 0)}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            {qrCodeUrl && (
              <img src={qrCodeUrl} alt="Payment QR Code" className="h-64 w-64" />
            )}
            <p className="text-center text-sm text-muted-foreground">
              Invoice: {selectedInvoice?.invoice_number}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
