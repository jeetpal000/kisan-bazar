"use client";
import { useMutation } from "@tanstack/react-query";
import { BadgePercent, Minus, Plus, ShieldCheck, Truck, X } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

import MediaCarousel from "./MediaCarousel";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/lib/authStore";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addAddressSchema } from "@/validation/auth.validation";

const ProductDetailsPage = ({ product }) => {
  const router = useRouter();
  const [IsAddAddress, setIsAddAddress] = useState(false);
  const [addressloading, setaddressloading] = useState(false);
  const { user, setUser } = useAuthStore();
  console.log(user);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(addAddressSchema),
  });

  const onSubmit = async (data) => {
    try {
      setaddressloading(true);
      const res = await fetch("/api/userdata", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      console.log(result);
      if (!res.ok) {
        throw new Error(result.message || "Failed to update address");
      }
      setUser(result.updatedUser);
      setIsAddAddress(false);
      reset();
    } catch (error) {
      console.error(error);
    } finally {
      setaddressloading(false);
    }
  };

  const mediaUrls = product?.imageUrls || [];

  const [quantity, setQuantity] = useState(1);

  const { mutate: buyNow, isPending } = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product._id,
          quantity,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const error = new Error(data.message);
        error.status = res.status;
        throw error;
      }

      return data;
    },

    onSuccess: () => {
      router.push("/orders");
    },

    onError: (err) => {
      if (err.status === 401) {
        router.push("/login");
        return;
      }
      alert(err.message);
    },
  });

  const { mutate: addToCart, isPending: isAdding } = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/products/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product._id,
          quantity,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const error = new Error(data.message);
        error.status = res.status;
        throw error;
      }

      return data;
    },

    onSuccess: () => {
      alert("Product added to cart");
    },

    onError: (err) => {
      if (err.status === 401) {
        router.push("/login");
        return;
      }
      alert(err.message);
    },
  });

  const increaseQuantity = () => {
    setQuantity((prev) => prev + 1);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const subtotal = quantity * product.sellPrice;

  return (
    <section className="max-w-360 mx-auto mt-8 grid grid-cols-1 md:grid-cols-2 gap-2">
      {/* Blog Title and Metadata */}

      {/* Media Carousel */}
      <div className="">
        <MediaCarousel mediaUrls={mediaUrls} product={product} />

        <div className="mt-8 rounded-xl border bg-white p-6 shadow">
          <h1 className="text-3xl font-bold">{product.productName}</h1>

          <p className="mt-3 text-gray-600">{product.description}</p>

          <div className="mt-5 flex items-center gap-4">
            <span className="text-3xl font-bold text-green-700">
              ₹{product.sellPrice}
            </span>

            <span className="line-through text-gray-400">
              ₹{product.actualPrice}
            </span>
          </div>

          <div className="mt-5">
            <p>
              Available Stock :
              <span className="font-semibold text-green-700">
                {" "}
                {product.stock}
              </span>
            </p>

            <p>
              Unit :<span className="font-semibold"> {product.unit}</span>
            </p>
          </div>
        </div>
        <div className=" flex w-full mt-2">
          <button
            onClick={() => addToCart()}
            disabled={isAdding || product.stock < 1}
            className="flex-1 rounded-lg bg-green-700 py-3 text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {product.stock < 1
              ? "Out of Stock"
              : isAdding
                ? "Adding..."
                : "Add To Cart"}
          </button>
        </div>
      </div>

      <div className="">
        <div className="">
          <h1 className="font-semibold text-md md:text-xl flex justify-between items-center">
            Address{" "}
            <Button
              addressloading="disabled"
              onClick={() => {
                setValue("name", user?.addresses?.name);
                setValue("phone", user?.addresses?.phone);
                setValue("address", user?.addresses?.address);
                setValue("city", user?.addresses?.city);
                setValue("district", user?.addresses?.district);
                setValue("state", user?.addresses?.state);
                setValue("pincode", user?.addresses?.pincode);

                setIsAddAddress(!IsAddAddress);
              }}
              className="font-normal text-green-500 border px-2 py-1 rounded active:-transform-y-1 border-green-600 bg-transparent mr-5"
            >
              {user?.addresses?.address ? "Change address" : "Add address"}
            </Button>
          </h1>
        </div>

        {/* Address Drawer Overlay */}
        {IsAddAddress && (
          <div className="fixed inset-0 z-50">
            {/* Overlay */}
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
              onClick={() => setIsAddAddress(false)}
            />

            {/* Drawer */}
            <div
              className="
        absolute right-0 top-0 h-full w-full
        sm:max-w-md
        bg-white shadow-2xl
        flex flex-col amnimate-in slide-in-from-right duration-300
      "
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b px-5 py-4">
                <div>
                  <h2 className="text-xl font-semibold">
                    {user?.addresses?.address
                      ? "Change Address"
                      : "Add Address"}
                  </h2>

                  <p className="text-sm text-gray-500">
                    Enter your delivery address
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddAddress(false)}
                  className="rounded-full p-2 hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Form */}
              <div className="flex-1 overflow-auto scrollbar-hide px-5 py-5">
                <form onSubmit={handleSubmit(onSubmit)}>
                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="fieldgroup-name">Name</FieldLabel>

                      <Input
                        id="fieldgroup-name"
                        placeholder="Enter your name"
                        {...register("name")}
                      />

                      {errors.name && (
                        <p className="text-sm text-red-500">
                          {errors.name.message}
                        </p>
                      )}
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="phone">Phone</FieldLabel>

                      <Input
                        id="phone"
                        type="text"
                        placeholder="1234567890"
                        {...register("phone")}
                      />

                      {errors.phone && (
                        <p className="text-sm text-red-500">
                          {errors.phone.message}
                        </p>
                      )}
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="address">Address</FieldLabel>

                      <Input
                        id="address"
                        type="text"
                        placeholder="House no, street, village..."
                        {...register("address")}
                      />

                      {errors.address && (
                        <p className="text-sm text-red-500">
                          {errors.address.message}
                        </p>
                      )}
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="city">City</FieldLabel>

                      <Input
                        id="city"
                        placeholder="City name"
                        {...register("city")}
                      />

                      {errors.city && (
                        <p className="text-sm text-red-500">
                          {errors.city.message}
                        </p>
                      )}
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="district">District</FieldLabel>

                      <Input
                        id="district"
                        placeholder="District name"
                        {...register("district")}
                      />

                      {errors.district && (
                        <p className="text-sm text-red-500">
                          {errors.district.message}
                        </p>
                      )}
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="state">State</FieldLabel>

                      <Input
                        id="state"
                        placeholder="State name"
                        {...register("state")}
                      />

                      {errors.state && (
                        <p className="text-sm text-red-500">
                          {errors.state.message}
                        </p>
                      )}
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="pincode">Pincode</FieldLabel>

                      <Input
                        id="pincode"
                        type="text"
                        placeholder="221001"
                        {...register("pincode")}
                      />

                      {errors.pincode && (
                        <p className="text-sm text-red-500">
                          {errors.pincode.message}
                        </p>
                      )}
                    </Field>
                  </FieldGroup>

                  {/* Bottom Buttons */}
                  <div className="mt-6 flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        reset();
                        setIsAddAddress(false);
                      }}
                    >
                      Cancel
                    </Button>

                    <Button
                      type="submit"
                      disabled={addressloading}
                      className="flex-1 bg-green-700 hover:bg-green-800"
                    >
                      {addressloading ? "Saving..." : "Save Address"}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {user?.addresses && (
          <div className="">
            <p className="">{user?.addresses?.name}</p>
            <p className="">{user?.addresses?.phone}</p>
            <p className="">{user?.addresses?.address}</p>
            <p className="">{user?.addresses?.city}</p>
            <p className="">{user?.addresses?.district}</p>
            <p className="">{user?.addresses?.state}</p>
            <p className="">{user?.addresses?.pincode}</p>
          </div>
        )}

        <div className="mt-8 flex items-center gap-5">
          <button onClick={decreaseQuantity} className="rounded-lg border p-3">
            <Minus size={18} />
          </button>

          <span className="text-xl font-bold">{quantity}</span>

          <button onClick={increaseQuantity} className="rounded-lg border p-3">
            <Plus size={18} />
          </button>
        </div>

        <div className="mt-6">
          <h2 className="text-xl font-bold">
            Total : ₹{subtotal.toLocaleString()}
          </h2>
        </div>

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
                {/* {delivery === 0 ? (
                  <span className="text-green-600">FREE</span>
                ) : (
                  `₹${delivery}`
                )} */}
                FREE
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Discount</span>

              <span className="font-medium text-green-600">- ₹12</span>
            </div>
          </div>

          <Separator className="my-5" />

          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>

            <span>₹{subtotal.toLocaleString()}</span>
          </div>

          <Button
            className="mt-6 h-11 w-full"
            size="lg"
            onClick={() => buyNow()}
            disabled={isPending || !user?.addresses?.address}
          >
            {isPending ? "Placing order..." : "Shop Now (COD)"}
          </Button>

          {!user?.addresses?.address && (
            <p className="mt-2 text-sm text-red-600">
              Add a delivery address before placing your order.
            </p>
          )}

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
      </div>
    </section>
  );
};

export default ProductDetailsPage;
