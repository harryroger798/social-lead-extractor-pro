export interface User {
  id: number;
  email: string;
  full_name: string | null;
  is_active: boolean;
  is_verified: boolean;
  subscription_tier: 'Free' | 'Starter' | 'Pro' | 'Enterprise';
  credits_balance: number;
  created_at: string;
  last_login_at: string | null;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface CreditBalance {
  balance: number;
  tier: string;
  daily_scans_used: number;
  daily_scans_limit: number;
}

export interface UsageStats {
  total_scans: number;
  scans_today: number;
  credits_used_today: number;
  most_used_tool: string;
}

export interface Scan {
  id: number;
  scan_type: 'ai_detection' | 'humanize' | 'plagiarism';
  input_text: string;
  output_text: string | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  ai_probability: number | null;
  confidence_level: string | null;
  plagiarism_score: number | null;
  sources_found: number | null;
  credits_used: number;
  created_at: string;
  completed_at: string | null;
  results: Record<string, unknown> | null;
}

export interface ScanListResponse {
  scans: Scan[];
  total: number;
  page: number;
  per_page: number;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  credits: number;
  description: string;
  features: string[];
  billing_period: string;
  monthly_equivalent?: number;
  savings?: number;
}

export interface PlansResponse {
  billing_cycle: string;
  currency: string;
  symbol: string;
  plans: PricingPlan[];
}

export interface RegionInfo {
  country_code: string;
  currency: string;
  symbol: string;
}

export interface Subscription {
  tier: string;
  credits_balance: number;
  credits_per_month: number;
  subscription: {
    id: number | null;
    start_date: string | null;
    status: string | null;
  } | null;
}

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  VerifyEmail: { email: string };
  VerifyEmailPending: { email: string };
  Home: undefined;
  Detector: undefined;
  Humanizer: undefined;
  Plagiarism: undefined;
  Tools: undefined;
  ToolDetail: { toolId: string; toolName: string };
  History: undefined;
  Subscription: undefined;
  Settings: undefined;
  Profile: undefined;
  PromoCode: undefined;
};
