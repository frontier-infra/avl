---
name: avl-cms-adapter
description: Build, review, test, package, and release Agent View Layer adapters for WordPress, Ghost, Framer, Joomla, Drupal, and other self-hosted CMS or site-builder platforms.
license: MIT
metadata:
  owner: avl
  version: 0.1.0
---

# AVL CMS Adapter

## Overview

Use this skill when creating or reviewing an Agent View Layer integration for a CMS, site builder, page builder, theme framework, or plugin marketplace. It keeps adapters consistent across WordPress, Ghost, Framer, Joomla, Drupal, Concrete CMS, TYPO3, Grav, and comparable public-facing publishing systems.

The expected outcome is a shippable adapter: clear platform fit, configurable AVL badge rendering, security-conscious admin controls, automated checks, packaging notes, and deployment instructions.

## Workflow

1. Identify the platform surface before coding.
   Check whether the target supports plugins, extensions, themes, custom embeds, app marketplaces, webhooks, API clients, or only manual script injection. Use `references/platform-targets.md` when choosing the integration shape.

2. Preserve the AVL contract.
   Every adapter should expose badge type, placement, colors, visibility rules, and framework compatibility in the native admin experience when the platform permits it. Do not hardcode a single badge style unless the platform only supports static embeds.

3. Build to the host platform's conventions.
   Use the platform's package structure, naming, lifecycle hooks, escaping APIs, permissions model, and marketplace metadata. Avoid custom bootstraps when the CMS gives you a first-party extension mechanism.

4. Verify with the closest real runtime.
   Prefer a local Docker or official dev server. Run the platform's linter, package validator, unit tests, and a smoke test that proves the badge renders in a public page and settings persist in admin.

5. Package for review.
   Produce the installable artifact, marketplace/readme metadata, screenshots or setup notes if required, and a short release checklist. Record any platform limitation honestly.

## Adapter Requirements

Each adapter should include:

- Public rendering for at least one AVL badge type.
- Admin configuration for badge type, color palette, placement, and enablement.
- Compatibility notes for native themes, page builders, or framework layers.
- Sanitization and escaping at all user-input and public-output boundaries.
- Deactivation or uninstall cleanup where the platform expects it.
- Tests for configuration serialization, rendering output, and platform bootstrap behavior.
- A release artifact or documented install path.

For WordPress page builders, treat Divi, Elementor, Beaver Builder, Gutenberg/block themes, and shortcode/widget fallbacks as separate surfaces. Keep the shared badge rendering logic centralized and make builder add-ons thin wrappers.

For Ghost, prefer theme helpers, Content API clients, webhooks, and embeddable snippets unless the current Ghost runtime exposes a true plugin/app surface for the needed behavior.

For Framer, verify current plugin capabilities before promising public-site runtime behavior. If plugins are editor-only, ship an editor workflow or code component pattern rather than pretending it is a CMS runtime plugin.

## Security And Quality Gates

Before calling an adapter complete:

- Run the test matrix in `references/validation.md`.
- Confirm admin-only actions require platform permissions and nonces/tokens where applicable.
- Escape public HTML, CSS, attributes, URLs, and JSON by platform convention.
- Avoid remote code execution, unpinned CDN scripts, hidden tracking, and automatic external calls without disclosure.
- Confirm the package has no generated secrets, `.env` files, cache directories, or local build artifacts.

## Deployment

Use `references/deployment.md` for installing this skill into Codex, Claude Code, and Gemini CLI, and for packaging Claude and Gemini marketplace or extension bundles.

When preparing marketplace submission, update all manifests from the canonical skill and validate the copies:

```bash
agent-skills/scripts/sync-skill-targets.sh
agent-skills/scripts/validate-skills.sh
```
