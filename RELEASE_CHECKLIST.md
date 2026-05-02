# Release Checklist

Use this checklist before tagging or publishing an AVL release.

## Required Checks

- `npm test`
- `npm run test:plugins`
- `npm run typecheck`
- `npm run build`
- `agent-skills/scripts/validate-skills.sh`
- `gemini extensions validate ./agent-extensions/gemini/avl-agent-skills`
- `npm test` from `plugins/Ghost`
- WordPress Plugin Check for the main WordPress plugin.
- WordPress Plugin Check for Divi, Elementor, and Beaver Builder add-ons.

## Versioning

- Root package version lives in `package.json` and `package-lock.json`.
- WordPress plugin version lives in the main plugin header and `readme.txt` stable tag.
- WordPress page-builder add-on versions live in their plugin headers and `readme.txt` stable tags.
- Ghost adapter version lives in `plugins/Ghost/package.json`.
- Claude plugin version lives in `agent-marketplaces/claude/plugins/avl-agent-skills/.claude-plugin/plugin.json`.
- Gemini extension version lives in `agent-extensions/gemini/avl-agent-skills/gemini-extension.json`.
- Agent skill version lives in `agent-skills/avl-cms-adapter/SKILL.md` metadata.

## Publish Readiness

- `CHANGELOG.md` has a dated entry for the release.
- README links point to all new docs.
- `CONFORMANCE.md`, `GOVERNANCE.md`, and vNext proposal docs are updated when protocol behavior changes.
- Generated zips are reproducible from scripts and are not the only source of truth.
- No `.env`, secrets, caches, local logs, or generated dependency folders are staged.
- Claude marketplace bundle installs locally.
- Gemini extension validates locally.
- WordPress plugin artifacts are regenerated from source after version changes.
- GitHub release notes are copied from `CHANGELOG.md`.

## Current Release Notes

For `0.2.0`, this is a repo-level milestone release for CMS adapters and agent-skill marketplace packaging. The root npm library API is still compatible with `0.1.x`.
