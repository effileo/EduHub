import React from 'react';

const SkeletonCard = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 p-6 animate-pulse ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="h-4 bg-slate-200 rounded w-1/3"></div>
        <div className="h-4 bg-slate-100 rounded w-1/4"></div>
      </div>
      <div className="space-y-3">
        <div className="h-8 bg-slate-200 rounded w-1/2"></div>
        <div className="h-3 bg-slate-100 rounded w-full"></div>
        <div className="h-3 bg-slate-100 rounded w-5/6"></div>
      </div>
      <div className="mt-6 pt-4 border-t border-slate-50 flex justify-between items-center">
        <div className="h-4 bg-slate-100 rounded w-1/4"></div>
        <div className="h-8 bg-slate-200 rounded-lg w-20"></div>
      </div>
    </div>
  );
};

export default SkeletonCard;
