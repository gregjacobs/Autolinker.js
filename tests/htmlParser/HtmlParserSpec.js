/*global Autolinker, _, describe, beforeEach, afterEach, it, expect, jasmine */
describe( "Autolinker.htmlParser.HtmlParser", function() {
	var HtmlParser = Autolinker.htmlParser.HtmlParser,
	    ElementNode = Autolinker.htmlParser.ElementNode,
	    TextNode = Autolinker.htmlParser.TextNode,
	    htmlParser;
	
	
	beforeEach( function() {
		htmlParser = new HtmlParser();
	} );
	
	
	function expectElementNode( node, tagText, tagName, isClosingTag ) {
		expect( node ).toEqual( jasmine.any( ElementNode ) );
		expect( node.getText() ).toBe( tagText );
		expect( node.getTagName() ).toBe( tagName );
		expect( node.isClosing() ).toBe( isClosingTag );
	}
	
	function expectTextNode( node, text ) {
		expect( node ).toEqual( jasmine.any( TextNode ) );
		expect( node.getText() ).toBe( text );
	}
	
	
	it( "should be able to reproduce the input string based on the text that was provided to each returned `HtmlNode`", function() {
		var inputStr = 'Joe went to <a href="google.com">ebay.com</a> today, and bought <b>big</b> items',
		    nodes = htmlParser.parse( inputStr ),
		    result = [];
		
		for( var i = 0, len = nodes.length; i < len; i++ ) {
			result.push( nodes[ i ].getText() );
		}
		
		expect( result.length ).toBe( 9 );
		expect( result.join( "" ) ).toBe( inputStr );
	} );
	
	
	it( "should properly create `HtmlNode` instances for each text / html node encountered, with the proper data filled in on each node", function() {
		var inputStr = 'Joe went to <a href="google.com">ebay.com</a> today, and bought <b>big</b> items',
		    nodes = htmlParser.parse( inputStr );
		
		expect( nodes.length ).toBe( 9 );
		
		expectTextNode   ( nodes[ 0 ], 'Joe went to ' );
		expectElementNode( nodes[ 1 ], '<a href="google.com">', 'a', false );
		expectTextNode   ( nodes[ 2 ], 'ebay.com' );
		expectElementNode( nodes[ 3 ], '</a>', 'a', true );
		expectTextNode   ( nodes[ 4 ], ' today, and bought ' );
		expectElementNode( nodes[ 5 ], '<b>', 'b', false );
		expectTextNode   ( nodes[ 6 ], 'big' );
		expectElementNode( nodes[ 7 ], '</b>', 'b', true );
		expectTextNode   ( nodes[ 8 ], ' items' );
	} );
	
	
	it( 'should match tags of both upper and lower case', function() {
		var inputStr = 'Joe <!DOCTYPE html> went <!doctype "blah" "blah blah"> to <a href="google.com">ebay.com</a> today, and <A href="purchase.com">purchased</A> <b>big</b> <B>items</B>',
		    nodes = htmlParser.parse( inputStr );
		
		expect( nodes.length ).toBe( 20 );
		
		expectTextNode   ( nodes[ 0 ], 'Joe ' );
		expectElementNode( nodes[ 1 ], '<!DOCTYPE html>', '!doctype', false );
		expectTextNode   ( nodes[ 2 ], ' went ' );
		expectElementNode( nodes[ 3 ], '<!doctype "blah" "blah blah">', '!doctype', false );
		expectTextNode   ( nodes[ 4 ], ' to ' );
		expectElementNode( nodes[ 5 ], '<a href="google.com">', 'a', false );
		expectTextNode   ( nodes[ 6 ], 'ebay.com' );
		expectElementNode( nodes[ 7 ], '</a>', 'a', true );
		expectTextNode   ( nodes[ 8 ], ' today, and ' );
		expectElementNode( nodes[ 9 ], '<A href="purchase.com">', 'a', false );
		expectTextNode   ( nodes[ 10 ], 'purchased' );
		expectElementNode( nodes[ 11 ], '</A>', 'a', true );
		expectTextNode   ( nodes[ 12 ], ' ' );
		expectElementNode( nodes[ 13 ], '<b>', 'b', false );
		expectTextNode   ( nodes[ 14 ], 'big' );
		expectElementNode( nodes[ 15 ], '</b>', 'b', true );
		expectTextNode   ( nodes[ 16 ], ' ' );
		expectElementNode( nodes[ 17 ], '<B>', 'b', false );
		expectTextNode   ( nodes[ 18 ], 'items' );
		expectElementNode( nodes[ 19 ], '</B>', 'b', true );
	} );
	
	
	it( "should not freeze up the regular expression engine when presented with the input string in issue #54", function() {
		var inputStr = "Shai ist endlich in Deutschland! Und wir haben gute Nachrichten! <3 Alle, die den Shai-Rasierer kostenlos probieren, machen am Gewinnspiel eines Jahresvorrates Klingen mit. Den Rasierer bekommst Du kostenlos durch diesen Link: http://dorcoshai.de/pb1205ro, und dann machst Du am Gewinnspiel mit! 'Gefallt mir' klicken, wenn Du gern einen Jahresvorrat Shai haben mochtest. (Y)",
		    nodes = htmlParser.parse( inputStr );
		
		expect( nodes.length ).toBe( 1 );
		expectTextNode( nodes[ 0 ], inputStr );
	} );
	
} );