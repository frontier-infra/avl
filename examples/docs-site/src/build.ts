// Build script for the docs site.
//
// Run: `npm run build`
// Output:
//   dist/docs/installation.agent
//   dist/docs/quick-start.agent
//   dist/docs/api-reference.agent

import { generateStaticAgentViews } from "@frontier-infra/avl";

import installation  from "./pages/installation.agent.js";
import quickStart    from "./pages/quick-start.agent.js";
import apiReference  from "./pages/api-reference.agent.js";

const result = await generateStaticAgentViews({
  outDir: "dist",
  pages: [
    { url: "/docs/installation",  view: installation  },
    { url: "/docs/quick-start",   view: quickStart    },
    { url: "/docs/api-reference", view: apiReference  },
  ],
  generatedAt: process.env.AVL_GENERATED_AT,
});

console.log(`Wrote ${result.written.length} agent view(s):`);
for (const p of result.written) console.log(`  ${p}`);
