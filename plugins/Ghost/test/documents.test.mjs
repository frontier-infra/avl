import test from "node:test";
import assert from "node:assert/strict";

import {
  buildContentDocument,
  buildSiteDocument,
  renderManifest,
} from "../src/avl-documents.mjs";

const post = {
  id: "1",
  uuid: "u1",
  slug: "hello-ghost",
  title: "Hello Ghost",
  url: "https://example.com/hello-ghost/",
  excerpt: "Ghost content with AVL.",
  featured: false,
  visibility: "public",
  published_at: "2026-05-01T12:00:00.000Z",
  updated_at: "2026-05-01T12:00:00.000Z",
  authors: [{ id: "a1", slug: "ada", name: "Ada", url: "https://example.com/author/ada/" }],
  tags: [{ id: "t1", slug: "news", name: "News", url: "https://example.com/tag/news/" }],
  primary_author: { slug: "ada", url: "https://example.com/author/ada/" },
  primary_tag: { slug: "news", url: "https://example.com/tag/news/" },
};

test("builds site document from Ghost site and recent content", () => {
  const doc = buildSiteDocument({
    site: { title: "Example Ghost", description: "Publishing", url: "https://example.com" },
    posts: [post],
    pages: [],
    ttl: "10m",
  });

  assert.equal(doc.meta.route, "/");
  assert.equal(doc.meta.ttl, "10m");
  assert.equal(doc.state.recent[0].agent, "/hello-ghost.agent");
  assert.equal(doc.actions[0].href, "https://example.com");
});

test("builds post document with state, actions, and nav", () => {
  const doc = buildContentDocument({ content: post, type: "post", ttl: "5m" });

  assert.equal(doc.meta.route, "/hello-ghost");
  assert.equal(doc.intent.purpose, "Ghost post: Hello Ghost");
  assert.equal(doc.state.tags[0].slug, "news");
  assert.equal(doc.nav.self, "/hello-ghost.agent");
  assert.deepEqual(doc.nav.peers, ["/tag/news.agent", "/author/ada.agent"]);
});

test("renders Ghost AVL manifest", () => {
  const manifest = renderManifest({ siteUrl: "https://example.com", ttl: "5m" });

  assert.match(manifest, /producer: ghost/);
  assert.match(manifest, /GET \/\{slug\}\.agent/);
  assert.match(manifest, /origin: https:\/\/example.com/);
});
