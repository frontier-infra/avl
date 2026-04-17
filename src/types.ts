// Agent View Layer — core types

export type AgentSession = {
  id: string;
  role: string;
  name?: string;
  firm?: string;
};

export type AgentRequestContext = {
  user: AgentSession;
  params: Record<string, string>;
};

export type AgentIntent = {
  purpose: string;
  audience: string[];
  capability: string[];
};

export type AgentActionInput = {
  name: string;
  type: string;
  required: boolean;
};

export type AgentAction = {
  id: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  href: string;
  inputs?: AgentActionInput[];
  needs_role?: string;
};

export type AgentNav = {
  self?: string;
  parents?: string[];
  peers?: string[];
  drilldown?: string;
};

export type AgentMeta = {
  ttl?: string;
  redacted?: string[];
};

export type RenderInput<S> = AgentRequestContext & { state: S };

export type Maybe<T> = T | null | undefined | false;

export type AgentViewConfig<S = unknown> = {
  intent: AgentIntent;
  state?: (ctx: AgentRequestContext) => Promise<S> | S;
  actions?:
    | AgentAction[]
    | ((ctx: RenderInput<S>) => Array<Maybe<AgentAction>>);
  context?: string | ((ctx: RenderInput<S>) => string);
  nav?: AgentNav | ((ctx: RenderInput<S>) => AgentNav);
  meta?: AgentMeta;
};

export type AgentViewDocument = {
  meta: { v: 1; route: string; generated: string; auth?: string } & AgentMeta;
  intent: AgentIntent;
  state?: Record<string, unknown>;
  actions?: AgentAction[];
  context?: string;
  nav?: AgentNav;
};

export type RenderedAgentView = Omit<AgentViewDocument, "meta">;
