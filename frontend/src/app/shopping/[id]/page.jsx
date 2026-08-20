"use client";

import ProductDetailsPage from "@/app/shopping/[id]/components/ProductDetailsDisplay";
import { useRouter, useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { FaArrowLeftLong } from "react-icons/fa6";

const Page = () => {
  const router = useRouter();
  const params = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  console.log(product);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        if (!params?.id) return;

        const response = await fetch(`/api/products/${params.id}`);
        const data = await response.json();

        if (!response.ok || !data.success) {
          setError(data.message || "Failed to fetch product");
          return;
        }

        setProduct(data.product);
      } catch (err) {
        setError(err.message || "An error occurred");
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params?.id]);

  return (
    <section className="max-w-360 mx-auto px-2 md:px-5 lg:px-10 mt-18">
      <button
        className="flex items-center gap-1 border border-green-200 rounded active:scale-95 px-2 py-1 text-green-600 font-bold"
        onClick={() => router.back()}
      >
        <FaArrowLeftLong /> Back
      </button>

      {loading ? (
        <div className="text-center py-20">
          <p className="text-gray-600">Loading product...</p>
        </div>
      ) : error ? (
        <div className="text-center py-20">
          <p className="text-red-600">{error}</p>
        </div>
      ) : product ? (
        <ProductDetailsPage product={product} />
      ) : (
        <div className="text-center py-20">
          <p className="text-gray-600">Product not found</p>
        </div>
      )}
    </section>
  );
};

export default Page;
