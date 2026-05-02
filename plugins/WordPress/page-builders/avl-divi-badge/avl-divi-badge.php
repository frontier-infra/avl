<?php
/**
 * Plugin Name: AVL Badge for Divi
 * Description: Adds an AVL badge module/shortcode surface for Divi layouts. Requires AVL Agent View Layer.
 * Version: 0.1.0
 * Requires PHP: 7.4
 * Author: Frontier Infra
 * License: GPL-2.0-or-later
 * Text Domain: avl-divi-badge
 *
 * @package AVLDiviBadge
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_shortcode( 'avl_divi_badge', 'avl_divi_badge_shortcode' );
add_action( 'et_builder_ready', 'avl_divi_register_module' );
add_action( 'admin_notices', 'avl_divi_dependency_notice' );

/**
 * @param array<string, mixed> $atts Shortcode attributes.
 */
function avl_divi_badge_shortcode( $atts = array() ): string {
	if ( ! function_exists( 'avl_wp_badge_shortcode' ) ) {
		return '';
	}

	return avl_wp_badge_shortcode( $atts );
}

function avl_divi_dependency_notice(): void {
	if ( ! current_user_can( 'activate_plugins' ) || function_exists( 'avl_wp_badge_shortcode' ) ) {
		return;
	}

	echo '<div class="notice notice-warning"><p>' . esc_html__( 'AVL Badge for Divi requires the AVL Agent View Layer plugin.', 'avl-divi-badge' ) . '</p></div>';
}

function avl_divi_register_module(): void {
	if ( ! class_exists( 'ET_Builder_Module' ) || ! function_exists( 'avl_wp_badge_shortcode' ) ) {
		return;
	}

	class AVL_Divi_Badge_Module extends ET_Builder_Module {
		public $slug       = 'avl_divi_badge';
		public $vb_support = 'on';

		public function init() {
			$this->name = esc_html__( 'AVL Badge', 'avl-divi-badge' );
		}

		/**
		 * @return array<string, array<string, mixed>>
		 */
		public function get_fields() {
			return array(
				'type' => array(
					'label'           => esc_html__( 'Badge Type', 'avl-divi-badge' ),
					'type'            => 'select',
					'options'         => array(
						''        => esc_html__( 'Use AVL setting', 'avl-divi-badge' ),
						'pill'    => esc_html__( 'Pill', 'avl-divi-badge' ),
						'compact' => esc_html__( 'Compact', 'avl-divi-badge' ),
						'card'    => esc_html__( 'Card', 'avl-divi-badge' ),
						'svg'     => esc_html__( 'Official SVG', 'avl-divi-badge' ),
						'text'    => esc_html__( 'Text', 'avl-divi-badge' ),
					),
					'option_category' => 'basic_option',
				),
			);
		}

		/**
		 * @param array<string, mixed> $attrs Attributes.
		 * @param string|null          $content Content.
		 * @param string              $render_slug Render slug.
		 */
		public function render( $attrs, $content = null, $render_slug = '' ) {
			$type = isset( $this->props['type'] ) ? (string) $this->props['type'] : '';
			return avl_wp_badge_shortcode(
				array(
					'type'     => $type,
					'position' => 'inline',
				)
			);
		}
	}

	new AVL_Divi_Badge_Module();
}
