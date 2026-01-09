import { PostCard } from "@/components/posts/post-card";
import { getPostsPaginated } from "@/lib/wordpress";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface PostsArchiveProps {
  category?: string;
  tag?: string;
  author?: string;
  search?: string;
  page?: number;
  postsPerPage?: number;
  emptyMessage?: string;
  baseUrl?: string;
}

export async function PostsArchive({
  category,
  tag,
  author,
  search,
  page = 1,
  postsPerPage = 9,
  emptyMessage = "Pas d'articles disponibles pour le moment.",
  baseUrl = "/posts",
}: PostsArchiveProps) {
  const result = await getPostsPaginated(page, postsPerPage, {
    category,
    tag,
    author,
    search,
  });

  const posts = result.data;
  const total = result.headers.total;
  const totalPages = result.headers.totalPages;

  // Debug
  console.log("Posts Archive Debug:", { 
    postsCount: posts.length, 
    total, 
    totalPages,
    page,
    postsPerPage,
    category,
    result
  });

  // Build pagination URL with query params
  const createPaginationUrl = (pageNum: number) => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (tag) params.set("tag", tag);
    if (author) params.set("author", author);
    if (search) params.set("search", search);
    if (pageNum > 1) params.set("page", pageNum.toString());
    
    const queryString = params.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  };

  if (posts.length === 0) {
    return (
      <div className="h-24 w-full border rounded-lg bg-accent/25 flex items-center justify-center">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border-l border-t border-white/20">
        {posts.map((post, index) => (
          <PostCard key={post.id} post={post} index={index} />
        ))}
      </div>

      {/* Debug: toujours afficher la pagination pour tester */}
      <div className="flex justify-center items-center py-8 pl-24">
        <Pagination>
          <PaginationContent>
            {page > 1 && (
              <PaginationItem>
                <PaginationPrevious href={createPaginationUrl(page - 1)} />
              </PaginationItem>
            )}

            {totalPages > 0 && Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <PaginationItem key={pageNum}>
                <PaginationLink
                  href={createPaginationUrl(pageNum)}
                  isActive={pageNum === page}
                >
                  {pageNum}
                </PaginationLink>
              </PaginationItem>
            ))}

            {page < totalPages && (
              <PaginationItem>
                <PaginationNext href={createPaginationUrl(page + 1)} />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
        <div className="w-24 ml-4 text-sm text-muted-foreground">
          {total} articles
        </div>
      </div>
    </div>
  );
}
