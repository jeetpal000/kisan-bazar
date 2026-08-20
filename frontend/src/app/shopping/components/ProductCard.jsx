import Image from "next/image";
import {
  FaChevronLeft,
  FaChevronRight,
  FaHeart,
  FaLeaf,
  FaStar,
} from "react-icons/fa";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CiHeart } from "react-icons/ci";
import { GiShoppingCart } from "react-icons/gi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useWishlistStore } from "@/lib/wishlistStore";

const ProductCard = ({ product }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [currentIndex, setCurrentIndex] = useState(0);
  const { wishlist, setWishlist, clearWishlist } = useWishlistStore();

  console.log(wishlist);
  console.log(product);

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

  const { mutate: addToCart, isPending: cartIsPending } = useMutation({
    mutationFn: async (productId) => {
      const res = await fetch("/api/products/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          quantity: 1,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const error = new Error(data.message || "Failed");
        error.status = res.status;
        throw error;
      }

      return data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["cart"],
      });
    },
    onError: (error) => {
      if (error.status === 401) router.push("/login");
    },
  });

  const { mutate: AddToWishlist, isPending: wishlistIsPending } = useMutation({
    mutationFn: async (productId) => {
      const res = await fetch("/api/products/favorite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const error = new Error(data.message || "Failed");
        error.status = res.status;
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["wishlist"],
      });
    },
    onError: (error) => {
      if (error.status === 401) router.push("/login");
    },
  });

  const isWishlisted = wishlist.some(
    (item) => item.productId._id === product._id,
  );

  return (
    <section className="my-5 mx-auto lg:px-4 px-0">
      {/* Product Card Grid */}

      <div
        onClick={(e) => router.push(`/shopping/${product._id}`)}
        className="group overflow-hidden rounded-sm bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl relative"
      >
        {/* Image */}
        <div className="relative">
          <Image
            src={product.imageUrls[currentIndex]}
            alt={product.imageUrls[currentIndex]}
            width={500}
            height={500}
            className="h-72 w-full object-cover"
          />

          {product.imageUrls.length > 1 && (
            <button
              onClick={handlePrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-sm hover:bg-white text-green-500 p-2 rounded-full shadow-lg transition-all active:scale-95 z-10"
              aria-label="Previous media"
            >
              <FaChevronLeft className="text-sm" />
            </button>
          )}

          {product.imageUrls.length > 1 && (
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-sm hover:bg-white text-green-500 p-2 rounded-full shadow-lg transition-all active:scale-95 z-10"
              aria-label="Next media"
            >
              <FaChevronRight className="text-sm" />
            </button>
          )}

          {/* Badge */}
          <div className="absolute md:left-4 left-1 md:top-4 md:bottom-auto bottom-4 flex items-center gap-2 rounded-full bg-green-600 md:px-4 px-2 md:py-2 py-1 text-xs md:text-sm font-semibold text-white">
            <FaLeaf size={16} />
            Fresh & Local
          </div>

          {/* Icons */}
          <div className="absolute right-4 top-4 flex gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                AddToWishlist(product._id);
              }}
              className="rounded-full bg-white p-3 shadow-lg hover:bg-green-50 active:scale-95"
            >
              {isWishlisted ? (
                <FaHeart className="text-pink-500" size={22} />
              ) : (
                <CiHeart size={22} />
              )}
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                addToCart(product._id);
              }}
              className="rounded-full bg-white p-3 shadow-lg hover:bg-green-50"
            >
              <GiShoppingCart size={22} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="md:p-2 p-1">
          <div>
            <h2 className="text-xl md:text-2xl font-bold">
              {product?.productName}
            </h2>

            <p className="mt-1 text-gray-500 text-nowrap">
              {product?.description}
            </p>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <FaStar className="fill-yellow-400 text-yellow-400" size={18} />
            <span className="font-semibold">4.7</span>
            <span className="text-gray-500 text-xs">(128)</span>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xl md:text-2xl font-bold text-green-600">
                ₹{product?.sellPrice}
              </span>
              <span className="md:text-xl text-gray-500">
                {" "}
                /{product?.unit}
              </span>
            </div>

            <div className="space-y-1 text-right pb-2">
              <p className="text-gray-400 line-through">
                ₹{product?.actualPrice}
              </p>

              <span className="rounded-full bg-green-100 md:px-3 px-1 py-1 text-xs font-semibold text-green-700">
                29% OFF
              </span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                addToCart(product._id);
              }}
              className="flex-1 rounded-xl bg-green-600 py-2 font-semibold text-white transition hover:bg-green-700"
            >
              {cartIsPending ? "Adding..." : "Add To Cart"}
            </button>

            <button className="rounded-xl border border-green-200 bg-green-50 p-2 text-green-600 hover:bg-green-100">
              <FaLeaf size={22} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductCard;
