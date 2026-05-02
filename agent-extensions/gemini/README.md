# AVL Gemini Extensions

This folder contains Gemini CLI extension bundles for AVL.

## Extensions

| Extension | Purpose |
|---|---|
| `avl-agent-skills` | Bundles the AVL CMS Adapter skill for Gemini CLI. |

## Validate And Link

From the repository root:

```bash
gemini extensions validate ./agent-extensions/gemini/avl-agent-skills
gemini extensions link ./agent-extensions/gemini/avl-agent-skills
```

Use `gemini extensions install ./agent-extensions/gemini/avl-agent-skills` for a copied local install instead of a development link.
