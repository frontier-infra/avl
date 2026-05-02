<?php
/**
 * Plugin Name: AVL Badge for Avada
 * Description: Adds an AVL badge shortcode surface for Avada/Fusion Builder layouts. Requires AVL Agent View Layer.
 * Version: 0.1.0
 * Requires PHP: 7.4
 * Author: Frontier Infra
 * License: GPL-2.0-or-later
 * Text Domain: avl-avada-badge
 *
 * @package AVLAvadaBadge
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_shortcode( 'avl_avada_badge', 'avl_avada_badge_shortcode' );
add_action( 'admin_notices', 'avl_avada_dependency_notice' );

/**
 * @param array<string, mixed> $atts Shortcode attributes.
 */
function avl_avada_badge_shortcode( $atts = array() ): string {
	if ( ! function_exists( 'avl_wp_badge_shortcode' ) ) {
		return '';
	}

	return avl_wp_badge_shortcode( $atts );
}

function avl_avada_dependency_notice(): void {
	if ( ! current_user_can( 'activate_plugins' ) || function_exists( 'avl_wp_badge_shortcode' ) ) {
		return;
	}

	echo '<div class="notice notice-warning"><p>' . esc_html__( 'AVL Badge for Avada requires the AVL Agent View Layer plugin.', 'avl-avada-badge' ) . '</p></div>';
}
