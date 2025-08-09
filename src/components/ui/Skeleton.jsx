import React from 'react';
import { cn } from '@/lib/utils';

const Skeleton = ({ className, ...props }) => {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
};

// Composants skeleton specialises
export const ListingCardSkeleton = () => (
  <div className="bg-card rounded-lg shadow-lg overflow-hidden">
    <Skeleton className="h-48 w-full" />
    <div className="p-4 space-y-3">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-6 w-1/3" />
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-8 w-20 rounded" />
      </div>
    </div>
  </div>
);

export const MessageCardSkeleton = () => (
  <div className="bg-card rounded-lg p-4 space-y-3">
    <div className="flex items-center space-x-3">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-2/3" />
  </div>
);

export const StatsCardSkeleton = () => (
  <div className="bg-card rounded-lg p-6 space-y-3">
    <div className="flex items-center justify-between">
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-8 w-8 rounded" />
    </div>
    <Skeleton className="h-8 w-1/3" />
    <Skeleton className="h-3 w-2/3" />
  </div>
);

export const TableRowSkeleton = () => (
  <div className="flex items-center space-x-4 p-4">
    <Skeleton className="h-10 w-10 rounded" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-1/4" />
      <Skeleton className="h-3 w-1/3" />
    </div>
    <Skeleton className="h-4 w-20" />
    <Skeleton className="h-8 w-16 rounded" />
  </div>
);

export default Skeleton; 