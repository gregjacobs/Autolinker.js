/*global Autolinker, _, describe, beforeEach, afterEach, it, expect, jasmine */
describe( "Autolinker.matcher.Hashtag", function() {
	var MatchChecker = Autolinker.match.MatchChecker,
	    matcher;

	beforeEach( function() {
		matcher = new Autolinker.matcher.Hashtag( { serviceName: 'twitter' } );
	} );


	describe( 'processCandidateMatch()', function() {

		it( "given a match at the beginning of the input string, should return the correct ReplacementDescriptor", function() {
			var replacementDescriptor = matcher.processCandidateMatch( '#abc', [ '', 'abc' ], 0 );

			MatchChecker.expectHashtagMatch( replacementDescriptor.match, 'twitter', 'abc', 0 );
			expect( replacementDescriptor.prefixStr ).toBe( '' );
			expect( replacementDescriptor.suffixStr ).toBe( '' );
		} );


		it( "given a match in the middle of the input string, should return the correct ReplacementDescriptor", function() {
			var replacementDescriptor = matcher.processCandidateMatch( ' #abc', [ ' ', 'abc' ], 1 );

			MatchChecker.expectHashtagMatch( replacementDescriptor.match, 'twitter', 'abc', 2 );  // the Match object should have the offset corrected to 2, since the '#' sign is one more than the match position which matched the space before it
			expect( replacementDescriptor.prefixStr ).toBe( ' ' );
			expect( replacementDescriptor.suffixStr ).toBe( '' );
		} );

	} );


} );