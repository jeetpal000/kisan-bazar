"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, ShoppingCart, Eye } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const WishlistItem = ({ item }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const product = item.productId;

  const image = product?.imageUrls?.[0] || "/placeholder.png";

  const { mutate: removeFromWishlist, isPending: isRemoving } = useMutation({
    mutationFn: async (productId) => {
      const res = await fetch(`/api/products/favorite?productId=${productId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update wishlist");
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      toast.success("Removed from wishlist");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { mutate: addToCart, isPending: isAdding } = useMutation({
    mutationFn: async (productId) => {
      const res = await fetch("/api/products/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId, quantity: 1 }),
      });

      const data = await res.json();

      if (!res.ok) {
        const error = new Error(
          data.message || "Failed to add product to cart",
        );
        error.status = res.status;
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Added to cart");
    },
    onError: (error) => {
      if (error.status === 401) {
        router.push("/login");
        return;
      }
      toast.error(error.message);
    },
  });

  const handleRemove = () => {
    removeFromWishlist(product._id);
  };

  const handleAddToCart = () => {
    addToCart(product._id);
  };

  const isBusy = isRemoving || isAdding;

  return (
    <Card className="group overflow-hidden rounded-xl transition-all duration-300 hover:shadow-lg">
      {/* Product Image */}
      <div className="relative -mt-4 overflow-hidden">
        <Image
          src={image}
          alt={product?.productName || "Product"}
          width={500}
          height={500}
          className="h-72 w-full object-cover transition-transform duration-300 group-hover:scale-110"
        />

        {/* Remove Wishlist */}
        <Button
          size="icon"
          variant="secondary"
          onClick={handleRemove}
          disabled={isBusy}
          aria-label="Remove from wishlist"
          className="absolute right-3 top-3 rounded-full"
        >
          <Heart className="h-8 w-8 fill-red-500 text-red-500" />
        </Button>
      </div>

      <CardContent className="p-2">
        {/* Product Name */}
        <div>
          <Link href={`/shopping/${product?._id}`}>
            <h2 className="line-clamp-2 text-lg font-semibold hover:text-primary">
              {product?.productName}
            </h2>
          </Link>

          <p className="mt-1 text-sm text-muted-foreground">
            {product?.category}
          </p>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-green-700">
            ₹{product?.sellPrice}
          </span>

          {product?.actualPrice > product?.sellPrice && (
            <span className="text-sm text-muted-foreground line-through">
              ₹{product.actualPrice}
            </span>
          )}
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={handleAddToCart}
            disabled={isBusy || !product?._id}
            className="bg-green-500 text-white"
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Add to Cart
          </Button>

          <Link href={`/shopping/${product?._id}`}>
            <Button variant="outline" className="w-full">
              <Eye className="mr-2 h-4 w-4" />
              View
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default WishlistItem;
