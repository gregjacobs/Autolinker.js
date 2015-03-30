/*global Autolinker, _, describe, beforeEach, afterEach, it, expect, jasmine */
describe( "Autolinker.htmlParser.HtmlParser", function() {
	var HtmlParser = Autolinker.htmlParser.HtmlParser,
	    CommentNode = Autolinker.htmlParser.CommentNode,
	    ElementNode = Autolinker.htmlParser.ElementNode,
	    EntityNode = Autolinker.htmlParser.EntityNode,
	    TextNode = Autolinker.htmlParser.TextNode,
	    htmlParser;


	beforeEach( function() {
		htmlParser = new HtmlParser();
	} );


	function expectCommentNode( node, text, comment ) {
		expect( node ).toEqual( jasmine.any( CommentNode ) );
		expect( node.getText() ).toBe( text );
		expect( node.getComment() ).toBe( comment );
	}

	function expectElementNode( node, tagText, tagName, isClosingTag ) {
		expect( node ).toEqual( jasmine.any( ElementNode ) );
		expect( node.getText() ).toBe( tagText );
		expect( node.getTagName() ).toBe( tagName );
		expect( node.isClosing() ).toBe( isClosingTag );
	}

	function expectEntityNode( node, text ) {
		expect( node ).toEqual( jasmine.any( EntityNode ) );
		expect( node.getText() ).toBe( text );
	}

	function expectTextNode( node, text ) {
		expect( node ).toEqual( jasmine.any( TextNode ) );
		expect( node.getText() ).toBe( text );
	}


	it( "should return an empty array for an empty input string", function() {
		expect( htmlParser.parse( "" ) ).toEqual( [] );
	} );


	describe( 'text node handling', function() {

		it( "should return a single text node if there are no HTML nodes in it", function() {
			var nodes = htmlParser.parse( "Testing 123" );

			expect( nodes.length ).toBe( 1 );
			expectTextNode( nodes[ 0 ], 'Testing 123' );
		} );

	} );


	describe( 'HTML comment node handling', function() {

		it( "should return a single comment node if there is only an HTML comment node in it", function() {
			var nodes = htmlParser.parse( "<!-- Testing 123 -->" );

			expect( nodes.length ).toBe( 1 );
			expectCommentNode( nodes[ 0 ], "<!-- Testing 123 -->", "Testing 123" );
		} );


		it( "should handle a multi-line comment, and trim any amount of whitespace in the comment for the comment's text", function() {
			var nodes = htmlParser.parse( "<!-- \n  \t\n Testing 123  \n\t  \n\n -->" );

			expect( nodes.length ).toBe( 1 );
			expectCommentNode( nodes[ 0 ], "<!-- \n  \t\n Testing 123  \n\t  \n\n -->", "Testing 123" );
		} );


		it( "should produce 3 nodes for a text node, comment, then text node", function() {
			var nodes = htmlParser.parse( "Test <!-- Comment --> Test" );

			expect( nodes.length ).toBe( 3 );
			expectTextNode   ( nodes[ 0 ], 'Test ' );
			expectCommentNode( nodes[ 1 ], '<!-- Comment -->', 'Comment' );
			expectTextNode   ( nodes[ 2 ], ' Test' );
		} );


		it( "should produce 4 nodes for a text node, comment, text node, comment", function() {
			var nodes = htmlParser.parse( "Test <!-- Comment --> Test <!-- Comment 2 -->" );

			expect( nodes.length ).toBe( 4 );
			expectTextNode   ( nodes[ 0 ], 'Test ' );
			expectCommentNode( nodes[ 1 ], '<!-- Comment -->', 'Comment' );
			expectTextNode   ( nodes[ 2 ], ' Test ' );
			expectCommentNode( nodes[ 3 ], '<!-- Comment 2 -->', 'Comment 2' );
		} );

	} );


	describe( 'HTML element node handling', function() {

		it( "should return a single element node if there is only an HTML element node in it", function() {
			var nodes = htmlParser.parse( "<div>" );

			expect( nodes.length ).toBe( 1 );
			expectElementNode( nodes[ 0 ], '<div>', 'div', false );
		} );


		it( "should produce 3 nodes for a text node, element, then text node", function() {
			var nodes = htmlParser.parse( "Test <div> Test" );

			expect( nodes.length ).toBe( 3 );
			expectTextNode   ( nodes[ 0 ], 'Test ' );
			expectElementNode( nodes[ 1 ], '<div>', 'div', false );
			expectTextNode   ( nodes[ 2 ], ' Test' );
		} );


		it( "should be able to reproduce the input string based on the text that was provided to each returned `HtmlNode`", function() {
			var inputStr = 'Joe went to <a href="google.com">ebay.com</a> today,&nbsp;and bought <b>big</b> items',
				nodes = htmlParser.parse( inputStr ),
				result = [];

			for( var i = 0, len = nodes.length; i < len; i++ ) {
				result.push( nodes[ i ].getText() );
			}

			expect( result.length ).toBe( 11 );
			expect( result.join( "" ) ).toBe( inputStr );
		} );

	} );


	describe( 'HTML entity handling', function() {

		it( "should *not* match the &amp; HTML entity, as this may be part of a query string", function() {
			var nodes = htmlParser.parse( 'Me&amp;You' );

			expect( nodes.length ).toBe( 1 );
			expectTextNode( nodes[ 0 ], 'Me&amp;You' );
		} );


		it( "should properly parse a string that begins with an HTML entity node", function() {
			var nodes = htmlParser.parse( '&quot;Test' );

			expect( nodes.length ).toBe( 2 );
			expectEntityNode( nodes[ 0 ], '&quot;' );
			expectTextNode( nodes[ 1 ], 'Test' );
		} );


		it( "should properly parse a string that ends with an HTML entity node", function() {
			var nodes = htmlParser.parse( 'Test&quot;' );

			expect( nodes.length ).toBe( 2 );
			expectTextNode( nodes[ 0 ], 'Test' );
			expectEntityNode( nodes[ 1 ], '&quot;' );
		} );


		it( "should properly parse a string that begins and ends with an HTML entity node", function() {
			var nodes = htmlParser.parse( '&quot;Test&quot;' );

			expect( nodes.length ).toBe( 3 );
			expectEntityNode( nodes[ 0 ], '&quot;' );
			expectTextNode( nodes[ 1 ], 'Test' );
			expectEntityNode( nodes[ 2 ], '&quot;' );
		} );


		it( "should properly parse a string that has an HTML entity node in the middle", function() {
			var nodes = htmlParser.parse( 'Test&quot;Test' );

			expect( nodes.length ).toBe( 3 );
			expectTextNode( nodes[ 0 ], 'Test' );
			expectEntityNode( nodes[ 1 ], '&quot;' );
			expectTextNode( nodes[ 2 ], 'Test' );
		} );


		it( "should properly parse a string that only has an HTML entity node", function() {
			var nodes = htmlParser.parse( '&quot;' );

			expect( nodes.length ).toBe( 1 );
			expectEntityNode( nodes[ 0 ], '&quot;' );
		} );

	} );


	describe( 'combination examples', function() {

		it( "should properly create `HtmlNode` instances for each text/entity/comment/element node encountered, with the proper data filled in on each node", function() {
			var inputStr = [
				'&quot;Joe went to &quot;',
				'<a href="google.com">ebay.com</a>&quot; ',
				'today,&nbsp;and <!-- stuff -->bought <b>big</b> items&quot;'
			].join( "" );

			var nodes = htmlParser.parse( inputStr );
			expect( nodes.length ).toBe( 17 );

			var i = -1;
			expectEntityNode ( nodes[ ++i ], '&quot;' );
			expectTextNode   ( nodes[ ++i ], 'Joe went to ' );
			expectEntityNode ( nodes[ ++i ], '&quot;' );
			expectElementNode( nodes[ ++i ], '<a href="google.com">', 'a', false );
			expectTextNode   ( nodes[ ++i ], 'ebay.com' );
			expectElementNode( nodes[ ++i ], '</a>', 'a', true );
			expectEntityNode ( nodes[ ++i ], '&quot;' );
			expectTextNode   ( nodes[ ++i ], ' today,' );
			expectEntityNode ( nodes[ ++i ], '&nbsp;' );
			expectTextNode   ( nodes[ ++i ], 'and ' );
			expectCommentNode( nodes[ ++i ], '<!-- stuff -->', 'stuff' );
			expectTextNode   ( nodes[ ++i ], 'bought ' );
			expectElementNode( nodes[ ++i ], '<b>', 'b', false );
			expectTextNode   ( nodes[ ++i ], 'big' );
			expectElementNode( nodes[ ++i ], '</b>', 'b', true );
			expectTextNode   ( nodes[ ++i ], ' items' );
			expectEntityNode ( nodes[ ++i ], '&quot;' );
		} );


		it( 'should match tags of both upper and lower case', function() {
			var inputStr = 'Joe <!DOCTYPE html><!-- Comment -->went <!doctype "blah" "blah blah"> to <a href="google.com">ebay.com</a> today,&nbsp;and <A href="purchase.com">purchased</A> <b>big</b> <B><!-- Comment 2 -->items</B>',
			    nodes = htmlParser.parse( inputStr );

			expect( nodes.length ).toBe( 24 );

			var i = -1;
			expectTextNode   ( nodes[ ++i ], 'Joe ' );
			expectElementNode( nodes[ ++i ], '<!DOCTYPE html>', '!doctype', false );
			expectCommentNode( nodes[ ++i ], '<!-- Comment -->', 'Comment' );
			expectTextNode   ( nodes[ ++i ], 'went ' );
			expectElementNode( nodes[ ++i ], '<!doctype "blah" "blah blah">', '!doctype', false );
			expectTextNode   ( nodes[ ++i ], ' to ' );
			expectElementNode( nodes[ ++i ], '<a href="google.com">', 'a', false );
			expectTextNode   ( nodes[ ++i ], 'ebay.com' );
			expectElementNode( nodes[ ++i ], '</a>', 'a', true );
			expectTextNode   ( nodes[ ++i ], ' today,' );
			expectEntityNode ( nodes[ ++i ], '&nbsp;' );
			expectTextNode   ( nodes[ ++i ], 'and ' );
			expectElementNode( nodes[ ++i ], '<A href="purchase.com">', 'a', false );
			expectTextNode   ( nodes[ ++i ], 'purchased' );
			expectElementNode( nodes[ ++i ], '</A>', 'a', true );
			expectTextNode   ( nodes[ ++i ], ' ' );
			expectElementNode( nodes[ ++i ], '<b>', 'b', false );
			expectTextNode   ( nodes[ ++i ], 'big' );
			expectElementNode( nodes[ ++i ], '</b>', 'b', true );
			expectTextNode   ( nodes[ ++i ], ' ' );
			expectElementNode( nodes[ ++i ], '<B>', 'b', false );
			expectCommentNode( nodes[ ++i ], '<!-- Comment 2 -->', 'Comment 2' );
			expectTextNode   ( nodes[ ++i ], 'items' );
			expectElementNode( nodes[ ++i ], '</B>', 'b', true );
		} );

	} );


	it( "should not freeze up the regular expression engine when presented with the input string in issue #54", function() {
		var inputStr = "Shai ist endlich in Deutschland! Und wir haben gute Nachrichten! <3 Alle, die den Shai-Rasierer kostenlos probieren, machen am Gewinnspiel eines Jahresvorrates Klingen mit. Den Rasierer bekommst Du kostenlos durch diesen Link: http://dorcoshai.de/pb1205ro, und dann machst Du am Gewinnspiel mit! 'Gefallt mir' klicken, wenn Du gern einen Jahresvorrat Shai haben mochtest. (Y)",
		    nodes = htmlParser.parse( inputStr );

		expect( nodes.length ).toBe( 1 );
		expectTextNode( nodes[ 0 ], inputStr );
	} );

} );