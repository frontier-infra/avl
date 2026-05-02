=== AVL Agent View Layer ===
Contributors: frontier-infra
Tags: ai, agents, accessibility, structured-data, cms
Requires at least: 6.4
Tested up to: 6.9
Requires PHP: 7.4
Stable tag: 0.1.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Publish Agent View Layer companions for public WordPress content so AI agents can read page intent, state, actions, context, and navigation.

== Description ==

AVL Agent View Layer gives public WordPress pages a parallel agent-native view.

For example:

* `/agent.txt` publishes a site-level AVL manifest.
* `/.agent` publishes a site/front-page agent view.
* `/about.agent` publishes an agent view for the public WordPress page at `/about`.
* Human pages advertise their companion with an HTML alternate link and an HTTP `Link` header.
* Badge type, colors, placement, and framework compatibility can be configured in Settings.
* Manual placement is available with `[avl_badge]` for blocks and page builders.

The plugin does not send data to external services. A visible AVL badge is available but disabled by default; machine-readable discovery is active without showing a public credit.

== Installation ==

1. Upload the `avl-agent-view-layer` folder to `/wp-content/plugins/`.
2. Activate the plugin through the Plugins screen in WordPress.
3. Visit Settings > AVL Agent View Layer to choose post types, TTL, and badge visibility.
4. If `.agent` URLs do not resolve immediately, visit Settings > Permalinks once to flush rewrite rules.

== Frequently Asked Questions ==

= Does this expose private content? =

No. Version 0.1.0 resolves only published public content from enabled public post types.

= Does this call an external API? =

No. The plugin generates AVL documents locally from WordPress data.

= Why is the badge disabled by default? =

WordPress.org guidelines require public-facing credits or links to be opt-in. Discovery still works through head links, HTTP headers, `/agent.txt`, and `.agent` suffix URLs.

= Can I customize the generated document? =

Yes. Use the `avl_agent_view_document`, `avl_agent_view_actions`, and `avl_agent_manifest_routes` filters from a theme or companion plugin.

= Does this work with page builders? =

Yes. Use `[avl_badge]` in Divi, Elementor, Beaver Builder, Avada, Bricks, Oxygen, WPBakery, or any builder that supports shortcodes. Optional native add-on plugins for Divi, Elementor, and Beaver Builder are included in the repository.

== Screenshots ==

1. Settings page for enabling routes, selecting post types, and configuring discovery options.

== Changelog ==

= 0.1.0 =

* Initial WordPress plugin for AVL manifest, suffix routes, content negotiation, and discovery links.
* Added configurable badge type, colors, placement, shortcode output, and page-builder compatibility modes.
