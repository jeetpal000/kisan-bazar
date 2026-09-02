"use client";
import Footer from "@/components/Footer";
import React, { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { blogCategory } from "@/lib/constantData";
import { Input } from "@/components/ui/input";
import BlogPageCard from "./components/BlogPageCard";

const Page = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All Blogs");
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [pagination, setPagination] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sort, setSort] = useState("latest");

  const loadBlogs = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      params.append("page", page);
      params.append("limit", limit);

      if (searchTerm.trim()) {
        params.append("search", searchTerm);
      }

      if (selectedCategory && selectedCategory !== "All Blogs") {
        params.append("category", selectedCategory);
      }

      if (sort) {
        params.append("sort", sort);
      }

      const res = await fetch(`/api/blog?${params.toString()}`);

      const data = await res.json();

      if (data.success) {
        setBlogs(data.blogs);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  function useDebounce(value, delay) {
    const [debounceValue, setDebounceValue] = useState(value);

    useEffect(() => {
      const handler = setTimeout(() => {
        setDebounceValue(value);
      }, delay);

      return () => {
        clearTimeout(handler);
      };
    }, [value, delay]);

    return debounceValue;
  }
  const debounceSearchTerm = useDebounce(searchTerm, 700);

  useEffect(() => {
    loadBlogs();
  }, [page, selectedCategory, debounceSearchTerm, sort]);

  return (
    <main className="">
      {/* Blog main template */}
      <div className="bg-[url('/assets/blog-template.jpg')] bg-no-repeat bg-cover bg-center w-full h-120">
        <div className="inset-0 bg-black/10 w-full h-full" />
        <div className="absolute top-30 left-10 max-w-360 mx-auto">
          <h1 className="font-bold text-4xl text-white">Our Blog</h1>
          <p className="text-xl text-white pt-5">
            Expert farming tips. agricultural insights and the latest <br />{" "}
            updates for progressive farmers.
          </p>
        </div>
      </div>
      <section className="max-w-360 mx-auto px-4 lg:px-10 mt-18">
        {/* Filter Button and Search bar */}
        <div className="flex mb-4">
          <span className="text-sm">
            Sowing {blogs.length > 0 ? (page - 1) * limit + 1 : 0}-
            {Math.min(page * limit, pagination?.total || 0)} of{" "}
            {pagination?.total || 0}
            Blogs
          </span>
        </div>
        <div className="flex justify-between w-full items-center py-5 flex-wrap gap-4">
          <div className="w-full lg:w-[75%] p-1 flex items-center gap-3 overflow-x-auto whitespace-nowrap scrollbar-hide shadow-inner rounded-full">
            <button
              onClick={() => {
                setSelectedCategory("All Blogs");
              }}
              className={`px-3 py-1 rounded cursor-pointer active:scale-95 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 ${selectedCategory === "All Blogs" ? "bg-green-600 text-white border-green-600" : "border border-[#80808063] text-gray-700"}`}
            >
              All
            </button>
            {blogCategory.map((category) => (
              <button
                key={category}
                onClick={() => {
                  setSelectedCategory(category);
                  setPage(1);
                }}
                className={`px-3 py-1 rounded cursor-pointer active:scale-95 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 ${
                  selectedCategory === category
                    ? "bg-green-600 text-white border-green-600"
                    : "border border-[#80808063] text-gray-700"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          <div className="relative flex items-center rounded overflow-hidden">
            <Input
              type="text"
              className=""
              placeholder="Search blog posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="absolute right-0 text-green-500 bg-[#71ff713d] w-8 h-8 px-2 cursor-pointer" />
          </div>
        </div>

        {/* Blog cards */}
        {loading ? (
          <div className="text-center py-20 flex items-center justify-center flex-col gap-2">
            <p className="text-gray-600">Loading blogs...</p>
            <div className="h-8 w-8 rounded-full border-t-transparent border-3 border-green-500 animate-spin" />
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-600">No blogs found...</p>
          </div>
        ) : (
          <div className="space-y-4 grid grid-cols-1 lg:grid-cols-2 gap-2">
            {blogs.map((blog) => {
              return (
                <div key={blog._id}>
                  {/* Media */}
                  <BlogPageCard blog={blog} />
                </div>
              );
            })}
          </div>
        )}

        {pagination && pagination.pages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-green-500 text-green-600 rounded hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Previous
            </button>
            <div className="flex gap-1">
              {[...Array(pagination.pages)].map((_, idx) => {
                const pageNum = idx + 1;

                if (
                  pageNum === 1 ||
                  pageNum === pagination.pages ||
                  (pageNum >= page - 1 && pageNum <= page + 1)
                ) {
                  return (
                    <button
                      key={pageNum}
                      className={`px-3 py-2 rounded transition${page === pageNum ? "bg-green-500 text-white font-bold" : "border border-green-500 text-green-600 hover:bg-green-50"}`}
                    >
                      {pageNum}
                    </button>
                  );
                } else if (pageNum === 2 || pageNum === pagination.pages - 1) {
                  return (
                    <span key={pageNum} className="px-2 py-2">
                      ...
                    </span>
                  );
                }
                return null;
              })}
            </div>
            <button
              onClick={() => setPage(Math.min(pagination.pages, page + 1))}
              disabled={page === pagination.pages}
              className="px-4 py-2 border-green-500 text-green-600 rounded hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Next
            </button>
          </div>
        )}
      </section>
      <Footer />
    </main>
  );
};

export default Page;
