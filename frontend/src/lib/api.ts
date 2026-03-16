import { logger } from '@/lib/logger';

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

// v3.5.34: Backend readiness state (set by Electron IPC or health check)
let _backendReady = false;
let _backendReadyPromise: Promise<void> | null = null;

/**
 * v3.5.34: Wait for backend to be ready before making API calls.
 * Retries health check every 2s for up to 30s.
 */
export async function waitForBackend(): Promise<void> {
  if (_backendReady) return;
  if (_backendReadyPromise) return _backendReadyPromise;

  _backendReadyPromise = new Promise<void>((resolve) => {
    let attempts = 0;
    const maxAttempts = 15; // 15 * 2s = 30s
    const interval = setInterval(async () => {
      attempts++;
      try {
        const res = await fetch(`${API_BASE}/api/dashboard/stats`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(3000),
        });
        if (res.ok) {
          _backendReady = true;
          clearInterval(interval);
          logger.info('api', `Backend ready after ${attempts} attempts`);
          resolve();
        } else if (attempts >= maxAttempts) {
          // Non-2xx but reachable — proceed after max attempts
          clearInterval(interval);
          logger.error('api', `Backend returned ${res.status} after ${maxAttempts * 2}s — proceeding anyway`);
          _backendReady = true;
          resolve();
        }
      } catch {
        // Backend not reachable yet
        if (attempts >= maxAttempts) {
          clearInterval(interval);
          logger.error('api', `Backend not ready after ${maxAttempts * 2}s — proceeding anyway`);
          _backendReady = true; // Let requests through even if health check fails
          resolve();
        }
      }
    }, 2000);
  });

  return _backendReadyPromise;
}

// v3.5.34: Listen for Electron IPC backend-ready signal
if (typeof window !== 'undefined' && (window as any).electronAPI?.onBackendReady) {
  (window as any).electronAPI.onBackendReady(() => {
    _backendReady = true;
    logger.info('api', 'Backend ready (IPC signal received)');
  });
}

/** v3.5.34: Check if backend is confirmed ready */
export function isBackendReady(): boolean {
  return _backendReady;
}

/** v3.5.34: Mark backend as ready (called from UI after splash) */
export function markBackendReady(): void {
  _backendReady = true;
}

/**
 * v3.5.34: Retry-with-backoff wrapper for network errors.
 * Retries every 2s for up to 3 attempts on TypeError (network error).
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit | undefined,
  maxRetries: number = 3,
): Promise<Response> {
  let lastError: Error | null = null;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fetch(url, options);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (!(lastError instanceof TypeError)) {
        // Non-network error (AbortError, DOMException, etc.) — don't retry
        break;
      }
      if (attempt < maxRetries) {
        // Network error — wait and retry with backoff
        const delay = 2000 * (attempt + 1); // 2s, 4s, 6s
        logger.warn('api', `Network error, retry ${attempt + 1}/${maxRetries} in ${delay}ms`);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }
  throw lastError;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const method = options?.method || 'GET';
  const start = Date.now();
  try {
    const res = await fetchWithRetry(`${API_BASE}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    const elapsed = Date.now() - start;
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      logger.api(method, path, res.status, elapsed);
      throw new Error(text || `API error: ${res.status}`);
    }
    logger.api(method, path, res.status, elapsed);
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      return res.json();
    }
    return undefined as T;
  } catch (err) {
    const elapsed = Date.now() - start;
    if (err instanceof TypeError) {
      // Network error (backend down, CORS, etc.)
      logger.error('api', `${method} ${path} NETWORK ERROR (${elapsed}ms): ${err.message}`);
    }
    throw err;
  }
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
  sort_by?: string;
  sort_dir?: string;
}) {
  const q = new URLSearchParams();
  if (params.session_id) q.set('session_id', params.session_id);
  if (params.platform && params.platform !== 'all') q.set('platform', params.platform);
  if (params.search) q.set('search', params.search);
  if (params.page) q.set('page', String(params.page));
  if (params.page_size) q.set('page_size', String(params.page_size));
  if (params.sort_by) q.set('sort_by', params.sort_by);
  if (params.sort_dir) q.set('sort_dir', params.sort_dir);
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

// ─── Clean Results (Pro-only) ───────────────────────────────────────────────

export interface CleanResultsResponse {
  status: string;
  total_before: number;
  total_after: number;
  emails_verified: number;
  emails_failed_verification: number;
  phones_validated: number;
  phones_invalid: number;
  duplicates_removed: number;
  invalid_removed: number;
  leads_rescored: number;
}

export function cleanAllResults() {
  return request<CleanResultsResponse>('/api/results/clean', {
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

// ─── PDF Reports ────────────────────────────────────────────────────────

export function generatePDFReport(params: {
  session_id?: string;
  title?: string;
  company_name?: string;
  primary_color?: string;
  secondary_color?: string;
}) {
  const q = new URLSearchParams();
  if (params.session_id) q.set('session_id', params.session_id);
  if (params.title) q.set('title', params.title);
  if (params.company_name) q.set('company_name', params.company_name);
  if (params.primary_color) q.set('primary_color', params.primary_color);
  if (params.secondary_color) q.set('secondary_color', params.secondary_color);
  return requestBlob(`/api/reports/pdf?${q.toString()}`, { method: 'POST' });
}

// ─── Directory Scraper (YellowPages/Yelp) ───────────────────────────────

export function searchDirectories(params: {
  query: string;
  location?: string;
  sources?: string;
  max_results?: number;
}) {
  const q = new URLSearchParams();
  q.set('query', params.query);
  if (params.location) q.set('location', params.location);
  if (params.sources) q.set('sources', params.sources);
  if (params.max_results) q.set('max_results', String(params.max_results));
  return request<{ session_id: string; status: string }>(`/api/directories/search?${q.toString()}`, {
    method: 'POST',
  });
}

// ─── AI Email Writer ────────────────────────────────────────────────────

export function generateAIEmail(params: {
  lead_id?: string;
  tone?: string;
  service?: string;
  industry?: string;
  from_name?: string;
}) {
  const q = new URLSearchParams();
  if (params.lead_id) q.set('lead_id', params.lead_id);
  if (params.tone) q.set('tone', params.tone);
  if (params.service) q.set('service', params.service);
  if (params.industry) q.set('industry', params.industry);
  if (params.from_name) q.set('from_name', params.from_name);
  return request<{ subject: string; body: string; tone: string; industry: string }>(`/api/ai-email/generate?${q.toString()}`, {
    method: 'POST',
  });
}

export function fetchEmailTones() {
  return request<{ id: string; name: string; description: string }[]>('/api/ai-email/tones');
}

export function fetchEmailIndustries() {
  return request<string[]>('/api/ai-email/industries');
}

// ─── Lead Enrichment ────────────────────────────────────────────────────

export function enrichLeads() {
  return request<{
    status: string;
    total_leads: number;
    enriched: number;
    names_filled: number;
    phones_filled: number;
    emails_filled: number;
    companies_detected: number;
    websites_detected: number;
  }>('/api/leads/enrich', { method: 'POST' });
}

// ─── GBP Detection ─────────────────────────────────────────────────────

export function detectGBPStatus(businessData: Record<string, unknown>) {
  return request<{
    score: number;
    status: string;
    confidence: string;
    breakdown: { signal: string; points: number; present: boolean }[];
    opportunity: string;
    pitch: string;
  }>('/api/gbp/detect', {
    method: 'POST',
    body: JSON.stringify(businessData),
  });
}

export function batchDetectGBP(businesses: Record<string, unknown>[]) {
  return request<{
    score: number;
    status: string;
    confidence: string;
    breakdown: { signal: string; points: number; present: boolean }[];
    opportunity: string;
    pitch: string;
  }[]>('/api/gbp/batch-detect', {
    method: 'POST',
    body: JSON.stringify(businesses),
  });
}

// ─── Internationalization ───────────────────────────────────────────────

export function fetchTranslations(lang: string) {
  return request<Record<string, string>>(`/api/i18n/translations?lang=${lang}`);
}

export function fetchSupportedLanguages() {
  return request<{ code: string; name: string; native_name: string; rtl: boolean }[]>('/api/i18n/languages');
}

// ─── Job Boards (Indeed/Glassdoor/Craigslist/OLX) ───────────────────────

export function searchJobBoards(params: {
  query: string;
  location?: string;
  sources?: string;
  max_results?: number;
}) {
  const q = new URLSearchParams();
  q.set('query', params.query);
  if (params.location) q.set('location', params.location);
  if (params.sources) q.set('sources', params.sources);
  if (params.max_results) q.set('max_results', String(params.max_results));
  return request<{ session_id: string; status: string }>(`/api/jobs/search?${q.toString()}`, {
    method: 'POST',
  });
}

// ─── Citation Checker ───────────────────────────────────────────────────

export function checkCitations(params: {
  business_name: string;
  location?: string;
  phone?: string;
  max_sources?: number;
}) {
  const q = new URLSearchParams();
  q.set('business_name', params.business_name);
  if (params.location) q.set('location', params.location);
  if (params.phone) q.set('phone', params.phone);
  if (params.max_sources) q.set('max_sources', String(params.max_sources));
  return request<{
    found: { source: string; url: string }[];
    not_found: string[];
    score: number;
    grade: string;
    recommendations: string[];
  }>(`/api/citations/check?${q.toString()}`, { method: 'POST' });
}

export function fetchCitationSources() {
  return request<{ name: string; category: string; url: string }[]>('/api/citations/sources');
}

// ─── Service Suggestions ────────────────────────────────────────────────

export function suggestServices(leadId: string) {
  const q = new URLSearchParams();
  q.set('lead_id', leadId);
  return request<{
    lead_id: string;
    suggestions: {
      service: string;
      name: string;
      relevance_score: number;
      pitch: string;
      price_range: string;
      difficulty: string;
    }[];
  }>(`/api/services/suggest?${q.toString()}`, { method: 'POST' });
}

export function fetchServiceCatalog() {
  return request<{
    id: string;
    name: string;
    description: string;
    price_range: string;
    difficulty: string;
  }[]>('/api/services/catalog');
}

// ─── SMTP Deliverability Checker ────────────────────────────────────────

export function checkSMTPDeliverability(params: { domain?: string; email?: string }) {
  const q = new URLSearchParams();
  if (params.domain) q.set('domain', params.domain);
  if (params.email) q.set('email', params.email);
  return request<{
    score: number;
    rating: string;
    summary: string;
    issues: string[];
    recommendations: string[];
    spf?: { found: boolean; record: string };
    dkim?: { found: boolean };
    dmarc?: { found: boolean; record: string };
  }>(`/api/smtp/check-deliverability?${q.toString()}`, { method: 'POST' });
}

// ─── Extended Email Templates ───────────────────────────────────────────

export function fetchExtendedTemplates() {
  return request<{
    id: string;
    name: string;
    category: string;
    subject: string;
    body: string;
  }[]>('/api/outreach/templates-extended');
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
  current_platform?: string;
  status_message?: string;
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
