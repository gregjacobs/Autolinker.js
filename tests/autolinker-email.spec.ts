import _ from 'lodash';
import Autolinker from '../src/autolinker';

describe( "Autolinker Email Matching -", () => {
	const autolinker = new Autolinker( { newWindow: false } );  // so that target="_blank" is not added to resulting autolinked URLs


	it( "should automatically link an email address which is the only text in the string", function() {
		let result = autolinker.link( "joe@joe.com" );

		expect( result ).toBe( '<a href="mailto:joe@joe.com">joe@joe.com</a>' );
	} );


	it( "should automatically link email addresses at the start of the string", function() {
		let result = autolinker.link( "joe@joe.com is Joe's email" );

		expect( result ).toBe( '<a href="mailto:joe@joe.com">joe@joe.com</a> is Joe\'s email' );
	} );


	it( "should automatically link an email address in the middle of the string", function() {
		let result = autolinker.link( "Joe's email is joe@joe.com because it is" );

		expect( result ).toBe( 'Joe\'s email is <a href="mailto:joe@joe.com">joe@joe.com</a> because it is' );
	} );


	it( "should automatically link email addresses at the end of the string", function() {
		let result = autolinker.link( "Joe's email is joe@joe.com" );

		expect( result ).toBe( 'Joe\'s email is <a href="mailto:joe@joe.com">joe@joe.com</a>' );
	} );


	it( "should automatically link email addresses with a period at the end of a sentence (but not include the period)", function() {
		let result = autolinker.link( "Joe's email is joe@joe.com. Try emailing him" );

		expect( result ).toBe( 'Joe\'s email is <a href="mailto:joe@joe.com">joe@joe.com</a>. Try emailing him' );
	} );


	it( "should automatically link email addresses with a period in the 'local part'", function() {
		let result = autolinker.link( "Joe's email is joe.smith@joe.com" );

		expect( result ).toBe( 'Joe\'s email is <a href="mailto:joe.smith@joe.com">joe.smith@joe.com</a>' );
	} );


	it( "should automatically link fully-capitalized email addresses", function() {
		let result = autolinker.link( "Joe's email is JOE@JOE.COM" );

		expect( result ).toBe( 'Joe\'s email is <a href="mailto:JOE@JOE.COM">JOE@JOE.COM</a>' );
	} );


	it( "should properly link an email address in parenthesis", function() {
		let result = autolinker.link( "Joe's email is (joe@joe.com)" );

		expect( result ).toBe( 'Joe\'s email is (<a href="mailto:joe@joe.com">joe@joe.com</a>)' );
	} );


	it( "should properly link an email address with underscores", function() {
		let result = autolinker.link( "Joe's email is (joe_roe@joe.com)" );

		expect( result ).toBe( 'Joe\'s email is (<a href="mailto:joe_roe@joe.com">joe_roe@joe.com</a>)' );
	} );


	it( "should properly link an email address with an apostrophe", function() {
		let result = autolinker.link( "Joe's email is (joe'roe@joe.com)" );

		expect( result ).toBe( 'Joe\'s email is (<a href="mailto:joe\'roe@joe.com">joe\'roe@joe.com</a>)' );
	} );


	it( "should automatically link an email address with accented characters", function() {
		let result = autolinker.link( "Joe's email is mañana@mañana.com" );

		expect( result ).toBe( 'Joe\'s email is <a href="mailto:mañana@mañana.com">mañana@mañana.com</a>' );
	} );


	it( "should automatically link an email address with cyrillic characters", function() {
		let result = autolinker.link( "Joe's email is Кириллица@Кириллица.com" );

		expect( result ).toBe( 'Joe\'s email is <a href="mailto:Кириллица@Кириллица.com">Кириллица@Кириллица.com</a>' );
	} );


	it( "should NOT automatically link any old word with an @ character in it", function() {
		let result = autolinker.link( "Hi there@stuff" );

		expect( result ).toBe( 'Hi there@stuff' );
	} );


	it( "should automatically link an email address with tld matched localpart", function () {
		let result = autolinker.link( "My email is busueng.kim@aaa.com" );
		
		expect( result ).toBe( 'My email is <a href="mailto:busueng.kim@aaa.com">busueng.kim@aaa.com</a>');
	} );

} );
