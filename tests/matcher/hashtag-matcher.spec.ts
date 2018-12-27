import { HashtagMatcher } from "../../src/matcher/hashtag-matcher";
import { AnchorTagBuilder } from "../../src/anchor-tag-builder";
import { MatchChecker } from "../match/match-checker";

describe( "Autolinker.matcher.Hashtag", function() {
	let matcher: HashtagMatcher;

	beforeEach( function() {
		matcher = new HashtagMatcher( {
			tagBuilder  : new AnchorTagBuilder(),
			serviceName : 'twitter'
		} );
	} );


	describe( 'parseMatches()', function() {

		it( 'should return an empty array if there are no matches for hashtags', function() {
			expect( matcher.parseMatches( '' ) ).toEqual( [] );
			expect( matcher.parseMatches( 'asdf' ) ).toEqual( [] );
			expect( matcher.parseMatches( 'asdf#asdf.com' ) ).toEqual( [] );
		} );


		it( 'should return an array of a single hashtag match when the string is the hashtag itself', function() {
			let matches = matcher.parseMatches( '#asdf' );

			expect( matches.length ).toBe( 1 );
			MatchChecker.expectHashtagMatch( matches[ 0 ], 'twitter', 'asdf', 0 );
		} );


		it( 'should return an array of a single hashtag match when the hashtag is in the middle of the string', function() {
			let matches = matcher.parseMatches( 'Hello #asdf my good friend' );

			expect( matches.length ).toBe( 1 );
			MatchChecker.expectHashtagMatch( matches[ 0 ], 'twitter', 'asdf', 6 );
		} );


		it( 'should return an array of a single hashtag match when the hashtag is at the end of the string', function() {
			let matches = matcher.parseMatches( 'Hello #asdf' );

			expect( matches.length ).toBe( 1 );
			MatchChecker.expectHashtagMatch( matches[ 0 ], 'twitter', 'asdf', 6 );
		} );


		it( 'should return an array of multiple hashtags when there are more than one within the string', function() {
			let matches = matcher.parseMatches( 'Talk to #asdf or #fdsa' );

			expect( matches.length ).toBe( 2 );
			MatchChecker.expectHashtagMatch( matches[ 0 ], 'twitter', 'asdf', 8 );
			MatchChecker.expectHashtagMatch( matches[ 1 ], 'twitter', 'fdsa', 17 );
		} );


		it( 'a match within parenthesis should be parsed correctly', function() {
			let matches = matcher.parseMatches( 'Hello (#asdf)' );

			expect( matches.length ).toBe( 1 );
			MatchChecker.expectHashtagMatch( matches[ 0 ], 'twitter', 'asdf', 7 );
		} );

	} );

} );