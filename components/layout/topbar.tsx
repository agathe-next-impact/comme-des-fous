"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TopBar() {
  const pathname = usePathname();
  return (
    <nav className="w-full bg-black border-b border-white/30 shadow-sm flex items-center font-sans fixed top-0 left-0 z-50">
      <div className="w-full">
        <Link
          href="/"
          className="pl-4 font-regular text-white tracking-tight transition-colors"
        >
          Comme des fous
        </Link>
      </div>
      <div className={`w-full py-1 border-l border-white/30 ${pathname === "/posts/categories/a-lire" ? "bg-[var(--color-red)]" : ""}`}>
        <Link
          href="/posts/categories/a-lire"
          className={`pl-4 font-regular transition-colors ${pathname === "/posts/categories/a-lire" ? "text-black" : "text-white"}`}
        >
          À lire
        </Link>
      </div>
      <div className={`w-full py-1 border-l border-white/30 ${pathname === "/posts/categories/a-ecouter" ? "bg-[var(--color-blue)]" : ""}`}>
        <Link
          href="/posts/categories/a-ecouter"
          className={`pl-4 font-regular transition-colors ${pathname === "/posts/categories/a-ecouter" ? "text-black" : "text-white"}`}
        >
          À écouter
        </Link>
      </div>
      <div className={`w-full py-1 border-l border-white/30 ${pathname === "/posts/categories/a-voir" ? "bg-[var(--color-yellow)]" : ""}`}>
        <Link
          href="/posts/categories/a-voir"
          className={`pl-4 font-regular transition-colors ${pathname === "/posts/categories/a-voir" ? "text-black" : "text-white"}`}
        >
          À voir
        </Link>
      </div>
    </nav>
  );
}
