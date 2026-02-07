import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { getCached, setCache, CacheKeys, CacheTTL } from '../services/cache';

const API_URL = 'https://textshift.org';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

const SCAN_TIMEOUT = 300000;

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync('token');
    }
    return Promise.reject(error);
  }
);

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
    const response = await api.post('/api/auth/login', formData.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return response.data;
  },
  getMe: async () => {
    const cached = await getCached(CacheKeys.USER_PROFILE);
    if (cached) return cached;
    const response = await api.get('/api/auth/me');
    await setCache(CacheKeys.USER_PROFILE, response.data, CacheTTL.SHORT);
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

export const scanApi = {
  detectAI: async (text: string) => {
    const response = await api.post('/api/scan/detect', {
      text,
      scan_type: 'ai_detection',
    }, { timeout: SCAN_TIMEOUT });
    return response.data;
  },
  humanize: async (text: string, preservedIndices?: number[]) => {
    const response = await api.post('/api/scan/humanize', {
      text,
      scan_type: 'humanize',
      ...(preservedIndices !== undefined && { preserved_indices: preservedIndices }),
    }, { timeout: SCAN_TIMEOUT });
    return response.data;
  },
  checkPlagiarism: async (text: string) => {
    const response = await api.post('/api/scan/plagiarism', {
      text,
      scan_type: 'plagiarism',
    }, { timeout: SCAN_TIMEOUT });
    return response.data;
  },
  getHistory: async (page = 1, perPage = 20, scanType?: string) => {
    if (page === 1 && !scanType) {
      const cached = await getCached(CacheKeys.HISTORY_PAGE_1);
      if (cached) return cached;
    }
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
    });
    if (scanType) params.append('scan_type', scanType);
    const response = await api.get(`/api/scan/history?${params}`);
    if (page === 1 && !scanType) {
      await setCache(CacheKeys.HISTORY_PAGE_1, response.data, CacheTTL.SHORT);
    }
    return response.data;
  },
  getScan: async (scanId: number) => {
    const response = await api.get(`/api/scan/${scanId}`);
    return response.data;
  },
};

export const creditsApi = {
  getBalance: async () => {
    const cached = await getCached(CacheKeys.CREDIT_BALANCE);
    if (cached) return cached;
    const response = await api.get('/api/credits/balance');
    await setCache(CacheKeys.CREDIT_BALANCE, response.data, CacheTTL.SHORT);
    return response.data;
  },
  getTransactions: async (page = 1, perPage = 20) => {
    const response = await api.get(`/api/credits/transactions?page=${page}&per_page=${perPage}`);
    return response.data;
  },
  getUsageStats: async () => {
    const cached = await getCached(CacheKeys.USAGE_STATS);
    if (cached) return cached;
    const response = await api.get('/api/credits/usage-stats');
    await setCache(CacheKeys.USAGE_STATS, response.data, CacheTTL.SHORT);
    return response.data;
  },
};

export const paymentApi = {
  getPlans: async (billingCycle = 'monthly', country = '') => {
    const params = new URLSearchParams({ billing_cycle: billingCycle });
    if (country) params.append('country', country);
    const response = await api.get(`/api/payment/plans?${params}`);
    return response.data;
  },
  detectRegion: async () => {
    const cached = await getCached(CacheKeys.REGION);
    if (cached) return cached;
    const response = await api.get('/api/payment/detect-region');
    await setCache(CacheKeys.REGION, response.data, CacheTTL.VERY_LONG);
    return response.data;
  },
  createOrder: async (planId: string, billingPeriod = 'monthly', country = '') => {
    const params = new URLSearchParams({ plan_id: planId, billing_period: billingPeriod });
    if (country) params.append('country', country);
    const response = await api.post(`/api/payment/create-order?${params}`);
    return response.data;
  },
  captureOrder: async (orderId: string, planId: string, country = '') => {
    const params = new URLSearchParams({ order_id: orderId, plan_id: planId });
    if (country) params.append('country', country);
    const response = await api.post(`/api/payment/capture-order?${params}`);
    return response.data;
  },
  getSubscription: async () => {
    const response = await api.get('/api/payment/subscription');
    return response.data;
  },
};

export const promoApi = {
  validate: async (code: string) => {
    const response = await api.get(`/api/promo/validate/${code}`);
    return response.data;
  },
  redeem: async (code: string) => {
    const response = await api.post('/api/promo/redeem', { code });
    return response.data;
  },
};

export const toolsApi = {
  grammar: async (text: string) => {
    const response = await api.post('/api/tools/grammar', { text }, { timeout: SCAN_TIMEOUT });
    return response.data;
  },
  toneDetect: async (text: string) => {
    const response = await api.post('/api/tools/tone/detect', { text }, { timeout: SCAN_TIMEOUT });
    return response.data;
  },
  toneAdjust: async (text: string, targetTone: string) => {
    const response = await api.post('/api/tools/tone/adjust', { text, target_tone: targetTone }, { timeout: SCAN_TIMEOUT });
    return response.data;
  },
  readability: async (text: string, detailed = false) => {
    const response = await api.post('/api/tools/readability', { text, detailed }, { timeout: SCAN_TIMEOUT });
    return response.data;
  },
  summarize: async (text: string, maxLength = 150, minLength = 50) => {
    const response = await api.post('/api/tools/summarize', { text, max_length: maxLength, min_length: minLength }, { timeout: SCAN_TIMEOUT });
    return response.data;
  },
  paraphrase: async (text: string, mode = 'standard') => {
    const response = await api.post('/api/tools/paraphrase', { text, mode }, { timeout: SCAN_TIMEOUT });
    return response.data;
  },
  translate: async (text: string, sourceLang: string, targetLang: string) => {
    const response = await api.post('/api/tools/translate', { text, source_lang: sourceLang, target_lang: targetLang }, { timeout: SCAN_TIMEOUT });
    return response.data;
  },
  wordCount: async (text: string) => {
    const response = await api.post('/api/tools/word-count', { text });
    return response.data;
  },
  styleAnalysis: async (text: string) => {
    const response = await api.post('/api/tools/style', { text }, { timeout: SCAN_TIMEOUT });
    return response.data;
  },
  contentImprove: async (text: string, focus = 'clarity') => {
    const response = await api.post('/api/tools/improve', { text, focus }, { timeout: SCAN_TIMEOUT });
    return response.data;
  },
  citation: async (query?: string, doi?: string, url?: string, style = 'apa') => {
    const response = await api.post('/api/tools/citation', { query, doi, url, style });
    return response.data;
  },
  exportText: async (text: string, format: string, title = 'Document') => {
    const response = await api.post('/api/tools/export', { text, format, title });
    return response.data;
  },
};

export const userSettingsApi = {
  updateSettings: async (data: { full_name?: string; email_notifications?: boolean; marketing_emails?: boolean }) => {
    const response = await api.put('/api/v1/user/settings', data);
    return response.data;
  },
  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await api.put('/api/v1/user/password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
    return response.data;
  },
  clearHistory: async () => {
    const response = await api.delete('/api/v1/user/history');
    return response.data;
  },
  deleteAccount: async () => {
    const response = await api.delete('/api/v1/user/account');
    return response.data;
  },
};

export default api;
