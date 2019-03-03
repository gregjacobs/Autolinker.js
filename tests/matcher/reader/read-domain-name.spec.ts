import { readDomainName, ReadDomainNameResult } from "../../../src/matcher/reader/read-domain-name";

describe( 'readDomainName()', () => {

	function expectResult( 
		result: ReadDomainNameResult,
		expected: {
			endIdx: number, 
			lastConfirmedUrlCharIdx: number,
			domainNameLength: number,
			longestDomainLabelLength: number,
			tld: string | undefined 
		}
	) {
		if( result.endIdx !== expected.endIdx ) {
			throw new Error( `Expected endIdx ${result.endIdx} to be ${expected.endIdx}` );
		}
		if( result.lastConfirmedUrlCharIdx !== expected.lastConfirmedUrlCharIdx ) {
			throw new Error( `Expected lastConfirmedUrlCharIdx ${result.lastConfirmedUrlCharIdx} to be ${expected.lastConfirmedUrlCharIdx}` );
		}
		if( result.domainNameLength !== expected.domainNameLength ) {
			throw new Error( `Expected domainNameLength '${result.domainNameLength}' to be '${expected.domainNameLength}'` );
		}
		if( result.longestDomainLabelLength !== expected.longestDomainLabelLength ) {
			throw new Error( `Expected longestDomainLabelLength '${result.longestDomainLabelLength}' to be '${expected.longestDomainLabelLength}'` );
		}
		if( result.tld !== expected.tld ) {
			throw new Error( `Expected tld '${result.tld}' to be '${expected.tld}'` );
		}
	}


	it( `when provided a whitespace or non-domain-label character as the first
	     character, should throw`,
	() => {
		expect( () => {
			readDomainName( ' stuff', 0 );
		} ).toThrowError( `The input character ' ' was not a valid domain label start character` );

		expect( () => {
			readDomainName( '- stuff', 0 );
		} ).toThrowError( `The input character '-' was not a valid domain label start character` );
	} );


	it( `when provided just a hostname, should read it correctly`, () => {
		const result = readDomainName( 'localhost', 0 );

		expectResult( result, {
			endIdx: 8, 
			lastConfirmedUrlCharIdx: 8,
			domainNameLength: 9, 
			longestDomainLabelLength: 9,
			tld: undefined 
		} );
	} );


	it( `when provided just a hostname with characters after it, should read it 
		 correctly and provide the correct endIdx which is the last character
		 of the hostname`, 
	() => {
		const result = readDomainName( 'localhost and stuff', 0 );

		expectResult( result, {
			endIdx: 8, 
			lastConfirmedUrlCharIdx: 8,
			domainNameLength: 9, 
			longestDomainLabelLength: 9,
			tld: undefined 
		} );
	} );


	it( `when provided a domain name with characters after it, should read it 
		 correctly and provide the correct endIdx which is the last character
		 of the domain name`, 
	() => {
		const result = readDomainName( 'google.com and stuff', 0 );

		expectResult( result, {
			endIdx: 9, 
			lastConfirmedUrlCharIdx: 9,
			domainNameLength: 10, 
			longestDomainLabelLength: 6,
			tld: 'com'
		} );
	} );


	it( `when provided a hostname and port, should read it up to the ':' 
		 character`, 
	() => {
		const result = readDomainName( 'localhost:80', 0 );

		expectResult( result, {
			endIdx: 8, 
			lastConfirmedUrlCharIdx: 8,
			domainNameLength: 9, 
			longestDomainLabelLength: 9,
			tld: undefined 
		} );
	} );


	it( `when provided a domain name and port, should read it up to the ':' 
		 character`, 
	() => {
		const result = readDomainName( 'google.com:80', 0 );

		expectResult( result, {
			endIdx: 9, 
			lastConfirmedUrlCharIdx: 9,
			domainNameLength: 10, 
			longestDomainLabelLength: 6,
			tld: 'com'
		} );
	} );


	it( `when provided a domain name with multiple domain labels, should read it 
	     correctly and return the TLD`, 
	() => {
		const result1 = readDomainName( 'google.com', 0 );
		expectResult( result1, {
			endIdx: 9, 
			lastConfirmedUrlCharIdx: 9,
			domainNameLength: 10, 
			longestDomainLabelLength: 6,
			tld: 'com'
		} );

		const result2 = readDomainName( 'my.google.com', 0 );
		expectResult( result2, {
			endIdx: 12, 
			lastConfirmedUrlCharIdx: 12,
			domainNameLength: 13, 
			longestDomainLabelLength: 6,
			tld: 'com' 
		} );
	} );


	it( `when provided a domain name that is in the beginning of the string, 
	     should read it`, 
	() => {
		const result = readDomainName( 'google.com and stuff', 0 );

		expectResult( result, {
			endIdx: 9, 
			lastConfirmedUrlCharIdx: 9,
			domainNameLength: 10, 
			longestDomainLabelLength: 6,
			tld: 'com'
		} );
	} );


	it( `when provided a domain name that is in the middle of the string, should
		 read it`, 
	() => {
		const result = readDomainName( ' google.com ', 1 );

		expectResult( result, {
			endIdx: 10, 
			lastConfirmedUrlCharIdx: 10,
			domainNameLength: 10, 
			longestDomainLabelLength: 6,
			tld: 'com'
		} );
	} );


	it( `when provided a domain name that is at the end of the string, should
		 read it`, 
	() => {
		const result = readDomainName( ' google.com', 1 );

		expectResult( result, {
			endIdx: 10,
			lastConfirmedUrlCharIdx: 10,
			domainNameLength: 10, 
			longestDomainLabelLength: 6,
			tld: 'com'
		} );
	} );


	it( `when provided a domain name with '..' after it, should read it up to the
	     second '.', but not include either '.' as "confirmed url characters"`, 
	() => {
		const result = readDomainName( 'google.com..', 0 );

		expectResult( result, {
			endIdx: 10, 
			lastConfirmedUrlCharIdx: 9,
			domainNameLength: 'google.com'.length, 
			longestDomainLabelLength: 'google'.length,
			tld: 'com'
		} );
	} );


	it( `when provided a subdomain label that is long, the length of this should 
	     be the reported name longestDomainLabelLength`, 
	() => {
		const result = readDomainName( 'some-long-subdomain.google.com', 0 );

		expectResult( result, {
			endIdx: 29, 
			lastConfirmedUrlCharIdx: 29,
			domainNameLength: 'some-long-subdomain.google.com'.length, 
			longestDomainLabelLength: 'some-long-subdomain'.length,
			tld: 'com'
		} );
	} );


	it( `when the TLD is the longest domain label, the length of this should 
	     be the reported name longestDomainLabelLength`, 
	() => {
		const result = readDomainName( 'a.b.com', 0 );

		expectResult( result, {
			endIdx: 6, 
			lastConfirmedUrlCharIdx: 6,
			domainNameLength: 'a.b.com'.length, 
			longestDomainLabelLength: 'com'.length,
			tld: 'com'
		} );
	} );

} );