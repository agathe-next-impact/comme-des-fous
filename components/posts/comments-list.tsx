"use client";

import { Comment } from "@/lib/comments.d";
import { cn } from "@/lib/utils";

interface CommentsListProps {
  comments: Comment[];
}

export function CommentsList({ comments }: CommentsListProps) {
  if (comments.length === 0) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto mt-12 border-t border-border pt-8">
      <h3 className="text-2xl font-bold mb-8">
        Commentaires ({comments.length})
      </h3>

      <div className="space-y-6">
        {comments.map((comment) => {
          const commentDate = new Date(comment.date).toLocaleDateString("fr-FR", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <div
              key={comment.id}
              className={cn(
                "border-l-4 border-primary pl-6 py-4",
                "bg-muted/30 px-6 rounded-r"
              )}
            >
              <div className="flex items-start gap-4 mb-3">
                {comment.author_avatar_urls && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={comment.author_avatar_urls["48"]}
                    alt={comment.author_name}
                    className="w-10 h-10 rounded-full"
                  />
                )}
                <div>
                  <p className="font-semibold text-foreground">
                    {comment.author_name}
                  </p>
                  <p className="text-xs text-muted-foreground">{commentDate}</p>
                </div>
              </div>
              <div
                className="text-sm text-foreground/90 leading-relaxed prose prose-sm dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: comment.content.rendered }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
