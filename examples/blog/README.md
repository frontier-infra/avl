# examples/blog

A minimal blog — index page plus two articles — demonstrating how AVL's six sections map to content pages, **and how every post advertises its agent companion via the four discovery layers**.

## What this shows

- **Index vs. detail `@state`.** The blog index's `@state` is a **list of posts** (slug, title, author, published date, tags, reading time). Each article's `@state` is **that article's metadata** (title, slug, author, published, tags, reading time). Same six sections, different `@state` shape per page type.
- **A shared content layer feeding multiple agent views.** `src/posts.ts` holds the post metadata once; both the index (`src/index.agent.ts`) and each article (`src/post.ts` factory) read from it. Same pattern as a real blog pulling from markdown frontmatter or a CMS.
- **Producer-function `@state`.** The index's `state` is a zero-arg producer — where a real blog would `await fs.readdir("posts")` or query a CMS.
- **`@actions` for content pages.** Subscribe (POST `/api/subscribe` with an email input), RSS (GET feed.xml), share to X, share to LinkedIn. These are the affordances a reader actually has — not "click the advance button."
- **Per-page discovery** — every HTML page wires up the four discovery layers (head link, body link, page-specific badge, `Link:` header) so fetcher-gated agents find each post's companion view without guessing URLs.

## The four discovery layers (post-`2f7b046`)

AVL commit [`2f7b046`](https://github.com/frontier-infra/avl/commit/2f7b046) made companion discovery **explicit and per-page**. Fetcher-gated agents (Anthropic's `web_fetch`, OpenAI's browsing tool, etc.) can't be trusted to infer that `/blog/hello-avl` has a companion at `/blog/hello-avl.agent` — the site has to declare it, and it has to declare it on every page.

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

const path = "/blog/hello-avl";

// In your HTML <head>:
renderAgentViewHeadLinks({ path });
// → <link rel="alternate" type="text/agent-view" href="/blog/hello-avl.agent" ...>
// → <link rel="agent-view"  type="text/agent-view" href="/blog/hello-avl.agent">

// In your HTML body (footer is fine):
renderAgentViewBodyLink({ path });
// → <a href="/blog/hello-avl.agent" rel="alternate agent-view" ...>Agent view of this page</a>

renderAvlBadge({ path });
// → <div data-avl-endpoint="/blog/hello-avl.agent" ...>...</div>

// Server-side (Express/Fastify/Next route handler/etc.):
res.setHeader("Link", renderAgentViewLinkHeader({ path }));
// → </blog/hello-avl>; rel="canonical", </agent.txt>; rel="agent-manifest"; type="text/plain"
```

The example's `src/html.ts` shows the same pattern wired into a minimal HTML
template; `src/build.ts` invokes it once per page (index + each post) and
writes the rendered HTML into `dist/`.

## Run it

```bash
# from this directory
npm install
npm run build
```

Produces:

```
dist/
  blog.html               # index — head/body/badge wired up
  blog.agent
  blog/
    hello-avl.html
    hello-avl.agent
    avl-vs-mcp.html
    avl-vs-mcp.agent
  headers/                # mock HTTP response headers (one per page)
    blog.txt
    blog-hello-avl.txt
    blog-avl-vs-mcp.txt
```

Checked-in expected output is in [`samples/`](samples/).

## What's here

| File | Purpose |
|---|---|
| `src/posts.ts` | Shared post metadata (title, author, tags, etc.) |
| `src/index.agent.ts` | Blog index — `@state` = list of posts |
| `src/post.ts` | Factory — `postAgent(post)` → defineStaticAgentView |
| `src/html.ts` | Minimal HTML page renderer — wires up the 3 in-body discovery helpers |
| `src/build.ts` | Build entrypoint — emits HTML, `.agent`, and headers samples |
| `samples/` | Checked-in expected output, including `samples/headers/` |

## Why index and detail diverge

An agent crawling a blog asks two different questions:

- **At the index:** *What's here? What's recent? What topics does this site cover?* → needs a compact list of post summaries.
- **At an article:** *What is this specific post about? Who wrote it when? How long is it?* → needs this article's metadata, ideally plus the body (out of scope for this example — the body is in the `page.tsx` / markdown file; the agent view is the structured index).

AVL's structure naturally lets each page answer its own question without one view being a lossy subset of the other. The per-page discovery markup lets a fetcher-gated agent move from any human page (index or post) to its corresponding `.agent` companion without guessing the URL pattern.
