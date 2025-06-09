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
import { ShoppingCartIcon } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

const Path = (props) => (
  <motion.path
    fill="transparent"
    strokeWidth="3"
    stroke="hsl(0, 0%, 18%)"
    strokeLinecap="round"
    {...props}
  />
);

const MenuToggle = ({ toggle }) => (
  <Button
    variant="light"
    onPress={toggle}
    className="cursor-pointer relative z-20 border-none bg-transparent p-0 hover:bg-transparent"
    style={{ color: "var(--color-primary)" }}
  >
    <svg width="23" height="23" viewBox="0 0 23 23">
      <Path
        variants={{
          closed: { d: "M 2 2.5 L 20 2.5" },
          open: { d: "M 3 16.5 L 17 2.5" },
        }}
      />
      <Path
        d="M 2 9.423 L 20 9.423"
        variants={{ closed: { opacity: 1 }, open: { opacity: 0 } }}
        transition={{ duration: 0.1 }}
      />
      <Path
        variants={{
          closed: { d: "M 2 16.346 L 20 16.346" },
          open: { d: "M 3 2.5 L 17 16.346" },
        }}
      />
    </svg>
  </Button>
);

export default function Navbar() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    onOpen();
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-transparent flex justify-between items-center px-3 py-4">
      <Link href="/" className="flex items-center gap-2">
        {/* <img
          src="/logo.png"
          alt="Bergstrøm Art Logo"
          className="h-8 w-8 rounded-full"
        /> */}
        <h1 className="text-xl text-[var(--color-primary)] font-bold">
          Bergstrøm Art
        </h1>
      </Link>
      <div className="flex items-center gap-4">
        <Link href="/cart" className="text-lg">
          <motion.div
            className="relative cursor-pointer"
            whileHover={{ scale: 1.1 }}
          >
            <ShoppingCartIcon className="" size={24} />
            <div className="absolute right-0 top-full mt-2 bg-white shadow-md p-2 rounded hidden group-hover:block">
              <p>Your cart items will appear here.</p>
            </div>
          </motion.div>
        </Link>
        <motion.div initial={false} animate={menuOpen ? "open" : "closed"}>
          <MenuToggle toggle={toggleMenu} />
        </motion.div>
      </div>

        <Drawer isOpen={isOpen} onOpenChange={onOpenChange} placement="right">
        <DrawerContent>
          <DrawerHeader>Bergstrøm Art Menu</DrawerHeader>
          <DrawerBody>
            <ul className="space-y-4">
              <li>
                <Link href="/">Home</Link>
              </li>
              <li>
                <Link href="/about">About</Link>
              </li>
              <li>
                <Link href="/contact">Contact</Link>
              </li>
              <li>
                <Link href="/bestilling">Bestillngs maleri</Link>
              </li>
            </ul>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </nav>
  );
}
