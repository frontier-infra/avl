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
    "producer: payload",
    "",
    "routes:",
    "  - GET /.agent",
    "  - GET /{collection}/{id}.agent",
    "",
    "related:",
    "  llms: /llms.txt",
    "  lm: /lm.txt",
    "",
  ].join("\n");
}

export function llms() {
  return [
    "# Payload AVL",
    "",
    "> Payload CMS project with Agent View Layer support.",
    "",
    "## Agent and AI discovery",
    "",
    "- AVL manifest: /agent.txt",
    "- Site agent view: /.agent",
    "- Document pattern: /{collection}/{id}.agent",
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
    intent: { purpose: "Payload content API", audience: ["visitor", "agent"], capability: ["read", "navigate"] },
    state: { producer: "payload" },
    actions: [{ id: "view_manifest", method: "GET", href: "/agent.txt" }],
    context: "This Payload project exposes AVL companions for configured collections.",
    nav: { self: "/.agent", drilldown: "/{collection}/{id}.agent" },
  };
}

export function collectionDocument(collection, id, doc = {}) {
  return {
    meta: { v: 1, route: `/${collection}/${id}`, generated: new Date().toISOString(), ttl: "5m" },
    intent: { purpose: `Payload ${collection}: ${doc.title || doc.name || id}`, audience: ["visitor", "agent"], capability: ["read"] },
    state: { id, collection, title: doc.title || doc.name || "", slug: doc.slug || "" },
    actions: [{ id: "view_api", method: "GET", href: `/api/${collection}/${id}` }],
    context: `Payload ${collection} document exposed as an AVL companion.`,
    nav: { self: `/${collection}/${id}.agent`, parents: ["/.agent"] },
  };
}
