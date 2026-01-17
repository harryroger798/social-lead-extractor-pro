import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { Layout } from '@/components/layout/Layout'
import { LoginPage } from '@/pages/LoginPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { CustomersPage } from '@/pages/CustomersPage'
import { RepairsPage } from '@/pages/RepairsPage'
import { InvoicesPage } from '@/pages/InvoicesPage'
import { ServicesPage } from '@/pages/ServicesPage'
import { DigitalServicesPage } from '@/pages/DigitalServicesPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { ReportsPage } from '@/pages/ReportsPage'
import { ActivityLogPage } from '@/pages/ActivityLogPage'
import { Toaster } from '@/components/ui/toaster'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  return <>{children}</>
}

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="repairs" element={<RepairsPage />} />
          <Route path="invoices" element={<InvoicesPage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="digital-services" element={<DigitalServicesPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="activity" element={<ActivityLogPage />} />
        </Route>
      </Routes>
      <Toaster />
    </>
  )
}

export default App
