import Image from "next/image";
import React, { useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const MediaCarousel = ({ mediaUrls, product }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrevious = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) =>
      prev === 0 ? product.imageUrls.length - 1 : prev - 1,
    );
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) =>
      prev === product.imageUrls.length - 1 ? 0 : prev + 1,
    );
  };

  return (
    <div className="relative rounded-lg overflow-hidden mb-8">
      <div className="relative mx-auto h-96 sm:h-125 md:h-96 flex items-center justify-center border shadow-2xl">
        <Image
          src={mediaUrls[currentIndex]}
          alt={`Product media ${currentIndex + 1}`}
          fill
          className="object-contain"
          priority
          unoptimized
        />

        {/* Previous Button */}
        {mediaUrls.length > 1 && (
          <button
            onClick={handlePrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-black p-3 rounded-full shadow-lg transition-all active:scale-95"
            aria-label="Previous media"
          >
            <FaChevronLeft className="text-lg" />
          </button>
        )}

        {/* Next Button */}
        {mediaUrls.length > 1 && (
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-black p-3 rounded-full shadow-lg transition-all active:scale-95"
            aria-label="Next media"
          >
            <FaChevronRight className="text-lg" />
          </button>
        )}

        {/* Media Counter */}
        {mediaUrls.length > 1 && (
          <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded text-sm">
            {currentIndex + 1} / {mediaUrls.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {mediaUrls.length > 1 && (
        <div className="flex gap-2 p-4 bg-gray-100 overflow-x-auto">
          {mediaUrls.map((media, index) => {
            return (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`shrink-0 relative h-16 w-16 rounded overflow-hidden border-2 transition-all ${
                  currentIndex === index
                    ? "border-green-600"
                    : "border-gray-300 opacity-70 hover:opacity-100"
                }`}
              >
                <Image
                  src={media}
                  alt={`Thumbnail ${index + 1}`}
                  width={50}
                  height={50}
                  className="object-cover"
                  unoptimized
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MediaCarousel;
