const WeatherSkeleton = () => {
  return (
    <div className="bg-[#026d04b4] backdrop-blur-2xl rounded-md p-2 text-white animate-pulse">
      {/* SEARCH + REFRESH */}
      <div className="flex items-center gap-2 mx-auto w-full md:w-1/2">
        {/* Search input */}
        <div className="relative flex-1">
          <div className="h-9 w-full rounded-md bg-white/20" />

          {/* Search button skeleton */}
          <div className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-md bg-white/20" />
        </div>

        {/* Refresh button skeleton */}
        <div className="h-9 w-9 shrink-0 rounded-md bg-white/20" />
      </div>

      {/* WEATHER */}
      <div className="grid grid-cols-1 md:grid-cols-2 mt-2">
        {/* CURRENT WEATHER */}
        <div className="col-span-1 md:border-r border-gray-500 p-2">
          {/* Location */}
          <div className="h-4 w-3/4 rounded bg-white/20" />

          {/* Date */}
          <div className="h-4 w-1/3 rounded bg-white/20 mt-3" />

          {/* Weather image + temperature */}
          <div className="flex gap-2 items-start mt-4">
            {/* Weather icon */}
            <div className="h-[120px] w-[120px] shrink-0 rounded-full bg-white/20" />

            {/* Temperature information */}
            <div className="space-y-3 pt-2">
              {/* Temperature */}
              <div className="h-8 w-20 rounded bg-white/20" />

              {/* Weather condition */}
              <div className="h-4 w-28 rounded bg-white/20" />

              {/* Feels like */}
              <div className="h-3 w-32 rounded bg-white/20" />
            </div>
          </div>
        </div>

        {/* WEATHER DETAILS */}
        <div className="text-sm md:text-base col-span-1 pl-2 pt-2 space-y-2 flex items-center justify-around md:flex-col">
          {/* Humidity */}
          <div className="space-y-2 flex flex-col items-center justify-center">
            <div className="h-4 w-20 rounded bg-white/20" />
            <div className="h-4 w-12 rounded bg-white/20" />
          </div>

          {/* Rainfall */}
          <div className="space-y-2 flex flex-col items-center justify-center">
            <div className="h-4 w-20 rounded bg-white/20" />
            <div className="h-4 w-12 rounded bg-white/20" />
          </div>

          {/* Wind */}
          <div className="space-y-2 flex flex-col items-center justify-center">
            <div className="h-4 w-16 rounded bg-white/20" />
            <div className="h-4 w-16 rounded bg-white/20" />
          </div>

          {/* UV */}
          <div className="space-y-2 flex flex-col items-center justify-center">
            <div className="h-4 w-20 rounded bg-white/20" />
            <div className="h-4 w-12 rounded bg-white/20" />
          </div>
        </div>

        {/* 7 DAY FORECAST */}
        <div className="col-span-1 md:col-span-2 pt-2 overflow-hidden">
          {/* Heading */}
          <div className="border-b p-2">
            <div className="h-4 w-28 rounded bg-white/20" />
          </div>

          {/* Forecast */}
          <div className="flex gap-5 items-center justify-between p-2 overflow-hidden">
            {Array.from({ length: 7 }).map((_, index) => (
              <div
                key={index}
                className="flex flex-col items-center justify-center shrink-0"
              >
                {/* Day */}
                <div className="h-4 w-8 rounded bg-white/20" />

                {/* Weather icon */}
                <div className="h-10 w-10 rounded-full bg-white/20 my-1" />

                {/* Max temperature */}
                <div className="h-4 w-10 rounded bg-white/20" />

                {/* Min temperature */}
                <div className="h-3 w-8 rounded bg-white/20 mt-1" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherSkeleton;
