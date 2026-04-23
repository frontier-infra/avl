// Build script — emits one `.agent` file per page into `dist/`.
//
// Run: `npm run build`
// Output:
//   dist/index.agent
//   dist/about-us.agent
//   dist/services/austin.agent

import { generateStaticAgentViews } from "@frontier-infra/avl";

import homeAgent   from "./index.agent.js";
import aboutAgent  from "./about.agent.js";
import austinAgent from "./services/austin.agent.js";

const result = await generateStaticAgentViews({
  outDir: "dist",
  pages: [
    { url: "/",                view: homeAgent   },
    { url: "/about-us",        view: aboutAgent  },
    { url: "/services/austin", view: austinAgent },
  ],
  // Optional: deterministic timestamp so re-running the build doesn't
  // produce a spurious diff in samples/.
  generatedAt: process.env.AVL_GENERATED_AT,
});

console.log(`Wrote ${result.written.length} agent view(s):`);
for (const p of result.written) console.log(`  ${p}`);
