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
		expect( Autolinker ).toBeDefined();
		expect( Autolinker.link ).toEqual( jasmine.any( Function ) );
	} );


	it( `Autolinker should also be a named export of 'autolinker'`, () => {
		expect( NamedAutolinker ).toBeDefined();
		expect( NamedAutolinker.link ).toEqual( jasmine.any( Function ) );
	} );


	it( `AnchorTagBuilder should be a named export of 'autolinker'`, () => {
		expect( AnchorTagBuilder ).toBeDefined();
		expect( AnchorTagBuilder.prototype.build ).toEqual( jasmine.any( Function ) );
	} );


	it( `AnchorTagBuilder should be a named export of 'autolinker'`, () => {
		expect( HtmlTag ).toBeDefined();
		expect( HtmlTag.prototype.getTagName ).toEqual( jasmine.any( Function ) );
	} );


	it( `The 'Match' classes should be named exports of 'autolinker'`, () => {
		expect( Match ).toBeDefined();
		expect( Match.prototype.getMatchedText ).toEqual( jasmine.any( Function ) );

		expect( EmailMatch ).toBeDefined();
		expect( EmailMatch.prototype.getEmail ).toEqual( jasmine.any( Function ) );

		expect( HashtagMatch ).toBeDefined();
		expect( HashtagMatch.prototype.getHashtag ).toEqual( jasmine.any( Function ) );

		expect( MentionMatch ).toBeDefined();
		expect( MentionMatch.prototype.getMention ).toEqual( jasmine.any( Function ) );

		expect( PhoneMatch ).toBeDefined();
		expect( PhoneMatch.prototype.getNumber ).toEqual( jasmine.any( Function ) );

		expect( UrlMatch ).toBeDefined();
		expect( UrlMatch.prototype.getUrl ).toEqual( jasmine.any( Function ) );
	} );


	it( `The 'Matcher' classes should be named exports of 'autolinker'`, () => {
		expect( Matcher ).toBeDefined();
		// Note: no methods which can be checked here - abstract methods are not compiled into ES5

		expect( EmailMatcher ).toBeDefined();
		expect( EmailMatcher.prototype.parseMatches ).toEqual( jasmine.any( Function ) );

		expect( HashtagMatcher ).toBeDefined();
		expect( HashtagMatcher.prototype.parseMatches ).toEqual( jasmine.any( Function ) );

		expect( MentionMatcher ).toBeDefined();
		expect( MentionMatcher.prototype.parseMatches ).toEqual( jasmine.any( Function ) );

		expect( PhoneMatcher ).toBeDefined();
		expect( PhoneMatcher.prototype.parseMatches ).toEqual( jasmine.any( Function ) );

		expect( UrlMatcher ).toBeDefined();
		expect( UrlMatcher.prototype.parseMatches ).toEqual( jasmine.any( Function ) );
	} );

} );
