export interface Comment {
  id: number;
  post: number;
  parent: number;
  author: number;
  author_name: string;
  author_email: string;
  author_url: string;
  author_avatar_urls: Record<string, string>;
  date: string;
  date_gmt: string;
  content: {
    rendered: string;
  };
  link: string;
  status: "approved" | "hold" | "spam" | "trash";
  type: string;
  author_yoast_head?: string;
}
