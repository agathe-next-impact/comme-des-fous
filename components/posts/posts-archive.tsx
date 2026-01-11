import { PostCard } from "@/components/posts/post-card";
import {
  getPostsPaginated,
  getAllAuthors,
  getAllTags,
  getAllCategories,
  searchAuthors,
  searchTags,
  searchCategories,
} from "@/lib/wordpress";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { FilterPosts } from "./filter";

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
  const [result, authors, tags, categories] = await Promise.all([
    getPostsPaginated(page, postsPerPage, {
      category,
      tag,
      author,
      search,
    }),
    search ? searchAuthors(search) : getAllAuthors(),
    search ? searchTags(search) : getAllTags(),
    search ? searchCategories(search) : getAllCategories(),
  ]);

  const posts = result.data;
  const total = result.headers.total;
  const totalPages = result.headers.totalPages;


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
      <div className="h-24 w-full flex items-center justify-center">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <FilterPosts
        authors={authors}
        tags={tags}
        categories={categories}
        initialAuthor={author}
        initialTag={tag}
        initialCategory={category}
        initialSearch={search}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 border-l border-t border-white/20">
        {posts.map((post, index) => (
          <PostCard key={post.id} post={post} index={index} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center py-8">
          <Pagination>
            <PaginationContent>
              {page > 1 && (
                <PaginationItem>
                  <PaginationPrevious href={createPaginationUrl(page - 1)} />
                </PaginationItem>
              )}

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((pageNum) => {
                  // Show current page, first page, last page, and 2 pages around current
                  return (
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    Math.abs(pageNum - page) <= 1
                  );
                })
                .map((pageNum, index, array) => {
                  const showEllipsis =
                    index > 0 && pageNum - array[index - 1] > 1;
                  return (
                    <div key={pageNum} className="flex items-center">
                      {showEllipsis && <span className="px-2">...</span>}
                      <PaginationItem>
                        <PaginationLink
                          href={createPaginationUrl(pageNum)}
                          isActive={pageNum === page}
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    </div>
                  );
                })}

              {page < totalPages && (
                <PaginationItem>
                  <PaginationNext href={createPaginationUrl(page + 1)} />
                </PaginationItem>
              )}
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
