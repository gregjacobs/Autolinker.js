/*global Autolinker, _, describe, beforeEach, afterEach, it, expect, jasmine */
describe( "Autolinker.matcher.Email", function() {
	var MatchChecker = Autolinker.match.MatchChecker,
	    matcher;

	beforeEach( function() {
		matcher = new Autolinker.matcher.Email();
	} );


	describe( 'processCandidateMatch()', function() {

		it( "given a match, should return the correct ReplacementDescriptor", function() {
			var replacementDescriptor = matcher.processCandidateMatch( 'asdf@asdf.com', [], 42 );

			MatchChecker.expectEmailMatch( replacementDescriptor.match, 'asdf@asdf.com', 42 );
			expect( replacementDescriptor.prefixStr ).toBe( '' );
			expect( replacementDescriptor.suffixStr ).toBe( '' );
		} );

	} );


} );