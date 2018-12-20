/*global Autolinker, _, describe, beforeEach, afterEach, it, expect, jasmine */
describe( "Autolinker.matcher.Url", function() {
	var MatchChecker = Autolinker.match.MatchChecker,
	    matcher;

	beforeEach( function() {
		matcher = new Autolinker.matcher.Url( {
			tagBuilder  : new Autolinker.AnchorTagBuilder(),
			stripPrefix : false,
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


		it( 'should return an array of a single url match when the string is the url itself', function() {
			var matches = matcher.parseMatches( 'asdf.com' );

			expect( matches.length ).toBe( 1 );
			MatchChecker.expectUrlMatch( matches[ 0 ], 'http://asdf.com', 0 );
		} );


		it( 'should return an array of a single url match when the url is in the middle of the string', function() {
			var matches = matcher.parseMatches( 'Hello asdf.com my good friend' );

			expect( matches.length ).toBe( 1 );
			MatchChecker.expectUrlMatch( matches[ 0 ], 'http://asdf.com', 6 );
		} );


		it( 'should return an array of a single url match when the url is at the end of the string', function() {
			var matches = matcher.parseMatches( 'Hello asdf.com' );

			expect( matches.length ).toBe( 1 );
			MatchChecker.expectUrlMatch( matches[ 0 ], 'http://asdf.com', 6 );
		} );


		it( 'should return an array of multiple urls when there are more than one within the string', function() {
			var matches = matcher.parseMatches( 'Go to asdf.com or fdsa.com' );

			expect( matches.length ).toBe( 2 );
			MatchChecker.expectUrlMatch( matches[ 0 ], 'http://asdf.com', 6 );
			MatchChecker.expectUrlMatch( matches[ 1 ], 'http://fdsa.com', 18 );
		} );


		it( 'a match within parenthesis should be parsed correctly', function() {
			var matches = matcher.parseMatches( 'Hello (asdf.com)' );

			expect( matches.length ).toBe( 1 );
			MatchChecker.expectUrlMatch( matches[ 0 ], 'http://asdf.com', 7 );
		} );

		it( 'should match an IP address', function() {
			var matches = matcher.parseMatches( 'http://127.0.0.1');

			expect( matches.length ).toBe( 1 );
			MatchChecker.expectUrlMatch( matches[ 0 ], 'http://127.0.0.1', 0 );
		});

		it( 'should not match an invalid IP address', function() {
			var matches = matcher.parseMatches( 'http://127.0.0.');

			expect( matches.length ).toBe( 0 );
		});

		it( 'should not match an URL which does not respect the IP protocol', function() {
			var matches = matcher.parseMatches( 'git:1.0');

			expect( matches.length ).toBe( 0 );
		});

		it( 'should not match an IP address with too much numbers', function() {
			var matches = matcher.parseMatches( 'http://1.2.3.4.5' );

			expect( matches.length ).toBe( 0 );
		});

		it( 'should match the entire URL with a check character', function() {
			var matches = matcher.parseMatches( 'https://gitlab.example.com/search?utf8=✓&search=mysearch&group_id=&project_id=42&search_code=true&repository_ref=master' );

			expect( matches.length ).toBe( 1 );
			MatchChecker.expectUrlMatch( matches[ 0 ], 'https://gitlab.example.com/search?utf8=✓&search=mysearch&group_id=&project_id=42&search_code=true&repository_ref=master', 0 );
		});


		it( 'should match any local URL with numbers with http:// before', function() {
			var matches = matcher.parseMatches( 'http://localhost.local001/test' );
			var othermatches = matcher.parseMatches( 'http://suus111.w10:8090/display/test/AI' );

			expect( matches.length ).toBe( 1 );
			expect( othermatches.length ).toBe( 1 );
			MatchChecker.expectUrlMatch( matches[ 0 ], 'http://localhost.local001/test', 0 );
			MatchChecker.expectUrlMatch( othermatches[ 0 ], 'http://suus111.w10:8090/display/test/AI', 0 );
		});


		it( 'should not match a local URL with numbers that does not have the http:// before', function() {
			var matches = matcher.parseMatches( 'localhost.local001/test' );

			expect( matches.length ).toBe( 0 );
		});


		it( 'should not match an address with multiple dots in domain name', function() {
			var matches = matcher.parseMatches( 'hello:...world' );
			var othermatches = matcher.parseMatches( 'hello:wo.....rld' );

			expect( matches.length ).toBe( 0 );
			expect( othermatches.length ).toBe( 0 );
		});

		it( 'should match an address with multiple dots in path string', function() {
			var matches = matcher.parseMatches( 'https://gitlab.example.com/space/repo/compare/master...develop' );
			var othermatches = matcher.parseMatches( 'https://www.google.it/search?q=autolink.js&oq=autolink.js&aqs=chrome..69i57j0l4.5161j0j7&sourceid=chrome&ie=UTF-8' );

			expect( matches.length ).toBe( 1 );
			expect( othermatches.length ).toBe( 1 );
		});

		describe( 'protocol-relative URLs', function() {

			it( 'should match a protocol-relative URL at the beginning of the string', function() {
				var matches = matcher.parseMatches( '//asdf.com' );

				expect( matches.length ).toBe( 1 );
				MatchChecker.expectUrlMatch( matches[ 0 ], '//asdf.com', 0 );
			} );


			it( 'should match a protocol-relative URL in the middle of the string', function() {
				var matches = matcher.parseMatches( 'Hello //asdf.com today' );

				expect( matches.length ).toBe( 1 );
				MatchChecker.expectUrlMatch( matches[ 0 ], '//asdf.com', 6 );
			} );


			it( 'should match a protocol-relative URL at the end of the string', function() {
				var matches = matcher.parseMatches( 'Hello //asdf.com' );

				expect( matches.length ).toBe( 1 );
				MatchChecker.expectUrlMatch( matches[ 0 ], '//asdf.com', 6 );
			} );


			it( 'should *not* match a protocol-relative URL if the "//" was in the middle of a word', function() {
				var matches = matcher.parseMatches( 'asdf//asdf.com' );

				expect( matches.length ).toBe( 0 );
			} );

			it( 'should parse long contiguous characters with no spaces in a timely manner', function() {
				const start = Date.now();
				matcher.parseMatches( new Array(10000).join('a') );
				expect( Date.now() - start ).toBeLessThan( 100 );
			} );

		} );

	} );

} );
