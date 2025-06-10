"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Textarea,
  Chip,
} from "@heroui/react";
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
      setError("Failed to delete order");
    }
  };

  const handleRestore = async (id: number) => {
    try {
      await restoreOrder(id);
      loadOrders();
    } catch {
      setError("Failed to restore order");
    }
  };

  const handleComplete = async (id: number) => {
    if (!confirm("Mark this order as completed?")) return;
    try {
      await completeOrder(id);
      loadOrders();
    } catch {
      setError("Failed to complete order");
    }
  };

  const handleRevertComplete = async (id: number) => {
    if (!confirm("Revert this completed order back to processing?")) return;
    try {
      await updateOrder(id, { status: "processing" });
      loadOrders();
    } catch {
      setError("Failed to revert order");
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
      setError("Failed to update status");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "pending":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "refunded":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  const activeOrders = orders.filter((o) => o.status !== "delivered");
  const completedOrders = orders.filter(
    (o) => o.status === "delivered" && !o.deletedAt
  );

  return (
    <div className="p-8 space-y-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Orders</h1>
            <p className="text-gray-600">
              Manage customer orders and fulfillment
            </p>
          </div>
          <Button
            onPress={() => setShowDeleted((prev) => !prev)}
            color="primary"
            size="lg"
            className="mt-4 lg:mt-0 bg-black text-white font-semibold px-6"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            {showDeleted ? "Hide Deleted" : "Show Deleted"}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg mr-4">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Active Orders
                </h3>
                <p className="text-3xl font-bold text-blue-600">
                  {activeOrders.length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg mr-4">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Completed Orders
                </h3>
                <p className="text-3xl font-bold text-green-600">
                  {completedOrders.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-red-500 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Active Orders */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Active Orders</h2>
        {activeOrders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <div className="p-4 bg-gray-50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No active orders
            </h3>
            <p className="text-gray-600">
              Active orders will appear here when customers place them
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {[
                      "ID",
                      "Customer",
                      "Items",
                      "Total",
                      "Status",
                      "Created",
                      "Actions",
                    ].map((header) => (
                      <th
                        key={header}
                        className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {activeOrders.map((order) => (
                    <tr
                      key={order.id}
                      className={`hover:bg-gray-50 transition-colors ${
                        order.deletedAt ? "opacity-50" : ""
                      }`}
                    >
                      <td className="px-6 py-4 text-sm text-gray-900 font-mono">
                        #{order.id}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {order.guestName}
                        </div>
                        <div className="text-sm text-gray-600">
                          {order.guestEmail}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {order.items.length} item
                        {order.items.length !== 1 && "s"}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-lg font-semibold text-gray-900">
                          DKK {order.totalAmount}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="flat"
                            color="primary"
                            onPress={() => openDetail(order)}
                          >
                            View
                          </Button>
                          {order.status !== "delivered" && (
                            <Button
                              size="sm"
                              variant="flat"
                              color="success"
                              onPress={() => handleComplete(order.id)}
                            >
                              Complete
                            </Button>
                          )}
                          {!order.deletedAt ? (
                            <Button
                              size="sm"
                              variant="flat"
                              color="danger"
                              onPress={() => handleSoftDelete(order.id)}
                            >
                              Delete
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="flat"
                              color="warning"
                              onPress={() => handleRestore(order.id)}
                            >
                              Restore
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Completed Orders Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Completed Orders
        </h2>
        {completedOrders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <div className="p-4 bg-gray-50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No completed orders
            </h3>
            <p className="text-gray-600">
              Completed orders will appear here after delivery
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {[
                      "ID",
                      "Customer",
                      "Items",
                      "Total",
                      "Completed At",
                      "Actions",
                    ].map((header) => (
                      <th
                        key={header}
                        className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {completedOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-gray-900 font-mono">
                        #{order.id}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {order.guestName}
                        </div>
                        <div className="text-sm text-gray-600">
                          {order.guestEmail}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {order.items.length} item
                        {order.items.length !== 1 && "s"}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-lg font-semibold text-gray-900">
                          ${order.totalAmount}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(order.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="flat"
                            color="primary"
                            onPress={() => openDetail(order)}
                          >
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="flat"
                            color="warning"
                            onPress={() => handleRevertComplete(order.id)}
                          >
                            Revert
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedOrder && (
        <Modal
          isOpen={!!selectedOrder}
          onClose={closeDetail}
          size="3xl"
          scrollBehavior="inside"
        >
          <ModalContent>
            <ModalHeader>
              <h2 className="text-xl font-bold">
                Order #{selectedOrder.id} Details
              </h2>
            </ModalHeader>
            <ModalBody className="space-y-6">
              {/* Customer Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Customer Information
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <p>
                        <strong>Name:</strong> {selectedOrder.guestName}
                      </p>
                      <p>
                        <strong>Email:</strong> {selectedOrder.guestEmail}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Shipping Address
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p>{selectedOrder.shippingAddress}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Order Details
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <p>
                        <strong>Payment:</strong>{" "}
                        {selectedOrder.paymentMethod || "N/A"}
                      </p>
                      <p>
                        <strong>Tracking #:</strong>{" "}
                        {selectedOrder.trackingNumber || "N/A"}
                      </p>
                      <p>
                        <strong>Total:</strong>{" "}
                        <span className="text-lg font-semibold">
                          ${selectedOrder.totalAmount}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Billing Address
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p>{selectedOrder.billingAddress}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedOrder.notes && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Notes</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p>{selectedOrder.notes}</p>
                  </div>
                </div>
              )}

              {/* Items */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Order Items
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-2">
                    {selectedOrder.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0"
                      >
                        <span>
                          {item.quantity} ×{" "}
                          {item.product?.name ?? item.variant?.sku ?? "N/A"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Status History */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Status History
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-2">
                    {selectedOrder.statusHistory.map((history) => (
                      <div
                        key={history.id}
                        className="flex justify-between items-start py-2 border-b border-gray-200 last:border-b-0"
                      >
                        <div>
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(
                              history.status
                            )}`}
                          >
                            {history.status}
                          </span>
                          {history.comment && (
                            <p className="text-sm text-gray-600 mt-1">
                              {history.comment}
                            </p>
                          )}
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(history.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Update Status */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Update Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Status
                    </label>
                    <select
                      value={newStatus}
                      onChange={(e) =>
                        setNewStatus(e.target.value as OrderStatus)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {[
                        "pending",
                        "processing",
                        "shipped",
                        "delivered",
                        "cancelled",
                        "refunded",
                      ].map((status) => (
                        <option key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <Textarea
                  label="Comment (Optional)"
                  value={statusComment}
                  onValueChange={setStatusComment}
                  placeholder="Add a comment about this status change..."
                  variant="bordered"
                  minRows={3}
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" onPress={closeDetail}>
                Cancel
              </Button>
              <Button
                color="primary"
                onPress={handleUpdateStatus}
                className="bg-black text-white"
              >
                Update Status
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </div>
  );
}
