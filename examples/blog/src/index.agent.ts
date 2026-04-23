// Blog index — @state is the list of posts.
//
// Note the `state` field is a zero-arg producer: this is where a real blog
// would read the posts directory / query a CMS. Here it's synchronous data
// but the shape is the same.

import { defineStaticAgentView } from "@frontier-infra/avl";
import { posts } from "./posts.js";

export default defineStaticAgentView({
  intent: {
    purpose: "Blog index — latest posts from the AVL team",
    audience: ["reader", "developer"],
    capability: ["browse", "subscribe"],
  },
  state: () => ({
    total_posts: posts.length,
    posts: posts.map((p) => ({
      slug: p.slug,
      title: p.title,
      author: p.author,
      published: p.published,
      reading_time_min: p.reading_time_min,
      tags: p.tags,
    })),
  }),
  actions: [
    { id: "subscribe",
      method: "POST",
      href: "/api/subscribe",
      inputs: [{ name: "email", type: "string", required: true }] },
    { id: "rss",
      method: "GET",
      href: "/feed.xml" },
  ],
  context: `${posts.length} published posts. Most recent: "${posts[posts.length - 1].title}".`,
  nav: {
    parents: ["/"],
    drilldown: "/blog/{slug}",
  },
});
