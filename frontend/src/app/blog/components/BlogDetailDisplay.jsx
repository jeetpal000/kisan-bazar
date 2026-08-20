"use client";
import Image from "next/image";
import React, { useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const BlogDetailDisplay = ({ blog }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!blog) {
    return <div className="text-center py-10">Loading...</div>;
  }

  const mediaUrls = Array.isArray(blog.mediaUrls) ? blog.mediaUrls : [];

  if (!mediaUrls.length) {
    return <div className="text-center py-10">No media available</div>;
  }

  const currentMedia = mediaUrls[currentIndex];
  const currentMediaUrl = currentMedia.url;
  const currentMediaType = currentMedia.type;

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? mediaUrls.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === mediaUrls.length - 1 ? 0 : prev + 1));
  };

  return (
    <section className="max-w-360 mx-auto px-10 mt-8">
      {/* Blog Title and Metadata */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{blog.blogName}</h1>
        <div className="flex gap-4 text-sm text-gray-600 mb-6">
          <span className="bg-green-100 text-green-700 px-3 py-1 rounded">
            {blog.category}
          </span>
          <span>
            {new Date(blog.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* Media Carousel */}
      <div className="relative bg-gray-900 rounded-lg overflow-hidden mb-8">
        <div className="relative h-96 sm:h-125 md:h-150 w-full bg-black flex items-center justify-center">
          {currentMediaType === "video" ? (
            <video
              src={currentMediaUrl}
              controls
              className="h-full w-full object-contain"
            />
          ) : (
            <Image
              src={currentMediaUrl}
              alt={`Blog media ${currentIndex + 1}`}
              fill
              className="object-contain"
              priority
              unoptimized
            />
          )}

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
            {mediaUrls.map((media, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`shrink-0 relative h-16 w-16 rounded overflow-hidden border-2 transition-all ${
                  currentIndex === index
                    ? "border-green-600"
                    : "border-gray-300 opacity-70 hover:opacity-100"
                }`}
              >
                {media.type === "image" ? (
                  <Image
                    src={media.url}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="h-full w-full bg-gray-700 flex items-center justify-center">
                    <span className="text-white text-xs">
                      Video {index + 1}
                    </span>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Blog Description */}
      <div className="bg-gray-50 p-6 rounded-lg mb-8">
        <h2 className="text-2xl font-bold mb-4">Description</h2>
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
          {blog.description}
        </p>
      </div>

      {/* Blog Info Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <p className="text-sm text-gray-600">Category</p>
          <p className="text-lg font-bold text-green-700">{blog.category}</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-sm text-gray-600">Published</p>
          <p className="text-lg font-bold text-blue-700">
            {new Date(blog.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>
      </div>
    </section>
  );
};

export default BlogDetailDisplay;
