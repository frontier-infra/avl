# AVL — Agent View Layer

> A producer-side rendering layer for AI agents.
> Like i18n, but the target locale is "agent."

| Field | Value |
|---|---|
| Status | Draft v0.1 |
| Authors | Argent OS |
| Date | 2026-04-16 |
| Reference impl | Next.js 16 / App Router |
| Companion docs | `avl-thesis.md` (problem/solution thesis) |
| | `avl-auth-thesis.md` (authentication model) |

---

## 1. Vision

Web applications are designed for a single audience: humans with eyeballs and
mice. Every byte of HTML, every CSS rule, every interactive widget exists to
render meaning into a 2D visual surface. When AI agents arrive, they
reverse-engineer this. They scrape HTML, parse the DOM, infer intent from
layout cues, and try to reconstruct what a human would have understood at a
glance.

This is backwards. The page already knows what it means. The page already
knows what an authenticated user can do on it. We just don't ship that
knowledge — it leaks out as a side effect of rendering.

**AVL (Agent View Layer)** is a producer-side rendering layer for AI agents.
It sits next to the human view of every page and ships:

- **Why** this page exists (intent)
- **What's true** right now (state)
- **What you can do** from here (actions)
- **What it means** in narrative terms (context)
- **Where to go** next (nav)

It is to AI agents what i18n is to non-English speakers: a parallel,
first-class translation owned by the application, not the consumer.

---

## 2. The Wedge

AVL is differentiated from prior art on five dimensions.

| System | Direction | Granularity | Intent | Actions | Auth-scoped |
|---|---|---|---|---|---|
| Cloudflare AutoRAG / Jina Reader / Firecrawl | **Scraper** | Page | No | No | No |
| `llms.txt` | Producer | Site | Light | No | No |
| OpenAPI / GraphQL | Producer | API surface | No | Yes | Sometimes |
| Schema.org / microformats | Producer | DOM | SEO-flavored | No | No |
| ARIA | Producer | DOM elements | A11y | Limited | No |
| MCP | Producer | Tool surface | Yes | Yes | Yes |
| **AVL** | **Producer** | **Page** | **Yes** | **Yes** | **Yes** |

AVL's wedge:

1. **Producer-side, not scraper-side.** The application controls the
   rendering. No DOM-to-meaning inference required.
2. **Page-level, not site-level.** Every route ships its own AVL document —
   whether the page is a static marketing page, a blog post, a product
   detail, or an authenticated dashboard.
3. **Intent-rich.** Every document declares purpose, audience, capability.
   Agents decide if a page is relevant in 4 lines.
4. **Action-affordant.** Every document enumerates what's actionable from
   *this page*. For authenticated routes, filtered per role. For static
   routes, every listed affordance (tel:, mailto:, external URLs, POST
   endpoints) is available to any visitor.
5. **Authenticated by reuse *when applicable*.** For authenticated pages,
   AVL piggybacks on the host application's existing session model — no
   new bearer-token API key dance. For public/static pages, `@meta.auth`
   is omitted and the document reflects no identity context.

---

## 3. Format Specification

### 3.1 Document Structure

An AVL document is `text/agent-view; version=1`. It is composed of named
sections, each prefixed with `@`. Sections are conventionally ordered for
human readability but order-insignificant for parsing.

```
@meta
  v: 1
  route: /dashboard
  generated: 2026-04-16T14:02:00Z
  ttl: 30s
  auth: session(attorney:42)

@intent
  purpose:    Active case dashboard for personal-injury matters
  audience:   attorney, paralegal
  capability: review, triage, advance

@state
  user{id,role,firm}: u-42,attorney,Smith Law
  journeys[3]{id,client,stage,deadline,risk}:
    J-101,Doe v Acme,Discovery,2026-05-01,low
    J-102,Roe v Beta,Settlement,2026-04-22,high
    J-103,Vega v Gamma,Treatment,2026-04-30,med
  alerts[1]{kind,journey,note}:
    deadline,J-102,Demand expires in 6 days

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
  > 3 active matters in this attorney's load. 1 high-risk.
  > J-103 (Treatment) has missed 2 appointments — flag for paralegal.

@nav
  self:      /dashboard.agent
  parents:   [/]
  peers:     [/clients, /reports]
  drilldown: /journey/{id}
```

### 3.2 Required Sections

`@meta` and `@intent` are required. All other sections are optional. A read-only
list page may omit `@actions`. A pure narrative page may omit `@state`.

### 3.3 `@meta` Fields

| Field | Required | Description |
|---|---|---|
| `v` | Yes | Format version (currently `1`) |
| `route` | Yes | The canonical route path |
| `generated` | Yes | ISO 8601 timestamp of document generation |
| `status` | No | HTTP-analogous status code. Omit for `200` (success). |
| `ttl` | No | Cache lifetime hint (e.g., `30s`, `5m`) |
| `auth` | No | Informational rendering identity (e.g., `session(admin:42)`) |
| `redacted` | No | Array of field paths excluded from `@state` |

**Status codes:**

| Status | When |
|---|---|
| *(omitted)* / `200` | Normal successful render |
| `401` | No valid session — authentication required |
| `403` | Session valid but user lacks permission for this route |
| `404` | No agent view registered for this route |

Error responses (401, 403, 404) SHOULD include `@meta` and `@intent` only.
The `@intent.purpose` field describes the error condition.

### 3.4 TOON Encoding for `@state`

The `@state` section uses **TOON** (Token-Oriented Object Notation) for tabular
data. TOON is roughly 50–70% more token-efficient than equivalent JSON.

**Scalar:**
```
key: value
```

**Object (inline):**
```
user{id,role}: 42,attorney
```

**Array of scalars:**
```
ids[3]: J-101, J-102, J-103
```

**Array of objects (tabular):**
```
journeys[3]{id,client,stage}:
  J-101,Doe v Acme,Discovery
  J-102,Roe v Beta,Settlement
  J-103,Vega v Gamma,Treatment
```

**Nested object:**
```
config:
  theme: dark
  notifications:
    email: true
    sms: false
```

**Boolean / number scalars:**
```
active: true
retry_count: 3
score: 0.87
```

**Quoting:** Strings containing `"`, `,`, or newlines must be double-quoted.
Within quoted strings, `"` is escaped as `\"` and `\` as `\\`.

**Null:** The literal `~`.

**Dates:** ISO 8601.

### 3.5 Markdown for `@context`

`@context` is GitHub-flavored Markdown, blockquote-prefixed (`> `). Used for:

- Narrative summaries an analyst would write
- Anomaly callouts ("missed 2 appointments — flag for paralegal")
- Cross-page reasoning ("This client's case load is unusually high…")

This is the section that captures the "so what" — the layer humans add when
explaining what the data means to a colleague.

### 3.6 Action Schema

Each action declares a callable affordance:

```
- id: <stable-action-id>
  method: GET | POST | PUT | PATCH | DELETE
  href: <relative-url, may include {param} placeholders>
  inputs[N]{name,type,required}:
    <name>,<type>,<required>
  needs_role: <role>          # optional, informational
```

`href` may use `{param}` placeholders matching state fields or route params.

### 3.7 Navigation Graph

```
@nav
  self:      /dashboard.agent
  parents:   [/]
  peers:     [/clients, /reports]
  drilldown: /journey/{id}
```

- `self` — the canonical AVL URL for this page
- `parents` — ancestors in the app hierarchy
- `peers` — sibling routes the agent might want to visit next
- `drilldown` — template for entering a sub-resource

---

## 4. Discovery

Three layers, in priority order.

### 4.1 URL Suffix (preferred)

Append `.agent` to any path:

- `/dashboard` → `/dashboard.agent`
- `/journey/J-101` → `/journey/J-101.agent`

Properties:

- Cacheable by any HTTP cache (URL is the cache key)
- Shareable (just paste the URL)
- Debuggable in any browser
- No client capability negotiation needed

### 4.2 Content Negotiation

Same URL, with the `Accept` header:

```
GET /dashboard
Accept: text/agent-view
```

Server-side middleware rewrites internally to the AVL runtime. Useful for
agent clients that prefer single-URL semantics.

### 4.3 Site Manifest at `/agent.txt`

Like `robots.txt` but for agents. Lists the discoverable AVL routes,
auth model, and supported discovery mechanisms.

```
version: 1
content-type: text/agent-view; version=1
discovery: [suffix, accept-header]
session:
  mechanisms: [cookie, bearer]
  cookie: session_token
  bearer_prefix: Bearer
routes:
  - GET /dashboard.agent
  - GET /journey/{id}.agent
```

---

## 5. Authentication

> Full argument: `avl-auth-thesis.md`

### 5.1 Core Principle — Delegate, Not Principal

The AI agent is not a new identity. It is a delegate of an existing human
session. The agent inherits the user's role, permissions, and data access.
It sees exactly what the user sees — no more, no less.

AVL inherits the host application's existing session model. No new auth
surface. No new token format. The host app already solved authentication;
AVL provides one contract:

```typescript
resolveSession: (req: Request) => Promise<AgentSession | null>
```

The host implements this function. AVL calls it and renders accordingly.

### 5.2 Delegation Mechanisms

Three delivery mechanisms serve one identity model:

| Mechanism | When | How |
|---|---|---|
| **Cookie** | Browser-embedded agents | Cookie is already present on the request |
| **Bearer token** | Local AI, CLI tools, MCP clients | `Authorization: Bearer <token>` — host resolves to same session |
| **OAuth** | Third-party AI services | Standard OAuth2 delegation flow |

All three resolve to the same `AgentSession`. The delivery mechanism
varies; the security invariant does not.

### 5.3 Surface Equivalence

The security invariant (see also §10.5):

- Every `@state` field is visible to this user in the human UI
- Every `@actions` entry corresponds to a UI affordance the user can invoke

If either fails, the AVL view is leaking. This holds regardless of which
delegation mechanism delivered the session.

### 5.4 `@meta.auth`

The `auth` field in `@meta` is informational, not cryptographic:

```
@meta
  auth: session(attorney:42)
```

It tells the consuming agent "this document was rendered for this
principal." It does not prove it. It aids debugging and audit logging.

### 5.5 RBAC Filtering

`@actions` MUST be filtered server-side per role. A paralegal's
`/dashboard.agent` will NOT include `delegate(id, user_id)`. The absence
of an action IS the authorization signal — if it's not listed, the user
can't do it.

---

## 6. Authoring API

Colocate an `agent.ts` next to `page.tsx`. Import from the `@frontier-infra/avl` package:

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
  context: ({ state }) =>
    `${state.projects.length} active projects.`,
  nav: {
    parents: ["/"],
    drilldown: "/project/{id}",
  },
  meta: { ttl: "30s" },
});
```

Wire the catch-all route handler using the framework adapter:

```ts
// app/agent/[[...path]]/route.ts
import { createAgentViewHandler } from "@frontier-infra/avl/next";

export const GET = createAgentViewHandler({
  resolveSession: async (req) => {
    // Your auth logic — cookie, bearer token, OAuth
    const session = await getServerSession(authOptions);
    if (!session?.user) return null;
    return { id: session.user.id, role: session.user.role, name: session.user.name };
  },
});
```

The route handler resolves the path, matches it to a registered agent view,
calls `resolveSession`, renders the view, and serializes the response.
Production implementations may prefer build-time route discovery over
manual registry.

### 6.1 Static (Build-Time) Authoring

For pages whose content is known at build time — marketing pages, blog
posts, documentation, static product catalogs — use `defineStaticAgentView`
and the `generateStaticAgentViews` generator instead. No request context,
no `resolveSession`, no RBAC filtering; `@meta.auth` is omitted.

```ts
import {
  defineStaticAgentView,
  generateStaticAgentViews,
} from "@frontier-infra/avl";

const aboutPage = defineStaticAgentView({
  intent: {
    purpose: "Company about page",
    audience: ["visitor"],
    capability: ["learn", "contact"],
  },
  state: { founded: 1998, city: "Austin, TX" },
  actions: [
    { id: "email_contact", method: "GET", href: "mailto:hello@example.com" },
  ],
});

// In your build script:
await generateStaticAgentViews({
  outDir: "dist",
  pages: [{ url: "/about-us", view: aboutPage }],
});
```

The generator emits one `.agent` file per page into `outDir`, using the
default URL → path mapping (`/about-us` → `about-us.agent`). Per-page
`outputPath` and global `resolveOutputPath` options are available for
static-site generators that prefer a different file layout.

See §11.1 for a complete rendered static example.

---

## 7. Action Semantics

AVL `@actions` are **descriptive by default**. The agent calls them via
standard `fetch` + the existing session credential (cookie, bearer token,
or OAuth token — whichever mechanism delivered the session). AVL defines
no new dispatch protocol.

For applications that want native MCP integration (Claude Desktop, ChatGPT
custom GPTs), a future MCP bridge adapter (v0.2 roadmap) will generate an
MCP tool server from the same `agent.ts` manifests. **One source of truth,
two consumers.** MCP is the hands; AVL is the eyes.

---

## 8. Conformance Levels

| Level | Required sections |
|---|---|
| L0 | `@meta`, `@intent` |
| L1 | L0 + `@state` |
| L2 | L1 + `@actions` |
| L3 | L2 + `@nav` + `@context` |

Apps can ship L0 across every route in a day (just declare intent) and
incrementally upgrade routes that warrant deeper agent integration.

---

## 9. Versioning

`Content-Type: text/agent-view; version=1`

- Major version bumps: breaking format changes
- Section additions: non-breaking
- Section removals: require a major bump
- `@meta.v` MUST match the response Content-Type version

---

## 10. Security & Privacy

### 10.1 RBAC Filtering

`@actions` MUST be filtered server-side per user role. Same RBAC enforcement
as the parallel API. **The agent view never leaks affordances the human view
wouldn't.**

### 10.2 Redaction

Fields containing PII the user can't normally see in the human UI MUST NOT
appear in `@state`. The `@meta.redacted` field declares what's hidden:

```
@meta
  redacted: [client.ssn, client.dob, billing.account_number]
```

This is informational — the field SHOULD NOT be present in the document body.

### 10.3 Rate Limiting

AVL endpoints SHOULD share rate limits with the parallel API. Per-route
caching via `@meta.ttl` is encouraged.

### 10.4 Cross-Origin

AVL responses default to same-origin. CORS opt-in is per-application policy,
identical to the parallel API.

### 10.5 Surface Equivalence Test

Before shipping a route's AVL view, verify:

- Every `@state` field is visible to this user in the human UI
- Every `@actions` entry corresponds to a UI affordance the user can invoke

If either fails, the AVL view is leaking.

---

## 11. Examples

### 11.1 Static Marketing Page (Service Area)

A static, build-time-rendered page for a local service business. No session,
no RBAC — `@meta.auth` is omitted. Actions include non-HTTP schemes
(`tel:`, `mailto:`) and external URLs.

```
@meta
  v: 1
  route: /services/austin
  generated: 2026-04-20T09:00:00Z
  ttl: 1d

@intent
  purpose:    Plumbing services in Austin, TX
  audience:   homeowner, property-manager
  capability: call, book, quote

@state
  city: "Austin, TX"
  services[3]: leak repair, water heater install, drain cleaning
  service_area[3]: 78701, 78704, 78745
  hours: 24/7 emergency
  starting_price_usd: 89

@actions
  - id: call_dispatch
    method: GET
    href: tel:+15125550123
  - id: request_quote
    method: GET
    href: mailto:quotes@example.com
  - id: directions
    method: GET
    href: https://maps.google.com/?q=...

@context
  > Licensed master plumbers serving greater Austin since 1998.
  > 24/7 emergency dispatch. Starting from $89.

@nav
  self:    /services/austin.agent
  parents: [/services]
  peers:   [/services/round-rock, /services/pflugerville]
```

Authoring (see §6 for the authenticated equivalent):

```ts
import {
  defineStaticAgentView,
  generateStaticAgentViews,
} from "@frontier-infra/avl";

const austin = defineStaticAgentView({
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
  context: "Licensed master plumbers serving greater Austin since 1998.",
  meta: { ttl: "1d" },
});

await generateStaticAgentViews({
  outDir: "dist",
  pages: [{ url: "/services/austin", view: austin }],
});
```

### 11.2 Dashboard (Authenticated List)

See §3.1.

### 11.3 Detail Page

```
@meta
  v: 1
  route: /journey/J-101
  generated: 2026-04-16T14:02:00Z
  ttl: 60s
  auth: session(attorney:42)

@intent
  purpose:    Single-case detail and action surface
  audience:   attorney, paralegal
  capability: review, advance, annotate

@state
  journey{id,client,stage,opened,attorney,deadline,risk}:
    J-101,Doe v Acme,Discovery,2026-01-15,Sarah Kim,2026-05-01,low
  recent_activity[3]{at,actor,event}:
    2026-04-12T10:00Z,Sarah Kim,"Filed motion to compel"
    2026-04-10T16:30Z,System,"Stage advanced: Pleadings -> Discovery"
    2026-04-08T09:15Z,Mark Diaz,Note added

@actions
  - id: view_dashboard
    method: GET
    href: /dashboard.agent
  - id: advance_stage
    method: POST
    href: /api/journey/J-101/advance
    inputs[2]{name,type,required}:
      target_stage_id,string,true
      note,string,false
  - id: log_note
    method: POST
    href: /api/journey/J-101/note
    inputs[1]{name,type,required}:
      body,string,true

@context
  > Doe v Acme is in early discovery. Recent motion to compel filed
  > 4 days ago — opposing counsel response expected by 2026-04-26.
  > No outstanding alerts.

@nav
  self:    /journey/J-101.agent
  parents: [/dashboard]
  peers:   [/journey/J-102, /journey/J-103]
```

### 11.4 Empty / 404

```
@meta
  v: 1
  status: 404
  route: /journey/J-999

@intent
  purpose:    No agent view registered for this route
  audience:   any
  capability: none
```

---

## 12. Open Questions

1. **TOON formal grammar.** TOON is informal. Do we publish a strict subset
   as part of AVL, or stay loose and version with TOON's evolution?
2. **Action input validation.** Should action inputs reference Zod / JSON
   Schema, or stay flat name/type/required?
3. **Streaming.** Should AVL support SSE for long-running state computations?
4. **Caching layer.** Page-level vs. shared sub-tree caching (the `journeys`
   table on `/dashboard` and `/clients` is the same query)?
5. **MCP bridge granularity.** One MCP server per app, or one per route group?
6. **Diffs.** Should agents request `?since=<timestamp>` to get deltas only?
7. **Write actions.** Do POST actions echo back an updated AVL document, or
   return a separate result envelope?
8. **Personalization vs. canonicalization.** A page rendered for two
   different users produces two different AVL documents. Recommended
   approach: use `Vary: Authorization` (or a session-hash header) so
   HTTP caches key on identity. Conservative `@meta.ttl` keeps stale
   windows short. Public/anonymous routes (no session) can use shared
   caches freely. ETags per (route + user) enable conditional requests
   for frequently polled routes.

---

## 13. Roadmap

| Version | Scope |
|---|---|
| v0.1 (current) | npm package (`@frontier-infra/avl`), Next.js adapter (`@frontier-infra/avl/next`), format spec, example app |
| v0.2 | **MCP bridge adapter** — derive MCP tools from the same `agent.ts` manifests. Highest-leverage next step: apps get "eyes" (AVL) and "hands" (MCP) from one source of truth. Also: conformance test suite, build-time route discovery. |
| v0.3 | Streaming state (SSE for long-running computations), delta requests (`?since=`), diff format |
| v0.4 | Production caching (`Vary` + ETag), distributed rate limits, signed AVL docs |
| v1.0 | RFC + reference implementations for SvelteKit, Remix, Nuxt, Rails |

---

## 14. Naming

Working name: **AVL — Agent View Layer**.

Alternates considered:
- **AML** (Agent Markup Layer) — suggests purely declarative; rejected
- **AFV** (Agent-First View) — fine but less descriptive
- **`.agent`** (the URL convention is the brand) — strong but unsearchable

AVL wins on three counts: it's the i18n analogy made literal (a "view layer"
parallel to the human one), it's pronounceable as a word, and it's
unambiguous when paired with "agent."

---

## 15. Relationship to Argent OS

AVL is the substrate Argent OS uses to drive any host application. Where
human users navigate via DOM and CSS, Argent OS navigates via AVL routes
and action affordances. **An app that ships AVL is an app Argent OS can
drive without scraping, training, or human-in-the-loop translation.**

This document defines the contract between the two halves.
