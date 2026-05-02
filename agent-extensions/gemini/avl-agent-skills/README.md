# AVL Agent Skills Gemini Extension

This Gemini CLI extension bundles the `avl-cms-adapter` skill.

## Structure

```text
gemini-extension.json
skills/avl-cms-adapter/
```

## Validate

```bash
gemini extensions validate ./agent-extensions/gemini/avl-agent-skills
```

## Source Of Truth

The canonical skill lives at `agent-skills/avl-cms-adapter`. Run `agent-skills/scripts/sync-skill-targets.sh` after edits.
