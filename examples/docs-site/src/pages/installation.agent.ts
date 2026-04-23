// Docs — Installation. Shows @state carrying doc metadata (section,
// topic, last-updated) and @actions for edit-on-github + prev/next
// navigation.

import { defineStaticAgentView } from "@frontier-infra/avl";

export default defineStaticAgentView({
  intent: {
    purpose: "Docs: Installing AVL in a Next.js project",
    audience: ["developer"],
    capability: ["read", "copy-code", "report-issue"],
  },
  state: {
    section: "Getting Started",
    topic: "Installation",
    order: 1,
    last_updated: "2026-04-22",
    version: "0.1.0",
    applies_to: ["next.js 14+", "next.js 15", "next.js 16"],
    prerequisites: ["node >= 20", "a Next.js app with App Router"],
    command: "npm install @frontier-infra/avl",
  },
  actions: [
    { id: "edit_on_github",
      method: "GET",
      href: "https://github.com/frontier-infra/avl/edit/main/docs/installation.md" },
    { id: "report_issue",
      method: "GET",
      href: "https://github.com/frontier-infra/avl/issues/new?title=Docs:%20Installation" },
    { id: "next",
      method: "GET",
      href: "/docs/quick-start.agent" },
  ],
  context:
    "Installs the npm package. Zero runtime dependencies. " +
    "Supports both ESM and CJS consumers.",
  nav: {
    self: "/docs/installation.agent",
    parents: ["/docs"],
    peers: ["/docs/quick-start", "/docs/api-reference"],
  },
});
