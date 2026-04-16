import { NextResponse } from "next/server";
import { getSession, serialize } from "@/lib/avl";
import { resolveAgentView } from "@/lib/avl/registry";

const CT = "text/agent-view; version=1";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  const { path } = await params;
  const route = "/" + (path?.join("/") ?? "");
  const trimmed = route === "/" ? "/" : route.replace(/\/$/, "");

  const resolved = resolveAgentView(trimmed);
  if (!resolved) {
    const body =
      `@meta\n  v: 1\n  status: 404\n  route: ${trimmed}\n\n` +
      `@intent\n  purpose:    No agent view registered for this route\n` +
      `  audience:   any\n  capability: none\n`;
    return new NextResponse(body, {
      status: 404,
      headers: { "Content-Type": CT },
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
      "Content-Type": CT,
      "Cache-Control": "private, max-age=30",
    },
  });
}
