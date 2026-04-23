# examples/docs-site

A tiny documentation site — three pages (Installation, Quick Start, API Reference) — showing how AVL maps to a classic docs experience.

## What this shows

- **`@state` as doc metadata**: `section`, `topic`, `order`, `last_updated`, `version`, `applies_to`, `prerequisites`. The shape a docs consumer (or a doc search engine) actually wants.
- **`@actions` for docs**: `edit_on_github`, `report_issue`, `prev`, `next`. These are the real affordances reading a doc page gives you — not "advance stage" or "add to cart."
- **Navigation as first-class data.** `@nav` declares `self`, `parents`, and `peers` so an agent can walk the table of contents without parsing `<a>` tags.
- **Tabular data via TOON**. The API reference's `exports` array is a list of `{name, kind, since}` records — TOON renders this as a compact tabular block, which is the format's sweet spot.

## Run it

```bash
# from this directory
npm install
npm run build
```

Produces:

```
dist/
  docs/
    installation.agent
    quick-start.agent
    api-reference.agent
```

Checked-in expected output is in [`samples/`](samples/).

## What's here

| File | Purpose |
|---|---|
| `src/pages/installation.agent.ts` | Getting Started / Installation |
| `src/pages/quick-start.agent.ts` | Getting Started / Quick Start |
| `src/pages/api-reference.agent.ts` | Reference / API Reference |
| `src/build.ts` | Build entrypoint |
| `samples/` | Expected `.agent` output, checked in for reference |

## Why this example exists

Docs sites are the highest-leverage place to ship AVL early: the content is already written, already structured (frontmatter), and consumed almost entirely by programmatic readers (search indexers, AI assistants, code-example extractors). A static docs generator that emits `.agent` files alongside HTML is a very small delta and an outsized unlock.
