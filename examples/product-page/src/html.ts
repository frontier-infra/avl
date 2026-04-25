// Minimal HTML page renderer wired up with AVL's per-page discovery helpers.
//
// What this file demonstrates — and what every adopter should copy:
//
//   1. `<head>`  →  renderAgentViewHeadLinks({ path })
//      Emits both:
//        <link rel="alternate" type="text/agent-view" href="/<page>.agent">
//        <link rel="agent-view"  type="text/agent-view" href="/<page>.agent">
//      Fetcher-gated agents (Anthropic web_fetch, etc.) parse this to find
//      the agent companion deterministically — they don't have to guess.
//
//   2. footer  →  renderAgentViewBodyLink({ path })
//      A crawlable <a rel="alternate agent-view" data-avl-companion="page">.
//      Picked up by indexers that scan the DOM body, not just the head.
//
//   3. footer  →  renderAvlBadge({ path })
//      A page-specific Full Semantic Badge — the href and `data-avl-endpoint`
//      point at THIS page's `.agent` companion, not the site root.
//
//   4. Link header (server-side; demonstrated in samples/headers/<page>.txt)
//      renderAgentViewLinkHeader({ path }) returns a string suitable for
//      `Link: <...>; rel="canonical", <...>; rel="agent-manifest"`.
//
// Why per-page (and not just site-root): see commit 2f7b046 — fetcher-gated
// agents can't be trusted to infer "/foo" → "/foo.agent". The site has to
// declare it explicitly, on every page, in places HTML parsers find for free.

import {
  renderAgentViewBodyLink,
  renderAgentViewHeadLinks,
  renderAvlBadge,
} from "@frontier-infra/avl";

export type HtmlPage = {
  /** Human page path, e.g. "/product/kettle-17-ss". */
  path: string;
  /** <title> for this page. */
  title: string;
  /** HTML fragment for the page body's <main>. */
  body: string;
};

export function renderHtmlPage(page: HtmlPage): string {
  const headLinks = renderAgentViewHeadLinks({ path: page.path });
  const bodyLink = renderAgentViewBodyLink({ path: page.path });
  const badge = renderAvlBadge({ path: page.path });

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${escapeHtml(page.title)}</title>
${headLinks}
</head>
<body>
<main>
${page.body}
</main>
<footer>
${badge}
<p>${bodyLink}</p>
</footer>
</body>
</html>
`;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>]/g, (c) =>
    c === "&" ? "&amp;" : c === "<" ? "&lt;" : "&gt;"
  );
}
