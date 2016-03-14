/*global Autolinker, _, describe, beforeEach, afterEach, it, expect, jasmine */
describe( "Autolinker.matcher.Twitter", function() {
	var MatchChecker = Autolinker.match.MatchChecker,
	    matcher;

	beforeEach( function() {
		matcher = new Autolinker.matcher.Twitter( {
			tagBuilder : new Autolinker.AnchorTagBuilder()
		} );
	} );


	describe( 'parseMatches()', function() {

		it( 'should return an empty array if there are no matches for usernames', function() {
			expect( matcher.parseMatches( '' ) ).toEqual( [] );
			expect( matcher.parseMatches( 'asdf' ) ).toEqual( [] );
			expect( matcher.parseMatches( 'asdf@asdf.com' ) ).toEqual( [] );  // an email address is not a username
			expect( matcher.parseMatches( 'stuff@asdf' ) ).toEqual( [] );     // using an '@' symbol as part of a word is not a username
		} );


		it( 'should return an array of a single username match when the string is the username itself', function() {
			var matches = matcher.parseMatches( '@asdf' );

			expect( matches.length ).toBe( 1 );
			MatchChecker.expectTwitterMatch( matches[ 0 ], 'asdf', 0 );
		} );


		it( 'should return an array of a single username match when the username is in the middle of the string', function() {
			var matches = matcher.parseMatches( 'Hello @asdf my good friend' );

			expect( matches.length ).toBe( 1 );
			MatchChecker.expectTwitterMatch( matches[ 0 ], 'asdf', 6 );
		} );


		it( 'should return an array of a single username match when the username is at the end of the string', function() {
			var matches = matcher.parseMatches( 'Hello @asdf' );

			expect( matches.length ).toBe( 1 );
			MatchChecker.expectTwitterMatch( matches[ 0 ], 'asdf', 6 );
		} );


		it( 'should return an array of multiple usernames when there are more than one within the string', function() {
			var matches = matcher.parseMatches( 'Talk to @asdf or @fdsa' );

			expect( matches.length ).toBe( 2 );
			MatchChecker.expectTwitterMatch( matches[ 0 ], 'asdf', 8 );
			MatchChecker.expectTwitterMatch( matches[ 1 ], 'fdsa', 17 );
		} );


		it( 'a match within parenthesis should be parsed correctly', function() {
			var matches = matcher.parseMatches( 'Hello (@asdf)' );

			expect( matches.length ).toBe( 1 );
			MatchChecker.expectTwitterMatch( matches[ 0 ], 'asdf', 7 );
		} );

	} );

} );