import type { AgentSession } from "./types";

/**
 * Mock session resolver for the pilot.
 * In production, the host app provides a resolveSession() function that
 * AVL never defines a new auth surface — it inherits whatever the host app uses.
 */
export async function getSession(): Promise<AgentSession> {
  return {
    id: "u-42",
    role: "attorney",
    name: "Sarah Kim",
    firm: "Smith Law",
  };
}
