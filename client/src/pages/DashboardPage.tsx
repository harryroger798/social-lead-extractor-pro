import { useQuery } from '@tanstack/react-query'
import {
  IndianRupee,
  Wrench,
  Users,
  FileText,
  TrendingUp,
  Clock,
  AlertTriangle,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { dashboardApi } from '@/lib/api'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

export function DashboardPage() {
  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: () => dashboardApi.getOverview(),
  })

  const { data: revenueChart } = useQuery({
    queryKey: ['dashboard-revenue'],
    queryFn: () => dashboardApi.getRevenueChart('month'),
  })

  const { data: repairStatus } = useQuery({
    queryKey: ['dashboard-repair-status'],
    queryFn: () => dashboardApi.getRepairStatus(),
  })

  const { data: recentRepairs } = useQuery({
    queryKey: ['dashboard-recent-repairs'],
    queryFn: () => dashboardApi.getRecentRepairs(5),
  })

  const { data: alerts } = useQuery({
    queryKey: ['dashboard-alerts'],
    queryFn: () => dashboardApi.getAlerts(),
  })

  const stats = overview?.data?.data || {}
  const chartData = revenueChart?.data?.data || []
  const statusDataRaw = repairStatus?.data?.data || {}
  // Convert status object to array format for PieChart
  const statusData = Object.entries(statusDataRaw).map(([status, count]) => ({
    status: status.replace('_', ' '),
    count: count as number,
    name: status.replace('_', ' ')
  })).filter(item => item.count > 0)
  const repairs = recentRepairs?.data?.data || []
  const alertsData = alerts?.data?.data || {}

  const statCards = [
    {
      title: "Today's Revenue",
      value: formatCurrency(stats.today?.revenue || 0),
      icon: IndianRupee,
      description: `${stats.today?.repairs || 0} repairs completed`,
      trend: '+12%',
    },
    {
      title: 'Active Repairs',
      value: stats.pending_repairs || 0,
      icon: Wrench,
      description: 'In progress',
      trend: null,
    },
    {
      title: 'Total Customers',
      value: stats.total_customers || 0,
      icon: Users,
      description: `${stats.new_customers_this_month || 0} new this month`,
      trend: '+8%',
    },
    {
      title: 'Pending Payments',
      value: formatCurrency(stats.pending_payments || 0),
      icon: FileText,
      description: `${stats.overdue_invoices || 0} overdue`,
      trend: null,
    },
  ]

  if (overviewLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening with your shop today.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center gap-2">
                <p className="text-xs text-muted-foreground">{stat.description}</p>
                {stat.trend && (
                  <Badge variant="success" className="text-xs">
                    <TrendingUp className="mr-1 h-3 w-3" />
                    {stat.trend}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Monthly revenue for the past 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Repair Status</CardTitle>
            <CardDescription>Current repair ticket distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} (${(percent * 100).toFixed(0)}%)`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="status"
                  >
                    {statusData.map((_: unknown, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Repairs</CardTitle>
            <CardDescription>Latest repair tickets</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {repairs.length === 0 ? (
                <p className="text-center text-muted-foreground">No recent repairs</p>
              ) : (
                repairs.map((repair: {
                  id: number
                  invoice_number: string
                  customer_name: string
                  device_type: string
                  brand: string
                  model: string
                  status: string
                  created_at: string
                }) => (
                  <div
                    key={repair.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="font-medium">{repair.invoice_number}</p>
                      <p className="text-sm text-muted-foreground">
                        {repair.customer_name} - {repair.device_type} {repair.brand}{' '}
                        {repair.model}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(repair.status)}>
                        {repair.status.replace('_', ' ')}
                      </Badge>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatDate(repair.created_at)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Alerts
            </CardTitle>
            <CardDescription>Items requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alertsData.overdue_repairs?.length > 0 && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-red-500" />
                    <p className="font-medium text-red-700">
                      {alertsData.overdue_repairs.length} Overdue Repairs
                    </p>
                  </div>
                  <p className="mt-1 text-sm text-red-600">
                    Repairs pending for more than 7 days
                  </p>
                </div>
              )}
              {alertsData.overdue_invoices?.length > 0 && (
                <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-orange-500" />
                    <p className="font-medium text-orange-700">
                      {alertsData.overdue_invoices.length} Overdue Invoices
                    </p>
                  </div>
                  <p className="mt-1 text-sm text-orange-600">
                    Invoices past due date
                  </p>
                </div>
              )}
              {alertsData.warranty_expiring?.length > 0 && (
                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    <p className="font-medium text-yellow-700">
                      {alertsData.warranty_expiring.length} Warranties Expiring
                    </p>
                  </div>
                  <p className="mt-1 text-sm text-yellow-600">
                    Warranties expiring within 7 days
                  </p>
                </div>
              )}
              {!alertsData.overdue_repairs?.length &&
                !alertsData.overdue_invoices?.length &&
                !alertsData.warranty_expiring?.length && (
                  <p className="text-center text-muted-foreground">
                    No alerts at this time
                  </p>
                )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
