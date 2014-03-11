/*global Autolinker, _, describe, beforeEach, afterEach, it, expect */
describe( "Autolinker", function() {
	
	describe( "link()", function() {
		
		it( "should automatically link URLs in the form of http://www.yahoo.com", function() {
			var result = Autolinker.link( "Joe went to http://www.yahoo.com" );
			expect( result ).toBe( 'Joe went to <a href="http://www.yahoo.com" target="_blank">yahoo.com</a>' );
		} );
		
		
		it( "should automatically link URLs in the form of http://yahoo.com", function() {
			var result = Autolinker.link( "Joe went to http://yahoo.com" );
			expect( result ).toBe( 'Joe went to <a href="http://yahoo.com" target="_blank">yahoo.com</a>' );
		} );
		
		
		it( "should automatically link URLs in the form of www.yahoo.com, prepending the http:// in this case", function() {
			var result = Autolinker.link( "Joe went to www.yahoo.com" );
			expect( result ).toBe( 'Joe went to <a href="http://www.yahoo.com" target="_blank">yahoo.com</a>' );
		} );
		
		
		it( "should automatically link URLs in the form of subdomain.yahoo.com", function() {
			var result = Autolinker.link( "Joe went to subdomain.yahoo.com" );
			expect( result ).toBe( 'Joe went to <a href="http://subdomain.yahoo.com" target="_blank">subdomain.yahoo.com</a>' );
		} );
		
		
		it( "should automatically link URLs in the form of yahoo.com, prepending the http:// in this case", function() {
			var result = Autolinker.link( "Joe went to yahoo.com" );
			expect( result ).toBe( 'Joe went to <a href="http://yahoo.com" target="_blank">yahoo.com</a>' );
		} );
		
		
		it( "should automatically link URLs in the form of yahoo.co.uk, prepending the http:// in this case", function() {
			var result = Autolinker.link( "Joe went to yahoo.co.uk" );
			expect( result ).toBe( 'Joe went to <a href="http://yahoo.co.uk" target="_blank">yahoo.co.uk</a>' );
		} );
		
		
		it( "should automatically link URLs in the form of yahoo.ru, prepending the http:// in this case", function() {
			var result = Autolinker.link( "Joe went to yahoo.ru" );
			expect( result ).toBe( 'Joe went to <a href="http://yahoo.ru" target="_blank">yahoo.ru</a>' );
		} );
		
		
		it( "should automatically link 'yahoo.xyz', but not 'sencha.etc'", function() {
			var result = Autolinker.link( "yahoo.xyz should be linked, sencha.etc should not", { newWindow: false } );
			expect( result ).toBe( '<a href="http://yahoo.xyz">yahoo.xyz</a> should be linked, sencha.etc should not' );
		} );
		
		
		it( "should automatically link 'a.museum', but not 'abc.123'", function() {
			var result = Autolinker.link( "a.museum should be linked, but abc.123 should not", { newWindow: false } );
			expect( result ).toBe( '<a href="http://a.museum">a.museum</a> should be linked, but abc.123 should not' );
		} );
		
		
		describe( "parenthesis handling", function() {
			
			it( "should include parentheses in URLs", function() {
				var result = Autolinker.link( "TLDs come from en.wikipedia.org/wiki/IANA_(disambiguation).", { newWindow: false } );
				expect( result ).toBe( 'TLDs come from <a href="http://en.wikipedia.org/wiki/IANA_(disambiguation)">en.wikipedia.org/wiki/IANA_(disambiguation)</a>.' );
				
				var result = Autolinker.link( "MSDN has a great article at http://msdn.microsoft.com/en-us/library/aa752574(VS.85).aspx.", { newWindow: false } );
				expect( result ).toBe( 'MSDN has a great article at <a href="http://msdn.microsoft.com/en-us/library/aa752574(VS.85).aspx">msdn.microsoft.com/en-us/library/aa752574(VS.85).aspx</a>.' );
			} );
			
			
			it( "should include parentheses in URLs with query strings", function() {
				var result = Autolinker.link( "TLDs come from en.wikipedia.org/wiki?IANA_(disambiguation).", { newWindow: false } );
				expect( result ).toBe( 'TLDs come from <a href="http://en.wikipedia.org/wiki?IANA_(disambiguation)">en.wikipedia.org/wiki?IANA_(disambiguation)</a>.' );
				
				var result = Autolinker.link( "MSDN has a great article at http://msdn.microsoft.com/en-us/library?aa752574(VS.85).aspx.", { newWindow: false } );
				expect( result ).toBe( 'MSDN has a great article at <a href="http://msdn.microsoft.com/en-us/library?aa752574(VS.85).aspx">msdn.microsoft.com/en-us/library?aa752574(VS.85).aspx</a>.' );
			} );
			
			
			it( "should include parentheses in URLs with hash anchors", function() {
				var result = Autolinker.link( "TLDs come from en.wikipedia.org/wiki#IANA_(disambiguation).", { newWindow: false } );
				expect( result ).toBe( 'TLDs come from <a href="http://en.wikipedia.org/wiki#IANA_(disambiguation)">en.wikipedia.org/wiki#IANA_(disambiguation)</a>.' );
				
				var result = Autolinker.link( "MSDN has a great article at http://msdn.microsoft.com/en-us/library#aa752574(VS.85).aspx.", { newWindow: false } );
				expect( result ).toBe( 'MSDN has a great article at <a href="http://msdn.microsoft.com/en-us/library#aa752574(VS.85).aspx">msdn.microsoft.com/en-us/library#aa752574(VS.85).aspx</a>.' );
			} );
			
			
			it( "should include parentheses in URLs, when the URL is also in parenthesis itself", function() {
				var result = Autolinker.link( "TLDs come from (en.wikipedia.org/wiki/IANA_(disambiguation)).", { newWindow: false } );
				expect( result ).toBe( 'TLDs come from (<a href="http://en.wikipedia.org/wiki/IANA_(disambiguation)">en.wikipedia.org/wiki/IANA_(disambiguation)</a>).' );
				
				var result = Autolinker.link( "MSDN has a great article at (http://msdn.microsoft.com/en-us/library/aa752574(VS.85).aspx).", { newWindow: false } );
				expect( result ).toBe( 'MSDN has a great article at (<a href="http://msdn.microsoft.com/en-us/library/aa752574(VS.85).aspx">msdn.microsoft.com/en-us/library/aa752574(VS.85).aspx</a>).' );
			} );
			
			
			it( "should not include a final closing paren in the URL, if it doesn't match an opening paren in the url", function() {
				var result = Autolinker.link( "Click here (google.com) for more details" );
				expect( result ).toBe( 'Click here (<a href="http://google.com" target="_blank">google.com</a>) for more details' );
			} );
			
			
			it( "should not include a final closing paren in the URL when a path exists", function() {
				var result = Autolinker.link( "Click here (google.com/abc) for more details" );
				expect( result ).toBe( 'Click here (<a href="http://google.com/abc" target="_blank">google.com/abc</a>) for more details' );
			} );
			
			
			it( "should not include a final closing paren in the URL when a query string exists", function() {
				var result = Autolinker.link( "Click here (google.com?abc=1) for more details" );
				expect( result ).toBe( 'Click here (<a href="http://google.com?abc=1" target="_blank">google.com?abc=1</a>) for more details' );
			} );
			
			
			it( "should not include a final closing paren in the URL when a hash anchor exists", function() {
				var result = Autolinker.link( "Click here (google.com#abc) for more details" );
				expect( result ).toBe( 'Click here (<a href="http://google.com#abc" target="_blank">google.com#abc</a>) for more details' );
			} );
			
			
			it( "should include escaped parentheses in the URL", function() {
				var result = Autolinker.link( "Here's an example from CodingHorror: http://en.wikipedia.org/wiki/PC_Tools_%28Central_Point_Software%29" );
				expect( result ).toBe( 'Here\'s an example from CodingHorror: <a href="http://en.wikipedia.org/wiki/PC_Tools_%28Central_Point_Software%29" target="_blank">en.wikipedia.org/wiki/PC_Tools_%28Central_Point_Software%29</a>' );
			} );
			
		} );
		
		
		it( "should automatically link URLs in the form of yahoo.com/path/to/file.html, handling the path", function() {
			var result = Autolinker.link( "Joe went to yahoo.com/path/to/file.html" );
			expect( result ).toBe( 'Joe went to <a href="http://yahoo.com/path/to/file.html" target="_blank">yahoo.com/path/to/file.html</a>' );
		} );
		
		
		it( "should automatically link URLs in the form of yahoo.com?hi=1, handling the query string", function() {
			var result = Autolinker.link( "Joe went to yahoo.com?hi=1" );
			expect( result ).toBe( 'Joe went to <a href="http://yahoo.com?hi=1" target="_blank">yahoo.com?hi=1</a>' );
		} );
		
		
		it( "should automatically link URLs in the form of yahoo.com#index1, handling the hash", function() {
			var result = Autolinker.link( "Joe went to yahoo.com#index1" );
			expect( result ).toBe( 'Joe went to <a href="http://yahoo.com#index1" target="_blank">yahoo.com#index1</a>' );
		} );
		
		
		it( "should automatically link URLs in the form of yahoo.com/path/to/file.html?hi=1, handling the path and the query string", function() {
			var result = Autolinker.link( "Joe went to yahoo.com/path/to/file.html?hi=1" );
			expect( result ).toBe( 'Joe went to <a href="http://yahoo.com/path/to/file.html?hi=1" target="_blank">yahoo.com/path/to/file.html?hi=1</a>' );
		} );
		
		
		it( "should automatically link URLs in the form of yahoo.com/path/to/file.html#index1, handling the path and the hash", function() {
			var result = Autolinker.link( "Joe went to yahoo.com/path/to/file.html#index1" );
			expect( result ).toBe( 'Joe went to <a href="http://yahoo.com/path/to/file.html#index1" target="_blank">yahoo.com/path/to/file.html#index1</a>' );
		} );
		
		
		it( "should automatically link URLs in the form of yahoo.com/path/to/file.html?hi=1#index1, handling the path, query string, and hash", function() {
			var result = Autolinker.link( "Joe went to yahoo.com/path/to/file.html?hi=1#index1" );
			expect( result ).toBe( 'Joe went to <a href="http://yahoo.com/path/to/file.html?hi=1#index1" target="_blank">yahoo.com/path/to/file.html?hi=1#index1</a>' );
		} );
		
		
		it( "should automatically link a URL with a complex hash (such as a Google Analytics url)", function() {
			var result = Autolinker.link( "Joe went to https://www.google.com/analytics/web/?pli=1#my-reports/Obif-Y6qQB2xAJk0ZZE1Zg/a4454143w36378534p43704543/%3F.date00%3D20120314%26_.date01%3D20120314%268534-table.rowStart%3D0%268534-table.rowCount%3D25/ and analyzed his analytics" );
			expect( result ).toBe( 'Joe went to <a href="https://www.google.com/analytics/web/?pli=1#my-reports/Obif-Y6qQB2xAJk0ZZE1Zg/a4454143w36378534p43704543/%3F.date00%3D20120314%26_.date01%3D20120314%268534-table.rowStart%3D0%268534-table.rowCount%3D25/" target="_blank">google.com/analytics/web/?pli=1#my-reports/Obif-Y6qQB2xAJk0ZZE1Zg/a4454143w36378534p43704543/%3F.date00%3D20120314%26_.date01%3D20120314%268534-table.rowStart%3D0%268534-table.rowCount%3D25</a> and analyzed his analytics' );
		} );
		
		
		it( "should automatically link multiple URLs", function() {
			var result = Autolinker.link( 'Joe went to http://yahoo.com and http://google.com' );
			expect( result ).toBe( 'Joe went to <a href="http://yahoo.com" target="_blank">yahoo.com</a> and <a href="http://google.com" target="_blank">google.com</a>' );
		} );
		
		
		it( "should automatically link URLs in the form of 'http://yahoo.com.', without including the trailing period", function() {
			var result = Autolinker.link( "Joe went to http://yahoo.com." );
			expect( result ).toBe( 'Joe went to <a href="http://yahoo.com" target="_blank">yahoo.com</a>.' );
		} );
		
		
		it( "should automatically link URLs in the form of 'www.yahoo.com.', without including the trailing period", function() {
			var result = Autolinker.link( "Joe went to www.yahoo.com." );
			expect( result ).toBe( 'Joe went to <a href="http://www.yahoo.com" target="_blank">yahoo.com</a>.' );
		} );
		
		
		it( "should automatically link URLs in the form of 'yahoo.com.', without including the trailing period", function() {
			var result = Autolinker.link( "Joe went to yahoo.com." );
			expect( result ).toBe( 'Joe went to <a href="http://yahoo.com" target="_blank">yahoo.com</a>.' );
		} );
		
		
		it( "should automatically link URLs in the form of 'http://yahoo.com/sports.', without including the trailing period", function() {
			var result = Autolinker.link( "Joe went to http://yahoo.com/sports." );
			expect( result ).toBe( 'Joe went to <a href="http://yahoo.com/sports" target="_blank">yahoo.com/sports</a>.' );
		} );
		
		
		it( "should remove trailing slash from 'http://yahoo.com/'", function() {
			var result = Autolinker.link( "Joe went to http://yahoo.com/." );
			expect( result ).toBe( 'Joe went to <a href="http://yahoo.com/" target="_blank">yahoo.com</a>.' );
		} );
		
		
		it( "should remove trailing slash from 'http://yahoo.com/sports/'", function() {
			var result = Autolinker.link( "Joe went to http://yahoo.com/sports/." );
			expect( result ).toBe( 'Joe went to <a href="http://yahoo.com/sports/" target="_blank">yahoo.com/sports</a>.' );
		} );
		
		
		it( "should automatically link an email address which is the only text in the string", function() {
			var result = Autolinker.link( "joe@joe.com" );
			expect( result ).toBe( '<a href="mailto:joe@joe.com" target="_blank">joe@joe.com</a>' );
		} );
		
		
		it( "should automatically link email addresses at the start of the string", function() {
			var result = Autolinker.link( "joe@joe.com is Joe's email" );
			expect( result ).toBe( '<a href="mailto:joe@joe.com" target="_blank">joe@joe.com</a> is Joe\'s email' );
		} );
		
		
		it( "should automatically link an email address in the middle of the string", function() {
			var result = Autolinker.link( "Joe's email is joe@joe.com because it is" );
			expect( result ).toBe( 'Joe\'s email is <a href="mailto:joe@joe.com" target="_blank">joe@joe.com</a> because it is' );
		} );
		
		
		it( "should automatically link email addresses at the end of the string", function() {
			var result = Autolinker.link( "Joe's email is joe@joe.com" );
			expect( result ).toBe( 'Joe\'s email is <a href="mailto:joe@joe.com" target="_blank">joe@joe.com</a>' );
		} );
		
		
		it( "should automatically link email addresses with a period in the 'local part'", function() {
			var result = Autolinker.link( "Joe's email is joe.smith@joe.com" );
			expect( result ).toBe( 'Joe\'s email is <a href="mailto:joe.smith@joe.com" target="_blank">joe.smith@joe.com</a>' );
		} );
		
		
		it( "should NOT automatically link any old word with an @ character in it", function() {
			var result = Autolinker.link( "Hi there@stuff" );
			expect( result ).toBe( 'Hi there@stuff' );
		} );
		
		
		it( "should automatically link a twitter handle which is the only thing in the string", function() {
			var result = Autolinker.link( "@joe_the_man12" );
			expect( result ).toBe( '<a href="https://twitter.com/joe_the_man12" target="_blank">@joe_the_man12</a>' );
		} );
		
		
		it( "should automatically link twitter handles at the beginning of a string", function() {
			var result = Autolinker.link( "@greg is my twitter handle" );
			expect( result ).toBe( '<a href="https://twitter.com/greg" target="_blank">@greg</a> is my twitter handle' );
		} );
		
		
		it( "should automatically link twitter handles in the middle of a string", function() {
			var result = Autolinker.link( "Joe's twitter is @joe_the_man12 today, but what will it be tomorrow?" );
			expect( result ).toBe( 'Joe\'s twitter is <a href="https://twitter.com/joe_the_man12" target="_blank">@joe_the_man12</a> today, but what will it be tomorrow?' );
		} );
		
		
		it( "should automatically link twitter handles at the end of a string", function() {
			var result = Autolinker.link( "Joe's twitter is @joe_the_man12" );
			expect( result ).toBe( 'Joe\'s twitter is <a href="https://twitter.com/joe_the_man12" target="_blank">@joe_the_man12</a>' );
		} );
		
		
		it( "should automatically link multiple twitter handles in a string", function() {
			var result = Autolinker.link( "@greg is tweeting @joe with @josh" );
			expect( result ).toBe( '<a href="https://twitter.com/greg" target="_blank">@greg</a> is tweeting <a href="https://twitter.com/joe" target="_blank">@joe</a> with <a href="https://twitter.com/josh" target="_blank">@josh</a>' );
		} );
		
		
		it( "should NOT automatically link URLs within HTML tags", function() {
			var result = Autolinker.link( '<p>Joe went to <a href="http://www.yahoo.com">yahoo</a></p>' );
			expect( result ).toBe( '<p>Joe went to <a href="http://www.yahoo.com">yahoo</a></p>' );
		} );
		
		
		it( "should automatically link URLs past the last HTML tag", function() {
			var result = Autolinker.link( '<p>Joe went to <a href="http://www.yahoo.com">yahoo</a></p> and http://google.com' );
			expect( result ).toBe( '<p>Joe went to <a href="http://www.yahoo.com">yahoo</a></p> and <a href="http://google.com" target="_blank">google.com</a>' );
		} );
		
		
		it( "should NOT automatically link a URL found within the inner text of a pre-existing anchor tag", function() {
			var result = Autolinker.link( '<p>Joe went to <a href="http://www.yahoo.com">yahoo.com</a></p> yesterday.' );
			expect( result ).toBe( '<p>Joe went to <a href="http://www.yahoo.com">yahoo.com</a></p> yesterday.' );
		} );
		
		
		it( "should NOT automatically link a URL found within the inner text of a pre-existing anchor tag, but link others", function() {
			var result = Autolinker.link( '<p>Joe went to google.com, <a href="http://www.yahoo.com">yahoo.com</a>, and weather.com</p> yesterday.' );
			expect( result ).toBe( '<p>Joe went to <a href="http://google.com" target="_blank">google.com</a>, <a href="http://www.yahoo.com">yahoo.com</a>, and <a href="http://weather.com" target="_blank">weather.com</a></p> yesterday.' );
		} );
		
		
		it( "should NOT automatically link an image tag with a URL inside it, inside an anchor tag", function() {
			var result = Autolinker.link( '<a href="http://google.com"><img src="http://google.com/someImage.jpg" /></a>' );
			expect( result ).toBe( '<a href="http://google.com"><img src="http://google.com/someImage.jpg" /></a>' );
		} );
		
		
		it( "should NOT automatically link an image tag with a URL inside it, inside an anchor tag, but match urls around the tags", function() {
			var result = Autolinker.link( 'google.com looks like <a href="http://google.com"><img src="http://google.com/someImage.jpg" /></a> (at google.com)' );
			expect( result ).toBe( '<a href="http://google.com" target="_blank">google.com</a> looks like <a href="http://google.com"><img src="http://google.com/someImage.jpg" /></a> (at <a href="http://google.com" target="_blank">google.com</a>)' );
		} );
		
		
		it( "should not add target=\"_blank\" when the 'newWindow' option is set to false", function() {
			var result = Autolinker.link( "Test http://url.com", { newWindow: false } );
			expect( result ).toBe( 'Test <a href="http://url.com">url.com</a>' );
		} );
		
		
		it( "should not remove the prefix for non-http protocols", function() {
			var result = Autolinker.link( "Test file://execute-virus.com" );
			expect( result ).toBe( 'Test <a href="file://execute-virus.com" target="_blank">file://execute-virus.com</a>' );
		} );
		
		
		it( "should not remove 'http://www.' when the 'stripPrefix' option is set to false", function() {
			var result = Autolinker.link( "Test http://www.url.com", { stripPrefix: false } );
			expect( result ).toBe( 'Test <a href="http://www.url.com" target="_blank">http://www.url.com</a>' );
		} );
		
		
		it( "should truncate long a url/email/twitter to the given number of characters with the 'truncate' option specified", function() {
			var result = Autolinker.link( "Test http://url.com/with/path", { truncate: 12 } );
			expect( result ).toBe( 'Test <a href="http://url.com/with/path" target="_blank">url.com/wi..</a>' );
		} );
		
		
		it( "should leave a url/email/twitter alone if the length of the url is exactly equal to the length of the 'truncate' option", function() {
			var result = Autolinker.link( "Test http://url.com/with/path", { truncate: 'url.com/with/path'.length } );  // the exact length of the link
			expect( result ).toBe( 'Test <a href="http://url.com/with/path" target="_blank">url.com/with/path</a>' );
		} );
		
		
		it( "should leave a url/email/twitter alone if it does not exceed the given number of characters provided in the 'truncate' option", function() {
			var result = Autolinker.link( "Test http://url.com/with/path", { truncate: 25 } );  // just a random high number
			expect( result ).toBe( 'Test <a href="http://url.com/with/path" target="_blank">url.com/with/path</a>' );
		} );

        describe( "callback", function() {

            it( "should allow additional anchor attributes to be specified via a callback", function() {
                var result = Autolinker.link( "Test http://www.example.com/ link", {
                    callback: function(callbackArgs) {
                        callbackArgs.attributes.push( 'class="my-class"' );
                        return {
                            attributes: callbackArgs.attributes
                        };
                    }
                } );
                expect( result ).toBe( 'Test <a href="http://www.example.com/" target="_blank" class="my-class">example.com</a> link' );
            } );

        } );
		
	} );
	
} );