# examples/docs-site

A tiny documentation site — three pages (Installation, Quick Start, API Reference) — showing how AVL maps to a classic docs experience, **and how every doc page advertises its agent companion via the four discovery layers**.

## What this shows

- **`@state` as doc metadata**: `section`, `topic`, `order`, `last_updated`, `version`, `applies_to`, `prerequisites`. The shape a docs consumer (or a doc search engine) actually wants.
- **`@actions` for docs**: `edit_on_github`, `report_issue`, `prev`, `next`. These are the real affordances reading a doc page gives you — not "advance stage" or "add to cart."
- **Navigation as first-class data.** `@nav` declares `self`, `parents`, and `peers` so an agent can walk the table of contents without parsing `<a>` tags.
- **Tabular data via TOON**. The API reference's `exports` array is a list of `{name, kind, since}` records — TOON renders this as a compact tabular block, which is the format's sweet spot.
- **Per-page discovery** — every HTML page wires up the four discovery layers (head link, body link, page-specific badge, `Link:` header) so AI doc-indexers can hop straight from any human page to its companion `.agent`.

## The four discovery layers (post-`2f7b046`)

AVL commit [`2f7b046`](https://github.com/frontier-infra/avl/commit/2f7b046) made companion discovery **explicit and per-page**. Fetcher-gated agents (Anthropic's `web_fetch`, OpenAI's browsing tool, etc.) can't be trusted to infer that `/docs/quick-start` has a companion at `/docs/quick-start.agent` — the site has to declare it, and it has to declare it on every page.

Every HTML page in this example carries all four layers:

| Layer | Helper | Where it goes |
|---|---|---|
| HTML `<head>` link | `renderAgentViewHeadLinks({ path })` | `<head>` of each page |
| Body link | `renderAgentViewBodyLink({ path })` | crawlable footer anchor |
| Page-specific badge | `renderAvlBadge({ path })` | footer; `href` and `data-avl-endpoint` point at THIS page's `.agent` |
| HTTP `Link:` header | `renderAgentViewLinkHeader({ path })` | response headers (demonstrated in `samples/headers/`) |

### Code snippet

```ts
import {
  renderAgentViewHeadLinks,
  renderAgentViewBodyLink,
  renderAvlBadge,
  renderAgentViewLinkHeader,
} from "@frontier-infra/avl";

const path = "/docs/quick-start";

// In your HTML <head>:
renderAgentViewHeadLinks({ path });
// → <link rel="alternate" type="text/agent-view" href="/docs/quick-start.agent" ...>
// → <link rel="agent-view"  type="text/agent-view" href="/docs/quick-start.agent">

// In your HTML body (footer is fine):
renderAgentViewBodyLink({ path });
// → <a href="/docs/quick-start.agent" rel="alternate agent-view" ...>Agent view of this page</a>

renderAvlBadge({ path });
// → <div data-avl-endpoint="/docs/quick-start.agent" ...>...</div>

// Server-side (Express/Fastify/Next route handler/etc.):
res.setHeader("Link", renderAgentViewLinkHeader({ path }));
// → </docs/quick-start>; rel="canonical", </agent.txt>; rel="agent-manifest"; type="text/plain"
```

The example's `src/html.ts` shows the same pattern wired into a minimal HTML
template; `src/build.ts` invokes it once per page and writes the rendered
HTML into `dist/`.

## Run it

```bash
# from this directory
npm install
npm run build
```

Produces:

```
dist/
  docs/
    installation.html       # human page — head/body/badge wired up
    installation.agent
    quick-start.html
    quick-start.agent
    api-reference.html
    api-reference.agent
  headers/                  # mock HTTP response headers (one per page)
    docs-installation.txt
    docs-quick-start.txt
    docs-api-reference.txt
```

Checked-in expected output is in [`samples/`](samples/).

## What's here

| File | Purpose |
|---|---|
| `src/pages/installation.agent.ts` | Getting Started / Installation |
| `src/pages/quick-start.agent.ts` | Getting Started / Quick Start |
| `src/pages/api-reference.agent.ts` | Reference / API Reference |
| `src/html.ts` | Minimal HTML page renderer — wires up the 3 in-body discovery helpers |
| `src/build.ts` | Build entrypoint — emits HTML, `.agent`, and headers samples |
| `samples/` | Checked-in expected output, including `samples/headers/` |

## Why this example exists

Docs sites are the highest-leverage place to ship AVL early: the content is already written, already structured (frontmatter), and consumed almost entirely by programmatic readers (search indexers, AI assistants, code-example extractors). A static docs generator that emits `.agent` files alongside HTML is a very small delta and an outsized unlock — and adding the four discovery layers to every doc page means the agent indexers don't have to guess at URL conventions to find the companion view.
