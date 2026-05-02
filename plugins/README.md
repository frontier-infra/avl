# AVL Plugins

This folder contains AVL integrations for CMS platforms, site builders, and related public-facing publishing tools.

## Current Adapters

| Platform | Status | Notes |
|---|---:|---|
| WordPress | Working plugin | Full WordPress plugin with Docker QA, Plugin Check, badge admin settings, shortcode support, and page-builder add-ons. |
| Ghost | Helper package | AVL document renderer and helper service for Ghost content/API integration. Ghost does not map cleanly to WordPress-style plugins, so this package documents the integration boundary. |
| Drupal | Module MVP | Native Drupal module with route controllers for `agent.txt`, `.agent`, path companions, and `llms.txt`/`lm.txt`. |
| Joomla | System plugin MVP | Joomla system plugin that intercepts public AVL and LM discovery routes. |
| Strapi | Plugin MVP | Strapi 5 plugin with manifest, site, document companion routes, and unit tests. |
| Directus | Endpoint extension MVP | Directus endpoint extension with manifest, site, item companion routes, and unit tests. |
| Payload | Config plugin MVP | Payload plugin that injects root AVL and LM endpoints plus document companion routes. |

## Folder Standard

Each platform folder should include:

- A platform-specific `README.md`.
- Runtime or Docker instructions when available.
- Tests for document rendering and configuration behavior.
- Packaging instructions.
- Marketplace or submission checklist when relevant.

Use `docs/cms-adapters.md` for the shared adapter contract.

## Validate

```bash
npm run test:plugins
```
