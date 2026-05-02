# AVL Page Builder Add-ons

These optional add-on plugins expose the core AVL badge inside page builders.
They all require the main `avl-agent-view-layer` plugin.

Included add-ons:

- `avl-divi-badge` — Divi Builder module plus `[avl_divi_badge]`.
- `avl-elementor-badge` — Elementor widget plus `[avl_elementor_badge]`.
- `avl-beaver-badge` — Beaver Builder module plus `[avl_beaver_badge]`.
- `avl-block-badge` — WordPress block editor block plus `[avl_block_badge]`.
- `avl-bricks-badge` — Bricks shortcode surface plus `[avl_bricks_badge]`.
- `avl-bakery-badge` — visual builder element plus `[avl_bakery_badge]`.
- `avl-avada-badge` — Avada/Fusion shortcode surface plus `[avl_avada_badge]`.
- `avl-oxygen-badge` — Oxygen/Breakdance shortcode surface plus `[avl_oxygen_badge]`.

The main AVL plugin also supports all builders through `[avl_badge]`, and its
admin panel can auto-detect common WordPress builders and themes:

- Divi
- Elementor
- Beaver Builder
- Avada / Fusion Builder
- Bricks
- Oxygen Builder
- WPBakery
- Block themes / Gutenberg
- Breakdance

Builder-specific runtime testing requires the commercial or third-party builder
plugins to be installed in the local WordPress stack. The add-ons are guarded so
they lint and activate safely when their builder is absent, then register their
native module/widget when the builder API is present.
