/*global Autolinker, _, jasmine, describe, beforeEach, afterEach, it, expect */
describe( "Autolinker", function() {

	describe( "instantiating and using as a class", function() {

		it( "should configure the instance with configuration options, and then be able to execute the link() method", function() {
			var autolinker = new Autolinker( { newWindow: false, truncate: 25 } );

			var result = autolinker.link( "Check out http://www.yahoo.com/some/long/path/to/a/file" );
			expect( result ).toBe( 'Check out <a href="http://www.yahoo.com/some/long/path/to/a/file" title="http://www.yahoo.com/some/long/path/to/a/file">yahoo.com/some/long/pa&hellip;</a>' );
		} );

	} );


	describe( "config checking", function() {

		describe( "no configs", function() {

			it( "should default to the default options if no `cfg` object is provided (namely, `newWindow: true`)", function() {
				expect( Autolinker.link( "Welcome to google.com" ) ).toBe( 'Welcome to <a href="http://google.com" target="_blank" rel="noopener noreferrer">google.com</a>' );
			} );

		} );

		describe( "`hashtag` cfg", function() {

			it( "should throw if `hashtag` is a value other than `false` or one of the valid service names", function() {
				expect( function() {
					new Autolinker( { hashtag: true } );  // `true` is an invalid value - must be a service name
				} ).toThrowError( "invalid `hashtag` cfg - see docs" );

				expect( function() {
					new Autolinker( { hashtag: 'non-existent-service' } );
				} ).toThrowError( "invalid `hashtag` cfg - see docs" );
			} );


			it( "should not throw for the valid service name 'twitter'", function() {
				expect( function() {
					new Autolinker( { hashtag: 'twitter' } );
				} ).not.toThrow();
			} );


			it( "should not throw for the valid service name 'facebook'", function() {
				expect( function() {
					new Autolinker( { hashtag: 'facebook' } );
				} ).not.toThrow();
			} );


			it( "should not throw for the valid service name 'instagram'", function() {
				expect( function() {
					new Autolinker( { hashtag: 'instagram' } );
				} ).not.toThrow();
			} );

		} );


		describe( '`mention` cfg', function() {

			it( "should throw if `mention` is a value other than `false` or one of the valid service names", function() {
				expect( function() {
					new Autolinker( { mention: true } );  // `true` is an invalid value - must be a service name
				} ).toThrowError( "invalid `mention` cfg - see docs" );

				expect( function() {
					new Autolinker( { mention: 'non-existent-service' } );
				} ).toThrowError( "invalid `mention` cfg - see docs" );
			} );


			it( "should not throw for the valid service name 'twitter'", function() {
				expect( function() {
					new Autolinker( { mention: 'twitter' } );
				} ).not.toThrow();
			} );


			it( "should not throw for the valid service name 'instagram'", function() {
				expect( function() {
					new Autolinker( { mention: 'instagram' } );
				} ).not.toThrow();
			} );

		} );

	} );


	describe( "link() method", function() {
		var autolinker,
		    twitterAutolinker;

		beforeEach( function() {
			autolinker = new Autolinker( { newWindow: false } );  // so that target="_blank" is not added to resulting autolinked URLs
			twitterAutolinker = new Autolinker( { mention: 'twitter', newWindow: false } );
		} );


		it( 'should return an empty string when provided `undefined` as its argument', function() {
			expect( autolinker.link( undefined ) ).toBe( '' );
		} );

		it( 'should return an empty string when provided `null` as its argument', function() {
			expect( autolinker.link( null ) ).toBe( '' );
		} );


		describe( "URL linking", function() {

			describe( "protocol-prefixed URLs (i.e. URLs starting with http:// or https://)", function() {

				it( "should automatically link URLs in the form of http://yahoo.com", function() {
					var result = autolinker.link( "Joe went to http://yahoo.com" );
					expect( result ).toBe( 'Joe went to <a href="http://yahoo.com">yahoo.com</a>' );
				} );


				it( "should automatically link localhost URLs when there is a protocol", function() {
					var result = autolinker.link( "Joe went to http://localhost today" );
					expect( result ).toBe( 'Joe went to <a href="http://localhost">localhost</a> today' );
				} );


				it( "should automatically link localhost URLs when there is a protocol and port", function() {
					var result = autolinker.link( "Joe went to http://localhost:8000 today" );
					expect( result ).toBe( 'Joe went to <a href="http://localhost:8000">localhost:8000</a> today' );
				} );


				it( "should automatically link localhost URLs when there is a protocol, port, and path", function() {
					var result = autolinker.link( "Joe went to http://localhost:8000/abc today" );
					expect( result ).toBe( 'Joe went to <a href="http://localhost:8000/abc">localhost:8000/abc</a> today' );
				} );


				it( "should automatically link localhost URLs when there is a protocol, port, and query string", function() {
					var result = autolinker.link( "Joe went to http://localhost:8000?abc today" );
					expect( result ).toBe( 'Joe went to <a href="http://localhost:8000?abc">localhost:8000?abc</a> today' );
				} );


				it( "should automatically link localhost URLs when there is a protocol, port, and hash", function() {
					var result = autolinker.link( "Joe went to http://localhost:8000#abc today" );
					expect( result ).toBe( 'Joe went to <a href="http://localhost:8000#abc">localhost:8000#abc</a> today' );
				} );


				it( "should not include [?!:,.;] chars if at the end of the URL", function() {
					var result1 = autolinker.link( "Joe went to http://localhost:8000? today" );
					expect( result1 ).toBe( 'Joe went to <a href="http://localhost:8000">localhost:8000</a>? today' );
					var result2 = autolinker.link( "Joe went to http://localhost:8000! today" );
					expect( result2 ).toBe( 'Joe went to <a href="http://localhost:8000">localhost:8000</a>! today' );
					var result3 = autolinker.link( "Joe went to http://localhost:8000: today" );
					expect( result3 ).toBe( 'Joe went to <a href="http://localhost:8000">localhost:8000</a>: today' );
					var result4 = autolinker.link( "Joe went to http://localhost:8000, today" );
					expect( result4 ).toBe( 'Joe went to <a href="http://localhost:8000">localhost:8000</a>, today' );
					var result5 = autolinker.link( "Joe went to http://localhost:8000. today" );
					expect( result5 ).toBe( 'Joe went to <a href="http://localhost:8000">localhost:8000</a>. today' );
					var result6 = autolinker.link( "Joe went to http://localhost:8000; today" );
					expect( result6 ).toBe( 'Joe went to <a href="http://localhost:8000">localhost:8000</a>; today' );
				} );


				it( "should exclude invalid chars after TLD", function() {
					var result1 = autolinker.link( "Joe went to http://www.yahoo.com's today" );
					expect( result1 ).toBe( 'Joe went to <a href="http://www.yahoo.com">yahoo.com</a>\'s today' );
					var result2 = autolinker.link( "Joe went to https://www.yahoo.com/foo's today" );
					expect( result2 ).toBe( 'Joe went to <a href="https://www.yahoo.com/foo\'s">yahoo.com/foo\'s</a> today' );
					var result3 = autolinker.link( "Joe went to http://www.yahoo.com's/foo today" );
					expect( result3 ).toBe( 'Joe went to <a href="http://www.yahoo.com">yahoo.com</a>\'s/foo today' );
				} );


				it( "should automatically link URLs in the form of http://www.yahoo.com (i.e. protocol and 'www' prefix)", function() {
					var result = autolinker.link( "Joe went to http://www.yahoo.com" );
					expect( result ).toBe( 'Joe went to <a href="http://www.yahoo.com">yahoo.com</a>' );
				} );


				it( "should automatically link https URLs in the form of https://yahoo.com", function() {
					var result = autolinker.link( "Joe went to https://www.yahoo.com" );
					expect( result ).toBe( 'Joe went to <a href="https://www.yahoo.com">yahoo.com</a>' );
				} );


				it( 'should automatically link URLs with IP addresses', function() {
					var result = autolinker.link( 'http://66.102.7.147' );
					expect( result ).toBe( '<a href="http://66.102.7.147">66.102.7.147</a>' );
				} );


				it( 'should automatically link URLs with IP addresses and a port number', function() {
					var result = autolinker.link( 'http://10.0.0.108:9000/' );
					expect( result ).toBe( '<a href="http://10.0.0.108:9000/">10.0.0.108:9000</a>' );
				} );


				it( "should automatically link capitalized URLs", function() {
					var result = autolinker.link( "Joe went to HTTP://WWW.YAHOO.COM" );
					expect( result ).toBe( 'Joe went to <a href="HTTP://WWW.YAHOO.COM">YAHOO.COM</a>' );
				} );


				it( "should automatically link 'yahoo.xyz' (a known TLD), but not 'sencha.etc' (an unknown TLD)", function() {
					var result = autolinker.link( "yahoo.xyz should be linked, sencha.etc should not", { newWindow: false } );
					expect( result ).toBe( '<a href="http://yahoo.xyz">yahoo.xyz</a> should be linked, sencha.etc should not' );
				} );


				it( "should automatically link 'a.museum' (a known TLD), but not 'abc.123'", function() {
					var result = autolinker.link( "a.museum should be linked, but abc.123 should not", { newWindow: false } );
					expect( result ).toBe( '<a href="http://a.museum">a.museum</a> should be linked, but abc.123 should not' );
				} );


				it( "should automatically link URLs in the form of 'http://yahoo.com.', without including the trailing period", function() {
					var result = autolinker.link( "Joe went to http://yahoo.com." );
					expect( result ).toBe( 'Joe went to <a href="http://yahoo.com">yahoo.com</a>.' );
				} );


				it( "should automatically link URLs with a port number", function() {
					var result = autolinker.link( "Joe went to http://yahoo.com:8000 today." );
					expect( result ).toBe( 'Joe went to <a href="http://yahoo.com:8000">yahoo.com:8000</a> today.' );
				} );


				it( "should automatically link URLs with a port number and a following slash", function() {
					var result = autolinker.link( "Joe went to http://yahoo.com:8000/ today." );
					expect( result ).toBe( 'Joe went to <a href="http://yahoo.com:8000/">yahoo.com:8000</a> today.' );
				} );


				it( "should automatically link URLs with a port number and a path", function() {
					var result = autolinker.link( "Joe went to http://yahoo.com:8000/mysite/page today." );
					expect( result ).toBe( 'Joe went to <a href="http://yahoo.com:8000/mysite/page">yahoo.com:8000/mysite/page</a> today.' );
				} );


				it( "should automatically link a localhost URL with a port number and a path", function() {
					var result = autolinker.link( "Joe went to http://localhost:8000/my-page today." );
					expect( result ).toBe( 'Joe went to <a href="http://localhost:8000/my-page">localhost:8000/my-page</a> today.' );
				} );


				it( "should automatically link URLs with a port number and a query string", function() {
					var result = autolinker.link( "Joe went to http://yahoo.com:8000?page=index today." );
					expect( result ).toBe( 'Joe went to <a href="http://yahoo.com:8000?page=index">yahoo.com:8000?page=index</a> today.' );
				} );


				it( "should automatically link a localhost URL with a port number and a query string", function() {
					var result = autolinker.link( "Joe went to http://localhost:8000?page=index today." );
					expect( result ).toBe( 'Joe went to <a href="http://localhost:8000?page=index">localhost:8000?page=index</a> today.' );
				} );


				it( "should automatically link URLs with a port number and a hash string", function() {
					var result = autolinker.link( "Joe went to http://yahoo.com:8000#page=index today." );
					expect( result ).toBe( 'Joe went to <a href="http://yahoo.com:8000#page=index">yahoo.com:8000#page=index</a> today.' );
				} );


				it( "should automatically link a localhost URL with a port number and a hash string", function() {
					var result = autolinker.link( "Joe went to http://localhost:8000#page=index today." );
					expect( result ).toBe( 'Joe went to <a href="http://localhost:8000#page=index">localhost:8000#page=index</a> today.' );
				} );

				it( "should automatically link domain names, paths, query strings, and hashes with numbers in them", function() {
					var result = autolinker.link( "Joe went to https://abc123def.org/path1/2path?param1=value1#hash123z" );
					expect( result ).toBe( 'Joe went to <a href="https://abc123def.org/path1/2path?param1=value1#hash123z">abc123def.org/path1/2path?param1=value1#hash123z</a>' );
				} );

				it( "should automatically link domain names, paths, query strings, and hashes with dashes in them", function() {
					var result = autolinker.link( "Joe went to https://abc-def.org/his-path/?the-param=the-value#the-hash" );
					expect( result ).toBe( 'Joe went to <a href="https://abc-def.org/his-path/?the-param=the-value#the-hash">abc-def.org/his-path/?the-param=the-value#the-hash</a>' );
				} );

				it( "should automatically link domain names, paths, query strings, and hashes with the set of allowed special characters in them", function() {
					var result = autolinker.link( "Link: https://abc123def.org/-+&@#/%=~_()|\'$*[]?!:,.;/?param1=value-+&@#/%=~_()|\'$*[]?!:,.;#hash-+&@#/%=~_()|\'$*[]?!:,.;z" );
					expect( result ).toBe( 'Link: <a href="https://abc123def.org/-+&@#/%=~_()|\'$*[]?!:,.;/?param1=value-+&@#/%=~_()|\'$*[]?!:,.;#hash-+&@#/%=~_()|\'$*[]?!:,.;z">abc123def.org/-+&@#/%=~_()|\'$*[]?!:,.;/?param1=value-+&@#/%=~_()|\'$*[]?!:,.;#hash-+&@#/%=~_()|\'$*[]?!:,.;z</a>' );
				} );

				it( "should automatically link a URL with accented characters", function() {
					var result = autolinker.link( "Joe went to http://mañana.com/mañana?mañana=1#mañana today." );
					expect( result ).toBe( 'Joe went to <a href="http://mañana.com/mañana?mañana=1#mañana">mañana.com/mañana?mañana=1#mañana</a> today.' );
				} );

				it( "should automatically link cyrillic URLs", function() {
					var result = autolinker.link( "Joe went to https://ru.wikipedia.org/wiki/Кириллица?Кириллица=1#Кириллица" );
					expect( result ).toBe( 'Joe went to <a href="https://ru.wikipedia.org/wiki/Кириллица?Кириллица=1#Кириллица">ru.wikipedia.org/wiki/Кириллица?Кириллица=1#Кириллица</a>' );
				} );

				it( "should automatically link international domain names", function() {
					var result1 = autolinker.link( "Русским гораздо проще набрать россия.рф на клавиатуре." );
					expect( result1 ).toBe( 'Русским гораздо проще набрать <a href="http://россия.рф">россия.рф</a> на клавиатуре.' );

					var result2 = autolinker.link( "Русским гораздо проще набрать http://россия.рф на клавиатуре." );
					expect( result2 ).toBe( 'Русским гораздо проще набрать <a href="http://россия.рф">россия.рф</a> на клавиатуре.' );

					var result3 = autolinker.link( "Русским гораздо проще набрать //россия.рф на клавиатуре." );
					expect( result3 ).toBe( 'Русским гораздо проще набрать <a href="//россия.рф">россия.рф</a> на клавиатуре.' );
				} );

				it( "should automatically link domain names represented in punicode", function() {
					var result1 = autolinker.link( "For compatibility reasons, xn--d1acufc.xn--p1ai is an acceptable form of an international domain." );
					expect( result1 ).toBe( 'For compatibility reasons, <a href="http://xn--d1acufc.xn--p1ai">xn--d1acufc.xn--p1ai</a> is an acceptable form of an international domain.' );

					var result2 = autolinker.link( "For compatibility reasons, http://xn--d1acufc.xn--p1ai is an acceptable form of an international domain." );
					expect( result2 ).toBe( 'For compatibility reasons, <a href="http://xn--d1acufc.xn--p1ai">xn--d1acufc.xn--p1ai</a> is an acceptable form of an international domain.' );
				} );

				it( 'should match local urls with numbers when prefixed with http://', function() {
					var result1 = autolinker.link( 'http://localhost.local001/test' );
					expect( result1 ).toBe( '<a href="http://localhost.local001/test">localhost.local001/test</a>' );

					var result2 = autolinker.link( 'http://suus111.w10:8090/display/test/AI' );
					expect( result2 ).toBe( '<a href="http://suus111.w10:8090/display/test/AI">suus111.w10:8090/display/test/AI</a>' );
				} );


				it( 'should not match local urls with numbers when NOT prefixed with http://', function() {
					var result1 = autolinker.link( 'localhost.local001/test' );
					expect( result1 ).toBe( 'localhost.local001/test' );

					var result2 = autolinker.link( 'suus111.w10:8090/display/test/AI' );
					expect( result2 ).toBe( 'suus111.w10:8090/display/test/AI' );
				} );


				it( 'should not match an address with multiple dots', function() {
					expect( autolinker.link( 'hello:...world' ) ).toBe( 'hello:...world' );
					expect( autolinker.link( 'hello:wo.....rld' ) ).toBe( 'hello:wo.....rld' );
				});

				describe( "protocol linking", function() {

					it( "should NOT include preceding ':' introductions without a space", function() {
						var result = autolinker.link( 'the link:http://example.com/' );
						expect( result ).toBe( 'the link:<a href="http://example.com/">example.com</a>' );
					} );


					it( "should autolink protocols with at least one character", function() {
						var result = autolinker.link( 'link this: g://example.com/' );
						expect( result ).toBe( 'link this: <a href="g://example.com/">g://example.com</a>' );
					} );


					it( "should autolink protocols with more than 9 characters (as was the previous upper bound, but it seems protocols may be longer)", function() {
						var result = autolinker.link( 'link this: opaquelocktoken://example' );
						expect( result ).toBe( 'link this: <a href="opaquelocktoken://example">opaquelocktoken://example</a>' );
					} );


					it( "should autolink protocols with digits, dashes, dots, and plus signs in their names", function() {
						var result1 = autolinker.link( 'link this: a1://example' );
						expect( result1 ).toBe( 'link this: <a href="a1://example">a1://example</a>' );

						var result2 = autolinker.link( 'link this: view-source://example' );
						expect( result2 ).toBe( 'link this: <a href="view-source://example">view-source://example</a>' );

						var result3 = autolinker.link( 'link this: iris.xpc://example' );
						expect( result3 ).toBe( 'link this: <a href="iris.xpc://example">iris.xpc://example</a>' );

						var result4 = autolinker.link( 'link this: test+protocol://example' );
						expect( result4 ).toBe( 'link this: <a href="test+protocol://example">test+protocol://example</a>' );

						// Test all allowed non-alpha chars
						var result5 = autolinker.link( 'link this: test+proto-col.123://example' );
						expect( result5 ).toBe( 'link this: <a href="test+proto-col.123://example">test+proto-col.123://example</a>' );
					} );


					it( "should NOT autolink protocols that start with a digit, dash, plus sign, or dot, as per http://tools.ietf.org/html/rfc3986#section-3.1", function() {
						var result = autolinker.link( 'do not link first char: 1a://example' );
						expect( result ).toBe( 'do not link first char: 1<a href="a://example">a://example</a>' );

						var result2 = autolinker.link( 'do not link first char: -a://example' );
						expect( result2 ).toBe( 'do not link first char: -<a href="a://example">a://example</a>' );

						var result3 = autolinker.link( 'do not link first char: +a://example' );
						expect( result3 ).toBe( 'do not link first char: +<a href="a://example">a://example</a>' );

						var result4 = autolinker.link( 'do not link first char: .a://example' );
						expect( result4 ).toBe( 'do not link first char: .<a href="a://example">a://example</a>' );

						var result5 = autolinker.link( 'do not link first char: .aa://example' );
						expect( result5 ).toBe( 'do not link first char: .<a href="aa://example">aa://example</a>' );
					} );


					it( "should NOT autolink possible URLs with the 'javascript:' URI scheme", function() {
						var result = autolinker.link( "do not link javascript:window.alert('hi') please" );
						expect( result ).toBe( "do not link javascript:window.alert('hi') please" );
					} );


					it( "should NOT autolink possible URLs with the 'javascript:' URI scheme, with different upper/lowercase letters in the uri scheme", function() {
						var result = autolinker.link( "do not link JavAscriPt:window.alert('hi') please" );
						expect( result ).toBe( "do not link JavAscriPt:window.alert('hi') please" );
					} );


					it( "should NOT autolink possible URLs with the 'vbscript:' URI scheme", function() {
						var result = autolinker.link( "do not link vbscript:window.alert('hi') please" );
						expect( result ).toBe( "do not link vbscript:window.alert('hi') please" );
					} );


					it( "should NOT autolink possible URLs with the 'vbscript:' URI scheme, with different upper/lowercase letters in the uri scheme", function() {
						var result = autolinker.link( "do not link vBsCriPt:window.alert('hi') please" );
						expect( result ).toBe( "do not link vBsCriPt:window.alert('hi') please" );
					} );


					it( "should NOT automatically link strings of the form 'git:d' (using the heuristic that the domain name does not have a '.' in it)", function() {
						var result = autolinker.link( 'Something like git:d should not be linked as a URL' );
						expect( result ).toBe( 'Something like git:d should not be linked as a URL' );
					} );


					it( "should NOT automatically link strings of the form 'git:domain' (using the heuristic that the domain name does not have a '.' in it)", function() {
						var result = autolinker.link( 'Something like git:domain should not be linked as a URL' );
						expect( result ).toBe( 'Something like git:domain should not be linked as a URL' );
					} );


					it( "should automatically link strings of the form 'git:domain.com', interpreting this as a protocol and domain name", function() {
						var result = autolinker.link( 'Something like git:domain.com should be linked as a URL' );
						expect( result ).toBe( 'Something like <a href="git:domain.com">git:domain.com</a> should be linked as a URL' );
					} );


					it( "should NOT automatically link a string in the form of 'version:1.0'", function() {
						var result = autolinker.link( 'version:1.0' );
						expect( result ).toBe( 'version:1.0' );
					} );


					it( "should NOT automatically link these 'abc:def' style strings", function() {
						var strings = [
							'BEGIN:VCALENDAR',
							'VERSION:1.0',
							'BEGIN:VEVENT',
							'DTSTART:20140401T090000',
							'DTEND:20140401T100000',
							'SUMMARY:Some thing to do',
							'LOCATION:',
							'DESCRIPTION:Just call this guy yeah! Testings',
							'PRIORITY:3',
							'END:VEVENT',
							'END:VCALENDAR',
							'START:123',
							'START:123:SOMETHING'
						];
						var i, len = strings.length, str;

						// Test with just the strings themselves.
						for( i = 0; i < len; i++ ) {
							str = strings[ i ];
							expect( autolinker.link( str ) ).toBe( str );  // none should be autolinked
						}

						// Test with the strings surrounded by other text
						for( i = 0; i < len; i++ ) {
							str = strings[ i ];
							expect( autolinker.link( 'test ' + str + ' test' ) ).toBe( 'test ' + str + ' test' );  // none should be autolinked
						}
					} );

				} );

			} );


			describe( "'www.' prefixed URLs", function() {

				it( "should automatically link URLs in the form of www.yahoo.com, prepending the http:// in this case", function() {
					var result = autolinker.link( "Joe went to www.yahoo.com" );
					expect( result ).toBe( 'Joe went to <a href="http://www.yahoo.com">yahoo.com</a>' );
				} );


				it( "should automatically link URLs in the form of 'www.yahoo.com.', without including the trailing period", function() {
					var result = autolinker.link( "Joe went to www.yahoo.com." );
					expect( result ).toBe( 'Joe went to <a href="http://www.yahoo.com">yahoo.com</a>.' );
				} );


				it( "should automatically link URLs in the form of 'www.yahoo.com:8000' (with a port number)", function() {
					var result = autolinker.link( "Joe went to www.yahoo.com:8000 today" );
					expect( result ).toBe( 'Joe went to <a href="http://www.yahoo.com:8000">yahoo.com:8000</a> today' );
				} );


				it( "should automatically link URLs in the form of 'www.yahoo.com:8000/abc' (with a port number and path)", function() {
					var result = autolinker.link( "Joe went to www.yahoo.com:8000/abc today" );
					expect( result ).toBe( 'Joe went to <a href="http://www.yahoo.com:8000/abc">yahoo.com:8000/abc</a> today' );
				} );


				it( "should automatically link URLs in the form of 'www.yahoo.com:8000?abc' (with a port number and query string)", function() {
					var result = autolinker.link( "Joe went to www.yahoo.com:8000?abc today" );
					expect( result ).toBe( 'Joe went to <a href="http://www.yahoo.com:8000?abc">yahoo.com:8000?abc</a> today' );
				} );


				it( "should automatically link URLs in the form of 'www.yahoo.com:8000#abc' (with a port number and hash)", function() {
					var result = autolinker.link( "Joe went to www.yahoo.com:8000#abc today" );
					expect( result ).toBe( 'Joe went to <a href="http://www.yahoo.com:8000#abc">yahoo.com:8000#abc</a> today' );
				} );


				it( "should automatically link capitalized URLs", function() {
					var result = autolinker.link( "Joe went to WWW.YAHOO.COM today" );
					expect( result ).toBe( 'Joe went to <a href="http://WWW.YAHOO.COM">YAHOO.COM</a> today' );
				} );


				it( "should not include [?!:,.;] chars if at the end of the URL", function() {
					var result1 = autolinker.link( "Joe went to www.yahoo.com? today" );
					expect( result1 ).toBe( 'Joe went to <a href="http://www.yahoo.com">yahoo.com</a>? today' );
					var result2 = autolinker.link( "Joe went to www.yahoo.com! today" );
					expect( result2 ).toBe( 'Joe went to <a href="http://www.yahoo.com">yahoo.com</a>! today' );
					var result3 = autolinker.link( "Joe went to www.yahoo.com: today" );
					expect( result3 ).toBe( 'Joe went to <a href="http://www.yahoo.com">yahoo.com</a>: today' );
					var result4 = autolinker.link( "Joe went to www.yahoo.com, today" );
					expect( result4 ).toBe( 'Joe went to <a href="http://www.yahoo.com">yahoo.com</a>, today' );
					var result5 = autolinker.link( "Joe went to www.yahoo.com. today" );
					expect( result5 ).toBe( 'Joe went to <a href="http://www.yahoo.com">yahoo.com</a>. today' );
					var result6 = autolinker.link( "Joe went to www.yahoo.com; today" );
					expect( result6 ).toBe( 'Joe went to <a href="http://www.yahoo.com">yahoo.com</a>; today' );
				} );


				it( "should exclude invalid chars after TLD", function() {
					var result1 = autolinker.link( "Joe went to www.yahoo.com's today" );
					expect( result1 ).toBe( 'Joe went to <a href="http://www.yahoo.com">yahoo.com</a>\'s today' );
					var result2 = autolinker.link( "Joe went to www.yahoo.com/foo's today" );
					expect( result2 ).toBe( 'Joe went to <a href="http://www.yahoo.com/foo\'s">yahoo.com/foo\'s</a> today' );
					var result3 = autolinker.link( "Joe went to www.yahoo.com's/foo today" );
					expect( result3 ).toBe( 'Joe went to <a href="http://www.yahoo.com">yahoo.com</a>\'s/foo today' );
				} );

				it( "should automatically link a URL with accented characters", function() {
					var result = autolinker.link( "Joe went to http://www.mañana.com today." );
					expect( result ).toBe( 'Joe went to <a href="http://www.mañana.com">mañana.com</a> today.' );
				} );

			} );


			describe( "URLs with no protocol prefix, and no 'www' (i.e. URLs with known TLDs)", function() {

				it( "should automatically link URLs in the form of yahoo.com, prepending the http:// in this case", function() {
					var result = autolinker.link( "Joe went to yahoo.com" );
					expect( result ).toBe( 'Joe went to <a href="http://yahoo.com">yahoo.com</a>' );
				} );


				it( "should automatically link URLs in the form of subdomain.yahoo.com", function() {
					var result = autolinker.link( "Joe went to subdomain.yahoo.com" );
					expect( result ).toBe( 'Joe went to <a href="http://subdomain.yahoo.com">subdomain.yahoo.com</a>' );
				} );


				it( "should automatically link URLs in the form of yahoo.co.uk, prepending the http:// in this case", function() {
					var result = autolinker.link( "Joe went to yahoo.co.uk" );
					expect( result ).toBe( 'Joe went to <a href="http://yahoo.co.uk">yahoo.co.uk</a>' );
				} );


				it( "should automatically link URLs in the form of yahoo.ru, prepending the http:// in this case", function() {
					var result = autolinker.link( "Joe went to yahoo.ru" );
					expect( result ).toBe( 'Joe went to <a href="http://yahoo.ru">yahoo.ru</a>' );
				} );


				it( "should automatically link URLs in the form of 'yahoo.com.', without including the trailing period", function() {
					var result = autolinker.link( "Joe went to yahoo.com." );
					expect( result ).toBe( 'Joe went to <a href="http://yahoo.com">yahoo.com</a>.' );
				} );


				it( "should automatically link URLs in the form of 'yahoo.com:8000' (with a port number)", function() {
					var result = autolinker.link( "Joe went to yahoo.com:8000 today" );
					expect( result ).toBe( 'Joe went to <a href="http://yahoo.com:8000">yahoo.com:8000</a> today' );
				} );


				it( "should automatically link URLs in the form of 'yahoo.com:8000/abc' (with a port number and path)", function() {
					var result = autolinker.link( "Joe went to yahoo.com:8000/abc today" );
					expect( result ).toBe( 'Joe went to <a href="http://yahoo.com:8000/abc">yahoo.com:8000/abc</a> today' );
				} );


				it( "should automatically link URLs in the form of 'yahoo.com:8000?abc' (with a port number and query string)", function() {
					var result = autolinker.link( "Joe went to yahoo.com:8000?abc today" );
					expect( result ).toBe( 'Joe went to <a href="http://yahoo.com:8000?abc">yahoo.com:8000?abc</a> today' );
				} );


				it( "should automatically link URLs in the form of 'yahoo.com:8000#abc' (with a port number and hash)", function() {
					var result = autolinker.link( "Joe went to yahoo.com:8000#abc today" );
					expect( result ).toBe( 'Joe went to <a href="http://yahoo.com:8000#abc">yahoo.com:8000#abc</a> today' );
				} );


				it( "should automatically link capitalized URLs", function() {
					var result = autolinker.link( "Joe went to YAHOO.COM." );
					expect( result ).toBe( 'Joe went to <a href="http://YAHOO.COM">YAHOO.COM</a>.' );
				} );


				it( "should not include [?!:,.;] chars if at the end of the URL", function() {
					var result1 = autolinker.link( "Joe went to yahoo.com? today" );
					expect( result1 ).toBe( 'Joe went to <a href="http://yahoo.com">yahoo.com</a>? today' );
					var result2 = autolinker.link( "Joe went to yahoo.com! today" );
					expect( result2 ).toBe( 'Joe went to <a href="http://yahoo.com">yahoo.com</a>! today' );
					var result3 = autolinker.link( "Joe went to yahoo.com: today" );
					expect( result3 ).toBe( 'Joe went to <a href="http://yahoo.com">yahoo.com</a>: today' );
					var result4 = autolinker.link( "Joe went to yahoo.com, today" );
					expect( result4 ).toBe( 'Joe went to <a href="http://yahoo.com">yahoo.com</a>, today' );
					var result5 = autolinker.link( "Joe went to yahoo.com. today" );
					expect( result5 ).toBe( 'Joe went to <a href="http://yahoo.com">yahoo.com</a>. today' );
					var result6 = autolinker.link( "Joe went to yahoo.com; today" );
					expect( result6 ).toBe( 'Joe went to <a href="http://yahoo.com">yahoo.com</a>; today' );
				} );

				it( "should exclude invalid chars after TLD", function() {
					var result1 = autolinker.link( "Joe went to yahoo.com's today" );
					expect( result1 ).toBe( 'Joe went to <a href="http://yahoo.com">yahoo.com</a>\'s today' );
					var result2 = autolinker.link( "Joe went to yahoo.com/foo's today" );
					expect( result2 ).toBe( 'Joe went to <a href="http://yahoo.com/foo\'s">yahoo.com/foo\'s</a> today' );
					var result3 = autolinker.link( "Joe went to yahoo.com's/foo today" );
					expect( result3 ).toBe( 'Joe went to <a href="http://yahoo.com">yahoo.com</a>\'s/foo today' );
				} );

				it( "should automatically link a URL with accented characters", function() {
					var result = autolinker.link( "Joe went to mañana.com today." );
					expect( result ).toBe( 'Joe went to <a href="http://mañana.com">mañana.com</a> today.' );
				} );

			} );


			describe( "protocol-relative URLs (i.e. URLs starting with only '//')", function() {

				it( "should automatically link protocol-relative URLs in the form of //yahoo.com at the beginning of the string", function() {
					var result = autolinker.link( "//yahoo.com" );
					expect( result ).toBe( '<a href="//yahoo.com">yahoo.com</a>' );
				} );


				it( "should automatically link protocol-relative URLs in the form of //yahoo.com in the middle of the string", function() {
					var result = autolinker.link( "Joe went to //yahoo.com yesterday" );
					expect( result ).toBe( 'Joe went to <a href="//yahoo.com">yahoo.com</a> yesterday' );
				} );


				it( "should automatically link protocol-relative URLs in the form of //yahoo.com at the end of the string", function() {
					var result = autolinker.link( "Joe went to //yahoo.com" );
					expect( result ).toBe( 'Joe went to <a href="//yahoo.com">yahoo.com</a>' );
				} );


				it( "should automatically link capitalized protocol-relative URLs", function() {
					var result = autolinker.link( "Joe went to //YAHOO.COM" );
					expect( result ).toBe( 'Joe went to <a href="//YAHOO.COM">YAHOO.COM</a>' );
				} );


				it( "should NOT automatically link supposed protocol-relative URLs in the form of abc//yahoo.com, which is most likely not supposed to be interpreted as a URL", function() {
					var result1 = autolinker.link( "Joe went to abc//yahoo.com" );
					expect( result1 ).toBe( 'Joe went to abc//yahoo.com' );

					var result2 = autolinker.link( "Относительный протокол//россия.рф" );
					expect( result2 ).toBe( 'Относительный протокол//россия.рф' );
				} );


				it( "should NOT automatically link supposed protocol-relative URLs in the form of 123//yahoo.com, which is most likely not supposed to be interpreted as a URL", function() {
					var result = autolinker.link( "Joe went to 123//yahoo.com" );
					expect( result ).toBe( 'Joe went to 123//yahoo.com' );
				} );


				it( "should automatically link supposed protocol-relative URLs as long as the character before the '//' is a non-word character", function() {
					var result = autolinker.link( "Joe went to abc-//yahoo.com" );
					expect( result ).toBe( 'Joe went to abc-<a href="//yahoo.com">yahoo.com</a>' );
				} );

			} );


			describe( "parenthesis handling", function() {

				it( "should include parentheses in URLs", function() {
					var result = autolinker.link( "TLDs come from en.wikipedia.org/wiki/IANA_(disambiguation)." );
					expect( result ).toBe( 'TLDs come from <a href="http://en.wikipedia.org/wiki/IANA_(disambiguation)">en.wikipedia.org/wiki/IANA_(disambiguation)</a>.' );

					result = autolinker.link( "MSDN has a great article at http://msdn.microsoft.com/en-us/library/aa752574(VS.85).aspx." );
					expect( result ).toBe( 'MSDN has a great article at <a href="http://msdn.microsoft.com/en-us/library/aa752574(VS.85).aspx">msdn.microsoft.com/en-us/library/aa752574(VS.85).aspx</a>.' );
				} );


				it( "should include parentheses in URLs with query strings", function() {
					var result = autolinker.link( "TLDs come from en.wikipedia.org/wiki?IANA_(disambiguation)." );
					expect( result ).toBe( 'TLDs come from <a href="http://en.wikipedia.org/wiki?IANA_(disambiguation)">en.wikipedia.org/wiki?IANA_(disambiguation)</a>.' );

					result = autolinker.link( "MSDN has a great article at http://msdn.microsoft.com/en-us/library?aa752574(VS.85).aspx." );
					expect( result ).toBe( 'MSDN has a great article at <a href="http://msdn.microsoft.com/en-us/library?aa752574(VS.85).aspx">msdn.microsoft.com/en-us/library?aa752574(VS.85).aspx</a>.' );
				} );


				it( "should include parentheses in URLs with hash anchors", function() {
					var result = autolinker.link( "TLDs come from en.wikipedia.org/wiki#IANA_(disambiguation)." );
					expect( result ).toBe( 'TLDs come from <a href="http://en.wikipedia.org/wiki#IANA_(disambiguation)">en.wikipedia.org/wiki#IANA_(disambiguation)</a>.' );

					result = autolinker.link( "MSDN has a great article at http://msdn.microsoft.com/en-us/library#aa752574(VS.85).aspx." );
					expect( result ).toBe( 'MSDN has a great article at <a href="http://msdn.microsoft.com/en-us/library#aa752574(VS.85).aspx">msdn.microsoft.com/en-us/library#aa752574(VS.85).aspx</a>.' );
				} );


				it( "should include parentheses in URLs, when the URL is also in parenthesis itself", function() {
					var result = autolinker.link( "TLDs come from (en.wikipedia.org/wiki/IANA_(disambiguation))." );
					expect( result ).toBe( 'TLDs come from (<a href="http://en.wikipedia.org/wiki/IANA_(disambiguation)">en.wikipedia.org/wiki/IANA_(disambiguation)</a>).' );

					result = autolinker.link( "MSDN has a great article at (http://msdn.microsoft.com/en-us/library/aa752574(VS.85).aspx)." );
					expect( result ).toBe( 'MSDN has a great article at (<a href="http://msdn.microsoft.com/en-us/library/aa752574(VS.85).aspx">msdn.microsoft.com/en-us/library/aa752574(VS.85).aspx</a>).' );
				} );


				it( "should not include a final closing paren in the URL, if it doesn't match an opening paren in the url", function() {
					var result = autolinker.link( "Click here (google.com) for more details" );
					expect( result ).toBe( 'Click here (<a href="http://google.com">google.com</a>) for more details' );
				} );


				it( "should not include a final closing paren in the URL when a path exists", function() {
					var result = autolinker.link( "Click here (google.com/abc) for more details" );
					expect( result ).toBe( 'Click here (<a href="http://google.com/abc">google.com/abc</a>) for more details' );
				} );


				it( "should not include a final closing paren in the URL when a query string exists", function() {
					var result = autolinker.link( "Click here (google.com?abc=1) for more details" );
					expect( result ).toBe( 'Click here (<a href="http://google.com?abc=1">google.com?abc=1</a>) for more details' );
				} );


				it( "should not include a final closing paren in the URL when a hash anchor exists", function() {
					var result = autolinker.link( "Click here (google.com#abc) for more details" );
					expect( result ).toBe( 'Click here (<a href="http://google.com#abc">google.com#abc</a>) for more details' );
				} );


				it( "should include escaped parentheses in the URL", function() {
					var result = autolinker.link( "Here's an example from CodingHorror: http://en.wikipedia.org/wiki/PC_Tools_%28Central_Point_Software%29" );
					expect( result ).toBe( 'Here\'s an example from CodingHorror: <a href="http://en.wikipedia.org/wiki/PC_Tools_%28Central_Point_Software%29">en.wikipedia.org/wiki/PC_Tools_(Central_Point_Software)</a>' );
				} );

			} );


			describe( "Special character handling", function() {

				it( "should include $ in URLs", function() {
					var result = autolinker.link( "Check out pair programming: http://c2.com/cgi/wiki$?VirtualPairProgramming" );
					expect( result ).toBe( 'Check out pair programming: <a href="http://c2.com/cgi/wiki$?VirtualPairProgramming">c2.com/cgi/wiki$?VirtualPairProgramming</a>' );
				} );


				it( "should include $ in URLs with query strings", function() {
					var result = autolinker.link( "Check out the image at http://server.com/template?fmt=jpeg&$base=700." );
					expect( result ).toBe( 'Check out the image at <a href="http://server.com/template?fmt=jpeg&$base=700">server.com/template?fmt=jpeg&$base=700</a>.' );
				} );


				it( "should include * in URLs", function() {
					var result = autolinker.link( "Google from wayback http://wayback.archive.org/web/*/http://google.com" );
					expect( result ).toBe( 'Google from wayback <a href="http://wayback.archive.org/web/*/http://google.com">wayback.archive.org/web/*/http://google.com</a>' );
				} );


				it( "should include * in URLs with query strings", function() {
					var result = autolinker.link( "Twitter search for bob smith https://api.twitter.com/1.1/users/search.json?count=20&q=Bob+*+Smith" );
					expect( result ).toBe( 'Twitter search for bob smith <a href="https://api.twitter.com/1.1/users/search.json?count=20&q=Bob+*+Smith">api.twitter.com/1.1/users/search.json?count=20&q=Bob+*+Smith</a>' );
				} );


				it( "should include ' in URLs", function() {
					var result = autolinker.link( "You are a star http://en.wikipedia.org/wiki/You're_a_Star/" );
					expect( result ).toBe( 'You are a star <a href="http://en.wikipedia.org/wiki/You\'re_a_Star/">en.wikipedia.org/wiki/You\'re_a_Star</a>' );
				} );


				it( "should include ' in URLs with query strings", function() {
					var result = autolinker.link( "Test google search https://www.google.com/#q=test's" );
					expect( result ).toBe( 'Test google search <a href="https://www.google.com/#q=test\'s">google.com/#q=test\'s</a>' );
				} );


				it( "should include [ and ] in URLs with query strings", function() {
					var result = autolinker.link( "Go to https://example.com/api/export/873/?a[]=10&a[]=9&a[]=8&a[]=7&a[]=6 today" );
					expect( result ).toBe( 'Go to <a href="https://example.com/api/export/873/?a[]=10&a[]=9&a[]=8&a[]=7&a[]=6">example.com/api/export/873/?a[]=10&a[]=9&a[]=8&a[]=7&a[]=6</a> today' );
				} );


				it( "should handle an example Google Maps URL with query string", function() {
					var result = autolinker.link( "google.no/maps/place/Gary's+Deli/@52.3664378,4.869345,18z/data=!4m7!1m4!3m3!1s0x47c609c14a6680df:0x643f005113531f15!2sBeertemple!3b1!3m1!1s0x0000000000000000:0x51a8a6adb4307be6?hl=no" );

					expect( result ).toBe( '<a href="http://google.no/maps/place/Gary\'s+Deli/@52.3664378,4.869345,18z/data=!4m7!1m4!3m3!1s0x47c609c14a6680df:0x643f005113531f15!2sBeertemple!3b1!3m1!1s0x0000000000000000:0x51a8a6adb4307be6?hl=no">google.no/maps/place/Gary\'s+Deli/@52.3664378,4.869345,18z/data=!4m7!1m4!3m3!1s0x47c609c14a6680df:0x643f005113531f15!2sBeertemple!3b1!3m1!1s0x0000000000000000:0x51a8a6adb4307be6?hl=no</a>' );
				} );


				it( "should decode emojis", function() {
					var result = autolinker.link( "Danish flag emoji: https://emojipedia.org/%F0%9F%87%A9%F0%9F%87%B0" );

					expect( result ).toBe( 'Danish flag emoji: <a href="https://emojipedia.org/%F0%9F%87%A9%F0%9F%87%B0">emojipedia.org/🇩🇰</a>' );
				} );


				it( "should HTML-encode escape-encoded special characters", function() {
					var result = autolinker.link( "Link: http://example.com/%3c%3E%22%27%26" );

					expect( result ).toBe( 'Link: <a href="http://example.com/%3c%3E%22%27%26">example.com/&lt;&gt;&quot;&#39;&amp;</a>' );
				} );

			} );


			describe( "URL path, query string, and hash handling", function() {

				it( "should automatically link URLs in the form of yahoo.com/path/to/file.html, handling the path", function() {
					var result = autolinker.link( "Joe went to yahoo.com/path/to/file.html" );
					expect( result ).toBe( 'Joe went to <a href="http://yahoo.com/path/to/file.html">yahoo.com/path/to/file.html</a>' );
				} );


				it( "should automatically link URLs in the form of yahoo.com?hi=1, handling the query string", function() {
					var result = autolinker.link( "Joe went to yahoo.com?hi=1" );
					expect( result ).toBe( 'Joe went to <a href="http://yahoo.com?hi=1">yahoo.com?hi=1</a>' );
				} );


				it( "should automatically link URLs in the form of yahoo.com#index1, handling the hash", function() {
					var result = autolinker.link( "Joe went to yahoo.com#index1" );
					expect( result ).toBe( 'Joe went to <a href="http://yahoo.com#index1">yahoo.com#index1</a>' );
				} );


				it( "should automatically link URLs in the form of yahoo.com/path/to/file.html?hi=1, handling the path and the query string", function() {
					var result = autolinker.link( "Joe went to yahoo.com/path/to/file.html?hi=1" );
					expect( result ).toBe( 'Joe went to <a href="http://yahoo.com/path/to/file.html?hi=1">yahoo.com/path/to/file.html?hi=1</a>' );
				} );


				it( "should automatically link URLs in the form of yahoo.com/path/to/file.html#index1, handling the path and the hash", function() {
					var result = autolinker.link( "Joe went to yahoo.com/path/to/file.html#index1" );
					expect( result ).toBe( 'Joe went to <a href="http://yahoo.com/path/to/file.html#index1">yahoo.com/path/to/file.html#index1</a>' );
				} );


				it( "should automatically link URLs in the form of yahoo.com/path/to/file.html?hi=1#index1, handling the path, query string, and hash", function() {
					var result = autolinker.link( "Joe went to yahoo.com/path/to/file.html?hi=1#index1" );
					expect( result ).toBe( 'Joe went to <a href="http://yahoo.com/path/to/file.html?hi=1#index1">yahoo.com/path/to/file.html?hi=1#index1</a>' );
				} );


				it( "should automatically link a URL with a complex hash (such as a Google Analytics url)", function() {
					var result = autolinker.link( "Joe went to https://www.google.com/analytics/web/?pli=1#my-reports/Obif-Y6qQB2xAJk0ZZE1Zg/a4454143w36378534p43704543/%3F.date00%3D20120314%26_.date01%3D20120314%268534-table.rowStart%3D0%268534-table.rowCount%3D25/ and analyzed his analytics" );
					expect( result ).toBe( 'Joe went to <a href="https://www.google.com/analytics/web/?pli=1#my-reports/Obif-Y6qQB2xAJk0ZZE1Zg/a4454143w36378534p43704543/%3F.date00%3D20120314%26_.date01%3D20120314%268534-table.rowStart%3D0%268534-table.rowCount%3D25/">google.com/analytics/web/?pli=1#my-reports/Obif-Y6qQB2xAJk0ZZE1Zg/a4454143w36378534p43704543/?.date00=20120314&amp;_.date01=20120314&amp;8534-table.rowStart=0&amp;8534-table.rowCount=25</a> and analyzed his analytics' );
				} );


				it( "should automatically link URLs in the form of 'http://yahoo.com/sports.', without including the trailing period", function() {
					var result = autolinker.link( "Joe went to http://yahoo.com/sports." );
					expect( result ).toBe( 'Joe went to <a href="http://yahoo.com/sports">yahoo.com/sports</a>.' );
				} );


				it( "should remove trailing slash from 'http://yahoo.com/'", function() {
					var result = autolinker.link( "Joe went to http://yahoo.com/." );
					expect( result ).toBe( 'Joe went to <a href="http://yahoo.com/">yahoo.com</a>.' );
				} );


				it( "should remove trailing slash from 'http://yahoo.com/sports/'", function() {
					var result = autolinker.link( "Joe went to http://yahoo.com/sports/." );
					expect( result ).toBe( 'Joe went to <a href="http://yahoo.com/sports/">yahoo.com/sports</a>.' );
				} );

			} );


			describe( "multiple dots handling", function() {

				it( "should autolink a url with multiple dots in the path", function() {
					var result = autolinker.link( "https://gitlab.example.com/space/repo/compare/master...develop" );

					expect( result ).toBe( '<a href="https://gitlab.example.com/space/repo/compare/master...develop">gitlab.example.com/space/repo/compare/master...develop</a>' );
				} );

			} );


			it( "should automatically link multiple URLs in the same input string", function() {
				var result = autolinker.link( 'Joe went to http://yahoo.com and http://google.com' );
				expect( result ).toBe( 'Joe went to <a href="http://yahoo.com">yahoo.com</a> and <a href="http://google.com">google.com</a>' );
			} );

		} );


		describe( "email address linking", function() {

			it( "should automatically link an email address which is the only text in the string", function() {
				var result = autolinker.link( "joe@joe.com" );
				expect( result ).toBe( '<a href="mailto:joe@joe.com">joe@joe.com</a>' );
			} );


			it( "should automatically link email addresses at the start of the string", function() {
				var result = autolinker.link( "joe@joe.com is Joe's email" );
				expect( result ).toBe( '<a href="mailto:joe@joe.com">joe@joe.com</a> is Joe\'s email' );
			} );


			it( "should automatically link an email address in the middle of the string", function() {
				var result = autolinker.link( "Joe's email is joe@joe.com because it is" );
				expect( result ).toBe( 'Joe\'s email is <a href="mailto:joe@joe.com">joe@joe.com</a> because it is' );
			} );


			it( "should automatically link email addresses at the end of the string", function() {
				var result = autolinker.link( "Joe's email is joe@joe.com" );
				expect( result ).toBe( 'Joe\'s email is <a href="mailto:joe@joe.com">joe@joe.com</a>' );
			} );


			it( "should automatically link email addresses with a period in the 'local part'", function() {
				var result = autolinker.link( "Joe's email is joe.smith@joe.com" );
				expect( result ).toBe( 'Joe\'s email is <a href="mailto:joe.smith@joe.com">joe.smith@joe.com</a>' );
			} );


			it( "should automatically link fully-capitalized email addresses", function() {
				var result = autolinker.link( "Joe's email is JOE@JOE.COM" );
				expect( result ).toBe( 'Joe\'s email is <a href="mailto:JOE@JOE.COM">JOE@JOE.COM</a>' );
			} );


			it( "should properly link an email address in parenthesis", function() {
				var result = autolinker.link( "Joe's email is (joe@joe.com)" );
				expect( result ).toBe( 'Joe\'s email is (<a href="mailto:joe@joe.com">joe@joe.com</a>)' );
			} );


			it( "should properly link an email address with underscores", function() {
				var result = autolinker.link( "Joe's email is (joe_roe@joe.com)" );
				expect( result ).toBe( 'Joe\'s email is (<a href="mailto:joe_roe@joe.com">joe_roe@joe.com</a>)' );
			} );


			it( "should properly link an email address with an apostrophe", function() {
				var result = autolinker.link( "Joe's email is (joe'roe@joe.com)" );
				expect( result ).toBe( 'Joe\'s email is (<a href="mailto:joe\'roe@joe.com">joe\'roe@joe.com</a>)' );
			} );


			it( "should automatically link an email address with accented characters", function() {
				var result = autolinker.link( "Joe's email is mañana@mañana.com" );
				expect( result ).toBe( 'Joe\'s email is <a href="mailto:mañana@mañana.com">mañana@mañana.com</a>' );
			} );


			it( "should automatically link an email address with cyrillic characters", function() {
				var result = autolinker.link( "Joe's email is Кириллица@Кириллица.com" );
				expect( result ).toBe( 'Joe\'s email is <a href="mailto:Кириллица@Кириллица.com">Кириллица@Кириллица.com</a>' );
			} );


			it( "should NOT automatically link any old word with an @ character in it", function() {
				var result = autolinker.link( "Hi there@stuff" );
				expect( result ).toBe( 'Hi there@stuff' );
			} );

			it( "should automatically link an email address with tld matched localpart", function () {
				var result = autolinker.link( "My email is busueng.kim@aaa.com" );
				expect( result ).toBe( 'My email is <a href="mailto:busueng.kim@aaa.com">busueng.kim@aaa.com</a>');
			} );

		} );


		describe( "mention linking", function() {

			it( "should automatically link a twitter handle which is the only thing in the string", function() {
				var result = twitterAutolinker.link( "@joe" );
				expect( result ).toBe( '<a href="https://twitter.com/joe">@joe</a>' );
			} );


			it( "should automatically link a twitter handle with underscores in it", function() {
				var result = twitterAutolinker.link( "@joe_the_man12" );
				expect( result ).toBe( '<a href="https://twitter.com/joe_the_man12">@joe_the_man12</a>' );
			} );


			it( "should automatically link twitter handles at the beginning of a string", function() {
				var result = twitterAutolinker.link( "@greg is my twitter handle" );
				expect( result ).toBe( '<a href="https://twitter.com/greg">@greg</a> is my twitter handle' );
			} );


			it( "should automatically link twitter handles in the middle of a string", function() {
				var result = twitterAutolinker.link( "Joe's twitter is @joe_the_man12 today, but what will it be tomorrow?" );
				expect( result ).toBe( 'Joe\'s twitter is <a href="https://twitter.com/joe_the_man12">@joe_the_man12</a> today, but what will it be tomorrow?' );
			} );


			it( "should automatically link twitter handles at the end of a string", function() {
				var result = twitterAutolinker.link( "Joe's twitter is @joe_the_man12" );
				expect( result ).toBe( 'Joe\'s twitter is <a href="https://twitter.com/joe_the_man12">@joe_the_man12</a>' );
			} );


			it( "should automatically link twitter handles surrounded by parentheses", function() {
				var result = twitterAutolinker.link( "Joe's twitter is (@joe_the_man12)" );
				expect( result ).toBe( 'Joe\'s twitter is (<a href="https://twitter.com/joe_the_man12">@joe_the_man12</a>)' );
			} );


			it( "should automatically link twitter handles surrounded by braces", function() {
				var result = twitterAutolinker.link( "Joe's twitter is {@joe_the_man12}" );
				expect( result ).toBe( 'Joe\'s twitter is {<a href="https://twitter.com/joe_the_man12">@joe_the_man12</a>}' );
			} );


			it( "should automatically link twitter handles surrounded by brackets", function() {
				var result = twitterAutolinker.link( "Joe's twitter is [@joe_the_man12]" );
				expect( result ).toBe( 'Joe\'s twitter is [<a href="https://twitter.com/joe_the_man12">@joe_the_man12</a>]' );
			} );


			it( "should automatically link multiple twitter handles in a string", function() {
				var result = twitterAutolinker.link( "@greg is tweeting @joe with @josh" );
				expect( result ).toBe( '<a href="https://twitter.com/greg">@greg</a> is tweeting <a href="https://twitter.com/joe">@joe</a> with <a href="https://twitter.com/josh">@josh</a>' );
			} );


			it( "should automatically link fully capitalized twitter handles", function() {
				var result = twitterAutolinker.link( "@GREG is tweeting @JOE with @JOSH" );
				expect( result ).toBe( '<a href="https://twitter.com/GREG">@GREG</a> is tweeting <a href="https://twitter.com/JOE">@JOE</a> with <a href="https://twitter.com/JOSH">@JOSH</a>' );
			} );


			// NOTE: Twitter itself does not accept cyrillic characters, but
			// other services might so linking them anyway
			it( "should automatically link username handles with accented characters", function() {
				var result = twitterAutolinker.link( "Hello @mañana how are you?" );
				expect( result ).toBe( 'Hello <a href="https://twitter.com/mañana">@mañana</a> how are you?' );
			} );


			// NOTE: Twitter itself does not accept cyrillic characters, but
			// other services might so linking them anyway
			it( "should automatically link username handles with cyrillic characters", function() {
				var result = twitterAutolinker.link( "Hello @Кириллица how are you?" );
				expect( result ).toBe( 'Hello <a href="https://twitter.com/Кириллица">@Кириллица</a> how are you?' );
			} );


			it( "should NOT automatically link a username that is actually part of an email address **when email address linking is turned off**", function() {
				var noEmailAutolinker = new Autolinker( {
					email: false,
				    mention: 'twitter',
				    newWindow: false
				} );
				var result = noEmailAutolinker.link( "asdf@asdf.com" );

				expect( result ).toBe( 'asdf@asdf.com' );
			} );

		} );


		describe( "phone number linking", function() {

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
			} );


			it( "should automatically link a phone number that is completely surrounded by parenthesis", function() {
				var result = autolinker.link( "((555) 666-7777)" );
				expect( result ).toBe( '(<a href="tel:5556667777">(555) 666-7777</a>)' );
			} );


			it( "should automatically link a phone number contained in a larger string", function() {
				var result = autolinker.link( "Here's my number: (555)666-7777, so call me maybe?" );
				expect( result ).toBe( 'Here\'s my number: <a href=\"tel:5556667777\">(555)666-7777</a>, so call me maybe?' );
			} );


			it( "should automatically link a phone number surrounded by parenthesis contained in a larger string", function() {
				var result = autolinker.link( "Here's my number ((555)666-7777), so call me maybe?" );
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


		describe( "hashtag linking", function() {
			var twitterHashtagAutolinker,
			    facebookHashtagAutolinker,
			    instagramHashtagAutolinker;

			beforeEach( function() {
				twitterHashtagAutolinker = new Autolinker( { hashtag: 'twitter', newWindow: false } );
				facebookHashtagAutolinker = new Autolinker( { hashtag: 'facebook', newWindow: false } );
				instagramHashtagAutolinker = new Autolinker( { hashtag: 'instagram', newWindow: false } );
			} );


			it( "should NOT autolink hashtags by default for both backward compatibility, and because we don't know which service (twitter, facebook, etc.) to point them to", function() {
				expect( autolinker.link( "#test" ) ).toBe( '#test' );
			} );


			it( "should NOT autolink hashtags the `hashtag` cfg is explicitly false", function() {
				var result = Autolinker.link( "#test", { hashtag: false } );

				expect( result ).toBe( "#test" );
			} );


			it( "should automatically link hashtags to twitter when the `hashtag` option is 'twitter'", function() {
				var result = twitterHashtagAutolinker.link( "#test" );

				expect( result ).toBe( '<a href="https://twitter.com/hashtag/test">#test</a>' );
			} );


			it( "should automatically link hashtags to facebook when the `hashtag` option is 'facebook'", function() {
				var result = facebookHashtagAutolinker.link( "#test" );

				expect( result ).toBe( '<a href="https://www.facebook.com/hashtag/test">#test</a>' );
			} );

			it( "should automatically link hashtags to instagram when the `hashtag` option is 'instagram'", function() {
				var result = instagramHashtagAutolinker.link( "#test" );

				expect( result ).toBe( '<a href="https://instagram.com/explore/tags/test">#test</a>' );
			} );


			it( "should automatically link hashtags which are part of a full string", function() {
				var result = twitterHashtagAutolinker.link( "my hashtag is #test these days" );

				expect( result ).toBe( 'my hashtag is <a href="https://twitter.com/hashtag/test">#test</a> these days' );
			} );


			it( "should automatically link hashtags that are longer than 15 chars (original version of hashtag implementation limited to 15 chars, now it's at 139 chars)", function() {
				var result = twitterHashtagAutolinker.link( "my hashtag is #AHashtagThatIsWorthyOfMordorAndStuff these days" );

				expect( result ).toBe( 'my hashtag is <a href="https://twitter.com/hashtag/AHashtagThatIsWorthyOfMordorAndStuff">#AHashtagThatIsWorthyOfMordorAndStuff</a> these days' );
			} );


			it( "should automatically link a hashtag with underscores", function() {
				var result = twitterHashtagAutolinker.link( "Yay, #hello_world" );
				expect( result ).toBe( 'Yay, <a href="https://twitter.com/hashtag/hello_world">#hello_world</a>' );
			} );


			it( "should automatically link a hashtag with accented characters", function() {
				var result = twitterHashtagAutolinker.link( "Yay, #mañana" );
				expect( result ).toBe( 'Yay, <a href="https://twitter.com/hashtag/mañana">#mañana</a>' );
			} );


			it( "should automatically link a hashtag with cyrillic characters", function() {
				var result = twitterHashtagAutolinker.link( "Yay, #Кириллица" );
				expect( result ).toBe( 'Yay, <a href="https://twitter.com/hashtag/Кириллица">#Кириллица</a>' );
			} );


			it( "should NOT automatically link a hashtag when the '#' belongs to part of another string", function() {
				var result = twitterHashtagAutolinker.link( "test as#df test" );

				expect( result ).toBe( 'test as#df test' );
			} );


			it( "should NOT automatically link a hashtag that is actually a named anchor within a URL", function() {
				var result = twitterHashtagAutolinker.link( "http://google.com/#link" );

				expect( result ).toBe( '<a href="http://google.com/#link">google.com/#link</a>' );
			} );


			it( "should NOT automatically link a hashtag that is actually a named anchor within a URL **when URL linking is turned off**", function() {
				var noUrlTwitterHashtagAutolinker = new Autolinker( { urls: false, hashtag: 'twitter', newWindow: false } ),
				    result = noUrlTwitterHashtagAutolinker.link( "http://google.com/#link" );

				expect( result ).toBe( 'http://google.com/#link' );
			} );

		} );


		describe( "mention linking", function() {
			var twitterMentionAutolinker,
			    instagramMentionAutolinker;

			beforeEach( function() {
				twitterMentionAutolinker = new Autolinker( { mention: 'twitter', newWindow: false } );
				instagramMentionAutolinker = new Autolinker( { mention: 'instagram', newWindow: false } );
			} );


			it( "should not autolink mentions by default", function() {
				var autolinker = new Autolinker( { newWindow: false } );
				expect( autolinker.link( "@test" ) ).toBe( '@test' );
			} );


			it( "should automatically link mentions to twitter when the `mention` option is 'twitter'", function() {
				var result = twitterMentionAutolinker.link( "@test" );

				expect( result ).toBe( '<a href="https://twitter.com/test">@test</a>' );
			} );


			it( "should automatically link mentions to instagram when the `mention` option is 'instagram'", function() {
				var result = instagramMentionAutolinker.link( "@test" );

				expect( result ).toBe( '<a href="https://instagram.com/test">@test</a>' );
			} );


			it( "should automatically link mentions which are part of a full string", function() {
				var result = twitterMentionAutolinker.link( "my handle is @test these days" );

				expect( result ).toBe( 'my handle is <a href="https://twitter.com/test">@test</a> these days' );
			} );


			it( "should automatically link a mention with underscores", function() {
				var result = twitterMentionAutolinker.link( "Yay, @hello_world" );
				expect( result ).toBe( 'Yay, <a href="https://twitter.com/hello_world">@hello_world</a>' );
			} );


			it( "should automatically link mentions surrounded by parentheses", function() {
				var result = twitterMentionAutolinker.link( "Joe's twitter is (@joe_the_man12)" );
				expect( result ).toBe( 'Joe\'s twitter is (<a href="https://twitter.com/joe_the_man12">@joe_the_man12</a>)' );
			} );


			it( "should automatically link mentions surrounded by braces", function() {
				var result = twitterMentionAutolinker.link( "Joe's twitter is {@joe_the_man12}" );
				expect( result ).toBe( 'Joe\'s twitter is {<a href="https://twitter.com/joe_the_man12">@joe_the_man12</a>}' );
			} );


			it( "should automatically link mentions surrounded by brackets", function() {
				var result = twitterMentionAutolinker.link( "Joe's twitter is [@joe_the_man12]" );
				expect( result ).toBe( 'Joe\'s twitter is [<a href="https://twitter.com/joe_the_man12">@joe_the_man12</a>]' );
			} );


			it( "should automatically link multiple mentions in a string", function() {
				var result = twitterMentionAutolinker.link( "@greg is tweeting @joe with @josh" );
				expect( result ).toBe( '<a href="https://twitter.com/greg">@greg</a> is tweeting <a href="https://twitter.com/joe">@joe</a> with <a href="https://twitter.com/josh">@josh</a>' );
			} );


			it( "should automatically link fully capitalized mentions", function() {
				var result = twitterMentionAutolinker.link( "@GREG is tweeting @JOE with @JOSH" );
				expect( result ).toBe( '<a href="https://twitter.com/GREG">@GREG</a> is tweeting <a href="https://twitter.com/JOE">@JOE</a> with <a href="https://twitter.com/JOSH">@JOSH</a>' );
			} );


			// NOTE: Twitter itself does not accept cyrillic characters, but
			// other services might so linking them anyway
			it( "should automatically link mentions with accented characters", function() {
				var result = twitterMentionAutolinker.link( "Hello @mañana how are you?" );
				expect( result ).toBe( 'Hello <a href="https://twitter.com/mañana">@mañana</a> how are you?' );
			} );


			// NOTE: Twitter itself does not accept cyrillic characters, but
			// other services might so linking them anyway
			it( "should automatically link username handles with cyrillic characters", function() {
				var result = twitterMentionAutolinker.link( "Hello @Кириллица how are you?" );
				expect( result ).toBe( 'Hello <a href="https://twitter.com/Кириллица">@Кириллица</a> how are you?' );
			} );


			it( "should NOT automatically link a mention that is actually part of an email address **when email address linking is turned off**", function() {
				var noUsernameAutolinker = new Autolinker( { email: false, mention: 'twitter', newWindow: false } ),
				    result = noUsernameAutolinker.link( "asdf@asdf.com" );

				expect( result ).toBe( 'asdf@asdf.com' );
			} );


			it( "should NOT automatically link a mention when the '@' belongs to part of another string", function() {
				var result = twitterMentionAutolinker.link( "test as@df test" );

				expect( result ).toBe( 'test as@df test' );
			} );

		} );


		describe( "proper handling of HTML in the input string", function() {

			it( "should automatically link URLs past the last HTML tag", function() {
				var result = autolinker.link( '<p>Joe went to <a href="http://www.yahoo.com">yahoo</a></p> and http://google.com' );
				expect( result ).toBe( '<p>Joe went to <a href="http://www.yahoo.com">yahoo</a></p> and <a href="http://google.com">google.com</a>' );
			} );


			it( "should NOT automatically link URLs within the attributes of existing HTML tags", function() {
				var result = autolinker.link( '<p>Joe went to <a href="http://www.yahoo.com">yahoo</a></p>' );
				expect( result ).toBe( '<p>Joe went to <a href="http://www.yahoo.com">yahoo</a></p>' );
			} );


			it( "should NOT automatically link URLs within the attributes of existing HTML tags when there are prefixed or suffixed spaces in the attribute values", function() {
				var result = autolinker.link( '<p>Joe went to <a href=" http://www.yahoo.com">yahoo</a></p>' );
				expect( result ).toBe( '<p>Joe went to <a href=" http://www.yahoo.com">yahoo</a></p>' );

				var result2 = autolinker.link( '<p>Joe went to <a href="http://www.yahoo.com ">yahoo</a></p>' );
				expect( result2 ).toBe( '<p>Joe went to <a href="http://www.yahoo.com ">yahoo</a></p>' );
			} );


			it( "should NOT automatically link URLs within self-closing tags", function() {
				var result = autolinker.link( 'Just a flower image <img src="https://farm9.staticflickr.com/8378/8578790632_83c6471f3f_b.jpg" />' );
				expect( result ).toBe( 'Just a flower image <img src="https://farm9.staticflickr.com/8378/8578790632_83c6471f3f_b.jpg" />' );
			} );


			it( "should NOT automatically link a URL found within the inner text of a pre-existing anchor tag", function() {
				var result = autolinker.link( '<p>Joe went to <a href="http://www.yahoo.com">yahoo.com</a></p> yesterday.' );
				expect( result ).toBe( '<p>Joe went to <a href="http://www.yahoo.com">yahoo.com</a></p> yesterday.' );
			} );


			it( "should NOT automatically link a URL found within the inner text of a pre-existing anchor tag, but link others", function() {
				var result = autolinker.link( '<p>Joe went to google.com, <a href="http://www.yahoo.com">yahoo.com</a>, and weather.com</p> yesterday.' );
				expect( result ).toBe( '<p>Joe went to <a href="http://google.com">google.com</a>, <a href="http://www.yahoo.com">yahoo.com</a>, and <a href="http://weather.com">weather.com</a></p> yesterday.' );
			} );


			it( "should NOT automatically link an image tag with incorrect HTML attribute spacing", function() {
				var result = autolinker.link( '<img src="https://ssl.gstatic.com/welcome_calendar.png" alt="Calendar" style="display:block;"width="129"height="129"/>' );
				expect( result ).toBe( '<img src="https://ssl.gstatic.com/welcome_calendar.png" alt="Calendar" style="display:block;"width="129"height="129"/>' );
			} );


			it( "should NOT automatically link an image tag with a URL inside it, inside an anchor tag", function() {
				var result = autolinker.link( '<a href="http://google.com"><img src="http://google.com/someImage.jpg" /></a>' );
				expect( result ).toBe( '<a href="http://google.com"><img src="http://google.com/someImage.jpg" /></a>' );
			} );


			it( "should NOT automatically link an image tag with a URL inside it, inside an anchor tag, but match urls around the tags", function() {
				var result = autolinker.link( 'google.com looks like <a href="http://google.com"><img src="http://google.com/someImage.jpg" /></a> (at google.com)' );
				expect( result ).toBe( '<a href="http://google.com">google.com</a> looks like <a href="http://google.com"><img src="http://google.com/someImage.jpg" /></a> (at <a href="http://google.com">google.com</a>)' );
			} );


			it( "should NOT automatically link an image tag with a URL inside of it, when it has another attribute which has extraneous spaces surround its value (Issue #45)", function() {
				var result = autolinker.link( "Testing <img src='http://terryshoemaker.files.wordpress.com/2013/03/placeholder1.jpg' style=' height: 22px; background-color: rgb(0, 188, 204); border-radius: 7px; padding: 2px; margin: 0px 2px;'>" );
				expect( result ).toBe( "Testing <img src='http://terryshoemaker.files.wordpress.com/2013/03/placeholder1.jpg' style=' height: 22px; background-color: rgb(0, 188, 204); border-radius: 7px; padding: 2px; margin: 0px 2px;'>" );
			} );


			it( "should NOT automatically link a tag within an attribute of another tag (Issue #45)", function() {
				var result = autolinker.link( '<form class="approval-form" name="thumbsUp" ng-submit="postApproval()"> <button type="submit"> <img class="thumbs-up" ng-click="comment.body=\'<img src=\'http://example.com/api-public/images/wg/w/Rating_and_Approval/icon-thumbs-up.png\' style=\'height: 22px; background-color: rgb(0, 188, 204); border-radius: 7px; padding: 2px; margin: 0px 2px;\'>\'+comment.body;" ng-src="http://example.com/api-public/images/wg/w/Rating_and_Approval/icon-thumbs-up.png"> </button> </form>' );
				expect( result ).toBe( '<form class="approval-form" name="thumbsUp" ng-submit="postApproval()"> <button type="submit"> <img class="thumbs-up" ng-click="comment.body=\'<img src=\'http://example.com/api-public/images/wg/w/Rating_and_Approval/icon-thumbs-up.png\' style=\'height: 22px; background-color: rgb(0, 188, 204); border-radius: 7px; padding: 2px; margin: 0px 2px;\'>\'+comment.body;" ng-src="http://example.com/api-public/images/wg/w/Rating_and_Approval/icon-thumbs-up.png"> </button> </form>' );
			} );


			it( "should NOT remove `br` tags from the output (Issue #46)", function() {
				var result = autolinker.link( "Testing<br /> with<br/> br<br> tags" );
				expect( result ).toBe( "Testing<br /> with<br/> br<br> tags" );
			} );


			it( "should NOT automatically link anything in a !DOCTYPE tag (Issue #53)", function() {
				var input = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">';

				var result = autolinker.link( input );
				expect( result ).toBe( input );
			} );


			it( "should NOT automatically link within comment tags", function() {
				var result = autolinker.link( '<!-- google.com -->' );

				expect( result ).toBe( '<!-- google.com -->' );
			} );


			it( "should NOT automatically link within multi-line comment tags", function() {
				var result = autolinker.link( '<!--\n\tgoogle.com\n\t-->' );

				expect( result ).toBe( '<!--\n\tgoogle.com\n\t-->' );
			} );


			it( "should automatically link between comment tags, but not the comment tags themselves", function() {
				var result = autolinker.link( '<!-- google.com -->\nweather.com\n<!-- http://yahoo.com -->' );

				expect( result ).toBe( '<!-- google.com -->\n<a href="http://weather.com">weather.com</a>\n<!-- http://yahoo.com -->' );
			} );


			it( "should NOT automatically link within comment tags, using part of the comment tag as the URL (Issue #88)", function() {
				var result = autolinker.link( '<!--.post-author-->' );

				expect( result ).toBe( '<!--.post-author-->' );
			} );


			it( "should automatically link tags after a !DOCTYPE tag", function() {
				var input = [
					'<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">',
					'<html>',
						'<body>',
							'Welcome to mysite.com',
						'</body>',
					'</html>'
				].join( "" );

				var result = autolinker.link( input );
				expect( result ).toBe( [
					'<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">',
					'<html>',
						'<body>',
							'Welcome to <a href="http://mysite.com">mysite.com</a>',
						'</body>',
					'</html>'
				].join( "" ) );
			} );


			it( "should autolink the link, and not fail with 100% cpu in the Regex engine when presented with the input in issue #54", function() {
				var inputStr = "Shai ist endlich in Deutschland! Und wir haben gute Nachrichten! <3 Alle, die den Shai-Rasierer kostenlos probieren, machen am Gewinnspiel eines Jahresvorrates Klingen mit. Den Rasierer bekommst Du kostenlos durch diesen Link: http://dorcoshai.de/pb1205ro, und dann machst Du am Gewinnspiel mit! Gefallt mir klicken, wenn Du gern einen Jahresvorrat Shai haben mochtest. (Y)",
				    result = autolinker.link( inputStr );

				expect( result ).toBe( 'Shai ist endlich in Deutschland! Und wir haben gute Nachrichten! <3 Alle, die den Shai-Rasierer kostenlos probieren, machen am Gewinnspiel eines Jahresvorrates Klingen mit. Den Rasierer bekommst Du kostenlos durch diesen Link: <a href="http://dorcoshai.de/pb1205ro">dorcoshai.de/pb1205ro</a>, und dann machst Du am Gewinnspiel mit! Gefallt mir klicken, wenn Du gern einen Jahresvorrat Shai haben mochtest. (Y)' );
			} );


			it( "should not fail with an infinite loop for these given input strings (Issue #160)", function() {
				var inputStrings = [
					'asdf ouefof<33we oeweofjojfew oeijwffejifjew ojiwjoiwefj iowjefojwe iofjw:)<33',
					'<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3',
					'<33<33<33<33<33<33<33<33<33<33',
					'<33<33<33<33<33<33<33<33<33<33<33'
				];

				inputStrings.forEach( function( str ) {
					expect( autolinker.link( str ) ).toBe( str );  // no links in these, just making sure they don't fail with 100% cpu and an infinite loop
				} );
			} );


			it( "should not fail with an infinite loop for an input string with " +
				"completely invalid HTML (issue #160)",
			function() {
				var result = autolinker.link(
					'<US_Con_SL_RTNS@dell.com\n' +
					'He gave me a 1-800 customer care number that I\'ve called twice.  The last time I called, about 3 weeks ago, the customer rep said he would request an expedited response. He gave me a reference number which is  925767619. Thankyou very much for looking into this.\n' +
					'\n' +
					'Ronald D Brigham\n' +
					'brigham@mtnhome.com'
				);

				expect( result ).toBe( [
					'<<a href="mailto:US_Con_SL_RTNS@dell.com">US_Con_SL_RTNS@dell.com</a>',
					'He gave me a 1-800 customer care number that I\'ve called twice.  The last time I called, about 3 weeks ago, the customer rep said he would request an expedited response. He gave me a reference number which is  925767619. Thankyou very much for looking into this.',
					'',
					'Ronald D Brigham',
					'<a href="mailto:brigham@mtnhome.com">brigham@mtnhome.com</a>'
				].join( '\n' ) );
			} );


			it( "should not fail with an infinite loop for an input string with " +
				"marginally valid HTML (issue #157)",
			function() {
				var str = "Our first step should be to get a CBC with differential, accompanied by a blood smear. The blood smear will be read (by a Hematologist) as sparse platelets among RBCs and some WBCs, that will most likely be normal. The platelets that do show up on the blood smear may or may not be damaged. In the case of TTP, platelets should not be damaged, but rather just low in number. A CBC with platelet count <50K starts to raise eyebrows for a possible case requiring platelet transfusion. Now would be the time to get a Type & Screen, and most would also tend towards ordering PT, PTT, and INR, or the \"coagulative\" measurement laboratory tests. Confirmation of TTP would be made by a serum ADAMST13 activity level.";

				var result = autolinker.link( str );

				expect( result ).toBe( str );
			} );


			it( "should not fail with an infinite loop for an input string with " +
				"an emoji (although really the <3 might be the original problem - " +
				"issue #165)",
			function() {
				var str = '-Que estupendos nos vemos <3#lapeorfoto #despedida2016 #dehoyoenhoyo #rabbit';

				var result = autolinker.link( str );

				expect( result ).toBe( str );
			} );


			it( "should not fail with an infinite loop for an input string with " +
				"a string that looks like HTML (Issue #172)",
			function() {
				var str = '<Office%20days:%20Tue.%20&%20Wed.%20(till%2015:30%20hr),%20Thu.%20(till%2017:30%20hr),%20Fri.%20(till%2012:30%20hr).%3c/a%3e%3cbr%3e%3c/td%3e%3ctd%20style=>',
				    result = autolinker.link( str );

				expect( result ).toBe( str );
			} );


			it( "should not fail with a Maximum Call Stack Size Exceeded for an " +
				"input with a large number of html entities (Issue #171)",
			function() {
				var testStr = (function() {
					var t = [];
					for (var i = 0; i < 50000; i++) {
						t.push( ' /&gt;&lt;br' );
					}
					return t.join( '' );
				})();

				var result = autolinker.link( testStr );
				expect( result ).toBe( testStr );
			} );


			it( "should NOT modify the email address with other tags when inside another anchor", function() {
				var input = [
					'<div>First name: Subin</div>',
					'<div>Surname: Sundar</div>',
					'<div>',
						'Email: ',
						'<a href="mailto:subin.sundar@yo.in">',
							'<font color="blue"><u>s</u></font>',
							'<font color="blue"><u>ubin</u></font>',
							'<font color="blue"><u>.sundar@yo.in</u></font>',
						'</a>',
					'</div>'
				].join( "" );

				var result = autolinker.link( input );
				expect( result ).toBe( input );
			} );


			it( "should allow the full range of HTML attribute name characters as specified in the W3C HTML syntax document (http://www.w3.org/TR/html-markup/syntax.html)", function() {
				// Note: We aren't actually expecting the HTML to be modified by this test
				var inAndOutHtml = '<ns:p>Foo <a data-qux-="" href="http://www.example.com">Bar<\/a> Baz<\/ns:p>';
				expect( autolinker.link( inAndOutHtml ) ).toBe( inAndOutHtml );
			} );


			it( "should properly autolink text within namespaced HTML elements, skipping over html elements with urls in attribute values", function() {
				var html = '<ns:p>Go to google.com or <a data-qux-="test" href="http://www.example.com">Bar<\/a> Baz<\/ns:p>';

				var result = autolinker.link( html );
				expect( result ).toBe( '<ns:p>Go to <a href="http://google.com">google.com</a> or <a data-qux-="test" href="http://www.example.com">Bar<\/a> Baz<\/ns:p>' );
			} );


			it( "should properly skip over attribute names that could be interpreted as urls, while still autolinking urls in their inner text", function() {
				var html = '<div google.com anotherAttr yahoo.com>My div that has an attribute of google.com</div>';

				var result = autolinker.link( html );
				expect( result ).toBe( '<div google.com anotherAttr yahoo.com>My div that has an attribute of <a href="http://google.com">google.com</a></div>' );
			} );


			it( "should properly skip over attribute names that could be interpreted as urls when they have a value, while still autolinking urls in their inner text", function() {
				var html = '<div google.com="yes" anotherAttr=true yahoo.com="true">My div that has an attribute of google.com</div>';

				var result = autolinker.link( html );
				expect( result ).toBe( '<div google.com="yes" anotherAttr=true yahoo.com="true">My div that has an attribute of <a href="http://google.com">google.com</a></div>' );
			} );


			it( "should properly skip over attribute names that could be interpreted as urls when they have a value and any number of spaces between attrs, while still autolinking urls in their inner text", function() {
				var html = '<div  google.com="yes" \t\t anotherAttr=true   yahoo.com="true"  \t>My div that has an attribute of google.com</div>';

				var result = autolinker.link( html );
				expect( result ).toBe( '<div  google.com="yes" \t\t anotherAttr=true   yahoo.com="true"  \t>My div that has an attribute of <a href="http://google.com">google.com</a></div>' );
			} );


			it( "should properly skip over attribute values that could be interpreted as urls/emails/twitter/mention accts, while still autolinking urls in their inner text", function() {
				var html = '<div url="google.com" email="asdf@asdf.com" mention="@asdf">google.com asdf@asdf.com @asdf</div>';

				var result = twitterAutolinker.link( html );
				expect( result ).toBe( [
					'<div url="google.com" email="asdf@asdf.com" mention="@asdf">',
						'<a href="http://google.com">google.com</a> ',
						'<a href="mailto:asdf@asdf.com">asdf@asdf.com</a> ',
						'<a href="https://twitter.com/asdf">@asdf</a>',
					'</div>'
				].join( "" ) );
			} );


			it( "should properly skip over attribute names and values that could be interpreted as urls/emails/twitter accts, while still autolinking urls in their inner text", function() {
				var html = '<div google.com="google.com" asdf@asdf.com="asdf@asdf.com" @asdf="@asdf">google.com asdf@asdf.com @asdf</div>';

				var result = twitterAutolinker.link( html );
				expect( result ).toBe( [
					'<div google.com="google.com" asdf@asdf.com="asdf@asdf.com" @asdf="@asdf">',
						'<a href="http://google.com">google.com</a> ',
						'<a href="mailto:asdf@asdf.com">asdf@asdf.com</a> ',
						'<a href="https://twitter.com/asdf">@asdf</a>',
					'</div>'
				].join( "" ) );
			} );


			it( "should properly handle HTML markup + text nodes that are nested within <a> tags", function() {
				var html = '<a href="http://google.com"><b>google.com</b></a>';

				var result = autolinker.link( html );
				expect( result ).toBe( html );
			} );


			it( "should attempt to handle some invalid HTML markup relating to <a> tags, esp if there are extraneous closing </a> tags", function() {
				var html = '</a><a href="http://google.com">google.com</a>';

				var result = autolinker.link( html );
				expect( result ).toBe( html );
			} );


			it( "should attempt to handle some more complex invalid HTML markup relating to <a> tags, esp if there are extraneous closing </a> tags", function() {
				var html = [
					'</a>',  // invalid
					'<a href="http://google.com">google.com</a>',
					'<div>google.com</div>',
					'</a>',  // invalid
					'<a href="http://yahoo.com">yahoo.com</a>',
					'</a>',  // invalid
					'</a>',  // invalid
					'twitter.com'
				].join( "" );

				var result = autolinker.link( html );
				expect( result ).toBe( [
					'</a>',                                                   // invalid - left alone
					'<a href="http://google.com">google.com</a>',             // valid tag - left alone
					'<div><a href="http://google.com">google.com</a></div>',  // autolinked text in <div>
					'</a>',                                                   // invalid - left alone
					'<a href="http://yahoo.com">yahoo.com</a>',               // valid tag - left alone
					'</a>',                                                   // invalid - left alone
					'</a>',                                                   // invalid - left alone
					'<a href="http://twitter.com">twitter.com</a>'            // autolinked text
				].join( "" ) );
			} );


			it( "should handle &nbsp; after a url and not treat it as a query string", function() {
				var html = "<p>Joe went to yahoo.com&nbsp;and google.com&nbsp;today</p>";

				var result = autolinker.link( html );
				expect( result ).toBe('<p>Joe went to <a href="http://yahoo.com">yahoo.com</a>&nbsp;and <a href="http://google.com">google.com</a>&nbsp;today</p>');
			} );


			it( "should handle HTML entities like &nbsp; within a non-autolinked part of a text node, properly appending it to the output", function() {
				var html = "Joe went to yahoo.com and used HTML&nbsp;entities like &gt; and &lt; google.com";

				var result = autolinker.link( html );
				expect( result ).toBe( 'Joe went to <a href="http://yahoo.com">yahoo.com</a> and used HTML&nbsp;entities like &gt; and &lt; <a href="http://google.com">google.com</a>');
			} );


			it( "should handle &amp; inside a url and not ignore it", function() {
				var html = "<p>Joe went to example.com?arg=1&amp;arg=2&amp;arg=3</p>";

				var result = autolinker.link( html );
				expect( result ).toBe( '<p>Joe went to <a href="http://example.com?arg=1&arg=2&arg=3">example.com?arg=1&amp;arg=2&amp;arg=3</a></p>' );
			} );


			it( "should handle line breaks inside an HTML tag, not accidentally autolinking a URL within the tag", function() {
				var html = '<a href="http://close.io/" style="font-family: Helvetica,\nArial">http://close.io</a>';

				var result = autolinker.link( html );
				expect( result ).toBe( '<a href="http://close.io/" style="font-family: Helvetica,\nArial">http://close.io</a>' );
			} );


			it( "should handle a URL inside an HTML-encoded anchor tag (Issue #76)", function() {
				var html = "Joe learned about anchor tags on the &lt;a href=&quot;http://www.w3schools.com/aaa&quot;&gt;W3SCHOOLS&lt;/a&gt; site ...";
				var tobe = "Joe learned about anchor tags on the &lt;a href=&quot;<a href=\"http://www.w3schools.com/aaa\">w3schools.com/aaa</a>&quot;&gt;W3SCHOOLS&lt;/a&gt; site ...";

				var result = autolinker.link( html );
				expect( result ).toBe( tobe );
			} );


		} );


		describe( "`newWindow` option", function() {

			it( "should not add target=\"_blank\" when the 'newWindow' option is set to false", function() {
				var result = Autolinker.link( "Test http://url.com", { newWindow: false } );
				expect( result ).toBe( 'Test <a href="http://url.com">url.com</a>' );
			} );


			it( "should add target=\"_blank\" and rel=\"noopener noreferrer\" when the 'newWindow' option is set to true (see https://mathiasbynens.github.io/rel-noopener/ about the 'rel' attribute, which prevents a potential phishing attack)", function() {
				var result = Autolinker.link( "Test http://url.com", { newWindow: true } );
				expect( result ).toBe( 'Test <a href="http://url.com" target="_blank" rel="noopener noreferrer">url.com</a>' );
			} );

		} );


		describe( "`stripPrefix` option", function() {

			it( "should not remove the prefix for non-http protocols", function() {
				var result = Autolinker.link( "Test file://execute-virus.com", { stripPrefix: true, newWindow: false } );
				expect( result ).toBe( 'Test <a href="file://execute-virus.com">file://execute-virus.com</a>' );
			} );


			it( "should remove 'http://www.' when the 'stripPrefix' option is set to `true`", function() {
				var result = Autolinker.link( "Test http://www.url.com", { stripPrefix: true, newWindow: false } );
				expect( result ).toBe( 'Test <a href="http://www.url.com">url.com</a>' );
			} );


			it( "should not remove 'http://www.' when the 'stripPrefix' option is set to `false`", function() {
				var result = Autolinker.link( "Test http://www.url.com", { stripPrefix: false, newWindow: false } );
				expect( result ).toBe( 'Test <a href="http://www.url.com">http://www.url.com</a>' );
			} );


			it( 'should leave the original text as-is when the `stripPrefix` option is `false`', function() {
				var result1 = Autolinker.link( 'My url.com', { stripPrefix: false, newWindow: false } );
				expect( result1 ).toBe( 'My <a href="http://url.com">url.com</a>' );

				var result2 = Autolinker.link( 'My www.url.com', { stripPrefix: false, newWindow: false } );
				expect( result2 ).toBe( 'My <a href="http://www.url.com">www.url.com</a>' );

				var result3 = Autolinker.link( 'My http://url.com', { stripPrefix: false, newWindow: false } );
				expect( result3 ).toBe( 'My <a href="http://url.com">http://url.com</a>' );

				var result4 = Autolinker.link( 'My http://www.url.com', { stripPrefix: false, newWindow: false } );
				expect( result4 ).toBe( 'My <a href="http://www.url.com">http://www.url.com</a>' );
			} );


			it( "should remove the prefix by default", function() {
				var result = Autolinker.link( "Test http://www.url.com", { newWindow: false } );
				expect( result ).toBe( 'Test <a href="http://www.url.com">url.com</a>' );
			} );


			it( "when stripPrefix `scheme` is true, but `www` is false, it should " +
				"only strip the scheme",
			function() {
				var result = Autolinker.link( "Test http://www.url.com", {
					stripPrefix: { scheme: true, www: false },
					newWindow: false
				} );

				expect( result ).toBe( 'Test <a href="http://www.url.com">www.url.com</a>' );
			} );


			it( "when stripPrefix `scheme` is false, but `www` is true, it should " +
				"only strip the 'www'",
			function() {
				var result = Autolinker.link( "Test http://www.url.com", {
					stripPrefix: { scheme: false, www: true },
					newWindow: false
				} );

				expect( result ).toBe( 'Test <a href="http://www.url.com">http://url.com</a>' );
			} );


			it( "when stripPrefix `scheme` is false, but `www` is true for a " +
				"scheme-only URL, it should not strip anything",
			function() {
				var result = Autolinker.link( "Test http://url.com", {
					stripPrefix: { scheme: false, www: true },
					newWindow: false
				} );

				expect( result ).toBe( 'Test <a href="http://url.com">http://url.com</a>' );
			} );


			it( "when stripPrefix `scheme` is false, but `www` is true for a " +
				"'www'-only URL, it should strip the 'www'",
			function() {
				var result = Autolinker.link( "Test www.url.com", {
					stripPrefix: { scheme: false, www: true },
					newWindow: false
				} );

				expect( result ).toBe( 'Test <a href="http://www.url.com">url.com</a>' );
			} );


			it( "when stripPrefix `scheme` is true and `www` is true, it should " +
				"strip the entire prefix (scheme and 'www')",
			function() {
				var result = Autolinker.link( "Test http://www.url.com", {
					stripPrefix: { scheme: true, www: true },
					newWindow: false
				} );

				expect( result ).toBe( 'Test <a href="http://www.url.com">url.com</a>' );
			} );


			it( "when stripPrefix `scheme` is false and `www` is false, it should " +
				"not strip any prefix",
			function() {
				var result = Autolinker.link( "Test http://www.url.com", {
					stripPrefix: { scheme: false, www: false },
					newWindow: false
				} );

				expect( result ).toBe( 'Test <a href="http://www.url.com">http://www.url.com</a>' );
			} );

		} );


		describe( "`stripTrailingSlash` option", function() {

			it( "by default, should remove the trailing slash", function() {
				var result = Autolinker.link( "http://google.com/", {
					stripPrefix : false,
					//stripTrailingSlash : true,  -- not providing this cfg
					newWindow   : false
				} );

				expect( result ).toBe( '<a href="http://google.com/">http://google.com</a>' );
			} );


			it( "when provided as `true`, should remove the trailing slash", function() {
				var result = Autolinker.link( "http://google.com/", {
					stripPrefix        : false,
					stripTrailingSlash : true,
					newWindow          : false
				} );

				expect( result ).toBe( '<a href="http://google.com/">http://google.com</a>' );
			} );


			it( "when provided as `false`, should not remove (i.e. retain) the " +
				"trailing slash",
			function() {
				var result = Autolinker.link( "http://google.com/", {
					stripPrefix        : false,
					stripTrailingSlash : false,
					newWindow          : false
				} );

				expect( result ).toBe( '<a href="http://google.com/">http://google.com/</a>' );
			} );

		} );


		describe( "`decodePercentEncoding` option", function() {

			it( "by default, should decode percent-encoding", function() {
				var result = Autolinker.link( "https://en.wikipedia.org/wiki/San_Jos%C3%A9", {
					stripPrefix : false,
					//decodePercentEncoding : true,  -- not providing this cfg
					newWindow   : false
				} );

				expect( result ).toBe( '<a href="https://en.wikipedia.org/wiki/San_Jos%C3%A9">https://en.wikipedia.org/wiki/San_José</a>' );
			} );


			it( "when provided as `true`, should decode percent-encoding", function() {
				var result = Autolinker.link( "https://en.wikipedia.org/wiki/San_Jos%C3%A9", {
					stripPrefix           : false,
					decodePercentEncoding : true,
					newWindow             : false
				} );

				expect( result ).toBe( '<a href="https://en.wikipedia.org/wiki/San_Jos%C3%A9">https://en.wikipedia.org/wiki/San_José</a>' );
			} );


			it( "when provided as `false`, should not decode percent-encoding",
			function() {
				var result = Autolinker.link( "https://en.wikipedia.org/wiki/San_Jos%C3%A9", {
					stripPrefix           : false,
					decodePercentEncoding : false,
					newWindow             : false
				} );

				expect( result ).toBe( '<a href="https://en.wikipedia.org/wiki/San_Jos%C3%A9">https://en.wikipedia.org/wiki/San_Jos%C3%A9</a>' );
			} );

		} );


		describe( "`truncate` option", function() {

			describe( 'number form', function() {

				it( "should not perform any truncation if the `truncate` option is not passed in", function() {
					var result = Autolinker.link( "Test http://url.com/with/path", { newWindow: false } );

					expect( result ).toBe( 'Test <a href="http://url.com/with/path">url.com/with/path</a>' );
				} );


				it( "should not perform any truncation if `truncate` is 0", function() {
					var result = Autolinker.link( "Test http://url.com/with/path", { truncate: 0, newWindow: false } );

					expect( result ).toBe( 'Test <a href="http://url.com/with/path">url.com/with/path</a>' );
				} );


				it( "should truncate long a url/email/twitter to the given number of characters with the 'truncate' option specified", function() {
					var result = Autolinker.link( "Test http://url.com/with/path", { truncate: 12, newWindow: false } );

					expect( result ).toBe( 'Test <a href="http://url.com/with/path" title="http://url.com/with/path">url.com/w&hellip;</a>' );
				} );


				it( "should leave a url/email/twitter alone if the length of the url is exactly equal to the length of the 'truncate' option", function() {
					var result = Autolinker.link( "Test http://url.com/with/path", { truncate: 'url.com/with/path'.length, newWindow: false } );  // the exact length of the link

					expect( result ).toBe( 'Test <a href="http://url.com/with/path">url.com/with/path</a>' );
				} );


				it( "should leave a url/email/twitter alone if it does not exceed the given number of characters provided in the 'truncate' option", function() {
					var result = Autolinker.link( "Test http://url.com/with/path", { truncate: 25, newWindow: false } );  // just a random high number

					expect( result ).toBe( 'Test <a href="http://url.com/with/path">url.com/with/path</a>' );
				} );

			} );


			describe( 'object form (with `length` and `location` properties)', function() {

				it( "should not perform any truncation if `truncate.length` is not passed in", function() {
					var result = Autolinker.link( "Test http://url.com/with/path", { truncate: { location: 'end' }, newWindow: false } );

					expect( result ).toBe( 'Test <a href="http://url.com/with/path">url.com/with/path</a>' );
				} );


				it( "should not perform any truncation if `truncate.length` is 0", function() {
					var result = Autolinker.link( "Test http://url.com/with/path", { truncate: { length: 0 }, newWindow: false } );

					expect( result ).toBe( 'Test <a href="http://url.com/with/path">url.com/with/path</a>' );
				} );


				it( 'should default the `location` to "end" if it is not provided', function() {
					var result = Autolinker.link( "Test http://url.com/with/path", { truncate: { length: 12 }, newWindow: false } );

					expect( result ).toBe( 'Test <a href="http://url.com/with/path" title="http://url.com/with/path">url.com/w&hellip;</a>' );
				} );


				it( 'should truncate at the end when `location: "end"` is specified', function() {
					var result = Autolinker.link( "Test http://url.com/with/path", { truncate: { length: 12, location: 'end' }, newWindow: false } );

					expect( result ).toBe( 'Test <a href="http://url.com/with/path" title="http://url.com/with/path">url.com/w&hellip;</a>' );
				} );


				it( 'should truncate in the middle when `location: "middle"` is specified', function() {
					var result = Autolinker.link( "Test http://url.com/with/path", { truncate: { length: 12, location: 'middle' }, newWindow: false } );
					expect( result ).toBe( 'Test <a href="http://url.com/with/path" title="http://url.com/with/path">url.c&hellip;path</a>' );
				} );


				it( 'should truncate according to the "smart" truncation rules when `location: "smart"` is specified', function() {
					var result = Autolinker.link( "Test http://url.com/with/path", { truncate: { length: 12, location: 'smart' }, newWindow: false } );
					expect( result ).toBe( 'Test <a href="http://url.com/with/path" title="http://url.com/with/path">url.com/&hellip;h</a>' );
				} );

			} );

		} );


		describe( "`className` option", function() {

			it( "should not add className when the 'className' option is not a string with at least 1 character", function() {
				var result = Autolinker.link( "Test http://url.com", { newWindow: false } );
				expect( result ).toBe( 'Test <a href="http://url.com">url.com</a>' );

				result = Autolinker.link( "Test http://url.com", { newWindow: false, className: null } );
				expect( result ).toBe( 'Test <a href="http://url.com">url.com</a>' );

				result = Autolinker.link( "Test http://url.com", { newWindow: false, className: "" } );
				expect( result ).toBe( 'Test <a href="http://url.com">url.com</a>' );
			} );


			it( "should add className to links", function() {
				var result = Autolinker.link( "Test http://url.com", { newWindow: false, className: 'myLink' } );
				expect( result ).toBe( 'Test <a href="http://url.com" class="myLink myLink-url">url.com</a>' );
			} );


			it( "should add className to email links", function() {
				var result = Autolinker.link( "Iggy's email is mr@iggypop.com", { newWindow: false, email: true, className: 'myLink' } );
				expect( result ).toBe( 'Iggy\'s email is <a href="mailto:mr@iggypop.com" class="myLink myLink-email">mr@iggypop.com</a>' );
			} );


			it( "should add className to twitter links", function() {
				var result = Autolinker.link( "hi from @iggypopschest", { newWindow: false, mention: 'twitter', className: 'myLink' } );
				expect( result ).toBe( 'hi from <a href="https://twitter.com/iggypopschest" class="myLink myLink-mention myLink-twitter">@iggypopschest</a>' );
			} );

			it( "should add className to mention links", function() {
				var result = Autolinker.link( "hi from @iggypopschest", { newWindow: false, mention: 'twitter', className: 'myLink' } );
				expect( result ).toBe( 'hi from <a href="https://twitter.com/iggypopschest" class="myLink myLink-mention myLink-twitter">@iggypopschest</a>' );

				result = Autolinker.link( "hi from @iggypopschest", { newWindow: false, mention: 'instagram', className: 'myLink' } );
				expect( result ).toBe( 'hi from <a href="https://instagram.com/iggypopschest" class="myLink myLink-mention myLink-instagram">@iggypopschest</a>' );
			} );

		} );


		describe( '`urls` option', function() {
			var str = 'http://google.com www.google.com google.com';  // the 3 types: scheme URL, www URL, and TLD (top level domain) URL


			it( 'should link all 3 types if the `urls` option is `true`', function() {
				var result = Autolinker.link( str, { newWindow: false, stripPrefix: false, urls: true } );

				expect( result ).toBe( [
					'<a href="http://google.com">http://google.com</a>',
					'<a href="http://www.google.com">www.google.com</a>',
					'<a href="http://google.com">google.com</a>'
				].join( ' ' ) );
			} );


			it( 'should not link any of the 3 types if the `urls` option is `false`', function() {
				var result = Autolinker.link( str, { newWindow: false, stripPrefix: false, urls: false } );

				expect( result ).toBe( [
					'http://google.com',
					'www.google.com',
					'google.com'
				].join( ' ' ) );
			} );


			it( 'should only link scheme URLs if `schemeMatches` is the only `urls` option that is `true`', function() {
				var result = Autolinker.link( str, { newWindow: false, stripPrefix: false, urls: {
					schemeMatches : true,
					wwwMatches    : false,
					tldMatches    : false
				} } );

				expect( result ).toBe( [
					'<a href="http://google.com">http://google.com</a>',
					'www.google.com',
					'google.com'
				].join( ' ' ) );
			} );


			it( 'should only link www URLs if `wwwMatches` is the only `urls` option that is `true`', function() {
				var result = Autolinker.link( str, { newWindow: false, stripPrefix: false, urls: {
					schemeMatches : false,
					wwwMatches    : true,
					tldMatches    : false
				} } );

				expect( result ).toBe( [
					'http://google.com',
					'<a href="http://www.google.com">www.google.com</a>',
					'google.com'
				].join( ' ' ) );
			} );


			it( 'should only link TLD URLs if `tldMatches` is the only `urls` option that is `true`', function() {
				var result = Autolinker.link( str, { newWindow: false, stripPrefix: false, urls: {
					schemeMatches : false,
					wwwMatches    : false,
					tldMatches    : true
				} } );

				expect( result ).toBe( [
					'http://google.com',
					'www.google.com',
					'<a href="http://google.com">google.com</a>'
				].join( ' ' ) );
			} );


			it( 'should link both scheme and www matches, but not TLD matches when `tldMatches` is the only option that is `false`', function() {
				var result = Autolinker.link( str, { newWindow: false, stripPrefix: false, urls: {
					schemeMatches : true,
					wwwMatches    : true,
					tldMatches    : false
				} } );

				expect( result ).toBe( [
					'<a href="http://google.com">http://google.com</a>',
					'<a href="http://www.google.com">www.google.com</a>',
					'google.com'
				].join( ' ' ) );
			} );

		} );


		describe( "`urls` (as boolean), `email`, `phone`, `twitter`, and `mention` options", function() {
			var inputStr = [
				"Website: asdf.com",
				"Email: asdf@asdf.com",
				"Phone: (123) 456-7890",
				"Mention: @asdf",
				"Hashtag: #asdf"
			].join( ", " );


			it( "should link all 5 types if all 5 urls/email/phone/mention/hashtag options are enabled", function() {
				var result = Autolinker.link( inputStr, {
					hashtag: 'twitter',
					mention: 'twitter',
					newWindow: false
				} );
				expect( result ).toBe( [
					'Website: <a href="http://asdf.com">asdf.com</a>',
					'Email: <a href="mailto:asdf@asdf.com">asdf@asdf.com</a>',
					'Phone: <a href="tel:1234567890">(123) 456-7890</a>',
					'Mention: <a href="https://twitter.com/asdf">@asdf</a>',
					'Hashtag: <a href="https://twitter.com/hashtag/asdf">#asdf</a>'
				].join( ", " ) );
			} );


			it( "should link mentions based on value provided to mention option", function() {
				var result = Autolinker.link( inputStr, { newWindow: false, hashtag: 'twitter', mention: 'twitter' } );
				expect( result ).toBe( [
					'Website: <a href="http://asdf.com">asdf.com</a>',
					'Email: <a href="mailto:asdf@asdf.com">asdf@asdf.com</a>',
					'Phone: <a href="tel:1234567890">(123) 456-7890</a>',
					'Mention: <a href="https://twitter.com/asdf">@asdf</a>',
					'Hashtag: <a href="https://twitter.com/hashtag/asdf">#asdf</a>'
				].join( ", " ) );

				result = Autolinker.link( inputStr, { newWindow: false, hashtag: 'twitter', mention: 'instagram' } );
				expect( result ).toBe( [
					'Website: <a href="http://asdf.com">asdf.com</a>',
					'Email: <a href="mailto:asdf@asdf.com">asdf@asdf.com</a>',
					'Phone: <a href="tel:1234567890">(123) 456-7890</a>',
					'Mention: <a href="https://instagram.com/asdf">@asdf</a>',
					'Hashtag: <a href="https://twitter.com/hashtag/asdf">#asdf</a>'
				].join( ", " ) );
			} );


			it( "should ignore twitter option if mention option is set", function() {
				var result = Autolinker.link( inputStr, { newWindow: false, hashtag: 'twitter', twitter: false, mention: 'twitter' } );
				expect( result ).toBe( [
					'Website: <a href="http://asdf.com">asdf.com</a>',
					'Email: <a href="mailto:asdf@asdf.com">asdf@asdf.com</a>',
					'Phone: <a href="tel:1234567890">(123) 456-7890</a>',
					'Mention: <a href="https://twitter.com/asdf">@asdf</a>',
					'Hashtag: <a href="https://twitter.com/hashtag/asdf">#asdf</a>'
				].join( ", " ) );

				result = Autolinker.link( inputStr, { newWindow: false, hashtag: 'twitter', twitter: true, mention: 'instagram' } );
				expect( result ).toBe( [
					'Website: <a href="http://asdf.com">asdf.com</a>',
					'Email: <a href="mailto:asdf@asdf.com">asdf@asdf.com</a>',
					'Phone: <a href="tel:1234567890">(123) 456-7890</a>',
					'Mention: <a href="https://instagram.com/asdf">@asdf</a>',
					'Hashtag: <a href="https://twitter.com/hashtag/asdf">#asdf</a>'
				].join( ", " ) );
			} );


			it( "should not link urls when they are disabled", function() {
				var result = Autolinker.link( inputStr, {
					mention: 'twitter',
					hashtag: 'twitter',
					urls: false,
					newWindow: false
				} );

				expect( result ).toBe( [
					'Website: asdf.com',
					'Email: <a href="mailto:asdf@asdf.com">asdf@asdf.com</a>',
					'Phone: <a href="tel:1234567890">(123) 456-7890</a>',
					'Mention: <a href="https://twitter.com/asdf">@asdf</a>',
					'Hashtag: <a href="https://twitter.com/hashtag/asdf">#asdf</a>'
				].join( ", " ) );
			} );


			it( "should not link email addresses when they are disabled", function() {
				var result = Autolinker.link( inputStr, {
					mention: 'twitter',
					hashtag: 'twitter',
					email: false,
					newWindow: false
				} );

				expect( result ).toBe( [
					'Website: <a href="http://asdf.com">asdf.com</a>',
					'Email: asdf@asdf.com',
					'Phone: <a href="tel:1234567890">(123) 456-7890</a>',
					'Mention: <a href="https://twitter.com/asdf">@asdf</a>',
					'Hashtag: <a href="https://twitter.com/hashtag/asdf">#asdf</a>'
				].join( ", " ) );
			} );


			it( "should not link phone numbers when they are disabled", function() {
				var result = Autolinker.link( inputStr, {
					hashtag   : 'twitter',
					mention   : 'twitter',
					phone     : false,
					newWindow : false
				} );

				expect( result ).toBe( [
					'Website: <a href="http://asdf.com">asdf.com</a>',
					'Email: <a href="mailto:asdf@asdf.com">asdf@asdf.com</a>',
					'Phone: (123) 456-7890',
					'Mention: <a href="https://twitter.com/asdf">@asdf</a>',
					'Hashtag: <a href="https://twitter.com/hashtag/asdf">#asdf</a>'
				].join( ", " ) );
			} );


			it( "should not link mention handles when they are disabled", function() {
				var result = Autolinker.link( inputStr, {
					newWindow: false,
					hashtag: 'twitter',
					mention: false
				} );

				expect( result ).toBe( [
					'Website: <a href="http://asdf.com">asdf.com</a>',
					'Email: <a href="mailto:asdf@asdf.com">asdf@asdf.com</a>',
					'Phone: <a href="tel:1234567890">(123) 456-7890</a>',
					'Mention: @asdf',
					'Hashtag: <a href="https://twitter.com/hashtag/asdf">#asdf</a>'
				].join( ", " ) );
			} );


			it( "should not link Hashtags when they are disabled", function() {
				var result = Autolinker.link( inputStr, {
					mention   : 'twitter',
					hashtag   : false,
					newWindow : false
				} );

				expect( result ).toBe( [
					'Website: <a href="http://asdf.com">asdf.com</a>',
					'Email: <a href="mailto:asdf@asdf.com">asdf@asdf.com</a>',
					'Phone: <a href="tel:1234567890">(123) 456-7890</a>',
					'Mention: <a href="https://twitter.com/asdf">@asdf</a>',
					'Hashtag: #asdf'
				].join( ", " ) );
			} );

		} );


		describe( "`replaceFn` option", function() {
			var returnTrueFn = function() { return true; },
			    returnFalseFn = function() { return false; },
			    replaceFnSpy;

			beforeEach( function() {
				replaceFnSpy = jasmine.createSpy( 'replaceFnSpy' );
			} );


			it( "by default, should be called with with the `Autolinker` instance " +
				"as the context object (`this` reference)",
			function() {
				var replaceFnAutolinker = new Autolinker( {
					replaceFn: replaceFnSpy
				} );
				replaceFnAutolinker.link( "asdf.com" );  // will call the `replaceFn`

				expect( replaceFnSpy ).toHaveBeenCalled();
				expect( replaceFnSpy.calls.first().object ).toBe( replaceFnAutolinker );
			} );


			it( "when provided a `context` option, should be called with with " +
				"that object as the context object (`this` reference)",
			function() {
				var contextObj = { prop: 'value' };
				var replaceFnAutolinker = new Autolinker( {
					replaceFn : replaceFnSpy,
					context   : contextObj
				} );
				replaceFnAutolinker.link( "asdf.com" );  // will call the `replaceFn`

				expect( replaceFnSpy ).toHaveBeenCalled();
				expect( replaceFnSpy.calls.first().object ).toBe( contextObj );
			} );


			it( "should populate a UrlMatch object with the appropriate properties", function() {
				var replaceFnCallCount = 0;
				var result = Autolinker.link( "Website: asdf.com ", {  // purposeful trailing space
					replaceFn : function( match ) {
						replaceFnCallCount++;

						expect( match.getMatchedText() ).toBe( 'asdf.com' );
						expect( match.getUrl() ).toBe( 'http://asdf.com' );
					}
				} );

				expect( replaceFnCallCount ).toBe( 1 );  // make sure the replaceFn was called
			} );


			it( "should populate an EmailMatch object with the appropriate properties", function() {
				var replaceFnCallCount = 0;
				var result = Autolinker.link( "Email: asdf@asdf.com ", {  // purposeful trailing space
					replaceFn : function( match ) {
						replaceFnCallCount++;

						expect( match.getMatchedText() ).toBe( 'asdf@asdf.com' );
						expect( match.getEmail() ).toBe( 'asdf@asdf.com' );
					}
				} );

				expect( replaceFnCallCount ).toBe( 1 );  // make sure the replaceFn was called
			} );


			it( "should populate a HashtagMatch object with the appropriate properties", function() {
				var replaceFnCallCount = 0;
				var result = Autolinker.link( "Hashtag: #myHashtag ", {  // purposeful trailing space
					hashtag: 'twitter',
					replaceFn : function( match ) {
						replaceFnCallCount++;

						expect( match.getType() ).toBe( 'hashtag' );
						expect( match.getMatchedText() ).toBe( '#myHashtag' );
						expect( match.getHashtag() ).toBe( 'myHashtag' );
					}
				} );

				expect( replaceFnCallCount ).toBe( 1 );  // make sure the replaceFn was called
			} );


			it( "should populate a TwitterMatch object with the appropriate properties", function() {
				var replaceFnCallCount = 0;
				var result = Autolinker.link( "Twitter: @myTwitter ", {  // purposeful trailing space
					mention: 'twitter',
					replaceFn : function( match ) {
						replaceFnCallCount++;

						expect( match.getMatchedText() ).toBe( '@myTwitter' );
						expect( match.getMention() ).toBe( 'myTwitter' );
					}
				} );

				expect( replaceFnCallCount ).toBe( 1 );  // make sure the replaceFn was called
			} );


			it( "should populate a MentionMatch object with the appropriate properties", function() {
				var replaceFnCallCount = 0;
				var result = Autolinker.link( "Mention: @myTwitter ", {  // purposeful trailing space
					mention: 'twitter',
					replaceFn : function( match ) {
						replaceFnCallCount++;

						expect( match.getMatchedText() ).toBe( '@myTwitter' );
						expect( match.getMention() ).toBe( 'myTwitter' );
					}
				} );

				expect( replaceFnCallCount ).toBe( 1 );  // make sure the replaceFn was called
			} );


			it( "should replace the match as Autolinker would normally do when `true` is returned from the `replaceFn`", function() {
				var result = Autolinker.link( "Website: asdf.com, Email: asdf@asdf.com, Twitter: @asdf", {
					mention   : 'twitter',
					newWindow : false,  // just to suppress the target="_blank" from the output for this test
					replaceFn : returnTrueFn
				} );

				expect( result ).toBe( [
					'Website: <a href="http://asdf.com">asdf.com</a>',
					'Email: <a href="mailto:asdf@asdf.com">asdf@asdf.com</a>',
					'Twitter: <a href="https://twitter.com/asdf">@asdf</a>'
				].join( ", " ) );
			} );


			it( "should replace the match as Autolinker would normally do when there is no return value (i.e. `undefined` is returned) from the `replaceFn`", function() {
				var result = Autolinker.link( "Website: asdf.com, Email: asdf@asdf.com, Twitter: @asdf", {
					mention   : 'twitter',
					newWindow : false,  // just to suppress the target="_blank" from the output for this test
					replaceFn : function() {}  // no return value (`undefined` is returned)
				} );

				expect( result ).toBe( [
					'Website: <a href="http://asdf.com">asdf.com</a>',
					'Email: <a href="mailto:asdf@asdf.com">asdf@asdf.com</a>',
					'Twitter: <a href="https://twitter.com/asdf">@asdf</a>'
				].join( ", " ) );
			} );


			it( "should leave the match as-is when `false` is returned from the `replaceFn`", function() {
				var result = Autolinker.link( "Website: asdf.com, Email: asdf@asdf.com, Twitter: @asdf", {
					mention   : 'twitter',
					replaceFn : returnFalseFn
				} );

				expect( result ).toBe( [
					'Website: asdf.com',
					'Email: asdf@asdf.com',
					'Twitter: @asdf'
				].join( ", " ) );
			} );


			it( "should use a string returned from the `replaceFn` as the HTML that is replaced in the input", function() {
				var result = Autolinker.link( "Website: asdf.com, Email: asdf@asdf.com, Twitter: @asdf", {
					mention   : 'twitter',
					replaceFn : function() { return "test"; }
				} );

				expect( result ).toBe( "Website: test, Email: test, Twitter: test" );
			} );


			it( "should allow an Autolinker.HtmlTag instance to be returned from the `replaceFn`, and use that as the HTML to be replaced from the input", function() {
				var result = Autolinker.link( "Website: asdf.com", {
					newWindow : false,

					replaceFn : function( match ) {
						var tag = match.buildTag();
						tag.setInnerHtml( 'asdf!' );  // just to check that we're replacing with the returned `tag` instance
						return tag;
					}
				} );

				expect( result ).toBe( 'Website: <a href="http://asdf.com">asdf!</a>' );
			} );


			it( "should allow an Autolinker.HtmlTag instance to be modified before being returned from the `replaceFn`", function() {
				var result = Autolinker.link( "Website: asdf.com", {
					newWindow : false,

					replaceFn : function( match ) {
						var tag = match.buildTag();
						tag.addClass( 'test' );
						tag.addClass( 'test2' );
						tag.setAttr( 'rel', 'nofollow' );
						return tag;
					}
				} );

				expect( result ).toBe( 'Website: <a href="http://asdf.com" class="test test2" rel="nofollow">asdf.com</a>' );
			} );


			it( "should not drop a trailing parenthesis of a URL match if the `replaceFn` returns false", function() {
				var result = Autolinker.link( "Go to the website (asdf.com) and see", {
					newWindow : false,
					replaceFn : returnFalseFn
				} );

				expect( result ).toBe( 'Go to the website (asdf.com) and see' );
			} );


			describe( 'special cases which check the `prefixStr` and `suffixStr` vars in the code', function() {

				it( "should leave the match as-is when the `replaceFn` returns `false` for a Twitter match", function() {
					var result = Autolinker.link( "@asdf", { replaceFn: returnFalseFn } );
					expect( result ).toBe( "@asdf" );

					var result2 = Autolinker.link( "Twitter: @asdf", { mention: 'twitter', replaceFn: returnFalseFn } );
					expect( result2 ).toBe( "Twitter: @asdf" );
				} );


				it( "should leave the match as-is when the `replaceFn` returns `false`, and the URL was wrapped in parenthesis", function() {
					var result = Autolinker.link( "Go to (yahoo.com) my friend", { replaceFn: returnFalseFn } );
					expect( result ).toBe( "Go to (yahoo.com) my friend" );

					var result2 = Autolinker.link( "Go to en.wikipedia.org/wiki/IANA_(disambiguation) my friend", { replaceFn: returnFalseFn } );
					expect( result2 ).toBe( "Go to en.wikipedia.org/wiki/IANA_(disambiguation) my friend" );

					var result3 = Autolinker.link( "Go to (en.wikipedia.org/wiki/IANA_(disambiguation)) my friend", { replaceFn: returnFalseFn } );
					expect( result3 ).toBe( "Go to (en.wikipedia.org/wiki/IANA_(disambiguation)) my friend" );
				} );


				it( "should leave the match as-is when the `replaceFn` returns `false`, and the URL was a protocol-relative match", function() {
					var result = Autolinker.link( "Go to //yahoo.com my friend", { replaceFn: returnFalseFn } );
					expect( result ).toBe( "Go to //yahoo.com my friend" );
				} );

			} );

		} );

	} );


	describe( 'all match types tests', function() {
		var testCases = {
			schemeUrl : {
				unlinked : 'http://google.com/path?param1=value1&param2=value2#hash',
				linked   : '<a href="http://google.com/path?param1=value1&param2=value2#hash">http://google.com/path?param1=value1&param2=value2#hash</a>'
			},
			wwwUrl : {
				unlinked : 'www.google.com/path?param1=value1&param2=value2#hash',
				linked   : '<a href="http://www.google.com/path?param1=value1&param2=value2#hash">www.google.com/path?param1=value1&param2=value2#hash</a>'
			},
			tldUrl : {
				unlinked : 'google.com/path?param1=value1&param2=value2#hash',
				linked   : '<a href="http://google.com/path?param1=value1&param2=value2#hash">google.com/path?param1=value1&param2=value2#hash</a>'
			},
			email : {
				unlinked : 'asdf@asdf.com',
				linked   : '<a href="mailto:asdf@asdf.com">asdf@asdf.com</a>'
			},
			mention : {
				unlinked : '@asdf',
				linked   : '<a href="https://twitter.com/asdf">@asdf</a>'
			},
			phone : {
				unlinked : '123-456-7890',
				linked   : '<a href="tel:1234567890">123-456-7890</a>'
			},
			hashtag : {
				unlinked : '#Winning',
				linked   : '<a href="https://twitter.com/hashtag/Winning">#Winning</a>'
			}
		};

		var numTestCaseKeys = Object.keys( testCases ).length;

		var paragraphTpl = _.template( [
			'Check link 1: <%= schemeUrl %>.',
			'Check link 2: <%= wwwUrl %>.',
			'Check link 3: <%= tldUrl %>.',
			'My email is: <%= email %>.',
			'My mention (twitter) username is <%= mention %>.',
			'My phone number is <%= phone %>.',
			'Hashtag <%= hashtag %>.'
		].join( '\n' ) );

		var sourceParagraph = paragraphTpl( {
			schemeUrl : testCases.schemeUrl.unlinked,
			wwwUrl    : testCases.wwwUrl.unlinked,
			tldUrl    : testCases.tldUrl.unlinked,
			email     : testCases.email.unlinked,
			mention   : testCases.mention.unlinked,
			phone     : testCases.phone.unlinked,
			hashtag   : testCases.hashtag.unlinked
		} );



		it( 'should replace matches appropriately in a paragraph of text, using a variety of enabled matchers. Want to make sure that when one match type is disabled (such as emails), that other ones don\'t accidentally link part of them (such as from the url matcher)', function() {
			// We're going to run through every combination of matcher settings
			// possible.
			// 7 different settings and two possibilities for each (on or off)
			// is 2^7 == 128 settings possibilities
			for( var i = 0, len = Math.pow( 2, numTestCaseKeys ); i < len; i++ ) {
				var cfg = {
					schemeMatches : !!( i & parseInt( '00000001', 2 ) ),
				    wwwMatches    : !!( i & parseInt( '00000010', 2 ) ),
				    tldMatches    : !!( i & parseInt( '00000100', 2 ) ),
				    email         : !!( i & parseInt( '00001000', 2 ) ),
					mention       : !!( i & parseInt( '00010000', 2 ) ) ? 'twitter' : false,
				    phone         : !!( i & parseInt( '00100000', 2 ) ),
				    hashtag       : !!( i & parseInt( '01000000', 2 ) ) ? 'twitter' : false
				};

				var autolinker = new Autolinker( {
					urls        : {
						schemeMatches : cfg.schemeMatches,
						wwwMatches    : cfg.wwwMatches,
						tldMatches    : cfg.tldMatches
					},
					email       : cfg.email,
					mention     : cfg.mention,
					phone       : cfg.phone,
					hashtag     : cfg.hashtag,

					newWindow   : false,
					stripPrefix : false
				} );

				var result = autolinker.link( sourceParagraph ),
				    resultLines = result.split( '\n' ),  // splitting line-by-line to make it easier to see where a failure is
				    expectedLines = generateExpectedLines( cfg );

				expect( resultLines.length ).toBe( expectedLines.length );  // just in case

				for( var j = 0, jlen = expectedLines.length; j < jlen; j++ ) {
					if( resultLines[ j ] !== expectedLines[ j ] ) {
						var errorMsg = generateErrMsg( resultLines[ j ], expectedLines[ j ], cfg );
						throw new Error( errorMsg );
					}
				}
			}


			function generateExpectedLines( cfg ) {
				var expectedLines = paragraphTpl( {
					schemeUrl : cfg.schemeMatches ? testCases.schemeUrl.linked : testCases.schemeUrl.unlinked,
					wwwUrl    : cfg.wwwMatches    ? testCases.wwwUrl.linked    : testCases.wwwUrl.unlinked,
					tldUrl    : cfg.tldMatches    ? testCases.tldUrl.linked    : testCases.tldUrl.unlinked,
					email     : cfg.email         ? testCases.email.linked     : testCases.email.unlinked,
					mention   : cfg.mention       ? testCases.mention.linked   : testCases.mention.unlinked,
					phone     : cfg.phone         ? testCases.phone.linked     : testCases.phone.unlinked,
					hashtag   : cfg.hashtag       ? testCases.hashtag.linked   : testCases.hashtag.unlinked
				} );

				return expectedLines.split( '\n' );  // splitting line-by-line to make it easier to see where a failure is
			}


			function generateErrMsg( resultLine, expectedLine, cfg ) {
				var errorMsg = [
				    'Expected: \'' + resultLine + '\' to be \'' + expectedLine + '\'\n'
				];

				errorMsg.push( '{' );
				_.forOwn( cfg, function( value, key ) {
					errorMsg.push( '\t' + key + ': ' + value );
				} );
				errorMsg.push( '}' );

				return errorMsg.join( '\n' );
			}
		} );


		it( "should be able to parse a very long string", function() {
			var testStr = (function() {
				var t = [];
				for (var i = 0; i < 50000; i++) {
					t.push( ' foo' );
				}
				return t.join( '' );
			})();

			var result = Autolinker.link( testStr );
			expect( result ).toBe( testStr );
		} );

	} );


	describe( 'static parse()', function() {

		it( 'should return an array of Match objects for the input', function() {
			var text = [
				'Website: asdf.com',
				'Email: asdf@asdf.com',
				'Phone: (123) 456-7890',
				'Mention: @asdf1',
				'Hashtag: #asdf2'
			].join( ' ' );

			var matches = Autolinker.parse( text, {
				hashtag : 'twitter',
				mention : 'twitter'
			} );

			expect( matches.length ).toBe( 5 );

			expect( matches[ 0 ].getType() ).toBe( 'url' );
			expect( matches[ 0 ].getUrl() ).toBe( 'http://asdf.com' );

			expect( matches[ 1 ].getType() ).toBe( 'email' );
			expect( matches[ 1 ].getEmail() ).toBe( 'asdf@asdf.com' );

			expect( matches[ 2 ].getType() ).toBe( 'phone' );
			expect( matches[ 2 ].getNumber() ).toBe( '1234567890' );

			expect( matches[ 3 ].getType() ).toBe( 'mention' );
			expect( matches[ 3 ].getMention() ).toBe( 'asdf1' );

			expect( matches[ 4 ].getType() ).toBe( 'hashtag' );
			expect( matches[ 4 ].getHashtag() ).toBe( 'asdf2' );
		} );

		describe( 'custom Phone.prototype.matcherRegex', function() {
			const matcherRegexOriginal = Autolinker.matcher.Phone.prototype.matcherRegex;

			beforeEach( function() {
				const phoneInTextRegex = /(\+?852\-?)?[569]\d{3}\-?\d{4}/g;
				Autolinker.matcher.Phone.prototype.matcherRegex = phoneInTextRegex;
				Autolinker.matcher.Phone.prototype.testMatch = function() { return true; };
			} );

			afterEach( function() {
				Autolinker.matcher.Phone.prototype.matcherRegex = matcherRegexOriginal;
			} );

			it( 'should match custom matcherRegex', function() {
				var text = [
					'91234567',
					'9123-4567',
					'61234567',
					'51234567',
					'+85291234567',
					'+852-91234567',
					'+852-9123-4567',
					'852-91234567',
					// invalid
					'999',
					'+852-912345678',
					'123456789',
					'+852-1234-56789',
				].join( ' / ' );

				var matches = Autolinker.parse( text, {
					hashtag : 'twitter',
					mention : 'twitter'
				} );

				expect( matches.length ).toBe( 9 );

				expect( matches[ 0 ].getType() ).toBe( 'phone' );
				expect( matches[ 0 ].getNumber() ).toBe( '91234567' );

				expect( matches[ 2 ].getType() ).toBe( 'phone' );
				expect( matches[ 2 ].getNumber() ).toBe( '61234567' );
			} );

		} );

	} );



	describe( 'parse()', function() {

		it( 'should return an array of Match objects for the input', function() {
			var autolinker = new Autolinker( {
				hashtag : 'twitter',
				mention : 'twitter'
			} );

			var text = [
				'Website: asdf.com',
				'Email: asdf@asdf.com',
				'Phone: (123) 456-7890',
				'Mention: @asdf1',
				'Hashtag: #asdf2'
			].join( ' ' );
			var matches = autolinker.parse( text );

			expect( matches.length ).toBe( 5 );

			expect( matches[ 0 ].getType() ).toBe( 'url' );
			expect( matches[ 0 ].getUrl() ).toBe( 'http://asdf.com' );

			expect( matches[ 1 ].getType() ).toBe( 'email' );
			expect( matches[ 1 ].getEmail() ).toBe( 'asdf@asdf.com' );

			expect( matches[ 2 ].getType() ).toBe( 'phone' );
			expect( matches[ 2 ].getNumber() ).toBe( '1234567890' );

			expect( matches[ 3 ].getType() ).toBe( 'mention' );
			expect( matches[ 3 ].getMention() ).toBe( 'asdf1' );

			expect( matches[ 4 ].getType() ).toBe( 'hashtag' );
			expect( matches[ 4 ].getHashtag() ).toBe( 'asdf2' );
		} );

	} );

} );
