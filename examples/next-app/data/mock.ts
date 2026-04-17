// In-memory mock data for the AVL example app.

export type Journey = {
  id: string;
  client: string;
  stage: string;
  next_step: string;
  deadline: string;
  risk: "low" | "med" | "high";
  attorney: string;
  opened: string;
};

export const JOURNEYS: Journey[] = [
  {
    id: "J-101",
    client: "Doe v Acme",
    stage: "Discovery",
    next_step: "Depo prep",
    deadline: "2026-05-01",
    risk: "low",
    attorney: "Sarah Kim",
    opened: "2026-01-15",
  },
  {
    id: "J-102",
    client: "Roe v Beta",
    stage: "Settlement",
    next_step: "Demand response",
    deadline: "2026-04-22",
    risk: "high",
    attorney: "Sarah Kim",
    opened: "2025-09-30",
  },
  {
    id: "J-103",
    client: "Vega v Gamma",
    stage: "Treatment",
    next_step: "Records request",
    deadline: "2026-04-30",
    risk: "med",
    attorney: "Mark Diaz",
    opened: "2026-02-08",
  },
];

export type Activity = {
  at: string;
  actor: string;
  event: string;
};

export const ACTIVITY: Record<string, Activity[]> = {
  "J-101": [
    { at: "2026-04-12T10:00Z", actor: "Sarah Kim", event: "Filed motion to compel" },
    { at: "2026-04-10T16:30Z", actor: "System", event: "Stage advanced: Pleadings -> Discovery" },
    { at: "2026-04-08T09:15Z", actor: "Mark Diaz", event: "Note added" },
  ],
  "J-102": [
    { at: "2026-04-14T11:00Z", actor: "Sarah Kim", event: "Sent demand letter" },
    { at: "2026-04-09T14:00Z", actor: "System", event: "Stage advanced: Discovery -> Settlement" },
  ],
  "J-103": [
    { at: "2026-04-13T09:00Z", actor: "Mark Diaz", event: "Client missed appointment (2nd)" },
    { at: "2026-04-05T10:00Z", actor: "Mark Diaz", event: "Client missed appointment (1st)" },
  ],
};

export type Alert = {
  kind: string;
  journey: string;
  note: string;
};

export function getJourneys(_args: { userId: string }): Journey[] {
  return JOURNEYS;
}

export function getJourney(id: string): Journey | undefined {
  return JOURNEYS.find(j => j.id === id);
}

export function getAlerts(_args: { userId: string }): Alert[] {
  return [{ kind: "deadline", journey: "J-102", note: "Demand expires in 6 days" }];
}
