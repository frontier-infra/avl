import type {
  AgentAction,
  AgentRequestContext,
  AgentViewConfig,
  RenderedAgentView,
} from "./types";

export type DefinedAgentView<S = unknown> = {
  config: AgentViewConfig<S>;
  render: (ctx: AgentRequestContext) => Promise<RenderedAgentView>;
};

export function defineAgentView<S>(
  config: AgentViewConfig<S>
): DefinedAgentView<S> {
  return {
    config,
    async render(ctx) {
      const state = config.state
        ? await config.state(ctx)
        : (undefined as unknown as S);
      const enriched = { ...ctx, state };

      const actions = Array.isArray(config.actions)
        ? config.actions
        : config.actions
        ? config.actions(enriched).filter((a): a is AgentAction => Boolean(a))
        : undefined;

      const context =
        typeof config.context === "function"
          ? config.context(enriched)
          : config.context;

      const nav =
        typeof config.nav === "function" ? config.nav(enriched) : config.nav;

      return {
        intent: config.intent,
        state: state as Record<string, unknown> | undefined,
        actions,
        context,
        nav,
      };
    },
  };
}
