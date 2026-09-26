"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import ProductCard from "@/app/shopping/components/ProductCard";
import ProfileProductCard from "@/app/profile/components/ProfileProductCard";
import ProductCardSkeleton from "@/app/shopping/components/ProductCardSkelton";

const FeaturedProduct = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  console.log(products);

  useEffect(() => {
    try {
      fetch("/api/products?limit=4&sort=latest")
        .then((response) => response.json())
        .then((data) => setProducts(data.success ? data.products : []))
        .catch(() => setProducts([]));
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <section className="my-10 mx-auto px-0 lg:px-2">
      <div className="relative mb-10">
        <div className="w-1/3 h-px absolute bg-[#79b061ab] top-1/2 -translate-y-1/2 rounded-md right-3 md:left-0" />
        <h1 className="md:text-center font-bold text-sm  sm:text-xl md:text-2xl lg:text-3xl">
          Featured Product
        </h1>
        <div className="w-1/5 sm:w-1/3 md:w-1/3 h-px absolute bg-[#79b061ab] top-1/2 -translate-y-1/2 right-0 rounded-md" />
        <Link
          href="/shopping"
          className="absolute top-1/2 -translate-y-1/2 -right-2 rounded-none rounded-tr-full rounded-bl-full px-4 text-[#3eba0a] bg-[#dae1d0] backdrop-blur-2xl hover:bg-[#c8d1bc] text-sm md:text-xl"
        >
          View All
        </Link>
      </div>

      {loading ? (
        <ProductCardSkeleton />
      ) : (
        <div className="space-y-4 grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {products.map((product) => (
            <div key={product._id}>
              <ProductCard key={product._id} product={product} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default FeaturedProduct;
