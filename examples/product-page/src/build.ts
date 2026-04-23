// Build script.
//
// Run: `npm run build`
// Output: dist/product/kettle-17-ss.agent

import { generateStaticAgentViews } from "@frontier-infra/avl";

import product from "./product.agent.js";

const result = await generateStaticAgentViews({
  outDir: "dist",
  pages: [
    { url: "/product/kettle-17-ss", view: product },
  ],
  generatedAt: process.env.AVL_GENERATED_AT,
});

console.log(`Wrote ${result.written.length} agent view(s):`);
for (const p of result.written) console.log(`  ${p}`);
