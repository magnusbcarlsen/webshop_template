"use client";
import React, { useState, useEffect, KeyboardEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, Search, ShoppingCart, X } from "lucide-react";
import Image from "next/image";

const navItems = ["Home", "Shop", "About", "Contact"];

function keyToggle(toggle: () => void) {
  return (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle();
    }
  };
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const router = useRouter();

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch(`${apiUrl}/auth/me`, {
          credentials: "include",
        });
        const data = await res.json();
        setIsLoggedIn(data.authenticated === true);
      } catch {
        setIsLoggedIn(false);
      } finally {
        setLoaded(true);
      }
    }
    checkAuth();
  }, [apiUrl]);

  const toggleMobile = () => setMobileOpen((open) => !open);
  const toggleSearch = () => setSearchOpen((open) => !open);

  const handleLogout = async () => {
    try {
      const res = await fetch(`${apiUrl}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        setIsLoggedIn(false);
        router.push("/");
      } else {
        console.error("Logout failed with status:", res.status);
      }
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-transparent text-[var(--foreground)] z-50">
      <div className="flex items-center px-4 py-2">
        {/* <div className="hidden md:block absolute left-4 top-1/2  z-50">
          <Link href="/" className="block">
            <Image
              src="/bergstrøm_art_logo.png"
              alt="WebShop Logo"
              width={150}
              height={150}
              className="h-20 w-auto object-contain"
            />
          </Link>
        </div> */}
        <div
          role="button"
          tabIndex={0}
          aria-label="Open menu"
          onClick={toggleMobile}
          onKeyDown={keyToggle(toggleMobile)}
          className="md:hidden mr-2 focus:outline-none cursor-pointer"
        >
          <Menu className="w-6 h-6" />
        </div>

        <div className="-ml-2">
          <Link href="/" className="flex items-center overflow-visible">
            <h1 className="text-2xl font-bold hover:text-[var(--secondaryColor)] transition-colors">
              Bergstrøm Art
            </h1>
          </Link>
        </div>

        <div className="flex items-center ml-auto gap-4 w-full md:w-auto">
          <nav className="hidden md:flex gap-4">
            {navItems.map((item) => (
              <Link
                key={item}
                href={`/${item.toLowerCase()}`}
                className="text-[var(--foreground)] font-medium hover:text-[var(--secondaryColor)] transition-colors"
              >
                {item}
              </Link>
            ))}
            {loaded && isLoggedIn && (
              <button
                onClick={handleLogout}
                className="font-medium hover:text-[var(--secondaryColor)] transition-colors"
              >
                Logout
              </button>
            )}
          </nav>

          <div className="relative flex items-center">
            {!searchOpen ? (
              <div
                role="button"
                tabIndex={0}
                aria-label="Open search"
                onClick={toggleSearch}
                onKeyDown={keyToggle(toggleSearch)}
                className="focus:outline-none cursor-pointer"
              >
                <Search className="w-6 h-6 text-[var(--foreground)]" />
              </div>
            ) : (
              <div className="relative rounded-md bg-[var(--foreground)] bg-opacity-10 hover:bg-opacity-20 transition-colors ml-0 w-full sm:ml-2 sm:w-auto">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="w-5 h-5 text-[var(--foreground)]" />
                </div>
                <input
                  type="text"
                  placeholder="Search…"
                  aria-label="search"
                  autoFocus
                  onBlur={toggleSearch}
                  className="block w-full md:w-20 focus:md:w-40 transition-all duration-200 bg-transparent py-1 pl-10 pr-3 text-current placeholder:text-[var(--foreground)] placeholder:opacity-50 focus:outline-none"
                />
              </div>
            )}
          </div>
          <Link href="/cart">
            <div
              role="button"
              tabIndex={0}
              aria-label="View cart"
              onClick={() => {
                /* handle cart */
              }}
              onKeyDown={keyToggle(() => {
                /* handle cart */
              })}
              className="relative focus:outline-none cursor-pointer"
            >
              <ShoppingCart className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                4
              </span>
            </div>
          </Link>
        </div>
      </div>

      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={toggleMobile}
          />
          <div className="fixed top-0 left-0 h-full w-64 bg-[var(--background)] text-[var(--foreground)] p-4 z-50 transform transition-transform duration-300">
            <div className="flex items-center justify-between mb-4">
              <div>
                <Link
                  href="/"
                  className="font-bold text-lg hover:text-[var(--secondaryColor)]"
                >
                  <Image
                    src="/bergstrøm_art_logo.png"
                    alt="WebShop Logo"
                    width={40}
                    height={40}
                    className="inline-block mr-2"
                  />
                </Link>
              </div>
              <div
                role="button"
                tabIndex={0}
                aria-label="Close menu"
                onClick={toggleMobile}
                onKeyDown={keyToggle(toggleMobile)}
                className="focus:outline-none cursor-pointer"
              >
                <X className="w-6 h-6" />
              </div>
            </div>
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item}
                  href={`/${item.toLowerCase()}`}
                  onClick={toggleMobile}
                  className="py-2 px-2 rounded hover:bg-[var(--foreground)] hover:bg-opacity-10 transition-colors font-medium"
                >
                  {item}
                </Link>
              ))}
              {loaded && isLoggedIn && (
                <button
                  onClick={handleLogout}
                  className="py-2 px-2 rounded font-medium hover:bg-[var(--foreground)] hover:bg-opacity-10 transition-colors text-left"
                >
                  Logout
                </button>
              )}
            </nav>
          </div>
        </>
      )}
    </header>
  );
}
