import type { DefinedAgentView } from "./define";

export type RegistryEntry = {
  pattern: string;
  view: DefinedAgentView<unknown>;
};

export type ResolvedAgentView = RegistryEntry & {
  params: Record<string, string>;
};

export function resolveAgentView(
  routes: RegistryEntry[],
  path: string
): ResolvedAgentView | null {
  const normalized = path === "" ? "/" : path;
  for (const entry of routes) {
    const params = matchPattern(entry.pattern, normalized);
    if (params !== null) return { ...entry, params };
  }
  return null;
}

export function listRoutes(routes: RegistryEntry[]): string[] {
  return routes.map(r => r.pattern);
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
