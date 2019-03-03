import { readUrlSuffix, ReadUrlSuffixResult } from "../../../src/matcher/reader/read-url-suffix";

describe( 'readUrlSuffix()', () => {

	function expectResult( 
		result: ReadUrlSuffixResult,
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

	it( `when provided a path, should read it correctly`, () => {
		const result = readUrlSuffix( '/abc-def', 0 );

		expectResult( result, 7, 7 );
	} );


	it( `when provided a query, should read it correctly`, () => {
		const result = readUrlSuffix( '?a=1&b=2', 0 );

		expectResult( result, 7, 7 );
	} );


	it( `when provided a hash, should read it correctly`, () => {
		const result = readUrlSuffix( '#stuff', 0 );

		expectResult( result, 5, 5 );
	} );


	it( `when provided a path and query, should read it correctly`, () => {
		const result = readUrlSuffix( '/abc-def/?stuff=2', 0 );

		expectResult( result, 16, 16 );
	} );


	it( `when provided a path and hash, should read it correctly`, () => {
		const result = readUrlSuffix( '/abc-def#stuff', 0 );

		expectResult( result, 13, 13 );
	} );


	it( `when provided a query and hash, should read it correctly`, () => {
		const result = readUrlSuffix( '?abc=1&def=2#stuff', 0 );

		expectResult( result, 17, 17 );
	} );


	it( `when provided a path, query, and hash, should read it correctly`, () => {
		const result = readUrlSuffix( '/abc-def?abc=1&def=2#stuff', 0 );

		expectResult( result, 25, 25 );
	} );


	it( `when provided a path with characters after it, should parse it 
		 correctly and provide the correct endIdx which the last character of
		 the path`, 
	() => {
		const result = readUrlSuffix( 'a.com/stuff and stuff', 5 );

		expectResult( result, 10, 10 );
	} );


	it( `when provided a URL suffix that doesn't start with '/', '?', or '#',
		 should throw an error`,
	() => {
		expect( () => {
			readUrlSuffix( ' stuff', 0 );
		} ).toThrowError( `The input character ' ' was not a valid URL suffix start character` );

		expect( () => {
			readUrlSuffix( '- stuff', 0 );
		} ).toThrowError( `The input character '-' was not a valid URL suffix start character` );

		expect( () => {
			readUrlSuffix( 'astuff', 0 );
		} ).toThrowError( `The input character 'a' was not a valid URL suffix start character` );
	} );


	it( `when provided a path that is in the middle of the string, should
		 read it`, 
	() => {
		const result = readUrlSuffix( ' /path ', 1 );

		expectResult( result, 5, 5 );
	} );


	it( `when provided a hostname that is at the end of the string, should
		 read it`, 
	() => {
		const result = readUrlSuffix( ' /path', 1 );

		expectResult( result, 5, 5 );
	} );


	it( `when provided a path with '..' after it, should read it up to the
	     second '.', but not include either '.' as "confirmed url characters"`, 
	() => {
		const result = readUrlSuffix( '/my-path..stuff..', 0 );

		expectResult( result, 16, 14 );
	} );

} );