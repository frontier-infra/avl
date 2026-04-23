// Service-area page for Austin. Nested URL demonstrates nested output path
// (`/services/austin` → `services/austin.agent`).

import { defineStaticAgentView } from "@frontier-infra/avl";

export default defineStaticAgentView({
  intent: {
    purpose: "Electrical services in Austin, TX",
    audience: ["homeowner", "property-manager"],
    capability: ["call", "book", "quote"],
  },
  state: {
    city: "Austin, TX",
    zip_codes: [
      "78701",
      "78702",
      "78704",
      "78723",
      "78745",
      "78751",
      "78757",
    ],
    services: [
      "panel upgrades",
      "EV charger install",
      "whole-home rewire",
      "ceiling fan install",
      "emergency outage repair",
    ],
    response_time: "avg 47 minutes, emergencies",
    hours: "24/7 emergency dispatch",
    starting_price_usd: 125,
  },
  actions: [
    { id: "call_dispatch", method: "GET", href: "tel:+15125550199" },
    { id: "request_quote", method: "GET", href: "mailto:quotes@lonestar-electric.example" },
    { id: "book_service",  method: "GET", href: "https://book.lonestar-electric.example/austin" },
    { id: "directions",    method: "GET", href: "https://maps.google.com/?q=Austin+TX" },
  ],
  context:
    "Licensed Austin electricians, 20-minute average response downtown, " +
    "47-minute average response for emergencies across the metro.",
  nav: {
    parents: ["/services", "/"],
    peers: ["/services/round-rock", "/services/pflugerville", "/services/cedar-park"],
  },
  meta: { ttl: "1d" },
});
