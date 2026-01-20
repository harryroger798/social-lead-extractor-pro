import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  IndianRupee,
  Wrench,
  Users,
  FileText,
  TrendingUp,
  Clock,
  AlertTriangle,
  Sparkles,
  Activity,
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

const COLORS = ['#06b6d4', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981', '#ec4899']

const statCardColors = [
  { bg: 'from-cyan-500 to-blue-500', shadow: 'shadow-cyan-500/25' },
  { bg: 'from-purple-500 to-pink-500', shadow: 'shadow-purple-500/25' },
  { bg: 'from-green-500 to-emerald-500', shadow: 'shadow-green-500/25' },
  { bg: 'from-orange-500 to-red-500', shadow: 'shadow-orange-500/25' },
]

export function DashboardPage() {
  const { i18n } = useTranslation()
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

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (i18n.language === 'hi') {
      if (hour < 12) return 'Suprabhat!'
      if (hour < 17) return 'Namaskar!'
      return 'Shubh Sandhya!'
    }
    if (i18n.language === 'bn') {
      if (hour < 12) return 'সুপ্রভাত!'
      if (hour < 17) return 'নমস্কার!'
      return 'শুভ সন্ধ্যা!'
    }
    if (hour < 12) return 'Good Morning!'
    if (hour < 17) return 'Good Afternoon!'
    return 'Good Evening!'
  }

  if (overviewLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent"
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                    className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center"
                  >
                    <Activity className="h-6 w-6 text-white" />
                  </motion.div>
                  <div>
                    <h1 className="text-3xl font-bold dark:text-white">Dashboard</h1>
                    <p className="text-muted-foreground flex items-center gap-2">
                      {getGreeting()} 
                      <Sparkles className="h-4 w-4 text-primary" />
                      {i18n.language === 'hi' ? 'Aaj ka business kaisa chal raha hai?' :
                       i18n.language === 'bn' ? 'আজকের ব্যবসা কেমন চলছে?' :
                       "Here's what's happening with your shop today."}
                    </p>
                  </div>
                </div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="hidden md:block"
                >
                  <img 
                    src="/images/dashboard-welcome.png" 
                    alt="Welcome" 
                    className="h-24 w-auto object-contain"
                  />
                </motion.div>
              </div>
            </motion.div>

      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            whileHover={{ y: -5, scale: 1.02 }}
          >
            <Card className={`overflow-hidden border-0 shadow-lg ${statCardColors[index].shadow}`}>
              <div className={`h-1 bg-gradient-to-r ${statCardColors[index].bg}`} />
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className={`h-10 w-10 rounded-lg bg-gradient-to-br ${statCardColors[index].bg} flex items-center justify-center`}
                >
                  <stat.icon className="h-5 w-5 text-white" />
                </motion.div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold dark:text-white">{stat.value}</div>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                  {stat.trend && (
                    <Badge variant="success" className="text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                      <TrendingUp className="mr-1 h-3 w-3" />
                      {stat.trend}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="overflow-hidden border-0 shadow-lg backdrop-blur-lg bg-white/70 dark:bg-slate-800/70">
            <div className="h-1 bg-gradient-to-r from-cyan-500 to-blue-500" />
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
                <div>
                  <CardTitle className="dark:text-white">Revenue Trend</CardTitle>
                  <CardDescription>Monthly revenue for the past 30 days</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="url(#colorGradient)"
                      strokeWidth={3}
                      dot={{ fill: '#06b6d4', strokeWidth: 2 }}
                    />
                    <defs>
                      <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#06b6d4" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                    </defs>
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="overflow-hidden border-0 shadow-lg backdrop-blur-lg bg-white/70 dark:bg-slate-800/70">
            <div className="h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Wrench className="h-4 w-4 text-white" />
                </div>
                <div>
                  <CardTitle className="dark:text-white">Repair Status</CardTitle>
                  <CardDescription>Current repair ticket distribution</CardDescription>
                </div>
              </div>
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
        </motion.div>
      </div>

      {/* Recent Repairs & Alerts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card className="overflow-hidden border-0 shadow-lg backdrop-blur-lg bg-white/70 dark:bg-slate-800/70">
            <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-500" />
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-white" />
                </div>
                <div>
                  <CardTitle className="dark:text-white">Recent Repairs</CardTitle>
                  <CardDescription>Latest repair tickets</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                                {repairs.length === 0 ? (
                                  <div className="text-center py-8">
                                    <img 
                                      src="/images/empty-state.png" 
                                      alt="No repairs" 
                                      className="w-32 h-32 mx-auto mb-4 object-contain opacity-70"
                                    />
                                    <p className="text-muted-foreground">
                                      {i18n.language === 'hi' ? 'Koi recent repairs nahi' :
                                       i18n.language === 'bn' ? 'কোনো সাম্প্রতিক মেরামত নেই' :
                                       'No recent repairs'}
                                    </p>
                                  </div>
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
                  }, index: number) => (
                    <motion.div
                      key={repair.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      whileHover={{ x: 5 }}
                      className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-white/50 dark:bg-slate-700/50 hover:shadow-md transition-shadow"
                    >
                      <div>
                        <p className="font-semibold dark:text-white">{repair.invoice_number}</p>
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
                    </motion.div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <Card className="overflow-hidden border-0 shadow-lg backdrop-blur-lg bg-white/70 dark:bg-slate-800/70">
            <div className="h-1 bg-gradient-to-r from-orange-500 to-red-500" />
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                  <AlertTriangle className="h-4 w-4 text-white" />
                </div>
                <div>
                  <CardTitle className="dark:text-white">Alerts</CardTitle>
                  <CardDescription>Items requiring attention</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alertsData.overdue_repairs?.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/30 p-4"
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-red-500 flex items-center justify-center">
                        <Clock className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-red-700 dark:text-red-400">
                          {alertsData.overdue_repairs.length} Overdue Repairs
                        </p>
                        <p className="text-sm text-red-600 dark:text-red-500">
                          Repairs pending for more than 7 days
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
                {alertsData.overdue_invoices?.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-xl border border-orange-200 dark:border-orange-900 bg-orange-50 dark:bg-orange-900/30 p-4"
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-orange-500 flex items-center justify-center">
                        <FileText className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-orange-700 dark:text-orange-400">
                          {alertsData.overdue_invoices.length} Overdue Invoices
                        </p>
                        <p className="text-sm text-orange-600 dark:text-orange-500">
                          Invoices past due date
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
                {alertsData.warranty_expiring?.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-xl border border-yellow-200 dark:border-yellow-900 bg-yellow-50 dark:bg-yellow-900/30 p-4"
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-yellow-500 flex items-center justify-center">
                        <AlertTriangle className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-yellow-700 dark:text-yellow-400">
                          {alertsData.warranty_expiring.length} Warranties Expiring
                        </p>
                        <p className="text-sm text-yellow-600 dark:text-yellow-500">
                          Warranties expiring within 7 days
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
                {!alertsData.overdue_repairs?.length &&
                  !alertsData.overdue_invoices?.length &&
                  !alertsData.warranty_expiring?.length && (
                    <div className="text-center py-8">
                      <Sparkles className="h-12 w-12 text-green-500 mx-auto mb-2" />
                      <p className="text-muted-foreground">
                        {i18n.language === 'hi' ? 'Sab theek hai! Koi alerts nahi.' :
                         i18n.language === 'bn' ? 'সব ঠিক আছে! কোনো অ্যালার্ট নেই।' :
                         'All good! No alerts at this time.'}
                      </p>
                    </div>
                  )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
