import { PostCard } from "./post-card";
import { getRecentPosts } from "@/lib/wordpress";

/**
 * Liste les posts sticky
 * 
 **/
export async function MostReadPostsList() {
  // Récupère les posts sticky (mis en avant)
  const posts = await getRecentPosts();
  // Filtre strict côté front pour ne garder que les sticky
  const mostRead = posts.filter((post) => post.sticky);

  return (
    <section>
      <h2 className="text-5xl font-title font-bold mb-4">Les plus lus</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {mostRead.slice(0, 4).map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
}
