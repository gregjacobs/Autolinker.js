import _ from 'lodash';
import Autolinker from '../src/autolinker';

describe( "Autolinker Url Matching -", () => {
	const autolinker = new Autolinker( { newWindow: false } );  // so that target="_blank" is not added to resulting autolinked URLs

	describe( "protocol-prefixed URLs (i.e. URLs starting with http:// or https://)", function() {

		it( "should automatically link URLs in the form of http://yahoo.com", function() {
			let result = autolinker.link( "Joe went to http://yahoo.com" );
			expect( result ).toBe( 'Joe went to <a href="http://yahoo.com">yahoo.com</a>' );
		} );


		it( "should automatically link localhost URLs when there is a protocol", function() {
			let result = autolinker.link( "Joe went to http://localhost today" );
			expect( result ).toBe( 'Joe went to <a href="http://localhost">localhost</a> today' );
		} );


		it( "should automatically link localhost URLs when there is a protocol and port", function() {
			let result = autolinker.link( "Joe went to http://localhost:8000 today" );
			expect( result ).toBe( 'Joe went to <a href="http://localhost:8000">localhost:8000</a> today' );
		} );


		it( "should automatically link localhost URLs when there is a protocol, port, and path", function() {
			let result = autolinker.link( "Joe went to http://localhost:8000/abc today" );
			expect( result ).toBe( 'Joe went to <a href="http://localhost:8000/abc">localhost:8000/abc</a> today' );
		} );


		it( "should automatically link localhost URLs when there is a protocol, port, and query string", function() {
			let result = autolinker.link( "Joe went to http://localhost:8000?abc today" );
			expect( result ).toBe( 'Joe went to <a href="http://localhost:8000?abc">localhost:8000?abc</a> today' );
		} );


		it( "should automatically link localhost URLs when there is a protocol, port, and hash", function() {
			let result = autolinker.link( "Joe went to http://localhost:8000#abc today" );
			expect( result ).toBe( 'Joe went to <a href="http://localhost:8000#abc">localhost:8000#abc</a> today' );
		} );


		it( "should not include [?!:,.;] chars if at the end of the URL", function() {
			let result1 = autolinker.link( "Joe went to http://localhost:8000? today" );
			expect( result1 ).toBe( 'Joe went to <a href="http://localhost:8000">localhost:8000</a>? today' );
			let result2 = autolinker.link( "Joe went to http://localhost:8000! today" );
			expect( result2 ).toBe( 'Joe went to <a href="http://localhost:8000">localhost:8000</a>! today' );
			let result3 = autolinker.link( "Joe went to http://localhost:8000: today" );
			expect( result3 ).toBe( 'Joe went to <a href="http://localhost:8000">localhost:8000</a>: today' );
			let result4 = autolinker.link( "Joe went to http://localhost:8000, today" );
			expect( result4 ).toBe( 'Joe went to <a href="http://localhost:8000">localhost:8000</a>, today' );
			let result5 = autolinker.link( "Joe went to http://localhost:8000. today" );
			expect( result5 ).toBe( 'Joe went to <a href="http://localhost:8000">localhost:8000</a>. today' );
			let result6 = autolinker.link( "Joe went to http://localhost:8000; today" );
			expect( result6 ).toBe( 'Joe went to <a href="http://localhost:8000">localhost:8000</a>; today' );
		} );


		it( "should exclude invalid chars after TLD", function() {
			let result1 = autolinker.link( "Joe went to http://www.yahoo.com's today" );
			expect( result1 ).toBe( 'Joe went to <a href="http://www.yahoo.com">yahoo.com</a>\'s today' );
			let result2 = autolinker.link( "Joe went to https://www.yahoo.com/foo's today" );
			expect( result2 ).toBe( 'Joe went to <a href="https://www.yahoo.com/foo\'s">yahoo.com/foo\'s</a> today' );
			let result3 = autolinker.link( "Joe went to http://www.yahoo.com's/foo today" );
			expect( result3 ).toBe( 'Joe went to <a href="http://www.yahoo.com">yahoo.com</a>\'s/foo today' );
		} );


		it( "should automatically link URLs in the form of http://www.yahoo.com (i.e. protocol and 'www' prefix)", function() {
			let result = autolinker.link( "Joe went to http://www.yahoo.com" );
			expect( result ).toBe( 'Joe went to <a href="http://www.yahoo.com">yahoo.com</a>' );
		} );


		it( "should automatically link https URLs in the form of https://yahoo.com", function() {
			let result = autolinker.link( "Joe went to https://www.yahoo.com" );
			expect( result ).toBe( 'Joe went to <a href="https://www.yahoo.com">yahoo.com</a>' );
		} );
		
		
		it( 'should automatically link URLs with IP addresses', function() {
			let result = autolinker.link( 'http://66.102.7.147' );
			expect( result ).toBe( '<a href="http://66.102.7.147">66.102.7.147</a>' );
		} );
		

		it( 'should automatically link URLs with IP addresses and a port number', function() {
			let result = autolinker.link( 'http://10.0.0.108:9000/' );
			expect( result ).toBe( '<a href="http://10.0.0.108:9000/">10.0.0.108:9000</a>' );
		} );
		

		it( "should automatically link capitalized URLs", function() {
			let result = autolinker.link( "Joe went to HTTP://WWW.YAHOO.COM" );
			expect( result ).toBe( 'Joe went to <a href="HTTP://WWW.YAHOO.COM">YAHOO.COM</a>' );
		} );


		it( "should automatically link 'yahoo.xyz' (a known TLD), but not 'sencha.etc' (an unknown TLD)", function() {
			let result = autolinker.link( "yahoo.xyz should be linked, sencha.etc should not" );
			expect( result ).toBe( '<a href="http://yahoo.xyz">yahoo.xyz</a> should be linked, sencha.etc should not' );
		} );


		it( "should automatically link 'a.museum' (a known TLD), but not 'abc.123'", function() {
			let result = autolinker.link( "a.museum should be linked, but abc.123 should not" );
			expect( result ).toBe( '<a href="http://a.museum">a.museum</a> should be linked, but abc.123 should not' );
		} );


		it( "should automatically link URLs in the form of 'http://yahoo.com.', without including the trailing period", function() {
			let result = autolinker.link( "Joe went to http://yahoo.com." );
			expect( result ).toBe( 'Joe went to <a href="http://yahoo.com">yahoo.com</a>.' );
		} );
		

		it( "should automatically link URLs with a port number", function() {
			let result = autolinker.link( "Joe went to http://yahoo.com:8000 today." );
			expect( result ).toBe( 'Joe went to <a href="http://yahoo.com:8000">yahoo.com:8000</a> today.' );
		} );


		it( "should automatically link URLs with a port number and a following slash", function() {
			let result = autolinker.link( "Joe went to http://yahoo.com:8000/ today." );
			expect( result ).toBe( 'Joe went to <a href="http://yahoo.com:8000/">yahoo.com:8000</a> today.' );
		} );


		it( "should automatically link URLs with a port number and a path", function() {
			let result = autolinker.link( "Joe went to http://yahoo.com:8000/mysite/page today." );
			expect( result ).toBe( 'Joe went to <a href="http://yahoo.com:8000/mysite/page">yahoo.com:8000/mysite/page</a> today.' );
		} );


		it( "should automatically link a localhost URL with a port number and a path", function() {
			let result = autolinker.link( "Joe went to http://localhost:8000/my-page today." );
			expect( result ).toBe( 'Joe went to <a href="http://localhost:8000/my-page">localhost:8000/my-page</a> today.' );
		} );
		

		it( "should automatically link URLs with a port number and a query string", function() {
			let result = autolinker.link( "Joe went to http://yahoo.com:8000?page=index today." );
			expect( result ).toBe( 'Joe went to <a href="http://yahoo.com:8000?page=index">yahoo.com:8000?page=index</a> today.' );
		} );
		

		it( "should automatically link a localhost URL with a port number and a query string", function() {
			let result = autolinker.link( "Joe went to http://localhost:8000?page=index today." );
			expect( result ).toBe( 'Joe went to <a href="http://localhost:8000?page=index">localhost:8000?page=index</a> today.' );
		} );


		it( "should automatically link URLs with a port number and a hash string", function() {
			let result = autolinker.link( "Joe went to http://yahoo.com:8000#page=index today." );
			expect( result ).toBe( 'Joe went to <a href="http://yahoo.com:8000#page=index">yahoo.com:8000#page=index</a> today.' );
		} );


		it( "should automatically link a localhost URL with a port number and a hash string", function() {
			let result = autolinker.link( "Joe went to http://localhost:8000#page=index today." );
			expect( result ).toBe( 'Joe went to <a href="http://localhost:8000#page=index">localhost:8000#page=index</a> today.' );
		} );


		it( "should automatically link domain names, paths, query strings, and hashes with numbers in them", function() {
			let result = autolinker.link( "Joe went to https://abc123def.org/path1/2path?param1=value1#hash123z" );
			expect( result ).toBe( 'Joe went to <a href="https://abc123def.org/path1/2path?param1=value1#hash123z">abc123def.org/path1/2path?param1=value1#hash123z</a>' );
		} );


		it( "should automatically link domain names, paths, query strings, and hashes with dashes in them", function() {
			let result = autolinker.link( "Joe went to https://abc-def.org/his-path/?the-param=the-value#the-hash" );
			expect( result ).toBe( 'Joe went to <a href="https://abc-def.org/his-path/?the-param=the-value#the-hash">abc-def.org/his-path/?the-param=the-value#the-hash</a>' );
		} );


		it( "should automatically link domain names, paths, query strings, and hashes with the set of allowed special characters in them", function() {
			let result = autolinker.link( "Link: https://abc123def.org/-+&@#/%=~_()|\'$*[]?!:,.;/?param1=value-+&@#/%=~_()|\'$*[]?!:,.;#hash-+&@#/%=~_()|\'$*[]?!:,.;z" );
			expect( result ).toBe( 'Link: <a href="https://abc123def.org/-+&@#/%=~_()|\'$*[]?!:,.;/?param1=value-+&@#/%=~_()|\'$*[]?!:,.;#hash-+&@#/%=~_()|\'$*[]?!:,.;z">abc123def.org/-+&@#/%=~_()|\'$*[]?!:,.;/?param1=value-+&@#/%=~_()|\'$*[]?!:,.;#hash-+&@#/%=~_()|\'$*[]?!:,.;z</a>' );
		} );


		it( "should automatically link URLs with periods in the path", () => {
			const result1 = autolinker.link( 'https://images-na.ssl-images-amazon.com/images/I/912ozjp0ytL._SY450_.jpg' );
			expect( result1 ).toBe( '<a href="https://images-na.ssl-images-amazon.com/images/I/912ozjp0ytL._SY450_.jpg">images-na.ssl-images-amazon.com/images/I/912ozjp0ytL._SY450_.jpg</a>' );
			
			const result2 = autolinker.link( 'My image is at: https://images-na.ssl-images-amazon.com/images/I/912ozjp0ytL._SY450_.jpg - check it out' );
			expect( result2 ).toBe( 'My image is at: <a href="https://images-na.ssl-images-amazon.com/images/I/912ozjp0ytL._SY450_.jpg">images-na.ssl-images-amazon.com/images/I/912ozjp0ytL._SY450_.jpg</a> - check it out' );
		} );
		

		it( "should automatically link a URL with accented characters", function() {
			let result = autolinker.link( "Joe went to http://mañana.com/mañana?mañana=1#mañana today." );
			expect( result ).toBe( 'Joe went to <a href="http://mañana.com/mañana?mañana=1#mañana">mañana.com/mañana?mañana=1#mañana</a> today.' );
		} );


		it( "should automatically link cyrillic URLs", function() {
			let result = autolinker.link( "Joe went to https://ru.wikipedia.org/wiki/Кириллица?Кириллица=1#Кириллица" );
			expect( result ).toBe( 'Joe went to <a href="https://ru.wikipedia.org/wiki/Кириллица?Кириллица=1#Кириллица">ru.wikipedia.org/wiki/Кириллица?Кириллица=1#Кириллица</a>' );
		} );


		it( "should automatically link international domain names", function() {
			let result1 = autolinker.link( "Русским гораздо проще набрать россия.рф на клавиатуре." );
			expect( result1 ).toBe( 'Русским гораздо проще набрать <a href="http://россия.рф">россия.рф</a> на клавиатуре.' );

			let result2 = autolinker.link( "Русским гораздо проще набрать http://россия.рф на клавиатуре." );
			expect( result2 ).toBe( 'Русским гораздо проще набрать <a href="http://россия.рф">россия.рф</a> на клавиатуре.' );

			let result3 = autolinker.link( "Русским гораздо проще набрать //россия.рф на клавиатуре." );
			expect( result3 ).toBe( 'Русским гораздо проще набрать <a href="//россия.рф">россия.рф</a> на клавиатуре.' );
		} );


		it( "should automatically link domain names represented in punicode", function() {
			let result1 = autolinker.link( "For compatibility reasons, xn--d1acufc.xn--p1ai is an acceptable form of an international domain." );
			expect( result1 ).toBe( 'For compatibility reasons, <a href="http://xn--d1acufc.xn--p1ai">xn--d1acufc.xn--p1ai</a> is an acceptable form of an international domain.' );

			let result2 = autolinker.link( "For compatibility reasons, http://xn--d1acufc.xn--p1ai is an acceptable form of an international domain." );
			expect( result2 ).toBe( 'For compatibility reasons, <a href="http://xn--d1acufc.xn--p1ai">xn--d1acufc.xn--p1ai</a> is an acceptable form of an international domain.' );
		} );


		it( 'should match local urls with numbers when prefixed with http://', function() {
			let result1 = autolinker.link( 'http://localhost.local001/test' );
			expect( result1 ).toBe( '<a href="http://localhost.local001/test">localhost.local001/test</a>' );

			let result2 = autolinker.link( 'http://suus111.w10:8090/display/test/AI' );
			expect( result2 ).toBe( '<a href="http://suus111.w10:8090/display/test/AI">suus111.w10:8090/display/test/AI</a>' );
		} );


		it( 'should not match local urls with numbers when NOT prefixed with http://', function() {
			let result1 = autolinker.link( 'localhost.local001/test' );
			expect( result1 ).toBe( 'localhost.local001/test' );

			let result2 = autolinker.link( 'suus111.w10:8090/display/test/AI' );
			expect( result2 ).toBe( 'suus111.w10:8090/display/test/AI' );
		} );


		it( 'should not match an address with multiple dots', function() {
			expect( autolinker.link( 'hello:...world' ) ).toBe( 'hello:...world' );
			expect( autolinker.link( 'hello:wo.....rld' ) ).toBe( 'hello:wo.....rld' );
		});


		describe( "protocol linking", function() {

			it( "should NOT include preceding ':' introductions without a space", function() {
				let result = autolinker.link( 'the link:http://example.com/' );
				expect( result ).toBe( 'the link:<a href="http://example.com/">example.com</a>' );
			} );


			it( "should autolink protocols with at least one character", function() {
				let result = autolinker.link( 'link this: g://example.com/' );
				expect( result ).toBe( 'link this: <a href="g://example.com/">g://example.com</a>' );
			} );


			it( "should autolink protocols with more than 9 characters (as was the previous upper bound, but it seems protocols may be longer)", function() {
				let result = autolinker.link( 'link this: opaquelocktoken://example' );
				expect( result ).toBe( 'link this: <a href="opaquelocktoken://example">opaquelocktoken://example</a>' );
			} );


			it( "should autolink protocols with digits, dashes, dots, and plus signs in their names", function() {
				let result1 = autolinker.link( 'link this: a1://example' );
				expect( result1 ).toBe( 'link this: <a href="a1://example">a1://example</a>' );

				let result2 = autolinker.link( 'link this: view-source://example' );
				expect( result2 ).toBe( 'link this: <a href="view-source://example">view-source://example</a>' );

				let result3 = autolinker.link( 'link this: iris.xpc://example' );
				expect( result3 ).toBe( 'link this: <a href="iris.xpc://example">iris.xpc://example</a>' );

				let result4 = autolinker.link( 'link this: test+protocol://example' );
				expect( result4 ).toBe( 'link this: <a href="test+protocol://example">test+protocol://example</a>' );

				// Test all allowed non-alpha chars
				let result5 = autolinker.link( 'link this: test+proto-col.123://example' );
				expect( result5 ).toBe( 'link this: <a href="test+proto-col.123://example">test+proto-col.123://example</a>' );
			} );


			it( "should NOT autolink protocols that start with a digit, dash, plus sign, or dot, as per http://tools.ietf.org/html/rfc3986#section-3.1", function() {
				let result = autolinker.link( 'do not link first char: 1a://example' );
				expect( result ).toBe( 'do not link first char: 1<a href="a://example">a://example</a>' );

				let result2 = autolinker.link( 'do not link first char: -a://example' );
				expect( result2 ).toBe( 'do not link first char: -<a href="a://example">a://example</a>' );

				let result3 = autolinker.link( 'do not link first char: +a://example' );
				expect( result3 ).toBe( 'do not link first char: +<a href="a://example">a://example</a>' );

				let result4 = autolinker.link( 'do not link first char: .a://example' );
				expect( result4 ).toBe( 'do not link first char: .<a href="a://example">a://example</a>' );

				let result5 = autolinker.link( 'do not link first char: .aa://example' );
				expect( result5 ).toBe( 'do not link first char: .<a href="aa://example">aa://example</a>' );
			} );


			it( "should NOT autolink possible URLs with the 'javascript:' URI scheme", function() {
				let result = autolinker.link( "do not link javascript:window.alert('hi') please" );
				expect( result ).toBe( "do not link javascript:window.alert('hi') please" );
			} );


			it( "should NOT autolink possible URLs with the 'javascript:' URI scheme, with different upper/lowercase letters in the uri scheme", function() {
				let result = autolinker.link( "do not link JavAscriPt:window.alert('hi') please" );
				expect( result ).toBe( "do not link JavAscriPt:window.alert('hi') please" );
			} );


			it( "should NOT autolink possible URLs with the 'vbscript:' URI scheme", function() {
				let result = autolinker.link( "do not link vbscript:window.alert('hi') please" );
				expect( result ).toBe( "do not link vbscript:window.alert('hi') please" );
			} );


			it( "should NOT autolink possible URLs with the 'vbscript:' URI scheme, with different upper/lowercase letters in the uri scheme", function() {
				let result = autolinker.link( "do not link vBsCriPt:window.alert('hi') please" );
				expect( result ).toBe( "do not link vBsCriPt:window.alert('hi') please" );
			} );


			it( "should NOT automatically link strings of the form 'git:d' (using the heuristic that the domain name does not have a '.' in it)", function() {
				let result = autolinker.link( 'Something like git:d should not be linked as a URL' );
				expect( result ).toBe( 'Something like git:d should not be linked as a URL' );
			} );


			it( "should NOT automatically link strings of the form 'git:domain' (using the heuristic that the domain name does not have a '.' in it)", function() {
				let result = autolinker.link( 'Something like git:domain should not be linked as a URL' );
				expect( result ).toBe( 'Something like git:domain should not be linked as a URL' );
			} );


			it( "should automatically link strings of the form 'git:domain.com', interpreting this as a protocol and domain name", function() {
				let result = autolinker.link( 'Something like git:domain.com should be linked as a URL' );
				expect( result ).toBe( 'Something like <a href="git:domain.com">git:domain.com</a> should be linked as a URL' );
			} );


			it( "should NOT automatically link a string in the form of 'version:1.0'", function() {
				let result = autolinker.link( 'version:1.0' );
				expect( result ).toBe( 'version:1.0' );
			} );


			it( "should NOT automatically link these 'abc:def' style strings", function() {
				let strings = [
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
				let i, len = strings.length, str;

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
			let result = autolinker.link( "Joe went to www.yahoo.com" );
			expect( result ).toBe( 'Joe went to <a href="http://www.yahoo.com">yahoo.com</a>' );
		} );


		it( "should automatically link URLs in the form of 'www.yahoo.com.', without including the trailing period", function() {
			let result = autolinker.link( "Joe went to www.yahoo.com." );
			expect( result ).toBe( 'Joe went to <a href="http://www.yahoo.com">yahoo.com</a>.' );
		} );


		it( "should automatically link URLs in the form of 'www.yahoo.com:8000' (with a port number)", function() {
			let result = autolinker.link( "Joe went to www.yahoo.com:8000 today" );
			expect( result ).toBe( 'Joe went to <a href="http://www.yahoo.com:8000">yahoo.com:8000</a> today' );
		} );


		it( "should automatically link URLs in the form of 'www.yahoo.com:8000/abc' (with a port number and path)", function() {
			let result = autolinker.link( "Joe went to www.yahoo.com:8000/abc today" );
			expect( result ).toBe( 'Joe went to <a href="http://www.yahoo.com:8000/abc">yahoo.com:8000/abc</a> today' );
		} );


		it( "should automatically link URLs in the form of 'www.yahoo.com:8000?abc' (with a port number and query string)", function() {
			let result = autolinker.link( "Joe went to www.yahoo.com:8000?abc today" );
			expect( result ).toBe( 'Joe went to <a href="http://www.yahoo.com:8000?abc">yahoo.com:8000?abc</a> today' );
		} );


		it( "should automatically link URLs in the form of 'www.yahoo.com:8000#abc' (with a port number and hash)", function() {
			let result = autolinker.link( "Joe went to www.yahoo.com:8000#abc today" );
			expect( result ).toBe( 'Joe went to <a href="http://www.yahoo.com:8000#abc">yahoo.com:8000#abc</a> today' );
		} );


		it( "should automatically link capitalized URLs", function() {
			let result = autolinker.link( "Joe went to WWW.YAHOO.COM today" );
			expect( result ).toBe( 'Joe went to <a href="http://WWW.YAHOO.COM">YAHOO.COM</a> today' );
		} );


		it( "should not include [?!:,.;] chars if at the end of the URL", function() {
			let result1 = autolinker.link( "Joe went to www.yahoo.com? today" );
			expect( result1 ).toBe( 'Joe went to <a href="http://www.yahoo.com">yahoo.com</a>? today' );
			let result2 = autolinker.link( "Joe went to www.yahoo.com! today" );
			expect( result2 ).toBe( 'Joe went to <a href="http://www.yahoo.com">yahoo.com</a>! today' );
			let result3 = autolinker.link( "Joe went to www.yahoo.com: today" );
			expect( result3 ).toBe( 'Joe went to <a href="http://www.yahoo.com">yahoo.com</a>: today' );
			let result4 = autolinker.link( "Joe went to www.yahoo.com, today" );
			expect( result4 ).toBe( 'Joe went to <a href="http://www.yahoo.com">yahoo.com</a>, today' );
			let result5 = autolinker.link( "Joe went to www.yahoo.com. today" );
			expect( result5 ).toBe( 'Joe went to <a href="http://www.yahoo.com">yahoo.com</a>. today' );
			let result6 = autolinker.link( "Joe went to www.yahoo.com; today" );
			expect( result6 ).toBe( 'Joe went to <a href="http://www.yahoo.com">yahoo.com</a>; today' );
		} );


		it( "should exclude invalid chars after TLD", function() {
			let result1 = autolinker.link( "Joe went to www.yahoo.com's today" );
			expect( result1 ).toBe( 'Joe went to <a href="http://www.yahoo.com">yahoo.com</a>\'s today' );
			let result2 = autolinker.link( "Joe went to www.yahoo.com/foo's today" );
			expect( result2 ).toBe( 'Joe went to <a href="http://www.yahoo.com/foo\'s">yahoo.com/foo\'s</a> today' );
			let result3 = autolinker.link( "Joe went to www.yahoo.com's/foo today" );
			expect( result3 ).toBe( 'Joe went to <a href="http://www.yahoo.com">yahoo.com</a>\'s/foo today' );
		} );

		it( "should automatically link a URL with accented characters", function() {
			let result = autolinker.link( "Joe went to http://www.mañana.com today." );
			expect( result ).toBe( 'Joe went to <a href="http://www.mañana.com">mañana.com</a> today.' );
		} );

	} );


	describe( "URLs with no protocol prefix, and no 'www' (i.e. URLs with known TLDs)", function() {

		it( "should automatically link URLs in the form of yahoo.com, prepending the http:// in this case", function() {
			let result = autolinker.link( "Joe went to yahoo.com" );
			expect( result ).toBe( 'Joe went to <a href="http://yahoo.com">yahoo.com</a>' );
		} );


		it( "should automatically link URLs in the form of subdomain.yahoo.com", function() {
			let result = autolinker.link( "Joe went to subdomain.yahoo.com" );
			expect( result ).toBe( 'Joe went to <a href="http://subdomain.yahoo.com">subdomain.yahoo.com</a>' );
		} );


		it( "should automatically link URLs in the form of yahoo.co.uk, prepending the http:// in this case", function() {
			let result = autolinker.link( "Joe went to yahoo.co.uk" );
			expect( result ).toBe( 'Joe went to <a href="http://yahoo.co.uk">yahoo.co.uk</a>' );
		} );


		it( "should automatically link URLs in the form of yahoo.ru, prepending the http:// in this case", function() {
			let result = autolinker.link( "Joe went to yahoo.ru" );
			expect( result ).toBe( 'Joe went to <a href="http://yahoo.ru">yahoo.ru</a>' );
		} );


		it( "should automatically link URLs in the form of 'yahoo.com.', without including the trailing period", function() {
			let result = autolinker.link( "Joe went to yahoo.com." );
			expect( result ).toBe( 'Joe went to <a href="http://yahoo.com">yahoo.com</a>.' );
		} );


		it( "should automatically link URLs in the form of 'yahoo.com:8000' (with a port number)", function() {
			let result = autolinker.link( "Joe went to yahoo.com:8000 today" );
			expect( result ).toBe( 'Joe went to <a href="http://yahoo.com:8000">yahoo.com:8000</a> today' );
		} );


		it( "should automatically link URLs in the form of 'yahoo.com:8000/abc' (with a port number and path)", function() {
			let result = autolinker.link( "Joe went to yahoo.com:8000/abc today" );
			expect( result ).toBe( 'Joe went to <a href="http://yahoo.com:8000/abc">yahoo.com:8000/abc</a> today' );
		} );


		it( "should automatically link URLs in the form of 'yahoo.com:8000?abc' (with a port number and query string)", function() {
			let result = autolinker.link( "Joe went to yahoo.com:8000?abc today" );
			expect( result ).toBe( 'Joe went to <a href="http://yahoo.com:8000?abc">yahoo.com:8000?abc</a> today' );
		} );


		it( "should automatically link URLs in the form of 'yahoo.com:8000#abc' (with a port number and hash)", function() {
			let result = autolinker.link( "Joe went to yahoo.com:8000#abc today" );
			expect( result ).toBe( 'Joe went to <a href="http://yahoo.com:8000#abc">yahoo.com:8000#abc</a> today' );
		} );


		it( "should automatically link capitalized URLs", function() {
			let result = autolinker.link( "Joe went to YAHOO.COM." );
			expect( result ).toBe( 'Joe went to <a href="http://YAHOO.COM">YAHOO.COM</a>.' );
		} );


		it( "should not include [?!:,.;] chars if at the end of the URL", function() {
			let result1 = autolinker.link( "Joe went to yahoo.com? today" );
			expect( result1 ).toBe( 'Joe went to <a href="http://yahoo.com">yahoo.com</a>? today' );
			let result2 = autolinker.link( "Joe went to yahoo.com! today" );
			expect( result2 ).toBe( 'Joe went to <a href="http://yahoo.com">yahoo.com</a>! today' );
			let result3 = autolinker.link( "Joe went to yahoo.com: today" );
			expect( result3 ).toBe( 'Joe went to <a href="http://yahoo.com">yahoo.com</a>: today' );
			let result4 = autolinker.link( "Joe went to yahoo.com, today" );
			expect( result4 ).toBe( 'Joe went to <a href="http://yahoo.com">yahoo.com</a>, today' );
			let result5 = autolinker.link( "Joe went to yahoo.com. today" );
			expect( result5 ).toBe( 'Joe went to <a href="http://yahoo.com">yahoo.com</a>. today' );
			let result6 = autolinker.link( "Joe went to yahoo.com; today" );
			expect( result6 ).toBe( 'Joe went to <a href="http://yahoo.com">yahoo.com</a>; today' );
		} );

		it( "should exclude invalid chars after TLD", function() {
			let result1 = autolinker.link( "Joe went to yahoo.com's today" );
			expect( result1 ).toBe( 'Joe went to <a href="http://yahoo.com">yahoo.com</a>\'s today' );
			let result2 = autolinker.link( "Joe went to yahoo.com/foo's today" );
			expect( result2 ).toBe( 'Joe went to <a href="http://yahoo.com/foo\'s">yahoo.com/foo\'s</a> today' );
			let result3 = autolinker.link( "Joe went to yahoo.com's/foo today" );
			expect( result3 ).toBe( 'Joe went to <a href="http://yahoo.com">yahoo.com</a>\'s/foo today' );
		} );

		it( "should automatically link a URL with accented characters", function() {
			let result = autolinker.link( "Joe went to mañana.com today." );
			expect( result ).toBe( 'Joe went to <a href="http://mañana.com">mañana.com</a> today.' );
		} );

	} );


	describe( "protocol-relative URLs (i.e. URLs starting with only '//')", function() {

		it( "should automatically link protocol-relative URLs in the form of //yahoo.com at the beginning of the string", function() {
			let result = autolinker.link( "//yahoo.com" );
			expect( result ).toBe( '<a href="//yahoo.com">yahoo.com</a>' );
		} );


		it( "should automatically link protocol-relative URLs in the form of //yahoo.com in the middle of the string", function() {
			let result = autolinker.link( "Joe went to //yahoo.com yesterday" );
			expect( result ).toBe( 'Joe went to <a href="//yahoo.com">yahoo.com</a> yesterday' );
		} );


		it( "should automatically link protocol-relative URLs in the form of //yahoo.com at the end of the string", function() {
			let result = autolinker.link( "Joe went to //yahoo.com" );
			expect( result ).toBe( 'Joe went to <a href="//yahoo.com">yahoo.com</a>' );
		} );


		it( "should automatically link capitalized protocol-relative URLs", function() {
			let result = autolinker.link( "Joe went to //YAHOO.COM" );
			expect( result ).toBe( 'Joe went to <a href="//YAHOO.COM">YAHOO.COM</a>' );
		} );


		it( "should NOT automatically link supposed protocol-relative URLs in the form of abc//yahoo.com, which is most likely not supposed to be interpreted as a URL", function() {
			let result1 = autolinker.link( "Joe went to abc//yahoo.com" );
			expect( result1 ).toBe( 'Joe went to abc//yahoo.com' );

			let result2 = autolinker.link( "Относительный протокол//россия.рф" );
			expect( result2 ).toBe( 'Относительный протокол//россия.рф' );
		} );


		it( "should NOT automatically link supposed protocol-relative URLs in the form of 123//yahoo.com, which is most likely not supposed to be interpreted as a URL", function() {
			let result = autolinker.link( "Joe went to 123//yahoo.com" );
			expect( result ).toBe( 'Joe went to 123//yahoo.com' );
		} );


		it( "should automatically link supposed protocol-relative URLs as long as the character before the '//' is a non-word character", function() {
			let result = autolinker.link( "Joe went to abc-//yahoo.com" );
			expect( result ).toBe( 'Joe went to abc-<a href="//yahoo.com">yahoo.com</a>' );
		} );

	} );


	describe( "parenthesis handling", function() {

		it( "should include parentheses in URLs", function() {
			let result = autolinker.link( "TLDs come from en.wikipedia.org/wiki/IANA_(disambiguation)." );
			expect( result ).toBe( 'TLDs come from <a href="http://en.wikipedia.org/wiki/IANA_(disambiguation)">en.wikipedia.org/wiki/IANA_(disambiguation)</a>.' );

			result = autolinker.link( "MSDN has a great article at http://msdn.microsoft.com/en-us/library/aa752574(VS.85).aspx." );
			expect( result ).toBe( 'MSDN has a great article at <a href="http://msdn.microsoft.com/en-us/library/aa752574(VS.85).aspx">msdn.microsoft.com/en-us/library/aa752574(VS.85).aspx</a>.' );
		} );


		it( "should include parentheses in URLs with query strings", function() {
			let result = autolinker.link( "TLDs come from en.wikipedia.org/wiki?IANA_(disambiguation)." );
			expect( result ).toBe( 'TLDs come from <a href="http://en.wikipedia.org/wiki?IANA_(disambiguation)">en.wikipedia.org/wiki?IANA_(disambiguation)</a>.' );

			result = autolinker.link( "MSDN has a great article at http://msdn.microsoft.com/en-us/library?aa752574(VS.85).aspx." );
			expect( result ).toBe( 'MSDN has a great article at <a href="http://msdn.microsoft.com/en-us/library?aa752574(VS.85).aspx">msdn.microsoft.com/en-us/library?aa752574(VS.85).aspx</a>.' );
		} );


		it( "should include parentheses in URLs with hash anchors", function() {
			let result = autolinker.link( "TLDs come from en.wikipedia.org/wiki#IANA_(disambiguation)." );
			expect( result ).toBe( 'TLDs come from <a href="http://en.wikipedia.org/wiki#IANA_(disambiguation)">en.wikipedia.org/wiki#IANA_(disambiguation)</a>.' );

			result = autolinker.link( "MSDN has a great article at http://msdn.microsoft.com/en-us/library#aa752574(VS.85).aspx." );
			expect( result ).toBe( 'MSDN has a great article at <a href="http://msdn.microsoft.com/en-us/library#aa752574(VS.85).aspx">msdn.microsoft.com/en-us/library#aa752574(VS.85).aspx</a>.' );
		} );


		it( "should include parentheses in URLs, when the URL is also in parenthesis itself", function() {
			let result = autolinker.link( "TLDs come from (en.wikipedia.org/wiki/IANA_(disambiguation))." );
			expect( result ).toBe( 'TLDs come from (<a href="http://en.wikipedia.org/wiki/IANA_(disambiguation)">en.wikipedia.org/wiki/IANA_(disambiguation)</a>).' );

			result = autolinker.link( "MSDN has a great article at (http://msdn.microsoft.com/en-us/library/aa752574(VS.85).aspx)." );
			expect( result ).toBe( 'MSDN has a great article at (<a href="http://msdn.microsoft.com/en-us/library/aa752574(VS.85).aspx">msdn.microsoft.com/en-us/library/aa752574(VS.85).aspx</a>).' );
		} );


		it( "should not include a final closing paren in the URL, if it doesn't match an opening paren in the url", function() {
			let result = autolinker.link( "Click here (google.com) for more details" );
			expect( result ).toBe( 'Click here (<a href="http://google.com">google.com</a>) for more details' );
		} );


		it( "should not include a final closing paren in the URL when a path exists", function() {
			let result = autolinker.link( "Click here (google.com/abc) for more details" );
			expect( result ).toBe( 'Click here (<a href="http://google.com/abc">google.com/abc</a>) for more details' );
		} );


		it( "should not include a final closing paren in the URL when a query string exists", function() {
			let result = autolinker.link( "Click here (google.com?abc=1) for more details" );
			expect( result ).toBe( 'Click here (<a href="http://google.com?abc=1">google.com?abc=1</a>) for more details' );
		} );


		it( "should not include a final closing paren in the URL when a hash anchor exists", function() {
			let result = autolinker.link( "Click here (google.com#abc) for more details" );
			expect( result ).toBe( 'Click here (<a href="http://google.com#abc">google.com#abc</a>) for more details' );
		} );


		it( "should include escaped parentheses in the URL", function() {
			let result = autolinker.link( "Here's an example from CodingHorror: http://en.wikipedia.org/wiki/PC_Tools_%28Central_Point_Software%29" );
			expect( result ).toBe( 'Here\'s an example from CodingHorror: <a href="http://en.wikipedia.org/wiki/PC_Tools_%28Central_Point_Software%29">en.wikipedia.org/wiki/PC_Tools_(Central_Point_Software)</a>' );
		} );

	} );


	describe( "square bracket handling", () => {

		it( `when the url is surrounded by square brackets, it should not include 
			 should not include the final closing bracket in the URL`,
		() => {
			let result = autolinker.link( "Click here [google.com] for more details" );
			expect( result ).toBe( 'Click here [<a href="http://google.com">google.com</a>] for more details' );
		} );

		
		it( `when the URL starts with a scheme, and is surrounded by square
			  brackets, should not include the final closing bracket in the URL
			  (Issue #228)`,
		() => {
			let result = autolinker.link( "Click here [http://example.com] for more details" );
			expect( result ).toBe( 'Click here [<a href="http://example.com">example.com</a>] for more details' );
		} );

		
		it( `when the URL ends with a closing square bracket, but there is no 
			  matching open square bracket, should not include the final closing 
			  bracket in the URL (Issue #228)`,
		() => {
			let result = autolinker.link( "Click here [cat http://example.com] for more details" );
			expect( result ).toBe( 'Click here [cat <a href="http://example.com">example.com</a>] for more details' );
		} );


		it( "should not include a final closing bracket in the URL when a path exists", function() {
			let result = autolinker.link( "Click here [google.com/abc] for more details" );
			expect( result ).toBe( 'Click here [<a href="http://google.com/abc">google.com/abc</a>] for more details' );
		} );


		it( "should not include a final closing bracket in the URL when a query string exists", function() {
			let result = autolinker.link( "Click here [google.com?abc=1] for more details" );
			expect( result ).toBe( 'Click here [<a href="http://google.com?abc=1">google.com?abc=1</a>] for more details' );
		} );


		it( "should not include a final closing bracket in the URL when a hash anchor exists", function() {
			let result = autolinker.link( "Click here [google.com#abc] for more details" );
			expect( result ).toBe( 'Click here [<a href="http://google.com#abc">google.com#abc</a>] for more details' );
		} );


		it( "should include escaped brackets in the URL", function() {
			let result = autolinker.link( "Here's an example from CodingHorror: http://en.wikipedia.org/wiki/PC_Tools_%5BCentral_Point_Software%5D" );
			expect( result ).toBe( 'Here\'s an example from CodingHorror: <a href="http://en.wikipedia.org/wiki/PC_Tools_%5BCentral_Point_Software%5D">en.wikipedia.org/wiki/PC_Tools_[Central_Point_Software]</a>' );
		} );


		it( `should correctly accept square brackets such as PHP array 
		     representation in query strings`,
		() => {
			let result = autolinker.link( "Here's an example: http://www.example.com/foo.php?bar[]=1&bar[]=2&bar[]=3" );
			expect( result ).toBe( `Here's an example: <a href="http://www.example.com/foo.php?bar[]=1&bar[]=2&bar[]=3">example.com/foo.php?bar[]=1&bar[]=2&bar[]=3</a>` );
		} );


		it( `should correctly accept square brackets such as PHP array 
			 representation in query strings, when the entire URL is surrounded
			 by square brackets`,
		() => {
			let result = autolinker.link( "Here's an example: [http://www.example.com/foo.php?bar[]=1&bar[]=2&bar[]=3]" );
			expect( result ).toBe( `Here's an example: [<a href="http://www.example.com/foo.php?bar[]=1&bar[]=2&bar[]=3">example.com/foo.php?bar[]=1&bar[]=2&bar[]=3</a>]` );
		} );

	} );


	describe( "Special character handling", function() {

		it( "should include $ in URLs", function() {
			let result = autolinker.link( "Check out pair programming: http://c2.com/cgi/wiki$?VirtualPairProgramming" );
			expect( result ).toBe( 'Check out pair programming: <a href="http://c2.com/cgi/wiki$?VirtualPairProgramming">c2.com/cgi/wiki$?VirtualPairProgramming</a>' );
		} );


		it( "should include $ in URLs with query strings", function() {
			let result = autolinker.link( "Check out the image at http://server.com/template?fmt=jpeg&$base=700." );
			expect( result ).toBe( 'Check out the image at <a href="http://server.com/template?fmt=jpeg&$base=700">server.com/template?fmt=jpeg&$base=700</a>.' );
		} );


		it( "should include * in URLs", function() {
			let result = autolinker.link( "Google from wayback http://wayback.archive.org/web/*/http://google.com" );
			expect( result ).toBe( 'Google from wayback <a href="http://wayback.archive.org/web/*/http://google.com">wayback.archive.org/web/*/http://google.com</a>' );
		} );


		it( "should include * in URLs with query strings", function() {
			let result = autolinker.link( "Twitter search for bob smith https://api.twitter.com/1.1/users/search.json?count=20&q=Bob+*+Smith" );
			expect( result ).toBe( 'Twitter search for bob smith <a href="https://api.twitter.com/1.1/users/search.json?count=20&q=Bob+*+Smith">api.twitter.com/1.1/users/search.json?count=20&q=Bob+*+Smith</a>' );
		} );


		it( "should include ' in URLs", function() {
			let result = autolinker.link( "You are a star http://en.wikipedia.org/wiki/You're_a_Star/" );
			expect( result ).toBe( 'You are a star <a href="http://en.wikipedia.org/wiki/You\'re_a_Star/">en.wikipedia.org/wiki/You\'re_a_Star</a>' );
		} );


		it( "should include ' in URLs with query strings", function() {
			let result = autolinker.link( "Test google search https://www.google.com/#q=test's" );
			expect( result ).toBe( 'Test google search <a href="https://www.google.com/#q=test\'s">google.com/#q=test\'s</a>' );
		} );


		it( "should include [ and ] in URLs with query strings", function() {
			let result = autolinker.link( "Go to https://example.com/api/export/873/?a[]=10&a[]=9&a[]=8&a[]=7&a[]=6 today" );
			expect( result ).toBe( 'Go to <a href="https://example.com/api/export/873/?a[]=10&a[]=9&a[]=8&a[]=7&a[]=6">example.com/api/export/873/?a[]=10&a[]=9&a[]=8&a[]=7&a[]=6</a> today' );
		} );


		it( "should handle an example Google Maps URL with query string", function() {
			let result = autolinker.link( "google.no/maps/place/Gary's+Deli/@52.3664378,4.869345,18z/data=!4m7!1m4!3m3!1s0x47c609c14a6680df:0x643f005113531f15!2sBeertemple!3b1!3m1!1s0x0000000000000000:0x51a8a6adb4307be6?hl=no" );

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
			let result = autolinker.link( "Joe went to yahoo.com/path/to/file.html" );
			expect( result ).toBe( 'Joe went to <a href="http://yahoo.com/path/to/file.html">yahoo.com/path/to/file.html</a>' );
		} );


		it( "should automatically link URLs in the form of yahoo.com?hi=1, handling the query string", function() {
			let result = autolinker.link( "Joe went to yahoo.com?hi=1" );
			expect( result ).toBe( 'Joe went to <a href="http://yahoo.com?hi=1">yahoo.com?hi=1</a>' );
		} );


		it( "should automatically link URLs in the form of yahoo.com#index1, handling the hash", function() {
			let result = autolinker.link( "Joe went to yahoo.com#index1" );
			expect( result ).toBe( 'Joe went to <a href="http://yahoo.com#index1">yahoo.com#index1</a>' );
		} );


		it( "should automatically link URLs in the form of yahoo.com/path/to/file.html?hi=1, handling the path and the query string", function() {
			let result = autolinker.link( "Joe went to yahoo.com/path/to/file.html?hi=1" );
			expect( result ).toBe( 'Joe went to <a href="http://yahoo.com/path/to/file.html?hi=1">yahoo.com/path/to/file.html?hi=1</a>' );
		} );


		it( "should automatically link URLs in the form of yahoo.com/path/to/file.html#index1, handling the path and the hash", function() {
			let result = autolinker.link( "Joe went to yahoo.com/path/to/file.html#index1" );
			expect( result ).toBe( 'Joe went to <a href="http://yahoo.com/path/to/file.html#index1">yahoo.com/path/to/file.html#index1</a>' );
		} );


		it( "should automatically link URLs in the form of yahoo.com/path/to/file.html?hi=1#index1, handling the path, query string, and hash", function() {
			let result = autolinker.link( "Joe went to yahoo.com/path/to/file.html?hi=1#index1" );
			expect( result ).toBe( 'Joe went to <a href="http://yahoo.com/path/to/file.html?hi=1#index1">yahoo.com/path/to/file.html?hi=1#index1</a>' );
		} );


		it( "should automatically link a URL with a complex hash (such as a Google Analytics url)", function() {
			let result = autolinker.link( "Joe went to https://www.google.com/analytics/web/?pli=1#my-reports/Obif-Y6qQB2xAJk0ZZE1Zg/a4454143w36378534p43704543/%3F.date00%3D20120314%26_.date01%3D20120314%268534-table.rowStart%3D0%268534-table.rowCount%3D25/ and analyzed his analytics" );
			expect( result ).toBe( 'Joe went to <a href="https://www.google.com/analytics/web/?pli=1#my-reports/Obif-Y6qQB2xAJk0ZZE1Zg/a4454143w36378534p43704543/%3F.date00%3D20120314%26_.date01%3D20120314%268534-table.rowStart%3D0%268534-table.rowCount%3D25/">google.com/analytics/web/?pli=1#my-reports/Obif-Y6qQB2xAJk0ZZE1Zg/a4454143w36378534p43704543/?.date00=20120314&amp;_.date01=20120314&amp;8534-table.rowStart=0&amp;8534-table.rowCount=25</a> and analyzed his analytics' );
		} );


		it( "should automatically link URLs in the form of 'http://yahoo.com/sports.', without including the trailing period", function() {
			let result = autolinker.link( "Joe went to http://yahoo.com/sports." );
			expect( result ).toBe( 'Joe went to <a href="http://yahoo.com/sports">yahoo.com/sports</a>.' );
		} );


		it( "should remove trailing slash from 'http://yahoo.com/'", function() {
			let result = autolinker.link( "Joe went to http://yahoo.com/." );
			expect( result ).toBe( 'Joe went to <a href="http://yahoo.com/">yahoo.com</a>.' );
		} );


		it( "should remove trailing slash from 'http://yahoo.com/sports/'", function() {
			let result = autolinker.link( "Joe went to http://yahoo.com/sports/." );
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
		let result = autolinker.link( 'Joe went to http://yahoo.com and http://google.com' );
		expect( result ).toBe( 'Joe went to <a href="http://yahoo.com">yahoo.com</a> and <a href="http://google.com">google.com</a>' );
	} );


	describe( 'combination example', () => {

		it( `should automatically link all of the URLs of many different forms`, () => {
			let inputStr = `
				Joe went to http://yahoo.com and http://localhost today along with http://localhost:8000.
				He also had a path on localhost: http://localhost:8000/abc, and a query string: http://localhost:8000?abc
				But who could forget about hashes like http://localhost:8000#abc
				It seems http://www.google.com is a good site, but might want to be secure with https://www.google.com
				Sometimes people just need an IP http://66.102.7.147, and a port like http://10.0.0.108:9000
				Capitalized URLs are interesting: HTTP://WWW.YAHOO.COM
				We all like known TLDs like yahoo.com, but shouldn't go to unknown TLDs like sencha.etc
				And definitely shouldn't go to abc.123
				Don't want to include periods at the end of sentences like http://yahoo.com.
				Sometimes you need to go to a path like yahoo.com/my-page
				And hit query strings like yahoo.com?page=index
				Port numbers on known TLDs are important too like yahoo.com:8000.
				Hashes too yahoo.com:8000/#some-link. 
				Sometimes you need a lot of things in the URL like https://abc123def.org/path1/2path?param1=value1#hash123z
				Do you see the need for dashes in these things too https://abc-def.org/his-path/?the-param=the-value#the-hash?
				There's a time for lots and lots of special characters like in https://abc123def.org/-+&@#/%=~_()|\'$*[]?!:,.;/?param1=value-+&@#/%=~_()|\'$*[]?!:,.;#hash-+&@#/%=~_()|\'$*[]?!:,.;z
				Don't forget about good times with unicode https://ru.wikipedia.org/wiki/Кириллица?Кириллица=1#Кириллица 
				and this unicode http://россия.рф
				along with punycode http://xn--d1acufc.xn--p1ai
				Oh good old www links like www.yahoo.com
			`;

			let result = autolinker.link( inputStr );
			expect( result ).toBe( `
				Joe went to <a href="http://yahoo.com">yahoo.com</a> and <a href="http://localhost">localhost</a> today along with <a href="http://localhost:8000">localhost:8000</a>.
				He also had a path on localhost: <a href="http://localhost:8000/abc">localhost:8000/abc</a>, and a query string: <a href="http://localhost:8000?abc">localhost:8000?abc</a>
				But who could forget about hashes like <a href="http://localhost:8000#abc">localhost:8000#abc</a>
				It seems <a href="http://www.google.com">google.com</a> is a good site, but might want to be secure with <a href="https://www.google.com">google.com</a>
				Sometimes people just need an IP <a href="http://66.102.7.147">66.102.7.147</a>, and a port like <a href="http://10.0.0.108:9000">10.0.0.108:9000</a>
				Capitalized URLs are interesting: <a href="HTTP://WWW.YAHOO.COM">YAHOO.COM</a>
				We all like known TLDs like <a href="http://yahoo.com">yahoo.com</a>, but shouldn't go to unknown TLDs like sencha.etc
				And definitely shouldn't go to abc.123
				Don't want to include periods at the end of sentences like <a href="http://yahoo.com">yahoo.com</a>.
				Sometimes you need to go to a path like <a href="http://yahoo.com/my-page">yahoo.com/my-page</a>
				And hit query strings like <a href="http://yahoo.com?page=index">yahoo.com?page=index</a>
				Port numbers on known TLDs are important too like <a href="http://yahoo.com:8000">yahoo.com:8000</a>.
				Hashes too <a href="http://yahoo.com:8000/#some-link">yahoo.com:8000/#some-link</a>. 
				Sometimes you need a lot of things in the URL like <a href="https://abc123def.org/path1/2path?param1=value1#hash123z">abc123def.org/path1/2path?param1=value1#hash123z</a>
				Do you see the need for dashes in these things too <a href="https://abc-def.org/his-path/?the-param=the-value#the-hash">abc-def.org/his-path/?the-param=the-value#the-hash</a>?
				There's a time for lots and lots of special characters like in <a href="https://abc123def.org/-+&@#/%=~_()|'$*[]?!:,.;/?param1=value-+&@#/%=~_()|'$*[]?!:,.;#hash-+&@#/%=~_()|'$*[]?!:,.;z">abc123def.org/-+&@#/%=~_()|'$*[]?!:,.;/?param1=value-+&@#/%=~_()|'$*[]?!:,.;#hash-+&@#/%=~_()|'$*[]?!:,.;z</a>
				Don't forget about good times with unicode <a href="https://ru.wikipedia.org/wiki/Кириллица?Кириллица=1#Кириллица">ru.wikipedia.org/wiki/Кириллица?Кириллица=1#Кириллица</a> 
				and this unicode <a href="http://россия.рф">россия.рф</a>
				along with punycode <a href="http://xn--d1acufc.xn--p1ai">xn--d1acufc.xn--p1ai</a>
				Oh good old www links like <a href="http://www.yahoo.com">yahoo.com</a>
			` );
		} );

	} );

} );
