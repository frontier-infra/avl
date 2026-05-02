# Skill Deployment

This document explains how to deploy the AVL CMS Adapter skill into local agent runtimes and package it for marketplace-style distribution.

## Validate First

From the repo root:

```bash
agent-skills/scripts/sync-skill-targets.sh
agent-skills/scripts/validate-skills.sh
```

The validator checks every `SKILL.md` copy with the local agent skill validator.

## Codex

Project-local skill:

```text
.codex/skills/avl-cms-adapter/
```

User-level install:

```bash
mkdir -p ~/.codex/skills
cp -R agent-skills/avl-cms-adapter ~/.codex/skills/avl-cms-adapter
```

The `agents/openai.yaml` file supplies the Codex/OpenAI UI metadata for the skill.

## Claude Code

Project-local skill:

```text
.claude/skills/avl-cms-adapter/
```

Claude Code marketplace bundle:

```text
agent-marketplaces/claude/
  .claude-plugin/marketplace.json
  plugins/avl-agent-skills/
    .claude-plugin/plugin.json
    skills/avl-cms-adapter/
```

Local install:

```bash
claude plugin marketplace add ./agent-marketplaces/claude --scope local
claude plugin install avl-agent-skills@avl-skills --scope local
```

Verify:

```bash
claude plugin list --json
```

For public distribution, publish `agent-marketplaces/claude` in a git repository or marketplace endpoint and have users add that marketplace source.

## Gemini CLI

Gemini extension bundle:

```text
agent-extensions/gemini/avl-agent-skills/
  gemini-extension.json
  skills/avl-cms-adapter/
```

Validate:

```bash
gemini extensions validate ./agent-extensions/gemini/avl-agent-skills
```

Local development link:

```bash
gemini extensions link ./agent-extensions/gemini/avl-agent-skills
```

Install from a local path:

```bash
gemini extensions install ./agent-extensions/gemini/avl-agent-skills
```

For public distribution, publish the extension directory in a repository layout Gemini CLI can install from.

## Release Checklist

- Update `agent-skills/avl-cms-adapter/SKILL.md`.
- Update reference docs under `agent-skills/avl-cms-adapter/references/`.
- Run `agent-skills/scripts/sync-skill-targets.sh`.
- Run `agent-skills/scripts/validate-skills.sh`.
- Run `gemini extensions validate ./agent-extensions/gemini/avl-agent-skills`.
- Install the Claude plugin locally with `--scope local`.
- Confirm the deploy target files are included in version control.
- Record any marketplace limitation or CLI version constraint in this document.
