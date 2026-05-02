import test from "node:test";
import assert from "node:assert/strict";

import { createGhostAvlServer } from "../src/server.mjs";

function fakeFetch(url) {
  const path = url.pathname;
  const filter = url.searchParams.get("filter");

  if (path.endsWith("/settings/")) {
    return ok({ settings: { title: "Ghost Test", description: "Test site", url: "http://ghost.local" } });
  }

  if (path.endsWith("/posts/")) {
    if (filter === "slug:hello") {
      return ok({ posts: [content("post", "hello", "Hello")] });
    }
    if (filter === "slug:missing") return ok({ posts: [] });
    return ok({ posts: [content("post", "hello", "Hello")] });
  }

  if (path.endsWith("/pages/")) {
    if (filter === "slug:missing") return ok({ pages: [] });
    return ok({ pages: [] });
  }

  if (path.endsWith("/tags/")) return ok({ tags: [] });
  if (path.endsWith("/authors/")) return ok({ authors: [] });

  return { ok: false, status: 404, json: async () => ({}) };
}

function ok(body) {
  return { ok: true, status: 200, json: async () => body };
}

function content(type, slug, title) {
  return {
    id: "1",
    uuid: "uuid",
    type,
    slug,
    title,
    url: `http://ghost.local/${slug}/`,
    excerpt: "A test Ghost post.",
    featured: false,
    visibility: "public",
    published_at: "2026-05-01T00:00:00.000Z",
    updated_at: "2026-05-01T00:00:00.000Z",
    authors: [],
    tags: [],
  };
}

test("server emits manifest and agent view", async () => {
  const server = createGhostAvlServer({
    ghostUrl: "http://ghost.local",
    contentApiKey: "test-key",
    fetchImpl: fakeFetch,
  });

  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();

  try {
    const manifest = await fetch(`http://127.0.0.1:${port}/agent.txt`);
    assert.equal(manifest.status, 200);
    assert.match(await manifest.text(), /producer: ghost/);

    const page = await fetch(`http://127.0.0.1:${port}/hello.agent`);
    assert.equal(page.status, 200);
    assert.equal(page.headers.get("content-type"), "text/agent-view; version=1; charset=utf-8");
    assert.match(await page.text(), /Ghost post: Hello/);

    const missing = await fetch(`http://127.0.0.1:${port}/missing.agent`);
    assert.equal(missing.status, 404);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
