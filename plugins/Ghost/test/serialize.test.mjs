import test from "node:test";
import assert from "node:assert/strict";

import { serialize } from "../src/serialize.mjs";

test("serializes an AVL document", () => {
  const body = serialize({
    meta: {
      v: 1,
      route: "/hello",
      generated: "2026-05-02T00:00:00.000Z",
      ttl: "5m",
    },
    intent: {
      purpose: "Ghost post: Hello",
      audience: ["reader", "agent"],
      capability: ["read"],
    },
    state: {
      title: "Hello, Ghost",
      tags: ["ghost", "avl"],
    },
  });

  assert.match(body, /@meta/);
  assert.match(body, /route: \/hello/);
  assert.match(body, /purpose:    Ghost post: Hello/);
  assert.match(body, /title: "Hello, Ghost"/);
  assert.match(body, /tags\[2\]: ghost, avl/);
});
