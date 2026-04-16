# Agent Journal

> Append-only log. Every agent writes here when starting, finishing, or
> handing off work. Newest entries at the top.

---

## 2026-04-16 — AVL v0.1 Pilot Bootstrap

**Slice:** `avl-v0.1-pilot`
**Branch:** main (local)
**Agent:** claude-opus

### What was done

- Created project at `/home/user/avl/`. Next.js 15 + React 19 + TypeScript.
- Wrote the v0.1 specification: `specs/avl-agent-view-layer.md`. 15
  sections covering vision, format, discovery, auth, authoring API,
  conformance levels, security, examples, open questions, roadmap.
- Implemented the AVL runtime under `lib/avl/`:
  - `types.ts` — type surface
  - `toon.ts` — TOON encoder (scalars, arrays-of-scalars, objects,
    arrays-of-objects with tabular header)
  - `serialize.ts` — full document serializer (`@meta`, `@intent`,
    `@state`, `@actions`, `@context`, `@nav`)
  - `define.ts` — `defineAgentView()` authoring helper
  - `registry.ts` — pattern → view registry (manual; v0.2 will scan)
  - `auth.ts` — mock session resolver
- Built two demo routes:
  - `/dashboard` (human) + `/dashboard.agent` (AVL)
  - `/journey/[id]` (human) + `/journey/[id].agent` (AVL)
- Discovery: `proxy.ts` (Next 16+ replacement for `middleware.ts`) rewrites
  `*.agent` and content-negotiates `Accept: text/agent-view` to the AVL
  runtime catch-all at `app/agent/[[...path]]/route.ts`. The same runtime
  is reachable directly at `/agent/<route>` for clients that prefer it.
- Mock action endpoint: `app/api/journey/[id]/advance/route.ts` to
  exercise the `@actions` affordances.
- Site manifest: `public/agent.txt`.
- Adopted the HoLaCe ops/ pattern as a placeholder. Pinned reconciliation
  against Jason's "maintainer Blueprint" repo (URL pending).

### What's pending

- `npm install` + dev-server build verification.
- Initial `git init` + commit on a new local repo (no remote yet —
  GitHub repo creation blocked by MCP scope; pinned).
- Linear project + initial issues (blocked by API key; pinned).

### Decisions worth flagging

- **Why a registry instead of file-system scanning:** Next.js bundles
  `agent.ts` files at build time. Dynamic `import()` of arbitrary paths
  is unreliable. A hand-maintained registry is fine for the pilot; v0.2
  introduces a build-time scanner.
- **Why `app/agent/` for the runtime instead of `__avl__`:** Next.js
  excludes ANY folder starting with `_` from routing — `__avl__` is also
  treated as private. Switched to `app/agent/[[...path]]/route.ts`, which
  has the bonus that `/agent/<route>` becomes a documented alternate
  surface for clients that don't want to rely on URL rewriting.
- **Why TOON for `@state` only, not the whole document:** TOON is
  optimal for tabular data. Section markers (`@meta`, `@intent`) are
  human-readable in their own right and don't benefit from compression.
- **Why descriptive actions instead of MCP-native:** v0.1 ships fewer
  moving parts. v0.2 adds an MCP bridge that derives an MCP server from
  the same `agent.ts` manifests — one source of truth.
