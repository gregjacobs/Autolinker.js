import { readPort, ReadPortResult } from "../../../src/matcher/reader/read-port";

describe( 'readPort()', () => {

	function expectResult( 
		result: ReadPortResult,
		endIdx: number, 
		lastConfirmedUrlCharIdx: number
	) {
		if( result.endIdx !== endIdx ) {
			throw new Error( `Expected endIdx ${result.endIdx} to be ${endIdx}` );
		}
		if( result.lastConfirmedUrlCharIdx !== lastConfirmedUrlCharIdx ) {
			throw new Error( `Expected lastConfirmedUrlCharIdx ${result.lastConfirmedUrlCharIdx} to be ${lastConfirmedUrlCharIdx}` );
		}
	}


	it( `when provided an initial character that doesn't start with ':', should
		 throw an error`,
	() => {
		expect( () => {
			readPort( ' stuff', 0 );
		} ).toThrowError( `The input character ' ' was not a valid port segment start character. Was expecting ':'` );

		expect( () => {
			readPort( '- stuff', 0 );
		} ).toThrowError( `The input character '-' was not a valid port segment start character. Was expecting ':'` );

		expect( () => {
			readPort( 'astuff', 0 );
		} ).toThrowError( `The input character 'a' was not a valid port segment start character. Was expecting ':'` );
	} );


	it( `when provided a short port, should read it correctly`, () => {
		const result = readPort( ':80', 0 );

		expectResult( result, 2, 2 );
	} );
	

	it( `when provided a long port, should read it correctly`, () => {
		const result = readPort( ':8080', 0 );

		expectResult( result, 4, 4 );
	} );

	
	it( `when provided just a colon character, should read it correctly`, () => {
		const result = readPort( ': stuff', 0 );

		expectResult( result, 0, -1 );  // -1 for last confirmed character, which would have been the last domain name or host character
	} );

	
	it( `when provided a colon character at the end of a domain name, should read it correctly`, () => {
		const result = readPort( 'google.com: good stuff', 10 );

		expectResult( result, 10, 9 );
	} );


	it( `when provided a port with a path after it, should read it up until the
		 '/' character`, 
	() => {
		const result = readPort( ':8080/abc', 0 );

		expectResult( result, 4, 4 );
	} );

	
	it( `when provided a port with a query after it, should read it up until the
		 '?' character`, 
	() => {
		const result = readPort( ':8080?abc=1', 0 );

		expectResult( result, 4, 4 );
	} );

	
	it( `when provided a port with a hash after it, should read it up until the
		 '#' character`, 
	() => {
		const result = readPort( ':8080#abc', 0 );

		expectResult( result, 4, 4 );
	} );


	it( `when provided a port that at the beginning of the string, should
		 read it`, 
	() => {
		const result = readPort( ':8080 and stuff', 0 );

		expectResult( result, 4, 4 );
	} );


	it( `when provided a port that is in the middle of the string, should
		 read it`, 
	() => {
		const result = readPort( ' :8080 ', 1 );

		expectResult( result, 5, 5 );
	} );


	it( `when provided a port that is at the end of the string, should
		 read it`, 
	() => {
		const result = readPort( ' :8080', 1 );

		expectResult( result, 5, 5 );
	} );

} );