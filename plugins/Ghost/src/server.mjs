import { createServer } from "node:http";

import { GhostContentApi } from "./ghost-content-api.mjs";
import {
  buildAuthorDocument,
  buildContentDocument,
  buildNotFoundDocument,
  buildSiteDocument,
  buildTagDocument,
  renderManifest,
} from "./avl-documents.mjs";
import { serialize } from "./serialize.mjs";

const config = {
  port: Number(process.env.PORT ?? "49232"),
  ghostUrl: process.env.GHOST_URL,
  contentApiKey: process.env.GHOST_CONTENT_API_KEY,
  apiVersion: process.env.GHOST_API_VERSION ?? "v6.0",
  ttl: process.env.AVL_TTL ?? "5m",
};

function text(response, status, body, contentType = "text/plain; charset=utf-8") {
  response.writeHead(status, {
    "Content-Type": contentType,
    "Cache-Control": "public, max-age=60",
    "Access-Control-Allow-Origin": "*",
  });
  response.end(body);
}

function agent(response, status, document) {
  text(response, status, serialize(document), "text/agent-view; version=1; charset=utf-8");
}

function normalizeAgentPath(pathname) {
  if (pathname === "/.agent" || pathname === "/agent") {
    return { type: "site", route: "/" };
  }

  if (pathname === "/agent.txt") {
    return { type: "manifest", route: "/agent.txt" };
  }

  if (pathname.endsWith("/agent")) {
    const route = pathname.slice(0, -"/agent".length).replace(/\/+$/, "") || "/";
    return routeToTarget(route);
  }

  if (pathname.endsWith(".agent")) {
    const route = pathname.slice(0, -".agent".length) || "/";
    return routeToTarget(route);
  }

  return null;
}

function routeToTarget(route) {
  const clean = route.replace(/\/+$/, "") || "/";
  const parts = clean.split("/").filter(Boolean).map(decodeURIComponent);

  if (parts[0] === "tag" && parts[1]) {
    return { type: "tag", slug: parts[1], route: `/tag/${parts[1]}` };
  }

  if (parts[0] === "author" && parts[1]) {
    return { type: "author", slug: parts[1], route: `/author/${parts[1]}` };
  }

  if (parts.length > 0) {
    return { type: "content", slug: parts.at(-1), route: clean };
  }

  return { type: "site", route: "/" };
}

async function resolveDocument(api, target) {
  if (target.type === "site") {
    const [site, posts, pages] = await Promise.all([
      api.site(),
      api.posts({ limit: "10" }),
      api.pages({ limit: "5" }),
    ]);
    return { status: 200, document: buildSiteDocument({ site, posts, pages, ttl: config.ttl }) };
  }

  if (target.type === "content") {
    const content = (await api.postBySlug(target.slug)) ?? (await api.pageBySlug(target.slug));
    if (!content) return { status: 404, document: buildNotFoundDocument(target.route) };
    const type = content.type ?? (content.primary_author || content.primary_tag ? "post" : "page");
    return { status: 200, document: buildContentDocument({ content, type, ttl: config.ttl }) };
  }

  if (target.type === "tag") {
    const tag = await api.tagBySlug(target.slug);
    if (!tag) return { status: 404, document: buildNotFoundDocument(target.route) };
    const posts = await api.posts({ filter: `tag:${target.slug}`, limit: "15" });
    return { status: 200, document: buildTagDocument({ tag, posts, ttl: config.ttl }) };
  }

  if (target.type === "author") {
    const author = await api.authorBySlug(target.slug);
    if (!author) return { status: 404, document: buildNotFoundDocument(target.route) };
    const posts = await api.posts({ filter: `author:${target.slug}`, limit: "15" });
    return { status: 200, document: buildAuthorDocument({ author, posts, ttl: config.ttl }) };
  }

  return { status: 404, document: buildNotFoundDocument(target.route ?? "/") };
}

export function createGhostAvlServer(options = {}) {
  const effective = { ...config, ...options };

  return createServer(async (request, response) => {
    try {
      const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);

      if (url.pathname === "/healthz") {
        text(response, 200, "ok\n");
        return;
      }

      const target = normalizeAgentPath(url.pathname);
      if (!target) {
        text(response, 404, "Not found\n");
        return;
      }

      if (target.type === "manifest") {
        text(response, 200, renderManifest({ siteUrl: effective.ghostUrl, ttl: effective.ttl }));
        return;
      }

      const api = new GhostContentApi({
        url: effective.ghostUrl,
        key: effective.contentApiKey,
        version: effective.apiVersion,
        fetchImpl: effective.fetchImpl,
      });
      const { status, document } = await resolveDocument(api, target);
      agent(response, status, document);
    } catch (error) {
      text(response, 500, `AVL Ghost adapter error: ${error.message}\n`);
    }
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const server = createGhostAvlServer();
  server.listen(config.port, () => {
    console.log(`AVL Ghost adapter listening on http://localhost:${config.port}`);
  });
}
