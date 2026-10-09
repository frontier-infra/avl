<?php
$pricing = require __DIR__ . '/fixtures/pricing.php';
$expected = array(
	'pricing[4]{size,qty_150_249,qty_250_999}:',
	'  Small,12,10',
	'  "Medium, wide",14,12',
	'  Large: tall,16,14',
	'  "XL \"special\"",18,16',
);
if ( $expected !== avl_wp_encode_named( 'pricing', $pricing ) ) {
	throw new RuntimeException( 'Uniform table or quoting failed' );
}
$mixed = require __DIR__ . '/fixtures/mixed.php';
if ( array( 'mixed:', '  0:', '    size: Small', '    price: 12', '  1:', '    size: Large', '    prices[2]: 16, 14' ) !== avl_wp_encode_named( 'mixed', $mixed ) ) {
	throw new RuntimeException( 'Mixed rows changed encoding' );
}
$rows = array( array( 'a' => true, 'b' => null ), array( 'b' => false, 'a' => 'true' ) );
if ( array( 'rows[2]{a,b}:', '  true,~', '  "true",false' ) !== avl_wp_encode_named( 'rows', $rows ) ) {
	throw new RuntimeException( 'Key ordering or scalar types failed' );
}
if ( array( 'rows:', '  0[2]: a, b' ) !== avl_wp_encode_named( 'rows', array( array( 'a', 'b' ) ) ) ) {
	throw new RuntimeException( 'Numeric row keys must keep nested encoding' );
}
if ( array( 'rows[1]{a,b}:', '  "",~' ) !== avl_wp_encode_named( 'rows', array( array( 'a' => '', 'b' => null ) ) ) ) {
	throw new RuntimeException( 'Empty string cell failed' );
}
if ( 'rows:' !== avl_wp_encode_named( 'rows', array( array( 'a' => 1 ), array( 'b' => 2 ) ) )[0] ) {
	throw new RuntimeException( 'Different keys must keep nested encoding' );
}
echo "WordPress serializer regression tests passed\n";
