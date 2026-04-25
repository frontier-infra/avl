import { NextResponse } from "next/server";
import { getSession, serialize } from "@/lib/avl";
import { resolveAgentView } from "@/lib/avl/registry";

const CT = "text/agent-view; version=1";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  const { path } = await params;
  const route = "/" + (path?.join("/") ?? "");
  const trimmed = route === "/" ? "/" : route.replace(/\/$/, "");
  const origin = new URL(req.url).origin;
  const discoveryHeaders = {
    "Content-Type": CT,
    "Vary": "Accept, Cookie, Authorization",
    "Link": `<${origin}${trimmed}>; rel="canonical", <${origin}/agent.txt>; rel="agent-manifest"; type="text/plain"`,
    "X-Agent-View-Version": "1",
  };

  const resolved = resolveAgentView(trimmed);
  if (!resolved) {
    const body =
      `@meta\n  v: 1\n  status: 404\n  route: ${trimmed}\n\n` +
      `@intent\n  purpose:    No agent view registered for this route\n` +
      `  audience:   any\n  capability: none\n`;
    return new NextResponse(body, {
      status: 404,
      headers: discoveryHeaders,
    });
  }

  const user = await getSession();
  const partial = await resolved.view.render({ user, params: resolved.params });

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

  return new NextResponse(body, {
    headers: {
      ...discoveryHeaders,
      "Cache-Control": "private, max-age=30",
    },
  });
}
