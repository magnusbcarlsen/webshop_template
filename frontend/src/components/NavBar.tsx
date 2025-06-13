"use client";

import {
  useDisclosure,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  Button,
} from "@heroui/react";
import { motion } from "framer-motion";
import { ShoppingCartIcon, Instagram, X } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

const Path = (props) => (
  <motion.path
    fill="transparent"
    strokeWidth="3"
    stroke="currentColor"
    strokeLinecap="round"
    {...props}
  />
);

const MenuToggle = ({ toggle }) => (
  <Button
    variant="light"
    onPress={toggle}
    className="cursor-pointer relative z-20 border-none bg-transparent p-2 hover:bg-black/5 rounded-lg transition-colors duration-200"
    style={{ color: "var(--color-primary)" }}
    aria-label="Open menu"
  >
    <svg width="24" height="24" viewBox="0 0 23 23">
      <Path d="M 2 2.5 L 20 2.5" />
      <Path d="M 2 9.423 L 20 9.423" />
      <Path d="M 2 16.346 L 20 16.346" />
    </svg>
  </Button>
);

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  onClick: () => void;
}

const NavLink = ({ href, children, onClick }: NavLinkProps) => (
  <Link
    href={href}
    onClick={onClick}
    className="block py-3 px-4 text-lg font-medium text-gray-800 hover:text-[var(--color-primary)] hover:bg-white/20 rounded-lg transition-all duration-200 transform hover:translate-x-1"
  >
    {children}
  </Link>
);

export default function Navbar() {
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();

  const toggleMenu = () => {
    onOpen();
  };

  const handleLinkClick = () => {
    onClose();
  };

  return (
    <>
      {/* Backdrop blur when menu is open */}
      <motion.div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        style={{ pointerEvents: isOpen ? "auto" : "none" }}
        onClick={handleLinkClick}
      />

      <motion.nav
        className="fixed top-0 left-0 w-full z-50 bg-transparent"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="flex justify-between items-center px-4 md:px-6 py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <motion.h1
              className="text-xl md:text-2xl text-[var(--color-primary)] font-bold tracking-tight"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              Bergstrøm Art
            </motion.h1>
          </Link>

          {/* Right side icons */}
          <div className="flex items-center gap-2">
            {/* Instagram Icon */}
            <motion.a
              href="https://instagram.com" // Replace with your Instagram URL
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Visit our Instagram"
            >
              <Instagram
                size={22}
                className="text-gray-700 hover:text-[var(--color-primary)] transition-colors duration-200"
              />
            </motion.a>

            {/* Cart Icon */}
            <Link href="/cart">
              <motion.div
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 relative"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Shopping cart"
              >
                <ShoppingCartIcon
                  size={22}
                  className="text-gray-700 hover:text-[var(--color-primary)] transition-colors duration-200"
                />
                {/* Optional cart count badge */}
                {/* <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  2
                </span> */}
              </motion.div>
            </Link>

            {/* Menu Toggle */}
            <MenuToggle toggle={toggleMenu} />
          </div>
        </div>
      </motion.nav>

      {/* Drawer */}
      <Drawer
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement="right"
        classNames={{
          backdrop: "backdrop-blur-sm",
          wrapper: "z-[60]",
        }}
      >
        <DrawerContent className="bg-white/90 backdrop-blur-md border-l border-gray-200/50 shadow-2xl">
          <DrawerHeader className="border-b border-gray-200/30 pb-4 bg-white/20 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <motion.h2
                className="text-xl font-semibold text-gray-800"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                Bergstrøm Art
              </motion.h2>
              <Button
                variant="light"
                onPress={handleLinkClick}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
                aria-label="Close menu"
              >
                <X size={20} className="text-gray-600" />
              </Button>
            </div>
          </DrawerHeader>
          <DrawerBody className="pt-6">
            <motion.nav
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <ul className="space-y-2">
                <motion.li
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <NavLink href="/" onClick={handleLinkClick}>
                    Home
                  </NavLink>
                </motion.li>
                <motion.li
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <NavLink href="/about" onClick={handleLinkClick}>
                    Om Bergstrøm Art
                  </NavLink>
                </motion.li>
                <motion.li
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <NavLink href="/contact" onClick={handleLinkClick}>
                    Kontakt
                  </NavLink>
                </motion.li>
                <motion.li
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <NavLink href="/bestilling" onClick={handleLinkClick}>
                    Bestillngs maleri
                  </NavLink>
                </motion.li>
              </ul>
            </motion.nav>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}
