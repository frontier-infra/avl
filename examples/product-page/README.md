# examples/product-page

A single e-commerce product detail page — a fictional 1.7L stainless-steel electric kettle — showing how AVL maps to a storefront's deepest pages, **and how each PDP advertises its agent companion via the four discovery layers**.

## What this shows

- **`@state` as a product spec**: SKU, name, brand, price, currency, variants, inventory count, rating, reviews count, features, nested specs object, shipping origin, Prime eligibility. The structured data a shopping agent (or a price-comparison crawler) actually needs.
- **Variants as tabular data**: the `variants` array is `{id, label, in_stock}` — TOON renders this as a compact table, which is the format's sweet spot.
- **Nested objects**: `specs` is nested (`capacity_l`, `wattage`, `weight_kg`, `warranty_years`), demonstrating TOON's nested-object encoding.
- **`@actions` with real inputs**: `add_to_cart` takes `sku`, `variant`, and optional `quantity`; `save_for_later` takes `sku`. The action schema gives an agent exactly enough to invoke it without scraping a `<form>`.
- **Non-HTTP action schemes**: `share_email` is `mailto:` with a pre-filled subject and body; `share_x` is an external URL.
- **`@meta.ttl` for time-sensitive data**: inventory and prices change often; the 5-minute TTL signals short cacheability. In production this page might be rendered per-request against a real inventory service.
- **Per-page discovery** — the HTML PDP wires up the four discovery layers (head link, body link, page-specific badge, `Link:` header) so shopping agents and price-comparison crawlers find this product's companion view without guessing the URL convention.

## The four discovery layers (post-`2f7b046`)

AVL commit [`2f7b046`](https://github.com/frontier-infra/avl/commit/2f7b046) made companion discovery **explicit and per-page**. Fetcher-gated agents (Anthropic's `web_fetch`, OpenAI's browsing tool, etc.) can't be trusted to infer that `/product/kettle-17-ss` has a companion at `/product/kettle-17-ss.agent` — the site has to declare it, and it has to declare it on every page.

This example's HTML page carries all four layers:

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

const path = "/product/kettle-17-ss";

// In your HTML <head>:
renderAgentViewHeadLinks({ path });
// → <link rel="alternate" type="text/agent-view" href="/product/kettle-17-ss.agent" ...>
// → <link rel="agent-view"  type="text/agent-view" href="/product/kettle-17-ss.agent">

// In your HTML body (footer is fine):
renderAgentViewBodyLink({ path });
// → <a href="/product/kettle-17-ss.agent" rel="alternate agent-view" ...>Agent view of this page</a>

renderAvlBadge({ path });
// → <div data-avl-endpoint="/product/kettle-17-ss.agent" ...>...</div>

// Server-side (Express/Fastify/Next route handler/etc.):
res.setHeader("Link", renderAgentViewLinkHeader({ path }));
// → </product/kettle-17-ss>; rel="canonical", </agent.txt>; rel="agent-manifest"; type="text/plain"
```

The example's `src/html.ts` shows the same pattern wired into a minimal HTML
template; `src/build.ts` invokes it once per page and writes the rendered
HTML into `dist/`.

## Run it

```bash
# from this directory
npm install
npm run build
```

Produces:

```
dist/
  product/
    kettle-17-ss.html       # human PDP — head/body/badge wired up
    kettle-17-ss.agent      # AVL companion view
  headers/
    product-kettle-17-ss.txt   # mock HTTP response headers
```

Checked-in expected output is in [`samples/`](samples/).

## What's here

| File | Purpose |
|---|---|
| `src/product.agent.ts` | The product's AVL config — one `defineStaticAgentView` call |
| `src/html.ts` | Minimal HTML page renderer — wires up the 3 in-body discovery helpers |
| `src/build.ts` | Build entrypoint — emits HTML, `.agent`, and headers samples |
| `samples/` | Checked-in expected output, including `samples/headers/` |

## Why this example exists

Product pages are the most frequently-scraped pages on the web. Every time someone asks an AI agent to "find me a kettle under $50 with boil-dry protection and at least a 3-year warranty," the agent today does that by scraping structured data out of HTML. AVL gives the producer a clean way to ship that spec directly — and importantly, to ship the **actions** the shopper can take (add-to-cart, save, share) in the same document.

This is one of the highest-leverage places to ship AVL if you run a storefront. The per-page discovery markup means a shopping agent landing on the human PDP can pick up the structured companion in one HTML parse — no URL-pattern guessing, no extra requests just to "see if there's a `.agent` companion."
