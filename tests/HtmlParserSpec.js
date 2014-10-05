/*global Autolinker, _, describe, beforeEach, afterEach, it, expect */
describe( "Autolinker.HtmlParser", function() {
	var HtmlParser = Autolinker.HtmlParser;
	
	
	it( "should be able to reproduce the input string based on storing the results of the visitor function calls", function() {
		var htmlParser = new HtmlParser(),
		    inputStr = 'Joe went to <a href="google.com">ebay.com</a> today, and bought <b>big</b> items',
		    result = [];
		
		
		htmlParser.parse( inputStr, {
			processHtmlNode : function( tagText, tagName, isClosingTag ) {
				result.push( tagText );
			},
			processTextNode : function( text ) {
				result.push( text );
			}
		} );
		
		expect( result.join( "" ) ).toBe( inputStr );
	} );
	
	
	it( "should properly call the visitor functions for each text / html node encountered, with the proper arguments", function() {
		var htmlParser = new HtmlParser(),
		    inputStr = 'Joe went to <a href="google.com">ebay.com</a> today, and bought <b>big</b> items',
		    htmlNodeArgs = [],
		    textNodeArgs = [];
		
		htmlParser.parse( inputStr, {
			processHtmlNode : function( tagText, tagName, isClosingTag ) {
				htmlNodeArgs.push( Array.prototype.slice.call( arguments ) );
			},
			processTextNode : function( text ) {
				textNodeArgs.push( Array.prototype.slice.call( arguments ) );
			}
		} );
		
		expect( htmlNodeArgs.length ).toBe( 4 );
		expect( htmlNodeArgs[ 0 ] ).toEqual( [ '<a href="google.com">', 'a', false ] );
		expect( htmlNodeArgs[ 1 ] ).toEqual( [ '</a>', 'a', true ] );
		expect( htmlNodeArgs[ 2 ] ).toEqual( [ '<b>', 'b', false ] );
		expect( htmlNodeArgs[ 3 ] ).toEqual( [ '</b>', 'b', true ] );
		
		expect( textNodeArgs.length ).toBe( 5 );
		expect( textNodeArgs[ 0 ] ).toEqual( [ 'Joe went to ' ] );
		expect( textNodeArgs[ 1 ] ).toEqual( [ 'ebay.com' ] );
		expect( textNodeArgs[ 2 ] ).toEqual( [ ' today, and bought ' ] );
		expect( textNodeArgs[ 3 ] ).toEqual( [ 'big' ] );
		expect( textNodeArgs[ 4 ] ).toEqual( [ ' items' ] );
	} );
	
} );