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


		it( `should handle html tags with unqouted attributes`, () => {
			let nodes = parseHtmlAndCapture( `<div id=hi class=some-class align=center>Test</div>` );
			
			expect( nodes ).toEqual( [
				{ type: 'openTag', tagName: 'div', offset: 0 },
				{ type: 'text', text: 'Test', offset: 41 },
				{ type: 'closeTag', tagName: 'div', offset: 45 }
			] );
		} );


		it( `should handle anchor tags with unqouted href's and query strings (Issue #263)`, () => {
			let nodes = parseHtmlAndCapture( `<a href=https://www.facebook.com/hashtag/muntcentrum?epa=HASHTAG>#Muntcentrum</a>` );
			
			expect( nodes ).toEqual( [
				{ type: 'openTag', tagName: 'a', offset: 0 },
				{ type: 'text', text: '#Muntcentrum', offset: 65 },
				{ type: 'closeTag', tagName: 'a', offset: 77 }
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


		it( `should properly handle xml namespaced elements`, () => {
			let nodes = parseHtmlAndCapture( '<ns:p>Go to google.com or <a data-qux-="test" href="http://www.example.com">Bar</a> Baz</ns:p>' );

			expect( nodes ).toEqual( [
				{ type: 'openTag', tagName: 'ns:p', offset: 0 },
				{ type: 'text', text: 'Go to google.com or ', offset: 6 },
				{ type: 'openTag', tagName: 'a', offset: 26 },
				{ type: 'text', text: 'Bar', offset: 76 },
				{ type: 'closeTag', tagName: 'a', offset: 79 },
				{ type: 'text', text: ' Baz', offset: 83 },
				{ type: 'closeTag', tagName: 'ns:p', offset: 87 }
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

		it( 'should match multiple tags of both upper and lower case with comments and doctype', function() {
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


	describe( 'Time Complexity - ', () => {

		it( `should not freeze up the regular expression engine when presented with
			the input string in issue #54 
			
			(Note: this is an old test that came from the days before the HTML 
			parser was converted from a RegExp to the current state machine parser)`, 
		() => {
			let inputStr = "Shai ist endlich in Deutschland! Und wir haben gute Nachrichten! <3 Alle, die den Shai-Rasierer kostenlos probieren, machen am Gewinnspiel eines Jahresvorrates Klingen mit. Den Rasierer bekommst Du kostenlos durch diesen Link: http://dorcoshai.de/pb1205ro, und dann machst Du am Gewinnspiel mit! 'Gefallt mir' klicken, wenn Du gern einen Jahresvorrat Shai haben mochtest. (Y)",
				nodes = parseHtmlAndCapture( inputStr );

			expect( nodes ).toEqual( [
				{ type: 'text', offset: 0, text: inputStr }
			] );
		} );


		it( `should not freeze up the regular expression engine when presented 
			 with the input string in issue #172
			 
			 (Note: this is an old test that came from the days before the HTML 
			 parser was converted from a RegExp to the current state machine parser)`, 
		() => {
			let inputStr = '<Office%20days:%20Tue.%20&%20Wed.%20(till%2015:30%20hr),%20Thu.%20(till%2017',//:30%20hr),%20Fri.%20(till%2012:30%20hr).%3c/a%3e%3cbr%3e%3c/td%3e%3ctd%20style=>',
			    nodes = parseHtmlAndCapture( inputStr );

			expect( nodes ).toEqual( [
				{ type: 'text', offset: 0, text: inputStr }
			] );
		} );


		it( `should not freeze up the regular expression engine when presented 
			 with the input string in issue #204
			 
			 (Note: this is an old test that came from the days before the HTML 
			 parser was converted from a RegExp to the current state machine parser)`, 
		() => {
			var inputStr = '<img src="http://example.com/Foo" border-radius:2px;moz-border-radius:2px;khtml-border-radius:2px;o-border-radius:2px;webkit-border-radius:2px;ms-border-radius:="" 2px; "=" " class=" ">',
			    nodes = parseHtmlAndCapture( inputStr );

			expect( nodes ).toEqual( [
				{ type: 'text', offset: 0, text: inputStr }
			] );
		} );

	} );

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