import test from "node:test";
import assert from "node:assert/strict";

import { defineAgentView } from "./define";
import { createAgentViewHandler } from "./next";

test("createAgentViewHandler emits discovery response headers", async () => {
  const handler = createAgentViewHandler({
    resolveSession: async () => ({ id: "u-42", role: "admin" }),
    routes: [
      {
        pattern: "/dashboard",
        view: defineAgentView({
          intent: {
            purpose: "Dashboard",
            audience: ["operator"],
            capability: ["read"],
          },
          nav: {},
        }),
      },
    ],
  });

  const res = await handler(new Request("https://example.com/agent/dashboard"), {
    params: Promise.resolve({ path: ["dashboard"] }),
  });
  const body = await res.text();

  assert.equal(res.status, 200);
  assert.equal(res.headers.get("content-type"), "text/agent-view; version=1");
  assert.equal(res.headers.get("vary"), "Accept, Cookie, Authorization");
  assert.equal(res.headers.get("x-agent-view-version"), "1");
  assert.equal(
    res.headers.get("link"),
    `<https://example.com/dashboard>; rel="canonical", <https://example.com/agent.txt>; rel="agent-manifest"; type="text/plain"`
  );
  assert.match(body, /self:\s+\/dashboard\.agent/);
});
