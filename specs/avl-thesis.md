# AVL Thesis — The Case for Producer-Side Agent Rendering

> Every web page already knows what it means. We just don't ship that knowledge.

| Field | Value |
|---|---|
| Status | Draft v0.1 |
| Authors | Argent OS |
| Date | 2026-04-16 |
| Companion | `avl-agent-view-layer.md` (format spec) |
| | `avl-auth-thesis.md` (auth model) |

---

## 1. The Problem

A web page is a lossy compression of meaning into pixels.

The server knows the dashboard has 3 active projects, that 1 is high-risk,
that the authenticated user is an admin who can advance any of them, that
the deadline on Project B is 6 days away, and that the logical next step is
to drill into the high-risk item. It knows all of this *before* it renders
a single `<div>`.

Then it throws it away. It converts the structured knowledge into HTML —
layout, color, typography, interactive widgets — optimized for a human with
a mouse and a 2D visual cortex. The intent, the permissions, the
affordances, the "so what" — all of it becomes implicit. Encoded in
position, color, button labels, and DOM hierarchy.

When an AI agent arrives, it must reverse-engineer everything the server
already knew. It parses the DOM. It infers that a red badge means urgency.
It guesses that a disabled button means no permission. It reconstructs
tabular data from `<tr>` elements that were destructured from the same
database rows the server had in hand moments earlier.

**This is the fundamental waste.** The application destroys structured
knowledge during rendering, then the AI agent spends tokens and inference
cycles recovering an approximation of it. Both sides do unnecessary work.
Neither side is happy with the result.

And it gets worse. The DOM is a rendering artifact, not a semantic
contract. Redesigns break scrapers. A/B tests break scrapers. CSS changes
that move a button break scrapers. The AI agent is coupled to an
implementation detail — the visual layout — instead of the application's
actual data model.

Every major AI lab is investing in "browser use" and "computer use" — the
ability for agents to navigate web applications by looking at screenshots,
clicking buttons, and reading DOM. These are sophisticated, expensive
systems that solve the wrong problem. They make AI agents better at
recovering meaning from pixels. The right question is: **why are we
rendering meaning into pixels for a consumer that doesn't have eyes?**

---

## 2. Why the Alternatives Miss

The industry knows the scraping model is broken. Several alternatives
exist. Each solves part of the problem while leaving a critical dimension
unaddressed.

### 2.1 Scraping (Firecrawl, Jina Reader, Cloudflare AutoRAG)

The scraper sits between the HTML and the agent, extracting text, markdown,
or structured data from the rendered page.

**What it gets right:** Works today, on any site, without the site's
cooperation.

**What it misses:** Intent. The scraper can extract that a page shows 3
projects in a table. It cannot extract *why this page exists*, *who it's
for*, or *what the user should do next*. It also cannot extract permission
boundaries — whether the agent's user is allowed to press the "Advance"
button or just look at it. And it breaks when the markup changes.

Scraping is the duct-tape era. It's how REST APIs started too — screen-
scraping mainframe terminals until someone said "just return the data."

### 2.2 `llms.txt`

A site-level manifest that tells AI agents what the site is about. One
file, one description, maybe a sitemap.

**What it gets right:** Simple. Low effort to ship. Good for static
documentation sites.

**What it misses:** `llms.txt` is site-level, not page-level. It can tell
an agent "this is a project management app." It cannot tell an agent
"the dashboard shows 3 projects for this user, 1 is high-risk, and the
deadline on Project B is Thursday." There is no per-route state, no
per-user rendering, no actions. It is a brochure, not a view.

### 2.3 OpenAPI / GraphQL

API-surface documentation. Describes endpoints, parameters, schemas,
return types.

**What it gets right:** Machine-readable, well-tooled, great for building
integrations.

**What it misses:** The API surface is not the page surface. OpenAPI can
describe a `GET /api/projects` endpoint that returns a JSON array. It
cannot describe "what does the dashboard *mean* to this user right now?"
It has no concept of page-level intent, no narrative context, no
navigation graph. The agent gets raw data access but no page-level
understanding. It's like giving someone a database connection instead of a
report.

### 2.4 MCP (Model Context Protocol)

Tool-surface protocol. An application exposes discrete tools — functions an
agent can call.

**What it gets right:** Powerful. Standardized. Agents can take real
actions through MCP tools.

**What it misses:** MCP is tool-shaped, not page-shaped. It maps well to
"do this action" but not to "what is this page showing me right now?" An
MCP server doesn't have a concept of "the dashboard" — it has tools like
`list_projects()` and `advance_project(id)`. The agent can call them, but
there's no page-level state, no navigation graph, no "here's what this
screen means." MCP and AVL are complementary, not competitive. MCP is the
hands. AVL is the eyes.

### 2.5 Schema.org / Microformats

Structured data embedded in HTML. Used by search engines for rich results.

**What it gets right:** Standardized vocabulary, wide adoption, good
tooling.

**What it misses:** Schema.org is SEO-flavored, not agent-flavored. It
describes what things *are* (this is a Product, this is a Person) but not
what you can *do* with them. It has no concept of authenticated state —
a Schema.org Product annotation is the same for every visitor. No
per-user permissions, no scoped actions, no intent. Built for a search
engine that indexes public pages, not an agent that operates within an
authenticated session.

### 2.6 ARIA

Accessibility annotations on DOM elements. Tells screen readers what
interactive elements do.

**What it gets right:** Close to the right idea — metadata that describes
UI affordances for a non-visual consumer.

**What it misses:** ARIA is element-level, not page-level. It annotates
individual widgets within a visual layout. An agent consuming ARIA still
has to parse the DOM, understand the layout, and reconstruct page-level
meaning from scattered annotations. It also carries no state data — ARIA
describes the *controls*, not the *content* they operate on.

### 2.7 The Gap

| | Data | Intent | Actions | Auth-scoped | Page-level |
|---|---|---|---|---|---|
| Scraping | Yes | No | No | No | Yes |
| `llms.txt` | No | Light | No | No | No (site) |
| OpenAPI | Yes | No | Yes | Sometimes | No (API) |
| MCP | Yes | Yes | Yes | Yes | No (tool) |
| Schema.org | Yes | No | No | No | Yes |
| ARIA | No | No | Partial | No | No (element) |
| **AVL** | **Yes** | **Yes** | **Yes** | **Yes** | **Yes** |

AVL is the only approach that is all five: data-rich, intent-declaring,
action-affordant, auth-scoped, and page-level. Not because the others are
bad — they solve real problems. AVL fills the specific gap of "what does
this page mean to this authenticated user, and what can they do from here?"

---

## 3. The Insight

**The page already knows what it means.**

Before `renderToHTML()` is called, the server has:
- The authenticated user and their role
- The data fetched for this specific page
- The actions this user is permitted to take
- The navigation context (where they came from, where they can go)
- The business logic that decides what matters ("1 high-risk project")

All of this is available as structured data on the server, in the instant
before rendering. Rendering for a human destroys the structure and converts
it to visual layout. Rendering for an agent preserves the structure and
converts it to a semantic document.

This is not a new data pipeline. It is a second rendering target for data
the application already has in hand. Like i18n, which doesn't create new
content — it renders existing content for a different audience. The
agent locale renders the same page for a consumer that reads tokens
instead of pixels.

---

## 4. The Solution

AVL (Agent View Layer) is a producer-side rendering layer for AI agents.
For every page an application serves to humans, it can serve a parallel
agent-native view at the same URL with an `.agent` suffix.

```
/dashboard       → human view (HTML)
/dashboard.agent → agent view (text/agent-view)
```

The agent view is not a summary of the HTML. It is a parallel rendering of
the same server-side data, optimized for an AI consumer.

### 4.1 What the Agent View Contains

Six sections, each serving a distinct purpose:

**`@meta`** — Version, route, generation timestamp, TTL, auth identity.
Housekeeping. Lets the agent know when the data was rendered and how long
to cache it.

**`@intent`** — Why this page exists. Three fields: purpose, audience,
capability. An agent reads this first and decides in 4 lines whether this
page is relevant to its task. This is the section scrapers can never
recover — because the DOM doesn't say why it exists, only what it contains.

**`@state`** — The data on this page, encoded in TOON (see §5.1). Same
data the human view renders, in a token-efficient structured format. RBAC-
filtered: the agent only sees fields the user can see.

**`@actions`** — What the user can do from here. Each action has an ID, an
HTTP method, a URL, and optional input schema. Server-rendered per role —
a read-only user sees no POST actions. This is the section that turns the
agent from a reader into an operator.

**`@context`** — The "so what." Narrative markdown that captures what an
analyst would say about this page. "3 active projects, 1 high-risk,
deadline in 6 days." The data is in `@state`; the meaning is in `@context`.

**`@nav`** — Where to go next. Self link, parents, peers, drilldown
templates. The agent can traverse the app's information architecture
without guessing from HTML links.

### 4.2 The i18n Analogy Is Structural, Not Metaphorical

In an i18n system:
- The application has one data pipeline
- A locale parameter selects the rendering target
- Each locale produces a different output from the same data
- Adding a locale doesn't require rewriting the application
- Locales are colocated with the pages they translate

AVL works identically:
- The application has one data pipeline
- The consumer type (human/agent) selects the rendering target
- Each target produces a different output from the same data
- Adding agent views doesn't require rewriting the application
- Agent views are colocated with the pages they translate

The developer writes `agent.ts` next to `page.tsx`. Same directory. Same
data fetchers. Same auth context. Different output format.

```
app/dashboard/
  page.tsx    ← human locale
  agent.ts    ← agent locale
```

### 4.3 What Developer Integration Looks Like

```bash
npm install @frontier-infra/avl
```

```typescript
// app/dashboard/agent.ts
import { defineAgentView } from "@frontier-infra/avl";

export default defineAgentView({
  intent: {
    purpose: "Project dashboard",
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
import { createAgentViewHandler } from "@frontier-infra/avl/next";

export const GET = createAgentViewHandler({
  resolveSession: async (req) => getSessionFromCookie(req),
});
```

Two files. Every page that has an `agent.ts` now ships a parallel agent
view. The `defineAgentView` helper is declarative — intent, state, actions,
context, nav — and the framework adapter handles routing, serialization,
and caching.

---

## 5. The Five Design Bets

### 5.1 TOON Over JSON

`@state` uses TOON (Token-Oriented Object Notation) instead of JSON.

```
// JSON: 156 tokens
{"journeys":[{"id":"J-101","client":"Doe v Acme","stage":"Discovery"},
{"id":"J-102","client":"Roe v Beta","stage":"Settlement"}]}

// TOON: ~50 tokens
journeys[2]{id,client,stage}:
  J-101,Doe v Acme,Discovery
  J-102,Roe v Beta,Settlement
```

**The bet:** AI agents are priced per token. A 70% reduction in state
serialization size directly reduces the cost of every page read. TOON is
less general than JSON but optimized for the tabular data that dominates
real application state. Lists of records, user objects, config
values — these are rows and columns, not arbitrary nested trees.

**The tradeoff:** TOON is a new format. Agents need to parse it. But the
grammar is simple enough that any LLM can read it without a parser, and
a formal parser is <100 lines.

### 5.2 Same-URL Negotiation Plus `.agent` URLs

AVL supports both `Accept: text/agent-view` on `/dashboard` and a
cacheable `/dashboard.agent` companion.

**The bet:** content negotiation has the lowest discovery cost for agents
that can send custom headers. The human URL stays the authority, and the
agent asks for the representation it wants.

The `.agent` URL remains important because URLs are the most fundamental
addressing unit on the web. A `.agent` URL is cacheable by any HTTP cache.
Shareable by pasting.
Debuggable in any browser. Curl-able without headers. Every piece of
infrastructure that understands URLs — CDNs, load balancers, caches, log
aggregators — works with `.agent` out of the box.

The two forms MUST resolve to the same AVL document. HTML discovery links
connect them from the human page.

### 5.3 `@intent` Exists

Every AVL document declares its intent: purpose, audience, capability.

```
@intent
  purpose:    Project dashboard for active accounts
  audience:   admin, member
  capability: review, manage, export
```

**The bet:** Intent is the thing scrapers can never recover. The DOM can
tell you what a page contains. It cannot tell you *why it exists, who
it's for, or what capabilities it represents.* An agent reading `@intent`
can decide in 4 lines — without parsing `@state` or `@actions` — whether
this page is relevant to its current task. This is triage at the speed of
reading a header, not inference at the speed of parsing a DOM tree.

### 5.4 `@actions` Are Page-Scoped

Actions are not a global API surface. They are scoped to the current page
and the current user's permissions.

**The bet:** "What can I do from *here*?" is the question an agent asks on
every page. A global action list (like OpenAPI) answers "what can I do
*anywhere*?" — which is too broad. The agent has to filter for relevance.
Page-scoped actions are pre-filtered: these are the affordances available
on this page, for this user, right now. If the user's role doesn't permit
an action, it's not in the list. The absence is the information.

### 5.5 Colocated Authoring

`agent.ts` lives next to `page.tsx`. Same directory. Same imports.

**The bet:** Separation kills maintenance. If agent views live in a
separate directory, a separate config file, or a separate service, they
drift from the human views. Data fetchers get refactored in `page.tsx`
and the `agent.ts` still uses the old ones. Colocation forces the agent
view to stay in sync with the human view because they're maintained in
the same context, by the same developer, at the same time.

This mirrors how i18n works: translations are colocated with the
components they translate, not in a separate directory tree.

---

## 6. The Auth Model

The AI agent is not a new principal. It is a delegate of an existing human
session.

When a user authenticates, their session is valid for both the human view
and the agent view. The agent inherits the user's identity, role, and
permissions. It sees exactly what the user sees — no more, no less.

**Surface Equivalence** is the security invariant:
- Every `@state` field is visible to this user in the human UI
- Every `@actions` entry corresponds to a UI affordance the user can invoke

If either fails, the AVL view is leaking.

Three delivery mechanisms serve this one identity model:
1. **Cookie forwarding** — browser-embedded agents (the cookie is already there)
2. **Bearer token** — local AI agents (user generates a scoped token)
3. **OAuth delegation** — third-party AI services (standard OAuth2 flow)

All three resolve to the same `AgentSession`. AVL doesn't define a token
format — the host application already has one. AVL provides one contract:

```typescript
resolveSession: (req: Request) => Promise<AgentSession | null>
```

The host app implements it. AVL renders accordingly.

See `avl-auth-thesis.md` for the full argument.

---

## 7. The Adoption Ramp

AVL defines four conformance levels:

| Level | Sections | Effort | Value |
|---|---|---|---|
| **L0** | `@meta` + `@intent` | Hours | Agents can triage every route — "is this page relevant?" — without scraping |
| **L1** | + `@state` | Days | Agents can read structured data without DOM parsing |
| **L2** | + `@actions` | Days | Agents can operate — click buttons, submit forms, navigate |
| **L3** | + `@nav` + `@context` | Weeks | Agents can traverse the app and understand the "so what" |

**The key insight:** L0 is trivially cheap and already useful.

A team can ship L0 across every route in a single day. Every page gets
an `agent.ts` that declares its intent. That's 5 lines per route. No data
integration, no action wiring, no API changes. And already, any AI agent
can scan the site and build a map of what every page does, who it's for,
and what capabilities it offers.

L2 is where the real power unlocks — the agent becomes an operator, not
just a reader. But the ramp from L0 to L2 is incremental. Start with the
high-value routes (dashboards, settings, critical workflows) and expand.

This is the same adoption pattern that made i18n ubiquitous: start with
the critical pages, translate incrementally, ship value at every step.

---

## 8. Why Now

Three things are true in 2026 that were not true in 2024:

**AI agents are crossing from "read the web" to "use the web."** Every
major AI lab has shipped or announced agent capabilities — browser use,
computer use, MCP integration, tool calling. Agents are not just answering
questions about web pages. They are logging in, navigating, clicking
buttons, and submitting forms. The demand side is here.

**The scraping approach is hitting its ceiling.** Computer-use and browser-
use agents are impressive demos but expensive in production. They consume
screenshots, burn vision tokens, fail on dynamic content, and break on
redesigns. The industry is investing enormous resources in making agents
better at reverse-engineering pixels. This is a ceiling, not a floor. The
right abstraction is lower in the stack.

**The web development ecosystem has converged.** Server-side rendering is
mainstream again (Next.js, Remix, SvelteKit, Nuxt). The data is already
on the server, already authenticated, already in structured form — right
before it gets turned into HTML. The incremental cost of adding a second
rendering target is low because the prerequisite (server-side data) is
already standard practice.

AVL doesn't require a new web. It requires the web that already exists to
ship one more rendering target for a consumer that's already at the door.

---

## 9. What's Unproven

Honest accounting of open questions:

**TOON adoption.** TOON is a new format. It's simple enough for any LLM to
read natively, and the token savings are real. But "new format" carries
friction. If agents strongly prefer JSON, TOON may become optional or a
progressive optimization.

**Developer willingness.** AVL requires application developers to write
`agent.ts` files. The effort is low (it reuses existing data fetchers) but
it's nonzero. If the value proposition doesn't land, developers won't
invest even the small effort. The L0 ramp is designed to minimize this
friction.

**Agent client ecosystem.** For AVL to matter, AI agents need to request
`.agent` URLs. Today they don't, because the convention doesn't exist yet.
This is a bootstrapping problem: sites won't ship agent views until agents
request them, and agents won't request them until sites ship them. The
solve is the same as every protocol adoption: early adopters ship it
because it solves their own problem (their own agents reading their own
apps), and the convention spreads from there.

**Format stability.** The `text/agent-view; version=1` format is a draft.
Section additions are non-breaking, but the core grammar — `@` section
prefixes, TOON encoding, action schema — is a bet that may need revision
after real-world use.

---

## 10. The Bet

Web applications are about to have two audiences: humans and AI agents.
Today, we serve only one. The industry's current approach — making agents
better at pretending to be humans — is a local maximum. It works. It's
expensive. It's fragile. And it wastes work that the server already did.

AVL bets that the right abstraction is the one the web already uses for
every other non-default audience: a parallel rendering target. Not a new
API. Not a new protocol. Not a new auth model. Just a second locale —
for consumers that read tokens instead of pixels.

The page already knows what it means. AVL ships that knowledge.
