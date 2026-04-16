import { defineAgentView } from "@/lib/avl";
import { getAlerts, getJourneys } from "@/data/mock";

type DashboardState = {
  user: { id: string; role: string; firm: string };
  journeys: Array<{
    id: string;
    client: string;
    stage: string;
    next_step: string;
    deadline: string;
    risk: string;
  }>;
  alerts: Array<{ kind: string; journey: string; note: string }>;
};

export default defineAgentView<DashboardState>({
  intent: {
    purpose: "Active case dashboard for personal-injury matters",
    audience: ["attorney", "paralegal"],
    capability: ["review", "triage", "advance"],
  },
  state: async ({ user }) => ({
    user: { id: user.id, role: user.role, firm: user.firm ?? "" },
    journeys: getJourneys({ userId: user.id }).map(j => ({
      id: j.id,
      client: j.client,
      stage: j.stage,
      next_step: j.next_step,
      deadline: j.deadline,
      risk: j.risk,
    })),
    alerts: getAlerts({ userId: user.id }),
  }),
  actions: ({ user }) => [
    { id: "view_journey", method: "GET", href: "/journey/{id}.agent" },
    user.role === "attorney"
      ? {
          id: "advance_stage",
          method: "POST",
          href: "/api/journey/{id}/advance",
          inputs: [
            { name: "target_stage_id", type: "string", required: true },
            { name: "note", type: "string", required: false },
          ],
        }
      : null,
    {
      id: "log_note",
      method: "POST",
      href: "/api/journey/{id}/note",
      inputs: [{ name: "body", type: "string", required: true }],
    },
  ],
  context: ({ state }) => {
    const high = state.journeys.filter(j => j.risk === "high").length;
    const alerts = state.alerts.length;
    const parts = [
      `${state.journeys.length} active matters in this attorney's load.`,
      high ? `${high} high-risk.` : null,
      alerts ? `${alerts} alert(s) outstanding.` : null,
      "J-103 (Treatment) has missed 2 appointments — flag for paralegal follow-up.",
    ].filter(Boolean);
    return parts.join(" ");
  },
  nav: {
    parents: ["/"],
    peers: ["/clients", "/reports"],
    drilldown: "/journey/{id}",
  },
  meta: { ttl: "30s" },
});
