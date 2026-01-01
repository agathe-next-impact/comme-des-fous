import Link from "next/link";

export default function TopBar() {
  return (
    <nav
      className="w-full bg-black border-b border-white/30 shadow-sm flex items-center font-sans">
      <div className="w-full py-2">
        <Link
          href="/"
          className="pl-4 font-regular text-white tracking-tight transition-colors"
        >
          Comme des fous
        </Link>
      </div>
      <div className="w-full py-0 border-l border-white/30">
        <Link
          href="/posts/categories/a-lire"
          className="pl-4 font-regular text-white transition-colors"
        >
          À lire
        </Link>
      </div>
      <div className="w-full py-0 border-l border-white/30">
        <Link
          href="/posts/categories/a-ecouter"
          className="pl-4 font-regular text-white transition-colors"
        >
          À écouter
        </Link>
      </div>
      <div className="w-full py-0 border-l border-white/30">
        <Link
          href="/posts/categories/a-voir"
          className="pl-4 font-regular text-white transition-colors"
        >
          À voir
        </Link>
      </div>
    </nav>
  );
}
