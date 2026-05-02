<?php
/**
 * Plugin Name: AVL Agent View Layer
 * Plugin URI: https://github.com/frontier-infra/avl
 * Description: Publishes Agent View Layer companions for public WordPress content at /.agent, /path.agent, and /agent.txt.
 * Version: 0.1.0
 * Requires at least: 6.4
 * Requires PHP: 7.4
 * Author: Frontier Infra
 * License: GPL-2.0-or-later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: avl-agent-view-layer
 *
 * @package AVLAgentViewLayer
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'AVL_WP_VERSION', '0.1.0' );
define( 'AVL_WP_OPTION', 'avl_agent_view_layer_options' );
define( 'AVL_WP_AGENT_ROOT', '__root__' );
define( 'AVL_WP_CONTENT_TYPE', 'text/agent-view; version=1; charset=utf-8' );

register_activation_hook( __FILE__, 'avl_wp_activate' );
register_deactivation_hook( __FILE__, 'avl_wp_deactivate' );

add_action( 'init', 'avl_wp_register_routes' );
add_action( 'admin_init', 'avl_wp_register_settings' );
add_action( 'admin_menu', 'avl_wp_register_settings_page' );
add_action( 'admin_notices', 'avl_wp_builder_recommendation_notice' );
add_filter( 'query_vars', 'avl_wp_query_vars' );
add_action( 'template_redirect', 'avl_wp_render_agent_response', 0 );
add_action( 'send_headers', 'avl_wp_send_discovery_header' );
add_action( 'wp_head', 'avl_wp_render_head_discovery' );
add_action( 'wp_body_open', 'avl_wp_render_body_discovery' );
add_action( 'wp_footer', 'avl_wp_render_footer_discovery' );
add_shortcode( 'avl_badge', 'avl_wp_badge_shortcode' );

function avl_wp_activate(): void {
	add_option( AVL_WP_OPTION, avl_wp_default_options() );
	avl_wp_register_routes();
	flush_rewrite_rules();
}

function avl_wp_deactivate(): void {
	flush_rewrite_rules();
}

/**
 * @return array<string, mixed>
 */
function avl_wp_default_options(): array {
	return array(
		'enabled'       => true,
		'badge_enabled' => false,
		'badge_type'    => 'pill',
		'badge_bg'      => '#0e7c2e',
		'badge_fg'      => '#ffffff',
		'badge_border'  => '#0a5c22',
		'badge_placement' => 'auto',
		'badge_position'  => 'bottom-right',
		'framework_mode'  => 'auto',
		'ttl'           => '5m',
		'post_types'    => array( 'post', 'page' ),
		'contact'       => '',
	);
}

/**
 * @return array<string, mixed>
 */
function avl_wp_options(): array {
	$options = get_option( AVL_WP_OPTION, array() );
	if ( ! is_array( $options ) ) {
		$options = array();
	}

	return array_merge( avl_wp_default_options(), $options );
}

function avl_wp_enabled(): bool {
	$options = avl_wp_options();
	return ! empty( $options['enabled'] );
}

/**
 * @return array<string, string>
 */
function avl_wp_badge_types(): array {
	return array(
		'pill'    => __( 'Pill badge', 'avl-agent-view-layer' ),
		'compact' => __( 'Compact badge', 'avl-agent-view-layer' ),
		'card'    => __( 'Card badge', 'avl-agent-view-layer' ),
		'svg'     => __( 'Official SVG badge', 'avl-agent-view-layer' ),
		'text'    => __( 'Text link', 'avl-agent-view-layer' ),
	);
}

/**
 * @return array<string, string>
 */
function avl_wp_badge_placements(): array {
	return array(
		'auto'      => __( 'Auto-detect best hook', 'avl-agent-view-layer' ),
		'body_open' => __( 'After opening body', 'avl-agent-view-layer' ),
		'footer'    => __( 'Footer', 'avl-agent-view-layer' ),
		'floating'  => __( 'Floating overlay', 'avl-agent-view-layer' ),
		'manual'    => __( 'Manual shortcode only', 'avl-agent-view-layer' ),
	);
}

/**
 * @return array<string, string>
 */
function avl_wp_badge_positions(): array {
	return array(
		'bottom-right' => __( 'Bottom right', 'avl-agent-view-layer' ),
		'bottom-left'  => __( 'Bottom left', 'avl-agent-view-layer' ),
		'top-right'    => __( 'Top right', 'avl-agent-view-layer' ),
		'top-left'     => __( 'Top left', 'avl-agent-view-layer' ),
		'inline'       => __( 'Inline', 'avl-agent-view-layer' ),
	);
}

/**
 * @return array<string, string>
 */
function avl_wp_framework_modes(): array {
	return array(
		'auto'      => __( 'Auto-detect', 'avl-agent-view-layer' ),
		'standard'  => __( 'Standard WordPress theme', 'avl-agent-view-layer' ),
		'block'     => __( 'Block theme / Gutenberg', 'avl-agent-view-layer' ),
		'divi'      => __( 'Divi', 'avl-agent-view-layer' ),
		'elementor' => __( 'Elementor', 'avl-agent-view-layer' ),
		'beaver'    => __( 'Beaver Builder', 'avl-agent-view-layer' ),
		'avada'     => __( 'Avada / Fusion Builder', 'avl-agent-view-layer' ),
		'bricks'    => __( 'Bricks', 'avl-agent-view-layer' ),
		'oxygen'    => __( 'Oxygen Builder', 'avl-agent-view-layer' ),
		'wpbakery'  => __( 'WPBakery', 'avl-agent-view-layer' ),
		'manual'    => __( 'Manual shortcode / builder module', 'avl-agent-view-layer' ),
	);
}

function avl_wp_register_routes(): void {
	add_rewrite_rule( '^agent\.txt$', 'index.php?avl_agent_manifest=1', 'top' );
	add_rewrite_rule( '^llms\.txt$', 'index.php?avl_lm_manifest=1', 'top' );
	add_rewrite_rule( '^lm\.txt$', 'index.php?avl_lm_manifest=1', 'top' );
	add_rewrite_rule( '^\.agent$', 'index.php?avl_agent_view=' . AVL_WP_AGENT_ROOT, 'top' );
	add_rewrite_rule( '^(.+)\.agent$', 'index.php?avl_agent_view=$matches[1]', 'top' );
}

/**
 * @param array<int, string> $vars Query vars.
 * @return array<int, string>
 */
function avl_wp_query_vars( array $vars ): array {
	$vars[] = 'avl_agent_manifest';
	$vars[] = 'avl_lm_manifest';
	$vars[] = 'avl_agent_view';
	return $vars;
}

function avl_wp_register_settings(): void {
	register_setting(
		'avl_agent_view_layer',
		AVL_WP_OPTION,
		array(
			'type'              => 'array',
			'sanitize_callback' => 'avl_wp_sanitize_options',
			'default'           => avl_wp_default_options(),
		)
	);

	add_settings_section(
		'avl_agent_view_layer_main',
		__( 'Agent View Layer', 'avl-agent-view-layer' ),
		'__return_false',
		'avl_agent_view_layer'
	);
}

/**
 * @param mixed $input Raw option input.
 * @return array<string, mixed>
 */
function avl_wp_sanitize_options( $input ): array {
	$defaults = avl_wp_default_options();
	$input    = is_array( $input ) ? $input : array();

	$public_post_types = avl_wp_public_post_type_names();
	$post_types        = array();
	if ( isset( $input['post_types'] ) && is_array( $input['post_types'] ) ) {
		foreach ( $input['post_types'] as $post_type ) {
			$post_type = sanitize_key( (string) $post_type );
			if ( in_array( $post_type, $public_post_types, true ) ) {
				$post_types[] = $post_type;
			}
		}
	}

	return array(
		'enabled'         => ! empty( $input['enabled'] ),
		'badge_enabled'   => ! empty( $input['badge_enabled'] ),
		'badge_type'      => avl_wp_sanitize_choice( $input['badge_type'] ?? $defaults['badge_type'], avl_wp_badge_types(), $defaults['badge_type'] ),
		'badge_bg'        => avl_wp_sanitize_hex_color( $input['badge_bg'] ?? $defaults['badge_bg'], $defaults['badge_bg'] ),
		'badge_fg'        => avl_wp_sanitize_hex_color( $input['badge_fg'] ?? $defaults['badge_fg'], $defaults['badge_fg'] ),
		'badge_border'    => avl_wp_sanitize_hex_color( $input['badge_border'] ?? $defaults['badge_border'], $defaults['badge_border'] ),
		'badge_placement' => avl_wp_sanitize_choice( $input['badge_placement'] ?? $defaults['badge_placement'], avl_wp_badge_placements(), $defaults['badge_placement'] ),
		'badge_position'  => avl_wp_sanitize_choice( $input['badge_position'] ?? $defaults['badge_position'], avl_wp_badge_positions(), $defaults['badge_position'] ),
		'framework_mode'  => avl_wp_sanitize_choice( $input['framework_mode'] ?? $defaults['framework_mode'], avl_wp_framework_modes(), $defaults['framework_mode'] ),
		'ttl'             => isset( $input['ttl'] ) ? sanitize_text_field( (string) $input['ttl'] ) : $defaults['ttl'],
		'post_types'      => $post_types ? array_values( array_unique( $post_types ) ) : $defaults['post_types'],
		'contact'         => isset( $input['contact'] ) ? sanitize_email( (string) $input['contact'] ) : '',
	);
}

function avl_wp_register_settings_page(): void {
	add_options_page(
		__( 'AVL Agent View Layer', 'avl-agent-view-layer' ),
		__( 'AVL Agent View Layer', 'avl-agent-view-layer' ),
		'manage_options',
		'avl-agent-view-layer',
		'avl_wp_render_settings_page'
	);
}

function avl_wp_render_settings_page(): void {
	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}

	$options      = avl_wp_options();
	$post_types   = avl_wp_public_post_type_names();
	$agent_url    = home_url( '/.agent' );
	$manifest_url = home_url( '/agent.txt' );
	$lm_url       = home_url( '/llms.txt' );
	$aeo_url      = add_query_arg( 'url', home_url( '/' ), 'https://aeocheck.ai/' );
	$detected     = avl_wp_detect_frameworks();
	$checks       = avl_wp_readiness_checks();
	?>
	<div class="wrap">
		<h1><?php echo esc_html__( 'AVL Agent View Layer', 'avl-agent-view-layer' ); ?></h1>
		<p><?php echo esc_html__( 'Publish agent-native companion views for public WordPress content.', 'avl-agent-view-layer' ); ?></p>
		<form method="post" action="options.php">
			<?php settings_fields( 'avl_agent_view_layer' ); ?>
			<table class="form-table" role="presentation">
				<tr>
					<th scope="row"><?php echo esc_html__( 'Enable AVL routes', 'avl-agent-view-layer' ); ?></th>
					<td>
						<label>
							<input type="checkbox" name="<?php echo esc_attr( AVL_WP_OPTION ); ?>[enabled]" value="1" <?php checked( ! empty( $options['enabled'] ) ); ?>>
							<?php echo esc_html__( 'Serve /agent.txt and .agent companion views.', 'avl-agent-view-layer' ); ?>
						</label>
					</td>
				</tr>
				<tr>
					<th scope="row"><?php echo esc_html__( 'Visible badge', 'avl-agent-view-layer' ); ?></th>
					<td>
						<label>
							<input type="checkbox" name="<?php echo esc_attr( AVL_WP_OPTION ); ?>[badge_enabled]" value="1" <?php checked( ! empty( $options['badge_enabled'] ) ); ?>>
							<?php echo esc_html__( 'Show the local AVL badge on public pages. Machine discovery remains active when this is off.', 'avl-agent-view-layer' ); ?>
						</label>
					</td>
				</tr>
				<tr>
					<th scope="row"><label for="avl-framework-mode"><?php echo esc_html__( 'Framework compatibility', 'avl-agent-view-layer' ); ?></label></th>
					<td>
						<select id="avl-framework-mode" name="<?php echo esc_attr( AVL_WP_OPTION ); ?>[framework_mode]">
							<?php foreach ( avl_wp_framework_modes() as $value => $label ) : ?>
								<option value="<?php echo esc_attr( $value ); ?>" <?php selected( $options['framework_mode'], $value ); ?>><?php echo esc_html( $label ); ?></option>
							<?php endforeach; ?>
						</select>
						<p class="description">
							<?php
							echo esc_html__( 'Detected:', 'avl-agent-view-layer' ) . ' ';
							echo esc_html( $detected ? implode( ', ', $detected ) : __( 'standard WordPress theme', 'avl-agent-view-layer' ) );
							?>
						</p>
						<?php avl_wp_render_builder_recommendations(); ?>
					</td>
				</tr>
				<tr>
					<th scope="row"><label for="avl-badge-placement"><?php echo esc_html__( 'Badge placement', 'avl-agent-view-layer' ); ?></label></th>
					<td>
						<select id="avl-badge-placement" name="<?php echo esc_attr( AVL_WP_OPTION ); ?>[badge_placement]">
							<?php foreach ( avl_wp_badge_placements() as $value => $label ) : ?>
								<option value="<?php echo esc_attr( $value ); ?>" <?php selected( $options['badge_placement'], $value ); ?>><?php echo esc_html( $label ); ?></option>
							<?php endforeach; ?>
						</select>
						<select name="<?php echo esc_attr( AVL_WP_OPTION ); ?>[badge_position]">
							<?php foreach ( avl_wp_badge_positions() as $value => $label ) : ?>
								<option value="<?php echo esc_attr( $value ); ?>" <?php selected( $options['badge_position'], $value ); ?>><?php echo esc_html( $label ); ?></option>
							<?php endforeach; ?>
						</select>
						<p class="description"><?php echo esc_html__( 'Manual mode disables automatic output. Place the badge with shortcode [avl_badge].', 'avl-agent-view-layer' ); ?></p>
					</td>
				</tr>
				<tr>
					<th scope="row"><label for="avl-badge-type"><?php echo esc_html__( 'Badge style', 'avl-agent-view-layer' ); ?></label></th>
					<td>
						<select id="avl-badge-type" name="<?php echo esc_attr( AVL_WP_OPTION ); ?>[badge_type]">
							<?php foreach ( avl_wp_badge_types() as $value => $label ) : ?>
								<option value="<?php echo esc_attr( $value ); ?>" <?php selected( $options['badge_type'], $value ); ?>><?php echo esc_html( $label ); ?></option>
							<?php endforeach; ?>
						</select>
					</td>
				</tr>
				<tr>
					<th scope="row"><?php echo esc_html__( 'Badge colors', 'avl-agent-view-layer' ); ?></th>
					<td>
						<label>
							<?php echo esc_html__( 'Background', 'avl-agent-view-layer' ); ?>
							<input type="color" name="<?php echo esc_attr( AVL_WP_OPTION ); ?>[badge_bg]" value="<?php echo esc_attr( (string) $options['badge_bg'] ); ?>">
						</label>
						<label style="margin-left:12px;">
							<?php echo esc_html__( 'Text', 'avl-agent-view-layer' ); ?>
							<input type="color" name="<?php echo esc_attr( AVL_WP_OPTION ); ?>[badge_fg]" value="<?php echo esc_attr( (string) $options['badge_fg'] ); ?>">
						</label>
						<label style="margin-left:12px;">
							<?php echo esc_html__( 'Border', 'avl-agent-view-layer' ); ?>
							<input type="color" name="<?php echo esc_attr( AVL_WP_OPTION ); ?>[badge_border]" value="<?php echo esc_attr( (string) $options['badge_border'] ); ?>">
						</label>
					</td>
				</tr>
				<tr>
					<th scope="row"><?php echo esc_html__( 'Public post types', 'avl-agent-view-layer' ); ?></th>
					<td>
						<?php foreach ( $post_types as $post_type ) : ?>
							<label style="display:block;margin-bottom:4px;">
								<input type="checkbox" name="<?php echo esc_attr( AVL_WP_OPTION ); ?>[post_types][]" value="<?php echo esc_attr( $post_type ); ?>" <?php checked( in_array( $post_type, (array) $options['post_types'], true ) ); ?>>
								<?php echo esc_html( $post_type ); ?>
							</label>
						<?php endforeach; ?>
					</td>
				</tr>
				<tr>
					<th scope="row"><label for="avl-ttl"><?php echo esc_html__( 'TTL', 'avl-agent-view-layer' ); ?></label></th>
					<td>
						<input id="avl-ttl" class="regular-text" type="text" name="<?php echo esc_attr( AVL_WP_OPTION ); ?>[ttl]" value="<?php echo esc_attr( (string) $options['ttl'] ); ?>">
						<p class="description"><?php echo esc_html__( 'Advisory cache lifetime stamped into @meta.ttl, such as 5m, 1h, or 1d.', 'avl-agent-view-layer' ); ?></p>
					</td>
				</tr>
				<tr>
					<th scope="row"><label for="avl-contact"><?php echo esc_html__( 'Manifest contact', 'avl-agent-view-layer' ); ?></label></th>
					<td>
						<input id="avl-contact" class="regular-text" type="email" name="<?php echo esc_attr( AVL_WP_OPTION ); ?>[contact]" value="<?php echo esc_attr( (string) $options['contact'] ); ?>">
					</td>
				</tr>
			</table>
			<?php submit_button(); ?>
		</form>
		<p>
			<a href="<?php echo esc_url( $manifest_url ); ?>"><?php echo esc_html__( 'Open manifest', 'avl-agent-view-layer' ); ?></a>
			|
			<a href="<?php echo esc_url( $agent_url ); ?>"><?php echo esc_html__( 'Open front page agent view', 'avl-agent-view-layer' ); ?></a>
			|
			<a href="<?php echo esc_url( $lm_url ); ?>"><?php echo esc_html__( 'Open llms.txt', 'avl-agent-view-layer' ); ?></a>
		</p>
		<div class="notice notice-info inline" style="max-width:960px;margin:16px 0;padding:12px;">
			<p>
				<strong><?php echo esc_html__( 'External AEO/GEO validation', 'avl-agent-view-layer' ); ?></strong>
			</p>
			<p>
				<?php echo esc_html__( 'Use AEOCheck.ai, our sister service, to inspect how this site presents itself to answer engines, generative engines, and AI agents.', 'avl-agent-view-layer' ); ?>
			</p>
			<p>
				<a class="button button-secondary" href="<?php echo esc_url( $aeo_url ); ?>" target="_blank" rel="noopener noreferrer">
					<?php echo esc_html__( 'Check this site on AEOCheck.ai', 'avl-agent-view-layer' ); ?>
				</a>
			</p>
		</div>
		<h2><?php echo esc_html__( 'Readiness checks', 'avl-agent-view-layer' ); ?></h2>
		<p><?php echo esc_html__( 'These checks summarize AVL, AEO, GEO, and llms.txt readiness signals for agents and generative search systems.', 'avl-agent-view-layer' ); ?></p>
		<table class="widefat striped" style="max-width:960px;">
			<thead>
				<tr>
					<th><?php echo esc_html__( 'Standard', 'avl-agent-view-layer' ); ?></th>
					<th><?php echo esc_html__( 'Check', 'avl-agent-view-layer' ); ?></th>
					<th><?php echo esc_html__( 'Status', 'avl-agent-view-layer' ); ?></th>
				</tr>
			</thead>
			<tbody>
				<?php foreach ( $checks as $check ) : ?>
					<tr>
						<td><?php echo esc_html( $check['standard'] ); ?></td>
						<td><?php echo esc_html( $check['label'] ); ?></td>
						<td>
							<strong><?php echo esc_html( $check['pass'] ? __( 'Pass', 'avl-agent-view-layer' ) : __( 'Needs attention', 'avl-agent-view-layer' ) ); ?></strong>
							<?php if ( ! empty( $check['detail'] ) ) : ?>
								<br><span class="description"><?php echo esc_html( $check['detail'] ); ?></span>
							<?php endif; ?>
						</td>
					</tr>
				<?php endforeach; ?>
			</tbody>
		</table>
	</div>
	<?php
}

function avl_wp_render_agent_response(): void {
	if ( ! avl_wp_enabled() ) {
		return;
	}

	if ( get_query_var( 'avl_agent_manifest' ) ) {
		avl_wp_send_text_response( avl_wp_render_manifest(), 'text/plain; charset=utf-8' );
	}

	if ( get_query_var( 'avl_lm_manifest' ) ) {
		avl_wp_send_text_response( avl_wp_render_lm_manifest(), 'text/plain; charset=utf-8' );
	}

	$agent_path = get_query_var( 'avl_agent_view', null );
	if ( null !== $agent_path && '' !== $agent_path ) {
		$human_path = avl_wp_human_path_from_agent_path( (string) $agent_path );
		avl_wp_render_document_for_path( $human_path );
	}

	if ( avl_wp_accepts_agent_view() && avl_wp_should_advertise_current_page() ) {
		avl_wp_render_document_for_path( avl_wp_current_human_path() );
	}
}

function avl_wp_render_document_for_path( string $human_path ): void {
	$document = avl_wp_resolve_document( $human_path );

	if ( ! $document ) {
		status_header( 404 );
		avl_wp_send_text_response( avl_wp_render_not_found_document( $human_path ), AVL_WP_CONTENT_TYPE );
	}

	avl_wp_send_text_response( avl_wp_serialize_document( $document ), AVL_WP_CONTENT_TYPE );
}

function avl_wp_send_text_response( string $body, string $content_type ): void {
	nocache_headers();
	header( 'Content-Type: ' . $content_type );
	header( 'Vary: Accept', false );
	echo $body; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Serialized text/agent-view body is escaped by the serializer.
	exit;
}

function avl_wp_human_path_from_agent_path( string $agent_path ): string {
	if ( AVL_WP_AGENT_ROOT === $agent_path ) {
		return '/';
	}

	$path = '/' . ltrim( rawurldecode( $agent_path ), '/' );
	$path = preg_replace( '#/+#', '/', $path );
	return $path ?: '/';
}

function avl_wp_current_human_path(): string {
	$request_uri = isset( $_SERVER['REQUEST_URI'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REQUEST_URI'] ) ) : '/';
	$path        = (string) wp_parse_url( $request_uri, PHP_URL_PATH );
	return $path ?: '/';
}

function avl_wp_agent_path_for_human_path( string $human_path ): string {
	$path = '/' . ltrim( $human_path, '/' );
	if ( '/' === $path ) {
		return '/.agent';
	}

	return untrailingslashit( $path ) . '.agent';
}

function avl_wp_accepts_agent_view(): bool {
	$accept = isset( $_SERVER['HTTP_ACCEPT'] ) ? sanitize_text_field( wp_unslash( $_SERVER['HTTP_ACCEPT'] ) ) : '';
	return false !== stripos( $accept, 'text/agent-view' );
}

function avl_wp_is_agent_or_manifest_request(): bool {
	$path = avl_wp_current_human_path();
	return '/agent.txt' === $path || avl_wp_ends_with( $path, '.agent' );
}

function avl_wp_should_advertise_current_page(): bool {
	if ( ! avl_wp_enabled() ) {
		return false;
	}

	$is_robots = function_exists( 'is_robots' ) && is_robots();
	$is_ajax   = function_exists( 'wp_doing_ajax' ) && wp_doing_ajax();

	if ( is_admin() || is_feed() || $is_robots || $is_ajax || avl_wp_is_agent_or_manifest_request() ) {
		return false;
	}

	if ( is_front_page() || is_home() ) {
		return true;
	}

	return is_singular( avl_wp_enabled_post_types() );
}

function avl_wp_send_discovery_header(): void {
	if ( ! avl_wp_should_advertise_current_page() ) {
		return;
	}

	$human_path = avl_wp_current_human_path();
	header( 'Link: <' . esc_url_raw( $human_path ) . '>; rel="canonical", </agent.txt>; rel="agent-manifest"; type="text/plain"', false );
}

function avl_wp_render_head_discovery(): void {
	if ( ! avl_wp_should_advertise_current_page() ) {
		return;
	}

	$agent_path = avl_wp_agent_path_for_human_path( avl_wp_current_human_path() );
	echo "\n" . '<link rel="alternate" type="text/agent-view; version=1" href="' . esc_url( $agent_path ) . '">' . "\n";
	echo '<link rel="agent-manifest" type="text/plain" href="/agent.txt">' . "\n";
}

function avl_wp_render_body_discovery(): void {
	$options = avl_wp_options();
	if ( 'body_open' !== avl_wp_effective_badge_placement( $options ) ) {
		return;
	}

	echo avl_wp_render_badge(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Badge HTML is escaped by avl_wp_render_badge().
}

function avl_wp_render_footer_discovery(): void {
	$options   = avl_wp_options();
	$placement = avl_wp_effective_badge_placement( $options );
	if ( 'footer' !== $placement && 'floating' !== $placement ) {
		return;
	}

	echo avl_wp_render_badge(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Badge HTML is escaped by avl_wp_render_badge().
}

/**
 * @param array<string, mixed> $atts Shortcode attributes.
 */
function avl_wp_badge_shortcode( $atts = array() ): string {
	if ( ! avl_wp_should_advertise_current_page() ) {
		return '';
	}

	$atts = shortcode_atts(
		array(
			'type'     => '',
			'position' => 'inline',
		),
		(array) $atts,
		'avl_badge'
	);

	$options                   = avl_wp_options();
	$options['badge_enabled']  = true;
	$options['badge_type']     = avl_wp_sanitize_choice( $atts['type'] ?: $options['badge_type'], avl_wp_badge_types(), $options['badge_type'] );
	$options['badge_position'] = avl_wp_sanitize_choice( $atts['position'], avl_wp_badge_positions(), 'inline' );

	return avl_wp_render_badge( $options );
}

/**
 * @param array<string, mixed>|null $options Options override.
 */
function avl_wp_render_badge( ?array $options = null ): string {
	$options = $options ? array_merge( avl_wp_options(), $options ) : avl_wp_options();
	if ( empty( $options['badge_enabled'] ) || ! avl_wp_should_advertise_current_page() ) {
		return '';
	}

	$agent_path = avl_wp_agent_path_for_human_path( avl_wp_current_human_path() );
	$title      = sprintf(
		/* translators: %s: AVL companion path. */
		__( 'AVL agent-ready: this WordPress page publishes an agent companion at %s', 'avl-agent-view-layer' ),
		$agent_path
	);
	$type       = avl_wp_sanitize_choice( $options['badge_type'] ?? 'pill', avl_wp_badge_types(), 'pill' );
	$position   = avl_wp_sanitize_choice( $options['badge_position'] ?? 'inline', avl_wp_badge_positions(), 'inline' );
	$style      = avl_wp_badge_wrapper_style( $options, $position );
	$link_style = avl_wp_badge_link_style( $options, $type );
	$classes    = 'avl-agent-badge avl-agent-badge--' . sanitize_html_class( $type ) . ' avl-agent-badge--' . sanitize_html_class( $position );
	$content    = avl_wp_badge_content( $type, $title );

	return '<div role="group" aria-label="' . esc_attr__( 'Agent View Layer capabilities', 'avl-agent-view-layer' ) . '" class="' . esc_attr( $classes ) . '" data-agent-discovery="true" data-avl-endpoint="' . esc_attr( $agent_path ) . '" data-avl-manifest="/agent.txt" data-avl-package="@frontier-infra/avl" data-avl-badge-type="' . esc_attr( $type ) . '" style="' . esc_attr( $style ) . '">'
		. '<a rel="alternate" type="text/agent-view; version=1" href="' . esc_url( $agent_path ) . '" title="' . esc_attr( $title ) . '" style="' . esc_attr( $link_style ) . '">'
		. $content
		. '</a>'
		. '</div>';
}

function avl_wp_badge_content( string $type, string $title ): string {
	if ( 'svg' === $type ) {
		$badge_url = plugins_url( 'assets/avl-badge.svg', __FILE__ );
		return '<img src="' . esc_url( $badge_url ) . '" alt="' . esc_attr( $title ) . '" style="height:24px;width:auto;display:block;">';
	}

	if ( 'compact' === $type ) {
		return '<span aria-hidden="true" style="font-weight:700;">AVL</span><span class="screen-reader-text">' . esc_html( $title ) . '</span>';
	}

	if ( 'text' === $type ) {
		return esc_html__( 'Agent view', 'avl-agent-view-layer' );
	}

	if ( 'card' === $type ) {
		return '<span style="display:block;font-weight:700;">' . esc_html__( 'AVL agent-ready', 'avl-agent-view-layer' ) . '</span><span style="display:block;font-size:12px;opacity:.85;">' . esc_html__( 'Open companion view', 'avl-agent-view-layer' ) . '</span>';
	}

	return esc_html__( 'AVL agent-ready', 'avl-agent-view-layer' );
}

/**
 * @param array<string, mixed> $options Options.
 */
function avl_wp_badge_wrapper_style( array $options, string $position ): string {
	$base = 'z-index:9999;';
	if ( 'inline' === $position ) {
		return 'display:inline-block;margin:0.75rem 0;' . $base;
	}

	$edges = array(
		'bottom-right' => 'position:fixed;right:16px;bottom:16px;',
		'bottom-left'  => 'position:fixed;left:16px;bottom:16px;',
		'top-right'    => 'position:fixed;right:16px;top:16px;',
		'top-left'     => 'position:fixed;left:16px;top:16px;',
	);

	return ( $edges[ $position ] ?? 'display:block;margin:1rem 0;' ) . $base;
}

/**
 * @param array<string, mixed> $options Options.
 */
function avl_wp_badge_link_style( array $options, string $type ): string {
	$bg     = avl_wp_sanitize_hex_color( $options['badge_bg'] ?? '#0e7c2e', '#0e7c2e' );
	$fg     = avl_wp_sanitize_hex_color( $options['badge_fg'] ?? '#ffffff', '#ffffff' );
	$border = avl_wp_sanitize_hex_color( $options['badge_border'] ?? '#0a5c22', '#0a5c22' );
	$pad    = 'compact' === $type ? '5px 8px' : '8px 12px';
	if ( 'card' === $type ) {
		$pad = '12px 14px';
	}

	if ( 'svg' === $type ) {
		return 'display:inline-block;line-height:0;';
	}

	return 'display:inline-flex;align-items:center;gap:6px;padding:' . $pad . ';border:1px solid ' . $border . ';border-radius:999px;background:' . $bg . ';color:' . $fg . ';font:600 13px/1.2 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;text-decoration:none;box-shadow:0 2px 8px rgba(0,0,0,.16);';
}

/**
 * @param array<string, mixed> $options Options.
 */
function avl_wp_effective_badge_placement( array $options ): string {
	if ( empty( $options['badge_enabled'] ) ) {
		return 'manual';
	}

	$placement = (string) ( $options['badge_placement'] ?? 'auto' );
	if ( 'manual' === $placement || 'body_open' === $placement || 'footer' === $placement || 'floating' === $placement ) {
		return $placement;
	}

	$mode = avl_wp_effective_framework_mode( $options );
	if ( in_array( $mode, array( 'divi', 'elementor', 'beaver', 'avada', 'bricks', 'oxygen', 'wpbakery' ), true ) ) {
		return 'footer';
	}

	return 'body_open';
}

/**
 * @return array<string, mixed>|null
 */
function avl_wp_resolve_document( string $human_path ) {
	if ( '/' === $human_path ) {
		return avl_wp_build_site_document();
	}

	$post = avl_wp_resolve_public_post( $human_path );
	if ( ! $post ) {
		return null;
	}

	$document = avl_wp_build_post_document( $human_path, $post );
	return apply_filters( 'avl_agent_view_document', $document, $post, $human_path );
}

/**
 * @return WP_Post|null
 */
function avl_wp_resolve_public_post( string $human_path ) {
	$path = trim( $human_path, '/' );
	if ( '' === $path ) {
		return null;
	}

	$post_types = avl_wp_enabled_post_types();
	$post       = get_page_by_path( $path, OBJECT, $post_types );

	if ( $post && avl_wp_is_public_post( $post ) ) {
		return $post;
	}

	$post_id = url_to_postid( home_url( $human_path ) );
	if ( $post_id ) {
		$post = get_post( $post_id );
		return avl_wp_is_public_post( $post ) && in_array( $post->post_type, $post_types, true ) ? $post : null;
	}

	return null;
}

/**
 * @param mixed $post Candidate post.
 */
function avl_wp_is_public_post( $post ): bool {
	return $post instanceof WP_Post && 'publish' === $post->post_status;
}

/**
 * @return array<string, mixed>
 */
function avl_wp_build_site_document(): array {
	$options = avl_wp_options();
	$recent  = get_posts(
		array(
			'numberposts' => 10,
			'post_status' => 'publish',
			'post_type'   => avl_wp_enabled_post_types(),
		)
	);

	$posts = array();
	foreach ( $recent as $post ) {
		$path    = (string) wp_parse_url( get_permalink( $post ), PHP_URL_PATH );
		$posts[] = array(
			'id'        => $post->ID,
			'type'      => $post->post_type,
			'title'     => html_entity_decode( wp_strip_all_tags( get_the_title( $post ) ), ENT_QUOTES, get_bloginfo( 'charset' ) ),
			'published' => get_post_time( DATE_ATOM, false, $post ),
			'agent'     => avl_wp_agent_path_for_human_path( $path ?: '/' ),
		);
	}

	return array(
		'meta'    => array(
			'v'         => 1,
			'route'     => '/',
			'generated' => gmdate( DATE_ATOM ),
			'ttl'       => $options['ttl'],
		),
		'intent'  => array(
			'purpose'    => sprintf(
				/* translators: %s: Site name. */
				__( 'WordPress site: %s', 'avl-agent-view-layer' ),
				get_bloginfo( 'name' )
			),
			'audience'   => array( 'visitor', 'agent' ),
			'capability' => array( 'read', 'navigate' ),
		),
		'state'   => array(
			'name'        => get_bloginfo( 'name' ),
			'description' => get_bloginfo( 'description' ),
			'url'         => home_url( '/' ),
			'recent'      => $posts,
		),
		'actions' => array(
			array(
				'id'     => 'view_human',
				'method' => 'GET',
				'href'   => home_url( '/' ),
			),
		),
		'context' => sprintf(
			/* translators: 1: Site name, 2: Recent post count. */
			__( '%1$s publishes AVL companions for public WordPress content. %2$d recent public items are listed in @state.recent.', 'avl-agent-view-layer' ),
			get_bloginfo( 'name' ),
			count( $posts )
		),
		'nav'     => array(
			'self'      => '/.agent',
			'drilldown' => '/{path}.agent',
		),
	);
}

/**
 * @return array<string, mixed>
 */
function avl_wp_build_post_document( string $human_path, WP_Post $post ): array {
	$options    = avl_wp_options();
	$post_type  = get_post_type_object( $post->post_type );
	$type_label = $post_type && isset( $post_type->labels->singular_name )
		? strtolower( (string) $post_type->labels->singular_name )
		: $post->post_type;
	$title      = html_entity_decode( wp_strip_all_tags( get_the_title( $post ) ), ENT_QUOTES, get_bloginfo( 'charset' ) );

	$state = array(
		'id'         => $post->ID,
		'type'       => $post->post_type,
		'slug'       => $post->post_name,
		'title'      => $title,
		'author'     => get_the_author_meta( 'display_name', (int) $post->post_author ),
		'published'  => get_post_time( DATE_ATOM, false, $post ),
		'modified'   => get_post_modified_time( DATE_ATOM, false, $post ),
		'url'        => get_permalink( $post ),
		'excerpt'    => avl_wp_excerpt( $post ),
		'taxonomies' => avl_wp_taxonomy_state( $post ),
	);

	$actions = array(
		array(
			'id'     => 'view_human',
			'method' => 'GET',
			'href'   => get_permalink( $post ),
		),
	);

	if ( function_exists( 'rest_get_route_for_post' ) ) {
		$actions[] = array(
			'id'     => 'view_rest',
			'method' => 'GET',
			'href'   => rest_url( rest_get_route_for_post( $post ) ),
		);
	}

	if ( comments_open( $post ) ) {
		$actions[] = array(
			'id'     => 'comment',
			'method' => 'POST',
			'href'   => get_permalink( $post ) . '#respond',
		);
	}

	$actions = apply_filters( 'avl_agent_view_actions', $actions, $post, $human_path );

	return array(
		'meta'    => array(
			'v'         => 1,
			'route'     => $human_path,
			'generated' => gmdate( DATE_ATOM ),
			'ttl'       => $options['ttl'],
		),
		'intent'  => array(
			'purpose'    => ucfirst( $type_label ) . ': ' . $title,
			'audience'   => array( 'visitor', 'agent' ),
			'capability' => array( 'read', 'navigate' ),
		),
		'state'   => $state,
		'actions' => $actions,
		'context' => avl_wp_context( $post, $type_label, $title ),
		'nav'     => avl_wp_nav( $human_path, $post ),
	);
}

function avl_wp_excerpt( WP_Post $post ): string {
	$excerpt = has_excerpt( $post )
		? $post->post_excerpt
		: wp_trim_words( wp_strip_all_tags( strip_shortcodes( $post->post_content ) ), 40 );

	return html_entity_decode( wp_strip_all_tags( $excerpt ), ENT_QUOTES, get_bloginfo( 'charset' ) );
}

function avl_wp_context( WP_Post $post, string $type_label, string $title ): string {
	$excerpt = avl_wp_excerpt( $post );
	if ( '' !== $excerpt ) {
		return ucfirst( $type_label ) . ' "' . $title . '": ' . $excerpt;
	}

	return ucfirst( $type_label ) . ' "' . $title . '" published on ' . get_post_time( 'Y-m-d', false, $post ) . '.';
}

/**
 * @return array<string, array<int, string>>
 */
function avl_wp_taxonomy_state( WP_Post $post ): array {
	$result     = array();
	$taxonomies = get_object_taxonomies( $post->post_type, 'names' );

	foreach ( $taxonomies as $taxonomy ) {
		$terms = get_the_terms( $post, $taxonomy );
		if ( ! is_array( $terms ) || 0 === count( $terms ) ) {
			continue;
		}

		$result[ $taxonomy ] = array_values(
			array_map(
				static function ( $term ) {
					return $term->name;
				},
				$terms
			)
		);
	}

	return $result;
}

/**
 * @return array<string, mixed>
 */
function avl_wp_nav( string $human_path, WP_Post $post ): array {
	$nav = array(
		'self'    => avl_wp_agent_path_for_human_path( $human_path ),
		'parents' => array( '/.agent' ),
	);

	$parent_id = wp_get_post_parent_id( $post );
	if ( $parent_id ) {
		$parent_path = (string) wp_parse_url( get_permalink( $parent_id ), PHP_URL_PATH );
		if ( '' !== $parent_path ) {
			$nav['parents'][] = avl_wp_agent_path_for_human_path( $parent_path );
		}
	}

	return $nav;
}

function avl_wp_render_manifest(): string {
	$options   = avl_wp_options();
	$site_name = html_entity_decode( get_bloginfo( 'name' ), ENT_QUOTES, get_bloginfo( 'charset' ) );
	$routes    = apply_filters(
		'avl_agent_manifest_routes',
		array(
			'GET /.agent',
			'GET /{path}.agent',
		)
	);

	$lines = array(
		'# AVL Manifest',
		'# Discovery file for AI agents. Like robots.txt but for agent-native views.',
		'',
		'version: 1',
		'content-type: text/agent-view; version=1',
		'producer: wordpress',
		'plugin: avl-agent-view-layer ' . AVL_WP_VERSION,
		'site: ' . $site_name,
		'',
		'discovery:',
		'  - accept-header',
		'  - suffix',
		'  - html-link',
		'  - link-header',
		'',
		'session:',
		'  mechanisms: [cookie]',
		'  scope: public-content',
		'',
		'routes:',
	);

	foreach ( (array) $routes as $route ) {
		$lines[] = '  - ' . avl_wp_scalar( $route );
	}

	$lines[] = '';
	$lines[] = 'post_types: [' . implode( ', ', array_map( 'avl_wp_scalar', avl_wp_enabled_post_types() ) ) . ']';
	$lines[] = '';
	$lines[] = 'fetcher_hints:';
	$lines[] = '  safe_methods: [GET, HEAD]';
	$lines[] = '  body_link: ' . avl_wp_scalar( ! empty( $options['badge_enabled'] ) );
	$lines[] = '  head_link: true';
	$lines[] = '  conditional_requests: false';
	$lines[] = '';
	$lines[] = 'related:';
	$lines[] = '  llms: /llms.txt';
	$lines[] = '  lm: /lm.txt';
	$lines[] = '';
	$lines[] = 'spec: https://github.com/frontier-infra/avl/blob/main/specs/avl-agent-view-layer.md';
	if ( ! empty( $options['contact'] ) ) {
		$lines[] = 'contact: ' . avl_wp_scalar( $options['contact'] );
	}

	return implode( "\n", $lines ) . "\n";
}

function avl_wp_render_lm_manifest(): string {
	$options   = avl_wp_options();
	$site_name = html_entity_decode( get_bloginfo( 'name' ), ENT_QUOTES, get_bloginfo( 'charset' ) );
	$site_desc = html_entity_decode( get_bloginfo( 'description' ), ENT_QUOTES, get_bloginfo( 'charset' ) );
	$checks    = avl_wp_readiness_checks();
	$posts     = get_posts(
		array(
			'numberposts' => 10,
			'post_status' => 'publish',
			'post_type'   => avl_wp_enabled_post_types(),
		)
	);

	$lines = array(
		'# ' . $site_name,
		'',
		'> ' . ( $site_desc ?: __( 'WordPress site with Agent View Layer support.', 'avl-agent-view-layer' ) ),
		'',
		'## Agent and AI discovery',
		'',
		'- AVL manifest: ' . home_url( '/agent.txt' ),
		'- Site agent view: ' . home_url( '/.agent' ),
		'- Agent view pattern: ' . home_url( '/{path}.agent' ),
		'- Content type: text/agent-view; version=1',
		'- Supported methods: GET, HEAD',
		'',
		'## Standards readiness',
		'',
	);

	foreach ( $checks as $check ) {
		$lines[] = '- ' . $check['standard'] . ' - ' . $check['label'] . ': ' . ( $check['pass'] ? 'pass' : 'needs-attention' );
	}

	$lines[] = '';
	$lines[] = '## Public content';
	$lines[] = '';
	foreach ( $posts as $post ) {
		$path    = (string) wp_parse_url( get_permalink( $post ), PHP_URL_PATH );
		$lines[] = '- [' . html_entity_decode( wp_strip_all_tags( get_the_title( $post ) ), ENT_QUOTES, get_bloginfo( 'charset' ) ) . '](' . get_permalink( $post ) . ')';
		$lines[] = '  - Agent view: ' . home_url( avl_wp_agent_path_for_human_path( $path ?: '/' ) );
	}

	$lines[] = '';
	$lines[] = '## Integration';
	$lines[] = '';
	$lines[] = '- Producer: WordPress';
	$lines[] = '- Plugin: avl-agent-view-layer ' . AVL_WP_VERSION;
	$lines[] = '- Enabled post types: ' . implode( ', ', avl_wp_enabled_post_types() );
	$lines[] = '- Badge enabled: ' . ( ! empty( $options['badge_enabled'] ) ? 'yes' : 'no' );
	$lines[] = '- Framework mode: ' . avl_wp_effective_framework_mode( $options );
	if ( ! empty( $options['contact'] ) ) {
		$lines[] = '- Contact: ' . $options['contact'];
	}

	return implode( "\n", $lines ) . "\n";
}

/**
 * @return array<int, array{standard:string,label:string,pass:bool,detail:string}>
 */
function avl_wp_readiness_checks(): array {
	$options       = avl_wp_options();
	$enabled_types = avl_wp_enabled_post_types();
	$detected      = avl_wp_detect_frameworks();

	return array(
		array(
			'standard' => 'AVL',
			'label'    => __( 'Agent routes enabled', 'avl-agent-view-layer' ),
			'pass'     => ! empty( $options['enabled'] ),
			'detail'   => __( 'Serves /agent.txt, /.agent, and /{path}.agent.', 'avl-agent-view-layer' ),
		),
		array(
			'standard' => 'AVL',
			'label'    => __( 'Public content types selected', 'avl-agent-view-layer' ),
			'pass'     => count( $enabled_types ) > 0,
			'detail'   => implode( ', ', $enabled_types ),
		),
		array(
			'standard' => 'AEO',
			'label'    => __( 'HTML discovery links', 'avl-agent-view-layer' ),
			'pass'     => ! empty( $options['enabled'] ),
			'detail'   => __( 'Public pages emit alternate links and Link headers for agent discovery.', 'avl-agent-view-layer' ),
		),
		array(
			'standard' => 'GEO',
			'label'    => __( 'Generative answer context', 'avl-agent-view-layer' ),
			'pass'     => ! empty( $options['enabled'] ),
			'detail'   => __( 'Agent views include @intent, @state, @actions, @context, and @nav.', 'avl-agent-view-layer' ),
		),
		array(
			'standard' => 'llms.txt',
			'label'    => __( 'LM/llms manifest available', 'avl-agent-view-layer' ),
			'pass'     => ! empty( $options['enabled'] ),
			'detail'   => home_url( '/llms.txt' ) . ' / ' . home_url( '/lm.txt' ),
		),
		array(
			'standard' => 'Builder',
			'label'    => __( 'Builder compatibility', 'avl-agent-view-layer' ),
			'pass'     => count( avl_wp_missing_recommended_addons() ) === 0,
			'detail'   => $detected ? implode( ', ', $detected ) : __( 'No supported page builder detected.', 'avl-agent-view-layer' ),
		),
	);
}

function avl_wp_render_not_found_document( string $human_path ): string {
	return avl_wp_serialize_document(
		array(
			'meta'    => array(
				'v'         => 1,
				'route'     => $human_path,
				'generated' => gmdate( DATE_ATOM ),
				'ttl'       => '1m',
			),
			'intent'  => array(
				'purpose'    => 'Agent view not found',
				'audience'   => array( 'agent' ),
				'capability' => array( 'read' ),
			),
			'state'   => array(
				'found' => false,
				'route' => $human_path,
			),
			'context' => 'No published public WordPress content resolved for this AVL route.',
			'nav'     => array(
				'parents' => array( '/.agent' ),
			),
		)
	);
}

/**
 * @param array<string, mixed> $document Document to serialize.
 */
function avl_wp_serialize_document( array $document ): string {
	$sections = array();
	$meta     = isset( $document['meta'] ) && is_array( $document['meta'] ) ? $document['meta'] : array();

	$meta_lines = array(
		'@meta',
		'  v: ' . avl_wp_scalar( $meta['v'] ?? 1 ),
		'  route: ' . avl_wp_scalar( $meta['route'] ?? '/' ),
		'  generated: ' . avl_wp_scalar( $meta['generated'] ?? gmdate( DATE_ATOM ) ),
	);
	if ( isset( $meta['ttl'] ) ) {
		$meta_lines[] = '  ttl: ' . avl_wp_scalar( $meta['ttl'] );
	}
	$sections[] = implode( "\n", $meta_lines );

	$intent    = isset( $document['intent'] ) && is_array( $document['intent'] ) ? $document['intent'] : array();
	$sections[] = implode(
		"\n",
		array(
			'@intent',
			'  purpose:    ' . avl_wp_scalar( $intent['purpose'] ?? 'WordPress page' ),
			'  audience:   ' . implode( ', ', array_map( 'avl_wp_scalar', (array) ( $intent['audience'] ?? array() ) ) ),
			'  capability: ' . implode( ', ', array_map( 'avl_wp_scalar', (array) ( $intent['capability'] ?? array() ) ) ),
		)
	);

	if ( ! empty( $document['state'] ) && is_array( $document['state'] ) ) {
		$state = array( '@state' );
		foreach ( $document['state'] as $key => $value ) {
			foreach ( avl_wp_encode_named( (string) $key, $value ) as $line ) {
				$state[] = '  ' . $line;
			}
		}
		$sections[] = implode( "\n", $state );
	}

	if ( ! empty( $document['actions'] ) && is_array( $document['actions'] ) ) {
		$actions = array( '@actions' );
		foreach ( $document['actions'] as $action ) {
			if ( ! is_array( $action ) ) {
				continue;
			}
			$actions[] = '  - id: ' . avl_wp_scalar( $action['id'] ?? 'action' );
			$actions[] = '    method: ' . avl_wp_scalar( $action['method'] ?? 'GET' );
			$actions[] = '    href: ' . avl_wp_scalar( $action['href'] ?? '#' );
			if ( isset( $action['needs_role'] ) ) {
				$actions[] = '    needs_role: ' . avl_wp_scalar( $action['needs_role'] );
			}
		}
		$sections[] = implode( "\n", $actions );
	}

	if ( ! empty( $document['context'] ) ) {
		$context_lines = array_map(
			static function ( $line ) {
				return '  > ' . $line;
			},
			explode( "\n", trim( (string) $document['context'] ) )
		);
		$sections[] = implode( "\n", array_merge( array( '@context' ), $context_lines ) );
	}

	if ( ! empty( $document['nav'] ) && is_array( $document['nav'] ) ) {
		$nav = array( '@nav' );
		if ( ! empty( $document['nav']['self'] ) ) {
			$nav[] = '  self:      ' . avl_wp_scalar( $document['nav']['self'] );
		}
		if ( ! empty( $document['nav']['parents'] ) ) {
			$nav[] = '  parents:   [' . implode( ', ', array_map( 'avl_wp_scalar', (array) $document['nav']['parents'] ) ) . ']';
		}
		if ( ! empty( $document['nav']['peers'] ) ) {
			$nav[] = '  peers:     [' . implode( ', ', array_map( 'avl_wp_scalar', (array) $document['nav']['peers'] ) ) . ']';
		}
		if ( ! empty( $document['nav']['drilldown'] ) ) {
			$nav[] = '  drilldown: ' . avl_wp_scalar( $document['nav']['drilldown'] );
		}
		$sections[] = implode( "\n", $nav );
	}

	return implode( "\n\n", $sections ) . "\n";
}

/**
 * @param mixed $value Value to encode.
 * @return array<int, string>
 */
function avl_wp_encode_named( string $name, $value ): array {
	if ( null === $value ) {
		return array( $name . ': ~' );
	}

	if ( ! is_array( $value ) ) {
		return array( $name . ': ' . avl_wp_scalar( $value ) );
	}

	if ( array() === $value ) {
		return array( $name . '[0]:' );
	}

	if ( avl_wp_array_is_list( $value ) ) {
		$has_nested = false;
		foreach ( $value as $item ) {
			if ( is_array( $item ) ) {
				$has_nested = true;
				break;
			}
		}

		if ( ! $has_nested ) {
			return array( $name . '[' . count( $value ) . ']: ' . implode( ', ', array_map( 'avl_wp_scalar', $value ) ) );
		}
	}

	$lines = array( $name . ':' );
	foreach ( $value as $key => $child ) {
		foreach ( avl_wp_encode_named( (string) $key, $child ) as $line ) {
			$lines[] = '  ' . $line;
		}
	}
	return $lines;
}

/**
 * @param mixed $value Value to serialize.
 */
function avl_wp_scalar( $value ): string {
	if ( null === $value ) {
		return '~';
	}
	if ( is_bool( $value ) ) {
		return $value ? 'true' : 'false';
	}
	if ( is_int( $value ) || is_float( $value ) ) {
		return (string) $value;
	}

	$string = (string) $value;
	if ( preg_match( '/[",\r\n]/', $string ) ) {
		return '"' . str_replace( array( '\\', '"' ), array( '\\\\', '\\"' ), $string ) . '"';
	}

	return $string;
}

/**
 * @return array<int, string>
 */
function avl_wp_public_post_type_names(): array {
	$post_types = get_post_types( array( 'public' => true ), 'names' );
	unset( $post_types['attachment'] );
	return array_values( $post_types );
}

/**
 * @return array<int, string>
 */
function avl_wp_enabled_post_types(): array {
	$options = avl_wp_options();
	$enabled = isset( $options['post_types'] ) && is_array( $options['post_types'] ) ? $options['post_types'] : array();
	$public  = avl_wp_public_post_type_names();

	$result = array_values( array_intersect( $enabled, $public ) );
	return $result ? $result : array( 'post', 'page' );
}

/**
 * @return array<int, string>
 */
function avl_wp_detect_frameworks(): array {
	$detected = array();
	$theme    = wp_get_theme();
	$template = strtolower( (string) $theme->get_template() );
	$name     = strtolower( (string) $theme->get( 'Name' ) );

	if ( false !== strpos( $template . ' ' . $name, 'divi' ) || defined( 'ET_BUILDER_PLUGIN_VERSION' ) || class_exists( 'ET_Builder_Module' ) ) {
		$detected[] = 'Divi';
	}
	if ( did_action( 'elementor/loaded' ) || defined( 'ELEMENTOR_VERSION' ) ) {
		$detected[] = 'Elementor';
	}
	if ( class_exists( 'FLBuilder' ) ) {
		$detected[] = 'Beaver Builder';
	}
	if ( defined( 'FUSION_BUILDER_VERSION' ) || defined( 'AVADA_VERSION' ) ) {
		$detected[] = 'Avada / Fusion Builder';
	}
	if ( defined( 'BRICKS_VERSION' ) || false !== strpos( $template . ' ' . $name, 'bricks' ) ) {
		$detected[] = 'Bricks';
	}
	if ( defined( 'CT_VERSION' ) || class_exists( 'Oxygen_VSB' ) ) {
		$detected[] = 'Oxygen Builder';
	}
	if ( defined( 'WPB_VC_VERSION' ) ) {
		$detected[] = 'WPBakery';
	}
	if ( function_exists( 'wp_is_block_theme' ) && wp_is_block_theme() ) {
		$detected[] = 'Block Theme';
	}

	return array_values( array_unique( $detected ) );
}

/**
 * @return array<string, array<string, string>>
 */
function avl_wp_builder_addons(): array {
	return array(
		'block'     => array(
			'label'    => __( 'Block Editor', 'avl-agent-view-layer' ),
			'plugin'   => 'avl-block-badge/avl-block-badge.php',
			'folder'   => 'page-builders/avl-block-badge',
			'shortcode' => 'avl_block_badge',
		),
		'divi'      => array(
			'label'    => __( 'Divi', 'avl-agent-view-layer' ),
			'plugin'   => 'avl-divi-badge/avl-divi-badge.php',
			'folder'   => 'page-builders/avl-divi-badge',
			'shortcode' => 'avl_divi_badge',
		),
		'elementor' => array(
			'label'    => __( 'Elementor', 'avl-agent-view-layer' ),
			'plugin'   => 'avl-elementor-badge/avl-elementor-badge.php',
			'folder'   => 'page-builders/avl-elementor-badge',
			'shortcode' => 'avl_elementor_badge',
		),
		'beaver'    => array(
			'label'    => __( 'Beaver Builder', 'avl-agent-view-layer' ),
			'plugin'   => 'avl-beaver-badge/avl-beaver-badge.php',
			'folder'   => 'page-builders/avl-beaver-badge',
			'shortcode' => 'avl_beaver_badge',
		),
		'bricks'    => array(
			'label'    => __( 'Bricks', 'avl-agent-view-layer' ),
			'plugin'   => 'avl-bricks-badge/avl-bricks-badge.php',
			'folder'   => 'page-builders/avl-bricks-badge',
			'shortcode' => 'avl_bricks_badge',
		),
		'wpbakery'  => array(
			'label'    => __( 'Bakery visual builder', 'avl-agent-view-layer' ),
			'plugin'   => 'avl-bakery-badge/avl-bakery-badge.php',
			'folder'   => 'page-builders/avl-bakery-badge',
			'shortcode' => 'avl_bakery_badge',
		),
		'avada'     => array(
			'label'    => __( 'Avada / Fusion Builder', 'avl-agent-view-layer' ),
			'plugin'   => 'avl-avada-badge/avl-avada-badge.php',
			'folder'   => 'page-builders/avl-avada-badge',
			'shortcode' => 'avl_avada_badge',
		),
		'oxygen'    => array(
			'label'    => __( 'Oxygen / Breakdance', 'avl-agent-view-layer' ),
			'plugin'   => 'avl-oxygen-badge/avl-oxygen-badge.php',
			'folder'   => 'page-builders/avl-oxygen-badge',
			'shortcode' => 'avl_oxygen_badge',
		),
	);
}

/**
 * @return array<int, string>
 */
function avl_wp_detected_framework_keys(): array {
	$options = avl_wp_options();
	$mode    = (string) ( $options['framework_mode'] ?? 'auto' );
	if ( 'auto' !== $mode && array_key_exists( $mode, avl_wp_builder_addons() ) ) {
		return array( $mode );
	}

	$labels = array_map( 'strtolower', avl_wp_detect_frameworks() );
	$keys   = array();
	foreach ( avl_wp_builder_addons() as $key => $addon ) {
		foreach ( $labels as $label ) {
			if ( false !== strpos( $label, $key ) || false !== strpos( $label, strtolower( $addon['label'] ) ) ) {
				$keys[] = $key;
			}
		}
	}

	if ( in_array( 'block theme', $labels, true ) ) {
		$keys[] = 'block';
	}

	return array_values( array_unique( $keys ) );
}

function avl_wp_is_plugin_active( string $plugin ): bool {
	if ( ! function_exists( 'is_plugin_active' ) ) {
		require_once ABSPATH . 'wp-admin/includes/plugin.php';
	}

	return function_exists( 'is_plugin_active' ) && is_plugin_active( $plugin );
}

/**
 * @return array<string, array<string, string>>
 */
function avl_wp_missing_recommended_addons(): array {
	$missing = array();
	$addons  = avl_wp_builder_addons();
	foreach ( avl_wp_detected_framework_keys() as $key ) {
		if ( ! isset( $addons[ $key ] ) ) {
			continue;
		}
		if ( ! avl_wp_is_plugin_active( $addons[ $key ]['plugin'] ) ) {
			$missing[ $key ] = $addons[ $key ];
		}
	}

	return $missing;
}

function avl_wp_render_builder_recommendations(): void {
	$addons = avl_wp_missing_recommended_addons();
	if ( ! $addons ) {
		echo '<p class="description">' . esc_html__( 'No missing AVL builder add-ons detected.', 'avl-agent-view-layer' ) . '</p>';
		return;
	}

	echo '<div class="notice notice-info inline" style="margin:12px 0 0;padding:10px 12px;">';
	echo '<p><strong>' . esc_html__( 'Recommended AVL builder add-ons', 'avl-agent-view-layer' ) . '</strong></p>';
	echo '<ul style="list-style:disc;margin-left:20px;">';
	foreach ( $addons as $addon ) {
		echo '<li>';
		echo esc_html( $addon['label'] ) . ': ';
		echo esc_html(
			sprintf(
				/* translators: 1: Plugin folder path. */
				__( 'install or activate %1$s for native builder controls. The core [avl_badge] shortcode still works without it.', 'avl-agent-view-layer' ),
				$addon['folder']
			)
		);
		echo '</li>';
	}
	echo '</ul>';
	echo '</div>';
}

function avl_wp_builder_recommendation_notice(): void {
	if ( ! current_user_can( 'activate_plugins' ) ) {
		return;
	}

	$screen = function_exists( 'get_current_screen' ) ? get_current_screen() : null;
	if ( $screen && 'settings_page_avl-agent-view-layer' === $screen->id ) {
		return;
	}

	$addons = avl_wp_missing_recommended_addons();
	if ( ! $addons ) {
		return;
	}

	$labels = wp_list_pluck( $addons, 'label' );
	echo '<div class="notice notice-info"><p>';
	echo esc_html(
		sprintf(
			/* translators: 1: Builder names. */
			__( 'AVL detected %1$s. Install the matching AVL builder add-on for native controls, or continue using the [avl_badge] shortcode.', 'avl-agent-view-layer' ),
			implode( ', ', $labels )
		)
	);
	echo ' <a href="' . esc_url( admin_url( 'options-general.php?page=avl-agent-view-layer' ) ) . '">' . esc_html__( 'View recommendations', 'avl-agent-view-layer' ) . '</a>';
	echo '</p></div>';
}

/**
 * @param array<string, mixed> $options Options.
 */
function avl_wp_effective_framework_mode( array $options ): string {
	$mode = (string) ( $options['framework_mode'] ?? 'auto' );
	if ( 'auto' !== $mode ) {
		return $mode;
	}

	$detected = array_map( 'strtolower', avl_wp_detect_frameworks() );
	foreach ( array( 'divi', 'elementor', 'beaver', 'avada', 'bricks', 'oxygen', 'wpbakery' ) as $candidate ) {
		foreach ( $detected as $label ) {
			if ( false !== strpos( $label, $candidate ) ) {
				return $candidate;
			}
		}
	}

	if ( in_array( 'block theme', $detected, true ) ) {
		return 'block';
	}

	return 'standard';
}

/**
 * @param mixed                $value Choice.
 * @param array<string,string> $choices Allowed choices.
 */
function avl_wp_sanitize_choice( $value, array $choices, string $fallback ): string {
	$value = sanitize_key( (string) $value );
	return array_key_exists( $value, $choices ) ? $value : $fallback;
}

/**
 * @param mixed $value Color.
 */
function avl_wp_sanitize_hex_color( $value, string $fallback ): string {
	$color = sanitize_hex_color( (string) $value );
	return $color ? $color : $fallback;
}

function avl_wp_ends_with( string $value, string $suffix ): bool {
	if ( '' === $suffix ) {
		return true;
	}

	return substr( $value, -strlen( $suffix ) ) === $suffix;
}

/**
 * PHP 8.1 has array_is_list(); keep the plugin usable on older WordPress hosts.
 *
 * @param array<mixed> $value Candidate array.
 */
function avl_wp_array_is_list( array $value ): bool {
	$index = 0;
	foreach ( array_keys( $value ) as $key ) {
		if ( $key !== $index ) {
			return false;
		}
		++$index;
	}

	return true;
}
