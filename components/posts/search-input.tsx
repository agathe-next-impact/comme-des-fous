"use client";

import { Input } from "@/components/ui/input";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";

export function SearchInput({ defaultValue, forcePostsPage }: { defaultValue?: string; forcePostsPage?: boolean }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("search", term);
    } else {
      params.delete("search");
    }
    
    // Si forcePostsPage est true, toujours rediriger vers /posts
    const targetPath = forcePostsPage ? '/posts' : pathname;
    replace(`${targetPath}?${params.toString()}`);
  }, 300);

  return (
    <Input
      type="text"
      name="search"
      placeholder="Rechercher des articles..."
      defaultValue={defaultValue}
      onChange={(e) => handleSearch(e.target.value)}
      className="bg-transparent"
    />
  );
}
