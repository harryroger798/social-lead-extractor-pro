import axios from 'axios'

declare global {
  interface Window {
    electronAPI?: {
      getServerPort: () => Promise<number>
      isElectron: boolean
    }
  }
}

function getApiUrl(): string {
  if (typeof window !== 'undefined' && window.electronAPI?.isElectron) {
    return 'http://127.0.0.1:3001/api'
  }
  return import.meta.env.VITE_API_URL || '/api'
}

const API_URL = getApiUrl()

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authApi = {
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  register: (data: { username: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  changePassword: (data: { current_password: string; new_password: string }) =>
    api.post('/auth/change-password', data),
  getUsers: () => api.get('/auth/users'),
  updateUser: (id: number, data: Record<string, unknown>) =>
    api.put(`/auth/users/${id}`, data),
  deleteUser: (id: number) => api.delete(`/auth/users/${id}`),
}

export const customersApi = {
  getAll: (params?: Record<string, unknown>) =>
    api.get('/customers', { params }),
  getById: (id: number) => api.get(`/customers/${id}`),
  create: (data: Record<string, unknown>) => api.post('/customers', data),
  update: (id: number, data: Record<string, unknown>) =>
    api.put(`/customers/${id}`, data),
  delete: (id: number) => api.delete(`/customers/${id}`),
  getRepairs: (id: number, params?: Record<string, unknown>) =>
    api.get(`/customers/${id}/repairs`, { params }),
  getInvoices: (id: number, params?: Record<string, unknown>) =>
    api.get(`/customers/${id}/invoices`, { params }),
  getStats: (id: number) => api.get(`/customers/${id}/stats`),
}

export const repairsApi = {
  getAll: (params?: Record<string, unknown>) => api.get('/repairs', { params }),
  getById: (id: number) => api.get(`/repairs/${id}`),
  create: (data: Record<string, unknown>) => api.post('/repairs', data),
  update: (id: number, data: Record<string, unknown>) =>
    api.put(`/repairs/${id}`, data),
  updateStatus: (id: number, status: string) =>
    api.patch(`/repairs/${id}/status`, { status }),
  delete: (id: number) => api.delete(`/repairs/${id}`),
  complete: (id: number) => api.post(`/repairs/${id}/complete`),
  getStatusSummary: () => api.get('/repairs/status/summary'),
}

export const servicesApi = {
  getAll: (params?: Record<string, unknown>) => api.get('/services', { params }),
  getById: (id: number) => api.get(`/services/${id}`),
  create: (data: Record<string, unknown>) => api.post('/services', data),
  update: (id: number, data: Record<string, unknown>) =>
    api.put(`/services/${id}`, data),
  delete: (id: number) => api.delete(`/services/${id}`),
  getByCategory: (category: string) => api.get(`/services/category/${category}`),
  getPhoneModels: () => api.get('/services/phone-models/list'),
  createPhoneModel: (data: Record<string, unknown>) =>
    api.post('/services/phone-models', data),
  updatePhoneModel: (id: number, data: Record<string, unknown>) =>
    api.put(`/services/phone-models/${id}`, data),
  getPhoneQuote: (id: number) => api.get(`/services/phone-models/${id}/quote`),
}

export const invoicesApi = {
  getAll: (params?: Record<string, unknown>) => api.get('/invoices', { params }),
  getById: (id: number) => api.get(`/invoices/${id}`),
  generate: (repairId: number) => api.post(`/invoices/${repairId}/generate`),
  markPaid: (id: number, data: Record<string, unknown>) =>
    api.post(`/invoices/${id}/mark-paid`, data),
  update: (id: number, data: Record<string, unknown>) =>
    api.put(`/invoices/${id}`, data),
  delete: (id: number) => api.delete(`/invoices/${id}`),
  getPaymentQR: (id: number) => api.get(`/invoices/${id}/payment-qr`),
  sendEmail: (id: number) => api.post(`/invoices/${id}/send-email`),
  sendSMS: (id: number) => api.post(`/invoices/${id}/send-sms`),
  getOverdue: () => api.get('/invoices/overdue/list'),
}

export const dashboardApi = {
  getOverview: () => api.get('/dashboard/overview'),
  getRevenueChart: (period?: string) =>
    api.get('/dashboard/revenue-chart', { params: { period } }),
  getRepairStatus: () => api.get('/dashboard/repair-status'),
  getTopServices: () => api.get('/dashboard/top-services'),
  getCustomerAcquisition: () => api.get('/dashboard/customer-acquisition'),
  getRecentRepairs: (limit?: number) =>
    api.get('/dashboard/recent-repairs', { params: { limit } }),
  getRecentInvoices: (limit?: number) =>
    api.get('/dashboard/recent-invoices', { params: { limit } }),
  getAlerts: () => api.get('/dashboard/alerts'),
  getServiceBreakdown: () => api.get('/dashboard/service-breakdown'),
  getProfitMargin: () => api.get('/dashboard/profit-margin'),
}

export const settingsApi = {
  getAll: () => api.get('/settings'),
  getPublic: () => api.get('/settings/public'),
  update: (data: Record<string, unknown>) => api.put('/settings', data),
  updateBusiness: (data: Record<string, unknown>) =>
    api.put('/settings/business', data),
  updatePayment: (data: Record<string, unknown>) =>
    api.put('/settings/payment', data),
  updateIntegrations: (data: Record<string, unknown>) =>
    api.put('/settings/integrations', data),
  getActivityLog: (params?: Record<string, unknown>) =>
    api.get('/settings/activity-log', { params }),
}

export const digitalServicesApi = {
  getAll: (params?: Record<string, unknown>) =>
    api.get('/digital-services', { params }),
  getById: (id: number) => api.get(`/digital-services/${id}`),
  create: (data: Record<string, unknown>) => api.post('/digital-services', data),
  update: (id: number, data: Record<string, unknown>) =>
    api.put(`/digital-services/${id}`, data),
  updateStatus: (id: number, status: string) =>
    api.patch(`/digital-services/${id}/status`, { status }),
  delete: (id: number) => api.delete(`/digital-services/${id}`),
  getActiveRetainers: () => api.get('/digital-services/retainers/active'),
  getStats: () => api.get('/digital-services/stats/summary'),
}

export const airtableApi = {
  getStatus: () => api.get('/airtable/status'),
  syncNow: (tables?: string[]) => api.post('/airtable/sync-now', { tables }),
  testConnection: () => api.post('/airtable/test-connection'),
  getSyncHistory: (params?: Record<string, unknown>) =>
    api.get('/airtable/sync-history', { params }),
}

export const backupApi = {
  create: (data?: Record<string, unknown>) => api.post('/backup/create', data),
  getList: (params?: Record<string, unknown>) =>
    api.get('/backup/list', { params }),
  download: (filename: string) =>
    api.get(`/backup/download/${filename}`, { responseType: 'blob' }),
  delete: (id: number) => api.delete(`/backup/${id}`),
  restore: (id: number, data: Record<string, unknown>) =>
    api.post(`/backup/restore/${id}`, data),
  getStats: () => api.get('/backup/stats'),
}

export const exportsApi = {
  exportCSV: (data: Record<string, unknown>) =>
    api.post('/exports/csv', data, { responseType: 'blob' }),
  getMonthlyReport: (month: number, year: number) =>
    api.get('/exports/monthly-report', { params: { month, year } }),
  getGSTR1: (data: { month: number; year: number }) =>
    api.post('/exports/gstr1', data),
  getGSTR3B: (data: { month: number; year: number }) =>
    api.post('/exports/gstr3b', data),
  exportGSTR1: (data: { month: number; year: number }) =>
    api.post('/exports/gstr1', data),
}

export default api
