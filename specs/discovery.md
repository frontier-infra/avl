# AVL Discovery

AVL discovery should be redundant. Agents vary in how they crawl, fetch, and interpret pages, so producers should expose multiple low-cost signals.

## Required For L0

A site must expose at least one of:

- `/.agent`
- `/{path}.agent`
- `Accept: text/agent-view`
- HTML alternate link
- HTTP `Link` header
- `/agent.txt`

## Recommended Stack

```text
/agent.txt
/.agent
/{path}.agent
/llms.txt
/.well-known/agent-view
/.well-known/avl
```

Human pages should include:

```html
<link rel="alternate" type="text/agent-view; version=1" href="/current-page.agent">
<link rel="agent-manifest" type="text/plain" href="/agent.txt">
```

HTTP responses should include:

```http
Link: </agent.txt>; rel="agent-manifest"; type="text/plain"
```

Body links are recommended because they create a crawlable provenance signal tied to the visible page:

```html
<a href="/current-page.agent" rel="alternate agent-view" type="text/agent-view; version=1">
  Agent view of this page
</a>
```

## Well-Known Endpoints

These experimental endpoints should redirect to `/agent.txt` or return equivalent manifest content:

```text
/.well-known/agent-view
/.well-known/avl
```

Rationale: `.well-known` endpoints are easy for crawlers and standards-track tooling to probe without knowing project-specific conventions.

## robots.txt Guidance

Sites can advertise AVL and LM resources from `robots.txt`:

```text
Sitemap: https://example.com/sitemap.xml
Agent-View: https://example.com/agent.txt
LLMs: https://example.com/llms.txt
```

`Agent-View` and `LLMs` are non-standard extension fields. Crawlers must ignore what they do not understand. Producers should treat them as hints, not the primary discovery mechanism.

## Relationship To llms.txt

`llms.txt` gives a site-level curated summary for language models. AVL gives page-level structured intent, state, actions, context, and navigation. Use both:

- Link `/llms.txt` from `/agent.txt`.
- Link `/agent.txt` from `/llms.txt`.
- Include both in readiness checks.
