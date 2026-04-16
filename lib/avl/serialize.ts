import { encodeNamed } from "./toon";
import type { AgentViewDocument } from "./types";

/** Serialize an AgentViewDocument to text/agent-view body. */
export function serialize(doc: AgentViewDocument): string {
  const sections: string[] = [];

  // @meta
  const meta = ["@meta"];
  meta.push(`  v: ${doc.meta.v}`);
  meta.push(`  route: ${doc.meta.route}`);
  meta.push(`  generated: ${doc.meta.generated}`);
  if (doc.meta.ttl) meta.push(`  ttl: ${doc.meta.ttl}`);
  if (doc.meta.auth) meta.push(`  auth: ${doc.meta.auth}`);
  if (doc.meta.redacted?.length) {
    meta.push(`  redacted: [${doc.meta.redacted.join(", ")}]`);
  }
  sections.push(meta.join("\n"));

  // @intent
  const intent = ["@intent"];
  intent.push(`  purpose:    ${doc.intent.purpose}`);
  intent.push(`  audience:   ${doc.intent.audience.join(", ")}`);
  intent.push(`  capability: ${doc.intent.capability.join(", ")}`);
  sections.push(intent.join("\n"));

  // @state
  if (doc.state && Object.keys(doc.state).length > 0) {
    const state = ["@state"];
    for (const [k, v] of Object.entries(doc.state)) {
      for (const line of encodeNamed(k, v)) state.push(`  ${line}`);
    }
    sections.push(state.join("\n"));
  }

  // @actions
  if (doc.actions && doc.actions.length > 0) {
    const actions = ["@actions"];
    for (const a of doc.actions) {
      actions.push(`  - id: ${a.id}`);
      actions.push(`    method: ${a.method}`);
      actions.push(`    href: ${a.href}`);
      if (a.needs_role) actions.push(`    needs_role: ${a.needs_role}`);
      if (a.inputs && a.inputs.length > 0) {
        actions.push(`    inputs[${a.inputs.length}]{name,type,required}:`);
        for (const i of a.inputs) {
          actions.push(`      ${i.name},${i.type},${i.required}`);
        }
      }
    }
    sections.push(actions.join("\n"));
  }

  // @context
  if (doc.context) {
    const lines = doc.context.trim().split("\n").map(l => `  > ${l}`);
    sections.push(["@context", ...lines].join("\n"));
  }

  // @nav
  if (doc.nav) {
    const nav = ["@nav"];
    if (doc.nav.self) nav.push(`  self:      ${doc.nav.self}`);
    if (doc.nav.parents?.length) {
      nav.push(`  parents:   [${doc.nav.parents.join(", ")}]`);
    }
    if (doc.nav.peers?.length) {
      nav.push(`  peers:     [${doc.nav.peers.join(", ")}]`);
    }
    if (doc.nav.drilldown) nav.push(`  drilldown: ${doc.nav.drilldown}`);
    sections.push(nav.join("\n"));
  }

  return sections.join("\n\n") + "\n";
}
