from pydantic import BaseModel
from typing import Optional


class LeadResponse(BaseModel):
    id: str
    email: str
    phone: str
    name: str
    platform: str
    source_url: str
    keyword: str
    country: str
    email_type: str
    verified: bool
    quality_score: int
    extracted_at: str
    session_id: str


class SessionResponse(BaseModel):
    id: str
    name: str
    status: str
    platforms: list[str]
    keywords: list[str]
    total_leads: int
    emails_found: int
    phones_found: int
    started_at: str
    completed_at: Optional[str]
    duration: int
    progress: int


class ExtractionRequest(BaseModel):
    name: str
    keywords: list[str]
    platforms: list[str]
    pages_per_keyword: int = 5
    delay_between_requests: float = 3.0
    use_proxies: bool = False
    proxy_rotation: str = "round-robin"
    email_domains: list[str] = []
    exclude_domains: list[str] = []
    country_codes: list[str] = []
    export_format: str = "excel"
    auto_verify: bool = True
    use_google_dorking: bool = True
    use_direct_scraping: bool = True
    use_firecrawl_enrichment: bool = False
    headless: bool = False


class BlacklistEntryRequest(BaseModel):
    type: str
    value: str
    reason: str = ""


class BlacklistEntryResponse(BaseModel):
    id: str
    type: str
    value: str
    reason: str
    added_at: str


class ProxyRequest(BaseModel):
    host: str
    port: int
    username: str = ""
    password: str = ""
    protocol: str = "http"
    country: str = ""


class ProxyResponse(BaseModel):
    id: str
    host: str
    port: int
    username: str
    password: str
    protocol: str
    country: str
    speed: float
    status: str
    last_tested: Optional[str]


class ProxyBulkImport(BaseModel):
    proxies_text: str


class SettingUpdate(BaseModel):
    key: str
    value: str


class LicenseGenerateRequest(BaseModel):
    buyer_name: str = ""
    buyer_email: str = ""
    max_activations: int = 1
    duration_months: int = 12
    quantity: int = 1


class LicenseResponse(BaseModel):
    id: str
    key: str
    status: str
    buyer_name: str
    buyer_email: str
    activated_at: Optional[str]
    expires_at: str
    max_activations: int
    current_activations: int
    created_at: str


class LicenseValidateRequest(BaseModel):
    key: str


class ExportRequest(BaseModel):
    session_id: Optional[str] = None
    format: str = "csv"
    leads_ids: list[str] = []


class DashboardStats(BaseModel):
    total_leads: int
    leads_today: int
    total_emails: int
    total_phones: int
    verified_emails: int
    sessions_completed: int
    platform_breakdown: list[dict]
    daily_trend: list[dict]
    recent_sessions: list[SessionResponse]


# ─── Enhancement Schemas ────────────────────────────────────────────────────

class GoogleMapsSearchRequest(BaseModel):
    query: str
    max_results: int = 50
    delay: float = 3.0
    enrich_emails: bool = True


class ScheduleCreateRequest(BaseModel):
    name: str
    keywords: list[str]
    platforms: list[str]
    frequency: str = "daily"
    cron_expression: str = ""
    pages_per_keyword: int = 3
    delay_between_requests: float = 3.0
    use_proxies: bool = False
    use_google_dorking: bool = True
    use_firecrawl_enrichment: bool = False
    auto_verify: bool = True


class ScheduleResponse(BaseModel):
    id: str
    name: str
    keywords: list[str]
    platforms: list[str]
    frequency: str
    cron_expression: str
    status: str
    created_at: str
    last_run: Optional[str]
    next_run: Optional[str]
    total_runs: int


class EmailFinderRequest(BaseModel):
    url: str
    max_pages: int = 5


class CRMExportRequest(BaseModel):
    lead_ids: list[str]
    crm_type: str  # "hubspot" or "salesforce"
    api_key: str = ""
    username: str = ""
    password: str = ""
    security_token: str = ""


class OutreachSendRequest(BaseModel):
    lead_ids: list[str]
    subject_template: str
    body_template: str
    smtp_host: str
    smtp_port: int = 587
    smtp_username: str
    smtp_password: str
    from_name: str = ""
    delay_seconds: float = 30.0
    use_tls: bool = True


class TelegramScrapeRequest(BaseModel):
    api_id: int
    api_hash: str
    phone_number: str
    group_username: str
    max_members: int = 500
    delay: float = 5.0


class WhatsAppScrapeRequest(BaseModel):
    group_name: str
    max_members: int = 100
    delay: float = 8.0
