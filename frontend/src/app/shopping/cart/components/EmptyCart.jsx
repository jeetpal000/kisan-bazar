"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";

const EmptyCart = () => {
  return (
    <section className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        {/* Icon */}
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-muted">
          <ShoppingCart className="h-12 w-12 text-muted-foreground" />
        </div>

        {/* Heading */}
        <h2 className="mt-6 text-3xl font-bold">Your Cart is Empty</h2>

        {/* Description */}
        <p className="mt-3 text-muted-foreground">
          Looks like you haven{"'"}t added any products yet. Explore our
          marketplace and find fresh products directly from farmers.
        </p>

        {/* Button */}
        <Link href="/shopping">
          <Button className="mt-8 w-full sm:w-auto">Continue Shopping</Button>
        </Link>
      </div>
    </section>
  );
};

export default EmptyCart;
