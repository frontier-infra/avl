// Factory helper — produces a `defineStaticAgentView` for a single blog
// post from a shared Post record. Keeps the article agent views
// consistent across the site.

import { defineStaticAgentView } from "@frontier-infra/avl";
import type { Post } from "./posts.js";

export function postAgent(post: Post) {
  return defineStaticAgentView({
    intent: {
      purpose: `Blog post: ${post.title}`,
      audience: ["reader", "developer"],
      capability: ["read", "share", "subscribe"],
    },
    state: {
      title: post.title,
      slug: post.slug,
      author: post.author,
      published: post.published,
      reading_time_min: post.reading_time_min,
      tags: post.tags,
    },
    actions: [
      { id: "subscribe",
        method: "POST",
        href: "/api/subscribe",
        inputs: [{ name: "email", type: "string", required: true }] },
      { id: "share_x",
        method: "GET",
        href: `https://x.com/intent/tweet?url=https://example.com/blog/${post.slug}` },
      { id: "share_linkedin",
        method: "GET",
        href: `https://www.linkedin.com/sharing/share-offsite/?url=https://example.com/blog/${post.slug}` },
    ],
    context: post.excerpt,
    nav: {
      parents: ["/blog"],
    },
  });
}
