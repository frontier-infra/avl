#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
set -a
source "${AVL_TEST_ENV:-.env}"
set +a
BASE="${WORDPRESS_URL:-http://localhost:49217}"
TMP="$(mktemp -d)"
cleanup() {
  docker compose exec -T wordpress rm -rf wp-content/mu-plugins/avl-compat-fixture.php wp-content/mu-plugins/avl-tests
  rm -rf "$TMP"
}
trap cleanup EXIT
docker compose exec -T wordpress mkdir -p wp-content/mu-plugins
docker compose cp tests wordpress:/var/www/html/wp-content/mu-plugins/avl-tests
docker compose cp tests/compat-fixture.php wordpress:/var/www/html/wp-content/mu-plugins/avl-compat-fixture.php
docker compose run --rm cli eval-file wp-content/mu-plugins/avl-tests/serializer.php
if [[ -z "$(docker compose run --rm cli post list --post_type=page --name=pricing --format=ids)" ]]; then
  docker compose run --rm cli post create --post_type=page --post_status=publish --post_title=Pricing --post_name=pricing --post_content='Public pricing table.'
fi
for path in / /about-avl/ /pricing/; do
  curl -fsS -D "$TMP/headers" "$BASE$path" -o "$TMP/body"
  python3 - "$TMP/headers" <<'PY'
import sys
values = [t.strip().lower() for line in open(sys.argv[1]) if line.lower().startswith('vary:') for t in line.split(':', 1)[1].split(',')]
assert values.count('accept') == 1, values
if 'accept-language' in values:
    assert values.count('accept-language') == 1, values
PY
  curl -fsS -H 'Accept: text/agent-view' "$BASE$path" | grep -q '^@state'
done
for path in /?avl_agent_manifest=1 /?avl_lm_manifest=1 /?avl_agent_view=__root__ /agent.txt /llms.txt /lm.txt /pricing.agent /wp-json/ /feed/ /definitely-missing/; do
  curl -sS -D "$TMP/headers" "$BASE$path" -o "$TMP/body"
  if grep -Ei '^vary:' "$TMP/headers" | grep -Eqi '(^|[:, ])accept([,[:space:]]|$)'; then
    echo "Unexpected negotiation on $path" >&2
    exit 1
  fi
done
curl -fsS -D "$TMP/headers" "$BASE/pricing/?avl_test_wildcard=1" -o "$TMP/body"
python3 - "$TMP/headers" <<'PYTEST'
import sys
values = [t.strip().lower() for line in open(sys.argv[1]) if line.lower().startswith('vary:') for t in line.split(':', 1)[1].split(',')]
assert '*' in values and 'accept' not in values, values
PYTEST
curl -fsS "$BASE/pricing.agent" -o "$TMP/pricing.agent"
grep -Fq 'pricing[4]{size,qty_150_249,qty_250_999}:' "$TMP/pricing.agent"
grep -Fq '"Medium, wide",14,12' "$TMP/pricing.agent"
grep -Fq 'Large: tall,16,14' "$TMP/pricing.agent"
grep -Fq '"XL \"special\"",18,16' "$TMP/pricing.agent"
grep -q '^  mixed:$' "$TMP/pricing.agent"
echo "WordPress negotiation and table regression tests passed for $BASE"
