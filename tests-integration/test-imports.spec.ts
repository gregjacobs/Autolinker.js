// This file simply makes sure that we can import Autolinker entities using the
// 'autolinker' package installed into node_modules
// To run this test, run: 
//     yarn test
// This will install the package locally in ./.tmp/, and build this file.

import Autolinker, { 
	Autolinker as NamedAutolinker,
	AnchorTagBuilder,
	HtmlTag,
	
	Match,
	EmailMatch,
	HashtagMatch,
	MentionMatch,
	PhoneMatch,
	UrlMatch,
	
	Matcher,
	EmailMatcher,
	HashtagMatcher,
	MentionMatcher,
	PhoneMatcher,
	UrlMatcher
} from 'autolinker';

describe( 'Autolinker imports tests - ', () => {

	it( `Autolinker should be the default export of 'autolinker'`, () => {
		expect( Autolinker ).toEqual( jasmine.any( Function ) );  // constructor function
		expect( Autolinker.link ).toEqual( jasmine.any( Function ) );

		expect( Autolinker.link( 'Hello google.com', { newWindow: false } ) )
			.toBe( 'Hello <a href="http://google.com">google.com</a>' );
	} );


	it( `Autolinker should also be a named export of 'autolinker'`, () => {
		expect( NamedAutolinker ).toEqual( jasmine.any( Function ) );  // constructor function
		expect( NamedAutolinker.link ).toEqual( jasmine.any( Function ) );
	} );


	it( `AnchorTagBuilder should be a named export of 'autolinker'`, () => {
		expect( AnchorTagBuilder ).toEqual( jasmine.any( Function ) );  // constructor function
		expect( AnchorTagBuilder.prototype.build ).toEqual( jasmine.any( Function ) );
	} );


	it( `AnchorTagBuilder should be a named export of 'autolinker'`, () => {
		expect( HtmlTag ).toEqual( jasmine.any( Function ) );  // constructor function
		expect( HtmlTag.prototype.getTagName ).toEqual( jasmine.any( Function ) );
	} );


	it( `The 'Match' classes should be named exports of 'autolinker'`, () => {
		expect( Match ).toEqual( jasmine.any( Function ) );  // constructor function
		expect( Match.name ).toBe( 'Match' );  // function name
		expect( Match.prototype.getMatchedText ).toEqual( jasmine.any( Function ) );

		expect( EmailMatch ).toEqual( jasmine.any( Function ) );  // constructor function
		expect( EmailMatch.name ).toBe( 'EmailMatch' );  // function name
		expect( EmailMatch.prototype.getEmail ).toEqual( jasmine.any( Function ) );

		expect( HashtagMatch ).toEqual( jasmine.any( Function ) );  // constructor function
		expect( HashtagMatch.name ).toBe( 'HashtagMatch' );  // function name
		expect( HashtagMatch.prototype.getHashtag ).toEqual( jasmine.any( Function ) );

		expect( MentionMatch ).toEqual( jasmine.any( Function ) );  // constructor function
		expect( MentionMatch.name ).toBe( 'MentionMatch' );  // function name
		expect( MentionMatch.prototype.getMention ).toEqual( jasmine.any( Function ) );

		expect( PhoneMatch ).toEqual( jasmine.any( Function ) );  // constructor function
		expect( PhoneMatch.name ).toBe( 'PhoneMatch' );  // function name
		expect( PhoneMatch.prototype.getNumber ).toEqual( jasmine.any( Function ) );

		expect( UrlMatch ).toEqual( jasmine.any( Function ) );  // constructor function
		expect( UrlMatch.name ).toBe( 'UrlMatch' );  // function name
		expect( UrlMatch.prototype.getUrl ).toEqual( jasmine.any( Function ) );
	} );


	it( `The 'Matcher' classes should be named exports of 'autolinker'`, () => {
		expect( Matcher ).toEqual( jasmine.any( Function ) );  // constructor function
		expect( Matcher.name ).toBe( 'Matcher' );  // function name
		// Note: no methods which can be checked here - abstract methods are not compiled into ES5

		expect( EmailMatcher ).toEqual( jasmine.any( Function ) );  // constructor function
		expect( EmailMatcher.name ).toBe( 'EmailMatcher' );  // function name
		expect( EmailMatcher.prototype.parseMatches ).toEqual( jasmine.any( Function ) );

		expect( HashtagMatcher ).toEqual( jasmine.any( Function ) );  // constructor function
		expect( HashtagMatcher.name ).toBe( 'HashtagMatcher' );  // function name
		expect( HashtagMatcher.prototype.parseMatches ).toEqual( jasmine.any( Function ) );

		expect( MentionMatcher ).toEqual( jasmine.any( Function ) );  // constructor function
		expect( MentionMatcher.name ).toBe( 'MentionMatcher' );  // function name
		expect( MentionMatcher.prototype.parseMatches ).toEqual( jasmine.any( Function ) );

		expect( PhoneMatcher ).toEqual( jasmine.any( Function ) );  // constructor function
		expect( PhoneMatcher.name ).toBe( 'PhoneMatcher' );  // function name
		expect( PhoneMatcher.prototype.parseMatches ).toEqual( jasmine.any( Function ) );

		expect( UrlMatcher ).toEqual( jasmine.any( Function ) );  // constructor function
		expect( UrlMatcher.name ).toBe( 'UrlMatcher' );  // function name
		expect( UrlMatcher.prototype.parseMatches ).toEqual( jasmine.any( Function ) );
	} );

} );
