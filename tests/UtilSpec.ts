/*global Autolinker, _, describe, beforeEach, afterEach, it, expect */
describe( "Autolinker.Util", function() {
	var Util = Autolinker.Util;

	describe( 'defaults()', function() {

		it( 'should not overwrite any properties that exist on the destination object', function() {
			var obj = Util.defaults( { a: 1, b: 2, c: 3 }, { a: 91, b: 92, c: 93 } );

			expect( obj ).toEqual( { a: 1, b: 2, c: 3 } );
		} );


		it( 'should add properties that do not exist on the destination object, without overwriting properties that do exist', function() {
			var obj = Util.defaults( { b: 2 }, { a: 91, b: 92, c: 93 } );

			expect( obj ).toEqual( { a: 91, b: 2, c: 93 } );
		} );

	} );


	describe( 'splitAndCapture()', function() {

		it( "should return an array with the 'split' characters included", function() {
			var result = Util.splitAndCapture( 'a,b,c', /,/g );

			expect( result ).toEqual( [ 'a', ',', 'b', ',', 'c' ] );
		} );


		it( "should return an array with the 'split' characters included, when there are multiple sequences of characters to split on", function() {
			var re = /(&nbsp;|&#160;|&lt;|&#60;|&gt;|&#62;)/g,
			    result = Util.splitAndCapture( 'Joe went to yahoo.com and used HTML&nbsp;entities like &gt; and &lt; today', re );

			expect( result ).toEqual( [ 'Joe went to yahoo.com and used HTML', '&nbsp;', 'entities like ', '&gt;', ' and ', '&lt;', ' today' ] );
		} );

	} );

} );