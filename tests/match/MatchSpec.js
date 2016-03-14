/*global Autolinker, _, describe, beforeEach, afterEach, it, expect, jasmine */
describe( "Autolinker.match.Match", function() {
	var Match = Autolinker.match.Match,
		tagBuilder = new Autolinker.AnchorTagBuilder();


	describe( 'getMatchedText()', function() {

		it( "should return the configured `matchedText` if it was an empty string", function() {
			var match = new Match( { tagBuilder: tagBuilder, matchedText: '', offset: 0 } );

			expect( match.getMatchedText() ).toBe( '' );
		} );


		it( "should return the configured `matchedText` if it was a string other than an empty string", function() {
			var match = new Match( { tagBuilder: tagBuilder, matchedText: 'abc', offset: 2 } );

			expect( match.getMatchedText() ).toBe( 'abc' );
		} );

	} );


	describe( 'getOffset()', function() {

		it( "should return the configured `offset` if it was 0", function() {
			var match = new Match( { tagBuilder: tagBuilder, matchedText: 'abc', offset: 0 } );

			expect( match.getOffset() ).toBe( 0 );
		} );


		it( "should return the configured `offset` if it was a number other than 0", function() {
			var match = new Match( { tagBuilder: tagBuilder, matchedText: 'abc', offset: 2 } );

			expect( match.getOffset() ).toBe( 2 );
		} );

	} );


	describe( 'buildTag()', function() {
		var ConcreteMatch = Autolinker.Util.extend( Match, {
			getType       : function() { return 'concrete-match'; },
			getAnchorHref : function() { return this.matchedText + '_href'; },
			getAnchorText : function() { return this.matchedText + '_text'; }
		} );


		it( "should return an Autolinker.HtmlTag instance, configured for how the Match is configured", function() {
			var match = new ConcreteMatch( { tagBuilder: tagBuilder, matchedText: 'abc', offset: 0 } ),
			    htmlTag = match.buildTag();

			expect( htmlTag.toAnchorString() ).toBe( '<a href="abc_href">abc_text</a>' );
		} );

	} );

} );