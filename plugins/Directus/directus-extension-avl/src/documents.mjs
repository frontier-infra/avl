export function scalar(value) {
  if (value === null || value === undefined) return "~";
  if (typeof value === "boolean") return value ? "true" : "false";
  const text = String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '\\"')}"` : text;
}

function mapLines(object, indent = "  ") {
  return Object.entries(object)
    .map(([key, value]) => Array.isArray(value)
      ? `${indent}${key}[${value.length}]: ${value.map(scalar).join(", ")}`
      : value && typeof value === "object"
        ? `${indent}${key}:\n${mapLines(value, `${indent}  `)}`
        : `${indent}${key}: ${scalar(value)}`)
    .join("\n");
}

export function serialize(document) {
  const sections = [];
  for (const section of ["meta", "intent", "state"]) {
    if (document[section]) sections.push(`@${section}\n${mapLines(document[section])}`);
  }
  if (document.actions) {
    sections.push(`@actions\n${document.actions.map((action) => `  - id: ${scalar(action.id)}\n    method: ${scalar(action.method)}\n    href: ${scalar(action.href)}`).join("\n")}`);
  }
  if (document.context) sections.push(`@context\n  > ${document.context}`);
  if (document.nav) sections.push(`@nav\n${mapLines(document.nav)}`);
  return `${sections.join("\n\n")}\n`;
}

export function manifest() {
  return [
    "# AVL Manifest",
    "",
    "version: 1",
    "content-type: text/agent-view; version=1",
    "producer: directus",
    "",
    "routes:",
    "  - GET /avl/.agent",
    "  - GET /avl/{collection}/{id}.agent",
    "",
    "related:",
    "  llms: /avl/llms.txt",
    "  lm: /avl/lm.txt",
    "",
  ].join("\n");
}

export function llms() {
  return [
    "# Directus AVL",
    "",
    "> Directus project with Agent View Layer support.",
    "",
    "## Agent and AI discovery",
    "",
    "- AVL manifest: /avl/agent.txt",
    "- Site agent view: /avl/.agent",
    "- Item pattern: /avl/{collection}/{id}.agent",
    "",
    "## Standards readiness",
    "",
    "- AVL - agent companion routes: pass",
    "- AEO - answer-engine discoverability: pass",
    "- GEO - generative-engine context: pass",
    "- llms.txt - language-model summary: pass",
    "",
  ].join("\n");
}

export function siteDocument() {
  return {
    meta: { v: 1, route: "/", generated: new Date().toISOString(), ttl: "5m" },
    intent: { purpose: "Directus content API", audience: ["visitor", "agent"], capability: ["read", "navigate"] },
    state: { producer: "directus" },
    actions: [{ id: "view_manifest", method: "GET", href: "/avl/agent.txt" }],
    context: "This Directus project exposes AVL companions for configured collections.",
    nav: { self: "/avl/.agent", drilldown: "/avl/{collection}/{id}.agent" },
  };
}

export function itemDocument(collection, id, item = {}) {
  return {
    meta: { v: 1, route: `/${collection}/${id}`, generated: new Date().toISOString(), ttl: "5m" },
    intent: { purpose: `Directus ${collection}: ${item.title || item.name || id}`, audience: ["visitor", "agent"], capability: ["read"] },
    state: { id, collection, title: item.title || item.name || "", slug: item.slug || "" },
    actions: [{ id: "view_api", method: "GET", href: `/items/${collection}/${id}` }],
    context: `Directus ${collection} item exposed as an AVL companion.`,
    nav: { self: `/avl/${collection}/${id}.agent`, parents: ["/avl/.agent"] },
  };
}
