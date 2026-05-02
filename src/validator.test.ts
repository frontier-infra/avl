import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { validateAgentViewText, validateToonState } from "./validator";

test("valid fixture reaches L3 conformance", async () => {
  const text = await readFile("specs/fixtures/valid/basic.agent", "utf8");
  const report = validateAgentViewText(text, {
    contentType: "text/agent-view; version=1",
    source: "specs/fixtures/valid/basic.agent",
  });

  assert.equal(report.ok, true);
  assert.equal(report.level, "L3");
  assert.equal(
    report.checks.find(check => check.id === "document.meta")?.status,
    "pass"
  );
  assert.equal(
    report.checks.find(check => check.id === "toon.table_columns")?.status,
    "pass"
  );
});

test("invalid TOON table fixture fails validation", async () => {
  const text = await readFile("specs/fixtures/invalid/mismatched-table.agent", "utf8");
  const report = validateAgentViewText(text);

  assert.equal(report.ok, false);
  assert.equal(report.level, null);
  assert.equal(
    report.checks.find(check => check.id === "document.meta")?.status,
    "fail"
  );
  assert.equal(
    report.checks.find(check => check.id === "toon.table_columns")?.status,
    "fail"
  );
});

test("missing required intent field is invalid", () => {
  const report = validateAgentViewText(`@meta
  v: 1
  route: /
  generated: 2026-05-02T12:00:00Z

@intent
  purpose: Home
  audience: visitor
`);

  assert.equal(report.ok, false);
  assert.equal(report.level, null);
  assert.equal(
    report.checks.find(check => check.id === "document.intent.capability")
      ?.status,
    "fail"
  );
});

test("TOON validator catches inline list count mismatches", () => {
  const checks = validateToonState("  tags[3]: avl, agents\n");

  assert.equal(checks.find(check => check.id === "toon.list_count")?.status, "fail");
});
