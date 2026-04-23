# examples/product-page

A single e-commerce product detail page — a fictional 1.7L stainless-steel electric kettle — showing how AVL maps to a storefront's deepest pages.

## What this shows

- **`@state` as a product spec**: SKU, name, brand, price, currency, variants, inventory count, rating, reviews count, features, nested specs object, shipping origin, Prime eligibility. The structured data a shopping agent (or a price-comparison crawler) actually needs.
- **Variants as tabular data**: the `variants` array is `{id, label, in_stock}` — TOON renders this as a compact table, which is the format's sweet spot.
- **Nested objects**: `specs` is nested (`capacity_l`, `wattage`, `weight_kg`, `warranty_years`), demonstrating TOON's nested-object encoding.
- **`@actions` with real inputs**: `add_to_cart` takes `sku`, `variant`, and optional `quantity`; `save_for_later` takes `sku`. The action schema gives an agent exactly enough to invoke it without scraping a `<form>`.
- **Non-HTTP action schemes**: `share_email` is `mailto:` with a pre-filled subject and body; `share_x` is an external URL.
- **`@meta.ttl` for time-sensitive data**: inventory and prices change often; the 5-minute TTL signals short cacheability. In production this page might be rendered per-request against a real inventory service.

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
    kettle-17-ss.agent
```

Checked-in expected output is in [`samples/`](samples/).

## What's here

| File | Purpose |
|---|---|
| `src/product.agent.ts` | The product's AVL config — one `defineStaticAgentView` call |
| `src/build.ts` | Build entrypoint |
| `samples/` | Expected `.agent` output, checked in for reference |

## Why this example exists

Product pages are the most frequently-scraped pages on the web. Every time someone asks an AI agent to "find me a kettle under $50 with boil-dry protection and at least a 3-year warranty," the agent today does that by scraping structured data out of HTML. AVL gives the producer a clean way to ship that spec directly — and importantly, to ship the **actions** the shopper can take (add-to-cart, save, share) in the same document.

This is one of the highest-leverage places to ship AVL if you run a storefront.
