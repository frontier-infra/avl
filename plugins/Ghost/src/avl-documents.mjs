const DEFAULT_TTL = "5m";

function compactText(value, max = 220) {
  const text = String(value ?? "").replace(/\s+/g, " ").trim();
  return text.length > max ? `${text.slice(0, max - 1).trim()}…` : text;
}

function stripHtml(value) {
  return String(value ?? "").replace(/<[^>]*>/g, " ");
}

function routeForContent(content) {
  const path = new URL(content.url).pathname.replace(/\/+$/, "");
  return path === "" ? "/" : path;
}

function agentPathForContent(content) {
  const route = routeForContent(content);
  return route === "/" ? "/.agent" : `${route}.agent`;
}

function baseMeta(route, ttl) {
  return {
    v: 1,
    route,
    generated: new Date().toISOString(),
    ttl: ttl || DEFAULT_TTL,
  };
}

function contentState(content, type) {
  return {
    id: content.id,
    uuid: content.uuid,
    type,
    slug: content.slug,
    title: content.title,
    url: content.url,
    excerpt: compactText(content.excerpt || stripHtml(content.html)),
    featured: Boolean(content.featured),
    visibility: content.visibility,
    published: content.published_at,
    updated: content.updated_at,
    authors: (content.authors ?? []).map((author) => ({
      id: author.id,
      slug: author.slug,
      name: author.name,
      url: author.url,
    })),
    tags: (content.tags ?? []).map((tag) => ({
      id: tag.id,
      slug: tag.slug,
      name: tag.name,
      url: tag.url,
    })),
  };
}

export function buildSiteDocument({ site, posts = [], pages = [], ttl }) {
  const recent = [...posts, ...pages].slice(0, 15).map((item) => ({
    type: item.primary_tag ? "post" : "page",
    slug: item.slug,
    title: item.title,
    published: item.published_at,
    url: item.url,
    agent: agentPathForContent(item),
  }));

  return {
    meta: baseMeta("/", ttl),
    intent: {
      purpose: `Ghost publication: ${site.title ?? site.name ?? "Untitled"}`,
      audience: ["reader", "agent"],
      capability: ["read", "navigate", "subscribe"],
    },
    state: {
      title: site.title ?? site.name,
      description: site.description,
      url: site.url,
      icon: site.icon,
      logo: site.logo,
      recent,
    },
    actions: [
      { id: "view_human", method: "GET", href: site.url },
      { id: "subscribe", method: "GET", href: `${String(site.url).replace(/\/+$/, "")}/#/portal/signup` },
    ],
    context: `${site.title ?? "This Ghost publication"} exposes AVL companions for posts, pages, tags, and authors.`,
    nav: {
      self: "/.agent",
      drilldown: "/{slug}.agent",
    },
  };
}

export function buildContentDocument({ content, type, ttl }) {
  const route = routeForContent(content);
  const title = content.title ?? content.name ?? content.slug;
  const parent = type === "page" ? "/.agent" : type === "post" ? "/.agent" : "/.agent";

  return {
    meta: baseMeta(route, ttl),
    intent: {
      purpose: `${type === "post" ? "Ghost post" : "Ghost page"}: ${title}`,
      audience: ["reader", "agent"],
      capability: ["read", "share", "subscribe"],
    },
    state: contentState(content, type),
    actions: [
      { id: "view_human", method: "GET", href: content.url },
      { id: "subscribe", method: "GET", href: `${new URL(content.url).origin}/#/portal/signup` },
    ],
    context: compactText(content.excerpt || stripHtml(content.html) || `${title} published on Ghost.`),
    nav: {
      self: agentPathForContent(content),
      parents: [parent],
      peers: [
        content.primary_tag?.url ? `${new URL(content.primary_tag.url).pathname.replace(/\/+$/, "")}.agent` : null,
        content.primary_author?.url ? `${new URL(content.primary_author.url).pathname.replace(/\/+$/, "")}.agent` : null,
      ].filter(Boolean),
    },
  };
}

export function buildTagDocument({ tag, posts = [], ttl }) {
  const path = new URL(tag.url).pathname.replace(/\/+$/, "");
  return {
    meta: baseMeta(path, ttl),
    intent: {
      purpose: `Ghost tag archive: ${tag.name}`,
      audience: ["reader", "agent"],
      capability: ["browse", "read"],
    },
    state: {
      id: tag.id,
      slug: tag.slug,
      name: tag.name,
      description: tag.description,
      url: tag.url,
      post_count: tag.count?.posts,
      posts: posts.map((post) => ({
        slug: post.slug,
        title: post.title,
        published: post.published_at,
        url: post.url,
        agent: agentPathForContent(post),
      })),
    },
    actions: [{ id: "view_human", method: "GET", href: tag.url }],
    context: compactText(tag.description || `Posts tagged ${tag.name}.`),
    nav: {
      self: `${path}.agent`,
      parents: ["/.agent"],
      drilldown: "/{slug}.agent",
    },
  };
}

export function buildAuthorDocument({ author, posts = [], ttl }) {
  const path = new URL(author.url).pathname.replace(/\/+$/, "");
  return {
    meta: baseMeta(path, ttl),
    intent: {
      purpose: `Ghost author archive: ${author.name}`,
      audience: ["reader", "agent"],
      capability: ["browse", "read"],
    },
    state: {
      id: author.id,
      slug: author.slug,
      name: author.name,
      bio: author.bio,
      location: author.location,
      website: author.website,
      url: author.url,
      post_count: author.count?.posts,
      posts: posts.map((post) => ({
        slug: post.slug,
        title: post.title,
        published: post.published_at,
        url: post.url,
        agent: agentPathForContent(post),
      })),
    },
    actions: [{ id: "view_human", method: "GET", href: author.url }],
    context: compactText(author.bio || `Posts by ${author.name}.`),
    nav: {
      self: `${path}.agent`,
      parents: ["/.agent"],
      drilldown: "/{slug}.agent",
    },
  };
}

export function buildNotFoundDocument(route, ttl = "1m") {
  return {
    meta: baseMeta(route, ttl),
    intent: {
      purpose: "Ghost agent view not found",
      audience: ["agent"],
      capability: ["read"],
    },
    state: {
      found: false,
      route,
    },
    context: "No published Ghost content resolved for this AVL route.",
    nav: {
      parents: ["/.agent"],
    },
  };
}

export function renderManifest({ siteUrl, ttl = DEFAULT_TTL }) {
  return [
    "# AVL Manifest",
    "# Discovery file for AI agents. Like robots.txt but for agent-native views.",
    "",
    "version: 1",
    "content-type: text/agent-view; version=1",
    "producer: ghost",
    "adapter: avl-ghost-adapter 0.1.0",
    "",
    "discovery:",
    "  - suffix",
    "  - html-link",
    "",
    "session:",
    "  mechanisms: [none]",
    "  scope: public-content",
    "",
    "routes:",
    "  - GET /.agent",
    "  - GET /{slug}.agent",
    "  - GET /tag/{slug}.agent",
    "  - GET /author/{slug}.agent",
    "",
    "fetcher_hints:",
    "  safe_methods: [GET, HEAD]",
    "  body_link: true",
    "  head_link: true",
    "  conditional_requests: false",
    "",
    `ttl: ${ttl}`,
    `origin: ${siteUrl}`,
    "spec: https://github.com/frontier-infra/avl/blob/main/specs/avl-agent-view-layer.md",
    "",
  ].join("\n");
}
