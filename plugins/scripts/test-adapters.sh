#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

required_files=(
  "plugins/Drupal/avl_agent_view_layer/avl_agent_view_layer.info.yml"
  "plugins/Drupal/avl_agent_view_layer/avl_agent_view_layer.routing.yml"
  "plugins/Drupal/avl_agent_view_layer/src/Controller/AvlController.php"
  "plugins/Joomla/plg_system_avl/avl.xml"
  "plugins/Joomla/plg_system_avl/services/provider.php"
  "plugins/Joomla/plg_system_avl/src/Extension/Avl.php"
)

for file in "${required_files[@]}"; do
  test -f "${ROOT}/${file}"
done

grep -q "/agent.txt" "${ROOT}/plugins/Drupal/avl_agent_view_layer/avl_agent_view_layer.routing.yml"
grep -q "/llms.txt" "${ROOT}/plugins/Drupal/avl_agent_view_layer/avl_agent_view_layer.routing.yml"
grep -q "plg_system_avl" "${ROOT}/plugins/Joomla/plg_system_avl/avl.xml"
grep -q "/llms.txt" "${ROOT}/plugins/Joomla/plg_system_avl/src/Extension/Avl.php"

(cd "${ROOT}/plugins/Ghost" && npm test)
(cd "${ROOT}/plugins/Strapi/strapi-plugin-avl" && npm test)
(cd "${ROOT}/plugins/Directus/directus-extension-avl" && npm test)
(cd "${ROOT}/plugins/Payload/payload-plugin-avl" && npm test)

"${ROOT}/plugins/WordPress/scripts/package.sh" >/dev/null

echo "AVL adapter validation passed."
