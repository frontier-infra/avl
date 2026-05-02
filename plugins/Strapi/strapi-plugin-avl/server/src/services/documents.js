'use strict';

function scalar(value) {
  if (value === null || value === undefined) return '~';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  const text = String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '\\"')}"` : text;
}

function linesForObject(object, indent = '  ') {
  return Object.entries(object)
    .map(([key, value]) => {
      if (Array.isArray(value)) return `${indent}${key}[${value.length}]: ${value.map(scalar).join(', ')}`;
      if (value && typeof value === 'object') return `${indent}${key}:\n${linesForObject(value, `${indent}  `)}`;
      return `${indent}${key}: ${scalar(value)}`;
    })
    .join('\n');
}

function serialize(document) {
  const sections = [];
  for (const section of ['meta', 'intent', 'state']) {
    if (document[section]) sections.push(`@${section}\n${linesForObject(document[section])}`);
  }
  if (document.actions) {
    sections.push(`@actions\n${document.actions.map((action) => `  - id: ${scalar(action.id)}\n    method: ${scalar(action.method)}\n    href: ${scalar(action.href)}`).join('\n')}`);
  }
  if (document.context) sections.push(`@context\n  > ${document.context}`);
  if (document.nav) sections.push(`@nav\n${linesForObject(document.nav)}`);
  return `${sections.join('\n\n')}\n`;
}

module.exports = () => ({
  serialize,

  manifest() {
    return [
      '# AVL Manifest',
      '',
      'version: 1',
      'content-type: text/agent-view; version=1',
      'producer: strapi',
      '',
      'routes:',
      '  - GET /avl/.agent',
      '  - GET /avl/{contentType}/{documentId}.agent',
      '',
      'related:',
      '  llms: /avl/llms.txt',
      '  lm: /avl/lm.txt',
      '',
    ].join('\n');
  },

  llms() {
    return [
      '# Strapi AVL',
      '',
      '> Strapi project with Agent View Layer support.',
      '',
      '## Agent and AI discovery',
      '',
      '- AVL manifest: /avl/agent.txt',
      '- Site agent view: /avl/.agent',
      '- Document pattern: /avl/{contentType}/{documentId}.agent',
      '',
      '## Standards readiness',
      '',
      '- AVL - agent companion routes: pass',
      '- AEO - answer-engine discoverability: pass',
      '- GEO - generative-engine context: pass',
      '- llms.txt - language-model summary: pass',
      '',
    ].join('\n');
  },

  site() {
    return {
      meta: { v: 1, route: '/', generated: new Date().toISOString(), ttl: '5m' },
      intent: { purpose: 'Strapi content API', audience: ['visitor', 'agent'], capability: ['read', 'navigate'] },
      state: { producer: 'strapi' },
      actions: [{ id: 'view_manifest', method: 'GET', href: '/avl/agent.txt' }],
      context: 'This Strapi project exposes AVL companions for configured content documents.',
      nav: { self: '/avl/.agent', drilldown: '/avl/{contentType}/{documentId}.agent' },
    };
  },

  async document(contentType, documentId) {
    const uid = contentType.includes('::') ? contentType : `api::${contentType}.${contentType}`;
    const api = strapi.documents?.(uid);
    if (!api) return null;
    const item = await api.findOne({ documentId });
    if (!item) return null;
    return {
      meta: { v: 1, route: `/${contentType}/${documentId}`, generated: new Date().toISOString(), ttl: '5m' },
      intent: { purpose: `Strapi ${contentType}: ${item.title || item.name || documentId}`, audience: ['visitor', 'agent'], capability: ['read'] },
      state: { id: item.id, documentId: item.documentId || documentId, title: item.title || item.name || '', slug: item.slug || '' },
      actions: [{ id: 'view_api', method: 'GET', href: `/api/${contentType}/${documentId}` }],
      context: `Strapi ${contentType} document exposed as an AVL companion.`,
      nav: { self: `/avl/${contentType}/${documentId}.agent`, parents: ['/avl/.agent'] },
    };
  },

  notFound(route) {
    return {
      meta: { v: 1, route, generated: new Date().toISOString(), ttl: '1m' },
      intent: { purpose: 'Strapi agent view not found', audience: ['agent'], capability: ['read'] },
      state: { found: false, route },
      context: 'No Strapi document resolved for this AVL route.',
    };
  },
});
