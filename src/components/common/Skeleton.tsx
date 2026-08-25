import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className = 'h-6 w-full' }) => {
  return <div className={`animate-pulse bg-[#1C1C21] border border-[#26262B] rounded-md ${className}`}></div>;
};

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 items-center">
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
  );
};
