import { Skeleton } from "@/components/ui/skeleton";

export default function WeatherSkeleton() {
  return (
    <div className="bg-[#026d04b4] backdrop-blur-2xl rounded-md p-2 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 text-white animate-pulse">
      {/* Left */}
      <div className="col-span-1 md:col-span-2 border-r border-gray-500 pr-3">
        <Skeleton className="h-5 w-48 bg-white/20" />

        <Skeleton className="h-4 w-28 mt-3 bg-white/20" />

        <div className="flex gap-3 items-center mt-6">
          <Skeleton className="h-20 w-20 rounded-full bg-white/20" />

          <div className="space-y-3">
            <Skeleton className="h-8 w-24 bg-white/20" />
            <Skeleton className="h-4 w-20 bg-white/20" />
            <Skeleton className="h-4 w-32 bg-white/20" />
          </div>
        </div>
      </div>

      {/* Middle */}
      <div className="col-span-1 border-r border-gray-500 px-3 pt-2 space-y-5">
        {[1, 2, 3, 4].map((item) => (
          <div key={item}>
            <Skeleton className="h-4 w-24 bg-white/20 mb-2" />
            <Skeleton className="h-5 w-14 bg-white/20 ml-6" />
          </div>
        ))}
      </div>

      {/* Right */}
      <div className="col-span-3 pt-2">
        <div className="border-b border-gray-500 p-2 flex justify-between">
          <Skeleton className="h-5 w-32 bg-white/20" />
          <Skeleton className="h-5 w-16 bg-white/20" />
        </div>

        <div className="flex justify-between gap-2 p-2">
          {Array.from({ length: 7 }).map((_, index) => (
            <div
              key={index}
              className="flex flex-col items-center gap-2 rounded-md px-2 py-1"
            >
              <Skeleton className="h-4 w-8 bg-white/20" />

              <Skeleton className="h-10 w-10 rounded-full bg-white/20" />

              <Skeleton className="h-4 w-8 bg-white/20" />

              <Skeleton className="h-4 w-8 bg-white/20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
