<?php
/**
 * Plugin Name: AVL Badge for Oxygen and Breakdance
 * Description: Adds an AVL badge shortcode surface for Oxygen and Breakdance layouts. Requires AVL Agent View Layer.
 * Version: 0.1.0
 * Requires PHP: 7.4
 * Author: Frontier Infra
 * License: GPL-2.0-or-later
 * Text Domain: avl-oxygen-badge
 *
 * @package AVLOxygenBadge
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_shortcode( 'avl_oxygen_badge', 'avl_oxygen_badge_shortcode' );
add_action( 'admin_notices', 'avl_oxygen_dependency_notice' );

/**
 * @param array<string, mixed> $atts Shortcode attributes.
 */
function avl_oxygen_badge_shortcode( $atts = array() ): string {
	if ( ! function_exists( 'avl_wp_badge_shortcode' ) ) {
		return '';
	}

	return avl_wp_badge_shortcode( $atts );
}

function avl_oxygen_dependency_notice(): void {
	if ( ! current_user_can( 'activate_plugins' ) || function_exists( 'avl_wp_badge_shortcode' ) ) {
		return;
	}

	echo '<div class="notice notice-warning"><p>' . esc_html__( 'AVL Badge for Oxygen and Breakdance requires the AVL Agent View Layer plugin.', 'avl-oxygen-badge' ) . '</p></div>';
}
