// This file simply makes sure that we can require() Autolinker entities using 
// the 'autolinker' package installed into node_modules
// To run this test, run: 
//     yarn test
// This will install the package locally in ./.tmp/, and build this file.

const Autolinker = require( 'autolinker' );
const NamedAutolinker = require( 'autolinker' ).Autolinker;


describe( 'Autolinker require() tests - ', () => {

	it( `Autolinker should be the default export of 'autolinker'`, () => {
		expect( Autolinker ).toEqual( jasmine.any( Function ) );  // constructor function
		expect( Autolinker.name ).toBe( 'Autolinker' );  // function name
		expect( Autolinker.link ).toEqual( jasmine.any( Function ) );

		expect( Autolinker.link( 'Hello google.com', { newWindow: false } ) )
			.toBe( 'Hello <a href="http://google.com">google.com</a>' );
	} );


	it( `Autolinker should also be a named export of 'autolinker'`, () => {
		expect( NamedAutolinker ).toEqual( jasmine.any( Function ) );  // constructor function
		expect( NamedAutolinker.name ).toBe( 'Autolinker' );  // function name
		expect( NamedAutolinker.link ).toEqual( jasmine.any( Function ) );
	} );


	it( `AnchorTagBuilder should be a top-level named export of 'autolinker'`, () => {
		expect( Autolinker.AnchorTagBuilder ).toEqual( jasmine.any( Function ) );  // constructor function
		expect( Autolinker.AnchorTagBuilder.name ).toBe( 'AnchorTagBuilder' );  // function name
		expect( Autolinker.AnchorTagBuilder.prototype.build ).toEqual( jasmine.any( Function ) );
	} );


	it( `AnchorTagBuilder should be a top-level named export of 'autolinker'`, () => {
		expect( Autolinker.HtmlTag ).toEqual( jasmine.any( Function ) );  // constructor function
		expect( Autolinker.HtmlTag.name ).toBe( 'HtmlTag' );  // function name
		expect( Autolinker.HtmlTag.prototype.getTagName ).toEqual( jasmine.any( Function ) );
	} );


	it( `The 'Match' classes should be top-level named exports of 'autolinker' (as of v2.0)`, () => {
		expect( Autolinker.Match ).toEqual( jasmine.any( Function ) );  // constructor function
		expect( Autolinker.Match.name ).toBe( 'Match' );  // function name
		expect( Autolinker.Match.prototype.getMatchedText ).toEqual( jasmine.any( Function ) );

		expect( Autolinker.EmailMatch ).toEqual( jasmine.any( Function ) );  // constructor function
		expect( Autolinker.EmailMatch.name ).toBe( 'EmailMatch' );  // function name
		expect( Autolinker.EmailMatch.prototype.getEmail ).toEqual( jasmine.any( Function ) );

		expect( Autolinker.HashtagMatch ).toEqual( jasmine.any( Function ) );  // constructor function
		expect( Autolinker.HashtagMatch.name ).toBe( 'HashtagMatch' );  // function name
		expect( Autolinker.HashtagMatch.prototype.getHashtag ).toEqual( jasmine.any( Function ) );

		expect( Autolinker.MentionMatch ).toEqual( jasmine.any( Function ) );  // constructor function
		expect( Autolinker.MentionMatch.name ).toBe( 'MentionMatch' );  // function name
		expect( Autolinker.MentionMatch.prototype.getMention ).toEqual( jasmine.any( Function ) );

		expect( Autolinker.PhoneMatch ).toEqual( jasmine.any( Function ) );  // constructor function
		expect( Autolinker.PhoneMatch.name ).toBe( 'PhoneMatch' );  // function name
		expect( Autolinker.PhoneMatch.prototype.getNumber ).toEqual( jasmine.any( Function ) );

		expect( Autolinker.UrlMatch ).toEqual( jasmine.any( Function ) );  // constructor function
		expect( Autolinker.UrlMatch.name ).toBe( 'UrlMatch' );  // function name
		expect( Autolinker.UrlMatch.prototype.getUrl ).toEqual( jasmine.any( Function ) );
	} );


	it( `The 'Match' classes should also continue to be in their 1.x namespace locations for backward compatibility`, () => {
		expect( Autolinker.match.Match ).toEqual( jasmine.any( Function ) );  // constructor function
		expect( Autolinker.match.Match.name ).toBe( 'Match' );  // function name
		expect( Autolinker.match.Match.prototype.getMatchedText ).toEqual( jasmine.any( Function ) );

		expect( Autolinker.match.Email ).toEqual( jasmine.any( Function ) );  // constructor function
		expect( Autolinker.match.Email.name ).toBe( 'EmailMatch' );  // function name
		expect( Autolinker.match.Email.prototype.getEmail ).toEqual( jasmine.any( Function ) );

		expect( Autolinker.match.Hashtag ).toEqual( jasmine.any( Function ) );  // constructor function
		expect( Autolinker.match.Hashtag.name ).toBe( 'HashtagMatch' );  // function name
		expect( Autolinker.match.Hashtag.prototype.getHashtag ).toEqual( jasmine.any( Function ) );

		expect( Autolinker.match.Mention ).toEqual( jasmine.any( Function ) );  // constructor function
		expect( Autolinker.match.Mention.name ).toBe( 'MentionMatch' );  // function name
		expect( Autolinker.match.Mention.prototype.getMention ).toEqual( jasmine.any( Function ) );

		expect( Autolinker.match.Phone ).toEqual( jasmine.any( Function ) );  // constructor function
		expect( Autolinker.match.Phone.name ).toBe( 'PhoneMatch' );  // function name
		expect( Autolinker.match.Phone.prototype.getNumber ).toEqual( jasmine.any( Function ) );

		expect( Autolinker.match.Url ).toEqual( jasmine.any( Function ) );  // constructor function
		expect( Autolinker.match.Url.name ).toBe( 'UrlMatch' );  // function name
		expect( Autolinker.match.Url.prototype.getUrl ).toEqual( jasmine.any( Function ) );
	} );


	it( `The 'Matcher' classes should be top-level named exports of 'autolinker' (as of v2.0)`, () => {
		expect( Autolinker.Matcher ).toEqual( jasmine.any( Function ) );  // constructor function
		expect( Autolinker.Matcher.name ).toBe( 'Matcher' );  // function name
		// Note: no methods which can be checked here - abstract methods are not compiled into ES5

		expect( Autolinker.EmailMatcher ).toEqual( jasmine.any( Function ) );  // constructor function
		expect( Autolinker.EmailMatcher.name ).toBe( 'EmailMatcher' );  // function name
		expect( Autolinker.EmailMatcher.prototype.parseMatches ).toEqual( jasmine.any( Function ) );

		expect( Autolinker.HashtagMatcher ).toEqual( jasmine.any( Function ) );  // constructor function
		expect( Autolinker.HashtagMatcher.name ).toBe( 'HashtagMatcher' );  // function name
		expect( Autolinker.HashtagMatcher.prototype.parseMatches ).toEqual( jasmine.any( Function ) );

		expect( Autolinker.MentionMatcher ).toEqual( jasmine.any( Function ) );  // constructor function
		expect( Autolinker.MentionMatcher.name ).toBe( 'MentionMatcher' );  // function name
		expect( Autolinker.MentionMatcher.prototype.parseMatches ).toEqual( jasmine.any( Function ) );

		expect( Autolinker.PhoneMatcher ).toEqual( jasmine.any( Function ) );  // constructor function
		expect( Autolinker.PhoneMatcher.name ).toBe( 'PhoneMatcher' );  // function name
		expect( Autolinker.PhoneMatcher.prototype.parseMatches ).toEqual( jasmine.any( Function ) );

		expect( Autolinker.UrlMatcher ).toEqual( jasmine.any( Function ) );  // constructor function
		expect( Autolinker.UrlMatcher.name ).toBe( 'UrlMatcher' );  // function name
		expect( Autolinker.UrlMatcher.prototype.parseMatches ).toEqual( jasmine.any( Function ) );
	} );


	it( `The 'Matcher' classes should also continue to be in their 1.x namespace locations for backward compatibility`, () => {
		expect( Autolinker.matcher.Matcher ).toEqual( jasmine.any( Function ) );  // constructor function
		expect( Autolinker.matcher.Matcher.name ).toBe( 'Matcher' );  // function name
		// Note: no methods which can be checked here - abstract methods are not compiled into ES5

		expect( Autolinker.matcher.Email ).toEqual( jasmine.any( Function ) );  // constructor function
		expect( Autolinker.matcher.Email.name ).toBe( 'EmailMatcher' );  // function name
		expect( Autolinker.matcher.Email.prototype.parseMatches ).toEqual( jasmine.any( Function ) );

		expect( Autolinker.matcher.Hashtag ).toEqual( jasmine.any( Function ) );  // constructor function
		expect( Autolinker.matcher.Hashtag.name ).toBe( 'HashtagMatcher' );  // function name
		expect( Autolinker.matcher.Hashtag.prototype.parseMatches ).toEqual( jasmine.any( Function ) );

		expect( Autolinker.matcher.Mention ).toEqual( jasmine.any( Function ) );  // constructor function
		expect( Autolinker.matcher.Mention.name ).toBe( 'MentionMatcher' );  // function name
		expect( Autolinker.matcher.Mention.prototype.parseMatches ).toEqual( jasmine.any( Function ) );

		expect( Autolinker.matcher.Phone ).toEqual( jasmine.any( Function ) );  // constructor function
		expect( Autolinker.matcher.Phone.name ).toBe( 'PhoneMatcher' );  // function name
		expect( Autolinker.matcher.Phone.prototype.parseMatches ).toEqual( jasmine.any( Function ) );

		expect( Autolinker.matcher.Url ).toEqual( jasmine.any( Function ) );  // constructor function
		expect( Autolinker.matcher.Url.name ).toBe( 'UrlMatcher' );  // function name
		expect( Autolinker.matcher.Url.prototype.parseMatches ).toEqual( jasmine.any( Function ) );
	} );

} );
