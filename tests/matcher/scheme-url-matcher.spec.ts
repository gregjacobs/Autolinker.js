import { SchemeUrlMatcher } from "../../src/matcher/scheme-url-matcher";
import { MatchChecker } from "../match/match-checker";
import { AnchorTagBuilder } from "../../src/anchor-tag-builder";

fdescribe( "Autolinker.matcher.SchemeUrl", function() {
	let matcher: SchemeUrlMatcher;

	beforeEach( function() {
		matcher = new SchemeUrlMatcher( {
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


		it( `should match a simple http:// URL`, () => {
			let matches = matcher.parseMatches( 'Hello to http://google.com!');

			expect( matches.length ).toBe( 1 );
			MatchChecker.expectUrlMatch( matches[ 0 ], 'http://google.com', 9 );
		} );


		it( `should match a simple https:// URL`, () => {
			let matches = matcher.parseMatches( 'Hello to https://google.com!');

			expect( matches.length ).toBe( 1 );
			MatchChecker.expectUrlMatch( matches[ 0 ], 'https://google.com', 9 );
		} );


		it( `should match a simple ftp:// URL`, () => {
			let matches = matcher.parseMatches( 'Hello to ftp://google.com!');

			expect( matches.length ).toBe( 1 );
			MatchChecker.expectUrlMatch( matches[ 0 ], 'ftp://google.com', 9 );
		} );


		describe( 'scheme matching', () => {

			it( `should match a scheme with '+', '-', or '.' characters`, () => {

			} );


			it( `should match a scheme with '+', '-', or '.' characters, but not 
			     if they are the first character`, 
			() => {

			} );

		} );


		it( 'should match a windows file URL', () => {
			// file:///c:/windows/system32
		} );

		it( 'should match a unix-like file URL', () => {
			// file:///var/something
		} );


		it( `should match an "IP Literal"`, () => {

		} );


		it( `when the authority part of the URI ends with a '-.' sequence, 
			 should not include the '-.' part in the URL`,
		() => {
			let matches = matcher.parseMatches( 'http://google.com-.');

			expect( matches.length ).toBe( 1 );
			MatchChecker.expectUrlMatch( matches[ 0 ], 'http://google.com', 0 );
		} );

		it( `when a username is given, should parse the URL with the hostname
			 afterwards`, 
		() => {

		} );


		it( `should match a host name that starts with a percent-encoded character`, () => {

		} );


		it( `should match a hostname that ends with a percent-encoded character`, () => {

		} );


		it( `should match a hostname that has multiple percent-encoded characters`, () => {

		} );


		it( `when a username and password is given, should parse the URL with
			 the hostname afterwards`,
		() => {

		} );


		it( `when the URL ends with a question mark, but that question mark is
			 the end of the sentence, the question mark should not be included
			 in the URL`,
		() => {
			const matches = matcher.parseMatches( 'http://google.com?' );

			expect( matches.length ).toBe( 1 );
			MatchChecker.expectUrlMatch( matches[ 0 ], 'http://google.com', 0 );
		} );


		it( 'should match an IP address', function() {
			let matches = matcher.parseMatches( 'http://127.0.0.1');

			expect( matches.length ).toBe( 1 );
			MatchChecker.expectUrlMatch( matches[ 0 ], 'http://127.0.0.1', 0 );
		});


		it( 'should not match an invalid IP address (an IP with not enough numbers)', function() {
			let matches = matcher.parseMatches( 'http://127.0.0.');

			expect( matches.length ).toBe( 0 );
		});

		it( 'should not match an URL which does not respect the IP protocol', function() {
			let matches = matcher.parseMatches( 'git:1.0');

			expect( matches.length ).toBe( 0 );
		});


		it( 'should not match an IP address with too many numbers', function() {
			let matches = matcher.parseMatches( 'http://1.2.3.4.5' );

			expect( matches.length ).toBe( 0 );
		});


		it( 'should match the entire URL with a check character', function() {
			let matches = matcher.parseMatches( 'https://gitlab.example.com/search?utf8=✓&search=mysearch&group_id=&project_id=42&search_code=true&repository_ref=master' );

			expect( matches.length ).toBe( 1 );
			MatchChecker.expectUrlMatch( matches[ 0 ], 'https://gitlab.example.com/search?utf8=✓&search=mysearch&group_id=&project_id=42&search_code=true&repository_ref=master', 0 );
		});


		it( 'should match any local URL with numbers with http:// before', function() {
			let matches = matcher.parseMatches( 'http://localhost.local001/test' );
			let othermatches = matcher.parseMatches( 'http://suus111.w10:8090/display/test/AI' );

			expect( matches.length ).toBe( 1 );
			expect( othermatches.length ).toBe( 1 );
			MatchChecker.expectUrlMatch( matches[ 0 ], 'http://localhost.local001/test', 0 );
			MatchChecker.expectUrlMatch( othermatches[ 0 ], 'http://suus111.w10:8090/display/test/AI', 0 );
		});


		it( 'should not match a local URL with numbers that does not have the http:// before', function() {
			let matches = matcher.parseMatches( 'localhost.local001/test' );

			expect( matches.length ).toBe( 0 );
		});


		it( 'should not match an address with multiple dots in domain name', function() {
			let matches = matcher.parseMatches( 'hello:...world' );
			let othermatches = matcher.parseMatches( 'hello:wo.....rld' );

			expect( matches.length ).toBe( 0 );
			expect( othermatches.length ).toBe( 0 );
		});


		it( 'should match an address with multiple dots in path string', function() {
			var matches = matcher.parseMatches( 'https://gitlab.example.com/space/repo/compare/master...develop' );
			var othermatches = matcher.parseMatches( 'https://www.google.it/search?q=autolink.js&oq=autolink.js&aqs=chrome..69i57j0l4.5161j0j7&sourceid=chrome&ie=UTF-8' );

			expect( matches.length ).toBe( 1 );
			expect( othermatches.length ).toBe( 1 );
		});


		it( 'should match katakana with dakuten characters (symbol with combining mark - two unicode characters)', function() {
			var matches = matcher.parseMatches( 'https://website.com/files/name-ボ.pdf' );

			expect( matches.length ).toBe( 1 );
			MatchChecker.expectUrlMatch( matches[ 0 ], 'https://website.com/files/name-ボ.pdf', 0 );
		} );

		it( 'should parse long contiguous characters with no spaces in a timely manner', function() {
			const start = Date.now();
			matcher.parseMatches( new Array(10000).join('a') );
			expect( Date.now() - start ).toBeLessThan( 100 );
		} );

	} );
	

} );