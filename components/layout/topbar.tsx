"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export default function TopBar() {
  const pathname = usePathname();
  return (

  <nav className="w-full bg-black border-b border-white/30 shadow-sm flex justify-between items-center text-sm md:text-base font-sans fixed top-0 left-0 z-50">

    <Link
      href="/"
      className="w-max md:w-full px-4 md:pl-4 font-regular text-white tracking-tight transition-colors flex items-center h-full border-l border-white/30"
    >
      <span className="block md:hidden">CdF</span>
      <span className="hidden md:block">Comme des fous</span>
    </Link>
    <Link
      href="/posts/categories/a-lire"
      className={`w-max md:w-full px-4 md:pl-4  border-l border-white/30 pl-4 font-regular transition-colors flex items-center h-full ${pathname === "/a-lire" ? "bg-[var(--color-red)] text-black" : " text-white"}`}
    >
      À lire
    </Link>
    <Link
      href="/posts/categories/a-ecouter"
      className={`w-max md:w-full px-4 md:pl-4  border-l border-white/30 pl-4 font-regular transition-colors flex items-center h-full ${pathname === "/a-ecouter" ? "bg-[var(--color-blue)] text-black" : " text-white"}`}
    >
      À écouter
    </Link>
    <Link
      href="/posts/categories/a-voir"
      className={`w-max md:w-full px-4 md:pl-4  border-l border-white/30 pl-4 font-regular transition-colors flex items-center h-full ${pathname === "/a-voir" ? "bg-[var(--color-yellow)] text-black" : " text-white"}`}
    >
      À voir
    </Link>
    <div className="flex items-center justify-end pr-4 h-full">
      <ThemeToggle />
    </div>
  </nav>
          );
}
