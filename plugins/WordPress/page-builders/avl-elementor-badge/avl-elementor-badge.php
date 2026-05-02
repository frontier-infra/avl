<?php
/**
 * Plugin Name: AVL Badge for Elementor
 * Description: Adds an AVL badge widget for Elementor layouts. Requires AVL Agent View Layer.
 * Version: 0.1.0
 * Requires PHP: 7.4
 * Author: Frontier Infra
 * License: GPL-2.0-or-later
 * Text Domain: avl-elementor-badge
 *
 * @package AVLElementorBadge
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_shortcode( 'avl_elementor_badge', 'avl_elementor_badge_shortcode' );
add_action( 'elementor/widgets/register', 'avl_elementor_register_widget' );
add_action( 'admin_notices', 'avl_elementor_dependency_notice' );

/**
 * @param array<string, mixed> $atts Shortcode attributes.
 */
function avl_elementor_badge_shortcode( $atts = array() ): string {
	if ( ! function_exists( 'avl_wp_badge_shortcode' ) ) {
		return '';
	}

	return avl_wp_badge_shortcode( $atts );
}

function avl_elementor_dependency_notice(): void {
	if ( ! current_user_can( 'activate_plugins' ) || function_exists( 'avl_wp_badge_shortcode' ) ) {
		return;
	}

	echo '<div class="notice notice-warning"><p>' . esc_html__( 'AVL Badge for Elementor requires the AVL Agent View Layer plugin.', 'avl-elementor-badge' ) . '</p></div>';
}

function avl_elementor_register_widget( $widgets_manager ): void {
	if ( ! class_exists( '\Elementor\Widget_Base' ) || ! function_exists( 'avl_wp_badge_shortcode' ) ) {
		return;
	}

	class AVL_Elementor_Badge_Widget extends \Elementor\Widget_Base {
		public function get_name() {
			return 'avl_badge';
		}

		public function get_title() {
			return esc_html__( 'AVL Badge', 'avl-elementor-badge' );
		}

		public function get_icon() {
			return 'eicon-code';
		}

		/**
		 * @return array<int, string>
		 */
		public function get_categories() {
			return array( 'general' );
		}

		protected function register_controls() {
			$this->start_controls_section(
				'avl_section',
				array(
					'label' => esc_html__( 'AVL Badge', 'avl-elementor-badge' ),
					'tab'   => \Elementor\Controls_Manager::TAB_CONTENT,
				)
			);

			$this->add_control(
				'type',
				array(
					'label'   => esc_html__( 'Badge Type', 'avl-elementor-badge' ),
					'type'    => \Elementor\Controls_Manager::SELECT,
					'default' => '',
					'options' => array(
						''        => esc_html__( 'Use AVL setting', 'avl-elementor-badge' ),
						'pill'    => esc_html__( 'Pill', 'avl-elementor-badge' ),
						'compact' => esc_html__( 'Compact', 'avl-elementor-badge' ),
						'card'    => esc_html__( 'Card', 'avl-elementor-badge' ),
						'svg'     => esc_html__( 'Official SVG', 'avl-elementor-badge' ),
						'text'    => esc_html__( 'Text', 'avl-elementor-badge' ),
					),
				)
			);

			$this->end_controls_section();
		}

		protected function render() {
			$settings = $this->get_settings_for_display();
			echo avl_wp_badge_shortcode( // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Core AVL renderer escapes badge HTML.
				array(
					'type'     => $settings['type'] ?? '',
					'position' => 'inline',
				)
			);
		}
	}

	$widgets_manager->register( new AVL_Elementor_Badge_Widget() );
}
