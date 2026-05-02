#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if [[ ! -f .env ]]; then
  cp .env.example .env
fi

docker compose up -d db wordpress

until docker compose run --rm cli core is-installed >/dev/null 2>&1; do
  if docker compose run --rm cli core version >/dev/null 2>&1; then
    break
  fi
  sleep 2
done

set -a
source .env
set +a

if ! docker compose run --rm cli core is-installed >/dev/null 2>&1; then
  docker compose run --rm cli core install \
    --url="${WORDPRESS_URL:-http://localhost:49217}" \
    --title="${WORDPRESS_TITLE:-AVL WordPress Test Site}" \
    --admin_user="${WORDPRESS_ADMIN_USER:-avl_admin}" \
    --admin_password="${WORDPRESS_ADMIN_PASSWORD:-change-me-local-admin-password}" \
    --admin_email="${WORDPRESS_ADMIN_EMAIL:-admin@example.test}" \
    --skip-email
fi

docker compose run --rm cli rewrite structure '/%postname%/' --hard
docker compose run --rm cli plugin activate avl-agent-view-layer
docker compose run --rm cli option update avl_agent_view_layer_options '{"enabled":true,"badge_enabled":true,"badge_type":"pill","badge_bg":"#0e7c2e","badge_fg":"#ffffff","badge_border":"#0a5c22","badge_placement":"auto","badge_position":"bottom-right","framework_mode":"auto","ttl":"5m","post_types":["post","page"],"contact":"admin@example.test"}' --format=json

if ! docker compose run --rm cli post list --post_type=page --name=about-avl --format=ids | grep -q '[0-9]'; then
  docker compose run --rm cli post create \
    --post_type=page \
    --post_status=publish \
    --post_title='About AVL' \
    --post_name='about-avl' \
    --post_content='AVL publishes agent-native companion views for public CMS content.' \
    --porcelain >/dev/null
fi

if ! docker compose run --rm cli post list --post_type=page --name=avl-shortcode --format=ids | grep -q '[0-9]'; then
  docker compose run --rm cli post create \
    --post_type=page \
    --post_status=publish \
    --post_title='AVL Shortcode' \
    --post_name='avl-shortcode' \
    --post_content='[avl_badge type="compact" position="inline"]' \
    --porcelain >/dev/null
fi

docker compose run --rm cli rewrite flush --hard

echo "WordPress is ready at ${WORDPRESS_URL:-http://localhost:49217}"
