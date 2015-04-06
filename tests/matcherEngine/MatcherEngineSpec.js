/*global Autolinker, _, describe, beforeEach, afterEach, it, expect, jasmine */
describe( "Autolinker.matcherEngine.MatcherEngine", function() {
	var MatcherEngine = Autolinker.matcherEngine.MatcherEngine,
	    RegexCombiner = Autolinker.matcherEngine.RegexCombiner,
	    TwitterMatcher = Autolinker.matcher.Twitter;

	beforeEach( function() {

	} );


	describe( 'replace()', function() {

		describe( 'using only a Twitter Matcher', function() {
			var matcherEngine = new MatcherEngine( {
				regexCombiner : new RegexCombiner( [ new TwitterMatcher() ] ),

				replaceFn : function() {}  // TODO: Add `replaceFn` as cfg, and use to test the matcher engine
			} );

			var result = matcherEngine.replace( "abc @twitterUser def" );
			expect( 1 ).toBe( 'TODO' );
		} );



	} );


} );