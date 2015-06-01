/*global Autolinker, _, describe, beforeEach, afterEach, it, expect, jasmine */
describe( "Autolinker.matcher.Url", function() {
	var MatchChecker = Autolinker.match.MatchChecker,
	    matcher;

	beforeEach( function() {
		matcher = new Autolinker.matcher.Url();
	} );


	describe( 'processCandidateMatch()', function() {

		/*  TODO:
		describe( 'protocol-relative matches should return the correct ReplacementDescriptor', function() {

			it( "given a protocol-relative match at the beginning of the input string", function() {
				var replacementDescriptor = matcher.processCandidateMatch( '//somewhere.com', [ '', 'abc' ], 0 );

				MatchChecker.expectUrlMatch( replacementDescriptor.match, '//somewhere.com', 0 );
				expect( replacementDescriptor.prefixStr ).toBe( '' );
				expect( replacementDescriptor.suffixStr ).toBe( '' );
			} );

		} );


		it( "given a match at the beginning of the input string, should return the correct ReplacementDescriptor", function() {
			var replacementDescriptor = matcher.processCandidateMatch( '@abc', [ '', 'abc' ], 0 );

			MatchChecker.expectUrlMatch( replacementDescriptor.match, 'abc', 0 );
			expect( replacementDescriptor.prefixStr ).toBe( '' );
			expect( replacementDescriptor.suffixStr ).toBe( '' );
		} );


		it( "given a match in the middle of the input string, should return the correct ReplacementDescriptor", function() {
			var replacementDescriptor = matcher.processCandidateMatch( 'a @abc def', [ ' ', 'abc' ], 1 );  // offset is 1, because the regex will match the space before the '@'

			MatchChecker.expectUrlMatch( replacementDescriptor.match, 'abc', 2 );  // the Match object should have the offset corrected to 2, since that was where the '@' sign was
			expect( replacementDescriptor.prefixStr ).toBe( ' ' );
			expect( replacementDescriptor.suffixStr ).toBe( '' );
		} );
		*/

	} );


} );