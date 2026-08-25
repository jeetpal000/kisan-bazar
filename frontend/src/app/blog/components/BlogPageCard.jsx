import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { CiClock2 } from "react-icons/ci";
import {
  FaArrowRight,
  FaChevronLeft,
  FaChevronRight,
  FaRegCalendarAlt,
} from "react-icons/fa";

const BlogPageCard = ({ blog }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const mediaUrls = blog.mediaUrls || [];

  if (!mediaUrls.length === 0) {
    return (
      <div className="shadow-lg hover:shadow-2xl transition-shadow duration-300 group p-2 rounded-xl h-full">
        <div className="relative w-full h-48 flex items-center justify-center bg-[#f3f3f3] rounded-xl">
          <p className="text-gray-500">No media available</p>
        </div>
        <div className="mt-4">
          <p className="font-bold text-lg text-gray-800 line-clamp-2">
            {blog.blogName}
          </p>
        </div>
      </div>
    );
  }

  const currentMedia = mediaUrls[currentIndex];

  const currentMediaUrl = currentMedia.url;
  const currentMediaType = currentMedia.type;
  const handlePrevious = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? mediaUrls.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === mediaUrls.length - 1 ? 0 : prev + 1));
  };

  return (
    <section className="grid md:grid-cols-[2fr_2fr] gap-5 border border-[#80808024] rounded overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <div className="relative w-full h-75 lg:h-72 items-center justify-center rounded-xl overflow-hidden mb-4">
        {currentMediaType === "video" ? (
          <>
            <video src={currentMediaUrl} className="w-full h-full" controls />
          </>
        ) : (
          // <div className="relative w-full aspect-9/16 overflow-hidden rounded-lg">
          //   <Image
          //     src={currentMediaUrl}
          //     alt={blog.blogName}
          //     className="object-cover"
          //     fill
          //     unoptimized
          //   />
          // </div>

          <div className="w-full h-72 flex items-center justify-center overflow-hidden">
            <Image
              src={currentMediaUrl}
              alt={blog.blogName}
              width={500}
              height={500}
              className="w-full h-full object-contain"
            />
          </div>
        )}

        {/* Previous Button */}
        {mediaUrls.length > 1 && (
          <button
            onClick={handlePrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-sm hover:bg-white text-green-500 p-2 rounded-full shadow-lg transition-all active:scale-95 z-10"
            aria-label="Previous media"
          >
            <FaChevronLeft className="text-sm" />
          </button>
        )}

        {/* Next Button */}
        {mediaUrls.length > 1 && (
          <button
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-sm hover:bg-white text-green-500 p-2 rounded-full shadow-lg transition-all active:scale-95 z-10"
            aria-label="Next media"
          >
            <FaChevronRight className="text-sm" />
          </button>
        )}

        {/* Media Counter */}
        {mediaUrls.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-semibold">
            {currentIndex + 1}/{mediaUrls.length}
          </div>
        )}

        {/* Media Type Badge */}
        {currentMediaType === "video" && (
          <div className="absolute top-2 left-2  bg-black/20 text-white px-2 rounded text-xs font-semibold">
            Video
          </div>
        )}
      </div>
      {/* details */}
      <div className="flex flex-col md:py-4 px-1 pb-1 md:pr-4 flex-1">
        <h3 className="text-green-600 py-1 font-semibold text-xs uppercase">
          {blog.category}
        </h3>
        {/* title */}
        <b className="font-bold text-sm md:text-sm lg:text-xl mb-2 line-clamp-2">
          {blog.blogName}
        </b>
        <p className="text-[#656565] text-xs sm:text-sm line-clamp-2 mb-3">
          {blog.description}
        </p>
        <p className="text-xs  flex items-center flex-wrap gap-2 py-1 ">
          <span className="flex items-center gap-1">
            <FaRegCalendarAlt />{" "}
            {new Date(blog.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
          {mediaUrls.length > 0 && (
            <span className="flex items-center gap-1">
              <CiClock2 />
              {mediaUrls.length} media item
              {mediaUrls.length !== 1 ? "s" : ""}
            </span>
          )}
        </p>
        <Link
          href={`/blog/${blog._id}`}
          className="self-end flex gap-2 items-center text-green-600 font-medium cursor-pointer hover:shadow-2xl hover:shadow-black px-2.5 py-1 rounded transition-all duration-300 active:scale-95 border border-[#9b9a9a47] w-fit mt-2 text-xs md:text-sm"
        >
          Read More{" "}
          <FaArrowRight className="transform transition-transform duration-300 group-hover:translate-x-2" />
        </Link>
      </div>
    </section>
  );
};

export default BlogPageCard;
