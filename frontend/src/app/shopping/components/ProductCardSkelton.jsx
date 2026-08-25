import { Skeleton } from "@/components/ui/skeleton";

const ProductCardSkeleton = () => {
  return (
    <section className="my-5 mx-auto lg:px-4 px-0">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="group overflow-hidden rounded-sm bg-white shadow-lg"
          >
            {/* Image */}
            <div className="relative">
              <Skeleton className="h-60 w-full rounded-none" />

              {/* Fresh & Local badge */}
              <Skeleton className="absolute md:left-4 left-1 md:top-4 bottom-4 h-8 w-28 rounded-full" />

              {/* Wishlist + Cart */}
              <div className="absolute right-4 top-4 flex gap-3">
                <Skeleton className="h-8 w-11 rounded-full" />
                <Skeleton className="h-8 w-11 rounded-full" />
              </div>

              {/* Slider buttons */}
              <Skeleton className="absolute left-2 top-1/2 h-9 w-9 -translate-y-1/2 rounded-full" />
              <Skeleton className="absolute right-2 top-1/2 h-9 w-9 -translate-y-1/2 rounded-full" />
            </div>

            {/* Content */}
            <div className="md:p-2 p-1">
              {/* Product name */}
              <Skeleton className="h-7 md:h-8 w-3/4" />

              {/* Description */}
              <Skeleton className="mt-2 h-5 w-full" />

              {/* Rating */}
              <div className="mt-3 flex items-center gap-2">
                <Skeleton className="h-[18px] w-[18px] rounded-full" />
                <Skeleton className="h-5 w-8" />
                <Skeleton className="h-4 w-10" />
              </div>

              {/* Price */}
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Skeleton className="h-7 md:h-8 w-20" />
                  <Skeleton className="h-6 w-14" />
                </div>

                <div className="space-y-2 text-right">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </div>

              {/* Buttons */}
              <div className="mt-3 flex gap-3">
                <Skeleton className="h-10 flex-1 rounded-xl" />
                <Skeleton className="h-10 w-10 rounded-xl" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProductCardSkeleton;
