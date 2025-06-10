"use client";
import React, { useState, KeyboardEvent } from "react";
import AdminProducts from "../../components/adminComponents/AdminProducts";
import AdminOrders from "../../components/adminComponents/AdminOrders";
import { Button } from "@heroui/react";

const ProductsView: React.FC = () => (
  <div>
    <AdminProducts />
  </div>
);

const OrdersView: React.FC = () => (
  <div>
    <AdminOrders />
  </div>
);

export default function AdminPage() {
  const [isOpen, setIsOpen] = useState(true);
  const [view, setView] = useState<"products" | "orders">("products");

  function keyToggle(toggle: () => void) {
    return (e: KeyboardEvent<HTMLElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggle();
      }
    };
  }

  const selectView = (newView: "products" | "orders") => {
    setView(newView);
  };

  return (
    <div className="mt-16 flex h-screen overflow-hidden bg-gray-50">
      {/* Modern Sidebar */}
      <aside
        className={`flex-none h-full bg-white shadow-xl border-r border-gray-200 transition-all duration-300 ease-in-out z-20 ${
          isOpen ? "w-64" : "w-0"
        }`}
      >
        {/* Sidebar Header */}
        {isOpen && (
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">Dashboard</h2>
              <Button
                isIconOnly
                variant="light"
                size="sm"
                onPress={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </Button>
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        {isOpen && (
          <nav className="p-4 space-y-2">
            <div
              role="button"
              tabIndex={0}
              onClick={() => selectView("products")}
              onKeyDown={keyToggle(() => selectView("products"))}
              className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer group ${
                view === "products"
                  ? "bg-gray-50 text-black border-r-4 border-black shadow-sm"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <svg
                className="w-5 h-5 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
              <span className="font-medium">Products</span>
              {view === "products" && (
                <div className="ml-auto w-2 h-2 bg-black rounded-full"></div>
              )}
            </div>

            <div
              role="button"
              tabIndex={0}
              onClick={() => selectView("orders")}
              onKeyDown={keyToggle(() => selectView("orders"))}
              className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer group ${
                view === "orders"
                  ? "bg-gray-50 text-black border-r-4 border-black shadow-sm"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <svg
                className="w-5 h-5 mr-3"
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
              <span className="font-medium">Orders</span>
              {view === "orders" && (
                <div className="ml-auto w-2 h-2 bg-black rounded-full"></div>
              )}
            </div>
          </nav>
        )}
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 relative bg-gray-50 overflow-hidden">
        {/* Mobile Menu Button */}
        {!isOpen && (
          <Button
            isIconOnly
            variant="solid"
            color="primary"
            size="lg"
            onPress={() => setIsOpen(true)}
            className="absolute top-6 left-6 z-10 bg-black text-white shadow-lg"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </Button>
        )}

        {/* Content Container */}
        <div className="h-full overflow-auto bg-white m-4 rounded-lg shadow-sm border border-gray-200">
          {view === "products" ? <ProductsView /> : <OrdersView />}
        </div>
      </main>
    </div>
  );
}
