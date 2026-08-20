"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const CartItemSkeleton = () => {
  return (
    <Card className="p-4">
      <div className="flex flex-col gap-5 sm:flex-row">
        {/* Image */}
        <Skeleton className="h-32 w-full rounded-lg sm:h-32 sm:w-32" />

        {/* Content */}
        <div className="flex flex-1 flex-col justify-between">
          <div className="space-y-3">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-5 w-24" />
          </div>

          <div className="mt-5 flex items-center justify-between">
            <Skeleton className="h-10 w-32 rounded-md" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-10 w-24 rounded-md" />
          </div>
        </div>
      </div>
    </Card>
  );
};

const SummarySkeleton = () => {
  return (
    <Card className="p-6">
      <Skeleton className="h-7 w-40" />

      <div className="mt-6 space-y-4">
        <Skeleton className="h-12 w-full rounded-lg" />

        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-full" />

        <Skeleton className="h-px w-full" />

        <Skeleton className="h-8 w-full" />

        <Skeleton className="h-11 w-full rounded-md" />
      </div>
    </Card>
  );
};

const CartSkeleton = () => {
  return (
    <section className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      {/* Left */}
      <div className="space-y-5 lg:col-span-2">
        <CartItemSkeleton />
        <CartItemSkeleton />
        <CartItemSkeleton />
      </div>

      {/* Right */}
      <SummarySkeleton />
    </section>
  );
};

export default CartSkeleton;
