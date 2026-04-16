# Active Project: AVL v0.1 Pilot

**Goal:** Ship a runnable pilot of the Agent View Layer with format spec,
Next.js runtime, two demo routes, and discovery via URL suffix +
content negotiation.

## Status

**v0.1 — In progress.** First-pass scaffold complete.

| Surface | Status |
|---|---|
| Format spec (§ 1–15) | done — `specs/avl-agent-view-layer.md` |
| TOON encoder | done — `lib/avl/toon.ts` |
| Document serializer | done — `lib/avl/serialize.ts` |
| `defineAgentView` helper | done — `lib/avl/define.ts` |
| Route registry | done — `lib/avl/registry.ts` |
| Discovery proxy | done — `proxy.ts` (Next 16+) |
| Catch-all runtime route | done — `app/agent/[[...path]]/route.ts` |
| Demo: dashboard | done — `app/dashboard/{page,agent}.ts*` |
| Demo: journey detail | done — `app/journey/[id]/{page,agent}.ts*` |
| Site manifest | done — `public/agent.txt` |
| Mock action endpoint | done — `app/api/journey/[id]/advance/route.ts` |
| Build verification | done — `npm run build` green; dev-server smoke-tested all 4 surfaces |
| Initial git commit | pending |

## Next slices

1. **MCP bridge** (`v0.2`) — adapter that emits an MCP server from
   `agent.ts` manifests. One source of truth, two consumers.
2. **Conformance test suite** — verify L0–L3 across registered routes.
3. **Build-time route discovery** — replace the hand-maintained registry
   with a Next.js plugin that scans `app/**/agent.ts`.
4. **Form page demo** — third demo route to exercise input-bearing actions.

## Pinned (waiting on Jason)

- **Linear**: API key + workspace ID. Once provided, create a Linear
  project named "AVL" and seed initial issues for v0.2 slices.
- **GitHub repo**: Either grant my MCP scope to a new repo
  (`webdevtodayjason/avl`?) or Jason creates it and I'll push to it.
- **Maintainer Blueprint**: URL of Jason's blueprint repo so I can
  reconcile this `ops/` scaffold against the canonical pattern.

None of the above blocks v0.1. Local git + manual GitHub push will work
in the meantime.
