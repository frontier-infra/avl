// Agent View Layer — static site support.
//
// Unlike `defineAgentView` (which renders per-request against an authenticated
// session), `defineStaticAgentView` describes a view whose content is known at
// build time. No request context, no auth, no RBAC filtering. Suitable for:
//
//   - Marketing pages (service areas, pricing, contact)
//   - Blog posts and article indexes
//   - Documentation sites
//   - Product pages on static e-commerce builds
//   - Any content page whose @state is facts, not per-user data
//
// The companion `generateStaticAgentViews` helper emits `.agent` files into a
// static site's output directory, one per page, so consumers can curl them the
// same way they would an authenticated AVL view.

import { serialize } from "./serialize";
import type {
  AgentAction,
  AgentIntent,
  AgentMeta,
  AgentNav,
  AgentViewDocument,
} from "./types";

/**
 * Zero-argument producer. Lets a static view pull data from the filesystem,
 * frontmatter, an async content source, etc. at build time.
 */
export type StaticProducer<T> = () => T | Promise<T>;

/**
 * Configuration for a static (build-time) agent view.
 *
 * Every field except `intent` is optional. Any field that accepts a value can
 * also accept a zero-arg (possibly async) producer — useful when the value is
 * pulled from a file read, a fetch, or a computed summary.
 */
export type StaticAgentViewConfig<S = unknown> = {
  intent: AgentIntent;
  /** Structured data backing this page. For static content this is facts (city, prices, FAQ answers), not user data. */
  state?: S | StaticProducer<S>;
  /** Actions available from this page. `tel:`, `mailto:`, external URLs, or POST endpoints — all fine. */
  actions?: AgentAction[] | StaticProducer<AgentAction[]>;
  /** Narrative summary of what this page says. */
  context?: string | StaticProducer<string>;
  /** Navigation: self, parents, peers, drilldown. */
  nav?: AgentNav | StaticProducer<AgentNav>;
  /** Optional meta (ttl, redacted). `auth` is never set for static views. */
  meta?: AgentMeta;
};

export type DefinedStaticAgentView<S = unknown> = {
  config: StaticAgentViewConfig<S>;
  /**
   * Render this static view into an `AgentViewDocument`. The `route` argument
   * is stamped into `@meta.route`. The `generatedAt` override lets a generator
   * stamp every page in a build with the same deterministic timestamp.
   */
  render: (route: string, generatedAt?: string) => Promise<AgentViewDocument>;
};

async function resolve<T>(v: T | StaticProducer<T> | undefined): Promise<T | undefined> {
  if (typeof v === "function") return await (v as StaticProducer<T>)();
  return v;
}

/**
 * Define an agent view whose content is known at build time.
 *
 * ```ts
 * export default defineStaticAgentView({
 *   intent: {
 *     purpose: "Plumbing services in Austin, TX",
 *     audience: ["homeowner", "property-manager"],
 *     capability: ["book", "quote", "call"],
 *   },
 *   state: {
 *     city: "Austin, TX",
 *     services: ["leak repair", "water heater install"],
 *     hours: "24/7 emergency",
 *   },
 *   actions: [
 *     { id: "call_dispatch", method: "GET", href: "tel:+15125550123" },
 *     { id: "request_quote", method: "GET", href: "mailto:quotes@example.com" },
 *   ],
 *   context: "Licensed master plumbers serving Austin since 1998.",
 * });
 * ```
 */
export function defineStaticAgentView<S = unknown>(
  config: StaticAgentViewConfig<S>
): DefinedStaticAgentView<S> {
  return {
    config,
    async render(route, generatedAt) {
      const state = await resolve(config.state);
      const actions = await resolve(config.actions);
      const context = await resolve(config.context);
      const nav = await resolve(config.nav);

      return {
        meta: {
          v: 1,
          route,
          generated: generatedAt ?? new Date().toISOString(),
          ttl: config.meta?.ttl,
          redacted: config.meta?.redacted,
        },
        intent: config.intent,
        state: state as Record<string, unknown> | undefined,
        actions,
        context,
        nav,
      };
    },
  };
}

// ---------------------------------------------------------------------------
// Static site generation
// ---------------------------------------------------------------------------

export type StaticPageEntry = {
  /**
   * The public URL this page is served at, e.g. `"/"`, `"/about-us"`,
   * `"/blog/post-1"`. Stamped into `@meta.route`.
   */
  url: string;
  /** The static agent view for this page. */
  view: DefinedStaticAgentView<unknown>;
  /**
   * Override for the emitted file path, relative to `outDir`. If omitted, a
   * path is derived from `url` via the default convention:
   *
   *   "/"            → "index.agent"
   *   "/about-us"    → "about-us.agent"
   *   "/blog/post-1" → "blog/post-1.agent"
   *
   * This mirrors AVL's URL convention (`/about-us` ↔ `/about-us.agent`), where
   * the `.agent` file sits at the filesystem root alongside the corresponding
   * `about-us/index.html` directory, not inside it.
   */
  outputPath?: string;
};

export type GenerateStaticAgentViewsOptions = {
  /**
   * Root directory the `.agent` files will be written into. Usually the
   * static site's build output (e.g. `"dist"`, `"out"`, `"public"`,
   * `"_site"`).
   */
  outDir: string;
  /** The pages to generate `.agent` files for. */
  pages: StaticPageEntry[];
  /**
   * Override the default URL → output-path mapping. Per-page `outputPath`
   * still wins if set.
   */
  resolveOutputPath?: (url: string) => string;
  /**
   * Optional build timestamp (ISO 8601). Defaults to the current time at
   * invocation. Pass a stable value to make every `.agent` in a build share
   * one timestamp — useful for reproducible builds.
   */
  generatedAt?: string;
};

export type GenerateStaticAgentViewsResult = {
  /** Absolute paths of every `.agent` file written. */
  written: string[];
};

/**
 * Default mapping from AVL URL → file path (relative to `outDir`).
 *
 *   "/"            → "index.agent"
 *   "/about-us"    → "about-us.agent"
 *   "/blog/post-1" → "blog/post-1.agent"
 */
export function defaultResolveOutputPath(url: string): string {
  const noLead = url.startsWith("/") ? url.slice(1) : url;
  const trimmed = noLead.replace(/\/+$/, "");
  if (trimmed === "") return "index.agent";
  return `${trimmed}.agent`;
}

/**
 * Render every `StaticPageEntry` and write its `.agent` file into `outDir`.
 *
 * Intended as a final step of any static-site build pipeline:
 *
 * ```ts
 * import { generateStaticAgentViews } from "@frontier-infra/avl";
 * import homeAgent from "./src/pages/index.agent";
 * import aboutAgent from "./src/pages/about.agent";
 *
 * await generateStaticAgentViews({
 *   outDir: "dist",
 *   pages: [
 *     { url: "/",          view: homeAgent  },
 *     { url: "/about-us",  view: aboutAgent },
 *   ],
 * });
 * ```
 *
 * The generator is framework-agnostic. Caller owns discovery; generator owns
 * serialization and emission.
 */
export async function generateStaticAgentViews(
  options: GenerateStaticAgentViewsOptions
): Promise<GenerateStaticAgentViewsResult> {
  const fs = await import("node:fs/promises");
  const path = await import("node:path");

  const resolveOutputPath = options.resolveOutputPath ?? defaultResolveOutputPath;
  const generatedAt = options.generatedAt ?? new Date().toISOString();
  const written: string[] = [];

  for (const page of options.pages) {
    const doc = await page.view.render(page.url, generatedAt);
    const relPath = page.outputPath ?? resolveOutputPath(page.url);
    const absPath = path.resolve(options.outDir, relPath);
    await fs.mkdir(path.dirname(absPath), { recursive: true });
    await fs.writeFile(absPath, serialize(doc), "utf8");
    written.push(absPath);
  }

  return { written };
}
