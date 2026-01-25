"use client";

import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { Author, Tag, Category } from "@/lib/wordpress.d";

interface FilterPostsProps {
  authors: Author[];
  tags: Tag[];
  categories: Category[];
  initialAuthor?: string;
  initialTag?: string;
  initialCategory?: string;
  initialSearch?: string;
}

export function FilterPosts({
  authors,
  tags,
  categories,
  initialAuthor,
  initialTag,
  initialCategory,
  initialSearch,
}: FilterPostsProps) {
  // Affichage du ou des filtres sélectionnés
  let selectedFilters: string[] = [];
  if (initialCategory && categories.length > 0) {
    const catObj = categories.find(
      (c) =>
        c.id.toString() === initialCategory ||
        c.slug === initialCategory
    );
    if (catObj) selectedFilters.push(catObj.name);
  }
  if (initialTag && tags.length > 0) {
    const tagObj = tags.find(
      (t) =>
        t.id.toString() === initialTag ||
        t.slug === initialTag
    );
    if (tagObj) selectedFilters.push(tagObj.name);
  }
  if (initialAuthor && authors.length > 0) {
    const authorObj = authors.find(
      (a) =>
        a.id.toString() === initialAuthor ||
        a.slug === initialAuthor
    );
    if (authorObj) selectedFilters.push(authorObj.name);
  }
  const router = useRouter();

  const handleFilterChange = (type: string, value: string) => {
    const newParams = new URLSearchParams(window.location.search);
    newParams.delete("page");
    newParams.delete("search");
    value === "all" ? newParams.delete(type) : newParams.set(type, value);

    router.push(`/posts?${newParams.toString()}`);
  };

  const handleResetFilters = () => {
    router.push("/posts");
  };

  const hasTags = tags.length > 0;
  const hasCategories = categories.length > 0;
  const hasAuthors = authors.length > 0;

  return (
    <>
      {selectedFilters.length > 0 && (
        <div className="mb-2 text-4xl font-title font-normal bg-[var(--bg-main)] text-[var(--text-main)]">
          {selectedFilters.join(" | ")}
        </div>
      )}
      <div className="grid md:grid-cols-[1fr_1fr_1fr] gap-6 my-4 z-10!">
        <Select
          value={initialTag || "all"}
          onValueChange={(value) => handleFilterChange("tag", value)}
        >
          <SelectTrigger disabled={!hasTags}>
            <SelectValue placeholder="Tags" />
            {!hasTags && <span className="opacity-60">No tags found</span>}
          </SelectTrigger>
          {hasTags && (
            <SelectContent>
              <SelectItem value="all">Tags</SelectItem>
              {[...tags]
                .sort((a, b) => b.count - a.count)
                .map((tag) => (
                  <SelectItem key={tag.id} value={tag.id.toString()}>
                    {tag.name} ({tag.count})
                  </SelectItem>
                ))}
            </SelectContent>
          )}
        </Select>

        <Select
          value={initialCategory || "all"}
          onValueChange={(value) => handleFilterChange("category", value)}
        >
          <SelectTrigger disabled={!hasCategories}>
            <SelectValue placeholder="Categories" />
            {!hasCategories && (
              <span className="opacity-60">No categories found</span>
            )}
          </SelectTrigger>
          {hasCategories && (
            <SelectContent>
              <SelectItem value="all">Categories</SelectItem>
              {[...categories]
                .sort((a, b) => b.count - a.count)
                .map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name} ({category.count})
                  </SelectItem>
                ))}
            </SelectContent>
          )}
        </Select>

        {/*
    {authors.length > 0 && (
      <Select
        value={initialAuthor || "all"}
        onValueChange={(value) => handleFilterChange("author", value)}
      >
        <SelectTrigger disabled={!hasAuthors} className="text-center">
          {hasAuthors ? (
            <SelectValue placeholder="Auteurs" />
          ) : (
            "No authors found"
          )}
        </SelectTrigger>
        <SelectContent>
        <SelectItem value="all">Auteurs</SelectItem>
          {authors.map((author) => (
            <SelectItem key={author.id} value={author.id.toString()}>
              {author.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )}
*/}

        <Button variant="outline" onClick={handleResetFilters}>
          Reset des filtres
        </Button>
      </div>
    </>
  );
}
