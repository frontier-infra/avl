// Docs — Quick Start.

import { defineStaticAgentView } from "@frontier-infra/avl";

export default defineStaticAgentView({
  intent: {
    purpose: "Docs: Quick start — ship your first agent view in 10 minutes",
    audience: ["developer"],
    capability: ["read", "copy-code", "report-issue"],
  },
  state: {
    section: "Getting Started",
    topic: "Quick Start",
    order: 2,
    last_updated: "2026-04-22",
    version: "0.1.0",
    learning_time_min: 10,
    steps: [
      "Install the package",
      "Create `app/dashboard/agent.ts`",
      "Wire the catch-all route at `app/agent/[[...path]]/route.ts`",
      "curl /dashboard.agent",
    ],
  },
  actions: [
    { id: "edit_on_github",
      method: "GET",
      href: "https://github.com/frontier-infra/avl/edit/main/docs/quick-start.md" },
    { id: "report_issue",
      method: "GET",
      href: "https://github.com/frontier-infra/avl/issues/new?title=Docs:%20Quick%20Start" },
    { id: "prev",
      method: "GET",
      href: "/docs/installation.agent" },
    { id: "next",
      method: "GET",
      href: "/docs/api-reference.agent" },
  ],
  context:
    "End-to-end walkthrough: author an agent view, wire the handler, " +
    "curl it. Everything a developer needs before diving into the API reference.",
  nav: {
    self: "/docs/quick-start.agent",
    parents: ["/docs"],
    peers: ["/docs/installation", "/docs/api-reference"],
  },
});
