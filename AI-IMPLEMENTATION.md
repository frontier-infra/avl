# Implement AVL With An AI Coding Agent

Give this file to an AI coding agent when you want it to add AVL to a project.

AVL means Agent View Layer. Every human-facing page gets a parallel `text/agent-view; version=1` representation that exposes page intent, state, actions, context, and navigation so AI agents do not have to scrape meaning from HTML.

## Agent Task

Add AVL support to this project.

Your implementation must:

- Serve `/agent.txt`.
- Serve `/.agent` for the site/root view.
- Serve `/{path}.agent` for page-specific views where practical.
- Add discovery links from human HTML pages.
- Keep AVL output in sync with the same data used by the human page.
- Avoid exposing private data that the human viewer cannot access.
- Add tests or smoke checks for generated AVL output.

Prefer the smallest useful conformance level first. Do not overbuild.

## Required Content Type

AVL documents must be served as:

```http
Content-Type: text/agent-view; version=1; charset=utf-8
```

## Required Sections

Every AVL document must include `@meta` and `@intent`.

```text
@meta
  v: 1
  route: /pricing
  generated: 2026-05-02T12:00:00Z
  ttl: 5m

@intent
  purpose: Pricing page for Example Co
  audience: visitor, buyer, agent
  capability: read, compare, buy
```

Optional but recommended sections:

- `@state`: structured page data.
- `@actions`: things a visitor or agent can do from this page.
- `@context`: short narrative explanation of what matters.
- `@nav`: related agent-view routes.

## Conformance Levels

| Level | Implement This | When To Use |
|---|---|---|
| L0 | `@meta`, `@intent`, and discovery | First pass for every site. |
| L1 | L0 plus `@state` | Content pages, product pages, docs, blogs. |
| L2 | L1 plus `@actions` | Forms, purchases, booking, contact, dashboards. |
| L3 | L2 plus `@context` and `@nav` | Rich apps, dashboards, docs, multi-page flows. |

Start with L0 or L1 unless the project already has clear action endpoints.

## Full Example

```text
@meta
  v: 1
  route: /pricing
  generated: 2026-05-02T12:00:00Z
  ttl: 5m

@intent
  purpose: Pricing page for Example Co
  audience: visitor, buyer, agent
  capability: read, compare, buy

@state
  plans[2]{id,name,price_usd,ideal_for}:
    starter,Starter,19,small teams
    pro,Pro,49,growing companies

@actions
  - id: view_human
    method: GET
    href: /pricing
  - id: start_checkout
    method: POST
    href: /api/checkout

@context
  > Two public pricing plans are available. Pro is the recommended plan for growing companies.

@nav
  self: /pricing.agent
  parents: [/.agent]
  peers: [/docs.agent, /contact.agent]
```

## Discovery Requirements

Add at least one discovery signal. Prefer all of these when possible.

### HTML Head

```html
<link rel="alternate" type="text/agent-view; version=1" href="/pricing.agent">
<link rel="agent-manifest" type="text/plain" href="/agent.txt">
```

### HTTP Header

```http
Link: </agent.txt>; rel="agent-manifest"; type="text/plain"
```

### Body Link Or Badge

Use a crawlable link to the current page's companion:

```html
<a
  href="/pricing.agent"
  rel="alternate agent-view"
  type="text/agent-view; version=1"
  data-avl-endpoint="/pricing.agent"
>
  Agent view of this page
</a>
```

If the design cannot show a visible link, visually hide it without removing it from the DOM.

## `/agent.txt`

Create a site-level discovery manifest:

```text
# AVL Manifest

version: 1
content-type: text/agent-view; version=1
producer: your-framework-or-cms

discovery:
  - suffix
  - html-link
  - link-header

routes:
  - GET /.agent
  - GET /{path}.agent

related:
  llms: /llms.txt
  sitemap: /sitemap.xml
  robots: /robots.txt

spec: https://github.com/frontier-infra/avl/blob/main/specs/avl-agent-view-layer.md
```

## `/llms.txt`

If the project does not already have `llms.txt`, add a basic one:

```text
# Example Co

> Short description of the site, product, service, or documentation.

## Agent and AI discovery

- AVL manifest: /agent.txt
- Site agent view: /.agent
- Agent view pattern: /{path}.agent

## Key pages

- [Home](/)
- [Pricing](/pricing)
- [Docs](/docs)
- [Contact](/contact)
```

## Implementation Patterns

### Next.js App Router

Use a route handler for agent views:

```ts
// app/[...path]/route.ts or app/agent/[[...path]]/route.ts
export async function GET(request: Request) {
  const url = new URL(request.url)
  const route = resolveHumanRoute(url.pathname)
  const page = await loadPageData(route)

  return new Response(renderAgentView(page), {
    headers: {
      "Content-Type": "text/agent-view; version=1; charset=utf-8",
      "Vary": "Accept",
    },
  })
}
```

Also add head/body discovery in the relevant layout or page component.

### Express / Fastify

```ts
app.get('/agent.txt', (_req, res) => {
  res.type('text/plain').send(renderManifest())
})

app.get('/*.agent', async (req, res) => {
  const route = req.path.replace(/\.agent$/, '') || '/'
  const page = await loadPage(route)
  res.type('text/agent-view; version=1').send(renderAgentView(page))
})
```

### Static Site Generators

During build:

- Read the same page data/front matter used for HTML.
- Generate `page.agent` next to each generated HTML page.
- Generate `/agent.txt`.
- Generate or update `/llms.txt`.
- Add `<link rel="alternate">` to the HTML template.

### WordPress Or CMS

Prefer a native plugin/module/extension.

The plugin should:

- Resolve public CMS routes.
- Generate `@state` from CMS content fields.
- Serve `/{path}.agent`.
- Serve `/agent.txt`.
- Serve `/llms.txt` when practical.
- Add admin settings for enabled post/content types.
- Add discovery links to public human pages.

Use the adapters in `plugins/` as references.

## Security Rules

Do not:

- Expose private fields that the human viewer cannot see.
- List actions the viewer cannot perform.
- Put secrets, API keys, session tokens, or internal IDs in public AVL.
- Generate stale summaries from scraped HTML when source data is available.
- Make automatic external validation calls without clear user consent.

For authenticated pages:

- Reuse the host app's existing session.
- Filter `@state` and `@actions` by the viewer's permissions.
- Include only the same information visible in the human UI.

## Validation Checklist

After implementation, verify:

- `GET /agent.txt` returns `200`.
- `GET /.agent` returns `text/agent-view; version=1`.
- At least one real page has `/{path}.agent`.
- Human pages include an HTML alternate link.
- Human pages include a body link or badge when design permits.
- `@meta.v`, `@meta.route`, and `@meta.generated` exist.
- `@intent.purpose`, `@intent.audience`, and `@intent.capability` exist.
- `@state` reflects source page data, not scraped HTML.
- `@actions` match real user affordances.
- `/llms.txt` exists or the reason it is omitted is documented.
- Tests or smoke checks cover the manifest and at least one page companion.

## Useful References

- Main spec: `specs/avl-agent-view-layer.md`
- Conformance: `CONFORMANCE.md`
- Discovery: `specs/discovery.md`
- TOON grammar draft: `specs/toon-grammar.md`
- Non-Next.js guide: `docs/frameworks/non-next-getting-started.md`
- CMS adapters: `docs/cms-adapters.md`

## Final Instruction For The AI Agent

Implement the smallest correct AVL layer for this project, verify it with tests or smoke checks, and document any routes or sections that could not be implemented yet.
