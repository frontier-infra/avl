#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

rm -rf dist
mkdir -p dist
zip -r dist/avl-agent-view-layer.zip avl-agent-view-layer \
  -x '*/.DS_Store' \
  -x '*/node_modules/*' \
  -x '*/vendor/*'

unzip -l dist/avl-agent-view-layer.zip >/dev/null
echo "Built $ROOT/dist/avl-agent-view-layer.zip"

for addon in page-builders/avl-*; do
  if [[ -d "$addon" ]]; then
    name="$(basename "$addon")"
    (cd page-builders && zip -r "../dist/${name}.zip" "$name" -x '*/.DS_Store' -x '*/node_modules/*' -x '*/vendor/*')
    unzip -l "dist/${name}.zip" >/dev/null
    echo "Built $ROOT/dist/${name}.zip"
  fi
done
