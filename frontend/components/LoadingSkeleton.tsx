'use client';
import { useTheme } from '@/components/ThemeProvider';

interface SkeletonProps {
  rows?: number;
  className?: string;
  type?: 'card' | 'list' | 'table';
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton rounded-xl ${className}`} />;
}

export default function LoadingSkeleton({ rows = 6, type = 'card' }: SkeletonProps) {
  if (type === 'list') {
    return (
      <div className="space-y-3">
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="w-10 h-10 skeleton rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 skeleton rounded w-3/4" />
              <div className="h-3 skeleton rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (type === 'table') {
    return (
      <div className="space-y-2">
        <div className="h-10 skeleton rounded-xl" />
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="h-14 skeleton rounded-xl" />
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="h-48 skeleton rounded-2xl" />
      ))}
    </div>
  );
}
