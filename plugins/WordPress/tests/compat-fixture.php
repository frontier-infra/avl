<?php
/** Disposable runtime fixture, installed only by the regression script. */
add_filter( 'avl_agent_view_document', static function ( $document, $post, $path ) {
	if ( '/pricing' === untrailingslashit( $path ) ) {
		$document['state']['pricing'] = require __DIR__ . '/avl-tests/fixtures/pricing.php';
		$document['state']['mixed'] = require __DIR__ . '/avl-tests/fixtures/mixed.php';
	}
	return $document;
}, 10, 3 );
add_action( 'template_redirect', static function () {
	if ( '/pricing/' === avl_wp_current_human_path() ) {
		if ( isset( $_GET['avl_test_wildcard'] ) ) {
			header( 'Vary: *' );
			return;
		}
		header( 'Vary: Accept-Language', false );
		header( 'Vary: accept, Accept-Language', false );
	}
}, -1 );
