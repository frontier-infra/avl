# AVL Skill Deployment

## Canonical Source

The canonical skill lives at:

```text
agent-skills/avl-cms-adapter/
```

Edit that copy first, then run:

```bash
agent-skills/scripts/sync-skill-targets.sh
agent-skills/scripts/validate-skills.sh
```

## Codex

Project-local Codex skill copy:

```text
.codex/skills/avl-cms-adapter/
```

For a user-level install, copy or symlink the canonical folder into:

```text
~/.codex/skills/avl-cms-adapter/
```

## Claude Code

Project-local Claude skill copy:

```text
.claude/skills/avl-cms-adapter/
```

Claude plugin marketplace bundle:

```text
agent-marketplaces/claude/
  .claude-plugin/marketplace.json
  plugins/avl-agent-skills/
    .claude-plugin/plugin.json
    skills/avl-cms-adapter/SKILL.md
```

Local marketplace install flow:

```text
/plugin marketplace add ./agent-marketplaces/claude
/plugin install avl-agent-skills@avl-skills
```

For public distribution, host `agent-marketplaces/claude` in a git repository and have users add that repository or marketplace URL.

## Gemini CLI

Gemini extension bundle:

```text
agent-extensions/gemini/avl-agent-skills/
  gemini-extension.json
  skills/avl-cms-adapter/SKILL.md
```

Local extension install flow:

```bash
gemini extensions install ./agent-extensions/gemini/avl-agent-skills
```

Fast local development flow:

```bash
gemini extensions link ./agent-extensions/gemini/avl-agent-skills
```

For public distribution, host the extension directory in a git repository or publish it in a repository layout Gemini CLI can install from.
