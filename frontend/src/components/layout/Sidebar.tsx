import {
  LayoutDashboard,
  Search,
  Table2,
  History,
  ShieldBan,
  Settings,
  Crown,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Clock,
  Mail,
  Database,
  MessageCircle,
  Smartphone,
  Globe,
  Shield,
  Lock,
  LogOut,
} from 'lucide-react';
import type { Section } from '@/types';
import { cn } from '@/lib/utils';
import { useLicense, PRO_ONLY_FEATURES, type UserRole } from '@/contexts/LicenseContext';

interface SidebarProps {
  activeSection: Section;
  onSectionChange: (section: Section) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

interface NavItem {
  id: Section;
  label: string;
  icon: typeof LayoutDashboard;
  /** Minimum roles that can see this item. If omitted, all roles can see it. */
  minRoles?: UserRole[];
}

interface NavGroup {
  label: string;
  items: NavItem[];
  /** Minimum roles that can see this entire group. If omitted, all roles can see it. */
  minRoles?: UserRole[];
}

const navGroups: NavGroup[] = [
  {
    label: 'Extraction',
    items: [
      { id: 'dashboard' as Section, label: 'Dashboard', icon: LayoutDashboard },
      { id: 'extraction' as Section, label: 'New Extraction', icon: Search },
      { id: 'results' as Section, label: 'Results', icon: Table2 },
      { id: 'history' as Section, label: 'History', icon: History },
    ],
  },
  {
    label: 'Scrapers',
    items: [
      { id: 'gmaps' as Section, label: 'Google Maps', icon: MapPin },
      { id: 'telegram' as Section, label: 'Telegram', icon: MessageCircle },
      { id: 'whatsapp' as Section, label: 'WhatsApp', icon: Smartphone },
      { id: 'email_finder' as Section, label: 'Email Finder', icon: Globe },
    ],
  },
  {
    label: 'Automation',
    items: [
      { id: 'schedules' as Section, label: 'Schedules', icon: Clock },
      { id: 'outreach' as Section, label: 'Email Outreach', icon: Mail },
      { id: 'crm' as Section, label: 'CRM Export', icon: Database },
    ],
  },
  {
    label: 'Management',
    items: [
      { id: 'blacklist' as Section, label: 'Blacklist', icon: ShieldBan },
      { id: 'settings' as Section, label: 'Settings', icon: Settings },
      { id: 'safety_guide' as Section, label: 'Safety Guide', icon: Shield },
    ],
  },
  {
    label: 'Business',
    minRoles: ['admin', 'master_reseller', 'reseller'],
    items: [
      { id: 'reseller' as Section, label: 'Reseller Panel', icon: Crown, minRoles: ['admin', 'master_reseller', 'reseller'] },
    ],
  },
];

export default function Sidebar({ activeSection, onSectionChange, collapsed, onToggleCollapse }: SidebarProps) {
  const { license, isPro, role, deactivate } = useLicense();
  const proOnlySet = new Set<string>(PRO_ONLY_FEATURES as unknown as string[]);

  const canSeeRole = (minRoles?: UserRole[]): boolean => {
    if (!minRoles || minRoles.length === 0) return true;
    return minRoles.includes(role);
  };

  return (
    <aside
      className={cn(
        'sidebar h-screen flex flex-col transition-all duration-300 ease-in-out flex-shrink-0',
        'bg-bg-sidebar',
        collapsed ? 'w-[72px]' : 'w-[260px]'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3.5 px-5 h-[72px] border-b border-[#3f3f46] flex-shrink-0">
        <img src="./favicon.png" alt="SnapLeads" className="w-10 h-10 rounded-xl flex-shrink-0 shadow-lg shadow-accent/25" />
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-[15px] font-bold text-text-primary tracking-tight leading-tight">SnapLeads</h1>
            <p className={cn('text-[11px] font-semibold tracking-wide', isPro ? 'text-amber-400' : 'text-accent')}>
              {role === 'admin' ? 'ADMIN' : role === 'master_reseller' ? 'MASTER RESELLER' : role === 'reseller' ? 'RESELLER' : isPro ? 'PRO EDITION' : 'STARTER EDITION'}
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-5 px-3.5 overflow-y-auto">
        {navGroups.filter(group => canSeeRole(group.minRoles)).map((group, gi) => (
          <div key={group.label} className={cn(gi > 0 && 'pt-7')}>
            {!collapsed && (
              <p className="text-[10px] font-bold text-text-muted/60 uppercase tracking-[0.15em] px-3 pb-3 select-none">
                {group.label}
              </p>
            )}
            {collapsed && gi > 0 && <div className="h-px bg-border mx-3 pb-3 pt-2" />}
            <div className="flex flex-col gap-1">
              {group.items.filter(item => canSeeRole(item.minRoles)).map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                const isProOnly = proOnlySet.has(item.id) && !isPro;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSectionChange(item.id)}
                    className={cn(
                      'w-full flex items-center gap-3 rounded-xl text-[13px] font-medium transition-all duration-150',
                      collapsed ? 'justify-center px-0 py-2.5' : 'px-3.5 py-2.5',
                      isActive
                        ? 'bg-accent/12 text-accent shadow-sm shadow-accent/10 border border-accent/25'
                        : 'text-text-secondary hover:text-text-primary hover:bg-zinc-700/30 border border-transparent',
                      isProOnly && 'opacity-60'
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className={cn('w-[18px] h-[18px] flex-shrink-0', isActive ? 'text-accent' : '')} />
                    {!collapsed && (
                      <>
                        <span className="truncate flex-1 text-left">{item.label}</span>
                        {isProOnly && <Lock className="w-3.5 h-3.5 text-amber-400/60 flex-shrink-0" />}
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-[#3f3f46] px-3.5 py-4 flex flex-col gap-3">
        {!collapsed && license && (
          <div className="px-3.5 py-3 rounded-xl bg-zinc-800/40 border border-[#3f3f46]">
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-text-muted font-medium">Version 2.2.0</p>
              <button
                onClick={deactivate}
                className="text-text-muted hover:text-error transition-colors"
                title="Deactivate license"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex items-center gap-1.5 pt-1">
              {isPro ? (
                <Crown className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <Shield className="w-3.5 h-3.5 text-accent" />
              )}
              <p className={cn('text-[11px] font-semibold', isPro ? 'text-amber-400' : 'text-accent')}>
                {role === 'admin' ? 'Admin' : role === 'master_reseller' ? 'Master Reseller' : role === 'reseller' ? 'Reseller' : license.tier === 'pro' ? 'Pro' : 'Starter'} — {license.cycle}
              </p>
            </div>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center gap-2 py-2.5 text-text-muted hover:text-text-secondary transition-colors rounded-xl hover:bg-zinc-800/40"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          {!collapsed && <span className="text-xs font-medium">Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
