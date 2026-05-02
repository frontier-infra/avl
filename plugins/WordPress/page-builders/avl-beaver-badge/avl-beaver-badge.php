<?php
/**
 * Plugin Name: AVL Badge for Beaver Builder
 * Description: Adds an AVL badge module for Beaver Builder layouts. Requires AVL Agent View Layer.
 * Version: 0.1.0
 * Requires PHP: 7.4
 * Author: Frontier Infra
 * License: GPL-2.0-or-later
 * Text Domain: avl-beaver-badge
 *
 * @package AVLBeaverBadge
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_shortcode( 'avl_beaver_badge', 'avl_beaver_badge_shortcode' );
add_action( 'init', 'avl_beaver_register_module' );
add_action( 'admin_notices', 'avl_beaver_dependency_notice' );

/**
 * @param array<string, mixed> $atts Shortcode attributes.
 */
function avl_beaver_badge_shortcode( $atts = array() ): string {
	if ( ! function_exists( 'avl_wp_badge_shortcode' ) ) {
		return '';
	}

	return avl_wp_badge_shortcode( $atts );
}

function avl_beaver_dependency_notice(): void {
	if ( ! current_user_can( 'activate_plugins' ) || function_exists( 'avl_wp_badge_shortcode' ) ) {
		return;
	}

	echo '<div class="notice notice-warning"><p>' . esc_html__( 'AVL Badge for Beaver Builder requires the AVL Agent View Layer plugin.', 'avl-beaver-badge' ) . '</p></div>';
}

function avl_beaver_register_module(): void {
	if ( ! class_exists( 'FLBuilder' ) || ! class_exists( 'FLBuilderModule' ) || ! function_exists( 'avl_wp_badge_shortcode' ) ) {
		return;
	}

	class AVL_Beaver_Badge_Module extends FLBuilderModule {
		public function __construct() {
			parent::__construct(
				array(
					'name'        => __( 'AVL Badge', 'avl-beaver-badge' ),
					'description' => __( 'Displays the AVL agent-ready badge.', 'avl-beaver-badge' ),
					'category'    => __( 'AVL', 'avl-beaver-badge' ),
				)
			);
		}

		public function render() {
			$type = isset( $this->settings->type ) ? (string) $this->settings->type : '';
			echo avl_wp_badge_shortcode( // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Core AVL renderer escapes badge HTML.
				array(
					'type'     => $type,
					'position' => 'inline',
				)
			);
		}
	}

	FLBuilder::register_module(
		'AVL_Beaver_Badge_Module',
		array(
			'general' => array(
				'title'    => __( 'General', 'avl-beaver-badge' ),
				'sections' => array(
					'general' => array(
						'title'  => '',
						'fields' => array(
							'type' => array(
								'type'    => 'select',
								'label'   => __( 'Badge Type', 'avl-beaver-badge' ),
								'default' => '',
								'options' => array(
									''        => __( 'Use AVL setting', 'avl-beaver-badge' ),
									'pill'    => __( 'Pill', 'avl-beaver-badge' ),
									'compact' => __( 'Compact', 'avl-beaver-badge' ),
									'card'    => __( 'Card', 'avl-beaver-badge' ),
									'svg'     => __( 'Official SVG', 'avl-beaver-badge' ),
									'text'    => __( 'Text', 'avl-beaver-badge' ),
								),
							),
						),
					),
				),
			),
		)
	);
}
