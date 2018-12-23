// This file simply makes sure that we can require() Autolinker entities using 
// the 'autolinker' package installed into node_modules
// To run this test, run: 
//     yarn test
// This will install the package locally in ./.tmp/, and build this file.

const Autolinker = require( 'autolinker' );
const NamedAutolinker = require( 'autolinker' ).Autolinker;
const AnchorTagBuilder = require( 'autolinker' ).AnchorTagBuilder;
const HtmlTag = require( 'autolinker' ).HtmlTag;
const Match = require( 'autolinker' ).Match;
const EmailMatch = require( 'autolinker' ).EmailMatch;
const HashtagMatch = require( 'autolinker' ).HashtagMatch;
const MentionMatch = require( 'autolinker' ).MentionMatch;
const PhoneMatch = require( 'autolinker' ).PhoneMatch;
const UrlMatch = require( 'autolinker' ).UrlMatch;
const Matcher = require( 'autolinker' ).Matcher;
const EmailMatcher = require( 'autolinker' ).EmailMatcher;
const HashtagMatcher = require( 'autolinker' ).HashtagMatcher;
const MentionMatcher = require( 'autolinker' ).MentionMatcher;
const PhoneMatcher = require( 'autolinker' ).PhoneMatcher;
const UrlMatcher = require( 'autolinker' ).UrlMatcher;

describe( 'Autolinker require() tests - ', () => {

	it( `Autolinker should be the default export of 'autolinker'`, () => {
		expect( Autolinker ).toBeDefined();
		console.log( Autolinker );
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
