# AVL Claude Code Marketplace

This directory is a local Claude Code plugin marketplace for AVL agent skills.

## Contents

```text
.claude-plugin/marketplace.json
plugins/avl-agent-skills/
  .claude-plugin/plugin.json
  skills/avl-cms-adapter/
```

## Local Install

From the repository root:

```bash
claude plugin marketplace add ./agent-marketplaces/claude --scope local
claude plugin install avl-agent-skills@avl-skills --scope local
claude plugin list --json
```

The plugin should appear as `avl-agent-skills@avl-skills` with `scope` set to `local`.

## Updating

Edit `agent-skills/avl-cms-adapter`, then run:

```bash
agent-skills/scripts/sync-skill-targets.sh
claude plugin marketplace update avl-skills
```
