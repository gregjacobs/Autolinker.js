import { parseHtml } from "../../src/htmlParser/parse-html";

describe( "Autolinker.htmlParser.HtmlParser", () => {

	/**
	 * Helper function to run parseHtml() and capture the emitted 
	 * openTag/closeTag/text/comment/doctype nodes.
	 */
	function parseHtmlAndCapture( html: string ): HtmlNode[] {
		let parsedNodes: HtmlNode[] = [];

		parseHtml( html, {
			onOpenTag: ( tagName: string, offset: number ) => { 
				parsedNodes.push( { type: 'openTag', tagName, offset } );
			},
			onText: ( text: string, offset: number ) => {
				parsedNodes.push( { type: 'text', text, offset } );
			}, 
			onCloseTag: ( tagName: string, offset: number ) => {
				parsedNodes.push( { type: 'closeTag', tagName, offset } );
			},
			onComment: ( offset: number ) => {
				parsedNodes.push( { type: 'comment', offset } );
			},
			onDoctype: ( offset: number ) => {
				parsedNodes.push( { type: 'doctype', offset } );
			}
		} );
		return parsedNodes;
	}


	describe( 'text node handling', function() {

		it( `when provided an empty string, should not emit any nodes`, () => {
			const nodes = parseHtmlAndCapture( '' );
	
			expect( nodes ).toEqual( [] );
		} );


		it( "should return a single text node if there are no HTML nodes in it", () => {
			let nodes = parseHtmlAndCapture( "Testing 123" );

			expect( nodes.length ).toBe( 1 );
			expect( nodes[ 0 ] ).toEqual( { type: 'text', text: 'Testing 123', offset: 0 } );
		} );

	} );


	describe( 'HTML element node handling', () => {

		it( "should return a single element node if there is only an HTML element node in it", () => {
			let nodes = parseHtmlAndCapture( "<div>" );

			expect( nodes ).toEqual( [
				{ type: 'openTag', tagName: 'div', offset: 0 }
			] );
		} );


		it( "should produce 3 nodes for a text node, element, then text node", () => {
			let nodes = parseHtmlAndCapture( "Test <div> Test" );

			expect( nodes ).toEqual( [
				{ type: 'text', text: 'Test ', offset: 0 },
				{ type: 'openTag', tagName: 'div', offset: 5 },
				{ type: 'text', text: ' Test', offset: 10 }
			] );
		} );


		it( "when there are multiple html elements, should parse each of them", () => {
			let nodes = parseHtmlAndCapture( "Test <div>b<span> Test" );

			expect( nodes ).toEqual( [
				{ type: 'text', text: 'Test ', offset: 0 },
				{ type: 'openTag', tagName: 'div', offset: 5 },
				{ type: 'text', text: 'b', offset: 10 },
				{ type: 'openTag', tagName: 'span', offset: 11 },
				{ type: 'text', text: ' Test', offset: 17 }
			] );
		} );


		it( "when there are end tags in the string, should parse them correctly", () => {
			let nodes = parseHtmlAndCapture( "Test <div>b</div> <span>Test</span>" );

			expect( nodes ).toEqual( [
				{ type: 'text', text: 'Test ', offset: 0 },
				{ type: 'openTag', tagName: 'div', offset: 5 },
				{ type: 'text', text: 'b', offset: 10 },
				{ type: 'closeTag', tagName: 'div', offset: 11 },
				{ type: 'text', text: ' ', offset: 17 },
				{ type: 'openTag', tagName: 'span', offset: 18 },
				{ type: 'text', text: 'Test', offset: 24 },
				{ type: 'closeTag', tagName: 'span', offset: 28 }
			] );
		} );


		it( `when a string starts with html, should parse correctly`, () => {
			let nodes = parseHtmlAndCapture( "<div>Test</div> Test2" );
			
			expect( nodes ).toEqual( [
				{ type: 'openTag', tagName: 'div', offset: 0 },
				{ type: 'text', text: 'Test', offset: 5 },
				{ type: 'closeTag', tagName: 'div', offset: 9 },
				{ type: 'text', text: ' Test2', offset: 15 }
			] );
		} );


		it( `when there are self-closing tags in the string, should emit both an
			 open and close tag`, 
		() => {
			let nodes = parseHtmlAndCapture( "<div/>Test" );
			
			expect( nodes ).toEqual( [
				{ type: 'openTag', tagName: 'div', offset: 0 },
				{ type: 'closeTag', tagName: 'div', offset: 0 },
				{ type: 'text', text: 'Test', offset: 6 }
			] );
		} );


		it( `should handle html tags with attributes`, () => {
			let nodes = parseHtmlAndCapture( `<div id="hi" class='some-class' align=center>Test</div>` );
			
			expect( nodes ).toEqual( [
				{ type: 'openTag', tagName: 'div', offset: 0 },
				{ type: 'text', text: 'Test', offset: 45 },
				{ type: 'closeTag', tagName: 'div', offset: 49 }
			] );
		} );


		it( `when there are two << characters, the first one should be ignored
			 if the second one forms a tag`,
		() => {
			let nodes = parseHtmlAndCapture( `<<div>Test</div>` );
			
			expect( nodes ).toEqual( [
				{ type: 'text', text: '<', offset: 0 },
				{ type: 'openTag', tagName: 'div', offset: 1 },
				{ type: 'text', text: 'Test', offset: 6 },
				{ type: 'closeTag', tagName: 'div', offset: 10 }
			] );
		} );


		it( `when we have text such as '<xyz<', the first '<' should be ignored
		     if the second one forms a tag`,
		() => {
			let nodes = parseHtmlAndCapture( `<xyz<div>Test</div>` );
			
			expect( nodes ).toEqual( [
				{ type: 'text', text: '<xyz', offset: 0 },
				{ type: 'openTag', tagName: 'div', offset: 4 },
				{ type: 'text', text: 'Test', offset: 9 },
				{ type: 'closeTag', tagName: 'div', offset: 13 }
			] );
		} );

		
		it( `when we have text such as '<xyz<', and the second '<' does not form
		     a tag, this sequence should be treated as text`,
		() => {
			let nodes = parseHtmlAndCapture( `<xyz< Test <3<asdf` );
			
			expect( nodes ).toEqual( [
				{ type: 'text', text: '<xyz< Test <3<asdf', offset: 0 }
			] );
		} );


		it( "should handle some more complex HTML strings", function() {
			let nodes = parseHtmlAndCapture( 'Joe went to <a href="google.com">ebay.com</a> today,&nbsp;and bought <b>big</b> items' );

			expect( nodes ).toEqual( [
				{ type: 'text', text: 'Joe went to ', offset: 0 },
				{ type: 'openTag', tagName: 'a', offset: 12 },
				{ type: 'text', text: 'ebay.com', offset: 33 },
				{ type: 'closeTag', tagName: 'a', offset: 41 },
				{ type: 'text', text: ' today,&nbsp;and bought ', offset: 45 },
				{ type: 'openTag', tagName: 'b', offset: 69 },
				{ type: 'text', text: 'big', offset: 72 },
				{ type: 'closeTag', tagName: 'b', offset: 75 },
				{ type: 'text', text: ' items', offset: 79 }
			] );
		} );


		it( "should properly handle a tag where the attributes start on the " +
			"next line",
		function() {
			let nodes = parseHtmlAndCapture( 'Test <div\nclass="myClass"\nstyle="color:red"> Test' );

			expect( nodes ).toEqual( [
				{ type: 'text', text: 'Test ', offset: 0 },
				{ type: 'openTag', tagName: 'div', offset: 5 },
				{ type: 'text', text: ' Test', offset: 44 }
			] );
		} );

	} );


	describe( 'HTML comment node handling', function() {

		it( `should properly handle text that starts with the sequence '<!' but
		     doesn't form a comment tag`,
		function() {
			let nodes = parseHtmlAndCapture( '<! Hello' );

			expect( nodes ).toEqual( [
				{ type: 'text', text: '<! Hello', offset: 0 }
			] );
		} );


		it( "should return a single comment node if there is only an HTML comment node in it", function() {
			let nodes = parseHtmlAndCapture( "<!-- Testing 123 -->" );

			expect( nodes ).toEqual( [
				{ type: 'comment', offset: 0 }
			] );
		} );


		it( "should handle a multi-line comment", function() {
			let nodes = parseHtmlAndCapture( "<!-- \n  \t\n Testing 123  \n\t  \n\n -->" );

			expect( nodes ).toEqual( [
				{ type: 'comment', offset: 0 }
			] );
		} );


		it( "should handle a comment in the middle of text", function() {
			let nodes = parseHtmlAndCapture( "Test <!-- Comment --> Test" );

			expect( nodes ).toEqual( [
				{ type: 'text', text: 'Test ', offset: 0 },
				{ type: 'comment', offset: 5 },
				{ type: 'text', text: ' Test', offset: 21 }
			] );
		} );


		it( "should handle a comment in the middle of a tag", function() {
			let nodes = parseHtmlAndCapture( "<div><!-- Comment --></div>" );

			expect( nodes ).toEqual( [
				{ type: 'openTag', tagName: 'div', offset: 0 },
				{ type: 'comment', offset: 5 },
				{ type: 'closeTag', tagName: 'div', offset: 21 }
			] );
		} );


		it( "should handle multiple comments", function() {
			let nodes = parseHtmlAndCapture( "Test <!-- Comment --> Test <!-- Comment 2 -->" );

			expect( nodes ).toEqual( [
				{ type: 'text', text: 'Test ', offset: 0 },
				{ type: 'comment', offset: 5 },
				{ type: 'text', text: ' Test ', offset: 21 },
				{ type: 'comment', offset: 27 }
			] );
		} );

	} );


	describe( '<!DOCTYPE> handling', () => {

		it( 'should parse a doctype tag', () => {
			let nodes = parseHtmlAndCapture( `<!DOCTYPE html>` );

			expect( nodes ).toEqual( [
				{ type: 'doctype', offset: 0 }
			] );
		} );


		it( 'should parse a doctype tag in both upper and lower case', () => {
			let nodes = parseHtmlAndCapture( `<!DOCTYPE html> and <!doctype "blah" "blah blah">` );

			expect( nodes ).toEqual( [
				{ type: 'doctype', offset: 0 },
				{ type: 'text', text: ' and ', offset: 15 },
				{ type: 'doctype', offset: 20 }
			] );
		} );


		it( 'if the tag is incomplete, should treat it as text', () => {
			let nodes = parseHtmlAndCapture( `<!DOCTYPE html and blah blah blah` );

			expect( nodes ).toEqual( [
				{ type: 'text', text: '<!DOCTYPE html and blah blah blah', offset: 0 }
			] );
		} );

	} );

	
	describe( 'combination examples', () => {

		it( 'should match tags of both upper and lower case', function() {
			let inputStr = [
				'Joe <!DOCTYPE html><!-- Comment -->went <!doctype "blah" "blah blah"> ',
				'to <a href="google.com">ebay.com</a> today,&nbsp;and <A href="purchase.com">purchased</A> ',
				'<b>big</b> <B><!-- Comment 2 -->items</B>'
			].join( '' );
			let nodes = parseHtmlAndCapture( inputStr );

			expect( nodes ).toEqual( [
				{ type: 'text',     offset: 0,  text: 'Joe ' },
				{ type: 'doctype',  offset: 4 },
				{ type: 'comment',  offset: 19 },
				{ type: 'text',     offset: 35, text: 'went ' },
				{ type: 'doctype',  offset: 40 },
				{ type: 'text',     offset: 69, text: ' to ' },
				{ type: 'openTag',  offset: 73, tagName: 'a' },
				{ type: 'text',     offset: 94, text: 'ebay.com' },
				{ type: 'closeTag', offset: 102, tagName: 'a' },
				{ type: 'text',     offset: 106, text: ' today,&nbsp;and ' },
				{ type: 'openTag',  offset: 123, tagName: 'a' },
				{ type: 'text',     offset: 146, text: 'purchased' },
				{ type: 'closeTag', offset: 155, tagName: 'a' },
				{ type: 'text',     offset: 159, text: ' ' },
				{ type: 'openTag',  offset: 160, tagName: 'b' },
				{ type: 'text',     offset: 163, text: 'big' },
				{ type: 'closeTag', offset: 166, tagName: 'b' },
				{ type: 'text',     offset: 170, text: ' ' },
				{ type: 'openTag',  offset: 171, tagName: 'b' },
				{ type: 'comment',  offset: 174 },
				{ type: 'text',     offset: 192, text: 'items' },
				{ type: 'closeTag', offset: 197, tagName: 'b' },
			] );
		} );
	} );


	// describe( 'HTML entity handling', function() {

	// 	it( "should *not* match the &amp; HTML entity, as this may be part of a query string", function() {
	// 		let nodes = parseHtmlAndCapture( 'Me&amp;You' );

	// 		expect( nodes.length ).toBe( 1 );
	// 		expectTextNode( nodes[ 0 ], 0, 'Me&amp;You' );
	// 	} );


	// 	it( "should properly parse a string that begins with an HTML entity node", function() {
	// 		let nodes = parseHtmlAndCapture( '&quot;Test' );

	// 		expect( nodes.length ).toBe( 2 );
	// 		expectEntityNode( nodes[ 0 ], 0, '&quot;' );
	// 		expectTextNode(   nodes[ 1 ], 6, 'Test' );
	// 	} );


	// 	it( "should properly parse a string that ends with an HTML entity node", function() {
	// 		let nodes = parseHtmlAndCapture( 'Test&quot;' );

	// 		expect( nodes.length ).toBe( 2 );
	// 		expectTextNode(   nodes[ 0 ], 0, 'Test' );
	// 		expectEntityNode( nodes[ 1 ], 4, '&quot;' );
	// 	} );


	// 	it( "should properly parse a string that begins and ends with an HTML entity node", function() {
	// 		let nodes = parseHtmlAndCapture( '&quot;Test&quot;' );

	// 		expect( nodes.length ).toBe( 3 );
	// 		expectEntityNode( nodes[ 0 ], 0,  '&quot;' );
	// 		expectTextNode(   nodes[ 1 ], 6,  'Test' );
	// 		expectEntityNode( nodes[ 2 ], 10, '&quot;' );
	// 	} );


	// 	it( "should properly parse a string that has an HTML entity node in the middle", function() {
	// 		let nodes = parseHtmlAndCapture( 'Test&quot;Test' );

	// 		expect( nodes.length ).toBe( 3 );
	// 		expectTextNode(   nodes[ 0 ], 0,  'Test' );
	// 		expectEntityNode( nodes[ 1 ], 4,  '&quot;' );
	// 		expectTextNode(   nodes[ 2 ], 10, 'Test' );
	// 	} );


	// 	it( "should properly parse a string that only has an HTML entity node", function() {
	// 		let nodes = parseHtmlAndCapture( '&quot;' );

	// 		expect( nodes.length ).toBe( 1 );
	// 		expectEntityNode( nodes[ 0 ], 0, '&quot;' );
	// 	} );

	// } );


	// describe( 'combination examples', function() {

	// 	it( "should properly create `HtmlNode` instances for each text/entity/comment/element node encountered, with the proper data filled in on each node", function() {
	// 		let inputStr = [
	// 			'&quot;Joe went to &quot;',
	// 			'<a href="google.com">ebay.com</a>&quot; ',
	// 			'today,&nbsp;and <!-- stuff -->bought <b>big</b> items&quot;'
	// 		].join( "" );

	// 		let nodes = parseHtmlAndCapture( inputStr );
	// 		expect( nodes.length ).toBe( 17 );

	// 		let i = -1;
	// 		expectEntityNode ( nodes[ ++i ], 0,   '&quot;' );
	// 		expectTextNode   ( nodes[ ++i ], 6,   'Joe went to ' );
	// 		expectEntityNode ( nodes[ ++i ], 18,  '&quot;' );
	// 		expectElementNode( nodes[ ++i ], 24,  '<a href="google.com">', 'a', false );
	// 		expectTextNode   ( nodes[ ++i ], 45,  'ebay.com' );
	// 		expectElementNode( nodes[ ++i ], 53,  '</a>', 'a', true );
	// 		expectEntityNode ( nodes[ ++i ], 57,  '&quot;' );
	// 		expectTextNode   ( nodes[ ++i ], 63,  ' today,' );
	// 		expectEntityNode ( nodes[ ++i ], 70,  '&nbsp;' );
	// 		expectTextNode   ( nodes[ ++i ], 76,  'and ' );
	// 		expectCommentNode( nodes[ ++i ], 80,  '<!-- stuff -->', 'stuff' );
	// 		expectTextNode   ( nodes[ ++i ], 94,  'bought ' );
	// 		expectElementNode( nodes[ ++i ], 101, '<b>', 'b', false );
	// 		expectTextNode   ( nodes[ ++i ], 104, 'big' );
	// 		expectElementNode( nodes[ ++i ], 107, '</b>', 'b', true );
	// 		expectTextNode   ( nodes[ ++i ], 111, ' items' );
	// 		expectEntityNode ( nodes[ ++i ], 117, '&quot;' );
	// 	} );


	// 	it( 'should match tags of both upper and lower case', function() {
	// 		let inputStr = [
	// 			'Joe <!DOCTYPE html><!-- Comment -->went <!doctype "blah" "blah blah"> ',
	// 			'to <a href="google.com">ebay.com</a> today,&nbsp;and <A href="purchase.com">purchased</A> ',
	// 			'<b>big</b> <B><!-- Comment 2 -->items</B>'
	// 		].join( '' );
	// 		let nodes = parseHtmlAndCapture( inputStr );

	// 		expect( nodes.length ).toBe( 24 );

	// 		let i = -1;
	// 		expectTextNode   ( nodes[ ++i ], 0,   'Joe ' );
	// 		expectElementNode( nodes[ ++i ], 4,   '<!DOCTYPE html>', '!doctype', false );
	// 		expectCommentNode( nodes[ ++i ], 19,  '<!-- Comment -->', 'Comment' );
	// 		expectTextNode   ( nodes[ ++i ], 35,  'went ' );
	// 		expectElementNode( nodes[ ++i ], 40,  '<!doctype "blah" "blah blah">', '!doctype', false );
	// 		expectTextNode   ( nodes[ ++i ], 69,  ' to ' );
	// 		expectElementNode( nodes[ ++i ], 73,  '<a href="google.com">', 'a', false );
	// 		expectTextNode   ( nodes[ ++i ], 94,  'ebay.com' );
	// 		expectElementNode( nodes[ ++i ], 102, '</a>', 'a', true );
	// 		expectTextNode   ( nodes[ ++i ], 106, ' today,' );
	// 		expectEntityNode ( nodes[ ++i ], 113, '&nbsp;' );
	// 		expectTextNode   ( nodes[ ++i ], 119, 'and ' );
	// 		expectElementNode( nodes[ ++i ], 123, '<A href="purchase.com">', 'a', false );
	// 		expectTextNode   ( nodes[ ++i ], 146, 'purchased' );
	// 		expectElementNode( nodes[ ++i ], 155, '</A>', 'a', true );
	// 		expectTextNode   ( nodes[ ++i ], 159, ' ' );
	// 		expectElementNode( nodes[ ++i ], 160, '<b>', 'b', false );
	// 		expectTextNode   ( nodes[ ++i ], 163, 'big' );
	// 		expectElementNode( nodes[ ++i ], 166, '</b>', 'b', true );
	// 		expectTextNode   ( nodes[ ++i ], 170, ' ' );
	// 		expectElementNode( nodes[ ++i ], 171, '<B>', 'b', false );
	// 		expectCommentNode( nodes[ ++i ], 174, '<!-- Comment 2 -->', 'Comment 2' );
	// 		expectTextNode   ( nodes[ ++i ], 192, 'items' );
	// 		expectElementNode( nodes[ ++i ], 197, '</B>', 'b', true );
	// 	} );

	// } );


	// it( "should not freeze up the regular expression engine when presented with the input string in issue #54", function() {
	// 	let inputStr = "Shai ist endlich in Deutschland! Und wir haben gute Nachrichten! <3 Alle, die den Shai-Rasierer kostenlos probieren, machen am Gewinnspiel eines Jahresvorrates Klingen mit. Den Rasierer bekommst Du kostenlos durch diesen Link: http://dorcoshai.de/pb1205ro, und dann machst Du am Gewinnspiel mit! 'Gefallt mir' klicken, wenn Du gern einen Jahresvorrat Shai haben mochtest. (Y)",
	// 	    nodes = parseHtmlAndCapture( inputStr );

	// 	expect( nodes.length ).toBe( 1 );
	// 	expectTextNode( nodes[ 0 ], 0, inputStr );
	// } );


	// it( "should not freeze up the regular expression engine when presented with the input string in issue #172", function() {
	// 	let inputStr = '<Office%20days:%20Tue.%20&%20Wed.%20(till%2015:30%20hr),%20Thu.%20(till%2017',//:30%20hr),%20Fri.%20(till%2012:30%20hr).%3c/a%3e%3cbr%3e%3c/td%3e%3ctd%20style=>',
	// 	    nodes = parseHtmlAndCapture( inputStr );

	// 	expect( nodes.length ).toBe( 1 );
	// 	expectTextNode( nodes[ 0 ], 0, inputStr );
	// } );

	// it( "should not freeze up the regular expression engine when presented with the input string in issue #204", function() {
	// 	var inputStr = '<img src="http://example.com/Foo" border-radius:2px;moz-border-radius:2px;khtml-border-radius:2px;o-border-radius:2px;webkit-border-radius:2px;ms-border-radius:="" 2px; "=" " class=" ">',
	// 	    nodes = parseHtmlAndCapture( inputStr );

	// 	expect( nodes.length ).toBe( 1 );
	// 	expectTextNode( nodes[ 0 ], 0, inputStr );
	// } );

} );




interface OpenTagNode {
	type: 'openTag';
	tagName: string;
	offset: number;
}

interface CloseTagNode {
	type: 'closeTag';
	tagName: string;
	offset: number;
}

interface TextNode {
	type: 'text',
	text: string;
	offset: number;
}

interface CommentNode {
	type: 'comment',
	offset: number;
}

interface DoctypeNode {
	type: 'doctype',
	offset: number;
}

type HtmlNode = OpenTagNode | CloseTagNode | TextNode | CommentNode | DoctypeNode;