<?php
/**
 * Plugin Name: AVL Badge for Bakery Builder
 * Description: Adds an AVL badge shortcode element for Bakery-style visual builder layouts. Requires AVL Agent View Layer.
 * Version: 0.1.0
 * Requires PHP: 7.4
 * Author: Frontier Infra
 * License: GPL-2.0-or-later
 * Text Domain: avl-bakery-badge
 *
 * @package AVLBakeryBadge
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_shortcode( 'avl_bakery_badge', 'avl_bakery_badge_shortcode' );
add_action( 'vc_before_init', 'avl_bakery_register_element' );
add_action( 'admin_notices', 'avl_bakery_dependency_notice' );

/**
 * @param array<string, mixed> $atts Shortcode attributes.
 */
function avl_bakery_badge_shortcode( $atts = array() ): string {
	if ( ! function_exists( 'avl_wp_badge_shortcode' ) ) {
		return '';
	}

	return avl_wp_badge_shortcode( $atts );
}

function avl_bakery_dependency_notice(): void {
	if ( ! current_user_can( 'activate_plugins' ) || function_exists( 'avl_wp_badge_shortcode' ) ) {
		return;
	}

	echo '<div class="notice notice-warning"><p>' . esc_html__( 'AVL Badge for Bakery Builder requires the AVL Agent View Layer plugin.', 'avl-bakery-badge' ) . '</p></div>';
}

function avl_bakery_register_element(): void {
	if ( ! function_exists( 'vc_map' ) || ! function_exists( 'avl_wp_badge_shortcode' ) ) {
		return;
	}

	vc_map(
		array(
			'name'     => __( 'AVL Badge', 'avl-bakery-badge' ),
			'base'     => 'avl_bakery_badge',
			'category' => __( 'AVL', 'avl-bakery-badge' ),
			'params'   => array(
				array(
					'type'       => 'dropdown',
					'heading'    => __( 'Badge Type', 'avl-bakery-badge' ),
					'param_name' => 'type',
					'value'      => array(
						__( 'Use AVL setting', 'avl-bakery-badge' ) => '',
						__( 'Pill', 'avl-bakery-badge' ) => 'pill',
						__( 'Compact', 'avl-bakery-badge' ) => 'compact',
						__( 'Card', 'avl-bakery-badge' ) => 'card',
						__( 'Official SVG', 'avl-bakery-badge' ) => 'svg',
						__( 'Text', 'avl-bakery-badge' ) => 'text',
					),
				),
			),
		)
	);
}
