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

const navItems: { id: Section; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'extraction', label: 'New Extraction', icon: Search },
  { id: 'results', label: 'Results', icon: Table2 },
  { id: 'history', label: 'History', icon: History },
  { id: 'blacklist', label: 'Blacklist', icon: ShieldBan },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'reseller', label: 'Reseller Panel', icon: Crown },
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
      <div className="flex items-center gap-3 px-4 h-16 border-b border-border flex-shrink-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-blue-400 flex items-center justify-center flex-shrink-0 shadow-lg shadow-accent/20">
          <Zap className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-sm font-bold text-text-primary tracking-tight leading-tight">Lead Extractor</h1>
            <p className="text-[11px] text-accent font-medium">Pro Edition</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {!collapsed && (
          <p className="text-[10px] font-semibold text-text-muted uppercase tracking-widest px-3 mb-3">
            Menu
          </p>
        )}
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200',
                collapsed && 'justify-center px-0',
                isActive
                  ? 'bg-accent/10 text-accent border border-accent/20'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary border border-transparent'
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={cn('w-[18px] h-[18px] flex-shrink-0', isActive && 'text-accent')} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Version + Collapse */}
      <div className="border-t border-border p-3 space-y-2">
        {!collapsed && (
          <div className="px-3 py-2.5 rounded-lg bg-bg-tertiary/50">
            <p className="text-[11px] text-text-muted">Version 1.0.0</p>
            <p className="text-[11px] text-accent font-medium">Professional License</p>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center py-2.5 text-text-muted hover:text-text-primary transition-colors rounded-lg hover:bg-bg-tertiary"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
}
