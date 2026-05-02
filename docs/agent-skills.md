# AVL Agent Skills

AVL ships a reusable agent skill so Codex, Claude Code, Gemini CLI, and future agent runtimes can build CMS adapters the same way.

## Canonical Skill

The source of truth is:

```text
agent-skills/avl-cms-adapter/
```

That folder contains:

- `SKILL.md`: the agent-facing workflow for building and reviewing AVL CMS adapters.
- `agents/openai.yaml`: Codex/OpenAI interface metadata.
- `references/platform-targets.md`: how to choose plugin, extension, theme, app, or embed surfaces.
- `references/validation.md`: the verification checklist for WordPress, Ghost, Claude, Codex, and Gemini packaging.
- `references/deployment.md`: local and marketplace install instructions.

Edit the canonical copy first. Do not edit generated deploy copies directly unless you are testing a platform-specific packaging issue.

## Deploy Targets

The sync script copies the canonical skill into every supported local runtime and marketplace bundle:

```text
.codex/skills/avl-cms-adapter/
.claude/skills/avl-cms-adapter/
.gemini/skills/avl-cms-adapter/
agent-marketplaces/claude/plugins/avl-agent-skills/skills/avl-cms-adapter/
agent-extensions/gemini/avl-agent-skills/skills/avl-cms-adapter/
```

Run:

```bash
agent-skills/scripts/sync-skill-targets.sh
agent-skills/scripts/validate-skills.sh
```

## What The Skill Teaches

The skill tells agents to:

1. Identify the CMS integration surface before coding.
2. Preserve the AVL badge and `.agent` document contract.
3. Use native platform conventions instead of custom bootstraps.
4. Verify with a real local runtime whenever possible.
5. Package adapters with marketplace and submission metadata.

It is intentionally platform-agnostic. WordPress, Ghost, Framer, Joomla, Drupal, Concrete CMS, TYPO3, Grav, and similar tools share one AVL adapter decision process even when their extension systems differ.

## When To Update It

Update the skill when:

- A new CMS adapter is added under `plugins/`.
- Badge settings or placement capabilities change.
- A marketplace changes its manifest shape.
- Verification requirements change.
- A future adapter discovers a platform limitation that other agents should know.

After updates, run the sync and validation scripts, then include the generated deploy-target changes in the same commit.
