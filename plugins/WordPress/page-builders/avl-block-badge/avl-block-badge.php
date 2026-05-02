<?php
/**
 * Plugin Name: AVL Badge for Block Editor
 * Description: Adds an AVL badge block and shortcode surface for the WordPress block editor. Requires AVL Agent View Layer.
 * Version: 0.1.0
 * Requires PHP: 7.4
 * Author: Frontier Infra
 * License: GPL-2.0-or-later
 * Text Domain: avl-block-badge
 *
 * @package AVLBlockBadge
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_shortcode( 'avl_block_badge', 'avl_block_badge_shortcode' );
add_action( 'init', 'avl_block_register_block' );
add_action( 'admin_notices', 'avl_block_dependency_notice' );

/**
 * @param array<string, mixed> $atts Shortcode attributes.
 */
function avl_block_badge_shortcode( $atts = array() ): string {
	if ( ! function_exists( 'avl_wp_badge_shortcode' ) ) {
		return '';
	}

	return avl_wp_badge_shortcode( $atts );
}

function avl_block_dependency_notice(): void {
	if ( ! current_user_can( 'activate_plugins' ) || function_exists( 'avl_wp_badge_shortcode' ) ) {
		return;
	}

	echo '<div class="notice notice-warning"><p>' . esc_html__( 'AVL Badge for Block Editor requires the AVL Agent View Layer plugin.', 'avl-block-badge' ) . '</p></div>';
}

function avl_block_register_block(): void {
	if ( ! function_exists( 'register_block_type' ) || ! function_exists( 'avl_wp_badge_shortcode' ) ) {
		return;
	}

	register_block_type(
		'avl/badge',
		array(
			'api_version'     => 2,
			'title'           => __( 'AVL Badge', 'avl-block-badge' ),
			'category'        => 'widgets',
			'icon'            => 'visibility',
			'description'     => __( 'Displays the AVL agent-ready badge.', 'avl-block-badge' ),
			'attributes'      => array(
				'type' => array(
					'type'    => 'string',
					'default' => '',
				),
			),
			'render_callback' => 'avl_block_render_block',
		)
	);
}

/**
 * @param array<string, mixed> $attributes Block attributes.
 */
function avl_block_render_block( array $attributes ): string {
	return avl_block_badge_shortcode(
		array(
			'type'     => $attributes['type'] ?? '',
			'position' => 'inline',
		)
	);
}
