"use client";
import BlogDetailDisplay from "@/app/blog/components/BlogDetailDisplay";
import { useRouter, useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { FaArrowLeftLong } from "react-icons/fa6";

const Page = () => {
  const router = useRouter();
  const params = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        if (!params?.id) return;

        const response = await fetch(`/api/blog/${params.id}`);
        const data = await response.json();

        if (!response.ok || !data.success) {
          setError(data.message || "Failed to fetch blog");
          return;
        }

        setBlog(data.blog);
      } catch (err) {
        setError(err.message || "An error occurred");
        console.error("Error fetching blog:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [params?.id]);

  return (
    <section className="max-w-360 mx-auto px-10 mt-2">
      <button
        className="flex items-center gap-1 border border-green-200 rounded active:scale-95 px-2 py-1 text-green-600 font-bold"
        onClick={() => router.back()}
      >
        <FaArrowLeftLong /> Back
      </button>

      {loading ? (
        <div className="text-center py-20">
          <p className="text-gray-600">Loading blog...</p>
        </div>
      ) : error ? (
        <div className="text-center py-20">
          <p className="text-red-600">{error}</p>
        </div>
      ) : blog ? (
        <BlogDetailDisplay blog={blog} />
      ) : (
        <div className="text-center py-20">
          <p className="text-gray-600">Blog not found</p>
        </div>
      )}
    </section>
  );
};

export default Page;
