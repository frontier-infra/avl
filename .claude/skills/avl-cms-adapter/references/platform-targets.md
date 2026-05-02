# AVL Platform Targets

## Tier 1: Native Plugin Systems

Use a native plugin or extension when the platform supports installable code, admin settings, and public rendering hooks.

- WordPress: plugin, shortcode, block, widget, admin settings, page-builder add-ons.
- Joomla: extension or module with admin parameters.
- Drupal: module, block/plugin API, configuration schema.
- Concrete CMS: package/block/dashboard pages.
- TYPO3: extension with site package integration.
- Grav: plugin plus admin blueprint.

## Tier 2: Theme/App/Embed Systems

Use a theme helper, app, integration, or embed when the platform does not provide the same plugin lifecycle as WordPress.

- Ghost: theme partials, Content API, Admin API, webhooks, snippets.
- Framer: editor plugin, code component, marketplace asset, or embed workflow depending on current capability.
- Static-site builders: plugin if the build pipeline supports it, otherwise component or snippet.

## Tier 3: Hosted Builders

Do not treat hosted builders as self-hosted CMS targets unless the user explicitly asks for them. Wix, Shopify, Squarespace, Webflow, and similar systems may need app marketplace submissions, script embeds, or partner APIs instead of repository-local plugins.

## Integration Shape Decision

Choose the strongest available surface in this order:

1. Native plugin/extension with admin UI and public render hook.
2. Native block/widget/module with reusable settings.
3. Theme helper or partial plus documented install steps.
4. Code component or editor plugin.
5. Static embed snippet with a generator and explicit limitations.

Document the chosen shape in the adapter README so future agents do not re-litigate platform capability.
