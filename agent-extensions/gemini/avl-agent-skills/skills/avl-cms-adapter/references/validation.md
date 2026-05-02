# AVL Adapter Validation

## Universal Checks

- Unit tests cover settings defaults, settings persistence, badge rendering, and invalid input.
- Public output escapes HTML, attributes, URLs, inline CSS, and JSON by host-platform convention.
- Admin writes require permission checks and CSRF protection where the platform supports them.
- A smoke test proves the badge appears on a public page with the configured badge type, colors, and placement.
- Packaging excludes local secrets, caches, temporary archives, node modules, vendor downloads not intended for release, and generated logs.

## WordPress

- Run the plugin's PHPUnit or Node tests if present.
- Run WordPress Plugin Check against the main plugin and each add-on package.
- Install into a local WordPress container on a non-default port and activate the plugin.
- Verify the admin settings page saves badge type, palette, placement, and framework compatibility mode.
- Verify shortcode, block/widget, and page-builder add-on output where implemented.

## Ghost

- Run Node tests and linting for any Content API, Admin API, webhook, or helper package.
- Start a local Ghost runtime or use the official local development path when the adapter needs runtime verification.
- Verify documented theme partials or snippets render without breaking the theme.
- Verify any Admin API usage is scoped, documented, and does not require committing secrets.

## Claude, Codex, And Gemini Skills

- Validate every `SKILL.md` copy with the local skill validator.
- Keep `agent-skills/avl-cms-adapter` canonical; generated deploy targets must match it.
- Confirm Claude plugin manifests contain `.claude-plugin/plugin.json`.
- Confirm Claude marketplaces contain `.claude-plugin/marketplace.json`.
- Confirm Gemini extensions contain `gemini-extension.json` and `skills/<skill-name>/SKILL.md`.
