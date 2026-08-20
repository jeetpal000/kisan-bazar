"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

const EmptyWishlist = () => {
  return (
    <section className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        {/* Icon */}
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-muted">
          <Heart className="h-12 w-12 fill-red-500 text-red-500" />
        </div>

        {/* Heading */}
        <h1 className="mt-6 text-3xl font-bold">Your Wishlist is Empty</h1>

        {/* Description */}
        <p className="mt-3 text-muted-foreground">
          Save your favorite products here so you can easily find and purchase
          them later.
        </p>

        {/* Buttons */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/shopping">
            <Button className="w-full sm:w-auto">Explore Products</Button>
          </Link>

          <Link href="/">
            <Button variant="outline" className="w-full sm:w-auto">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default EmptyWishlist;
