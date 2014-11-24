/*global Autolinker, _, describe, beforeEach, afterEach, it, expect */
describe( "Autolinker.HtmlParser", function() {
	var HtmlParser = Autolinker.HtmlParser,
	    htmlParser;
	
	
	beforeEach( function() {
		htmlParser = new HtmlParser();
	} );
	
	
	it( "should be able to reproduce the input string based on storing the results of the visitor function calls", function() {
		var inputStr = 'Joe went to <a href="google.com">ebay.com</a> today, and bought <b>big</b> items',
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
		var inputStr = 'Joe went to <a href="google.com">ebay.com</a> today, and bought <b>big</b> items',
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
	
	
	it( 'should match tags of both upper and lower case', function() {
		var inputStr = 'Joe <!DOCTYPE html> went <!doctype "blah" "blah blah"> to <a href="google.com">ebay.com</a> today, and <A href="purchase.com">purchased</A> <b>big</b> <B>items</B>',
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
		
		expect( htmlNodeArgs.length ).toBe( 10 );
		expect( htmlNodeArgs[ 0 ] ).toEqual( [ '<!DOCTYPE html>', '!doctype', false ] );
		expect( htmlNodeArgs[ 1 ] ).toEqual( [ '<!doctype "blah" "blah blah">', '!doctype', false ] );
		expect( htmlNodeArgs[ 2 ] ).toEqual( [ '<a href="google.com">', 'a', false ] );
		expect( htmlNodeArgs[ 3 ] ).toEqual( [ '</a>', 'a', true ] );
		expect( htmlNodeArgs[ 4 ] ).toEqual( [ '<A href="purchase.com">', 'a', false ] );
		expect( htmlNodeArgs[ 5 ] ).toEqual( [ '</A>', 'a', true ] );
		expect( htmlNodeArgs[ 6 ] ).toEqual( [ '<b>', 'b', false ] );
		expect( htmlNodeArgs[ 7 ] ).toEqual( [ '</b>', 'b', true ] );
		expect( htmlNodeArgs[ 8 ] ).toEqual( [ '<B>', 'b', false ] );
		expect( htmlNodeArgs[ 9 ] ).toEqual( [ '</B>', 'b', true ] );
		
		expect( textNodeArgs.length ).toBe( 10 );
		expect( textNodeArgs[ 0 ] ).toEqual( [ 'Joe ' ] );
		expect( textNodeArgs[ 1 ] ).toEqual( [ ' went ' ] );
		expect( textNodeArgs[ 2 ] ).toEqual( [ ' to ' ] );
		expect( textNodeArgs[ 3 ] ).toEqual( [ 'ebay.com' ] );
		expect( textNodeArgs[ 4 ] ).toEqual( [ ' today, and ' ] );
		expect( textNodeArgs[ 5 ] ).toEqual( [ 'purchased' ] );
		expect( textNodeArgs[ 6 ] ).toEqual( [ ' ' ] );
		expect( textNodeArgs[ 7 ] ).toEqual( [ 'big' ] );
		expect( textNodeArgs[ 8 ] ).toEqual( [ ' ' ] );
		expect( textNodeArgs[ 9 ] ).toEqual( [ 'items' ] );
	} );
	
	
	it( "should not freeze up the regular expression engine when presented with the input string in issue #54", function() {
		var inputStr = "Shai ist endlich in Deutschland! Und wir haben gute Nachrichten! <3 Alle, die den Shai-Rasierer kostenlos probieren, machen am Gewinnspiel eines Jahresvorrates Klingen mit. Den Rasierer bekommst Du kostenlos durch diesen Link: http://dorcoshai.de/pb1205ro, und dann machst Du am Gewinnspiel mit! 'Gefallt mir' klicken, wenn Du gern einen Jahresvorrat Shai haben mochtest. (Y)",
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
		
		expect( htmlNodeArgs.length ).toBe( 0 );
		
		expect( textNodeArgs.length ).toBe( 1 );
		expect( textNodeArgs[ 0 ] ).toEqual( [ inputStr ] );
	} );
	
} );