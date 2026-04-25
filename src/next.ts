import { serialize } from "./serialize";
import { resolveAgentView } from "./registry";
import {
  renderAgentViewBodyLink,
  renderAgentViewHeadLinks,
  renderAgentViewLinkHeader,
  resolveAgentViewPath,
} from "./discovery";
import type { RegistryEntry } from "./registry";
import type { AgentSession } from "./types";
import type {
  AgentViewBodyLinkOptions,
  AgentViewHeadLinkOptions,
} from "./discovery";

const CT = "text/agent-view; version=1";

export type AgentViewHandlerOptions = {
  /** Resolve the authenticated session from the incoming request. */
  resolveSession: (req: Request) => Promise<AgentSession | null>;
  /** Registered agent view routes. */
  routes: RegistryEntry[];
  /** Manifest URL advertised in Link headers. Defaults to "/agent.txt". */
  manifestPath?: string;
};

/**
 * Create a Next.js App Router GET handler for the AVL catch-all route.
 *
 * Usage:
 * ```ts
 * // app/agent/[[...path]]/route.ts
 * import { createAgentViewHandler } from "avl/next";
 * export const GET = createAgentViewHandler({ resolveSession, routes });
 * ```
 */
export function createAgentViewHandler(options: AgentViewHandlerOptions) {
  return async function GET(
    req: Request,
    { params }: { params: Promise<{ path?: string[] }> }
  ) {
    const { path } = await params;
    const route = "/" + (path?.join("/") ?? "");
    const trimmed = route === "/" ? "/" : route.replace(/\/$/, "");
    const headers = agentViewResponseHeaders(
      trimmed,
      options.manifestPath,
      new URL(req.url).origin
    );

    const resolved = resolveAgentView(options.routes, trimmed);
    if (!resolved) {
      const body =
        `@meta\n  v: 1\n  status: 404\n  route: ${trimmed}\n\n` +
        `@intent\n  purpose:    No agent view registered for this route\n` +
        `  audience:   any\n  capability: none\n`;
      return new Response(body, {
        status: 404,
        headers,
      });
    }

    const user = await options.resolveSession(req);
    if (!user) {
      const body =
        `@meta\n  v: 1\n  status: 401\n  route: ${trimmed}\n\n` +
        `@intent\n  purpose:    Authentication required\n` +
        `  audience:   any\n  capability: none\n`;
      return new Response(body, {
        status: 401,
        headers,
      });
    }

    const partial = await resolved.view.render({
      user,
      params: resolved.params,
    });

    const body = serialize({
      meta: {
        v: 1,
        route: trimmed,
        generated: new Date().toISOString(),
        ttl: resolved.view.config.meta?.ttl,
        redacted: resolved.view.config.meta?.redacted,
        auth: `session(${user.role}:${user.id})`,
      },
      ...partial,
      nav: partial.nav
        ? { self: resolveAgentViewPath({ path: trimmed }), ...partial.nav }
        : undefined,
    });

    return new Response(body, {
      headers: {
        ...headers,
        "Cache-Control": "private, max-age=30",
      },
    });
  };
}

function agentViewResponseHeaders(
  route: string,
  manifestPath = "/agent.txt",
  origin?: string
) {
  return {
    "Content-Type": CT,
    "Vary": "Accept, Cookie, Authorization",
    "Link": renderAgentViewLinkHeader({ path: route, manifestPath, origin }),
    "X-Agent-View-Version": "1",
  };
}

/**
 * Dependency-free helper for Next metadata/head integrations.
 *
 * For server components, render this string in a custom head or use the core
 * helper from "@frontier-infra/avl" if your framework owns document markup.
 */
export function agentViewHeadLinks(options: AgentViewHeadLinkOptions): string {
  return renderAgentViewHeadLinks(options);
}

/** Render the body-level per-page discovery anchor for a Next page/footer. */
export function agentViewBodyLink(options: AgentViewBodyLinkOptions): string {
  return renderAgentViewBodyLink(options);
}

export type { AgentViewHandlerOptions as CreateAgentViewHandlerOptions };
