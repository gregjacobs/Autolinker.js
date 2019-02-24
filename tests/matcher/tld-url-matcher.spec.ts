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


	describe( 'parseMatches()', function() {

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
			MatchChecker.expectUrlMatch( matches[ 0 ], 'http://asdf---asdf.com', 0 );
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


		it( `should match a domain starting with a slash but not include 
			 the prefixed slash in the match`, 
		() => {
			let matches = matcher.parseMatches( '/asdf.com' );

			expect( matches.length ).toBe( 1 );
			MatchChecker.expectUrlMatch( matches[ 0 ], 'http://asdf.com', 1 );
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


		it( `when there is a short port number, should parse that as part of the match`, () => {
			let matches = matcher.parseMatches( 'google.com:80 is great stuff' );

			expect( matches.length ).toBe( 1 );
			MatchChecker.expectUrlMatch( matches[ 0 ], 'http://google.com:80', 0 );
		} );


		it( `when there is a long port number, should parse that as part of the match`, () => {
			let matches = matcher.parseMatches( 'google.com:8000 is great stuff' );

			expect( matches.length ).toBe( 1 );
			MatchChecker.expectUrlMatch( matches[ 0 ], 'http://google.com:8000', 0 );
		} );


		it( `when there is a port number followed by a period, should parse up
			 to the port number as part of the match`, 
		() => {
			let matches = matcher.parseMatches( 'google.com:8000.' );

			expect( matches.length ).toBe( 1 );
			MatchChecker.expectUrlMatch( matches[ 0 ], 'http://google.com:8000', 0 );
		} );


		it( `when a domain name is followed by a colon, and then some other text
			 other than a port number follows the colon, the domain name should
			 be matched`,
		() => {
			let matches = matcher.parseMatches( 'google.com: great stuff' );

			expect( matches.length ).toBe( 1 );
			MatchChecker.expectUrlMatch( matches[ 0 ], 'http://google.com', 0 );
		} );


		describe( 'path, query, and hash matching', () => {

			it( `should return a url match with a trailing slash as part of the 
				 url itself`, 
			() => {
				let matches = matcher.parseMatches( 'asdf.com/' );

				expect( matches.length ).toBe( 1 );
				MatchChecker.expectUrlMatch( matches[ 0 ], 'http://asdf.com/', 0 );
			} );


			it( `should return a url match with a trailing question mark *not* as 
				part of the URL itself`, 
			() => {
				let matches = matcher.parseMatches( 'asdf.com?' );

				expect( matches.length ).toBe( 1 );
				MatchChecker.expectUrlMatch( matches[ 0 ], 'http://asdf.com', 0 );
			} );


			it( `should return a url match with a trailing hash as part of the 
				 url itself`, 
			() => {
				let matches = matcher.parseMatches( 'asdf.com#' );

				expect( matches.length ).toBe( 1 );
				MatchChecker.expectUrlMatch( matches[ 0 ], 'http://asdf.com#', 0 );
			} );


			it( `should return a url match with a trailing slash after the port 
			     as part of the url itself`, 
			() => {
				let matches = matcher.parseMatches( 'asdf.com:8080/' );

				expect( matches.length ).toBe( 1 );
				MatchChecker.expectUrlMatch( matches[ 0 ], 'http://asdf.com:8080/', 0 );
			} );


			it( `should return a url match with a trailing question mark after
			     the port *not* as part of the URL itself`, 
			() => {
				let matches = matcher.parseMatches( 'asdf.com:8080?' );

				expect( matches.length ).toBe( 1 );
				MatchChecker.expectUrlMatch( matches[ 0 ], 'http://asdf.com:8080', 0 );
			} );


			it( `should return a url match with a trailing hash after the port 
			     as part of the url itself`, 
			() => {
				let matches = matcher.parseMatches( 'asdf.com:8080#' );

				expect( matches.length ).toBe( 1 );
				MatchChecker.expectUrlMatch( matches[ 0 ], 'http://asdf.com:8080#', 0 );
			} );


			it( 'should match the entire URL with a path directly after the domain name', function() {
				let matches = matcher.parseMatches( 'gitlab.example.com/path/to/file' );

				expect( matches.length ).toBe( 1 );
				MatchChecker.expectUrlMatch( matches[ 0 ], 'http://gitlab.example.com/path/to/file', 0 );
			});


			it( 'should match the entire URL with a query directly after the domain name', function() {
				let matches = matcher.parseMatches( 'gitlab.example.com?search=mysearch' );

				expect( matches.length ).toBe( 1 );
				MatchChecker.expectUrlMatch( matches[ 0 ], 'http://gitlab.example.com?search=mysearch', 0 );
			});


			it( 'should match the entire URL with a hash directly after the domain name', function() {
				let matches = matcher.parseMatches( 'gitlab.example.com#search=mysearch' );

				expect( matches.length ).toBe( 1 );
				MatchChecker.expectUrlMatch( matches[ 0 ], 'http://gitlab.example.com#search=mysearch', 0 );
			});


			it( 'should match the entire URL with a path and a hash directly after the domain name', function() {
				const matches1 = matcher.parseMatches( 'gitlab.example.com/path/to/file#somewhere' );

				expect( matches1.length ).toBe( 1 );
				MatchChecker.expectUrlMatch( matches1[ 0 ], 'http://gitlab.example.com/path/to/file#somewhere', 0 );
			} );


			it( 'should match the entire URL with a path and a hash directly after ' +
				'the domain name, with a slash ending the path', function() {
				const matches1 = matcher.parseMatches( 'gitlab.example.com/path/to/file/#somewhere' );

				expect( matches1.length ).toBe( 1 );
				MatchChecker.expectUrlMatch( matches1[ 0 ], 'http://gitlab.example.com/path/to/file/#somewhere', 0 );
			} );


			it( 'should match the entire URL with a query and a hash directly after the domain name', function() {
				let matches = matcher.parseMatches( 'gitlab.example.com?search=mysearch#somewhere' );

				expect( matches.length ).toBe( 1 );
				MatchChecker.expectUrlMatch( matches[ 0 ], 'http://gitlab.example.com?search=mysearch#somewhere', 0 );
			});


			it( 'should match the entire URL with a path, query, and hash', function() {
				let matches = matcher.parseMatches( 'gitlab.example.com/search?search=mysearch&group_id=&project_id=42&search_code=true&repository_ref=master' );

				expect( matches.length ).toBe( 1 );
				MatchChecker.expectUrlMatch( matches[ 0 ], 'http://gitlab.example.com/search?search=mysearch&group_id=&project_id=42&search_code=true&repository_ref=master', 0 );
			});

		} );


		it( 'should match the entire URL with a check character', function() {
			let matches = matcher.parseMatches( 'gitlab.example.com/search?utf8=✓&search=mysearch&group_id=&project_id=42&search_code=true&repository_ref=master' );

			expect( matches.length ).toBe( 1 );
			MatchChecker.expectUrlMatch( matches[ 0 ], 'http://gitlab.example.com/search?utf8=✓&search=mysearch&group_id=&project_id=42&search_code=true&repository_ref=master', 0 );
		});


		it( 'should not match a hostname that does not have a valid TLD', function() {
			const matches1 = matcher.parseMatches( 'localhost.c/test' );
			expect( matches1.length ).toBe( 0 );

			const matches2 = matcher.parseMatches( 'localhost.co/test' );
			expect( matches2.length ).toBe( 1 );
			MatchChecker.expectUrlMatch( matches2[ 0 ], 'http://localhost.co/test', 0 );

			const matches3 = matcher.parseMatches( 'localhost.comerific/test' );
			expect( matches3.length ).toBe( 0 );
		});


		it( 'should not match a local URL with numbers that does not have the http:// before', function() {
			let matches = matcher.parseMatches( 'localhost.local001/test' );

			expect( matches.length ).toBe( 0 );
		});


		it( 'should match an address with multiple dots in path string', function() {
			var matches = matcher.parseMatches( 'gitlab.example.com/space/repo/compare/master...develop' );
			expect( matches.length ).toBe( 1 );
			MatchChecker.expectUrlMatch( matches[ 0 ], 'http://gitlab.example.com/space/repo/compare/master...develop', 0 );

			var otherMatches = matcher.parseMatches( 'www.google.it/search?q=autolink.js&oq=autolink.js&aqs=chrome..69i57j0l4.5161j0j7&sourceid=chrome&ie=UTF-8' );
			expect( otherMatches.length ).toBe( 1 );
			MatchChecker.expectUrlMatch( otherMatches[ 0 ], 'http://www.google.it/search?q=autolink.js&oq=autolink.js&aqs=chrome..69i57j0l4.5161j0j7&sourceid=chrome&ie=UTF-8', 0 );
		});


		it( 'should match katakana with dakuten characters (symbol with combining mark - two unicode characters)', function() {
			var matches = matcher.parseMatches( 'website.com/files/name-ボ.pdf' );

			expect( matches.length ).toBe( 1 );
			MatchChecker.expectUrlMatch( matches[ 0 ], 'http://website.com/files/name-ボ.pdf', 0 );
		} );


		describe( 'protocol-relative URLs', function() {

			it( 'should match a protocol-relative URL at the beginning of the string', function() {
				let matches = matcher.parseMatches( '//asdf.com' );

				expect( matches.length ).toBe( 1 );
				MatchChecker.expectUrlMatch( matches[ 0 ], '//asdf.com', 0 );
			} );


			it( 'should match a protocol-relative URL in the middle of the string', function() {
				let matches = matcher.parseMatches( 'Hello //asdf.com today' );

				expect( matches.length ).toBe( 1 );
				MatchChecker.expectUrlMatch( matches[ 0 ], '//asdf.com', 6 );
			} );


			it( 'should match a protocol-relative URL at the end of the string', function() {
				let matches = matcher.parseMatches( 'Hello //asdf.com' );

				expect( matches.length ).toBe( 1 );
				MatchChecker.expectUrlMatch( matches[ 0 ], '//asdf.com', 6 );
			} );


			it( 'should *not* match a protocol-relative URL if the "//" was in the middle of a word', function() {
				let matches = matcher.parseMatches( 'asdf//asdf.com' );

				expect( matches.length ).toBe( 0 );
			} );


			it( 'should parse long contiguous characters with no spaces in a timely manner', function() {
				const start = Date.now();
				matcher.parseMatches( new Array( 10000 ).join( 'a' ) );
				expect( Date.now() - start ).toBeLessThan( 100 );
			} );

		} );

	} );

} );