# AVL — Agent View Layer

> A producer-side rendering layer for AI agents.
> 
> Like i18n, but the target locale is "agent."

**The page already knows what it means. We just don't ship that knowledge.**

---

## The Problem

Web applications are built for humans with eyeballs and mice. When an AI agent arrives, it reverse-engineers pixels: scraping HTML, parsing the DOM, inferring intent from button colors, reconstructing what the server already knew.

**This is backwards.**

The server holds:
- The authenticated user and their permissions
- The structured data for this page
- The business logic that decides what matters
- The actions the user can take

Then it throws all of it away to render HTML. When an agent arrives, it spends tokens and inference cycles recovering an approximation of what was just discarded.

**AVL fills this gap.** For every page your application serves to humans, it serves a parallel agent-native view at the same URL with an `.agent` suffix.

```
/dashboard       → human view (HTML)
/dashboard.agent → agent view (text/agent-view; version=1)
```

The agent view is not a summary of the HTML. It's a **parallel rendering of the same server-side data**, optimized for a consumer that reads tokens instead of pixels.

---

## Why AVL Matters in 2026

Three things are true right now:

1. **AI agents are crossing from "read the web" to "use the web."** Every major lab has shipped agent capabilities. Agents are logging in, navigating, clicking buttons, and submitting forms. The demand is here.

2. **Browser-use and computer-use agents are hitting their ceiling.** They're expensive, fragile, and break on redesigns. The industry is investing enormous resources in making agents better at reverse-engineering pixels. This is a local maximum, not a solution.

3. **Server-side rendering is mainstream.** Next.js, Remix, SvelteKit, Nuxt. The data is already on the server, already structured, already authenticated — right before it gets turned into pixels. The incremental cost of adding a second rendering target is low.

AVL doesn't require a new web. It requires the web that already exists to ship one more rendering target for a consumer that's already at the door.

---

## How AVL Differs from the Alternatives

| System | Granularity | Intent | Actions | Auth-scoped | Producer |
|---|---|---|---|---|---|
| Scraping (Firecrawl, Jina) | Page | No | No | No | No |
| `llms.txt` | Site | Light | No | No | Yes |
| OpenAPI / GraphQL | API | No | Yes | Sometimes | Yes |
| Schema.org | DOM | SEO | No | No | Yes |
| ARIA | Element | A11y | Partial | No | Yes |
| MCP | Tool | Yes | Yes | Yes | Yes |
| **AVL** | **Page** | **Yes** | **Yes** | **Yes** | **Yes** |

AVL's wedge: page-level, intent-rich, action-affordant, authenticated, and producer-owned.

**MCP is the hands. AVL is the eyes.**

---

## The Architecture

An AVL document at `/dashboard.agent` contains six sections:

### `@meta`
Version, route, generation timestamp, TTL, auth identity. Housekeeping.

### `@intent`
Why this page exists. Three fields: purpose, audience, capability. An agent reads this first and decides in 4 lines whether this page is relevant to its task.

### `@state`
The data on this page, encoded in TOON (Token-Oriented Object Notation). Same data the human view renders, in a token-efficient structured format. RBAC-filtered: the agent only sees fields the user can see.

### `@actions`
What the user can do from here. Each action has an ID, an HTTP method, a URL, and optional input schema. Server-rendered per role — a read-only user sees no POST actions.

### `@context`
Narrative markdown capturing what an analyst would say about this page. "3 active projects, 1 high-risk, deadline in 6 days."

### `@nav`
Where to go next. Self link, parents, peers, drilldown templates.

---

## Example: Project Dashboard

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

---

## Getting Started

### Installation

```bash
npm install @frontier-infra/avl
```

### Authoring an Agent View

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

### Wiring the Catch-All Handler

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

## Conformance Levels

Start at L0. Ship value at every step.

| Level | Sections | Effort | Value |
|---|---|---|---|
| **L0** | `@meta`, `@intent` | Hours | Agents can triage routes — "Is this relevant?" |
| **L1** | L0 + `@state` | Days | Agents can read structured data without DOM parsing |
| **L2** | L1 + `@actions` | Days | Agents can operate — click buttons, submit forms |
| **L3** | L2 + `@nav`, `@context` | Weeks | Agents can traverse and understand the "so what" |

A team can ship L0 across every route in a single day. Each route gets a 5-line `agent.ts` declaring its intent. No data integration, no action wiring. And already, any AI agent can scan the site and build a map of what every page does and who it's for.

---

## The Auth Model

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
/dashboard.agent
```
Cacheable by any HTTP cache, shareable, debuggable in any browser, curl-able without special headers.

### Content Negotiation (Fallback)
```
GET /dashboard
Accept: text/agent-view
```

### Site Manifest
```
GET /agent.txt

version: 1
discovery: [suffix, accept-header]
session:
  mechanisms: [cookie, bearer]
routes:
  - GET /dashboard.agent
  - GET /journey/{id}.agent
```

---

## Documentation

- **[Full Specification](specs/avl-agent-view-layer.md)** — Format grammar, conformance levels, security model
- **[AVL Thesis](specs/avl-thesis.md)** — The problem, the solution, why now
- **[Auth Thesis](specs/avl-auth-thesis.md)** — Same session, different render. Zero new auth surface.
- **[Examples](examples/)** — Working Next.js demo app

---

## Run the Example App

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

---

## The Roadmap

- **v0.1** (current) — npm package, Next.js adapter, format spec, example app
- **v0.2** — MCP bridge adapter (derive MCP tools from `agent.ts` manifests), conformance test suite
- **v0.3** — Streaming state, delta requests
- **v0.4** — Production caching, distributed rate limits
- **v1.0** — RFC + reference implementations for SvelteKit, Remix, Nuxt, Rails

---

## Contributing

We're looking for early adopters, framework implementations, and real-world feedback. If you're building an agent-driven application, AVL is for you.

- **[Contributing Guide](CONTRIBUTING.md)** — How to get started
- **[Code of Conduct](CODE_OF_CONDUCT.md)** — Community standards
- **Open an issue** to discuss your use case
- **Submit a PR** for adapters, examples, or spec improvements

---

## License

[MIT](LICENSE)

---

## Relationship to Argent OS

AVL is the substrate that Argent OS uses to drive any host application. Where human users navigate via DOM and CSS, Argent OS navigates via AVL routes and action affordances. An app that ships AVL is an app Argent OS can drive without scraping, training, or human translation.

---

## The i18n Analogy

AVL mirrors how i18n works:

- **One data pipeline.** A locale parameter selects the rendering target.
- **Different output format.** Human view renders HTML. Agent view renders structured text.
- **Colocated authoring.** Developer writes `agent.ts` next to `page.tsx`.
- **No duplication.** Both views reuse the same data fetchers, auth context, and RBAC rules.
- **Easy to adopt.** Start with L0 (just intent). Expand incrementally.

The server already does this for every other non-default audience. AVL is just the agent locale.
