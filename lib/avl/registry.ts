import dashboardAgent from "@/app/dashboard/agent";
import journeyAgent from "@/app/journey/[id]/agent";
import type { DefinedAgentView } from "./define";

type RegistryEntry = {
  pattern: string;
  view: DefinedAgentView<unknown>;
};

const ROUTES: RegistryEntry[] = [
  { pattern: "/dashboard", view: dashboardAgent as DefinedAgentView<unknown> },
  { pattern: "/journey/:id", view: journeyAgent as DefinedAgentView<unknown> },
];

export type ResolvedAgentView = RegistryEntry & {
  params: Record<string, string>;
};

export function resolveAgentView(path: string): ResolvedAgentView | null {
  const normalized = path === "" ? "/" : path;
  for (const entry of ROUTES) {
    const params = matchPattern(entry.pattern, normalized);
    if (params !== null) return { ...entry, params };
  }
  return null;
}

export function listRoutes(): string[] {
  return ROUTES.map(r => r.pattern);
}

function matchPattern(
  pattern: string,
  path: string
): Record<string, string> | null {
  const pSeg = pattern.split("/").filter(Boolean);
  const xSeg = path.split("/").filter(Boolean);
  if (pSeg.length !== xSeg.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < pSeg.length; i++) {
    if (pSeg[i].startsWith(":")) {
      params[pSeg[i].slice(1)] = decodeURIComponent(xSeg[i]);
    } else if (pSeg[i] !== xSeg[i]) {
      return null;
    }
  }
  return params;
}
