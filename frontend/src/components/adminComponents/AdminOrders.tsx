"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  fetchOrders,
  deleteOrder,
  restoreOrder,
  completeOrder,
  updateOrder,
  OrderAPI,
} from "@/services/order-api";

type OrderStatus = OrderAPI["status"];

export default function AdminOrders() {
  const [orders, setOrders] = useState<OrderAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderAPI | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus | "">("pending");
  const [statusComment, setStatusComment] = useState<string>("");

  useEffect(() => {
    let isActive = true;

    async function load() {
      setLoading(true);
      try {
        const data = await fetchOrders(showDeleted);
        if (!isActive) return;
        setOrders(data);
        setError(null);
      } catch {
        if (!isActive) return;
        setError("Failed to load orders");
      } finally {
        if (isActive) setLoading(false);
      }
    }

    load();

    return () => {
      // cancel any pending state updates if unmounted
      isActive = false;
    };
  }, [showDeleted]);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchOrders(showDeleted);
      setOrders(data);
      setError(null);
    } catch {
      setError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [showDeleted]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleSoftDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this order?")) return;
    try {
      await deleteOrder(id);
      loadOrders();
    } catch {
      alert("Failed to delete order");
    }
  };

  const handleRestore = async (id: number) => {
    try {
      await restoreOrder(id);
      loadOrders();
    } catch {
      alert("Failed to restore order");
    }
  };

  const handleComplete = async (id: number) => {
    if (!confirm("Mark this order as completed?")) return;
    try {
      await completeOrder(id);
      loadOrders();
    } catch {
      alert("Failed to complete order");
    }
  };

  const handleRevertComplete = async (id: number) => {
    if (!confirm("Revert this completed order back to processing?")) return;
    try {
      // revert without comment to match backend UpdateOrderDto
      await updateOrder(id, { status: "processing" });
      loadOrders();
    } catch {
      alert("Failed to revert order");
    }
  };

  const openDetail = (order: OrderAPI) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setStatusComment("");
  };

  const closeDetail = () => setSelectedOrder(null);

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;
    try {
      await updateOrder(selectedOrder.id, {
        status: newStatus || "pending",
        comment: statusComment,
      });
      closeDetail();
      loadOrders();
    } catch {
      alert("Failed to update status");
    }
  };

  if (loading)
    return <p className="text-[var(--foreground-muted)]">Loading…</p>;
  if (error) return <p className="text-[var(--color-error)]">{error}</p>;

  // partition orders
  const activeOrders = orders.filter((o) => o.status !== "delivered");
  const completedOrders = orders.filter(
    (o) => o.status === "delivered" && !o.deletedAt
  );

  return (
    <div className="p-8 space-y-8">
      {/* Active Orders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            Active Orders
          </h1>
          <button
            className="px-4 py-2 rounded shadow text-sm font-medium focus:outline-none hover:bg-[var(--color-accent)] bg-[var(--color-primary)] text-[var(--background)]"
            onClick={() => setShowDeleted((prev) => !prev)}
          >
            {showDeleted ? "Hide Deleted" : "Show Deleted"}
          </button>
        </div>
        <p className="text-[var(--foreground-muted)] mb-4">
          Total: {activeOrders.length}
          {showDeleted && " (including deleted)"}
        </p>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-[var(--background)] shadow rounded-lg">
            <thead>
              <tr className="bg-[var(--color-secondary)] text-left">
                {[
                  "ID",
                  "Customer",
                  "Items",
                  "Total",
                  "Status",
                  "Created",
                  "Actions",
                ].map((h) => (
                  <th key={h} className="px-6 py-3">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activeOrders.map((order) => (
                <tr
                  key={order.id}
                  className={`border-t hover:bg-[var(--color-accent)] transition-colors ${
                    order.deletedAt ? "opacity-50 line-through" : ""
                  }`}
                >
                  <td className="px-6 py-4">{order.id}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-[var(--foreground)]">
                      {order.guestName}
                    </div>
                    <div className="text-sm text-[var(--foreground-muted)]">
                      {order.guestEmail}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {order.items.length} item{order.items.length !== 1 && "s"}
                  </td>
                  <td className="px-6 py-4">${order.totalAmount}</td>
                  <td className="px-6 py-4 capitalize">{order.status}</td>
                  <td className="px-6 py-4 text-sm text-[var(--foreground-muted)]">
                    {new Date(order.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 space-x-2">
                    <button
                      onClick={() => openDetail(order)}
                      className="px-2 py-1 text-sm rounded focus:outline-none hover:bg-[var(--color-secondary)] bg-[var(--color-primary)] text-[var(--background)]"
                    >
                      View
                    </button>
                    {order.status != "delivered" && (
                      <button
                        onClick={() => handleComplete(order.id)}
                        className="px-2 py-1 text-sm rounded focus:outline-none hover:bg-[var(--color-secondary)] bg-[var(--color-primary)] text-[var(--background)]"
                      >
                        Complete
                      </button>
                    )}
                    {!order.deletedAt ? (
                      <button
                        onClick={() => handleSoftDelete(order.id)}
                        className="px-2 py-1 text-sm rounded focus:outline-none hover:bg-[var(--color-error)] bg-[var(--color-secondary)] text-[var(--background)]"
                      >
                        Delete
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRestore(order.id)}
                        className="px-2 py-1 text-sm rounded focus:outline-none hover:bg-[var(--color-accent)] bg-[var(--color-primary)] text-[var(--background)]"
                      >
                        Restore
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Completed Orders Section */}
      <div>
        <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">
          Completed Orders
        </h2>
        {completedOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-[var(--background)] shadow rounded-lg">
              <thead>
                <tr className="bg-[var(--color-secondary)] text-left">
                  {[
                    "ID",
                    "Customer",
                    "Items",
                    "Total",
                    "Completed At",
                    "Actions",
                  ].map((h) => (
                    <th key={h} className="px-6 py-3">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {completedOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-t hover:bg-[var(--color-accent)] transition-colors"
                  >
                    <td className="px-6 py-4">{order.id}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-[var(--foreground)]">
                        {order.guestName}
                      </div>
                      <div className="text-sm text-[var(--foreground-muted)]">
                        {order.guestEmail}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {order.items.length} item{order.items.length !== 1 && "s"}
                    </td>
                    <td className="px-6 py-4">${order.totalAmount}</td>
                    <td className="px-6 py-4 text-sm text-[var(--foreground-muted)]">
                      {new Date(order.updatedAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 space-x-2">
                      <button
                        onClick={() => openDetail(order)}
                        className="px-2 py-1 text-sm rounded focus:outline-none hover:bg-[var(--color-secondary)] bg-[var(--color-primary)] text-[var(--background)]"
                      >
                        View
                      </button>
                      {/* Revert Complete */}
                      <button
                        onClick={() => handleRevertComplete(order.id)}
                        className="px-2 py-1 text-sm rounded focus:outline-none hover:bg-[var(--color-secondary)] bg-[var(--color-accent)] text-[var(--background)]"
                      >
                        Revert
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-[var(--foreground-muted)]">No completed orders.</p>
        )}
      </div>

      {/* Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-[var(--background)] rounded-lg shadow-lg w-3/4 max-w-2xl p-6">
            <h2 className="text-xl font-bold mb-4">
              Order #{selectedOrder.id} Details
            </h2>
            <div className="space-y-2 mb-4">
              <p>
                <strong>Customer:</strong> {selectedOrder.guestName} (
                {selectedOrder.guestEmail})
              </p>
              <p>
                <strong>Shipping:</strong> {selectedOrder.shippingAddress}
              </p>
              <p>
                <strong>Billing:</strong> {selectedOrder.billingAddress}
              </p>
              <p>
                <strong>Payment:</strong> {selectedOrder.paymentMethod || "N/A"}
              </p>
              <p>
                <strong>Tracking #:</strong>{" "}
                {selectedOrder.trackingNumber || "N/A"}
              </p>
              <p>
                <strong>Notes:</strong> {selectedOrder.notes || "—"}
              </p>
            </div>
            <div className="mb-4">
              <h3 className="font-medium mb-2">Items</h3>
              <ul className="list-disc list-inside">
                {selectedOrder.items.map((i) => (
                  <li key={i.id}>
                    {i.quantity} × {i.product?.name ?? i.variant?.sku ?? "N/A"}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mb-4">
              <h3 className="font-medium mb-2">Status History</h3>
              <ul className="list-none space-y-1">
                {selectedOrder.statusHistory.map((h) => (
                  <li
                    key={h.id}
                    className="text-sm text-[var(--foreground-muted)]"
                  >
                    {new Date(h.createdAt).toLocaleString()}: {h.status}
                    {h.comment ? ` — ${h.comment}` : ""}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Update Status</label>
              <select
                value={newStatus}
                onChange={(e) =>
                  setNewStatus(
                    e.target.value as
                      | "pending"
                      | "processing"
                      | "shipped"
                      | "delivered"
                      | "cancelled"
                      | "refunded"
                  )
                }
                className="w-full mb-2 p-2 border rounded"
              >
                {[
                  "pending",
                  "processing",
                  "shipped",
                  "delivered",
                  "cancelled",
                  "refunded",
                ].map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
              <textarea
                value={statusComment}
                onChange={(e) => setStatusComment(e.target.value)}
                placeholder="Comment (optional)"
                className="w-full p-2 border rounded"
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={closeDetail}
                className="px-4 py-2 rounded shadow focus:outline-none hover:bg-[var(--color-accent)] bg-[var(--color-secondary)] text-[var(--background)]"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStatus}
                className="px-4 py-2 rounded shadow focus:outline-none hover:bg-[var(--color-secondary)] bg-[var(--color-primary)] text-[var(--background)]"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
