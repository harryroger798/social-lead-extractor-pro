// Skeleton Loader Component (Speed Optimization #28)
// Provides loading placeholders to prevent layout shift

import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export function Skeleton({
  className,
  variant = 'rectangular',
  width,
  height,
  animation = 'wave',
}: SkeletonProps) {
  const baseStyles = 'bg-gray-800';
  
  const variantStyles = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: '',
    rounded: 'rounded-lg',
  };
  
  const animationStyles = {
    pulse: 'animate-pulse',
    wave: 'skeleton',
    none: '',
  };
  
  return (
    <div
      className={cn(
        baseStyles,
        variantStyles[variant],
        animationStyles[animation],
        className
      )}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
    />
  );
}

// Card Skeleton
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('p-6 rounded-xl border border-white/10 bg-white/5', className)}>
      <Skeleton variant="rounded" height={200} className="mb-4" />
      <Skeleton variant="text" height={24} width="60%" className="mb-2" />
      <Skeleton variant="text" height={16} width="80%" className="mb-2" />
      <Skeleton variant="text" height={16} width="40%" />
    </div>
  );
}

// Table Row Skeleton
export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <tr className="border-b border-white/10">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="p-4">
          <Skeleton variant="text" height={20} width={i === 0 ? '80%' : '60%'} />
        </td>
      ))}
    </tr>
  );
}

// List Item Skeleton
export function ListItemSkeleton({ hasAvatar = false }: { hasAvatar?: boolean }) {
  return (
    <div className="flex items-center gap-4 p-4">
      {hasAvatar && <Skeleton variant="circular" width={40} height={40} />}
      <div className="flex-1">
        <Skeleton variant="text" height={20} width="70%" className="mb-2" />
        <Skeleton variant="text" height={16} width="50%" />
      </div>
    </div>
  );
}

// Dashboard Stats Skeleton
export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="p-6 rounded-xl border border-white/10 bg-white/5">
          <Skeleton variant="text" height={16} width="40%" className="mb-2" />
          <Skeleton variant="text" height={32} width="60%" className="mb-1" />
          <Skeleton variant="text" height={14} width="30%" />
        </div>
      ))}
    </div>
  );
}

// Form Skeleton
export function FormSkeleton({ fields = 3 }: { fields?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i}>
          <Skeleton variant="text" height={16} width="30%" className="mb-2" />
          <Skeleton variant="rounded" height={44} className="w-full" />
        </div>
      ))}
      <Skeleton variant="rounded" height={44} width="120px" className="mt-4" />
    </div>
  );
}

// Text Block Skeleton
export function TextBlockSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          height={16}
          width={i === lines - 1 ? '60%' : '100%'}
        />
      ))}
    </div>
  );
}

// History Item Skeleton
export function HistoryItemSkeleton() {
  return (
    <div className="p-4 rounded-lg border border-white/10 bg-white/5">
      <div className="flex items-center justify-between mb-3">
        <Skeleton variant="rounded" height={24} width={80} />
        <Skeleton variant="text" height={14} width={100} />
      </div>
      <Skeleton variant="text" height={16} className="mb-2" />
      <Skeleton variant="text" height={16} width="80%" className="mb-3" />
      <div className="flex gap-2">
        <Skeleton variant="rounded" height={32} width={80} />
        <Skeleton variant="rounded" height={32} width={80} />
      </div>
    </div>
  );
}

// Pricing Card Skeleton
export function PricingCardSkeleton() {
  return (
    <div className="p-6 rounded-2xl border border-white/10 bg-white/5">
      <Skeleton variant="text" height={28} width="50%" className="mb-2" />
      <Skeleton variant="text" height={40} width="40%" className="mb-4" />
      <div className="space-y-3 mb-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton variant="circular" width={20} height={20} />
            <Skeleton variant="text" height={16} width="80%" />
          </div>
        ))}
      </div>
      <Skeleton variant="rounded" height={44} className="w-full" />
    </div>
  );
}

export default Skeleton;
