import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Skeleton: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => {
  return (
    <div
      className={twMerge(
        clsx('animate-pulse rounded-xl bg-brand-border/60', className)
      )}
      {...props}
    />
  );
};

export const DashboardCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-brand-border p-6 shadow-subtle space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <Skeleton className="h-8 w-36" />
      <Skeleton className="h-4 w-48" />
    </div>
  );
};
