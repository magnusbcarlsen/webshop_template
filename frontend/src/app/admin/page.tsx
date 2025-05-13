"use client";
import React, { useState, KeyboardEvent } from "react";
import AdminProducts from "../../components/adminComponents/AdminProducts";
import Navbar from "@/components/NavBar";
import AdminOrders from "../../components/adminComponents/AdminOrders";

// Placeholder views; replace with your actual components or import them
const ProductsView: React.FC = () => (
  <div>
    <AdminProducts />
    {/* Add your product management components here */}
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

  // keyboard accessibility helper
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
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar Container */}
      <aside
        className={`flex-none h-full bg-[var(--color-secondary)] transition-all duration-300 ease-in-out ${
          isOpen ? "w-64" : "w-0"
        }`}
      >
        {/* Close Icon */}
        {isOpen && (
          <div
            role="button"
            tabIndex={0}
            aria-label="Close sidebar"
            onClick={() => setIsOpen(false)}
            onKeyDown={keyToggle(() => setIsOpen(false))}
            className="absolute top-4 right-4 text-2xl font-bold cursor-pointer focus:outline-none"
            style={{ color: "var(--foreground)" }}
          >
            ×
          </div>
        )}

        {/* Navigation */}
        {isOpen && (
          <nav className="mt-6 w-full mt-15">
            <ul className="w-full ">
              <li className=" w-full">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => selectView("products")}
                  onKeyDown={keyToggle(() => selectView("products"))}
                  className={`block w-full py-2 px-4 transition-colors focus:outline-none ${
                    view === "products"
                      ? "bg-[var(--background)]"
                      : "hover:bg-[var(--color-accent)]"
                  }`}
                  style={{ color: "var(--foreground)" }}
                >
                  Products
                </div>
              </li>
              <li className="mb-4 w-full">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => selectView("orders")}
                  onKeyDown={keyToggle(() => selectView("orders"))}
                  className={`block w-full py-2 px-4 transition-colors focus:outline-none ${
                    view === "orders"
                      ? "bg-[var(--background)]"
                      : "hover:bg-[var(--color-accent)]"
                  }`}
                  style={{ color: "var(--foreground)" }}
                >
                  Orders
                </div>
              </li>
            </ul>
          </nav>
        )}
      </aside>

      {/* Main content area */}
      <main className="flex-1 relative bg-[var(--background)] overflow-auto">
        {/* Open Icon when closed */}
        <Navbar />
        {!isOpen && (
          <div
            role="button"
            tabIndex={0}
            aria-label="Open sidebar"
            onClick={() => setIsOpen(true)}
            onKeyDown={keyToggle(() => setIsOpen(true))}
            className="absolute top-4 left-4 text-2xl font-bold p-2 rounded shadow cursor-pointer focus:outline-none"
            style={{
              backgroundColor: "var(--color-primary)",
              color: "var(--background)",
            }}
          >
            ☰
          </div>
        )}
        {/* Render selected view */}
        {view === "products" ? <ProductsView /> : <OrdersView />}
      </main>
    </div>
  );
}
