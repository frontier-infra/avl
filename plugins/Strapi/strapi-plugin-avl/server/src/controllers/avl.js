'use strict';

function respond(ctx, body, type = 'text/plain; charset=utf-8') {
  ctx.set('Content-Type', type);
  ctx.set('Cache-Control', 'public, max-age=60');
  ctx.body = body;
}

module.exports = {
  manifest(ctx) {
    respond(ctx, strapi.plugin('avl').service('documents').manifest());
  },

  llms(ctx) {
    respond(ctx, strapi.plugin('avl').service('documents').llms());
  },

  site(ctx) {
    respond(ctx, strapi.plugin('avl').service('documents').serialize(strapi.plugin('avl').service('documents').site()), 'text/agent-view; version=1; charset=utf-8');
  },

  async document(ctx) {
    const { contentType, documentId } = ctx.params;
    const service = strapi.plugin('avl').service('documents');
    const result = await service.document(contentType, documentId);
    if (!result) {
      ctx.status = 404;
      respond(ctx, service.serialize(service.notFound(`/${contentType}/${documentId}`)), 'text/agent-view; version=1; charset=utf-8');
      return;
    }

    respond(ctx, service.serialize(result), 'text/agent-view; version=1; charset=utf-8');
  },
};
