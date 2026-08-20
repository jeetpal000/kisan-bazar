"use client";

import { useCartStore } from "@/lib/cartStore";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect } from "react";
import CartItem from "./components/CartItem";
import CartSummary from "./components/CartSummary";
import EmptyCart from "./components/EmptyCart";
import CartSkeleton from "./components/CartSkeleton";

const Page = () => {
  const { cart, setCart, clearCart } = useCartStore();

  const {
    data: cartData,
    isPending,
    isFetched,
  } = useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const res = await fetch("/api/products/cart");

      if (!res.ok) {
        throw new Error("Failed to fetch cart");
      }

      return await res.json();
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: false,
  });

  useEffect(() => {
    if (!isFetched) return;

    if (cartData?.cart) {
      setCart(cartData.cart);
    } else {
      clearCart();
    }
  }, [cartData, isFetched, setCart, clearCart]);

  if (isPending) {
    return (
      <main className="max-w-7xl mx-auto px-5 py-10 mt-18">
        <CartSkeleton />
      </main>
    );
  }

  if (cart.length === 0) {
    return <EmptyCart />;
  }

  const subtotal = cart.reduce(
    (sum, item) => sum + item.productId.sellPrice * item.quantity,
    0,
  );

  const delivery = subtotal >= 1000 ? 0 : 40;
  const discount = 0;
  const total = subtotal + delivery - discount;

  return (
    <main className="max-w-7xl mx-auto px-5 py-10 mt-20">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart ({cart.length})</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left */}
        <div className="lg:col-span-2 space-y-5">
          {cart.map((item) => (
            <CartItem key={item._id} item={item} />
          ))}
        </div>

        {/* Right */}
        <div>
          <CartSummary
            subtotal={subtotal}
            delivery={delivery}
            discount={discount}
            total={total}
          />
        </div>
      </div>
    </main>
  );
};

export default Page;
