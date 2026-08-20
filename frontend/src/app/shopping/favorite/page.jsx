"use client";

import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { useWishlistStore } from "@/lib/wishlistStore";

import WishlistItem from "./components/WishlistItem";
import EmptyWishlist from "./components/EmptyWishlist";
import WishlistSkeleton from "./components/WishlistSkeleton";

const Page = () => {
  const { wishlist, setWishlist, clearWishlist } = useWishlistStore();

  const {
    data: wishlistData,
    isPending,
    isFetched,
    isError,
  } = useQuery({
    queryKey: ["wishlist"],
    queryFn: async () => {
      const res = await fetch("/api/products/favorite");

      if (!res.ok) {
        throw new Error("Failed to fetch wishlist");
      }

      return await res.json();
    },

    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: false,
  });

  useEffect(() => {
    if (!isFetched) return;

    if (wishlistData?.wishlist) {
      setWishlist(wishlistData.wishlist);
    } else {
      clearWishlist();
    }
  }, [wishlistData, isFetched, setWishlist, clearWishlist]);

  if (isPending) {
    return (
      <main className="max-w-7xl mx-auto px-5 py-10 mt-20">
        <WishlistSkeleton />
      </main>
    );
  }

  if (isError) {
    return (
      <main className="max-w-7xl mx-auto px-5 py-10 mt-20">
        <h2 className="text-center text-red-500 text-xl">
          Failed to load wishlist.
        </h2>
      </main>
    );
  }

  if (wishlist.length === 0) {
    return <EmptyWishlist />;
  }

  return (
    <main className="max-w-7xl mx-auto px-5 py-10 mt-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Wishlist</h1>

        <p className="text-muted-foreground mt-1">
          {wishlist.length} {wishlist.length === 1 ? "Item" : "Items"}
        </p>
      </div>

      <div className="grid gap-6 place-items-center sm:grid-cols-3 xl:grid-cols-4">
        {wishlist.map((item) => (
          <WishlistItem key={item._id} item={item} />
        ))}
      </div>
    </main>
  );
};

export default Page;
