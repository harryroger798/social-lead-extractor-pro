import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Wrench,
  FileText,
  Settings,
  Package,
  Monitor,
  LogOut,
  Activity,
  BarChart3,
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

const navigation = [
  { name: 'Dashboard', href: '/app', icon: LayoutDashboard },
  { name: 'Customers', href: '/app/customers', icon: Users },
  { name: 'Repairs', href: '/app/repairs', icon: Wrench },
  { name: 'Invoices', href: '/app/invoices', icon: FileText },
  { name: 'Services', href: '/app/services', icon: Package },
  { name: 'Digital Services', href: '/app/digital-services', icon: Monitor },
  { name: 'Reports', href: '/app/reports', icon: BarChart3 },
  { name: 'Activity Log', href: '/app/activity', icon: Activity },
  { name: 'Settings', href: '/app/settings', icon: Settings },
]

export function Sidebar() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex h-full w-64 flex-col border-r bg-card">
      <div className="flex h-16 items-center border-b px-6">
        <h1 className="text-xl font-bold text-primary">ByteCare</h1>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      <Separator />

      <div className="p-4">
        <div className="mb-3 rounded-lg bg-muted p-3">
          <p className="text-sm font-medium capitalize">{user?.username || 'User'}</p>
          <p className="text-xs text-muted-foreground capitalize">{user?.role || 'User'}</p>
        </div>
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  )
}
