// Build script — emits one `.agent` file per page.
//
// Run: `npm run build`
// Output:
//   dist/blog.agent                 (blog index)
//   dist/blog/hello-avl.agent       (article)
//   dist/blog/avl-vs-mcp.agent      (article)

import { generateStaticAgentViews } from "@frontier-infra/avl";

import blogIndex from "./index.agent.js";
import { posts } from "./posts.js";
import { postAgent } from "./post.js";

const result = await generateStaticAgentViews({
  outDir: "dist",
  pages: [
    { url: "/blog", view: blogIndex },
    ...posts.map((post) => ({
      url: `/blog/${post.slug}`,
      view: postAgent(post),
    })),
  ],
  generatedAt: process.env.AVL_GENERATED_AT,
});

console.log(`Wrote ${result.written.length} agent view(s):`);
for (const p of result.written) console.log(`  ${p}`);
