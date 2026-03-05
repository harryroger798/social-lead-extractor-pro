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
        'h-screen bg-bg-secondary border-r border-border flex flex-col transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
          <Zap className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-sm font-bold text-text-primary truncate">Social Lead Extractor</h1>
            <p className="text-xs text-text-muted">Pro Edition</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-accent text-white shadow-lg shadow-accent/25'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <div className="border-t border-border p-2">
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center py-2 text-text-muted hover:text-text-primary transition-colors rounded-lg hover:bg-bg-tertiary"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>
    </aside>
  );
}
