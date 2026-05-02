# AVL Agent View Layer for WordPress

This folder contains the WordPress CMS plugin for AVL. The installable plugin root is `avl-agent-view-layer/`; the surrounding folder holds Docker, tests, and packaging scripts.

## What It Adds

- `GET /agent.txt` for the site-level AVL manifest.
- `GET /llms.txt` and `GET /lm.txt` for agent/search-engine readiness metadata.
- `GET /.agent` for the front page companion.
- `GET /some-page.agent` for published public posts, pages, and custom post types.
- HTML `<link rel="alternate" type="text/agent-view">` discovery on public pages.
- HTTP `Link` headers pointing agents to `/agent.txt`.
- Optional local AVL badge with page-specific `data-avl-endpoint` metadata. The badge is disabled by default to keep public credits opt-in.
- Content negotiation for `Accept: text/agent-view` on supported human pages.
- Badge type, colors, placement, and framework compatibility controls.
- AEO, GEO, AVL, and `llms.txt` readiness checks in the admin panel.
- A privacy-friendly link from the admin panel to [AEOCheck.ai](https://aeocheck.ai/) for external validation.
- `[avl_badge]` shortcode for manual placement in blocks and page builders.

Each `.agent` response is served as:

```http
Content-Type: text/agent-view; version=1
```

## Install

1. Copy the `avl-agent-view-layer/` folder into `wp-content/plugins/`.
2. Activate **AVL Agent View Layer** in WordPress admin.
3. Visit **Settings -> AVL Agent View Layer** to choose post types, TTL, contact, and badge visibility.
4. Visit **Settings -> Permalinks** once if your server does not immediately pick up the rewrite rules.
5. Test:

```bash
curl -s https://example.com/agent.txt
curl -s https://example.com/.agent
curl -s https://example.com/about.agent
```

## Local Docker QA

The local QA stack uses the obscure port `49217`.

```bash
cd plugins/WordPress
cp .env.example .env
./scripts/bootstrap.sh
./scripts/test-plugin.sh
./scripts/package.sh
```

Open `http://localhost:49217` for the WordPress site.
See `SUBMISSION_CHECKLIST.md` for the exact verification record used before submission.

## Page Builders

The core plugin supports page builders through the `[avl_badge]` shortcode and
admin placement modes. It can auto-detect Divi, Elementor, Beaver Builder,
Avada/Fusion Builder, Bricks, Oxygen Builder, WPBakery, and block themes.

Optional native add-on plugins live in `page-builders/`:

- `avl-divi-badge`
- `avl-elementor-badge`
- `avl-beaver-badge`
- `avl-block-badge`
- `avl-bricks-badge`
- `avl-bakery-badge`
- `avl-avada-badge`
- `avl-oxygen-badge`

These add-ons register native builder modules/widgets when the corresponding
builder is installed, and they fall back safely when it is absent.

The core settings panel detects supported builders and recommends the matching
AVL add-on when it is not active. The generic `[avl_badge]` shortcode remains
available in every builder even without a native add-on.

## Document Shape

The plugin emits the six AVL sections:

- `@meta`: version, route, generated timestamp, and TTL.
- `@intent`: the post type and title as the page purpose.
- `@state`: post id, type, slug, title, author, dates, permalink, excerpt, and taxonomies.
- `@actions`: human page URL, WordPress REST URL when available, and comment action when comments are open.
- `@context`: a short human-readable summary derived from the excerpt.
- `@nav`: self and parent links.

## Customization Hooks

Use WordPress filters from a theme or companion plugin to enrich the generated agent view with CMS-specific fields.

```php
add_filter('avl_agent_view_document', function ($document, $post, $path) {
    $document['intent']['audience'][] = 'customer';
    $document['state']['template'] = get_page_template_slug($post);
    $document['state']['featured_image'] = get_the_post_thumbnail_url($post, 'full');
    return $document;
}, 10, 3);
```

Add site-specific actions:

```php
add_filter('avl_agent_view_actions', function ($actions, $post, $path) {
    if ($post->post_type === 'product') {
        $actions[] = [
            'id' => 'buy',
            'method' => 'GET',
            'href' => get_permalink($post) . '#purchase',
        ];
    }

    return $actions;
}, 10, 3);
```

Customize manifest route inventory:

```php
add_filter('avl_agent_manifest_routes', function ($routes) {
    $routes[] = 'GET /products/{slug}.agent';
    return $routes;
});
```

## CMS Adapter Pattern

Future CMS plugins should follow the same folder pattern:

```text
plugins/
  WordPress/
    avl-agent-view-layer/
      avl-agent-view-layer.php
      readme.txt
      uninstall.php
      assets/
    page-builders/
      avl-divi-badge/
      avl-elementor-badge/
      avl-beaver-badge/
    README.md
    docker-compose.yml
    scripts/
  Drupal/
  Joomla/
  CraftCMS/
```

The shared contract is simple: resolve a public CMS route, build the same six-section AVL document, serve it at the `.agent` suffix, and advertise discovery from the human page.
