import { defineAgentView } from "@frontier-infra/avl";
import { ACTIVITY, getJourney, JOURNEYS } from "@/data/mock";

type JourneyState =
  | { error: "not_found"; id: string }
  | {
      journey: ReturnType<typeof getJourney>;
      recent_activity: (typeof ACTIVITY)[string];
    };

export default defineAgentView<JourneyState>({
  intent: {
    purpose: "Single-case detail and action surface",
    audience: ["attorney", "paralegal"],
    capability: ["review", "advance", "annotate"],
  },
  state: async ({ params }) => {
    const j = getJourney(params.id);
    if (!j) return { error: "not_found" as const, id: params.id };
    return {
      journey: j,
      recent_activity: ACTIVITY[j.id] ?? [],
    };
  },
  actions: ({ params, user }) => [
    { id: "view_dashboard", method: "GET", href: "/dashboard.agent" },
    user.role === "attorney"
      ? {
          id: "advance_stage",
          method: "POST",
          href: `/api/journey/${params.id}/advance`,
          inputs: [
            { name: "target_stage_id", type: "string", required: true },
            { name: "note", type: "string", required: false },
          ],
        }
      : null,
    {
      id: "log_note",
      method: "POST",
      href: `/api/journey/${params.id}/note`,
      inputs: [{ name: "body", type: "string", required: true }],
    },
  ],
  context: ({ state }) => {
    if ("error" in state) return `Journey ${state.id} not found.`;
    const j = state.journey!;
    const parts = [
      `${j.client} is in ${j.stage}.`,
      `Next step: ${j.next_step} (due ${j.deadline}).`,
      `Risk: ${j.risk}.`,
      j.risk === "high" ? "Elevated risk — review priority." : "",
    ].filter(Boolean);
    return parts.join(" ");
  },
  nav: ({ params }) => ({
    parents: ["/dashboard"],
    peers: JOURNEYS.map(j => `/journey/${j.id}`).filter(
      p => p !== `/journey/${params.id}`
    ),
  }),
  meta: { ttl: "60s" },
});
