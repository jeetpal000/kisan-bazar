"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const CartItem = ({ item }) => {
  const queryClient = useQueryClient();
  const product = item.productId;

  const image = product?.imageUrls?.[0] || "/placeholder.png";

  const quantity = item.quantity;

  const price = product?.sellPrice ?? 0;

  const total = quantity * price;
  console.log(item);

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
        throw new Error(data.message || "Failed");
      }

      return data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["cart"],
      });
    },
  });
  const { mutate: subToCart, isPending: subCartIsPending } = useMutation({
    mutationFn: async (productId) => {
      const res = await fetch("/api/products/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          quantity: -1,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed");
      }

      return data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["cart"],
      });
    },
  });
  const { mutate: removeToCart, isPending: removeCartIsPending } = useMutation({
    mutationFn: async (productId) => {
      const res = await fetch(`/api/products/cart?productId=${productId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed");
      }

      return data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["cart"],
      });
    },
  });

  return (
    <Card className="p-4 shadow-sm">
      <div className="flex flex-col gap-5 sm:flex-row">
        {/* Product Image */}
        <div className="relative h-32 w-full overflow-hidden rounded-lg sm:h-32 sm:w-32">
          <Image
            src={image}
            alt={product?.productName}
            fill
            className="object-cover"
          />
        </div>

        {/* Product Info */}
        <div className="flex flex-1 flex-col justify-between">
          <div>
            <h2 className="text-lg font-semibold">{product?.productName}</h2>

            <p className="mt-1 text-sm text-muted-foreground">
              {product?.category}
            </p>

            <p className="mt-2 text-lg font-bold text-green-700">
              ₹{price}
              <span className="ml-1 text-sm font-normal text-gray-500">
                / {product?.unit}
              </span>
            </p>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            {/* Quantity */}
            <div className="flex items-center rounded-md border">
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  subToCart(item.productId._id);
                }}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>

              <span className="min-w-10 text-center font-medium">
                {quantity}
              </span>

              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  addToCart(item.productId._id);
                }}
                disabled={subCartIsPending}
                variant="ghost"
                size="icon"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Total */}
            <div className="text-right">
              <p className="text-lg font-bold">₹{total}</p>
            </div>

            {/* Remove */}
            <Button
              onClick={(e) => {
                e.stopPropagation();
                removeToCart(item.productId._id);
              }}
              variant="destructive"
              size="sm"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Remove
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CartItem;
