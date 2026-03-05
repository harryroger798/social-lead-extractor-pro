const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `API error: ${res.status}`);
  }
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return res.json();
  }
  return undefined as T;
}

async function requestBlob(path: string, options?: RequestInit): Promise<Blob> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  if (!res.ok) throw new Error(`Export error: ${res.status}`);
  return res.blob();
}

// ─── Dashboard ──────────────────────────────────────────────────────────────

export function fetchDashboardStats() {
  return request<DashboardStatsResponse>('/api/dashboard/stats');
}

// ─── Extraction ─────────────────────────────────────────────────────────────

export function startExtraction(config: ExtractionRequestBody) {
  return request<{ session_id: string; status: string }>('/api/extract', {
    method: 'POST',
    body: JSON.stringify(config),
  });
}

export function getExtractionStatus(sessionId: string) {
  return request<ExtractionStatusResponse>(`/api/extract/${sessionId}/status`);
}

// ─── Results / Leads ────────────────────────────────────────────────────────

export function fetchResults(params: {
  session_id?: string;
  platform?: string;
  search?: string;
  page?: number;
  page_size?: number;
}) {
  const q = new URLSearchParams();
  if (params.session_id) q.set('session_id', params.session_id);
  if (params.platform && params.platform !== 'all') q.set('platform', params.platform);
  if (params.search) q.set('search', params.search);
  if (params.page) q.set('page', String(params.page));
  if (params.page_size) q.set('page_size', String(params.page_size));
  return request<ResultsResponse>(`/api/results?${q.toString()}`);
}

export function deleteLead(leadId: string) {
  return request<{ status: string }>(`/api/results/${leadId}`, { method: 'DELETE' });
}

export function deleteLeads(leadIds: string[]) {
  return request<{ status: string; count: number }>('/api/results', {
    method: 'DELETE',
    body: JSON.stringify(leadIds),
  });
}

// ─── History / Sessions ─────────────────────────────────────────────────────

export function fetchHistory(status?: string) {
  const q = status && status !== 'all' ? `?status=${status}` : '';
  return request<SessionItem[]>(`/api/history${q}`);
}

export function deleteSession(sessionId: string) {
  return request<{ status: string }>(`/api/history/${sessionId}`, { method: 'DELETE' });
}

// ─── Blacklist ──────────────────────────────────────────────────────────────

export function fetchBlacklist(typeFilter?: string) {
  const q = typeFilter && typeFilter !== 'all' ? `?type_filter=${typeFilter}` : '';
  return request<BlacklistItem[]>(`/api/blacklist${q}`);
}

export function addBlacklistEntry(entry: { type: string; value: string; reason: string }) {
  return request<{ id: string; status: string }>('/api/blacklist', {
    method: 'POST',
    body: JSON.stringify(entry),
  });
}

export function deleteBlacklistEntry(entryId: string) {
  return request<{ status: string }>(`/api/blacklist/${entryId}`, { method: 'DELETE' });
}

// ─── Settings ───────────────────────────────────────────────────────────────

export function fetchSettings() {
  return request<Record<string, string>>('/api/settings');
}

export function updateSetting(key: string, value: string) {
  return request<{ status: string }>('/api/settings', {
    method: 'PUT',
    body: JSON.stringify({ key, value }),
  });
}

// ─── Licenses ───────────────────────────────────────────────────────────────

export function fetchLicenses(status?: string) {
  const q = status && status !== 'all' ? `?status=${status}` : '';
  return request<LicenseItem[]>(`/api/licenses${q}`);
}

export function generateLicenses(params: {
  buyer_name: string;
  buyer_email: string;
  max_activations: number;
  duration_months: number;
  quantity: number;
}) {
  return request<{ generated: { id: string; key: string; expires_at: string }[]; count: number }>(
    '/api/licenses/generate',
    { method: 'POST', body: JSON.stringify(params) }
  );
}

export function revokeLicense(licenseId: string) {
  return request<{ status: string }>(`/api/licenses/${licenseId}/revoke`, { method: 'PUT' });
}

export function deleteLicense(licenseId: string) {
  return request<{ status: string }>(`/api/licenses/${licenseId}`, { method: 'DELETE' });
}

// ─── Export ─────────────────────────────────────────────────────────────────

export function exportResults(params: {
  format: string;
  session_id?: string;
  leads_ids?: string[];
}) {
  return requestBlob('/api/export', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

// ─── Types ──────────────────────────────────────────────────────────────────

export interface DashboardStatsResponse {
  total_leads: number;
  leads_today: number;
  total_emails: number;
  total_phones: number;
  verified_emails: number;
  sessions_completed: number;
  platform_breakdown: { platform: string; count: number }[];
  daily_trend: { date: string; emails: number; phones: number }[];
  recent_sessions: SessionItem[];
}

export interface ExtractionRequestBody {
  name: string;
  keywords: string[];
  platforms: string[];
  pages_per_keyword: number;
  delay_between_requests: number;
  use_proxies: boolean;
  proxy_rotation: string;
  email_filters: { domains: string[]; exclude_domains: string[]; types: string[] };
  phone_filters: { country_codes: string[] };
  export_format: string;
  auto_verify: boolean;
  use_google_dorking: boolean;
  use_direct_scraping: boolean;
  use_firecrawl_enrichment: boolean;
  browser_headless: boolean;
}

export interface ExtractionStatusResponse {
  id: string;
  name: string;
  status: string;
  total_leads: number;
  emails_found: number;
  phones_found: number;
  progress: number;
}

export interface SessionItem {
  id: string;
  name: string;
  status: string;
  platforms: string[];
  keywords: string[];
  total_leads: number;
  emails_found: number;
  phones_found: number;
  started_at: string;
  completed_at: string | null;
  duration: number;
  progress: number;
}

export interface ResultsResponse {
  leads: LeadItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface LeadItem {
  id: string;
  email: string;
  phone: string;
  name: string;
  platform: string;
  source_url: string;
  keyword: string;
  country: string;
  email_type: string;
  verified: boolean;
  quality_score: number;
  extracted_at: string;
  session_id: string;
}

export interface BlacklistItem {
  id: string;
  type: string;
  value: string;
  reason: string;
  added_at: string;
}

export interface LicenseItem {
  id: string;
  key: string;
  status: string;
  buyer_name: string;
  buyer_email: string;
  activated_at: string | null;
  expires_at: string;
  max_activations: number;
  current_activations: number;
  created_at: string;
}
