"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TopBar() {
  const pathname = usePathname();
  return (

            <nav className="w-full bg-black border-b border-white/30 shadow-sm flex items-center font-sans fixed top-0 left-0 z-50">
              <Link
                href="/"
                className="w-full pl-4 font-regular text-white tracking-tight transition-colors flex items-center h-full"
              >
                Comme des fous
              </Link>
              <Link
                href="/posts/categories/a-lire"
                className={`w-full py-1 border-l border-white/30 pl-4 font-regular text-white transition-colors flex items-center h-full ${pathname === "/posts/categories/a-lire" ? "bg-[var(--color-red)]" : ""}`}
              >
                À lire
              </Link>
              <Link
                href="/posts/categories/a-ecouter"
                className={`w-full py-1 border-l border-white/30 pl-4 font-regular text-white transition-colors flex items-center h-full ${pathname === "/posts/categories/a-ecouter" ? "bg-[var(--color-blue)]" : ""}`}
              >
                À écouter
              </Link>
              <Link
                href="/posts/categories/a-voir"
                className={`w-full py-1 border-l border-white/30 pl-4 font-regular text-white transition-colors flex items-center h-full ${pathname === "/posts/categories/a-voir" ? "bg-[var(--color-yellow)]" : ""}`}
              >
                À voir
              </Link>
            </nav>
          );
}
