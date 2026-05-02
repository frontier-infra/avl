<?php
/**
 * Uninstall cleanup for AVL Agent View Layer.
 *
 * @package AVLAgentViewLayer
 */

if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

delete_option( 'avl_agent_view_layer_options' );
