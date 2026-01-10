import React from "react";
import { DecodeFr } from "./decode-fr";
import Link from "next/link";

interface Article {
  title: string;
  excerpt: string;
  categories: string[];
  tags: string[];
  imageUrl: string;
  link: string;
}

interface LastArticleSectionProps {
  article: Article;
}

export const LastArticleSection: React.FC<LastArticleSectionProps> = ({ article }) => {
  return (
    <section className="flex flex-col md:flex-row gap-8 items-stretch w-full py-8">
      {/* Left: Infos */}
      <div className="md:w-1/3 flex flex-col justify-between gap-4 py-4 border-y-[1px] border-red-500">
        <div>
          <Link href={article.link} className="hover:underline">
            <h2 className="text-4xl font-normal mb-2"><DecodeFr>{article.title}</DecodeFr></h2>
          </Link>
          <p className="text-base text-muted-foreground mb-4"><DecodeFr>{article.excerpt}</DecodeFr></p>
        </div>
        <div>
            <div className="flex flex-wrap gap-2">
              {article.categories.map((cat) => (
                <Link
                  key={cat}
                  href={`/posts/categories/${encodeURIComponent(cat.toLowerCase().replace(/\s+/g, '-'))}`}
                  className="text-xs text-(--color-red) mb-4 px-2 py-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  {cat}
                </Link>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/posts/tags/${encodeURIComponent(tag.toLowerCase().replace(/\s+/g, '-'))}`}
                  className="text-xs text-(--color-yellow) px-2 py-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
        </div>
      </div>
      {/* Right: Image (2/3) */}
      <div className="md:w-2/3 flex items-center justify-center">
          <a href={article.link} className="block w-full h-full">
            <div className="w-full h-full min-h-[240px] md:min-h-[320px] lg:min-h-[400px] flex-1 relative">
              <img
                src={article.imageUrl}
                alt={article.title}
                className="absolute inset-0 w-full h-full object-cover shadow-md"
                style={{ objectFit: 'cover' }}
              />
            </div>
          </a>
      </div>
    </section>
  );
};
