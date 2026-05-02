# AVL Without Next.js

AVL does not require Next.js. A producer only needs to render `text/agent-view; version=1` alongside each human page.

For an AI-agent-ready implementation brief, use `AI-IMPLEMENTATION.md` from the repository root.

## Universal Pattern

1. Identify the human route.
2. Render the same source data as an AVL document.
3. Serve it at `/{path}.agent`.
4. Add HTML and HTTP discovery from the human page.
5. Add `/agent.txt` and `/llms.txt`.

## Express Or Fastify

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

## Astro

Use static generation for content pages:

- Create a `.agent.ts` or `.agent.js` companion next to page data.
- Generate `.agent` files during `astro build`.
- Add `<link rel="alternate">` in the layout.

## Hugo / Static Sites

Use templates to emit `.agent` files from front matter:

- Page title and description become `@intent`.
- Front matter and taxonomies become `@state`.
- Permalink becomes `view_human` in `@actions`.
- Section hierarchy becomes `@nav`.

## WordPress And CMSs

Prefer native plugins. This repo includes CMS adapters under `plugins/`, with WordPress as the reference CMS implementation.

## Minimal L0 Example

```text
@meta
  v: 1
  route: /about
  generated: 2026-05-02T12:00:00Z

@intent
  purpose: About page for Example Co
  audience: visitor, agent
  capability: read, contact
```

That is enough for L0 when paired with a discovery link.
