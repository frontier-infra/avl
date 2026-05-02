export class GhostContentApi {
  constructor({ url, key, version = "v6.0", fetchImpl = globalThis.fetch }) {
    if (!url) throw new Error("Ghost URL is required");
    if (!key) throw new Error("Ghost Content API key is required");
    if (!fetchImpl) throw new Error("fetch is required");
    this.url = url.replace(/\/+$/, "");
    this.key = key;
    this.version = version;
    this.fetchImpl = fetchImpl;
  }

  async site() {
    const json = await this.request("settings/", {});
    return json.settings;
  }

  async posts(params = {}) {
    const json = await this.request("posts/", {
      include: "authors,tags",
      limit: "15",
      order: "published_at desc",
      ...params,
    });
    return json.posts ?? [];
  }

  async pages(params = {}) {
    const json = await this.request("pages/", {
      include: "authors,tags",
      limit: "15",
      order: "published_at desc",
      ...params,
    });
    return json.pages ?? [];
  }

  async tags(params = {}) {
    const json = await this.request("tags/", {
      include: "count.posts",
      limit: "15",
      ...params,
    });
    return json.tags ?? [];
  }

  async authors(params = {}) {
    const json = await this.request("authors/", {
      include: "count.posts",
      limit: "15",
      ...params,
    });
    return json.authors ?? [];
  }

  async postBySlug(slug) {
    const posts = await this.posts({ filter: `slug:${slug}`, limit: "1" });
    return posts[0] ?? null;
  }

  async pageBySlug(slug) {
    const pages = await this.pages({ filter: `slug:${slug}`, limit: "1" });
    return pages[0] ?? null;
  }

  async tagBySlug(slug) {
    const tags = await this.tags({ filter: `slug:${slug}`, limit: "1" });
    return tags[0] ?? null;
  }

  async authorBySlug(slug) {
    const authors = await this.authors({ filter: `slug:${slug}`, limit: "1" });
    return authors[0] ?? null;
  }

  async request(resource, params) {
    const url = new URL(`${this.url}/ghost/api/content/${resource}`);
    url.searchParams.set("key", this.key);
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }

    const response = await this.fetchImpl(url, {
      headers: { "Accept-Version": this.version },
    });

    if (!response.ok) {
      throw new Error(`Ghost Content API ${response.status} for ${resource}`);
    }

    return response.json();
  }
}
