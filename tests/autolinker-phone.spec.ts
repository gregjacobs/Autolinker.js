import _ from 'lodash';
import Autolinker from '../src/autolinker';

describe( "Autolinker Phone Number Matching -", () => {
	const autolinker = new Autolinker( { newWindow: false } );  // so that target="_blank" is not added to resulting autolinked URLs

	it( "should automatically link an in-country phone number", function() {
		expect( autolinker.link( "(555)666-7777" ) ).toBe( '<a href="tel:5556667777">(555)666-7777</a>' );
		expect( autolinker.link( "(555) 666-7777" ) ).toBe( '<a href="tel:5556667777">(555) 666-7777</a>' );
		expect( autolinker.link( "555-666-7777" ) ).toBe( '<a href="tel:5556667777">555-666-7777</a>' );
		expect( autolinker.link( "555 666 7777" ) ).toBe( '<a href="tel:5556667777">555 666 7777</a>' );
		expect( autolinker.link( "555.666.7777" ) ).toBe( '<a href="tel:5556667777">555.666.7777</a>' );
	} );


	it( "should automatically link an international phone number", function() {
		expect( autolinker.link( "+1-541-754-3010" ) ).toBe(  '<a href="tel:+15417543010">+1-541-754-3010</a>' );
		expect( autolinker.link( "1-541-754-3010" ) ).toBe(   '<a href="tel:15417543010">1-541-754-3010</a>' );
		expect( autolinker.link( "1 (541) 754-3010" ) ).toBe( '<a href="tel:15417543010">1 (541) 754-3010</a>' );
		expect( autolinker.link( "1.541.754.3010" ) ).toBe(   '<a href="tel:15417543010">1.541.754.3010</a>' );
		expect( autolinker.link( "+43 5 1766 1000" ) ).toBe(  '<a href="tel:+43517661000">+43 5 1766 1000</a>' );
		expect( autolinker.link( "+381 38 502 456" ) ).toBe(   '<a href="tel:+38138502456">+381 38 502 456</a>' );
		expect( autolinker.link( "+38755233976" ) ).toBe( '<a href="tel:+38755233976">+38755233976</a>' );
		expect( autolinker.link( "+852 2846 6433" ) ).toBe(   '<a href="tel:+85228466433">+852 2846 6433</a>' );
	} );


	it( "should automatically link a phone number that is completely surrounded by parenthesis", function() {
		let result = autolinker.link( "((555) 666-7777)" );
		expect( result ).toBe( '(<a href="tel:5556667777">(555) 666-7777</a>)' );
	} );


	it( "should automatically link a phone number contained in a larger string", function() {
		let result = autolinker.link( "Here's my number: (555)666-7777, so call me maybe?" );
		expect( result ).toBe( 'Here\'s my number: <a href=\"tel:5556667777\">(555)666-7777</a>, so call me maybe?' );
	} );


	it( "should automatically link a phone number surrounded by parenthesis contained in a larger string", function() {
		let result = autolinker.link( "Here's my number ((555)666-7777), so call me maybe?" );
		expect( result ).toBe( 'Here\'s my number (<a href=\"tel:5556667777\">(555)666-7777</a>), so call me maybe?' );
	} );


	it( "should NOT automatically link a phone number when there are no delimiters, since we don't know for sure if this is a phone number or some other number", function() {
		expect( autolinker.link( "5556667777" ) ).toBe( '5556667777' );
		expect( autolinker.link( "15417543010" ) ).toBe( '15417543010' );
	} );

	it( "should NOT automatically link numbers when there are non-space empty characters (such as newlines) in between", function() {
		expect( autolinker.link( "555 666  7777" ) ).toBe( '555 666  7777' );
		expect( autolinker.link( "555	666 7777" ) ).toBe( '555	666 7777' );
		expect( autolinker.link( "555\n666 7777" ) ).toBe( '555\n666 7777' );
	} );


	it( "should automatically link numbers when there are extensions with ,<numbers>#", function() {
		expect( autolinker.link( "555 666 7777,234523#,23453#" ) ).toBe( '<a href="tel:5556667777,234523#,23453#">555 666 7777,234523#,23453#</a>' );
		expect( autolinker.link( "1-555-666-7777,234523#" ) ).toBe( '<a href="tel:15556667777,234523#">1-555-666-7777,234523#</a>' );
		expect( autolinker.link( "+1-555-666-7777,234523#" ) ).toBe( '<a href="tel:+15556667777,234523#">+1-555-666-7777,234523#</a>' );
		expect( autolinker.link( "+1-555-666-7777,234523,233" ) ).toBe( '<a href="tel:+15556667777,234523,233">+1-555-666-7777,234523,233</a>' );
		expect( autolinker.link( "+22016350659,;,55#;;234   ,  3334443323" ) ).toBe( '<a href="tel:+22016350659,;,55#;;234">+22016350659,;,55#;;234</a>   ,  3334443323' );
	} );

	
	it( "should NOT automatically link numbers when there are extensions with ,<numbers># followed by a number", function() {
		expect( autolinker.link( "+1-555-666-7777,234523#233" ) ).toBe( '+1-555-666-7777,234523#233' );
		expect( autolinker.link( "+1-555-666-7777,234523#abc" ) ).toBe( '<a href="tel:+15556667777,234523#">+1-555-666-7777,234523#</a>abc' );
		expect( autolinker.link( "+1-555-666-7777,234523#,234523#abc" ) ).toBe( '<a href="tel:+15556667777,234523#,234523#">+1-555-666-7777,234523#,234523#</a>abc' );
	} );

} );
