"use client";
import Footer from "@/components/Footer";
import ProductCard from "@/app/shopping/components/ProductCard";

import React, { useEffect, useState } from "react";
import { FaHandHoldingWater } from "react-icons/fa";
import {
  GiFertilizerBag,
  GiPlantSeed,
  GiPlantWatering,
  GiSpade,
} from "react-icons/gi";
import { MdOutlineCompost } from "react-icons/md";
import { RiPlantFill } from "react-icons/ri";

const categoryName = [
  { name: "All Product" },
  { name: "Seeds", icon: GiPlantSeed },
  { name: "Fertiliser", icon: GiFertilizerBag },
  { name: "Plant Care", icon: RiPlantFill },
  { name: "Organic Products", icon: MdOutlineCompost },
  { name: "Irrigation", icon: FaHandHoldingWater },
  { name: "Farming Tool", icon: GiSpade },
  { name: "Pesticides", icon: GiPlantWatering },
];

const Page = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [limit] = useState(12);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Product");
  const [maxPrice, setMaxPrice] = useState(1000000);
  const [sort, setSort] = useState("latest");

  const [pagination, setPagination] = useState(null);
  const loadProducts = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      params.append("page", page);
      params.append("limit", limit);

      if (searchTerm.trim()) {
        params.append("search", searchTerm);
      }

      if (selectedCategory && selectedCategory !== "All Product") {
        params.append("category", selectedCategory);
      }

      params.append("max", maxPrice);

      if (sort) {
        params.append("sort", sort);
      }

      const res = await fetch(`/api/products?${params.toString()}`);

      const data = await res.json();

      if (data.success) {
        setProducts(data.products);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [page, selectedCategory, searchTerm, maxPrice, sort]);

  return (
    <main className="">
      <section className="max-w-360 mx-auto px-2 md:px-5 lg:px-10 mt-15 md:mt-20 lg:mt-25">
        <h1 className="text-xl md:text-2xl font-bold ">All Product</h1>
        <div className="grid sm:grid-cols-[1fr_4fr] gap-2">
          <aside className=" shadow-md rounded border border-[#8080802b] py-5 px-2 hidden sm:block">
            {/* Search Input */}
            <div className="mb-5">
              <label className="text-sm font-semibold block mb-2">Search</label>
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
              />
            </div>

            <h2 className="text-[18px] font-bold mb-3">Category</h2>
            <ul className="flex justify-center flex-col items-start ">
              {categoryName.map((item, idx) => (
                <li
                  key={idx}
                  onClick={() => {
                    setSelectedCategory(item.name);
                    setPage(1);
                  }}
                  className={`w-full p-2 rounded cursor-pointer flex gap-1 items-center transition-all ${
                    selectedCategory === item.name
                      ? "bg-green-500 text-white font-semibold"
                      : "hover:bg-[#00800023] hover:text-green-700 hover:font-semibold"
                  }`}
                >
                  {item.icon && <item.icon />}
                  {item.name}
                </li>
              ))}
            </ul>
            <div className="">
              <input
                type="range"
                name=""
                id=""
                max="10000"
                min="0"
                step="100"
                className="bg-[#59fe59b6] appearance-none w-full rounded-full"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
              />
              <h3 className="text-sm">₹0 - ₹{maxPrice}</h3>
            </div>
          </aside>
          <aside className="">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm">
                Showing {products.length > 0 ? (page - 1) * limit + 1 : 0}-
                {Math.min(page * limit, pagination?.total || 0)} of{" "}
                {pagination?.total || 0} products
              </span>
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setPage(1);
                }}
                className="border border-[#8080802d] rounded px-2 py-1 hover:bg-[#00800023] hover:text-green-700"
              >
                <option value="latest">Latest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>

            {loading ? (
              <div className="text-ceter py-20 flex items-center justify-center flex-col gap-2">
                <p className="text-gray-600">Loading products...</p>
                <div className="h-8 w-8 rounded-full border-t-transparent border-3 border-green-500 animate-spin" />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-600">
                  <span className="font-bold">{selectedCategory}</span> products
                  not found...
                </p>
              </div>
            ) : (
              <div className="space-y-4 grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {products.map((product) => {
                  return (
                    <div key={product._id}>
                      <ProductCard product={product} />
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination Controls */}
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
                    // Show first page, last page, current page and neighbors
                    if (
                      pageNum === 1 ||
                      pageNum === pagination.pages ||
                      (pageNum >= page - 1 && pageNum <= page + 1)
                    ) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`px-3 py-2 rounded transition ${
                            page === pageNum
                              ? "bg-green-500 text-white font-bold"
                              : "border border-green-500 text-green-600 hover:bg-green-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    } else if (
                      pageNum === 2 ||
                      pageNum === pagination.pages - 1
                    ) {
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
                  className="px-4 py-2 border border-green-500 text-green-600 rounded hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Next
                </button>
              </div>
            )}
          </aside>
        </div>
      </section>
      <Footer />
    </main>
  );
};

export default Page;
