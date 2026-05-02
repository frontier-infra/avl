import assert from "node:assert/strict";
import test from "node:test";

import { collectionDocument, llms, manifest, serialize, siteDocument } from "../src/documents.mjs";

test("renders Payload manifest and llms metadata", () => {
  assert.match(manifest(), /producer: payload/);
  assert.match(manifest(), /llms: \/llms\.txt/);
  assert.match(llms(), /Standards readiness/);
});

test("serializes Payload documents", () => {
  assert.match(serialize(siteDocument()), /@intent/);
  assert.match(serialize(collectionDocument("pages", "1", { title: "Hello" })), /Payload pages: Hello/);
});
