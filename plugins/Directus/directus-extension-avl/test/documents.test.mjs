import assert from "node:assert/strict";
import test from "node:test";

import { itemDocument, llms, manifest, serialize, siteDocument } from "../src/documents.mjs";

test("renders Directus manifest and llms metadata", () => {
  assert.match(manifest(), /producer: directus/);
  assert.match(manifest(), /llms: \/avl\/llms\.txt/);
  assert.match(llms(), /Standards readiness/);
});

test("serializes Directus documents", () => {
  assert.match(serialize(siteDocument()), /@intent/);
  assert.match(serialize(itemDocument("articles", "1", { title: "Hello" })), /Directus articles: Hello/);
});
