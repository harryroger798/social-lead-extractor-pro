import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authApi = {
  register: async (email: string, password: string, fullName?: string) => {
    const response = await api.post('/api/auth/register', {
      email,
      password,
      full_name: fullName,
    });
    return response.data;
  },

  login: async (email: string, password: string) => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);
    
    const response = await api.post('/api/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await api.post('/api/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await api.post('/api/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token: string, newPassword: string) => {
    const response = await api.post('/api/auth/reset-password', {
      token,
      new_password: newPassword,
    });
    return response.data;
  },

  verifyEmail: async (token: string) => {
    const response = await api.post('/api/auth/verify-email', { token });
    return response.data;
  },

  resendVerification: async (email: string) => {
    const response = await api.post('/api/auth/resend-verification', { email });
    return response.data;
  },
};

// Scan API
export const scanApi = {
  detectAI: async (text: string) => {
    const response = await api.post('/api/scan/detect', {
      text,
      scan_type: 'ai_detection',
    });
    return response.data;
  },

  humanize: async (text: string) => {
    const response = await api.post('/api/scan/humanize', {
      text,
      scan_type: 'humanize',
    });
    return response.data;
  },

  checkPlagiarism: async (text: string) => {
    const response = await api.post('/api/scan/plagiarism', {
      text,
      scan_type: 'plagiarism',
    });
    return response.data;
  },

  getHistory: async (page = 1, perPage = 20, scanType?: string) => {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
    });
    if (scanType) {
      params.append('scan_type', scanType);
    }
    const response = await api.get(`/api/scan/history?${params}`);
    return response.data;
  },

  getScan: async (scanId: number) => {
    const response = await api.get(`/api/scan/${scanId}`);
    return response.data;
  },
};

// Credits API
export const creditsApi = {
  getBalance: async () => {
    const response = await api.get('/api/credits/balance');
    return response.data;
  },

  getTransactions: async (page = 1, perPage = 20) => {
    const response = await api.get(`/api/credits/transactions?page=${page}&per_page=${perPage}`);
    return response.data;
  },

  getUsageStats: async () => {
    const response = await api.get('/api/credits/usage-stats');
    return response.data;
  },
};

// Payment API
export const paymentApi = {
  getPlans: async () => {
    const response = await api.get('/api/payment/plans');
    return response.data;
  },

  createOrder: async (planId: string) => {
    const response = await api.post(`/api/payment/create-order?plan_id=${planId}`);
    return response.data;
  },

  captureOrder: async (orderId: string, planId: string) => {
    const response = await api.post(`/api/payment/capture-order?order_id=${orderId}&plan_id=${planId}`);
    return response.data;
  },

  getSubscription: async () => {
    const response = await api.get('/api/payment/subscription');
    return response.data;
  },
};

export default api;
