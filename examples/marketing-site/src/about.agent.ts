// About page — company story, credentials, team.
// Demonstrates `@state` as pure facts (no per-user data) and `@context` as
// the narrative layer.

import { defineStaticAgentView } from "@frontier-infra/avl";

export default defineStaticAgentView({
  intent: {
    purpose: "About Lonestar Electric — credentials, team, territory",
    audience: ["prospective-customer", "inspector", "insurer"],
    capability: ["learn", "verify", "contact"],
  },
  state: {
    business_name: "Lonestar Electric",
    founded: 2004,
    owner: "Dana Ramirez, Master Electrician",
    employees: 14,
    credentials: [
      "TX Master Electrician #ME-48213",
      "TDLR Contractor License #TECL-93712",
      "Bonded & Insured — $2M general liability",
    ],
    certifications: ["NECA", "IBEW Local 520 signatory"],
    territory: ["Travis County", "Williamson County", "Hays County"],
  },
  actions: [
    { id: "call_dispatch", method: "GET", href: "tel:+15125550199" },
    { id: "verify_license",
      method: "GET",
      href: "https://www.tdlr.texas.gov/tools_search/mccs_search.asp" },
  ],
  context:
    "Family-owned and operated since 2004. Dana Ramirez, Master Electrician, " +
    "leads a team of 14 licensed electricians and apprentices. Every job is " +
    "inspected under the current NEC.",
  nav: {
    parents: ["/"],
    peers: ["/services"],
  },
  meta: { ttl: "7d" },
});
