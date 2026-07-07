import React from 'react';

export const SkeletonCard = ({ height = 'h-32' }) => (
  <div className={`animate-pulse bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full ${height}`}>
    <div className="h-4 bg-slate-800 rounded w-1/3 mb-4"></div>
    <div className="h-8 bg-slate-800 rounded w-1/2 mb-3"></div>
    <div className="h-3 bg-slate-800 rounded w-1/4"></div>
  </div>
);

export const SkeletonTable = ({ rows = 5, cols = 4 }) => (
  <div className="animate-pulse w-full bg-slate-900/50 border border-slate-800/80 rounded-3xl overflow-hidden p-6">
    {/* Table Header Placeholder */}
    <div className="flex border-b border-slate-800 pb-4 mb-4">
      {Array.from({ length: cols }).map((_, i) => (
        <div key={i} className="flex-1 h-4 bg-slate-800 rounded mx-2"></div>
      ))}
    </div>
    {/* Table Body Placeholders */}
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex py-2">
          {Array.from({ length: cols }).map((_, c) => (
            <div key={c} className="flex-1 h-3.5 bg-slate-800 rounded mx-2"></div>
          ))}
        </div>
      ))}
    </div>
  </div>
);

export const SkeletonGrid = ({ count = 4 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

const LoadingSkeleton = {
  Card: SkeletonCard,
  Table: SkeletonTable,
  Grid: SkeletonGrid
};

export default LoadingSkeleton;
