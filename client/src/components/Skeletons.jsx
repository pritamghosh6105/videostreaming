import React from 'react';

export const VideoCardSkeleton = () => {
  return (
    <div className="flex flex-col gap-2">
      {/* Thumbnail placeholder */}
      <div className="aspect-video w-full rounded-xl skeleton-loading" />
      {/* Detail row placeholder */}
      <div className="flex gap-3 mt-1">
        <div className="h-9 w-9 rounded-full skeleton-loading shrink-0" />
        <div className="flex flex-col gap-2 w-full">
          <div className="h-4 w-5/6 rounded skeleton-loading" />
          <div className="h-3 w-1/2 rounded skeleton-loading" />
          <div className="h-3 w-1/3 rounded skeleton-loading" />
        </div>
      </div>
    </div>
  );
};

export const VideoGridSkeleton = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {Array.from({ length: count }).map((_, i) => (
        <VideoCardSkeleton key={i} />
      ))}
    </div>
  );
};

export const WatchPageSkeleton = () => {
  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 md:p-6 max-w-7xl mx-auto w-full">
      {/* Main player side */}
      <div className="flex-grow lg:w-2/3 flex flex-col gap-4">
        <div className="aspect-video w-full rounded-xl skeleton-loading" />
        <div className="h-8 w-3/4 rounded skeleton-loading" />
        <div className="flex justify-between items-center py-2">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full skeleton-loading" />
            <div className="flex flex-col gap-1">
              <div className="h-4 w-28 rounded skeleton-loading" />
              <div className="h-3 w-16 rounded skeleton-loading" />
            </div>
          </div>
          <div className="h-10 w-32 rounded-full skeleton-loading" />
        </div>
        <div className="h-24 w-full rounded-xl skeleton-loading" />
      </div>
      {/* Recommendation sidebar */}
      <div className="lg:w-1/3 flex flex-col gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-2">
            <div className="w-40 aspect-video rounded-lg skeleton-loading shrink-0" />
            <div className="flex flex-col gap-2 w-full">
              <div className="h-4 w-full rounded skeleton-loading" />
              <div className="h-3 w-2/3 rounded skeleton-loading" />
              <div className="h-3 w-1/3 rounded skeleton-loading" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const CommentSkeleton = () => {
  return (
    <div className="flex gap-3 py-3">
      <div className="h-10 w-10 rounded-full skeleton-loading shrink-0" />
      <div className="flex flex-col gap-2 w-full">
        <div className="flex gap-2 items-center">
          <div className="h-4 w-24 rounded skeleton-loading" />
          <div className="h-3 w-16 rounded skeleton-loading" />
        </div>
        <div className="h-4 w-11/12 rounded skeleton-loading" />
        <div className="h-4 w-2/3 rounded skeleton-loading" />
      </div>
    </div>
  );
};
