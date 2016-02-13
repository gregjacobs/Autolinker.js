/*global Autolinker, _, describe, beforeEach, afterEach, it, expect, jasmine */
describe( "Autolinker.match.Match", function() {
	var Match = Autolinker.match.Match;

	describe( 'constructor', function() {

		it( "should require the `matchedText` arg", function() {
			expect( function() {
				new Match();  // note: no `matchedText` cfg
			} ).toThrowError( '`matchedText` arg required' );
		} );


		it( "should require the `offset` arg", function() {
			expect( function() {
				new Match( 'abc' );  // note: no `offset` arg
			} ).toThrowError( '`offset` arg required' );
		} );

	} );


	describe( 'getMatchedText()', function() {

		it( "should return the configured `matchedText` if it was an empty string", function() {
			var match = new Match( '', 0 );

			expect( match.getMatchedText() ).toBe( '' );
		} );


		it( "should return the configured `matchedText` if it was a string other than an empty string", function() {
			var match = new Match( 'abc', 2 );

			expect( match.getMatchedText() ).toBe( 'abc' );
		} );

	} );


	describe( 'getOffset()', function() {

		it( "should return the configured `offset` if it was 0", function() {
			var match = new Match( 'abc', 0 );

			expect( match.getOffset() ).toBe( 0 );
		} );


		it( "should return the configured `offset` if it was a number other than 0", function() {
			var match = new Match( 'abc', 2 );

			expect( match.getOffset() ).toBe( 2 );
		} );

	} );

} );