import { PhoneMatcher } from "../../src/matcher/phone-matcher";
import { AnchorTagBuilder } from "../../src/anchor-tag-builder";
import { MatchChecker } from "../match/match-checker";
import { PhoneMatch } from "../../src";

describe( "Autolinker.matcher.Phone", function() {
	let matcher: PhoneMatcher;

	beforeEach( function() {
		matcher = new PhoneMatcher( {
			tagBuilder : new AnchorTagBuilder()
		} );
	} );


	describe( 'parseMatches()', function() {

		it( 'should return an empty array if there are no matches for phone numbers', function() {
			expect( matcher.parseMatches( '' ) ).toEqual( [] );
			expect( matcher.parseMatches( 'asdf' ) ).toEqual( [] );
			expect( matcher.parseMatches( '123' ) ).toEqual( [] );
		} );


		it( 'should return an array of a single phone number match when the string is the phone number itself', function() {
			let matches = matcher.parseMatches( '(123) 456-7890' );

			expect( matches.length ).toBe( 1 );
			MatchChecker.expectPhoneMatch( matches[ 0 ], '1234567890', 0 );
		} );


		it( 'should return an array of a single phone number match when the phone number is in the middle of the string', function() {
			let matches = matcher.parseMatches( 'Hello (123) 456-7890 my good friend' );

			expect( matches.length ).toBe( 1 );
			MatchChecker.expectPhoneMatch( matches[ 0 ], '1234567890', 6 );
		} );


		it( 'should return an array of a single phone number match when the phone number is at the end of the string', function() {
			let matches = matcher.parseMatches( 'Hello (123) 456-7890' );

			expect( matches.length ).toBe( 1 );
			MatchChecker.expectPhoneMatch( matches[ 0 ], '1234567890', 6 );
		} );


		it( 'should return an array of multiple phone numbers when there are more than one within the string', function() {
			let matches = matcher.parseMatches( 'Talk to (123) 456-7890 or (234) 567-8901' );

			expect( matches.length ).toBe( 2 );
			MatchChecker.expectPhoneMatch( matches[ 0 ], '1234567890', 8 );
			MatchChecker.expectPhoneMatch( matches[ 1 ], '2345678901', 26 );
		} );


		it( 'a match within parenthesis should be parsed correctly', function() {
			let matches = matcher.parseMatches( 'Hello ((123) 456-7890)' );

			expect( matches.length ).toBe( 1 );
			MatchChecker.expectPhoneMatch( matches[ 0 ], '1234567890', 7 );
		} );

		it( 'should return an array of single phone numbers match when the phone number is japanese phone number', function() {
			let matches = matcher.parseMatches( ' Hello 03-1123-4562 ' );

			expect( matches.length ).toBe( 1 );
			MatchChecker.expectPhoneMatch( matches[ 0 ], '0311234562', 7 );
		} );

	} );


	describe( 'getPhoneNumber()', function() {

		it( `should should return the matched phone number without any
			 formatting`,
		() => {
			let matches = matcher.parseMatches( 'Talk to (123) 456-7890' );

			expect( matches.length ).toBe( 1 );
			expect( matches[ 0 ] ).toEqual( jasmine.any( PhoneMatch ) );
			expect( ( matches[ 0 ] as PhoneMatch ).getPhoneNumber() ).toBe( '1234567890' );
		} );

	} );


	describe( 'getNumber()', function() {

		it( `as an alias of getPhoneNumber(), should return the matched phone
			 number, without any formatting`,
		() => {
			let matches = matcher.parseMatches( 'Talk to (123) 456-7890' );

			expect( matches.length ).toBe( 1 );
			expect( matches[ 0 ] ).toEqual( jasmine.any( PhoneMatch ) );
			expect( ( matches[ 0 ] as PhoneMatch ).getNumber() ).toBe( '1234567890' );
		} );

	} );

} );
