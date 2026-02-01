// Breadcrumbs Component (SEO Optimization #9, #37)
// Provides navigation breadcrumbs with structured data

import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { addStructuredData, removeStructuredData, generateBreadcrumbSchema } from '@/lib/seo';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
  showHome?: boolean;
  separator?: React.ReactNode;
}

export function Breadcrumbs({
  items,
  className,
  showHome = true,
  separator = <ChevronRight className="w-4 h-4 text-gray-600" />,
}: BreadcrumbsProps) {
  const location = useLocation();
  const baseUrl = 'https://textshift.org';

  // Add structured data for breadcrumbs
  useEffect(() => {
    const breadcrumbItems = [
      ...(showHome ? [{ name: 'Home', url: baseUrl }] : []),
      ...items.map((item) => ({
        name: item.label,
        url: item.href ? `${baseUrl}${item.href}` : `${baseUrl}${location.pathname}`,
      })),
    ];

    const schema = generateBreadcrumbSchema(breadcrumbItems);
    addStructuredData(schema, 'breadcrumb-schema');

    return () => {
      removeStructuredData('breadcrumb-schema');
    };
  }, [items, showHome, location.pathname]);

  const allItems = showHome
    ? [{ label: 'Home', href: '/' }, ...items]
    : items;

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex items-center text-sm', className)}
    >
      <ol className="flex items-center gap-2" itemScope itemType="https://schema.org/BreadcrumbList">
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1;
          const isHome = index === 0 && showHome;

          return (
            <li
              key={item.href || item.label}
              className="flex items-center gap-2"
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
            >
              {index > 0 && separator}
              
              {isLast ? (
                <span
                  className="text-gray-400"
                  itemProp="name"
                  aria-current="page"
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.href || '#'}
                  className="text-gray-500 hover:text-white transition flex items-center gap-1"
                  itemProp="item"
                >
                  {isHome && <Home className="w-4 h-4" />}
                  <span itemProp="name">{isHome ? '' : item.label}</span>
                </Link>
              )}
              
              <meta itemProp="position" content={String(index + 1)} />
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// Auto-generate breadcrumbs from route
export function AutoBreadcrumbs({ className }: { className?: string }) {
  const location = useLocation();
  
  const pathSegments = location.pathname
    .split('/')
    .filter(Boolean)
    .map((segment, index, arr) => ({
      label: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
      href: '/' + arr.slice(0, index + 1).join('/'),
    }));

  if (pathSegments.length === 0) {
    return null;
  }

  // Mark last item as current (no href)
  const items = pathSegments.map((item, index) => ({
    ...item,
    href: index === pathSegments.length - 1 ? undefined : item.href,
  }));

  return <Breadcrumbs items={items} className={className} />;
}

export default Breadcrumbs;
