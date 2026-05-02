const assert = require('node:assert/strict');
const test = require('node:test');

const makeService = require('../server/src/services/documents');

test('renders Strapi manifest and llms metadata', () => {
  const service = makeService();
  assert.match(service.manifest(), /producer: strapi/);
  assert.match(service.manifest(), /llms: \/avl\/llms\.txt/);
  assert.match(service.llms(), /Standards readiness/);
});

test('serializes Strapi site document', () => {
  const service = makeService();
  const body = service.serialize(service.site());
  assert.match(body, /@meta/);
  assert.match(body, /@intent/);
  assert.match(body, /@actions/);
});
