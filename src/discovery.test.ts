import test from "node:test";
import assert from "node:assert/strict";

import {
  normalizeHumanPath,
  renderAgentViewBodyLink,
  renderAgentViewHeadLinks,
  renderAgentViewLinkHeader,
  renderAvlBadge,
  resolveAgentViewPath,
} from "./discovery";

test("normalizeHumanPath removes query, hash, and trailing slash", () => {
  assert.equal(normalizeHumanPath("/dashboard/"), "/dashboard");
  assert.equal(normalizeHumanPath("journey/J-101?tab=notes"), "/journey/J-101");
  assert.equal(normalizeHumanPath("/about#team"), "/about");
  assert.equal(normalizeHumanPath("/"), "/");
  assert.equal(normalizeHumanPath(""), "/");
});

test("resolveAgentViewPath computes page-specific companion URLs", () => {
  assert.equal(resolveAgentViewPath({ path: "/" }), "/.agent");
  assert.equal(resolveAgentViewPath({ path: "/dashboard" }), "/dashboard.agent");
  assert.equal(
    resolveAgentViewPath({ path: "/dashboard/", origin: "https://example.com/" }),
    "https://example.com/dashboard.agent"
  );
  assert.equal(
    resolveAgentViewPath({ path: "/dashboard", suffix: "avl" }),
    "/dashboard.avl"
  );
});

test("renderAgentViewHeadLinks emits alternate and agent-view relations", () => {
  const html = renderAgentViewHeadLinks({ path: "/dashboard" });

  assert.match(
    html,
    /<link rel="alternate" type="text\/agent-view" href="\/dashboard\.agent"/
  );
  assert.match(
    html,
    /<link rel="agent-view" type="text\/agent-view" href="\/dashboard\.agent">/
  );
});

test("renderAgentViewBodyLink emits a crawlable anchor and escapes content", () => {
  const html = renderAgentViewBodyLink({
    path: "/quote",
    label: "Agent <view>",
    className: `agent "link"`,
  });

  assert.equal(
    html,
    `<a href="/quote.agent" rel="alternate agent-view" type="text/agent-view" data-avl-companion="page" class="agent &quot;link&quot;">Agent &lt;view&gt;</a>`
  );
});

test("renderAgentViewBodyLink can visually hide the crawlable anchor", () => {
  const html = renderAgentViewBodyLink({
    path: "/quote",
    presentation: "visually-hidden",
  });

  assert.match(html, /href="\/quote\.agent"/);
  assert.match(html, /data-avl-companion="page"/);
  assert.match(html, /style="position:absolute;width:1px;height:1px;/);
});

test("renderAvlBadge points at the current page companion", () => {
  const html = renderAvlBadge({ path: "/services/water-heater-installation" });

  assert.match(html, /data-avl-endpoint="\/services\/water-heater-installation\.agent"/);
  assert.match(html, /href="\/services\/water-heater-installation\.agent"/);
  assert.match(html, /data-avl-manifest="\/agent\.txt"/);
});

test("renderAgentViewLinkHeader advertises canonical and manifest links", () => {
  const header = renderAgentViewLinkHeader({
    path: "/dashboard",
    origin: "https://example.com",
  });

  assert.equal(
    header,
    `<https://example.com/dashboard>; rel="canonical", <https://example.com/agent.txt>; rel="agent-manifest"; type="text/plain"`
  );
});

test("renderAgentViewLinkHeader accepts relative and absolute manifest paths", () => {
  assert.equal(
    renderAgentViewLinkHeader({
      path: "/dashboard",
      manifestPath: "agent.txt",
      origin: "https://example.com",
    }),
    `<https://example.com/dashboard>; rel="canonical", <https://example.com/agent.txt>; rel="agent-manifest"; type="text/plain"`
  );
  assert.equal(
    renderAgentViewLinkHeader({
      path: "/dashboard",
      manifestPath: "https://cdn.example.com/agent.txt",
      origin: "https://example.com",
    }),
    `<https://example.com/dashboard>; rel="canonical", <https://cdn.example.com/agent.txt>; rel="agent-manifest"; type="text/plain"`
  );
});
