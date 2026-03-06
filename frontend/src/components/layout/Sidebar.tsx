import {
  LayoutDashboard,
  Search,
  Table2,
  History,
  ShieldBan,
  Settings,
  Crown,
  Zap,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type { Section } from '@/types';
import { cn } from '@/lib/utils';

interface SidebarProps {
  activeSection: Section;
  onSectionChange: (section: Section) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const navGroups = [
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
    label: 'Management',
    items: [
      { id: 'blacklist' as Section, label: 'Blacklist', icon: ShieldBan },
      { id: 'settings' as Section, label: 'Settings', icon: Settings },
    ],
  },
  {
    label: 'Business',
    items: [
      { id: 'reseller' as Section, label: 'Reseller Panel', icon: Crown },
    ],
  },
];

export default function Sidebar({ activeSection, onSectionChange, collapsed, onToggleCollapse }: SidebarProps) {
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
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-blue-400 flex items-center justify-center flex-shrink-0 shadow-lg shadow-accent/25">
          <Zap className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-[15px] font-bold text-text-primary tracking-tight leading-tight">Lead Extractor</h1>
            <p className="text-[11px] text-accent font-semibold tracking-wide">PRO EDITION</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-5 px-3.5 overflow-y-auto">
        {navGroups.map((group, gi) => (
          <div key={group.label} className={cn(gi > 0 && 'pt-7')}>
            {!collapsed && (
              <p className="text-[10px] font-bold text-text-muted/60 uppercase tracking-[0.15em] px-3 pb-3 select-none">
                {group.label}
              </p>
            )}
            {collapsed && gi > 0 && <div className="h-px bg-border mx-3 pb-3 pt-2" />}
            <div className="flex flex-col gap-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSectionChange(item.id)}
                    className={cn(
                      'w-full flex items-center gap-3 rounded-xl text-[13px] font-medium transition-all duration-150',
                      collapsed ? 'justify-center px-0 py-2.5' : 'px-3.5 py-2.5',
                      isActive
                        ? 'bg-accent/12 text-accent shadow-sm shadow-accent/10 border border-accent/25'
                        : 'text-text-secondary hover:text-text-primary hover:bg-white/[0.04] border border-transparent'
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className={cn('w-[18px] h-[18px] flex-shrink-0', isActive ? 'text-accent' : '')} />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-[#3f3f46] px-3.5 py-4 flex flex-col gap-3">
        {!collapsed && (
          <div className="px-3.5 py-3 rounded-xl bg-white/[0.04] border border-[#3f3f46]">
            <p className="text-[11px] text-text-muted font-medium">Version 1.0.0</p>
            <p className="text-[11px] text-accent font-semibold pt-0.5">Professional License</p>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center gap-2 py-2.5 text-text-muted hover:text-text-secondary transition-colors rounded-xl hover:bg-white/[0.03]"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          {!collapsed && <span className="text-xs font-medium">Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
