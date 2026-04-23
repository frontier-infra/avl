// Shared post metadata — the blog index and individual article pages all
// read from the same source. This mirrors a real blog where a content
// layer (markdown frontmatter, a CMS, etc.) feeds both the listing and
// the detail pages.

export type Post = {
  slug: string;
  title: string;
  author: string;
  published: string; // ISO date
  tags: string[];
  reading_time_min: number;
  excerpt: string;
};

export const posts: Post[] = [
  {
    slug: "hello-avl",
    title: "Hello, AVL",
    author: "Jason Brashear",
    published: "2026-04-20",
    tags: ["avl", "announcement", "agents"],
    reading_time_min: 4,
    excerpt:
      "AVL is a producer-side rendering layer for AI agents. " +
      "Every page already knows what it means — we just don't ship that knowledge.",
  },
  {
    slug: "avl-vs-mcp",
    title: "AVL vs MCP: Eyes and Hands",
    author: "Jason Brashear",
    published: "2026-04-22",
    tags: ["avl", "mcp", "comparison"],
    reading_time_min: 7,
    excerpt:
      "MCP is the hands. AVL is the eyes. A short walk through why " +
      "page-level views and tool-level actions are complementary, not competing.",
  },
];
