# AVL Handoff — Restructure to npm Package

## What This Is

AVL (Agent View Layer) — producer-side rendering for AI agents. Apps serve a parallel `.agent` view alongside human HTML. Same data, different rendering target. The i18n analogy: human locale + agent locale.

## Current State

Written as a standalone Next.js demo app. The runtime library code works but is embedded inside the app — it cannot be installed via `npm install` by other developers.

**Repo:** github.com/webdevtodayjason/avl
**Local:** /Users/sem/code/avl

## What Needs to Change

Restructure from "demo app" to "publishable npm package with examples."

### Library (the package — what gets published to npm)

These files ARE the library and work correctly today. They need to move to `src/` with proper package exports:

| Current Path | Purpose |
|---|---|
| `lib/avl/types.ts` | AgentView, Action, Intent type definitions |
| `lib/avl/toon.ts` | TOON encoder (Token-Oriented Object Notation — ~70% fewer tokens than JSON) |
| `lib/avl/serialize.ts` | Renders @meta / @intent / @state / @actions / @context / @nav sections |
| `lib/avl/define.ts` | `defineAgentView()` — the authoring helper developers use |
| `lib/avl/registry.ts` | Pattern → view mapping (v0.2 should auto-scan) |
| `lib/avl/auth.ts` | Mock session resolver (real impl parses host app's cookie) |
| `lib/avl/index.ts` | Barrel export |

The catch-all route handler (`app/agent/[[...path]]/route.ts`) should become an exported helper that developers import into their own catch-all route.

### Package configuration needed

```json
{
  "name": "avl",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": "./dist/index.js",
    "./next": "./dist/next.js"
  }
}
```

Build with tsup or tsconfig for declaration emit. Zero runtime dependencies — just types and string serialization.

### Examples (move out of the package root)

These are demo/illustration files, NOT part of the library:

| Current Path | Move To |
|---|---|
| `app/dashboard/page.tsx` | `examples/next-app/app/dashboard/page.tsx` |
| `app/dashboard/agent.ts` | `examples/next-app/app/dashboard/agent.ts` |
| `app/journey/[id]/page.tsx` | `examples/next-app/app/journey/[id]/page.tsx` |
| `app/journey/[id]/agent.ts` | `examples/next-app/app/journey/[id]/agent.ts` |
| `app/api/journey/[id]/advance/route.ts` | `examples/next-app/app/api/...` |
| `app/page.tsx` | `examples/next-app/app/page.tsx` |
| `data/mock.ts` | `examples/next-app/data/mock.ts` |
| `public/agent.txt` | `examples/next-app/public/agent.txt` |
| `proxy.ts` | `examples/next-app/middleware.ts` |

The example app imports from the package (`import { defineAgentView } from "avl"`) instead of relative paths.

### What a developer's integration looks like (end goal)

```bash
npm install avl
```

```typescript
// app/dashboard/agent.ts
import { defineAgentView } from "avl";

export default defineAgentView({
  intent: {
    purpose: "User dashboard",
    audience: ["admin", "member"],
    capability: ["review", "manage"],
  },
  state: async ({ user }) => ({
    projects: await getProjects(user.id),
  }),
  actions: [
    { id: "view_project", method: "GET", href: "/project/{id}.agent" },
  ],
  context: ({ projects }) =>
    `${projects.length} active projects.`,
});
```

```typescript
// app/agent/[[...path]]/route.ts
import { createAgentViewHandler } from "avl/next";
export const GET = createAgentViewHandler();
```

That's it. Two files and their pages have an agent locale.

## Format Spec

Full spec at `specs/avl-agent-view-layer.md` (15 sections, covers format grammar, discovery, conformance levels L0-L3, security model, comparison to prior art).

## Key Design Decisions

- **TOON for tabular state** — not JSON, not YAML. ~70% token reduction for structured data.
- **`.agent` URL suffix** as primary discovery (cache-friendly, debuggable in browser).
- **`@intent` section** — the thing scrapers can never recover. Declares why a page exists and who it's for.
- **`@actions`** — page-scoped affordances. Agent only sees what's actionable from here.
- **Same auth cookie** — no separate API token. Agent rides the existing session.
- **Colocated authoring** — `agent.ts` next to `page.tsx`. Same data fetchers.

## Open Questions for v0.2

1. Should the package also export an MCP server generator? (Derive MCP tools from the same `agent.ts` manifests)
2. Auto-discovery of `agent.ts` files at build time vs. manual registry
3. Framework adapters beyond Next.js (SvelteKit, Remix, Nuxt)
4. Action input schemas — expose POST endpoint shapes in TOON?
5. Streaming for large state blocks

## Scrub Before Publishing

3 files have "HoLaCe" in comments (not code). Remove before npm publish:
- `lib/avl/auth.ts:5` — comment references "holace_session"
- `ops/README.md:7` — "derived from HoLaCe ops pattern"
- `ops/log/JOURNAL.md:39` — "Adopted the HoLaCe ops/ pattern"

Demo data uses PI law firm terminology (journey, settlement) as examples. Consider genericizing to something neutral (project, ticket) before publishing so the package doesn't look domain-specific.

## No HoLaCe Dependencies

Zero imports from HoLaCe. Zero shared code. Zero database connections. Completely standalone. The only overlap is conceptual — the demo used PI law firm terminology because that was the context when it was built.
