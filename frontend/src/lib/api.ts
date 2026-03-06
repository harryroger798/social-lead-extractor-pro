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

// ─── Proxies ───────────────────────────────────────────────────────────────

export function fetchProxies() {
  return request<ProxyItem[]>('/api/proxies');
}

export function addProxy(proxy: { host: string; port: number; username?: string; password?: string; protocol?: string; country?: string }) {
  return request<{ id: string; status: string }>('/api/proxies', {
    method: 'POST',
    body: JSON.stringify(proxy),
  });
}

export function bulkImportProxies(proxiesText: string) {
  return request<{ added: number; total_lines: number }>('/api/proxies/bulk', {
    method: 'POST',
    body: JSON.stringify({ proxies_text: proxiesText }),
  });
}

export function testProxy(proxyId: string) {
  return request<{ status: string; speed: number; ip: string; error: string | null }>(`/api/proxies/${proxyId}/test`, {
    method: 'POST',
  });
}

export function testAllProxies() {
  return request<{ tested: number; active: number; failed: number }>('/api/proxies/test-all', {
    method: 'POST',
  });
}

export function deleteProxy(proxyId: string) {
  return request<{ status: string }>(`/api/proxies/${proxyId}`, { method: 'DELETE' });
}

export function deleteAllProxies() {
  return request<{ status: string; count: number }>('/api/proxies', { method: 'DELETE' });
}

// ─── Firecrawl ─────────────────────────────────────────────────────────────

export function checkFirecrawlCredits() {
  return request<{ success: boolean; remaining_credits?: number; total_credits?: number; error?: string }>('/api/firecrawl/check-credits', {
    method: 'POST',
  });
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

// ─── Google Maps ───────────────────────────────────────────────────────

export function searchGoogleMaps(params: { query: string; max_results?: number; delay?: number; enrich_emails?: boolean }) {
  return request<{ session_id: string; status: string }>('/api/maps/search', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

// ─── Duplicates ────────────────────────────────────────────────────────

export function checkDuplicates() {
  return request<{ total_leads: number; unique_leads: number; duplicate_groups: number; total_duplicates: number }>('/api/duplicates/check', {
    method: 'POST',
  });
}

export function removeDuplicates() {
  return request<{ removed: number; remaining: number }>('/api/duplicates/remove', {
    method: 'POST',
  });
}

// ─── Lead Scoring ──────────────────────────────────────────────────────

export function rescoreAllLeads() {
  return request<{ updated: number; distribution: { hot: number; warm: number; cold: number } }>('/api/leads/rescore', {
    method: 'POST',
  });
}

export function getLeadScoreBreakdown(leadId: string) {
  return request<{ lead_id: string; score: number; category: string; breakdown: { rule: string; points: number; applied: boolean }[] }>(
    `/api/leads/${leadId}/score-breakdown`
  );
}

// ─── Schedules ─────────────────────────────────────────────────────────

export function fetchSchedules() {
  return request<ScheduleItem[]>('/api/schedules');
}

export function createSchedule(params: {
  name: string;
  keywords: string[];
  platforms: string[];
  frequency: string;
  cron_expression?: string;
  pages_per_keyword?: number;
  delay_between_requests?: number;
  use_proxies?: boolean;
  use_google_dorking?: boolean;
  use_firecrawl_enrichment?: boolean;
  auto_verify?: boolean;
}) {
  return request<ScheduleItem>('/api/schedules', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export function pauseSchedule(scheduleId: string) {
  return request<{ status: string }>(`/api/schedules/${scheduleId}/pause`, { method: 'PUT' });
}

export function resumeSchedule(scheduleId: string) {
  return request<{ status: string }>(`/api/schedules/${scheduleId}/resume`, { method: 'PUT' });
}

export function deleteSchedule(scheduleId: string) {
  return request<{ status: string }>(`/api/schedules/${scheduleId}`, { method: 'DELETE' });
}

// ─── Email Finder ──────────────────────────────────────────────────────

export function crawlWebsiteEmails(url: string, maxPages?: number) {
  return request<{ url: string; emails: string[]; phones: string[]; total_emails: number; total_phones: number }>(
    '/api/email-finder/crawl',
    { method: 'POST', body: JSON.stringify({ url, max_pages: maxPages || 5 }) }
  );
}

// ─── CRM Export ────────────────────────────────────────────────────────

export function exportToCRM(params: {
  lead_ids: string[];
  crm_type: string;
  api_key?: string;
  username?: string;
  password?: string;
  security_token?: string;
}) {
  return request<{ exported: number; failed: number; errors: string[] }>('/api/crm/export', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export function testCRMConnection(crmType: string, apiKey: string) {
  return request<{ success: boolean; message: string }>(
    `/api/crm/test-connection?crm_type=${crmType}&api_key=${apiKey}`,
    { method: 'POST' }
  );
}

// ─── Outreach ──────────────────────────────────────────────────────────

export function sendOutreach(params: {
  lead_ids: string[];
  subject_template: string;
  body_template: string;
  smtp_host: string;
  smtp_port: number;
  smtp_username: string;
  smtp_password: string;
  from_name?: string;
  delay_seconds?: number;
  use_tls?: boolean;
}) {
  return request<{ status: string; total_recipients: number; message: string }>('/api/outreach/send', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export function fetchOutreachTemplates() {
  return request<{ id: string; name: string; subject: string; body: string }[]>('/api/outreach/templates');
}

export function fetchOutreachLogs(campaignId?: string) {
  const q = campaignId ? `?campaign_id=${campaignId}` : '';
  return request<OutreachLogItem[]>(`/api/outreach/logs${q}`);
}

// ─── Telegram ──────────────────────────────────────────────────────────

export function extractTelegram(params: {
  api_id: number;
  api_hash: string;
  phone_number: string;
  group_username: string;
  max_members?: number;
  delay?: number;
}) {
  return request<{ session_id: string; status: string }>('/api/telegram/extract', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export function fetchTelegramSetup() {
  return request<{ title: string; steps: string[]; ban_prevention: string[]; limitations: string[]; cost: string }>('/api/telegram/setup');
}

// ─── WhatsApp ──────────────────────────────────────────────────────────

export function extractWhatsApp(params: {
  group_name: string;
  max_members?: number;
  delay?: number;
}) {
  return request<{ session_id: string; status: string }>('/api/whatsapp/extract', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export function fetchWhatsAppSafetyGuide() {
  return request<{ title: string; ban_risk: string; prevention: string[]; what_you_get: string[]; how_to_get_more: string[]; tos_warning: string; qr_code: string }>('/api/whatsapp/safety-guide');
}

// ─── Safety Guide ──────────────────────────────────────────────────────

export function fetchSafetyGuide() {
  return request<{ platforms: Record<string, unknown>; general_tips: string[] }>('/api/safety-guide');
}

export function fetchLinkedInGuide() {
  return request<Record<string, unknown>>('/api/linkedin/ban-bypass-guide');
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

export interface ProxyItem {
  id: string;
  host: string;
  port: number;
  username: string;
  password: string;
  protocol: string;
  country: string;
  speed: number;
  status: string;
  last_tested: string | null;
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

export interface ScheduleItem {
  id: string;
  name: string;
  keywords: string[];
  platforms: string[];
  frequency: string;
  cron_expression: string;
  status: string;
  created_at: string;
  last_run: string | null;
  next_run: string | null;
  total_runs: number;
}

export interface OutreachLogItem {
  id: string;
  campaign_id: string;
  to_email: string;
  subject: string;
  status: string;
  error: string;
  sent_at: string;
}
