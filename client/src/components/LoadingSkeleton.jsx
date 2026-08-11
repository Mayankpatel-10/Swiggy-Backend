import React from 'react';

export default function LoadingSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-warm-card rounded-2xl p-4 border border-warm-border space-y-3 animate-pulse">
          <div className="w-full aspect-[16/9] bg-warm-beige/80 rounded-xl" />
          <div className="h-4 bg-warm-beige/80 rounded w-3/4" />
          <div className="h-3 bg-warm-beige/80 rounded w-1/2" />
          <div className="h-3 bg-warm-beige/80 rounded w-full" />
        </div>
      ))}
    </div>
  );
}
