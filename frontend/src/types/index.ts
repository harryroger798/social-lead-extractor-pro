export interface Lead {
  id: string;
  email: string;
  phone: string;
  name: string;
  platform: Platform;
  source_url: string;
  keyword: string;
  country: string;
  email_type: 'personal' | 'business' | 'unknown';
  verified: boolean;
  quality_score: number;
  extracted_at: string;
  session_id: string;
}

export type Platform = 
  | 'linkedin' 
  | 'facebook' 
  | 'instagram' 
  | 'twitter' 
  | 'tiktok' 
  | 'youtube' 
  | 'pinterest' 
  | 'tumblr' 
  | 'reddit'
  | 'google_maps'
  | 'telegram'
  | 'whatsapp';

export interface ExtractionSession {
  id: string;
  name: string;
  status: 'running' | 'completed' | 'paused' | 'failed';
  platforms: Platform[];
  keywords: string[];
  total_leads: number;
  emails_found: number;
  phones_found: number;
  started_at: string;
  completed_at: string | null;
  duration: number;
  progress: number;
}

export interface ProxyConfig {
  id: string;
  host: string;
  port: number;
  username: string;
  password: string;
  protocol: 'http' | 'https' | 'socks5';
  country: string;
  speed: number;
  status: 'active' | 'inactive' | 'testing' | 'failed';
  last_tested: string | null;
}

export interface BlacklistEntry {
  id: string;
  type: 'email' | 'domain' | 'phone' | 'keyword';
  value: string;
  reason: string;
  added_at: string;
}

export interface DashboardStats {
  total_leads: number;
  leads_today: number;
  total_emails: number;
  total_phones: number;
  verified_emails: number;
  sessions_completed: number;
  platform_breakdown: { platform: string; count: number }[];
  daily_trend: { date: string; emails: number; phones: number }[];
  recent_sessions: ExtractionSession[];
}

export interface ExtractionConfig {
  keywords: string[];
  platforms: Platform[];
  pages_per_keyword: number;
  delay_between_requests: number;
  use_proxies: boolean;
  proxy_rotation: 'round-robin' | 'random' | 'fastest';
  email_filters: {
    domains: string[];
    exclude_domains: string[];
    types: ('personal' | 'business')[];
  };
  phone_filters: {
    country_codes: string[];
  };
  export_format: 'excel' | 'csv' | 'json' | 'html';
  auto_verify: boolean;
  use_google_dorking: boolean;
  use_direct_scraping: boolean;
  use_firecrawl_enrichment: boolean;
  browser_headless: boolean;
}

export interface LicenseKey {
  id: string;
  key: string;
  status: 'active' | 'expired' | 'revoked';
  buyer_name: string;
  buyer_email: string;
  activated_at: string | null;
  expires_at: string;
  max_activations: number;
  current_activations: number;
  created_at: string;
}

export type Section = 
  | 'dashboard' 
  | 'extraction' 
  | 'results' 
  | 'history' 
  | 'blacklist' 
  | 'settings' 
  | 'reseller'
  | 'schedules'
  | 'gmaps'
  | 'outreach'
  | 'crm'
  | 'telegram'
  | 'whatsapp'
  | 'email_finder'
  | 'safety_guide'
  | 'pdf_reports'
  | 'directories'
  | 'ai_email'
  | 'lead_enrichment'
  | 'gbp_detection'
  | 'citation_checker'
  | 'service_suggestions'
  | 'smtp_checker'
  | 'job_boards';
