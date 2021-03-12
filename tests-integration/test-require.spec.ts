// This file simply makes sure that we can require() Autolinker entities using 
// the 'autolinker' package installed into node_modules
// To run this test, run: 
//     yarn test
// This will install the package locally in ./.tmp/, and build this file.

const Autolinker = require( 'autolinker' );
const NamedAutolinker = require( 'autolinker' ).Autolinker;


describe( 'Autolinker require() tests - ', () => {


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

} );
