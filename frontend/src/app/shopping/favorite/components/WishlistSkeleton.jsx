"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const WishlistCardSkeleton = () => {
  return (
    <Card className="overflow-hidden rounded-xl">
      {/* Image */}
      <Skeleton className="h-72 w-full -mt-4" />

      <CardContent className="p-2">
        {/* Product Name */}
        <div className="space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/3" />
        </div>

        {/* Price */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-5 w-16" />
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
};

const WishlistSkeleton = () => {
  return (
    <>
      {/* Heading */}
      <div className="mb-8">
        <Skeleton className="h-9 w-56 mb-2" />
        <Skeleton className="h-5 w-24" />
      </div>

      {/* Cards */}
      <div className="grid gap-6 sm:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <WishlistCardSkeleton key={index} />
        ))}
      </div>
    </>
  );
};

export default WishlistSkeleton;
