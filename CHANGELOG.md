# Changelog

All notable changes to AVL are documented here.

The format follows Keep a Changelog style, and this project uses semantic versioning for the root npm package.

## [0.2.0] - 2026-05-02

### Added

- Added the WordPress AVL plugin under `plugins/WordPress/avl-agent-view-layer`.
- Added local WordPress Docker QA on port `49217`.
- Added WordPress admin controls for badge type, colors, placement, post types, TTL, and framework compatibility.
- Added WordPress shortcode support through `[avl_badge]`.
- Added optional WordPress page-builder add-ons for Divi, Elementor, and Beaver Builder.
- Added WordPress page-builder add-ons for the block editor, Bricks, Bakery-style visual builders, Avada/Fusion, and Oxygen/Breakdance.
- Added WordPress builder detection recommendations for matching AVL add-ons.
- Added WordPress `llms.txt` and `lm.txt` readiness metadata.
- Added WordPress admin readiness checks for AVL, AEO, GEO, and `llms.txt`.
- Added WordPress admin link to AEOCheck.ai for external site validation.
- Added Drupal module MVP for AVL companion routes and LM metadata.
- Added Joomla system plugin MVP for AVL companion routes and LM metadata.
- Added Strapi plugin MVP for AVL companion routes and tests.
- Added Directus endpoint extension MVP for AVL companion routes and tests.
- Added Payload plugin MVP for AVL companion routes and tests.
- Added repo-level adapter validation script.
- Added WordPress packaging scripts and submission checklist.
- Added Ghost adapter helper package under `plugins/Ghost`.
- Added Ghost AVL serialization, document generation, manifest rendering, and server tests.
- Added canonical AVL CMS Adapter agent skill under `agent-skills/avl-cms-adapter`.
- Added project-local Codex, Claude, and Gemini skill copies.
- Added Claude Code marketplace packaging for `avl-agent-skills`.
- Added Gemini CLI extension packaging for `avl-agent-skills`.
- Added skill sync and validation scripts.
- Added documentation for CMS adapters, agent skills, and skill deployment.
- Added conformance, governance, vNext proposal, and adoption strategy documents to capture outside-review feedback and standards-track planning.
- Added TOON grammar draft, discovery guidance, fixtures, non-Next.js getting-started guide, badge-program concept, and announcement draft for adoption work.
- Added `AI-IMPLEMENTATION.md`, a single-file brief developers can give to AI coding agents to implement AVL in another project.

### Changed

- Expanded the root README with CMS plugin, Ghost adapter, page-builder, agent-skill, Claude Code, and Gemini CLI documentation.
- Bumped the root package from `0.1.1` to `0.2.0` to mark the CMS and agent-skill packaging milestone.

### Verified

- Root test suite passes.
- Root TypeScript typecheck passes.
- Root package build passes.
- Ghost adapter tests pass.
- Agent skill validator passes for canonical and generated skill copies.
- Gemini CLI extension validation passes.
- Claude Code local marketplace install succeeds for `avl-agent-skills@avl-skills`.

## [0.1.1] - Previous

### Changed

- Treated body links as the AVL provenance contract.
