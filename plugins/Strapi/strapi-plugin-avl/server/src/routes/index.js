'use strict';

module.exports = [
  {
    method: 'GET',
    path: '/agent.txt',
    handler: 'avl.manifest',
    config: { auth: false },
  },
  {
    method: 'GET',
    path: '/llms.txt',
    handler: 'avl.llms',
    config: { auth: false },
  },
  {
    method: 'GET',
    path: '/lm.txt',
    handler: 'avl.llms',
    config: { auth: false },
  },
  {
    method: 'GET',
    path: '/.agent',
    handler: 'avl.site',
    config: { auth: false },
  },
  {
    method: 'GET',
    path: '/:contentType/:documentId.agent',
    handler: 'avl.document',
    config: { auth: false },
  },
];
