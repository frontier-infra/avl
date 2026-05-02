#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

set -a
if [[ -f .env ]]; then
  source .env
else
  source .env.example
fi
set +a

BASE="${WORDPRESS_URL:-http://localhost:49217}"
PLUGIN="avl-agent-view-layer/avl-agent-view-layer.php"

docker compose run --rm cli eval "require_once WP_PLUGIN_DIR . '/${PLUGIN}'; echo avl_wp_serialize_document(array('meta'=>array('v'=>1,'route'=>'/test','generated'=>'2026-01-01T00:00:00+00:00'),'intent'=>array('purpose'=>'Test','audience'=>array('agent'),'capability'=>array('read')),'state'=>array('title'=>'Hello, AVL','tags'=>array('ai','cms'))));" >/tmp/avl-serialize.out
grep -q '@meta' /tmp/avl-serialize.out
grep -q '@intent' /tmp/avl-serialize.out
grep -Fq 'tags[2]: ai, cms' /tmp/avl-serialize.out

manifest_headers="$(mktemp)"
manifest_body="$(mktemp)"
curl -fsS -D "$manifest_headers" "$BASE/agent.txt" -o "$manifest_body"
grep -qi 'content-type: text/plain' "$manifest_headers"
grep -q 'content-type: text/agent-view; version=1' "$manifest_body"
grep -q 'GET /.agent' "$manifest_body"
grep -q 'llms: /llms.txt' "$manifest_body"

lm_headers="$(mktemp)"
lm_body="$(mktemp)"
curl -fsS -D "$lm_headers" "$BASE/llms.txt" -o "$lm_body"
grep -qi 'content-type: text/plain' "$lm_headers"
grep -q '## Agent and AI discovery' "$lm_body"
grep -q 'AVL manifest:' "$lm_body"

lm_alias_body="$(mktemp)"
curl -fsS "$BASE/lm.txt" -o "$lm_alias_body"
grep -q '## Standards readiness' "$lm_alias_body"

root_headers="$(mktemp)"
root_body="$(mktemp)"
curl -fsS -D "$root_headers" "$BASE/.agent" -o "$root_body"
grep -qi 'content-type: text/agent-view; version=1' "$root_headers"
grep -q '@state' "$root_body"
grep -q 'recent:' "$root_body"

page_headers="$(mktemp)"
page_body="$(mktemp)"
curl -fsS -D "$page_headers" "$BASE/about-avl.agent" -o "$page_body"
grep -qi 'content-type: text/agent-view; version=1' "$page_headers"
grep -q 'route: /about-avl' "$page_body"
grep -q 'purpose:    Page: About AVL' "$page_body"

html_headers="$(mktemp)"
html_body="$(mktemp)"
curl -fsS -D "$html_headers" "$BASE/about-avl/" -o "$html_body"
grep -qi 'link: </about-avl/>; rel="canonical", </agent.txt>; rel="agent-manifest"; type="text/plain"' "$html_headers"
grep -q 'rel="alternate" type="text/agent-view; version=1" href="/about-avl.agent"' "$html_body"
grep -q 'data-avl-endpoint="/about-avl.agent"' "$html_body"
grep -q 'data-avl-badge-type="pill"' "$html_body"
grep -q 'background:#0e7c2e' "$html_body"

shortcode_body="$(mktemp)"
curl -fsS "$BASE/avl-shortcode/" -o "$shortcode_body"
grep -q 'data-avl-badge-type="compact"' "$shortcode_body"

admin_body="$(mktemp)"
docker compose run --rm cli eval "wp_set_current_user(1); ob_start(); avl_wp_render_settings_page(); echo ob_get_clean();" > "$admin_body"
grep -q 'AEOCheck.ai' "$admin_body"
grep -q 'Readiness checks' "$admin_body"

accept_headers="$(mktemp)"
accept_body="$(mktemp)"
curl -fsS -H 'Accept: text/agent-view' -D "$accept_headers" "$BASE/about-avl/" -o "$accept_body"
grep -qi 'content-type: text/agent-view; version=1' "$accept_headers"
grep -q '@intent' "$accept_body"

missing_status="$(curl -s -o /tmp/avl-missing.out -w '%{http_code}' "$BASE/definitely-missing.agent")"
test "$missing_status" = "404"
grep -q 'Agent view not found' /tmp/avl-missing.out

echo "AVL WordPress plugin smoke tests passed for $BASE"
