/*global Autolinker, _, describe, beforeEach, afterEach, it, expect, jasmine */
describe( "Autolinker.matcher.Phone", function() {
	var MatchChecker = Autolinker.match.MatchChecker,
	    matcher;

	beforeEach( function() {
		matcher = new Autolinker.matcher.Phone();
	} );


	describe( 'processCandidateMatch()', function() {

		it( "given a match, should return the correct ReplacementDescriptor", function() {
			var replacementDescriptor = matcher.processCandidateMatch( '(123) 456-7890', [], 42 );

			MatchChecker.expectPhoneMatch( replacementDescriptor.match, '1234567890', 42 );
			expect( replacementDescriptor.prefixStr ).toBe( '' );
			expect( replacementDescriptor.suffixStr ).toBe( '' );
		} );

	} );


} );