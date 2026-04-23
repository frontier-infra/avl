// Home page for Lonestar Electric — fictional Austin electrician.
// Demonstrates the shape of @state for a local-services landing page:
// tagline, services offered, service areas, hours.

import { defineStaticAgentView } from "@frontier-infra/avl";

export default defineStaticAgentView({
  intent: {
    purpose: "Licensed electrician serving Austin, TX",
    audience: ["homeowner", "property-manager", "contractor"],
    capability: ["call", "book", "quote"],
  },
  state: {
    business_name: "Lonestar Electric",
    tagline: "Licensed master electricians. 24/7 emergency response.",
    founded: 2004,
    services: [
      "panel upgrades",
      "EV charger install",
      "whole-home rewire",
      "ceiling fan install",
      "emergency outage repair",
    ],
    service_area: ["Austin", "Round Rock", "Pflugerville", "Cedar Park"],
    hours: "24/7 emergency dispatch",
    starting_price_usd: 125,
    rating: 4.8,
    reviews_count: 421,
  },
  actions: [
    { id: "call_dispatch",  method: "GET", href: "tel:+15125550199" },
    { id: "request_quote",  method: "GET", href: "mailto:quotes@lonestar-electric.example" },
    { id: "book_service",   method: "GET", href: "https://book.lonestar-electric.example/new" },
    { id: "get_directions", method: "GET", href: "https://maps.google.com/?q=Lonestar+Electric+Austin+TX" },
  ],
  context:
    "Lonestar Electric has served greater Austin since 2004. Master-licensed, " +
    "bonded and insured. 24/7 emergency response for outages and hazards.",
  nav: {
    parents: [],
    peers: ["/services", "/about"],
    drilldown: "/services/{area}",
  },
  meta: { ttl: "1d" },
});
