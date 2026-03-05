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
        'h-screen bg-bg-secondary border-r border-border flex flex-col transition-all duration-300 ease-in-out flex-shrink-0',
        collapsed ? 'w-[68px]' : 'w-[240px]'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-border flex-shrink-0">
        <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-accent to-blue-400 flex items-center justify-center flex-shrink-0 shadow-lg shadow-accent/20">
          <Zap className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-sm font-bold text-text-primary tracking-tight leading-tight">Lead Extractor</h1>
            <p className="text-[11px] text-accent font-medium">Pro Edition</p>
          </div>
        )}
      </div>

      {/* Navigation - Grouped */}
      <nav className="flex-1 py-3 px-3 overflow-y-auto">
        {navGroups.map((group, gi) => (
          <div key={group.label} className={cn('mb-1 last:mb-0', gi > 0 && 'mt-6')}>
            {!collapsed && (
              <p className="text-[10px] font-semibold text-text-muted/70 uppercase tracking-[0.12em] px-3 mb-2 select-none">
                {group.label}
              </p>
            )}
            {collapsed && gi > 0 && <div className="h-px bg-border mx-2 mb-2" />}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSectionChange(item.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150',
                      collapsed && 'justify-center px-0',
                      isActive
                        ? 'bg-accent/10 text-accent border border-accent/20 shadow-sm shadow-accent/5'
                        : 'text-text-secondary hover:text-text-primary hover:bg-white/[0.06] border border-transparent'
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className={cn('w-[18px] h-[18px] flex-shrink-0', isActive && 'text-accent')} />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Version + Collapse */}
      <div className="border-t border-white/[0.06] px-4 py-3 space-y-2">
        {!collapsed && (
          <div className="px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
            <p className="text-[11px] text-text-muted">Version 1.0.0</p>
            <p className="text-[11px] text-accent font-medium">Professional License</p>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center gap-2 py-2.5 text-text-muted hover:text-text-primary transition-colors rounded-[8px] hover:bg-bg-tertiary"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          {!collapsed && <span className="text-xs">Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
