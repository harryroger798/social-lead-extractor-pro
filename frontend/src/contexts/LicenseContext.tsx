import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

export type LicenseTier = 'starter' | 'pro';
export type LicenseCycle = 'monthly' | 'yearly' | 'lifetime';
export type UserRole = 'admin' | 'reseller' | 'user';

export interface LicenseData {
  key: string;
  tier: LicenseTier;
  cycle: LicenseCycle;
  role: UserRole;
  activated_at: string;
  expires_at: string | null;
  device_id: string;
  token: string;
}

export interface LicenseContextType {
  license: LicenseData | null;
  isActivated: boolean;
  isExpired: boolean;
  isPro: boolean;
  isLoading: boolean;
  role: UserRole;
  isAdmin: boolean;
  isReseller: boolean;
  activate: (key: string) => Promise<{ success: boolean; error?: string }>;
  deactivate: () => Promise<void>;
  checkExpiry: () => boolean;
}

// Starter tier: limited platforms (5)
export const STARTER_PLATFORMS = ['linkedin', 'facebook', 'instagram', 'twitter', 'reddit'] as const;

// Pro tier: all platforms (12)
export const PRO_PLATFORMS = [
  'linkedin', 'facebook', 'instagram', 'twitter', 'tiktok',
  'youtube', 'pinterest', 'tumblr', 'reddit', 'google_maps',
  'telegram', 'whatsapp',
] as const;

// Features locked behind Pro
export const PRO_ONLY_FEATURES = [
  'schedules',
  'outreach',
  'crm',
  'email_finder',
  'gmaps',
  'telegram',
  'whatsapp',
] as const;

const LicenseContext = createContext<LicenseContextType | null>(null);

interface ElectronAPI {
  licenseGet: () => Promise<LicenseData | null>;
  licenseSave: (data: LicenseData) => Promise<{ success: boolean; error?: string }>;
  licenseRemove: () => Promise<{ success: boolean; error?: string }>;
  licenseGetDeviceId: () => Promise<string>;
  licenseActivateOnline: (key: string) => Promise<{
    success: boolean;
    tier?: string;
    cycle?: string;
    expires_at?: string;
    error?: string;
  }>;
}

function getElectronAPI(): ElectronAPI | null {
  if (typeof window !== 'undefined' && 'electronAPI' in window) {
    return (window as Record<string, unknown>).electronAPI as ElectronAPI;
  }
  return null;
}

function isLicenseExpired(license: LicenseData): boolean {
  if (!license.expires_at) return false; // lifetime
  const expiryDate = new Date(license.expires_at);
  return expiryDate < new Date();
}

export function LicenseProvider({ children }: { children: ReactNode }) {
  const [license, setLicense] = useState<LicenseData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load license on mount
  useEffect(() => {
    const loadLicense = async () => {
      try {
        const api = getElectronAPI();
        if (api) {
          const data = await api.licenseGet();
          if (data) {
            setLicense(data);
          }
        } else {
          // In browser dev mode, check localStorage fallback
          const stored = localStorage.getItem('snapleads_license');
          if (stored) {
            try {
              setLicense(JSON.parse(stored));
            } catch {
              // ignore parse errors
            }
          }
        }
      } catch (err) {
        console.error('[License] Failed to load:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadLicense();
  }, []);

  const activate = useCallback(async (key: string): Promise<{ success: boolean; error?: string }> => {
    const api = getElectronAPI();
    if (api) {
      // Electron: use IPC to activate online
      const result = await api.licenseActivateOnline(key);
      if (result.success) {
        // Re-read the saved license
        const data = await api.licenseGet();
        if (data) {
          setLicense(data);
        }
        return { success: true };
      }
      return { success: false, error: result.error || 'Activation failed' };
    }
    // Browser dev mode fallback: simulate activation
    // Derive role from key prefix: SNPL-ADMIN-, SNPL-MR-, SNPL-RES-, or default user
    const deriveRole = (k: string): UserRole => {
      const upper = k.toUpperCase();
      if (upper.includes('-ADMIN-')) return 'admin';
      if (upper.includes('-MR-') || upper.includes('-MASTER-') || upper.includes('-RES-') || upper.includes('-RESELLER-')) return 'reseller';
      return 'user';
    };
    const mockLicense: LicenseData = {
      key,
      tier: key.includes('-PRO-') ? 'pro' : 'starter',
      cycle: key.includes('-L-') ? 'lifetime' : key.includes('-Y-') ? 'yearly' : 'monthly',
      role: deriveRole(key),
      activated_at: new Date().toISOString(),
      expires_at: key.includes('-L-') ? null : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      device_id: 'dev-browser',
      token: 'dev-token',
    };
    setLicense(mockLicense);
    localStorage.setItem('snapleads_license', JSON.stringify(mockLicense));
    return { success: true };
  }, []);

  const deactivate = useCallback(async () => {
    const api = getElectronAPI();
    if (api) {
      await api.licenseRemove();
    } else {
      localStorage.removeItem('snapleads_license');
    }
    setLicense(null);
  }, []);

  const checkExpiry = useCallback((): boolean => {
    if (!license) return true;
    return isLicenseExpired(license);
  }, [license]);

  const isActivated = license !== null;
  const isExpired = license !== null && isLicenseExpired(license);
  const isPro = license !== null && license.tier === 'pro' && !isLicenseExpired(license);
  const role: UserRole = license?.role || 'user';
  const isAdmin = role === 'admin';
  const isReseller = role === 'reseller';

  return (
    <LicenseContext.Provider value={{
      license,
      isActivated,
      isExpired,
      isPro,
      isLoading,
      role,
      isAdmin,
      isReseller,
      activate,
      deactivate,
      checkExpiry,
    }}>
      {children}
    </LicenseContext.Provider>
  );
}

export function useLicense(): LicenseContextType {
  const context = useContext(LicenseContext);
  if (!context) {
    throw new Error('useLicense must be used within a LicenseProvider');
  }
  return context;
}
