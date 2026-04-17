import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AGENT_SUFFIX = ".agent";
const AGENT_MIME = "text/agent-view";
const RUNTIME_PREFIX = "/agent";

/**
 * AVL discovery proxy (Next.js 16+).
 *
 * Two trigger paths route requests to the AVL runtime catch-all:
 *   1. URL suffix: any path ending in `.agent`        -> rewrite to /agent/<path>
 *   2. Content negotiation: Accept: text/agent-view   -> rewrite to /agent/<path>
 */
export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const path = url.pathname;

  if (path.endsWith(AGENT_SUFFIX)) {
    const stripped = path.slice(0, -AGENT_SUFFIX.length) || "/";
    url.pathname = `${RUNTIME_PREFIX}${stripped}`;
    return NextResponse.rewrite(url);
  }

  const accept = req.headers.get("accept") ?? "";
  if (accept.includes(AGENT_MIME)) {
    url.pathname = `${RUNTIME_PREFIX}${path}`;
    return NextResponse.rewrite(url);
  }
}

export const config = {
  matcher: [
    "/((?!agent/|_next/static|_next/image|favicon.ico|agent.txt|api/).*)",
  ],
};
