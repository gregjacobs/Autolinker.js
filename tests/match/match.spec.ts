import { AnchorTagBuilder } from "../../src/anchor-tag-builder";
import { Match } from "../../src/match/match";

describe( "Autolinker.match.Match", function() {
	let tagBuilder = new AnchorTagBuilder();

	class ConcreteMatch extends Match {
		getType() { return 'concrete-match'; }
		getAnchorHref() { return this.matchedText + '_href'; }
		getAnchorText() { return this.matchedText + '_text'; }
	}

	describe( 'getMatchedText()', function() {

		it( "should return the configured `matchedText` if it was an empty string", function() {
			let match = new ConcreteMatch( { tagBuilder: tagBuilder, matchedText: '', offset: 0 } );

			expect( match.getMatchedText() ).toBe( '' );
		} );


		it( "should return the configured `matchedText` if it was a string other than an empty string", function() {
			let match = new ConcreteMatch( { tagBuilder: tagBuilder, matchedText: 'abc', offset: 2 } );

			expect( match.getMatchedText() ).toBe( 'abc' );
		} );

	} );


	describe( 'getOffset()', function() {

		it( "should return the configured `offset` if it was 0", function() {
			let match = new ConcreteMatch( { tagBuilder: tagBuilder, matchedText: 'abc', offset: 0 } );

			expect( match.getOffset() ).toBe( 0 );
		} );


		it( "should return the configured `offset` if it was a number other than 0", function() {
			let match = new ConcreteMatch( { tagBuilder: tagBuilder, matchedText: 'abc', offset: 2 } );

			expect( match.getOffset() ).toBe( 2 );
		} );

	} );


	describe( 'buildTag()', function() {

		it( "should return an Autolinker.HtmlTag instance, configured for how the Match is configured", function() {
			let match = new ConcreteMatch( { tagBuilder: tagBuilder, matchedText: 'abc', offset: 0 } ),
			    htmlTag = match.buildTag();

			expect( htmlTag.toAnchorString() ).toBe( '<a href="abc_href">abc_text</a>' );
		} );

	} );

} );