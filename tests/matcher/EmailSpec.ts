/*global Autolinker, _, describe, beforeEach, afterEach, it, expect, jasmine */
describe( "Autolinker.matcher.Email", function() {
	var MatchChecker = Autolinker.match.MatchChecker,
	    matcher;

	beforeEach( function() {
		matcher = new Autolinker.matcher.Email( {
			tagBuilder : new Autolinker.AnchorTagBuilder()
		} );
	} );


	describe( 'parseMatches()', function() {

		it( 'should return an empty array if there are no matches for email addresses', function() {
			expect( matcher.parseMatches( '' ) ).toEqual( [] );
			expect( matcher.parseMatches( 'asdf' ) ).toEqual( [] );
			expect( matcher.parseMatches( '@asdf' ) ).toEqual( [] );
			expect( matcher.parseMatches( 'Hello @asdf.com' ) ).toEqual( [] );  // not a valid email address
		} );


		it( 'should return an array of a single email address match when the string is the email address itself', function() {
			var matches = matcher.parseMatches( 'asdf@asdf.com' );

			expect( matches.length ).toBe( 1 );
			MatchChecker.expectEmailMatch( matches[ 0 ], 'asdf@asdf.com', 0 );
		} );


		it( 'should return an array of a single email address match when the email address is in the middle of the string', function() {
			var matches = matcher.parseMatches( 'Hello asdf@asdf.com my good friend' );

			expect( matches.length ).toBe( 1 );
			MatchChecker.expectEmailMatch( matches[ 0 ], 'asdf@asdf.com', 6 );
		} );


		it( 'should return an array of a single email address match when the email address is at the end of the string', function() {
			var matches = matcher.parseMatches( 'Hello asdf@asdf.com' );

			expect( matches.length ).toBe( 1 );
			MatchChecker.expectEmailMatch( matches[ 0 ], 'asdf@asdf.com', 6 );
		} );


		it( 'should return an array of multiple email addresses when there are more than one within the string', function() {
			var matches = matcher.parseMatches( 'Talk to asdf@asdf.com or fdsa@fdsa.com' );

			expect( matches.length ).toBe( 2 );
			MatchChecker.expectEmailMatch( matches[ 0 ], 'asdf@asdf.com', 8 );
			MatchChecker.expectEmailMatch( matches[ 1 ], 'fdsa@fdsa.com', 25 );
		} );


		it( 'a match within parenthesis should be parsed correctly', function() {
			var matches = matcher.parseMatches( 'Hello (asdf@asdf.com)' );

			expect( matches.length ).toBe( 1 );
			MatchChecker.expectEmailMatch( matches[ 0 ], 'asdf@asdf.com', 7 );
		} );


		it( 'a match with underscores should be parsed correctly', function() {
			var matches = matcher.parseMatches( 'Hello asdf_fdsa_asdf@asdf.com' );

			expect( matches.length ).toBe( 1 );
			MatchChecker.expectEmailMatch( matches[ 0 ], 'asdf_fdsa_asdf@asdf.com', 6 );
		} );


		it( 'a match with an \' should be parsed correctly', function() {
			var matches = matcher.parseMatches( 'o\'donnel@asdf.com' );

			expect( matches.length ).toBe( 1 );
			MatchChecker.expectEmailMatch( matches[ 0 ], 'o\'donnel@asdf.com', 0 );
		} );

		it( 'should *not* match email with incorrect domain beginning with "-"', function() {
			var matches = matcher.parseMatches( 'asdf@-asdf.com' );

			expect( matches.length ).toBe( 0 );
		} );

		it( 'should *not* match email with incorrect domain ending with "-"', function() {
			var matches = matcher.parseMatches( 'asdf@asdf-.com' );

			expect( matches.length ).toBe( 0 );
		} );

		it( 'should *not* match email with incorrect domain beginning with "."', function() {
			var matches = matcher.parseMatches( 'asdf@.asdf.com' );

			expect( matches.length ).toBe( 0 );
		} );

		it( 'should *not* match email with incorrect local part beginning with "."', function() {
			var matches = matcher.parseMatches( '.asdf@asdf.com' );

			expect( matches.length ).toBe( 1 );
			MatchChecker.expectEmailMatch( matches[ 0 ], 'asdf@asdf.com', 1 );
		} );

		it( 'should *not* match email with incorrect local part ending with "."', function() {
			var matches = matcher.parseMatches( 'asdf.@asdf.com' );

			expect( matches.length ).toBe( 0 );
		} );

		it( 'should match email skipping incorrect local part tailing with ".."', function() {
			var matches = matcher.parseMatches( 'asdf..asdf@asdf.com' );

			expect( matches.length ).toBe( 1 );
			MatchChecker.expectEmailMatch( matches[ 0 ], 'asdf@asdf.com', 6 );
		} );

	} );


} );
