"use client";

import { useEffect, useState } from "react";

const statuses = [
  "Pending",
  "Confirmed",
  "Packed",
  "Shipped",
  "Delivered",
  "Cancelled",
];

export default function SellerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState("");
  const [error, setError] = useState("");

  const loadOrders = async () => {
    try {
      const response = await fetch("/api/orders/seller", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Unable to load seller orders");
      setOrders(data.orders || []);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const updateStatus = async (orderId, status) => {
    setUpdating(orderId);
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Unable to update status");
      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order._id === orderId ? { ...order, ...data.order } : order,
        ),
      );
    } catch (error) {
      setError(error.message);
    } finally {
      setUpdating("");
    }
  };

  return (
    <section className="mt-5 rounded-xl bg-gray-100 p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">Customer Orders</h2>
          <p className="text-sm text-gray-600">
            Update packing and shipment status for your products.
          </p>
        </div>
        <button
          type="button"
          onClick={loadOrders}
          className="rounded border border-green-600 px-3 py-1 text-sm font-semibold text-green-700"
        >
          Refresh
        </button>
      </div>

      {loading && <p className="mt-4 text-gray-600">Loading orders...</p>}
      {!loading && error && <p className="mt-4 text-red-600">{error}</p>}
      {!loading && !error && orders.length === 0 && (
        <p className="mt-4 text-gray-600">No customer orders yet.</p>
      )}
      <div className="mt-4 space-y-3">
        {orders.map((order) => (
          <div key={order._id} className="rounded-lg border bg-white p-3">
            <div className="flex flex-col justify-between gap-3 sm:flex-row">
              <div>
                <p className="font-semibold">{order.productName}</p>
                <p className="text-sm text-gray-600">
                  {order.userId?.farmername || "Customer"} · Qty{" "}
                  {order.quantity} · ₹{order.totalPrice.toLocaleString("en-IN")}
                </p>
                <p className="text-sm text-gray-600">
                  COD · {order.userId?.email}
                </p>
              </div>
              <select
                value={order.orderStatus}
                disabled={updating === order._id}
                onChange={(event) =>
                  updateStatus(order._id, event.target.value)
                }
                className="h-9 rounded border border-green-600 px-2 text-sm font-semibold text-green-700"
                aria-label={`Update status for ${order.productName}`}
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
