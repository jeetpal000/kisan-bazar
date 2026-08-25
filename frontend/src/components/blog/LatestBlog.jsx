"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import BlogPageCard from "@/app/blog/components/BlogPageCard";
import ProductCardSkeleton from "@/app/shopping/components/ProductCardSkelton";

const LatestBlog = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      fetch("/api/blog?limit=4&sort=latest")
        .then((response) => response.json())
        .then((data) => setBlogs(data.success ? data.blogs : []))
        .catch(() => setBlogs([]));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <section className="my-10 mx-auto">
      <div className="relative mb-5">
        <div className="w-1/3 h-1 absolute bg-[#79b061ab] top-1/2 -translate-y-1/2 rounded-md right-10 md:left-0" />
        <h1 className="md:text-center font-bold text-xl md:text-2xl lg:text-3xl">
          Latest Blog
        </h1>
        <div className="w-1/5 sm:w-1/4 md:w-1/3 h-1 absolute bg-[#79b061ab] top-1/2 -translate-y-1/2 right-0 rounded-md" />
        <Link
          href="/blog"
          className="absolute top-1/2 -translate-y-1/2 -right-2 rounded-none rounded-tr-full rounded-bl-full px-4 text-[#3eba0a] bg-[#dae1d0] backdrop-blur-2xl active:translate-y-0.5 py-1 text-sm md:text-xl"
        >
          View All
        </Link>
      </div>

      {blogs.length === 0 && (
        <p>No blogs available🫠 {"/n"} Please upload blogs😍...</p>
      )}

      {loading ? (
        <ProductCardSkeleton />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:grid-cols-3">
          {blogs.map((blog) => (
            <BlogPageCard key={blog._id} blog={blog} />
          ))}
        </div>
      )}
    </section>
  );
};

export default LatestBlog;
