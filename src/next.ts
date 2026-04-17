import { serialize } from "./serialize";
import { resolveAgentView } from "./registry";
import type { RegistryEntry } from "./registry";
import type { AgentSession } from "./types";

const CT = "text/agent-view; version=1";

export type AgentViewHandlerOptions = {
  /** Resolve the authenticated session from the incoming request. */
  resolveSession: (req: Request) => Promise<AgentSession | null>;
  /** Registered agent view routes. */
  routes: RegistryEntry[];
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

    const resolved = resolveAgentView(options.routes, trimmed);
    if (!resolved) {
      const body =
        `@meta\n  v: 1\n  status: 404\n  route: ${trimmed}\n\n` +
        `@intent\n  purpose:    No agent view registered for this route\n` +
        `  audience:   any\n  capability: none\n`;
      return new Response(body, {
        status: 404,
        headers: { "Content-Type": CT },
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
        headers: { "Content-Type": CT },
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
        ? { self: `${trimmed}.agent`, ...partial.nav }
        : undefined,
    });

    return new Response(body, {
      headers: {
        "Content-Type": CT,
        "Cache-Control": "private, max-age=30",
      },
    });
  };
}

export type { AgentViewHandlerOptions as CreateAgentViewHandlerOptions };
