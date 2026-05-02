# CMS Adapters

AVL adapters bring the same `.agent` companion-view contract to CMS and site-builder platforms. Each adapter should expose machine-readable page meaning without forcing agents to scrape public HTML.

## Repository Layout

CMS adapters live under `plugins/`, grouped by platform:

```text
plugins/
  WordPress/
  Ghost/
  Drupal/
  Joomla/
  Strapi/
  Directus/
  Payload/
```

Use the platform's public name for the folder unless the platform ecosystem has a different package convention.

## Adapter Contract

Every adapter should aim to provide:

- `.agent` companion URLs for public pages.
- `agent.txt` or equivalent discovery where the platform permits it.
- HTML discovery from public human pages.
- Badge controls for type, colors, placement, and visibility.
- Native admin settings where possible.
- Compatibility notes for page builders, themes, or framework layers.
- Tests for rendering, serialization, and configuration.
- Packaging instructions and release artifacts.

## WordPress

The WordPress adapter lives in:

```text
plugins/WordPress/
```

It includes:

- Main plugin: `plugins/WordPress/avl-agent-view-layer/`
- Docker QA stack on port `49217`.
- WordPress Plugin Check integration.
- Badge settings for type, colors, placement, and framework compatibility.
- Shortcode support through `[avl_badge]`.
- Optional page-builder add-ons for Divi, Elementor, Beaver Builder, Gutenberg,
  Bricks, WPBakery, Avada/Fusion, and Oxygen/Breakdance.
- Admin readiness checks for AVL, AEO, GEO, and `llms.txt`/`lm.txt`.
- External validation link to AEOCheck.ai.

See `plugins/WordPress/README.md` and `plugins/WordPress/page-builders/README.md`.

## Ghost

The Ghost adapter lives in:

```text
plugins/Ghost/
```

Ghost does not have the same general-purpose plugin lifecycle as WordPress for arbitrary public-route behavior. The current package is therefore structured as a lightweight AVL helper service and document renderer that can be wired to Ghost content via API/theme integration patterns.

It includes:

- TOON serialization.
- Ghost content-to-AVL document mapping.
- A small HTTP server for `.agent` and `agent.txt` style responses.
- Unit tests for serialization, document shape, and server behavior.

See `plugins/Ghost/README.md`.

## Page Builders

WordPress page builders are treated as compatibility surfaces, not separate AVL standards.

The main WordPress plugin provides a generic `[avl_badge]` shortcode. Builder-specific add-ons wrap that shared badge behavior in native module/widget registration:

- Divi: `plugins/WordPress/page-builders/avl-divi-badge/`
- Elementor: `plugins/WordPress/page-builders/avl-elementor-badge/`
- Beaver Builder: `plugins/WordPress/page-builders/avl-beaver-badge/`
- Block editor: `plugins/WordPress/page-builders/avl-block-badge/`
- Bricks: `plugins/WordPress/page-builders/avl-bricks-badge/`
- Bakery visual builder: `plugins/WordPress/page-builders/avl-bakery-badge/`
- Avada/Fusion: `plugins/WordPress/page-builders/avl-avada-badge/`
- Oxygen/Breakdance: `plugins/WordPress/page-builders/avl-oxygen-badge/`

Future builder support should keep rendering centralized in the core plugin and keep builder add-ons thin.

## Drupal

The Drupal adapter lives in:

```text
plugins/Drupal/avl_agent_view_layer/
```

It is a native Drupal module with `.routing.yml` routes and a controller for:

- `/agent.txt`
- `/llms.txt`
- `/lm.txt`
- `/.agent`
- `/{path}.agent`

The MVP resolves node-backed path aliases. Production deployments should add configurable bundle allowlists, field mapping, and Drupal cache metadata.

## Joomla

The Joomla adapter lives in:

```text
plugins/Joomla/plg_system_avl/
```

It is a Joomla system plugin with a manifest XML file, service provider, and event subscriber. The MVP responds to AVL and LM discovery routes during public site routing.

Production deployments should add richer article/category resolution through Joomla content services.

## Strapi

The Strapi adapter lives in:

```text
plugins/Strapi/strapi-plugin-avl/
```

It is a Strapi 5 plugin MVP with public plugin routes for:

- `/avl/agent.txt`
- `/avl/llms.txt`
- `/avl/lm.txt`
- `/avl/.agent`
- `/avl/:contentType/:documentId.agent`

Production deployments should add collection allowlists, slug/public-route mapping, and admin configuration.

## Directus

The Directus adapter lives in:

```text
plugins/Directus/directus-extension-avl/
```

It is a Directus endpoint extension MVP for:

- `/avl/agent.txt`
- `/avl/llms.txt`
- `/avl/lm.txt`
- `/avl/.agent`
- `/avl/:collection/:id.agent`

Production deployments should add collection allowlists and public-route mapping.

## Payload

The Payload adapter lives in:

```text
plugins/Payload/payload-plugin-avl/
```

It is a Payload config plugin MVP that injects root endpoints for:

- `/agent.txt`
- `/llms.txt`
- `/lm.txt`
- `/.agent`
- `/:collection/:id.agent`

Production deployments should add collection allowlists, auth-aware rendering, and public front-end route mapping.

## Validation

Run the repo-level adapter validation suite:

```bash
npm run test:plugins
```

This runs executable tests for Ghost, Strapi, Directus, and Payload, checks the Drupal/Joomla package structures, and regenerates WordPress package artifacts. Full Drupal, Joomla, and WordPress certification still requires those CMS runtimes.

## Adding A New CMS

1. Create `plugins/<CMSName>/`.
2. Document the platform's extension surface in that folder's `README.md`.
3. Implement `.agent` rendering and discovery using native hooks.
4. Add admin settings for badge type, colors, placement, and visibility when the platform supports it.
5. Add tests and local runtime instructions.
6. Add packaging or marketplace submission notes.
7. Update `docs/agent-skills.md` and rerun the skill sync.
