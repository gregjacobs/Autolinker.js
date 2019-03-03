import { readAuthority, ReadAuthorityResult } from "../../../src/matcher/reader/read-authority";

describe( 'readAuthority()', () => {

	function expectResult( 
		result: ReadAuthorityResult,
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

	it( `when provided simply a hostname like 'localhost', should read it correctly`, () => {
		const result = readAuthority( 'localhost and such', 0 );

		expectResult( result, 8, 8 );
	} );


	it( `when provided a hostname that is a domain name should read it correctly`, () => {
		const result = readAuthority( 'google.com and such', 0 );

		expectResult( result, 9, 9 );
	} );


	it( `when provided a hostname and a port, should read it correctly`, () => {
		const result = readAuthority( 'localhost:8080 and such', 0 );

		expectResult( result, 13, 13 );
	} );


	it( `when provided a username and host, should read it correctly`, () => {
		const result = readAuthority( 'stuff@localhost and such', 0 );

		expectResult( result, 14, 14 );
	} );


	it( `when provided a username, host, and port, should read it correctly`, () => {
		const result = readAuthority( 'stuff@localhost:8080 and such', 0 );

		expectResult( result, 19, 19 );
	} );


	it( `when provided a username and password before the host, should read it 
		 correctly`, 
	() => {
		const result = readAuthority( 'user:password@localhost and such', 0 );

		expectResult( result, 22, 22 );
	} );


	it( `when provided a path, should read it up to the slash`, () => {
		const result = readAuthority( 'user:password@localhost/abc-def', 0 );

		expectResult( result, 22, 22 );
	} );


	it( `when provided a query, should read it up to the '?' char`, () => {
		const result = readAuthority( 'user:password@localhost?abc=1&def=2', 0 );

		expectResult( result, 22, 22 );
	} );


	it( `when provided a hash, should read it up to the '#' char`, () => {
		const result = readAuthority( 'user:password@localhost#stuff', 0 );

		expectResult( result, 22, 22 );
	} );


	it( `when provided an authority that starts with an invalid authority 
	     character, should throw an error`,
	() => {
		expect( () => {
			readAuthority( ' stuff', 0 );
		} ).toThrowError( `The input character ' ' was not a valid URI authority start character` );

		expect( () => {
			readAuthority( '/ stuff', 0 );
		} ).toThrowError( `The input character '/' was not a valid URI authority start character` );

		expect( () => {
			readAuthority( '?stuff', 0 );
		} ).toThrowError( `The input character '?' was not a valid URI authority start character` );

		expect( () => {
			readAuthority( '#stuff', 0 );
		} ).toThrowError( `The input character '#' was not a valid URI authority start character` );
	} );


	it( `when provided hostname in the middle of the string, should read it`, 
	() => {
		const result = readAuthority( ' a.com ', 1 );

		expectResult( result, 5, 5 );
	} );


	it( `when provided a hostname that is at the end of the string, should
		 read it`, 
	() => {
		const result = readAuthority( ' a.com', 1 );

		expectResult( result, 5, 5 );
	} );

} );