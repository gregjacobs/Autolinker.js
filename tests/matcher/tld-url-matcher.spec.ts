import { TldUrlMatcher } from "../../src/matcher/tld-url-matcher";
import { MatchChecker } from "../match/match-checker";
import { AnchorTagBuilder } from "../../src/anchor-tag-builder";

describe( "Autolinker.matcher.TldUrl", function() {
	let matcher: TldUrlMatcher;

	beforeEach( function() {
		matcher = new TldUrlMatcher( {
			tagBuilder  : new AnchorTagBuilder(),
			stripPrefix : { scheme: false, www: false },
			stripTrailingSlash : false,
			decodePercentEncoding: false
		} );
	} );


	fdescribe( 'parseMatches()', function() {

		it( 'should return an empty array if there are no matches for urls', function() {
			expect( matcher.parseMatches( '' ) ).toEqual( [] );
			expect( matcher.parseMatches( 'asdf' ) ).toEqual( [] );
			expect( matcher.parseMatches( '@asdf.com' ) ).toEqual( [] );      // a username should not match
			expect( matcher.parseMatches( 'asdf@asdf.com' ) ).toEqual( [] );  // an email address should not match
		} );


		it( `should not match a string that is just '.com'`, () => {
			let matches = matcher.parseMatches( '.com' );

			expect( matches.length ).toBe( 0 );
		} );


		it( 'should return a single url match when the string is the url itself', function() {
			let matches = matcher.parseMatches( 'asdf.com' );

			expect( matches.length ).toBe( 1 );
			MatchChecker.expectUrlMatch( matches[ 0 ], 'http://asdf.com', 0 );
		} );


		it( 'should return a single url match when the url is at the beginning of the string', function() {
			let matches = matcher.parseMatches( 'asdf.com is my favorite website' );

			expect( matches.length ).toBe( 1 );
			MatchChecker.expectUrlMatch( matches[ 0 ], 'http://asdf.com', 0 );
		} );


		it( 'should return a single url match when the url is in the middle of the string', function() {
			let matches = matcher.parseMatches( 'Hello asdf.com my good friend' );

			expect( matches.length ).toBe( 1 );
			MatchChecker.expectUrlMatch( matches[ 0 ], 'http://asdf.com', 6 );
		} );


		it( 'should return a single url match when the url is at the end of the string', function() {
			let matches = matcher.parseMatches( 'Hello asdf.com' );

			expect( matches.length ).toBe( 1 );
			MatchChecker.expectUrlMatch( matches[ 0 ], 'http://asdf.com', 6 );
		} );


		it( 'should return multiple urls when there are more than one within the string', function() {
			let matches = matcher.parseMatches( 'Go to asdf.com or fdsa.com and stuff' );

			expect( matches.length ).toBe( 2 );
			MatchChecker.expectUrlMatch( matches[ 0 ], 'http://asdf.com', 6 );
			MatchChecker.expectUrlMatch( matches[ 1 ], 'http://fdsa.com', 18 );
		} );


		it( 'a match within parenthesis should be parsed correctly', function() {
			let matches = matcher.parseMatches( 'Hello (asdf.com)' );

			expect( matches.length ).toBe( 1 );
			MatchChecker.expectUrlMatch( matches[ 0 ], 'http://asdf.com', 7 );
		} );


		it( `should match a domain with '-' or '.' characters`, () => {
			let matches = matcher.parseMatches( 'asdf---asdf.com' );

			expect( matches.length ).toBe( 1 );
			MatchChecker.expectUrlMatch( matches[ 0 ], 'http://asdf--asdf.com', 0 );
		} );


		it( `should NOT match a domain with subsequent '.' characters`, () => {
			let matches = matcher.parseMatches( 'asdf..com' );

			expect( matches.length ).toBe( 0 );
		} );


		it( `should match a domain with multiple subsequent hyphens`, () => {
			let matches = matcher.parseMatches( 'asdf--asdf.com' );

			expect( matches.length ).toBe( 1 );
			MatchChecker.expectUrlMatch( matches[ 0 ], 'http://asdf--asdf.com', 0 );
		} );


		it( `should match a domain starting with a hyphen but not include 
				the prefixed hypen in the match`, 
		() => {
			let matches = matcher.parseMatches( '-asdf.com' );

			expect( matches.length ).toBe( 1 );
			MatchChecker.expectUrlMatch( matches[ 0 ], 'http://asdf.com', 1 );
		} );


		it( `when the domain label has a '-.' sequence, should not match
				that domain`, 
		() => {
			expect( matcher.parseMatches( 'asdf-.com' ) ).toEqual( [] );
		} );


		it( `when the domain label has a '-.' sequence at the very end, and
				the domain read before the '-' char is a valid domain, should 
				match that domain`, 
		() => {
			let matches = matcher.parseMatches( 'asdf.com-. Stuff' );

			expect( matches.length ).toBe( 1 );
			MatchChecker.expectUrlMatch( matches[ 0 ], 'http://asdf.com', 0 );
		} );


		it( `when there are two separate domains separated by a '+', they 
				should both be matched (this was the original behavior in
				Autolinker.js v2.x, before the conversion from RegExp to state
				machine)`,
		() => {
			let matches = matcher.parseMatches( 'google.com+yahoo.com' );

			expect( matches.length ).toBe( 2 );
			MatchChecker.expectUrlMatch( matches[ 0 ], 'http://google.com', 0 );
			MatchChecker.expectUrlMatch( matches[ 1 ], 'http://yahoo.com', 11 );
		} );


		it( `when there is a string such as "asdf-+asdf.com", should match
				the "asdf.com" part (this was the original behavior in
				Autolinker.js v2.x, before the conversion from RegExp to state
				machine)`,
		() => {
			let matches = matcher.parseMatches( 'google.com+yahoo.com' );

			expect( matches.length ).toBe( 2 );
			MatchChecker.expectUrlMatch( matches[ 0 ], 'http://google.com', 0 );
			MatchChecker.expectUrlMatch( matches[ 1 ], 'http://yahoo.com', 11 );
		} );


		it( `when a domain name is followed by a colon, and then some other text
			 other than a port number follows the colon, the domain name should
			 be matched`,
		() => {
			let matches = matcher.parseMatches( 'google.com: great stuff' );

			expect( matches.length ).toBe( 2 );
			MatchChecker.expectUrlMatch( matches[ 0 ], 'http://google.com', 0 );
		} );


		// it( 'should match an IP address', function() {
		// 	let matches = matcher.parseMatches( 'http://127.0.0.1');

		// 	expect( matches.length ).toBe( 1 );
		// 	MatchChecker.expectUrlMatch( matches[ 0 ], 'http://127.0.0.1', 0 );
		// });

		// it( 'should not match an invalid IP address', function() {
		// 	let matches = matcher.parseMatches( 'http://127.0.0.');

		// 	expect( matches.length ).toBe( 0 );
		// });

		// it( 'should not match an URL which does not respect the IP protocol', function() {
		// 	let matches = matcher.parseMatches( 'git:1.0');

		// 	expect( matches.length ).toBe( 0 );
		// });

		// it( 'should not match an IP address with too many numbers', function() {
		// 	let matches = matcher.parseMatches( 'http://1.2.3.4.5' );

		// 	expect( matches.length ).toBe( 0 );
		// });


		// it( 'should match the entire URL with a check character', function() {
		// 	let matches = matcher.parseMatches( 'https://gitlab.example.com/search?utf8=✓&search=mysearch&group_id=&project_id=42&search_code=true&repository_ref=master' );

		// 	expect( matches.length ).toBe( 1 );
		// 	MatchChecker.expectUrlMatch( matches[ 0 ], 'https://gitlab.example.com/search?utf8=✓&search=mysearch&group_id=&project_id=42&search_code=true&repository_ref=master', 0 );
		// });


		// it( 'should match any local URL with numbers with http:// before', function() {
		// 	let matches = matcher.parseMatches( 'http://localhost.local001/test' );
		// 	let othermatches = matcher.parseMatches( 'http://suus111.w10:8090/display/test/AI' );

		// 	expect( matches.length ).toBe( 1 );
		// 	expect( othermatches.length ).toBe( 1 );
		// 	MatchChecker.expectUrlMatch( matches[ 0 ], 'http://localhost.local001/test', 0 );
		// 	MatchChecker.expectUrlMatch( othermatches[ 0 ], 'http://suus111.w10:8090/display/test/AI', 0 );
		// });


		// it( 'should not match a local URL with numbers that does not have the http:// before', function() {
		// 	let matches = matcher.parseMatches( 'localhost.local001/test' );

		// 	expect( matches.length ).toBe( 0 );
		// });


		// it( 'should not match an address with multiple dots in domain name', function() {
		// 	let matches = matcher.parseMatches( 'hello:...world' );
		// 	let othermatches = matcher.parseMatches( 'hello:wo.....rld' );

		// 	expect( matches.length ).toBe( 0 );
		// 	expect( othermatches.length ).toBe( 0 );
		// });


		// it( 'should match an address with multiple dots in path string', function() {
		// 	var matches = matcher.parseMatches( 'https://gitlab.example.com/space/repo/compare/master...develop' );
		// 	var othermatches = matcher.parseMatches( 'https://www.google.it/search?q=autolink.js&oq=autolink.js&aqs=chrome..69i57j0l4.5161j0j7&sourceid=chrome&ie=UTF-8' );

		// 	expect( matches.length ).toBe( 1 );
		// 	expect( othermatches.length ).toBe( 1 );
		// });


		// it( 'should match katakana with dakuten characters (symbol with combining mark - two unicode characters)', function() {
		// 	var matches = matcher.parseMatches( 'https://website.com/files/name-ボ.pdf' );

		// 	expect( matches.length ).toBe( 1 );
		// 	MatchChecker.expectUrlMatch( matches[ 0 ], 'https://website.com/files/name-ボ.pdf', 0 );
		// } );


		// describe( 'protocol-relative URLs', function() {

		// 	it( 'should match a protocol-relative URL at the beginning of the string', function() {
		// 		let matches = matcher.parseMatches( '//asdf.com' );

		// 		expect( matches.length ).toBe( 1 );
		// 		MatchChecker.expectUrlMatch( matches[ 0 ], '//asdf.com', 0 );
		// 	} );


		// 	it( 'should match a protocol-relative URL in the middle of the string', function() {
		// 		let matches = matcher.parseMatches( 'Hello //asdf.com today' );

		// 		expect( matches.length ).toBe( 1 );
		// 		MatchChecker.expectUrlMatch( matches[ 0 ], '//asdf.com', 6 );
		// 	} );


		// 	it( 'should match a protocol-relative URL at the end of the string', function() {
		// 		let matches = matcher.parseMatches( 'Hello //asdf.com' );

		// 		expect( matches.length ).toBe( 1 );
		// 		MatchChecker.expectUrlMatch( matches[ 0 ], '//asdf.com', 6 );
		// 	} );


		// 	it( 'should *not* match a protocol-relative URL if the "//" was in the middle of a word', function() {
		// 		let matches = matcher.parseMatches( 'asdf//asdf.com' );

		// 		expect( matches.length ).toBe( 0 );
		// 	} );

		// 	it( 'should parse long contiguous characters with no spaces in a timely manner', function() {
		// 		const start = Date.now();
		// 		matcher.parseMatches( new Array(10000).join('a') );
		// 		expect( Date.now() - start ).toBeLessThan( 100 );
		// 	} );

		// } );

	} );

} );