"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

const statusSteps = ["Pending", "Confirmed", "Packed", "Shipped", "Delivered"];

function OrderCard({ order }) {
  const currentStep = statusSteps.indexOf(order.orderStatus);
  const address = order.shippingAddress;

  return (
    <article className="overflow-hidden rounded-xl border bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-500">
            Order placed {new Date(order.createdAt).toLocaleDateString("en-IN")}
          </p>
          <h2 className="mt-1 text-lg font-bold text-gray-900">
            {order.productName}
          </h2>
        </div>
        <span className="w-fit rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
          {order.orderStatus}
        </span>
      </div>

      <div className="grid gap-5 p-4 md:grid-cols-[auto_1fr]">
        <div className="flex gap-4">
          {order.productImage ? (
            <Image
              src={order.productImage}
              alt={order.productName}
              width={200}
              height={200}
              className="h-24 w-24 rounded-lg object-cover"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-green-50 text-3xl">
              🌿
            </div>
          )}
          <div className="text-sm text-gray-600">
            <p>
              Quantity:{" "}
              <strong className="text-gray-900">{order.quantity}</strong>
            </p>
            <p>
              Payment:{" "}
              <strong className="text-gray-900">Cash on Delivery</strong>
            </p>
            <p className="mt-2 text-lg font-bold text-green-700">
              ₹{order.totalPrice.toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-900">
            Product tracking
          </p>
          <div className="mt-3 grid grid-cols-5 gap-1">
            {statusSteps.map((step, index) => (
              <div key={step} className="text-center text-xs">
                <div
                  className={`mx-auto h-3 w-3 rounded-full ${index <= currentStep ? "bg-green-600" : "bg-gray-200"}`}
                />
                <p
                  className={`mt-1 ${index <= currentStep ? "font-semibold text-green-700" : "text-gray-400"}`}
                >
                  {step}
                </p>
              </div>
            ))}
          </div>
          {order.orderStatus === "Cancelled" && (
            <p className="mt-3 text-sm font-medium text-red-600">
              This order was cancelled.
            </p>
          )}
        </div>
      </div>

      {address && (
        <div className="border-t bg-gray-50 px-4 py-3 text-sm text-gray-600">
          Delivering to: {address.name}, {address.address}, {address.city},{" "}
          {address.state} - {address.pincode}
        </div>
      )}
    </article>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/orders", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.message || "Unable to load orders");
        setOrders(data.orders || []);
      })
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="mx-auto max-w-360 px-3 pb-16 pt-24 md:px-10">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-green-700">
            Kisan Bazar
          </p>
          <h1 className="text-3xl font-bold">My Orders</h1>
        </div>
        <Link
          href="/shopping"
          className="rounded-lg border border-green-600 px-3 py-2 text-sm font-semibold text-green-700"
        >
          Continue shopping
        </Link>
      </div>

      {loading && <p className="text-gray-600">Loading your orders...</p>}
      {!loading && error && <p className="text-red-600">{error}</p>}
      {!loading && !error && orders.length === 0 && (
        <p className="rounded-xl bg-green-50 p-6 text-gray-700">
          You have not placed any orders yet.
        </p>
      )}
      <div className="space-y-5">
        {orders.map((order) => (
          <OrderCard key={order._id} order={order} />
        ))}
      </div>
    </main>
  );
}
