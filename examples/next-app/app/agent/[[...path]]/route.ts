import { NextResponse } from "next/server";
import { createAgentViewHandler } from "@frontier-infra/avl/next";
import type { AgentSession, RegistryEntry } from "@frontier-infra/avl";
import dashboardAgent from "@/app/dashboard/agent";
import journeyAgent from "@/app/journey/[id]/agent";

// Mock session resolver for the demo.
// In production, this would parse your real session cookie or bearer token.
async function resolveSession(): Promise<AgentSession> {
  return {
    id: "u-42",
    role: "attorney",
    name: "Sarah Kim",
    firm: "Smith Law",
  };
}

const handler = createAgentViewHandler({
  resolveSession,
  routes: [
    { pattern: "/dashboard", view: dashboardAgent },
    { pattern: "/journey/:id", view: journeyAgent },
  ] as RegistryEntry[],
});

export async function GET(
  req: Request,
  ctx: { params: Promise<{ path?: string[] }> }
) {
  const res = await handler(req, ctx);
  const body = await res.text();
  return new NextResponse(body, {
    status: res.status,
    headers: Object.fromEntries(res.headers.entries()),
  });
}
