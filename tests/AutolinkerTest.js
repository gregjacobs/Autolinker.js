/*global Ext, Y, tests, Autolinker */
Ext.test.Session.addSuite( new Ext.test.Suite( {
	
	name: 'Autolinker',
	
	
	items : [
		/*
		 * Test link()
		 */
		{
			name : "Test link()",
			
			"link() should automatically link URLs in the form of http://www.yahoo.com" : function() {
				var result = Autolinker.link( "Joe went to http://www.yahoo.com" );
				Y.Assert.areSame( 'Joe went to <a href="http://www.yahoo.com" target="_blank">http://www.yahoo.com</a>', result );
			},
			
			"link() should automatically link URLs in the form of http://yahoo.com" : function() {
				var result = Autolinker.link( "Joe went to http://yahoo.com" );
				Y.Assert.areSame( 'Joe went to <a href="http://yahoo.com" target="_blank">http://yahoo.com</a>', result );
			},
			
			"link() should automatically link URLs in the form of www.yahoo.com, prepending the http:// in this case" : function() {
				var result = Autolinker.link( "Joe went to www.yahoo.com" );
				Y.Assert.areSame( 'Joe went to <a href="http://www.yahoo.com" target="_blank">www.yahoo.com</a>', result );
			},
			
			
			// -----------------------------
			
			// Test with short urls of known domains
			
			"link() should automatically link URLs in the form of yahoo.com, prepending the http:// in this case" : function() {
				var result = Autolinker.link( "Joe went to yahoo.com" );
				Y.Assert.areSame( 'Joe went to <a href="http://yahoo.com" target="_blank">yahoo.com</a>', result );
			},
			
			"link() should automatically link URLs in the form of yahoo.co.uk, prepending the http:// in this case" : function() {
				var result = Autolinker.link( "Joe went to yahoo.co.uk" );
				Y.Assert.areSame( 'Joe went to <a href="http://yahoo.co.uk" target="_blank">yahoo.co.uk</a>', result );
			},
			
			"link() should automatically link URLs in the form of yahoo.ru, prepending the http:// in this case" : function() {
				var result = Autolinker.link( "Joe went to yahoo.ru" );
				Y.Assert.areSame( 'Joe went to <a href="http://yahoo.ru" target="_blank">yahoo.ru</a>', result );
			},
			
			
			// -----------------------------
			
			// Test that the path, query string, and hash are captured
			
			"link() should automatically link URLs in the form of yahoo.com/path/to/file.html, handling the path" : function() {
				var result = Autolinker.link( "Joe went to yahoo.com/path/to/file.html" );
				Y.Assert.areSame( 'Joe went to <a href="http://yahoo.com/path/to/file.html" target="_blank">yahoo.com/path/to/file.html</a>', result );
			},
			
			"link() should automatically link URLs in the form of yahoo.com?hi=1, handling the query string" : function() {
				var result = Autolinker.link( "Joe went to yahoo.com?hi=1" );
				Y.Assert.areSame( 'Joe went to <a href="http://yahoo.com?hi=1" target="_blank">yahoo.com?hi=1</a>', result );
			},
			
			"link() should automatically link URLs in the form of yahoo.com#index1, handling the hash" : function() {
				var result = Autolinker.link( "Joe went to yahoo.com#index1" );
				Y.Assert.areSame( 'Joe went to <a href="http://yahoo.com#index1" target="_blank">yahoo.com#index1</a>', result );
			},
			
			"link() should automatically link URLs in the form of yahoo.com/path/to/file.html?hi=1, handling the path and the query string" : function() {
				var result = Autolinker.link( "Joe went to yahoo.com/path/to/file.html?hi=1" );
				Y.Assert.areSame( 'Joe went to <a href="http://yahoo.com/path/to/file.html?hi=1" target="_blank">yahoo.com/path/to/file.html?hi=1</a>', result );
			},
			
			"link() should automatically link URLs in the form of yahoo.com/path/to/file.html#index1, handling the path and the hash" : function() {
				var result = Autolinker.link( "Joe went to yahoo.com/path/to/file.html#index1" );
				Y.Assert.areSame( 'Joe went to <a href="http://yahoo.com/path/to/file.html#index1" target="_blank">yahoo.com/path/to/file.html#index1</a>', result );
			},
			
			"link() should automatically link URLs in the form of yahoo.com/path/to/file.html?hi=1#index1, handling the path, query string, and hash" : function() {
				var result = Autolinker.link( "Joe went to yahoo.com/path/to/file.html?hi=1#index1" );
				Y.Assert.areSame( 'Joe went to <a href="http://yahoo.com/path/to/file.html?hi=1#index1" target="_blank">yahoo.com/path/to/file.html?hi=1#index1</a>', result );
			},
			
			
			// -----------------------------
			
			// Test that the hash anchor part pulls all needed characters in complex URLs
			
			"link() should automatically link a URL with a complex hash (such as a Google Analytics url)" : function() {
				var result = Autolinker.link( "Joe went to https://www.google.com/analytics/web/?pli=1#my-reports/Obif-Y6qQB2xAJk0ZZE1Zg/a4454143w36378534p43704543/%3F.date00%3D20120314%26_.date01%3D20120314%268534-table.rowStart%3D0%268534-table.rowCount%3D25/ and analyzed his analytics" );
				Y.Assert.areSame( 'Joe went to <a href="https://www.google.com/analytics/web/?pli=1#my-reports/Obif-Y6qQB2xAJk0ZZE1Zg/a4454143w36378534p43704543/%3F.date00%3D20120314%26_.date01%3D20120314%268534-table.rowStart%3D0%268534-table.rowCount%3D25/" target="_blank">https://www.google.com/analytics/web/?pli=1#my-reports/Obif-Y6qQB2xAJk0ZZE1Zg/a4454143w36378534p43704543/%3F.date00%3D20120314%26_.date01%3D20120314%268534-table.rowStart%3D0%268534-table.rowCount%3D25/</a> and analyzed his analytics', result );
			},
			
			
			// --------------------------
			
			// Test with email addresses
			
			"link() should automatically link email addresses" : function() {
				var result = Autolinker.link( "Joe's email is joe@joe.com" );
				Y.Assert.areSame( 'Joe\'s email is <a href="mailto:joe@joe.com" target="_blank">joe@joe.com</a>', result );
			},
			
			"link() should automatically link email addresses in the middle of the string" : function() {
				var result = Autolinker.link( "Joe's email is joe@joe.com because he is great" );
				Y.Assert.areSame( 'Joe\'s email is <a href="mailto:joe@joe.com" target="_blank">joe@joe.com</a> because he is great', result );
			},
			
			"link() should automatically link email addresses, even if it already starts with 'mailto:'" : function() {
				var result = Autolinker.link( "Joe's email is mailto:joe@joe.com" );
				Y.Assert.areSame( 'Joe\'s email is <a href="mailto:joe@joe.com" target="_blank">mailto:joe@joe.com</a>', result );
			},
			
			
			//"link() should NOT automatically link any old word with an @ character in it" : function() {
			//	var result = Autolinker.link( "Hi there@stuff" );
			//	Y.Assert.areSame( 'Hi there@stuff', result );
			//},
			
			
			// --------------------------
			
			// Test with twitter handles
			
			"link() should automatically link a twitter handle which is the only thing in the string" : function() {
				var result = Autolinker.link( "@joe_the_man12" );
				Y.Assert.areSame( '<a href="https://twitter.com/joe_the_man12" target="_blank">@joe_the_man12</a>', result );
			},
			
			"link() should automatically link twitter handles at the beginning of a string" : function() {
				var result = Autolinker.link( "@greg is my twitter handle" );
				Y.Assert.areSame( '<a href="https://twitter.com/greg" target="_blank">@greg</a> is my twitter handle', result );
			},
			
			"link() should automatically link twitter handles in the middle of a string" : function() {
				var result = Autolinker.link( "Joe's twitter is @joe_the_man12 today, but what will it be tomorrow?" );
				Y.Assert.areSame( 'Joe\'s twitter is <a href="https://twitter.com/joe_the_man12" target="_blank">@joe_the_man12</a> today, but what will it be tomorrow?', result );
			},
			
			"link() should automatically link twitter handles at the end of a string" : function() {
				var result = Autolinker.link( "Joe's twitter is @joe_the_man12" );
				Y.Assert.areSame( 'Joe\'s twitter is <a href="https://twitter.com/joe_the_man12" target="_blank">@joe_the_man12</a>', result );
			},
			
			"link() should automatically link multiple twitter handles in a string" : function() {
				var result = Autolinker.link( "@greg is tweeting @joe with @josh" );
				Y.Assert.areSame( '<a href="https://twitter.com/greg" target="_blank">@greg</a> is tweeting <a href="https://twitter.com/joe" target="_blank">@joe</a> with <a href="https://twitter.com/josh" target="_blank">@josh</a>', result );
			},
			
			
			// -----------------------------
			
			// Test that trailing periods are not included in the url
			
			"link() should automatically link URLs in the form of 'http://yahoo.com.', without including the trailing period" : function() {
				var result = Autolinker.link( "Joe went to http://yahoo.com." );
				Y.Assert.areSame( 'Joe went to <a href="http://yahoo.com" target="_blank">http://yahoo.com</a>.', result );
			},
			
			"link() should automatically link URLs in the form of 'www.yahoo.com.', without including the trailing period" : function() {
				var result = Autolinker.link( "Joe went to www.yahoo.com." );
				Y.Assert.areSame( 'Joe went to <a href="http://www.yahoo.com" target="_blank">www.yahoo.com</a>.', result );
			},
			
			"link() should automatically link URLs in the form of 'yahoo.com.', without including the trailing period" : function() {
				var result = Autolinker.link( "Joe went to yahoo.com." );
				Y.Assert.areSame( 'Joe went to <a href="http://yahoo.com" target="_blank">yahoo.com</a>.', result );
			},
			
			// --------------------------
			
			// Test that URLs within HTML tags are not autolinked
			
			"link() should NOT automatically link URLs within HTML tags" : function() {
				var result = Autolinker.link( '<p>Joe went to <a href="http://www.yahoo.com">yahoo</a></p>' );
				Y.Assert.areSame( '<p>Joe went to <a href="http://www.yahoo.com">yahoo</a></p>', result );
			},
			
			"link() should automatically link URLs past the last HTML tag" : function() {
				var result = Autolinker.link( '<p>Joe went to <a href="http://www.yahoo.com">yahoo</a></p> and http://google.com' );
				Y.Assert.areSame( '<p>Joe went to <a href="http://www.yahoo.com">yahoo</a></p> and <a href="http://google.com" target="_blank">http://google.com</a>', result );
			},
			
			"link() should NOT automatically link a URL found within the inner text of a pre-existing anchor tag" : function() {
				var result = Autolinker.link( '<p>Joe went to <a href="http://www.yahoo.com">yahoo.com</a></p> yesterday.' );
				Y.Assert.areSame( '<p>Joe went to <a href="http://www.yahoo.com">yahoo.com</a></p> yesterday.', result );
			},
			
			"link() should NOT automatically link a URL found within the inner text of a pre-existing anchor tag, but link others" : function() {
				var result = Autolinker.link( '<p>Joe went to google.com, <a href="http://www.yahoo.com">yahoo.com</a>, and weather.com</p> yesterday.' );
				Y.Assert.areSame( '<p>Joe went to <a href="http://google.com" target="_blank">google.com</a>, <a href="http://www.yahoo.com">yahoo.com</a>, and <a href="http://weather.com" target="_blank">weather.com</a></p> yesterday.', result );
			},
			
			
			// --------------------------
			
			// Sanity check: test that multiple URLs in a string are autolinked (basically making sure that we never forget the 'g' RegExp flag)
			
			"link() should automatically link multiple URLs" : function() {
				var result = Autolinker.link( 'Joe went to http://yahoo.com and http://google.com' );
				Y.Assert.areSame( 'Joe went to <a href="http://yahoo.com" target="_blank">http://yahoo.com</a> and <a href="http://google.com" target="_blank">http://google.com</a>', result );
			}
		}
	]
	
} ) );