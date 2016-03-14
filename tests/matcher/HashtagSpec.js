/*global Autolinker, _, describe, beforeEach, afterEach, it, expect, jasmine */
describe( "Autolinker.matcher.Hashtag", function() {
	var MatchChecker = Autolinker.match.MatchChecker,
	    matcher;

	beforeEach( function() {
		matcher = new Autolinker.matcher.Hashtag( {
			tagBuilder  : new Autolinker.AnchorTagBuilder(),
			serviceName : 'Twitter'
		} );
	} );


	describe( 'parseMatches()', function() {

		it( 'should return an empty array if there are no matches for hashtags', function() {
			expect( matcher.parseMatches( '' ) ).toEqual( [] );
			expect( matcher.parseMatches( 'asdf' ) ).toEqual( [] );
			expect( matcher.parseMatches( 'asdf#asdf.com' ) ).toEqual( [] );
		} );


		it( 'should return an array of a single hashtag match when the string is the hashtag itself', function() {
			var matches = matcher.parseMatches( '#asdf' );

			expect( matches.length ).toBe( 1 );
			MatchChecker.expectHashtagMatch( matches[ 0 ], 'Twitter', 'asdf', 0 );
		} );


		it( 'should return an array of a single hashtag match when the hashtag is in the middle of the string', function() {
			var matches = matcher.parseMatches( 'Hello #asdf my good friend' );

			expect( matches.length ).toBe( 1 );
			MatchChecker.expectHashtagMatch( matches[ 0 ], 'Twitter', 'asdf', 6 );
		} );


		it( 'should return an array of a single hashtag match when the hashtag is at the end of the string', function() {
			var matches = matcher.parseMatches( 'Hello #asdf' );

			expect( matches.length ).toBe( 1 );
			MatchChecker.expectHashtagMatch( matches[ 0 ], 'Twitter', 'asdf', 6 );
		} );


		it( 'should return an array of multiple hashtags when there are more than one within the string', function() {
			var matches = matcher.parseMatches( 'Talk to #asdf or #fdsa' );

			expect( matches.length ).toBe( 2 );
			MatchChecker.expectHashtagMatch( matches[ 0 ], 'Twitter', 'asdf', 8 );
			MatchChecker.expectHashtagMatch( matches[ 1 ], 'Twitter', 'fdsa', 17 );
		} );


		it( 'a match within parenthesis should be parsed correctly', function() {
			var matches = matcher.parseMatches( 'Hello (#asdf)' );

			expect( matches.length ).toBe( 1 );
			MatchChecker.expectHashtagMatch( matches[ 0 ], 'Twitter', 'asdf', 7 );
		} );

	} );

} );