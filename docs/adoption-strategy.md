# AVL Adoption Strategy

AVL adoption depends on making the first step small, making conformance measurable, and giving platforms easy integration paths.

## Positioning

Use this message consistently:

> AVL is a producer-owned agent view for every page. It complements `llms.txt`, schema.org, OpenAPI, MCP, robots.txt, and sitemaps by giving agents page-level intent, state, actions, context, and navigation.

Do not position AVL as a replacement for existing standards. It is the page-level agent layer that connects them.

## Adoption Wedges

### L0 First

The easiest adoption path is L0:

- Add `@meta`.
- Add `@intent`.
- Add one discovery link.

This gives agents route purpose and triage value without requiring full data/action modeling.

### CMS Plugins

CMS plugins make AVL concrete for non-framework users. Priority ecosystems:

- WordPress.
- Ghost.
- Drupal.
- Joomla.
- Strapi.
- Directus.
- Payload.

### Validation

Adoption needs objective proof. Build a validator that can say:

- This site has AVL.
- This page meets L0/L1/L2/L3.
- Discovery is wired correctly.
- `llms.txt` and schema companions are present.
- Actions are declared safely.

AEOCheck.ai can be a sister-service validation surface while the open-source repo owns the conformance rules.

### Framework Adapters

Next targets after CMS coverage:

- Astro.
- Remix / React Router.
- SvelteKit.
- Nuxt.
- Express/Fastify middleware.
- Rails.
- Laravel.

### Ecosystem Outreach

Useful audiences:

- CMS communities.
- Framework maintainers.
- Technical SEO/AEO/GEO practitioners.
- AI crawler and answer-engine teams.
- MCP/tooling communities.
- Standards groups.

## Near-Term Roadmap

1. Publish conformance docs and validator fixtures.
2. Promote the WordPress plugin as the reference CMS implementation.
3. Add well-known discovery support.
4. Add companion links for `llms.txt`, schema.org, OpenAPI, MCP, sitemap, and robots.
5. Add optional provenance fields.
6. Collect production adopters.
7. Publish an implementation registry.

## Success Metrics

- Number of production sites serving AVL.
- Number of independent implementations.
- Validator pass rate for submitted sites.
- CMS/plugin installs.
- AI crawler requests to `.agent` and `/agent.txt`.
- Citations or accurate summaries in answer engines.
