"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { BadgePercent, Truck, ShieldCheck } from "lucide-react";

const CartSummary = ({ subtotal, delivery, discount, total }) => {
  return (
    <div className="sticky top-24 rounded-xl border bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold">Order Summary</h2>

      <Separator className="my-5" />

      {/* Coupon */}

      <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
        <div className="flex items-center gap-2">
          <BadgePercent className="h-5 w-5 text-green-600" />
          <span className="text-sm font-medium">Apply Coupon</span>
        </div>

        <Button variant="outline" size="sm">
          Apply
        </Button>
      </div>

      <div className="mt-6 space-y-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>

          <span className="font-medium">₹{subtotal.toLocaleString()}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Delivery</span>

          <span className="font-medium">
            {delivery === 0 ? (
              <span className="text-green-600">FREE</span>
            ) : (
              `₹${delivery}`
            )}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Discount</span>

          <span className="font-medium text-green-600">- ₹{discount}</span>
        </div>
      </div>

      <Separator className="my-5" />

      <div className="flex justify-between text-lg font-bold">
        <span>Total</span>

        <span>₹{total.toLocaleString()}</span>
      </div>

      <Button className="mt-6 h-11 w-full" size="lg">
        Proceed to Checkout
      </Button>

      <div className="mt-6 space-y-3 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Truck className="h-4 w-4" />
          Free delivery above ₹1000
        </div>

        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4" />
          Secure payment
        </div>
      </div>
    </div>
  );
};

export default CartSummary;
