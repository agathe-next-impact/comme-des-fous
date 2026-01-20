import { getPostsByCategoryPaginated } from "@/lib/wordpress";
import { PostCard } from "@/components/posts/post-card";
import { Section, Container } from "@/components/craft";

interface RelatedPostsProps {
  categoryId?: number;
  currentPostId: number;
}

export async function RelatedPosts({ categoryId, currentPostId }: RelatedPostsProps) {
  if (!categoryId) {
    return null;
  }

  try {
    const response = await getPostsByCategoryPaginated(categoryId, 1, 10);
    
    // Filter out current post and get first 4
    const relatedPosts = (response.data || [])
      .filter((post) => post.id !== currentPostId)
      .slice(0, 4);

    if (relatedPosts.length === 0) {
      return null;
    }

    return (
      <Section>
        <Container>
          <div className="mt-12">
            <h3 className="text-2xl font-bold mb-8">À voir aussi</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedPosts.map((post, index) => (
                <PostCard key={post.id} post={post} index={index} />
              ))}
            </div>
          </div>
        </Container>
      </Section>
    );
  } catch (error) {
    console.error("Error fetching related posts:", error);
    return null;
  }
}
