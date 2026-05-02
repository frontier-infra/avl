# WordPress.org Submission Checklist

Package:

- Installable zip: `dist/avl-agent-view-layer.zip`
- Optional add-on zips:
  - `dist/avl-divi-badge.zip`
  - `dist/avl-elementor-badge.zip`
  - `dist/avl-beaver-badge.zip`
  - `dist/avl-block-badge.zip`
  - `dist/avl-bricks-badge.zip`
  - `dist/avl-bakery-badge.zip`
  - `dist/avl-avada-badge.zip`
  - `dist/avl-oxygen-badge.zip`
- Plugin root in zip: `avl-agent-view-layer/`
- Main plugin file: `avl-agent-view-layer/avl-agent-view-layer.php`
- WordPress.org readme: `avl-agent-view-layer/readme.txt`
- Uninstall cleanup: `avl-agent-view-layer/uninstall.php`
- Bundled local assets only: `avl-agent-view-layer/assets/avl-badge.svg`
- Page builder add-ons: `page-builders/avl-divi-badge`, `page-builders/avl-elementor-badge`, `page-builders/avl-beaver-badge`, `page-builders/avl-block-badge`, `page-builders/avl-bricks-badge`, `page-builders/avl-bakery-badge`, `page-builders/avl-avada-badge`, `page-builders/avl-oxygen-badge`

Local QA environment:

- WordPress URL: `http://localhost:49217`
- WordPress image: `wordpress:6.9-php8.3-apache`
- Database image: `mariadb:11.4`
- WordPress core tested: `6.9`

Verification run:

```bash
cd plugins/WordPress
./scripts/bootstrap.sh
./scripts/test-plugin.sh
docker compose exec -T wordpress php -l /var/www/html/wp-content/plugins/avl-agent-view-layer/avl-agent-view-layer.php
docker compose exec -T wordpress php -l /var/www/html/wp-content/plugins/avl-agent-view-layer/uninstall.php
docker compose run --rm cli plugin check avl-agent-view-layer --format=json --include-experimental
./scripts/package.sh
```

Results:

- Live route smoke tests passed for `/agent.txt`, `/llms.txt`, `/lm.txt`, `/.agent`, `/about-avl.agent`, content negotiation, discovery headers, discovery markup, and 404 behavior.
- Badge styling/placement smoke tests passed for configured pill output and shortcode compact output.
- Admin readiness smoke tests passed for the AEOCheck.ai link and AVL/AEO/GEO/llms readiness panel.
- PHP lint passed for the main plugin file, uninstall file, and all page-builder add-on files.
- WordPress Plugin Check 1.9.0 completed with no errors found for the main plugin and all page-builder add-ons.
- Package zips built and inspected successfully.

Submission notes:

- Visible badge is opt-in and disabled by default, matching WordPress.org guidance that public credits should require user consent.
- The plugin does not call external services or load remote assets.
- The AEOCheck.ai integration is a user-clicked admin link only. The plugin does not send site data to that service automatically.
- Public `.agent` responses resolve only published content from enabled public post types.
- Settings are stored in one option and removed by `uninstall.php`.
