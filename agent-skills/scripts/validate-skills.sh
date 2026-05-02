#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
VALIDATOR="/Users/sem/.codex/skills/.system/skill-creator/scripts/quick_validate.py"

skills=(
  "${ROOT_DIR}/agent-skills/avl-cms-adapter"
  "${ROOT_DIR}/.codex/skills/avl-cms-adapter"
  "${ROOT_DIR}/.claude/skills/avl-cms-adapter"
  "${ROOT_DIR}/.gemini/skills/avl-cms-adapter"
  "${ROOT_DIR}/agent-marketplaces/claude/plugins/avl-agent-skills/skills/avl-cms-adapter"
  "${ROOT_DIR}/agent-extensions/gemini/avl-agent-skills/skills/avl-cms-adapter"
)

for skill in "${skills[@]}"; do
  python3 "${VALIDATOR}" "${skill}"
done

echo "All AVL skill copies validated."
