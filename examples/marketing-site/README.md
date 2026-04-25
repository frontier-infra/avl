# examples/marketing-site

A tiny static site for a fictional local electrician ("Lonestar Electric"), showing how AVL ships a parallel agent view for marketing pages — **and how to make those agent views discoverable from every human page**.

## What this shows

- `defineStaticAgentView` authoring for **3 different page types** a marketing site typically has (home, about, service area)
- `generateStaticAgentViews` emitting one `.agent` file per URL
- `@state` as **facts** — city, services, zip codes, response time, credentials — not user data
- `@actions` with **real-world schemes**: `tel:`, `mailto:`, and external booking / maps URLs — no authenticated POST endpoints required
- Nested URL → nested output path (`/services/austin` → `services/austin.agent`)
- **Per-page discovery** — every HTML page wires up the four discovery layers (head link, body link, page-specific badge, `Link:` header)

## The four discovery layers (post-`2f7b046`)

AVL commit [`2f7b046`](https://github.com/frontier-infra/avl/commit/2f7b046) made companion discovery **explicit and per-page**. Fetcher-gated agents (Anthropic's `web_fetch`, OpenAI's browsing tool, etc.) can't be trusted to infer that `/about-us` has a companion at `/about-us.agent` — the site has to declare it, and it has to declare it on every page.

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

const path = "/about-us";

// In your HTML <head>:
renderAgentViewHeadLinks({ path });
// → <link rel="alternate" type="text/agent-view" href="/about-us.agent" ...>
// → <link rel="agent-view"  type="text/agent-view" href="/about-us.agent">

// In your HTML body (footer is fine):
renderAgentViewBodyLink({ path });
// → <a href="/about-us.agent" rel="alternate agent-view" ...>Agent view of this page</a>

renderAvlBadge({ path });
// → <div data-avl-endpoint="/about-us.agent" ...>...</div>

// Server-side (Express/Fastify/etc.):
res.setHeader("Link", renderAgentViewLinkHeader({ path }));
// → </about-us>; rel="canonical", </agent.txt>; rel="agent-manifest"; type="text/plain"
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
  index.html              # human page — head/body/badge wired up
  index.agent             # AVL companion view
  about-us.html
  about-us.agent
  services/
    austin.html
    austin.agent
  headers/                # mock HTTP response headers (one per page)
    index.txt
    about-us.txt
    services-austin.txt
```

Checked-in expected output is in [`samples/`](samples/) — you can read them without running the build.

Serve them locally with any static file server:

```bash
npx serve dist
# then
curl -s http://localhost:3000/index.agent
curl -s http://localhost:3000/about-us.agent
curl -s http://localhost:3000/services/austin.agent

# Or hit the human pages and see the discovery markup:
curl -s http://localhost:3000/about-us.html | grep -E 'agent-view|avl-'
```

A real server fronting these pages must also emit the `Link:` header from
`samples/headers/<page>.txt` — `npx serve` won't do that for you. Configure
your CDN / reverse proxy to set the header per-route, or use
`renderAgentViewLinkHeader` in your app server middleware.

## What's here

| File | Purpose |
|---|---|
| `src/index.agent.ts` | Home — tagline, services, service area, starting price |
| `src/about.agent.ts` | About — founding date, owner, credentials, certifications |
| `src/services/austin.agent.ts` | Service area — Austin, zip codes, response time |
| `src/html.ts` | Minimal HTML page renderer — wires up the 3 in-body discovery helpers |
| `src/build.ts` | Build entrypoint — emits HTML, `.agent`, and headers samples |
| `samples/` | Checked-in expected output, including `samples/headers/` |

## Why this example exists

Static marketing sites are the largest category of the public web — and the most obvious "every page means something to an agent" case. A site like this one has:

- **Facts it knows at build time** (service area, prices, credentials)
- **Actions it wants agents to take** (call dispatch, request a quote, get directions)
- **No authentication** — there's no session, no RBAC, no per-user state

AVL handles this natively. No server runtime required; a plain build step emits `.agent` files alongside your HTML — and as of `2f7b046`, the HTML itself ships the discovery metadata so fetcher-gated agents can find the companion view without guessing.
