import { readHostAndPort, ReadHostAndPortResult } from "../../../src/matcher/reader/read-host-and-port";

describe( 'readHostAndPort()', () => {

	function expectResult( 
		result: ReadHostAndPortResult,
		endIdx: number, 
		lastConfirmedUrlCharIdx: number, 
		tld: string | undefined 
	) {
		if( result.endIdx !== endIdx ) {
			throw new Error( `Expected endIdx ${result.endIdx} to be ${endIdx}` );
		}
		if( result.lastConfirmedUrlCharIdx !== lastConfirmedUrlCharIdx ) {
			throw new Error( `Expected lastConfirmedUrlCharIdx ${result.lastConfirmedUrlCharIdx} to be ${lastConfirmedUrlCharIdx}` );
		}
		if( result.tld !== tld ) {
			throw new Error( `Expected tld '${result.tld}' to be '${tld}'` );
		}
	}

	it( `when provided a hostname, should read it correctly`, () => {
		const result = readHostAndPort( 'localhost', 0 );

		expectResult( result, 8, 8, undefined );
	} );


	it( `when provided a hostname with characters after it, should read it 
		 correctly and provide the correct endIdx which is the last character
		 of the hostname`, 
	() => {
		const result = readHostAndPort( 'localhost and stuff', 0 );

		expectResult( result, 8, 8, undefined );
	} );


	it( `when provided a hostname and port, should read it correctly`, () => {
		const result = readHostAndPort( 'localhost:80', 0 );

		expectResult( result, 11, 11, undefined );
	} );


	it( `when provided simply a word, should interpret that as a host (as it
		 could be localhost or another meaningful hostname`, 
	() => {
		const result = readHostAndPort( 'localhost:80', 0 );

		expectResult( result, 11, 11, undefined );
	} );


	it( `when provided a whitespace or non-domain-label character, should throw`,
	() => {
		expect( () => {
			readHostAndPort( ' stuff', 0 );
		} ).toThrowError( `The input character ' ' was not a valid domain label start character` );

		expect( () => {
			readHostAndPort( '- stuff', 0 );
		} ).toThrowError( `The input character '-' was not a valid domain label start character` );
	} );


	it( `when provided a hostname with multiple domain labels, should read it 
	     correctly and return the TLD`, 
	() => {
		const result1 = readHostAndPort( 'google.com', 0 );
		expectResult( result1, 9, 9, 'com' );

		const result2 = readHostAndPort( 'my.google.com', 0 );
		expectResult( result2, 12, 12, 'com' );
	} );


	it( `when provided a hostname that is in the middle of the string, should
		 read it`, 
	() => {
		const result = readHostAndPort( ' localhost ', 1 );

		expectResult( result, 9, 9, undefined );
	} );


	it( `when provided a hostname that is at the end of the string, should
		 read it`, 
	() => {
		const result = readHostAndPort( ' localhost', 1 );

		expectResult( result, 9, 9, undefined );
	} );


	it( `when provided a hostname with '..' after it, should read it up to the
	     second '.', but not include either '.' as "confirmed url characters"`, 
	() => {
		const result = readHostAndPort( 'google.com..', 0 );

		expectResult( result, 10, 9, 'com' );
	} );

} );