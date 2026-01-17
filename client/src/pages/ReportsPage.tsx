import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Download, FileText, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { dashboardApi, exportsApi } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

export function ReportsPage() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const [exportType, setExportType] = useState('repairs')
  const { toast } = useToast()

  const { data: overview } = useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: () => dashboardApi.getOverview(),
  })

  const { data: revenueChart } = useQuery({
    queryKey: ['dashboard-revenue', 'month'],
    queryFn: () => dashboardApi.getRevenueChart('month'),
  })

  const { data: serviceBreakdown } = useQuery({
    queryKey: ['dashboard-service-breakdown'],
    queryFn: () => dashboardApi.getServiceBreakdown(),
  })

  const { data: topServices } = useQuery({
    queryKey: ['dashboard-top-services'],
    queryFn: () => dashboardApi.getTopServices(),
  })

  const stats = overview?.data?.data || {}
  const revenueData = revenueChart?.data?.data || []
  const serviceData = serviceBreakdown?.data?.data || []
  const topServicesData = topServices?.data?.data || []

  const handleExportCSV = async () => {
    try {
      const [year, month] = selectedMonth.split('-')
      const response = await exportsApi.exportCSV({
        type: exportType,
        month: parseInt(month),
        year: parseInt(year),
      })
      
      const blob = new Blob([response.data], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${exportType}-${selectedMonth}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
      
      toast({ title: 'Export downloaded successfully' })
    } catch {
      toast({ variant: 'destructive', title: 'Failed to export data' })
    }
  }

  const handleExportGSTR1 = async () => {
    try {
      const [year, month] = selectedMonth.split('-')
      const response = await exportsApi.exportGSTR1({
        month: parseInt(month),
        year: parseInt(year),
      })
      
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `gstr1-${selectedMonth}.json`
      a.click()
      window.URL.revokeObjectURL(url)
      
      toast({ title: 'GSTR-1 data exported successfully' })
    } catch {
      toast({ variant: 'destructive', title: 'Failed to export GSTR-1 data' })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="text-muted-foreground">View analytics and export data</p>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="exports">Exports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Monthly Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(stats.month?.revenue || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.month?.repairs || 0} repairs this month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Monthly Profit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(stats.month?.profit || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  After parts cost
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Avg. Repair Value
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(stats.month?.repairs ? (stats.month.revenue / stats.month.repairs) : 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Per repair ticket
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Avg. Turnaround
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.avg_turnaround_time || 0} hrs
                </div>
                <p className="text-xs text-muted-foreground">
                  Repair completion time
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Bar dataKey="revenue" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Revenue</CardTitle>
              <CardDescription>Revenue breakdown by day</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Bar dataKey="revenue" fill="hsl(var(--primary))" name="Revenue" />
                    <Bar dataKey="profit" fill="hsl(var(--chart-2))" name="Profit" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Service Category Breakdown</CardTitle>
                <CardDescription>Revenue by service category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={serviceData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name} (${(percent * 100).toFixed(0)}%)`
                        }
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="revenue"
                        nameKey="category"
                      >
                        {serviceData.map((_: unknown, index: number) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Services</CardTitle>
                <CardDescription>Most popular services by revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topServicesData.length === 0 ? (
                    <p className="text-center text-muted-foreground">No data available</p>
                  ) : (
                    topServicesData.map((service: { name: string; revenue: number; count: number }, index: number) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{service.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {service.count} repairs
                          </p>
                        </div>
                        <p className="font-bold">{formatCurrency(service.revenue)}</p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="exports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Export Data
              </CardTitle>
              <CardDescription>
                Export your data in various formats
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="month">Month</Label>
                  <Input
                    id="month"
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="export-type">Data Type</Label>
                  <Select value={exportType} onValueChange={setExportType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="repairs">Repairs</SelectItem>
                      <SelectItem value="invoices">Invoices</SelectItem>
                      <SelectItem value="customers">Customers</SelectItem>
                      <SelectItem value="payments">Payments</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button onClick={handleExportCSV} className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Export CSV
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                GST Reports
              </CardTitle>
              <CardDescription>
                Generate GST reports for filing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="gst-month">Month</Label>
                  <Input
                    id="gst-month"
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                  />
                </div>
                <div className="flex items-end gap-2">
                  <Button onClick={handleExportGSTR1} variant="outline" className="flex-1">
                    <Calendar className="mr-2 h-4 w-4" />
                    GSTR-1
                  </Button>
                  <Button variant="outline" className="flex-1" disabled>
                    <Calendar className="mr-2 h-4 w-4" />
                    GSTR-3B
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                GSTR-1 contains outward supplies data. GSTR-3B is a summary return.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
