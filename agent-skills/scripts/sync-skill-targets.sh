#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SOURCE="${ROOT_DIR}/agent-skills/avl-cms-adapter"

targets=(
  "${ROOT_DIR}/.codex/skills/avl-cms-adapter"
  "${ROOT_DIR}/.claude/skills/avl-cms-adapter"
  "${ROOT_DIR}/.gemini/skills/avl-cms-adapter"
  "${ROOT_DIR}/agent-marketplaces/claude/plugins/avl-agent-skills/skills/avl-cms-adapter"
  "${ROOT_DIR}/agent-extensions/gemini/avl-agent-skills/skills/avl-cms-adapter"
)

for target in "${targets[@]}"; do
  rm -rf "${target}"
  mkdir -p "$(dirname "${target}")"
  cp -R "${SOURCE}" "${target}"
done

echo "Synced AVL CMS Adapter skill to ${#targets[@]} deploy targets."
