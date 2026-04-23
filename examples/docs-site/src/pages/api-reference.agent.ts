// Docs — API reference. Denser @state to demonstrate TOON's tabular
// encoding of an exports list.

import { defineStaticAgentView } from "@frontier-infra/avl";

export default defineStaticAgentView({
  intent: {
    purpose: "Docs: API reference for @frontier-infra/avl",
    audience: ["developer"],
    capability: ["read", "search", "copy-code"],
  },
  state: {
    section: "Reference",
    topic: "API Reference",
    order: 3,
    last_updated: "2026-04-22",
    version: "0.1.0",
    exports: [
      { name: "defineAgentView",         kind: "function",    since: "0.1.0" },
      { name: "defineStaticAgentView",   kind: "function",    since: "0.1.0" },
      { name: "generateStaticAgentViews",kind: "function",    since: "0.1.0" },
      { name: "defaultResolveOutputPath",kind: "function",    since: "0.1.0" },
      { name: "serialize",               kind: "function",    since: "0.1.0" },
      { name: "createAgentViewHandler",  kind: "function",    since: "0.1.0" },
      { name: "resolveAgentView",        kind: "function",    since: "0.1.0" },
    ],
  },
  actions: [
    { id: "edit_on_github",
      method: "GET",
      href: "https://github.com/frontier-infra/avl/edit/main/docs/api-reference.md" },
    { id: "source",
      method: "GET",
      href: "https://github.com/frontier-infra/avl/tree/main/src" },
    { id: "prev",
      method: "GET",
      href: "/docs/quick-start.agent" },
  ],
  context:
    "All public exports. Import from `@frontier-infra/avl` (core) or " +
    "`@frontier-infra/avl/next` (Next.js adapter).",
  nav: {
    self: "/docs/api-reference.agent",
    parents: ["/docs"],
    peers: ["/docs/installation", "/docs/quick-start"],
  },
});
