/*global Autolinker, _, describe, beforeEach, afterEach, it, expect, jasmine */
describe( "Autolinker.matcherEngine.RegexCombiner", function() {
	var RegexCombiner = Autolinker.matcherEngine.RegexCombiner,
		Matcher = Autolinker.matcher.Matcher;

	var TestMatcherNoCapturingGroups = Autolinker.Util.extend( Matcher, {
		getMatcherRegexStr    : function() { return 'abc'; },
		getNumCapturingGroups : function() { return 0; }
	} );

	var TestMatcherOneCapturingGroup = Autolinker.Util.extend( Matcher, {
		getMatcherRegexStr    : function() { return 'd(e)f'; },
		getNumCapturingGroups : function() { return 1; }
	} );

	var TestMatcherTwoCapturingGroups = Autolinker.Util.extend( Matcher, {
		getMatcherRegexStr    : function() { return 'g(h)(i)'; },
		getNumCapturingGroups : function() { return 2; }
	} );


	var noCapturingGroupsMatcher,
		oneCapturingGroupMatcher,
		twoCapturingGroupsMatcher;

	beforeEach( function() {
		noCapturingGroupsMatcher = new TestMatcherNoCapturingGroups();
		oneCapturingGroupMatcher = new TestMatcherOneCapturingGroup();
		twoCapturingGroupsMatcher = new TestMatcherTwoCapturingGroups();
	} );


	describe( 'getNumCapturingGroups() (private method)', function() {
		var regexCombiner;

		beforeEach( function() {
			regexCombiner = new RegexCombiner( [] );  // no actual Matchers needed to test `getNumCapturingGroups()` method
		} );

		it( "should return 0 when there are no capturing groups in a regular expression", function() {
			expect( regexCombiner.getNumCapturingGroups( 'abc' ) ).toBe( 0 );
		} );


		it( "should return 0 when there are no capturing groups in a regular expression, where all opening parenthesis form a non-capturing group, i.e. '(?:'", function() {
			expect( regexCombiner.getNumCapturingGroups( 'a (?:b) (?:c)' ) ).toBe( 0 );
		} );


		it( "should return 0 when there are no capturing groups in a regular expression, where all opening parenthesis are escaped", function() {
			expect( regexCombiner.getNumCapturingGroups( 'a \\(b \\(c' ) ).toBe( 0 );
		} );


		it( "should return the number of actual capturing groups in a regular expression", function() {
			expect( regexCombiner.getNumCapturingGroups( 'a(b)(c)' ) ).toBe( 2 );
		} );


		it( "should return the number of actual capturing groups in a regular expression when there are also escaped opening parenthesis, or non-capturing groups", function() {
			expect( regexCombiner.getNumCapturingGroups( 'a(b)(c)(?:d)(e)\\(f\\)' ) ).toBe( 3 );
		} );

	} );


	describe( 'getRegex()', function() {

		it( "when a single Matcher is provided, should return a regex that simply wraps this Matcher's regex with its own capturing parens", function() {
			var regexCombiner = new RegexCombiner( [ noCapturingGroupsMatcher ] ),
				regex = regexCombiner.getRegex();

			expect( regex.source ).toBe( '(abc)' );
		} );


		it( "when two Matchers are provided, should return a regex that wraps each Matcher's regex with its own capturing parens, and ORs them together", function() {
			var regexCombiner = new RegexCombiner( [ noCapturingGroupsMatcher, noCapturingGroupsMatcher ] ),
				regex = regexCombiner.getRegex();

			expect( regex.source ).toBe( '(abc)|(abc)' );
		} );


		it( "when three Matchers are provided, should return a regex that wraps each Matcher's regex with its own capturing parens, and ORs them together", function() {
			var regexCombiner = new RegexCombiner( [ noCapturingGroupsMatcher, noCapturingGroupsMatcher, noCapturingGroupsMatcher ] ),
				regex = regexCombiner.getRegex();

			expect( regex.source ).toBe( '(abc)|(abc)|(abc)' );
		} );


		it( "when three separate Matchers are provided, should return a regex that wraps each Matcher's regex with its own capturing parens around each Matcher's own capturing parens, and ORs them together", function() {
			var regexCombiner = new RegexCombiner( [ noCapturingGroupsMatcher, oneCapturingGroupMatcher, twoCapturingGroupsMatcher ] ),
				regex = regexCombiner.getRegex();

			expect( regex.source ).toBe( '(abc)|(d(e)f)|(g(h)(i))' );
		} );

	} );


	describe( 'getMatcherAndCapturingGroups()', function() {
		var regexCombiner,
		    regex;

		beforeEach( function() {
			regexCombiner = new RegexCombiner( [ noCapturingGroupsMatcher, oneCapturingGroupMatcher, twoCapturingGroupsMatcher ] );

			regex = regexCombiner.getRegex();
		} );


		it( "when there are no capturing groups, should return the correct Matcher and array of capturing group matches for the given capturing groups array provided by a match against the input text", function() {
			var capturingGroups = regex.exec( "abc" ).slice( 1 ),  // slice off the first array element, which is the full match. This should not be included as a "capturing group".
				result = regexCombiner.getMatcherAndCapturingGroups( capturingGroups );

			expect( result.matcher ).toBe( noCapturingGroupsMatcher );
			expect( result.capturingGroups ).toEqual( [] );
		} );


		it( "when there is one capturing groups, should return the correct Matcher and array of capturing group matches for the given capturing groups array provided by a match against the input text", function() {
			var capturingGroups = regex.exec( "def" ).slice( 1 ),  // slice off the first array element, which is the full match. This should not be included as a "capturing group".
			    result = regexCombiner.getMatcherAndCapturingGroups( capturingGroups );

			expect( result.matcher ).toBe( oneCapturingGroupMatcher );
			expect( result.capturingGroups ).toEqual( [ 'e' ] );
		} );


		it( "when there are two capturing groups, should return the correct Matcher and array of capturing group matches for the given capturing groups array provided by a match against the input text", function() {
			var capturingGroups = regex.exec( "ghi" ).slice( 1 ),  // slice off the first array element, which is the full match. This should not be included as a "capturing group".
			    result = regexCombiner.getMatcherAndCapturingGroups( capturingGroups );

			expect( result.matcher ).toBe( twoCapturingGroupsMatcher );
			expect( result.capturingGroups ).toEqual( [ 'h', 'i' ] );
		} );

	} );


} );