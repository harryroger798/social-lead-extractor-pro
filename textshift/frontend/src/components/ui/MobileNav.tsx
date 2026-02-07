// Mobile Navigation Component (Mobile Optimization #11, #41)
// Responsive mobile navigation with hamburger menu

import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useScrollLock } from '@/lib/mobile';

interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  children?: NavItem[];
}

interface MobileNavProps {
  items: NavItem[];
  logo?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function MobileNav({ items, logo, actions, className }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const location = useLocation();

  // Lock scroll when menu is open
  useScrollLock(isOpen);

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
    setExpandedItem(null);
  }, [location.pathname]);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  return (
    <nav className={cn('md:hidden', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        {logo}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="touch-target flex items-center justify-center text-white"
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isOpen}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 animate-fade-in"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu Panel */}
          <div
            className="fixed top-0 right-0 bottom-0 w-[80%] max-w-sm bg-[#111] border-l border-white/10 z-50 overflow-y-auto safe-area-right animate-slide-in-right"
          >
              {/* Close button */}
              <div className="flex justify-end p-4">
                <button
                  onClick={() => setIsOpen(false)}
                  className="touch-target flex items-center justify-center text-gray-400 hover:text-white"
                  aria-label="Close menu"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Navigation Items */}
              <div className="px-4 pb-8">
                <ul className="space-y-1">
                  {items.map((item) => (
                    <li key={item.href}>
                      {item.children ? (
                        <div>
                          <button
                            onClick={() =>
                              setExpandedItem(
                                expandedItem === item.href ? null : item.href
                              )
                            }
                            className="w-full flex items-center justify-between px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition touch-target"
                          >
                            <span className="flex items-center gap-3">
                              {item.icon}
                              {item.label}
                            </span>
                            <ChevronRight
                              className={cn(
                                'w-5 h-5 transition-transform',
                                expandedItem === item.href && 'rotate-90'
                              )}
                            />
                          </button>
                          {expandedItem === item.href && (
                            <ul
                              className="overflow-hidden pl-8 animate-fade-in"
                            >
                                {item.children.map((child) => (
                                  <li key={child.href}>
                                    <Link
                                      to={child.href}
                                      className={cn(
                                        'block px-4 py-2 text-sm rounded-lg transition touch-target',
                                        location.pathname === child.href
                                          ? 'text-emerald-400 bg-emerald-500/10'
                                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                                      )}
                                    >
                                      {child.label}
                                    </Link>
                                  </li>
                                ))}
                            </ul>
                          )}
                        </div>
                      ) : (
                        <Link
                          to={item.href}
                          className={cn(
                            'flex items-center gap-3 px-4 py-3 rounded-lg transition touch-target',
                            location.pathname === item.href
                              ? 'text-emerald-400 bg-emerald-500/10'
                              : 'text-gray-300 hover:text-white hover:bg-white/5'
                          )}
                        >
                          {item.icon}
                          {item.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>

                {/* Actions */}
                {actions && (
                  <div className="mt-8 pt-8 border-t border-white/10">
                    {actions}
                  </div>
                )}
              </div>
          </div>
        </>
      )}
    </nav>
  );
}

// Bottom Tab Navigation (Mobile Optimization #42)
interface TabItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  activeIcon?: React.ReactNode;
}

interface BottomTabNavProps {
  items: TabItem[];
  className?: string;
}

export function BottomTabNav({ items, className }: BottomTabNavProps) {
  const location = useLocation();

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 bg-[#111]/95 backdrop-blur-lg border-t border-white/10 safe-area-bottom z-50 md:hidden',
        className
      )}
    >
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex flex-col items-center justify-center py-2 px-4 touch-target transition',
                isActive ? 'text-emerald-400' : 'text-gray-500'
              )}
            >
              {isActive && item.activeIcon ? item.activeIcon : item.icon}
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default MobileNav;
