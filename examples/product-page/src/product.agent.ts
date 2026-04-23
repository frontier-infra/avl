// Product detail — fictional stainless-steel electric kettle.
//
// Highlights the e-commerce pattern: @state is the product spec; @actions
// are the things a shopper can do (add-to-cart, save-for-later, share).
//
// `inventory_count` changes often and might argue for a short @meta.ttl or
// per-request rendering in production; for this static example, treat it
// as a build-time snapshot.

import { defineStaticAgentView } from "@frontier-infra/avl";

export default defineStaticAgentView({
  intent: {
    purpose: "Product detail — 1.7L stainless-steel electric kettle",
    audience: ["shopper"],
    capability: ["buy", "save", "share", "compare"],
  },
  state: {
    sku: "KTL-17-SS",
    name: "1.7L Electric Kettle — Stainless",
    brand: "Ironpeak",
    price_usd: 49.0,
    currency: "USD",
    variants: [
      { id: "brushed",  label: "Brushed stainless",  in_stock: true  },
      { id: "polished", label: "Polished stainless", in_stock: true  },
      { id: "matte_black", label: "Matte black",     in_stock: false },
    ],
    inventory_count: 132,
    rating: 4.6,
    reviews_count: 287,
    features: [
      "1500W rapid boil",
      "auto shut-off",
      "boil-dry protection",
      "removable limescale filter",
    ],
    specs: {
      capacity_l: 1.7,
      wattage: 1500,
      weight_kg: 1.1,
      warranty_years: 3,
    },
    ships_from: "Austin, TX",
    eligible_for_prime: true,
  },
  actions: [
    { id: "add_to_cart",
      method: "POST",
      href: "/api/cart/add",
      inputs: [
        { name: "sku",      type: "string",  required: true  },
        { name: "variant",  type: "string",  required: true  },
        { name: "quantity", type: "integer", required: false },
      ] },
    { id: "save_for_later",
      method: "POST",
      href: "/api/wishlist/add",
      inputs: [{ name: "sku", type: "string", required: true }] },
    { id: "share_x",
      method: "GET",
      href: "https://x.com/intent/tweet?url=https://example.com/product/kettle-17-ss" },
    { id: "share_email",
      method: "GET",
      href: "mailto:?subject=Check+out+this+kettle&body=https://example.com/product/kettle-17-ss" },
    { id: "compare",
      method: "GET",
      href: "/category/kettles.agent" },
  ],
  context:
    "Best-selling stainless kettle in the 1.5-2L segment. 4.6★ across " +
    "287 reviews; 3-year warranty; ships same-day from Austin, TX.",
  nav: {
    self: "/product/kettle-17-ss.agent",
    parents: ["/category/kettles", "/"],
    peers: ["/product/kettle-12-gooseneck", "/product/kettle-electric-glass"],
  },
  meta: {
    ttl: "5m",
  },
});
