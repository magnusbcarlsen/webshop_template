// frontend/src/pages/admin/orders.tsx
import React, { useState, useEffect } from "react";
import { fetchOrders, OrderAPI } from "@/services/order-api";

export default function AdminOrders() {
  const [orders, setOrders] = useState<OrderAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    setLoading(true);
    try {
      const data = await fetchOrders();
      setOrders(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <p className="text-gray-500">Loading orders…</p>
      </div>
    );
  if (error)
    return (
      <div className="flex justify-center py-20">
        <p className="text-red-600">{error}</p>
      </div>
    );

  if (orders.length === 0)
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Orders</h1>
        <p>No orders found.</p>
      </div>
    );

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-2">Orders</h1>
      <p className="text-gray-600 mb-6">
        Manage your orders here. Total: {orders.length}
      </p>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow rounded-lg">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="px-6 py-3">ID</th>
              <th className="px-6 py-3">Customer</th>
              <th className="px-6 py-3">Items</th>
              <th className="px-6 py-3">Total</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Created</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                className="border-t hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4">{order.id}</td>
                <td className="px-6 py-4">
                  <div className="font-medium">{order.guestName}</div>
                  <div className="text-sm text-gray-500">
                    {order.guestEmail}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {order.items.length} item
                  {order.items.length !== 1 ? "s" : ""}
                </td>
                <td className="px-6 py-4">${order.totalAmount}</td>
                <td className="px-6 py-4 capitalize">{order.status}</td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(order.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
