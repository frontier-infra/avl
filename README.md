# AVL — Agent View Layer

[![npm version](https://img.shields.io/npm/v/@frontier-infra/avl?style=flat-square&color=0e7c2e)](https://www.npmjs.com/package/@frontier-infra/avl)
[![npm downloads](https://img.shields.io/npm/dm/@frontier-infra/avl?style=flat-square&color=333)](https://www.npmjs.com/package/@frontier-infra/avl)
[![bundle size](https://img.shields.io/bundlephobia/minzip/@frontier-infra/avl?style=flat-square&color=333&label=size)](https://bundlephobia.com/package/@frontier-infra/avl)
[![license](https://img.shields.io/npm/l/@frontier-infra/avl?style=flat-square&color=0e7c2e)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![zero dependencies](https://img.shields.io/badge/dependencies-0-brightgreen?style=flat-square)](package.json)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![ESM](https://img.shields.io/badge/ESM-supported?style=flat-square&color=blue)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
[![CJS](https://img.shields.io/badge/CJS-supported?style=flat-square&color=blue)](https://nodejs.org/api/modules.html)

[![AVL agent-ready](assets/avl-badge.svg)](https://ainode.dev/.agent)
[![first adopter](https://img.shields.io/badge/first%20adopter-AINode.dev-76b900?style=flat-square)](https://ainode.dev/.agent)
[![spec](https://img.shields.io/badge/spec-text%2Fagent--view%3B%20v1-333?style=flat-square)](specs/avl-agent-view-layer.md)
[![format](https://img.shields.io/badge/format-TOON-purple?style=flat-square)](specs/avl-agent-view-layer.md#34-toon-encoding-for-state)
[![conformance](https://img.shields.io/badge/conformance-L0--L3-0e7c2e?style=flat-square)](specs/avl-agent-view-layer.md#8-conformance-levels)
[![MCP](https://img.shields.io/badge/MCP-complementary-blue?style=flat-square)](specs/avl-thesis.md)
[![auth](https://img.shields.io/badge/auth-delegate%20not%20principal-orange?style=flat-square)](specs/avl-auth-thesis.md)

> **Every page your app serves to humans gets a parallel agent view.**
>
> Like i18n, but the target locale is "agent."

**Marketing page, blog post, product detail, authenticated dashboard.** Any page that means something to a human means something to an agent. AVL ships that meaning directly — so agents don't have to reverse-engineer it from pixels.

**Same data, different render. Token-efficient by design. Works for static sites, content sites, and authenticated apps.**

---

## Live in Production

[**AINode.dev**](https://ainode.dev) is the first production site shipping AVL. Try it right now:

```bash
# Agent view — structured product spec, features, hardware, actions
curl -s https://ainode.dev/.agent

# Content negotiation
curl -s -H "Accept: text/agent-view" https://ainode.dev/

# Discovery manifest
curl -s https://ainode.dev/agent.txt
```

![AVL agent-ready](assets/avl-badge.svg)

See [Signaling Agent-Readiness](#signaling-agent-readiness) below for how to add the badge to your site with structured metadata.

---

## AVL Works for Every Page Type

Before going deep, here's the shape of AVL across four common page types. Each example is the `agent.ts` that sits next to its `page.tsx` (or, for static sites, that feeds a build-time generator). See [`examples/`](examples/) for runnable versions of each.

### 1. Marketing / service-area page (static)

```ts
// examples/marketing-site/pages/austin.agent.ts
import { defineStaticAgentView } from "@frontier-infra/avl";

export default defineStaticAgentView({
  intent: {
    purpose: "Plumbing services in Austin, TX",
    audience: ["homeowner", "property-manager"],
    capability: ["call", "book", "quote"],
  },
  state: {
    city: "Austin, TX",
    services: ["leak repair", "water heater install", "drain cleaning"],
    service_area: ["78701", "78704", "78745"],
    hours: "24/7 emergency",
    starting_price_usd: 89,
  },
  actions: [
    { id: "call_dispatch", method: "GET", href: "tel:+15125550123" },
    { id: "request_quote", method: "GET", href: "mailto:quotes@example.com" },
    { id: "directions",    method: "GET", href: "https://maps.google.com/?q=..." },
  ],
});
```

### 2. Blog post (static)

```ts
// examples/blog/posts/hello-world.agent.ts
import { defineStaticAgentView } from "@frontier-infra/avl";

export default defineStaticAgentView({
  intent: {
    purpose: "Blog post: Hello, AVL",
    audience: ["reader", "developer"],
    capability: ["read", "share", "subscribe"],
  },
  state: {
    title: "Hello, AVL",
    author: "Jason Brashear",
    published: "2026-04-20",
    reading_time_min: 4,
    tags: ["avl", "agents", "announcement"],
  },
  actions: [
    { id: "subscribe", method: "POST", href: "/api/subscribe" },
    { id: "share",     method: "GET",  href: "https://twitter.com/intent/tweet?..." },
  ],
});
```

### 3. Product page (static or dynamic)

```ts
// examples/product-page/products/stainless-kettle.agent.ts
import { defineStaticAgentView } from "@frontier-infra/avl";

export default defineStaticAgentView({
  intent: {
    purpose: "Product detail — stainless steel electric kettle",
    audience: ["shopper"],
    capability: ["buy", "save", "share"],
  },
  state: {
    sku: "KTL-17-SS",
    name: "1.7L Electric Kettle — Stainless",
    price_usd: 49.0,
    variants: ["brushed", "polished"],
    inventory_count: 132,
    rating: 4.6,
  },
  actions: [
    { id: "add_to_cart",    method: "POST", href: "/api/cart/add" },
    { id: "save_for_later", method: "POST", href: "/api/wishlist/add" },
  ],
});
```

### 4. Authenticated dashboard (dynamic)

```ts
// app/dashboard/agent.ts
import { defineAgentView } from "@frontier-infra/avl";

export default defineAgentView({
  intent: {
    purpose: "Project dashboard for active accounts",
    audience: ["admin", "member"],
    capability: ["review", "manage", "export"],
  },
  state: async ({ user }) => ({
    projects: await getProjects({ userId: user.id }),
  }),
  actions: ({ user }) => [
    { id: "view_project", method: "GET", href: "/project/{id}.agent" },
    user.role === "admin"
      ? { id: "advance_stage", method: "POST", href: "/api/project/{id}/advance" }
      : null,
  ],
});
```

**Same six sections in every case.** Static or dynamic, public or authenticated — the shape of an agent view never changes. What changes is whether the content is known at build time or resolved per-request against a session.

---

## The Problem

Web applications are built for humans with eyeballs and mice. When an AI agent arrives, it reverse-engineers pixels: scraping HTML, parsing the DOM, inferring intent from button colors, reconstructing what the server already knew.

**This is backwards.**

The page already holds:
- The **structured data** it's rendering (post bodies, product specs, service lists, user's projects)
- The **reason the page exists** (sell a product, explain a service, triage cases)
- The **things a visitor can do from here** (call, buy, subscribe, advance)
- The **identity context**, when applicable (the authenticated user and their permissions)

Then it throws all of it away to render HTML. When an agent arrives, it spends tokens and inference cycles recovering an approximation of what was just discarded.

**AVL fills this gap.** For every page your application serves to humans — static marketing page, blog post, docs page, product detail, authenticated app view — it serves a parallel agent-native view at the same URL with an `.agent` suffix.

```
/about-us          → human view (HTML)
/about-us.agent    → agent view (text/agent-view; version=1)

/blog/hello-world        → human view
/blog/hello-world.agent  → agent view

/dashboard         → human view
/dashboard.agent   → agent view
```

The agent view is not a summary of the HTML. It's a **parallel rendering of the same server-side (or build-time) data**, optimized for a consumer that reads tokens instead of pixels.

---

## Why AVL Matters in 2026

Three things are true right now:

1. **AI agents are crossing from "read the web" to "use the web."** Every major lab has shipped agent capabilities. Agents are logging in, navigating, clicking buttons, submitting forms. The demand is here.

2. **Browser-use and computer-use agents are hitting their ceiling.** They're expensive, fragile, and break on redesigns. The industry is investing enormous resources in making agents better at reverse-engineering pixels. This is a local maximum, not a solution.

3. **Server-side rendering — and static site generation — are mainstream.** Next.js, Remix, SvelteKit, Nuxt, Astro, 11ty, Hugo. The data is already structured, already on the server (or on disk), already in the author's hands — right before it gets turned into pixels. The incremental cost of adding a second rendering target is low.

AVL doesn't require a new web. It requires the web that already exists to ship one more rendering target for a consumer that's already at the door.

---

## How AVL Differs from the Alternatives

| System | Granularity | Intent | Actions | Auth-scoped | Producer | Static-friendly |
|---|---|---|---|---|---|---|
| Scraping (Firecrawl, Jina) | Page | No | No | No | No | n/a |
| `llms.txt` | Site | Light | No | No | Yes | Yes |
| OpenAPI / GraphQL | API | No | Yes | Sometimes | Yes | No |
| Schema.org | DOM | SEO | No | No | Yes | Yes |
| ARIA | Element | A11y | Partial | No | Yes | Yes |
| MCP | Tool | Yes | Yes | Yes | Yes | No |
| **AVL** | **Page** | **Yes** | **Yes** | **When applicable** | **Yes** | **Yes** |

AVL's wedge: page-level, intent-rich, action-affordant, producer-owned — and equally at home on a static marketing site and an authenticated SaaS dashboard.

**MCP is the hands. AVL is the eyes.**

---

## The Six Sections

An AVL document at any `.agent` URL contains six sections. Every section is optional except `@meta` and `@intent`.

### `@meta`
Version, route, generation timestamp, TTL, and — if the page is authenticated — the identity the document was rendered for. Housekeeping.

### `@intent`
Why this page exists. Three fields: purpose, audience, capability. An agent reads this first and decides in four lines whether this page is relevant to its task. *This is the section scrapers can never recover* — DOM structure tells you what a page contains, not why it exists or who it's for.

### `@state`
**The structured data backing this page.** Encoded in TOON (Token-Oriented Object Notation) for 50–70% token savings over JSON. The shape of `@state` varies by page type:

| Page type | `@state` holds |
|---|---|
| Marketing / service area | Facts — city, services, prices, service area zip codes, hours |
| Blog post | Title, author, published date, tags, reading time |
| Docs page | Section, topic, last-updated, prev/next |
| Product page | SKU, price, variants, inventory count, rating |
| Authenticated dashboard | The user's projects, alerts, recent activity — RBAC-filtered |

For authenticated routes, `@state` is filtered server-side per role. For static pages, it's just facts — the same facts a human sees on the rendered page.

### `@actions`
**What the visitor can do from here.** Each action has an ID, an HTTP method, a URL, and an optional input schema. Actions aren't limited to in-app endpoints:

| Scheme | Example use |
|---|---|
| `tel:` | Call dispatch from a service-area page |
| `mailto:` | Request a quote, subscribe to a newsletter |
| External URL | "Get directions" to Google Maps, share to Twitter |
| Same-origin POST | Add-to-cart, advance-stage, submit-form |
| Same-origin GET | Navigate to a detail page's `.agent` view |

For authenticated routes, `@actions` are filtered per role — a read-only user simply doesn't see write-capable entries. The absence of an action *is* the authorization signal.

### `@context`
Narrative markdown capturing the "so what." What would an analyst, a copywriter, or an editor say about this page in one sentence? "3 active projects, 1 high-risk, deadline in 6 days." "Licensed master plumbers in Austin since 1998." "This post explains how AVL differs from MCP in 250 words."

### `@nav`
Where to go next. Self link, parents, peers, drilldown templates. The agent can walk the site's information architecture without parsing `<a>` tags.

---

## AVL for Static Sites

Not every page has an authenticated session behind it. Most pages on the public web — service-area pages, blog posts, doc sites, product catalogs, company pages, support articles — are **static content**. AVL's static support treats these as a first-class case, not an afterthought.

### `defineStaticAgentView`

The static primitive has the same six AVL sections as `defineAgentView` — but no request context, no auth, no RBAC filtering. Each field accepts a plain value or a zero-arg (possibly async) producer, so you can pull from markdown frontmatter, JSON, or an external content API at build time.

```ts
import { defineStaticAgentView } from "@frontier-infra/avl";

export default defineStaticAgentView({
  intent: {
    purpose: "About page for a licensed Austin plumber",
    audience: ["prospective-customer"],
    capability: ["call", "quote", "learn"],
  },
  state: {
    founded: 1998,
    city: "Austin, TX",
    credentials: ["Master Plumber #M-39214", "TCEQ Licensed"],
  },
  actions: [
    { id: "call_dispatch", method: "GET", href: "tel:+15125550123" },
    { id: "email_quote",   method: "GET", href: "mailto:quotes@example.com" },
  ],
  context: "Family-owned plumbing contractor serving greater Austin since 1998.",
});
```

### `generateStaticAgentViews`

A framework-agnostic build-time generator. Pass a list of `{ url, view }` pairs plus an output directory; the generator emits one `.agent` file per page alongside your static HTML:

```ts
import { generateStaticAgentViews } from "@frontier-infra/avl";
import home    from "./pages/index.agent";
import about   from "./pages/about.agent";
import austin  from "./pages/services/austin.agent";

await generateStaticAgentViews({
  outDir: "dist",
  pages: [
    { url: "/",                  view: home   },
    { url: "/about-us",          view: about  },
    { url: "/services/austin",   view: austin },
  ],
  // Optional: shared timestamp for reproducible builds
  generatedAt: process.env.BUILD_TIME ?? new Date().toISOString(),
});
```

Default output convention: `/about-us` → `about-us.agent` at the output-dir root (mirrors AVL's URL convention `/about-us` ↔ `/about-us.agent`). Override per-page (`outputPath`) or globally (`resolveOutputPath`) if your SSG prefers a different layout.

Runnable examples:

- [`examples/marketing-site`](examples/marketing-site) — 3-page service business
- [`examples/blog`](examples/blog) — blog index + articles
- [`examples/docs-site`](examples/docs-site) — a small docs set
- [`examples/product-page`](examples/product-page) — e-commerce product detail

---

## Getting Started

### Installation

```bash
npm install @frontier-infra/avl
```

### If your page is static

Author a `defineStaticAgentView` config per page (see [AVL for Static Sites](#avl-for-static-sites) above) and call `generateStaticAgentViews` as a final step of your build.

### If your page is authenticated / dynamic

Colocate an `agent.ts` next to your `page.tsx`:

```typescript
// app/dashboard/agent.ts
import { defineAgentView } from "@frontier-infra/avl";

export default defineAgentView({
  intent: {
    purpose: "Project dashboard for active accounts",
    audience: ["admin", "member"],
    capability: ["review", "manage", "export"],
  },
  state: async ({ user }) => ({
    projects: await getProjects({ userId: user.id }),
  }),
  actions: ({ user }) => [
    { id: "view_project", method: "GET", href: "/project/{id}.agent" },
    user.role === "admin"
      ? { id: "advance_stage", method: "POST", href: "/api/project/{id}/advance" }
      : null,
  ],
  context: ({ state }) =>
    `${state.projects.length} active projects.`,
  nav: {
    parents: ["/"],
    drilldown: "/project/{id}",
  },
  meta: { ttl: "30s" },
});
```

Wire the catch-all handler:

```typescript
// app/agent/[[...path]]/route.ts
import { createAgentViewHandler } from "@frontier-infra/avl/next";

export const GET = createAgentViewHandler({
  resolveSession: async (req) => {
    const session = await getServerSession(authOptions);
    if (!session?.user) return null;
    return {
      id: session.user.id,
      role: session.user.role,
      name: session.user.name,
    };
  },
  routes: [
    { pattern: "/dashboard", view: dashboardAgent },
    { pattern: "/project/:id", view: projectAgent },
  ],
});
```

That's it. Every page with an `agent.ts` now ships a parallel agent view. The framework handles routing, serialization, and caching.

---

## A Complete Example: Project Dashboard

This is what a fully rendered authenticated AVL document looks like — meta, intent, all six sections.

```
@meta
  v: 1
  route: /dashboard
  generated: 2026-04-16T14:02:00Z
  ttl: 30s
  auth: session(admin:42)

@intent
  purpose:    Active case dashboard
  audience:   attorney, paralegal
  capability: review, triage, advance

@state
  user{id,role,firm}: u-42,attorney,Smith Law
  journeys[3]{id,client,stage,deadline,risk}:
    J-101,Doe v Acme,Discovery,2026-05-01,low
    J-102,Roe v Beta,Settlement,2026-04-22,high
    J-103,Vega v Gamma,Treatment,2026-04-30,med

@actions
  - id: view_journey
    method: GET
    href: /journey/{id}.agent
  - id: advance_stage
    method: POST
    href: /api/journey/{id}/advance
    inputs[2]{name,type,required}:
      target_stage_id,string,true
      note,string,false

@context
  > 3 active matters. 1 high-risk.
  > J-102 (Settlement) — demand expires in 6 days.

@nav
  self:      /dashboard.agent
  parents:   [/]
  peers:     [/clients, /reports]
  drilldown: /journey/{id}
```

The static examples in [`examples/`](examples/) ship `.agent` files of the same shape — just with no `auth` line, and `@state` containing facts rather than per-user data.

---

## Conformance Levels

Start at L0. Ship value at every step.

| Level | Sections | Effort | Value |
|---|---|---|---|
| **L0** | `@meta`, `@intent` | Hours | Agents can triage routes — "Is this relevant?" |
| **L1** | L0 + `@state` | Days | Agents can read structured data without DOM parsing |
| **L2** | L1 + `@actions` | Days | Agents can operate — call, buy, submit forms |
| **L3** | L2 + `@nav`, `@context` | Weeks | Agents can traverse and understand the "so what" |

A static site can hit L3 in an afternoon. A medium-sized app can ship L0 across every route in a single day. No data integration, no action wiring for L0 — just a 5-line `agent.ts` per route declaring intent. Any AI agent can already scan the site and build a map of what every page does and who it's for.

---

## The Auth Model (When It Applies)

Public pages have no session — their `@meta` has no `auth` field, and their `@state`/`@actions` are whatever the static content dictates. No further discussion needed.

For **authenticated** pages, AVL's position is straightforward:

**The agent is not a new principal. It is a delegate of an existing human session.**

When a user authenticates, their session is valid for both the human view and the agent view. The agent inherits the user's identity, role, and permissions. It sees exactly what the user sees — no more, no less.

Three delivery mechanisms serve one identity model:

- **Cookie forwarding** — Browser-embedded agents (the cookie is already there)
- **Bearer token** — Local AI agents (user generates a scoped token)
- **OAuth delegation** — Third-party AI services (standard OAuth2 flow)

All three resolve to the same session. AVL doesn't define auth; it provides one contract:

```typescript
resolveSession: (req: Request) => Promise<AgentSession | null>
```

Your app implements it. AVL renders accordingly.

The invariant is **Surface Equivalence**: every `@state` field is visible to this user in the human UI, and every `@actions` entry corresponds to a UI affordance the user can invoke. If either fails, the AVL view is leaking.

---

## Why TOON?

AI agents are priced per token. `@state` uses **TOON** (Token-Oriented Object Notation) instead of JSON for a 50–70% reduction in serialization size.

```
// JSON: ~156 tokens
{"journeys":[{"id":"J-101","client":"Doe v Acme","stage":"Discovery"},
{"id":"J-102","client":"Roe v Beta","stage":"Settlement"}]}

// TOON: ~50 tokens
journeys[2]{id,client,stage}:
  J-101,Doe v Acme,Discovery
  J-102,Roe v Beta,Settlement
```

TOON is simple enough for any LLM to parse natively. The grammar is intentionally lean — no formal specification needed yet. Real-world use will guide evolution.

---

## Discovery

Three mechanisms, in priority order:

### URL Suffix (Primary)
```
/about-us.agent
/blog/hello-world.agent
/product/kettle-17-ss.agent
/dashboard.agent
```
Cacheable by any HTTP cache, shareable, debuggable in any browser, curl-able without special headers.

### Content Negotiation (Fallback)
```
GET /about-us
Accept: text/agent-view
```

### Site Manifest
```
GET /agent.txt

version: 1
discovery: [suffix, accept-header]
routes:
  - GET /about-us.agent
  - GET /blog/{slug}.agent
  - GET /dashboard.agent          # session required
```

---

## Signaling Agent-Readiness

AVL has three discovery layers (URL suffix, content negotiation, `agent.txt`). But there's a fourth — the HTML itself. When your site already knows it's agent-ready, it should ship that knowledge in the markup, not leave it implicit.

### The Badge Pattern

A badge serves three audiences from one HTML element:

| Audience | What they get |
|---|---|
| **Humans** | A visual indicator that the site is agent-ready |
| **AI crawlers** | Structured metadata in `alt` and `title` attributes |
| **Programmatic scrapers** | `data-*` attributes for machine-readable discovery |

### Basic Badge

```html
<a href="/.agent">
  <img
    src="https://raw.githubusercontent.com/frontier-infra/avl/main/assets/avl-badge.svg"
    alt="AVL agent-ready — This site ships native Agent View Layer documents at /.agent URLs."
    title="AVL (Agent View Layer) — Producer-side rendering for AI agents"
  />
</a>
```

### Full Semantic Badge (recommended)

Pack the `alt` text with structured discovery metadata. AI crawlers that parse alt text get everything they need without hitting another endpoint:

```html
<div
  role="group"
  aria-label="Platform capabilities"
  data-agent-discovery="true"
  data-avl-endpoint="/.agent"
  data-avl-manifest="/agent.txt"
  data-avl-package="@frontier-infra/avl"
>
  <a
    href="/.agent"
    title="AVL (Agent View Layer) — This site serves parallel structured views
           for AI agents at /.agent URLs. Same session, zero scraping."
  >
    <img
      src="https://raw.githubusercontent.com/frontier-infra/avl/main/assets/avl-badge.svg"
      alt="AVL agent-ready — This site ships native Agent View Layer documents
           at /.agent URLs. Structured @intent, @state, @actions, and @context
           for AI agents. Discovery: /agent.txt | npm: @frontier-infra/avl |
           Spec: https://github.com/frontier-infra/avl"
    />
    <span title="This site exposes structured agent views at *.agent URLs">
      agent-ready
    </span>
  </a>
</div>
```

### Why This Matters

The AVL philosophy is: **the site already knows what it means — ship that knowledge.** This applies at every layer:

- **Pages** know their intent, state, and actions → ship them via `.agent` views
- **The site** knows its routes and discovery model → ship them via `agent.txt`
- **The HTML** knows it's agent-ready → ship that via badges with structured alt text

A decorative badge that says "agent-ready" is a missed opportunity. The same badge with structured `alt`, `title`, and `data-*` attributes becomes a discovery mechanism. An AI crawler parsing the DOM finds the AVL endpoints without making a single extra request.

This is how [AINode.dev](https://ainode.dev) uses badges — each one carries the full tech stack metadata (AVL endpoints, cluster specs, inference engine, model support) in alt text that agents can parse directly.

---

## Documentation

- **[Full Specification](specs/avl-agent-view-layer.md)** — Format grammar, conformance levels, security model
- **[AVL Thesis](specs/avl-thesis.md)** — The problem, the solution, why now
- **[Auth Thesis](specs/avl-auth-thesis.md)** — Same session, different render. Zero new auth surface.
- **[Examples](examples/)** — Runnable demos across four page types

---

## Examples

| Example | What it shows |
|---|---|
| [`examples/marketing-site`](examples/marketing-site) | 3-page local-services site. `tel:`, `mailto:`, directions actions. |
| [`examples/blog`](examples/blog) | Blog index + posts. Subscribe, share actions. |
| [`examples/docs-site`](examples/docs-site) | A small docs set. Prev/next, edit-on-github. |
| [`examples/product-page`](examples/product-page) | E-commerce product detail. Add-to-cart, save-for-later. |
| [`examples/next-app`](examples/next-app) | Authenticated Next.js dashboard + detail views. |

Each static example ships its expected `.agent` output checked in under `samples/` — you can read them without running the build.

### Run the authenticated Next.js example

```bash
git clone https://github.com/frontier-infra/avl.git
cd avl
npm install && npm run build
cd examples/next-app
npm install
npm run dev
```

Then:

```bash
# Human views
open http://localhost:3002/dashboard
open http://localhost:3002/journey/J-101

# Agent views
curl -s http://localhost:3002/dashboard.agent
curl -s http://localhost:3002/journey/J-101.agent

# Content negotiation
curl -s -H "Accept: text/agent-view" http://localhost:3002/dashboard

# Site manifest
curl -s http://localhost:3002/agent.txt
```

### Run any of the static examples

```bash
cd examples/marketing-site    # or blog / docs-site / product-page
npm install
npm run build
ls dist/*.agent
```

---

## The Roadmap

- **v0.1** (current) — npm package, Next.js adapter, **static site generator**, format spec, example apps across four page types
- **v0.2** — MCP bridge adapter (derive MCP tools from `agent.ts` manifests), conformance test suite, auto-discovery of `agent.ts` files at build time
- **v0.3** — Streaming state, delta requests
- **v0.4** — Production caching, distributed rate limits
- **v1.0** — RFC + reference implementations for SvelteKit, Remix, Nuxt, Astro, Rails

---

## Contributing

We're looking for early adopters, framework implementations, and real-world feedback. If you're building an agent-driven application — or just a static marketing site that you'd like agents to understand natively — AVL is for you.

- **[Contributing Guide](CONTRIBUTING.md)** — How to get started
- **[Code of Conduct](CODE_OF_CONDUCT.md)** — Community standards
- **Open an issue** to discuss your use case
- **Submit a PR** for adapters, examples, or spec improvements

---

## License

[MIT](LICENSE)

---

## Relationship to Argent OS

AVL is the substrate that Argent OS uses to drive any host application. Where human users navigate via DOM and CSS, Argent OS navigates via AVL routes and action affordances. An app — or a static site — that ships AVL is a site Argent OS can drive without scraping, training, or human translation.

---

## The i18n Analogy

AVL mirrors how i18n works:

- **One data pipeline.** A locale parameter selects the rendering target.
- **Different output format.** Human view renders HTML. Agent view renders structured text.
- **Colocated authoring.** Developer writes `agent.ts` next to `page.tsx` (or next to the markdown file, or in the static-site config).
- **No duplication.** Both views reuse the same data fetchers or the same source content.
- **Easy to adopt.** Start with L0 (just intent). Expand incrementally.

The server already does this for every other non-default audience. AVL is just the agent locale.
