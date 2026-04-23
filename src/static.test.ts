import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  defaultResolveOutputPath,
  defineStaticAgentView,
  generateStaticAgentViews,
} from "./static";
import { serialize } from "./serialize";

test("defineStaticAgentView renders plain values", async () => {
  const view = defineStaticAgentView({
    intent: {
      purpose: "Austin plumber landing",
      audience: ["homeowner"],
      capability: ["call", "book"],
    },
    state: { city: "Austin, TX", hours: "24/7" },
    actions: [
      { id: "call_dispatch", method: "GET", href: "tel:+15125550123" },
    ],
    context: "Licensed master plumbers.",
    nav: { parents: ["/"] },
    meta: { ttl: "1d" },
  });

  const doc = await view.render("/austin-plumber", "2026-04-23T00:00:00.000Z");

  assert.equal(doc.meta.v, 1);
  assert.equal(doc.meta.route, "/austin-plumber");
  assert.equal(doc.meta.generated, "2026-04-23T00:00:00.000Z");
  assert.equal(doc.meta.ttl, "1d");
  assert.equal(doc.meta.auth, undefined);
  assert.deepEqual(doc.state, { city: "Austin, TX", hours: "24/7" });
  assert.equal(doc.actions?.length, 1);
  assert.equal(doc.actions?.[0]?.href, "tel:+15125550123");
  assert.equal(doc.context, "Licensed master plumbers.");
  assert.deepEqual(doc.nav, { parents: ["/"] });
});

test("defineStaticAgentView resolves async producers", async () => {
  const view = defineStaticAgentView({
    intent: {
      purpose: "Build-time-loaded page",
      audience: ["agent"],
      capability: ["read"],
    },
    state: async () => ({ loaded: "from-disk", count: 3 }),
    actions: async () => [
      { id: "subscribe", method: "POST", href: "/api/subscribe" },
    ],
    context: async () => "Context computed at build time.",
    nav: async () => ({ peers: ["/a", "/b"] }),
  });

  const doc = await view.render("/producer-demo");

  assert.deepEqual(doc.state, { loaded: "from-disk", count: 3 });
  assert.equal(doc.actions?.[0]?.id, "subscribe");
  assert.equal(doc.context, "Context computed at build time.");
  assert.deepEqual(doc.nav, { peers: ["/a", "/b"] });
});

test("defineStaticAgentView omits auth in @meta (round-trip through serialize)", async () => {
  const view = defineStaticAgentView({
    intent: {
      purpose: "No auth, static content",
      audience: ["public"],
      capability: ["read"],
    },
    state: { x: 1 },
  });
  const doc = await view.render("/noauth", "2026-01-01T00:00:00.000Z");
  const out = serialize(doc);

  assert.ok(out.includes("@meta"));
  assert.ok(out.includes("route: /noauth"));
  assert.ok(out.includes("generated: 2026-01-01T00:00:00.000Z"));
  assert.ok(!out.includes("auth:"), "auth: must not appear for static views");
  assert.ok(out.includes("@intent"));
  assert.ok(out.includes("purpose:    No auth, static content"));
  assert.ok(out.includes("@state"));
});

test("defaultResolveOutputPath handles root, nested, and trailing-slash URLs", () => {
  assert.equal(defaultResolveOutputPath("/"), "index.agent");
  assert.equal(defaultResolveOutputPath(""), "index.agent");
  assert.equal(defaultResolveOutputPath("/about-us"), "about-us.agent");
  assert.equal(defaultResolveOutputPath("/about-us/"), "about-us.agent");
  assert.equal(defaultResolveOutputPath("/blog/post-1"), "blog/post-1.agent");
  assert.equal(
    defaultResolveOutputPath("/docs/getting-started/"),
    "docs/getting-started.agent"
  );
});

test("generateStaticAgentViews writes .agent files with correct content", async () => {
  const dir = await mkdtemp(join(tmpdir(), "avl-static-"));
  try {
    const home = defineStaticAgentView({
      intent: {
        purpose: "Home",
        audience: ["public"],
        capability: ["read"],
      },
      state: { tagline: "Welcome" },
    });
    const about = defineStaticAgentView({
      intent: {
        purpose: "About us",
        audience: ["public"],
        capability: ["read"],
      },
      state: { founded: 1998, city: "Austin, TX" },
      actions: [
        { id: "call_dispatch", method: "GET", href: "tel:+15125550123" },
      ],
      context: "Plumbing contractor serving Austin since 1998.",
    });
    const post = defineStaticAgentView({
      intent: {
        purpose: "Blog post",
        audience: ["reader"],
        capability: ["read"],
      },
      state: { title: "Hello, world", tags: ["intro"] },
    });

    const result = await generateStaticAgentViews({
      outDir: dir,
      pages: [
        { url: "/", view: home },
        { url: "/about-us", view: about },
        { url: "/blog/post-1", view: post },
      ],
      generatedAt: "2026-04-23T10:00:00.000Z",
    });

    assert.equal(result.written.length, 3);

    const homeTxt = await readFile(join(dir, "index.agent"), "utf8");
    const aboutTxt = await readFile(join(dir, "about-us.agent"), "utf8");
    const postTxt = await readFile(join(dir, "blog/post-1.agent"), "utf8");

    // Home
    assert.ok(homeTxt.includes("route: /"));
    assert.ok(homeTxt.includes("generated: 2026-04-23T10:00:00.000Z"));
    assert.ok(homeTxt.includes("purpose:    Home"));
    assert.ok(homeTxt.includes("tagline: Welcome"));

    // About — TOON quotes strings containing commas.
    assert.ok(aboutTxt.includes("route: /about-us"));
    assert.ok(aboutTxt.includes(`city: "Austin, TX"`));
    assert.ok(aboutTxt.includes("founded: 1998"));
    assert.ok(aboutTxt.includes("tel:+15125550123"));
    assert.ok(aboutTxt.includes("@context"));
    assert.ok(aboutTxt.includes("> Plumbing contractor"));

    // Nested — TOON quotes strings containing commas.
    assert.ok(postTxt.includes("route: /blog/post-1"));
    assert.ok(postTxt.includes(`title: "Hello, world"`));
    assert.ok(postTxt.includes("tags[1]: intro"));

    // No auth line in any static emission.
    assert.ok(!homeTxt.includes("auth:"));
    assert.ok(!aboutTxt.includes("auth:"));
    assert.ok(!postTxt.includes("auth:"));

    // Shared build timestamp across pages.
    for (const f of result.written) {
      const txt = await readFile(f, "utf8");
      assert.ok(txt.includes("generated: 2026-04-23T10:00:00.000Z"));
    }
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("generateStaticAgentViews respects per-page outputPath override", async () => {
  const dir = await mkdtemp(join(tmpdir(), "avl-static-override-"));
  try {
    const v = defineStaticAgentView({
      intent: {
        purpose: "Custom file placement",
        audience: ["public"],
        capability: ["read"],
      },
    });

    const result = await generateStaticAgentViews({
      outDir: dir,
      pages: [
        { url: "/custom", view: v, outputPath: "nested/custom-filename.agent" },
      ],
    });

    assert.equal(result.written.length, 1);
    const txt = await readFile(join(dir, "nested/custom-filename.agent"), "utf8");
    assert.ok(txt.includes("route: /custom"));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("generateStaticAgentViews uses custom resolveOutputPath hook", async () => {
  const dir = await mkdtemp(join(tmpdir(), "avl-static-resolver-"));
  try {
    const v = defineStaticAgentView({
      intent: {
        purpose: "Sibling-of-index layout",
        audience: ["public"],
        capability: ["read"],
      },
    });

    // Some static-site layouts prefer `about-us/index.agent` instead of
    // `about-us.agent`. The hook lets consumers pick that layout.
    const result = await generateStaticAgentViews({
      outDir: dir,
      pages: [{ url: "/about-us", view: v }],
      resolveOutputPath: (url) => {
        const noLead = url.startsWith("/") ? url.slice(1) : url;
        return noLead === "" ? "index.agent" : `${noLead}/index.agent`;
      },
    });

    assert.equal(result.written.length, 1);
    const txt = await readFile(join(dir, "about-us/index.agent"), "utf8");
    assert.ok(txt.includes("route: /about-us"));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
