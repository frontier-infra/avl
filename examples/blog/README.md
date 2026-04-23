# examples/blog

A minimal blog — index page plus two articles — demonstrating how AVL's six sections map to content pages.

## What this shows

- **Index vs. detail `@state`.** The blog index's `@state` is a **list of posts** (slug, title, author, published date, tags, reading time). Each article's `@state` is **that article's metadata** (title, slug, author, published, tags, reading time). Same six sections, different `@state` shape per page type.
- **A shared content layer feeding multiple agent views.** `src/posts.ts` holds the post metadata once; both the index (`src/index.agent.ts`) and each article (`src/post.ts` factory) read from it. Same pattern as a real blog pulling from markdown frontmatter or a CMS.
- **Producer-function `@state`.** The index's `state` is a zero-arg producer — where a real blog would `await fs.readdir("posts")` or query a CMS.
- **`@actions` for content pages.** Subscribe (POST `/api/subscribe` with an email input), RSS (GET feed.xml), share to X, share to LinkedIn. These are the affordances a reader actually has — not "click the advance button."

## Run it

```bash
# from this directory
npm install
npm run build
```

Produces:

```
dist/
  blog.agent                    # index
  blog/
    hello-avl.agent             # article
    avl-vs-mcp.agent            # article
```

Checked-in expected output is in [`samples/`](samples/).

## What's here

| File | Purpose |
|---|---|
| `src/posts.ts` | Shared post metadata (title, author, tags, etc.) |
| `src/index.agent.ts` | Blog index — `@state` = list of posts |
| `src/post.ts` | Factory — `postAgent(post)` → defineStaticAgentView |
| `src/build.ts` | Build entrypoint |
| `samples/` | Expected `.agent` output, checked in for reference |

## Why index and detail diverge

An agent crawling a blog asks two different questions:

- **At the index:** *What's here? What's recent? What topics does this site cover?* → needs a compact list of post summaries.
- **At an article:** *What is this specific post about? Who wrote it when? How long is it?* → needs this article's metadata, ideally plus the body (out of scope for this example — the body is in the `page.tsx` / markdown file; the agent view is the structured index).

AVL's structure naturally lets each page answer its own question without one view being a lossy subset of the other.
