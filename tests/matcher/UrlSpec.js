/*global Autolinker, _, describe, beforeEach, afterEach, it, expect, jasmine */
describe( "Autolinker.matcher.Url", function() {
	var MatchChecker = Autolinker.match.MatchChecker,
	    matcher;

	beforeEach( function() {
		matcher = new Autolinker.matcher.Url( {
			tagBuilder  : new Autolinker.AnchorTagBuilder(),
			stripPrefix : false
		} );
	} );


	describe( 'parseMatches()', function() {

		it( 'should return an empty array if there are no matches for urls', function() {
			expect( matcher.parseMatches( '' ) ).toEqual( [] );
			expect( matcher.parseMatches( 'asdf' ) ).toEqual( [] );
			expect( matcher.parseMatches( '@asdf.com' ) ).toEqual( [] );      // a username should not match
			expect( matcher.parseMatches( 'asdf@asdf.com' ) ).toEqual( [] );  // an email address should not match
		} );


		it( 'should return an array of a single url match when the string is the url itself', function() {
			var matches = matcher.parseMatches( 'asdf.com' );

			expect( matches.length ).toBe( 1 );
			MatchChecker.expectUrlMatch( matches[ 0 ], 'http://asdf.com', 0 );
		} );


		it( 'should return an array of a single url match when the url is in the middle of the string', function() {
			var matches = matcher.parseMatches( 'Hello asdf.com my good friend' );

			expect( matches.length ).toBe( 1 );
			MatchChecker.expectUrlMatch( matches[ 0 ], 'http://asdf.com', 6 );
		} );


		it( 'should return an array of a single url match when the url is at the end of the string', function() {
			var matches = matcher.parseMatches( 'Hello asdf.com' );

			expect( matches.length ).toBe( 1 );
			MatchChecker.expectUrlMatch( matches[ 0 ], 'http://asdf.com', 6 );
		} );


		it( 'should return an array of multiple urls when there are more than one within the string', function() {
			var matches = matcher.parseMatches( 'Go to asdf.com or fdsa.com' );

			expect( matches.length ).toBe( 2 );
			MatchChecker.expectUrlMatch( matches[ 0 ], 'http://asdf.com', 6 );
			MatchChecker.expectUrlMatch( matches[ 1 ], 'http://fdsa.com', 18 );
		} );


		it( 'a match within parenthesis should be parsed correctly', function() {
			var matches = matcher.parseMatches( 'Hello (asdf.com)' );

			expect( matches.length ).toBe( 1 );
			MatchChecker.expectUrlMatch( matches[ 0 ], 'http://asdf.com', 7 );
		} );


		describe( 'protocol-relative URLs', function() {

			it( 'should match a protocol-relative URL at the beginning of the string', function() {
				var matches = matcher.parseMatches( '//asdf.com' );

				expect( matches.length ).toBe( 1 );
				MatchChecker.expectUrlMatch( matches[ 0 ], '//asdf.com', 0 );
			} );


			it( 'should match a protocol-relative URL in the middle of the string', function() {
				var matches = matcher.parseMatches( 'Hello //asdf.com today' );

				expect( matches.length ).toBe( 1 );
				MatchChecker.expectUrlMatch( matches[ 0 ], '//asdf.com', 6 );
			} );


			it( 'should match a protocol-relative URL at the end of the string', function() {
				var matches = matcher.parseMatches( 'Hello //asdf.com' );

				expect( matches.length ).toBe( 1 );
				MatchChecker.expectUrlMatch( matches[ 0 ], '//asdf.com', 6 );
			} );


			it( 'should *not* match a protocol-relative URL if the "//" was in the middle of a word', function() {
				var matches = matcher.parseMatches( 'asdf//asdf.com' );

				expect( matches.length ).toBe( 0 );
			} );

		} );

	} );

} );