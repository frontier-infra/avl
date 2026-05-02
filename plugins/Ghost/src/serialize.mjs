import { encodeNamed, scalar } from "./toon.mjs";

export function serialize(document) {
  const sections = [];

  const meta = ["@meta"];
  meta.push(`  v: ${scalar(document.meta?.v ?? 1)}`);
  meta.push(`  route: ${scalar(document.meta?.route ?? "/")}`);
  meta.push(`  generated: ${scalar(document.meta?.generated ?? new Date().toISOString())}`);
  if (document.meta?.ttl) meta.push(`  ttl: ${scalar(document.meta.ttl)}`);
  sections.push(meta.join("\n"));

  const intent = ["@intent"];
  intent.push(`  purpose:    ${scalar(document.intent?.purpose ?? "Ghost content")}`);
  intent.push(`  audience:   ${(document.intent?.audience ?? []).map(scalar).join(", ")}`);
  intent.push(`  capability: ${(document.intent?.capability ?? []).map(scalar).join(", ")}`);
  sections.push(intent.join("\n"));

  if (document.state && Object.keys(document.state).length > 0) {
    const state = ["@state"];
    for (const [key, value] of Object.entries(document.state)) {
      for (const line of encodeNamed(key, value)) state.push(`  ${line}`);
    }
    sections.push(state.join("\n"));
  }

  if (Array.isArray(document.actions) && document.actions.length > 0) {
    const actions = ["@actions"];
    for (const action of document.actions) {
      actions.push(`  - id: ${scalar(action.id)}`);
      actions.push(`    method: ${scalar(action.method)}`);
      actions.push(`    href: ${scalar(action.href)}`);
    }
    sections.push(actions.join("\n"));
  }

  if (document.context) {
    const context = ["@context"];
    for (const line of String(document.context).trim().split("\n")) {
      context.push(`  > ${line}`);
    }
    sections.push(context.join("\n"));
  }

  if (document.nav) {
    const nav = ["@nav"];
    if (document.nav.self) nav.push(`  self:      ${scalar(document.nav.self)}`);
    if (document.nav.parents?.length) nav.push(`  parents:   [${document.nav.parents.map(scalar).join(", ")}]`);
    if (document.nav.peers?.length) nav.push(`  peers:     [${document.nav.peers.map(scalar).join(", ")}]`);
    if (document.nav.drilldown) nav.push(`  drilldown: ${scalar(document.nav.drilldown)}`);
    sections.push(nav.join("\n"));
  }

  return `${sections.join("\n\n")}\n`;
}
